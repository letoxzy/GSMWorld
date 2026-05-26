import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { currentUser, isAdmin } = useAuth()

  if (!currentUser) return <Navigate to="/login" replace />
  if (adminOnly && !isAdmin()) return <Navigate to="/" replace />

  return children
}
