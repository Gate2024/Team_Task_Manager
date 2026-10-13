"""Comment model for tasks and cases."""

from __future__ import annotations

from sqlalchemy import ForeignKey, Index, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from ..extensions import db
from .base import TimestampMixin


class Comment(TimestampMixin, db.Model):
    __tablename__ = "comments"
    __table_args__ = (
        Index("ix_comments_task_id", "task_id"),
        Index("ix_comments_case_id", "case_id"),
        Index("ix_comments_author_id", "author_id"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    author_id: Mapped[int] = mapped_column(
        ForeignKey("users.id", ondelete="CASCADE"), nullable=False
    )
    task_id: Mapped[int | None] = mapped_column(
        ForeignKey("tasks.id", ondelete="CASCADE"), nullable=True
    )
    case_id: Mapped[int | None] = mapped_column(
        ForeignKey("cases.id", ondelete="CASCADE"), nullable=True
    )
    body: Mapped[str] = mapped_column(Text, nullable=False)

    author: Mapped["User"] = relationship(back_populates="comments")
    task: Mapped["Task | None"] = relationship(back_populates="comments")
    case: Mapped["Case | None"] = relationship(back_populates="comments")
