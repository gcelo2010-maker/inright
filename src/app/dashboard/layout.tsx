'use client'
import { useEffect, useState } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const NAV = [
  { href: '/dashboard', label: 'Paneli', icon: '⊞' },
  { href: '/dashboard/transactions', label: 'Transaksione', icon: '⇄' },
  { href: '/dashboard/import-review', label: 'Importi', icon: '↑' },
  { href: '/dashboard/loans', label: 'Kreditë', icon: '◈' },
  { href: '/dashboard/investments', label: 'Investimet', icon: '▲' },
]

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter()
  const path = usePathname()
  const [user, setUser] = useState<{email?:string}|null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      if (!data.user) {
        router.replace('/login')
      } else {
        setUser(data.user)
        setLoading(false)
      }
    })
  }, [router])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.replace('/login')
  }

  if (loading) {
    return (
      <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
        <div style={{textAlign:'center'}}>
          <div style={{width:'32px',height:'32px',border:'3px solid #e5e7eb',borderTop:'3px solid #111',borderRadius:'50%',animation:'spin 0.7s linear infinite',margin:'0 auto'}}></div>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
        </div>
      </div>
    )
  }

  return (
    <div style={{maxWidth:'430px',margin:'0 auto',minHeight:'100vh',background:'#f9fafb',display:'flex',flexDirection:'column'}}>
      {/* TopBar */}
      <div style={{background:'#fff',borderBottom:'1px solid #e5e7eb',padding:'10px 16px',display:'flex',alignItems:'center',justifyContent:'space-between',position:'sticky',top:0,zIndex:20}}>
        <span style={{fontSize:'16px',fontWeight:'600',color:'#111'}}>InRight</span>
        <div style={{display:'flex',alignItems:'center',gap:'8px'}}>
          <span style={{fontSize:'11px',color:'#6b7280'}}>{user?.email}</span>
          <button onClick={handleLogout} style={{fontSize:'11px',color:'#ef4444',border:'none',background:'none',cursor:'pointer',fontFamily:'inherit'}}>Dilni</button>
        </div>
      </div>

      {/* Content */}
      <div style={{flex:1,overflowY:'auto',paddingBottom:'70px'}}>
        {children}
      </div>

      {/* Bottom Nav */}
      <nav style={{position:'fixed',bottom:0,left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',background:'#fff',borderTop:'1px solid #e5e7eb',display:'flex',zIndex:20}}>
        {NAV.map(({ href, label, icon }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link key={href} href={href} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',padding:'8px 2px 10px',textDecoration:'none',borderTop: active ? '2px solid #111' : '2px solid transparent',color: active ? '#111' : '#9ca3af'}}>
              <span style={{fontSize:'16px',lineHeight:1}}>{icon}</span>
              <span style={{fontSize:'9px',marginTop:'2px',fontWeight: active ? '500' : '400'}}>{label}</span>
            </Link>
          )
        })}
      </nav>
    </div>
  )
}
