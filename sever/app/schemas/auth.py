from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field


class RegisterRequest(BaseModel):
    user_name: str = Field(min_length=1, max_length=100)
    user_surname: str = Field(min_length=1, max_length=100)
    email: EmailStr
    password: str = Field(min_length=8, max_length=72)
    phone_number: str | None = None
    date_of_birth: date | None = None
    telegram_id: str | None = None
    sigma_sms_token: str | None = None


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class RefreshRequest(BaseModel):
    refresh_token: str


class LogoutRequest(BaseModel):
    refresh_token: str


class AuthUser(BaseModel):
    id: int
    user_name: str
    user_surname: str
    email: EmailStr
    phone_number: str | None = None
    date_of_birth: date | None = None
    telegram_id: str | None = None
    sigma_sms_token: str | None = None
    created_at: datetime

    model_config = {"from_attributes": True}


class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user: AuthUser
