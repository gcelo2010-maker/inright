'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'

const fmt = (n: number) => {
  if (!n && n!==0) return '0'
  const v=Math.abs(n)
  if(v>=1e6) return (n/1e6).toFixed(2)+'M'
  if(v>=1000) return Math.round(n/1000)+'K'
  return new Intl.NumberFormat('sq-AL',{maximumFractionDigits:0}).format(n)
}
const fmtD = (d:string) => d?new Date(d).toLocaleDateString('sq-AL',{day:'2-digit',month:'short',year:'2-digit'}):''
const SL:{[k:string]:string} = {approved:'Aprovuar',pending:'Pending',rejected:'Refuzuar',draft:'Draft'}
const SC:{[k:string]:string} = {approved:'#4ade80',pending:'#fbbf24',rejected:'#f87171',draft:'#a0a0b0'}

type TX = {id:string;type:string;amount:number;description:string;date:string;status:string;category_name?:string;reference_no?:string;notes?:string}
type F = 'all'|'approved'|'pending'|'expense'|'income'

export default function TxPage() {
  const [txs, setTxs] = useState<TX[]>([])
  const [filt, setFilt] = useState<F>('all')
  const [exp, setExp] = useState<string|null>(null)
  const [loading, setLoading] = useState(true)
  const [approvingId, setApprovingId] = useState<string|null>(null)
  const [toast, setToast] = useState('')

  useEffect(() => {
    createClient().from('transactions').select('*').eq('is_deleted',false).order('date',{ascending:false})
      .then(({data})=>{setTxs((data||[]) as TX[]);setLoading(false)})
  },[])

  const showToast=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),2400)}

  const approve = async (id:string) => {
    setApprovingId(id)
    await createClient().from('transactions').update({status:'approved',approval_count:1}).eq('id',id)
    setTxs(p=>p.map(r=>r.id===id?{...r,status:'approved'}:r))
    setApprovingId(null)
    showToast('✓ Aprovuar')
  }

  const filters:{id:F,label:string}[] = [{id:'all',label:'Të gjitha'},{id:'approved',label:'Aprovuar'},{id:'pending',label:'Pending'},{id:'expense',label:'Shpenzime'},{id:'income',label:'Të Ardhura'}]
  const filtered = filt==='all'?txs:txs.filter(r=>filt==='approved'?r.status==='approved':filt==='pending'?r.status==='pending':r.type===filt)
  const total = filtered.reduce((s,r)=>s+(r.type==='expense'?-1:1)*Number(r.amount),0)

  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh',flexDirection:'column',gap:'16px'}}><div className="spinner"></div></div>

  return (
    <div style={{padding:'16px',display:'flex',flexDirection:'column',gap:'12px'}}>
      {/* Header */}
      <div className="fade-up" style={{background:'linear-gradient(135deg,#1a1a24,#22222e)',border:'1px solid rgba(201,168,76,.2)',borderRadius:'16px',padding:'16px'}}>
        <p style={{fontSize:'10px',color:'#c9a84c',textTransform:'uppercase',letterSpacing:'2px',margin:'0 0 4px'}}>Total · {filtered.length} transaksione</p>
        <p style={{fontSize:'28px',fontWeight:'800',letterSpacing:'-1px',margin:0,color:total>=0?'#4ade80':'#f87171',fontVariantNumeric:'tabular-nums'}}>{total>=0?'+':''}{fmt(total)} <span style={{fontSize:'14px',opacity:.5,fontWeight:'400'}}>LEK</span></p>
      </div>

      {/* Filters */}
      <div className="fade-up fade-up-1" style={{display:'flex',gap:'6px',overflowX:'auto',scrollbarWidth:'none'}}>
        {filters.map(f=>(
          <button key={f.id} onClick={()=>setFilt(f.id)} style={{flexShrink:0,padding:'6px 14px',borderRadius:'20px',border:`1px solid ${filt===f.id?'#c9a84c':'rgba(255,255,255,.08)'}`,fontSize:'11px',fontWeight:'600',cursor:'pointer',background:filt===f.id?'rgba(201,168,76,.15)':'transparent',color:filt===f.id?'#c9a84c':'#606070',transition:'all .15s'}}>
            {f.label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="fade-up fade-up-2" style={{display:'flex',flexDirection:'column',gap:'8px'}}>
        {filtered.length===0 && <p style={{textAlign:'center',color:'#606070',padding:'48px',fontSize:'13px'}}>Nuk ka transaksione</p>}
        {filtered.map(t=>(
          <div key={t.id} style={{background:'#111118',border:`1px solid ${t.status==='approved'?'rgba(74,222,128,.1)':t.status==='pending'?'rgba(251,191,36,.15)':'rgba(255,255,255,.06)'}`,borderRadius:'14px',overflow:'hidden'}}>
            <div style={{display:'flex',alignItems:'center',gap:'10px',padding:'13px 14px',cursor:'pointer'}} onClick={()=>setExp(exp===t.id?null:t.id)}>
              <div style={{width:'38px',height:'38px',borderRadius:'11px',background:t.type==='income'?'rgba(74,222,128,.1)':'rgba(248,113,113,.1)',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'16px',flexShrink:0}}>{t.type==='income'?'↑':'↓'}</div>
              <div style={{flex:1,minWidth:0}}>
                <p style={{fontSize:'12px',fontWeight:'600',color:'#e0e0e8',margin:'0 0 3px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{t.description}</p>
                <div style={{display:'flex',gap:'6px',alignItems:'center'}}>
                  <span style={{fontSize:'9px',color:SC[t.status]||'#606070',background:`${SC[t.status]||'#606070'}15`,padding:'1px 7px',borderRadius:'8px',fontWeight:'600'}}>{SL[t.status]||t.status}</span>
                  <span style={{fontSize:'10px',color:'#606070'}}>{fmtD(t.date)}</span>
                </div>
              </div>
              <div style={{textAlign:'right',flexShrink:0}}>
                <p style={{fontSize:'14px',fontWeight:'800',color:t.type==='income'?'#4ade80':'#f87171',margin:0,fontVariantNumeric:'tabular-nums'}}>{t.type==='expense'?'-':'+'}{fmt(Number(t.amount))}</p>
                <p style={{fontSize:'9px',color:'#606070',margin:'2px 0 0'}}>LEK</p>
              </div>
            </div>
            {exp===t.id && (
              <div style={{borderTop:'1px solid rgba(255,255,255,.06)',padding:'12px 14px',background:'rgba(255,255,255,.02)'}}>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'10px'}}>
                  {[['Lloji',t.type==='expense'?'Shpenzim':'Të Ardhurë'],['Statusi',SL[t.status]||t.status],['Ref',t.reference_no||'—'],['Kategoria',t.category_name||'—']].map(([l,v])=>(
                    <div key={l} style={{background:'rgba(255,255,255,.03)',borderRadius:'8px',padding:'8px 10px'}}>
                      <p style={{fontSize:'9px',color:'#606070',margin:'0 0 2px',textTransform:'uppercase',letterSpacing:'.5px'}}>{l}</p>
                      <p style={{fontSize:'11px',color:'#c9a84c',margin:0,fontWeight:'600'}}>{v}</p>
                    </div>
                  ))}
                </div>
                {t.notes && <p style={{fontSize:'11px',color:'#a0a0b0',margin:'0 0 10px',padding:'8px 10px',background:'rgba(255,255,255,.03)',borderRadius:'8px'}}>{t.notes}</p>}
                {t.status==='pending' && (
                  <button onClick={()=>approve(t.id)} disabled={approvingId===t.id}
                    style={{width:'100%',padding:'10px',background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.3)',borderRadius:'10px',color:'#4ade80',fontSize:'13px',fontWeight:'700',cursor:'pointer'}}>
                    {approvingId===t.id?'Duke aprovuar...':'✓ Aprovo Transaksionin'}
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
      {toast && <div style={{position:'fixed',bottom:'80px',left:'50%',transform:'translateX(-50%)',background:'#1a1a24',border:'1px solid rgba(201,168,76,.3)',color:'#c9a84c',padding:'10px 20px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',zIndex:99,whiteSpace:'nowrap'}}>{toast}</div>}
    </div>
  )
}
