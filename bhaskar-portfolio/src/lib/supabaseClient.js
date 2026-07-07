// src/lib/supabaseClient.js
// -----------------------------------------------------------------------
// Creates ONE shared Supabase client used across the whole app.
// Reads the project URL + anon key from your .env file (see .env.example).
//
// Import this anywhere you need to talk to Supabase:
//   import { supabase } from '../lib/supabaseClient'
// -----------------------------------------------------------------------
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.warn(
    '[supabaseClient] Missing VITE_SUPABASE_URL or VITE_SUPABASE_ANON_KEY. ' +
    'Copy .env.example to .env and fill in your Supabase project values.'
  )
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
