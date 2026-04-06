'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { formatAmount, formatDateShort } from '@/lib/utils'
import Link from 'next/link'

export default function DashboardPage() {
  const [summary, setSummary] = useState<Record<string,unknown>|null>(null)
  const [recent, setRecent] = useState<Record<string,unknown>[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    Promise.all([
      supabase.rpc('rpc_dashboard_summary'),
      supabase.from('v_transactions_detail').select('*').eq('is_deleted',false).order('date',{ascending:false}).limit(5)
    ]).then(([{data:s},{data:tx}]) => {
      setSummary(s)
      setRecent(tx || [])
      setLoading(false)
    })
  }, [])

  if (loading) return <div style={{padding:'48px',textAlign:'center',color:'#9ca3af'}}>Duke ngarkuar...</div>

  const s = summary || {}
  const cf: Record<string,number>[] = (s.monthly_cashflow as Record<string,number>[] || [])
  const maxV = Math.max(...cf.map((m) => Math.max(Number(m.income)||0, Number(m.expenses)||0)), 1)

  return (
    <div style={{padding:'12px',display:'flex',flexDirection:'column',gap:'10px'}}>
      {/* Hero */}
      <div style={{background:'#111',borderRadius:'14px',padding:'16px',color:'#fff'}}>
        <div style={{fontSize:'9px',color:'rgba(255,255,255,.4)',textTransform:'uppercase',letterSpacing:'.6px',marginBottom:'3px'}}>Bilanci Neto</div>
        <div style={{fontSize:'26px',fontWeight:'500',fontVariantNumeric:'tabular-nums',letterSpacing:'-1px'}}>{formatAmount(Number(s.balance)||0)}</div>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'6px',marginTop:'12px',paddingTop:'12px',borderTop:'1px solid rgba(255,255,255,.1)'}}>
          <div><div style={{fontSize:'9px',color:'rgba(255,255,255,.4)',marginBottom:'2px'}}>Të Ardhura</div><div style={{fontSize:'12px',color:'#86efac',fontVariantNumeric:'tabular-nums'}}>{formatAmount(Number(s.total_income)||0)}</div></div>
          <div><div style={{fontSize:'9px',color:'rgba(255,255,255,.4)',marginBottom:'2px'}}>Shpenzime</div><div style={{fontSize:'12px',color:'#fca5a5',fontVariantNumeric:'tabular-nums'}}>{formatAmount(Number(s.total_expenses)||0)}</div></div>
        </div>
      </div>

      {/* Pending alert */}
      {Number(s.pending_count) > 0 && (
        <Link href="/dashboard/transactions" style={{textDecoration:'none'}}>
          <div style={{background:'#fffbeb',border:'1px solid #fcd34d',borderRadius:'10px',padding:'10px 12px',display:'flex',alignItems:'center',gap:'8px'}}>
            <span style={{fontSize:'16px'}}>⚠</span>
            <span style={{fontSize:'12px',color:'#78350f'}}>{String(s.pending_count)} transaksione presin aprovimin — <b>{formatAmount(Number(s.pending_amount)||0)}</b></span>
          </div>
        </Link>
      )}

      {/* Stats */}
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px'}}>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'12px'}}>
          <div style={{fontSize:'10px',color:'#9ca3af',marginBottom:'3px'}}>Kreditë aktive</div>
          <div style={{fontSize:'16px',fontWeight:'500',fontVariantNumeric:'tabular-nums'}}>{formatAmount(Number(s.loans_total)||0)}</div>
        </div>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'12px'}}>
          <div style={{fontSize:'10px',color:'#9ca3af',marginBottom:'3px'}}>Investime aktive</div>
          <div style={{fontSize:'16px',fontWeight:'500'}}>{String(s.active_investments||0)}</div>
        </div>
      </div>

      {/* Cashflow chart */}
      {cf.length > 0 && (
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'12px'}}>
          <div style={{fontSize:'11px',fontWeight:'500',marginBottom:'8px'}}>Cash Flow — {cf.length} muajt</div>
          <div style={{display:'flex',alignItems:'flex-end',gap:'3px',height:'56px'}}>
            {cf.slice(-6).map((m, i) => (
              <div key={i} style={{flex:1,display:'flex',flexDirection:'column',alignItems:'center',gap:'2px'}}>
                <div style={{display:'flex',gap:'1px',alignItems:'flex-end',height:'44px',width:'100%'}}>
                  <div style={{flex:1,background:'#dcfce7',borderRadius:'2px 2px 0 0',height:`${Math.round(((Number(m.income)||0)/maxV)*100)}%`,minHeight:'2px'}}></div>
                  <div style={{flex:1,background:'#fee2e2',borderRadius:'2px 2px 0 0',height:`${Math.round(((Number(m.expenses)||0)/maxV)*100)}%`,minHeight:'2px'}}></div>
                </div>
                <div style={{fontSize:'8px',color:'#9ca3af'}}>{String(m.month_label||'').split(' ')[0]}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recent transactions */}
      <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'12px'}}>
        <div style={{display:'flex',justifyContent:'space-between',marginBottom:'8px'}}>
          <span style={{fontSize:'11px',fontWeight:'500'}}>Transaksionet e fundit</span>
          <Link href="/dashboard/transactions" style={{fontSize:'10px',color:'#9ca3af',textDecoration:'none'}}>Të gjitha ›</Link>
        </div>
        {recent.length === 0
          ? <div style={{textAlign:'center',padding:'16px',fontSize:'11px',color:'#9ca3af'}}>Nuk ka transaksione ende</div>
          : recent.map((t) => (
            <div key={String(t.id)} style={{display:'flex',alignItems:'center',gap:'8px',padding:'8px 0',borderBottom:'1px solid #f3f4f6'}}>
              <div style={{width:'7px',height:'7px',borderRadius:'50%',background:String(t.category_color||'#d1d5db'),flexShrink:0}}></div>
              <div style={{flex:1,minWidth:0}}>
                <div style={{fontSize:'11px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{String(t.description||'—')}</div>
                <div style={{fontSize:'9px',color:'#9ca3af'}}>{formatDateShort(String(t.date||''))}</div>
              </div>
              <div style={{fontSize:'11px',fontWeight:'500',fontVariantNumeric:'tabular-nums',color:t.type==='income'?'#16a34a':'#dc2626'}}>
                {t.type==='expense'?'-':'+'} {formatAmount(Number(t.amount)||0,'')}
              </div>
            </div>
          ))
        }
      </div>
    </div>
  )
}
