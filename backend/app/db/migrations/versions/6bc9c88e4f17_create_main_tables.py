"""create main tables

Revision ID: 6bc9c88e4f17
Revises: 
Create Date: 2022-07-31 15:36:08.345736

"""
from operator import index
from re import S
from typing import Tuple
from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic
revision = '6bc9c88e4f17'
down_revision = None
branch_labels = None
depends_on = None

def create_updated_at_trigger() -> None:
    op.execute(
        """
        CREATE OR REPLACE FUNCTION update_updated_at_column()
            RETURNS TRIGGER AS 
        $$
        BEGIN 
            NEW.updated_at = now();
            RETURN NEW;
        END;
        $$ language 'plpgsql';
        """
    )

def timestamp(indexed: bool = False) -> Tuple[sa.Column, sa.Index]:
    return (
        sa.Column(
            "created_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
            index=indexed,
        ),
        sa.Column(
            "updated_at",
            sa.TIMESTAMP(timezone=True),
            server_default=sa.func.now(),
            nullable=False,
            index=indexed,
        ),
    )

def create_cleanings_table() -> None:
    op.create_table(
        "cleanings",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("name", sa.Text, nullable=False, index=True),
        sa.Column("description", sa.Text, nullable=True),
        sa.Column("cleaning_type", sa.Text, nullable=False, server_default="spot_clean"),
        sa.Column("price", sa.Numeric(10,2), nullable=False),
        *timestamp(),
    )
    op.execute(
        """
        CREATE TRIGGER update_cleanings_modtime
            BEFORE UPDATE 
            ON cleanings
            FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
        """
    )

def create_users_table() -> None:
    op.create_table(
        "users",
        sa.Column("id", sa.Integer, primary_key=True),
        sa.Column("username", sa.Text, unique=True, nullable=False, index=True),
        sa.Column("email", sa.Text, unique=True, nullable=False, index=True),
        sa.Column("email_verified", sa.Boolean, nullable=False, server_default="False"),
        sa.Column("salt", sa.Text, nullable=False),
        sa.Column("password", sa.Text, nullable=False),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="True"),
        sa.Column("is_superuser", sa.Boolean, nullable=False, server_default="False"),
        *timestamp(),
    )
    op.execute(
        """
        CREATE TRIGGER update_users_modtime
            BEFORE UPDATE
            ON users
            FOR EACH ROW
        EXECUTE PROCEDURE update_updated_at_column();
        """
    )

def upgrade() -> None:
    create_updated_at_trigger()
    create_cleanings_table()
    create_users_table()


def downgrade() -> None:
    op.drop_table("users")
    op.drop_table("cleanings")
    op.execute("DROP FUNCTION update_updated_at_column()")

