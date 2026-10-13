"""Marshmallow serialization and validation schemas."""

from .activity import ActivityLogSchema
from .auth import LoginSchema, RegisterSchema
from .case import CaseSchema, CaseStatusUpdateSchema, CaseUpdateSchema
from .comment import CommentSchema
from .notification import NotificationSchema
from .project import ProjectMemberSchema, ProjectSchema, ProjectUpdateSchema
from .task import TaskSchema, TaskStatusUpdateSchema, TaskUpdateSchema
from .user import UserSchema, UserSummarySchema

__all__ = [
    "ActivityLogSchema",
    "CaseSchema",
    "CaseStatusUpdateSchema",
    "CaseUpdateSchema",
    "CommentSchema",
    "LoginSchema",
    "NotificationSchema",
    "ProjectMemberSchema",
    "ProjectSchema",
    "ProjectUpdateSchema",
    "RegisterSchema",
    "TaskSchema",
    "TaskStatusUpdateSchema",
    "TaskUpdateSchema",
    "UserSchema",
    "UserSummarySchema",
]
