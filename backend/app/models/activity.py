"""ActivityLog model for team audit and history tracking."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import db


class ActivityLog(db.Model):
    __tablename__ = "activity_logs"
    __table_args__ = (
        Index("ix_activity_project_created", "project_id", "created_at"),
        Index("ix_activity_actor_created", "actor_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    actor_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    project_id: Mapped[int | None] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=True
    )
    task_id: Mapped[int | None] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True
    )
    case_id: Mapped[int | None] = mapped_column(
        ForeignKey("cases.id", ondelete="CASCADE"), nullable=True
    )
    action: Mapped[str] = mapped_column(String(50), nullable=False)
    metadata_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    actor: Mapped["User | None"] = relationship(foreign_keys=[actor_id])
    project: Mapped["Project | None"] = relationship()
    task: Mapped["Task | None"] = relationship()
    case: Mapped["Case | None"] = relationship()
