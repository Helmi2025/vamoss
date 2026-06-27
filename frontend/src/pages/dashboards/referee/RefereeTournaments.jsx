import { useState, useEffect } from 'react'
import api from '../../../api/axiosInstance'
import TournamentBracket from '../admin/TournamentBracket'
import basketLogo from '../../../assets/Tlogos/basket.webp'
import footLogo   from '../../../assets/Tlogos/foot.webp'
import padelLogo  from '../../../assets/Tlogos/padel.webp'
import tennisLogo from '../../../assets/Tlogos/tennis.png'
import '../captain/CaptainTournaments.css'

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
const IconClose      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconTrophy     = () => <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a5 5 0 0 0-6 4.88c0 3 2.1 5.37 5 5.8V2z"/></svg>

/* ─────────────────────────────────────────────
   TOURNAMENT DETAIL MODAL
   ───────────────────────────────────────────── */
function TournamentDetailModal({ tournament, onClose }) {
  const hasBracket = ['BRACKET_GENERATED', 'IN_PROGRESS', 'COMPLETED'].includes(tournament.status)

  const [bracketData, setBracketData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        if (hasBracket) {
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
  }, [tournament.id, hasBracket])

  return (
    <div
      className="bracket-modal-overlay"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bracket-modal-box">
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ color: '#c6a84b' }}>
              <IconTrophy />
            </span>
            <div>
              <h2 className="modal-title">{tournament.name}</h2>
              <p style={{ margin: 0, fontSize: '0.75rem', color: '#666', marginTop: 2 }}>
                Tournament Bracket
              </p>
            </div>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        {loading && (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px 0' }}>
            <span className="spinner light" style={{ width: 28, height: 28 }} />
          </div>
        )}

        {!loading && error && (
          <div className="form-error" style={{ margin: '20px 0' }}>{error}</div>
        )}

        {!loading && !error && hasBracket && (
          <TournamentBracket bracketData={bracketData} />
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
function RefereeTournaments() {
  const [tournaments, setTournaments] = useState([])
  const [detailTarget, setDetailTarget] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/api/referee/tournaments')
      .then(({ data }) => setTournaments(data))
      .catch(() => setError('Failed to load tournaments.'))
      .finally(() => setLoading(false))
  }, [])

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'REGISTRATION_OPEN':  return 'status-badge pending'
      case 'BRACKET_GENERATED':  return 'status-badge active'
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
        <h1 className="page-title">My Tournaments</h1>
        <p className="page-subtitle">Tournaments where you have assigned matches</p>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}

      {tournaments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconTournament /></div>
          <p>No tournaments assigned yet.</p>
        </div>
      ) : (
        <div className="tournaments-grid">
          {tournaments.map((t) => {
            const hasBracket = ['BRACKET_GENERATED', 'IN_PROGRESS', 'COMPLETED'].includes(t.status)
            const clickable = hasBracket

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
                <div className="tournament-card-top">
                  <SportLogo sportName={t.sportName} />
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

                <div className="tournament-card-body">
                  <div className="tournament-card-info-row">
                    <span className="info-label">Start Date</span>
                    <span className="info-value">
                      {new Date(t.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}
                    </span>
                  </div>
                  <div className="tournament-card-info-row">
                    <span className="info-label">Format</span>
                    <span className="info-value">{t.format || 'Single Elimination'}</span>
                  </div>
                  <div className="tournament-card-info-row">
                    <span className="info-label">Sport</span>
                    <span className="info-value">{t.sportName || '–'}</span>
                  </div>
                </div>

                <div className="tournament-card-actions">
                  {clickable && (
                    <div className="td-click-hint">
                      View Bracket →
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
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  )
}

export default RefereeTournaments
