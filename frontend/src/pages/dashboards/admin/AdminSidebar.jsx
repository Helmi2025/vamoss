import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import logo from '../../../assets/logo.png'
import '../AdminDashboard.css'

/* ── Inline SVG icons ── */
const IconHome     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconMenu     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IconMenuOpen = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6"  x2="6"  y2="18"/><line x1="6"  y1="6"  x2="18" y2="18"/></svg>
const IconProfile  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const IconSport    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M4.93 4.93 19.07 19.07"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10A15.3 15.3 0 0 1 12 2z"/></svg>
const IconField    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><rect x="2" y="3" width="20" height="18" rx="2"/><line x1="12" y1="3" x2="12" y2="21"/><circle cx="12" cy="12" r="3"/></svg>
const IconTeams    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="9" cy="7" r="3"/><path d="M3 21v-2a4 4 0 0 1 4-4h4a4 4 0 0 1 4 4v2"/><circle cx="18" cy="7" r="2"/><path d="M22 21v-1.5a3 3 0 0 0-2-2.83"/></svg>
const IconApp      = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><line x1="10" y1="9" x2="8" y2="9"/></svg>
const IconLogout   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconClose    = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconTournament = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" /><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" /><path d="M4 22h16" /><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34" /><path d="M12 2a5 5 0 0 0-6 4.88c0 3 2.1 5.37 5 5.8V2z" /></svg>
const IconCaptain  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/><path d="M12 2l1.5 3h3l-2.5 2 1 3L12 8.5 9 10l1-3L7.5 5h3z"/></svg>
const IconPlayer   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const IconReferee  = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M12 4v16"/><path d="M8 8h2"/><path d="M14 8h2"/><path d="M8 12h8"/></svg>

const NAV_ITEMS = [
  { key: 'home',                 label: 'Home',                Icon: IconHome    },
  { key: 'profile',              label: 'Manage Profile',       Icon: IconProfile },
  { key: 'sports',               label: 'Manage Sports',        Icon: IconSport   },
  { key: 'fields',               label: 'Manage Fields',        Icon: IconField   },
  { key: 'teams',                label: 'Manage Teams',         Icon: IconTeams   },
  { key: 'captains',             label: 'Manage Captains',      Icon: IconCaptain },
  { key: 'players',              label: 'Manage Players',       Icon: IconPlayer  },
  { key: 'referees',             label: 'Manage Referees',      Icon: IconReferee },
  { key: 'tournaments',          label: 'Manage Tournaments',   Icon: IconTournament },
  { key: 'applications',         label: 'Captain Applications', Icon: IconApp     },
  { key: 'player-applications',  label: 'Player Applications',  Icon: IconApp     },
]
function SignOutModal({ onConfirm, onClose }) {
  return (
    <div className="modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="modal-box sm">
        <div className="modal-header">
          <h2 className="modal-title">Sign Out</h2>
          <button className="modal-close" onClick={onClose} aria-label="Close">
            <IconClose />
          </button>
        </div>

        <p className="confirm-text">
          Are you sure you want to sign out? You will need to log in again to access the dashboard.
        </p>

        <div className="confirm-btns">
          <button className="btn-outline-gold" onClick={onClose}>
            Cancel
          </button>
          <button className="btn-danger" onClick={onConfirm}>
            <span style={{ width: 14, height: 14, display: 'flex', alignItems: 'center' }}>
              <IconLogout />
            </span>
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

function AdminSidebar({ active, onSelect, open, onToggle, pendingCount = 0, pendingPlayerCount = 0 }) {
  const { logout } = useAuth()
  const navigate   = useNavigate()
  const [showConfirm, setShowConfirm] = useState(false)

  const handleConfirmLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <>
      <aside className={`admin-sidebar ${open ? '' : 'closed'}`}>

        {/* Toggle */}
        <button className="sidebar-toggle" onClick={onToggle} aria-label="Toggle sidebar">
          <span style={{ width: 16, height: 16, display: 'flex', alignItems: 'center' }}>
            {open ? <IconMenuOpen /> : <IconMenu />}
          </span>
        </button>

        {/* Brand */}
        <div className="sidebar-brand">
          <img src={logo} alt="Vamos" className="sidebar-logo" />
          <span className="sidebar-brand-text">
            Vamos <span>Sport</span>
          </span>
        </div>

        {/* Nav */}
        <nav className="sidebar-nav">
          {NAV_ITEMS.map(({ key, label, Icon }) => (
            <button
              key={key}
              className={`sidebar-item ${active === key ? 'active' : ''}`}
              onClick={() => onSelect(key)}
            >
              <span className="sidebar-item-icon">
                <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center' }}>
                  <Icon />
                </span>
              </span>
              <span className="sidebar-item-label">{label}</span>
              {key === 'applications' && pendingCount > 0 && (
                <span className="sidebar-badge">{pendingCount > 99 ? '99+' : pendingCount}</span>
              )}
              {key === 'player-applications' && pendingPlayerCount > 0 && (
                <span className="sidebar-badge">{pendingPlayerCount > 99 ? '99+' : pendingPlayerCount}</span>
              )}
            </button>
          ))}
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <button className="sidebar-logout" onClick={() => setShowConfirm(true)}>
            <span style={{ width: 18, height: 18, display: 'flex', alignItems: 'center', flexShrink: 0 }}>
              <IconLogout />
            </span>
            <span className="sidebar-item-label">Sign Out</span>
          </button>
        </div>
      </aside>

      {showConfirm && (
        <SignOutModal
          onConfirm={handleConfirmLogout}
          onClose={() => setShowConfirm(false)}
        />
      )}
    </>
  )
}

export default AdminSidebar
