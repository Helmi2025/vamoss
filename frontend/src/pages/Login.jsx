import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import api from '../api/axiosInstance'
import logo from '../assets/logo.png'
import './Login.css'

function Login() {
  const { login } = useAuth()
  const navigate   = useNavigate()

  const [form, setForm]       = useState({ email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)
  const [showPwd, setShowPwd] = useState(false)

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      setError('Please fill in both fields.')
      return
    }

    setLoading(true)
    setError('')

    try {
      const { data } = await api.post('/api/auth/login', {
        email:    form.email,
        password: form.password,
      })

      // data = { token, userId, email, fullName, role }
      login(data)

      // Role-based redirect
      const role = data.role // 'ADMIN' | 'CAPTAIN' | 'PLAYER'
      if (role === 'ADMIN')   return navigate('/dashboard/admin',   { replace: true })
      if (role === 'CAPTAIN') return navigate('/dashboard/captain', { replace: true })
      if (role === 'PLAYER')  return navigate('/dashboard/player',  { replace: true })

      navigate('/', { replace: true })
    } catch (err) {
      const msg = err.response?.data?.message
        || err.response?.data
        || 'Incorrect email or password.'
      setError(typeof msg === 'string' ? msg : 'Incorrect email or password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="login-root">
      {/* Left panel — branding */}
      <div className="login-left">
        <div className="login-left-glow" />
        <div className="login-left-content">
          <div className="login-brand">
            <img src={logo} alt="Vamos Sport Sfax" className="login-logo" />
            <span className="login-brand-name">
              Vamos <span>Sport</span>
            </span>
          </div>
          <h2 className="login-left-title">
            Welcome back to<br />the Family.
          </h2>
          <p className="login-left-sub">
            Tournaments, leagues, and the community of Sfax — all in one place.
          </p>
          <div className="login-left-stats">
            <div className="ls-stat"><span>500+</span>Players</div>
            <div className="ls-divider" />
            <div className="ls-stat"><span>30+</span>Tournaments</div>
            <div className="ls-divider" />
            <div className="ls-stat"><span>3</span>Leagues</div>
          </div>
        </div>
        <div className="login-left-corner-line top" />
        <div className="login-left-corner-line bottom" />
      </div>

      {/* Right panel — form */}
      <div className="login-right">
        <div className="login-form-wrap">
          <div className="login-form-header">
            <h1>Sign In</h1>
            <p>Enter your credentials to access your dashboard.</p>
          </div>

          <form className="login-form" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="field-group">
              <label htmlFor="email">Email address</label>
              <div className="field-input-wrap">
                <MailIcon />
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  disabled={loading}
                />
              </div>
            </div>

            {/* Password */}
            <div className="field-group">
              <label htmlFor="password">Password</label>
              <div className="field-input-wrap">
                <LockIcon />
                <input
                  id="password"
                  name="password"
                  type={showPwd ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={form.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className="toggle-pwd"
                  onClick={() => setShowPwd((v) => !v)}
                  tabIndex={-1}
                  aria-label={showPwd ? 'Hide password' : 'Show password'}
                >
                  {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <div className="login-error" role="alert">
                <ErrorIcon />
                {error}
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="login-submit"
              disabled={loading}
            >
              {loading ? <Spinner /> : 'Sign In'}
            </button>
          </form>

          <p className="login-back">
            <Link to="/">← Back to home</Link>
          </p>
        </div>
      </div>
    </div>
  )
}

/* ── Inline SVG icons ── */
function MailIcon() {
  return (
    <svg className="field-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}

function LockIcon() {
  return (
    <svg className="field-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}

function EyeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  )
}

function EyeOffIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
      <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
      <line x1="1" y1="1" x2="23" y2="23"/>
    </svg>
  )
}

function ErrorIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}

function Spinner() {
  return <span className="login-spinner" aria-label="Loading" />
}

export default Login
