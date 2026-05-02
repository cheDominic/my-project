from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from typing import List
from database import get_pool, close_pool
from models import ItemCreate, ItemResponse

# 앱 시작/종료 시 DB 풀 관리
@asynccontextmanager
async def lifespan(app: FastAPI):
    await get_pool()        # 시작 시 연결 풀 생성
    yield
    await close_pool()      # 종료 시 정리

app = FastAPI(title="My API", version="1.0.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "https://my-project-vue.onrender.com",
        "https://my-project-react-mhgj.onrender.com",
        "http://localhost:5173",   # Vue 로컬 개발
        "http://localhost:5174",   # React 로컬 개발
        "http://localhost:4173",   # Vue preview
        "http://localhost:4174",   # React preview
    ],
    allow_methods=["*"],
    allow_headers=["*"],
)

# ── 헬스체크 ──
@app.get("/health")
async def health():
    return {"status": "ok"}

# ── DB 연결 확인 ──
@app.get("/db-check")
async def db_check():
    try:
        pool = await get_pool()
        async with pool.acquire() as conn:
            result = await conn.fetchval("SELECT COUNT(*) FROM items")
        return {"db": "connected", "items_count": result}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ── 아이템 전체 조회 ──
@app.get("/items", response_model=List[ItemResponse])
async def get_items():
    pool = await get_pool()
    async with pool.acquire() as conn:
        rows = await conn.fetch(
            "SELECT * FROM items ORDER BY id DESC"
        )
    return [dict(row) for row in rows]

# ── 아이템 추가 ──
@app.post("/items", response_model=ItemResponse)
async def create_item(item: ItemCreate):
    pool = await get_pool()
    async with pool.acquire() as conn:
        row = await conn.fetchrow(
            "INSERT INTO items (name, content) VALUES ($1, $2) RETURNING *",
            item.name, item.content
        )
    return dict(row)

# ── 아이템 삭제 ──
@app.delete("/items/{item_id}")
async def delete_item(item_id: int):
    pool = await get_pool()
    async with pool.acquire() as conn:
        result = await conn.execute(
            "DELETE FROM items WHERE id = $1", item_id
        )
    if result == "DELETE 0":
        raise HTTPException(status_code=404, detail="Item not found")
    return {"deleted": item_id}