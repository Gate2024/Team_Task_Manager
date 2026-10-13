"""Case (Support/Issue/Ticket) model."""

from __future__ import annotations

from datetime import date

from sqlalchemy import CheckConstraint, Date, ForeignKey, Index, String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import db
from .base import TimestampMixin


class Case(TimestampMixin, db.Model):
    __tablename__ = "cases"
    __table_args__ = (
        CheckConstraint(
            "status IN ('open', 'in_progress', 'resolved', 'closed')",
            name="case_status_allowed",
        ),
        CheckConstraint(
            "priority IN ('low', 'medium', 'high', 'urgent')",
            name="case_priority_allowed",
        ),
        Index("ix_cases_project_status", "project_id", "status"),
        Index("ix_cases_project_priority", "project_id", "priority"),
        Index("ix_cases_assignee_status", "assigned_to", "status"),
        Index("ix_cases_ticket_number", "ticket_number", unique=True),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    ticket_number: Mapped[str] = mapped_column(String(30), nullable=False, unique=True)
    title: Mapped[str] = mapped_column(String(150), nullable=False)
    description: Mapped[str] = mapped_column(
        Text, nullable=False, default="", server_default=""
    )
    status: Mapped[str] = mapped_column(
        String(20), nullable=False, default="open", server_default="open"
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

    project: Mapped["Project"] = relationship(back_populates="cases")
    creator: Mapped["User"] = relationship(
        back_populates="created_cases", foreign_keys=[created_by]
    )
    assignee: Mapped["User | None"] = relationship(
        back_populates="assigned_cases", foreign_keys=[assigned_to]
    )
    comments: Mapped[list["Comment"]] = relationship(
        back_populates="case", cascade="all, delete-orphan", passive_deletes=True
    )
