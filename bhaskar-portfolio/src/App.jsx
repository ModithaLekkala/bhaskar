// src/App.jsx
// -----------------------------------------------------------------------
// Top-level layout + route definitions.
// Navbar and AudioPlayer are rendered on every page (outside <Routes>),
// so they persist across navigation instead of remounting.
// -----------------------------------------------------------------------
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import AudioPlayer from './components/AudioPlayer'
import ProtectedRoute from './components/ProtectedRoute'

import LandingPage from './pages/LandingPage'
import Login from './pages/Login'
import Signup from './pages/Signup'
import CustomerDashboard from './pages/CustomerDashboard'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          <Route
            path="/dashboard"
            element={
              <ProtectedRoute role="customer">
                <CustomerDashboard />
              </ProtectedRoute>
            }
          />

          <Route
            path="/admin"
            element={
              <ProtectedRoute role="admin">
                <AdminDashboard />
              </ProtectedRoute>
            }
          />

          {/* Fallback for unknown routes */}
          <Route path="*" element={<LandingPage />} />
        </Routes>
      </main>

      <Footer />
      <AudioPlayer />
    </div>
  )
}
