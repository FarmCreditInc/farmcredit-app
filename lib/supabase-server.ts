import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { cache } from "react"
import type { Database } from "./database.types"

// Add detailed logging to the createClient function
// Add this at the beginning of the file or where the createClient function is defined:

export function createClient() {
  const supabase = createServerComponentClient<Database>({ cookies })
  console.log("Supabase client created with URL:", process.env.NEXT_PUBLIC_SUPABASE_URL)
  return supabase
}

// Create a cached version of the Supabase client for server components
export const createServerComponentClient = cache(() => {
  const cookieStore = cookies()
  return createSupabaseClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
      cookies: {
        get(name) {
          return cookieStore.get(name)?.value
        },
        set(name, value, options) {
          cookieStore.set({ name, value, ...options })
        },
        remove(name, options) {
          cookieStore.set({ name, value: "", ...options })
        },
      },
    },
  )
})

// Alias for backward compatibility
// export const createClient = createServerComponentClient
