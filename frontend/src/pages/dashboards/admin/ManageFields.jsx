import { useState, useEffect, useCallback } from 'react'
import api from '../../../api/axiosInstance'
import AuthImage from '../../../components/AuthImage'
import '../AdminDashboard.css'

/* ── Inline SVG icons ── */
const IconAdd    = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconClose  = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconField  = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><circle cx="12" cy="12" r="3"/></svg>
const IconBall   = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93 19.07 19.07"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
const IconClock  = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
const IconChevron = () => <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="9 18 15 12 9 6"/></svg>

/* ── Helpers ── */
function fmtDateTime(iso) {
  if (!iso) return '—'
  const d = new Date(iso)
  return d.toLocaleString(undefined, {
    month: 'short', day: 'numeric', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
  })
}

/**
 * Given a list of reservations and the current time, returns true if the
 * field is free right now (no active slot) AND not disabled by admin.
 */
function isFieldAvailableNow(field, reservations) {
  if (!field.available) return false
  const now = new Date()
  return !reservations.some((r) => {
    const start = new Date(r.start)
    const end   = new Date(r.end)
    return now >= start && now < end
  })
}

/* ── Sport selector card — mirrors JoinAsPlayer style ── */
function SportCard({ sport, selected, onSelect }) {
  return (
    <button
      type="button"
      className={`mf-sport-card ${selected ? 'selected' : ''}`}
      onClick={() => onSelect(sport.id)}
      aria-pressed={selected}
    >
      {sport.iconUrl ? (
        <AuthImage
          src={sport.iconUrl}
          alt={sport.sportName}
          className="mf-sport-card-img"
          placeholder={
            <div className="mf-sport-card-img-placeholder"><IconBall /></div>
          }
        />
      ) : (
        <div className="mf-sport-card-img-placeholder"><IconBall /></div>
      )}
      <span className="mf-sport-card-name">{sport.sportName}</span>
      {selected && (
        <span className="mf-sport-card-check" aria-hidden="true">✓</span>
      )}
    </button>
  )
}

/* ─────────────────────────────────────────────
   ADD FIELD MODAL
───────────────────────────────────────────── */
function AddFieldModal({ onClose, onCreated }) {
  const [fieldName,     setFieldName]     = useState('')
  const [selectedSport, setSelectedSport] = useState('')
  const [sports,        setSports]        = useState([])
  const [sportsLoading, setSportsLoading] = useState(true)
  const [loading,       setLoading]       = useState(false)
  const [error,         setError]         = useState('')

  useEffect(() => {
    api.get('/api/sports')
      .then(({ data }) => setSports(data))
      .catch(() => setError('Could not load sports.'))
      .finally(() => setSportsLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!fieldName.trim()) { setError('Field name is required.'); return }
    if (!selectedSport)    { setError('Please select a sport.'); return }

    setLoading(true)
    setError('')
    try {
      const { data } = await api.post('/api/fields', {
        name:    fieldName.trim(),
        sportId: selectedSport,
      })
      onCreated(data)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to create field.'
      setError(typeof msg === 'string' ? msg : 'Failed to create field.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">Add Field</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Field name */}
          <div className="form-group">
            <label className="form-label" htmlFor="field-name">Field Name</label>
            <input
              id="field-name"
              className="form-input"
              placeholder="e.g. Field A"
              value={fieldName}
              onChange={(e) => { setError(''); setFieldName(e.target.value) }}
              disabled={loading}
              autoFocus
            />
          </div>

          {/* Sport selector */}
          <div className="form-group">
            <label className="form-label">Select Sport</label>
            {sportsLoading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#555', fontSize: '0.82rem', padding: '8px 0' }}>
                <span className="spinner light" style={{ width: 16, height: 16 }} />
                Loading sports…
              </div>
            ) : (
              <div className="mf-sport-cards">
                {sports.map((sport) => (
                  <SportCard
                    key={sport.id}
                    sport={sport}
                    selected={selectedSport === sport.id}
                    onSelect={(id) => { setError(''); setSelectedSport(id) }}
                  />
                ))}
              </div>
            )}
          </div>

          {error && <div className="form-error">{error}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn-outline-gold" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" disabled={loading || sportsLoading}>
              {loading
                ? <><span className="spinner" /> Creating…</>
                : <><IconAdd /> Add Field</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   FIELD RESERVATIONS MODAL
───────────────────────────────────────────── */
function FieldReservationsModal({ field, onClose }) {
  const [reservations, setReservations] = useState([])
  const [loading,      setLoading]      = useState(true)
  const [error,        setError]        = useState('')

  useEffect(() => {
    api.get(`/api/fields/${field.id}/reservations`)
      .then(({ data }) => setReservations(data))
      .catch(() => setError('Could not load reservations.'))
      .finally(() => setLoading(false))
  }, [field.id])

  const now = new Date()

  const past   = reservations.filter((r) => new Date(r.end)   <= now)
  const active = reservations.filter((r) => new Date(r.start) <= now && new Date(r.end) > now)
  const future = reservations.filter((r) => new Date(r.start) > now)

  const availableNow = active.length === 0 && field.available

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box" style={{ maxWidth: 580 }}>
        <div className="modal-header">
          <div>
            <h2 className="modal-title">{field.name}</h2>
            <p style={{ fontSize: '0.75rem', color: '#666', marginTop: 3 }}>{field.sportName}</p>
          </div>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        {/* Current availability */}
        <div className="mf-avail-banner" data-available={availableNow}>
          <span className="mf-avail-dot" />
          <span className="mf-avail-text">
            {!field.available
              ? 'Field is disabled by admin'
              : availableNow
                ? 'Available right now'
                : 'Currently booked'}
          </span>
          <span className="mf-avail-time">
            <IconClock />
            {new Date().toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px 0' }}>
            <span className="spinner light" style={{ width: 24, height: 24 }} />
          </div>
        ) : error ? (
          <div className="form-error">{error}</div>
        ) : reservations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '32px 0', color: '#555', fontSize: '0.83rem' }}>
            No reservations on record for this field.
          </div>
        ) : (
          <div className="mf-reservations-list">

            {/* Active now */}
            {active.length > 0 && (
              <div className="mf-res-section">
                <div className="mf-res-section-label mf-res-active-label">Active now</div>
                {active.map((r) => <ReservationRow key={r.matchId} r={r} variant="active" />)}
              </div>
            )}

            {/* Upcoming */}
            {future.length > 0 && (
              <div className="mf-res-section">
                <div className="mf-res-section-label">Upcoming</div>
                {future.map((r) => <ReservationRow key={r.matchId} r={r} variant="future" />)}
              </div>
            )}

            {/* Past */}
            {past.length > 0 && (
              <div className="mf-res-section">
                <div className="mf-res-section-label">Past</div>
                {past.map((r) => <ReservationRow key={r.matchId} r={r} variant="past" />)}
              </div>
            )}

          </div>
        )}

        <div style={{ marginTop: 24, display: 'flex', justifyContent: 'flex-end' }}>
          <button className="btn-outline-gold" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  )
}

function ReservationRow({ r, variant }) {
  return (
    <div className={`mf-res-row mf-res-${variant}`}>
      <div className="mf-res-label-wrap">
        <span className="mf-res-match-label">{r.label}</span>
        <span className="mf-res-tournament">{r.tournamentName}</span>
      </div>
      <div className="mf-res-times">
        <span className="mf-res-time-block">
          <span className="mf-res-time-tag">Start</span>
          {fmtDateTime(r.start)}
        </span>
        <span className="mf-res-arrow"><IconChevron /></span>
        <span className="mf-res-time-block">
          <span className="mf-res-time-tag">End</span>
          {fmtDateTime(r.end)}
        </span>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   REAL-TIME AVAILABILITY BADGE
   Re-evaluates every minute against reservations
───────────────────────────────────────────── */
function AvailabilityBadge({ field, reservations }) {
  const [, setTick] = useState(0)

  // Re-render every 60 s so the badge stays current
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), 60_000)
    return () => clearInterval(id)
  }, [])

  const available = isFieldAvailableNow(field, reservations)
  return (
    <span className={`status-badge ${available ? 'active' : 'inactive'}`}>
      {available ? 'Available' : 'Unavailable'}
    </span>
  )
}

/* ─────────────────────────────────────────────
   MANAGE FIELDS — MAIN COMPONENT
───────────────────────────────────────────── */
function ManageFields() {
  const [fields,       setFields]       = useState([])
  const [sports,       setSports]       = useState([])
  const [loading,      setLoading]      = useState(true)
  const [showAdd,      setShowAdd]      = useState(false)
  const [error,        setError]        = useState('')
  const [filter,       setFilter]       = useState('all') // 'all' | sportId
  const [selectedField, setSelectedField] = useState(null)

  // reservations keyed by fieldId — loaded lazily on first click
  const [reservationsMap, setReservationsMap] = useState({})

  const fetchData = async () => {
    setLoading(true)
    setError('')
    try {
      const [fieldsRes, sportsRes] = await Promise.all([
        api.get('/api/fields'),
        api.get('/api/sports'),
      ])
      setFields(fieldsRes.data)
      setSports(sportsRes.data)
    } catch {
      setError('Failed to load fields.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchData() }, [])

  // Pre-fetch reservations for all visible fields once the list loads
  useEffect(() => {
    if (fields.length === 0) return
    fields.forEach((f) => {
      if (reservationsMap[f.id] !== undefined) return
      api.get(`/api/fields/${f.id}/reservations`)
        .then(({ data }) => setReservationsMap((prev) => ({ ...prev, [f.id]: data })))
        .catch(() => setReservationsMap((prev) => ({ ...prev, [f.id]: [] })))
    })
  }, [fields]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRowClick = useCallback((field) => {
    setSelectedField(field)
  }, [])

  const visibleFields = filter === 'all'
    ? fields
    : fields.filter((f) => f.sportId === filter)

  return (
    <div>
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Manage Fields</h1>
          <p className="page-subtitle">{fields.length} field{fields.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button className="btn-gold" onClick={() => setShowAdd(true)}>
          <IconAdd /> Add Field
        </button>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Sport filter tabs */}
      {!loading && sports.length > 0 && (
        <div className="mf-filter-tabs">
          <button
            className={`mf-filter-tab ${filter === 'all' ? 'active' : ''}`}
            onClick={() => setFilter('all')}
          >
            All
          </button>
          {sports.map((s) => (
            <button
              key={s.id}
              className={`mf-filter-tab ${filter === s.id ? 'active' : ''}`}
              onClick={() => setFilter(s.id)}
            >
              {s.sportName}
            </button>
          ))}
        </div>
      )}

      {/* Content */}
      {loading ? (
        <div className="empty-state">
          <span className="spinner light" style={{ width: 28, height: 28 }} />
        </div>
      ) : visibleFields.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconField /></div>
          <p>No fields yet. Add your first one.</p>
        </div>
      ) : (
        <div className="app-table-wrap" style={{ marginTop: 24 }}>
          <table className="app-table">
            <thead>
              <tr>
                <th>Field Name</th>
                <th>Sport</th>
                <th>Current Status</th>
                <th style={{ width: 40 }}></th>
              </tr>
            </thead>
            <tbody>
              {visibleFields.map((f) => (
                <tr
                  key={f.id}
                  onClick={() => handleRowClick(f)}
                  style={{ cursor: 'pointer' }}
                  title="Click to view reservation history"
                >
                  <td style={{ color: '#fff', fontWeight: 600 }}>{f.name}</td>
                  <td>{f.sportName}</td>
                  <td>
                    <AvailabilityBadge
                      field={f}
                      reservations={reservationsMap[f.id] ?? []}
                    />
                  </td>
                  <td style={{ color: '#444', textAlign: 'right' }}>
                    <IconChevron />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <p style={{ fontSize: '0.7rem', color: '#444', marginTop: 10, paddingLeft: 2 }}>
            Click a row to see full reservation history
          </p>
        </div>
      )}

      {showAdd && (
        <AddFieldModal
          onClose={() => setShowAdd(false)}
          onCreated={(f) => setFields((prev) => [...prev, f])}
        />
      )}

      {selectedField && (
        <FieldReservationsModal
          field={selectedField}
          onClose={() => setSelectedField(null)}
        />
      )}
    </div>
  )
}

export default ManageFields
