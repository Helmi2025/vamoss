import { useState } from 'react'
import api from '../../../api/axiosInstance'
import './TournamentBracket.css'

const IconClose = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconSwap = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M7 16V4M7 4L3 8M7 4L11 8M17 8v12M17 20l-4-4M17 20l4-4"/></svg>

function SwapModal({ tournamentId, initialMatch, bracketData, onClose, onSuccess }) {
  const [selectedMatch2, setSelectedMatch2] = useState(null)
  const [match1Position, setMatch1Position] = useState(() => {
    // Default to position 1 if it has a participant, otherwise position 2
    if (initialMatch.participant1Id) return 1
    if (initialMatch.participant2Id) return 2
    return 1 // fallback
  })
  const [match2Position, setMatch2Position] = useState(1)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Flatten all matches from bracket for selection
  const getAllMatches = () => {
    if (!bracketData || !bracketData.finalMatch) return []
    
    const matches = []
    const traverse = (node) => {
      if (!node) return
      if (node.id) matches.push(node)
      if (node.semiFinal1) traverse(node.semiFinal1)
      if (node.semiFinal2) traverse(node.semiFinal2)
      if (node.quarterFinal1) traverse(node.quarterFinal1)
      if (node.quarterFinal2) traverse(node.quarterFinal2)
    }
    
    traverse(bracketData.finalMatch)
    return matches.filter(m => m.id !== initialMatch.id && m.status !== 'PLAYED')
  }

  const availableMatches = getAllMatches()

  const getParticipantName = (match, position) => {
    if (position === 1) {
      return match.participant1Id 
        ? (match.participant1?.name || `Participant ${match.participant1Id.substring(0, 5)}`)
        : 'TBD'
    } else {
      return match.participant2Id
        ? (match.participant2?.name || `Participant ${match.participant2Id.substring(0, 5)}`)
        : 'TBD'
    }
  }

  const hasParticipant = (match, position) => {
    if (position === 1) {
      return !!match.participant1Id
    } else {
      return !!match.participant2Id
    }
  }

  const handleSwap = async () => {
    if (!selectedMatch2) {
      setError('Please select a match to swap with')
      return
    }

    if (!hasParticipant(initialMatch, match1Position)) {
      setError('Cannot swap - selected position in Match 1 is empty (TBD)')
      return
    }

    if (!hasParticipant(selectedMatch2, match2Position)) {
      setError('Cannot swap - selected position in Match 2 is empty (TBD)')
      return
    }

    setError('')
    setLoading(true)

    try {
      await api.post(`/api/tournaments/${tournamentId}/bracket/swap`, {
        match1Id: initialMatch.id,
        match2Id: selectedMatch2.id,
        match1Position,
        match2Position
      })

      setLoading(false)
      onSuccess && onSuccess()
      onClose()
    } catch (err) {
      setLoading(false)
      setError(err.response?.data?.message || 'Failed to swap participants')
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 600, width: '100%' }}>
        <div className="modal-header">
          <h2 className="modal-title">Swap Match Participants</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Match 1 */}
          <div className="swap-match-section">
            <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#c6a84b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Match 1 (Selected)
            </h4>
            <div className="swap-match-card">
              <div className="swap-match-info">
                <span style={{ fontWeight: 600, color: '#f0e6c8' }}>Match {initialMatch.matchNumber}</span>
                <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>{initialMatch.status}</span>
              </div>
              
              <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                <label className={`swap-position-option ${!hasParticipant(initialMatch, 1) ? 'disabled' : ''}`}>
                  <input
                    type="radio"
                    name="match1Position"
                    value={1}
                    checked={match1Position === 1}
                    onChange={(e) => setMatch1Position(parseInt(e.target.value))}
                    disabled={!hasParticipant(initialMatch, 1)}
                  />
                  <span className="swap-position-label">
                    Position 1: <strong>{getParticipantName(initialMatch, 1)}</strong>
                  </span>
                </label>
                <label className={`swap-position-option ${!hasParticipant(initialMatch, 2) ? 'disabled' : ''}`}>
                  <input
                    type="radio"
                    name="match1Position"
                    value={2}
                    checked={match1Position === 2}
                    onChange={(e) => setMatch1Position(parseInt(e.target.value))}
                    disabled={!hasParticipant(initialMatch, 2)}
                  />
                  <span className="swap-position-label">
                    Position 2: <strong>{getParticipantName(initialMatch, 2)}</strong>
                  </span>
                </label>
              </div>
            </div>
          </div>

          {/* Swap Icon */}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <div style={{ 
              width: 40, height: 40, borderRadius: '50%', 
              background: 'rgba(198,168,75,0.1)', border: '1px solid rgba(198,168,75,0.3)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#c6a84b'
            }}>
              <IconSwap />
            </div>
          </div>

          {/* Match 2 */}
          <div className="swap-match-section">
            <h4 style={{ margin: '0 0 12px', fontSize: 13, fontWeight: 600, color: '#c6a84b', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Match 2 (Select to swap with)
            </h4>
            
            <select
              className="form-input"
              value={selectedMatch2?.id || ''}
              onChange={(e) => {
                const match = availableMatches.find(m => m.id === e.target.value)
                setSelectedMatch2(match || null)
                // Reset match2Position to default based on the selected match
                if (match) {
                  setMatch2Position(match.participant1Id ? 1 : (match.participant2Id ? 2 : 1))
                }
              }}
              style={{ marginBottom: 12 }}
            >
              <option value="">Select a match...</option>
              {availableMatches.map(m => (
                <option key={m.id} value={m.id}>
                  Match {m.matchNumber} - {getParticipantName(m, 1)} vs {getParticipantName(m, 2)}
                </option>
              ))}
            </select>

            {selectedMatch2 && (
              <div className="swap-match-card">
                <div className="swap-match-info">
                  <span style={{ fontWeight: 600, color: '#f0e6c8' }}>Match {selectedMatch2.matchNumber}</span>
                  <span style={{ fontSize: 11, color: '#888', marginLeft: 8 }}>{selectedMatch2.status}</span>
                </div>
                
                <div style={{ display: 'flex', gap: 12, marginTop: 12 }}>
                  <label className={`swap-position-option ${!hasParticipant(selectedMatch2, 1) ? 'disabled' : ''}`}>
                    <input
                      type="radio"
                      name="match2Position"
                      value={1}
                      checked={match2Position === 1}
                      onChange={(e) => setMatch2Position(parseInt(e.target.value))}
                      disabled={!hasParticipant(selectedMatch2, 1)}
                    />
                    <span className="swap-position-label">
                      Position 1: <strong>{getParticipantName(selectedMatch2, 1)}</strong>
                    </span>
                  </label>
                  <label className={`swap-position-option ${!hasParticipant(selectedMatch2, 2) ? 'disabled' : ''}`}>
                    <input
                      type="radio"
                      name="match2Position"
                      value={2}
                      checked={match2Position === 2}
                      onChange={(e) => setMatch2Position(parseInt(e.target.value))}
                      disabled={!hasParticipant(selectedMatch2, 2)}
                    />
                    <span className="swap-position-label">
                      Position 2: <strong>{getParticipantName(selectedMatch2, 2)}</strong>
                    </span>
                  </label>
                </div>
              </div>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
            <button className="btn-outline-gold" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button 
              className="btn-gold" 
              onClick={handleSwap} 
              disabled={loading || !selectedMatch2}
            >
              {loading ? <span className="spinner" /> : 'Swap Participants'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SwapModal