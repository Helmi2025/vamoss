import { useState, useEffect, useCallback, useRef } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../../api/axiosInstance'
import AuthImage from '../../../components/AuthImage'
import TournamentBracket from './TournamentBracket'
import './TournamentDetail.css'

/* ── Inline SVG Icons ── */
const IconClose     = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconArrowLeft = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/></svg>
const IconTrash     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
const IconSettings  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
const IconEdit      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
const IconCalendar  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
const IconTeam      = () => <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="18" cy="7" r="2"/><path d="M22 21v-1.5a3 3 0 0 0-2-2.83"/></svg>
const IconDots      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5"  cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
const IconUserSvg   = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>

/* ─────────────────────────────────────────────
   TEAM LOGO
   ───────────────────────────────────────────── */
function TeamLogo({ logoUrl, size = 56 }) {
  const placeholder = (
    <div style={{
      width: size, height: size, borderRadius: 8,
      background: 'rgba(198,168,75,0.08)',
      border: '1px solid rgba(198,168,75,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(198,168,75,0.35)', flexShrink: 0,
    }}>
      <IconTeam />
    </div>
  )
  if (!logoUrl) return placeholder
  return (
    <AuthImage
      src={logoUrl}
      alt="Team logo"
      style={{ width: size, height: size, borderRadius: 8, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(198,168,75,0.18)' }}
      placeholder={placeholder}
    />
  )
}

/* ─────────────────────────────────────────────
   AVATAR (for TeamDetailsModal)
   ───────────────────────────────────────────── */
function Avatar({ src, name, size = 48 }) {
  const initials = name ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase() : '?'
  const placeholder = (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(198,168,75,0.1)', border: '1px solid rgba(198,168,75,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#c6a84b', fontSize: size * 0.35, fontWeight: 700, flexShrink: 0,
    }}>
      {initials}
    </div>
  )
  if (!src) return placeholder
  if (src.startsWith('data:')) {
    return <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(198,168,75,0.25)' }} />
  }
  return (
    <AuthImage src={src} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(198,168,75,0.25)' }}
      placeholder={placeholder}
    />
  )
}

/* ─────────────────────────────────────────────
   TEAM DETAILS MODAL (read-only view from manage teams)
   ───────────────────────────────────────────── */
function TeamDetailsModal({ teamId, onClose }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  useEffect(() => {
    if (!teamId) return
    setLoading(true)
    setError('')
    api.get(`/api/admin/teams/${teamId}`)
      .then(({ data }) => setDetails(data))
      .catch(() => setError('Failed to load team details.'))
      .finally(() => setLoading(false))
  }, [teamId])

  const formatDate = (iso) => {
    if (!iso) return '–'
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  function ModalTeamLogo({ logoUrl, teamName, size = 80 }) {
    const initials = teamName ? teamName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
    const placeholder = (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'rgba(198,168,75,0.1)', border: '3px solid rgba(198,168,75,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#c6a84b', fontWeight: 700, fontSize: size * 0.28, flexShrink: 0,
      }}>{initials}</div>
    )
    if (!logoUrl) return placeholder
    return (
      <AuthImage src={logoUrl} alt={`${teamName} logo`}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '3px solid rgba(198,168,75,0.4)' }}
        placeholder={placeholder}
      />
    )
  }

  const SectionLabel = ({ children }) => (
    <p style={{ fontSize: 11, fontWeight: 700, color: 'rgba(198,168,75,0.6)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, marginTop: 0 }}>
      {children}
    </p>
  )

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 780, width: '100%' }}>
        <div className="modal-header">
          <h2 className="modal-title">{details ? details.teamName : 'Team Details'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span className="spinner light" style={{ width: 28, height: 28 }} />
          </div>
        )}
        {error && <div className="form-error">{error}</div>}

        {!loading && details && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            {/* Logo + name + sport + date */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <ModalTeamLogo logoUrl={details.logoUrl} teamName={details.teamName} size={80} />
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0e6c8', marginBottom: 6 }}>{details.teamName}</div>
                <span style={{ background: 'rgba(198,168,75,0.12)', border: '1px solid rgba(198,168,75,0.3)', color: '#c6a84b', fontSize: 12, padding: '3px 12px', borderRadius: 20, fontWeight: 600 }}>
                  {details.sportName}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 20px', background: 'rgba(198,168,75,0.06)', border: '1px solid rgba(198,168,75,0.15)', borderRadius: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#f0e6c8' }}>{formatDate(details.createdAt)}</span>
                <span style={{ fontSize: 11, color: 'rgba(198,168,75,0.65)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Since</span>
              </div>
            </div>

            <div style={{ height: 1, background: 'rgba(198,168,75,0.12)' }} />

            {/* Captain */}
            {details.captain && (
              <div>
                <SectionLabel>Captain</SectionLabel>
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'rgba(198,168,75,0.05)', border: '1px solid rgba(198,168,75,0.15)', borderRadius: 10 }}>
                  <Avatar src={details.captain.photoUrl} name={details.captain.fullName} size={52} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#f0e6c8' }}>{details.captain.fullName}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(198,168,75,0.6)' }}>Team Captain</p>
                  </div>
                  <span style={{ marginLeft: 'auto', background: 'linear-gradient(135deg, #c6a84b, #a8852e)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '4px 12px', borderRadius: 20 }}>Captain</span>
                </div>
              </div>
            )}

            {/* Players */}
            {details.players && details.players.length > 0 && (
              <div>
                <SectionLabel>Squad ({details.players.length})</SectionLabel>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
                  {details.players.map((pl) => (
                    <div key={pl.playerId} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(198,168,75,0.08)', borderRadius: 8 }}>
                      <Avatar src={pl.photoUrl} name={pl.fullName} size={36} />
                      <div style={{ overflow: 'hidden' }}>
                        <p style={{ margin: 0, fontSize: 13, fontWeight: 600, color: '#f0e6c8', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pl.fullName}</p>
                        <p style={{ margin: '2px 0 0', fontSize: 11, color: 'rgba(198,168,75,0.5)' }}>Player</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   UNREGISTER CONFIRMATION MODAL
   ───────────────────────────────────────────── */
function UnregisterConfirmModal({ teamName, onConfirm, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 440 }}>
        <div className="modal-header">
          <h2 className="modal-title">Unregister Team</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <p style={{ color: '#aaa', fontSize: '0.9rem', lineHeight: 1.6, margin: '0 0 24px' }}>
          Are you sure you want to unregister <strong style={{ color: '#f0e6c8' }}>{teamName}</strong> from this tournament? This action cannot be undone.
        </p>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn-outline-gold" onClick={onClose} disabled={loading}>Cancel</button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading ? <span className="spinner" /> : <><IconTrash /> Unregister</>}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   DOUBLES PAIR CARD  (admin participants tab)
   ───────────────────────────────────────────── */
function DoublesParticipantCard({ participant, pairIndex, player1, player2, canRemove, onUnregister }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const teamLabel = `Team ${pairIndex + 1}`

  return (
    <div className="dbl-pair-card">
      {/* Three-dot menu */}
      {canRemove && (
        <div className="ptd-dots-wrap" ref={menuRef}>
          <button
            className="ptd-dots-btn"
            aria-label="Options"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
          >
            <IconDots />
          </button>
          {menuOpen && (
            <div className="ptd-dropdown">
              <button
                className="ptd-dropdown-item danger"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onUnregister(participant) }}
              >
                <IconTrash /> Unregister
              </button>
            </div>
          )}
        </div>
      )}

      {/* Team label */}
      <div className="dbl-pair-label">{teamLabel}</div>

      {/* Players */}
      <div className="dbl-pair-players">
        {[player1, player2].map((pl, idx) => (
          <div key={idx} className="dbl-player-row">
            <div className="dbl-player-avatar-wrap">
              {pl?.photoUrl ? (
                <AuthImage
                  src={pl.photoUrl}
                  alt={pl.fullName}
                  style={{ width: 44, height: 44, borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(198,168,75,0.25)' }}
                  placeholder={
                    <div className="dbl-player-avatar-placeholder">
                      {pl.fullName ? pl.fullName.charAt(0).toUpperCase() : '?'}
                    </div>
                  }
                />
              ) : (
                <div className="dbl-player-avatar-placeholder">
                  {pl?.fullName ? pl.fullName.charAt(0).toUpperCase() : <IconUserSvg />}
                </div>
              )}
            </div>
            <span className="dbl-player-name">{pl?.fullName || 'Unknown Player'}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   PARTICIPANT TEAM CARD
   ───────────────────────────────────────────── */
function ParticipantTeamCard({ participant, team, canRemove, onViewTeam, onUnregister }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [menuOpen])

  const teamName = team ? team.teamName : `Team ${participant.participantId.substring(0, 8)}`
  const sportName = team?.sportName || ''
  const playerCount = team?.playerCount ?? '–'

  return (
    <div className="ptd-team-card">
      {/* Three-dot menu */}
      {canRemove && (
        <div className="ptd-dots-wrap" ref={menuRef}>
          <button
            className="ptd-dots-btn"
            aria-label="Options"
            onClick={(e) => { e.stopPropagation(); setMenuOpen((v) => !v) }}
          >
            <IconDots />
          </button>
          {menuOpen && (
            <div className="ptd-dropdown">
              <button
                className="ptd-dropdown-item danger"
                onClick={(e) => { e.stopPropagation(); setMenuOpen(false); onUnregister(participant) }}
              >
                <IconTrash /> Unregister
              </button>
            </div>
          )}
        </div>
      )}

      {/* Clickable area */}
      <div
        className="ptd-card-inner"
        role="button"
        tabIndex={0}
        onClick={() => team && onViewTeam(team.teamId)}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && team && onViewTeam(team.teamId)}
        aria-label={`View ${teamName} details`}
      >
        <div className="ptd-logo-wrap">
          <TeamLogo logoUrl={team?.logoUrl} size={60} />
        </div>
        <div className="ptd-info">
          <div className="ptd-name">{teamName}</div>
          {sportName && <div className="ptd-sport">{sportName}</div>}
          <div className="ptd-players">
            <span className="ptd-players-label">Players</span>
            <span className="ptd-players-value">{playerCount}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   RECORD / EDIT RESULT MODAL
   ───────────────────────────────────────────── */
function RecordResultModal({ match, onClose, onRecorded }) {
  const isEdit = match.status === 'PLAYED'
  const [score1, setScore1] = useState(isEdit && match.score1 != null ? String(match.score1) : '')
  const [score2, setScore2] = useState(isEdit && match.score2 != null ? String(match.score2) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const p1Name = match.participant1?.name || `Participant ${match.participant1Id?.substring(0, 5)}`
  const p2Name = match.participant2?.name || `Participant ${match.participant2Id?.substring(0, 5)}`

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (score1 === '' || score2 === '') return setError('Both scores are required.')
    const s1 = Number(score1)
    const s2 = Number(score2)
    if (isNaN(s1) || s1 < 0 || s1 > 999) return setError('Score 1 must be between 0 and 999.')
    if (isNaN(s2) || s2 < 0 || s2 > 999) return setError('Score 2 must be between 0 and 999.')
    if (s1 === s2) return setError('Draws are not permitted in single-elimination tournaments.')

    setLoading(true)
    setError('')
    try {
      const { data } = await api.put(`/api/matches/${match.id}/result`, { score1: s1, score2: s2 })
      onRecorded(data)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to record match result.'
      setError(typeof msg === 'string' ? msg : 'Failed to record match result.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">{isEdit ? 'Edit Match Result' : 'Record Match Result'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="score-inputs-container">
            <div className="form-group score-field">
              <label className="form-label text-ellipsis" htmlFor="score1">{p1Name}</label>
              <input id="score1" className="form-input score-box" type="number" min="0" max="999"
                placeholder="Score" value={score1}
                onChange={(e) => { setError(''); setScore1(e.target.value) }} disabled={loading} />
            </div>
            <div className="score-vs">VS</div>
            <div className="form-group score-field">
              <label className="form-label text-ellipsis" htmlFor="score2">{p2Name}</label>
              <input id="score2" className="form-input score-box" type="number" min="0" max="999"
                placeholder="Score" value={score2}
                onChange={(e) => { setError(''); setScore2(e.target.value) }} disabled={loading} />
            </div>
          </div>
          {error && <div className="form-error">{error}</div>}
          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="button" className="btn-outline-gold" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? <span className="spinner" /> : isEdit ? 'Save Changes' : 'Record Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SCHEDULE MATCH MODAL
   ───────────────────────────────────────────── */
function ScheduleMatchModal({ match, tournament, onClose, onScheduled }) {
  const [scheduledDateTime, setScheduledDateTime] = useState(
    match.scheduledDate ? match.scheduledDate.substring(0, 16) : ''
  )
  const [fieldId, setFieldId] = useState(match.fieldId || '')
  const [fields, setFields] = useState([])
  const [fieldsLoading, setFieldsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Build datetime-local min/max from tournament dates
  const minDt = tournament.startDate ? `${tournament.startDate}T00:00` : undefined
  const maxDt = tournament.endDate   ? `${tournament.endDate}T23:59`   : undefined

  useEffect(() => {
    // Fetch available fields for this sport. If this is a reschedule and the
    // currently-assigned field is now marked unavailable (because it was booked
    // by this very match), fetch it separately and include it in the list.
    const load = async () => {
      try {
        const { data: availableFields } = await api.get(
          `/api/fields?sportId=${tournament.sportId}&available=true`
        )
        let list = availableFields

        // Re-include the currently assigned field even if unavailable
        if (match.fieldId && !list.find(f => f.id === match.fieldId)) {
          try {
            const { data: currentField } = await api.get(`/api/fields/${match.fieldId}`)
            list = [currentField, ...list]
          } catch {
            // silently ignore — field may have been deleted
          }
        }

        setFields(list)
      } catch {
        setError('Could not load fields.')
      } finally {
        setFieldsLoading(false)
      }
    }
    load()
  }, [tournament.sportId, match.fieldId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!scheduledDateTime) return setError('Date and time are required.')
    if (!fieldId) return setError('Please select a field.')

    setLoading(true)
    setError('')
    try {
      const { data } = await api.put(`/api/matches/${match.id}/schedule`, {
        scheduledDateTime,
        fieldId
      })
      onScheduled(data)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to schedule match.'
      setError(typeof msg === 'string' ? msg : 'Failed to schedule match.')
    } finally {
      setLoading(false)
    }
  }

  const p1Name = match.participant1?.name || match.participant1Id?.substring(0, 8) || 'TBD'
  const p2Name = match.participant2?.name || match.participant2Id?.substring(0, 8) || 'TBD'

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">
            {match.scheduledDate ? 'Reschedule Match' : 'Schedule Match'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 16 }}>
          <strong style={{ color: '#c6a84b' }}>{p1Name}</strong> vs <strong style={{ color: '#c6a84b' }}>{p2Name}</strong>
        </p>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="sched-dt">Date &amp; Time</label>
            <input
              id="sched-dt"
              className="form-input"
              type="datetime-local"
              min={minDt}
              max={maxDt}
              value={scheduledDateTime}
              onChange={(e) => { setError(''); setScheduledDateTime(e.target.value) }}
              disabled={loading}
              style={{ colorScheme: 'dark' }}
            />
            {tournament.startDate && tournament.endDate && (
              <span style={{ fontSize: '0.75rem', color: '#555', marginTop: 4, display: 'block' }}>
                Must be between {tournament.startDate} and {tournament.endDate}
              </span>
            )}
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="sched-field">Field</label>
            {fieldsLoading ? (
              <div style={{ color: '#555', fontSize: '0.82rem', padding: '8px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="spinner light" style={{ width: 14, height: 14 }} /> Loading fields…
              </div>
            ) : (
              <select
                id="sched-field"
                className="form-input"
                value={fieldId}
                onChange={(e) => { setError(''); setFieldId(e.target.value) }}
                disabled={loading}
                style={{ background: '#0a0a0a', color: fieldId ? '#fff' : '#666' }}
              >
                <option value="">-- Select a field --</option>
                {fields.map((f) => (
                  <option key={f.id} value={f.id}>{f.name}</option>
                ))}
              </select>
            )}
            {!fieldsLoading && fields.length === 0 && (
              <span style={{ fontSize: '0.75rem', color: '#e07070', marginTop: 4, display: 'block' }}>
                No available fields for this sport.
              </span>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="button" className="btn-outline-gold" onClick={onClose} disabled={loading}>Cancel</button>
            <button type="submit" className="btn-gold" disabled={loading || fieldsLoading}>
              {loading ? <span className="spinner" /> : <><IconCalendar /> {match.scheduledDate ? 'Reschedule' : 'Set Schedule'}</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN DETAILS COMPONENT
   ───────────────────────────────────────────── */
function TournamentDetail({ tournamentId }) {
  const [, setSearchParams] = useSearchParams()

  const [tournament, setTournament] = useState(null)
  const [participants, setParticipants] = useState([])
  const [matches, setMatches] = useState([])
  const [bracket, setBracket] = useState(null)
  const [sports, setSports] = useState([])
  const [teams, setTeams] = useState([])

  const [loading, setLoading] = useState(true)
  const [genLoading, setGenLoading] = useState(false)
  const [error, setError] = useState('')
  const [activeTab, setActiveTab] = useState('bracket')
  // player details keyed by playerId, for doubles pairs
  const [doublesPlayerDetails, setDoublesPlayerDetails] = useState({})
  const [scoreTarget, setScoreTarget] = useState(null)
  const [scheduleTarget, setScheduleTarget] = useState(null)

  // Team detail modal & unregister confirmation
  const [viewingTeamId, setViewingTeamId] = useState(null)
  const [unregisterTarget, setUnregisterTarget] = useState(null)   // participant object
  const [unregisterLoading, setUnregisterLoading] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [tRes, pRes, mRes, bRes, sportsRes] = await Promise.all([
        api.get(`/api/tournaments/${tournamentId}`),
        api.get(`/api/tournaments/${tournamentId}/participants`),
        api.get(`/api/tournaments/${tournamentId}/matches`),
        api.get(`/api/tournaments/${tournamentId}/bracket`),
        api.get('/api/sports')
      ])

      setTournament(tRes.data)
      setParticipants(pRes.data)
      setMatches(mRes.data)
      setBracket(bRes.data)
      setSports(sportsRes.data)

      const isTeamEnabled = sportsRes.data.find((x) => x.id === tRes.data.sportId)?.teamEnabled
      if (isTeamEnabled) {
        const teamsRes = await api.get('/api/admin/teams')
        setTeams(teamsRes.data)
      }

      // For doubles tournaments, fetch enriched participant details to get player IDs,
      // then fetch each player's name + photo via the admin endpoint.
      if (tRes.data.format === 'DOUBLES') {
        try {
          const detailsRes = await api.get(`/api/tournaments/${tournamentId}/participants/details`)
          const playerIds = new Set()
          detailsRes.data.forEach((p) => {
            if (p.player1Id) playerIds.add(p.player1Id)
            if (p.player2Id) playerIds.add(p.player2Id)
          })
          const playerEntries = await Promise.all(
            [...playerIds].map(async (pid) => {
              try {
                const r = await api.get(`/api/admin/players/${pid}`)
                return [pid, r.data]
              } catch {
                return [pid, { fullName: 'Unknown', photoUrl: null }]
              }
            })
          )
          const detailsMap = Object.fromEntries(playerEntries)
          // Store pair info keyed by participantId (doublesTeam id)
          const pairMap = {}
          detailsRes.data.forEach((p) => {
            pairMap[p.id] = { player1Id: p.player1Id, player2Id: p.player2Id }
          })
          setDoublesPlayerDetails({ players: detailsMap, pairs: pairMap })
        } catch {
          // non-fatal — table fallback will still show
        }
      }
    } catch {
      setError('Failed to load tournament detail. Verify if the server is running.')
    } finally {
      setLoading(false)
    }
  }, [tournamentId])

  useEffect(() => {
    if (tournamentId) fetchData()
  }, [tournamentId, fetchData])

  const getSportName = (sportId) => {
    const s = sports.find((x) => x.id === sportId)
    return s ? s.sportName : 'Unknown Sport'
  }

  const getParticipantName = (p) => {
    if (p.participantType === 'TEAM') {
      const team = teams.find((t) => t.teamId === p.participantId)
      return team ? team.teamName : `Team ID: ${p.participantId.substring(0, 8)}`
    }
    if (bracket && bracket.finalMatch) {
      const findName = (node) => {
        if (!node) return null
        if (node.participant1Id === p.participantId) return node.participant1?.name
        if (node.participant2Id === p.participantId) return node.participant2?.name
        return findName(node.semiFinal1) || findName(node.semiFinal2) || findName(node.quarterFinal1) || findName(node.quarterFinal2)
      }
      const found = findName(bracket.finalMatch)
      if (found) return found
    }
    if (p.participantType === 'DOUBLES_TEAM') return `Pair ID: ${p.participantId.substring(0, 8)}`
    return `Player ID: ${p.participantId.substring(0, 8)}`
  }

  const handleBack = () => setSearchParams({ section: 'tournaments' })

  const handleGenerateBracket = async () => {
    setGenLoading(true)
    setError('')
    try {
      await api.post(`/api/tournaments/${tournamentId}/generate-bracket`)
      await fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to generate bracket.'
      setError(typeof msg === 'string' ? msg : 'Failed to generate bracket.')
    } finally {
      setGenLoading(false)
    }
  }

  const handleRemoveParticipant = async (pId) => {
    setUnregisterLoading(true)
    setError('')
    try {
      await api.delete(`/api/tournaments/${tournamentId}/participants/${pId}`)
      await fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to remove participant.'
      setError(typeof msg === 'string' ? msg : 'Failed to remove participant.')
    } finally {
      setUnregisterLoading(false)
      setUnregisterTarget(null)
    }
  }

  const handleRecordSuccess = () => fetchData()
  const handleScheduleSuccess = () => fetchData()

  const getRoundLabel = (r) => {
    switch (r) {
      case 'QUARTER_FINAL': return 'Quarter Finals'
      case 'SEMI_FINAL': return 'Semi Finals'
      case 'FINAL': return 'Final'
      default: return r
    }
  }

  const renderStatus = (status) => {
    switch (status) {
      case 'REGISTRATION_OPEN': return <span className="status-badge pending">Registration Open</span>
      case 'READY': return <span className="status-badge active">Ready</span>
      case 'BRACKET_GENERATED': return <span className="status-badge active">Bracket Generated</span>
      case 'IN_PROGRESS': return <span className="status-badge active">In Progress</span>
      case 'COMPLETED': return <span className="status-badge completed">Completed</span>
      case 'CANCELLED': return <span className="status-badge inactive">Cancelled</span>
      default: return <span>{status}</span>
    }
  }

  const formatDateTime = (dt) => {
    if (!dt) return null
    return new Date(dt).toLocaleString('en-US', { dateStyle: 'medium', timeStyle: 'short' })
  }

  if (loading) {
    return (
      <div className="empty-state">
        <span className="spinner light" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  if (!tournament) {
    return (
      <div className="empty-state">
        <p>Tournament not found.</p>
        <button className="btn-outline-gold" onClick={handleBack}>
          <IconArrowLeft /> Back to Tournaments
        </button>
      </div>
    )
  }

  const matchesFlat = matches.map((m) => {
    let participant1 = null
    let participant2 = null
    if (bracket && bracket.finalMatch) {
      const findNode = (node) => {
        if (!node) return null
        if (node.id === m.id) return node
        return findNode(node.semiFinal1) || findNode(node.semiFinal2) || findNode(node.quarterFinal1) || findNode(node.quarterFinal2)
      }
      const matchedNode = findNode(bracket.finalMatch)
      if (matchedNode) {
        participant1 = matchedNode.participant1
        participant2 = matchedNode.participant2
      }
    }
    return { ...m, participant1, participant2 }
  }).sort((a, b) => a.matchNumber - b.matchNumber)

  const canSchedule = ['BRACKET_GENERATED', 'IN_PROGRESS', 'COMPLETED'].includes(tournament.status)

  return (
    <div>
      {/* Detail Header */}
      <div className="detail-header-row">
        <button className="btn-outline-gold btn-back" onClick={handleBack}>
          <IconArrowLeft /> Back
        </button>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <h1 className="page-title" style={{ margin: 0 }}>{tournament.name}</h1>
            {renderStatus(tournament.status)}
          </div>
          <p className="page-subtitle" style={{ marginTop: 4 }}>
            {getSportName(tournament.sportId)}
            {tournament.format && <span> · {tournament.format === 'SINGLES' ? 'Singles' : 'Doubles'}</span>}
            {tournament.genderCategory && (
              <span> · {tournament.genderCategory === 'MEN' ? 'Men' : tournament.genderCategory === 'WOMEN' ? 'Women' : 'Open'}</span>
            )}
            {' '}• {tournament.currentParticipants} / {tournament.participantLimit} Registered
            {tournament.startDate && tournament.endDate && (
              <span style={{ marginLeft: 8, color: '#666' }}>
                • {tournament.startDate} → {tournament.endDate}
              </span>
            )}
          </p>
        </div>
      </div>

      {error && <div className="form-error" style={{ margin: '10px 0 20px' }}>{error}</div>}

      {/* Action Banner for READY state */}
      {tournament.status === 'READY' && (
        <div className="action-banner-ready">
          <div className="banner-icon-wrap"><IconSettings /></div>
          <div style={{ flex: 1 }}>
            <h4 className="banner-title">Tournament is full!</h4>
            <p className="banner-text">All {tournament.participantLimit} slots have been filled. You can now generate the bracket to start the matches.</p>
          </div>
          <button className="btn-gold" onClick={handleGenerateBracket} disabled={genLoading}>
            {genLoading ? <span className="spinner" /> : 'Generate Bracket'}
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="detail-tabs">
        <button className={`detail-tab ${activeTab === 'bracket' ? 'active' : ''}`} onClick={() => setActiveTab('bracket')}>
          Bracket View
        </button>
        <button className={`detail-tab ${activeTab === 'participants' ? 'active' : ''}`} onClick={() => setActiveTab('participants')}>
          Participants ({participants.length})
        </button>
        {matches.length > 0 && (
          <button className={`detail-tab ${activeTab === 'matches' ? 'active' : ''}`} onClick={() => setActiveTab('matches')}>
            Matches
          </button>
        )}
      </div>

      {/* Tab Panels */}
      <div className="tab-content-panel">

        {/* BRACKET TAB */}
        {activeTab === 'bracket' && (
          <TournamentBracket
            bracketData={bracket}
            isAdmin={true}
            onSchedule={(m) => setScheduleTarget(m)}
            onScore={(m) => setScoreTarget(m)}
          />
        )}

        {/* PARTICIPANTS TAB */}
        {activeTab === 'participants' && (() => {
          const isTeamTournament = participants.some(p => p.participantType === 'TEAM') || teams.length > 0
          const isDoublesTournament = tournament.format === 'DOUBLES' || participants.some(p => p.participantType === 'DOUBLES_TEAM')
          const canRemove = tournament.status === 'REGISTRATION_OPEN' || tournament.status === 'READY'

          if (participants.length === 0) {
            return (
              <div className="content-card">
                <p style={{ color: '#555', textAlign: 'center', margin: 0 }}>No participants registered yet.</p>
              </div>
            )
          }

          if (isDoublesTournament) {
            const { players = {}, pairs = {} } = doublesPlayerDetails
            return (
              <div className="content-card">
                <div className="dbl-pairs-grid">
                  {participants.map((p, idx) => {
                    const pairInfo = pairs[p.participantId] || {}
                    const player1 = players[pairInfo.player1Id] || null
                    const player2 = players[pairInfo.player2Id] || null
                    return (
                      <DoublesParticipantCard
                        key={p.id}
                        participant={p}
                        pairIndex={idx}
                        player1={player1}
                        player2={player2}
                        canRemove={canRemove}
                        onUnregister={(participant) => setUnregisterTarget(participant)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          }

          if (isTeamTournament) {
            return (
              <div className="content-card">
                <div className="ptd-teams-grid">
                  {participants.map((p) => {
                    const team = teams.find((t) => t.teamId === p.participantId) || null
                    return (
                      <ParticipantTeamCard
                        key={p.id}
                        participant={p}
                        team={team}
                        canRemove={canRemove}
                        onViewTeam={(id) => setViewingTeamId(id)}
                        onUnregister={(participant) => setUnregisterTarget(participant)}
                      />
                    )
                  })}
                </div>
              </div>
            )
          }

          // Individual players — keep table layout
          return (
            <div className="content-card">
              <div className="app-table-wrap">
                <table className="app-table">
                  <thead>
                    <tr>
                      <th>Participant Name</th>
                      <th>Type</th>
                      <th>Participant ID</th>
                      {canRemove && <th>Actions</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {participants.map((p) => (
                      <tr key={p.id}>
                        <td style={{ fontWeight: 600, color: '#f0e6c8' }}>{getParticipantName(p)}</td>
                        <td>
                          <span style={{ fontSize: 11, background: 'rgba(198,168,75,0.08)', color: '#c6a84b', padding: '3px 8px', borderRadius: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                            {p.participantType}
                          </span>
                        </td>
                        <td style={{ fontSize: 11, fontFamily: 'monospace', color: '#555' }}>{p.participantId}</td>
                        {canRemove && (
                          <td>
                            <button className="btn-danger" style={{ padding: '6px 12px', fontSize: 11 }} onClick={() => setUnregisterTarget(p)}>
                              <IconTrash /> Remove
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })()}

        {/* MATCHES TAB */}
        {activeTab === 'matches' && matches.length > 0 && (
          <div className="content-card">
            <div className="app-table-wrap">
              <table className="app-table">
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Round</th>
                    <th>Competitor 1</th>
                    <th>Competitor 2</th>
                    <th>Status</th>
                    <th>Schedule</th>
                    <th>Score</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {matchesFlat.map((m) => {
                    const p1Name = m.participant1?.name || (m.participant1Id ? `ID: ${m.participant1Id.substring(0, 5)}` : 'TBD')
                    const p2Name = m.participant2?.name || (m.participant2Id ? `ID: ${m.participant2Id.substring(0, 5)}` : 'TBD')
                    const isPlayed = m.status === 'PLAYED'
                    const isReady = m.status === 'READY'
                    const isPending = m.status === 'PENDING'
                    const isScheduled = !!m.scheduledDate && !!m.fieldId
                    const matchDatePassed = m.scheduledDate && new Date(m.scheduledDate) <= new Date()
                    const hasParticipants = !!m.participant1Id && !!m.participant2Id

                    return (
                      <tr key={m.id}>
                        <td>{m.matchNumber}</td>
                        <td style={{ fontWeight: 600, color: '#c6a84b' }}>{getRoundLabel(m.round)}</td>
                        <td style={{ color: isPlayed && m.winnerId === m.participant1Id ? '#fff' : '#888', fontWeight: isPlayed && m.winnerId === m.participant1Id ? 600 : 400 }}>{p1Name}</td>
                        <td style={{ color: isPlayed && m.winnerId === m.participant2Id ? '#fff' : '#888', fontWeight: isPlayed && m.winnerId === m.participant2Id ? 600 : 400 }}>{p2Name}</td>
                        <td>
                          <span className={`match-status-tag ${m.status.toLowerCase()}`}>{m.status}</span>
                        </td>
                        <td style={{ fontSize: '0.78rem' }}>
                          {isScheduled ? (
                            <span style={{ color: '#c6a84b' }} title={m.scheduledDate}>
                              {formatDateTime(m.scheduledDate)}
                            </span>
                          ) : (
                            <span style={{ color: '#444' }}>—</span>
                          )}
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {isPlayed ? `${m.score1} – ${m.score2}` : '—'}
                        </td>
                        <td>
                          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                            {/* Schedule / Reschedule button */}
                            {canSchedule && (!isPending || hasParticipants) && (
                              <button
                                className="btn-outline-gold"
                                style={{ padding: '5px 10px', fontSize: 11 }}
                                onClick={() => setScheduleTarget(m)}
                                title={isScheduled ? 'Reschedule' : 'Set Schedule'}
                              >
                                <IconCalendar /> {isScheduled ? 'Reschedule' : 'Schedule'}
                              </button>
                            )}
                            {/* Record result — only if scheduled on a field */}
                            {isReady && isScheduled && m.fieldId && (
                              <button
                                className="btn-gold"
                                style={{ padding: '5px 10px', fontSize: 11, opacity: matchDatePassed ? 1 : 0.45, cursor: matchDatePassed ? 'pointer' : 'not-allowed' }}
                                onClick={() => matchDatePassed && setScoreTarget(m)}
                                disabled={!matchDatePassed}
                                title={matchDatePassed ? undefined : `Match is scheduled for ${formatDateTime(m.scheduledDate)} — result can be recorded after that time`}
                              >
                                Record Result
                              </button>
                            )}
                            {/* Ready but not yet scheduled — block recording */}
                            {isReady && (!isScheduled || !m.fieldId) && (
                              <span style={{ fontSize: 11, color: '#664' }} title="Schedule this match first">
                                Schedule required
                              </span>
                            )}
                            {/* Edit score for played matches */}
                            {isPlayed && (
                              <button
                                className="btn-outline-gold"
                                style={{ padding: '5px 10px', fontSize: 11 }}
                                onClick={() => setScoreTarget(m)}
                                title="Edit score"
                              >
                                <IconEdit /> Edit Score
                              </button>
                            )}
                            {/* Pending and no actions */}
                            {isPending && !hasParticipants && (
                              <span style={{ fontSize: 11, color: '#444' }}>Waiting for competitors</span>
                            )}
                          </div>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Modals */}
      {scoreTarget && (
        <RecordResultModal
          match={scoreTarget}
          onClose={() => setScoreTarget(null)}
          onRecorded={handleRecordSuccess}
        />
      )}
      {scheduleTarget && tournament && (
        <ScheduleMatchModal
          match={scheduleTarget}
          tournament={tournament}
          onClose={() => setScheduleTarget(null)}
          onScheduled={handleScheduleSuccess}
        />
      )}
      {viewingTeamId && (
        <TeamDetailsModal
          teamId={viewingTeamId}
          onClose={() => setViewingTeamId(null)}
        />
      )}
      {unregisterTarget && (() => {
        const team = teams.find((t) => t.teamId === unregisterTarget.participantId)
        const name = team ? team.teamName : getParticipantName(unregisterTarget)
        return (
          <UnregisterConfirmModal
            teamName={name}
            loading={unregisterLoading}
            onClose={() => setUnregisterTarget(null)}
            onConfirm={() => handleRemoveParticipant(unregisterTarget.participantId)}
          />
        )
      })()}
    </div>
  )
}

export default TournamentDetail
