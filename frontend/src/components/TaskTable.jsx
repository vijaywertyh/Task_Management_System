import "../styles/table.css";

function TaskTable({ tasks, onEdit, onDelete }) {
  return (
    <div className="table-wrapper">
      <table className="task-table">
        <thead>
          <tr>
            <th>Title</th>
            <th>Status</th>
            <th>Assigned User</th>
            <th>Due Date</th>
            <th>Created At</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {tasks.length > 0 ? (
            tasks.map((task) => (
              <tr key={task.id}>
                <td>{task.title}</td>
                <td>{task.status}</td>
                <td>{task.assigned_user_name || "Unassigned"}</td>
                <td>{task.due_date ? task.due_date.slice(0, 10) : "-"}</td>
                <td>{task.created_at ? task.created_at.slice(0, 10) : "-"}</td>
                <td>
                  <button className="edit-btn" onClick={() => onEdit(task)}>
                    Edit
                  </button>
                  <button className="delete-btn" onClick={() => onDelete(task.id)}>
                    Delete
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" className="empty-row">
                No tasks found
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

export default TaskTable;