import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../../api/axiosInstance'
import AuthImage from '../../../components/AuthImage'
import TargetCursor from '../../../components/TargetCursor'
import '../AdminDashboard.css'

/* ── Inline SVG icons ── */
const IconClose  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconUser   = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const IconTrash  = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>

/* ── Avatar ── */
function Avatar({ src, name, size = 48 }) {
  const initials = name
    ? name.split(' ').map((w) => w[0]).slice(0, 2).join('').toUpperCase()
    : '?'
  const placeholder = (
    <div style={{
      width: size, height: size, borderRadius: '50%',
      background: 'rgba(198,168,75,0.1)',
      border: '1px solid rgba(198,168,75,0.25)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: '#c6a84b', fontSize: size * 0.35, fontWeight: 700,
      fontFamily: 'Montserrat, sans-serif', flexShrink: 0,
    }}>{initials}</div>
  )
  if (!src) return placeholder
  if (src.startsWith('data:')) {
    return (
      <img src={src} alt={name} style={{
        width: size, height: size, borderRadius: '50%',
        objectFit: 'cover', flexShrink: 0,
        border: '1px solid rgba(198,168,75,0.25)',
      }} />
    )
  }
  return (
    <AuthImage src={src} alt={name}
      style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(198,168,75,0.25)' }}
      placeholder={placeholder}
    />
  )
}

/* ═══════════════════════════════════════════════
   PLAYER DETAILS MODAL
═══════════════════════════════════════════════ */
function PlayerDetailsModal({ playerId, onClose, onDeleted }) {
  const [details,      setDetails]      = useState(null)
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')
  const [showConfirm,  setShowConfirm]  = useState(false)
  const [delLoading,   setDelLoading]   = useState(false)
  const [delError,     setDelError]     = useState('')

  useEffect(() => {
    if (!playerId) return
    setLoading(true); setError('')
    api.get(`/api/admin/players/${playerId}`)
      .then(({ data }) => setDetails(data))
      .catch(() => setError('Failed to load player details.'))
      .finally(() => setLoading(false))
  }, [playerId])

  const handleDelete = async () => {
    setDelLoading(true); setDelError('')
    try {
      await api.delete(`/api/admin/players/${playerId}`)
      onDeleted(playerId)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to delete player.'
      setDelError(typeof msg === 'string' ? msg : 'Failed to delete player.')
      setShowConfirm(false)
    } finally {
      setDelLoading(false)
    }
  }

  const formatDate = (iso) => {
    if (!iso) return '–'
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  function DetailRow({ label, value }) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(198,168,75,0.55)' }}>{label}</span>
        <span style={{ fontSize: 14, color: '#ddd' }}>{value || '–'}</span>
      </div>
    )
  }

  function ModalAvatar({ src, name, size = 80 }) {
    const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'
    const placeholder = (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'rgba(198,168,75,0.12)', border: '3px solid rgba(198,168,75,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#c6a84b', fontWeight: 700, fontSize: size * 0.32, flexShrink: 0,
      }}>{initials}</div>
    )
    if (!src) return placeholder
    if (src.startsWith('data:')) return (
      <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '3px solid rgba(198,168,75,0.35)' }} />
    )
    return (
      <AuthImage src={src} alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '3px solid rgba(198,168,75,0.35)' }}
        placeholder={placeholder}
      />
    )
  }

  return (
    <>
      <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && !showConfirm && onClose()}>
        <div className="modal-box" style={{ maxWidth: 520, width: '100%' }}>
          <div className="modal-header">
            <h2 className="modal-title">{details ? details.fullName : 'Player Details'}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {/* Delete button */}
              {details && (
                <button
                  onClick={() => setShowConfirm(true)}
                  disabled={delLoading}
                  title="Delete player"
                  aria-label="Delete player"
                  style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    width: 32, height: 32, borderRadius: 6,
                    background: 'rgba(220,53,69,0.08)',
                    border: '1px solid rgba(220,53,69,0.3)',
                    color: '#e07070', cursor: 'pointer',
                    transition: 'background 0.2s, border-color 0.2s',
                    padding: 0,
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = 'rgba(220,53,69,0.2)'; e.currentTarget.style.borderColor = '#e07070' }}
                  onMouseLeave={e => { e.currentTarget.style.background = 'rgba(220,53,69,0.08)'; e.currentTarget.style.borderColor = 'rgba(220,53,69,0.3)' }}
                >
                  <IconTrash />
                </button>
              )}
              <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
            </div>
          </div>

          {loading && <div style={{ textAlign: 'center', padding: '40px 0' }}><span className="spinner light" style={{ width: 28, height: 28 }} /></div>}
          {error    && <div className="form-error">{error}</div>}
          {delError && <div className="form-error" style={{ marginTop: 8 }}>{delError}</div>}

          {!loading && details && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

              {/* Avatar + name + badges */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <ModalAvatar src={details.photoUrl} name={details.fullName} size={80} />
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0e6c8', marginBottom: 6 }}>{details.fullName}</div>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    <span style={{ background: 'linear-gradient(135deg, #c6a84b, #a8852e)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>PLAYER</span>
                    {details.sportName && details.sportName !== '–' && (
                      <span style={{ background: 'rgba(198,168,75,0.12)', border: '1px solid rgba(198,168,75,0.3)', color: '#c6a84b', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.04em' }}>{details.sportName}</span>
                    )}
                  </div>
                </div>
              </div>

              <div style={{ height: 1, background: 'rgba(198,168,75,0.1)' }} />

              {/* Contact info grid */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <DetailRow label="Email"  value={details.email} />
                <DetailRow label="Phone"  value={details.phoneNumber} />
                <DetailRow label="Sport"  value={details.sportName} />
                <DetailRow label="Gender" value={
                  details.gender === 'MALE'   ? '♂ Man' :
                  details.gender === 'FEMALE' ? '♀ Woman' : '–'
                } />
                <DetailRow label="Since"  value={formatDate(details.appliedAt)} />
              </div>

            </div>
          )}
        </div>
      </div>

      {/* ── Delete confirmation modal ── */}
      {showConfirm && details && (
        <div className="modal-overlay" style={{ zIndex: 9100 }} onClick={(e) => e.target === e.currentTarget && !delLoading && setShowConfirm(false)}>
          <div className="modal-box sm">
            <div className="modal-header">
              <h2 className="modal-title">Delete Player</h2>
              <button className="modal-close" onClick={() => setShowConfirm(false)} disabled={delLoading} aria-label="Close">
                <IconClose />
              </button>
            </div>
            <p className="confirm-text">
              Are you sure you want to permanently delete{' '}
              <span className="confirm-name">{details.fullName}</span>?
              This action <strong>cannot be undone</strong>.
            </p>
            <div className="confirm-btns">
              <button className="btn-outline-gold" onClick={() => setShowConfirm(false)} disabled={delLoading}>
                Cancel
              </button>
              <button className="btn-danger" onClick={handleDelete} disabled={delLoading}>
                {delLoading
                  ? <span className="spinner" style={{ borderColor: 'rgba(220,53,69,0.25)', borderTopColor: '#e07070' }} />
                  : <IconTrash />
                }
                {delLoading ? 'Deleting…' : 'Delete Player'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

/* ═══════════════════════════════════════════════
   PLAYER CARD (grid item)
═══════════════════════════════════════════════ */
function PlayerCard({ player, onClick }) {
  return (
    <div
      className="mc-captain-card cursor-target"
      onClick={() => onClick(player.playerId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(player.playerId)}
      aria-label={`View ${player.fullName} details`}
    >
      <Avatar src={player.photoUrl} name={player.fullName} size={68} />
      <div className="mc-captain-info">
        <div className="mc-captain-name">{player.fullName}</div>
        {player.sportName && player.sportName !== '–' && (
          <div className="mc-captain-sport">{player.sportName}</div>
        )}
        {player.gender && (
          <div style={{ fontSize: 11, marginTop: 2, color: player.gender === 'MALE' ? '#7eb8f7' : '#f7a8c4' }}>
            {player.gender === 'MALE' ? '♂ Man' : '♀ Woman'}
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MANAGE PLAYERS — MAIN COMPONENT
═══════════════════════════════════════════════ */
function ManagePlayers() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [players,  setPlayers]  = useState([])
  const [sports,   setSports]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const sportParam = searchParams.get('psport') ?? ''
  const nameParam  = searchParams.get('pq')     ?? ''
  const [nameInput, setNameInput] = useState(nameParam)

  const selectedPlayerId = searchParams.get('selectedId')

  const handlePlayerDeleted = useCallback((deletedId) => {
    setPlayers(prev => prev.filter(p => p.playerId !== deletedId))
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = sportParam ? { sportId: sportParam } : {}
      const [playersRes, sportsRes] = await Promise.all([
        api.get('/api/admin/players', { params }),
        api.get('/api/sports'),
      ])
      setPlayers(playersRes.data)
      setSports(sportsRes.data)
    } catch (err) {
      const status = err.response?.status
      setError(`Failed to load players. ${status ? `(HTTP ${status})` : '(Network error)'}`)
    } finally {
      setLoading(false)
    }
  }, [sportParam])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setNameInput(nameParam) }, [nameParam])

  function handleSportSelect(id) {
    const next = new URLSearchParams(searchParams)
    if (id) { next.set('psport', id) } else { next.delete('psport') }
    next.delete('pq')
    setNameInput('')
    setSearchParams(next)
  }

  function handleNameKeyDown(e) {
    if (e.key === 'Enter') {
      const next = new URLSearchParams(searchParams)
      const trimmed = nameInput.trim()
      if (trimmed) { next.set('pq', trimmed) } else { next.delete('pq') }
      setSearchParams(next)
    }
  }

  function handleNameClear() {
    setNameInput('')
    const next = new URLSearchParams(searchParams)
    next.delete('pq')
    setSearchParams(next)
  }

  const visiblePlayers = nameParam
    ? players.filter((p) => p.fullName.toLowerCase().includes(nameParam.toLowerCase()))
    : players

  return (
    <div>
      <TargetCursor targetSelector=".cursor-target" spinDuration={3} hoverDuration={0.25} />

      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Manage Players</h1>
        <p className="page-subtitle">
          {loading ? 'Loading…' : `${visiblePlayers.length} player${visiblePlayers.length !== 1 ? 's' : ''}${sportParam ? ' in selected sport' : ''}${nameParam ? ` matching "${nameParam}"` : ''}`}
        </p>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Filters */}
      {!loading && (
        <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, marginBottom: 28, flexWrap: 'wrap' }}>
          {sports.length > 0 && (
            <div style={{ flex: 1, minWidth: 0 }}>
              <div className="form-label" style={{ marginBottom: 10 }}>Filter by Sport</div>
              <div className="mf-filter-tabs">
                <button className={`mf-filter-tab ${!sportParam ? 'active' : ''}`} onClick={() => handleSportSelect(null)}>All</button>
                {sports.map((sport) => (
                  <button key={sport.id} className={`mf-filter-tab ${sportParam === sport.id ? 'active' : ''}`} onClick={() => handleSportSelect(sportParam === sport.id ? null : sport.id)}>
                    {sport.sportName}
                  </button>
                ))}
              </div>
            </div>
          )}
          <div style={{ position: 'relative', width: 260, flexShrink: 0 }}>
            <input
              className="form-input"
              placeholder="Search by player name… (Enter)"
              value={nameInput}
              onChange={(e) => setNameInput(e.target.value)}
              onKeyDown={handleNameKeyDown}
              style={{ paddingRight: nameInput ? 36 : 14 }}
            />
            {nameInput && (
              <button onClick={handleNameClear} style={{ position: 'absolute', right: 10, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', color: '#555', display: 'flex', alignItems: 'center', padding: 0 }} aria-label="Clear search">
                <IconClose />
              </button>
            )}
          </div>
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="empty-state"><span className="spinner light" style={{ width: 28, height: 28 }} /></div>
      ) : visiblePlayers.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconUser /></div>
          <p>{nameParam || sportParam ? 'No players match your filters.' : 'No active players found.'}</p>
        </div>
      ) : (
        <div className="mc-captains-grid">
          {visiblePlayers.map((p) => (
            <PlayerCard
              key={p.playerId}
              player={p}
              onClick={(id) => {
                const next = new URLSearchParams(searchParams)
                next.set('selectedId', id)
                setSearchParams(next)
              }}
            />
          ))}
        </div>
      )}

      {/* Player details modal */}
      {selectedPlayerId && (
        <PlayerDetailsModal
          playerId={selectedPlayerId}
          onClose={() => {
            const next = new URLSearchParams(searchParams)
            next.delete('selectedId')
            setSearchParams(next)
          }}
          onDeleted={(deletedId) => {
            handlePlayerDeleted(deletedId)
            const next = new URLSearchParams(searchParams)
            next.delete('selectedId')
            setSearchParams(next)
          }}
        />
      )}
    </div>
  )
}

export default ManagePlayers
