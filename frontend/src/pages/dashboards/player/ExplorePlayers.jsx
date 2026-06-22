import { useState, useEffect, useCallback, useRef } from 'react'
import { useAuth } from '../../../context/AuthContext'
import api from '../../../api/axiosInstance'
import '../AdminDashboard.css'

/* ── Icons ── */
const IconSearch  = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
const IconClose   = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconX       = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconUser    = () => <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const IconAdd     = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconCheck   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
const IconClock   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IconInbox   = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 16 12 14 15 10 15 8 12 2 12"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>

/* ── Avatar ── */
function Avatar({ src, name, size = 72 }) {
  const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'
  const placeholder = (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(198,168,75,0.1)', border: '1px solid rgba(198,168,75,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#c6a84b', fontSize: size * 0.3, fontWeight: 700, flexShrink: 0,
    }}>{initials}</div>
  )
  if (!src) return placeholder
  return (
    <img src={src} alt={name} style={{
      width: size, height: size, borderRadius: '50%', objectFit: 'cover',
      flexShrink: 0, border: '2px solid rgba(198,168,75,0.3)',
    }} />
  )
}

/* ── Friend-request action button ── */
function FriendButton({ player, onAction }) {
  const [busy, setBusy] = useState(false)
  const { user } = useAuth()

  const rel = player.relationStatus

  async function handleClick(e) {
    e.stopPropagation()
    if (busy) return
    setBusy(true)
    try {
      if (rel === 'NONE') {
        const { data } = await api.post('/api/player/friends/request', null, {
          params: { senderId: user.userId, receiverId: player.playerId },
        })
        onAction(player.playerId, 'REQUEST_SENT', data.requestId)
      } else if (rel === 'REQUEST_SENT') {
        await api.delete(`/api/player/friends/request/${player.pendingRequestId}`, {
          params: { requesterId: user.userId },
        })
        onAction(player.playerId, 'NONE', null)
      }
      // FRIENDS / REQUEST_RECEIVED → no action from this button
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed.')
    } finally {
      setBusy(false)
    }
  }

  if (rel === 'FRIENDS') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 600, color: '#81c784',
        padding: '5px 12px', borderRadius: 20,
        background: 'rgba(129,199,132,0.1)', border: '1px solid rgba(129,199,132,0.3)',
      }}>
        <IconCheck /> Friends
      </span>
    )
  }

  if (rel === 'REQUEST_RECEIVED') {
    return (
      <span style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 600, color: '#c6a84b',
        padding: '5px 12px', borderRadius: 20,
        background: 'rgba(198,168,75,0.08)', border: '1px solid rgba(198,168,75,0.25)',
      }}>
        <IconInbox /> Pending
      </span>
    )
  }

  if (rel === 'REQUEST_SENT') {
    return (
      <button
        onClick={handleClick}
        disabled={busy}
        title="Cancel request"
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 5,
          fontSize: 11, fontWeight: 600, color: '#aaa',
          padding: '5px 12px', borderRadius: 20,
          background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.15)',
          cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1,
          transition: 'background 0.2s, border-color 0.2s',
        }}
        onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,53,69,0.1)'; e.currentTarget.style.borderColor = 'rgba(220,53,69,0.35)'; e.currentTarget.style.color = '#e07070' }}
        onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.05)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; e.currentTarget.style.color = '#aaa' }}
      >
        <IconClock /> Sent
      </button>
    )
  }

  // NONE — add friend
  return (
    <button
      onClick={handleClick}
      disabled={busy}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 5,
        fontSize: 11, fontWeight: 600, color: '#c6a84b',
        padding: '5px 12px', borderRadius: 20,
        background: 'rgba(198,168,75,0.08)', border: '1px solid rgba(198,168,75,0.3)',
        cursor: busy ? 'not-allowed' : 'pointer', opacity: busy ? 0.6 : 1,
        transition: 'background 0.2s, border-color 0.2s',
      }}
      onMouseEnter={e => { e.currentTarget.style.background = 'rgba(198,168,75,0.18)' }}
      onMouseLeave={e => { e.currentTarget.style.background = 'rgba(198,168,75,0.08)' }}
    >
      <IconAdd /> Add Friend
    </button>
  )
}

/* ── Player Profile Modal ── */
function PlayerProfileModal({ player, onClose, onAction }) {
  if (!player) return null
  const genderColor = player.gender === 'MALE' ? '#7eb8f7' : '#f7a8c4'
  const genderLabel = player.gender === 'MALE' ? '♂ Man' : player.gender === 'FEMALE' ? '♀ Woman' : null

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 400, width: '100%' }}>
        <div className="modal-header">
          <h2 className="modal-title">{player.username}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconX /></button>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 18, paddingTop: 8 }}>
          <Avatar src={player.photoUrl} name={player.username} size={100} />
          <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0e6c8' }}>{player.username}</div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: 'center' }}>
            <span style={{ background: 'linear-gradient(135deg,#c6a84b,#a8852e)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 12px', borderRadius: 20 }}>PLAYER</span>
            {genderLabel && (
              <span style={{ background: 'rgba(198,168,75,0.08)', border: `1px solid ${genderColor}44`, color: genderColor, fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 20 }}>{genderLabel}</span>
            )}
          </div>
          <FriendButton player={player} onAction={onAction} />
        </div>
      </div>
    </div>
  )
}

/* ── Player Card ── */
function PlayerCard({ player, onOpen, onAction }) {
  const genderColor = player.gender === 'MALE' ? '#7eb8f7' : '#f7a8c4'
  const genderLabel = player.gender === 'MALE' ? '♂ Man' : player.gender === 'FEMALE' ? '♀ Woman' : null

  return (
    <div
      role="button" tabIndex={0}
      onClick={() => onOpen(player)}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onOpen(player)}
      aria-label={`View ${player.username}'s profile`}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center',
        gap: 10, padding: '22px 14px',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(198,168,75,0.15)',
        borderRadius: 14, cursor: 'pointer',
        transition: 'border-color 0.2s, background 0.2s, transform 0.15s',
        textAlign: 'center',
      }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(198,168,75,0.4)'; e.currentTarget.style.background = 'rgba(198,168,75,0.04)'; e.currentTarget.style.transform = 'translateY(-2px)' }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(198,168,75,0.15)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.transform = 'translateY(0)' }}
    >
      <Avatar src={player.photoUrl} name={player.username} size={66} />
      <div style={{ fontSize: 13, fontWeight: 700, color: '#f0e6c8', lineHeight: 1.3 }}>{player.username}</div>
      {genderLabel && <div style={{ fontSize: 12, color: genderColor, fontWeight: 600 }}>{genderLabel}</div>}
      {/* Stop propagation so clicking the button doesn't also open the modal */}
      <div onClick={e => e.stopPropagation()} onKeyDown={e => e.stopPropagation()}>
        <FriendButton player={player} onAction={onAction} />
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   EXPLORE PLAYERS
═══════════════════════════════════════════════ */
export default function ExplorePlayers() {
  const { user }  = useAuth()
  const sportId   = user?.sportId
  const viewerId  = user?.userId

  const [players,       setPlayers]       = useState([])
  const [loading,       setLoading]       = useState(true)
  const [error,         setError]         = useState('')
  const [searchInput,   setSearchInput]   = useState('')
  const [searchQuery,   setSearchQuery]   = useState('')
  const [selectedPlayer, setSelectedPlayer] = useState(null)
  const inputRef = useRef(null)

  const fetchPlayers = useCallback(async (q = '') => {
    if (!sportId || !viewerId) return
    setLoading(true); setError('')
    try {
      const params = { sportId, viewerId }
      if (q) params.username = q
      const { data } = await api.get('/api/player/explore', { params })
      setPlayers(data)
    } catch (err) {
      setError(`Failed to load players. ${err.response?.status ? `(HTTP ${err.response.status})` : '(Network error)'}`)
    } finally {
      setLoading(false)
    }
  }, [sportId, viewerId])

  useEffect(() => { fetchPlayers() }, [fetchPlayers])

  /** Called by FriendButton after a successful action — update local state without refetch */
  function handleAction(playerId, newStatus, newRequestId) {
    const update = p => p.playerId === playerId
      ? { ...p, relationStatus: newStatus, pendingRequestId: newRequestId }
      : p
    setPlayers(prev => prev.map(update))
    setSelectedPlayer(prev => prev?.playerId === playerId
      ? { ...prev, relationStatus: newStatus, pendingRequestId: newRequestId }
      : prev)
  }

  function handleSearch() {
    const trimmed = searchInput.trim()
    setSearchQuery(trimmed)
    fetchPlayers(trimmed)
  }
  function handleKeyDown(e) { if (e.key === 'Enter') handleSearch() }
  function handleClear()    { setSearchInput(''); setSearchQuery(''); fetchPlayers(''); inputRef.current?.focus() }

  if (!sportId) return (
    <div>
      <div className="page-header"><h1 className="page-title">Explore Players</h1></div>
      <div className="empty-state"><p>No sport assigned to your account.</p></div>
    </div>
  )

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Explore Players</h1>
        <p className="page-subtitle">
          {loading ? 'Loading…' : `${players.length} player${players.length !== 1 ? 's' : ''}${searchQuery ? ` matching "${searchQuery}"` : ''}`}
        </p>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Search */}
      <div style={{ marginBottom: 28, display: 'flex', gap: 10, alignItems: 'center' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 380 }}>
          <span style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(198,168,75,0.5)', display: 'flex', pointerEvents: 'none' }}>
            <IconSearch />
          </span>
          <input
            ref={inputRef}
            className="form-input"
            placeholder="Search by username… (Enter)"
            value={searchInput}
            onChange={e => setSearchInput(e.target.value)}
            onKeyDown={handleKeyDown}
            style={{ paddingLeft: 38, paddingRight: searchInput ? 36 : 14 }}
          />
          {searchInput && (
            <button onClick={handleClear} aria-label="Clear" style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: 'rgba(198,168,75,0.55)', display: 'flex', padding: 0 }}>
              <IconClose />
            </button>
          )}
        </div>
        <button onClick={handleSearch} disabled={loading} style={{ padding: '10px 20px', borderRadius: 8, border: 'none', background: 'linear-gradient(135deg,#c6a84b,#a8852e)', color: '#fff', fontSize: 13, fontWeight: 600, cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1, display: 'flex', alignItems: 'center', gap: 6, flexShrink: 0 }}>
          <IconSearch /> Search
        </button>
      </div>

      {/* Grid */}
      {loading ? (
        <div className="empty-state"><span className="spinner light" style={{ width: 28, height: 28 }} /></div>
      ) : players.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconUser /></div>
          <p>{searchQuery ? `No players found matching "${searchQuery}".` : 'No active players in your sport yet.'}</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
          {players.map(p => (
            <PlayerCard key={p.playerId} player={p} onOpen={setSelectedPlayer} onAction={handleAction} />
          ))}
        </div>
      )}

      {/* Profile modal */}
      {selectedPlayer && (
        <PlayerProfileModal
          player={selectedPlayer}
          onClose={() => setSelectedPlayer(null)}
          onAction={handleAction}
        />
      )}
    </div>
  )
}
