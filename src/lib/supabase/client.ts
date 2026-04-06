'use client'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://bzlausfgpfvhqhbkddxe.supabase.co'
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGF1c2ZncGZ2aHFoYmtkZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjcyMjEsImV4cCI6MjA5MTA0MzIyMX0.o8TlF7m2bYwziyQu17wHLQFjDU9zzAmKut-E20EWpeM'

export function createClient() {
  const { createBrowserClient } = require('@supabase/ssr')
  return createBrowserClient(SUPABASE_URL, SUPABASE_ANON_KEY)
}
