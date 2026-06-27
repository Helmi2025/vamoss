import { useState, useEffect } from 'react'
import api from '../../../api/axiosInstance'
import '../AdminDashboard.css'

/* ── Inline SVG icons ── */
const IconClose  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconEdit   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
const IconTrash  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
const IconPlus   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

/* ── Avatar ── */
function Avatar({ src, name, size = 48 }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const placeholder = (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(198,168,75,0.1)',
      border: '1px solid rgba(198,168,75,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#c6a84b', fontSize: size * 0.35, fontWeight: 700,
      fontFamily: 'Montserrat, sans-serif', flexShrink: 0,
    }}>{initials}</div>
  )
  if (!src) return placeholder
  if (src.startsWith('data:')) {
    return (
      <img src={src} alt={name} style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0,
        border: '1px solid rgba(198,168,75,0.25)',
      }} />
    )
  }
  return (
    <img src={src} alt={name} style={{
      width: size, height: size, borderRadius: '50%',
      objectFit: 'cover', flexShrink: 0,
      border: '1px solid rgba(198,168,75,0.25)',
    }} />
  )
}

/* ═══════════════════════════════════════════════
   CREATE/EDIT REFEREE MODAL
═══════════════════════════════════════════════ */
function RefereeFormModal({ referee, sports, onClose, onSave }) {
  const [fullName, setFullName] = useState(referee?.fullName || '')
  const [email, setEmail] = useState(referee?.email || '')
  const [phoneNumber, setPhoneNumber] = useState(referee?.phoneNumber || '')
  const [sportId, setSportId] = useState(referee?.sportId || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      if (referee) {
        // Update existing referee
        await api.put(`/api/admin/referees/${referee.refereeId}`, {
          fullName,
          phoneNumber,
          sportId,
        })
      } else {
        // Create new referee
        await api.post('/api/admin/referees', {
          fullName,
          email,
          phoneNumber,
          sportId,
        })
      }
      onSave()
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to save referee.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box sm">
        <div className="modal-header">
          <h2 className="modal-title">
            {referee ? 'Edit Referee' : 'Create New Referee'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(198,168,75,0.75)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Full Name *</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              required
              placeholder="Enter referee full name"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid rgba(198,168,75,0.3)',
                background: 'rgba(198,168,75,0.06)',
                color: '#f0e6c8',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {!referee && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(198,168,75,0.75)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Email *</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="Enter referee email"
                style={{
                  width: '100%',
                  padding: '10px 14px',
                  borderRadius: 8,
                  border: '1px solid rgba(198,168,75,0.3)',
                  background: 'rgba(198,168,75,0.06)',
                  color: '#f0e6c8',
                  fontSize: 14,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(198,168,75,0.75)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Phone Number</label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value)}
              placeholder="Enter phone number"
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid rgba(198,168,75,0.3)',
                background: 'rgba(198,168,75,0.06)',
                color: '#f0e6c8',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
              }}
            />
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            <label style={{ fontSize: 12, fontWeight: 700, color: 'rgba(198,168,75,0.75)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Sport *</label>
            <select
              value={sportId}
              onChange={(e) => setSportId(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '10px 14px',
                borderRadius: 8,
                border: '1px solid rgba(198,168,75,0.3)',
                background: '#0a0a0a',
                color: sportId ? '#f0e6c8' : '#666',
                fontSize: 14,
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer',
              }}
            >
              <option value="">-- Select a sport --</option>
              {sports.map((sport) => (
                <option key={sport.id} value={sport.id}>{sport.sportName}</option>
              ))}
            </select>
          </div>

          {!referee && (
            <p style={{ fontSize: 12, color: '#999', marginTop: -8 }}>
              ⚠ A random password will be generated and sent to the referee's email.
            </p>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn-outline-gold" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? 'Saving...' : referee ? 'Update' : 'Create & Send Credentials'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   DELETE CONFIRMATION MODAL
═══════════════════════════════════════════════ */
function DeleteConfirmModal({ referee, onClose, onConfirm }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box sm">
        <div className="modal-header">
          <h2 className="modal-title">Delete Referee</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <p className="confirm-text">
          Are you sure you want to delete <strong>{referee?.fullName}</strong>? This action cannot be undone.
        </p>

        <div className="confirm-btns">
          <button className="btn-outline-gold" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            <span style={{ width: 14, height: 14, display: 'flex', alignItems: 'center' }}>
              <IconTrash />
            </span>
            Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MAIN COMPONENT
═══════════════════════════════════════════════ */
function ManageReferees() {
  const [referees, setReferees] = useState([])
  const [sports, setSports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [selectedReferee, setSelectedReferee] = useState(null)

  const fetchReferees = () => {
    setLoading(true)
    setError('')
    api.get('/api/admin/referees')
      .then(({ data }) => setReferees(data))
      .catch(() => setError('Failed to load referees.'))
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchReferees()
    // Fetch sports
    api.get('/api/sports')
      .then(({ data }) => setSports(data))
      .catch(() => console.error('Failed to load sports'))
  }, [])

  const handleCreate = () => {
    setSelectedReferee(null)
    setShowFormModal(true)
  }

  const handleEdit = (referee) => {
    setSelectedReferee(referee)
    setShowFormModal(true)
  }

  const handleDeleteClick = (referee) => {
    setSelectedReferee(referee)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    try {
      await api.delete(`/api/admin/referees/${selectedReferee.refereeId}`)
      setShowDeleteModal(false)
      fetchReferees()
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete referee.')
    }
  }

  const formatDate = (iso) => {
    if (!iso) return '–'
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    })
  }

  return (
    <div className="admin-section">
      <div className="section-header">
        <div>
          <h2 className="section-title">Manage Referees</h2>
          <p className="section-subtitle">
            Create and manage match referees. New referees will receive login credentials via email.
          </p>
        </div>
        <button className="btn-gold" onClick={handleCreate}>
          <IconPlus />
          Create Referee
        </button>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <div style={{ textAlign: 'center', padding: '40px 0' }}>
          <span className="spinner light" style={{ width: 32, height: 32 }} />
        </div>
      ) : referees.length === 0 ? (
        <div className="empty-state">
          <p>No referees found. Create your first referee to get started.</p>
        </div>
      ) : (
        <div className="table-container">
          <table className="data-table">
            <thead>
              <tr>
                <th style={{ padding: '12px 16px' }}>Referee</th>
                <th style={{ padding: '12px 16px' }}>Email</th>
                <th style={{ padding: '12px 16px' }}>Sport</th>
                <th style={{ padding: '12px 16px' }}>Phone</th>
                <th style={{ padding: '12px 16px' }}>Registered</th>
                <th style={{ textAlign: 'right', padding: '12px 16px' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {referees.map((ref) => (
                <tr key={ref.refereeId}>
                  <td style={{ padding: '14px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                      <Avatar src={ref.photoUrl} name={ref.fullName} size={40} />
                      <span style={{ fontWeight: 600 }}>{ref.fullName}</span>
                    </div>
                  </td>
                  <td style={{ padding: '14px 16px' }}>{ref.email}</td>
                  <td style={{ padding: '14px 16px' }}>
                    {ref.sportName ? (
                      <span style={{
                        background: 'rgba(198,168,75,0.12)',
                        border: '1px solid rgba(198,168,75,0.3)',
                        color: '#c6a84b',
                        fontSize: 11,
                        fontWeight: 600,
                        padding: '3px 10px',
                        borderRadius: 20,
                        letterSpacing: '0.04em',
                      }}>
                        {ref.sportName}
                      </span>
                    ) : '–'}
                  </td>
                  <td style={{ padding: '14px 16px' }}>{ref.phoneNumber || '–'}</td>
                  <td style={{ padding: '14px 16px' }}>{formatDate(ref.registeredAt)}</td>
                  <td style={{ textAlign: 'right', padding: '14px 16px' }}>
                    <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                      <button
                        onClick={() => handleEdit(ref)}
                        title="Edit"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 32, height: 32, borderRadius: 6,
                          background: 'rgba(198,168,75,0.08)',
                          border: '1px solid rgba(198,168,75,0.25)',
                          color: '#c6a84b', cursor: 'pointer',
                          transition: 'background 0.2s, border-color 0.2s',
                          padding: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(198,168,75,0.2)'; e.currentTarget.style.borderColor = '#c6a84b' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(198,168,75,0.08)'; e.currentTarget.style.borderColor = 'rgba(198,168,75,0.25)' }}
                      >
                        <IconEdit />
                      </button>
                      <button
                        onClick={() => handleDeleteClick(ref)}
                        title="Delete"
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          width: 32, height: 32, borderRadius: 6,
                          background: 'rgba(220,53,69,0.08)',
                          border: '1px solid rgba(220,53,69,0.25)',
                          color: '#e07070', cursor: 'pointer',
                          transition: 'background 0.2s, border-color 0.2s',
                          padding: 0,
                        }}
                        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,53,69,0.2)'; e.currentTarget.style.borderColor = '#e07070' }}
                        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,53,69,0.08)'; e.currentTarget.style.borderColor = 'rgba(220,53,69,0.25)' }}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {showFormModal && (
        <RefereeFormModal
          referee={selectedReferee}
          sports={sports}
          onClose={() => setShowFormModal(false)}
          onSave={() => {
            setShowFormModal(false)
            fetchReferees()
          }}
        />
      )}

      {showDeleteModal && (
        <DeleteConfirmModal
          referee={selectedReferee}
          onClose={() => setShowDeleteModal(false)}
          onConfirm={handleDeleteConfirm}
        />
      )}
    </div>
  )
}

export default ManageReferees
