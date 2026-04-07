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
    const sb = createClient()

    // Metoda 1: lexo hash direkt nga window.location
    const hash = window.location.hash.slice(1)
    const params = new URLSearchParams(hash)
    const accessToken = params.get('access_token')
    const refreshToken = params.get('refresh_token') || ''

    if (accessToken) {
      sb.auth.setSession({ access_token: accessToken, refresh_token: refreshToken })
        .then(({ data, error: e }) => {
          if (!e && data.session) {
            setReady(true)
          } else {
            setError('Linku ka skaduar. Kërkoni rivendosje të re.')
          }
        })
      return
    }

    // Metoda 2: onAuthStateChange
    const { data: { subscription } } = sb.auth.onAuthStateChange((event, session) => {
      if (event === 'PASSWORD_RECOVERY' || (event === 'SIGNED_IN' && session)) {
        setReady(true)
      }
    })

    // Metoda 3: session ekzistues
    sb.auth.getSession().then(({ data }) => {
      if (data.session) setReady(true)
    })

    return () => subscription.unsubscribe()
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
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:'100%',maxWidth:'360px'}}>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'60px',height:'60px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',borderRadius:'18px',marginBottom:'14px'}}>
            <span style={{color:'#0a0a0f',fontWeight:'800',fontSize:'22px'}}>IR</span>
          </div>
          <h1 style={{fontSize:'22px',fontWeight:'800',color:'#fff',margin:'0 0 4px'}}>InRight</h1>
          <p style={{fontSize:'12px',color:'#555',margin:0}}>Rivendos fjalëkalimin</p>
        </div>

        <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.09)',borderRadius:'20px',padding:'24px'}}>
          {done ? (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{width:'56px',height:'56px',background:'rgba(74,222,128,.15)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:'28px'}}>✓</div>
              <h3 style={{fontSize:'16px',fontWeight:'700',color:'#fff',margin:'0 0 8px'}}>Fjalëkalimi u ndryshua!</h3>
              <p style={{fontSize:'12px',color:'#888',margin:'0 0 20px'}}>Tani mund të hyni me fjalëkalimin e ri.</p>
              <a href="/login" style={{display:'block',padding:'13px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',borderRadius:'12px',color:'#0a0a0f',fontSize:'14px',fontWeight:'800',textDecoration:'none',textAlign:'center'}}>
                Hyr tani →
              </a>
            </div>
          ) : error && !ready ? (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{fontSize:'36px',marginBottom:'12px'}}>⚠️</div>
              <p style={{fontSize:'13px',color:'#f87171',margin:'0 0 16px'}}>{error}</p>
              <a href="/login" style={{display:'block',padding:'12px',background:'rgba(201,168,76,.15)',border:'1px solid rgba(201,168,76,.3)',borderRadius:'12px',color:'#c9a84c',fontSize:'13px',fontWeight:'700',textDecoration:'none',textAlign:'center'}}>
                ← Kthehu te Hyrja
              </a>
            </div>
          ) : (
            <form onSubmit={handleReset} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <p style={{fontSize:'12px',color:'#888',margin:'0 0 8px',textAlign:'center'}}>
                {ready ? 'Vendosni fjalëkalimin tuaj të ri' : '⏳ Duke ngarkuar...'}
              </p>
              <div>
                <label style={{display:'block',fontSize:'10px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:'6px'}}>Fjalëkalimi i Ri</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)}
                  placeholder="Minimum 6 karaktere" required autoFocus
                  style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'12px',color:'#fff',fontSize:'14px',boxSizing:'border-box' as const,fontFamily:'inherit',outline:'none'}}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'10px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:'6px'}}>Konfirmo Fjalëkalimin</label>
                <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)}
                  placeholder="Përsërit fjalëkalimin" required
                  style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'12px',color:'#fff',fontSize:'14px',boxSizing:'border-box' as const,fontFamily:'inherit',outline:'none'}}/>
              </div>
              {error && <div style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.3)',borderRadius:'10px',padding:'10px',fontSize:'12px',color:'#f87171'}}>{error}</div>}
              <button type="submit" disabled={loading||!password||!confirm}
                style={{padding:'13px',background:ready?'linear-gradient(135deg,#c9a84c,#f0c060)':'rgba(201,168,76,.3)',border:'none',borderRadius:'12px',color:'#0a0a0f',fontSize:'14px',fontWeight:'800',cursor:ready?'pointer':'not-allowed',opacity:loading?0.7:1,fontFamily:'inherit'}}>
                {loading?'Duke ruajtur...':ready?'Ruaj Fjalëkalimin ✓':'Duke ngarkuar...'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
