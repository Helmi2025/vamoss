import { useState, useRef, useEffect } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { FiEdit2, FiCheck, FiEye, FiEyeOff, FiTrash2, FiCamera } from 'react-icons/fi'
import '../AdminDashboard.css'

/* ── Styles ── */
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

/* ── Password input with show/hide toggle ── */
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

/* ── Delete confirmation modal ── */
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

function DeletePhotoModal({ onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box sm">
        <div className="modal-header">
          <h2 className="modal-title">Remove Photo</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>
        <p className="confirm-text">
          Are you sure you want to remove your profile photo? This action cannot be undone.
        </p>
        <div className="confirm-btns">
          <button className="btn-outline-gold" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>
            <FiTrash2 size={14} />
            Remove Photo
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Avatar section with upload / delete / drag-drop ── */
function AvatarSection({ userId, photoUrl, onPhotoChange }) {
  const fileInputRef            = useRef(null)
  const [dragOver, setDragOver] = useState(false)
  const [photoLoading, setPhotoLoading]   = useState(false)
  const [photoError, setPhotoError]       = useState('')
  const [photoSuccess, setPhotoSuccess]   = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const clearPhotoFeedback = () => { setPhotoError(''); setPhotoSuccess('') }

  const uploadFile = async (file) => {
    clearPhotoFeedback()
    if (!file) return
    if (!file.type.startsWith('image/')) {
      setPhotoError('Only image files are allowed.')
      return
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Image must be smaller than 5 MB.')
      return
    }

    const formData = new FormData()
    formData.append('file', file)

    try {
      setPhotoLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/referee/profile/${userId}/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: formData,
      })
      const data = await res.json()
      if (!res.ok) {
        setPhotoError(data.message || 'Failed to upload photo.')
        return
      }
      onPhotoChange(data.photoUrl)
      setPhotoSuccess('Photo updated successfully.')
    } catch {
      setPhotoError('Network error. Please try again.')
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleDelete = async () => {
    setShowDeleteModal(false)
    clearPhotoFeedback()
    try {
      setPhotoLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/referee/profile/${userId}/photo`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) {
        const data = await res.json()
        setPhotoError(data.message || 'Failed to remove photo.')
        return
      }
      onPhotoChange(null)
      setPhotoSuccess('Photo removed.')
    } catch {
      setPhotoError('Network error. Please try again.')
    } finally {
      setPhotoLoading(false)
    }
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files?.[0]
    if (file) uploadFile(file)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>

      {/* Avatar circle + delete badge wrapper */}
      <div style={{ position: 'relative', width: 140, height: 140 }}>

        {/* Avatar circle — clickable upload / drag-drop zone */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          style={{
            width: 140,
            height: 140,
            borderRadius: '50%',
            background: dragOver
              ? 'rgba(198,168,75,0.18)'
              : photoUrl
                ? 'transparent'
                : 'rgba(198,168,75,0.08)',
            border: `2px ${dragOver ? 'dashed' : 'solid'} ${dragOver ? 'rgba(198,168,75,0.8)' : 'rgba(198,168,75,0.22)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'hidden',
            cursor: 'pointer',
            transition: 'border 0.2s, background 0.2s',
            position: 'relative',
          }}
          onClick={() => !photoLoading && fileInputRef.current?.click()}
          title="Click or drag & drop to upload photo"
        >
          {photoUrl ? (
            <>
              <img
                src={photoUrl}
                alt="Avatar"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
              <div className="avatar-hover-overlay" style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0.45)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
              }}>
                <FiCamera size={22} color="#c6a84b" />
              </div>
            </>
          ) : (
            <FiCamera size={38} color={dragOver ? '#c6a84b' : 'rgba(198,168,75,0.45)'} />
          )}
          {photoLoading && (
            <div style={{
              position: 'absolute', inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: '50%',
            }}>
              <span className="spinner light" />
            </div>
          )}
        </div>

        {/* Delete badge — top-right of avatar, only when photo exists */}
        {photoUrl && !photoLoading && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); clearPhotoFeedback(); setShowDeleteModal(true) }}
            title="Remove photo"
            style={{
              position: 'absolute',
              top: 'auto',
              bottom: 4,
              right: 4,
              width: 26,
              height: 26,
              borderRadius: '50%',
              background: 'rgba(30,10,10,0.85)',
              border: '1px solid rgba(220,53,69,0.5)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              color: '#e07070',
              padding: 0,
              transition: 'background 0.2s, border-color 0.2s',
              zIndex: 2,
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(220,53,69,0.25)'
              e.currentTarget.style.borderColor = '#e07070'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(30,10,10,0.85)'
              e.currentTarget.style.borderColor = 'rgba(220,53,69,0.5)'
            }}
          >
            <FiTrash2 size={12} />
          </button>
        )}
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        style={{ display: 'none' }}
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file) uploadFile(file)
          e.target.value = ''
        }}
      />

      {/* Photo feedback */}
      {photoError && (
        <p style={{ color: '#e57373', fontSize: 12, marginTop: 4, textAlign: 'center' }}>{photoError}</p>
      )}
      {photoSuccess && (
        <p style={{ color: '#81c784', fontSize: 12, marginTop: 4, textAlign: 'center' }}>{photoSuccess}</p>
      )}

      {showDeleteModal && (
        <DeletePhotoModal
          onConfirm={handleDelete}
          onClose={() => setShowDeleteModal(false)}
        />
      )}
    </div>
  )
}

/* ── Main component ── */
function RefereeManageProfile() {
  const { user, updateUser } = useAuth()
  const [editing, setEditing] = useState(false)

  const [fullName, setFullName]             = useState(user?.fullName ?? '')
  const [email, setEmail]                   = useState(user?.email ?? '')
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword]       = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  const [photoUrl, setPhotoUrl] = useState(null)

  const [error, setError]     = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  // Load photo on mount
  useEffect(() => {
    if (!user?.userId) return
    const token = localStorage.getItem('token')
    fetch(`/api/referee/profile/${user.userId}/photo`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => { if (data.photoUrl) setPhotoUrl(data.photoUrl) })
      .catch(() => {})
  }, [user?.userId])

  const handlePhotoChange = (url) => {
    setPhotoUrl(url || null)
  }

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
      const res = await fetch(`/api/referee/profile/${user.userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Failed to update profile.')
        return
      }

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

          {/* ── Photo / Avatar ── */}
          <AvatarSection
            userId={user?.userId}
            photoUrl={photoUrl}
            onPhotoChange={handlePhotoChange}
          />

          {/* ── Row 1: Full Name + Current Password ── */}
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
              <label style={labelStyle}>
                Current Password <span style={{ color: '#c6a84b' }}>*</span>
              </label>
              <PasswordInput
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                disabled={!editing}
                placeholder="Required for any change"
              />
            </div>
          </div>

          {/* ── Row 2: Email + New Password + Confirm Password ── */}
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

          {/* Feedback */}
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

      {/* Inline style for avatar hover overlay */}
      <style>{`
        .avatar-hover-overlay {
          opacity: 0;
          transition: opacity 0.2s;
        }
        .avatar-hover-overlay:hover,
        div:hover > img ~ .avatar-hover-overlay {
          opacity: 1;
        }
      `}</style>
    </div>
  )
}

export default RefereeManageProfile
