'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [mode, setMode] = useState<'password'|'magic'>('password')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)
  const [error, setError] = useState('')

  const handlePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const sb = createClient()
      const { error } = await sb.auth.signInWithPassword({ email, password })
      if (error) setError('Email ose fjalëkalim i gabuar.')
      else window.location.href = '/dashboard'
    } catch { setError('Gabim lidhje. Provoni përsëri.') }
    setLoading(false)
  }

  const handleMagic = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    try {
      const sb = createClient()
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) setError('Gabim: ' + error.message)
      else setSent(true)
    } catch { setError('Gabim lidhje.') }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} .au{animation:fadeUp .5s ease forwards}`}</style>
      <div style={{width:'100%',maxWidth:'360px'}} className="au">

        {/* LOGO */}
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'60px',height:'60px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',borderRadius:'18px',marginBottom:'14px'}}>
            <span style={{color:'#0a0a0f',fontWeight:'800',fontSize:'22px'}}>IR</span>
          </div>
          <h1 style={{fontSize:'24px',fontWeight:'800',color:'#fff',letterSpacing:'-0.5px',margin:'0 0 4px'}}>InRight</h1>
          <p style={{fontSize:'12px',color:'#555',margin:0,letterSpacing:'.5px'}}>Menaxhim financiar për partnerë</p>
        </div>

        {/* CARD */}
        <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.09)',borderRadius:'20px',padding:'24px',backdropFilter:'blur(10px)'}}>

          {/* MODE TOGGLE */}
          <div style={{display:'flex',gap:'6px',background:'rgba(255,255,255,.06)',borderRadius:'12px',padding:'4px',marginBottom:'20px'}}>
            <button onClick={()=>{setMode('password');setError('');setSent(false)}}
              style={{flex:1,padding:'8px',borderRadius:'9px',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:'600',fontFamily:'inherit',
                background:mode==='password'?'#c9a84c':'transparent',color:mode==='password'?'#0a0a0f':'#666',transition:'all .2s'}}>
              🔑 Fjalëkalim
            </button>
            <button onClick={()=>{setMode('magic');setError('');setSent(false)}}
              style={{flex:1,padding:'8px',borderRadius:'9px',border:'none',cursor:'pointer',fontSize:'12px',fontWeight:'600',fontFamily:'inherit',
                background:mode==='magic'?'#c9a84c':'transparent',color:mode==='magic'?'#0a0a0f':'#666',transition:'all .2s'}}>
              ✉️ Magic Link
            </button>
          </div>

          {sent ? (
            <div style={{textAlign:'center',padding:'16px 0'}}>
              <div style={{width:'56px',height:'56px',background:'rgba(74,222,128,.15)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 14px',fontSize:'24px'}}>✓</div>
              <h3 style={{fontSize:'16px',fontWeight:'700',color:'#fff',margin:'0 0 8px'}}>Linku u dërgua!</h3>
              <p style={{fontSize:'12px',color:'#888',margin:'0 0 16px',lineHeight:1.5}}>Kontrolloni <strong style={{color:'#c9a84c'}}>{email}</strong> dhe klikoni linkun për të hyrë.</p>
              <button onClick={()=>{setSent(false);setEmail('')}} style={{fontSize:'12px',color:'#c9a84c',border:'1px solid rgba(201,168,76,.3)',background:'transparent',padding:'8px 18px',borderRadius:'20px',cursor:'pointer'}}>
                Provoni email tjetër
              </button>
            </div>
          ) : mode==='password' ? (
            <form onSubmit={handlePassword} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <div>
                <label style={{display:'block',fontSize:'10px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:'6px'}}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="emri@gmail.com" required
                  style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'12px',color:'#fff',fontSize:'14px',boxSizing:'border-box' as const,fontFamily:'inherit',outline:'none'}}/>
              </div>
              <div>
                <label style={{display:'block',fontSize:'10px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:'6px'}}>Fjalëkalimi</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                  style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'12px',color:'#fff',fontSize:'14px',boxSizing:'border-box' as const,fontFamily:'inherit',outline:'none'}}/>
              </div>
              {error && <div style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.2)',borderRadius:'10px',padding:'10px 12px',fontSize:'12px',color:'#f87171'}}>{error}</div>}
              <button type="submit" disabled={loading||!email||!password}
                style={{padding:'13px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',border:'none',borderRadius:'12px',color:'#0a0a0f',fontSize:'14px',fontWeight:'800',cursor:'pointer',marginTop:'4px',opacity:loading||!email||!password?.length?.toString?1:1}}>
                {loading?'Duke hyrë...':'Hyr'}
              </button>
              <button type="button" onClick={()=>setMode('magic')}
                style={{background:'none',border:'none',color:'#555',fontSize:'12px',cursor:'pointer',textAlign:'center' as const,padding:'4px'}}>
                Keni harruar fjalëkalimin? → Përdorni Magic Link
              </button>
            </form>
          ) : (
            <form onSubmit={handleMagic} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
              <p style={{fontSize:'12px',color:'#888',margin:'0 0 4px',lineHeight:1.5,textAlign:'center' as const}}>
                Vendosni emailin tuaj dhe do të merrni një link hyrjeje direkt.
              </p>
              <div>
                <label style={{display:'block',fontSize:'10px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',marginBottom:'6px'}}>Email</label>
                <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="emri@gmail.com" required
                  style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'12px',color:'#fff',fontSize:'14px',boxSizing:'border-box' as const,fontFamily:'inherit',outline:'none'}}/>
              </div>
              {error && <div style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.2)',borderRadius:'10px',padding:'10px 12px',fontSize:'12px',color:'#f87171'}}>{error}</div>}
              <button type="submit" disabled={loading||!email}
                style={{padding:'13px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',border:'none',borderRadius:'12px',color:'#0a0a0f',fontSize:'14px',fontWeight:'800',cursor:'pointer'}}>
                {loading?'Duke dërguar...':'Dërgo Link Hyrjeje'}
              </button>
            </form>
          )}
        </div>

        <p style={{textAlign:'center' as const,fontSize:'11px',color:'#333',marginTop:'16px',letterSpacing:'.5px'}}>
          🔒 Akses vetëm për partnerët e autorizuar
        </p>
      </div>
    </div>
  )
}
