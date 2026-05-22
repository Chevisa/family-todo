from collections.abc import Iterable

from sqlalchemy.orm import Session

from app.core.config import settings
from app.models.enums import TeamRole
from app.models.user import User
from app.models.user_team import UserTeam


class NotificationService:
    """
    Пока это мягкая интеграция-заглушка.
    Здесь можно подключить Telegram Bot API или SMS-провайдера.
    """

    @staticmethod
    def get_team_admins(db: Session, team_id: int) -> list[User]:
        rows = (
            db.query(User)
            .join(UserTeam, UserTeam.user_id == User.id)
            .filter(UserTeam.team_id == team_id, UserTeam.role_in_team == TeamRole.admin)
            .all()
        )
        return rows

    @staticmethod
    def notify_review_requested(db: Session, team_id: int, task_name: str, requested_by: str) -> dict:
        admins = NotificationService.get_team_admins(db, team_id)
        delivered = []
        skipped = []
        for admin in admins:
            if settings.telegram_bot_token and admin.telegram_id:
                delivered.append({"user_id": admin.id, "channel": "telegram"})
            elif settings.sigma_sms_token and admin.phone_number:
                delivered.append({"user_id": admin.id, "channel": "sms"})
            else:
                skipped.append({"user_id": admin.id, "reason": "Нет подключенного канала уведомлений"})
        return {
            "message": f"Запрошена проверка задачи '{task_name}' пользователем {requested_by}",
            "delivered": delivered,
            "skipped": skipped,
        }
