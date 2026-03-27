import { useEffect, useState, useCallback, useRef } from "react";
import Navbar from "../components/Navbar";
import TaskForm from "../components/TaskForm";
import TaskTable from "../components/TaskTable";
import { useAuth } from "../context/AuthContext";
import { getTasks, createTask, updateTask, deleteTask } from "../api/tasks";
import { getUsers } from "../api/users";
import "../styles/dashboard.css";

// ─── Constants ────────────────────────────────────────────────
const DEFAULT_FILTERS = {
  status: "",
  assigned_user_id: "",
  page: 1,
  page_size: 4,
};

const STATUS_OPTIONS = [
  { value: "",            label: "All Statuses" },
  { value: "pending",     label: "⏳ Pending" },
  { value: "in_progress", label: "🔄 In Progress" },
  { value: "completed",   label: "✅ Completed" },
];

// ─── Ring constants ───────────────────────────────────────────
const RING_RADIUS = 34;
const RING_CIRCUMFERENCE = 2 * Math.PI * RING_RADIUS;
const TICK_COUNT = 24;

function arcOffset(pct) {
  return RING_CIRCUMFERENCE - (pct / 100) * RING_CIRCUMFERENCE;
}

// ─── DonutRing ────────────────────────────────────────────────
function DonutRing({ pct, value, label, cellClass, animated }) {
  const offset = animated ? arcOffset(pct) : RING_CIRCUMFERENCE;

  const ticks = Array.from({ length: TICK_COUNT }, (_, i) => {
    const angle = (i / TICK_COUNT) * 360;
    const rad   = (angle * Math.PI) / 180;
    const x1 = (45 + 38 * Math.cos(rad)).toFixed(1);
    const y1 = (45 + 38 * Math.sin(rad)).toFixed(1);
    const x2 = (45 + 42 * Math.cos(rad)).toFixed(1);
    const y2 = (45 + 42 * Math.sin(rad)).toFixed(1);
    return <line key={i} className="ring-tick" x1={x1} y1={y1} x2={x2} y2={y2} />;
  });

  return (
    <div className={`donut-cell ${cellClass}`}>
      <div className="ring-wrap">
        <svg
          className="ring-svg"
          width="90"
          height="90"
          viewBox="0 0 90 90"
          aria-hidden="true"
        >
          {ticks}
          <circle className="ring-track" cx="45" cy="45" r={RING_RADIUS} />
          <circle
            className="ring-fill"
            cx="45"
            cy="45"
            r={RING_RADIUS}
            strokeDasharray={RING_CIRCUMFERENCE.toFixed(2)}
            strokeDashoffset={offset.toFixed(2)}
          />
        </svg>
        <div className="ring-center">
          <span className="ring-value">{value}</span>
          <span className="ring-pct">{pct}%</span>
        </div>
      </div>
      <div className="stat-label">{label}</div>
    </div>
  );
}

// ─── StatsBar ─────────────────────────────────────────────────
function StatsBar({ tasks, total }) {
  const [animated, setAnimated] = useState(false);

  const pending    = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed  = tasks.filter((t) => t.status === "completed").length;

  const safe      = total || 1;
  const donePct   = +((completed  / safe) * 100).toFixed(1);
  const progPct   = +((inProgress / safe) * 100).toFixed(1);
  const pendPct   = +((pending    / safe) * 100).toFixed(1);

  useEffect(() => {
    const id = setTimeout(() => setAnimated(true), 120);
    return () => clearTimeout(id);
  }, []);

  const cells = [
    { cellClass: "cell-total",    label: "Total",       value: total,       pct: 100      },
    { cellClass: "cell-pending",  label: "Pending",     value: pending,     pct: Math.round(pendPct)  },
    { cellClass: "cell-progress", label: "In Progress", value: inProgress,  pct: Math.round(progPct)  },
    { cellClass: "cell-done",     label: "Completed",   value: completed,   pct: Math.round(donePct)  },
  ];

  return (
    <div className="stats-section">
      {/* ── Donut rings ── */}
      <div className="donut-grid">
        {cells.map((c) => (
          <DonutRing key={c.cellClass} {...c} animated={animated} />
        ))}
      </div>

      {/* ── Activity bar ── */}
      <div className="activity-strip">
        <span className="activity-label">Distribution</span>
        <div className="activity-bar" role="img" aria-label="Task distribution bar">
          <div
            className="activity-segment seg-done"
            style={{ width: animated ? donePct + "%" : "0%" }}
          />
          <div
            className="activity-segment seg-progress"
            style={{
              width: animated ? progPct + "%" : "0%",
              left:  animated ? donePct + "%" : "0%",
            }}
          />
          <div
            className="activity-segment seg-pending"
            style={{
              width: animated ? pendPct + "%" : "0%",
              left:  animated ? (donePct + progPct) + "%" : "0%",
            }}
          />
        </div>
        <div className="activity-legend">
          <div className="legend-item">
            <div className="legend-dot done" />
            <span>Done</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot progress" />
            <span>Active</span>
          </div>
          <div className="legend-item">
            <div className="legend-dot pending" />
            <span>Waiting</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── SparkLine ────────────────────────────────────────────────
function SparkLine({ data, color }) {
  const W = 80, H = 28;
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const range = mx - mn || 1;

  const pts = data.map((v, i) => {
    const x = ((i / (data.length - 1)) * W).toFixed(1);
    const y = (H - ((v - mn) / range) * (H - 4) - 2).toFixed(1);
    return `${x},${y}`;
  });
  const linePath = "M" + pts.join("L");
  const areaPath = linePath + ` L${W},${H} L0,${H} Z`;
  const last = pts[pts.length - 1].split(",");

  const gradId = `sg-${color.replace("#", "")}`;

  return (
    <svg
      className="spark-svg"
      viewBox={`0 0 ${W} ${H}`}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%"   stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0"    />
        </linearGradient>
      </defs>
      <path d={areaPath} fill={`url(#${gradId})`} />
      <path
        d={linePath}
        fill="none"
        stroke={color}
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
      />
      <circle cx={last[0]} cy={last[1]} r="2.5" fill={color} />
    </svg>
  );
}

// ─── SparkRow ─────────────────────────────────────────────────
const SPARK_DATA = [
  { label: "Total",   color: "#818cf8", data: [14,16,17,19,18,21,24], delta: "+5",  dir: "up"   },
  { label: "Pending", color: "#fbbf24", data: [10,9,8,7,8,6,6],       delta: "-2",  dir: "down" },
  { label: "Active",  color: "#818cf8", data: [3,4,6,5,7,8,9],        delta: "+4",  dir: "up"   },
  { label: "Done",    color: "#34d399", data: [3,5,5,7,6,7,9],        delta: "+3",  dir: "up"   },
];

function SparkRow({ tasks, total }) {
  const pending    = tasks.filter((t) => t.status === "pending").length;
  const inProgress = tasks.filter((t) => t.status === "in_progress").length;
  const completed  = tasks.filter((t) => t.status === "completed").length;

  const live = [total, pending, inProgress, completed];

  return (
    <div className="sparkline-row">
      {SPARK_DATA.map((s, i) => {
        const dirClass =
          s.dir === "up" ? "delta-up" : s.dir === "down" ? "delta-down" : "delta-neu";
        const arrow = s.dir === "up" ? "↑" : s.dir === "down" ? "↓" : "→";
        return (
          <div key={s.label} className="spark-cell">
            <div className="spark-top">
              <div>
                <div className="spark-label">{s.label}</div>
                <div className="spark-val" style={{ color: s.color }}>
                  {live[i]}
                </div>
              </div>
              <span className={`spark-delta ${dirClass}`}>
                {arrow} {s.delta}
              </span>
            </div>
            <SparkLine data={s.data} color={s.color} />
          </div>
        );
      })}
    </div>
  );
}

// ─── FilterBar ────────────────────────────────────────────────
function FilterBar({ filters, users, onChange }) {
  const hasActiveFilters = filters.status || filters.assigned_user_id;

  return (
    <div className="filter-bar">
      <div className="filter-group">
        <label className="filter-label">Status</label>
        <select
          className="filter-select"
          value={filters.status}
          onChange={(e) => onChange({ status: e.target.value, page: 1 })}
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label className="filter-label">Assignee</label>
        <select
          className="filter-select"
          value={filters.assigned_user_id}
          onChange={(e) =>
            onChange({ assigned_user_id: e.target.value, page: 1 })
          }
        >
          <option value="">All Users</option>
          {users.map((user) => (
            <option key={user.id} value={user.id}>
              {user.name}
            </option>
          ))}
        </select>
      </div>

      {hasActiveFilters && (
        <button
          className="filter-clear"
          onClick={() =>
            onChange({ status: "", assigned_user_id: "", page: 1 })
          }
        >
          ✕ Clear
        </button>
      )}
    </div>
  );
}

// ─── ErrorBanner ─────────────────────────────────────────────
function ErrorBanner({ message, onDismiss }) {
  if (!message) return null;
  return (
    <div className="error-banner" role="alert">
      <span className="error-icon">⚠</span>
      <span className="error-text">{message}</span>
      <button
        className="error-dismiss"
        onClick={onDismiss}
        aria-label="Dismiss error"
      >
        ✕
      </button>
    </div>
  );
}

// ─── LoadingSkeleton ──────────────────────────────────────────
function LoadingSkeleton({ rows = 5 }) {
  return (
    <div className="skeleton-wrapper" aria-label="Loading tasks…">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="skeleton-row"
          style={{ animationDelay: `${i * 60}ms` }}
        />
      ))}
    </div>
  );
}

// ─── Pagination ───────────────────────────────────────────────
function Pagination({ page, totalPages, onChange }) {
  const pages       = Array.from({ length: totalPages }, (_, i) => i + 1);
  const showEllipsis = totalPages > 7;

  const visiblePages = showEllipsis
    ? [
        ...pages.slice(0, 2),
        ...(page > 4 ? ["…"] : []),
        ...pages.slice(
          Math.max(2, page - 1),
          Math.min(totalPages - 2, page + 2)
        ),
        ...(page < totalPages - 3 ? ["…"] : []),
        ...pages.slice(-2),
      ]
    : pages;

  return (
    <nav className="pagination" aria-label="Task pagination">
      <button
        className="page-btn page-prev"
        disabled={page === 1}
        onClick={() => onChange(page - 1)}
        aria-label="Previous page"
      >
        ← Prev
      </button>

      <div className="page-numbers">
        {visiblePages.map((p, i) =>
          p === "…" ? (
            <span key={`ellipsis-${i}`} className="page-ellipsis">
              …
            </span>
          ) : (
            <button
              key={p}
              className={`page-num ${p === page ? "active" : ""}`}
              onClick={() => onChange(p)}
              aria-current={p === page ? "page" : undefined}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        className="page-btn page-next"
        disabled={page >= totalPages}
        onClick={() => onChange(page + 1)}
        aria-label="Next page"
      >
        Next →
      </button>
    </nav>
  );
}

// ─── Main Component ───────────────────────────────────────────
function DashboardPage() {
  const { token } = useAuth();

  const [tasks,       setTasks]       = useState([]);
  const [users,       setUsers]       = useState([]);
  const [editingTask, setEditingTask] = useState(null);
  const [filters,     setFilters]     = useState(DEFAULT_FILTERS);
  const [pagination,  setPagination]  = useState({ total: 0, total_pages: 1 });
  const [loading,     setLoading]     = useState(false);
  const [error,       setError]       = useState("");
  const [formVisible, setFormVisible] = useState(false);

  // ── Fetchers ──
  const fetchUsers = useCallback(async () => {
    try {
      const data = await getUsers(token);
      setUsers(data);
    } catch (err) {
      console.error("Failed to fetch users", err);
    }
  }, [token]);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const params = {
        page:      filters.page,
        page_size: filters.page_size,
        ...(filters.status           && { status:           filters.status }),
        ...(filters.assigned_user_id && { assigned_user_id: filters.assigned_user_id }),
      };
      const data = await getTasks(token, params);
      setTasks(data.items || []);
      setPagination({
        total:       data.total       || 0,
        total_pages: data.total_pages || 1,
      });
    } catch (err) {
      setError(err.response?.data?.detail || "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [token, filters]);

  // ── Effects ──
  useEffect(() => { fetchUsers(); }, [fetchUsers]);
  useEffect(() => { fetchTasks(); }, [fetchTasks]);

  // ── Handlers ──
  const handleFilterChange = (patch) =>
    setFilters((prev) => ({ ...prev, ...patch }));

  const handlePageChange = (page) =>
    setFilters((prev) => ({ ...prev, page }));

  const handleEdit = (task) => {
    setEditingTask(task);
    setFormVisible(true);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCancelEdit = () => {
    setEditingTask(null);
    setFormVisible(false);
  };

  const handleCreateOrUpdate = async (payload) => {
    try {
      if (editingTask) {
        await updateTask(token, editingTask.id, payload);
        setEditingTask(null);
      } else {
        await createTask(token, payload);
      }
      setFormVisible(false);
      setTasks([]);
      setLoading(true);
      await fetchTasks();
    } catch (err) {
      setError(err.response?.data?.detail || "Task operation failed");
    }
  };

  const handleDelete = async (taskId) => {
    if (!window.confirm("Permanently delete this task?")) return;
    try {
      await deleteTask(token, taskId);
      if (tasks.length === 1 && filters.page > 1) {
        setFilters((prev) => ({ ...prev, page: prev.page - 1 }));
      } else {
        await fetchTasks();
      }
    } catch (err) {
      setError(err.response?.data?.detail || "Delete failed");
    }
  };

  const isEditing = Boolean(editingTask);

  return (
    <div className="dashboard-page">
      <Navbar />

      <main className="dashboard-container">

        {/* ── Left Panel: Form ── */}
        <aside className={`left-panel ${formVisible || isEditing ? "panel-open" : ""}`}>
          <div className="panel-header">
            <h2 className="panel-title">
              {isEditing ? "Edit Task" : "New Task"}
            </h2>
            {!formVisible && !isEditing && (
              <button
                className="btn-toggle-form"
                onClick={() => setFormVisible(true)}
              >
                + Add Task
              </button>
            )}
          </div>

          <div className={`form-collapse ${formVisible || isEditing ? "form-open" : ""}`}>
            <TaskForm
              users={users}
              onSubmit={handleCreateOrUpdate}
              initialData={editingTask}
              onCancel={handleCancelEdit}
            />
          </div>
        </aside>

        {/* ── Right Panel: Table ── */}
        <section className="right-panel">

          {/* Header */}
          <div className="panel-header">
            <div>
              <h1 className="section-title">Tasks</h1>
              <p className="section-sub">
                {pagination.total} task{pagination.total !== 1 ? "s" : ""} total
              </p>
            </div>
          </div>

          {/* Animated Stats */}
          <StatsBar tasks={tasks} total={pagination.total} />

          {/* Sparklines */}
          <SparkRow tasks={tasks} total={pagination.total} />

          {/* Filters */}
          <FilterBar
            filters={filters}
            users={users}
            onChange={handleFilterChange}
          />

          {/* Error */}
          <ErrorBanner message={error} onDismiss={() => setError("")} />

          {/* Table or skeleton */}
          {loading ? (
            <LoadingSkeleton rows={filters.page_size} />
          ) : (
            <TaskTable
              tasks={tasks}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          )}

          {/* Pagination */}
          {!loading && pagination.total_pages > 1 && (
            <Pagination
              page={filters.page}
              totalPages={pagination.total_pages}
              onChange={handlePageChange}
            />
          )}

        </section>
      </main>
    </div>
  );
}

export default DashboardPage;
