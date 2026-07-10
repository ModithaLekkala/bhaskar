// src/pages/AdminDashboard.jsx
// -----------------------------------------------------------------------
// Private dashboard for Bhaskar (Admin only — enforced both by
// <ProtectedRoute role="admin"> in App.jsx AND by RLS policies in
// Postgres, so there are two independent layers of protection).
//
// Three sections:
//   1. Customers & Portfolios — view every customer's portfolio rows.
//   2. Club Subscribers — list of newsletter signups.
//   3. Broadcast — write an update and email it to every subscriber,
//      via a Supabase Edge Function (supabase/functions/send-broadcast).
// -----------------------------------------------------------------------
import { useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AdminDashboard() {
  const [tab, setTab] = useState('portfolios') // 'portfolios' | 'subscribers' | 'broadcast'

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">Welcome, Bhaskar 👋</h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Manage customer portfolios, subscribers, and send updates.
      </p>

      {/* Tab switcher */}
      <div className="flex gap-2 mb-8 border-b border-slate-200 dark:border-slate-700">
        {[
          { key: 'portfolios', label: 'Customer Portfolios' },
          { key: 'subscribers', label: 'Club Subscribers' },
          { key: 'broadcast', label: 'Send Broadcast' },
        ].map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors ${
              tab === t.key
                ? 'border-brand-600 text-brand-600'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === 'portfolios' && <PortfoliosPanel />}
      {tab === 'subscribers' && <SubscribersPanel />}
      {tab === 'broadcast' && <BroadcastPanel />}
    </div>
  )
}

// ---------------------------------------------------------------------
// Panel 1: Customers & their portfolio rows
// Because the Admin's RLS policy grants full access, this query returns
// EVERY row in "portfolios" (not just the admin's own).
// ---------------------------------------------------------------------
function PortfoliosPanel() {
  const [rows, setRows] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchAll() {
      setLoading(true)
      // Join portfolios -> profiles to show which customer each row belongs to
      const { data, error: fetchError } = await supabase
        .from('portfolios')
        .select('*, profiles:customer_id ( full_name, email )')
        .order('created_at', { ascending: false })

      if (fetchError) setError(fetchError.message)
      else setRows(data)
      setLoading(false)
    }
    fetchAll()
  }, [])

  if (loading) return <p className="text-slate-500">Loading portfolios...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800 text-left">
          <tr>
            <th className="px-4 py-3 font-semibold">Customer</th>
            <th className="px-4 py-3 font-semibold">Title</th>
            <th className="px-4 py-3 font-semibold">Category</th>
            <th className="px-4 py-3 font-semibold">Created</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-slate-200 dark:border-slate-700">
              <td className="px-4 py-3">{r.profiles?.full_name ?? r.customer_id}</td>
              <td className="px-4 py-3">{r.title}</td>
              <td className="px-4 py-3">{r.category ?? '—'}</td>
              <td className="px-4 py-3 text-slate-400">
                {new Date(r.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {rows.length === 0 && (
            <tr><td colSpan={4} className="px-4 py-6 text-center text-slate-400">No portfolio rows yet.</td></tr>
          )}
        </tbody>
      </table>
    </div>
  )
}

// ---------------------------------------------------------------------
// Panel 2: Newsletter ("Join the Club") subscribers list
// ---------------------------------------------------------------------
function SubscribersPanel() {
  const [subs, setSubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    async function fetchSubs() {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('subscribers')
        .select('*')
        .order('created_at', { ascending: false })

      if (fetchError) setError(fetchError.message)
      else setSubs(data)
      setLoading(false)
    }
    fetchSubs()
  }, [])

  if (loading) return <p className="text-slate-500">Loading subscribers...</p>
  if (error) return <p className="text-red-500">{error}</p>

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
      <table className="w-full text-sm">
        <thead className="bg-slate-100 dark:bg-slate-800 text-left">
          <tr>
            <th className="px-4 py-3 font-semibold">Email</th>
            <th className="px-4 py-3 font-semibold">Joined</th>
          </tr>
        </thead>
        <tbody>
          {subs.map((s) => (
            <tr key={s.id} className="border-t border-slate-200 dark:border-slate-700">
              <td className="px-4 py-3">{s.email}</td>
              <td className="px-4 py-3 text-slate-400">
                {new Date(s.created_at).toLocaleDateString()}
              </td>
            </tr>
          ))}
          {subs.length === 0 && (
            <tr><td colSpan={2} className="px-4 py-6 text-center text-slate-400">No subscribers yet.</td></tr>
          )}
        </tbody>
      </table>
      <p className="px-4 py-3 text-xs text-slate-400 border-t border-slate-200 dark:border-slate-700">
        {subs.length} total subscriber{subs.length === 1 ? '' : 's'}
      </p>
    </div>
  )
}

// ---------------------------------------------------------------------
// Panel 3: Broadcast — compose an update and email every subscriber.
// This calls a Supabase Edge Function ("send-broadcast") rather than
// emailing directly from the browser, because:
//   (a) you never want your email-provider API key exposed client-side
//   (b) the function can safely use the "service_role" key server-side
//       to read the full subscriber list regardless of RLS.
// See supabase/functions/send-broadcast/index.ts
// ---------------------------------------------------------------------
function BroadcastPanel() {
  const [subject, setSubject] = useState('')
  const [body, setBody] = useState('')
  const [status, setStatus] = useState('idle') // idle | sending | success | error
  const [message, setMessage] = useState('')

  async function handleSend(e) {
    e.preventDefault()
    setStatus('sending')
    setMessage('')

    // invoke() calls the deployed Edge Function by name and passes a JSON body.
    const { data, error } = await supabase.functions.invoke('send-broadcast', {
      body: { subject, body },
    })

    if (error) {
      setStatus('error')
      setMessage(error.message ?? 'Failed to send broadcast.')
      return
    }

    setStatus('success')
    setMessage(`Sent to ${data?.sent ?? 'all'} subscribers.`)
    setSubject('')
    setBody('')
  }

  return (
    <form onSubmit={handleSend} className="max-w-xl space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Subject</label>
        <input
          type="text"
          required
          value={subject}
          onChange={(e) => setSubject(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          placeholder="This week's market update"
        />
      </div>
      <div>
        <label className="block text-sm font-medium mb-1">Message</label>
        <textarea
          required
          rows={8}
          value={body}
          onChange={(e) => setBody(e.target.value)}
          className="w-full px-4 py-2 rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800"
          placeholder="Write your update to the Club here..."
        />
      </div>

      {message && (
        <p className={`text-sm ${status === 'error' ? 'text-red-500' : 'text-green-600'}`}>{message}</p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="px-6 py-2.5 rounded-lg bg-brand-600 hover:bg-brand-700 disabled:opacity-60 text-white font-medium"
      >
        {status === 'sending' ? 'Sending...' : 'Send to all subscribers'}
      </button>
    </form>
  )
}
