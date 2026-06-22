import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api/axiosInstance'
import TournamentBracket from './dashboards/admin/TournamentBracket'
import './TournamentBracketView.css'

/* ── Inline SVG Icons ── */
const IconArrowLeft = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="19" y1="12" x2="5" y2="12"/><polyline points="12 19 5 12 12 5"/>
  </svg>
)
const IconTrophy = () => (
  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
    <path d="M4 22h16" />
    <path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" />
    <path d="M12 2a5 5 0 0 0-6 4.88c0 3 2.1 5.37 5 5.8V2z" />
  </svg>
)

function TournamentBracketView() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [tournament, setTournament]   = useState(null)
  const [bracketData, setBracketData] = useState(null)
  const [loading, setLoading]         = useState(true)
  const [error, setError]             = useState('')

  useEffect(() => {
    if (!id) return
    const load = async () => {
      setLoading(true)
      setError('')
      try {
        const [tRes, bRes] = await Promise.all([
          api.get(`/api/tournaments/${id}`),
          api.get(`/api/tournaments/${id}/bracket`),
        ])
        setTournament(tRes.data)
        setBracketData(bRes.data)
      } catch (err) {
        if (err.response?.status === 404) {
          setError('Tournament not found.')
        } else {
          setError('Failed to load bracket. Please try again.')
        }
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const formatStatus = (status) => {
    if (!status) return ''
    return status.replace(/_/g, ' ')
  }

  const statusClass = (status) => {
    switch (status) {
      case 'REGISTRATION_OPEN': return 'tbv-status pending'
      case 'BRACKET_GENERATED': return 'tbv-status active'
      case 'IN_PROGRESS':       return 'tbv-status active'
      case 'COMPLETED':         return 'tbv-status completed'
      case 'CANCELLED':         return 'tbv-status inactive'
      default:                  return 'tbv-status'
    }
  }

  /* ── Loading ── */
  if (loading) {
    return (
      <div className="tbv-page">
        <div className="tbv-loading">
          <span className="tbv-spinner" />
          <p>Loading bracket…</p>
        </div>
      </div>
    )
  }

  /* ── Error ── */
  if (error) {
    return (
      <div className="tbv-page">
        <div className="tbv-error-state">
          <p>{error}</p>
          <button className="tbv-back-btn" onClick={() => navigate(-1)}>
            <IconArrowLeft /> Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="tbv-page">
      {/* ── Top nav bar ── */}
      <header className="tbv-header">
        <button className="tbv-back-btn" onClick={() => navigate(-1)} aria-label="Go back">
          <IconArrowLeft /> Back
        </button>

        <div className="tbv-brand">
          <span className="tbv-brand-icon"><IconTrophy /></span>
          <span className="tbv-brand-text">Tournament Bracket</span>
        </div>

        {tournament && (
          <span className={statusClass(tournament.status)}>
            {formatStatus(tournament.status)}
          </span>
        )}
      </header>

      {/* ── Tournament meta ── */}
      {tournament && (
        <div className="tbv-meta">
          <h1 className="tbv-title">{tournament.name}</h1>
          <div className="tbv-meta-row">
            <span className="tbv-meta-item">
              <span className="tbv-meta-label">Start Date</span>
              <span className="tbv-meta-value">
                {new Date(tournament.startDate).toLocaleDateString('en-US', {
                  year: 'numeric', month: 'long', day: 'numeric', timeZone: 'UTC'
                })}
              </span>
            </span>
            <span className="tbv-meta-item">
              <span className="tbv-meta-label">Participants</span>
              <span className="tbv-meta-value">{tournament.currentParticipants} / {tournament.participantLimit}</span>
            </span>
            <span className="tbv-meta-item">
              <span className="tbv-meta-label">Format</span>
              <span className="tbv-meta-value">Single Elimination</span>
            </span>
          </div>
        </div>
      )}

      {/* ── Bracket ── */}
      <div className="tbv-bracket-wrapper">
        <TournamentBracket bracketData={bracketData} />
      </div>
    </div>
  )
}

export default TournamentBracketView
