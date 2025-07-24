from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker, declarative_base
from core.config import settings

DATABASE_URL = f"postgresql+asyncpg://{settings.PGUSER}:{settings.PGPASSWORD}@{settings.PGHOST}/{settings.PGDATABASE}"

engine = create_async_engine(DATABASE_URL, echo=True)

AsyncSessionLocal = sessionmaker(
    autocommit=False,
    autoflush=False,
    bind=engine,
    class_=AsyncSession,
    expire_on_commit=False
)

Base = declarative_base()

async def get_db():
    session = AsyncSessionLocal()
    try:
        yield session
    finally:
        await session.close()
