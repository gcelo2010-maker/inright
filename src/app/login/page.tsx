'use client'
export const dynamic = 'force-dynamic'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email) return
    setLoading(true)
    setError('')

    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback`,
        },
      })
      if (error) {
        setError(`Gabim: ${error.message}`)
      } else {
        setSent(true)
      }
    } catch (err: unknown) {
      setError(`Gabim lidhjeje: ${err instanceof Error ? err.message : 'Provoni përsëri'}`)
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#f9fafb',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{width:'100%',maxWidth:'360px'}}>
        <div style={{textAlign:'center',marginBottom:'2rem'}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'56px',height:'56px',background:'#111',borderRadius:'14px',marginBottom:'1rem'}}>
            <span style={{color:'#fff',fontWeight:'700',fontSize:'18px'}}>IR</span>
          </div>
          <h1 style={{fontSize:'22px',fontWeight:'600',color:'#111',letterSpacing:'-0.5px'}}>InRight</h1>
          <p style={{fontSize:'13px',color:'#6b7280',marginTop:'4px'}}>Menaxhim financiar për partnerë</p>
        </div>

        <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #e5e7eb',padding:'24px'}}>
          {!sent ? (
            <>
              <h2 style={{fontSize:'15px',fontWeight:'500',color:'#111',marginBottom:'4px'}}>Hyni në llogarinë tuaj</h2>
              <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'20px'}}>
                Do t&apos;ju dërgojmë një link hyrjeje direkt në email.
              </p>
              <form onSubmit={handleLogin}>
                <label style={{display:'block',fontSize:'11px',fontWeight:'500',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'6px'}}>
                  Email-i juaj
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="emri@kompania.com"
                  required
                  style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'10px',fontSize:'14px',outline:'none',marginBottom:'12px',fontFamily:'inherit'}}
                />
                {error && (
                  <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'8px',padding:'8px 12px',fontSize:'12px',color:'#dc2626',marginBottom:'12px'}}>
                    {error}
                  </div>
                )}
                <button
                  type="submit"
                  disabled={loading || !email}
                  style={{width:'100%',background:loading||!email?'#6b7280':'#111',color:'#fff',border:'none',borderRadius:'10px',padding:'12px',fontSize:'14px',fontWeight:'500',cursor:loading||!email?'not-allowed':'pointer',fontFamily:'inherit'}}
                >
                  {loading ? 'Duke dërguar...' : 'Dërgo link hyrjeje'}
                </button>
              </form>
            </>
          ) : (
            <div style={{textAlign:'center',padding:'8px 0'}}>
              <div style={{width:'48px',height:'48px',background:'#f0fdf4',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px',fontSize:'22px'}}>✓</div>
              <h2 style={{fontSize:'15px',fontWeight:'500',color:'#111',marginBottom:'8px'}}>Linku u dërgua!</h2>
              <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'16px'}}>
                Kontrolloni <strong>{email}</strong> dhe klikoni linkun.
              </p>
              <button onClick={() => {setSent(false);setEmail('')}} style={{fontSize:'13px',color:'#6b7280',textDecoration:'underline',border:'none',background:'none',cursor:'pointer'}}>
                Provoni email tjetër
              </button>
            </div>
          )}
        </div>

        <div style={{textAlign:'center',marginTop:'16px'}}>
          <p style={{fontSize:'11px',color:'#9ca3af'}}>🔒 Akses vetëm për partnerët e autorizuar</p>
        </div>
      </div>
    </div>
  )
}
