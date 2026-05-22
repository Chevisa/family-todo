from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_team_admin, require_team_member
from app.core.database import get_db
from app.models.enums import TaskStatus, TeamRole
from app.models.task import Task
from app.models.user import User
from app.models.user_team import UserTeam
from app.schemas.task import (
    ChangeTaskStatusRequest,
    TaskCreateRequest,
    TaskResponse,
    TaskUpdateRequest,
)
from app.services.notifications import NotificationService

router = APIRouter()


@router.post("", response_model=TaskResponse, status_code=status.HTTP_201_CREATED)
def create_task(
    payload: TaskCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_team_admin(payload.team_id, current_user, db)

    assignee_membership = (
        db.query(UserTeam)
        .filter(UserTeam.team_id == payload.team_id, UserTeam.user_id == payload.user_id)
        .first()
    )
    if not assignee_membership:
        raise HTTPException(status_code=400, detail="Исполнитель не состоит в выбранной семье")

    task = Task(
        name=payload.name,
        user_id=payload.user_id,
        team_id=payload.team_id,
        deadline=payload.deadline,
        description=payload.description,
        priority=payload.priority,
        status=TaskStatus.planned,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.get("", response_model=list[TaskResponse])
def list_tasks(
    team_id: int = Query(...),
    status_filter: TaskStatus | None = Query(default=None, alias="status"),
    only_my: bool = Query(default=False),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_team_member(team_id, current_user, db)
    query = db.query(Task).filter(Task.team_id == team_id)
    if status_filter is not None:
        query = query.filter(Task.status == status_filter)
    if only_my:
        query = query.filter(Task.user_id == current_user.id)
    return query.order_by(Task.deadline.asc()).all()


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    require_team_member(task.team_id, current_user, db)
    return task


@router.patch("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    require_team_admin(task.team_id, current_user, db)

    data = payload.model_dump(exclude_unset=True)
    if "user_id" in data:
        assignee_membership = (
            db.query(UserTeam)
            .filter(UserTeam.team_id == task.team_id, UserTeam.user_id == data["user_id"])
            .first()
        )
        if not assignee_membership:
            raise HTTPException(status_code=400, detail="Новый исполнитель не состоит в этой семье")

    for field, value in data.items():
        setattr(task, field, value)

    db.add(task)
    db.commit()
    db.refresh(task)
    return task


@router.delete("/{task_id}")
def delete_task(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    require_team_admin(task.team_id, current_user, db)
    db.delete(task)
    db.commit()
    return {"message": "Задача удалена"}


@router.post("/{task_id}/submit-for-review", response_model=TaskResponse)
def submit_task_for_review(task_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")

    membership = require_team_member(task.team_id, current_user, db)
    if membership.role_in_team != TeamRole.admin and task.user_id != current_user.id:
        raise HTTPException(status_code=403, detail="Можно отправить на проверку только свою задачу")

    task.status = TaskStatus.on_review
    db.add(task)
    db.commit()
    db.refresh(task)

    NotificationService.notify_review_requested(
        db=db,
        team_id=task.team_id,
        task_name=task.name,
        requested_by=f"{current_user.user_name} {current_user.user_surname}",
    )
    return task


@router.post("/{task_id}/change-status", response_model=TaskResponse)
def change_task_status(
    task_id: int,
    payload: ChangeTaskStatusRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    task = db.get(Task, task_id)
    if not task:
        raise HTTPException(status_code=404, detail="Задача не найдена")
    require_team_admin(task.team_id, current_user, db)

    task.status = payload.status
    if payload.admin_comment is not None:
        task.admin_comment = payload.admin_comment
    db.add(task)
    db.commit()
    db.refresh(task)
    return task
