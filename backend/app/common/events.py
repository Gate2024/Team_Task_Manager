"""Activity logging and notification dispatch utilities."""

from __future__ import annotations

import json
import re
from typing import Any

from ..extensions import db
from ..models import ActivityLog, Notification, ProjectMember, User


def log_activity(
    action: str,
    actor_id: int | None = None,
    project_id: int | None = None,
    task_id: int | None = None,
    case_id: int | None = None,
    metadata: dict[str, Any] | None = None,
) -> ActivityLog:
    """Create a persistent activity log record."""
    meta_str = json.dumps(metadata) if metadata else None
    activity = ActivityLog(
        actor_id=actor_id,
        project_id=project_id,
        task_id=task_id,
        case_id=case_id,
        action=action,
        metadata_json=meta_str,
    )
    db.session.add(activity)
    return activity


def create_notification(
    recipient_id: int,
    type_: str | None = None,
    title: str = "",
    message: str = "",
    actor_id: int | None = None,
    project_id: int | None = None,
    task_id: int | None = None,
    case_id: int | None = None,
    type: str | None = None,
) -> Notification | None:
    """Create a persistent notification for a user (skips if actor is recipient)."""
    if actor_id and actor_id == recipient_id:
        return None

    notif_type = type or type_ or "general"

    notification = Notification(
        recipient_id=recipient_id,
        actor_id=actor_id,
        type=notif_type,
        title=title,
        message=message,
        project_id=project_id,
        task_id=task_id,
        case_id=case_id,
    )
    db.session.add(notification)
    return notification


def notify_project_admins(
    project_id: int,
    type_: str | None = None,
    title: str = "",
    message: str = "",
    actor_id: int | None = None,
    task_id: int | None = None,
    case_id: int | None = None,
    type: str | None = None,
) -> list[Notification]:
    """Send notification to project owner and admins."""
    notif_type = type or type_ or "general"
    members = db.session.execute(
        db.select(ProjectMember).where(
            ProjectMember.project_id == project_id,
            ProjectMember.role.in_(("owner", "admin")),
        )
    ).scalars().all()

    notifications = []
    for m in members:
        if actor_id and m.user_id == actor_id:
            continue
        n = create_notification(
            recipient_id=m.user_id,
            type_=notif_type,
            title=title,
            message=message,
            actor_id=actor_id,
            project_id=project_id,
            task_id=task_id,
            case_id=case_id,
        )
        if n:
            notifications.append(n)
    return notifications


def parse_and_notify_mentions(
    text: str,
    actor: User,
    project_id: int | None = None,
    task_id: int | None = None,
    case_id: int | None = None,
    context_title: str = "item",
) -> list[Notification]:
    """Parse @mentions in text and notify valid project members."""
    if not text or "@" not in text:
        return []

    # Find words following @, e.g. @Rahul, @Member2, @john.doe
    raw_matches = re.findall(r"@([a-zA-Z0-9_\-\.]+)", text)
    if not raw_matches:
        return []

    # Clean tokens (remove trailing punctuation like dots or commas)
    clean_mentions: list[str] = []
    for m in raw_matches:
        token = m.rstrip(".,;:!?")
        if token:
            clean_mentions.append(token)

    if not clean_mentions:
        return []

    # Deduplicate tokens while preserving order
    unique_mentions = list(dict.fromkeys(clean_mentions))

    # Resolve candidate project members if project_id is provided
    candidate_users: list[User] = []
    if project_id:
        from ..models import Project
        project = db.session.get(Project, project_id)
        if not project:
            return []

        member_user_ids = db.session.execute(
            db.select(ProjectMember.user_id).where(
                ProjectMember.project_id == project_id,
            )
        ).scalars().all()

        candidate_ids = set(member_user_ids)
        if project.owner_id:
            candidate_ids.add(project.owner_id)

        # Do not allow actor to mention/notify themselves
        candidate_ids.discard(actor.id)

        if not candidate_ids:
            return []

        candidate_users = db.session.execute(
            db.select(User).where(User.id.in_(candidate_ids))
        ).scalars().all()

    notifications: list[Notification] = []
    notified_user_ids: set[int] = set()

    for mention in unique_mentions:
        m_lower = mention.lower()
        m_no_space = m_lower.replace(" ", "")

        matched_user: User | None = None

        if project_id:
            # 1. Exact match on username, full name without spaces, or email prefix
            for u in candidate_users:
                u_name_lower = u.name.lower()
                u_email_lower = u.email.lower()
                if (
                    u_name_lower == m_lower
                    or u_name_lower.replace(" ", "") == m_no_space
                    or u_email_lower.split("@")[0] == m_lower
                ):
                    matched_user = u
                    break

            # 2. First name match (e.g. Rahul from "Rahul Sharma")
            if not matched_user:
                for u in candidate_users:
                    first_name = u.name.lower().split()[0]
                    if first_name == m_lower:
                        matched_user = u
                        break

            # 3. Prefix match on full name / email prefix
            if not matched_user:
                for u in candidate_users:
                    u_name_lower = u.name.lower()
                    u_email_lower = u.email.lower()
                    if (
                        u_name_lower.startswith(m_lower)
                        or u_name_lower.replace(" ", "").startswith(m_no_space)
                        or u_email_lower.startswith(m_lower)
                    ):
                        matched_user = u
                        break
        else:
            # Fallback if no project context
            matched_user = db.session.execute(
                db.select(User).where(
                    User.id != actor.id,
                    db.or_(
                        User.name.ilike(f"{mention}%"),
                        User.email.ilike(f"{mention}%"),
                    ),
                )
            ).scalars().first()

        if matched_user and matched_user.id != actor.id and matched_user.id not in notified_user_ids:
            notified_user_ids.add(matched_user.id)
            n = create_notification(
                recipient_id=matched_user.id,
                actor_id=actor.id,
                type="comment_mention",
                title=f"{actor.name} mentioned you in {context_title}",
                message=f"{actor.name} mentioned you in a comment on {context_title}: {text[:100]}",
                project_id=project_id,
                task_id=task_id,
                case_id=case_id,
            )
            if n:
                notifications.append(n)

    return notifications
