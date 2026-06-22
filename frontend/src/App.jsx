import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

import Home                       from './pages/Home'
import Login                      from './pages/Login'
import JoinAsCaptain              from './pages/JoinAsCaptain'
import JoinAsPlayer               from './pages/JoinAsPlayer'
import Unauthorized               from './pages/Unauthorized'
import VisitorView                from './pages/VisitorView'
import AdminDashboard             from './pages/dashboards/AdminDashboard'
import CaptainDashboard           from './pages/dashboards/CaptainDashboard'
import PlayerDashboard            from './pages/dashboards/PlayerDashboard'
import IndividualPlayerDashboard  from './pages/dashboards/IndividualPlayerDashboard'
import ProtectedRoute             from './router/ProtectedRoute'
import TournamentBracketView      from './pages/TournamentBracketView'

/**
 * If the user is already logged in and hits /login,
 * redirect them straight to their dashboard.
 */
function RedirectIfAuthenticated({ children }) {
  const { user } = useAuth()
  if (!user) return children

  if (user.role === 'ADMIN')   return <Navigate to="/dashboard/admin"   replace />
  if (user.role === 'CAPTAIN') return <Navigate to="/dashboard/captain" replace />
  if (user.role === 'PLAYER') {
    // Individual players (tennis/padel) have sportId; team players have teamId
    if (user.sportId) return <Navigate to="/dashboard/player/individual" replace />
    return <Navigate to="/dashboard/player" replace />
  }
  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/" element={<Home />} />
        <Route path="/discover" element={<VisitorView />} />
        <Route
          path="/login"
          element={
            <RedirectIfAuthenticated>
              <Login />
            </RedirectIfAuthenticated>
          }
        />
        <Route path="/register" element={<JoinAsCaptain />} />
        <Route path="/join-player" element={<JoinAsPlayer />} />
        <Route path="/unauthorized" element={<Unauthorized />} />

        {/* Protected — Admin */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN']} />}>
          <Route path="/dashboard/admin" element={<AdminDashboard />} />
        </Route>

        {/* Protected — Captain */}
        <Route element={<ProtectedRoute allowedRoles={['CAPTAIN']} />}>
          <Route path="/dashboard/captain" element={<CaptainDashboard />} />
        </Route>

        {/* Protected — Player (team) */}
        <Route element={<ProtectedRoute allowedRoles={['PLAYER']} />}>
          <Route path="/dashboard/player" element={<PlayerDashboard />} />
        </Route>

        {/* Protected — Player (individual: tennis / padel) */}
        <Route element={<ProtectedRoute allowedRoles={['PLAYER']} />}>
          <Route path="/dashboard/player/individual" element={<IndividualPlayerDashboard />} />
        </Route>

        {/* Shared — Bracket viewer (all authenticated roles) */}
        <Route element={<ProtectedRoute allowedRoles={['ADMIN', 'CAPTAIN', 'PLAYER']} />}>
          <Route path="/tournaments/:id/bracket" element={<TournamentBracketView />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
