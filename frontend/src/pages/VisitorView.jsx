import { useState, useEffect, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'
import {
  MatchCard,
  RankingsSection,
  getSportLogo,
  IconRefresh,
} from './dashboards/admin/AdminHomePage'
import MatchDetailModal from './dashboards/admin/MatchDetailModal'
import Navbar from '../components/Navbar'
import './dashboards/admin/AdminHomePage.css'
import './VisitorView.css'

/**
 * VisitorView — public (unauthenticated) read-only view of matches & rankings.
 *
 * Mirrors the AdminHomePage layout:
 *  - Sport tabs (default: Football)
 *  - Today's matches
 *  - Upcoming matches
 *  - History (newest 3 matches + "See all / Less" toggle)
 *  - League Rankings
 *
 * Everything is read-only. Matches, tournaments are clickable (view only).
 */
function VisitorView() {
  const navigate = useNavigate()

  const [sports, setSports] = useState([])
  const [todayMatches, setTodayMatches] = useState([])
  const [futureMatches, setFutureMatches] = useState([])
  const [pastMatches, setPastMatches] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [activeSport, setActiveSport] = useState(null)
  const [futureOpen, setFutureOpen] = useState(true)
  const [historyShowAll, setHistoryShowAll] = useState(false)

  // Rankings
  const [rankings, setRankings] = useState([])
  const [rankingsLoading, setRankingsLoading] = useState(true)

  // Modal
  const [detailTarget, setDetailTarget] = useState(null)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const fetchRankings = useCallback(async () => {
    setRankingsLoading(true)
    try {
      const { data } = await api.get('/api/stats/rankings')
      setRankings(data)
    } catch {
      setRankings([])
    } finally {
      setRankingsLoading(false)
    }
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [sportsRes, todayRes, futureRes, pastRes] = await Promise.all([
        api.get('/api/sports'),
        api.get('/api/matches/today'),
        api.get('/api/matches/upcoming'),
        api.get('/api/matches/past'),
      ])
      setSports(sportsRes.data)
      setTodayMatches(todayRes.data)
      setFutureMatches(futureRes.data)
      setPastMatches(pastRes.data)
      if (activeSport === null && sportsRes.data.length > 0) {
        // Default to Football if available
        const football = sportsRes.data.find(s =>
          s.sportName.toLowerCase().includes('foot') || s.sportName.toLowerCase().includes('soccer')
        )
        setActiveSport((football || sportsRes.data[0]).id)
      }
    } catch {
      setError('Failed to load schedule.')
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchRankings() }, [fetchRankings])

  // Filter by active sport
  const activeTodayMatches = todayMatches.filter(m => m.sportId === activeSport)
  const activeFutureMatches = futureMatches.filter(m => m.sportId === activeSport)
  const activePastMatches = pastMatches.filter(m => m.sportId === activeSport)
  const activeSportObj = sports.find(s => s.id === activeSport)

  // Group future matches by date label
  const futureByDate = activeFutureMatches.reduce((acc, m) => {
    const label = m.scheduledDate
      ? new Date(m.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Unscheduled'
    if (!acc[label]) acc[label] = []
    acc[label].push(m)
    return acc
  }, {})

  // History: show only 3 newest by default, or all
  const visiblePast = historyShowAll ? activePastMatches : activePastMatches.slice(0, 3)

  // Group visible past matches by date
  const pastByDate = visiblePast.reduce((acc, m) => {
    const label = m.scheduledDate
      ? new Date(m.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Unknown Date'
    if (!acc[label]) acc[label] = []
    acc[label].push(m)
    return acc
  }, {})

  const handleMatchClick = (match) => setDetailTarget(match)

  const badgeCount = (sportId) =>
    todayMatches.filter(m => m.sportId === sportId).length +
    futureMatches.filter(m => m.sportId === sportId).length

  return (
    <>
      {/* Minimal top bar for visitor */}
      <div className="visitor-topbar">
        <button className="visitor-back-btn" onClick={() => navigate('/')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <polyline points="15 18 9 12 15 6" />
          </svg>
          Back to Home
        </button>
        <span className="visitor-badge">Visitor Mode</span>
        <button className="btn btn-outline btn-sm" onClick={() => navigate('/login')}>
          Login
        </button>
      </div>

      <div className="visitor-container">
        <div className="hp-root">
          {/* Page header */}
          <div className="hp-header">
            <div>
              <h1 className="page-title" style={{ marginBottom: 4 }}>Discover Vamos</h1>
              <p className="page-subtitle">{today}</p>
            </div>
            <button className="btn-outline-gold" onClick={() => { fetchData(); fetchRankings() }} title="Refresh" style={{ gap: 8 }}>
              <IconRefresh /> Refresh
            </button>
          </div>

          {/* Sport tabs */}
          {sports.length > 0 && (
            <div className="hp-sport-tabs" role="tablist" aria-label="Sports">
              {sports.map(sport => {
                const logo = getSportLogo(sport.sportName)
                const count = badgeCount(sport.id)
                const isActive = activeSport === sport.id
                return (
                  <button
                    key={sport.id}
                    role="tab"
                    aria-selected={isActive}
                    className={`hp-sport-tab ${isActive ? 'active' : ''}`}
                    onClick={() => setActiveSport(sport.id)}
                  >
                    {logo
                      ? <img src={logo} alt={sport.sportName} className="hp-sport-tab-logo" />
                      : <div className="hp-sport-tab-logo-placeholder">{sport.sportName.charAt(0).toUpperCase()}</div>
                    }
                    <span className="hp-sport-tab-name">{sport.sportName}</span>
                    {count > 0 && <span className="hp-sport-tab-badge">{count}</span>}
                  </button>
                )
              })}
            </div>
          )}

          {/* Content */}
          {loading ? (
            <div className="empty-state">
              <span className="spinner light" style={{ width: 28, height: 28 }} />
            </div>
          ) : error ? (
            <div className="form-error" style={{ marginTop: 24 }}>{error}</div>
          ) : (
            <div className="hp-content" role="tabpanel">

              {/* TODAY */}
              <div className="hp-section-header">
                <span className="hp-section-dot hp-section-dot-today" />
                <span className="hp-section-title">Today</span>
                {activeTodayMatches.length > 0 && (
                  <span className="hp-section-count">{activeTodayMatches.length}</span>
                )}
              </div>

              {activeTodayMatches.length === 0 ? (
                <div className="hp-empty hp-empty-sm">
                  {activeSportObj && getSportLogo(activeSportObj.sportName)
                    ? <img src={getSportLogo(activeSportObj.sportName)} alt="" style={{ width: 36, height: 36, opacity: 0.15 }} />
                    : <span style={{ fontSize: 28, opacity: 0.15 }}>🏟️</span>
                  }
                  <p className="hp-empty-text">No matches today for {activeSportObj?.sportName || 'this sport'}.</p>
                </div>
              ) : (
                <div className="hp-matches-list">
                  {activeTodayMatches.map(match => (
                    <MatchCard key={match.id} match={match} onClick={() => handleMatchClick(match)} />
                  ))}
                </div>
              )}

              {/* UPCOMING */}
              <div className="hp-section-header hp-section-header-upcoming" style={{ marginTop: 32 }}>
                <span className="hp-section-dot hp-section-dot-upcoming" />
                <span className="hp-section-title">Upcoming</span>
                {activeFutureMatches.length > 0 && (
                  <span className="hp-section-count">{activeFutureMatches.length}</span>
                )}
                {activeFutureMatches.length > 0 && (
                  <button
                    className="hp-section-toggle"
                    onClick={() => setFutureOpen(v => !v)}
                    aria-expanded={futureOpen}
                    aria-label={futureOpen ? 'Collapse upcoming' : 'Expand upcoming'}
                  >
                    <svg
                      width="14" height="14" viewBox="0 0 24 24" fill="none"
                      stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                      style={{ transform: futureOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }}
                    >
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </button>
                )}
              </div>

              {activeFutureMatches.length === 0 ? (
                <div className="hp-empty hp-empty-sm">
                  {activeSportObj && getSportLogo(activeSportObj.sportName)
                    ? <img src={getSportLogo(activeSportObj.sportName)} alt="" style={{ width: 36, height: 36, opacity: 0.15 }} />
                    : <span style={{ fontSize: 28, opacity: 0.15 }}>📅</span>
                  }
                  <p className="hp-empty-text">No upcoming matches for {activeSportObj?.sportName || 'this sport'}.</p>
                </div>
              ) : futureOpen && (
                <div className="hp-upcoming-list">
                  {Object.entries(futureByDate).map(([dateLabel, dayMatches]) => (
                    <div key={dateLabel} className="hp-date-group">
                      <div className="hp-date-label">{dateLabel}</div>
                      <div className="hp-matches-list">
                        {dayMatches.map(match => (
                          <MatchCard key={match.id} match={match} onClick={() => handleMatchClick(match)} />
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* HISTORY */}
              <div className="hp-section-header" style={{ marginTop: 32 }}>
                <span className="hp-section-dot hp-section-dot-history" />
                <span className="hp-section-title">History</span>
                {activePastMatches.length > 0 && (
                  <span className="hp-section-count">{activePastMatches.length}</span>
                )}
              </div>

              {activePastMatches.length === 0 ? (
                <div className="hp-empty hp-empty-sm">
                  {activeSportObj && getSportLogo(activeSportObj.sportName)
                    ? <img src={getSportLogo(activeSportObj.sportName)} alt="" style={{ width: 36, height: 36, opacity: 0.15 }} />
                    : <span style={{ fontSize: 28, opacity: 0.15 }}>📜</span>
                  }
                  <p className="hp-empty-text">No match history for {activeSportObj?.sportName || 'this sport'}.</p>
                </div>
              ) : (
                <>
                  <div className="hp-history-list">
                    {Object.entries(pastByDate).map(([dateLabel, dayMatches]) => (
                      <div key={dateLabel} className="hp-date-group">
                        <div className="hp-date-label">{dateLabel}</div>
                        <div className="hp-matches-list">
                          {dayMatches.map(match => (
                            <MatchCard key={match.id} match={match} onClick={() => handleMatchClick(match)} />
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                  {activePastMatches.length > 3 && (
                    <button
                      className="hp-rankings-see-all"
                      onClick={() => setHistoryShowAll(v => !v)}
                    >
                      {historyShowAll ? 'Show less' : `See all ${activePastMatches.length} matches`}
                    </button>
                  )}
                </>
              )}

            </div>
          )}

          {/* Rankings Section */}
          {rankingsLoading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', color: '#444', fontSize: '0.8rem' }}>
              <span className="spinner light" style={{ width: 16, height: 16 }} /> Loading rankings…
            </div>
          ) : rankings.length > 0 && activeSportObj ? (
            <RankingsSection
              rankings={rankings}
              activeSportId={activeSport}
              sportName={activeSportObj.sportName}
              isIndividual={!activeSportObj.teamEnabled}
            />
          ) : null}

          {/* MatchDetailModal — read-only (no admin privileges) */}
          {detailTarget && (
            <MatchDetailModal
              match={detailTarget}
              isAdmin={false}
              onClose={() => setDetailTarget(null)}
            />
          )}
        </div>
      </div>
    </>
  )
}

export default VisitorView
