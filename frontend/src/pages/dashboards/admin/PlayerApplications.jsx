import { useState, useEffect, useCallback } from 'react'
import api from '../../../api/axiosInstance'
import '../AdminDashboard.css'

/* ── Icons ── */
const IconCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconX       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconClose   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconRefresh = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"   strokeLinecap="round"><polyline points="1 4 1 10 7 10"/><path d="M3.51 15a9 9 0 1 0 .49-4.95"/></svg>
const IconDoc     = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>

/* ══════════════════════════════════════════════════════════
   TOAST
══════════════════════════════════════════════════════════ */
function Toast({ toasts, onDismiss }) {
  return (
    <>
      <style>{`
        @keyframes toast-in {
          from { opacity: 0; transform: translateX(28px); }
          to   { opacity: 1; transform: translateX(0); }
        }
      `}</style>
      <div style={{
        position: 'fixed', bottom: 24, right: 24,
        display: 'flex', flexDirection: 'column', gap: 10,
        zIndex: 9999, pointerEvents: 'none',
      }}>
        {toasts.map((t) => (
          <div
            key={t.id}
            style={{
              pointerEvents: 'auto',
              display: 'flex', alignItems: 'flex-start', gap: 12,
              padding: '14px 16px',
              background: '#111',
              border: `1px solid ${t.type === 'success' ? 'rgba(198,168,75,0.3)' : 'rgba(220,53,69,0.3)'}`,
              borderLeft: `3px solid ${t.type === 'success' ? '#c6a84b' : '#e05555'}`,
              borderRadius: 3,
              minWidth: 280, maxWidth: 360,
              boxShadow: '0 8px 32px rgba(0,0,0,0.55)',
              fontFamily: "'Montserrat', sans-serif",
              animation: 'toast-in 0.25s ease',
            }}
          >
            {/* Status dot */}
            <span style={{
              flexShrink: 0, width: 20, height: 20, borderRadius: '50%', marginTop: 1,
              background: t.type === 'success' ? 'rgba(198,168,75,0.15)' : 'rgba(220,53,69,0.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: t.type === 'success' ? '#c6a84b' : '#e07070',
            }}>
              {t.type === 'success'
                ? <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
                : <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              }
            </span>

            {/* Message */}
            <div style={{ flex: 1 }}>
              <p style={{
                fontSize: '0.78rem', fontWeight: 700, letterSpacing: '0.05em',
                color: t.type === 'success' ? '#c6a84b' : '#e07070',
                marginBottom: 3,
              }}>
                {t.type === 'success' ? 'Success' : 'Error'}
              </p>
              <p style={{ fontSize: '0.77rem', color: '#888', lineHeight: 1.55 }}>
                {t.message}
              </p>
            </div>

            {/* Dismiss */}
            <button
              onClick={() => onDismiss(t.id)}
              style={{
                background: 'none', border: 'none', cursor: 'pointer',
                color: '#444', padding: 2, flexShrink: 0,
                display: 'flex', alignItems: 'center',
                transition: 'color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.color = '#aaa')}
              onMouseLeave={(e) => (e.currentTarget.style.color = '#444')}
              aria-label="Dismiss notification"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>
        ))}
      </div>
    </>
  )
}

/* ══════════════════════════════════════════════════════════
   CONFIRM MODAL
══════════════════════════════════════════════════════════ */
function ConfirmModal({ action, player, reason, onReasonChange, loading, onConfirm, onClose }) {
  const isApprove = action === 'approve'

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal-box sm">
        <div className="modal-header">
          <h2 className="modal-title">
            {isApprove ? 'Approve Player' : 'Reject Application'}
          </h2>
          <button className="modal-close" onClick={onClose} disabled={loading} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <p className="confirm-text">
          {isApprove ? (
            <>Are you sure you want to approve <span className="confirm-name">{player.fullName}</span>? They will receive an email and gain access to the platform.</>
          ) : (
            <>Are you sure you want to reject <span className="confirm-name">{player.fullName}</span>? They will be notified by email.</>
          )}
        </p>

        {!isApprove && (
          <div className="form-group">
            <label className="form-label">
              Reason <span style={{ color: '#555', textTransform: 'none', letterSpacing: 0 }}>(optional)</span>
            </label>
            <textarea
              className="form-textarea"
              placeholder="Provide a reason for rejection…"
              value={reason}
              onChange={(e) => onReasonChange(e.target.value)}
              rows={3}
              disabled={loading}
            />
          </div>
        )}

        <div className="confirm-btns">
          <button className="btn-outline-gold" onClick={onClose} disabled={loading}>Cancel</button>
          <button
            className={isApprove ? 'btn-gold' : 'btn-danger'}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading
              ? <span className="spinner" style={isApprove ? {} : { borderColor: 'rgba(220,53,69,0.25)', borderTopColor: '#e07070' }} />
              : isApprove ? <IconCheck /> : <IconX />
            }
            {loading ? 'Processing…' : isApprove ? 'Approve' : 'Reject'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ══════════════════════════════════════════════════════════
   MAIN COMPONENT
══════════════════════════════════════════════════════════ */
function PlayerApplications({ onCountChange }) {
  const [applications, setApplications] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [confirm,      setConfirm]      = useState(null)
  const [reason,       setReason]       = useState('')
  const [actLoading,   setActLoading]   = useState(false)
  const [toasts,       setToasts]       = useState([])

  /* ── Toast helpers ── */
  const pushToast = useCallback((type, message) => {
    const id = Date.now()
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 4500)
  }, [])

  const dismissToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  /* ── Data ── */
  const fetchApplications = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/admin/player-applications')
      setApplications(data)
      onCountChange?.(data.length)
    } catch {
      setError('Failed to load applications.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchApplications() }, [])

  /* ── Modal helpers ── */
  const openConfirm = (action, player) => {
    setReason('')
    setConfirm({ action, player })
  }

  const closeConfirm = () => {
    if (actLoading) return
    setConfirm(null)
    setReason('')
  }

  /* ── Approve / reject ── */
  const handleAction = async () => {
    const { action, player } = confirm
    setActLoading(true)
    try {
      if (action === 'approve') {
        await api.put(`/api/admin/player-applications/${player.userId}/approve`)
        pushToast('success', `${player.fullName} has been approved. A confirmation email was sent.`)
      } else {
        await api.put(`/api/admin/player-applications/${player.userId}/reject`, {
          reason: reason.trim() || null,
        })
        pushToast('success', `${player.fullName}'s application has been rejected.`)
      }
      setApplications((prev) => {
        const updated = prev.filter((a) => a.userId !== player.userId)
        onCountChange?.(updated.length)
        return updated
      })
      closeConfirm()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Action failed. Please try again.'
      pushToast('error', typeof msg === 'string' ? msg : 'Action failed. Please try again.')
      closeConfirm()
    } finally {
      setActLoading(false)
    }
  }

  /* ── Helpers ── */
  const formatDate = (raw) => {
    if (!raw) return '—'
    try {
      return new Date(raw).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    } catch { return raw }
  }

  /* ── Render ── */
  return (
    <div>
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Player Applications</h1>
          <p className="page-subtitle">{applications.length} pending application{applications.length !== 1 ? 's' : ''}</p>
        </div>
        <button className="btn-outline-gold" onClick={fetchApplications} disabled={loading}>
          <IconRefresh /> Refresh
        </button>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}

      <div className="content-card" style={{ padding: 0 }}>
        {loading ? (
          <div className="empty-state">
            <span className="spinner light" style={{ width: 28, height: 28 }} />
          </div>
        ) : applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon"><IconDoc /></div>
            <p>No pending player applications.</p>
          </div>
        ) : (
          <div className="app-table-wrap">
            <table className="app-table">
              <thead>
                <tr>
                  <th>Player</th><th>Email</th><th>Gender</th><th>Sport</th>
                  <th>Applied</th><th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {applications.map((app) => (
                  <tr key={app.userId}>
                    <td style={{ color: '#fff', fontWeight: 600 }}>{app.fullName}</td>
                    <td style={{ color: '#888' }}>{app.email}</td>
                    <td>
                      {app.gender === 'MALE'   && <span style={{ color: '#7eb8f7' }}>♂ Man</span>}
                      {app.gender === 'FEMALE' && <span style={{ color: '#f7a8c4' }}>♀ Woman</span>}
                      {!app.gender             && <span style={{ color: '#555' }}>—</span>}
                    </td>
                    <td>{app.sportName || '—'}</td>
                    <td style={{ color: '#666' }}>{formatDate(app.appliedAt)}</td>
                    <td>
                      {app.accountStatus === 'PENDING_REVIEW' ? (
                        <div className="action-btns">
                          <button className="btn-outline-gold" style={{ padding: '6px 14px' }} onClick={() => openConfirm('approve', app)}>
                            <IconCheck /> Approve
                          </button>
                          <button className="btn-danger" style={{ padding: '6px 14px' }} onClick={() => openConfirm('reject', app)}>
                            <IconX /> Reject
                          </button>
                        </div>
                      ) : (
                        <span style={{ fontSize: '0.75rem', color: '#444' }}>—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {confirm && (
        <ConfirmModal
          action={confirm.action}
          player={confirm.player}
          reason={reason}
          onReasonChange={setReason}
          loading={actLoading}
          onConfirm={handleAction}
          onClose={closeConfirm}
        />
      )}

      <Toast toasts={toasts} onDismiss={dismissToast} />
    </div>
  )
}

export default PlayerApplications
