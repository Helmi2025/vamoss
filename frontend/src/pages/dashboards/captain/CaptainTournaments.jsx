import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../api/axiosInstance'
import TournamentBracket from '../admin/TournamentBracket'
import basketLogo from '../../../assets/Tlogos/basket.webp'
import footLogo   from '../../../assets/Tlogos/foot.webp'
import padelLogo  from '../../../assets/Tlogos/padel.webp'
import tennisLogo from '../../../assets/Tlogos/tennis.png'
import './CaptainTournaments.css'

/* ── Sport logo resolver ── */
function getSportLogo(sportName) {
  if (!sportName) return null
  const n = sportName.toLowerCase()
  if (n.includes('basket')) return basketLogo
  if (n.includes('foot') || n.includes('soccer')) return footLogo
  if (n.includes('padel')) return padelLogo
  if (n.includes('tennis')) return tennisLogo
  return null
}

function SportLogo({ sportName, size = 48 }) {
  const src = getSportLogo(sportName)
  const initial = sportName ? sportName.charAt(0).toUpperCase() : '?'
  if (src) {
    return (
      <img
        src={src}
        alt={sportName}
        className="tournament-card-sport-logo"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div className="tournament-card-sport-logo-placeholder" style={{ width: size, height: size }}>
      {initial}
    </div>
  )
}

/* ── Inline SVG Icons ── */
const IconClose      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconTournament = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
const IconCheck      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconTrophy     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a5 5 0 0 0-6 4.88c0 3 2.1 5.37 5 5.8V2z"/></svg>
const IconSearch     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconUsers      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconLogout     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>

/* ─────────────────────────────────────────────
   TOAST NOTIFICATION (bottom-right)
   ───────────────────────────────────────────── */
function Toast({ toasts }) {
  return (
    <div className="toast-container" aria-live="polite" aria-atomic="false">
      {toasts.map(t => (
        <div key={t.id} className={`toast toast-${t.type}`}>
          <span className="toast-icon">
            {t.type === 'success' ? <IconCheck /> : <IconClose />}
          </span>
          <span className="toast-message">{t.message}</span>
        </div>
      ))}
    </div>
  )
}

/* ─────────────────────────────────────────────
   REGISTER CONFIRMATION MODAL
   ───────────────────────────────────────────── */
function RegisterConfirmModal({ tournament, onConfirm, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box sm">
        <div className="modal-header">
          <h2 className="modal-title">Register Team</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" disabled={loading}>
            <IconClose />
          </button>
        </div>
        <p className="confirm-text">
          Register your team for <strong>{tournament.name}</strong>?
          Make sure your roster is ready before the tournament starts.
        </p>
        <div className="confirm-btns">
          <button className="btn-outline-gold" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-gold" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : (
              <><span style={{ width: 14, height: 14, display: 'flex', alignItems: 'center' }}><IconCheck /></span> Register</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   UNREGISTER CONFIRMATION MODAL
   ───────────────────────────────────────────── */
function UnregisterConfirmModal({ tournament, onConfirm, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box sm">
        <div className="modal-header">
          <h2 className="modal-title">Unregister Team</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" disabled={loading}>
            <IconClose />
          </button>
        </div>
        <p className="confirm-text">
          Are you sure you want to unregister your team from <strong>{tournament.name}</strong>?
          You can re-register later as long as registration is still open and there are spots available.
        </p>
        <div className="confirm-btns">
          <button className="btn-outline-gold" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" style={{ width: 14, height: 14 }} /> : (
              <><span style={{ width: 14, height: 14, display: 'flex', alignItems: 'center' }}><IconLogout /></span> Unregister</>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   TOURNAMENT DETAIL MODAL
   Shows registered participants (if REGISTRATION_OPEN)
   or the bracket (if bracket exists and not cancelled)
   ───────────────────────────────────────────── */
function TournamentDetailModal({ tournament, teamId, onClose }) {
  const isRegistrationOpen = tournament.status === 'REGISTRATION_OPEN'
  const hasBracket = ['BRACKET_GENERATED', 'IN_PROGRESS', 'COMPLETED'].includes(tournament.status)

  const [participants, setParticipants] = useState([])
  const [bracketData, setBracketData]   = useState(null)
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        if (isRegistrationOpen) {
          const { data } = await api.get(`/api/tournaments/${tournament.id}/participants/details`)
          setParticipants(data)
        } else if (hasBracket) {
          const { data } = await api.get(`/api/tournaments/${tournament.id}/bracket`)
          setBracketData(data)
        }
      } catch {
        setError('Failed to load tournament details.')
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tournament.id, isRegistrationOpen, hasBracket])

  return (
    <div
      className={`modal-overlay ${isRegistrationOpen ? 'participants-modal-overlay' : 'bracket-modal-overlay'}`}
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className={`modal-box ${isRegistrationOpen ? 'participants-modal-box' : 'bracket-modal-box'}`}>
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#c6a84b' }}>
              {isRegistrationOpen ? <IconUsers /> : <IconTrophy />}
            </span>
            <div>
              <h2 className="modal-title">{tournament.name}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', marginTop: 2 }}>
                {isRegistrationOpen ? 'Registered Teams' : 'Tournament Bracket'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <span className="spinner light" style={{ width: 28, height: 28 }} />
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="form-error" style={{ margin: '20px 0' }}>{error}</div>
        )}

        {/* Participant list — REGISTRATION_OPEN */}
        {!loading && !error && isRegistrationOpen && (
          <div className="td-participants-list">
            {participants.length === 0 ? (
              <div className="td-participants-empty">
                <IconUsers />
                <p>No teams registered yet.</p>
              </div>
            ) : (
              participants.map((p) => (
                <div
                  key={p.id}
                  className={`td-participant-row ${teamId && p.id === teamId ? 'td-participant-mine' : ''}`}
                >
                  <div className="td-participant-logo-wrap">
                    {p.logoUrl ? (
                      <img src={p.logoUrl} alt={p.name} className="td-participant-logo" />
                    ) : (
                      <div className="td-participant-logo-placeholder">
                        {p.name ? p.name.charAt(0).toUpperCase() : '?'}
                      </div>
                    )}
                  </div>
                  <span className="td-participant-name">{p.name}</span>
                  {teamId && p.id === teamId && (
                    <span className="td-my-team-tag">
                      <IconCheck /> My Team
                    </span>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        {/* Bracket — BRACKET_GENERATED / IN_PROGRESS / COMPLETED */}
        {!loading && !error && hasBracket && (
          <TournamentBracket bracketData={bracketData} highlightTeamId={teamId} />
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
function CaptainTournaments() {
  const { user } = useAuth()

  const [teamInfo, setTeamInfo]               = useState(null)
  const [tournaments, setTournaments]         = useState([])
  const [participantsMap, setParticipantsMap] = useState({})
  const [detailTarget, setDetailTarget]       = useState(null)

  const [loading, setLoading]                 = useState(true)
  const [regLoadingId, setRegLoadingId]       = useState(null)
  const [unregLoadingId, setUnregLoadingId]   = useState(null)
  const [regTarget, setRegTarget]             = useState(null)
  const [unregTarget, setUnregTarget]         = useState(null)
  const [toasts, setToasts]                   = useState([])
  const toastIdRef                            = useRef(0)

  const showToast = useCallback((message, type = 'success') => {
    const id = ++toastIdRef.current
    setToasts(prev => [...prev, { id, message, type }])
    setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), 3500)
  }, [])

  // ── Filters ──
  const [search, setSearch]         = useState('')
  const [myTeamOnly, setMyTeamOnly] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      // 1. Fetch team info
      const teamRes = await api.get(`/api/captain/team/${user.userId}`)
      setTeamInfo(teamRes.data)

      if (teamRes.data && teamRes.data.teamId) {
        // 2. Fetch tournaments
        const tourneyRes = await api.get('/api/tournaments')
        // Filter by captain's team sport
        const filtered = tourneyRes.data.filter(t => t.sportId === teamRes.data.sportId)
        setTournaments(filtered)

        // 3. Fetch participants for all filtered tournaments
        const pMap = {}
        await Promise.all(
          filtered.map(async (t) => {
            try {
              const pRes = await api.get(`/api/tournaments/${t.id}/participants`)
              pMap[t.id] = pRes.data
            } catch {
              pMap[t.id] = []
            }
          })
        )
        setParticipantsMap(pMap)
      }
    } catch (err) {
      if (err.response?.status !== 400 && err.response?.status !== 404) {
        showToast('Failed to fetch tournaments and team details.', 'error')
      } else {
        setTeamInfo(null)
      }
    } finally {
      setLoading(false)
    }
  }, [user?.userId, showToast])

  useEffect(() => {
    if (user?.userId) fetchData()
  }, [user?.userId, fetchData])

  const handleRegister = async () => {
    if (!regTarget || !teamInfo?.teamId) return

    setRegLoadingId(regTarget.id)

    try {
      await api.post(`/api/tournaments/${regTarget.id}/register-team`, {
        teamId: teamInfo.teamId
      })
      showToast('Successfully registered for tournament!', 'success')
      setRegTarget(null)
      await fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to register team.'
      showToast(typeof msg === 'string' ? msg : 'Failed to register team.', 'error')
      setRegTarget(null)
    } finally {
      setRegLoadingId(null)
    }
  }

  const handleUnregister = async () => {
    if (!unregTarget || !teamInfo) return
    setUnregLoadingId(unregTarget.id)
    try {
      await api.delete(`/api/tournaments/${unregTarget.id}/unregister-team`, {
        data: { captainId: user.userId }
      })
      showToast('Your team has been unregistered from the tournament.', 'success')
      setUnregTarget(null)
      await fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to unregister team.'
      showToast(typeof msg === 'string' ? msg : 'Failed to unregister team.', 'error')
      setUnregTarget(null)
    } finally {
      setUnregLoadingId(null)
    }
  }

  const isRegistered = (tId) => {
    const list = participantsMap[tId] || []
    return list.some(p => p.participantId === teamInfo?.teamId)
  }

  const isClickable = (t) => {
    if (t.status === 'CANCELLED') return false
    // Clickable if registration open (show who registered) or bracket exists
    return t.status === 'REGISTRATION_OPEN' ||
      ['BRACKET_GENERATED', 'IN_PROGRESS', 'COMPLETED'].includes(t.status)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'REGISTRATION_OPEN': return 'status-badge pending'
      case 'READY':             return 'status-badge active'
      case 'IN_PROGRESS':       return 'status-badge active'
      case 'COMPLETED':         return 'status-badge completed'
      case 'CANCELLED':         return 'status-badge inactive'
      default:                  return 'status-badge'
    }
  }

  const formatStatusText = (status) => {
    if (!status || status === 'BRACKET_GENERATED') return null
    return status.replace(/_/g, ' ')
  }

  // ── Derived filtered list ──
  const visibleTournaments = tournaments.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    if (myTeamOnly && !isRegistered(t.id)) return false
    return true
  })

  if (loading) {
    return (
      <div className="empty-state">
        <span className="spinner light" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  if (!teamInfo || !teamInfo.teamId) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><IconTournament /></div>
        <h3>No Team Found</h3>
        <p style={{ maxWidth: 460, margin: '8px auto 20px', color: '#666', lineHeight: 1.6 }}>
          You need to assign and rename your team under <strong>"Manage Team"</strong> before you can register for tournaments.
        </p>
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tournaments</h1>
        <p className="page-subtitle">
          Open tournaments for <strong style={{ color: '#c6a84b' }}>{teamInfo.sportName}</strong>
        </p>
      </div>

      {/* ── Filter Bar ── */}
      {tournaments.length > 0 && (
        <div className="tournament-filter-bar">
          <div className="tournament-search-wrap">
            <span className="tournament-search-icon"><IconSearch /></span>
            <input
              className="tournament-search-input"
              type="text"
              placeholder="Search by name…"
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
            {search && (
              <button className="tournament-search-clear" onClick={() => setSearch('')} aria-label="Clear search">
                <IconClose />
              </button>
            )}
          </div>
          <button
            className={`tournament-filter-pill ${myTeamOnly ? 'active' : ''}`}
            onClick={() => setMyTeamOnly(v => !v)}
          >
            <IconCheck /> My Team
          </button>
        </div>
      )}

      {tournaments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconTournament /></div>
          <p>No tournaments scheduled for your sport at the moment.</p>
        </div>
      ) : visibleTournaments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconTournament /></div>
          <p>No tournaments match your filters.</p>
        </div>
      ) : (
        <div className="tournaments-grid">
          {visibleTournaments.map((t) => {
            const registered  = isRegistered(t.id)
            const isFull      = t.currentParticipants >= t.participantLimit
            const hasBracket  = ['BRACKET_GENERATED', 'IN_PROGRESS', 'COMPLETED'].includes(t.status)
            const clickable   = isClickable(t)

            return (
              <div
                key={t.id}
                className={`tournament-card${clickable ? ' tournament-card-clickable' : ''}`}
                onClick={clickable ? () => setDetailTarget(t) : undefined}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={clickable ? (e) => e.key === 'Enter' && setDetailTarget(t) : undefined}
                aria-label={clickable ? `View details for ${t.name}` : undefined}
              >
                {/* Top: sport logo + title + status */}
                <div className="tournament-card-top">
                  <SportLogo sportName={teamInfo?.sportName} />
                  <div className="tournament-card-top-info">
                    <h3 className="tournament-card-title">{t.name}</h3>
                    {formatStatusText(t.status) && (
                      <span className={getStatusBadgeClass(t.status)} style={{ alignSelf: 'flex-start' }}>
                        {formatStatusText(t.status)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="tournament-card-divider" />

                {/* Info rows */}
                <div className="tournament-card-body">
                  <div className="tournament-card-info-row">
                    <span className="info-label">Start Date</span>
                    <span className="info-value">
                      {new Date(t.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                    </span>
                  </div>
                  <div className="tournament-card-info-row">
                    <span className="info-label">Format</span>
                    <span className="info-value">Single Elimination</span>
                  </div>
                  <div className="tournament-card-info-row">
                    <span className="info-label">Participants</span>
                    <span className="info-value">{t.currentParticipants} / {t.participantLimit}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="tournament-card-actions">
                  {(() => {
                    const isRegLoading   = regLoadingId === t.id
                    const isUnregLoading = unregLoadingId === t.id
                    const anyLoading     = isRegLoading || isUnregLoading

                    if (registered && t.status === 'REGISTRATION_OPEN') {
                      return (
                        <button
                          className="btn-action btn-unregister"
                          onClick={(e) => { e.stopPropagation(); setUnregTarget(t) }}
                          disabled={anyLoading}
                          style={{ flex: 1 }}
                        >
                          {isUnregLoading ? <span className="spinner" /> : 'Unregister'}
                        </button>
                      )
                    }

                    if (registered) {
                      return (
                        <div className="registered-badge">
                          <IconCheck /> Registered
                        </div>
                      )
                    }

                    if (t.status === 'REGISTRATION_OPEN' && isFull) {
                      return (
                        <button className="btn-action" disabled onClick={(e) => e.stopPropagation()}
                          style={{ flex: 1, opacity: 0.5, border: '1px solid #333', color: '#555' }}>
                          Tournament Full
                        </button>
                      )
                    }

                    if (t.status === 'REGISTRATION_OPEN') {
                      return (
                        <button
                          className="btn-action view"
                          onClick={(e) => { e.stopPropagation(); setRegTarget(t) }}
                          disabled={anyLoading}
                          style={{ flex: 1 }}
                        >
                          {isRegLoading ? <span className="spinner" /> : 'Register Team'}
                        </button>
                      )
                    }

                    if (!hasBracket) {
                      return (
                        <button className="btn-action" disabled onClick={(e) => e.stopPropagation()}
                          style={{ flex: 1, opacity: 0.5, border: '1px solid #333', color: '#555' }}>
                          Registration Closed
                        </button>
                      )
                    }

                    return null
                  })()}

                  {clickable && (
                    <div className="td-click-hint">
                      {t.status === 'REGISTRATION_OPEN' ? 'View Registered Teams' : 'View Bracket'} →
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {detailTarget && (
        <TournamentDetailModal
          tournament={detailTarget}
          teamId={teamInfo?.teamId}
          onClose={() => setDetailTarget(null)}
        />
      )}

      {regTarget && (
        <RegisterConfirmModal
          tournament={regTarget}
          loading={regLoadingId === regTarget.id}
          onConfirm={handleRegister}
          onClose={() => setRegTarget(null)}
        />
      )}

      {unregTarget && (
        <UnregisterConfirmModal
          tournament={unregTarget}
          loading={unregLoadingId === unregTarget.id}
          onConfirm={handleUnregister}
          onClose={() => setUnregTarget(null)}
        />
      )}

      <Toast toasts={toasts} />
    </div>
  )
}

export default CaptainTournaments
