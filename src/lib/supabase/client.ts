'use client'
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    'https://bzlausfgpfvhqhbkddxe.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGF1c2ZncGZ2aHFoYmtkZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjcyMjEsImV4cCI6MjA5MTA0MzIyMX0.o8TlF7m2bYwziyQu17wHLQFjDU9zzAmKut-E20EWpeM'
  )
}
