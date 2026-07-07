// supabase/functions/send-broadcast/index.ts
// -----------------------------------------------------------------------
// Supabase Edge Function: send-broadcast
// -----------------------------------------------------------------------
// Called from AdminDashboard.jsx via supabase.functions.invoke('send-broadcast').
//
// What it does:
//   1. Verifies the caller is logged in AND has role='admin' (using the
//      caller's own JWT — never trust the client to self-report its role).
//   2. Reads every row from "subscribers" using the SERVICE ROLE key
//      (bypasses RLS, which is safe here because we already verified
//      admin status in step 1, server-side).
//   3. Sends an email to each subscriber via the Resend API
//      (https://resend.com — swap this out for SendGrid/Postmark/etc.
//      if you prefer; the emailing logic is isolated in sendEmail()).
//
// Deploy with:
//   supabase functions deploy send-broadcast
//
// Required secrets (set with `supabase secrets set KEY=value`):
//   RESEND_API_KEY   - your Resend API key
//   SUPABASE_URL              - auto-provided by Supabase at runtime
//   SUPABASE_SERVICE_ROLE_KEY - auto-provided by Supabase at runtime
// -----------------------------------------------------------------------

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')!
const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!
const SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!

// CORS headers so the browser (running on localhost or your deployed
// domain) is allowed to call this function directly.
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { subject, body } = await req.json()
    if (!subject || !body) {
      return jsonResponse({ error: 'subject and body are required' }, 400)
    }

    // ---- 1. Verify the caller is an authenticated Admin -----------------
    // The client's Authorization header (a user JWT) is forwarded
    // automatically by supabase.functions.invoke().
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) return jsonResponse({ error: 'Missing auth header' }, 401)

    // Client scoped to the CALLER's own permissions (respects RLS)
    const callerClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
      global: { headers: { Authorization: authHeader } },
    })

    const {
      data: { user },
      error: userError,
    } = await callerClient.auth.getUser()

    if (userError || !user) return jsonResponse({ error: 'Not authenticated' }, 401)

    const { data: profile, error: profileError } = await callerClient
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()

    if (profileError || profile?.role !== 'admin') {
      return jsonResponse({ error: 'Admins only' }, 403)
    }

    // ---- 2. Fetch all subscribers using the service role (bypasses RLS) -
    const adminClient = createClient(SUPABASE_URL, SERVICE_ROLE_KEY)
    const { data: subscribers, error: subsError } = await adminClient
      .from('subscribers')
      .select('email')

    if (subsError) return jsonResponse({ error: subsError.message }, 500)
    if (!subscribers || subscribers.length === 0) {
      return jsonResponse({ sent: 0, message: 'No subscribers to email.' })
    }

    // ---- 3. Send the email via Resend ------------------------------------
    const results = await Promise.allSettled(
      subscribers.map((s) => sendEmail(s.email, subject, body))
    )
    const sent = results.filter((r) => r.status === 'fulfilled').length

    return jsonResponse({ sent, total: subscribers.length })
  } catch (err) {
    return jsonResponse({ error: String(err) }, 500)
  }
})

async function sendEmail(to: string, subject: string, body: string) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Bhaskar Kanderi <club@yourdomain.com>', // must be a verified sender in Resend
      to,
      subject,
      text: body,
    }),
  })
  if (!res.ok) throw new Error(`Failed to email ${to}: ${res.status}`)
  return res.json()
}

function jsonResponse(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}
