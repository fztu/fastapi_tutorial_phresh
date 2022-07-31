"""create main tables

Revision ID: 6bc9c88e4f17
Revises: 
Create Date: 2022-07-31 15:36:08.345736

"""
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic
revision = '6bc9c88e4f17'
down_revision = None
branch_labels = None
depends_on = None

def create_cleanings_table() -> None:
    op.create_table(
        "cleanings",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.Text, nullable=False, index=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("cleaning_type", sa.Text, nullable=False, server_default="spot_clean"),
        sa.Column("price", sa.Numeric(10,2), nullable=False),
    )

def upgrade() -> None:
    create_cleanings_table()


def downgrade() -> None:
    op.drop_table("cleanings")

