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

/* ── Inline SVG Icons ── */
const IconTournament = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
const IconCheck      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconClose      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconTrophy     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a5 5 0 0 0-6 4.88c0 3 2.1 5.37 5 5.8V2z"/></svg>
const IconSearch     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconUsers      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>

/* ─────────────────────────────────────────────
   TOURNAMENT DETAIL MODAL
   Shows registered participants (REGISTRATION_OPEN)
   or the bracket (BRACKET_GENERATED / IN_PROGRESS / COMPLETED)
   ───────────────────────────────────────────── */
function TournamentDetailModal({ tournament, teamId, onClose }) {
  const isRegistrationOpen = tournament.status === 'REGISTRATION_OPEN'
  const hasBracket         = ['BRACKET_GENERATED', 'IN_PROGRESS', 'COMPLETED'].includes(tournament.status)

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
function PlayerTournaments() {
  const { user } = useAuth()

  const [teamInfo, setTeamInfo]               = useState(null)
  const [tournaments, setTournaments]         = useState([])
  const [participantsMap, setParticipantsMap] = useState({})
  const [detailTarget, setDetailTarget]       = useState(null)

  const [loading, setLoading] = useState(true)
  const [error, setError]     = useState('')

  // ── Filters ──
  const [search, setSearch]         = useState('')
  const [myTeamOnly, setMyTeamOnly] = useState(false)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      // 1. Fetch player's team view
      const teamRes = await api.get(`/api/player/team/${user.userId}`)
      const info = teamRes.data
      setTeamInfo(info)

      // 2. Resolve sportId from the sports list by matching sportName
      const sportsRes = await api.get('/api/sports')
      const matched = (sportsRes.data || []).find(s => s.sportName === info.sportName)
      const resolvedSportId = matched?.id || matched?.sportId || null

      // 3. Fetch tournaments and filter by sport
      const tourneyRes = await api.get('/api/tournaments')
      const filtered = resolvedSportId
        ? tourneyRes.data.filter(t => t.sportId === resolvedSportId)
        : []
      setTournaments(filtered)

      // 4. Fetch participants for each filtered tournament
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
    } catch (err) {
      if (err.response?.status === 400 || err.response?.status === 404) {
        setTeamInfo(null)
      } else {
        setError('Failed to fetch tournament data.')
      }
    } finally {
      setLoading(false)
    }
  }, [user?.userId])

  useEffect(() => {
    if (user?.userId) fetchData()
  }, [user?.userId, fetchData])

  /**
   * Check if the player's team is enrolled.
   * For team-based tournaments the participant is identified by teamId.
   * We get teamId from teamInfo.teamId if available; otherwise fall back
   * to checking the player's own userId (for individual-sport tournaments).
   */
  const isTeamEnrolled = (tId) => {
    const list = participantsMap[tId] || []
    // Try teamId first
    if (teamInfo?.teamId) {
      return list.some(p => p.participantId === teamInfo.teamId)
    }
    // Fallback: player ID (individual sport)
    return list.some(p => p.participantId === user?.userId)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'REGISTRATION_OPEN':  return 'status-badge pending'
      case 'READY':              return 'status-badge active'
      case 'IN_PROGRESS':        return 'status-badge active'
      case 'COMPLETED':          return 'status-badge completed'
      case 'CANCELLED':          return 'status-badge inactive'
      default:                   return 'status-badge'
    }
  }

  const formatStatusText = (status) => {
    if (!status || status === 'BRACKET_GENERATED') return null
    return status.replace(/_/g, ' ')
  }

  // ── Derived filtered list ──
  const visibleTournaments = tournaments.filter(t => {
    if (search && !t.name.toLowerCase().includes(search.toLowerCase())) return false
    if (myTeamOnly && !isTeamEnrolled(t.id)) return false
    return true
  })

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="empty-state">
        <span className="spinner light" style={{ width: 28, height: 28 }} />
      </div>
    )
  }

  /* ── No team ── */
  if (!teamInfo) {
    return (
      <div className="empty-state">
        <div className="empty-state-icon"><IconTournament /></div>
        <h3>No Team Found</h3>
        <p style={{ maxWidth: 460, margin: '8px auto 20px', color: '#666', lineHeight: 1.6 }}>
          You are not currently assigned to a team. Contact your captain to be added before
          viewing tournaments.
        </p>
      </div>
    )
  }

  /* ── Main view ── */
  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Tournaments</h1>
        <p className="page-subtitle">
          Tournaments for <strong style={{ color: '#c6a84b' }}>{teamInfo.sportName}</strong>
        </p>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}

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
            const enrolled   = isTeamEnrolled(t.id)
            const hasBracket = ['BRACKET_GENERATED', 'IN_PROGRESS', 'COMPLETED'].includes(t.status)
            const clickable  = t.status === 'REGISTRATION_OPEN' || hasBracket

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
                  {enrolled ? (
                    <div className="registered-badge">
                      <IconCheck /> Your Team Is In
                    </div>
                  ) : (
                    <div className="not-enrolled-badge">
                      Your Team Is Not In This Tournament
                    </div>
                  )}

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
          teamId={teamInfo?.teamId || null}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  )
}

export default PlayerTournaments
