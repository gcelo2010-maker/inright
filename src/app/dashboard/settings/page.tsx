'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'

export default function Settings() {
  const [newPass, setNewPass] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [msg, setMsg] = useState('')
  const [err, setErr] = useState('')

  const handleChange = async (e: React.FormEvent) => {
    e.preventDefault()
    setErr(''); setMsg('')
    if (newPass.length < 6) { setErr('Fjalëkalimi duhet të jetë të paktën 6 karaktere'); return }
    if (newPass !== confirm) { setErr('Fjalëkalimet nuk përputhen'); return }
    setLoading(true)
    const sb = createClient()
    const { error } = await sb.auth.updateUser({ password: newPass })
    if (error) setErr('Gabim: ' + error.message)
    else { setMsg('✓ Fjalëkalimi u ndryshua me sukses!'); setNewPass(''); setConfirm('') }
    setLoading(false)
  }

  return (
    <div style={{padding:'20px 16px',minHeight:'100vh'}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .au{animation:fadeUp .4s ease forwards;opacity:0}`}</style>

      <div className="au" style={{marginBottom:'24px'}}>
        <p style={{fontSize:'10px',color:'#c9a84c',textTransform:'uppercase',letterSpacing:'2px',margin:'0 0 4px'}}>Llogaria</p>
        <h1 style={{fontSize:'26px',fontWeight:'800',letterSpacing:'-1px',margin:0,background:'linear-gradient(135deg,#fff 0%,#c9a84c 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Cilësimet</h1>
      </div>

      <div className="au" style={{background:'rgba(201,168,76,.05)',border:'1px solid rgba(201,168,76,.2)',borderRadius:'16px',padding:'20px',animationDelay:'.08s'}}>
        <p style={{fontSize:'13px',fontWeight:'700',color:'#c9a84c',textTransform:'uppercase',letterSpacing:'1px',margin:'0 0 16px'}}>🔑 Ndrysho Fjalëkalimin</p>
        <form onSubmit={handleChange} style={{display:'flex',flexDirection:'column',gap:'12px'}}>
          <div>
            <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 6px'}}>Fjalëkalimi i Ri</p>
            <input type="password" value={newPass} onChange={e=>setNewPass(e.target.value)} placeholder="Min. 6 karaktere" required
              style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.15)',borderRadius:'12px',color:'#fff',fontSize:'14px',boxSizing:'border-box' as const,fontFamily:'inherit'}}/>
          </div>
          <div>
            <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 6px'}}>Konfirmo Fjalëkalimin</p>
            <input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} placeholder="Përsërit fjalëkalimin" required
              style={{width:'100%',padding:'11px 14px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.15)',borderRadius:'12px',color:'#fff',fontSize:'14px',boxSizing:'border-box' as const,fontFamily:'inherit'}}/>
          </div>
          {err && <div style={{background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.3)',borderRadius:'10px',padding:'10px 14px',fontSize:'12px',color:'#f87171'}}>{err}</div>}
          {msg && <div style={{background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.3)',borderRadius:'10px',padding:'10px 14px',fontSize:'12px',color:'#4ade80'}}>{msg}</div>}
          <button type="submit" disabled={loading||!newPass||!confirm}
            style={{padding:'13px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',border:'none',borderRadius:'12px',color:'#0a0a0f',fontSize:'14px',fontWeight:'800',cursor:'pointer',marginTop:'4px',fontFamily:'inherit',opacity:loading||!newPass||!confirm?.5:1}}>
            {loading?'Duke ndryshuar...':'Ndrysho Fjalëkalimin'}
          </button>
        </form>
      </div>

      <div className="au" style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'16px',padding:'16px',marginTop:'14px',animationDelay:'.16s'}}>
        <p style={{fontSize:'11px',fontWeight:'700',color:'#fff',margin:'0 0 12px',textTransform:'uppercase',letterSpacing:'.8px'}}>ℹ️ Kredencialet Aktuale</p>
        <div style={{display:'flex',flexDirection:'column',gap:'8px'}}>
          {[['Genti Celo (Admin)','gcelo2010@gmail.com'],['Eraldo Mene (Partner)','eraldomene85@gmail.com']].map(([name,email])=>(
            <div key={email} style={{background:'rgba(255,255,255,.04)',borderRadius:'10px',padding:'10px 12px',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <p style={{fontSize:'12px',fontWeight:'600',color:'#fff',margin:'0 0 2px'}}>{name}</p>
                <p style={{fontSize:'10px',color:'#555',margin:0}}>{email}</p>
              </div>
              <span style={{fontSize:'10px',background:'rgba(201,168,76,.15)',color:'#c9a84c',padding:'3px 10px',borderRadius:'20px',fontWeight:'600'}}>Partner</span>
            </div>
          ))}
        </div>
        <p style={{fontSize:'11px',color:'#444',margin:'12px 0 0',textAlign:'center'}}>Hyni me emailin tuaj → Cilësimet → Ndryshoni fjalëkalimin</p>
      </div>
    </div>
  )
}
