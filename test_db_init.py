import asyncio
import os
from sqlalchemy.ext.asyncio import create_async_engine
from sqlalchemy import text

TEST_DATABASE_URL = "postgresql+asyncpg://admin:secret@localhost:5432/gym_test"
test_engine = create_async_engine(TEST_DATABASE_URL, echo=True)

async def main():
    init_sql_path = "backend/init.sql"
    with open(init_sql_path, "r", encoding="utf-8") as f:
        sql_script = f.read()

    async with test_engine.begin() as conn:
        await conn.execute(text("DROP SCHEMA public CASCADE"))
        await conn.execute(text("CREATE SCHEMA public"))
        
        raw_conn = await conn.get_raw_connection()
        await raw_conn.driver_connection.execute(sql_script)
        
    async with test_engine.begin() as conn:
        res = await conn.execute(text("SELECT table_name FROM information_schema.tables WHERE table_schema='public'"))
        print("TABLES:", [r[0] for r in res.fetchall()])

asyncio.run(main())