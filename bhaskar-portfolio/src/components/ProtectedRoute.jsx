// src/components/ProtectedRoute.jsx
// -----------------------------------------------------------------------
// Wraps a page to restrict access based on auth state and role.
//
// Usage in App.jsx:
//   <Route path="/admin" element={
//     <ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>
//   } />
//
// - If auth is still loading -> show a spinner/placeholder.
// - If not logged in -> redirect to /login.
// - If a specific role is required and the user doesn't have it
//   -> redirect to the homepage.
// -----------------------------------------------------------------------
import { Navigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function ProtectedRoute({ children, role }) {
  const { user, role: userRole, loading } = useAuth()

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-slate-500 dark:text-slate-400">Loading...</p>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (role && userRole !== role) {
    return <Navigate to="/" replace />
  }

  return children
}
