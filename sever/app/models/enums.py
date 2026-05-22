from enum import Enum


class TeamRole(str, Enum):
    admin = "admin"
    member = "member"


class TaskStatus(str, Enum):
    planned = "planned"
    in_progress = "in_progress"
    on_review = "on_review"
    completed = "completed"


class TaskPriority(str, Enum):
    yes = "yes"
    no = "not"
