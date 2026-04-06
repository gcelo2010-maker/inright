'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const fmt = (n: number) => {
  if (!n) return '0'
  if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(2)+'M'
  if (Math.abs(n) >= 1000) return (n/1000).toFixed(0)+'K'
  return new Intl.NumberFormat('sq-AL',{maximumFractionDigits:0}).format(n)
}
const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('sq-AL',{day:'2-digit',month:'short'}) : ''

type StRow = { review_status: string; amount: number }

export default function DashboardPage() {
  const [staging, setStaging] = useState<StRow[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()
    sb.from('import_staging')
      .select('review_status,amount')
      .eq('import_batch','azotiku.xls')
      .then(({data}) => {
        setStaging((data||[]) as StRow[])
        setLoading(false)
      })
  }, [])

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:'12px'}}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{width:'40px',height:'40px',border:'3px solid #1a1a2e',borderTop:'3px solid #c9a84c',borderRadius:'50%',animation:'spin .8s linear infinite'}}></div>
      <p style={{color:'#666',fontSize:'13px',letterSpacing:'1px',textTransform:'uppercase'}}>InRight</p>
    </div>
  )

  const total = staging.reduce((s,r)=>s+Number(r.amount),0)
  const pending = staging.filter(r=>r.review_status==='pending')
  const approved = staging.filter(r=>r.review_status==='approved')
  const imported = staging.filter(r=>r.review_status==='imported')
  const pendingAmt = pending.reduce((s,r)=>s+Number(r.amount),0)
  const approvedAmt = approved.reduce((s,r)=>s+Number(r.amount),0)
  const importedAmt = imported.reduce((s,r)=>s+Number(r.amount),0)

  return (
    <div style={{background:'#0a0a0f',minHeight:'100vh',padding:'20px 16px 24px',color:'#fff'}}>
      <style>{`
        @keyframes fadeIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:translateY(0)}}
        .card-anim{animation:fadeIn .4s ease forwards}
      `}</style>

      {/* HEADER */}
      <div style={{marginBottom:'24px'}} className="card-anim">
        <p style={{fontSize:'11px',color:'#c9a84c',textTransform:'uppercase',letterSpacing:'2px',margin:'0 0 4px'}}>F4Invest · Import Magazina Fier</p>
        <h1 style={{fontSize:'28px',fontWeight:'800',letterSpacing:'-1px',margin:0,background:'linear-gradient(135deg,#fff 0%,#c9a84c 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          {fmt(total)} LEK
        </h1>
        <p style={{fontSize:'12px',color:'#666',margin:'4px 0 0'}}>Total import nga azotiku.xls · {staging.length} transaksione</p>
      </div>

      {/* MAIN STATS */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',marginBottom:'14px'}}>
        {[
          {label:'Pending Aprovim',val:pending.length,amt:pendingAmt,color:'#f59e0b',bg:'rgba(245,158,11,.12)',icon:'⏳'},
          {label:'Aprovuar',val:approved.length,amt:approvedAmt,color:'#c9a84c',bg:'rgba(201,168,76,.12)',icon:'✓'},
          {label:'Importuar në TX',val:imported.length,amt:importedAmt,color:'#a78bfa',bg:'rgba(167,139,250,.12)',icon:'↗'},
          {label:'Total Rreshta',val:staging.length,amt:total,color:'#67e8f9',bg:'rgba(103,232,249,.08)',icon:'≡'},
        ].map((item,i)=>(
          <div key={i} className="card-anim" style={{
            background:item.bg,border:`1px solid ${item.color}30`,borderRadius:'16px',
            padding:'16px',animationDelay:`${i*0.08}s`,opacity:0
          }}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
              <span style={{fontSize:'10px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',lineHeight:1.3}}>{item.label}</span>
              <span style={{fontSize:'18px'}}>{item.icon}</span>
            </div>
            <p style={{fontSize:'28px',fontWeight:'800',color:item.color,margin:'0 0 2px',fontVariantNumeric:'tabular-nums',letterSpacing:'-1px'}}>{item.val}</p>
            <p style={{fontSize:'11px',color:'#555',margin:0,fontVariantNumeric:'tabular-nums'}}>{fmt(item.amt)} LEK</p>
          </div>
        ))}
      </div>

      {/* PROGRESS BAR */}
      <div className="card-anim" style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'16px',padding:'18px',marginBottom:'14px',animationDelay:'.32s',opacity:0}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'12px'}}>
          <p style={{fontSize:'12px',color:'#888',margin:0,textTransform:'uppercase',letterSpacing:'.8px'}}>Progresi i Importit</p>
          <p style={{fontSize:'12px',color:'#c9a84c',margin:0,fontWeight:'700'}}>{staging.length>0?Math.round((imported.length/staging.length)*100):0}%</p>
        </div>
        <div style={{background:'rgba(255,255,255,.06)',borderRadius:'100px',height:'6px',overflow:'hidden'}}>
          <div style={{height:'100%',borderRadius:'100px',background:'linear-gradient(90deg,#c9a84c,#f59e0b)',width:`${staging.length>0?(imported.length/staging.length)*100:0}%`,transition:'width 1s ease'}}></div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between',marginTop:'10px'}}>
          <span style={{fontSize:'10px',color:'#555'}}>{imported.length} kaluar</span>
          <span style={{fontSize:'10px',color:'#555'}}>{staging.length - imported.length} mbetur</span>
        </div>
      </div>

      {/* ALERT - pending */}
      {pending.length > 0 && (
        <Link href="/dashboard/import-review" style={{textDecoration:'none',display:'block',marginBottom:'14px'}}>
          <div className="card-anim" style={{background:'rgba(245,158,11,.1)',border:'1.5px solid rgba(245,158,11,.4)',borderRadius:'16px',padding:'16px',display:'flex',alignItems:'center',gap:'12px',animationDelay:'.4s',opacity:0}}>
            <div style={{width:'44px',height:'44px',background:'rgba(245,158,11,.2)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0}}>⚠</div>
            <div style={{flex:1}}>
              <p style={{fontSize:'14px',fontWeight:'700',color:'#f59e0b',margin:'0 0 3px'}}>{pending.length} transaksione presin aprovimin</p>
              <p style={{fontSize:'11px',color:'#f59e0b80',margin:0}}>{fmt(pendingAmt)} LEK · Kliko për të rishikuar →</p>
            </div>
          </div>
        </Link>
      )}

      {/* QUICK ACTIONS */}
      <div className="card-anim" style={{marginBottom:'14px',animationDelay:'.48s',opacity:0}}>
        <p style={{fontSize:'10px',color:'#555',textTransform:'uppercase',letterSpacing:'1px',margin:'0 0 10px'}}>Veprime të shpejta</p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
          {[
            {href:'/dashboard/import-review',label:'Rishiko Importin',sub:`${pending.length} pending`,icon:'📋',color:'#c9a84c'},
            {href:'/dashboard/transactions',label:'Transaksionet',sub:`${imported.length} të importuara`,icon:'💱',color:'#a78bfa'},
            {href:'/dashboard/loans',label:'Kreditë',sub:'Menaxhim borxhesh',icon:'🏦',color:'#67e8f9'},
            {href:'/dashboard/investments',label:'Investimet',sub:'Magazina Fier',icon:'🏗️',color:'#4ade80'},
          ].map((item,i)=>(
            <Link key={i} href={item.href} style={{textDecoration:'none'}}>
              <div style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'14px',padding:'14px',cursor:'pointer'}}>
                <span style={{fontSize:'22px',display:'block',marginBottom:'8px'}}>{item.icon}</span>
                <p style={{fontSize:'12px',fontWeight:'600',color:'#fff',margin:'0 0 2px'}}>{item.label}</p>
                <p style={{fontSize:'10px',color:item.color,margin:0}}>{item.sub}</p>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* SUPPLIER BREAKDOWN */}
      <div className="card-anim" style={{background:'rgba(255,255,255,.04)',border:'1px solid rgba(255,255,255,.08)',borderRadius:'16px',padding:'18px',animationDelay:'.56s',opacity:0}}>
        <p style={{fontSize:'12px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 14px'}}>Furnitorët kryesorë</p>
        {[
          {name:'VALONA KOSTRUKSION',amt:13750000,color:'#c9a84c'},
          {name:'SITUACIONE VALONA',amt:18089790,color:'#f59e0b'},
          {name:'A A R SH P K',amt:2694000,color:'#a78bfa'},
          {name:'Taulant Ismailaj',amt:1960000,color:'#67e8f9'},
          {name:'Genti Celo',amt:staging.filter(r=>r.review_status!=="imported").reduce((s:number,r:StRow)=>s+Number(r.amount),0),color:'#4ade80'},
        ].map((s,i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'8px 0',borderBottom:i<4?'1px solid rgba(255,255,255,.06)':'none'}}>
            <div style={{width:'8px',height:'8px',borderRadius:'50%',background:s.color,flexShrink:0}}></div>
            <span style={{flex:1,fontSize:'12px',color:'#ccc',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{s.name}</span>
            <span style={{fontSize:'12px',fontWeight:'700',color:s.color,fontVariantNumeric:'tabular-nums',flexShrink:0}}>{fmt(s.amt)} L</span>
          </div>
        ))}
      </div>

      {/* DATE */}
      <p style={{textAlign:'center',fontSize:'10px',color:'#333',marginTop:'20px',letterSpacing:'1px'}}>
        {new Date().toLocaleDateString('sq-AL',{weekday:'long',year:'numeric',month:'long',day:'numeric'})}
      </p>
    </div>
  )
}
