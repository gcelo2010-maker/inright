'use client'

import { useState } from 'react'

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
      const { createBrowserClient } = await import('@supabase/ssr')
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      )
      const { error: authError } = await supabase.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` },
      })
      if (authError) setError('Gabim gjatë dërgimit. Provoni përsëri.')
      else setSent(true)
    } catch {
      setError('Gabim lidhjeje. Kontrolloni internetin.')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#f9fafb',display:'flex',alignItems:'center',justifyContent:'center',padding:'16px'}}>
      <div style={{width:'100%',maxWidth:'384px'}}>
        <div style={{textAlign:'center',marginBottom:'32px'}}>
          <div style={{width:'56px',height:'56px',background:'#111827',borderRadius:'16px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px'}}>
            <span style={{color:'#fff',fontWeight:'700',fontSize:'20px'}}>IR</span>
          </div>
          <h1 style={{fontSize:'24px',fontWeight:'600',color:'#111827',letterSpacing:'-0.5px'}}>InRight</h1>
          <p style={{fontSize:'14px',color:'#6b7280',marginTop:'4px'}}>Menaxhim financiar për partnerë</p>
        </div>

        <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #f3f4f6',boxShadow:'0 1px 3px rgba(0,0,0,0.05)',padding:'24px'}}>
          {!sent ? (
            <>
              <h2 style={{fontSize:'15px',fontWeight:'500',color:'#111827',marginBottom:'4px'}}>Hyni në llogarinë tuaj</h2>
              <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'20px'}}>Do t&apos;ju dërgojmë një link hyrjeje direkt në email.</p>
              <form onSubmit={handleLogin}>
                <div style={{marginBottom:'16px'}}>
                  <label style={{display:'block',fontSize:'11px',fontWeight:'500',color:'#4b5563',marginBottom:'6px',textTransform:'uppercase',letterSpacing:'0.05em'}}>Email-i juaj</label>
                  <input
                    type="email"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="emri@kompania.com"
                    required
                    style={{width:'100%',padding:'10px 14px',border:'1px solid #e5e7eb',borderRadius:'12px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}
                  />
                </div>
                {error && <p style={{fontSize:'13px',color:'#dc2626',background:'#fef2f2',padding:'8px 12px',borderRadius:'8px',marginBottom:'12px'}}>{error}</p>}
                <button
                  type="submit"
                  disabled={loading || !email}
                  style={{width:'100%',background:'#111827',color:'#fff',border:'none',borderRadius:'12px',padding:'12px',fontSize:'14px',fontWeight:'500',cursor:loading?'not-allowed':'pointer',opacity:loading||!email?0.6:1}}
                >
                  {loading ? 'Duke dërguar...' : 'Dërgo link hyrjeje'}
                </button>
              </form>
            </>
          ) : (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{width:'48px',height:'48px',background:'#f0fdf4',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
                <span style={{fontSize:'24px',color:'#16a34a'}}>✓</span>
              </div>
              <h2 style={{fontSize:'15px',fontWeight:'500',color:'#111827',marginBottom:'8px'}}>Linku u dërgua!</h2>
              <p style={{fontSize:'13px',color:'#6b7280',marginBottom:'16px'}}>Kontrolloni <strong>{email}</strong> dhe klikoni linkun.</p>
              <button onClick={() => { setSent(false); setEmail('') }} style={{fontSize:'13px',color:'#6b7280',background:'none',border:'none',cursor:'pointer',textDecoration:'underline'}}>Provoni email tjetër</button>
            </div>
          )}
        </div>

        <p style={{textAlign:'center',fontSize:'11px',color:'#9ca3af',marginTop:'20px'}}>🔒 Akses vetëm për partnerët e autorizuar</p>
      </div>
    </div>
  )
}
