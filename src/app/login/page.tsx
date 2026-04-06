'use client'
export const dynamic = 'force-dynamic'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) {
        setError('Email ose fjalëkalim i gabuar.')
      } else {
        window.location.href = '/dashboard'
      }
    } catch {
      setError('Gabim lidhje. Provoni përsëri.')
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
          <h1 style={{fontSize:'22px',fontWeight:'600',color:'#111',letterSpacing:'-0.5px',margin:0}}>InRight</h1>
          <p style={{fontSize:'13px',color:'#6b7280',marginTop:'4px'}}>Menaxhim financiar për partnerë</p>
        </div>
        <div style={{background:'#fff',borderRadius:'16px',border:'1px solid #e5e7eb',padding:'24px'}}>
          <h2 style={{fontSize:'15px',fontWeight:'500',color:'#111',marginBottom:'4px',marginTop:0}}>Hyni në llogarinë tuaj</h2>
          <form onSubmit={handleLogin} style={{display:'flex',flexDirection:'column',gap:'12px',marginTop:'16px'}}>
            <div>
              <label style={{display:'block',fontSize:'11px',fontWeight:'500',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'6px'}}>Email</label>
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="emri@gmail.com" required
                style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'10px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
            </div>
            <div>
              <label style={{display:'block',fontSize:'11px',fontWeight:'500',color:'#6b7280',textTransform:'uppercase',letterSpacing:'0.5px',marginBottom:'6px'}}>Fjalëkalimi</label>
              <input type="password" value={password} onChange={e=>setPassword(e.target.value)} placeholder="••••••••" required
                style={{width:'100%',padding:'10px 12px',border:'1px solid #e5e7eb',borderRadius:'10px',fontSize:'14px',outline:'none',boxSizing:'border-box'}}/>
            </div>
            {error && <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:'8px',padding:'8px 12px',fontSize:'12px',color:'#dc2626'}}>{error}</div>}
            <button type="submit" disabled={loading||!email||!password}
              style={{background:loading?'#6b7280':'#111',color:'#fff',border:'none',borderRadius:'10px',padding:'12px',fontSize:'14px',fontWeight:'500',cursor:'pointer',marginTop:'4px'}}>
              {loading?'Duke hyrë...':'Hyr'}
            </button>
          </form>
        </div>
        <p style={{textAlign:'center',fontSize:'11px',color:'#9ca3af',marginTop:'16px'}}>
          🔒 Fjalëkalimi fillestar: <strong>InRight2026!</strong>
        </p>
      </div>
    </div>
  )
}
