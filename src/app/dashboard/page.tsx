'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

const fmt = (n: number) => {
  if (!n) return '0'
  if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(2) + 'M'
  if (Math.abs(n) >= 1000) return (n/1000).toFixed(0) + 'K'
  return new Intl.NumberFormat('sq-AL',{maximumFractionDigits:0}).format(n)
}
const fmtD = (d: string) => d ? new Date(d).toLocaleDateString('sq-AL',{day:'2-digit',month:'short'}) : ''

export default function DashboardPage() {
  const [summary, setSummary] = useState<Record<string,unknown>|null>(null)
  const [recent, setRecent] = useState<Record<string,unknown>[]>([])
  const [staging, setStaging] = useState<{pending:number,approved:number,total:number}>({pending:0,approved:0,total:0})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const sb = createClient()
    Promise.all([
      sb.rpc('rpc_dashboard_summary'),
      sb.from('v_transactions_detail').select('id,type,amount,description,date,category_color,category_name').eq('is_deleted',false).order('date',{ascending:false}).limit(5),
      sb.from('import_staging').select('review_status,amount').eq('import_batch','azotiku.xls')
    ]).then(([{data:s},{data:tx},{data:st}]) => {
      setSummary(s)
      setRecent(tx||[])
      const rows = st||[]
      setStaging({
        pending: rows.filter((r:{review_status:string})=>r.review_status==='pending').length,
        approved: rows.filter((r:{review_status:string})=>r.review_status==='approved').length,
        total: rows.reduce((s:number,r:{amount:number})=>s+Number(r.amount),0)
      })
      setLoading(false)
    })
  }, [])

  if (loading) return (
    <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:'12px'}}>
      <div style={{width:'36px',height:'36px',border:'3px solid #e5e7eb',borderTop:'3px solid #111',borderRadius:'50%',animation:'spin .7s linear infinite'}}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <p style={{color:'#9ca3af',fontSize:'13px'}}>Duke ngarkuar...</p>
    </div>
  )

  const s = summary||{}
  const cf = (s.monthly_cashflow as Record<string,number>[])||[]
  const maxV = Math.max(...cf.map(m=>Math.max(Number(m.income)||0,Number(m.expenses)||0)),1)

  return (
    <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'12px'}}>

      {/* HERO */}
      <div style={{background:'linear-gradient(135deg,#111 0%,#1f2937 100%)',borderRadius:'20px',padding:'20px',color:'#fff',position:'relative',overflow:'hidden'}}>
        <div style={{position:'absolute',top:'-20px',right:'-20px',width:'120px',height:'120px',background:'rgba(255,255,255,.05)',borderRadius:'50%'}}></div>
        <div style={{position:'absolute',bottom:'-30px',right:'30px',width:'80px',height:'80px',background:'rgba(255,255,255,.03)',borderRadius:'50%'}}></div>
        <p style={{fontSize:'10px',color:'rgba(255,255,255,.5)',textTransform:'uppercase',letterSpacing:'1px',margin:'0 0 4px'}}>Bilanci Neto</p>
        <p style={{fontSize:'32px',fontWeight:'700',letterSpacing:'-1.5px',margin:'0 0 16px',fontVariantNumeric:'tabular-nums'}}>
          {fmt(Number(s.balance)||0)} <span style={{fontSize:'14px',opacity:.4,fontWeight:'400'}}>LEK</span>
        </p>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',paddingTop:'14px',borderTop:'1px solid rgba(255,255,255,.1)'}}>
          <div>
            <p style={{fontSize:'9px',color:'rgba(255,255,255,.4)',margin:'0 0 2px',textTransform:'uppercase',letterSpacing:'.5px'}}>↑ Të Ardhura</p>
            <p style={{fontSize:'14px',color:'#4ade80',fontWeight:'600',margin:0,fontVariantNumeric:'tabular-nums'}}>{fmt(Number(s.total_income)||0)} L</p>
          </div>
          <div>
            <p style={{fontSize:'9px',color:'rgba(255,255,255,.4)',margin:'0 0 2px',textTransform:'uppercase',letterSpacing:'.5px'}}>↓ Shpenzime</p>
            <p style={{fontSize:'14px',color:'#f87171',fontWeight:'600',margin:0,fontVariantNumeric:'tabular-nums'}}>{fmt(Number(s.total_expenses)||0)} L</p>
          </div>
        </div>
      </div>

      {/* IMPORT ALERT */}
      {staging.pending > 0 && (
        <Link href="/dashboard/import-review" style={{textDecoration:'none'}}>
          <div style={{background:'#fffbeb',border:'1.5px solid #f59e0b',borderRadius:'14px',padding:'12px 16px',display:'flex',alignItems:'center',gap:'10px'}}>
            <div style={{width:'36px',height:'36px',background:'#f59e0b',borderRadius:'10px',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0,fontSize:'18px'}}>⚠️</div>
            <div style={{flex:1}}>
              <p style={{fontSize:'13px',fontWeight:'600',color:'#92400e',margin:'0 0 2px'}}>{staging.pending} transaksione presin aprovimin</p>
              <p style={{fontSize:'11px',color:'#b45309',margin:0}}>Shuma totale: {fmt(staging.total)} LEK → Klikoni për të rishikuar</p>
            </div>
            <span style={{color:'#f59e0b',fontSize:'18px'}}>›</span>
          </div>
        </Link>
      )}

      {/* STATS GRID */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'14px',padding:'14px'}}>
          <p style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.5px',margin:'0 0 6px'}}>💳 Kreditë aktive</p>
          <p style={{fontSize:'20px',fontWeight:'700',color:'#111',margin:0,fontVariantNumeric:'tabular-nums'}}>{fmt(Number(s.loans_total)||0)}</p>
          <p style={{fontSize:'10px',color:'#9ca3af',margin:'2px 0 0'}}>LEK borxh total</p>
        </div>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'14px',padding:'14px'}}>
          <p style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.5px',margin:'0 0 6px'}}>🏗️ Investime</p>
          <p style={{fontSize:'20px',fontWeight:'700',color:'#111',margin:0}}>{String(s.active_investments||0)}</p>
          <p style={{fontSize:'10px',color:'#9ca3af',margin:'2px 0 0'}}>projekte aktive</p>
        </div>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'14px',padding:'14px'}}>
          <p style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.5px',margin:'0 0 6px'}}>📥 Importi</p>
          <p style={{fontSize:'20px',fontWeight:'700',color:'#f59e0b',margin:0}}>{staging.pending}</p>
          <p style={{fontSize:'10px',color:'#9ca3af',margin:'2px 0 0'}}>pending aprovim</p>
        </div>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'14px',padding:'14px'}}>
          <p style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.5px',margin:'0 0 6px'}}>✅ Aprovuar</p>
          <p style={{fontSize:'20px',fontWeight:'700',color:'#16a34a',margin:0}}>{staging.approved}</p>
          <p style={{fontSize:'10px',color:'#9ca3af',margin:'2px 0 0'}}>gati për transfer</p>
        </div>
      </div>

      {/* CASHFLOW CHART */}
      {cf.length > 0 && (
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'14px',padding:'16px'}}>
          <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'16px'}}>
            <p style={{fontSize:'13px',fontWeight:'600',color:'#111',margin:0}}>Cash Flow</p>
            <p style={{fontSize:'10px',color:'#9ca3af',margin:0}}>6 muajt e fundit</p>
          </div>
          <div style={{display:'flex',alignItems:'flex-end',gap:'6px',height:'80px'}}>
            {cf.slice(-6).map((m,i)=>(
              <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                <div style={{display:'flex',gap:'2px',alignItems:'flex-end',height:'60px',width:'100%'}}>
                  <div style={{flex:1,background:'#dcfce7',borderRadius:'3px 3px 0 0',minHeight:'3px',height:`${Math.round(((Number(m.income)||0)/maxV)*100)}%`}}></div>
                  <div style={{flex:1,background:'#fee2e2',borderRadius:'3px 3px 0 0',minHeight:'3px',height:`${Math.round(((Number(m.expenses)||0)/maxV)*100)}%`}}></div>
                </div>
                <p style={{fontSize:'8px',color:'#9ca3af',margin:0,whiteSpace:'nowrap'}}>{String(m.month_label||'').split(' ')[0]}</p>
              </div>
            ))}
          </div>
          <div style={{display:'flex',gap:'16px',marginTop:'10px',paddingTop:'10px',borderTop:'1px solid #f3f4f6'}}>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}><div style={{width:'10px',height:'10px',background:'#dcfce7',border:'1px solid #86efac',borderRadius:'2px'}}></div><span style={{fontSize:'10px',color:'#6b7280'}}>Të ardhura</span></div>
            <div style={{display:'flex',alignItems:'center',gap:'5px'}}><div style={{width:'10px',height:'10px',background:'#fee2e2',border:'1px solid #fca5a5',borderRadius:'2px'}}></div><span style={{fontSize:'10px',color:'#6b7280'}}>Shpenzime</span></div>
          </div>
        </div>
      )}

      {/* RECENT TRANSACTIONS */}
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'14px',padding:'16px'}}>
        <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:'12px'}}>
          <p style={{fontSize:'13px',fontWeight:'600',color:'#111',margin:0}}>Transaksionet e fundit</p>
          <Link href="/dashboard/transactions" style={{fontSize:'11px',color:'#6b7280',textDecoration:'none'}}>Të gjitha ›</Link>
        </div>
        {recent.length===0 ? (
          <div style={{textAlign:'center',padding:'24px',color:'#9ca3af'}}>
            <p style={{fontSize:'24px',margin:'0 0 6px'}}>📭</p>
            <p style={{fontSize:'12px',margin:0}}>Nuk ka transaksione ende</p>
            <Link href="/dashboard/import-review" style={{fontSize:'11px',color:'#6366f1',textDecoration:'none',display:'block',marginTop:'6px'}}>Importo nga staging →</Link>
          </div>
        ) : (
          recent.map((t,i)=>(
            <div key={String(t.id)} style={{display:'flex',alignItems:'center',gap:'10px',padding:'10px 0',borderBottom:i<recent.length-1?'1px solid #f9fafb':'none'}}>
              <div style={{width:'36px',height:'36px',borderRadius:'10px',background:'#f3f4f6',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                <div style={{width:'10px',height:'10px',borderRadius:'50%',background:String(t.category_color||'#d1d5db')}}></div>
              </div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:'12px',fontWeight:'500',color:'#111',margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{String(t.description||'—')}</p>
                <p style={{fontSize:'10px',color:'#9ca3af',margin:0}}>{fmtD(String(t.date||''))} · {String(t.category_name||'')}</p>
              </div>
              <p style={{fontSize:'13px',fontWeight:'600',margin:0,fontVariantNumeric:'tabular-nums',color:t.type==='income'?'#16a34a':'#dc2626',flexShrink:0}}>
                {t.type==='expense'?'-':'+'}  {fmt(Number(t.amount)||0)}
              </p>
            </div>
          ))
        )}
      </div>
    </div>
  )
}
