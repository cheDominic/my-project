import os
import asyncpg
from dotenv import load_dotenv

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")

# 연결 풀 (앱 시작 시 생성, 종료 시 해제)
pool = None

async def get_pool():
    global pool
    if pool is None:
        pool = await asyncpg.create_pool(
            DATABASE_URL,
            min_size=1,
            max_size=10,
            ssl="require"        # Supabase 필수
        )
    return pool

async def close_pool():
    global pool
    if pool:
        await pool.close()