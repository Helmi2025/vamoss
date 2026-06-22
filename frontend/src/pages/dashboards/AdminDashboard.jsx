import { useState, useEffect, useCallback } from 'react'
import { useSearchParams } from 'react-router-dom'
import AdminSidebar        from './admin/AdminSidebar'
import AdminHomePage       from './admin/AdminHomePage'
import ManageProfile       from './admin/ManageProfile'
import ManageSports        from './admin/ManageSports'
import ManageFields        from './admin/ManageFields'
import ManageTeams         from './admin/ManageTeams'
import ManageCaptains      from './admin/ManageCaptains'
import ManagePlayers       from './admin/ManagePlayers'
import CaptainApplications from './admin/CaptainApplications'
import PlayerApplications  from './admin/PlayerApplications'
import ManageTournaments  from './admin/ManageTournaments'
import TournamentDetail   from './admin/TournamentDetail'
import api                 from '../../api/axiosInstance'
import './AdminDashboard.css'

const VALID_SECTIONS = ['home', 'profile', 'sports', 'fields', 'teams', 'captains', 'players', 'applications', 'player-applications', 'tournaments', 'tournament-detail']

function AdminDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen]           = useState(true)
  const [pendingCount, setPendingCount]          = useState(0)
  const [pendingPlayerCount, setPendingPlayerCount] = useState(0)

  // Read section from URL; fall back to 'home' if missing or invalid
  const rawSection = searchParams.get('section')
  const active = VALID_SECTIONS.includes(rawSection) ? rawSection : 'home'

  const fetchPendingCounts = useCallback(async () => {
    try {
      const [captainRes, playerRes] = await Promise.allSettled([
        api.get('/api/admin/captain-applications'),
        api.get('/api/admin/player-applications'),
      ])
      if (captainRes.status === 'fulfilled') setPendingCount(captainRes.value.data.length)
      if (playerRes.status  === 'fulfilled') setPendingPlayerCount(playerRes.value.data.length)
    } catch {
      // silently ignore — badges just won't show
    }
  }, [])

  useEffect(() => { fetchPendingCounts() }, [fetchPendingCounts])

  function handleSelect(section) {
    setSearchParams({ section })
    if (section !== 'applications' && section !== 'player-applications') fetchPendingCounts()
  }

  const SECTIONS = {
    home:                  <AdminHomePage />,
    profile:               <ManageProfile />,
    sports:                <ManageSports />,
    fields:                <ManageFields />,
    teams:                 <ManageTeams />,
    captains:              <ManageCaptains />,
    players:               <ManagePlayers />,
    applications:          <CaptainApplications onCountChange={setPendingCount} />,
    'player-applications': <PlayerApplications onCountChange={setPendingPlayerCount} />,
    tournaments:           <ManageTournaments />,
    'tournament-detail':   <TournamentDetail tournamentId={searchParams.get('id')} />,
  }

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <AdminSidebar
        active={active}
        onSelect={handleSelect}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
        pendingCount={pendingCount}
        pendingPlayerCount={pendingPlayerCount}
      />
      <main className="admin-main">
        {SECTIONS[active]}
      </main>
    </div>
  )
}

export default AdminDashboard
