from datetime import date, datetime

from pydantic import BaseModel, EmailStr, Field


class UserResponse(BaseModel):
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


class UserUpdateRequest(BaseModel):
    user_name: str | None = Field(default=None, min_length=1, max_length=100)
    user_surname: str | None = Field(default=None, min_length=1, max_length=100)
    phone_number: str | None = None
    date_of_birth: date | None = None
    telegram_id: str | None = None
    sigma_sms_token: str | None = None
