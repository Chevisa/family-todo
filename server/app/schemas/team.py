from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.models.enums import TeamRole
from app.schemas.user import UserResponse


class TeamCreateRequest(BaseModel):
    team_name: str = Field(min_length=1, max_length=150)
    team_type: str = Field(min_length=1, max_length=50)


class TeamResponse(BaseModel):
    id: int
    team_name: str
    team_type: str
    num_of_users: int
    create_date: datetime

    model_config = {"from_attributes": True}


class TeamMemberResponse(BaseModel):
    user: UserResponse
    role_in_team: TeamRole


class TeamDetailsResponse(BaseModel):
    id: int
    team_name: str
    team_type: str
    num_of_users: int
    create_date: datetime
    members: list[TeamMemberResponse]


class AddMemberRequest(BaseModel):
    email: EmailStr
    role_in_team: TeamRole = TeamRole.member


class UpdateMemberRoleRequest(BaseModel):
    role_in_team: TeamRole
