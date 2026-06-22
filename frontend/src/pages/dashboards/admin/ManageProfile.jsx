import { useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { FiEdit2, FiCheck, FiEye, FiEyeOff } from 'react-icons/fi'
import '../AdminDashboard.css'

const IconPerson = () => (
  <svg width="32" height="32" viewBox="0 0 24 24" fill="none"
    stroke="#c6a84b" strokeWidth="1.5" strokeLinecap="round">
    <circle cx="12" cy="8" r="4"/>
    <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/>
  </svg>
)

const inputStyle = (editing) => ({
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: `1px solid ${editing ? 'rgba(198,168,75,0.55)' : 'rgba(198,168,75,0.2)'}`,
  background: editing ? 'rgba(198,168,75,0.06)' : 'rgba(255,255,255,0.03)',
  color: editing ? '#f0e6c8' : 'rgba(240,230,200,0.55)',
  fontSize: 14,
  outline: 'none',
  cursor: editing ? 'text' : 'not-allowed',
  transition: 'border 0.2s, color 0.2s',
  boxSizing: 'border-box',
})

const labelStyle = {
  display: 'block',
  fontSize: 12,
  color: 'rgba(198,168,75,0.75)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

function PasswordInput({ value, onChange, disabled, placeholder }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        disabled={disabled}
        placeholder={placeholder}
        style={{ ...inputStyle(!disabled), paddingRight: 38 }}
      />
      <button
        type="button"
        onClick={() => setShow(p => !p)}
        disabled={disabled}
        tabIndex={-1}
        style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', padding: 0,
          cursor: disabled ? 'not-allowed' : 'pointer',
          color: disabled ? 'rgba(198,168,75,0.25)' : 'rgba(198,168,75,0.7)',
          display: 'flex', alignItems: 'center',
        }}
      >
        {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  )
}

function ManageProfile() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)

  const [fullName, setFullName]       = useState(user?.fullName ?? '')
  const [email, setEmail]             = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [error, setError]   = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  const handleEditToggle = () => {
    setEditing(prev => !prev)
    setError('')
    setSuccess('')
    setCurrentPassword('')
    setNewPassword('')
    setConfirmPassword('')
  }

  const handleSave = async () => {
    setError('')
    setSuccess('')

    if (!currentPassword) {
      setError('Current password is required to save any changes.')
      return
    }

    if (newPassword && newPassword !== confirmPassword) {
      setError('New password and confirm password do not match.')
      return
    }

    if (newPassword) {
      if (newPassword.length < 6) {
        setError('New password must be at least 6 characters.')
        return
      }
      if (!/[A-Z]/.test(newPassword)) {
        setError('New password must contain at least one uppercase letter.')
        return
      }
      if (!/[a-z]/.test(newPassword)) {
        setError('New password must contain at least one lowercase letter.')
        return
      }
      if (!/[0-9]/.test(newPassword)) {
        setError('New password must contain at least one number.')
        return
      }
    }

    const body = { currentPassword }
    if (fullName.trim() !== user?.fullName) body.newFullName = fullName.trim()
    if (email.trim() !== user?.email)       body.newEmail    = email.trim()
    if (newPassword)                         body.newPassword = newPassword

    if (!body.newFullName && !body.newEmail && !body.newPassword) {
      setError('No changes detected.')
      return
    }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/admin/profile/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to update profile.')
        return
      }

      // Reflect changes in context / localStorage
      if (body.newFullName) updateUser({ fullName: body.newFullName })
      if (body.newEmail)    updateUser({ email: body.newEmail })

      setSuccess('Profile updated successfully.')
      setEditing(false)
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Profile</h1>
        <p className="page-subtitle">Your account information</p>
      </div>

      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="content-card" style={{ maxWidth: 860, width: '100%', position: 'relative' }}>

          {/* Edit / Done toggle */}
          <button
            onClick={handleEditToggle}
            title={editing ? 'Cancel' : 'Edit profile'}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: editing ? 'rgba(198,168,75,0.15)' : 'transparent',
              border: '1px solid rgba(198,168,75,0.35)',
              borderRadius: 8,
              padding: '6px 8px',
              cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#c6a84b',
              transition: 'background 0.2s',
            }}
          >
            {editing ? <FiCheck size={18} /> : <FiEdit2 size={18} />}
          </button>

          {/* Avatar */}
          <div style={{
            width: 72, height: 72, borderRadius: '50%',
            background: 'rgba(198,168,75,0.08)',
            border: '1px solid rgba(198,168,75,0.22)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: 24,
            marginLeft: 'auto', marginRight: 'auto',
          }}>
            <IconPerson />
          </div>

          {/* Row 1: Full Name + Current Password */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Full Name</label>
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                disabled={!editing}
                style={inputStyle(editing)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Current Password <span style={{ color: '#c6a84b' }}>*</span></label>
              <PasswordInput
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                disabled={!editing}
                placeholder="Required for any change"
              />
            </div>
          </div>

          {/* Row 2: Email + New Password + Confirm Password */}
          <div style={{ display: 'flex', gap: 16 }}>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                disabled={!editing}
                style={inputStyle(editing)}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>New Password</label>
              <PasswordInput
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                disabled={!editing}
                placeholder="Leave blank to keep current"
              />
            </div>
            <div style={{ flex: 1 }}>
              <label style={labelStyle}>Confirm Password</label>
              <PasswordInput
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                disabled={!editing}
                placeholder="Repeat new password"
              />
            </div>
          </div>

          {/* Feedback messages */}
          {error && (
            <p style={{ color: '#e57373', fontSize: 13, marginTop: 16, textAlign: 'center' }}>
              {error}
            </p>
          )}
          {success && (
            <p style={{ color: '#81c784', fontSize: 13, marginTop: 16, textAlign: 'center' }}>
              {success}
            </p>
          )}

          {/* Save button */}
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 32 }}>
            <button
              onClick={handleSave}
              disabled={!editing || loading}
              style={{
                padding: '10px 36px',
                borderRadius: 8,
                border: 'none',
                background: editing && !loading
                  ? 'linear-gradient(135deg, #c6a84b, #a8852e)'
                  : 'rgba(198,168,75,0.15)',
                color: editing && !loading ? '#fff' : 'rgba(198,168,75,0.4)',
                fontSize: 14,
                fontWeight: 600,
                cursor: editing && !loading ? 'pointer' : 'not-allowed',
                letterSpacing: '0.04em',
                transition: 'background 0.2s, color 0.2s',
              }}
            >
              {loading ? 'Saving…' : 'Save Modifications'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default ManageProfile
