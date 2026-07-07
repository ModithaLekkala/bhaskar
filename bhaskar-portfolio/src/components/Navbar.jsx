// src/components/Navbar.jsx
// -----------------------------------------------------------------------
// Top navigation bar shown on every page.
// Shows different links depending on auth state:
//   - Logged out: Login / Sign Up
//   - Customer:   Dashboard / Logout
//   - Admin:      Admin Dashboard / Logout
// Also hosts the ThemeToggle button.
// -----------------------------------------------------------------------
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import ThemeToggle from './ThemeToggle'

export default function Navbar() {
  const { user, role, signOut } = useAuth()
  const navigate = useNavigate()

  async function handleLogout() {
    await signOut()
    navigate('/')
  }

  return (
    <nav className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur border-b border-slate-200 dark:border-slate-700">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg tracking-tight">
          Bhaskar <span className="text-brand-600">Kanderi</span>
        </Link>

        <div className="flex items-center gap-3">
          {!user && (
            <>
              <Link to="/login" className="text-sm font-medium hover:text-brand-600">Login</Link>
              <Link
                to="/signup"
                className="text-sm font-medium px-4 py-2 rounded-lg bg-brand-600 hover:bg-brand-700 text-white"
              >
                Sign Up
              </Link>
            </>
          )}

          {user && role === 'customer' && (
            <>
              <Link to="/dashboard" className="text-sm font-medium hover:text-brand-600">Dashboard</Link>
              <button onClick={handleLogout} className="text-sm font-medium hover:text-brand-600">Logout</button>
            </>
          )}

          {user && role === 'admin' && (
            <>
              <Link to="/admin" className="text-sm font-medium hover:text-brand-600">Admin</Link>
              <button onClick={handleLogout} className="text-sm font-medium hover:text-brand-600">Logout</button>
            </>
          )}

          <ThemeToggle />
        </div>
      </div>
    </nav>
  )
}
