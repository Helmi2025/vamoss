import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../../context/AuthContext'
import logo from '../../../assets/logo.png'
import '../AdminDashboard.css'

/* ── Icons ── */
const IconHome       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
const IconMenu       = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="3" y1="6"  x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
const IconMenuOpen   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
const IconProfile    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>
const IconTournament = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.45 1-1 1H4v2h16v-2h-5c-.55 0-1-.45-1-1v-2.34"/><path d="M12 2a5 5 0 0 0-6 4.88c0 3 2.1 5.37 5 5.8V2z"/></svg>
const IconExplore    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76"/></svg>
const IconFriends    = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
const IconMessages   = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
const IconLogout     = () => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
const IconClose      = () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>

const NAV_ITEMS = [
  { key: 'home',        label: 'Home',             Icon: IconHome        },
  { key: 'profile',     label: 'Manage Profile',    Icon: IconProfile    },
  { key: 'tournaments', label: 'Tournaments',       Icon: IconTournament },
  { key: 'explore',     label: 'Explore Players',   Icon: IconExplore    },
  { key: 'friends',     label: 'Friends',           Icon: IconFriends    },
  { key: 'messages',    label: 'Messages',          Icon: IconMessages   },
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
          <button className="btn-outline-gold" onClick={onClose}>Cancel</button>
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

function IndividualPlayerSidebar({ active, onSelect, open, onToggle }) {
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

export default IndividualPlayerSidebar
