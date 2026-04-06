'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const fmt = (n: number) => {
  if (!n) return '0'
  if (Math.abs(n) >= 1e6) return (n/1e6).toFixed(2)+'M'
  if (Math.abs(n) >= 1000) return Math.round(n/1000)+'K'
  return new Intl.NumberFormat('sq-AL',{maximumFractionDigits:0}).format(n)
}
const fmtD = (d: string) => d ? new Date(d).toLocaleDateString('sq-AL',{day:'2-digit',month:'short',year:'numeric'}) : ''

type Row = {
  id: string; date: string; amount: number; description: string;
  supplier_name: string; category_name: string; tipdok_label: string;
  reference_no: string; review_status: string;
  raw_kod: string; raw_tipdok: string; raw_numdok: string;
  raw_koment1: string; raw_koment2: string; notes: string;
}

const ST_COLOR: Record<string,string> = {pending:'#f59e0b',approved:'#16a34a',rejected:'#dc2626',imported:'#6366f1'}
const ST_BG: Record<string,string> = {pending:'#fffbeb',approved:'#f0fdf4',rejected:'#fef2f2',imported:'#eef2ff'}
const ST_LABEL: Record<string,string> = {pending:'Në pritje',approved:'Aprovuar',rejected:'Refuzuar',imported:'Kaluar'}
const CATS = ['Investime Kapitale','Shpenzime Tjera','Qira','Paga & Sigurime','Materiale & Mallra','Transport','Mirëmbajtje','Taksa & Detyrime','Kredi & Interesa']

export default function ImportReviewPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<string|null>(null)
  const [edits, setEdits] = useState<Record<string,Partial<Row>>>({})
  const [toast, setToast] = useState('')
  const [modal, setModal] = useState<'bulk'|'transfer'|null>(null)
  const [success, setSuccess] = useState<{n:number,total:number}|null>(null)
  const [saving, setSaving] = useState(false)

  const sb = createClient()

  const load = useCallback(async () => {
    const {data} = await sb.from('import_staging').select('*').eq('import_batch','azotiku.xls').order('date',{ascending:true})
    setRows((data||[]) as Row[])
  }, [sb])

  useEffect(() => { load() }, [load])

  const showToast = (m: string) => { setToast(m); setTimeout(()=>setToast(''),2500) }

  const c = {
    all: rows.length,
    pending: rows.filter(r=>r.review_status==='pending').length,
    approved: rows.filter(r=>r.review_status==='approved').length,
    rejected: rows.filter(r=>r.review_status==='rejected').length,
    imported: rows.filter(r=>r.review_status==='imported').length,
  }
  const filtered = filter==='all' ? rows : rows.filter(r=>r.review_status===filter)
  const totalAmt = rows.reduce((s,r)=>s+Number(r.amount),0)

  const setEd = (id: string, f: string, v: string|number) => setEdits(p=>({...p,[id]:{...p[id],[f]:v}}))

  const save = async (id: string) => {
    const e = edits[id]
    if (!e||!Object.keys(e).length) { showToast('Nuk ka ndryshime'); return }
    setSaving(true)
    await sb.from('import_staging').update(e).eq('id',id)
    setRows(p=>p.map(r=>r.id===id?{...r,...e}:r))
    setEdits(p=>{const n={...p};delete n[id];return n})
    showToast('✓ U ruajt')
    setSaving(false)
  }

  const updateSt = async (id: string, status: string) => {
    await sb.from('import_staging').update({review_status:status,reviewed_at:new Date().toISOString()}).eq('id',id)
    setRows(p=>p.map(r=>r.id===id?{...r,review_status:status}:r))
    setExpanded(null)
    showToast(status==='approved'?'✓ Aprovuar':status==='rejected'?'U refuzua':'↩ Kthyer')
  }

  const bulkApprove = async () => {
    setModal(null)
    await sb.from('import_staging').update({review_status:'approved',reviewed_at:new Date().toISOString()}).eq('review_status','pending').eq('import_batch','azotiku.xls')
    setRows(p=>p.map(r=>r.review_status==='pending'?{...r,review_status:'approved'}:r))
    showToast(`✓ ${c.pending} aprovuan`)
  }

  const doTransfer = async () => {
    setModal(null)
    const {data} = await sb.rpc('rpc_transfer_to_transactions',{p_batch:'azotiku.xls'})
    if (data?.success) { setSuccess({n:data.transferred,total:data.total_amount}); load() }
    else showToast('Gabim gjatë transferimit')
  }

  if (success) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'70vh',padding:'32px',textAlign:'center'}}>
      <div style={{width:'72px',height:'72px',background:'#f0fdf4',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 16px',fontSize:'32px'}}>✓</div>
      <h2 style={{fontSize:'22px',fontWeight:'700',color:'#111',margin:'0 0 8px'}}>Import i Përfunduar!</h2>
      <p style={{fontSize:'14px',color:'#6b7280',margin:'0 0 24px'}}>{success.n} transaksione u kaluan me sukses.</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px',width:'100%',maxWidth:'280px',marginBottom:'24px'}}>
        <div style={{background:'#f0fdf4',borderRadius:'12px',padding:'14px',textAlign:'center'}}>
          <p style={{fontSize:'28px',fontWeight:'700',color:'#16a34a',margin:0}}>{success.n}</p>
          <p style={{fontSize:'11px',color:'#6b7280',margin:'4px 0 0'}}>Të kaluar</p>
        </div>
        <div style={{background:'#f9fafb',borderRadius:'12px',padding:'14px',textAlign:'center'}}>
          <p style={{fontSize:'20px',fontWeight:'700',color:'#111',margin:0}}>{fmt(success.total)}</p>
          <p style={{fontSize:'11px',color:'#6b7280',margin:'4px 0 0'}}>LEK total</p>
        </div>
      </div>
      <button onClick={()=>setSuccess(null)} style={{background:'#111',color:'#fff',border:'none',borderRadius:'12px',padding:'13px 32px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>Kthehu</button>
    </div>
  )

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100%'}}>
      {/* Summary */}
      <div style={{padding:'16px 16px 0'}}>
        <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',marginBottom:'10px'}}>
          {(['pending','approved','rejected','imported'] as const).map(s=>(
            <div key={s} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'10px 6px',textAlign:'center'}}>
              <p style={{fontSize:'20px',fontWeight:'700',color:ST_COLOR[s],margin:0,fontVariantNumeric:'tabular-nums'}}>{c[s]}</p>
              <p style={{fontSize:'8px',color:'#9ca3af',margin:'3px 0 0',textTransform:'uppercase',letterSpacing:'.3px'}}>{ST_LABEL[s]}</p>
            </div>
          ))}
        </div>
        <div style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'12px',padding:'10px 14px',display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
          <span style={{fontSize:'12px',color:'#6b7280'}}>Total import azotiku.xls</span>
          <span style={{fontSize:'14px',fontWeight:'700',fontVariantNumeric:'tabular-nums'}}>{fmt(totalAmt)} LEK</span>
        </div>
        {/* Filter tabs */}
        <div style={{display:'flex',gap:'6px',overflowX:'auto',marginBottom:'10px',scrollbarWidth:'none'}}>
          {[['all','Të gjitha'],['pending','Pending'],['approved','Aprovuar'],['rejected','Refuzuar'],['imported','Kaluar']].map(([id,lbl])=>(
            <button key={id} onClick={()=>setFilter(id)}
              style={{flexShrink:0,padding:'5px 12px',borderRadius:'20px',border:'1px solid',fontSize:'11px',fontWeight:'500',cursor:'pointer',fontFamily:'inherit',
                background:filter===id?'#111':'#fff',color:filter===id?'#fff':'#6b7280',borderColor:filter===id?'#111':'#e5e7eb'}}>
              {lbl} {c[id as keyof typeof c]}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{flex:1,padding:'0 16px',paddingBottom:c.pending>0||c.approved>0?'90px':'16px',display:'flex',flexDirection:'column',gap:'8px'}}>
        {filtered.length===0 && <div style={{textAlign:'center',padding:'48px',color:'#9ca3af',fontSize:'13px'}}>Nuk ka të dhëna</div>}
        {filtered.map(r=>{
          const ed = edits[r.id]||{}
          const st = r.review_status
          const isExp = expanded===r.id
          return (
            <div key={r.id} style={{background:'#fff',border:'1px solid #e5e7eb',borderRadius:'14px',overflow:'hidden'}}>
              <div style={{display:'flex'}}>
                <div style={{width:'4px',background:ST_COLOR[st],flexShrink:0}}></div>
                <div style={{flex:1,padding:'12px',minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'6px'}}>
                    <span style={{fontSize:'18px',fontWeight:'700',color:'#111',fontVariantNumeric:'tabular-nums'}}>{fmt(Number(ed.amount??r.amount))} <span style={{fontSize:'11px',color:'#9ca3af',fontWeight:'400'}}>LEK</span></span>
                    <span style={{fontSize:'10px',background:'#f3f4f6',color:'#6b7280',padding:'2px 8px',borderRadius:'8px',flexShrink:0}}>{r.tipdok_label}</span>
                  </div>
                  <div style={{display:'flex',gap:'6px',marginBottom:'6px',flexWrap:'wrap'}}>
                    <span style={{fontSize:'10px',background:ST_BG[st],color:ST_COLOR[st],padding:'2px 8px',borderRadius:'8px',fontWeight:'500'}}>{ST_LABEL[st]}</span>
                    {r.reference_no && <span style={{fontSize:'10px',background:'#f3f4f6',color:'#6b7280',padding:'2px 8px',borderRadius:'8px'}}>{r.reference_no}</span>}
                    {edits[r.id]&&Object.keys(edits[r.id]).length>0 && <span style={{fontSize:'10px',background:'#eef2ff',color:'#6366f1',padding:'2px 8px',borderRadius:'8px'}}>● Ndryshuar</span>}
                  </div>
                  <p style={{fontSize:'13px',color:'#111',margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{String(ed.description??r.description)}</p>
                  <p style={{fontSize:'11px',color:'#6b7280',margin:'0 0 3px'}}>{String(ed.supplier_name??r.supplier_name)}</p>
                  <p style={{fontSize:'10px',color:'#9ca3af',margin:0}}>{fmtD(String(ed.date??r.date))} · {String(ed.category_name??r.category_name)}</p>
                </div>
                {st!=='imported' && (
                  <button onClick={()=>setExpanded(isExp?null:r.id)}
                    style={{padding:'12px 14px 12px 4px',border:'none',background:'none',cursor:'pointer',color:'#9ca3af',fontSize:'16px',flexShrink:0,display:'flex',alignItems:'center'}}>
                    {isExp?'▲':'▼'}
                  </button>
                )}
              </div>

              {isExp && (
                <div style={{borderTop:'1px solid #f3f4f6',padding:'14px',background:'#fafafa'}}>
                  {/* Original data */}
                  <div style={{background:'#f1f0e8',borderRadius:'10px',padding:'10px 12px',marginBottom:'12px'}}>
                    <p style={{fontSize:'9px',color:'#78716c',textTransform:'uppercase',letterSpacing:'.5px',fontWeight:'600',margin:'0 0 4px'}}>Origjinal Excel</p>
                    <p style={{fontSize:'10px',fontFamily:'monospace',color:'#57534e',margin:0,lineHeight:1.7}}>
                      KOD: {r.raw_kod} | {r.raw_tipdok}-{r.raw_numdok}<br/>
                      {r.raw_koment1}<br/>
                      {r.raw_koment2}
                    </p>
                  </div>
                  {/* Edit fields */}
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'8px'}}>
                    <div>
                      <label style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.4px',display:'block',marginBottom:'4px'}}>Data</label>
                      <input type="date" defaultValue={String(r.date)} onChange={e=>setEd(r.id,'date',e.target.value)}
                        style={{width:'100%',padding:'7px 10px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'12px',boxSizing:'border-box'}}/>
                    </div>
                    <div>
                      <label style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.4px',display:'block',marginBottom:'4px'}}>Shuma</label>
                      <input type="number" defaultValue={Number(r.amount)} onChange={e=>setEd(r.id,'amount',parseFloat(e.target.value))}
                        style={{width:'100%',padding:'7px 10px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'12px',boxSizing:'border-box'}}/>
                    </div>
                  </div>
                  <div style={{marginBottom:'8px'}}>
                    <label style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.4px',display:'block',marginBottom:'4px'}}>Përshkrimi</label>
                    <input type="text" defaultValue={r.description} onChange={e=>setEd(r.id,'description',e.target.value)}
                      style={{width:'100%',padding:'7px 10px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'12px',boxSizing:'border-box'}}/>
                  </div>
                  <div style={{marginBottom:'8px'}}>
                    <label style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.4px',display:'block',marginBottom:'4px'}}>Furnitori</label>
                    <input type="text" defaultValue={r.supplier_name} onChange={e=>setEd(r.id,'supplier_name',e.target.value)}
                      style={{width:'100%',padding:'7px 10px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'12px',boxSizing:'border-box'}}/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                    <div>
                      <label style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.4px',display:'block',marginBottom:'4px'}}>Kategoria</label>
                      <select defaultValue={r.category_name} onChange={e=>setEd(r.id,'category_name',e.target.value)}
                        style={{width:'100%',padding:'7px 10px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'12px',boxSizing:'border-box'}}>
                        {CATS.map(c=><option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.4px',display:'block',marginBottom:'4px'}}>Shënime</label>
                      <input type="text" defaultValue={r.notes||''} onChange={e=>setEd(r.id,'notes',e.target.value)}
                        style={{width:'100%',padding:'7px 10px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'12px',boxSizing:'border-box'}}/>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div style={{display:'flex',gap:'8px'}}>
                    {st!=='approved' && <button onClick={()=>updateSt(r.id,'approved')} style={{flex:1,padding:'9px',background:'#f0fdf4',color:'#16a34a',border:'1px solid #bbf7d0',borderRadius:'10px',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>✓ Aprovo</button>}
                    {st!=='rejected' && <button onClick={()=>updateSt(r.id,'rejected')} style={{flex:1,padding:'9px',background:'#fef2f2',color:'#dc2626',border:'1px solid #fecaca',borderRadius:'10px',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>✕ Refuzo</button>}
                    {st==='approved' && <button onClick={()=>updateSt(r.id,'pending')} style={{padding:'9px 14px',background:'#f9fafb',color:'#6b7280',border:'1px solid #e5e7eb',borderRadius:'10px',fontSize:'12px',cursor:'pointer'}}>↩</button>}
                    <button onClick={()=>save(r.id)} disabled={saving} style={{padding:'9px 16px',background:'#f9fafb',color:'#111',border:'1px solid #e5e7eb',borderRadius:'10px',fontSize:'12px',fontWeight:'500',cursor:'pointer',flexShrink:0}}>
                      {saving?'...':'Ruaj'}
                    </button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom bar */}
      {(c.pending>0||c.approved>0) && (
        <div style={{position:'fixed',bottom:'60px',left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',padding:'10px 16px',background:'rgba(255,255,255,.95)',backdropFilter:'blur(10px)',borderTop:'1px solid #e5e7eb',display:'flex',gap:'8px',zIndex:30}}>
          {c.pending>0 && <button onClick={()=>setModal('bulk')} style={{flex:1,padding:'11px',background:'#f59e0b',color:'#fff',border:'none',borderRadius:'12px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>Aprovo të gjitha ({c.pending})</button>}
          {c.approved>0 && <button onClick={()=>setModal('transfer')} style={{flex:1,padding:'11px',background:'#16a34a',color:'#fff',border:'none',borderRadius:'12px',fontSize:'13px',fontWeight:'600',cursor:'pointer'}}>Kalogo {c.approved} → TX</button>}
        </div>
      )}

      {/* Modals */}
      {modal && (
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.5)',zIndex:50,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setModal(null)}>
          <div style={{background:'#fff',borderRadius:'20px 20px 0 0',padding:'24px',width:'100%',maxWidth:'430px'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:'16px',fontWeight:'700',margin:'0 0 6px'}}>{modal==='bulk'?'Aprovo të gjitha':'Kalogo në Transactions'}</h3>
            <p style={{fontSize:'13px',color:'#6b7280',margin:'0 0 16px'}}>{modal==='bulk'?`${c.pending} transaksione do të aprovohen.`:`${c.approved} transaksione kalohen si të aprovuar.`}</p>
            <div style={{background:'#f9fafb',borderRadius:'12px',padding:'12px',marginBottom:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',padding:'3px 0'}}>
                <span style={{color:'#6b7280'}}>Transaksione</span><span style={{fontWeight:'600'}}>{modal==='bulk'?c.pending:c.approved}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',padding:'3px 0'}}>
                <span style={{color:'#6b7280'}}>Shuma</span>
                <span style={{fontWeight:'600',color:'#16a34a'}}>{fmt(rows.filter(r=>r.review_status===(modal==='bulk'?'pending':'approved')).reduce((s,r)=>s+Number(r.amount),0))} LEK</span>
              </div>
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>setModal(null)} style={{flex:1,padding:'12px',background:'#f9fafb',border:'1px solid #e5e7eb',borderRadius:'12px',fontSize:'14px',cursor:'pointer'}}>Anulo</button>
              <button onClick={modal==='bulk'?bulkApprove:doTransfer} style={{flex:1,padding:'12px',background:modal==='bulk'?'#f59e0b':'#16a34a',color:'#fff',border:'none',borderRadius:'12px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>
                {modal==='bulk'?'Po, Aprovo':'Kalogo tani'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && <div style={{position:'fixed',bottom:'80px',left:'50%',transform:'translateX(-50%)',background:'#111',color:'#fff',padding:'8px 18px',borderRadius:'20px',fontSize:'12px',zIndex:99,whiteSpace:'nowrap'}}>{toast}</div>}
    </div>
  )
}
