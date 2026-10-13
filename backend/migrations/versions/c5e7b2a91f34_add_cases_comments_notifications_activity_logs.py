"""Add cases, comments, notifications, and activity_logs tables

Revision ID: c5e7b2a91f34
Revises: 8f2c3d4e5a1b
Create Date: 2026-10-13 07:15:00.000000

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision = 'c5e7b2a91f34'
down_revision = '8f2c3d4e5a1b'
branch_labels = None
depends_on = None


def upgrade():
    # 1. Create cases table
    op.create_table(
        'cases',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('ticket_number', sa.String(length=30), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('description', sa.Text(), server_default='', nullable=False),
        sa.Column('status', sa.String(length=20), server_default='open', nullable=False),
        sa.Column('priority', sa.String(length=20), server_default='medium', nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=False),
        sa.Column('created_by', sa.Integer(), nullable=False),
        sa.Column('assigned_to', sa.Integer(), nullable=True),
        sa.Column('due_date', sa.Date(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.CheckConstraint("status IN ('open', 'in_progress', 'resolved', 'closed')", name='case_status_allowed'),
        sa.CheckConstraint("priority IN ('low', 'medium', 'high', 'urgent')", name='case_priority_allowed'),
        sa.ForeignKeyConstraint(['assigned_to'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['created_by'], ['users.id'], ondelete='RESTRICT'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id'),
        sa.UniqueConstraint('ticket_number')
    )
    op.create_index('ix_cases_assignee_status', 'cases', ['assigned_to', 'status'], unique=False)
    op.create_index('ix_cases_project_priority', 'cases', ['project_id', 'priority'], unique=False)
    op.create_index('ix_cases_project_status', 'cases', ['project_id', 'status'], unique=False)
    op.create_index('ix_cases_ticket_number', 'cases', ['ticket_number'], unique=True)

    # 2. Create comments table
    op.create_table(
        'comments',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('author_id', sa.Integer(), nullable=False),
        sa.Column('task_id', sa.Integer(), nullable=True),
        sa.Column('case_id', sa.Integer(), nullable=True),
        sa.Column('body', sa.Text(), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.Column('updated_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['author_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_comments_author_id', 'comments', ['author_id'], unique=False)
    op.create_index('ix_comments_case_id', 'comments', ['case_id'], unique=False)
    op.create_index('ix_comments_task_id', 'comments', ['task_id'], unique=False)

    # 3. Create notifications table
    op.create_table(
        'notifications',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('recipient_id', sa.Integer(), nullable=False),
        sa.Column('actor_id', sa.Integer(), nullable=True),
        sa.Column('type', sa.String(length=50), nullable=False),
        sa.Column('title', sa.String(length=150), nullable=False),
        sa.Column('message', sa.Text(), nullable=False),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('task_id', sa.Integer(), nullable=True),
        sa.Column('case_id', sa.Integer(), nullable=True),
        sa.Column('is_read', sa.Boolean(), server_default=sa.text('false'), nullable=False),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['recipient_id'], ['users.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_notifications_recipient_created', 'notifications', ['recipient_id', 'created_at'], unique=False)
    op.create_index('ix_notifications_recipient_read', 'notifications', ['recipient_id', 'is_read'], unique=False)

    # 4. Create activity_logs table
    op.create_table(
        'activity_logs',
        sa.Column('id', sa.Integer(), nullable=False),
        sa.Column('actor_id', sa.Integer(), nullable=True),
        sa.Column('project_id', sa.Integer(), nullable=True),
        sa.Column('task_id', sa.Integer(), nullable=True),
        sa.Column('case_id', sa.Integer(), nullable=True),
        sa.Column('action', sa.String(length=50), nullable=False),
        sa.Column('metadata_json', sa.Text(), nullable=True),
        sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('now()'), nullable=False),
        sa.ForeignKeyConstraint(['actor_id'], ['users.id'], ondelete='SET NULL'),
        sa.ForeignKeyConstraint(['case_id'], ['cases.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['project_id'], ['projects.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index('ix_activity_actor_created', 'activity_logs', ['actor_id', 'created_at'], unique=False)
    op.create_index('ix_activity_project_created', 'activity_logs', ['project_id', 'created_at'], unique=False)


def downgrade():
    op.drop_index('ix_activity_project_created', table_name='activity_logs')
    op.drop_index('ix_activity_actor_created', table_name='activity_logs')
    op.drop_table('activity_logs')

    op.drop_index('ix_notifications_recipient_read', table_name='notifications')
    op.drop_index('ix_notifications_recipient_created', table_name='notifications')
    op.drop_table('notifications')

    op.drop_index('ix_comments_task_id', table_name='comments')
    op.drop_index('ix_comments_case_id', table_name='comments')
    op.drop_index('ix_comments_author_id', table_name='comments')
    op.drop_table('comments')

    op.drop_index('ix_cases_ticket_number', table_name='cases')
    op.drop_index('ix_cases_project_status', table_name='cases')
    op.drop_index('ix_cases_project_priority', table_name='cases')
    op.drop_index('ix_cases_assignee_status', table_name='cases')
    op.drop_table('cases')
