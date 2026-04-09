'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'

const SB = 'https://bzlausfgpfvhqhbkddxe.supabase.co'
const AK = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImJ6bGF1c2ZncGZ2aHFoYmtkZHhlIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzU0NjcyMjEsImV4cCI6MjA5MTA0MzIyMX0.o8TlF7m2bYwziyQu17wHLQFjDU9zzAmKut-E20EWpeM'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch(`${SB}/rest/v1/app_users?username=eq.${username.toLowerCase().trim()}&is_active=eq.true`, {
        headers: { 'apikey': AK, 'Authorization': `Bearer ${AK}` }
      })
      const users = await res.json()

      if (!users || users.length === 0) {
        setError('Përdoruesi nuk u gjet')
        setLoading(false)
        return
      }

      const user = users[0]
      if (user.password !== password) {
        setError('Fjalëkalim i gabuar')
        setLoading(false)
        return
      }

      // Ruaj session në localStorage
      localStorage.setItem('inright_user', JSON.stringify({
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        role: user.role,
        logged_at: Date.now()
      }))

      window.location.href = '/dashboard'
    } catch {
      setError('Gabim lidhje. Provoni përsëri.')
    }
    setLoading(false)
  }

  return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',padding:'1rem'}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}} input{outline:none;}`}</style>
      <div style={{width:'100%',maxWidth:'360px',animation:'fadeUp .5s ease forwards'}}>

        {/* LOGO */}
        <div style={{textAlign:'center',marginBottom:'28px'}}>
          <div style={{display:'inline-flex',alignItems:'center',justifyContent:'center',width:'64px',height:'64px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',borderRadius:'20px',marginBottom:'14px'}}>
            <span style={{color:'#0a0a0f',fontWeight:'800',fontSize:'24px'}}>IR</span>
          </div>
          <h1 style={{fontSize:'26px',fontWeight:'800',color:'#fff',letterSpacing:'-0.5px',margin:'0 0 4px'}}>InRight</h1>
          <p style={{fontSize:'12px',color:'#444',margin:0,letterSpacing:'.5px'}}>F4Invest · Menaxhim Financiar</p>
        </div>

        {/* CARD */}
        <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'20px',padding:'28px'}}>
          <p style={{fontSize:'13px',color:'#888',margin:'0 0 20px',textAlign:'center'}}>Hyni me emrin dhe fjalëkalimin tuaj</p>

          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'14px'}}>
            <div>
              <label style={{display:'block',fontSize:'10px',color:'#666',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'7px'}}>
                Emri i Përdoruesit
              </label>
              <input
                type="text"
                value={username}
                onChange={e=>setUsername(e.target.value)}
                placeholder="genti  /  eraldo"
                required
                autoCapitalize="none"
                autoComplete="username"
                style={{width:'100%',padding:'13px 16px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'12px',color:'#fff',fontSize:'15px',boxSizing:'border-box' as const,fontFamily:'inherit',letterSpacing:'.5px'}}
              />
            </div>

            <div>
              <label style={{display:'block',fontSize:'10px',color:'#666',textTransform:'uppercase',letterSpacing:'1px',marginBottom:'7px'}}>
                Fjalëkalimi
              </label>
              <input
                type="password"
                value={password}
                onChange={e=>setPassword(e.target.value)}
                placeholder="••••••••••"
                required
                autoComplete="current-password"
                style={{width:'100%',padding:'13px 16px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'12px',color:'#fff',fontSize:'15px',boxSizing:'border-box' as const,fontFamily:'inherit'}}
              />
            </div>

            {error && (
              <div style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.25)',borderRadius:'10px',padding:'11px 14px',fontSize:'13px',color:'#f87171',textAlign:'center'}}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading||!username||!password}
              style={{padding:'14px',background:loading||!username||!password?'rgba(201,168,76,.3)':'linear-gradient(135deg,#c9a84c,#f0c060)',border:'none',borderRadius:'12px',color:'#0a0a0f',fontSize:'15px',fontWeight:'800',cursor:loading||!username||!password?'not-allowed':'pointer',marginTop:'4px',fontFamily:'inherit',letterSpacing:'.3px'}}>
              {loading ? 'Duke hyrë...' : 'Hyr →'}
            </button>
          </form>
        </div>

        {/* USERS HINT */}
        <div style={{marginTop:'16px',display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          {[
            {name:'Genti Celo',user:'genti',role:'Admin',color:'#c9a84c'},
            {name:'Eraldo Mene',user:'eraldo',role:'Partner',color:'#a78bfa'},
          ].map(u=>(
            <button key={u.user} onClick={()=>{setUsername(u.user);setError('')}}
              style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.06)',borderRadius:'12px',padding:'10px',cursor:'pointer',fontFamily:'inherit',textAlign:'left' as const}}>
              <p style={{fontSize:'12px',fontWeight:'700',color:'#fff',margin:'0 0 2px'}}>{u.name}</p>
              <p style={{fontSize:'10px',color:u.color,margin:0}}>{u.user} · {u.role}</p>
            </button>
          ))}
        </div>

        <p style={{textAlign:'center',fontSize:'11px',color:'#333',marginTop:'16px'}}>
          🔒 Akses vetëm për partnerët e autorizuar
        </p>
      </div>
    </div>
  )
}
