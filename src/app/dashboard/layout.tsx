'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const NAV = [
  { href:'/dashboard',               icon:'⊞', label:'Paneli' },
  { href:'/dashboard/import-review', icon:'↑', label:'Importi' },
  { href:'/dashboard/transactions',  icon:'⇄', label:'Transaksione' },
  { href:'/dashboard/loans',         icon:'🏦', label:'Kreditë' },
  { href:'/dashboard/investments',   icon:'📈', label:'Investimet' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const path = usePathname()
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(true)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) { router.replace('/login') }
      else { setEmail(data.user.email||''); setLoading(false) }
    })
  }, [router])

  const logout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#f9fafb'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:'40px',height:'40px',background:'#111',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
          <span style={{color:'#fff',fontWeight:'700',fontSize:'16px'}}>IR</span>
        </div>
        <div style={{width:'24px',height:'24px',border:'2px solid #e5e7eb',borderTopColor:'#111',borderRadius:'50%',animation:'spin .7s linear infinite',margin:'0 auto'}}/>
        <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      </div>
    </div>
  )

  const initials = email.substring(0,2).toUpperCase()

  return (
    <div style={{maxWidth:'430px',margin:'0 auto',minHeight:'100vh',background:'#f9fafb',display:'flex',flexDirection:'column',position:'relative'}}>

      {/* TOPBAR */}
      <div style={{background:'#fff',borderBottom:'1px solid #f3f4f6',padding:'12px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:30,boxShadow:'0 1px 3px rgba(0,0,0,.04)'}}>
        <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
          <div style={{width:'32px',height:'32px',background:'#111',borderRadius:'9px',display:'flex',alignItems:'center',justifyContent:'center'}}>
            <span style={{color:'#fff',fontWeight:'700',fontSize:'13px'}}>IR</span>
          </div>
          <span style={{fontSize:'16px',fontWeight:'700',color:'#111',letterSpacing:'-0.5px'}}>InRight</span>
        </div>
        <div style={{position:'relative'}}>
          <button onClick={()=>setMenuOpen(!menuOpen)} style={{width:'36px',height:'36px',borderRadius:'50%',background:'#111',color:'#fff',border:'none',cursor:'pointer',fontSize:'13px',fontWeight:'600',display:'flex',alignItems:'center',justifyContent:'center'}}>
            {initials}
          </button>
          {menuOpen && (
            <div style={{position:'absolute',right:0,top:'44px',background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',boxShadow:'0 4px 20px rgba(0,0,0,.1)',width:'200px',zIndex:50,overflow:'hidden'}}>
              <div style={{padding:'12px 14px',borderBottom:'1px solid #f3f4f6'}}>
                <div style={{fontSize:'11px',color:'#9ca3af',marginBottom:'2px'}}>Identifikuar si</div>
                <div style={{fontSize:'12px',fontWeight:'500',color:'#111',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{email}</div>
              </div>
              <button onClick={logout} style={{width:'100%',padding:'12px 14px',textAlign:'left',border:'none',background:'none',cursor:'pointer',fontSize:'13px',color:'#ef4444',fontFamily:'inherit',display:'flex',alignItems:'center',gap:'8px'}}>
                <span>🚪</span> Dilni
              </button>
            </div>
          )}
        </div>
      </div>

      {/* CONTENT */}
      <div style={{flex:1,overflowY:'auto',paddingBottom:'80px'}} onClick={()=>setMenuOpen(false)}>
        {children}
      </div>

      {/* BOTTOM NAV */}
      <nav style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',background:'#fff',borderTop:'1px solid #f3f4f6',display:'flex',zIndex:20,boxShadow:'0 -2px 10px rgba(0,0,0,.05)'}}>
        {NAV.map(({href,icon,label}) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link key={href} href={href} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'8px 2px 12px',textDecoration:'none',borderTop:`2px solid ${active?'#111':'transparent'}`,color:active?'#111':'#9ca3af',transition:'all .15s'}}>
              <span style={{fontSize:'18px',lineHeight:1,marginBottom:'2px'}}>{icon}</span>
              <span style={{fontSize:'9px',fontWeight:active?'600':'400',letterSpacing:'.3px'}}>{label}</span>
            </Link>
          )
        })}
      </nav>

    </div>
  )
}
