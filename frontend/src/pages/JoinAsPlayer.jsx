import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'
import logo from '../assets/logo.png'
import './JoinAsCaptain.css'

const INITIAL = {
  username:        '',
  email:           '',
  password:        '',
  confirmPassword: '',
  sportId:         '',
  gender:          '',
}

const PERKS = [
  { icon: '🎾', label: 'Compete in Tennis & Padel leagues' },
  { icon: '📈', label: 'Track your personal stats & progress' },
  { icon: '🤝', label: 'Join a vibrant sports community' },
]

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
function JoinAsPlayer() {
  const navigate = useNavigate()

  const [form,        setForm]        = useState(INITIAL)
  const [errors,      setErrors]      = useState({})
  const [loading,     setLoading]     = useState(false)
  const [submitted,   setSubmitted]   = useState(false)
  const [serverError, setServerError] = useState('')
  const [showPwd,     setShowPwd]     = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)

  const [sports,        setSports]        = useState([])
  const [sportsLoading, setSportsLoading] = useState(true)
  const [sportsError,   setSportsError]   = useState('')

  useEffect(() => {
    api.get('/api/sports/individual')
      .then(({ data }) => setSports(data))
      .catch(() => setSportsError('Could not load sports. Please refresh.'))
      .finally(() => setSportsLoading(false))
  }, [])

  /* ── Validation ── */
  const validate = () => {
    const e = {}
    if (!form.username.trim())
      e.username = 'Username is required.'
    if (!form.email.trim())
      e.email = 'Email is required.'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address.'
    if (!form.password)
      e.password = 'Password is required.'
    else if (form.password.length < 6)
      e.password = 'Password must be at least 6 characters.'
    else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/.test(form.password))
      e.password = 'Must contain uppercase, lowercase and a number.'
    if (!form.confirmPassword)
      e.confirmPassword = 'Please confirm your password.'
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.'
    if (!form.gender)
      e.gender = 'Please select your gender.'
    if (!form.sportId)
      e.sportId = 'Please select a sport.'
    return e
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setErrors((prev) => ({ ...prev, [name]: '' }))
    setServerError('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const validationErrors = validate()
    if (Object.keys(validationErrors).length) {
      setErrors(validationErrors)
      document.getElementById(Object.keys(validationErrors)[0])?.focus()
      return
    }
    setLoading(true)
    setServerError('')
    try {
      await api.post('/api/player-application/apply', {
        username:        form.username.trim(),
        email:           form.email.trim(),
        password:        form.password,
        confirmPassword: form.confirmPassword,
        sportId:         form.sportId,
        gender:          form.gender,
      })
      setSubmitted(true)
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Something went wrong. Please try again.'
      setServerError(typeof msg === 'string' ? msg : 'Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  /* ── Success view ── */
  if (submitted) {
    return (
      <div className="jac-root">
        <SuccessScreen email={form.email} />
      </div>
    )
  }

  /* ── Form view ── */
  return (
    <div className="jac-root">

      {/* LEFT PANEL */}
      <div className="jac-left">
        <div className="jac-left-glow" />
        <div className="jac-left-corner top" />
        <div className="jac-left-corner bottom" />

        <div className="jac-left-content">
          <Link to="/" className="jac-brand">
            <img src={logo} alt="Vamos Sport Sfax" className="jac-logo" />
            <span className="jac-brand-name">Vamos <span>Sport</span></span>
          </Link>

          <div className="jac-left-headline">
            <div className="jac-eyebrow">
              <span className="jac-eyebrow-line" />
              <span>Player Program</span>
              <span className="jac-eyebrow-line" />
            </div>
            <h2>Play Your Game.<br /><span>Rise Through Ranks.</span></h2>
            <p>
              Joining Vamos as a player means competing in official Tennis &amp; Padel
              leagues, tracking your stats, and being part of a passionate sports
              community.
            </p>
          </div>

          <ul className="jac-perks">
            {PERKS.map((p) => (
              <li key={p.label}>
                <span className="jac-perk-icon">{p.icon}</span>
                <span>{p.label}</span>
              </li>
            ))}
          </ul>

          {/* Switch to Captain */}
          <div className="jac-switch-role">
            <p>Want to lead a team instead?</p>
            <button
              type="button"
              className="jac-switch-btn"
              onClick={() => navigate('/register')}
            >
              <ShieldIcon />
              Apply as a Captain
            </button>
          </div>
        </div>
      </div>

      {/* RIGHT PANEL */}
      <div className="jac-right">
        <div className="jac-form-wrap">
          <div className="jac-form-header">
            <h1>Join Us as a Player</h1>
            <p>Fill in your details and we'll review your application within 48 hours.</p>
            <div className="jac-info-banner">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              <span>Player applications are for <strong>Tennis and Padel</strong> only</span>
            </div>
          </div>

          <form className="jac-form" onSubmit={handleSubmit} noValidate>

            {/* Row 1: Username + Email */}
            <div className="jac-row">
              <FieldGroup id="username" label="Username *" error={errors.username}>
                <div className="jac-input-wrap">
                  <UserIcon />
                  <input
                    id="username" name="username" type="text"
                    placeholder="Choose a username"
                    value={form.username} onChange={handleChange}
                    disabled={loading} autoComplete="username"
                  />
                </div>
              </FieldGroup>

              <FieldGroup id="email" label="Email Address *" error={errors.email}>
                <div className="jac-input-wrap">
                  <MailIcon />
                  <input
                    id="email" name="email" type="email"
                    placeholder="your.email@example.com"
                    value={form.email} onChange={handleChange}
                    disabled={loading} autoComplete="email"
                  />
                </div>
              </FieldGroup>
            </div>

            {/* Row 2: Password + Confirm password */}
            <div className="jac-row">
              <FieldGroup id="password" label="Password *" error={errors.password}>
                <div className="jac-input-wrap">
                  <LockIcon />
                  <input
                    id="password" name="password"
                    type={showPwd ? 'text' : 'password'}
                    placeholder="Min 6 chars, A-z-0"
                    value={form.password} onChange={handleChange}
                    disabled={loading} autoComplete="new-password"
                  />
                  <button
                    type="button" className="jac-toggle-pwd"
                    onClick={() => setShowPwd((v) => !v)}
                    tabIndex={-1}
                    aria-label={showPwd ? 'Hide password' : 'Show password'}
                  >
                    {showPwd ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </FieldGroup>

              <FieldGroup id="confirmPassword" label="Confirm Password *" error={errors.confirmPassword}>
                <div className="jac-input-wrap">
                  <LockIcon />
                  <input
                    id="confirmPassword" name="confirmPassword"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Repeat password"
                    value={form.confirmPassword} onChange={handleChange}
                    disabled={loading} autoComplete="new-password"
                  />
                  <button
                    type="button" className="jac-toggle-pwd"
                    onClick={() => setShowConfirm((v) => !v)}
                    tabIndex={-1}
                    aria-label={showConfirm ? 'Hide password' : 'Show password'}
                  >
                    {showConfirm ? <EyeOffIcon /> : <EyeIcon />}
                  </button>
                </div>
              </FieldGroup>
            </div>

            {/* Row 3: Gender */}
            <FieldGroup id="gender" label="Gender *" error={errors.gender}>
              <div className="jac-sport-cards">
                <label className={`jac-sport-card ${form.gender === 'MALE' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="MALE"
                    checked={form.gender === 'MALE'}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <div className="jac-sport-content">
                    <span className="jac-sport-name" style={{ fontSize: 20 }}>♂</span>
                    <span className="jac-sport-name">Man</span>
                  </div>
                  <div className="jac-sport-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </label>
                <label className={`jac-sport-card ${form.gender === 'FEMALE' ? 'selected' : ''}`}>
                  <input
                    type="radio"
                    name="gender"
                    value="FEMALE"
                    checked={form.gender === 'FEMALE'}
                    onChange={handleChange}
                    disabled={loading}
                  />
                  <div className="jac-sport-content">
                    <span className="jac-sport-name" style={{ fontSize: 20 }}>♀</span>
                    <span className="jac-sport-name">Woman</span>
                  </div>
                  <div className="jac-sport-check">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                      <polyline points="20 6 9 17 4 12"/>
                    </svg>
                  </div>
                </label>
              </div>
            </FieldGroup>

            {/* Row 4: Sport (full width) */}
            <FieldGroup id="sportId" label="Select Sport (Tennis or Padel) *" error={errors.sportId}>
              <div className="jac-sport-cards">
                {sportsLoading ? (
                  <div className="jac-loading-sports">
                    <Spinner />
                    <span>Loading sports...</span>
                  </div>
                ) : sportsError ? (
                  <div className="jac-sports-error">
                    <ErrorIcon /> {sportsError}
                  </div>
                ) : (
                  sports.map((sport) => (
                    <label key={sport.id} className={`jac-sport-card ${form.sportId === sport.id ? 'selected' : ''}`}>
                      <input
                        type="radio"
                        name="sportId"
                        value={sport.id}
                        checked={form.sportId === sport.id}
                        onChange={handleChange}
                        disabled={loading}
                      />
                      <div className="jac-sport-content">
                        {sport.iconUrl && (
                          <img src={sport.iconUrl} alt={sport.sportName} className="jac-sport-icon" />
                        )}
                        <span className="jac-sport-name">{sport.sportName}</span>
                        {sport.maxPlayers && (
                          <span className="jac-sport-players">{sport.maxPlayers} players</span>
                        )}
                      </div>
                      <div className="jac-sport-check">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                          <polyline points="20 6 9 17 4 12"/>
                        </svg>
                      </div>
                    </label>
                  ))
                )}
              </div>
            </FieldGroup>

            {/* Server error */}
            {serverError && (
              <div className="jac-server-error" role="alert">
                <ErrorIcon /> {serverError}
              </div>
            )}

            {/* Submit */}
            <button type="submit" className="jac-submit" disabled={loading}>
              {loading
                ? <Spinner />
                : <><SendIcon /> Submit Application</>
              }
            </button>

          </form>

          <p className="jac-back">
            Already have an account? <Link to="/login">Sign in</Link>
            {' · '}
            <Link to="/">Back to home</Link>
          </p>
        </div>
      </div>

    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   SUCCESS SCREEN
══════════════════════════════════════════════════════════ */
function SuccessScreen({ email }) {
  return (
    <div className="jac-success">
      <div className="jac-success-glow" />
      <div className="jac-success-card">
        <div className="jac-success-icon"><CheckCircleIcon /></div>
        <h2>Application Received!</h2>
        <p className="jac-success-main">
          We've sent a confirmation to <strong>{email}</strong>.
          Our team will review your application within <strong>48 hours</strong>.
        </p>
        <p className="jac-success-sub">
          In the meantime, feel free to explore Vamos Sport — check out upcoming
          tournaments, rankings, and our community. We'll be in touch soon!
        </p>
        <div className="jac-success-actions">
          <Link to="/" className="jac-success-btn primary">
            <HomeIcon /> Explore Vamos Sport
          </Link>
          <Link to="/login" className="jac-success-btn outline">
            Sign In
          </Link>
        </div>
        <p className="jac-success-note">
          Didn't receive an email? Check your spam folder or{' '}
          <a href="mailto:contact@vamos-sport.tn">contact us</a>.
        </p>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   FIELD GROUP
══════════════════════════════════════════════════════════ */
function FieldGroup({ id, label, error, children }) {
  return (
    <div className={`jac-field-group${error ? ' has-error' : ''}`}>
      <label htmlFor={id}>{label}</label>
      {children}
      {error && (
        <span id={`${id}-error`} className="jac-field-error" role="alert">
          <ErrorIcon /> {error}
        </span>
      )}
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   SVG ICONS
══════════════════════════════════════════════════════════ */
function UserIcon() {
  return (
    <svg className="jac-field-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
      <circle cx="12" cy="7" r="4"/>
    </svg>
  )
}
function MailIcon() {
  return (
    <svg className="jac-field-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="4" width="20" height="16" rx="2"/>
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
    </svg>
  )
}
function LockIcon() {
  return (
    <svg className="jac-field-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
      <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
    </svg>
  )
}
function ShieldIcon() {
  return (
    <svg className="jac-field-icon" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
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
function SendIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="22" y1="2" x2="11" y2="13"/>
      <polygon points="22 2 15 22 11 13 2 9 22 2"/>
    </svg>
  )
}
function ErrorIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10"/>
      <line x1="12" y1="8" x2="12" y2="12"/>
      <line x1="12" y1="16" x2="12.01" y2="16"/>
    </svg>
  )
}
function CheckCircleIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
      <polyline points="22 4 12 14.01 9 11.01"/>
    </svg>
  )
}
function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
      <polyline points="9 22 9 12 15 12 15 22"/>
    </svg>
  )
}
function Spinner() {
  return <span className="jac-spinner" aria-label="Submitting…" />
}

export default JoinAsPlayer
