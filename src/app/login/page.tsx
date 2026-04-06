'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Mail, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError('Gabim gjatë dërgimit. Provoni përsëri.')
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-gray-900 rounded-2xl mb-4">
            <span className="text-white font-bold text-xl">IR</span>
          </div>
          <h1 className="text-2xl font-semibold text-gray-900 tracking-tight">InRight</h1>
          <p className="text-sm text-gray-500 mt-1">Menaxhim financiar për partnerë</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          {!sent ? (
            <>
              <h2 className="text-base font-medium text-gray-900 mb-1">Hyni në llogarinë tuaj</h2>
              <p className="text-sm text-gray-500 mb-5">
                Do t&apos;ju dërgojmë një link hyrjeje direkt në email.
              </p>

              <form onSubmit={handleLogin} className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-gray-600 mb-1.5 uppercase tracking-wide">
                    Email-i juaj
                  </label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="emri@kompania.com"
                      required
                      className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-gray-900 text-white rounded-xl py-3 text-sm font-medium disabled:opacity-50 flex items-center justify-center gap-2 transition-opacity"
                >
                  {loading ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /> Duke dërguar...</>
                  ) : (
                    'Dërgo link hyrjeje'
                  )}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4">
              <CheckCircle2 className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <h2 className="text-base font-medium text-gray-900 mb-2">Linku u dërgua!</h2>
              <p className="text-sm text-gray-500 mb-4">
                Kontrolloni email-in <strong>{email}</strong> dhe klikoni linkun për të hyrë.
              </p>
              <button
                onClick={() => { setSent(false); setEmail('') }}
                className="text-sm text-gray-500 underline"
              >
                Provoni email tjetër
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-center gap-1.5 mt-5">
          <ShieldCheck className="w-3.5 h-3.5 text-gray-400" />
          <p className="text-xs text-gray-400">Akses vetëm për partnerët e autorizuar</p>
        </div>
      </div>
    </div>
  )
}
