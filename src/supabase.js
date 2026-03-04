import { createClient } from '@supabase/supabase-js'

const SUPABASE_URL  = import.meta.env.VITE_SUPABASE_URL  || ''
const SUPABASE_ANON = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

export const supabase = (SUPABASE_URL && SUPABASE_ANON)
  ? createClient(SUPABASE_URL, SUPABASE_ANON)
  : null

/* ── Email: send verification on registration ── */
export async function sendVerificationEmail(email, type, payload) {
  if (!supabase) return { error: 'Supabase not configured' }
  const { data, error } = await supabase.functions.invoke('send-verification', {
    body: { email, type, payload }
  })
  return { data, error }
}

/* ── Email: verify token from link ── */
export async function verifyEmailToken(token) {
  if (!supabase) return { error: 'Supabase not configured' }
  const { data, error } = await supabase.functions.invoke('verify-token', {
    body: { token }
  })
  return { data, error }
}

/* ── Email: notify eligible members when drive posted ── */
export async function notifyDriveMembers(drive) {
  if (!supabase) return { error: 'Supabase not configured' }
  const { data, error } = await supabase.functions.invoke('notify-drive', {
    body: { drive }
  })
  return { data, error }
}
