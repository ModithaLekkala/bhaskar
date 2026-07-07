// src/components/NewsletterForm.jsx
// -----------------------------------------------------------------------
// "Join the Club" newsletter signup form shown on the public landing page.
// On submit, it inserts a row into the "subscribers" table in Supabase.
//
// RLS note: the "subscribers" table allows public/anonymous INSERT so
// visitors who aren't logged in can still subscribe, but only the Admin
// can SELECT (read) the list — see supabase/schema.sql for the policies.
// -----------------------------------------------------------------------
import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function NewsletterForm() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState('idle') // idle | loading | success | error
  const [message, setMessage] = useState('')

  async function handleSubmit(e) {
    e.preventDefault()
    setStatus('loading')
    setMessage('')

    const { error } = await supabase.from('subscribers').insert({ email })

    if (error) {
      setStatus('error')
      // Postgres unique constraint violation code
      if (error.code === '23505') {
        setMessage("You're already subscribed!")
      } else {
        setMessage('Something went wrong. Please try again.')
      }
      return
    }

    setStatus('success')
    setMessage('Welcome to the Club! 🎉')
    setEmail('')
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 w-full max-w-md">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="flex-1 px-4 py-3 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-brand-500"
      />
      <button
        type="submit"
        disabled={status === 'loading'}
        className="px-6 py-3 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium transition-colors"
      >
        {status === 'loading' ? 'Joining...' : 'Join the Club'}
      </button>
      {message && (
        <p className={`text-sm mt-1 sm:mt-0 sm:ml-2 self-center ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>
          {message}
        </p>
      )}
    </form>
  )
}
