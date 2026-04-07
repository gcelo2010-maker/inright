'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const NAV = [
  { href:'/dashboard', icon:'◈', label:'Paneli' },
  { href:'/dashboard/transactions', icon:'⇄', label:'TX' },
  { href:'/dashboard/import-review', icon:'⬆', label:'Importi' },
  { href:'/dashboard/detyrimet', icon:'⬡', label:'Detyrimet' },
  { href:'/dashboard/investments', icon:'◆', label:'Invest' },
  { href:'/dashboard/settings', icon:'⚙', label:'Settings' },
]

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const path = usePathname()
  const [user, setUser] = useState<{email?:string}|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()
    sb.auth.getUser().then(({data}) => {
      if (!data.user) { router.replace('/login') }
      else { setUser(data.user); setLoading(false) }
    })
  }, [router])

  if (loading) return (
    <div style={{background:'#0a0a0f',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',flexDirection:'column',gap:'16px'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:.4}50%{opacity:1}}`}</style>
      <div style={{width:'44px',height:'44px',border:'2px solid #c9a84c30',borderTop:'2px solid #c9a84c',borderRadius:'50%',animation:'spin .8s linear infinite'}}></div>
      <p style={{color:'#c9a84c',fontSize:'11px',letterSpacing:'3px',textTransform:'uppercase',animation:'pulse 2s infinite'}}>InRight</p>
    </div>
  )

  return (
    <div style={{background:'#0a0a0f',minHeight:'100vh',maxWidth:'430px',margin:'0 auto',display:'flex',flexDirection:'column',position:'relative'}}>
      <style>{`
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:translateY(0)}}
        .au{animation:fadeUp .45s ease forwards;opacity:0}
        *{-webkit-tap-highlight-color:transparent;scrollbar-width:none}
        *::-webkit-scrollbar{display:none}
        input,select,textarea{background:rgba(255,255,255,.06)!important;color:#fff!important;border:1px solid rgba(255,255,255,.12)!important;border-radius:10px!important;padding:10px 12px!important;font-size:13px!important;width:100%!important;box-sizing:border-box!important;font-family:inherit!important;}
        input::placeholder{color:#444!important}
        option{background:#111!important;color:#fff!important}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(1);opacity:.4}
      `}</style>

      {/* TOPBAR */}
      <div style={{background:'rgba(10,10,15,0.97)',backdropFilter:'blur(20px)',borderBottom:'1px solid rgba(201,168,76,0.15)',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:20}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'32px',height:'32px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:'#0a0a0f',fontWeight:'800',fontSize:'14px'}}>IR</span>
          </div>
          <div>
            <span style={{fontSize:'15px',fontWeight:'700',color:'#fff',letterSpacing:'-0.3px'}}>InRight</span>
            <span style={{fontSize:'9px',color:'#c9a84c',marginLeft:'6px',textTransform:'uppercase',letterSpacing:'1px'}}>F4Invest</span>
          </div>
        </div>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <span style={{fontSize:'10px',color:'#555',maxWidth:'120px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{user?.email}</span>
          <button onClick={async()=>{await createClient().auth.signOut();router.replace('/login')}}
            style={{fontSize:'10px',color:'#c9a84c',border:'1px solid rgba(201,168,76,0.3)',background:'transparent',padding:'4px 10px',borderRadius:'20px',cursor:'pointer',fontFamily:'inherit'}}>
            Dilni
          </button>
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflowY:'auto',paddingBottom:'72px'}}>
        {children}
      </div>

      {/* BOTTOM NAV */}
      <nav style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',background:'rgba(10,10,15,0.97)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(201,168,76,0.15)',display:'flex',zIndex:20}}>
        {NAV.map(({href,icon,label})=>{
          const active = href==='/dashboard'?path===href:path.startsWith(href)
          return (
            <Link key={href} href={href} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'10px 4px 12px',textDecoration:'none',borderTop:`2px solid ${active?'#c9a84c':'transparent'}`,transition:'all .15s'}}>
              <span style={{fontSize:'16px',color:active?'#c9a84c':'#333',lineHeight:1}}>{icon}</span>
              <span style={{fontSize:'8px',color:active?'#c9a84c':'#333',marginTop:'3px',fontWeight:active?'700':'400',letterSpacing:'.3px'}}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
