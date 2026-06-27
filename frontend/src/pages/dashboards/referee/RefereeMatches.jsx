import { useState, useEffect } from 'react'
import api from '../../../api/axiosInstance'
import '../captain/CaptainTournaments.css'

/* ── Inline SVG icons ── */
const IconClose = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconMatch = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>

function RefereeMatches() {
  const [matches, setMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [selectedMatch, setSelectedMatch] = useState(null)
  const [showMatchModal, setShowMatchModal] = useState(false)

  useEffect(() => {
    api.get('/api/referee/matches')
      .then(({ data }) => setMatches(data))
      .catch(() => setError('Failed to load matches.'))
      .finally(() => setLoading(false))
  }, [])

  const handleMatchClick = (match) => {
    setSelectedMatch(match)
    setShowMatchModal(true)
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'PENDING':   return 'status-badge pending'
      case 'READY':     return 'status-badge active'
      case 'PLAYED':    return 'status-badge completed'
      case 'CANCELLED': return 'status-badge inactive'
      default:          return 'status-badge'
    }
  }

  const formatStatusText = (status) => {
    if (!status) return null
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
        <h1 className="page-title">My Matches</h1>
        <p className="page-subtitle">Matches assigned to you</p>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}

      {matches.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconMatch /></div>
          <p>No matches assigned yet.</p>
        </div>
      ) : (
        <div className="tournaments-grid">
          {matches.map((match) => (
            <div
              key={match.id}
              className="tournament-card tournament-card-clickable"
              onClick={() => handleMatchClick(match)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && handleMatchClick(match)}
              aria-label={`View details for match ${match.round || ''}`}
            >
              <div className="tournament-card-top">
                <div className="tournament-card-top-info" style={{ flex: 1 }}>
                  <h3 className="tournament-card-title">{match.tournamentName || 'Tournament'}</h3>
                  {match.round && (
                    <span style={{ fontSize: 13, color: '#999', marginTop: 4 }}>
                      {match.round}
                    </span>
                  )}
                </div>
                {formatStatusText(match.status) && (
                  <span className={getStatusBadgeClass(match.status)} style={{ alignSelf: 'flex-start' }}>
                    {formatStatusText(match.status)}
                  </span>
                )}
              </div>

              <div className="tournament-card-divider" />

              <div className="tournament-card-body">
                <div className="tournament-card-info-row">
                  <span className="info-label">Participants</span>
                  <span className="info-value" style={{ fontSize: 13 }}>
                    {match.participant1Name || 'TBD'} vs {match.participant2Name || 'TBD'}
                  </span>
                </div>
                <div className="tournament-card-info-row">
                  <span className="info-label">Scheduled</span>
                  <span className="info-value">
                    {match.scheduledDate ? new Date(match.scheduledDate).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    }) : '–'}
                  </span>
                </div>
                {match.score1 !== null && match.score2 !== null && (
                  <div className="tournament-card-info-row">
                    <span className="info-label">Score</span>
                    <span className="info-value" style={{ fontWeight: 700, color: '#c6a84b' }}>
                      {match.score1} - {match.score2}
                    </span>
                  </div>
                )}
              </div>

              <div className="tournament-card-actions">
                <div className="td-click-hint">
                  Manage Match →
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {showMatchModal && selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setShowMatchModal(false)}
          onUpdate={() => {
            setShowMatchModal(false)
            api.get('/api/referee/matches')
              .then(({ data }) => setMatches(data))
          }}
        />
      )}
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MATCH DETAIL MODAL
═══════════════════════════════════════════════ */
function MatchDetailModal({ match, onClose, onUpdate }) {
  const [score1, setScore1] = useState(match.score1 !== null && match.score1 !== undefined ? match.score1 : '')
  const [score2, setScore2] = useState(match.score2 !== null && match.score2 !== undefined ? match.score2 : '')
  const [yellowCardsTeam1, setYellowCardsTeam1] = useState(match.yellowCardsTeam1 || 0)
  const [yellowCardsTeam2, setYellowCardsTeam2] = useState(match.yellowCardsTeam2 || 0)
  const [redCardsTeam1, setRedCardsTeam1] = useState(match.redCardsTeam1 || 0)
  const [redCardsTeam2, setRedCardsTeam2] = useState(match.redCardsTeam2 || 0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    setSuccess('')

    try {
      await api.put(`/api/referee/matches/${match.id}/result`, {
        score1: score1 !== '' ? parseInt(score1) : null,
        score2: score2 !== '' ? parseInt(score2) : null,
        yellowCardsTeam1,
        yellowCardsTeam2,
        redCardsTeam1,
        redCardsTeam2,
      })
      setSuccess('Match result updated successfully!')
      setTimeout(onUpdate, 1000)
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to update match result.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 600 }}>
        <div className="modal-header">
          <h2 className="modal-title">Match Details</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        {success && <div className="form-success">{success}</div>}
        {error && <div className="form-error">{error}</div>}

        <div style={{ marginBottom: 20, padding: 16, background: 'rgba(198,168,75,0.05)', borderRadius: 8 }}>
          <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#b0b0b0' }}>
            <strong style={{ color: '#c6a84b' }}>Round:</strong> {match.round || '–'}
          </p>
          <p style={{ margin: '0 0 8px 0', fontSize: 14, color: '#b0b0b0' }}>
            <strong style={{ color: '#c6a84b' }}>Status:</strong> {match.status || '–'}
          </p>
          <p style={{ margin: 0, fontSize: 14, color: '#b0b0b0' }}>
            <strong style={{ color: '#c6a84b' }}>Scheduled:</strong> {match.scheduledDate ? new Date(match.scheduledDate).toLocaleString() : '–'}
          </p>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#f0e6c8' }}>Score</h3>
            <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 4 }}>
                  Team/Player 1
                </label>
                <input
                  type="number"
                  value={score1}
                  onChange={(e) => setScore1(e.target.value)}
                  min="0"
                  className="form-input"
                  style={{ fontSize: 18, textAlign: 'center' }}
                />
              </div>
              <span style={{ fontSize: 24, color: '#c6a84b', fontWeight: 700 }}>vs</span>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 4 }}>
                  Team/Player 2
                </label>
                <input
                  type="number"
                  value={score2}
                  onChange={(e) => setScore2(e.target.value)}
                  min="0"
                  className="form-input"
                  style={{ fontSize: 18, textAlign: 'center' }}
                />
              </div>
            </div>
          </div>

          <div>
            <h3 style={{ margin: '0 0 12px 0', fontSize: 16, color: '#f0e6c8' }}>Cards Statistics</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 4 }}>
                  Yellow Cards - Team 1
                </label>
                <input
                  type="number"
                  value={yellowCardsTeam1}
                  onChange={(e) => setYellowCardsTeam1(parseInt(e.target.value) || 0)}
                  min="0"
                  className="form-input"
                  style={{ fontSize: 16, textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 4 }}>
                  Yellow Cards - Team 2
                </label>
                <input
                  type="number"
                  value={yellowCardsTeam2}
                  onChange={(e) => setYellowCardsTeam2(parseInt(e.target.value) || 0)}
                  min="0"
                  className="form-input"
                  style={{ fontSize: 16, textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 4 }}>
                  Red Cards - Team 1
                </label>
                <input
                  type="number"
                  value={redCardsTeam1}
                  onChange={(e) => setRedCardsTeam1(parseInt(e.target.value) || 0)}
                  min="0"
                  className="form-input"
                  style={{ fontSize: 16, textAlign: 'center' }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: 12, color: '#999', marginBottom: 4 }}>
                  Red Cards - Team 2
                </label>
                <input
                  type="number"
                  value={redCardsTeam2}
                  onChange={(e) => setRedCardsTeam2(parseInt(e.target.value) || 0)}
                  min="0"
                  className="form-input"
                  style={{ fontSize: 16, textAlign: 'center' }}
                />
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn-outline-gold" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? 'Saving...' : 'Save Result'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default RefereeMatches
