import pytest
import os
import warnings
from httpx import AsyncClient, ASGITransport
from sqlalchemy.ext.asyncio import create_async_engine, AsyncSession
from sqlalchemy.orm import sessionmaker
from sqlalchemy import text
from sqlalchemy.pool import NullPool

from app.main import app
from app.database import get_db


TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "postgresql+asyncpg://admin:secret@db:5432/gym_test"
)


if "appdb" in TEST_DATABASE_URL or "postgres:5432/postgres" in TEST_DATABASE_URL:
    warnings.warn("UWAGA: TEST_DATABASE_URL wskazuje na główną bazę danych. Zmień na testową (np. gym_test)!")

test_engine = create_async_engine(TEST_DATABASE_URL, echo=False, poolclass=NullPool)
TestingSessionLocal = sessionmaker(test_engine, class_=AsyncSession, expire_on_commit=False)

@pytest.fixture(scope="session")
async def setup_test_db():

    init_sql_path = os.path.join(os.path.dirname(__file__), "../../../backend/init.sql")

    if os.path.exists(init_sql_path):
        with open(init_sql_path, "r", encoding="utf-8") as f:
            sql_script = f.read()

        async with test_engine.begin() as conn:
            await conn.execute(text("DROP SCHEMA public CASCADE"))
            await conn.execute(text("CREATE SCHEMA public"))

            raw_conn = await conn.get_raw_connection()
            await raw_conn.driver_connection.execute(sql_script)

    yield

    async with test_engine.begin() as conn:
        await conn.execute(text("DROP SCHEMA public CASCADE"))
        await conn.execute(text("CREATE SCHEMA public"))

    await test_engine.dispose()

@pytest.fixture
async def db_session(setup_test_db):

    async with test_engine.begin() as conn:
        async_session_maker = sessionmaker(
            bind=conn,
            class_=AsyncSession,
            expire_on_commit=False
        )

        async with async_session_maker() as session:
            yield session
            await session.rollback()

@pytest.fixture
async def async_client(db_session):
   
    async def override_get_db():
        yield db_session

    app.dependency_overrides[get_db] = override_get_db

    async with AsyncClient(transport=ASGITransport(app=app), base_url="http://test") as client:
        yield client

    app.dependency_overrides.clear()
