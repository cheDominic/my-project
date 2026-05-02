from pydantic import BaseModel
from typing import Optional
from datetime import datetime

class ItemCreate(BaseModel):
    name: str
    content: Optional[str] = None

class ItemResponse(BaseModel):
    id: int
    name: str
    content: Optional[str]
    created_at: datetime

    class Config:
        from_attributes = True