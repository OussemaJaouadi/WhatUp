from logging.config import fileConfig
import sys
import os

from sqlalchemy import engine_from_config
from sqlalchemy import pool
from sqlalchemy.ext.asyncio import create_async_engine
import asyncio

from alembic import context

# this is the Alembic Config object, which provides
# access to the values within the .ini file in use.
config = context.config

# Interpret the config file for Python logging.
# This line sets up loggers basically.
if config.config_file_name is not None:
    fileConfig(config.config_file_name)

# Add the backend directory to sys.path to allow importing core.config
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from core.config import settings
from core.database import Base

# add your model's MetaData object here
# for 'autogenerate' support
target_metadata = Base.metadata

# other values from the config, defined by the needs of env.py,
# can be acquired:
# my_important_option = config.get_main_option("my_important_option")
# ... etc.


def run_migrations_offline() -> None:
    """Run migrations in 'offline' mode.

    This configures the context with just a URL
    and not an Engine, though an Engine is acceptable
    here as well.  By skipping the Engine creation
    we don't even need a DBAPI to be available.

    Calls to context.execute() here emit the given string to the
    script output.

    """
    url = f"postgresql+asyncpg://{settings.PGUSER}:{settings.PGPASSWORD}@{settings.PGHOST}/{settings.PGDATABASE}"
    context.configure(
        url=url,
        target_metadata=target_metadata,
        dialect_opts={"paramstyle": "named"},
    )

    with context.begin_transaction():
        context.run_migrations()


def run_migrations_online() -> None:
    """Run migrations in 'online' mode.

    In this scenario we need to create an Engine
    and associate a connection with the context.

    """
    connectable = create_async_engine(
        f"postgresql+asyncpg://{settings.PGUSER}:{settings.PGPASSWORD}@{settings.PGHOST}/{settings.PGDATABASE}",
        poolclass=pool.NullPool,
    )

    async def run_async_migrations():
        async with connectable.connect() as connection:
            context.configure(
                connection=connection.sync_connection,  # Use sync_connection here
                target_metadata=target_metadata,
                dialect_opts={"paramstyle": "named"},
            )

            def do_run_migrations(connection):
                context.run_migrations()

            try:
                await connection.begin()
                await connection.run_sync(do_run_migrations)
                await connection.commit()
            except Exception:
                await connection.rollback()
                raise

    asyncio.run(run_async_migrations())


if context.is_offline_mode():
    run_migrations_offline()
else:
    run_migrations_online()
