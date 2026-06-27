import { useState, useEffect } from 'react'
import './TournamentBracket.css'

const IconEdit = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
const IconSwap = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8v12M17 20l-4-4M17 20l4-4"/></svg>

/**
 * MatchDetailModal — sportscaster-style match info popup.
 *
 * Accepts TWO shapes for `match`:
 *
 * A) Bracket node (from TournamentBracket / TournamentDetail):
 *    match.participant1 = { name, logoUrl, player1Id, player1PhotoUrl, … }
 *
 * B) TodayMatchDto (from AdminHomePage / home page):
 *    match.participant1Name, match.participant1LogoUrl (flat fields)
 *
 * The component normalises both into the same internal shape.
 */
function MatchDetailModal({ match, onClose, isAdmin, onSchedule, onScore, onSwap }) {
  // ── Normalise participant data ──────────────────────────────────────────
  const p1 = match.participant1 ?? {
    name:            match.participant1Name    || null,
    logoUrl:         match.participant1LogoUrl || null,
    player1Id:       null,
    player2Id:       null,
    player1PhotoUrl: null,
    player2PhotoUrl: null,
  }
  const p2 = match.participant2 ?? {
    name:            match.participant2Name    || null,
    logoUrl:         match.participant2LogoUrl || null,
    player1Id:       null,
    player2Id:       null,
    player1PhotoUrl: null,
    player2PhotoUrl: null,
  }

  const p1Name = match.participant1Id ? (p1.name || `Participant ${match.participant1Id.substring(0, 6)}`) : 'TBD'
  const p2Name = match.participant2Id ? (p2.name || `Participant ${match.participant2Id.substring(0, 6)}`) : 'TBD'

  const isDoubles = !!(p1.player1Id || p2.player1Id)

  const [fieldName, setFieldName] = useState(null)
  useEffect(() => {
    if (!match.fieldId) return
    import('../../../api/axiosInstance').then(({ default: api }) => {
      api.get(`/api/fields/${match.fieldId}`)
        .then(({ data }) => setFieldName(data.name || data.fieldName || null))
        .catch(() => setFieldName(null))
    })
  }, [match.fieldId])

  const isPlayed    = match.status === 'PLAYED'
  const isReady     = match.status === 'READY'
  const isPending   = match.status === 'PENDING'
  const isScheduled = !!(match.scheduledDate && match.fieldId)
  const hasParticipants = !!(match.participant1Id && match.participant2Id)

  const statusLabel = isPlayed  ? 'FINISHED'
    : isReady   ? 'UPCOMING'
    : isPending ? 'PENDING'
    : match.status

  const formatDT = (dt) => {
    if (!dt) return null
    const d   = new Date(dt)
    const day = String(d.getDate()).padStart(2, '0')
    const mon = String(d.getMonth() + 1).padStart(2, '0')
    const yr  = d.getFullYear()
    const hh  = String(d.getHours()).padStart(2, '0')
    const mm  = String(d.getMinutes()).padStart(2, '0')
    return `${day}.${mon}.${yr} ${hh}:${mm}`
  }

  const handleAdminAction = () => {
    if (isPlayed) { onClose(); onScore(match) }
    else          { onClose(); onSchedule(match) }
  }

  const showEditIcon  = isAdmin && (!isPending || hasParticipants)
  const showRecordBtn = isAdmin && isReady && isScheduled
  const showSwapBtn   = isAdmin && !isPlayed && !isScheduled && hasParticipants
  const matchDatePassed = !!(match.scheduledDate && new Date(match.scheduledDate) <= new Date())

  const Avatar = ({ photo, name, className = 'bm2-avatar' }) => (
    <div className={className}>
      {photo
        ? <img src={photo} alt={name} className="bm2-avatar-img" />
        : <span className="bm2-avatar-initials">{name?.charAt(0) ?? '?'}</span>}
    </div>
  )

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="bm2-modal">

        {showEditIcon && (
          <button
            className="bm2-edit-btn"
            onClick={handleAdminAction}
            title={isPlayed ? 'Edit Score' : isScheduled ? 'Reschedule Match' : 'Set Schedule'}
          >
            <IconEdit />
          </button>
        )}
        {showSwapBtn && (
          <button
            className="bm2-edit-btn"
            onClick={() => { onClose(); onSwap && onSwap(match) }}
            title="Swap Participants"
            style={{ right: '12px', top: showEditIcon ? '45px' : '12px' }}
          >
            <IconSwap />
          </button>
        )}

        <button className="bm2-close-btn" onClick={onClose} aria-label="Close">✕</button>

        {/* ── main row ── */}
        <div className="bm2-main-row">

          {/* Left participant */}
          <div className="bm2-team">
            {isDoubles ? (
              <div className="bm2-doubles-avatars">
                {[p1.player1PhotoUrl, p1.player2PhotoUrl].map((photo, i) => (
                  <Avatar key={i} photo={photo} name={p1Name} className="bm2-avatar bm2-doubles-avatar-item" />
                ))}
              </div>
            ) : (
              <Avatar photo={p1.logoUrl} name={p1Name} />
            )}
            <span className="bm2-team-name">{p1Name}</span>
          </div>

          {/* Centre */}
          <div className="bm2-center">
            <div className="bm2-datetime">
              {isScheduled ? formatDT(match.scheduledDate) : '— not scheduled —'}
            </div>
            <div className="bm2-score-row">
              {isPlayed ? (
                <>
                  <span className="bm2-score">{match.score1}</span>
                  <span className="bm2-score-sep">-</span>
                  <span className="bm2-score">{match.score2}</span>
                </>
              ) : (
                <span className="bm2-score-placeholder">? - ?</span>
              )}
            </div>
            <div className={`bm2-status ${match.status?.toLowerCase()}`}>{statusLabel}</div>
          </div>

          {/* Right participant */}
          <div className="bm2-team">
            {isDoubles ? (
              <div className="bm2-doubles-avatars">
                {[p2.player1PhotoUrl, p2.player2PhotoUrl].map((photo, i) => (
                  <Avatar key={i} photo={photo} name={p2Name} className="bm2-avatar bm2-doubles-avatar-item" />
                ))}
              </div>
            ) : (
              <Avatar photo={p2.logoUrl} name={p2Name} />
            )}
            <span className="bm2-team-name">{p2Name}</span>
          </div>
        </div>

        {/* ── field row ── */}
        <div className="bm2-field-row">
          <span className="bm2-field-label">Field :</span>
          <span className="bm2-field-value">
            {match.fieldId ? (fieldName || 'Loading…') : '—'}
          </span>
        </div>

        {/* ── hints & actions ── */}
        {isAdmin && !isPlayed && isReady && !isScheduled && (
          <p className="bm2-hint">Schedule the match first to unlock result recording.</p>
        )}
        {isAdmin && isPending && hasParticipants && !isScheduled && (
          <p className="bm2-hint">Schedule this match to make it ready for result recording.</p>
        )}
        {isAdmin && isPending && !hasParticipants && (
          <p className="bm2-hint">Waiting for both competitors to advance before this match can be scheduled.</p>
        )}
        {showRecordBtn && (
          <div className="bm2-action-row">
            <button
              className="btn-gold bm2-action-btn"
              onClick={() => { if (matchDatePassed) { onClose(); onScore(match) } }}
              disabled={!matchDatePassed}
              style={!matchDatePassed ? { opacity: 0.45, cursor: 'not-allowed' } : undefined}
              title={matchDatePassed ? undefined : `Result recording available after ${formatDT(match.scheduledDate)}`}
            >
              Record Result
            </button>
            {!matchDatePassed && (
              <p className="bm2-hint" style={{ marginTop: 6 }}>
                Result recording will be available after the scheduled match time.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default MatchDetailModal
