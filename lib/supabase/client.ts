// lib/supabase/client.ts
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  // These variables MUST be prefixed with NEXT_PUBLIC_
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY");
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
