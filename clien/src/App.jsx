import { useMemo, useState } from 'react'
import './App.css'

const initialForm = {
  name: '',
  email: '',
  password: '',
  role: 'Member',
}

const demoProjects = [
  {
    name: 'Atlas Backend',
    owner: 'Admin',
    status: 'API ready',
    progress: 72,
  },
  {
    name: 'Member Portal',
    owner: 'Member',
    status: 'UI in progress',
    progress: 48,
  },
  {
    name: 'Testing Flow',
    owner: 'Admin',
    status: 'Review',
    progress: 86,
  },
]

function App() {
  const [mode, setMode] = useState('login')
  const [form, setForm] = useState(initialForm)
  const [auth, setAuth] = useState(() => {
    const saved = localStorage.getItem('pm_auth')
    return saved ? JSON.parse(saved) : null
  })
  const [apiStatus, setApiStatus] = useState('Not checked')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const isAdmin = auth?.user?.role === 'Admin'

  const visibleProjects = useMemo(() => {
    if (isAdmin) return demoProjects
    return demoProjects.filter((project) => project.owner === 'Member')
  }, [isAdmin])

  const updateForm = (event) => {
    const { name, value } = event.target
    setForm((current) => ({ ...current, [name]: value }))
  }

  const request = async (path, options = {}) => {
    const response = await fetch(path, {
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
      setForm(initialForm)
    } catch (error) {
      setMessage(error.message)
    } finally {
      setLoading(false)
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
    localStorage.removeItem('pm_auth')
    setMessage('Logged out')
  }

  return (
    <main className="app-shell">
      <section className="topbar">
        <div>
          <p className="eyebrow">Ethara Assignment</p>
          <h1>Project Manager</h1>
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
            <span>{visibleProjects.length} projects</span>
          </div>

          <div className="metrics">
            <div>
              <span>Total Projects</span>
              <strong>{visibleProjects.length}</strong>
            </div>
            <div>
              <span>Role</span>
              <strong>{auth?.user?.role || 'Guest'}</strong>
            </div>
            <div>
              <span>Auth</span>
              <strong>{auth ? 'JWT active' : 'Required'}</strong>
            </div>
          </div>

          <div className="project-list">
            {visibleProjects.map((project) => (
              <article className="project-card" key={project.name}>
                <div>
                  <h3>{project.name}</h3>
                  <p>{project.status}</p>
                </div>
                <span>{project.progress}%</span>
                <div className="progress-track">
                  <div style={{ width: `${project.progress}%` }} />
                </div>
              </article>
            ))}
          </div>
        </section>
      </section>
    </main>
  )
}

export default App
