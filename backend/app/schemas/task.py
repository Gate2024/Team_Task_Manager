"""Task serialization and validation schemas."""

from marshmallow import Schema, fields, validate

from .user import UserSummarySchema


class TaskSchema(Schema):
    """Full task schema with associations."""

    id = fields.Int(dump_only=True)
    title = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    description = fields.Str(load_default="", dump_default="")
    status = fields.Str(
        load_default="todo",
        validate=validate.OneOf(["todo", "in_progress", "done"]),
    )
    priority = fields.Str(
        load_default="medium",
        dump_default="medium",
        validate=validate.OneOf(["low", "medium", "high", "urgent"]),
    )
    project_id = fields.Int(required=True)
    created_by = fields.Int(dump_only=True)
    assigned_to = fields.Int(allow_none=True)
    due_date = fields.Date(allow_none=True)
    creator = fields.Nested(UserSummarySchema, dump_only=True)
    assignee = fields.Nested(UserSummarySchema, dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class TaskStatusUpdateSchema(Schema):
    """Schema for validating task status updates."""

    status = fields.Str(
        required=True,
        validate=validate.OneOf(["todo", "in_progress", "done"]),
    )


class TaskUpdateSchema(Schema):
    """Schema for validating task updates."""

    title = fields.Str(validate=validate.Length(min=1, max=100))
    description = fields.Str(allow_none=True)
    status = fields.Str(validate=validate.OneOf(["todo", "in_progress", "done"]))
    priority = fields.Str(validate=validate.OneOf(["low", "medium", "high", "urgent"]))
    assigned_to = fields.Int(allow_none=True)
    due_date = fields.Date(allow_none=True)

