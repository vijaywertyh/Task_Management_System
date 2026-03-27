from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.api.deps import get_db, get_current_user
from app.schemas.task import TaskCreate, TaskUpdate, TaskResponse, PaginatedTaskResponse
from app.repositories.task_repository import TaskRepository
from app.repositories.user_repository import UserRepository
from app.services.task_service import TaskService

router = APIRouter()

task_repo = TaskRepository()
user_repo = UserRepository()
task_service = TaskService(task_repo, user_repo)


def serialize_task(task):
    return {
        "id": task.id,
        "title": task.title,
        "description": task.description,
        "status": task.status,
        "assigned_user_id": task.assigned_user_id,
        "assigned_user_name": task.assigned_user.name if task.assigned_user else None,
        "created_by": task.created_by,
        "creator_name": task.creator.name if task.creator else None,
        "due_date": task.due_date.isoformat() if task.due_date else None,
        "created_at": task.created_at.isoformat() if task.created_at else None,
    }


@router.post("/", response_model=TaskResponse, status_code=201)
def create_task(
    payload: TaskCreate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        task = task_service.create_task(db, payload, current_user)
        task = task_repo.get_by_id(db, task.id)
        return serialize_task(task)
    except ValueError as e:
        message = str(e)
        if "not found" in message.lower():
            raise HTTPException(status_code=404, detail=message)
        raise HTTPException(status_code=400, detail=message)


@router.get("/", response_model=PaginatedTaskResponse)
def get_tasks(
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=50),
    status: str = Query(None),
    assigned_user_id: int = Query(None),
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        result = task_service.get_tasks(
            db, page, page_size, status, assigned_user_id, current_user
        )
        return {
            **result,
            "items": [serialize_task(task) for task in result["items"]]
        }
    except ValueError as e:
        message = str(e)
        if "not found" in message.lower():
            raise HTTPException(status_code=404, detail=message)
        raise HTTPException(status_code=400, detail=message)


@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        task = task_service.get_task(db, task_id, current_user)
        return serialize_task(task)
    except ValueError as e:
        message = str(e)
        if "authorized" in message.lower():
            raise HTTPException(status_code=403, detail=message)
        if "not found" in message.lower():
            raise HTTPException(status_code=404, detail=message)
        raise HTTPException(status_code=400, detail=message)


@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    payload: TaskUpdate,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        task_service.update_task(db, task_id, payload, current_user)
        task = task_repo.get_by_id(db, task_id)
        return serialize_task(task)
    except ValueError as e:
        message = str(e)
        if "authorized" in message.lower():
            raise HTTPException(status_code=403, detail=message)
        if "not found" in message.lower():
            raise HTTPException(status_code=404, detail=message)
        raise HTTPException(status_code=400, detail=message)


@router.delete("/{task_id}", status_code=200)
def delete_task(
    task_id: int,
    db: Session = Depends(get_db),
    current_user=Depends(get_current_user)
):
    try:
        task_service.delete_task(db, task_id, current_user)
        return {"message": "Task deleted successfully"}
    except ValueError as e:
        message = str(e)
        if "authorized" in message.lower():
            raise HTTPException(status_code=403, detail=message)
        if "not found" in message.lower():
            raise HTTPException(status_code=404, detail=message)
        raise HTTPException(status_code=400, detail=message)