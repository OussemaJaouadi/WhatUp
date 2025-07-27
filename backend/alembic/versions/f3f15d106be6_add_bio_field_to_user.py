"""add bio field to user

Revision ID: f3f15d106be6
Revises: a46846d7d041
Create Date: 2025-07-25 13:08:40.539247

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision: str = 'f3f15d106be6'
down_revision: Union[str, Sequence[str], None] = 'a46846d7d041'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    op.add_column('users', sa.Column('bio', sa.String(), nullable=True))


def downgrade() -> None:
    op.drop_column('users', 'bio')
