'use client'
import Link from 'next/link'
export default function Page() {
  return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',padding:'32px',textAlign:'center'}}>
      <div style={{fontSize:'48px',marginBottom:'16px'}}>🏗️</div>
      <h2 style={{fontSize:'20px',fontWeight:'800',background:'linear-gradient(135deg,#fff,#c9a84c)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:'0 0 8px'}}>Duke u ndërtuar</h2>
      <p style={{fontSize:'13px',color:'#606070',margin:'0 0 24px',lineHeight:1.6}}>Ky modul është në zhvillim aktiv.<br/>Do të jetë gati së shpejti.</p>
      <Link href="/dashboard" style={{background:'rgba(201,168,76,.1)',border:'1px solid rgba(201,168,76,.3)',color:'#c9a84c',padding:'11px 28px',borderRadius:'12px',fontSize:'13px',fontWeight:'600'}}>← Kthehu te Paneli</Link>
    </div>
  )
}
