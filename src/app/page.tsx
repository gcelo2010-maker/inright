'use client'
import { useEffect } from 'react'

export default function Home() {
  useEffect(() => {
    window.location.href = '/login'
  }, [])
  return (
    <div style={{background:'#0a0a0f',minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{textAlign:'center'}}>
        <div style={{width:'40px',height:'40px',border:'2px solid rgba(201,168,76,.3)',borderTop:'2px solid #c9a84c',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto 12px'}}></div>
        <p style={{color:'#c9a84c',fontSize:'11px',letterSpacing:'2px',textTransform:'uppercase'}}>InRight</p>
      </div>
    </div>
  )
}
