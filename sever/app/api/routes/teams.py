from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user, require_team_admin, require_team_member
from app.core.database import get_db
from app.models.enums import TeamRole
from app.models.team import Team
from app.models.user import User
from app.models.user_team import UserTeam
from app.schemas.team import (
    AddMemberRequest,
    TeamCreateRequest,
    TeamDetailsResponse,
    TeamMemberResponse,
    TeamResponse,
    UpdateMemberRoleRequest,
)

router = APIRouter()


@router.post("", response_model=TeamResponse, status_code=status.HTTP_201_CREATED)
def create_team(
    payload: TeamCreateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    team = Team(team_name=payload.team_name, team_type=payload.team_type, num_of_users=1)
    db.add(team)
    db.flush()

    membership = UserTeam(user_id=current_user.id, team_id=team.id, role_in_team=TeamRole.admin)
    db.add(membership)
    db.commit()
    db.refresh(team)
    return team


@router.get("", response_model=list[TeamResponse])
def list_teams(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    teams = (
        db.query(Team)
        .join(UserTeam, UserTeam.team_id == Team.id)
        .filter(UserTeam.user_id == current_user.id)
        .order_by(Team.id.desc())
        .all()
    )
    return teams


@router.get("/{team_id}", response_model=TeamDetailsResponse)
def get_team(team_id: int, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    require_team_member(team_id, current_user, db)
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Семья не найдена")

    members = []
    for item in team.members:
        members.append(TeamMemberResponse(user=item.user, role_in_team=item.role_in_team))

    return TeamDetailsResponse(
        id=team.id,
        team_name=team.team_name,
        team_type=team.team_type,
        num_of_users=team.num_of_users,
        create_date=team.create_date,
        members=members,
    )


@router.post("/{team_id}/members")
def add_member(
    team_id: int,
    payload: AddMemberRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_team_admin(team_id, current_user, db)
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Семья не найдена")

    user = db.query(User).filter(User.email == payload.email).first()
    if not user:
        raise HTTPException(status_code=404, detail="Пользователь с таким email не найден")

    existing = db.query(UserTeam).filter(UserTeam.team_id == team_id, UserTeam.user_id == user.id).first()
    if existing:
        raise HTTPException(status_code=400, detail="Пользователь уже состоит в этой семье")

    membership = UserTeam(user_id=user.id, team_id=team_id, role_in_team=payload.role_in_team)
    db.add(membership)
    team.num_of_users += 1
    db.add(team)
    db.commit()
    return {"message": "Пользователь добавлен в семью"}


@router.patch("/{team_id}/members/{user_id}/role")
def update_member_role(
    team_id: int,
    user_id: int,
    payload: UpdateMemberRoleRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_team_admin(team_id, current_user, db)
    membership = db.query(UserTeam).filter(UserTeam.team_id == team_id, UserTeam.user_id == user_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Участник не найден")

    if membership.role_in_team == TeamRole.admin and payload.role_in_team == TeamRole.member:
        admin_count = db.query(UserTeam).filter(UserTeam.team_id == team_id, UserTeam.role_in_team == TeamRole.admin).count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="В семье должен остаться хотя бы один администратор")

    membership.role_in_team = payload.role_in_team
    db.add(membership)
    db.commit()
    return {"message": "Роль обновлена"}


@router.delete("/{team_id}/members/{user_id}")
def remove_member(
    team_id: int,
    user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db),
):
    require_team_admin(team_id, current_user, db)
    team = db.get(Team, team_id)
    if not team:
        raise HTTPException(status_code=404, detail="Семья не найдена")

    membership = db.query(UserTeam).filter(UserTeam.team_id == team_id, UserTeam.user_id == user_id).first()
    if not membership:
        raise HTTPException(status_code=404, detail="Участник не найден")

    if membership.role_in_team == TeamRole.admin:
        admin_count = db.query(UserTeam).filter(UserTeam.team_id == team_id, UserTeam.role_in_team == TeamRole.admin).count()
        if admin_count <= 1:
            raise HTTPException(status_code=400, detail="Нельзя удалить последнего администратора")

    db.delete(membership)
    team.num_of_users = max(team.num_of_users - 1, 0)
    db.add(team)
    db.commit()
    return {"message": "Участник удален из семьи"}
