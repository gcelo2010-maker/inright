'use client'

export function createClient() {
  // Lazy import - only runs in browser, never during build
  const { createBrowserClient } = require('@supabase/ssr')
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL ?? '',
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ''
  )
}
