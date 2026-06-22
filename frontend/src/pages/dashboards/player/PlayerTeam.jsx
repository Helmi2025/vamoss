import { useEffect, useState } from 'react'
import { useAuth } from '../../../context/AuthContext'
import '../AdminDashboard.css'

/* ── Fallback avatar: shows initials in a gold circle ── */
function InitialsAvatar({ name, size = 48, fontSize = 18 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(198,168,75,0.15)',
      border: '2px solid rgba(198,168,75,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#c6a84b', fontWeight: 700, fontSize, flexShrink: 0,
      letterSpacing: '0.03em',
    }}>
      {initials}
    </div>
  )
}

/* ── Avatar or initials ── */
function Avatar({ photoUrl, name, size = 48 }) {
  if (photoUrl) {
    return (
      <img
        src={photoUrl}
        alt={name}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover', flexShrink: 0,
          border: '2px solid rgba(198,168,75,0.35)',
        }}
      />
    )
  }
  return <InitialsAvatar name={name} size={size} fontSize={size * 0.35} />
}

/* ── Sport badge ── */
function SportBadge({ sport }) {
  return (
    <span style={{
      background: 'rgba(198,168,75,0.12)',
      border: '1px solid rgba(198,168,75,0.3)',
      color: '#c6a84b',
      fontSize: 12,
      padding: '3px 12px',
      borderRadius: 20,
      fontWeight: 600,
      letterSpacing: '0.04em',
    }}>
      {sport}
    </span>
  )
}

/* ── Team logo or placeholder ── */
function TeamLogo({ logoUrl, teamName, size = 90 }) {
  if (logoUrl) {
    return (
      <img
        src={logoUrl}
        alt={`${teamName} logo`}
        style={{
          width: size, height: size, borderRadius: '50%',
          objectFit: 'cover',
          border: '3px solid rgba(198,168,75,0.4)',
        }}
      />
    )
  }
  const initials = teamName
    ? teamName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?'
  return (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(198,168,75,0.1)',
      border: '3px solid rgba(198,168,75,0.3)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#c6a84b', fontWeight: 700, fontSize: size * 0.28,
    }}>
      {initials}
    </div>
  )
}

/* ── Stat pill ── */
function StatPill({ label, value, onClick, style }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        padding: '10px 20px',
        background: 'rgba(198,168,75,0.06)',
        border: '1px solid rgba(198,168,75,0.15)',
        borderRadius: 10,
        minWidth: 90,
        ...style
      }}
    >
      <span style={{ fontSize: 18, fontWeight: 700, color: '#f0e6c8' }}>{value}</span>
      <span style={{ fontSize: 11, color: 'rgba(198,168,75,0.65)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{label}</span>
    </div>
  )
}

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

/* ── Section label ── */
const SectionLabel = ({ children }) => (
  <p style={{
    fontSize: 11, fontWeight: 700,
    color: 'rgba(198,168,75,0.6)',
    textTransform: 'uppercase', letterSpacing: '0.08em',
    marginBottom: 12, marginTop: 0,
  }}>
    {children}
  </p>
)

function PlayerTeam() {
  const { user } = useAuth()
  const [teamData, setTeamData] = useState(null)
  const [loading, setLoading]   = useState(true)
  const [error, setError]       = useState('')
  const [stats, setStats]       = useState(null)
  const [showStatsModal, setShowStatsModal] = useState(false)

  useEffect(() => {
    if (!user?.userId) return
    const token = localStorage.getItem('token')
    setLoading(true)
    fetch(`/api/player/team/${user.userId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(async r => {
        const data = await r.json()
        if (!r.ok) throw new Error(data.message || 'Failed to load team.')
        setTeamData(data)
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false))
  }, [user?.userId])

  useEffect(() => {
    if (!teamData?.teamId) return
    const token = localStorage.getItem('token')
    fetch(`/api/stats/team/${teamData.teamId}`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(r => {
        if (!r.ok) throw new Error('Failed to load stats')
        return r.json()
      })
      .then(data => setStats(data))
      .catch(() => {})
  }, [teamData?.teamId])

  if (loading) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">My Team</h1>
          <p className="page-subtitle">Loading team information…</p>
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', padding: '60px 0' }}>
          <span className="spinner" />
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div>
        <div className="page-header">
          <h1 className="page-title">My Team</h1>
        </div>
        <p style={{ color: '#e57373', textAlign: 'center', marginTop: 40 }}>{error}</p>
      </div>
    )
  }

  if (!teamData) return null

  const { teamId, teamName, sportName, logoUrl, createdAt, captainName, captainPhotoUrl, players } = teamData

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">My Team</h1>
        <p className="page-subtitle">Your team information and squad</p>
      </div>

      {/* ── Team Info Card ── */}
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <div className="content-card" style={{ maxWidth: 860, width: '100%' }}>

          {/* Logo + name row */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 24,
            marginBottom: 24, flexWrap: 'wrap',
          }}>
            <TeamLogo logoUrl={logoUrl} teamName={teamName} size={90} />
            <div style={{ flex: 1, minWidth: 160 }}>
              <h2 style={{
                margin: '0 0 6px',
                fontSize: 22, fontWeight: 700,
                color: '#f0e6c8',
              }}>
                {teamName}
              </h2>
              <SportBadge sport={sportName} />
            </div>
            {/* Stats */}
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', alignItems: 'center' }}>
              <StatPill label="Since" value={createdAt} />
              {stats && (
                <>
                  <div
                    onClick={() => stats.tournamentsWonCount > 0 && setShowStatsModal(true)}
                    style={{
                      cursor: stats.tournamentsWonCount > 0 ? 'pointer' : 'default',
                      transition: 'transform 0.2s',
                    }}
                    onMouseEnter={e => stats.tournamentsWonCount > 0 && (e.currentTarget.style.transform = 'scale(1.05)')}
                    onMouseLeave={e => stats.tournamentsWonCount > 0 && (e.currentTarget.style.transform = 'scale(1)')}
                  >
                    <StatPill
                      label="Tournaments Won"
                      value={stats.tournamentsWonCount}
                      style={stats.tournamentsWonCount > 0 ? {
                        background: 'rgba(198,168,75,0.12)',
                        border: '1px solid rgba(198,168,75,0.4)',
                      } : {}}
                    />
                  </div>
                  <StatPill
                    label="All-Time Goals"
                    value={stats.totalGoalsScored}
                  />
                </>
              )}
            </div>
          </div>

          {/* Divider */}
          <div style={{ height: 1, background: 'rgba(198,168,75,0.12)', marginBottom: 24 }} />

          {/* Captain */}
          <SectionLabel>Captain</SectionLabel>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 14,
            padding: '14px 18px',
            background: 'rgba(198,168,75,0.05)',
            border: '1px solid rgba(198,168,75,0.15)',
            borderRadius: 10,
            marginBottom: 28,
          }}>
            <Avatar photoUrl={captainPhotoUrl} name={captainName} size={52} />
            <div>
              <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#f0e6c8' }}>{captainName}</p>
              <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(198,168,75,0.6)' }}>Team Captain</p>
            </div>
            {/* Captain crown badge */}
            <span style={{
              marginLeft: 'auto',
              background: 'linear-gradient(135deg, #c6a84b, #a8852e)',
              color: '#fff',
              fontSize: 11, fontWeight: 700,
              padding: '3px 10px', borderRadius: 20,
              letterSpacing: '0.05em',
            }}>
              ♛ CAPTAIN
            </span>
          </div>

          {/* Players */}
          <SectionLabel>Squad</SectionLabel>
          {(!players || players.length === 0) ? (
            <p style={{ color: 'rgba(198,168,75,0.4)', fontSize: 14, textAlign: 'center', padding: '20px 0' }}>
              No players yet.
            </p>
          ) : (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 1fr)',
              gap: 24,
            }}>
              {players.map((p, i) => (
                <div
                  key={p.playerId || i}
                  style={{
                    display: 'flex', flexDirection: 'column', alignItems: 'center',
                    gap: 12,
                  }}
                >
                  <Avatar photoUrl={p.photoUrl} name={p.fullName} size={90} />
                  <p style={{
                    margin: 0, fontWeight: 600, fontSize: 14,
                    color: '#f0e6c8', textAlign: 'center',
                    wordBreak: 'break-word',
                  }}>
                    {p.fullName}
                    {p.isSelf && (
                      <span style={{
                        display: 'block',
                        fontSize: 12,
                        fontWeight: 500,
                        color: 'rgba(198,168,75,0.7)',
                        fontStyle: 'italic',
                        marginTop: 2,
                      }}>
                        (Self)
                      </span>
                    )}
                  </p>
                </div>
              ))}
            </div>
          )}

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

export default PlayerTeam
