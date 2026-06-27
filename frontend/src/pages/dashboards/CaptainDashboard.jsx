import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import CaptainSidebar      from './captain/CaptainSidebar'
import UserHomePage       from './UserHomePage'
import CaptainManageProfile from './captain/CaptainManageProfile'
import CaptainManageTeam   from './captain/CaptainManageTeam'
import CaptainTournaments  from './captain/CaptainTournaments'
import TeamChatWrapper     from './chat/TeamChatWrapper'
import './AdminDashboard.css'

const VALID_SECTIONS = ['home', 'profile', 'team', 'tournaments', 'messages']

function CaptainDashboard() {
  const [searchParams, setSearchParams] = useSearchParams()
  const [sidebarOpen, setSidebarOpen]   = useState(true)

  const rawSection = searchParams.get('section')
  const active = VALID_SECTIONS.includes(rawSection) ? rawSection : 'home'

  function handleSelect(section) {
    setSearchParams({ section })
  }

  const SECTIONS = {
    home:    <UserHomePage />,
    profile: <CaptainManageProfile />,
    team:    <CaptainManageTeam />,
    tournaments: <CaptainTournaments />,
    messages:    <TeamChatWrapper />,
  }

  return (
    <div className={`admin-layout ${sidebarOpen ? 'sidebar-open' : 'sidebar-closed'}`}>
      <CaptainSidebar
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

export default CaptainDashboard
