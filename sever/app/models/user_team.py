from sqlalchemy import Enum, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.core.database import Base
from app.models.enums import TeamRole


class UserTeam(Base):
    __tablename__ = "user_teams"
    __table_args__ = (UniqueConstraint("user_id", "team_id", name="uq_user_team"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    team_id: Mapped[int] = mapped_column(ForeignKey("teams.id", ondelete="CASCADE"), nullable=False)
    role_in_team: Mapped[TeamRole] = mapped_column(Enum(TeamRole, name="team_role_enum"), nullable=False)

    user = relationship("User", back_populates="memberships")
    team = relationship("Team", back_populates="members")
