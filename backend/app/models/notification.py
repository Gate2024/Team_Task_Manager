"""Notification model for persistent team alerts and mentions."""

from __future__ import annotations

from datetime import datetime

from sqlalchemy import Boolean, DateTime, ForeignKey, Index, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import db


class Notification(db.Model):
    __tablename__ = "notifications"
    __table_args__ = (
        Index("ix_notifications_recipient_read", "recipient_id", "is_read"),
        Index("ix_notifications_recipient_created", "recipient_id", "created_at"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    recipient_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    actor_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    type: Mapped[str] = mapped_column(String(50), nullable=False)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    project_id: Mapped[int | None] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=True
    )
    task_id: Mapped[int | None] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True
    )
    case_id: Mapped[int | None] = mapped_column(
        ForeignKey("cases.id", ondelete="CASCADE"), nullable=True
    )
    is_read: Mapped[bool] = mapped_column(
        Boolean, default=False, server_default="false", nullable=False
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), nullable=False, server_default=func.now()
    )

    recipient: Mapped["User"] = relationship(
        back_populates="notifications", foreign_keys=[recipient_id]
    )
    actor: Mapped["User | None"] = relationship(foreign_keys=[actor_id])
    project: Mapped["Project | None"] = relationship()
    task: Mapped["Task | None"] = relationship()
    case: Mapped["Case | None"] = relationship()
