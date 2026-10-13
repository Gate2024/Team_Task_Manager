"""User model."""

from __future__ import annotations

from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship, validates
from werkzeug.security import check_password_hash, generate_password_hash

from ..extensions import db
from .base import TimestampMixin


class User(TimestampMixin, db.Model):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    email: Mapped[str] = mapped_column(String(254), nullable=False, unique=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    mobile_number: Mapped[str | None] = mapped_column(String(20), nullable=True)
    profile_image_url: Mapped[str | None] = mapped_column(String(500), nullable=True)

    owned_projects: Mapped[list["Project"]] = relationship(
        back_populates="owner", foreign_keys="Project.owner_id", passive_deletes=True
    )
    memberships: Mapped[list["ProjectMember"]] = relationship(
        back_populates="user", passive_deletes=True
    )
    created_tasks: Mapped[list["Task"]] = relationship(
        back_populates="creator", foreign_keys="Task.created_by", passive_deletes=True
    )
    assigned_tasks: Mapped[list["Task"]] = relationship(
        back_populates="assignee", foreign_keys="Task.assigned_to", passive_deletes=True
    )

    @validates("email")
    def normalize_email(self, _key: str, value: str) -> str:
        """Store the canonical lowercase representation used for uniqueness."""

        normalized = value.strip().lower()
        if not normalized:
            raise ValueError("Email cannot be empty")
        return normalized

    def set_password(self, password: str) -> None:
        """Hash and store the user's password."""
        self.password_hash = generate_password_hash(password)

    def check_password(self, password: str) -> bool:
        """Verify password against the stored hash."""
        return check_password_hash(self.password_hash, password)
