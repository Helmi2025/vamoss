import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import IndividualPlayerSidebar      from './player/IndividualPlayerSidebar'
import UserHomePage                from './UserHomePage'
import PlayerManageProfile          from './player/PlayerManageProfile'
import IndividualPlayerTournaments  from './player/IndividualPlayerTournaments'
import ExplorePlayers               from './player/ExplorePlayers'
import PlayerFriends                from './player/PlayerFriends'
import './AdminDashboard.css'

const VALID_SECTIONS = ['home', 'profile', 'tournaments', 'explore', 'friends']

function IndividualPlayerDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen]   = useState(true)

  const rawSection = searchParams.get('section')
  const active = VALID_SECTIONS.includes(rawSection) ? rawSection : 'home'

  function handleSelect(section) {
    setSearchParams({ section })
  }

  const SECTIONS = {
    home:        <UserHomePage />,
    profile:     <PlayerManageProfile />,
    tournaments: <IndividualPlayerTournaments />,
    explore:     <ExplorePlayers />,
    friends:     <PlayerFriends />,
  }

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <IndividualPlayerSidebar
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

export default IndividualPlayerDashboard
