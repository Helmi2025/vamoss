import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../api/axiosInstance'
import TournamentBracket from '../admin/TournamentBracket'
import basketLogo from '../../../assets/Tlogos/basket.webp'
import footLogo   from '../../../assets/Tlogos/foot.webp'
import padelLogo  from '../../../assets/Tlogos/padel.webp'
import tennisLogo from '../../../assets/Tlogos/tennis.png'
import './PlayerTournaments.css'

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

/* ── Icons ── */
const IconTournament = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
const IconCheck      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconEye        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
const IconClose      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconTrophy     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a5 5 0 0 0-6 4.88c0 3 2.1 5.37 5 5.8V2z"/></svg>
const IconSearch     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconUsers      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconAdd        = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>

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
   PARTICIPANTS MODAL  (REGISTRATION_OPEN)
   Shows who has already registered — mirrors the
   team-sport TournamentDetailModal behaviour.
   ───────────────────────────────────────────── */
function ParticipantsModal({ tournament, currentUserId, enrolledParticipantId, onClose }) {
  const [participants, setParticipants] = useState([])
  const [loading, setLoading]           = useState(true)
  const [error, setError]               = useState('')

  useEffect(() => {
    api.get(`/api/tournaments/${tournament.id}/participants/details`)
      .then(({ data }) => setParticipants(data))
      .catch(() => setError('Failed to load participants.'))
      .finally(() => setLoading(false))
  }, [tournament.id])

  const isDoubles = tournament.format === 'DOUBLES'

  // For singles: the summary id == player's userId → direct match.
  // For doubles: the summary has player1Id/player2Id populated by the backend,
  // so we check those against currentUserId.
  const myId = enrolledParticipantId || currentUserId

  return (
    <div
      className="modal-overlay participants-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box participants-modal-box">
        {/* Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#c6a84b' }}><IconUsers style={{ width: 18, height: 18 }} /></span>
            <div>
              <h2 className="modal-title">{tournament.name}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', marginTop: 2 }}>
                {isDoubles ? 'Registered Pairs' : 'Registered Players'}
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
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

        {/* Participant list */}
        {!loading && !error && (
          <div className="td-participants-list">
            {participants.length === 0 ? (
              <div className="td-participants-empty">
                <IconUsers />
                <p>No one has registered yet.</p>
              </div>
            ) : (
              participants.map((p) => {
                // Singles: p.id === userId. Doubles: check player1Id/player2Id from backend.
                const isMe = p.id === myId
                          || p.player1Id === currentUserId
                          || p.player2Id === currentUserId
                return (
                  <div
                    key={p.id}
                    className={`td-participant-row ${isMe ? 'td-participant-mine' : ''}`}
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
                    {isMe && (
                      <span className="td-my-team-tag">
                        <IconCheck /> You
                      </span>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   BRACKET MODAL
   ───────────────────────────────────────────── */
function BracketModal({ tournament, onClose }) {
  const [bracketData, setBracketData] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    api.get(`/api/tournaments/${tournament.id}/bracket`)
      .then(({ data }) => setBracketData(data))
      .catch(() => setError('Failed to load bracket.'))
      .finally(() => setLoading(false))
  }, [tournament.id])

  return (
    <div className="modal-overlay bracket-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box bracket-modal-box">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#c6a84b' }}><IconTrophy /></span>
            <div>
              <h2 className="modal-title">{tournament.name}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', marginTop: 2 }}>Tournament Bracket</p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <span className="spinner light" style={{ width: 28, height: 28 }} />
          </div>
        )}
        {error && <div className="form-error">{error}</div>}
        {!loading && !error && <TournamentBracket bracketData={bracketData} />}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   DOUBLES REGISTRATION MODAL
   ───────────────────────────────────────────── */
function DoublesRegisterModal({ tournament, playerId, onClose, onRegistered }) {
  const [friends, setFriends]     = useState([])
  const [partnerId, setPartnerId] = useState('')
  const [loading, setLoading]     = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError]         = useState('')

  useEffect(() => {
    api.get(`/api/tournaments/${tournament.id}/eligible-partners`, { params: { playerId } })
      .then(({ data }) => setFriends(data))
      .catch(() => setError('Failed to load eligible partners.'))
      .finally(() => setLoading(false))
  }, [tournament.id, playerId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!partnerId) return setError('Please select a partner.')
    setSubmitting(true)
    setError('')
    try {
      await api.post(`/api/tournaments/${tournament.id}/register-doubles`, {
        playerId,
        partnerId,
      })
      onRegistered()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed.'
      setError(typeof msg === 'string' ? msg : 'Registration failed.')
    } finally {
      setSubmitting(false)
    }
  }

  const genderLabel = (g) => g === 'MALE' ? 'M' : g === 'FEMALE' ? 'F' : ''

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <div>
            <h2 className="modal-title">Join as Doubles Pair</h2>
            <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', marginTop: 2 }}>
              {tournament.name} · {tournament.genderCategory === 'MEN' ? 'Men' : tournament.genderCategory === 'WOMEN' ? 'Women' : 'Open'}
            </p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '32px 0' }}>
            <span className="spinner light" style={{ width: 24, height: 24 }} />
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <p style={{ fontSize: '0.82rem', color: '#888', marginBottom: 16 }}>
              Choose a friend from your list to partner with. They must not already be registered in this tournament.
            </p>

            {friends.length === 0 ? (
              <div className="empty-state" style={{ padding: '24px 0' }}>
                <div className="empty-state-icon" style={{ fontSize: 28 }}><IconUsers /></div>
                <p style={{ fontSize: '0.85rem' }}>No eligible friends available.<br />Make sure you have accepted friends who play this sport.</p>
              </div>
            ) : (
              <div className="form-group">
                <label className="form-label" htmlFor="partner-select">Select Partner</label>
                <select
                  id="partner-select"
                  className="form-input"
                  value={partnerId}
                  onChange={(e) => { setError(''); setPartnerId(e.target.value) }}
                  disabled={submitting}
                  style={{ background: '#0a0a0a', color: '#fff' }}
                >
                  <option value="">-- Choose a partner --</option>
                  {friends.map((f) => (
                    <option key={f.playerId} value={f.playerId}>
                      {f.fullName}{f.gender ? ` (${genderLabel(f.gender)})` : ''}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {error && <div className="form-error">{error}</div>}

            <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
              <button type="button" className="btn-outline-gold" onClick={onClose} disabled={submitting}>
                Cancel
              </button>
              {friends.length > 0 && (
                <button type="submit" className="btn-gold" disabled={submitting || !partnerId}>
                  {submitting ? <><span className="spinner" /> Registering…</> : <><IconAdd /> Register Pair</>}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   UNREGISTER CONFIRM MODAL
   ───────────────────────────────────────────── */
function UnregisterConfirmModal({ tournament, isDoubles, onConfirm, onClose, loading }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !loading && onClose()}>
      <div className="modal-box sm">
        <div className="modal-header">
          <h2 className="modal-title">Leave Tournament</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close" disabled={loading}>
            <IconClose />
          </button>
        </div>
        <p className="confirm-text">
          Are you sure you want to unregister from <strong className="confirm-name">{tournament.name}</strong>?
          {isDoubles
            ? ' Both you and your partner will be removed from the tournament.'
            : ' You can re-register later as long as registration is still open and there are spots available.'}
        </p>
        <div className="confirm-btns">
          <button className="btn-outline-gold" onClick={onClose} disabled={loading}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm} disabled={loading}>
            {loading
              ? <span className="spinner" style={{ width: 14, height: 14 }} />
              : 'Unregister'}
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
function IndividualPlayerTournaments() {
  const { user } = useAuth()

  const [sportName, setSportName]             = useState('')
  const [tournaments, setTournaments]         = useState([])
  const [participantsMap, setParticipantsMap] = useState({})
  const [doublesEnrollmentMap, setDoublesEnrollmentMap] = useState({}) // tournamentId → DoublesTeam id
  const [bracketTarget, setBracketTarget]         = useState(null)
  const [doublesTarget, setDoublesTarget]         = useState(null)
  const [participantsTarget, setParticipantsTarget] = useState(null)
  const [unregTarget, setUnregTarget]             = useState(null)  // tournament to unregister from
  const [unregLoading, setUnregLoading]           = useState(false)

  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')
  const [registeringId, setRegisteringId] = useState(null)
  const [registerError, setRegisterError] = useState('')

  const [search, setSearch]             = useState('')
  const [enrolledOnly, setEnrolledOnly] = useState(false)
  const [filterFormat, setFilterFormat]         = useState('')   // '' | 'SINGLES' | 'DOUBLES'
  const [filterCategory, setFilterCategory]     = useState('')   // '' | 'MEN' | 'WOMEN' | 'OPEN'

  const [stats, setStats] = useState(null)
  const [showStatsModal, setShowStatsModal] = useState(false)

  useEffect(() => {
    if (!user?.userId) return
    const token = localStorage.getItem('token')
    fetch(`/api/stats/player/${user.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load stats')
        return r.json()
      })
      .then(data => setStats(data))
      .catch(() => {})
  }, [user?.userId])

  const fetchData = useCallback(async () => {
    if (!user?.sportId) return
    setLoading(true)
    setError('')
    try {
      const sportsRes = await api.get('/api/sports')
      const sport = (sportsRes.data || []).find(s => s.id === user.sportId || s.sportId === user.sportId)
      setSportName(sport?.sportName ?? '')

      const tourneyRes = await api.get('/api/tournaments')
      const filtered = tourneyRes.data.filter(t => t.sportId === user.sportId)
      setTournaments(filtered)

      // Fetch raw participants + doubles enrollment in parallel
      const pMap = {}
      const dMap = {}
      await Promise.all(
        filtered.map(async (t) => {
          try {
            const { data } = await api.get(`/api/tournaments/${t.id}/participants`)
            pMap[t.id] = data
          } catch {
            pMap[t.id] = []
          }
          // For doubles tournaments, check if this player is in a pair
          if (t.format === 'DOUBLES') {
            try {
              const { data } = await api.get(`/api/tournaments/${t.id}/my-doubles-team`, {
                params: { playerId: user.userId }
              })
              dMap[t.id] = data.id // DoublesTeam id
            } catch {
              // 404 = not enrolled, ignore
            }
          }
        })
      )
      setParticipantsMap(pMap)
      setDoublesEnrollmentMap(dMap)
    } catch {
      setError('Failed to fetch tournament data.')
    } finally {
      setLoading(false)
    }
  }, [user?.sportId, user?.userId])

  useEffect(() => { fetchData() }, [fetchData])

  /* Is this player enrolled in a given tournament? */
  const isEnrolled = (tId) => {
    const list = participantsMap[tId] || []
    // Singles: participantId is the player's userId directly
    if (list.some(p => p.participantId === user?.userId)) return true
    // Doubles: doublesEnrollmentMap holds the DoublesTeam id when enrolled
    if (doublesEnrollmentMap[tId]) return true
    return false
  }

  /* Singles register */
  const handleSinglesRegister = async (tournamentId) => {
    setRegisteringId(tournamentId)
    setRegisterError('')
    try {
      await api.post(`/api/tournaments/${tournamentId}/register-player`, { playerId: user.userId })
      await fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Registration failed.'
      setRegisterError(typeof msg === 'string' ? msg : 'Registration failed.')
    } finally {
      setRegisteringId(null)
    }
  }

  /* Unregister (singles or doubles — backend handles both) */
  const handleUnregister = async () => {
    if (!unregTarget) return
    setUnregLoading(true)
    setRegisterError('')
    try {
      await api.delete(`/api/tournaments/${unregTarget.id}/unregister-player`, {
        params: { playerId: user.userId }
      })
      setUnregTarget(null)
      await fetchData()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to unregister.'
      setRegisterError(typeof msg === 'string' ? msg : 'Failed to unregister.')
      setUnregTarget(null)
    } finally {
      setUnregLoading(false)
    }
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'REGISTRATION_OPEN': return 'status-badge pending'
      case 'READY':
      case 'IN_PROGRESS':       return 'status-badge active'
      case 'COMPLETED':         return 'status-badge completed'
      case 'CANCELLED':         return 'status-badge inactive'
      default:                  return 'status-badge'
    }
  }

  const formatStatus = (status) =>
    !status || status === 'BRACKET_GENERATED' ? null : status.replace(/_/g, ' ')

  const formatLabel = (t) => {
    if (!t.format) return 'Singles'
    return t.format === 'DOUBLES' ? 'Doubles' : 'Singles'
  }

  const genderLabel = (g) => {
    if (!g) return null
    if (g === 'MEN') return 'Men'
    if (g === 'WOMEN') return 'Women'
    return 'Open'
  }

  const visible = tournaments.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    if (enrolledOnly && !isEnrolled(t.id)) return false
    if (filterFormat && t.format !== filterFormat) return false
    if (filterCategory && t.genderCategory !== filterCategory) return false
    return true
  })

  const hasActiveFilters = search || enrolledOnly || filterFormat || filterCategory

  const clearFilters = () => {
    setSearch('')
    setEnrolledOnly(false)
    setFilterFormat('')
    setFilterCategory('')
  }

  if (loading) {
    return (
      <div className="empty-state">
        <span className="spinner light" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tournaments</h1>
        <p className="page-subtitle">
          {sportName
            ? <>Tournaments for <strong style={{ color: '#c6a84b' }}>{sportName}</strong></>
            : 'Your upcoming tournaments'}
        </p>
      </div>

      {/* ── Stats pills ── */}
      {stats && (
        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 24 }}>
          <button
            onClick={() => setShowStatsModal(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(198,168,75,0.08)',
              border: '1px solid rgba(198,168,75,0.25)',
              borderRadius: 12,
              padding: '10px 18px',
              cursor: 'pointer',
              transition: 'all 0.2s ease',
              fontFamily: 'inherit',
            }}
            onMouseEnter={e => {
              e.currentTarget.style.background = 'rgba(198,168,75,0.16)'
              e.currentTarget.style.borderColor = 'rgba(198,168,75,0.5)'
            }}
            onMouseLeave={e => {
              e.currentTarget.style.background = 'rgba(198,168,75,0.08)'
              e.currentTarget.style.borderColor = 'rgba(198,168,75,0.25)'
            }}
            aria-label="View tournaments won"
          >
            <span style={{ fontSize: 20 }}>🏆</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f0e6c8', lineHeight: 1 }}>
                {stats.tournamentsWonCount}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(198,168,75,0.7)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                {stats.tournamentsWonCount === 1 ? 'Title' : 'Titles'}
              </span>
            </div>
          </button>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 10,
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.07)',
              borderRadius: 12,
              padding: '10px 18px',
            }}
          >
            <span style={{ fontSize: 20 }}>⚽</span>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 1 }}>
              <span style={{ fontSize: 18, fontWeight: 800, color: '#f0e6c8', lineHeight: 1 }}>
                {stats.totalGoalsScored}
              </span>
              <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)', fontWeight: 600, letterSpacing: '0.05em', textTransform: 'uppercase' }}>
                All-time Goals
              </span>
            </div>
          </div>
        </div>
      )}

      {showStatsModal && stats && (
        <StatsDetailsModal
          wonTournaments={stats.wonTournaments || []}
          onClose={() => setShowStatsModal(false)}
        />
      )}

      {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}
      {registerError && <div className="form-error" style={{ marginBottom: 16 }}>{registerError}</div>}

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

          {/* Format filter */}
          <div className="tournament-search-wrap" style={{ flex: '0 1 160px' }}>
            <select
              className="tournament-search-input"
              value={filterFormat}
              onChange={e => setFilterFormat(e.target.value)}
              style={{ background: '#0d0d0d', color: filterFormat ? '#fff' : '#444', paddingLeft: 12 }}
              aria-label="Filter by format"
            >
              <option value="">All Formats</option>
              <option value="SINGLES">Singles</option>
              <option value="DOUBLES">Doubles</option>
            </select>
            {filterFormat && (
              <button className="tournament-search-clear" onClick={() => setFilterFormat('')} aria-label="Clear format">
                <IconClose />
              </button>
            )}
          </div>

          {/* Category filter */}
          <div className="tournament-search-wrap" style={{ flex: '0 1 170px' }}>
            <select
              className="tournament-search-input"
              value={filterCategory}
              onChange={e => setFilterCategory(e.target.value)}
              style={{ background: '#0d0d0d', color: filterCategory ? '#fff' : '#444', paddingLeft: 12 }}
              aria-label="Filter by category"
            >
              <option value="">All Categories</option>
              <option value="MEN">Men</option>
              <option value="WOMEN">Women</option>
              <option value="OPEN">Open (Mixed)</option>
            </select>
            {filterCategory && (
              <button className="tournament-search-clear" onClick={() => setFilterCategory('')} aria-label="Clear category">
                <IconClose />
              </button>
            )}
          </div>

          <button
            className={`tournament-filter-pill ${enrolledOnly ? 'active' : ''}`}
            onClick={() => setEnrolledOnly(v => !v)}
          >
            <IconCheck /> My Tournaments
          </button>

          {hasActiveFilters && (
            <button className="tournament-filter-pill active" onClick={clearFilters} aria-label="Clear all filters">
              <IconClose /> Clear All
            </button>
          )}
        </div>
      )}

      {tournaments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconTournament /></div>
          <p>No tournaments scheduled for your sport at the moment.</p>
        </div>
      ) : visible.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconTournament /></div>
          <p>No tournaments match your filters.</p>
        </div>
      ) : (
        <div className="tournaments-grid">
          {visible.map((t) => {
            const enrolled   = isEnrolled(t.id)
            const hasBracket = ['BRACKET_GENERATED', 'IN_PROGRESS', 'COMPLETED'].includes(t.status)
            const isRegistrationOpen = t.status === 'REGISTRATION_OPEN'
            const canRegister = isRegistrationOpen && t.registrationOpen && !enrolled
            const isDoubles  = t.format === 'DOUBLES'
            const isLoading  = registeringId === t.id
            const clickable  = isRegistrationOpen || hasBracket

            return (
              <div
                key={t.id}
                className={`tournament-card${clickable ? ' tournament-card-clickable' : ''}`}
                onClick={clickable ? () => isRegistrationOpen ? setParticipantsTarget(t) : setBracketTarget(t) : undefined}
                role={clickable ? 'button' : undefined}
                tabIndex={clickable ? 0 : undefined}
                onKeyDown={clickable ? (e) => e.key === 'Enter' && (isRegistrationOpen ? setParticipantsTarget(t) : setBracketTarget(t)) : undefined}
                aria-label={clickable ? `View details for ${t.name}` : undefined}
              >
                {/* Top: sport logo + title + status */}
                <div className="tournament-card-top">
                  <SportLogo sportName={sportName} />
                  <div className="tournament-card-top-info">
                    <h3 className="tournament-card-title">{t.name}</h3>
                    {formatStatus(t.status) && (
                      <span className={getStatusBadgeClass(t.status)} style={{ alignSelf: 'flex-start' }}>
                        {formatStatus(t.status)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="tournament-card-divider" />

                {/* Info rows */}
                <div className="tournament-card-body">
                  <div className="tournament-card-info-row">
                    <span className="info-label">Format</span>
                    <span className="info-value">{formatLabel(t)}</span>
                  </div>
                  {t.genderCategory && (
                    <div className="tournament-card-info-row">
                      <span className="info-label">Category</span>
                      <span className="info-value">{genderLabel(t.genderCategory)}</span>
                    </div>
                  )}
                  <div className="tournament-card-info-row">
                    <span className="info-label">Start Date</span>
                    <span className="info-value">
                      {new Date(t.startDate).toLocaleDateString('en-US', {
                        year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC',
                      })}
                    </span>
                  </div>
                  <div className="tournament-card-info-row">
                    <span className="info-label">Participants</span>
                    <span className="info-value">{t.currentParticipants} / {t.participantLimit}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="tournament-card-actions">
                  {/* Enrollment status / Unregister */}
                  {enrolled && isRegistrationOpen ? (
                    <button
                      className="btn-action btn-unregister"
                      style={{ flex: 1 }}
                      onClick={(e) => { e.stopPropagation(); setUnregTarget(t) }}
                    >
                      <IconCheck /> {isDoubles ? 'Pair Enrolled · Leave' : 'Enrolled · Unregister'}
                    </button>
                  ) : enrolled ? (
                    <div className="registered-badge">
                      <IconCheck /> {isDoubles ? 'Pair Enrolled' : "You're Enrolled"}
                    </div>
                  ) : t.status === 'REGISTRATION_OPEN' && !t.registrationOpen ? (
                    <div className="not-enrolled-badge">Full</div>
                  ) : t.status !== 'REGISTRATION_OPEN' ? (
                    <div className="not-enrolled-badge">Not Enrolled</div>
                  ) : null}

                  {/* Register actions */}
                  {canRegister && !isDoubles && (
                    <button
                      className="btn-action"
                      style={{ flex: 1, background: 'rgba(198,168,75,0.12)', color: '#c6a84b', border: '1px solid rgba(198,168,75,0.3)' }}
                      onClick={(e) => { e.stopPropagation(); handleSinglesRegister(t.id) }}
                      disabled={isLoading}
                    >
                      {isLoading ? <span className="spinner" /> : <><IconAdd /> Register</>}
                    </button>
                  )}

                  {canRegister && isDoubles && (
                    <button
                      className="btn-action"
                      style={{ flex: 1, background: 'rgba(198,168,75,0.12)', color: '#c6a84b', border: '1px solid rgba(198,168,75,0.3)' }}
                      onClick={(e) => { e.stopPropagation(); setDoublesTarget(t) }}
                    >
                      <IconUsers /> Register Pair
                    </button>
                  )}

                  {/* Click hint */}
                  {clickable && (
                    <div className="td-click-hint">
                      {isRegistrationOpen ? 'View Registered Players' : 'View Bracket'} →
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {bracketTarget && (
        <BracketModal
          tournament={bracketTarget}
          onClose={() => setBracketTarget(null)}
        />
      )}

      {doublesTarget && (
        <DoublesRegisterModal
          tournament={doublesTarget}
          playerId={user.userId}
          onClose={() => setDoublesTarget(null)}
          onRegistered={fetchData}
        />
      )}

      {participantsTarget && (
        <ParticipantsModal
          tournament={participantsTarget}
          currentUserId={user.userId}
          enrolledParticipantId={doublesEnrollmentMap[participantsTarget.id] || user.userId}
          onClose={() => setParticipantsTarget(null)}
        />
      )}

      {unregTarget && (
        <UnregisterConfirmModal
          tournament={unregTarget}
          isDoubles={unregTarget.format === 'DOUBLES'}
          onConfirm={handleUnregister}
          onClose={() => setUnregTarget(null)}
          loading={unregLoading}
        />
      )}
    </div>
  )
}

export default IndividualPlayerTournaments
