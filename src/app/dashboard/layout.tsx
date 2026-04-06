'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard', label: 'Panel', icon: '⬡' },
  { href: '/dashboard/transactions', label: 'TX', icon: '⇄' },
  { href: '/dashboard/import-review', label: 'Import', icon: '↑' },
  { href: '/dashboard/loans', label: 'Kredi', icon: '◈' },
  { href: '/dashboard/investments', label: 'Invest', icon: '▲' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const path = usePathname()
  const [user, setUser] = useState<{email?:string}|null>(null)
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login'); return }
      setUser(data.user)
      setLoading(false)
    })
  }, [router])

  const logout = async () => {
    await createClient().auth.signOut()
    router.replace('/login')
  }

  if (loading) return (
    <div style={{minHeight:'100vh',background:'#0a0a0f',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'16px'}}>
      <div className="spinner"></div>
      <p style={{color:'#c9a84c',fontSize:'11px',letterSpacing:'3px',textTransform:'uppercase'}}>InRight</p>
    </div>
  )

  return (
    <div style={{maxWidth:'430px',margin:'0 auto',minHeight:'100vh',background:'#0a0a0f',display:'flex',flexDirection:'column',position:'relative'}}>
      {/* TOP BAR */}
      <div style={{background:'rgba(10,10,15,.95)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(201,168,76,.15)',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:20}}>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <div style={{width:'28px',height:'28px',background:'linear-gradient(135deg,#c9a84c,#8b5e0a)',borderRadius:'8px',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:'#fff',fontWeight:'800',fontSize:'12px'}}>IR</span>
          </div>
          <span style={{fontSize:'15px',fontWeight:'700',background:'linear-gradient(135deg,#fff,#c9a84c)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>InRight</span>
        </div>
        <div style={{position:'relative'}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{background:'rgba(201,168,76,.1)',border:'1px solid rgba(201,168,76,.2)',borderRadius:'10px',padding:'6px 12px',color:'#c9a84c',fontSize:'11px',cursor:'pointer',display:'flex',alignItems:'center',gap:'6px'}}>
            <span style={{fontSize:'10px',opacity:.7}}>{user?.email?.split('@')[0]}</span>
            <span>{menuOpen?'▲':'▼'}</span>
          </button>
          {menuOpen && (
            <div style={{position:'absolute',right:0,top:'36px',background:'#1a1a24',border:'1px solid rgba(201,168,76,.2)',borderRadius:'12px',padding:'8px',minWidth:'160px',zIndex:30}}>
              <div style={{padding:'8px 10px',borderBottom:'1px solid rgba(255,255,255,.06)',marginBottom:'6px'}}>
                <p style={{fontSize:'11px',color:'#c9a84c',margin:'0 0 2px'}}>F4Invest</p>
                <p style={{fontSize:'10px',color:'#606070',margin:0}}>{user?.email}</p>
              </div>
              <button onClick={logout} style={{width:'100%',padding:'8px 10px',background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.2)',borderRadius:'8px',color:'#f87171',fontSize:'12px',cursor:'pointer',textAlign:'left'}}>
                ⎋ Dilni
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflowY:'auto',paddingBottom:'72px'}} onClick={()=>setMenuOpen(false)}>
        {children}
      </div>

      {/* BOTTOM NAV */}
      <nav style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',background:'rgba(10,10,15,.98)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(201,168,76,.15)',display:'flex',zIndex:20}}>
        {NAV.map(({href,label,icon})=>{
          const active = path===href||(href!=='/dashboard'&&path.startsWith(href))
          return (
            <Link key={href} href={href} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'10px 2px 12px',borderTop:`2px solid ${active?'#c9a84c':'transparent'}`,transition:'all .2s'}}>
              <span style={{fontSize:'16px',lineHeight:1,color:active?'#c9a84c':'#606070'}}>{icon}</span>
              <span style={{fontSize:'9px',marginTop:'3px',fontWeight:active?'700':'400',color:active?'#c9a84c':'#606070',letterSpacing:'.3px'}}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
