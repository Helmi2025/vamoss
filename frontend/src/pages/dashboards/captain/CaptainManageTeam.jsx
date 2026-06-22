import { useState, useEffect, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import { FiEdit2, FiCheck, FiX, FiCamera, FiTrash2, FiUserPlus, FiUsers, FiEye, FiEyeOff } from 'react-icons/fi'
import '../AdminDashboard.css'
/* ─────────────────────────────────────────────
   Shared style helpers
───────────────────────────────────────────── */
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

const readonlyInputStyle = {
  width: '100%',
  padding: '10px 14px',
  borderRadius: 8,
  border: '1px solid rgba(198,168,75,0.15)',
  background: 'rgba(255,255,255,0.02)',
  color: 'rgba(240,230,200,0.4)',
  fontSize: 14,
  outline: 'none',
  cursor: 'not-allowed',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: 12,
  color: 'rgba(198,168,75,0.75)',
  marginBottom: 6,
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

/* ─────────────────────────────────────────────
   Close icon
───────────────────────────────────────────── */
const IconClose = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
)

function StatsDetailsModal({ wonTournaments, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 500, width: '100%' }}>
        <div className="modal-header">
          <h2 className="modal-title">Tournaments Won</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <div style={{ marginTop: 20 }}>
          {wonTournaments.length === 0 ? (
            <p style={{ color: 'rgba(198,168,75,0.5)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              No tournaments won yet.
            </p>
          ) : (
            <div style={{ maxHeight: 350, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 10 }}>
              {wonTournaments.map((t, idx) => (
                <div
                  key={t.tournamentId || idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '12px 16px',
                    borderBottom: '1px solid rgba(198,168,75,0.08)',
                  }}
                >
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
                    <span style={{ fontWeight: 600, color: '#f0e6c8', fontSize: 14 }}>
                      {t.tournamentName}
                    </span>
                    <span style={{ fontSize: 12, color: 'rgba(198,168,75,0.5)' }}>
                      {t.startDate ? new Date(t.startDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
                      }) : '–'}
                    </span>
                  </div>
                  <span style={{
                    background: 'rgba(198,168,75,0.12)',
                    color: '#c6a84b',
                    fontSize: 12,
                    fontWeight: 700,
                    padding: '4px 12px',
                    borderRadius: 12,
                    border: '1px solid rgba(198,168,75,0.2)'
                  }}>
                    {t.goalsScored} {t.goalsScored === 1 ? 'Goal' : 'Goals'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
          <button className="btn-outline-gold" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Password input with show/hide
───────────────────────────────────────────── */
function PasswordInput({ value, onChange, placeholder, name }) {
  const [show, setShow] = useState(false)
  return (
    <div style={{ position: 'relative' }}>
      <input
        type={show ? 'text' : 'password'}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        name={name}
        autoComplete="new-password"
        style={{ ...inputStyle(true), paddingRight: 38 }}
      />
      <button
        type="button"
        onClick={() => setShow(p => !p)}
        tabIndex={-1}
        style={{
          position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
          background: 'none', border: 'none', padding: 0,
          cursor: 'pointer',
          color: 'rgba(198,168,75,0.7)',
          display: 'flex', alignItems: 'center',
        }}
      >
        {show ? <FiEyeOff size={16} /> : <FiEye size={16} />}
      </button>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Delete logo confirmation modal
───────────────────────────────────────────── */
function DeleteLogoModal({ onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box sm">
        <div className="modal-header">
          <h2 className="modal-title">Remove Team Logo</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <p className="confirm-text">
          Are you sure you want to remove the team logo? This cannot be undone.
        </p>
        <div className="confirm-btns">
          <button className="btn-outline-gold" onClick={onClose}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm}>
            <FiTrash2 size={14} style={{ marginRight: 6 }} /> Remove Logo
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Add Player modal
───────────────────────────────────────────── */
function AddPlayerModal({ captainId, teamName, onAdded, onClose }) {
  const [form, setForm]       = useState({ fullName: '', email: '', password: '' })
  const [error, setError]     = useState('')
  const [loading, setLoading] = useState(false)

  const set = (field) => (e) => setForm(p => ({ ...p, [field]: e.target.value }))

  const validate = () => {
    if (!form.fullName.trim()) return 'Username is required.'
    if (!form.email.trim())    return 'Email is required.'
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) return 'Invalid email format.'
    if (!form.password)        return 'Password is required.'
    if (form.password.length < 6) return 'Password must be at least 6 characters.'
    if (!/[A-Z]/.test(form.password)) return 'Password must contain at least one uppercase letter.'
    if (!/[a-z]/.test(form.password)) return 'Password must contain at least one lowercase letter.'
    if (!/[0-9]/.test(form.password)) return 'Password must contain at least one number.'
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    const err = validate()
    if (err) { setError(err); return }

    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/captain/team/${captainId}/players`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to add player.'); return }
      onAdded(data)
    } catch {
      setError('Network error. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 480 }}>
        <div className="modal-header">
          <h2 className="modal-title">Add Player to <span style={{ color: '#c6a84b' }}>{teamName}</span></h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <form onSubmit={handleSubmit} style={{ marginTop: 20 }}>
          {/* Username */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Username <span style={{ color: '#c6a84b' }}>*</span></label>
            <input
              type="text"
              value={form.fullName}
              onChange={set('fullName')}
              placeholder="Player's display name"
              style={inputStyle(true)}
              autoComplete="off"
            />
          </div>

          {/* Email */}
          <div style={{ marginBottom: 14 }}>
            <label style={labelStyle}>Email <span style={{ color: '#c6a84b' }}>*</span></label>
            <input
              type="email"
              value={form.email}
              onChange={set('email')}
              placeholder="player@example.com"
              style={inputStyle(true)}
              autoComplete="off"
            />
          </div>

          {/* Password */}
          <div style={{ marginBottom: 20 }}>
            <label style={labelStyle}>Password <span style={{ color: '#c6a84b' }}>*</span></label>
            <PasswordInput
              value={form.password}
              onChange={set('password')}
              placeholder="Min 6 chars, upper, lower, number"
              name="player-password"
            />
          </div>

          <p style={{ fontSize: 12, color: 'rgba(198,168,75,0.6)', marginBottom: 16, lineHeight: 1.5 }}>
            The player will receive an email with their login credentials and a confirmation that
            their account on VAMOS SPORT is active.
          </p>

          {error && (
            <p style={{ color: '#e57373', fontSize: 13, marginBottom: 14, textAlign: 'center' }}>{error}</p>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button type="button" className="btn-outline-gold" onClick={onClose}>Cancel</button>
            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '10px 28px',
                borderRadius: 8,
                border: 'none',
                background: loading ? 'rgba(198,168,75,0.25)' : 'linear-gradient(135deg, #c6a84b, #a8852e)',
                color: loading ? 'rgba(198,168,75,0.5)' : '#fff',
                fontWeight: 600,
                fontSize: 14,
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 8,
              }}
            >
              {loading ? 'Adding…' : <><FiUserPlus size={15} /> Add Player</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Player Profile Modal
   Opens when captain clicks a player's username.
───────────────────────────────────────────── */
function PlayerProfileModal({ player, captainId, onClose, onUpdated }) {
  const fileInputRef                         = useRef(null)
  const [editing,          setEditing]       = useState(false)
  const [fullName,         setFullName]      = useState(player.fullName)
  const [email,            setEmail]         = useState(player.email)
  const [photoUrl,         setPhotoUrl]      = useState(player.photoUrl || null)
  const [saveLoading,      setSaveLoading]   = useState(false)
  const [photoLoading,     setPhotoLoading]  = useState(false)
  const [dragOver,         setDragOver]      = useState(false)
  const [error,            setError]         = useState('')
  const [success,          setSuccess]       = useState('')
  const [photoError,       setPhotoError]    = useState('')
  const [photoSuccess,     setPhotoSuccess]  = useState('')
  const [showDeletePhoto,  setShowDeletePhoto] = useState(false)

  // Reset when switching player
  useEffect(() => {
    setFullName(player.fullName)
    setEmail(player.email)
    setPhotoUrl(player.photoUrl || null)
    setEditing(false)
    setError(''); setSuccess('')
    setPhotoError(''); setPhotoSuccess('')
  }, [player.playerId])

  const toggleEdit = () => {
    setEditing(p => !p)
    setError(''); setSuccess('')
    if (editing) { setFullName(player.fullName); setEmail(player.email) }
  }

  /* ── Photo upload ── */
  const uploadPhoto = async (file) => {
    setPhotoError(''); setPhotoSuccess('')
    if (!file) return
    if (!file.type.startsWith('image/')) { setPhotoError('Only image files are allowed.'); return }
    if (file.size > 5 * 1024 * 1024)    { setPhotoError('Image must be smaller than 5 MB.'); return }
    const fd = new FormData(); fd.append('file', file)
    try {
      setPhotoLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/captain/team/${captainId}/players/${player.playerId}/photo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) { setPhotoError(data.message || 'Upload failed.'); return }
      setPhotoUrl(data.photoUrl)
      setPhotoSuccess('Photo updated.')
      onUpdated({ ...player, photoUrl: data.photoUrl })
    } catch { setPhotoError('Network error. Please try again.') }
    finally { setPhotoLoading(false) }
  }

  const deletePhoto = async () => {
    setShowDeletePhoto(false); setPhotoError(''); setPhotoSuccess('')
    try {
      setPhotoLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/captain/team/${captainId}/players/${player.playerId}/photo`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) { const d = await res.json(); setPhotoError(d.message || 'Failed.'); return }
      setPhotoUrl(null)
      setPhotoSuccess('Photo removed.')
      onUpdated({ ...player, photoUrl: null })
    } catch { setPhotoError('Network error. Please try again.') }
    finally { setPhotoLoading(false) }
  }

  /* ── Save edits ── */
  const handleSave = async () => {
    setError(''); setSuccess('')
    const trimName  = fullName.trim()
    const trimEmail = email.trim()
    if (!trimName)  { setError('Username cannot be empty.'); return }
    if (!trimEmail) { setError('Email cannot be empty.'); return }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimEmail)) { setError('Invalid email format.'); return }
    if (trimName === player.fullName && trimEmail === player.email) {
      setEditing(false); return
    }
    try {
      setSaveLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/captain/team/${captainId}/players/${player.playerId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ newFullName: trimName, newEmail: trimEmail }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to update player.'); return }
      setSuccess('Changes saved.')
      setEditing(false)
      onUpdated({ ...player, fullName: data.fullName, email: data.email })
    } catch { setError('Network error. Please try again.') }
    finally { setSaveLoading(false) }
  }

  const initials = (fullName || '?').charAt(0).toUpperCase()

  return (
    <>
      {/* Delete photo confirmation */}
      {showDeletePhoto && (
        <div className="modal-overlay" style={{ zIndex: 9100 }}
          onClick={(e) => e.target === e.currentTarget && setShowDeletePhoto(false)}>
          <div className="modal-box sm">
            <div className="modal-header">
              <h2 className="modal-title">Remove Photo</h2>
              <button className="modal-close" onClick={() => setShowDeletePhoto(false)} aria-label="Close">
                <FiX size={18} />
              </button>
            </div>
            <p className="confirm-text">Remove this player's profile photo?</p>
            <div className="confirm-btns">
              <button className="btn-outline-gold" onClick={() => setShowDeletePhoto(false)}>Cancel</button>
              <button className="btn-danger" onClick={deletePhoto}>
                <FiTrash2 size={14} /> Remove Photo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main modal */}
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !saveLoading && onClose()}>
        <div className="modal-box" style={{ maxWidth: 460, position: 'relative' }}>

          {/* Edit toggle — top right */}
          <button
            onClick={toggleEdit}
            title={editing ? 'Cancel editing' : 'Edit player info'}
            style={{
              position: 'absolute', top: 16, right: 16,
              background: editing ? 'rgba(198,168,75,0.15)' : 'transparent',
              border: '1px solid rgba(198,168,75,0.35)',
              borderRadius: 8, padding: '6px 8px',
              cursor: 'pointer', color: '#c6a84b',
              display: 'flex', alignItems: 'center',
              transition: 'background 0.2s',
              zIndex: 1,
            }}
          >
            {editing ? <FiCheck size={16} /> : <FiEdit2 size={16} />}
          </button>

          {/* ── Header: photo + username + email ── */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>

            {/* Avatar */}
            <div style={{ position: 'relative', width: 96, height: 96, marginBottom: 14 }}>
              <div
                onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
                onDragLeave={() => setDragOver(false)}
                onDrop={(e) => { e.preventDefault(); setDragOver(false); uploadPhoto(e.dataTransfer.files?.[0]) }}
                onClick={() => !photoLoading && fileInputRef.current?.click()}
                title="Click or drag & drop to upload photo"
                style={{
                  width: 96, height: 96, borderRadius: '50%',
                  background: dragOver ? 'rgba(198,168,75,0.18)' : photoUrl ? 'transparent' : 'rgba(198,168,75,0.1)',
                  border: `2px ${dragOver ? 'dashed' : 'solid'} ${dragOver ? 'rgba(198,168,75,0.8)' : 'rgba(198,168,75,0.25)'}`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  overflow: 'hidden', cursor: 'pointer',
                  transition: 'border 0.2s, background 0.2s',
                  position: 'relative',
                }}
              >
                {photoUrl ? (
                  <>
                    <img src={photoUrl} alt={player.fullName}
                      style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    <div className="player-modal-photo-overlay"
                      style={{
                        position: 'absolute', inset: 0,
                        background: 'rgba(0,0,0,0.45)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        borderRadius: '50%', opacity: 0, transition: 'opacity 0.2s',
                      }}>
                      <FiCamera size={20} color="#c6a84b" />
                    </div>
                  </>
                ) : (
                  photoLoading
                    ? null
                    : <span style={{ fontSize: 32, fontWeight: 700, color: '#c6a84b' }}>{initials}</span>
                )}
                {photoLoading && (
                  <div style={{
                    position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%',
                  }}>
                    <span className="spinner light" />
                  </div>
                )}
              </div>

              {/* Delete photo badge */}
              {photoUrl && !photoLoading && (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); setShowDeletePhoto(true) }}
                  title="Remove photo"
                  style={{
                    position: 'absolute', bottom: 2, right: 2,
                    width: 24, height: 24, borderRadius: '50%',
                    background: 'rgba(30,10,10,0.85)',
                    border: '1px solid rgba(220,53,69,0.5)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    cursor: 'pointer', color: '#e07070', padding: 0, zIndex: 2,
                    transition: 'background 0.2s, border-color 0.2s',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,53,69,0.25)'; e.currentTarget.style.borderColor = '#e07070' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,10,10,0.85)'; e.currentTarget.style.borderColor = 'rgba(220,53,69,0.5)' }}
                >
                  <FiTrash2 size={11} />
                </button>
              )}
            </div>

            <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) uploadPhoto(f); e.target.value = '' }} />

            {/* photo feedback */}
            {photoError   && <p style={{ color: '#e57373', fontSize: 12, marginTop: 2, textAlign: 'center' }}>{photoError}</p>}
            {photoSuccess && <p style={{ color: '#81c784', fontSize: 12, marginTop: 2, textAlign: 'center' }}>{photoSuccess}</p>}

            {/* Username */}
            {editing ? (
              <input
                type="text"
                value={fullName}
                onChange={e => setFullName(e.target.value)}
                style={{
                  marginTop: 8,
                  background: 'rgba(198,168,75,0.06)',
                  border: '1px solid rgba(198,168,75,0.5)',
                  borderRadius: 6, padding: '6px 12px',
                  color: '#f0e6c8', fontSize: 16, fontWeight: 700,
                  outline: 'none', textAlign: 'center', width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <p style={{ marginTop: 8, fontSize: 17, fontWeight: 700, color: '#fff' }}>{fullName}</p>
            )}

            {/* Email */}
            {editing ? (
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  marginTop: 8,
                  background: 'rgba(198,168,75,0.04)',
                  border: '1px solid rgba(198,168,75,0.3)',
                  borderRadius: 6, padding: '5px 12px',
                  color: '#aaa', fontSize: 13,
                  outline: 'none', textAlign: 'center', width: '100%',
                  boxSizing: 'border-box',
                }}
              />
            ) : (
              <p style={{ marginTop: 4, fontSize: 13, color: '#666' }}>{email}</p>
            )}
          </div>

          {/* Feedback */}
          {error   && <p style={{ color: '#e57373', fontSize: 13, textAlign: 'center', marginBottom: 14 }}>{error}</p>}
          {success && <p style={{ color: '#81c784', fontSize: 13, textAlign: 'center', marginBottom: 14 }}>{success}</p>}

          {/* Action buttons */}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
            <button className="btn-outline-gold" onClick={onClose} disabled={saveLoading}>
              Close
            </button>
            {editing && (
              <button
                onClick={handleSave}
                disabled={saveLoading}
                style={{
                  padding: '9px 24px', borderRadius: 6, border: 'none',
                  background: saveLoading ? 'rgba(198,168,75,0.2)' : 'linear-gradient(135deg, #c6a84b, #a8852e)',
                  color: saveLoading ? 'rgba(198,168,75,0.4)' : '#fff',
                  fontWeight: 700, fontSize: 13, cursor: saveLoading ? 'not-allowed' : 'pointer',
                  display: 'flex', alignItems: 'center', gap: 8,
                }}
              >
                {saveLoading
                  ? <><span className="spinner light" style={{ width: 14, height: 14 }} /> Saving…</>
                  : <><FiCheck size={14} /> Save Changes</>
                }
              </button>
            )}
          </div>
        </div>
      </div>

      <style>{`
        div:hover > img ~ .player-modal-photo-overlay { opacity: 1 !important; }
      `}</style>
    </>
  )
}

/* ─────────────────────────────────────────────
   Team Logo section (GridFS-backed)
───────────────────────────────────────────── */
function LogoSection({ captainId, logoUrl, onLogoChange }) {
  const fileRef = useRef(null)
  const [dragOver, setDragOver]         = useState(false)
  const [loading, setLoading]           = useState(false)
  const [error, setError]               = useState('')
  const [success, setSuccess]           = useState('')
  const [showDeleteModal, setShowDeleteModal] = useState(false)

  const clear = () => { setError(''); setSuccess('') }

  const upload = async (file) => {
    clear()
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Only image files are allowed.'); return }
    if (file.size > 5 * 1024 * 1024)    { setError('Logo must be smaller than 5 MB.'); return }

    const fd = new FormData()
    fd.append('file', file)
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/captain/team/${captainId}/logo`, {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Upload failed.'); return }
      onLogoChange(data.logoUrl)
      setSuccess('Logo updated successfully.')
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  const handleDelete = async () => {
    setShowDeleteModal(false); clear()
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/captain/team/${captainId}/logo`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (!res.ok) { setError(data.message || 'Failed to remove logo.'); return }
      onLogoChange(null)
      setSuccess('Logo removed.')
    } catch { setError('Network error. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 28 }}>
      <p style={{ ...labelStyle, marginBottom: 12 }}>Team Logo</p>

      <div style={{ position: 'relative', width: 120, height: 120 }}>
        {/* Logo circle */}
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => { e.preventDefault(); setDragOver(false); upload(e.dataTransfer.files?.[0]) }}
          onClick={() => !loading && fileRef.current?.click()}
          title="Click or drag & drop to upload logo"
          style={{
            width: 120, height: 120,
            borderRadius: '50%',
            background: dragOver ? 'rgba(198,168,75,0.18)' : logoUrl ? 'transparent' : 'rgba(198,168,75,0.08)',
            border: `2px ${dragOver ? 'dashed' : 'solid'} ${dragOver ? 'rgba(198,168,75,0.8)' : 'rgba(198,168,75,0.22)'}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', cursor: 'pointer',
            transition: 'border 0.2s, background 0.2s',
            position: 'relative',
          }}
        >
          {logoUrl ? (
            <>
              <img src={logoUrl} alt="Team logo"
                style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{
                position: 'absolute', inset: 0,
                background: 'rgba(0,0,0,0)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                borderRadius: '50%',
                transition: 'background 0.2s',
              }}
                className="logo-hover-overlay"
              >
                <FiCamera size={20} color="#c6a84b" style={{ opacity: 0 }} className="logo-hover-icon" />
              </div>
            </>
          ) : (
            <FiCamera size={32} color={dragOver ? '#c6a84b' : 'rgba(198,168,75,0.45)'} />
          )}
          {loading && (
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

        {/* Delete badge */}
        {logoUrl && !loading && (
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); clear(); setShowDeleteModal(true) }}
            title="Remove logo"
            style={{
              position: 'absolute', bottom: 4, right: 4,
              width: 24, height: 24, borderRadius: '50%',
              background: 'rgba(30,10,10,0.85)',
              border: '1px solid rgba(220,53,69,0.5)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              cursor: 'pointer', color: '#e07070', padding: 0, zIndex: 2,
              transition: 'background 0.2s, border-color 0.2s',
            }}
            onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,53,69,0.25)'; e.currentTarget.style.borderColor = '#e07070' }}
            onMouseLeave={e => { e.currentTarget.style.background = 'rgba(30,10,10,0.85)'; e.currentTarget.style.borderColor = 'rgba(220,53,69,0.5)' }}
          >
            <FiTrash2 size={11} />
          </button>
        )}
      </div>

      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }}
        onChange={(e) => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />

      {error   && <p style={{ color: '#e57373', fontSize: 12, marginTop: 6, textAlign: 'center' }}>{error}</p>}
      {success && <p style={{ color: '#81c784', fontSize: 12, marginTop: 6, textAlign: 'center' }}>{success}</p>}

      {showDeleteModal && (
        <DeleteLogoModal onConfirm={handleDelete} onClose={() => setShowDeleteModal(false)} />
      )}

      <style>{`
        div:hover > img ~ .logo-hover-overlay { background: rgba(0,0,0,0.45) !important; }
        div:hover > img ~ .logo-hover-overlay .logo-hover-icon { opacity: 1 !important; }
      `}</style>
    </div>
  )
}

/* ─────────────────────────────────────────────
   Players table
───────────────────────────────────────────── */
function PlayersSection({ captainId, teamName, refreshTrigger }) {
  const [players, setPlayers]               = useState([])
  const [loading, setLoading]               = useState(true)
  const [showAddModal, setShowAddModal]     = useState(false)
  const [selectedPlayer, setSelectedPlayer] = useState(null)

  const fetchPlayers = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/captain/team/${captainId}/players`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (res.ok) setPlayers(await res.json())
    } catch { /* silent */ }
    finally { setLoading(false) }
  }

  useEffect(() => { if (captainId) fetchPlayers() }, [captainId, refreshTrigger])

  const handleAdded = (player) => {
    setShowAddModal(false)
    setPlayers(p => [...p, player])
  }

  // Called by PlayerProfileModal when info or photo changes
  const handlePlayerUpdated = (updated) => {
    setPlayers(prev => prev.map(p => p.playerId === updated.playerId ? updated : p))
    setSelectedPlayer(updated)
  }

  return (
    <div>
      {/* Section header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <FiUsers size={18} color="#c6a84b" />
          <h2 style={{ fontSize: 16, fontWeight: 600, color: '#f0e6c8', margin: 0 }}>
            Players
            {!loading && (
              <span style={{
                marginLeft: 8,
                background: 'rgba(198,168,75,0.15)',
                color: '#c6a84b',
                fontSize: 12,
                padding: '2px 10px',
                borderRadius: 20,
                fontWeight: 500,
              }}>{players.length}</span>
            )}
          </h2>
        </div>
        <button
          onClick={() => setShowAddModal(true)}
          style={{
            display: 'flex', alignItems: 'center', gap: 7,
            padding: '8px 18px',
            borderRadius: 8,
            border: 'none',
            background: 'linear-gradient(135deg, #c6a84b, #a8852e)',
            color: '#fff',
            fontWeight: 600,
            fontSize: 13,
            cursor: 'pointer',
          }}
        >
          <FiUserPlus size={14} /> Add Player
        </button>
      </div>

      {/* Table */}
      {loading ? (
        <div style={{ textAlign: 'center', padding: '32px 0' }}>
          <span className="spinner" style={{ margin: '0 auto' }} />
        </div>
      ) : players.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: 'rgba(198,168,75,0.45)',
          fontSize: 14,
          border: '1px dashed rgba(198,168,75,0.2)',
          borderRadius: 10,
        }}>
          <FiUsers size={32} style={{ marginBottom: 10, opacity: 0.4 }} />
          <p>No players yet. Add your first player!</p>
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid rgba(198,168,75,0.2)' }}>
                {['Username', 'Email'].map(h => (
                  <th key={h} style={{
                    textAlign: 'left',
                    padding: '10px 14px',
                    color: 'rgba(198,168,75,0.7)',
                    fontSize: 11,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    fontWeight: 600,
                  }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {players.map((p, i) => (
                <tr key={p.playerId || i} style={{
                  borderBottom: '1px solid rgba(198,168,75,0.08)',
                  transition: 'background 0.15s',
                }}
                  onMouseEnter={e => e.currentTarget.style.background = 'rgba(198,168,75,0.04)'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  <td style={{ padding: '12px 14px', color: '#f0e6c8' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      {p.photoUrl ? (
                        <img
                          src={p.photoUrl}
                          alt={p.fullName}
                          style={{
                            width: 32, height: 32, borderRadius: '50%',
                            objectFit: 'cover', flexShrink: 0,
                            border: '1px solid rgba(198,168,75,0.3)',
                          }}
                        />
                      ) : (
                        <div style={{
                          width: 32, height: 32, borderRadius: '50%',
                          background: 'rgba(198,168,75,0.15)',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          color: '#c6a84b', fontWeight: 700, fontSize: 13, flexShrink: 0,
                        }}>
                          {p.fullName?.charAt(0).toUpperCase() || '?'}
                        </div>
                      )}
                      {/* Clickable username */}
                      <button
                        onClick={() => setSelectedPlayer(p)}
                        style={{
                          background: 'none', border: 'none', padding: 0,
                          color: '#f0e6c8', fontWeight: 600, fontSize: 14,
                          cursor: 'pointer', textAlign: 'left',
                          transition: 'color 0.15s',
                        }}
                        onMouseEnter={e => e.currentTarget.style.color = '#c6a84b'}
                        onMouseLeave={e => e.currentTarget.style.color = '#f0e6c8'}
                      >
                        {p.fullName}
                      </button>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px', color: 'rgba(240,230,200,0.65)' }}>{p.email}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showAddModal && (
        <AddPlayerModal
          captainId={captainId}
          teamName={teamName}
          onAdded={handleAdded}
          onClose={() => setShowAddModal(false)}
        />
      )}

      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          captainId={captainId}
          onClose={() => setSelectedPlayer(null)}
          onUpdated={handlePlayerUpdated}
        />
      )}
    </div>
  )
}

/* ─────────────────────────────────────────────
   Main page component
───────────────────────────────────────────── */
function CaptainManageTeam() {
  const { user } = useAuth()

  const [teamInfo, setTeamInfo]       = useState(null)
  const [loadingInfo, setLoadingInfo] = useState(true)
  const [stats, setStats]             = useState(null)
  const [showStatsModal, setShowStatsModal] = useState(false)

  // Rename state
  const [renamingTeam, setRenamingTeam]   = useState(false)
  const [newTeamName, setNewTeamName]     = useState('')
  const [renameLoading, setRenameLoading] = useState(false)
  const [renameError, setRenameError]     = useState('')

  // players refresh counter
  const [playerRefresh, setPlayerRefresh] = useState(0)

  // ── Fetch team info ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!user?.userId) return
    const token = localStorage.getItem('token')
    setLoadingInfo(true)
    fetch(`/api/captain/team/${user.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => r.json())
      .then(data => {
        setTeamInfo(data)
        setNewTeamName(data.teamName || '')
      })
      .catch(() => {})
      .finally(() => setLoadingInfo(false))
  }, [user?.userId])

  useEffect(() => {
    if (!teamInfo?.teamId) return
    const token = localStorage.getItem('token')
    fetch(`/api/stats/team/${teamInfo.teamId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load stats')
        return r.json()
      })
      .then(data => setStats(data))
      .catch(() => {})
  }, [teamInfo?.teamId])

  // ── Rename handlers ───────────────────────────────────────────────────────
  const startRename = () => {
    setNewTeamName(teamInfo?.teamName || '')
    setRenameError('')
    setRenamingTeam(true)
  }

  const cancelRename = () => {
    setNewTeamName(teamInfo?.teamName || '')
    setRenameError('')
    setRenamingTeam(false)
  }

  const saveRename = async () => {
    setRenameError('')
    const trimmed = newTeamName.trim()
    if (!trimmed) { setRenameError('Team name cannot be empty.'); return }
    if (trimmed === teamInfo?.teamName) { setRenameError('New name is the same.'); return }

    try {
      setRenameLoading(true)
      const token = localStorage.getItem('token')
      const res = await fetch(`/api/captain/team/${user.userId}/rename`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ teamName: trimmed }),
      })
      const data = await res.json()
      if (!res.ok) { setRenameError(data.message || 'Failed to rename team.'); return }
      setTeamInfo(data)
      setRenamingTeam(false)
    } catch {
      setRenameError('Network error. Please try again.')
    } finally {
      setRenameLoading(false)
    }
  }

  const handleLogoChange = (logoUrl) => {
    setTeamInfo(prev => prev ? { ...prev, logoUrl } : prev)
  }

  if (loadingInfo) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Manage Team</h1>
          <p className="page-subtitle">Loading team information…</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <span className="spinner" />
        </div>
      </div>
    )
  }

  if (!teamInfo) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">Manage Team</h1>
        </div>
        <p style={{ color: '#e57373', textAlign: 'center', marginTop: 40 }}>
          Could not load team information. Please try refreshing.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Manage Team</h1>
        <p className="page-subtitle">Update your team details and manage your players</p>
      </div>

      {/* ── Team Info Card ── */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="content-card" style={{ maxWidth: 860, width: '100%' }}>

          {/* Logo */}
          <LogoSection
            captainId={user?.userId}
            logoUrl={teamInfo.logoUrl}
            onLogoChange={handleLogoChange}
          />

          {/* Fields row */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 16, flexWrap: 'wrap' }}>

            {/* Team Name */}
            <div style={{ flex: '1 1 220px' }}>
              <label style={labelStyle}>Team Name</label>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input
                  type="text"
                  value={renamingTeam ? newTeamName : teamInfo.teamName}
                  onChange={e => setNewTeamName(e.target.value)}
                  disabled={!renamingTeam}
                  style={{ ...inputStyle(renamingTeam), flex: 1 }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && renamingTeam) saveRename()
                    if (e.key === 'Escape') cancelRename()
                  }}
                />
                {!renamingTeam ? (
                  <button
                    onClick={startRename}
                    title="Rename team"
                    style={{
                      background: 'transparent',
                      border: '1px solid rgba(198,168,75,0.35)',
                      borderRadius: 8, padding: '8px',
                      cursor: 'pointer', color: '#c6a84b',
                      display: 'flex', alignItems: 'center', flexShrink: 0,
                    }}
                  >
                    <FiEdit2 size={15} />
                  </button>
                ) : (
                  <div style={{ display: 'flex', gap: 6, flexShrink: 0 }}>
                    <button
                      onClick={saveRename}
                      disabled={renameLoading}
                      title="Save name"
                      style={{
                        background: 'rgba(198,168,75,0.15)',
                        border: '1px solid rgba(198,168,75,0.4)',
                        borderRadius: 8, padding: '8px',
                        cursor: renameLoading ? 'not-allowed' : 'pointer',
                        color: '#c6a84b',
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      {renameLoading ? <span className="spinner light" style={{ width: 14, height: 14 }} /> : <FiCheck size={15} />}
                    </button>
                    <button
                      onClick={cancelRename}
                      title="Cancel"
                      style={{
                        background: 'transparent',
                        border: '1px solid rgba(220,53,69,0.35)',
                        borderRadius: 8, padding: '8px',
                        cursor: 'pointer', color: '#e07070',
                        display: 'flex', alignItems: 'center',
                      }}
                    >
                      <FiX size={15} />
                    </button>
                  </div>
                )}
              </div>
              {renameError && (
                <p style={{ color: '#e57373', fontSize: 12, marginTop: 6 }}>{renameError}</p>
              )}
            </div>

            {/* Sport — read-only */}
            <div style={{ flex: '1 1 220px' }}>
              <label style={labelStyle}>
                Sport
                <span style={{
                  marginLeft: 8,
                  background: 'rgba(198,168,75,0.1)',
                  color: 'rgba(198,168,75,0.6)',
                  fontSize: 10,
                  padding: '2px 8px',
                  borderRadius: 10,
                  textTransform: 'none',
                  letterSpacing: 0,
                }}>read-only</span>
              </label>
              <input
                type="text"
                value={teamInfo.sportName}
                disabled
                style={readonlyInputStyle}
              />
            </div>
          </div>

          {/* Stats Row */}
          {stats && (
            <div style={{ display: 'flex', gap: 16, marginTop: 24, flexWrap: 'wrap', borderTop: '1px solid rgba(198,168,75,0.12)', paddingTop: 20 }}>
              <div
                onClick={() => stats.tournamentsWonCount > 0 && setShowStatsModal(true)}
                style={{
                  cursor: stats.tournamentsWonCount > 0 ? 'pointer' : 'default',
                  transition: 'transform 0.2s',
                }}
                onMouseEnter={e => stats.tournamentsWonCount > 0 && (e.currentTarget.style.transform = 'scale(1.05)')}
                onMouseLeave={e => stats.tournamentsWonCount > 0 && (e.currentTarget.style.transform = 'scale(1)')}
              >
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center',
                  padding: '12px 24px',
                  background: stats.tournamentsWonCount > 0 ? 'rgba(198,168,75,0.12)' : 'rgba(198,168,75,0.06)',
                  border: stats.tournamentsWonCount > 0 ? '1px solid rgba(198,168,75,0.4)' : '1px solid rgba(198,168,75,0.15)',
                  borderRadius: 10,
                  minWidth: 120,
                }}>
                  <span style={{ fontSize: 20, fontWeight: 700, color: '#f0e6c8' }}>{stats.tournamentsWonCount}</span>
                  <span style={{ fontSize: 11, color: 'rgba(198,168,75,0.65)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Tournaments Won</span>
                </div>
              </div>

              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '12px 24px',
                background: 'rgba(198,168,75,0.06)',
                border: '1px solid rgba(198,168,75,0.15)',
                borderRadius: 10,
                minWidth: 120,
              }}>
                <span style={{ fontSize: 20, fontWeight: 700, color: '#f0e6c8' }}>{stats.totalGoalsScored}</span>
                <span style={{ fontSize: 11, color: 'rgba(198,168,75,0.65)', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>All-Time Goals</span>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ── Players Card ── */}
      <div style={{ display: 'flex', justifyContent: 'center', marginTop: 24 }}>
        <div className="content-card" style={{ maxWidth: 860, width: '100%' }}>
          <PlayersSection
            captainId={user?.userId}
            teamName={teamInfo.teamName}
            refreshTrigger={playerRefresh}
          />
        </div>
      </div>

      {showStatsModal && stats && (
        <StatsDetailsModal
          wonTournaments={stats.wonTournaments}
          onClose={() => setShowStatsModal(false)}
        />
      )}
    </div>
  )
}

export default CaptainManageTeam
