from datetime import datetime, date
from app.models import Task


class TaskService:
    def __init__(self, task_repo, user_repo):
        self.task_repo = task_repo
        self.user_repo = user_repo

    def create_task(self, db, payload, current_user):
        """
        Create a new task.
        Rules:
        - title is required
        - status must be valid
        - assigned user must exist (if provided)
        - created_by is always current logged-in user
        """

        valid_statuses = ["pending", "in_progress", "completed"]

        if not payload.title or not payload.title.strip():
            raise ValueError("Task title is required")

        if payload.status not in valid_statuses:
            raise ValueError("Invalid task status")

        assigned_user = None
        if payload.assigned_user_id:
            assigned_user = self.user_repo.get_by_id(db, payload.assigned_user_id)
            if not assigned_user:
                raise ValueError("Assigned user not found")

        due_date_value = payload.due_date
        if isinstance(due_date_value, date) and not isinstance(due_date_value, datetime):
            due_date_value = datetime.combine(due_date_value, datetime.min.time())

        task = Task(
            title=payload.title.strip(),
            description=payload.description.strip() if payload.description else None,
            status=payload.status or "pending",
            assigned_user_id=payload.assigned_user_id,
            due_date=due_date_value,
            created_by=current_user.id
        )

        return self.task_repo.create(db, task)

    def get_tasks(self, db, page, page_size, status, assigned_user_id, current_user):
        """
        Get paginated tasks.
        Users can only see:
        - tasks created by them
        OR
        - tasks assigned to them
        """

        valid_statuses = ["pending", "in_progress", "completed"]

        if status and status not in valid_statuses:
            raise ValueError("Invalid task status filter")

        if assigned_user_id:
            assigned_user = self.user_repo.get_by_id(db, assigned_user_id)
            if not assigned_user:
                raise ValueError("Assigned user not found")

        return self.task_repo.get_all(
            db=db,
            page=page,
            page_size=page_size,
            status=status,
            assigned_user_id=assigned_user_id,
            current_user_id=current_user.id
        )

    def get_task(self, db, task_id, current_user):
        """
        Get a single task by ID.
        User can only access if:
        - they created it
        OR
        - it is assigned to them
        """

        task = self.task_repo.get_by_id(db, task_id)
        if not task:
            raise ValueError("Task not found")

        if task.created_by != current_user.id and task.assigned_user_id != current_user.id:
            raise ValueError("You are not authorized to view this task")

        return task

    def update_task(self, db, task_id, payload, current_user):
        """
        Update a task.
        Only creator can update.
        """

        valid_statuses = ["pending", "in_progress", "completed"]

        task = self.task_repo.get_by_id(db, task_id)
        if not task:
            raise ValueError("Task not found")

        if task.created_by != current_user.id:
            raise ValueError("You are not authorized to update this task")

        if payload.title is not None:
            if not payload.title.strip():
                raise ValueError("Task title cannot be empty")
            task.title = payload.title.strip()

        if payload.description is not None:
            task.description = payload.description.strip() if payload.description else None

        if payload.status is not None:
            if payload.status not in valid_statuses:
                raise ValueError("Invalid task status")
            task.status = payload.status

        if payload.assigned_user_id is not None:
            if payload.assigned_user_id:
                assigned_user = self.user_repo.get_by_id(db, payload.assigned_user_id)
                if not assigned_user:
                    raise ValueError("Assigned user not found")
            task.assigned_user_id = payload.assigned_user_id

        if payload.due_date is not None:
            due_date_value = payload.due_date
            if isinstance(due_date_value, date) and not isinstance(due_date_value, datetime):
                due_date_value = datetime.combine(due_date_value, datetime.min.time())
            task.due_date = due_date_value

        return self.task_repo.update(db, task)

    def delete_task(self, db, task_id, current_user):
        """
        Delete a task.
        Only creator can delete.
        """

        task = self.task_repo.get_by_id(db, task_id)
        if not task:
            raise ValueError("Task not found")

        if task.created_by != current_user.id:
            raise ValueError("You are not authorized to delete this task")

        return self.task_repo.delete(db, task)
    

    