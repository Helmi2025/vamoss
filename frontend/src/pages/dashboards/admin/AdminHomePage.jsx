import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../../api/axiosInstance'
import AuthImage from '../../../components/AuthImage'
import MatchDetailModal from './MatchDetailModal'
import basketLogo from '../../../assets/Tlogos/basket.webp'
import footLogo   from '../../../assets/Tlogos/foot.webp'
import padelLogo  from '../../../assets/Tlogos/padel.webp'
import tennisLogo from '../../../assets/Tlogos/tennis.png'
import './AdminHomePage.css'

/* ─────────────────────────────────────────────
   RANKINGS SECTION
   ───────────────────────────────────────────── */
function TeamAvatar({ logoUrl, name, size = 40 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const placeholder = (
    <div style={{
      width: size, height: size, borderRadius: '50%', flexShrink: 0,
      background: 'rgba(198,168,75,0.12)', border: '1px solid rgba(198,168,75,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#c6a84b', fontSize: size * 0.34, fontWeight: 700,
    }}>
      {initials}
    </div>
  )
  if (!logoUrl) return placeholder
  if (logoUrl.startsWith('data:')) {
    return <img src={logoUrl} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(198,168,75,0.25)' }} />
  }
  return (
    <AuthImage
      src={logoUrl}
      alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(198,168,75,0.25)' }}
      placeholder={placeholder}
    />
  )
}

export const MEDAL_COLORS = [
  { glow: 'rgba(255,215,0,0.55)',   ring: '#FFD700', text: '#FFD700',   bg: 'rgba(255,215,0,0.08)',   label: '🥇' },
  { glow: 'rgba(192,192,192,0.45)', ring: '#C0C0C0', text: '#C0C0C0',  bg: 'rgba(192,192,192,0.06)', label: '🥈' },
  { glow: 'rgba(205,127,50,0.45)',  ring: '#CD7F32', text: '#CD7F32',  bg: 'rgba(205,127,50,0.07)',  label: '🥉' },
]

export function RankingsSection({ rankings, activeSportId, sportName, isIndividual }) {
  const [showAll, setShowAll] = useState(false)

  useEffect(() => { setShowAll(false) }, [activeSportId])

  const filtered = activeSportId ? rankings.filter(r => r.sportId === activeSportId) : rankings
  const visible  = showAll ? filtered : filtered.slice(0, 5)
  const podium   = visible.slice(0, 3)
  const rest     = visible.slice(3)

  const podiumOrder = podium.length >= 3
    ? [podium[1], podium[0], podium[2]]   // 2nd  1st  3rd  (visual podium)
    : podium.length === 2
    ? [podium[1], podium[0]]
    : podium

  const podiumHeights = podium.length >= 3 ? [80, 110, 60] : podium.length === 2 ? [80, 110] : [110]
  const podiumRanks   = podium.length >= 3 ? [2, 1, 3]     : podium.length === 2 ? [2, 1]    : [1]

  const statLabel = isIndividual ? 'points' : 'goals'
  const hasMore   = filtered.length > 5

  return (
    <div className="hp-rankings-section">
      <div className="hp-rankings-header">
        <span className="hp-rankings-title">🏆 League Rankings</span>
        {sportName && (
          <span style={{ color: '#888', fontSize: '0.85rem' }}>{sportName}</span>
        )}
      </div>

      {filtered.length === 0 ? (
        <div className="hp-rankings-empty">
          <span style={{ fontSize: 36, opacity: 0.2 }}>🏆</span>
          <p>No {isIndividual ? 'player' : 'team'} data yet for {sportName || 'this sport'}.</p>
        </div>
      ) : (
        <>
          {/* ── Podium ── */}
          <div className="hp-podium">
            {podiumOrder.map((entry, visualIdx) => {
              const rank    = podiumRanks[visualIdx]
              const rankIdx = rank - 1
              const medal   = MEDAL_COLORS[rankIdx]
              const barH    = podiumHeights[visualIdx]
              return (
                <div key={entry.teamId} className="hp-podium-col">
                  {/* Participant info above bar */}
                  <div className="hp-podium-team">
                    <div style={{
                      position: 'relative',
                      width: 56, height: 56,
                      borderRadius: '50%',
                      boxShadow: `0 0 16px ${medal.glow}`,
                      border: `2px solid ${medal.ring}`,
                      flexShrink: 0,
                    }}>
                      <TeamAvatar logoUrl={entry.logoUrl} name={entry.teamName} size={52} />
                      <span style={{
                        position: 'absolute', bottom: -6, right: -6,
                        fontSize: 18, lineHeight: 1,
                      }}>{medal.label}</span>
                    </div>
                    <p className="hp-podium-name">{entry.teamName}</p>
                    <p className="hp-podium-wins" style={{ color: medal.text }}>
                      {entry.tournamentsWonCount} {entry.tournamentsWonCount === 1 ? 'Title' : 'Titles'}
                    </p>
                    <p className="hp-podium-goals">{entry.totalGoalsScored} {statLabel}</p>
                  </div>

                  {/* The podium bar */}
                  <div
                    className="hp-podium-bar"
                    style={{
                      height: barH,
                      background: medal.bg,
                      borderTop: `3px solid ${medal.ring}`,
                      boxShadow: `0 -4px 20px ${medal.glow}`,
                    }}
                  >
                    <span className="hp-podium-rank" style={{ color: medal.ring }}>
                      {rank}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>

          {/* ── Full table (4th and below) ── */}
          {rest.length > 0 && (
            <div className="hp-rankings-table">
              {rest.map((entry, idx) => {
                const rank = idx + 4
                return (
                  <div key={entry.teamId} className="hp-rank-row">
                    <span className="hp-rank-pos">{rank}</span>
                    <TeamAvatar logoUrl={entry.logoUrl} name={entry.teamName} size={32} />
                    <span className="hp-rank-name">{entry.teamName}</span>
                    <span className="hp-rank-stat">
                      <span className="hp-rank-stat-val">{entry.tournamentsWonCount}</span>
                      <span className="hp-rank-stat-lbl">titles</span>
                    </span>
                    <span className="hp-rank-stat">
                      <span className="hp-rank-stat-val">{entry.totalGoalsScored}</span>
                      <span className="hp-rank-stat-lbl">{statLabel}</span>
                    </span>
                  </div>
                )
              })}
            </div>
          )}

          {hasMore && (
            <button
              className="hp-rankings-see-all"
              onClick={() => setShowAll(v => !v)}
            >
              {showAll
                ? 'Show top 5'
                : `See all ${filtered.length} ${isIndividual ? 'players' : 'teams'}`
              }
            </button>
          )}
        </>
      )}
    </div>
  )
}

/* ── Icons ── */
export const IconRefresh  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
const IconClose      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
export const IconCalendar = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>

/* ── Sport logo resolver (matches Tlogos folder) ── */
export function getSportLogo(sportName) {
  if (!sportName) return null
  const n = sportName.toLowerCase()
  if (n.includes('basket')) return basketLogo
  if (n.includes('foot') || n.includes('soccer')) return footLogo
  if (n.includes('padel')) return padelLogo
  if (n.includes('tennis')) return tennisLogo
  return null
}

/* ── Participant avatar ── */
export function ParticipantAvatar({ logoUrl, name, size = 32 }) {
  const initials = name
    ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'

  const placeholder = (
    <div
      style={{
        width: size, height: size, borderRadius: '50%', flexShrink: 0,
        background: 'rgba(198,168,75,0.12)', border: '1px solid rgba(198,168,75,0.2)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#c6a84b', fontSize: size * 0.32, fontWeight: 700,
      }}
    >
      {initials}
    </div>
  )

  if (!logoUrl) return placeholder

  if (logoUrl.startsWith('data:')) {
    return (
      <img
        src={logoUrl}
        alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(198,168,75,0.2)' }}
      />
    )
  }

  return (
    <AuthImage
      src={logoUrl}
      alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(198,168,75,0.2)' }}
      placeholder={placeholder}
    />
  )
}

/* ─────────────────────────────────────────────
   RECORD RESULT MODAL
   ───────────────────────────────────────────── */
function RecordResultModal({ match, onClose, onRecorded }) {
  const isEdit = match.status === 'PLAYED'
  const [score1, setScore1] = useState(isEdit && match.score1 != null ? String(match.score1) : '')
  const [score2, setScore2] = useState(isEdit && match.score2 != null ? String(match.score2) : '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const p1Name = match.participant1Name || match.participant1?.name || 'Participant 1'
  const p2Name = match.participant2Name || match.participant2?.name || 'Participant 2'

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
      await api.put(`/api/matches/${match.id}/result`, { score1: s1, score2: s2 })
      onRecorded()
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to record result.'
      setError(typeof msg === 'string' ? msg : 'Failed to record result.')
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
              <label className="form-label text-ellipsis" htmlFor="hp-score1">{p1Name}</label>
              <input id="hp-score1" className="form-input score-box" type="number" min="0" max="999"
                placeholder="Score" value={score1}
                onChange={(e) => { setError(''); setScore1(e.target.value) }} disabled={loading} />
            </div>
            <div className="score-vs">VS</div>
            <div className="form-group score-field">
              <label className="form-label text-ellipsis" htmlFor="hp-score2">{p2Name}</label>
              <input id="hp-score2" className="form-input score-box" type="number" min="0" max="999"
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
    match.scheduledDate ? new Date(match.scheduledDate).toISOString().slice(0, 16) : ''
  )
  const [fieldId, setFieldId] = useState(match.fieldId || '')
  const [fields, setFields] = useState([])
  const [fieldsLoading, setFieldsLoading] = useState(true)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const minDt = tournament?.startDate ? `${tournament.startDate}T00:00` : undefined
  const maxDt = tournament?.endDate   ? `${tournament.endDate}T23:59`   : undefined

  useEffect(() => {
    if (!tournament?.sportId) { setFieldsLoading(false); return }
    const load = async () => {
      try {
        const { data: availableFields } = await api.get(`/api/fields?sportId=${tournament.sportId}&available=true`)
        let list = availableFields
        if (match.fieldId && !list.find(f => f.id === match.fieldId)) {
          try {
            const { data: currentField } = await api.get(`/api/fields/${match.fieldId}`)
            list = [currentField, ...list]
          } catch { /* ignore */ }
        }
        setFields(list)
      } catch { setError('Could not load fields.') }
      finally { setFieldsLoading(false) }
    }
    load()
  }, [tournament?.sportId, match.fieldId])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!scheduledDateTime) return setError('Date and time are required.')
    if (!fieldId) return setError('Please select a field.')
    setLoading(true); setError('')
    try {
      await api.put(`/api/matches/${match.id}/schedule`, { scheduledDateTime, fieldId })
      onScheduled(); onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to schedule match.'
      setError(typeof msg === 'string' ? msg : 'Failed to schedule match.')
    } finally { setLoading(false) }
  }

  const p1Name = match.participant1Name || match.participant1?.name || 'TBD'
  const p2Name = match.participant2Name || match.participant2?.name || 'TBD'

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">{match.scheduledDate ? 'Reschedule Match' : 'Schedule Match'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        <p style={{ color: '#888', fontSize: '0.85rem', marginBottom: 16 }}>
          <strong style={{ color: '#c6a84b' }}>{p1Name}</strong> vs <strong style={{ color: '#c6a84b' }}>{p2Name}</strong>
        </p>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="hp-sched-dt">Date &amp; Time</label>
            <input id="hp-sched-dt" className="form-input" type="datetime-local"
              min={minDt} max={maxDt} value={scheduledDateTime}
              onChange={(e) => { setError(''); setScheduledDateTime(e.target.value) }}
              disabled={loading} style={{ colorScheme: 'dark' }} />
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="hp-sched-field">Field</label>
            {fieldsLoading ? (
              <div style={{ color: '#555', fontSize: '0.82rem', padding: '8px 0', display: 'flex', gap: 8, alignItems: 'center' }}>
                <span className="spinner light" style={{ width: 14, height: 14 }} /> Loading fields…
              </div>
            ) : (
              <select id="hp-sched-field" className="form-input" value={fieldId}
                onChange={(e) => { setError(''); setFieldId(e.target.value) }}
                disabled={loading} style={{ background: '#0a0a0a', color: fieldId ? '#fff' : '#666' }}>
                <option value="">-- Select a field --</option>
                {fields.map((f) => <option key={f.id} value={f.id}>{f.name}</option>)}
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
   MATCH CARD  (shown on click → opens modal)
   ───────────────────────────────────────────── */
export function MatchCard({ match, onClick, showDate = false }) {
  const isPlayed   = match.status === 'PLAYED'
  const isReady    = match.status === 'READY'
  const p1Won      = isPlayed && match.winnerId === match.participant1Id
  const p2Won      = isPlayed && match.winnerId === match.participant2Id

  const timeStr = match.scheduledDate
    ? new Date(match.scheduledDate).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: false })
    : null

  const getRoundLabel = (r) => {
    switch (r) {
      case 'QUARTER_FINAL': return 'QF'
      case 'SEMI_FINAL':    return 'SF'
      case 'FINAL':         return 'Final'
      default: return r || ''
    }
  }

  const now = new Date()
  const matchTime = match.scheduledDate ? new Date(match.scheduledDate) : null

  // "Live" = READY status AND the scheduled time has already passed (or started within last 2h)
  // A match still in the future is never "Live" regardless of how close it is
  const isWithinTwoHours = isReady && matchTime
    && matchTime <= now
    && (now - matchTime) <= 2 * 60 * 60 * 1000

  const statusLabel = isPlayed ? 'Finished' : isWithinTwoHours ? 'Live' : isReady ? 'Upcoming' : 'Scheduled'
  const statusClass = isPlayed ? 'finished' : isWithinTwoHours ? 'live' : 'scheduled'

  return (
    <button
      className={`hp-match-card hp-match-${statusClass}`}
      onClick={onClick}
      aria-label={`${match.participant1Name} vs ${match.participant2Name}`}
    >
      {/* Left: status + round + time */}
      <div className="hp-match-left">
        <span className={`hp-match-status-dot hp-status-${statusClass}`} />
        <div className="hp-match-meta">
          <span className="hp-match-status-label">{statusLabel}</span>
          <span className="hp-match-round">{getRoundLabel(match.round)}</span>
          {timeStr && <span className="hp-match-time">{timeStr}</span>}
        </div>
      </div>

      {/* Center: participants + scores */}
      <div className="hp-match-center">
        {/* Participant 1 */}
        <div className={`hp-match-participant ${p1Won ? 'winner' : ''} ${!isPlayed && !isReady ? '' : p1Won ? '' : 'loser'}`}>
          <ParticipantAvatar logoUrl={match.participant1LogoUrl} name={match.participant1Name} size={28} />
          <span className="hp-match-p-name">{match.participant1Name || 'TBD'}</span>
          {isPlayed && (
            <span className={`hp-match-score ${p1Won ? 'score-win' : 'score-lose'}`}>
              {match.score1}
            </span>
          )}
        </div>

        {/* VS / separator */}
        {!isPlayed && <div className="hp-match-vs">VS</div>}
        {isPlayed && <div className="hp-match-dash">—</div>}

        {/* Participant 2 */}
        <div className={`hp-match-participant ${p2Won ? 'winner' : ''} ${!isPlayed && !isReady ? '' : p2Won ? '' : 'loser'}`}>
          <ParticipantAvatar logoUrl={match.participant2LogoUrl} name={match.participant2Name} size={28} />
          <span className="hp-match-p-name">{match.participant2Name || 'TBD'}</span>
          {isPlayed && (
            <span className={`hp-match-score ${p2Won ? 'score-win' : 'score-lose'}`}>
              {match.score2}
            </span>
          )}
        </div>
      </div>

      {/* Right: tournament name */}
      <div className="hp-match-right">
        <span className="hp-match-tournament">{match.tournamentName}</span>
      </div>
    </button>
  )
}

/* ─────────────────────────────────────────────
   MAIN HOME PAGE COMPONENT
   ───────────────────────────────────────────── */
function AdminHomePage() {
  const [, setSearchParams] = useSearchParams()
  const [sports, setSports]           = useState([])
  const [todayMatches, setTodayMatches]   = useState([])
  const [futureMatches, setFutureMatches] = useState([])
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')
  const [activeSport, setActiveSport] = useState(null)
  const [futureOpen, setFutureOpen]   = useState(true)
  const [rankings, setRankings]       = useState([])
  const [rankingsLoading, setRankingsLoading] = useState(true)

  // MatchDetailModal (sportscaster popup, opens first)
  const [detailTarget, setDetailTarget]         = useState(null)
  // Secondary action modals (opened from MatchDetailModal callbacks)
  const [scoreTarget, setScoreTarget]           = useState(null)
  const [scheduleTarget, setScheduleTarget]     = useState(null)
  const [targetTournament, setTargetTournament] = useState(null)
  const [tournaments, setTournaments]           = useState([])

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
      const [sportsRes, todayRes, futureRes, tourneysRes] = await Promise.all([
        api.get('/api/sports'),
        api.get('/api/matches/today'),
        api.get('/api/matches/upcoming'),
        api.get('/api/tournaments'),
      ])
      setSports(sportsRes.data)
      setTodayMatches(todayRes.data)
      setFutureMatches(futureRes.data)
      setTournaments(tourneysRes.data)
      if (activeSport === null && sportsRes.data.length > 0) {
        const allMatches = [...todayRes.data, ...futureRes.data]
        const firstWithMatches = sportsRes.data.find(s => allMatches.some(m => m.sportId === s.id))
        setActiveSport((firstWithMatches || sportsRes.data[0]).id)
      }
    } catch {
      setError('Failed to load schedule.')
    } finally {
      setLoading(false)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { fetchRankings() }, [fetchRankings])

  const activeTodayMatches  = todayMatches.filter(m => m.sportId === activeSport)
  const activeFutureMatches = futureMatches.filter(m => m.sportId === activeSport)
  const activeSportObj      = sports.find(s => s.id === activeSport)

  // Group future matches by date label
  const futureByDate = activeFutureMatches.reduce((acc, m) => {
    const label = m.scheduledDate
      ? new Date(m.scheduledDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
      : 'Unscheduled'
    if (!acc[label]) acc[label] = []
    acc[label].push(m)
    return acc
  }, {})

  // Click on a match card → open MatchDetailModal
  const handleMatchClick = (match) => {
    setDetailTarget(match)
  }

  // MatchDetailModal edit-pencil / record-result callbacks
  const handleScheduleFromModal = (match) => {
    const tournament = tournaments.find(t => t.id === match.tournamentId)
    setTargetTournament(tournament)
    setScheduleTarget(match)
  }

  const handleScoreFromModal = (match) => {
    setScoreTarget(match)
  }

  const badgeCount = (sportId) =>
    todayMatches.filter(m => m.sportId === sportId).length +
    futureMatches.filter(m => m.sportId === sportId).length

  return (
    <div className="hp-root">
      {/* ── Page header ── */}
      <div className="hp-header">
        <div>
          <h1 className="page-title" style={{ marginBottom: 4 }}>Schedule</h1>
          <p className="page-subtitle">{today}</p>
        </div>
        <button className="btn-outline-gold" onClick={() => { fetchData(); fetchRankings() }} title="Refresh" style={{ gap: 8 }}>
          <IconRefresh /> Refresh
        </button>
      </div>

      {/* ── Sport tabs ── */}
      {sports.length > 0 && (
        <div className="hp-sport-tabs" role="tablist" aria-label="Sports">
          {sports.map(sport => {
            const logo    = getSportLogo(sport.sportName)
            const count   = badgeCount(sport.id)
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

      {/* ── Content ── */}
      {loading ? (
        <div className="empty-state">
          <span className="spinner light" style={{ width: 28, height: 28 }} />
        </div>
      ) : error ? (
        <div className="form-error" style={{ marginTop: 24 }}>{error}</div>
      ) : (
        <div className="hp-content" role="tabpanel">

          {/* ── TODAY ── */}
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

          {/* ── UPCOMING ── */}
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

        </div>
      )}

      {/* ── Rankings Section ── */}
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

      {/* ── MatchDetailModal (first step) ── */}
      {detailTarget && (
        <MatchDetailModal
          match={detailTarget}
          isAdmin={true}
          onClose={() => setDetailTarget(null)}
          onSchedule={handleScheduleFromModal}
          onScore={handleScoreFromModal}
        />
      )}

      {/* ── Secondary: Record Result ── */}
      {scoreTarget && (
        <RecordResultModal
          match={scoreTarget}
          onClose={() => setScoreTarget(null)}
          onRecorded={() => { setScoreTarget(null); fetchData() }}
        />
      )}

      {/* ── Secondary: Schedule / Reschedule ── */}
      {scheduleTarget && targetTournament && (
        <ScheduleMatchModal
          match={scheduleTarget}
          tournament={targetTournament}
          onClose={() => { setScheduleTarget(null); setTargetTournament(null) }}
          onScheduled={() => { setScheduleTarget(null); setTargetTournament(null); fetchData() }}
        />
      )}
    </div>
  )
}

export default AdminHomePage
