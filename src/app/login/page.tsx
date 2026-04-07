'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [mode, setMode] = useState<'password'|'magic'>('password')
  const [sent, setSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true); setError('')
    const sb = createClient()

    if (mode === 'password') {
      const { error } = await sb.auth.signInWithPassword({ email, password })
      if (error) setError('Email ose fjalëkalim i gabuar.')
      else window.location.href = '/dashboard'
    } else {
      const { error } = await sb.auth.signInWithOtp({
        email,
        options: { emailRedirectTo: `${window.location.origin}/auth/callback` }
      })
      if (error) setError('Gabim: ' + error.message)
      else setSent(true)
    }
    setLoading(false)
  }

  if (sent) return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{textAlign:'center',maxWidth:'320px'}}>
        <div style={{fontSize:'48px',marginBottom:'16px'}}>✉️</div>
        <h2 style={{fontSize:'20px',fontWeight:'800',color:'#fff',margin:'0 0 8px'}}>Linku u dërgua!</h2>
        <p style={{fontSize:'13px',color:'#888',margin:'0 0 20px'}}>Kontrolloni <strong style={{color:'#c9a84c'}}>{email}</strong> dhe klikoni linkun.</p>
        <button onClick={()=>{setSent(false);setEmail('')}} style={{fontSize:'12px',color:'#c9a84c',border:'1px solid rgba(201,168,76,.3)',background:'transparent',padding:'8px 20px',borderRadius:'20px',cursor:'pointer',fontFamily:'inherit'}}>← Kthehu</button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <div style={{width:'100%',maxWidth:'360px'}}>
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'60px',height:'60px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',borderRadius:'16px',marginBottom:'12px'}}>
            <span style={{color:'#0a0a0f',fontWeight:'900',fontSize:'22px'}}>IR</span>
          </div>
          <h1 style={{fontSize:'24px',fontWeight:'800',color:'#fff',letterSpacing:'-0.5px',margin:'0 0 4px'}}>InRight</h1>
          <p style={{fontSize:'12px',color:'#555',margin:0}}>F4Invest · Menaxhim Financiar</p>
        </div>

        {/* Mode toggle */}
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginBottom:'20px',background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'12px',padding:'4px'}}>
          {[['password','🔑 Fjalëkalim'],['magic','✉️ Magic Link']].map(([m,lbl])=>(
            <button key={m} onClick={()=>setMode(m as 'password'|'magic')}
              style={{padding:'8px',borderRadius:'9px',border:'none',fontSize:'12px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit',transition:'all .15s',
                background:mode===m?'rgba(201,168,76,.2)':'transparent',
                color:mode===m?'#c9a84c':'#555'}}>
              {lbl}
            </button>
          ))}
        </div>

        <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'16px',padding:'20px'}}>
          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
            <div>
              <label style={{display:'block',fontSize:'9px',fontWeight:'600',color:'#888',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="emri@gmail.com" required
                style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'10px',color:'#fff',fontSize:'14px',boxSizing:'border-box' as const,fontFamily:'inherit'}}/>
            </div>
            {mode==='password' && (
              <div>
                <label style={{display:'block',fontSize:'9px',fontWeight:'600',color:'#888',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'6px'}}>Fjalëkalimi</label>
                <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                  style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.12)',borderRadius:'10px',color:'#fff',fontSize:'14px',boxSizing:'border-box' as const,fontFamily:'inherit'}}/>
              </div>
            )}
            {error && <div style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.3)',borderRadius:'10px',padding:'10px',fontSize:'12px',color:'#f87171'}}>{error}</div>}
            {mode==='magic' && <p style={{fontSize:'11px',color:'#555',margin:0,textAlign:'center'}}>Do të merrni një link hyrjeje në email</p>}
            <button type="submit" disabled={loading||!email||(mode==='password'&&!password)}
              style={{padding:'13px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',border:'none',borderRadius:'12px',color:'#0a0a0f',fontSize:'14px',fontWeight:'800',cursor:'pointer',marginTop:'4px',fontFamily:'inherit'}}>
              {loading?'Duke hyrë...':(mode==='password'?'Hyr':'Dërgo Link')}
            </button>
          </form>
        </div>

        <p style={{textAlign:'center',fontSize:'11px',color:'#333',marginTop:'16px'}}>🔒 Akses vetëm për partnerët e autorizuar</p>
      </div>
    </div>
  )
}
