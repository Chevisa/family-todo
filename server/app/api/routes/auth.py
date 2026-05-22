from datetime import datetime, timedelta, timezone

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, validate_refresh_session
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    generate_refresh_token,
    hash_password,
    hash_refresh_token,
    verify_password,
)
from app.models.refresh_session import RefreshSession
from app.models.user import User
from app.schemas.auth import (
    AuthUser,
    LoginRequest,
    LogoutRequest,
    RefreshRequest,
    RegisterRequest,
    TokenResponse,
)

router = APIRouter()


def build_token_response(db: Session, user: User) -> TokenResponse:
    access_token = create_access_token(user.id, user.email)
    refresh_token = generate_refresh_token()
    token_hash = hash_refresh_token(refresh_token)

    refresh_session = RefreshSession(
        user_id=user.id,
        token_hash=token_hash,
        expires_at=datetime.now(timezone.utc) + timedelta(days=settings.refresh_token_expire_days),
    )
    db.add(refresh_session)
    db.commit()
    db.refresh(user)

    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user=AuthUser.model_validate(user),
    )


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
def register(payload: RegisterRequest, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == payload.email).first()
    if existing_user:
        raise HTTPException(status_code=400, detail="Пользователь с таким email уже существует")

    user = User(
        user_name=payload.user_name,
        user_surname=payload.user_surname,
        email=payload.email,
        password_hash=hash_password(payload.password),
        phone_number=payload.phone_number,
        date_of_birth=payload.date_of_birth,
        telegram_id=payload.telegram_id,
        sigma_sms_token=payload.sigma_sms_token,
    )
    db.add(user)
    db.commit()
    db.refresh(user)
    return build_token_response(db, user)


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.email == payload.email).first()
    if not user or not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Неверный email или пароль")
    return build_token_response(db, user)


@router.post("/refresh", response_model=TokenResponse)
def refresh(payload: RefreshRequest, db: Session = Depends(get_db)):
    refresh_token_hash = hash_refresh_token(payload.refresh_token)
    session = validate_refresh_session(db, refresh_token_hash)
    user = db.get(User, session.user_id)
    if not user:
        raise HTTPException(status_code=401, detail="Пользователь не найден")

    session.revoked_at = datetime.now(timezone.utc)
    db.add(session)
    db.commit()
    return build_token_response(db, user)


@router.post("/logout")
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    refresh_token_hash = hash_refresh_token(payload.refresh_token)
    session = db.query(RefreshSession).filter(RefreshSession.token_hash == refresh_token_hash).first()
    if session and session.revoked_at is None:
        session.revoked_at = datetime.now(timezone.utc)
        db.add(session)
        db.commit()
    return {"message": "Выход выполнен"}


@router.get("/me", response_model=AuthUser)
def me(current_user: User = Depends(get_current_user)):
    return current_user
