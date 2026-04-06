'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const fmt = (n: number) => {
  if (!n && n!==0) return '0'
  const v = Math.abs(n)
  if (v>=1e6) return (n/1e6).toFixed(2)+'M'
  if (v>=1000) return Math.round(n/1000)+'K'
  return new Intl.NumberFormat('sq-AL',{maximumFractionDigits:0}).format(n)
}
const fmtD = (d: string) => d ? new Date(d).toLocaleDateString('sq-AL',{day:'2-digit',month:'short'}) : ''

type TX = { id:string; type:string; amount:number; description:string; date:string; category_color?:string; category_name?:string; status:string }

export default function DashboardPage() {
  const [txs, setTxs] = useState<TX[]>([])
  const [loading, setLoading] = useState(true)
  const [summary, setSummary] = useState({total:0,income:0,expense:0,pending:0})

  useEffect(() => {
    const sb = createClient()
    Promise.all([
      sb.from('transactions').select('*').eq('is_deleted',false).order('date',{ascending:false}).limit(50),
    ]).then(([{data:tx}]) => {
      const rows = (tx||[]) as TX[]
      setTxs(rows)
      const income = rows.filter(r=>r.type==='income'&&r.status==='approved').reduce((s,r)=>s+Number(r.amount),0)
      const expense = rows.filter(r=>r.type==='expense'&&r.status==='approved').reduce((s,r)=>s+Number(r.amount),0)
      const pending = rows.filter(r=>r.status==='pending').length
      setSummary({total:income-expense, income, expense, pending})
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:'16px'}}>
      <div className="spinner"></div>
      <p style={{color:'#c9a84c',fontSize:'11px',letterSpacing:'2px'}}>DUKE NGARKUAR</p>
    </div>
  )

  const recent = txs.slice(0,6)
  const bySupplier = txs.filter(r=>r.type==='expense').reduce((acc:{[k:string]:number},r)=>{
    acc[r.description] = (acc[r.description]||0)+Number(r.amount)
    return acc
  },{})
  const top5 = Object.entries(bySupplier).sort((a,b)=>b[1]-a[1]).slice(0,5)

  return (
    <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'14px'}}>

      {/* HERO BALANCE */}
      <div className="fade-up" style={{background:'linear-gradient(135deg,#1a1a24 0%,#22222e 100%)',border:'1px solid rgba(201,168,76,.2)',borderRadius:'20px',padding:'24px',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-40px',right:'-40px',width:'160px',height:'160px',background:'radial-gradient(circle,rgba(201,168,76,.08) 0%,transparent 70%)',borderRadius:'50%'}}></div>
        <div style={{position:'absolute',bottom:'-20px',left:'20px',width:'100px',height:'100px',background:'radial-gradient(circle,rgba(201,168,76,.04) 0%,transparent 70%)',borderRadius:'50%'}}></div>
        <p style={{fontSize:'10px',color:'#c9a84c',textTransform:'uppercase',letterSpacing:'2px',margin:'0 0 8px'}}>F4Invest · Bilanci Total</p>
        <p style={{fontSize:'36px',fontWeight:'800',letterSpacing:'-2px',margin:'0 0 20px',background:'linear-gradient(135deg,#ffffff 0%,#c9a84c 60%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>
          {fmt(summary.total)} <span style={{fontSize:'16px',opacity:.5,fontWeight:'400'}}>LEK</span>
        </p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px'}}>
          <div style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.15)',borderRadius:'12px',padding:'12px'}}>
            <p style={{fontSize:'9px',color:'rgba(74,222,128,.6)',textTransform:'uppercase',letterSpacing:'1px',margin:'0 0 4px'}}>↑ Të Ardhura</p>
            <p style={{fontSize:'16px',fontWeight:'700',color:'#4ade80',margin:0,fontVariantNumeric:'tabular-nums'}}>{fmt(summary.income)} L</p>
          </div>
          <div style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.15)',borderRadius:'12px',padding:'12px'}}>
            <p style={{fontSize:'9px',color:'rgba(248,113,113,.6)',textTransform:'uppercase',letterSpacing:'1px',margin:'0 0 4px'}}>↓ Shpenzime</p>
            <p style={{fontSize:'16px',fontWeight:'700',color:'#f87171',margin:0,fontVariantNumeric:'tabular-nums'}}>{fmt(summary.expense)} L</p>
          </div>
        </div>
      </div>

      {/* PENDING ALERT */}
      {summary.pending > 0 && (
        <Link href="/dashboard/transactions" className="fade-up fade-up-1">
          <div style={{background:'rgba(251,191,36,.08)',border:'1.5px solid rgba(251,191,36,.3)',borderRadius:'16px',padding:'14px 16px',display:'flex',alignItems:'center',gap:'12px'}}>
            <div style={{width:'40px',height:'40px',background:'rgba(251,191,36,.15)',borderRadius:'12px',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0,animation:'pulse 2s infinite'}}>⏳</div>
            <div style={{flex:1}}>
              <p style={{fontSize:'13px',fontWeight:'700',color:'#fbbf24',margin:'0 0 2px'}}>{summary.pending} transaksione pending</p>
              <p style={{fontSize:'11px',color:'rgba(251,191,36,.5)',margin:0}}>Presin aprovimin → Klikoni</p>
            </div>
            <span style={{color:'#fbbf24',fontSize:'20px'}}>›</span>
          </div>
        </Link>
      )}

      {/* STATS */}
      <div className="fade-up fade-up-2" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px'}}>
        {[
          {label:'Transaksione',val:txs.length,color:'#c9a84c',icon:'≡'},
          {label:'Aprovuara',val:txs.filter(r=>r.status==='approved').length,color:'#4ade80',icon:'✓'},
          {label:'Pending',val:summary.pending,color:'#fbbf24',icon:'○'},
        ].map((s,i)=>(
          <div key={i} style={{background:'#111118',border:`1px solid ${s.color}20`,borderRadius:'14px',padding:'14px 10px',textAlign:'center'}}>
            <p style={{fontSize:'22px',margin:'0 0 2px'}}>{s.icon}</p>
            <p style={{fontSize:'22px',fontWeight:'800',color:s.color,margin:'0 0 3px',fontVariantNumeric:'tabular-nums'}}>{s.val}</p>
            <p style={{fontSize:'9px',color:'#606070',margin:0,textTransform:'uppercase',letterSpacing:'.5px'}}>{s.label}</p>
          </div>
        ))}
      </div>

      {/* QUICK LINKS */}
      <div className="fade-up fade-up-3" style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
        {[
          {href:'/dashboard/import-review',label:'Import Review',sub:'Rishiko staging',icon:'📋',grad:'135deg,#1a1208,#2d1f00',border:'rgba(201,168,76,.2)'},
          {href:'/dashboard/transactions',label:'Transaksionet',sub:`${txs.length} të regjistruara`,icon:'💱',grad:'135deg,#0a1a0a,#001a0f',border:'rgba(74,222,128,.15)'},
          {href:'/dashboard/loans',label:'Kreditë',sub:'Menaxhim borxhesh',icon:'🏦',grad:'135deg,#0a0a1a,#00001a',border:'rgba(167,139,250,.15)'},
          {href:'/dashboard/investments',label:'Investimet',sub:'Magazina Fier',icon:'🏗️',grad:'135deg,#0a1a1a,#001a1a',border:'rgba(103,232,249,.15)'},
        ].map((item,i)=>(
          <Link key={i} href={item.href}>
            <div style={{background:`linear-gradient(${item.grad})`,border:`1px solid ${item.border}`,borderRadius:'16px',padding:'16px',cursor:'pointer',transition:'transform .15s'}}
              onMouseEnter={e=>(e.currentTarget.style.transform='scale(1.02)')}
              onMouseLeave={e=>(e.currentTarget.style.transform='scale(1)')}>
              <span style={{fontSize:'24px',display:'block',marginBottom:'10px'}}>{item.icon}</span>
              <p style={{fontSize:'12px',fontWeight:'700',color:'#fff',margin:'0 0 3px'}}>{item.label}</p>
              <p style={{fontSize:'10px',color:'#606070',margin:0}}>{item.sub}</p>
            </div>
          </Link>
        ))}
      </div>

      {/* TOP SHPENZIME */}
      <div className="fade-up fade-up-4" style={{background:'#111118',border:'1px solid rgba(255,255,255,.06)',borderRadius:'18px',padding:'18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
          <p style={{fontSize:'12px',fontWeight:'700',color:'#fff',margin:0,textTransform:'uppercase',letterSpacing:'1px'}}>Top Shpenzime</p>
          <span style={{fontSize:'10px',color:'#c9a84c'}}>nga azotiku.xls</span>
        </div>
        {top5.length===0 ? (
          <p style={{textAlign:'center',color:'#606070',fontSize:'12px',padding:'16px 0'}}>Nuk ka të dhëna</p>
        ) : top5.map(([desc,amt],i)=>(
          <div key={i} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:i<top5.length-1?'1px solid rgba(255,255,255,.04)':'none'}}>
            <div style={{width:'6px',height:'6px',borderRadius:'50%',background:['#c9a84c','#f87171','#a78bfa','#67e8f9','#4ade80'][i],flexShrink:0}}></div>
            <p style={{flex:1,fontSize:'11px',color:'#a0a0b0',margin:0,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{desc}</p>
            <p style={{fontSize:'12px',fontWeight:'700',color:['#c9a84c','#f87171','#a78bfa','#67e8f9','#4ade80'][i],margin:0,fontVariantNumeric:'tabular-nums',flexShrink:0}}>{fmt(amt)} L</p>
          </div>
        ))}
      </div>

      {/* RECENT TX */}
      <div className="fade-up fade-up-5" style={{background:'#111118',border:'1px solid rgba(255,255,255,.06)',borderRadius:'18px',padding:'18px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'14px'}}>
          <p style={{fontSize:'12px',fontWeight:'700',color:'#fff',margin:0,textTransform:'uppercase',letterSpacing:'1px'}}>Transaksionet e Fundit</p>
          <Link href="/dashboard/transactions" style={{fontSize:'10px',color:'#c9a84c'}}>Të gjitha ›</Link>
        </div>
        {recent.length===0 ? (
          <p style={{textAlign:'center',color:'#606070',fontSize:'12px',padding:'16px 0'}}>Nuk ka transaksione</p>
        ) : recent.map((t,i)=>(
          <div key={t.id} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:i<recent.length-1?'1px solid rgba(255,255,255,.04)':'none'}}>
            <div style={{width:'36px',height:'36px',borderRadius:'10px',background:t.type==='income'?'rgba(74,222,128,.1)':'rgba(248,113,113,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'14px',flexShrink:0}}>
              {t.type==='income'?'↑':'↓'}
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:'12px',fontWeight:'500',color:'#e0e0e8',margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.description}</p>
              <p style={{fontSize:'10px',color:'#606070',margin:0}}>{fmtD(t.date)}</p>
            </div>
            <div style={{textAlign:'right',flexShrink:0}}>
              <p style={{fontSize:'13px',fontWeight:'700',color:t.type==='income'?'#4ade80':'#f87171',margin:'0 0 2px',fontVariantNumeric:'tabular-nums'}}>
                {t.type==='expense'?'-':'+'}{fmt(Number(t.amount))}
              </p>
              {t.status!=='approved' && <span style={{fontSize:'9px',color:'#fbbf24',background:'rgba(251,191,36,.1)',padding:'1px 6px',borderRadius:'6px'}}>{t.status}</span>}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
