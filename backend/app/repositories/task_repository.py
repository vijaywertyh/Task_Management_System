from sqlalchemy import or_
from app.models import Task


class TaskRepository:
    def create(self, db, task):
        db.add(task)
        db.commit()
        db.refresh(task)
        return task

    def get_by_id(self, db, task_id):
        return db.query(Task).filter(Task.id == task_id).first()

    def get_all(self, db, page=1, page_size=10, status=None, assigned_user_id=None, current_user_id=None):
        query = db.query(Task)

        # User can only see:
        # - tasks they created
        # - tasks assigned to them
        if current_user_id:
            query = query.filter(
                or_(
                    Task.created_by == current_user_id,
                    Task.assigned_user_id == current_user_id
                )
            )

        if status:
            query = query.filter(Task.status == status)

        if assigned_user_id:
            query = query.filter(Task.assigned_user_id == assigned_user_id)

        total = query.count()

        items = (
            query.order_by(Task.created_at.desc())
            .offset((page - 1) * page_size)
            .limit(page_size)
            .all()
        )

        return {
            "items": items,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": (total + page_size - 1) // page_size
        }

    def update(self, db, task):
        db.commit()
        db.refresh(task)
        return task

    def delete(self, db, task):
        db.delete(task)
        db.commit()
        return True