// src/pages/Signup.jsx
// -----------------------------------------------------------------------
// Signup form for new Customers. (Admin accounts should be created
// manually/once — see README for how to promote a user to "admin".)
// -----------------------------------------------------------------------
import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function Signup() {
  const { signUp } = useAuth()
  const navigate = useNavigate()
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [info, setInfo] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setInfo('')
    setLoading(true)

    const { error: signUpError } = await signUp(email, password, fullName)

    setLoading(false)

    if (signUpError) {
      setError(signUpError.message)
      return
    }

    // If Supabase email confirmation is enabled, the user needs to
    // confirm their email before they can log in.
    setInfo('Account created! Check your email to confirm, then log in.')
    setTimeout(() => navigate('/login'), 2000)
  }

  return (
    <div className="max-w-md mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold mb-6">Create your account</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Full name</label>
          <input
            type="text"
            required
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {info && <p className="text-sm text-green-600">{info}</p>}

        <button
          type="submit"
          disabled={loading}
          className="w-full py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium"
        >
          {loading ? 'Creating account...' : 'Sign up'}
        </button>
      </form>

      <p className="text-sm text-slate-500 mt-4">
        Already have an account? <Link to="/login" className="text-brand-600 font-medium">Log in</Link>
      </p>
    </div>
  )
}
