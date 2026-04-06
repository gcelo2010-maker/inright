import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bzlausfgpfvhqhbkddxe.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGF1c2ZncGZ2aHFoYmtkZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjcyMjEsImV4cCI6MjA5MTA0MzIyMX0.o8TlF7m2bYwziyQu17wHLQFjDU9zzAmKut-E20EWpeM'

export async function createClient() {
  const cookieStore = await cookies()
  return createServerClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    cookies: {
      getAll() { return cookieStore.getAll() },
      setAll(cookiesToSet) {
        try {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options))
        } catch {}
      },
    },
  })
}
