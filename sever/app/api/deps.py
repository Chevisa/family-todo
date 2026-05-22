from datetime import datetime, timezone

from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jwt import PyJWTError
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import decode_access_token
from app.models.refresh_session import RefreshSession
from app.models.team import Team
from app.models.user import User
from app.models.user_team import UserTeam
from app.models.enums import TeamRole


bearer_scheme = HTTPBearer(
    scheme_name="BearerAuth",
    bearerFormat="JWT",
    description="Введите JWT access_token. Если Swagger не подставляет Bearer автоматически, вставьте: Bearer <token>.",
)


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(bearer_scheme),
    db: Session = Depends(get_db),
) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Не удалось проверить токен",
        headers={"WWW-Authenticate": "Bearer"},
    )

    token = credentials.credentials

    try:
        payload = decode_access_token(token)
        if payload.get("type") != "access":
            raise credentials_exception
        user_id = int(payload.get("sub"))
    except (PyJWTError, TypeError, ValueError):
        raise credentials_exception from None

    user = db.get(User, user_id)
    if not user:
        raise credentials_exception
    return user


def get_team_membership(db: Session, team_id: int, user_id: int) -> UserTeam | None:
    return db.query(UserTeam).filter(UserTeam.team_id == team_id, UserTeam.user_id == user_id).first()


def require_team_member(team_id: int, current_user: User, db: Session) -> UserTeam:
    membership = get_team_membership(db, team_id, current_user.id)
    if not membership:
        raise HTTPException(status_code=403, detail="Нет доступа к этой семье")
    return membership


def require_team_admin(team_id: int, current_user: User, db: Session) -> UserTeam:
    membership = require_team_member(team_id, current_user, db)
    if membership.role_in_team != TeamRole.admin:
        raise HTTPException(status_code=403, detail="Требуются права администратора")
    return membership


def validate_refresh_session(db: Session, refresh_token_hash: str) -> RefreshSession:
    session = db.query(RefreshSession).filter(RefreshSession.token_hash == refresh_token_hash).first()
    if not session:
        raise HTTPException(status_code=401, detail="Refresh token не найден")
    if session.revoked_at is not None:
        raise HTTPException(status_code=401, detail="Refresh token отозван")
    if session.expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=401, detail="Refresh token истек")
    return session
