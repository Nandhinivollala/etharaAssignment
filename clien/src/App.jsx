import { useEffect, useState } from 'react'
import './App.css'

const initialAuthForm = {
  name: '',
  email: '',
  password: '',
  role: 'Member',
}

const initialProjectForm = {
  name: '',
  description: '',
  status: 'Planning',
  teamMembers: [],
}

const initialTaskForm = {
  title: '',
  description: '',
  project: '',
  assignedTo: '',
  status: 'Todo',
  dueDate: '',
}

const emptySummary = {
  totalProjects: 0,
  totalTasks: 0,
  todoTasks: 0,
  inProgressTasks: 0,
  doneTasks: 0,
  overdueTasks: 0,
}

const API_URL = import.meta.env.VITE_API_URL || ''

function App() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialAuthForm)
  const [projectForm, setProjectForm] = useState(initialProjectForm)
  const [taskForm, setTaskForm] = useState(initialTaskForm)
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('pm_auth')
    return saved ? JSON.parse(saved) : null
  })
  const [apiStatus, setApiStatus] = useState('Not checked')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [summary, setSummary] = useState(emptySummary)
  const [projects, setProjects] = useState([])
  const [tasks, setTasks] = useState([])
  const [users, setUsers] = useState([])

  const isAdmin = auth?.user?.role === 'Admin'

  const request = async (path, options = {}) => {
    const response = await fetch(`${API_URL}${path}`, {
      headers: {
        'Content-Type': 'application/json',
        ...(auth?.token ? { Authorization: `Bearer ${auth.token}` } : {}),
        ...options.headers,
      },
      ...options,
    })

    const data = await response.json()

    if (!response.ok) {
      throw new Error(data.message || 'Request failed')
    }

    return data
  }

  const loadWorkspace = async () => {
    if (!auth) return

    const [summaryData, projectData, taskData, userData] = await Promise.all([
      request('/api/dashboard/summary'),
      request('/api/projects'),
      request('/api/tasks'),
      isAdmin ? request('/api/users?active=true') : Promise.resolve({ users: [] }),
    ])

    setSummary(summaryData.summary)
    setProjects(projectData.projects)
    setTasks(taskData.tasks)
    setUsers(userData.users)
  }

  useEffect(() => {
    if (!auth) return

    const token = auth.token

    Promise.all([
      fetch(`${API_URL}/api/dashboard/summary`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => response.json()),
      fetch(`${API_URL}/api/projects`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => response.json()),
      fetch(`${API_URL}/api/tasks`, {
        headers: { Authorization: `Bearer ${token}` },
      }).then((response) => response.json()),
      isAdmin
        ? fetch(`${API_URL}/api/users?active=true`, {
            headers: { Authorization: `Bearer ${token}` },
          }).then((response) => response.json())
        : Promise.resolve({ success: true, users: [] }),
    ])
      .then(([summaryData, projectData, taskData, userData]) => {
        if (!summaryData.success) throw new Error(summaryData.message)
        if (!projectData.success) throw new Error(projectData.message)
        if (!taskData.success) throw new Error(taskData.message)
        if (!userData.success) throw new Error(userData.message)

        setSummary(summaryData.summary)
        setProjects(projectData.projects)
        setTasks(taskData.tasks)
        setUsers(userData.users)
      })
      .catch((error) => setMessage(error.message))
  }, [auth, isAdmin])

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const updateProjectForm = (event) => {
    const { name, value } = event.target
    setProjectForm((current) => ({ ...current, [name]: value }))
  }

  const updateProjectMembers = (event) => {
    const selectedMembers = Array.from(
      event.target.selectedOptions,
      (option) => option.value,
    )

    setProjectForm((current) => ({
      ...current,
      teamMembers: selectedMembers,
    }))
  }

  const updateTaskForm = (event) => {
    const { name, value } = event.target
    setTaskForm((current) => ({ ...current, [name]: value }))
  }

  const submitAuth = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      const path = mode === 'login' ? '/api/auth/login' : '/api/auth/register'
      const payload =
        mode === 'login'
          ? { email: form.email, password: form.password }
          : form

      const data = await request(path, {
        method: 'POST',
        body: JSON.stringify(payload),
      })

      setAuth(data)
      localStorage.setItem('pm_auth', JSON.stringify(data))
      setMessage(`${mode === 'login' ? 'Login' : 'Registration'} successful`)
      setForm(initialAuthForm)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const createProject = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await request('/api/projects', {
        method: 'POST',
        body: JSON.stringify({
          ...projectForm,
        }),
      })
      setProjectForm(initialProjectForm)
      setMessage('Project created')
      await loadWorkspace()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const createTask = async (event) => {
    event.preventDefault()
    setLoading(true)
    setMessage('')

    try {
      await request('/api/tasks', {
        method: 'POST',
        body: JSON.stringify({
          ...taskForm,
          assignedTo: taskForm.assignedTo || auth.user.id,
        }),
      })
      setTaskForm(initialTaskForm)
      setMessage('Task created')
      await loadWorkspace()
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const updateTaskStatus = async (taskId, status) => {
    setMessage('')

    try {
      await request(`/api/tasks/${taskId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      await loadWorkspace()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const updateProjectStatus = async (projectId, status) => {
    setMessage('')

    try {
      await request(`/api/projects/${projectId}`, {
        method: 'PUT',
        body: JSON.stringify({ status }),
      })
      setMessage('Project status updated')
      await loadWorkspace()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const updateUserStatus = async (userId, isActive) => {
    setMessage('')

    try {
      await request(`/api/users/${userId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive }),
      })
      setMessage(isActive ? 'Member reactivated' : 'Member deactivated')
      await loadWorkspace()
    } catch (error) {
      setMessage(error.message)
    }
  }

  const testApi = async () => {
    setApiStatus('Checking...')

    try {
      const data = await request('/api/test')
      setApiStatus(data.message)
    } catch (error) {
      setApiStatus(error.message)
    }
  }

  const checkProfile = async () => {
    setLoading(true)
    setMessage('')

    try {
      const data = await request('/api/auth/me')
      setMessage(`Token valid for ${data.user.name}`)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setAuth(null)
    setProjects([])
    setTasks([])
    setUsers([])
    setSummary(emptySummary)
    localStorage.removeItem('pm_auth')
    setMessage('Logged out')
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Ethara Assignment</p>
          <h1>Team Task Manager</h1>
        </div>
        <button className="ghost-button" onClick={testApi} type="button">
          Test API
        </button>
      </section>

      <section className="status-strip">
        <span>Backend status</span>
        <strong>{apiStatus}</strong>
      </section>

      <section className="workspace">
        <aside className="auth-panel">
          {auth ? (
            <div className="profile">
              <p className="eyebrow">Signed in</p>
              <h2>{auth.user.name}</h2>
              <p>{auth.user.email}</p>
              <span className="role-badge">{auth.user.role}</span>
              <div className="button-row">
                <button onClick={checkProfile} type="button" disabled={loading}>
                  Verify Token
                </button>
                <button className="secondary-button" onClick={logout} type="button">
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={submitAuth}>
              <div className="segment">
                <button
                  className={mode === 'login' ? 'active' : ''}
                  onClick={() => setMode('login')}
                  type="button"
                >
                  Login
                </button>
                <button
                  className={mode === 'register' ? 'active' : ''}
                  onClick={() => setMode('register')}
                  type="button"
                >
                  Register
                </button>
              </div>

              {mode === 'register' && (
                <label>
                  Name
                  <input
                    name="name"
                    onChange={updateForm}
                    placeholder="Your name"
                    required
                    value={form.name}
                  />
                </label>
              )}

              <label>
                Email
                <input
                  name="email"
                  onChange={updateForm}
                  placeholder="you@example.com"
                  required
                  type="email"
                  value={form.email}
                />
              </label>

              <label>
                Password
                <input
                  minLength="6"
                  name="password"
                  onChange={updateForm}
                  placeholder="Minimum 6 characters"
                  required
                  type="password"
                  value={form.password}
                />
              </label>

              {mode === 'register' && (
                <label>
                  Role
                  <select name="role" onChange={updateForm} value={form.role}>
                    <option>Member</option>
                    <option>Admin</option>
                  </select>
                </label>
              )}

              <button disabled={loading} type="submit">
                {loading ? 'Please wait...' : mode === 'login' ? 'Login' : 'Create Account'}
              </button>
            </form>
          )}

          {message && <p className="message">{message}</p>}
        </aside>

        <section className="dashboard">
          <div className="dashboard-header">
            <div>
              <p className="eyebrow">Role-based view</p>
              <h2>{isAdmin ? 'Admin Dashboard' : 'Member Dashboard'}</h2>
            </div>
            <span>{summary.totalProjects} projects</span>
          </div>

          <div className="metrics">
            <div>
              <span>Total Tasks</span>
              <strong>{summary.totalTasks}</strong>
            </div>
            <div>
              <span>In Progress</span>
              <strong>{summary.inProgressTasks}</strong>
            </div>
            <div>
              <span>Overdue</span>
              <strong>{summary.overdueTasks}</strong>
            </div>
          </div>

          {isAdmin && (
            <div className="management-grid">
              <form className="manager-form" onSubmit={createProject}>
                <p className="eyebrow">Create project</p>
                <label>
                  Project name
                  <input
                    name="name"
                    onChange={updateProjectForm}
                    placeholder="Client launch"
                    required
                    value={projectForm.name}
                  />
                </label>
                <label>
                  Description
                  <input
                    name="description"
                    onChange={updateProjectForm}
                    placeholder="Project goal"
                    value={projectForm.description}
                  />
                </label>
                <label>
                  Team members
                  <select
                    multiple
                    name="teamMembers"
                    onChange={updateProjectMembers}
                    value={projectForm.teamMembers}
                  >
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Status
                  <select
                    name="status"
                    onChange={updateProjectForm}
                    value={projectForm.status}
                  >
                    <option>Planning</option>
                    <option>In Progress</option>
                    <option>Completed</option>
                    <option>On Hold</option>
                  </select>
                </label>
                <button disabled={loading} type="submit">
                  Add Project
                </button>
              </form>

              <form className="manager-form" onSubmit={createTask}>
                <p className="eyebrow">Create task</p>
                <label>
                  Task title
                  <input
                    name="title"
                    onChange={updateTaskForm}
                    placeholder="Prepare demo"
                    required
                    value={taskForm.title}
                  />
                </label>
                <label>
                  Project
                  <select
                    name="project"
                    onChange={updateTaskForm}
                    required
                    value={taskForm.project}
                  >
                    <option value="">Select project</option>
                    {projects.map((project) => (
                      <option key={project._id} value={project._id}>
                        {project.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Assign to
                  <select
                    name="assignedTo"
                    onChange={updateTaskForm}
                    required
                    value={taskForm.assignedTo}
                  >
                    <option value="">Select member</option>
                    {users.map((user) => (
                      <option key={user._id} value={user._id}>
                        {user.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Due date
                  <input
                    name="dueDate"
                    onChange={updateTaskForm}
                    required
                    type="date"
                    value={taskForm.dueDate}
                  />
                </label>
                <button disabled={loading || projects.length === 0 || users.length === 0} type="submit">
                  Add Task
                </button>
              </form>
            </div>
          )}

          {isAdmin && (
            <>
              <div className="section-title">
                <h3>Members</h3>
                <span>{users.length}</span>
              </div>
              <div className="member-list">
                {users.length === 0 ? (
                  <p className="empty-state">No members yet.</p>
                ) : (
                  users.map((user) => (
                    <article className="member-card" key={user._id}>
                      <div>
                        <h3>{user.name}</h3>
                        <p>{user.email}</p>
                      </div>
                      <div className="member-actions">
                        <span className={user.isActive ? 'active-status' : 'inactive-status'}>
                          {user.isActive ? 'Active' : 'Inactive'}
                        </span>
                        <span>{user.role}</span>
                        {user._id !== auth.user.id && (
                          <button
                            className="secondary-button"
                            onClick={() => updateUserStatus(user._id, !user.isActive)}
                            type="button"
                          >
                            {user.isActive ? 'Deactivate' : 'Reactivate'}
                          </button>
                        )}
                      </div>
                    </article>
                  ))
                )}
              </div>
            </>
          )}

          <div className="section-title">
            <h3>Projects</h3>
            <span>{projects.length}</span>
          </div>
          <div className="project-list">
            {projects.length === 0 ? (
              <p className="empty-state">No projects yet.</p>
            ) : (
              projects.map((project) => (
                <article className="project-card" key={project._id}>
                  <div>
                    <h3>{project.name}</h3>
                    <p>{project.description || 'No description'}</p>
                  </div>
                  {isAdmin ? (
                    <select
                      onChange={(event) =>
                        updateProjectStatus(project._id, event.target.value)
                      }
                      value={project.status}
                    >
                      <option>Planning</option>
                      <option>In Progress</option>
                      <option>Completed</option>
                      <option>On Hold</option>
                    </select>
                  ) : (
                    <span>{project.status}</span>
                  )}
                </article>
              ))
            )}
          </div>

          <div className="section-title">
            <h3>Tasks</h3>
            <span>{tasks.length}</span>
          </div>
          <div className="task-list">
            {tasks.length === 0 ? (
              <p className="empty-state">No tasks yet.</p>
            ) : (
              tasks.map((task) => (
                <article className="task-card" key={task._id}>
                  <div>
                    <h3>{task.title}</h3>
                    <p>
                      {task.project?.name || 'No project'} | Due{' '}
                      {new Date(task.dueDate).toLocaleDateString()}
                    </p>
                  </div>
                  <select
                    onChange={(event) => updateTaskStatus(task._id, event.target.value)}
                    value={task.status}
                  >
                    <option>Todo</option>
                    <option>In Progress</option>
                    <option>Done</option>
                  </select>
                </article>
              ))
            )}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
