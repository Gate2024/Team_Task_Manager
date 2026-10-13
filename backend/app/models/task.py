"""Task model."""

from __future__ import annotations

from datetime import date

from sqlalchemy import CheckConstraint, Date, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import db
from .base import TimestampMixin


class Task(TimestampMixin, db.Model):
    __tablename__ = "tasks"
    __table_args__ = (
        CheckConstraint(
            "status IN ('todo', 'in_progress', 'done')", name="status_allowed"
        ),
        CheckConstraint(
            "priority IN ('low', 'medium', 'high', 'urgent')", name="priority_allowed"
        ),
        Index("ix_tasks_project_status", "project_id", "status"),
        Index("ix_tasks_project_priority", "project_id", "priority"),
        Index("ix_tasks_assignee_status", "assigned_to", "status"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[str] = mapped_column(
        Text, nullable=False, default="", server_default=""
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="todo", server_default="todo"
    )
    priority: Mapped[str] = mapped_column(
        String(20), nullable=False, default="medium", server_default="medium"
    )
    project_id: Mapped[int] = mapped_column(
        ForeignKey("projects.id", ondelete="CASCADE"), nullable=False
    )
    created_by: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="RESTRICT"), nullable=False
    )
    assigned_to: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), nullable=True
    )
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)

    project: Mapped["Project"] = relationship(back_populates="tasks")
    creator: Mapped["User"] = relationship(
        back_populates="created_tasks", foreign_keys=[created_by]
    )
    assignee: Mapped["User | None"] = relationship(
        back_populates="assigned_tasks", foreign_keys=[assigned_to]
    )
