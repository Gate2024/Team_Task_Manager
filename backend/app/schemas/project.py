"""Project and membership serialization and validation schemas."""

from marshmallow import Schema, fields, validate

from .user import UserSummarySchema


class ProjectMemberSchema(Schema):
    """Project membership schema."""

    id = fields.Int(dump_only=True)
    user_id = fields.Int(required=True)
    project_id = fields.Int(dump_only=True)
    role = fields.Str(
        required=True,
        validate=validate.OneOf(["owner", "admin", "member"]),
    )
    user = fields.Nested(UserSummarySchema, dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class ProjectSchema(Schema):
    """Project schema with embedded owner and member information."""

    id = fields.Int(dump_only=True)
    name = fields.Str(required=True, validate=validate.Length(min=1, max=100))
    description = fields.Str(load_default="", dump_default="")
    owner_id = fields.Int(dump_only=True)
    owner = fields.Nested(UserSummarySchema, dump_only=True)
    memberships = fields.List(fields.Nested(ProjectMemberSchema), dump_only=True)
    created_at = fields.DateTime(dump_only=True)
    updated_at = fields.DateTime(dump_only=True)


class ProjectUpdateSchema(Schema):
    """Schema for updating project details."""

    name = fields.Str(validate=validate.Length(min=1, max=100))
    description = fields.Str(validate=validate.Length(max=1000))

