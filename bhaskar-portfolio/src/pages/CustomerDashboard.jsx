// src/pages/CustomerDashboard.jsx
// -----------------------------------------------------------------------
// Dashboard shown to logged-in Customers.
// Fetches rows from "portfolios" belonging to the current user.
//
// Security note: we filter by .eq('customer_id', user.id) here for
// efficiency, but the REAL enforcement is the RLS policy in
// supabase/schema.sql ("Customers can view their own portfolio rows").
// Even if this filter were removed or tampered with, Postgres would
// still only return rows the logged-in user is allowed to see.
// -----------------------------------------------------------------------
import { useEffect, useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../lib/supabaseClient'

export default function CustomerDashboard() {
  const { user, profile } = useAuth()
  const [portfolios, setPortfolios] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!user) return

    async function fetchPortfolios() {
      setLoading(true)
      const { data, error: fetchError } = await supabase
        .from('portfolios')
        .select('*')
        .eq('customer_id', user.id)
        .order('created_at', { ascending: false })

      if (fetchError) {
        setError(fetchError.message)
      } else {
        setPortfolios(data)
      }
      setLoading(false)
    }

    fetchPortfolios()
  }, [user])

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-1">
        Welcome back{profile?.full_name ? `, ${profile.full_name}` : ''}
      </h1>
      <p className="text-slate-500 dark:text-slate-400 mb-8">
        Here's your latest portfolio activity and local market updates.
      </p>

      {loading && <p className="text-slate-500">Loading your portfolio...</p>}
      {error && <p className="text-red-500">{error}</p>}

      {!loading && !error && portfolios.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 dark:border-slate-600 p-8 text-center text-slate-500">
          No portfolio items yet. Bhaskar will add updates here as your
          campaigns progress.
        </div>
      )}

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {portfolios.map((item) => (
          <div
            key={item.id}
            className="rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-5 shadow-sm"
          >
            <span className="inline-block text-xs font-medium px-2 py-1 rounded-full bg-brand-100 text-brand-700 dark:bg-brand-900 dark:text-brand-100 mb-3">
              {item.category ?? 'Update'}
            </span>
            <h3 className="font-semibold mb-1">{item.title}</h3>
            <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-3">
              {item.description}
            </p>
            {item.created_at && (
              <p className="text-xs text-slate-400 mt-3">
                {new Date(item.created_at).toLocaleDateString()}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
