"""Notification serialization schemas."""

from marshmallow import Schema, fields

from .user import UserSummarySchema


class NotificationSchema(Schema):
    """Schema for serializing user notifications."""

    id = fields.Int(dump_only=True)
    recipient_id = fields.Int(dump_only=True)
    actor_id = fields.Int(allow_none=True)
    type = fields.Str(dump_only=True)
    title = fields.Str(dump_only=True)
    message = fields.Str(dump_only=True)
    project_id = fields.Int(allow_none=True)
    task_id = fields.Int(allow_none=True)
    case_id = fields.Int(allow_none=True)
    is_read = fields.Bool(dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    actor = fields.Nested(UserSummarySchema, dump_only=True)
