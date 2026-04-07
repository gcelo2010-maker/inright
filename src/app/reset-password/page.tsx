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
  const [checking, setChecking] = useState(true)

  useEffect(() => {
    const sb = createClient()
    
    // Lexo hash nga URL — Supabase e vendos session nga #access_token
    const hashParams = new URLSearchParams(window.location.hash.slice(1))
    const accessToken = hashParams.get('access_token')
    const refreshToken = hashParams.get('refresh_token')
    const type = hashParams.get('type')

    if (accessToken && type === 'recovery') {
      // Vendos session manualisht
      sb.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken || ''
      }).then(({ error }) => {
        if (!error) setReady(true)
        else setError('Linku ka skaduar. Kërkoni rivendosje të re.')
        setChecking(false)
      })
    } else {
      // Provo nga session ekzistues
      sb.auth.getSession().then(({ data }) => {
        if (data.session) setReady(true)
        else setError('Linku ka skaduar ose nuk është valid.')
        setChecking(false)
      })
    }

    // Dëgjo ndryshimet e auth
    sb.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true)
        setChecking(false)
      }
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
          <p style={{fontSize:'12px',color:'#555',margin:0}}>Rivendos fjalëkalimin</p>
        </div>

        <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.09)',borderRadius:'20px',padding:'24px'}}>
          {checking ? (
            <div style={{textAlign:'center',padding:'20px'}}>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
              <div style={{width:'32px',height:'32px',border:'2px solid rgba(201,168,76,.3)',borderTop:'2px solid #c9a84c',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 12px'}}></div>
              <p style={{color:'#888',fontSize:'12px',margin:0}}>Duke verifikuar linkun...</p>
            </div>
          ) : done ? (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{width:'56px',height:'56px',background:'rgba(74,222,128,.15)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:'24px'}}>✓</div>
              <h3 style={{fontSize:'16px',fontWeight:'700',color:'#fff',margin:'0 0 8px'}}>Fjalëkalimi u ndryshua!</h3>
              <p style={{fontSize:'12px',color:'#888',margin:'0 0 20px'}}>Tani mund të hyni me fjalëkalimin e ri.</p>
              <a href="/login" style={{display:'block',padding:'13px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',borderRadius:'12px',color:'#0a0a0f',fontSize:'14px',fontWeight:'800',textDecoration:'none',textAlign:'center'}}>
                Hyr tani →
              </a>
            </div>
          ) : !ready && error ? (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{fontSize:'36px',marginBottom:'12px'}}>⚠️</div>
              <p style={{fontSize:'13px',color:'#f87171',margin:'0 0 16px'}}>{error}</p>
              <a href="/login" style={{display:'block',padding:'12px',background:'rgba(201,168,76,.15)',border:'1px solid rgba(201,168,76,.3)',borderRadius:'12px',color:'#c9a84c',fontSize:'13px',fontWeight:'700',textDecoration:'none',textAlign:'center'}}>
                ← Kthehu te Hyrja
              </a>
            </div>
          ) : (
            <form onSubmit={handleReset} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <p style={{fontSize:'12px',color:'#888',margin:'0 0 4px',textAlign:'center'}}>Vendosni fjalëkalimin tuaj të ri</p>
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
              {error && (
                <div style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.3)',borderRadius:'10px',padding:'10px',fontSize:'12px',color:'#f87171'}}>{error}</div>
              )}
              <button type="submit" disabled={loading||!password||!confirm}
                style={{padding:'13px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',border:'none',borderRadius:'12px',color:'#0a0a0f',fontSize:'14px',fontWeight:'800',cursor:'pointer',opacity:loading?0.7:1,fontFamily:'inherit'}}>
                {loading?'Duke ruajtur...':'Ruaj Fjalëkalimin ✓'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}
