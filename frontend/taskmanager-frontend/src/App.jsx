
import { useEffect, useState } from "react";
import {
  Plus,
  CalendarDays,
  CheckCircle2,
  Clock3,
  ListTodo,
  Pencil,
  Trash2,
  X,
  LockKeyhole,
  Mail,
  User,
  LogIn,
  UserPlus,
  AlertCircle,
} from "lucide-react";

import Sidebar from "./components/Sidebar";
import Navbar from "./components/Navbar";
import api from "./api";

function App() {
  const [username, setUsername] = useState(
    localStorage.getItem("username") || ""
  );

  const [activePage, setActivePage] = useState("Dashboard");
  const [searchTerm, setSearchTerm] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);

  const [showForm, setShowForm] = useState(false);
  const [editId, setEditId] = useState(null);
  const [saving, setSaving] = useState(false);

  const [authMode, setAuthMode] = useState("login");
  const [authLoading, setAuthLoading] = useState(false);

  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const [authForm, setAuthForm] = useState({
    username: "",
    email: "",
    password: "",
  });

  const [form, setForm] = useState({
    title: "",
    description: "",
    dueDate: "",
  });

  // AUTO HIDE SUCCESS AND ERROR MESSAGES
  useEffect(() => {
    if (!notice && !error) return;

    const timer = setTimeout(() => {
      setNotice("");
      setError("");
    }, 3000);

    return () => clearTimeout(timer);
  }, [notice, error]);

  // ERROR MESSAGE
  const getErrorMessage = (err, fallback) => {
    console.error("API ERROR:", err);

    const data = err.response?.data;

    if (typeof data === "string") {
      return data;
    }

    if (data?.message) {
      return data.message;
    }

    if (data?.error) {
      return data.error;
    }

    if (err.response) {
      return `Server error: ${err.response.status}`;
    }

    return fallback;
  };

  // LOAD TASKS FROM SPRING BOOT
  const fetchTasks = async () => {
    if (!username) return;

    try {
      setLoading(true);

      const response = await api.get("/tasks", {
        params: { username },
      });

      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Tasks load nahi hue. Backend aur API check karo."
        )
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (username) {
      fetchTasks();
    }
  }, [username]);

  // LOGIN / REGISTER
  const handleAuth = async (e) => {
    e.preventDefault();

    setError("");
    setNotice("");
    setAuthLoading(true);

    try {
      const enteredUsername = authForm.username.trim();

      if (authMode === "register") {
        await api.post("/register", {
          username: enteredUsername,
          email: authForm.email.trim(),
          password: authForm.password,
        });

        setNotice("Registration successful! Please login.");
        setAuthMode("login");

        setAuthForm({
          username: enteredUsername,
          email: "",
          password: "",
        });
      } else {
        const response = await api.post("/login", {
          username: enteredUsername,
          password: authForm.password,
        });

        const loggedInUsername =
          response.data?.username || enteredUsername;

        localStorage.setItem("username", loggedInUsername);

        setUsername(loggedInUsername);
        setNotice("Login successful! Welcome to TaskFlow.");
        setError("");
      }
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Login/Register failed. Backend port 8080 check karo."
        )
      );
    } finally {
      setAuthLoading(false);
    }
  };

  // LOGOUT
  const handleLogout = () => {
    localStorage.removeItem("username");

    setUsername("");
    setTasks([]);
    setActivePage("Dashboard");
    setSearchTerm("");

    setAuthForm({
      username: "",
      email: "",
      password: "",
    });

    setError("");
    setNotice("");
  };

  // ADD TASK FORM
  const openAddForm = () => {
    setEditId(null);
    setError("");
    setNotice("");

    setForm({
      title: "",
      description: "",
      dueDate: "",
    });

    setShowForm(true);
  };

  // EDIT TASK FORM
  const openEditForm = (task) => {
    setEditId(task.id);
    setError("");
    setNotice("");

    setForm({
      title: task.title || "",
      description: task.description || "",
      dueDate: task.dueDate || "",
    });

    setShowForm(true);
  };

  // SAVE TASK TO BACKEND
  const saveTask = async (e) => {
    e.preventDefault();

    setError("");
    setNotice("");

    if (form.title.trim().length < 3) {
      setError("Title must contain at least 3 characters.");
      return;
    }

    if (form.title.trim().length > 100) {
      setError("Title cannot contain more than 100 characters.");
      return;
    }

    const isEditing = editId !== null;

    const existingTask = tasks.find(
      (task) => task.id === editId
    );

    const taskData = {
      username,
      title: form.title.trim(),
      description: form.description.trim(),
      dueDate: form.dueDate || null,
      completed: existingTask
        ? Boolean(existingTask.completed)
        : false,
    };

    try {
      setSaving(true);

      if (isEditing) {
        await api.put(`/tasks/${editId}`, taskData, {
          params: { username },
        });
      } else {
        await api.post("/tasks", taskData);
      }

      setShowForm(false);
      setEditId(null);

      setForm({
        title: "",
        description: "",
        dueDate: "",
      });

      await fetchTasks();

      setNotice(
        isEditing
          ? "Task updated successfully!"
          : "Task added successfully!"
      );
    } catch (err) {
      setError(
        getErrorMessage(
          err,
          "Task save nahi hua. Backend controller check karo."
        )
      );
    } finally {
      setSaving(false);
    }
  };

  // DELETE TASK - NO CONFIRM POPUP
  const deleteTask = async (id) => {
    setError("");
    setNotice("");

    try {
      await api.delete(`/tasks/${id}`, {
        params: { username },
      });

      await fetchTasks();

      setNotice("Task deleted successfully!");
    } catch (err) {
      setError(
        getErrorMessage(err, "Task delete nahi hua.")
      );
    }
  };

  // TOGGLE COMPLETED / PENDING
  const toggleTask = async (task) => {
    setError("");
    setNotice("");

    try {
      await api.put(
        `/tasks/${task.id}`,
        {
          username,
          title: task.title,
          description: task.description || "",
          dueDate: task.dueDate || null,
          completed: !task.completed,
        },
        {
          params: { username },
        }
      );

      await fetchTasks();

      setNotice(
        task.completed
          ? "Task moved to Pending!"
          : "Task marked as Completed!"
      );
    } catch (err) {
      setError(
        getErrorMessage(err, "Task status update nahi hua.")
      );
    }
  };

  // STATISTICS
  const completed = tasks.filter(
    (task) => task.completed
  ).length;

  const pending = tasks.length - completed;

  // SEARCH + PAGE FILTER
  const filteredTasks = tasks.filter((task) => {
    const matchesPage =
      activePage === "Completed"
        ? task.completed
        : activePage === "Pending"
        ? !task.completed
        : true;

    const search = searchTerm.toLowerCase().trim();

    const matchesSearch =
      (task.title || "").toLowerCase().includes(search) ||
      (task.description || "").toLowerCase().includes(search);

    return matchesPage && matchesSearch;
  });

  // LOGIN / REGISTER SCREEN
  if (!username) {
    return (
      <div className="auth-page">
        <div className="auth-card">
          <div className="auth-brand">
            <div className="auth-logo">
              <ListTodo size={29} />
            </div>

            <h1>
              Task<span>Flow</span>
            </h1>
          </div>

          <p className="auth-eyebrow">
            YOUR PERSONAL WORKSPACE
          </p>

          <h2>
            {authMode === "login"
              ? "Welcome back!"
              : "Create your account"}
          </h2>

          <p className="auth-subtitle">
            {authMode === "login"
              ? "Login to manage your daily tasks."
              : "Register and start organizing your work."}
          </p>

          {notice && (
            <div className="success-message">
              <CheckCircle2 size={18} />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div className="auth-error">
              <AlertCircle size={18} />
              <span>{String(error)}</span>
            </div>
          )}

          <form onSubmit={handleAuth} className="auth-form">
            <label>Username</label>

            <div className="auth-input">
              <User size={19} />

              <input
                type="text"
                required
                value={authForm.username}
                placeholder="Enter username"
                onChange={(e) =>
                  setAuthForm({
                    ...authForm,
                    username: e.target.value,
                  })
                }
              />
            </div>

            {authMode === "register" && (
              <>
                <label>Email Address</label>

                <div className="auth-input">
                  <Mail size={19} />

                  <input
                    type="email"
                    required
                    value={authForm.email}
                    placeholder="Enter email"
                    onChange={(e) =>
                      setAuthForm({
                        ...authForm,
                        email: e.target.value,
                      })
                    }
                  />
                </div>
              </>
            )}

            <label>Password</label>

            <div className="auth-input">
              <LockKeyhole size={19} />

              <input
                type="password"
                required
                minLength={6}
                value={authForm.password}
                placeholder="Enter password"
                onChange={(e) =>
                  setAuthForm({
                    ...authForm,
                    password: e.target.value,
                  })
                }
              />
            </div>

            <button
              type="submit"
              className="auth-submit"
              disabled={authLoading}
            >
              {authLoading ? (
                "Please wait..."
              ) : authMode === "login" ? (
                <>
                  <LogIn size={19} /> Login
                </>
              ) : (
                <>
                  <UserPlus size={19} /> Create Account
                </>
              )}
            </button>
          </form>

          <p className="auth-switch">
            {authMode === "login"
              ? "Don't have an account?"
              : "Already have an account?"}

            <button
              type="button"
              onClick={() => {
                setError("");
                setNotice("");

                setAuthMode(
                  authMode === "login" ? "register" : "login"
                );
              }}
            >
              {authMode === "login" ? " Register" : " Login"}
            </button>
          </p>
        </div>
      </div>
    );
  }

  // DASHBOARD STATISTICS
  const statCards = [
    {
      title: "Total Tasks",
      count: tasks.length,
      icon: ListTodo,
      color: "purple",
    },
    {
      title: "Completed",
      count: completed,
      icon: CheckCircle2,
      color: "green",
    },
    {
      title: "Pending",
      count: pending,
      icon: Clock3,
      color: "orange",
    },
  ];

  // MAIN DASHBOARD
  return (
    <div className="app-layout">
      <Sidebar
        activePage={activePage}
        onNavigate={(page) => {
          setActivePage(page);
          setSearchTerm("");
          setError("");
          setNotice("");
        }}
        onLogout={handleLogout}
      />

      <main className="main-content">
        <Navbar
          activePage={activePage}
          searchTerm={searchTerm}
          onSearch={setSearchTerm}
          username={username}
        />

        <div className="dashboard-content">
          {notice && (
            <div className="success-message">
              <CheckCircle2 size={18} />
              <span>{notice}</span>
            </div>
          )}

          {error && (
            <div className="error-message">
              <AlertCircle size={18} />
              <span>{String(error)}</span>
            </div>
          )}

          {activePage === "Dashboard" && (
            <>
              <section className="welcome-banner">
                <div>
                  <p className="welcome-label">
                    YOUR PERSONAL WORKSPACE
                  </p>

                  <h1>Welcome back, {username}!</h1>

                  <p className="welcome-description">
                    Let's make today productive. Every task
                    completed brings you closer to your goals.
                  </p>

                  <button
                    className="welcome-button"
                    onClick={openAddForm}
                  >
                    <Plus size={19} /> Create New Task
                  </button>
                </div>

                <div className="banner-decoration">✦</div>
              </section>

              <section className="stats-grid">
                {statCards.map((stat) => {
                  const Icon = stat.icon;

                  return (
                    <div className="stat-card" key={stat.title}>
                      <div>
                        <p>{stat.title}</p>
                        <h2>{stat.count}</h2>
                      </div>

                      <div className={`stat-icon ${stat.color}`}>
                        <Icon size={27} />
                      </div>
                    </div>
                  );
                })}
              </section>
            </>
          )}

          <section className="task-section">
            <div className="task-heading">
              <div>
                <h2>
                  {activePage === "Dashboard"
                    ? "My Tasks"
                    : activePage}
                </h2>

                <p>
                  Manage your tasks and stay productive.
                </p>
              </div>

              <button
                className="add-task-button"
                onClick={openAddForm}
              >
                <Plus size={19} /> Add Task
              </button>
            </div>

            {loading ? (
              <div className="empty-state">
                Loading your tasks...
              </div>
            ) : filteredTasks.length > 0 ? (
              <div className="tasks-grid">
                {filteredTasks.map((task) => (
                  <article className="task-card" key={task.id}>
                    <div className="task-card-main">
                      <button
                        type="button"
                        className={`task-checkbox ${
                          task.completed ? "checked" : ""
                        }`}
                        onClick={() => toggleTask(task)}
                        title="Change status"
                      >
                        {task.completed && (
                          <CheckCircle2 size={19} />
                        )}
                      </button>

                      <div className="task-details">
                        <div className="task-title-row">
                          <div>
                            <h3
                              className={
                                task.completed
                                  ? "completed-title"
                                  : ""
                              }
                            >
                              {task.title}
                            </h3>

                            <p className="task-description">
                              {task.description || "No description"}
                            </p>
                          </div>

                          <span
                            className={`status-badge ${
                              task.completed
                                ? "status-completed"
                                : "status-pending"
                            }`}
                          >
                            {task.completed
                              ? "Completed"
                              : "Pending"}
                          </span>
                        </div>

                        <div className="task-footer">
                          <span className="due-date">
                            <CalendarDays size={17} />
                            {task.dueDate || "No due date"}
                          </span>

                          <div className="task-actions">
                            <button
                              type="button"
                              onClick={() => openEditForm(task)}
                              className="edit-button"
                              title="Edit"
                            >
                              <Pencil size={17} />
                            </button>

                            <button
                              type="button"
                              onClick={() => deleteTask(task.id)}
                              className="delete-button"
                              title="Delete"
                            >
                              <Trash2 size={17} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">
                  <ListTodo size={38} />
                </div>

                <h3>
                  {searchTerm
                    ? "No matching tasks found"
                    : "No tasks found"}
                </h3>

                <p>
                  {searchTerm
                    ? "Try searching with another keyword."
                    : "Add your first task to get started."}
                </p>

                {searchTerm ? (
                  <button
                    className="add-task-button"
                    onClick={() => setSearchTerm("")}
                  >
                    Clear Search
                  </button>
                ) : (
                  <button
                    className="add-task-button"
                    onClick={openAddForm}
                  >
                    <Plus size={18} /> Create Task
                  </button>
                )}
              </div>
            )}
          </section>
        </div>
      </main>

      {/* ADD / EDIT TASK MODAL */}
      {showForm && (
        <div
          className="modal-overlay"
          onClick={() => {
            if (!saving) {
              setShowForm(false);
              setError("");
            }
          }}
        >
          <div
            className="task-modal"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-heading">
              <div>
                <h2>
                  {editId !== null
                    ? "Edit Task"
                    : "Create New Task"}
                </h2>

                <p>Enter your task details.</p>
              </div>

              <button
                type="button"
                className="close-button"
                disabled={saving}
                onClick={() => {
                  setShowForm(false);
                  setError("");
                }}
              >
                <X size={21} />
              </button>
            </div>

            {error && (
              <div className="error-message">
                <AlertCircle size={18} />
                <span>{String(error)}</span>
              </div>
            )}

            <form onSubmit={saveTask}>
              <label>Task Title</label>

              <input
                type="text"
                required
                minLength={3}
                maxLength={100}
                value={form.title}
                placeholder="Enter task title"
                onChange={(e) =>
                  setForm({
                    ...form,
                    title: e.target.value,
                  })
                }
              />

              <label>Description</label>

              <textarea
                rows={4}
                maxLength={1000}
                value={form.description}
                placeholder="Describe your task..."
                onChange={(e) =>
                  setForm({
                    ...form,
                    description: e.target.value,
                  })
                }
              />

              <label>Due Date</label>

              <input
                type="date"
                value={form.dueDate}
                onChange={(e) =>
                  setForm({
                    ...form,
                    dueDate: e.target.value,
                  })
                }
              />

              <button
                type="submit"
                className="save-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : editId !== null
                  ? "Update Task"
                  : "Save Task"}
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
