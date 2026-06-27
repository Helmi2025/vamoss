import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import RefereeSidebar      from './referee/RefereeSidebar'
import UserHomePage       from './UserHomePage'
import RefereeManageProfile from './referee/RefereeManageProfile'
import RefereeTournaments  from './referee/RefereeTournaments'
import RefereeMatches      from './referee/RefereeMatches'
import './AdminDashboard.css'

const VALID_SECTIONS = ['home', 'profile', 'tournaments', 'matches']

function RefereeDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen]   = useState(true)

  const rawSection = searchParams.get('section')
  const active = VALID_SECTIONS.includes(rawSection) ? rawSection : 'home'

  function handleSelect(section) {
    setSearchParams({ section })
  }

  const SECTIONS = {
    home:    <UserHomePage role="REFEREE" />,
    profile: <RefereeManageProfile />,
    tournaments: <RefereeTournaments />,
    matches: <RefereeMatches />,
  }

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <RefereeSidebar
        active={active}
        onSelect={handleSelect}
        open={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />
      <main className="admin-main">
        {SECTIONS[active]}
      </main>
    </div>
  )
}

export default RefereeDashboard
