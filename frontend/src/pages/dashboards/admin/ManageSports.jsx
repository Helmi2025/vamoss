import { useState, useEffect, useRef } from 'react'
import api from '../../../api/axiosInstance'
import AuthImage from '../../../components/AuthImage'
import TargetCursor from '../../../components/TargetCursor'
import '../AdminDashboard.css'

/* ── Inline SVG icons ── */
const IconAdd      = () => <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
const IconClose    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconUpload   = () => <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"><polyline points="16 16 12 12 8 16"/><line x1="12" y1="12" x2="12" y2="21"/><path d="M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3"/></svg>
const IconBall     = () => <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93 19.07 19.07"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>

/* ─────────────────────────────────────────────
   ADD SPORT MODAL
───────────────────────────────────────────── */
function AddSportModal({ onClose, onCreated }) {
  const [sportName,   setSportName]   = useState('')
  const [scoringRule, setScoringRule] = useState('')
  const [maxPlayers,  setMaxPlayers]  = useState('')
  const [file,        setFile]        = useState(null)
  const [preview,     setPreview]     = useState(null)
  const [dragOver,    setDragOver]    = useState(false)
  const [loading,     setLoading]     = useState(false)
  const [error,       setError]       = useState('')
  const inputRef = useRef()

  const handleFile = (f) => {
    if (!f) return
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const f = e.dataTransfer.files?.[0]
    if (f && f.type.startsWith('image/')) handleFile(f)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!sportName.trim()) { setError('Sport name is required.'); return }
    if (maxPlayers !== '' && (isNaN(Number(maxPlayers)) || Number(maxPlayers) < 1)) {
      setError('Max players must be a positive number.')
      return
    }

    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('sportName', sportName.trim())
      if (file) formData.append('icon', file)
      if (scoringRule.trim()) formData.append('scoringRule', scoringRule.trim())
      formData.append('maxPlayers', maxPlayers !== '' ? String(Number(maxPlayers)) : '0')

      const { data } = await api.post('/api/sports', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      onCreated(data)
      onClose()
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data || 'Failed to create sport.'
      setError(typeof msg === 'string' ? msg : 'Failed to create sport.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">Add Sport</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Photo upload */}
          <div className="form-group">
            <label className="form-label">Sport Photo</label>
            <div
              className={`file-upload-zone ${dragOver ? 'drag-over' : ''}`}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              onClick={() => inputRef.current?.click()}
            >
              <input
                ref={inputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={(e) => handleFile(e.target.files?.[0])}
              />
              {preview ? (
                <img src={preview} alt="preview" className="file-preview" />
              ) : (
                <>
                  <div className="file-upload-icon"><IconUpload /></div>
                  <p className="file-upload-text">
                    <strong>Click or drag</strong> an image here
                  </p>
                </>
              )}
            </div>
          </div>

          {/* Sport name */}
          <div className="form-group">
            <label className="form-label" htmlFor="sport-name">Sport Name</label>
            <input
              id="sport-name"
              className="form-input"
              placeholder="e.g. Football"
              value={sportName}
              onChange={(e) => { setError(''); setSportName(e.target.value) }}
              disabled={loading}
            />
          </div>

          {/* Scoring rule */}
          <div className="form-group">
            <label className="form-label" htmlFor="scoring-rule">Scoring Rule</label>
            <textarea
              id="scoring-rule"
              className="form-textarea"
              placeholder="e.g. 3 pts for a win, 1 for a draw, 0 for a loss"
              value={scoringRule}
              onChange={(e) => { setError(''); setScoringRule(e.target.value) }}
              disabled={loading}
              rows={2}
            />
          </div>

          {/* Max players */}
          <div className="form-group">
            <label className="form-label" htmlFor="max-players">Max Players per Team</label>
            <input
              id="max-players"
              className="form-input"
              type="number"
              min="1"
              placeholder="e.g. 11"
              value={maxPlayers}
              onChange={(e) => { setError(''); setMaxPlayers(e.target.value) }}
              disabled={loading}
            />
          </div>

          {error && <div className="form-error">{error}</div>}

          <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 8 }}>
            <button type="button" className="btn-outline-gold" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn-gold" disabled={loading}>
              {loading
                ? <><span className="spinner" /> Creating…</>
                : <><IconAdd /> Add Sport</>
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   SPORT DETAIL MODAL
───────────────────────────────────────────── */
function SportDetailModal({ sport, onClose }) {
  // Re-fetch the latest sport data when the modal opens
  // (guards against stale data from the list if backend was restarted)
  const [data,    setData]    = useState(sport)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    api.get('/api/sports')
      .then(({ data: list }) => {
        if (cancelled) return
        const fresh = list.find((s) => s.id === sport.id)
        if (fresh) setData(fresh)
      })
      .catch(() => {/* keep stale data */})
      .finally(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
  }, [sport.id])

  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box">
        <div className="modal-header">
          <h2 className="modal-title">{data.sportName}</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close"><IconClose /></button>
        </div>

        {data.iconUrl ? (
          <AuthImage
            src={data.iconUrl}
            alt={data.sportName}
            className="sport-detail-img"
            placeholder={
              <div style={{
                width: '100%', height: 160, background: '#0a0a0a', borderRadius: 3,
                marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid rgba(198,168,75,0.1)', color: 'rgba(198,168,75,0.2)',
              }}>
                <IconBall />
              </div>
            }
          />
        ) : (
          <div style={{
            width: '100%', height: 160, background: '#0a0a0a', borderRadius: 3,
            marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1px solid rgba(198,168,75,0.1)', color: 'rgba(198,168,75,0.2)',
          }}>
            <IconBall />
          </div>
        )}

        {loading ? (
          <div style={{ textAlign: 'center', padding: '12px 0' }}>
            <span className="spinner light" style={{ width: 20, height: 20 }} />
          </div>
        ) : (
          <>
            <div className="sport-detail-row">
              <span className="sport-detail-label">Sport Name</span>
              <span className="sport-detail-value">{data.sportName}</span>
            </div>
            <div className="sport-detail-row">
              <span className="sport-detail-label">Scoring Rule</span>
              <span className="sport-detail-value">
                {data.scoringRule && data.scoringRule.trim() ? data.scoringRule : '—'}
              </span>
            </div>
            <div className="sport-detail-row">
              <span className="sport-detail-label">Max Players per Team</span>
              <span className="sport-detail-value">
                {data.maxPlayers > 0 ? data.maxPlayers : '—'}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

/* ─────────────────────────────────────────────
   MANAGE SPORTS — MAIN COMPONENT
───────────────────────────────────────────── */
function ManageSports() {
  const [sports,      setSports]      = useState([])
  const [loading,     setLoading]     = useState(true)
  const [showAdd,     setShowAdd]     = useState(false)
  const [detailSport, setDetailSport] = useState(null)
  const [error,       setError]       = useState('')

  const fetchSports = async () => {
    setLoading(true)
    setError('')
    try {
      const { data } = await api.get('/api/sports')
      setSports(data)
    } catch {
      setError('Failed to load sports.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchSports() }, [])

  return (
    <div>
      <TargetCursor targetSelector=".cursor-target" spinDuration={3} hoverDuration={0.25} />
      {/* Header */}
      <div className="page-header" style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 className="page-title">Manage Sports</h1>
          <p className="page-subtitle">{sports.length} sport{sports.length !== 1 ? 's' : ''} registered</p>
        </div>
        <button className="btn-gold" onClick={() => setShowAdd(true)}>
          <IconAdd /> Add Sport
        </button>
      </div>

      {error && <div className="form-error" style={{ marginBottom: 20 }}>{error}</div>}

      {loading ? (
        <div className="empty-state">
          <span className="spinner light" style={{ width: 28, height: 28 }} />
        </div>
      ) : sports.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><IconBall /></div>
          <p>No sports yet. Add your first one.</p>
        </div>
      ) : (
        <div className="sports-grid">
          {sports.map((s) => (
            <div
              key={s.id}
              className="sport-card cursor-target"
              onClick={() => setDetailSport(s)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && setDetailSport(s)}
              aria-label={`View details for ${s.sportName}`}
            >
              {s.iconUrl ? (
                <AuthImage
                  src={s.iconUrl}
                  alt={s.sportName}
                  className="sport-card-img"
                  placeholder={
                    <div className="sport-card-img-placeholder"><IconBall /></div>
                  }
                />
              ) : (
                <div className="sport-card-img-placeholder">
                  <IconBall />
                </div>
              )}
              <div className="sport-card-name">{s.sportName}</div>
            </div>
          ))}
        </div>
      )}

      {showAdd     && <AddSportModal    onClose={() => setShowAdd(false)}    onCreated={(s) => setSports((p) => [...p, s])} />}
      {detailSport && <SportDetailModal sport={detailSport}                  onClose={() => setDetailSport(null)} />}
    </div>
  )
}

export default ManageSports
