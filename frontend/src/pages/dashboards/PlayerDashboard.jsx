import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import PlayerSidebar       from './player/PlayerSidebar'
import UserHomePage       from './UserHomePage'
import PlayerTeam          from './player/PlayerTeam'
import PlayerManageProfile from './player/PlayerManageProfile'
import PlayerTournaments   from './player/PlayerTournaments'
import TeamChatWrapper     from './chat/TeamChatWrapper'
import './AdminDashboard.css'

const VALID_SECTIONS = ['home', 'team', 'profile', 'tournaments', 'messages']

function PlayerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen]   = useState(true)

  const rawSection = searchParams.get('section')
  const active = VALID_SECTIONS.includes(rawSection) ? rawSection : 'home'

  function handleSelect(section) {
    setSearchParams({ section })
  }

  const SECTIONS = {
    home:    <UserHomePage />,
    team:    <PlayerTeam />,
    profile: <PlayerManageProfile />,
    tournaments: <PlayerTournaments />,
    messages:    <TeamChatWrapper />,
  }

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <PlayerSidebar
        active={active}
        onSelect={handleSelect}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(v => !v)}
      />
      <main className="admin-main">
        {SECTIONS[active]}
      </main>
    </div>
  )
}

export default PlayerDashboard
