import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY
const isServer = typeof window === 'undefined'
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'

const logMissingConfig = (missing: string[]) => {
  console.error('--- DATABASE CONNECTION FAILED ---')
  missing.forEach((key) => console.error(`MISSING: ${key}`))
  console.error('Refer to .env.example to configure Supabase credentials.')
}

if (isServer && !isBuildPhase) {
  const missing: string[] = []
  if (!supabaseUrl) missing.push('NEXT_PUBLIC_SUPABASE_URL')
  if (!supabaseKey) missing.push('NEXT_PUBLIC_SUPABASE_ANON_KEY')

  if (missing.length > 0) {
    logMissingConfig(missing)
  }

  if (!supabaseServiceRoleKey) {
    console.warn('--- ADMIN DATABASE ACCESS WARNING ---')
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set; admin operations will be limited.')
  }
}

const supabase =
  supabaseUrl && supabaseKey
    ? createClient(supabaseUrl, supabaseKey)
    : createClient('https://placeholder.supabase.co', 'placeholder-key')

const supabaseAdmin =
  supabaseUrl && supabaseServiceRoleKey
    ? createClient(supabaseUrl, supabaseServiceRoleKey, {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      })
    : supabase

export { supabase, supabaseAdmin }
export default supabase
