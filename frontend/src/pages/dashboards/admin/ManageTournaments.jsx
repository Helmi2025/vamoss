import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import api from '../../../api/axiosInstance'
import TargetCursor from '../../../components/TargetCursor'
import basketLogo from '../../../assets/Tlogos/basket.webp'
import footLogo   from '../../../assets/Tlogos/foot.webp'
import padelLogo  from '../../../assets/Tlogos/padel.webp'
import tennisLogo from '../../../assets/Tlogos/tennis.png'
import './ManageTournaments.css'

/* ── Sport logo resolver ── */
function getSportLogo(sportName) {
  if (!sportName) return null
  const n = sportName.toLowerCase()
  if (n.includes('basket')) return basketLogo
  if (n.includes('foot') || n.includes('soccer')) return footLogo
  if (n.includes('padel')) return padelLogo
  if (n.includes('tennis')) return tennisLogo
  return null
}

function SportLogo({ sportName, size = 48 }) {
  const src = getSportLogo(sportName)
  const initial = sportName ? sportName.charAt(0).toUpperCase() : '?'
  if (src) {
    return (
      <img
        src={src}
        alt={sportName}
        className="tournament-card-sport-logo"
        style={{ width: size, height: size }}
      />
    )
  }
  return (
    <div className="tournament-card-sport-logo-placeholder" style={{ width: size, height: size }}>
      {initial}
    </div>
  )
}

/* ── Inline SVG Icons ── */
const IconAdd        = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconClose      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconTournament = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
const IconEdit       = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"/></svg>
const IconTrash      = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
const IconDots       = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
const IconSearch     = () => <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>

/* ─────────────────────────────────────────────
   ADD TOURNAMENT MODAL
   ───────────────────────────────────────────── */
function AddTournamentModal({ onClose, onCreated, sports }) {
  const [name, setName] = useState('')
  const [sportId, setSportId] = useState('')
  const [participantLimit, setParticipantLimit] = useState(4)
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [format, setFormat] = useState('')
  const [genderCategory, setGenderCategory] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Today in YYYY-MM-DD for the min attribute
  const minDate = (() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })()

  const selectedSport = sports.find(s => s.id === sportId)
  const isIndividualSport = selectedSport && !selectedSport.teamEnabled
  const isTennisPadel = isIndividualSport &&
    ['tennis', 'padel'].includes(selectedSport.sportName?.toLowerCase())

  const handleSportChange = (e) => {
    setError('')
    setSportId(e.target.value)
    setFormat('')
    setGenderCategory('')
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Tournament name is required.')
    if (!sportId) return setError('Please select a sport.')
    if (!startDate) return setError('Start date is required.')
    if (!endDate) return setError('End date is required.')
    if (startDate <= new Date().toISOString().split('T')[0]) return setError('Start date must be after today.')
    if (endDate <= startDate) return setError('End date must be after start date.')
    if (isTennisPadel && !format) return setError('Please select a tournament format (Singles or Doubles).')
    if (isTennisPadel && !genderCategory) return setError('Please select a gender category.')

    setLoading(true)
    setError('')

    try {
      const body = {
        name: name.trim(),
        sportId,
        participantLimit: Number(participantLimit),
        startDate,
        endDate,
      }
      if (isTennisPadel) {
        body.format = format
        body.genderCategory = genderCategory
      }
      const { data } = await api.post('/api/tournaments', body)
      onCreated(data)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to create tournament.'
      setError(typeof msg === 'string' ? msg : 'Failed to create tournament.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">Create Tournament</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="tournament-name">Tournament Name</label>
            <input
              id="tournament-name"
              className="form-input"
              placeholder="e.g. Summer Shootout 2026"
              value={name}
              onChange={(e) => { setError(''); setName(e.target.value) }}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tournament-sport">Sport</label>
            <select
              id="tournament-sport"
              className="form-input"
              value={sportId}
              onChange={handleSportChange}
              disabled={loading}
              style={{ background: '#0a0a0a', color: '#fff' }}
            >
              <option value="">-- Select Sport --</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.sportName} {s.teamEnabled ? '(Teams)' : '(Players)'}
                </option>
              ))}
            </select>
          </div>

          {/* Format + Gender — only for Tennis / Padel */}
          {isTennisPadel && (
            <>
              <div className="form-group">
                <label className="form-label" htmlFor="tournament-format">Format</label>
                <select
                  id="tournament-format"
                  className="form-input"
                  value={format}
                  onChange={(e) => { setError(''); setFormat(e.target.value) }}
                  disabled={loading}
                  style={{ background: '#0a0a0a', color: '#fff' }}
                >
                  <option value="">-- Select Format --</option>
                  <option value="SINGLES">Singles (1 vs 1)</option>
                  <option value="DOUBLES">Doubles (2 vs 2)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="tournament-gender">Gender Category</label>
                <select
                  id="tournament-gender"
                  className="form-input"
                  value={genderCategory}
                  onChange={(e) => { setError(''); setGenderCategory(e.target.value) }}
                  disabled={loading}
                  style={{ background: '#0a0a0a', color: '#fff' }}
                >
                  <option value="">-- Select Category --</option>
                  <option value="MEN">Men</option>
                  <option value="WOMEN">Women</option>
                  <option value="OPEN">Open (Mixed)</option>
                </select>
              </div>
            </>
          )}

          <div className="form-group">
            <label className="form-label" htmlFor="tournament-limit">Participant Limit</label>
            <select
              id="tournament-limit"
              className="form-input"
              value={participantLimit}
              onChange={(e) => setParticipantLimit(Number(e.target.value))}
              disabled={loading}
              style={{ background: '#0a0a0a', color: '#fff' }}
            >
              <option value={4}>4 {isTennisPadel && format === 'DOUBLES' ? 'Pairs' : 'Participants'}</option>
              <option value={8}>8 {isTennisPadel && format === 'DOUBLES' ? 'Pairs' : 'Participants'}</option>
            </select>
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tournament-date">Start Date</label>
            <input
              id="tournament-date"
              className="form-input"
              type="date"
              min={minDate}
              value={startDate}
              onChange={(e) => { setError(''); setStartDate(e.target.value) }}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="tournament-end-date">End Date</label>
            <input
              id="tournament-end-date"
              className="form-input"
              type="date"
              min={startDate || minDate}
              value={endDate}
              onChange={(e) => { setError(''); setEndDate(e.target.value) }}
              disabled={loading}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="button" className="btn-outline-gold" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? <><span className="spinner" /> Creating…</> : <><IconAdd /> Create</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   EDIT TOURNAMENT MODAL
   ───────────────────────────────────────────── */
function EditTournamentModal({ tournament, onClose, onUpdated }) {
  const [name, setName] = useState(tournament.name)
  const [startDate, setStartDate] = useState(tournament.startDate)
  const [endDate, setEndDate] = useState(tournament.endDate || '')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Today in YYYY-MM-DD for the min attribute
  const minDate = (() => {
    const d = new Date()
    return d.toISOString().split('T')[0]
  })()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!name.trim()) return setError('Tournament name is required.')
    if (!startDate) return setError('Start date is required.')
    if (!endDate) return setError('End date is required.')
    if (startDate < new Date().toISOString().split('T')[0]) return setError('Start date must be today or in the future.')
    if (endDate <= startDate) return setError('End date must be after start date.')

    setLoading(true)
    setError('')

    try {
      const { data } = await api.put(`/api/tournaments/${tournament.id}`, {
        name: name.trim(),
        startDate,
        endDate
      })
      onUpdated(data)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to update tournament.'
      setError(typeof msg === 'string' ? msg : 'Failed to update tournament.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">Edit Tournament</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" htmlFor="edit-name">Tournament Name</label>
            <input
              id="edit-name"
              className="form-input"
              placeholder="e.g. Summer Shootout 2026"
              value={name}
              onChange={(e) => { setError(''); setName(e.target.value) }}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-date">Start Date</label>
            <input
              id="edit-date"
              className="form-input"
              type="date"
              min={minDate}
              value={startDate}
              onChange={(e) => { setError(''); setStartDate(e.target.value) }}
              disabled={loading}
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="edit-end-date">End Date</label>
            <input
              id="edit-end-date"
              className="form-input"
              type="date"
              min={startDate || minDate}
              value={endDate}
              onChange={(e) => { setError(''); setEndDate(e.target.value) }}
              disabled={loading}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 18 }}>
            <button type="button" className="btn-outline-gold" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" disabled={loading}>
              {loading ? <><span className="spinner" /> Saving…</> : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   CANCEL CONFIRMATION MODAL
   ───────────────────────────────────────────── */
function CancelTournamentModal({ tournament, onClose, onCancelled }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleCancel = async () => {
    setLoading(true)
    setError('')
    try {
      await api.delete(`/api/tournaments/${tournament.id}`)
      onCancelled(tournament.id)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to cancel tournament.'
      setError(typeof msg === 'string' ? msg : 'Failed to cancel tournament.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box sm">
        <div className="modal-header">
          <h2 className="modal-title">Cancel Tournament</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <p className="confirm-text">
          Are you sure you want to cancel <span className="confirm-name">"{tournament.name}"</span>?
          This will set the status to <span style={{ color: '#e07070', fontWeight: 'bold' }}>CANCELLED</span>. This action is irreversible.
        </p>

        {error && <div className="form-error">{error}</div>}

        <div className="confirm-btns">
          <button className="btn-outline-gold" onClick={onClose} disabled={loading}>
            No, Keep It
          </button>
          <button className="btn-danger" onClick={handleCancel} disabled={loading}>
            {loading ? <span className="spinner" /> : <IconTrash />} Yes, Cancel
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   DELETE TOURNAMENT MODAL
   ───────────────────────────────────────────── */
function DeleteTournamentModal({ tournament, onClose, onDeleted }) {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setLoading(true)
    setError('')
    try {
      await api.delete(`/api/tournaments/${tournament.id}/delete`)
      onDeleted(tournament.id)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to delete tournament.'
      setError(typeof msg === 'string' ? msg : 'Failed to delete tournament.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box sm">
        <div className="modal-header">
          <h2 className="modal-title">Delete Tournament</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <p className="confirm-text">
          Are you sure you want to permanently delete <span className="confirm-name">"{tournament.name}"</span>?
          This will remove all tournament data and cannot be undone.
        </p>

        {error && <div className="form-error">{error}</div>}

        <div className="confirm-btns">
          <button className="btn-outline-gold" onClick={onClose} disabled={loading}>
            No, Keep It
          </button>
          <button className="btn-danger" onClick={handleDelete} disabled={loading}>
            {loading ? <span className="spinner" /> : <IconTrash />} Yes, Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MAIN COMPONENT
   ───────────────────────────────────────────── */
function ManageTournaments() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [tournaments, setTournaments] = useState([])
  const [sports, setSports] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const [showAdd, setShowAdd] = useState(false)
  const [editTarget, setEditTarget] = useState(null)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [openMenuId, setOpenMenuId] = useState(null)

  // ── Filters from URL ──
  const filterName  = searchParams.get('filterName')  || ''
  const filterSport = searchParams.get('filterSport') || ''
  const filterDate  = searchParams.get('filterDate')  || ''

  const setFilter = (key, value) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      if (value) next.set(key, value)
      else next.delete(key)
      return next
    }, { replace: true })
  }

  const clearFilters = () => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.delete('filterName')
      next.delete('filterSport')
      next.delete('filterDate')
      return next
    }, { replace: true })
  }

  const hasActiveFilters = filterName || filterSport || filterDate

  // Close the three-dot menu when clicking outside any card menu
  useEffect(() => {
    if (!openMenuId) return
    const handler = () => setOpenMenuId(null)
    document.addEventListener('click', handler)
    return () => document.removeEventListener('click', handler)
  }, [openMenuId])

  const fetchData = useCallback(async () => {
    setLoading(true)
    setError('')
    try {
      const [tourneyRes, sportsRes] = await Promise.all([
        api.get('/api/tournaments'),
        api.get('/api/sports')
      ])
      setTournaments(tourneyRes.data)
      setSports(sportsRes.data)
    } catch {
      setError('Failed to load tournaments and sports.')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchData()
  }, [fetchData])

  const getSportName = (sportId) => {
    const s = sports.find((x) => x.id === sportId)
    return s ? s.sportName : 'Unknown Sport'
  }

  const handleViewDetails = (id) => {
    setSearchParams((prev) => {
      const next = new URLSearchParams(prev)
      next.set('section', 'tournament-detail')
      next.set('id', id)
      return next
    })
  }

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case 'REGISTRATION_OPEN': return 'status-badge pending'
      case 'READY': return 'status-badge active'
      case 'IN_PROGRESS': return 'status-badge active'
      case 'COMPLETED': return 'status-badge completed'
      case 'CANCELLED': return 'status-badge inactive'
      default: return 'status-badge'
    }
  }

  const formatStatusText = (status) => {
    if (!status || status === 'BRACKET_GENERATED') return null
    return status.replace(/_/g, ' ')
  }

  const onCreated = (newT) => {
    setTournaments((prev) => [newT, ...prev])
  }

  const onUpdated = (updatedT) => {
    setTournaments((prev) => prev.map((t) => (t.id === updatedT.id ? updatedT : t)))
  }

  const onCancelled = (id) => {
    setTournaments((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'CANCELLED', registrationOpen: false } : t))
    )
  }

  const onDeleted = (id) => {
    setTournaments((prev) => prev.filter((t) => t.id !== id))
  }

  // ── Derived filtered list ──
  const visibleTournaments = tournaments.filter((t) => {
    if (filterName && !t.name.toLowerCase().includes(filterName.toLowerCase())) return false
    if (filterSport && String(t.sportId) !== String(filterSport)) return false
    if (filterDate && t.startDate !== filterDate) return false
    return true
  })

  return (
    <div>
      <TargetCursor targetSelector=".cursor-target" spinDuration={3} hoverDuration={0.25} />

      {/* Page Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Manage Tournaments</h1>
          <p className="page-subtitle">
            {loading ? 'Loading…' : `${tournaments.length} tournament${tournaments.length !== 1 ? 's' : ''} configured`}
          </p>
        </div>
        <button className="btn-gold" onClick={() => setShowAdd(true)}>
          <IconAdd /> Create Tournament
        </button>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* ── Filter Bar ── */}
      {!loading && tournaments.length > 0 && (
        <div className="tournament-filter-bar">
          <div className="tournament-search-wrap">
            <span className="tournament-search-icon"><IconSearch /></span>
            <input
              className="tournament-search-input"
              type="text"
              placeholder="Search by name…"
              value={filterName}
              onChange={(e) => setFilter('filterName', e.target.value)}
            />
            {filterName && (
              <button className="tournament-search-clear" onClick={() => setFilter('filterName', '')} aria-label="Clear name">
                <IconClose />
              </button>
            )}
          </div>

          <div className="tournament-search-wrap" style={{ flex: '0 1 200px' }}>
            <select
              className="tournament-search-input"
              value={filterSport}
              onChange={(e) => setFilter('filterSport', e.target.value)}
              style={{ background: '#0d0d0d', color: filterSport ? '#fff' : '#444', paddingLeft: 12 }}
            >
              <option value="">All Sports</option>
              {sports.map((s) => (
                <option key={s.id} value={s.id}>{s.sportName}</option>
              ))}
            </select>
            {filterSport && (
              <button className="tournament-search-clear" onClick={() => setFilter('filterSport', '')} aria-label="Clear sport">
                <IconClose />
              </button>
            )}
          </div>

          <div className="tournament-search-wrap" style={{ flex: '0 1 180px' }}>
            <input
              className="tournament-search-input"
              type="date"
              value={filterDate}
              onChange={(e) => setFilter('filterDate', e.target.value)}
              style={{ paddingLeft: 12, colorScheme: 'dark' }}
            />
            {filterDate && (
              <button className="tournament-search-clear" onClick={() => setFilter('filterDate', '')} aria-label="Clear date">
                <IconClose />
              </button>
            )}
          </div>

          {hasActiveFilters && (
            <button className="tournament-filter-pill active" onClick={clearFilters}>
              <IconClose /> Clear All
            </button>
          )}
        </div>
      )}

      {/* Tournaments Grid */}
      {loading ? (
        <div className="empty-state">
          <span className="spinner light" style={{ width: 28, height: 28 }} />
        </div>
      ) : tournaments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconTournament /></div>
          <p>No tournaments yet. Create your first one.</p>
        </div>
      ) : visibleTournaments.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconTournament /></div>
          <p>No tournaments match your filters.</p>
        </div>
      ) : (
        <div className="tournaments-grid">
          {visibleTournaments.map((t) => {
            const sportName = getSportName(t.sportId)
            const isActive = t.status !== 'COMPLETED' && t.status !== 'CANCELLED'
            return (
              <div key={t.id} className="tournament-card cursor-target" onClick={() => handleViewDetails(t.id)} style={{ cursor: 'pointer' }}>

                {/* Three-dot menu — top-right absolute, shown on every non-completed card */}
                <div className="tournament-card-meta">
                  <div className="card-menu-wrap">
                    <button
                      className="btn-card-menu"
                      title="More options"
                      onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === t.id ? null : t.id) }}
                      aria-label="More options"
                    >
                      <IconDots />
                    </button>
                    {openMenuId === t.id && (
                      <div className="card-menu-dropdown">
                        {/* Edit — available while not yet bracket-locked */}
                        {isActive && (
                          <button
                            className="card-menu-item"
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setEditTarget(t) }}
                          >
                            <IconEdit /> Edit Tournament
                          </button>
                        )}
                        {/* Cancel — only while still running (not already cancelled/completed) */}
                        {isActive && (
                          <button
                            className="card-menu-item warning"
                            onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setCancelTarget(t) }}
                          >
                            <IconTrash /> Cancel Tournament
                          </button>
                        )}
                        {isActive && <div className="card-menu-divider" />}
                        {/* Delete — always available */}
                        <button
                          className="card-menu-item danger"
                          onClick={(e) => { e.stopPropagation(); setOpenMenuId(null); setDeleteTarget(t) }}
                        >
                          <IconTrash /> Delete Tournament
                        </button>
                      </div>
                    )}
                  </div>
                </div>

                {/* Top: sport logo + title + status */}
                <div className="tournament-card-top">
                  <SportLogo sportName={sportName} />
                  <div className="tournament-card-top-info">
                    <h3 className="tournament-card-title">{t.name}</h3>
                    {formatStatusText(t.status) && (
                      <span className={getStatusBadgeClass(t.status)} style={{ alignSelf: 'flex-start' }}>
                        {formatStatusText(t.status)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="tournament-card-divider" />

                {/* Info rows */}
                <div className="tournament-card-body">
                  <div className="tournament-card-info-row">
                    <span className="info-label">Sport</span>
                    <span className="info-value">{sportName}</span>
                  </div>
                  {t.format && (
                    <div className="tournament-card-info-row">
                      <span className="info-label">Format</span>
                      <span className="info-value">{t.format === 'SINGLES' ? 'Singles' : 'Doubles'}</span>
                    </div>
                  )}
                  {t.genderCategory && (
                    <div className="tournament-card-info-row">
                      <span className="info-label">Category</span>
                      <span className="info-value">
                        {t.genderCategory === 'MEN' ? 'Men' : t.genderCategory === 'WOMEN' ? 'Women' : 'Open'}
                      </span>
                    </div>
                  )}
                  <div className="tournament-card-info-row">
                    <span className="info-label">Start Date</span>
                    <span className="info-value">{new Date(t.startDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                  </div>
                  {t.endDate && (
                    <div className="tournament-card-info-row">
                      <span className="info-label">End Date</span>
                      <span className="info-value">{new Date(t.endDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC' })}</span>
                    </div>
                  )}
                  <div className="tournament-card-info-row">
                    <span className="info-label">Participants</span>
                    <span className="info-value">{t.currentParticipants} / {t.participantLimit}</span>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Modals */}
      {showAdd && (
        <AddTournamentModal
          sports={sports}
          onClose={() => setShowAdd(false)}
          onCreated={onCreated}
        />
      )}

      {editTarget && (
        <EditTournamentModal
          tournament={editTarget}
          onClose={() => setEditTarget(null)}
          onUpdated={onUpdated}
        />
      )}

      {cancelTarget && (
        <CancelTournamentModal
          tournament={cancelTarget}
          onClose={() => setCancelTarget(null)}
          onCancelled={onCancelled}
        />
      )}

      {deleteTarget && (
        <DeleteTournamentModal
          tournament={deleteTarget}
          onClose={() => setDeleteTarget(null)}
          onDeleted={onDeleted}
        />
      )}
    </div>
  )
}

export default ManageTournaments
