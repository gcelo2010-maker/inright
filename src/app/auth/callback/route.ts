import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

const SB_URL = 'https://bzlausfgpfvhqhbkddxe.supabase.co'
const SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGF1c2ZncGZ2aHFoYmtkZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjcyMjEsImV4cCI6MjA5MTA0MzIyMX0.o8TlF7m2bYwziyQu17wHLQFjDU9zzAmKut-E20EWpeM'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const type = searchParams.get('type')
  const next = searchParams.get('next') ?? '/dashboard'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(SB_URL, SB_KEY, {
      cookies: {
        getAll() { return cookieStore.getAll() },
        setAll(c) { c.forEach(({ name, value, options }) => cookieStore.set(name, value, options)) },
      },
    })
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    if (!error) {
      // Nëse është password recovery, shko te faqja reset
      if (type === 'recovery') {
        return NextResponse.redirect(`${origin}/reset-password`)
      }
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`)
}
