"""Project membership and project-scoped role model."""

from __future__ import annotations

from sqlalchemy import CheckConstraint, ForeignKey, Index, String, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import db
from .base import TimestampMixin


class ProjectMember(TimestampMixin, db.Model):
    __tablename__ = "project_members"
    __table_args__ = (
        UniqueConstraint(
            "project_id", "user_id", name="uq_project_members_project_user"
        ),
        CheckConstraint(
            "role IN ('owner', 'admin', 'member')", name="role_allowed"
        ),
        Index("ix_project_members_user_project", "user_id", "project_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    role: Mapped[str] = mapped_column(
        String(20), nullable=False, default="member", server_default="member"
    )

    user: Mapped["User"] = relationship(back_populates="memberships")
    project: Mapped["Project"] = relationship(back_populates="memberships")
