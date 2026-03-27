import { useEffect, useState } from "react";
import "../styles/form.css";

const EMPTY_STATE = {
  title: "",
  description: "",
  status: "pending",
  assigned_user_id: "",
  due_date: "",
};

function TaskForm({ onSubmit, users, initialData, onCancel }) {
  const [formData, setFormData] = useState(EMPTY_STATE);

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || "",
        description: initialData.description || "",
        status: initialData.status || "pending",
        assigned_user_id: initialData.assigned_user_id || "",
        due_date: initialData.due_date ? initialData.due_date.slice(0, 10) : "",
      });
    } else {
      // If initialData is null, we force the form back to EMPTY
      setFormData(EMPTY_STATE);
    }
  }, [initialData]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "assigned_user_id" && value ? Number(value) : value,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      assigned_user_id: formData.assigned_user_id || null,
      due_date: formData.due_date || null,
    });
  };

  return (
    <div className="form-card">
      <h2>{initialData ? "Update Your Task" : "Create New Task"}</h2>
      <form onSubmit={handleSubmit} className="task-form">
        <input
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />
        <textarea
          name="description"
          placeholder="Description"
          value={formData.description}
          onChange={handleChange}
        />
        <select name="status" value={formData.status} onChange={handleChange}>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select name="assigned_user_id" value={formData.assigned_user_id} onChange={handleChange}>
          <option value="">Assign User</option>
          {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
        </select>
        <input type="date" name="due_date" value={formData.due_date} onChange={handleChange} />
        
        <div className="form-actions">
          <button type="submit" className="primary-btn">Save</button>
          <button type="button" className="secondary-btn" onClick={onCancel}>Cancel</button>
        </div>
      </form>
    </div>
  );
}
export default TaskForm;