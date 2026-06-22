import { useState, useEffect } from 'react'
import MatchDetailModal from './MatchDetailModal'
import './TournamentBracket.css'

/* ── Inline SVG Icons ── */
const IconTrophy = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#c6a84b' }}>
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a5 5 0 0 0-6 4.88c0 3 2.1 5.37 5 5.8V2z" />
  </svg>
)
const IconClose    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

/* ─────────────────────────────────────────────
   DOUBLES MINI-AVATAR STACK (bracket card)
   ───────────────────────────────────────────── */
function DoublesAvatarStack({ p1Photo, p2Photo, p1Name, p2Name }) {
  const Av = ({ photo, name }) => {
    const letter = name ? name.charAt(0).toUpperCase() : '?'
    if (photo) return <img src={photo} alt={name} className="dbl-stack-img" />
    return <div className="dbl-stack-placeholder">{letter}</div>
  }
  return (
    <div className="dbl-stack">
      <Av photo={p1Photo} name={p1Name} />
      <Av photo={p2Photo} name={p2Name} />
    </div>
  )
}

/* ─────────────────────────────────────────────
   BRACKET MATCH CARD
   ───────────────────────────────────────────── */
function BracketMatch({ match, highlightTeamId, onClick }) {
  if (!match) {
    return (
      <div className="bracket-match-card placeholder">
        <div className="match-participant placeholder">TBD</div>
        <div className="match-divider" />
        <div className="match-participant placeholder">TBD</div>
      </div>
    )
  }

  const p1Name  = match.participant1Id ? (match.participant1?.name  || `Participant ${match.participant1Id.substring(0, 5)}`) : 'TBD'
  const p2Name  = match.participant2Id ? (match.participant2?.name  || `Participant ${match.participant2Id.substring(0, 5)}`) : 'TBD'
  const p1Logo  = match.participant1?.logoUrl || null
  const p2Logo  = match.participant2?.logoUrl || null

  const isDoubles = !!(match.participant1?.player1Id || match.participant2?.player1Id)
  const p1_p1Photo = match.participant1?.player1PhotoUrl || null
  const p1_p2Photo = match.participant1?.player2PhotoUrl || null
  const p2_p1Photo = match.participant2?.player1PhotoUrl || null
  const p2_p2Photo = match.participant2?.player2PhotoUrl || null

  const isPlayed   = match.status === 'PLAYED'
  const isWinnerP1 = isPlayed && match.winnerId === match.participant1Id
  const isWinnerP2 = isPlayed && match.winnerId === match.participant2Id
  const isMyTeamP1 = highlightTeamId && match.participant1Id === highlightTeamId
  const isMyTeamP2 = highlightTeamId && match.participant2Id === highlightTeamId
  const isScheduled = !!(match.scheduledDate && match.fieldId)

  return (
    <div
      className={`bracket-match-card ${match.status.toLowerCase()} clickable`}
      onClick={() => onClick && onClick(match)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick && onClick(match)}
      title="Click to view match details"
    >
      <div className="bracket-match-header">
        <span className="match-num">Match {match.matchNumber}</span>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          {isScheduled && <span className="bm-scheduled-dot" title="Scheduled" />}
          <span className={`match-status-tag ${match.status.toLowerCase()}`}>{match.status}</span>
        </div>
      </div>

      <div className="match-participants">
        <div className={`match-participant ${isWinnerP1 ? 'winner' : ''} ${isPlayed && !isWinnerP1 ? 'loser' : ''} ${isMyTeamP1 ? 'my-team' : ''}`}>
          <div className="participant-info">
            {isDoubles
              ? <DoublesAvatarStack p1Photo={p1_p1Photo} p2Photo={p1_p2Photo} p1Name={p1Name} p2Name={p1Name} />
              : p1Logo && <img src={p1Logo} alt={p1Name} className="participant-logo" />
            }
            <span className="participant-name" title={p1Name}>{p1Name}</span>
          </div>
          {isPlayed && <span className="participant-score">{match.score1}</span>}
        </div>
        <div className="match-divider" />
        <div className={`match-participant ${isWinnerP2 ? 'winner' : ''} ${isPlayed && !isWinnerP2 ? 'loser' : ''} ${isMyTeamP2 ? 'my-team' : ''}`}>
          <div className="participant-info">
            {isDoubles
              ? <DoublesAvatarStack p1Photo={p2_p1Photo} p2Photo={p2_p2Photo} p1Name={p2Name} p2Name={p2Name} />
              : p2Logo && <img src={p2Logo} alt={p2Name} className="participant-logo" />
            }
            <span className="participant-name" title={p2Name}>{p2Name}</span>
          </div>
          {isPlayed && <span className="participant-score">{match.score2}</span>}
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   TOURNAMENT BRACKET
   Props:
     bracketData    – BracketResponse from API
     highlightTeamId – optional team/player ID to highlight
     isAdmin        – bool, enables admin actions in modal
     tournament     – tournament object (needed for admin schedule validation)
     onSchedule(m)  – admin: open schedule modal for match m
     onScore(m)     – admin: open score modal for match m
   ───────────────────────────────────────────── */
function TournamentBracket({ bracketData, highlightTeamId, isAdmin, onSchedule, onScore }) {
  const [selectedMatch, setSelectedMatch] = useState(null)

  if (!bracketData || !bracketData.finalMatch) {
    return (
      <div className="bracket-empty-state">
        <p>No bracket generated yet. Once the tournament is full, the admin can generate the bracket.</p>
      </div>
    )
  }

  const { finalMatch, champion } = bracketData
  const hasQuarterFinals = !!(finalMatch.semiFinal1?.quarterFinal1 || finalMatch.semiFinal1?.quarterFinal2)

  const qfMatches = hasQuarterFinals ? [
    finalMatch.semiFinal1.quarterFinal1,
    finalMatch.semiFinal1.quarterFinal2,
    finalMatch.semiFinal2.quarterFinal1,
    finalMatch.semiFinal2.quarterFinal2
  ] : []

  const sfMatches = [finalMatch.semiFinal1, finalMatch.semiFinal2]

  const handleMatchClick = (match) => {
    if (match && match.id) setSelectedMatch(match)
  }

  return (
    <>
      <div className="bracket-container">
        <div className="bracket-scroller">
          <div className="bracket-rounds-wrapper">

            {hasQuarterFinals && (
              <div className="bracket-round-column">
                <h4 className="round-column-title">Quarter Finals</h4>
                <div className="round-column-matches">
                  {qfMatches.map((m, idx) => (
                    <BracketMatch key={m?.id || `qf-${idx}`} match={m} highlightTeamId={highlightTeamId} onClick={handleMatchClick} />
                  ))}
                </div>
              </div>
            )}

            <div className="bracket-round-column">
              <h4 className="round-column-title">Semi Finals</h4>
              <div className="round-column-matches">
                {sfMatches.map((m, idx) => (
                  <BracketMatch key={m?.id || `sf-${idx}`} match={m} highlightTeamId={highlightTeamId} onClick={handleMatchClick} />
                ))}
              </div>
            </div>

            <div className="bracket-round-column">
              <h4 className="round-column-title">Finals</h4>
              <div className="round-column-matches">
                <BracketMatch match={finalMatch} highlightTeamId={highlightTeamId} onClick={handleMatchClick} />
              </div>
            </div>

            <div className="bracket-round-column champion-col">
              <h4 className="round-column-title">Champion</h4>
              <div className="champion-card-wrapper">
                {champion ? (
                  <div className={`champion-gold-card ${highlightTeamId && champion.id === highlightTeamId ? 'my-team-champion' : ''}`}>
                    <div className="champion-icon-wrap">
                      {champion.logoUrl
                        ? <img src={champion.logoUrl} alt={champion.name} className="champion-logo" />
                        : <IconTrophy />}
                    </div>
                    <div className="champion-label">CHAMPION</div>
                    <div className="champion-name" title={champion.name}>{champion.name}</div>
                  </div>
                ) : (
                  <div className="champion-card-placeholder">
                    <div className="champion-icon-placeholder"><IconTrophy /></div>
                    <div className="champion-label">TBD</div>
                  </div>
                )}
              </div>
            </div>

          </div>
        </div>
      </div>

      {selectedMatch && (
        <MatchDetailModal
          match={selectedMatch}
          onClose={() => setSelectedMatch(null)}
          isAdmin={!!isAdmin}
          onSchedule={(m) => { setSelectedMatch(null); onSchedule && onSchedule(m) }}
          onScore={(m)    => { setSelectedMatch(null); onScore    && onScore(m)    }}
        />
      )}
    </>
  )
}

export default TournamentBracket
