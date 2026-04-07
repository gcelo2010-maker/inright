'use client'
export const dynamic = 'force-dynamic'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function ResetPassword() {
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    // Supabase vendos session automatikisht nga URL hash
    const sb = createClient()
    sb.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') setReady(true)
    })
    // Provo edhe getSession
    sb.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })
  }, [])

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    if (password.length < 6) { setError('Minimumi 6 karaktere'); return }
    if (password !== confirm) { setError('Fjalëkalimet nuk përputhen'); return }
    setLoading(true)
    const sb = createClient()
    const { error } = await sb.auth.updateUser({ password })
    if (error) setError('Gabim: ' + error.message)
    else setDone(true)
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{width:'100%',maxWidth:'360px'}}>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'60px',height:'60px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',borderRadius:'18px',marginBottom:'14px'}}>
            <span style={{color:'#0a0a0f',fontWeight:'800',fontSize:'22px'}}>IR</span>
          </div>
          <h1 style={{fontSize:'22px',fontWeight:'800',color:'#fff',margin:'0 0 4px'}}>InRight</h1>
          <p style={{fontSize:'12px',color:'#555',margin:0}}>Vendosni fjalëkalimin e ri</p>
        </div>

        <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.09)',borderRadius:'20px',padding:'24px'}}>
          {done ? (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{width:'56px',height:'56px',background:'rgba(74,222,128,.15)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:'24px'}}>✓</div>
              <h3 style={{fontSize:'16px',fontWeight:'700',color:'#fff',margin:'0 0 8px'}}>Fjalëkalimi u ndryshua!</h3>
              <p style={{fontSize:'12px',color:'#888',margin:'0 0 20px'}}>Tani mund të hyni me fjalëkalimin e ri.</p>
              <a href="/login" style={{display:'block',padding:'12px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',borderRadius:'12px',color:'#0a0a0f',fontSize:'14px',fontWeight:'800',textDecoration:'none',textAlign:'center'}}>
                Shko te Hyrja →
              </a>
            </div>
          ) : (
            <form onSubmit={handleReset} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <div>
                <label style={{display:'block',fontSize:'10px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:'6px'}}>Fjalëkalimi i Ri</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Min. 6 karaktere" required
                  style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'12px',color:'#fff',fontSize:'14px',boxSizing:'border-box' as const,fontFamily:'inherit',outline:'none'}}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'10px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:'6px'}}>Konfirmo Fjalëkalimin</label>
                <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}
                  placeholder="Përsërit fjalëkalimin" required
                  style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'12px',color:'#fff',fontSize:'14px',boxSizing:'border-box' as const,fontFamily:'inherit',outline:'none'}}/>
              </div>
              {error && <div style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.3)',borderRadius:'10px',padding:'10px',fontSize:'12px',color:'#f87171'}}>{error}</div>}
              {!ready && <p style={{fontSize:'11px',color:'#f59e0b',textAlign:'center' as const}}>⏳ Duke ngarkuar sesionin...</p>}
              <button type="submit" disabled={loading||!password||!confirm||!ready}
                style={{padding:'13px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',border:'none',borderRadius:'12px',color:'#0a0a0f',fontSize:'14px',fontWeight:'800',cursor:'pointer',opacity:loading||!ready?0.6:1}}>
                {loading?'Duke ndryshuar...':'Ruaj Fjalëkalimin'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
