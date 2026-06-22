import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../../api/axiosInstance'
import AuthImage from '../../../components/AuthImage'
import TargetCursor from '../../../components/TargetCursor'
import '../AdminDashboard.css'

/* ── Inline SVG icons ── */
const IconClose  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconUser   = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const IconTeam   = () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="18" cy="7" r="2"/><path d="M22 21v-1.5a3 3 0 0 0-2-2.83"/></svg>

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

/* ── Team logo placeholder ── */
function TeamLogoSmall({ logoUrl, size = 32 }) {
  const placeholder = (
    <div style={{
      width: size, height: size, borderRadius: 6,
      background: 'rgba(198,168,75,0.08)',
      border: '1px solid rgba(198,168,75,0.18)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'rgba(198,168,75,0.35)', flexShrink: 0,
    }}>
      <IconTeam />
    </div>
  )
  if (!logoUrl) return placeholder
  return (
    <AuthImage src={logoUrl} alt="Team logo"
      style={{ width: size, height: size, borderRadius: 6, objectFit: 'cover', flexShrink: 0, border: '1px solid rgba(198,168,75,0.18)' }}
      placeholder={placeholder}
    />
  )
}

/* ═══════════════════════════════════════════════
   TEAM DETAILS MODAL  (same logic as ManageTeams)
═══════════════════════════════════════════════ */
function TeamDetailsModal({ teamId, onClose }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!teamId) return
    setLoading(true); setError('')
    api.get(`/api/admin/teams/${teamId}`)
      .then(({ data }) => setDetails(data))
      .catch(() => setError('Failed to load team details.'))
      .finally(() => setLoading(false))
  }, [teamId])

  const formatDate = (iso) => {
    if (!iso) return '–'
    return new Date(iso).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })
  }

  function ModalAvatar({ src, name, size = 48 }) {
    const initials = name ? name.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase() : '?'
    const placeholder = (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'rgba(198,168,75,0.15)', border: '2px solid rgba(198,168,75,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#c6a84b', fontWeight: 700, fontSize: size * 0.35, flexShrink: 0,
      }}>{initials}</div>
    )
    if (!src) return placeholder
    if (src.startsWith('data:')) return (
      <img src={src} alt={name} style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(198,168,75,0.35)' }} />
    )
    return (
      <AuthImage src={src} alt={name}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '2px solid rgba(198,168,75,0.35)' }}
        placeholder={placeholder}
      />
    )
  }

  function ModalTeamLogo({ logoUrl, teamName, size = 80 }) {
    const initials = teamName ? teamName.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2) : '?'
    const placeholder = (
      <div style={{
        width: size, height: size, borderRadius: '50%',
        background: 'rgba(198,168,75,0.1)', border: '3px solid rgba(198,168,75,0.3)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color: '#c6a84b', fontWeight: 700, fontSize: size * 0.28, flexShrink: 0,
      }}>{initials}</div>
    )
    if (!logoUrl) return placeholder
    return (
      <AuthImage src={logoUrl} alt={`${teamName} logo`}
        style={{ width: size, height: size, borderRadius: '50%', objectFit: 'cover', flexShrink: 0, border: '3px solid rgba(198,168,75,0.4)' }}
        placeholder={placeholder}
      />
    )
  }

  const SectionLabel = ({ children }) => (
    <p style={{
      fontSize: 11, fontWeight: 700, color: 'rgba(198,168,75,0.6)',
      textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 14, marginTop: 0,
    }}>{children}</p>
  )

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 780, width: '100%' }}>
        <div className="modal-header">
          <h2 className="modal-title">{details ? details.teamName : 'Team Details'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>
        {loading && <div style={{ textAlign: 'center', padding: '40px 0' }}><span className="spinner light" style={{ width: 28, height: 28 }} /></div>}
        {error && <div className="form-error">{error}</div>}
        {!loading && details && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <ModalTeamLogo logoUrl={details.logoUrl} teamName={details.teamName} size={80} />
              <div style={{ flex: 1, minWidth: 140 }}>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: '#f0e6c8', marginBottom: 6 }}>{details.teamName}</div>
                <span style={{ background: 'rgba(198,168,75,0.12)', border: '1px solid rgba(198,168,75,0.3)', color: '#c6a84b', fontSize: 12, padding: '3px 12px', borderRadius: 20, fontWeight: 600, letterSpacing: '0.04em' }}>{details.sportName}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '10px 20px', background: 'rgba(198,168,75,0.06)', border: '1px solid rgba(198,168,75,0.15)', borderRadius: 10 }}>
                <span style={{ fontSize: 15, fontWeight: 700, color: '#f0e6c8' }}>{formatDate(details.createdAt)}</span>
                <span style={{ fontSize: 11, color: 'rgba(198,168,75,0.65)', marginTop: 2, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Since</span>
              </div>
            </div>
            <div style={{ height: 1, background: 'rgba(198,168,75,0.12)' }} />
            <div>
              <SectionLabel>Captain</SectionLabel>
              {details.captain ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 18px', background: 'rgba(198,168,75,0.05)', border: '1px solid rgba(198,168,75,0.15)', borderRadius: 10 }}>
                  <ModalAvatar src={details.captain.photoUrl} name={details.captain.fullName} size={52} />
                  <div>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 15, color: '#f0e6c8' }}>{details.captain.fullName}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(198,168,75,0.6)' }}>Team Captain</p>
                  </div>
                  <span style={{ marginLeft: 'auto', background: 'linear-gradient(135deg, #c6a84b, #a8852e)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>♛ CAPTAIN</span>
                </div>
              ) : <span style={{ color: 'rgba(198,168,75,0.35)', fontSize: 13 }}>No captain assigned</span>}
            </div>
            <div>
              <SectionLabel>Squad</SectionLabel>
              {details.players && details.players.length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 24 }}>
                  {details.players.map((p) => (
                    <div key={p.playerId} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
                      <ModalAvatar src={p.photoUrl} name={p.fullName} size={90} />
                      <p style={{ margin: 0, fontWeight: 600, fontSize: 13, color: '#f0e6c8', textAlign: 'center', wordBreak: 'break-word' }}>{p.fullName}</p>
                    </div>
                  ))}
                </div>
              ) : <p style={{ color: 'rgba(198,168,75,0.4)', fontSize: 14 }}>No players yet.</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   CAPTAIN DETAILS MODAL
═══════════════════════════════════════════════ */
function CaptainDetailsModal({ captainId, onClose, onOpenTeam }) {
  const [details, setDetails] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error,   setError]   = useState('')

  useEffect(() => {
    if (!captainId) return
    setLoading(true); setError('')
    api.get(`/api/admin/captains/${captainId}`)
      .then(({ data }) => setDetails(data))
      .catch(() => setError('Failed to load captain details.'))
      .finally(() => setLoading(false))
  }, [captainId])

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
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 520, width: '100%' }}>
        <div className="modal-header">
          <h2 className="modal-title">{details ? details.fullName : 'Captain Details'}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        {loading && <div style={{ textAlign: 'center', padding: '40px 0' }}><span className="spinner light" style={{ width: 28, height: 28 }} /></div>}
        {error && <div className="form-error">{error}</div>}

        {!loading && details && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

            {/* Avatar + name + captain badge */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
              <ModalAvatar src={details.photoUrl} name={details.fullName} size={80} />
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1.1rem', fontWeight: 700, color: '#f0e6c8', marginBottom: 6 }}>{details.fullName}</div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ background: 'linear-gradient(135deg, #c6a84b, #a8852e)', color: '#fff', fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20, letterSpacing: '0.05em' }}>♛ CAPTAIN</span>
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
              <DetailRow label="Since"  value={formatDate(details.appliedAt)} />
            </div>

            <div style={{ height: 1, background: 'rgba(198,168,75,0.1)' }} />

            {/* Team section */}
            <div>
              <p style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(198,168,75,0.55)', marginBottom: 12, marginTop: 0 }}>Team</p>
              {details.teamId ? (
                <button
                  onClick={() => onOpenTeam(details.teamId)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 14, width: '100%',
                    padding: '14px 16px',
                    background: 'rgba(198,168,75,0.05)',
                    border: '1px solid rgba(198,168,75,0.2)',
                    borderRadius: 10, cursor: 'pointer',
                    transition: 'all 0.2s ease', textAlign: 'left',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(198,168,75,0.1)'; e.currentTarget.style.borderColor = 'rgba(198,168,75,0.45)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(198,168,75,0.05)'; e.currentTarget.style.borderColor = 'rgba(198,168,75,0.2)' }}
                  aria-label={`View ${details.teamName} team details`}
                >
                  <TeamLogoSmall logoUrl={details.teamLogoUrl} size={40} />
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: 0, fontWeight: 600, fontSize: 14, color: '#f0e6c8' }}>{details.teamName}</p>
                    <p style={{ margin: '3px 0 0', fontSize: 12, color: 'rgba(198,168,75,0.55)' }}>{details.playerCount} player{details.playerCount !== 1 ? 's' : ''}</p>
                  </div>
                  <span style={{ fontSize: 12, color: 'rgba(198,168,75,0.5)', flexShrink: 0 }}>View →</span>
                </button>
              ) : (
                <span style={{ color: 'rgba(198,168,75,0.35)', fontSize: 13 }}>No team assigned</span>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   CAPTAIN CARD (grid item)
═══════════════════════════════════════════════ */
function CaptainCard({ captain, onClick }) {
  return (
    <div
      className="mc-captain-card cursor-target"
      onClick={() => onClick(captain.captainId)}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && onClick(captain.captainId)}
      aria-label={`View ${captain.fullName} details`}
    >
      <Avatar src={captain.photoUrl} name={captain.fullName} size={68} />
      <div className="mc-captain-info">
        <div className="mc-captain-name">{captain.fullName}</div>
        {captain.sportName && captain.sportName !== '–' && (
          <div className="mc-captain-sport">{captain.sportName}</div>
        )}
        {captain.teamName && (
          <div className="mc-captain-team">
            <span className="mc-captain-team-icon"><IconTeam /></span>
            <span className="mc-captain-team-name">{captain.teamName}</span>
          </div>
        )}
      </div>
    </div>
  )
}

/* ═══════════════════════════════════════════════
   MANAGE CAPTAINS — MAIN COMPONENT
═══════════════════════════════════════════════ */
function ManageCaptains() {
  const [searchParams, setSearchParams] = useSearchParams()

  const [captains, setCaptains] = useState([])
  const [sports,   setSports]   = useState([])
  const [loading,  setLoading]  = useState(true)
  const [error,    setError]    = useState('')

  const sportParam = searchParams.get('csport') ?? ''
  const nameParam  = searchParams.get('cq')     ?? ''
  const [nameInput, setNameInput] = useState(nameParam)

  // Modals
  const selectedCaptainId = searchParams.get('selectedId')
  const [teamModalId,      setTeamModalId]        = useState(null)

  const fetchData = useCallback(async () => {
    setLoading(true); setError('')
    try {
      const params = sportParam ? { sportId: sportParam } : {}
      const [captainsRes, sportsRes] = await Promise.all([
        api.get('/api/admin/captains', { params }),
        api.get('/api/sports/team'),
      ])
      setCaptains(captainsRes.data)
      setSports(sportsRes.data)
    } catch (err) {
      const status = err.response?.status
      setError(`Failed to load captains. ${status ? `(HTTP ${status})` : '(Network error)'}`)
    } finally {
      setLoading(false)
    }
  }, [sportParam])

  useEffect(() => { fetchData() }, [fetchData])
  useEffect(() => { setNameInput(nameParam) }, [nameParam])

  function handleSportSelect(id) {
    const next = new URLSearchParams(searchParams)
    if (id) { next.set('csport', id) } else { next.delete('csport') }
    next.delete('cq')
    setNameInput('')
    setSearchParams(next)
  }

  function handleNameKeyDown(e) {
    if (e.key === 'Enter') {
      const next = new URLSearchParams(searchParams)
      const trimmed = nameInput.trim()
      if (trimmed) { next.set('cq', trimmed) } else { next.delete('cq') }
      setSearchParams(next)
    }
  }

  function handleNameClear() {
    setNameInput('')
    const next = new URLSearchParams(searchParams)
    next.delete('cq')
    setSearchParams(next)
  }

  const visibleCaptains = nameParam
    ? captains.filter((c) => c.fullName.toLowerCase().includes(nameParam.toLowerCase()))
    : captains

  function handleOpenTeam(teamId) {
    const next = new URLSearchParams(searchParams)
    next.delete('selectedId')
    setSearchParams(next)
    setTeamModalId(teamId)
  }

  return (
    <div>
      <TargetCursor targetSelector=".cursor-target" spinDuration={3} hoverDuration={0.25} />
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">Manage Captains</h1>
        <p className="page-subtitle">
          {loading ? 'Loading…' : `${visibleCaptains.length} captain${visibleCaptains.length !== 1 ? 's' : ''}${sportParam ? ' in selected sport' : ''}${nameParam ? ` matching "${nameParam}"` : ''}`}
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
              placeholder="Search by captain name… (Enter)"
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
      ) : visibleCaptains.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconUser /></div>
          <p>{nameParam || sportParam ? 'No captains match your filters.' : 'No active captains found.'}</p>
        </div>
      ) : (
        <div className="mc-captains-grid">
          {visibleCaptains.map((c) => (
            <CaptainCard
              key={c.captainId}
              captain={c}
              onClick={(id) => {
                const next = new URLSearchParams(searchParams)
                next.set('selectedId', id)
                setSearchParams(next)
              }}
            />
          ))}
        </div>
      )}

      {/* Captain details modal */}
      {selectedCaptainId && (
        <CaptainDetailsModal
          captainId={selectedCaptainId}
          onClose={() => {
            const next = new URLSearchParams(searchParams)
            next.delete('selectedId')
            setSearchParams(next)
          }}
          onOpenTeam={handleOpenTeam}
        />
      )}

      {/* Team details modal (reused) */}
      {teamModalId && (
        <TeamDetailsModal
          teamId={teamModalId}
          onClose={() => setTeamModalId(null)}
        />
      )}
    </div>
  )
}

export default ManageCaptains
