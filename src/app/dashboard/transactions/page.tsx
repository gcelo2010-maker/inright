'use client'
import Link from 'next/link'
export default function Page() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',padding:'32px',textAlign:'center'}}>
      <div style={{fontSize:'48px',marginBottom:'12px'}}>🚧</div>
      <h2 style={{fontSize:'18px',fontWeight:'600',color:'#111',margin:'0 0 8px'}}>Duke u ndërtuar</h2>
      <p style={{fontSize:'13px',color:'#9ca3af',margin:'0 0 20px'}}>Ky modul do të jetë gati së shpejti.</p>
      <Link href="/dashboard" style={{background:'#111',color:'#fff',padding:'10px 24px',borderRadius:'10px',textDecoration:'none',fontSize:'13px',fontWeight:'500'}}>← Kthehu te Paneli</Link>
    </div>
  )
}
