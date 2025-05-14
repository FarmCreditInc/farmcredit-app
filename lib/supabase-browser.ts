import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import type { Database } from "./database.types"

// Create a single supabase client for browser-side
let supabaseInstance: ReturnType<typeof createSupabaseClient<Database>> | null = null

export const createBrowserClient = () => {
  if (supabaseInstance) return supabaseInstance

  supabaseInstance = createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    },
  )

  return supabaseInstance
}

// For backward compatibility
export const createClient = createBrowserClient
