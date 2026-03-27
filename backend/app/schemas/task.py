from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime, date


class TaskCreate(BaseModel):
    title: str = Field(..., min_length=1, max_length=255)
    description: Optional[str] = None
    status: str = "pending"
    assigned_user_id: Optional[int] = None
    due_date: Optional[date] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=255)
    description: Optional[str] = None
    status: Optional[str] = None
    assigned_user_id: Optional[int] = None
    due_date: Optional[date] = None


class TaskResponse(BaseModel):
    id: int
    title: str
    description: Optional[str]
    status: str
    assigned_user_id: Optional[int]
    assigned_user_name: Optional[str]
    created_by: int
    creator_name: Optional[str]
    due_date: Optional[str]
    created_at: Optional[str]

    class Config:
        from_attributes = True


class PaginatedTaskResponse(BaseModel):
    items: List[TaskResponse]
    total: int
    page: int
    page_size: int
    total_pages: int