'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  useEffect(() => { router.replace('/login') }, [router])
  return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <div style={{textAlign:'center'}}>
        <div style={{width:'48px',height:'48px',background:'#111',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 12px'}}>
          <span style={{color:'#fff',fontWeight:'700'}}>IR</span>
        </div>
        <p style={{color:'#6b7280',fontSize:'14px'}}>Duke ngarkuar...</p>
      </div>
    </div>
  )
}
