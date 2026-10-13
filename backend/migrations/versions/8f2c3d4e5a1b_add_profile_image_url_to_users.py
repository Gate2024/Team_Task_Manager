"""add profile_image_url to users

Revision ID: 8f2c3d4e5a1b
Revises: e49a88c42631
Create Date: 2026-10-13 04:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = '8f2c3d4e5a1b'
down_revision = 'e49a88c42631'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.add_column(sa.Column('profile_image_url', sa.String(length=500), nullable=True))


def downgrade():
    with op.batch_alter_table('users', schema=None) as batch_op:
        batch_op.drop_column('profile_image_url')
