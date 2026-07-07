// src/context/AuthContext.jsx
// -----------------------------------------------------------------------
// Central place for "who is logged in, and what role do they have".
//
// Responsibilities:
//   1. On load, check if there's an existing Supabase session.
//   2. Subscribe to auth state changes (login/logout in any tab).
//   3. Once we know the user, fetch their row from the "profiles" table
//      to find out their role ("admin" or "customer").
//   4. Expose signUp / signIn / signOut helpers + { user, profile, role,
//      loading } to the rest of the app via the useAuth() hook.
//
// Why a "profiles" table instead of trusting a role stored on the client?
// Because RLS policies in Postgres check the profiles table directly, so
// the source of truth for role lives in the database, not in the browser.
// -----------------------------------------------------------------------
import { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'

const AuthContext = createContext(undefined)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)       // Supabase auth user object
  const [profile, setProfile] = useState(null) // Row from "profiles" table
  const [loading, setLoading] = useState(true)

  // Fetch the profile row (id, full_name, role) for a given user id
  async function loadProfile(userId) {
    if (!userId) {
      setProfile(null)
      return
    }
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single()

    if (error) {
      console.error('[AuthContext] Failed to load profile:', error.message)
      setProfile(null)
    } else {
      setProfile(data)
    }
  }

  useEffect(() => {
    // 1. Check for an existing session on first load
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      setUser(session?.user ?? null)
      await loadProfile(session?.user?.id)
      setLoading(false)
    })

    // 2. Listen for future login/logout events
    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        setUser(session?.user ?? null)
        await loadProfile(session?.user?.id)
      }
    )

    // Cleanup the subscription when the app unmounts
    return () => listener.subscription.unsubscribe()
  }, [])

  // --- Auth actions -------------------------------------------------

  async function signUp(email, password, fullName) {
    // Creates the auth user. A Postgres trigger (see supabase/schema.sql)
    // automatically inserts a matching row into "profiles" with role
    // defaulted to 'customer'.
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    })
    return { data, error }
  }

  async function signIn(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })
    return { data, error }
  }

  async function signOut() {
    await supabase.auth.signOut()
  }

  const value = {
    user,
    profile,
    role: profile?.role ?? null, // 'admin' | 'customer' | null
    loading,
    signUp,
    signIn,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

// Convenience hook: const { user, role, signOut } = useAuth()
export function useAuth() {
  const ctx = useContext(AuthContext)
  if (ctx === undefined) {
    throw new Error('useAuth must be used inside an <AuthProvider>')
  }
  return ctx
}
