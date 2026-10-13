"""add project description and task priority

Revision ID: e49a88c42631
Revises: 00b65599992e
Create Date: 2026-10-13 03:00:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'e49a88c42631'
down_revision = '00b65599992e'
branch_labels = None
depends_on = None


def upgrade():
    with op.batch_alter_table('projects', schema=None) as batch_op:
        batch_op.add_column(sa.Column('description', sa.Text(), server_default='', nullable=False))

    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.add_column(sa.Column('priority', sa.String(length=20), server_default='medium', nullable=False))
        batch_op.create_check_constraint('priority_allowed', "priority IN ('low', 'medium', 'high', 'urgent')")
        batch_op.create_index('ix_tasks_project_priority', ['project_id', 'priority'], unique=False)


def downgrade():
    with op.batch_alter_table('tasks', schema=None) as batch_op:
        batch_op.drop_index('ix_tasks_project_priority')
        batch_op.drop_constraint('priority_allowed', type_='check')
        batch_op.drop_column('priority')

    with op.batch_alter_table('projects', schema=None) as batch_op:
        batch_op.drop_column('description')
