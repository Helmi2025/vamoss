import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

/**
 * <ProtectedRoute allowedRoles={['ADMIN']} />
 * - Not logged in  → /login
 * - Wrong role     → /unauthorized
 * - OK             → renders child route
 */
function ProtectedRoute({ allowedRoles }) {
  const { user } = useAuth()

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return <Outlet />
}

export default ProtectedRoute
