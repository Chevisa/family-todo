from datetime import datetime

from pydantic import BaseModel, Field

from app.models.enums import TaskPriority, TaskStatus


class TaskCreateRequest(BaseModel):
    name: str = Field(min_length=1, max_length=150)
    user_id: int
    team_id: int
    deadline: datetime
    description: str | None = None
    priority: TaskPriority = TaskPriority.no


class TaskUpdateRequest(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=150)
    user_id: int | None = None
    deadline: datetime | None = None
    description: str | None = None
    priority: TaskPriority | None = None
    admin_comment: str | None = None


class TaskResponse(BaseModel):
    id: int
    name: str
    create_date: datetime
    user_id: int
    team_id: int
    status: TaskStatus
    deadline: datetime
    description: str | None = None
    priority: TaskPriority
    admin_comment: str | None = None
    updated_at: datetime

    model_config = {"from_attributes": True}


class ChangeTaskStatusRequest(BaseModel):
    status: TaskStatus
    admin_comment: str | None = None
