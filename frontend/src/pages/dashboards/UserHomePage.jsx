import { useState, useEffect, useCallback } from 'react'
import { useAuth } from '../../context/AuthContext'
import api from '../../api/axiosInstance'
import {
  MatchCard,
  RankingsSection,
  getSportLogo,
  IconRefresh,
} from './admin/AdminHomePage'
import MatchDetailModal from './admin/MatchDetailModal'
import './admin/AdminHomePage.css'

/**
 * UserHomePage — shared home page for Captain, Team Player, and Individual Player.
 *
 * Mirrors the AdminHomePage layout (Today / Upcoming / Rankings) but:
 *  - Shows only the user's own sport (no sport-tab navigation).
 *  - Adds a History (past matches) section.
 *  - Opens MatchDetailModal in read-only mode (isAdmin = false).
 */
function UserHomePage() {
  const { user } = useAuth()

  // ── Sport resolution ──
  const [sportInfo, setSportInfo]       = useState(null) // { sportId, sportName, isIndividual }
  const [sportLoading, setSportLoading] = useState(true)

  // ── Matches ──
  const [todayMatches, setTodayMatches]   = useState([])
  const [futureMatches, setFutureMatches] = useState([])
  const [pastMatches, setPastMatches]     = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError]    = useState('')

  // ── Section toggles ──
  const [futureOpen, setFutureOpen]   = useState(true)
  const [historyOpen, setHistoryOpen] = useState(true)

  // ── Rankings ──
  const [rankings, setRankings]               = useState([])
  const [rankingsLoading, setRankingsLoading] = useState(true)

  // ── Modal ──
  const [detailTarget, setDetailTarget] = useState(null)

  // ── Refresh trigger ──
  const [refreshKey, setRefreshKey] = useState(0)

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  /* ── Resolve the current user's sport ── */
  useEffect(() => {
    let cancelled = false
    const resolve = async () => {
      setSportLoading(true)
      try {
        const sportsRes = await api.get('/api/sports')
        const sports = sportsRes.data

        let sportId = null
        let sportName = null

        if (user.role === 'CAPTAIN') {
          const { data } = await api.get(`/api/captain/team/${user.userId}`)
          sportId = data.sportId
          sportName = data.sportName
        } else if (user.role === 'PLAYER') {
          if (user.sportId) {
            // Individual-sport player (Tennis / Padel)
            sportId = user.sportId
          } else if (user.teamId) {
            // Team-sport player (Football / Basketball)
            const { data } = await api.get(`/api/player/team/${user.userId}`)
            sportId = data.sportId
            sportName = data.sportName
          }
        }

        const sportObj = sports.find(s => s.id === sportId) || null
        if (!cancelled) {
          setSportInfo({
            sportId,
            sportName: sportObj?.sportName || sportName || 'your sport',
            isIndividual: sportObj ? !sportObj.teamEnabled : false,
          })
        }
      } catch {
        if (!cancelled) setSportInfo(null)
      } finally {
        if (!cancelled) setSportLoading(false)
      }
    }
    resolve()
    return () => { cancelled = true }
  }, [user, refreshKey])

  /* ── Fetch matches + rankings ── */
  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [todayRes, futureRes, pastRes] = await Promise.all([
        api.get('/api/matches/today'),
        api.get('/api/matches/upcoming'),
        api.get('/api/matches/past'),
      ])
      setTodayMatches(todayRes.data)
      setFutureMatches(futureRes.data)
      setPastMatches(pastRes.data)
    } catch {
      setError('Failed to load schedule.')
    } finally {
      setLoading(false)
    }
  }, [])

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

  useEffect(() => {
    fetchData()
    fetchRankings()
  }, [fetchData, fetchRankings, refreshKey])

  const handleRefresh = () => setRefreshKey(k => k + 1)

  // ── Filter by the user's sport ──
  const sportId = sportInfo?.sportId
  const todayList  = sportId ? todayMatches.filter(m => m.sportId === sportId) : []
  const futureList = sportId ? futureMatches.filter(m => m.sportId === sportId) : []
  const pastList   = sportId ? pastMatches.filter(m => m.sportId === sportId) : []

  const sportLogo = sportInfo ? getSportLogo(sportInfo.sportName) : null

  // ── Group future matches by date label ──
  const futureByDate = futureList.reduce((acc, m) => {
    const label = m.scheduledDate
      ? new Date(m.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Unscheduled'
    if (!acc[label]) acc[label] = []
    acc[label].push(m)
    return acc
  }, {})

  // ── Group past matches by date label (already sorted desc by backend) ──
  const pastByDate = pastList.reduce((acc, m) => {
    const label = m.scheduledDate
      ? new Date(m.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Unknown Date'
    if (!acc[label]) acc[label] = []
    acc[label].push(m)
    return acc
  }, {})

  const handleMatchClick = (match) => setDetailTarget(match)

  // ── Loading gate ──
  if (sportLoading) {
    return (
      <div className="hp-root">
        <div className="empty-state">
          <span className="spinner light" style={{ width: 28, height: 28 }} />
        </div>
      </div>
    )
  }

  // ── No sport assigned ──
  if (!sportInfo) {
    return (
      <div className="hp-root">
        <div className="hp-header">
          <div>
            <h1 className="page-title" style={{ marginBottom: 4 }}>Schedule</h1>
            <p className="page-subtitle">{today}</p>
          </div>
        </div>
        <div className="hp-empty hp-empty-sm">
          <span style={{ fontSize: 28, opacity: 0.15 }}>🏟️</span>
          <p className="hp-empty-text">No sport is currently assigned to your account.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="hp-root">
      {/* ── Page header ── */}
      <div className="hp-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Schedule</h1>
          <p className="page-subtitle">{today}</p>
        </div>
        <button className="btn-outline-gold" onClick={handleRefresh} title="Refresh" style={{ gap: 8 }}>
          <IconRefresh /> Refresh
        </button>
      </div>

      {/* ── Single sport badge (no tab navigation) ── */}
      <div className="hp-sport-badge">
        {sportLogo
          ? <img src={sportLogo} alt={sportInfo.sportName} className="hp-sport-badge-logo" />
          : <div className="hp-sport-badge-logo-placeholder">{sportInfo.sportName.charAt(0).toUpperCase()}</div>
        }
        <span>{sportInfo.sportName}</span>
      </div>

      {/* ── Content ── */}
      {loading ? (
        <div className="empty-state">
          <span className="spinner light" style={{ width: 28, height: 28 }} />
        </div>
      ) : error ? (
        <div className="form-error" style={{ marginTop: 24 }}>{error}</div>
      ) : (
        <div className="hp-content">

          {/* ── TODAY ── */}
          <div className="hp-section-header">
            <span className="hp-section-dot hp-section-dot-today" />
            <span className="hp-section-title">Today</span>
            {todayList.length > 0 && (
              <span className="hp-section-count">{todayList.length}</span>
            )}
          </div>

          {todayList.length === 0 ? (
            <div className="hp-empty hp-empty-sm">
              {sportLogo
                ? <img src={sportLogo} alt="" style={{ width: 36, height: 36, opacity: 0.15 }} />
                : <span style={{ fontSize: 28, opacity: 0.15 }}>🏟️</span>
              }
              <p className="hp-empty-text">No matches today for {sportInfo.sportName}.</p>
            </div>
          ) : (
            <div className="hp-matches-list">
              {todayList.map(match => (
                <MatchCard key={match.id} match={match} onClick={() => handleMatchClick(match)} />
              ))}
            </div>
          )}

          {/* ── UPCOMING ── */}
          <div className="hp-section-header hp-section-header-upcoming" style={{ marginTop: 32 }}>
            <span className="hp-section-dot hp-section-dot-upcoming" />
            <span className="hp-section-title">Upcoming</span>
            {futureList.length > 0 && (
              <span className="hp-section-count">{futureList.length}</span>
            )}
            {futureList.length > 0 && (
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

          {futureList.length === 0 ? (
            <div className="hp-empty hp-empty-sm">
              {sportLogo
                ? <img src={sportLogo} alt="" style={{ width: 36, height: 36, opacity: 0.15 }} />
                : <span style={{ fontSize: 28, opacity: 0.15 }}>📅</span>
              }
              <p className="hp-empty-text">No upcoming matches for {sportInfo.sportName}.</p>
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

          {/* ── HISTORY ── */}
          <div className="hp-section-header" style={{ marginTop: 32 }}>
            <span className="hp-section-dot hp-section-dot-history" />
            <span className="hp-section-title">History</span>
            {pastList.length > 0 && (
              <span className="hp-section-count">{pastList.length}</span>
            )}
            {pastList.length > 0 && (
              <button
                className="hp-section-toggle"
                onClick={() => setHistoryOpen(v => !v)}
                aria-expanded={historyOpen}
                aria-label={historyOpen ? 'Collapse history' : 'Expand history'}
              >
                <svg
                  width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"
                  style={{ transform: historyOpen ? 'rotate(0deg)' : 'rotate(-90deg)', transition: 'transform 0.2s ease' }}
                >
                  <polyline points="6 9 12 15 18 9" />
                </svg>
              </button>
            )}
          </div>

          {pastList.length === 0 ? (
            <div className="hp-empty hp-empty-sm">
              {sportLogo
                ? <img src={sportLogo} alt="" style={{ width: 36, height: 36, opacity: 0.15 }} />
                : <span style={{ fontSize: 28, opacity: 0.15 }}>📜</span>
              }
              <p className="hp-empty-text">No match history for {sportInfo.sportName}.</p>
            </div>
          ) : historyOpen && (
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
          )}

        </div>
      )}

      {/* ── Rankings Section ── */}
      {rankingsLoading ? (
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '24px 0', color: '#444', fontSize: '0.8rem' }}>
          <span className="spinner light" style={{ width: 16, height: 16 }} /> Loading rankings…
        </div>
      ) : rankings.length > 0 && sportInfo ? (
        <RankingsSection
          rankings={rankings}
          activeSportId={sportInfo.sportId}
          sportName={sportInfo.sportName}
          isIndividual={sportInfo.isIndividual}
        />
      ) : null}

      {/* ── MatchDetailModal (read-only — no admin privileges) ── */}
      {detailTarget && (
        <MatchDetailModal
          match={detailTarget}
          isAdmin={false}
          onClose={() => setDetailTarget(null)}
        />
      )}
    </div>
  )
}

export default UserHomePage
