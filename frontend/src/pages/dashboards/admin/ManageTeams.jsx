import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../../api/axiosInstance'
import AuthImage from '../../../components/AuthImage'
import TargetCursor from '../../../components/TargetCursor'
import '../AdminDashboard.css'

/* ── Inline SVG icons ── */
const IconClose  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconTeam   = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="9"  cy="7"  r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="18" cy="7"  r="2"/><path d="M22 21v-1.5a3 3 0 0 0-2-2.83"/></svg>
const IconUser   = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>

/* ── Avatar placeholder ── */
function Avatar({ src, name, size = 48 }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const placeholder = (
    <div
      style={{
        width: size, height: size, borderRadius: '50%',
        background: 'rgba(198,168,75,0.1)',
        border: '1px solid rgba(198,168,75,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#c6a84b', fontSize: size * 0.35, fontWeight: 700,
        fontFamily: 'Montserrat, sans-serif', flexShrink: 0,
      }}
    >
      {initials}
    </div>
  )

  if (!src) return placeholder

  // Captain photo is a base64 data-URL stored inline — use <img> directly
  if (src.startsWith('data:')) {
    return (
      <img
        src={src}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(198,168,75,0.25)' }}
      />
    )
  }

  return (
    <AuthImage
      src={src}
      alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(198,168,75,0.25)' }}
      placeholder={placeholder}
    />
  )
}

/* ── Team logo placeholder ── */
function TeamLogo({ logoUrl, size = 56 }) {
  const placeholder = (
    <div
      style={{
        width: size, height: size, borderRadius: 8,
        background: 'rgba(198,168,75,0.08)',
        border: '1px solid rgba(198,168,75,0.18)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: 'rgba(198,168,75,0.35)', flexShrink: 0,
      }}
    >
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
   TEAM DETAILS MODAL
───────────────────────────────────────────── */
function TeamDetailsModal({ teamId, onClose, onNavigateToTournament, onNavigateToCaptain, onNavigateToPlayer }) {
  const [details, setDetails] = useState(null)
  const [profile, setProfile] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!teamId) return
    setLoading(true)
    setError('')
    Promise.all([
      api.get(`/api/admin/teams/${teamId}`),
      api.get(`/api/stats/team/${teamId}/profile`),
    ])
      .then(([detailsRes, profileRes]) => {
        setDetails(detailsRes.data)
        setProfile(profileRes.data)
      })
      .catch(() => setError('Failed to load team details.'))
      .finally(() => setLoading(false))
  }, [teamId])

  const formatDate = (iso) => {
    if (!iso) return '–'
    return new Date(iso).toLocaleDateString('en-US', {
      year: 'numeric', month: 'long', day: 'numeric',
    })
  }

  /* ── Shared avatar used inside the modal ── */
  function ModalAvatar({ src, name, size = 48 }) {
    const initials = name
      ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
      : '?'
    const placeholder = (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'rgba(198,168,75,0.15)',
        border: '2px solid rgba(198,168,75,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#c6a84b', fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
      }}>
        {initials}
      </div>
    )
    if (!src) return placeholder
    if (src.startsWith('data:')) {
      return (
        <img src={src} alt={name} style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', flexShrink: 0,
          border: '2px solid rgba(198,168,75,0.35)',
        }} />
      )
    }
    return (
      <AuthImage src={src} alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(198,168,75,0.35)' }}
        placeholder={placeholder}
      />
    )
  }

  /* ── Team logo inside modal ── */
  function ModalTeamLogo({ logoUrl, teamName, size = 80 }) {
    const initials = teamName
      ? teamName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
      : '?'
    const placeholder = (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'rgba(198,168,75,0.1)',
        border: '3px solid rgba(198,168,75,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#c6a84b', fontWeight: 700, fontSize: size * 0.28, flexShrink: 0,
      }}>
        {initials}
      </div>
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
    <p style={{
      fontSize: 11, fontWeight: 700,
      color: 'rgba(198,168,75,0.6)',
      textTransform: 'uppercase', letterSpacing: '0.08em',
      marginBottom: 14, marginTop: 0,
    }}>
      {children}
    </p>
  )

  const StatBox = ({ label, value }) => (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      padding: '12px 16px',
      background: 'rgba(198,168,75,0.05)',
      border: '1px solid rgba(198,168,75,0.15)',
      borderRadius: 10,
    }}>
      <span style={{ fontSize: 20, fontWeight: 800, color: '#f0e6c8' }}>{value}</span>
      <span style={{ fontSize: 10, color: 'rgba(198,168,75,0.6)', textTransform: 'uppercase', letterSpacing: '0.06em', marginTop: 4 }}>{label}</span>
    </div>
  )

  const rowHover = {
    background: 'rgba(198,168,75,0.04)',
    borderColor: 'rgba(198,168,75,0.12)',
  }

  const rowHoverActive = {
    background: 'rgba(198,168,75,0.1)',
    borderColor: 'rgba(198,168,75,0.35)',
  }

  return (
    <div
      className="modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="modal-box" style={{ maxWidth: 780, width: '100%' }}>
        {/* Header */}
        <div className="modal-header">
          <h2 className="modal-title">
            {details ? details.teamName : 'Team Details'}
          </h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        {loading && (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span className="spinner light" style={{ width: 28, height: 28 }} />
          </div>
        )}

        {error && <div className="form-error">{error}</div>}

        {!loading && details && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>

            {/* ── Logo + name + sport + date ── */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <ModalTeamLogo logoUrl={details.logoUrl} teamName={details.teamName} size={80} />
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0e6c8', marginBottom: 6 }}>
                  {details.teamName}
                </div>
                <span style={{
                  background: 'rgba(198,168,75,0.12)',
                  border: '1px solid rgba(198,168,75,0.3)',
                  color: '#c6a84b',
                  fontSize: 12, padding: '3px 12px',
                  borderRadius: 20, fontWeight: 600, letterSpacing: '0.04em',
                }}>
                  {details.sportName}
                </span>
              </div>
              <div style={{
                display: 'flex', flexDirection: 'column', alignItems: 'center',
                padding: '10px 20px',
                background: 'rgba(198,168,75,0.06)',
                border: '1px solid rgba(198,168,75,0.15)',
                borderRadius: 10,
              }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#f0e6c8' }}>{formatDate(details.createdAt)}</span>
                <span style={{ fontSize: 11, color: 'rgba(198,168,75,0.65)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Since</span>
              </div>
            </div>

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(198,168,75,0.12)' }} />

            {/* ── Stats ── */}
            {profile && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16 }}>
                <StatBox label="Rank" value={`#${profile.rank}`} />
                <StatBox label="Titles won" value={profile.tournamentsWonCount} />
                <StatBox label="Total goals" value={profile.totalGoalsScored} />
              </div>
            )}

            {/* ── Tournaments ── */}
            {profile && (
              <div>
                <SectionLabel>Tournaments ({profile.participatedTournaments.length})</SectionLabel>
                {profile.participatedTournaments.length === 0 ? (
                  <span style={{ color: 'rgba(198,168,75,0.35)', fontSize: 13 }}>No tournaments yet.</span>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {profile.participatedTournaments.map((t) => (
                      <button
                        key={t.tournamentId}
                        onClick={() => onNavigateToTournament(t.tournamentId)}
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                          width: '100%', padding: '12px 16px',
                          background: rowHover.background,
                          border: `1px solid ${rowHover.borderColor}`,
                          borderRadius: 10, cursor: 'pointer',
                          transition: 'all 0.2s ease', textAlign: 'left',
                          fontFamily: 'Montserrat, sans-serif',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = rowHoverActive.background; e.currentTarget.style.borderColor = rowHoverActive.borderColor }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = rowHover.background; e.currentTarget.style.borderColor = rowHover.borderColor }}
                      >
                        <span style={{ fontWeight: 600, fontSize: 14, color: '#f0e6c8' }}>{t.tournamentName}</span>
                        <span style={{ fontSize: 12, color: '#c6a84b', fontWeight: 700 }}>{t.goalsScored} goals</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Divider */}
            <div style={{ height: 1, background: 'rgba(198,168,75,0.12)' }} />

            {/* ── Captain ── */}
            <div>
              <SectionLabel>Captain</SectionLabel>
              {details.captain ? (
                <div
                  className="modal-cursor-target"
                  onClick={() => onNavigateToCaptain(details.captain.captainId)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 18px',
                    background: 'rgba(198,168,75,0.05)',
                    border: '1px solid rgba(198,168,75,0.15)',
                    borderRadius: 10,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(198,168,75,0.1)'; e.currentTarget.style.borderColor = 'rgba(198,168,75,0.35)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(198,168,75,0.05)'; e.currentTarget.style.borderColor = 'rgba(198,168,75,0.15)' }}
                >
                  <ModalAvatar src={details.captain.photoUrl} name={details.captain.fullName} size={52} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#f0e6c8' }}>
                      {details.captain.fullName}
                    </p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(198,168,75,0.6)' }}>Team Captain</p>
                  </div>
                  <span style={{
                    marginLeft: 'auto',
                    background: 'linear-gradient(135deg, #c6a84b, #a8852e)',
                    color: '#fff', fontSize: 11, fontWeight: 700,
                    padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em',
                  }}>
                    ♛ CAPTAIN
                  </span>
                </div>
              ) : (
                <span style={{ color: 'rgba(198,168,75,0.35)', fontSize: 13 }}>No captain assigned</span>
              )}
            </div>

            {/* ── Players grid ── */}
            <div>
              <SectionLabel>Squad</SectionLabel>
              {details.players && details.players.length > 0 ? (
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(4, 1fr)',
                  gap: 24,
                }}>
                  {details.players.map((p) => (
                    <div
                      key={p.playerId}
                      className="modal-cursor-target"
                      onClick={() => onNavigateToPlayer(p.playerId)}
                      style={{
                        display: 'flex', flexDirection: 'column',
                        alignItems: 'center', gap: 12,
                        cursor: 'pointer',
                        transition: 'all 0.2s ease',
                        padding: 8, borderRadius: 10,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(198,168,75,0.06)' }}
                      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                    >
                      <ModalAvatar src={p.photoUrl} name={p.fullName} size={90} />
                      <p style={{
                        margin: 0, fontWeight: 600, fontSize: 13,
                        color: '#f0e6c8', textAlign: 'center',
                        wordBreak: 'break-word',
                      }}>
                        {p.fullName}
                      </p>
                    </div>
                  ))}
                </div>
              ) : (
                <p style={{ color: 'rgba(198,168,75,0.4)', fontSize: 14 }}>No players yet.</p>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   TEAM CARD (grid item)
───────────────────────────────────────────── */
function TeamCard({ team, onClick }) {
  return (
    <div
      className="mt-team-card cursor-target"
      onClick={() => onClick(team.teamId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(team.teamId)}
      aria-label={`View ${team.teamName} details`}
    >
      <div className="mt-team-logo-wrap">
        <TeamLogo logoUrl={team.logoUrl} size={64} />
      </div>
      <div className="mt-team-info">
        <div className="mt-team-name">{team.teamName}</div>
        <div className="mt-team-sport">{team.sportName}</div>
        <div className="mt-team-spot">
          <span className="mt-team-spot-label">Players</span>
          <span className="mt-team-spot-value">{team.playerCount}</span>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MANAGE TEAMS — MAIN COMPONENT
───────────────────────────────────────────── */
function ManageTeams() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [teams,   setTeams]   = useState([])
  const [sports,  setSports]  = useState([])
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  // Sport filter — kept in URL: ?section=teams&sport=<sportId>
  const sportParam  = searchParams.get('sport') ?? ''
  const nameParam   = searchParams.get('q')     ?? ''

  const [nameInput, setNameInput] = useState(nameParam)

  // Selected team for details modal
  const [selectedTeamId, setSelectedTeamId] = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const params = sportParam ? { sportId: sportParam } : {}
      const [teamsRes, sportsRes] = await Promise.all([
        api.get('/api/admin/teams', { params }),
        api.get('/api/sports/team'),
      ])
      setTeams(teamsRes.data)
      setSports(sportsRes.data)
    } catch (err) {
      const status = err.response?.status
      if (status === 403) {
        setError('Access denied (403). Make sure you are logged in as Admin.')
      } else if (status === 404) {
        setError('Teams endpoint not found (404). The backend may need a restart.')
      } else {
        setError(`Failed to load teams. ${status ? `(HTTP ${status})` : '(Network error — is the backend running?)'}`)
      }
    } finally {
      setLoading(false)
    }
  }, [sportParam])

  useEffect(() => { fetchData() }, [fetchData])

  // Sync nameInput with URL param on back/forward navigation
  useEffect(() => { setNameInput(nameParam) }, [nameParam])

  /* ── Filters ── */
  function handleSportSelect(sportId) {
    const next = new URLSearchParams(searchParams)
    if (sportId) {
      next.set('sport', sportId)
    } else {
      next.delete('sport')
    }
    next.delete('q')
    setNameInput('')
    setSearchParams(next)
  }

  function handleNameKeyDown(e) {
    if (e.key === 'Enter') {
      const next = new URLSearchParams(searchParams)
      const trimmed = nameInput.trim()
      if (trimmed) {
        next.set('q', trimmed)
      } else {
        next.delete('q')
      }
      setSearchParams(next)
    }
  }

  function handleNameClear() {
    setNameInput('')
    const next = new URLSearchParams(searchParams)
    next.delete('q')
    setSearchParams(next)
  }

  /* ── Client-side name filter ── */
  const visibleTeams = nameParam
    ? teams.filter((t) =>
        t.teamName.toLowerCase().includes(nameParam.toLowerCase())
      )
    : teams

  return (
    <div>
      <TargetCursor
        targetSelector={selectedTeamId ? '.modal-cursor-target' : '.cursor-target'}
        spinDuration={3}
        hoverDuration={0.25}
      />
      {/* ── Header ── */}
      <div
        className="page-header"
        style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}
      >
        <div>
          <h1 className="page-title">Manage Teams</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${visibleTeams.length} team${visibleTeams.length !== 1 ? 's' : ''}${sportParam ? ' in selected sport' : ''}${nameParam ? ` matching "${nameParam}"` : ''}`}
          </p>
        </div>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* ── Filters row ── */}
      {!loading && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>

          {/* Sport filter tabs — same pattern as ManageFields */}
          {sports.length > 0 && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="form-label" style={{ marginBottom: 10 }}>Filter by Sport</div>
              <div className="mf-filter-tabs">
                <button
                  className={`mf-filter-tab ${!sportParam ? 'active' : ''}`}
                  onClick={() => handleSportSelect(null)}
                >
                  All
                </button>
                {sports.map((sport) => (
                  <button
                    key={sport.id}
                    className={`mf-filter-tab ${sportParam === sport.id ? 'active' : ''}`}
                    onClick={() => handleSportSelect(sportParam === sport.id ? null : sport.id)}
                  >
                    {sport.sportName}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Name search */}
          <div style={{ position: 'relative', width: 260, flexShrink: 0 }}>
            <input
              className="form-input"
              placeholder="Search by team name… (Enter)"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={handleNameKeyDown}
              style={{ paddingRight: nameInput ? 36 : 14 }}
            />
            {nameInput && (
              <button
                onClick={handleNameClear}
                style={{
                  position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  color: '#555', display: 'flex', alignItems: 'center', padding: 0,
                }}
                aria-label="Clear search"
              >
                <IconClose />
              </button>
            )}
          </div>

        </div>
      )}

      {/* ── Content ── */}
      {loading ? (
        <div className="empty-state">
          <span className="spinner light" style={{ width: 28, height: 28 }} />
        </div>
      ) : visibleTeams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconTeam /></div>
          <p>{nameParam || sportParam ? 'No teams match your filters.' : 'No teams registered yet.'}</p>
        </div>
      ) : (
        <div className="mt-teams-grid">
          {visibleTeams.map((team) => (
            <TeamCard
              key={team.teamId}
              team={team}
              onClick={setSelectedTeamId}
            />
          ))}
        </div>
      )}

      {/* ── Team details modal ── */}
      {selectedTeamId && (
        <TeamDetailsModal
          teamId={selectedTeamId}
          onClose={() => setSelectedTeamId(null)}
          onNavigateToTournament={(id) => setSearchParams({ section: 'tournament-detail', id })}
          onNavigateToCaptain={(id) => setSearchParams({ section: 'captains', selectedId: id })}
          onNavigateToPlayer={(id) => setSearchParams({ section: 'players', selectedId: id })}
        />
      )}
    </div>
  )
}

export default ManageTeams
