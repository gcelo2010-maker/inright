'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const CATS = ['Investime Kapitale','Shpenzime Tjera','Qira','Paga & Sigurime','Materiale & Mallra','Transport','Mirëmbajtje','Taksa & Detyrime','Kredi & Interesa']
const fmt = (n: number) => { const v=Math.abs(n); if(v>=1e6) return (n/1e6).toFixed(2)+'M'; if(v>=1000) return Math.round(n/1000)+'K'; return new Intl.NumberFormat('sq-AL').format(Math.round(n)) }
const fmtD = (d: string) => { if(!d) return ''; return new Date(d).toLocaleDateString('sq-AL',{day:'2-digit',month:'short'}) }
const SL: Record<string,string> = {pending:'Në pritje',approved:'Aprovuar',rejected:'Refuzuar',imported:'Kaluar'}
const SC: Record<string,string> = {pending:'#BA7517',approved:'#3B6D11',rejected:'#A32D2D',imported:'#185FA5'}
const SB: Record<string,string> = {pending:'#FAEEDA',approved:'#EAF3DE',rejected:'#FCEBEB',imported:'#E6F1FB'}

type Row = Record<string,unknown>

export default function ImportReviewPage() {
  const [rows, setRows] = useState<Row[]>([])
  const [filter, setFilter] = useState('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [edits, setEdits] = useState<Record<string,Partial<Row>>>({})
  const [toast, setToast] = useState('')
  const [modal, setModal] = useState<'bulk'|'transfer'|null>(null)
  const [success, setSuccess] = useState<{transferred:number,total:number}|null>(null)
  const [saving, setSaving] = useState<string|null>(null)
  const supabase = createClient()

  const showToast = (m: string) => { setToast(m); setTimeout(()=>setToast(''),2400) }

  const load = useCallback(async () => {
    const {data} = await supabase.from('import_staging').select('*').eq('import_batch','azotiku.xls').order('date',{ascending:true})
    setRows(data||[])
  }, [supabase])

  useEffect(()=>{ load() },[load])

  const counts = { all:rows.length, pending:rows.filter(r=>r.review_status==='pending').length, approved:rows.filter(r=>r.review_status==='approved').length, rejected:rows.filter(r=>r.review_status==='rejected').length, imported:rows.filter(r=>r.review_status==='imported').length }
  const totalAmt = rows.reduce((s,r)=>s+Number(r.amount),0)
  const filtered = filter==='all'?rows:rows.filter(r=>r.review_status===filter)

  const togExp = (id: string) => { setExpanded(p=>{const n=new Set(p); n.has(id)?n.delete(id):n.add(id); return n}) }
  const setEd = (id: string, f: string, v: unknown) => setEdits(p=>({...p,[id]:{...p[id],[f]:v}}))

  const save = async (id: string) => {
    const e = edits[id]
    if(!e||!Object.keys(e).length){showToast('Nuk ka ndryshime');return}
    setSaving(id)
    const {error} = await supabase.from('import_staging').update(e).eq('id',id)
    if(!error){setRows(p=>p.map(r=>r.id===id?{...r,...e}:r)); setEdits(p=>{const n={...p};delete n[id];return n}); showToast('✓ U ruajt')}
    else showToast('Gabim')
    setSaving(null)
  }

  const updSt = async (id: string, status: string) => {
    const {error} = await supabase.from('import_staging').update({review_status:status,reviewed_at:new Date().toISOString()}).eq('id',id)
    if(!error){setRows(p=>p.map(r=>r.id===id?{...r,review_status:status}:r)); setExpanded(p=>{const n=new Set(p);n.delete(id);return n}); showToast(status==='approved'?'✓ Aprovuar':'U refuzua')}
  }

  const doBulk = async () => {
    setModal(null)
    await supabase.from('import_staging').update({review_status:'approved',reviewed_at:new Date().toISOString()}).eq('review_status','pending').eq('import_batch','azotiku.xls')
    setRows(p=>p.map(r=>r.review_status==='pending'?{...r,review_status:'approved'}:r))
    showToast(`✓ ${counts.pending} aprovuan`)
  }

  const doTransfer = async () => {
    setModal(null)
    const {data} = await supabase.rpc('rpc_transfer_to_transactions',{p_batch:'azotiku.xls'})
    if(data?.success){ setSuccess({transferred:data.transferred,total:data.total_amount}); load() }
    else showToast('Gabim gjatë transferimit')
  }

  if(success) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'60vh',padding:'32px',textAlign:'center'}}>
      <div style={{width:'64px',height:'64px',background:'#EAF3DE',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'28px',margin:'0 auto 16px'}}>✓</div>
      <h2 style={{fontSize:'20px',fontWeight:'700',color:'#111',margin:'0 0 8px'}}>Import Përfundoi!</h2>
      <p style={{fontSize:'13px',color:'#6b7280',margin:'0 0 24px'}}>{success.transferred} transaksione u kaluan me sukses.</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',width:'100%',maxWidth:'280px',marginBottom:'24px'}}>
        <div style={{background:'#f9fafb',borderRadius:'12px',padding:'16px',textAlign:'center'}}>
          <div style={{fontSize:'28px',fontWeight:'700',color:'#3B6D11'}}>{success.transferred}</div>
          <div style={{fontSize:'11px',color:'#9ca3af'}}>Të kaluar</div>
        </div>
        <div style={{background:'#f9fafb',borderRadius:'12px',padding:'16px',textAlign:'center'}}>
          <div style={{fontSize:'18px',fontWeight:'700',color:'#111'}}>{fmt(success.total)}</div>
          <div style={{fontSize:'11px',color:'#9ca3af'}}>LEK</div>
        </div>
      </div>
      <button onClick={()=>{setSuccess(null);load()}} style={{background:'#111',color:'#fff',border:'none',borderRadius:'12px',padding:'13px 32px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>Kthehu</button>
    </div>
  )

  return (
    <div style={{padding:'16px',maxWidth:'430px',margin:'0 auto'}}>

      {/* STATS */}
      <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'8px',marginBottom:'12px'}}>
        {(['pending','approved','rejected','imported'] as const).map(st=>(
          <div key={st} style={{background:'#fff',border:'1px solid #f3f4f6',borderRadius:'12px',padding:'10px 4px',textAlign:'center',boxShadow:'0 1px 2px rgba(0,0,0,.04)'}}>
            <div style={{fontSize:'20px',fontWeight:'700',color:SC[st]}}>{counts[st]}</div>
            <div style={{fontSize:'8px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.4px',marginTop:'2px'}}>{SL[st]}</div>
          </div>
        ))}
      </div>
      <div style={{background:'#fff',border:'1px solid #f3f4f6',borderRadius:'12px',padding:'10px 14px',display:'flex',justifyContent:'space-between',marginBottom:'12px',boxShadow:'0 1px 2px rgba(0,0,0,.04)'}}>
        <span style={{fontSize:'12px',color:'#9ca3af'}}>Total import</span>
        <span style={{fontSize:'14px',fontWeight:'700',color:'#111',fontVariantNumeric:'tabular-nums'}}>{fmt(totalAmt)} LEK</span>
      </div>

      {/* FILTERS */}
      <div style={{display:'flex',gap:'6px',marginBottom:'12px',overflowX:'auto',paddingBottom:'4px'}}>
        {[['all','Të gjitha'],['pending','Pending'],['approved','Aprovuar'],['rejected','Refuzuar'],['imported','Kaluar']].map(([id,lbl])=>(
          <button key={id} onClick={()=>setFilter(id)}
            style={{flexShrink:0,padding:'6px 12px',borderRadius:'20px',fontSize:'11px',fontWeight:'500',border:'none',cursor:'pointer',fontFamily:'inherit',
              background:filter===id?'#111':'#f3f4f6',color:filter===id?'#fff':'#6b7280'}}>
            {lbl} {counts[id as keyof typeof counts]}
          </button>
        ))}
      </div>

      {/* ROWS */}
      {filtered.length===0&&<div style={{textAlign:'center',padding:'48px',color:'#9ca3af',fontSize:'13px'}}>Nuk ka të dhëna</div>}
      {filtered.map(r=>{
        const st = String(r.review_status); const id = String(r.id); const isExp = expanded.has(id)
        const ed = edits[id]||{}
        return (
          <div key={id} style={{background:'#fff',border:'1px solid #f3f4f6',borderRadius:'16px',overflow:'hidden',marginBottom:'10px',boxShadow:'0 1px 3px rgba(0,0,0,.04)'}}>
            <div style={{display:'flex'}}>
              <div style={{width:'4px',background:SC[st]||'#9ca3af',flexShrink:0}}/>
              <div style={{flex:1,padding:'12px 12px 12px 10px',minWidth:0}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',gap:'8px'}}>
                  <div style={{fontSize:'18px',fontWeight:'700',color:'#111',fontVariantNumeric:'tabular-nums',letterSpacing:'-0.5px'}}>
                    {fmt(Number(ed.amount!==undefined?ed.amount:r.amount))} <span style={{fontSize:'11px',fontWeight:'400',color:'#9ca3af'}}>LEK</span>
                  </div>
                  <span style={{fontSize:'9px',padding:'2px 8px',borderRadius:'20px',background:SB[st],color:SC[st],fontWeight:'600',flexShrink:0}}>{SL[st]}</span>
                </div>
                <div style={{fontSize:'12px',fontWeight:'500',color:'#111',marginTop:'6px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{String(ed.description!==undefined?ed.description:(r.description||'—'))}</div>
                <div style={{fontSize:'11px',color:'#9ca3af',marginTop:'2px'}}>{String(ed.supplier_name!==undefined?ed.supplier_name:(r.supplier_name||''))}</div>
                <div style={{display:'flex',gap:'10px',marginTop:'4px'}}>
                  <span style={{fontSize:'10px',color:'#9ca3af'}}>{fmtD(String(ed.date!==undefined?ed.date:(r.date||'')))}</span>
                  <span style={{fontSize:'10px',color:'#9ca3af'}}>{String(ed.category_name!==undefined?ed.category_name:(r.category_name||''))}</span>
                  <span style={{fontSize:'10px',color:'#9ca3af',background:'#f3f4f6',padding:'1px 6px',borderRadius:'4px'}}>{String(r.tipdok_label||'')}</span>
                </div>
              </div>
              {st!=='imported'&&<button onClick={()=>togExp(id)} style={{padding:'12px',color:'#9ca3af',background:'none',border:'none',cursor:'pointer',fontSize:'14px',flexShrink:0}}>
                {isExp?'▲':'▼'}
              </button>}
            </div>

            {isExp&&(
              <div style={{borderTop:'1px solid #f3f4f6',padding:'14px'}}>
                <div style={{background:'#f9fafb',borderRadius:'10px',padding:'10px',marginBottom:'12px'}}>
                  <div style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.5px',marginBottom:'4px',fontWeight:'600'}}>Origjinal Excel</div>
                  <div style={{fontSize:'10px',fontFamily:'monospace',color:'#6b7280',lineHeight:1.7}}>{String(r.raw_kod)}|{String(r.raw_tipdok)}-{String(r.raw_numdok)}<br/>{String(r.raw_koment1||'')}<br/>{String(r.raw_koment2||'')}</div>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'8px'}}>
                  <div>
                    <label style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.4px',display:'block',marginBottom:'4px'}}>Data</label>
                    <input type="date" defaultValue={String(r.date||'')} onChange={e=>setEd(id,'date',e.target.value)}
                      style={{width:'100%',padding:'8px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'11px',background:'#f9fafb',outline:'none'}}/>
                  </div>
                  <div>
                    <label style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.4px',display:'block',marginBottom:'4px'}}>Shuma</label>
                    <input type="number" defaultValue={Number(r.amount)} onChange={e=>setEd(id,'amount',parseFloat(e.target.value))}
                      style={{width:'100%',padding:'8px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'11px',background:'#f9fafb',outline:'none'}}/>
                  </div>
                </div>
                <div style={{marginBottom:'8px'}}>
                  <label style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.4px',display:'block',marginBottom:'4px'}}>Përshkrimi</label>
                  <input type="text" defaultValue={String(r.description||'')} onChange={e=>setEd(id,'description',e.target.value)}
                    style={{width:'100%',padding:'8px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'11px',background:'#f9fafb',outline:'none',boxSizing:'border-box'}}/>
                </div>
                <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'8px',marginBottom:'12px'}}>
                  <div>
                    <label style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.4px',display:'block',marginBottom:'4px'}}>Furnitori</label>
                    <input type="text" defaultValue={String(r.supplier_name||'')} onChange={e=>setEd(id,'supplier_name',e.target.value)}
                      style={{width:'100%',padding:'8px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'11px',background:'#f9fafb',outline:'none'}}/>
                  </div>
                  <div>
                    <label style={{fontSize:'9px',color:'#9ca3af',textTransform:'uppercase',letterSpacing:'.4px',display:'block',marginBottom:'4px'}}>Kategoria</label>
                    <select defaultValue={String(r.category_name||'')} onChange={e=>setEd(id,'category_name',e.target.value)}
                      style={{width:'100%',padding:'8px',border:'1px solid #e5e7eb',borderRadius:'8px',fontSize:'11px',background:'#f9fafb',outline:'none'}}>
                      {CATS.map(c=><option key={c}>{c}</option>)}
                    </select>
                  </div>
                </div>
                <div style={{display:'flex',gap:'8px'}}>
                  {st!=='approved'&&<button onClick={()=>updSt(id,'approved')} style={{flex:1,padding:'10px',background:'#EAF3DE',color:'#173404',border:'none',borderRadius:'10px',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>✓ Aprovo</button>}
                  {st!=='rejected'&&<button onClick={()=>updSt(id,'rejected')} style={{flex:1,padding:'10px',background:'#FCEBEB',color:'#501313',border:'none',borderRadius:'10px',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>✕ Refuzo</button>}
                  {st==='approved'&&<button onClick={()=>updSt(id,'pending')} style={{padding:'10px 14px',background:'#f3f4f6',color:'#6b7280',border:'none',borderRadius:'10px',fontSize:'12px',cursor:'pointer'}}>↩</button>}
                  <button onClick={()=>save(id)} disabled={saving===id} style={{padding:'10px 16px',background:'#f3f4f6',color:'#111',border:'none',borderRadius:'10px',fontSize:'12px',fontWeight:'600',cursor:'pointer'}}>
                    {saving===id?'...':'Ruaj'}
                  </button>
                </div>
              </div>
            )}
          </div>
        )
      })}

      {/* BOTTOM ACTIONS */}
      {(counts.pending>0||counts.approved>0)&&(
        <div style={{position:'sticky',bottom:'72px',display:'flex',gap:'8px',padding:'12px 0'}}>
          {counts.pending>0&&<button onClick={()=>setModal('bulk')} style={{flex:1,padding:'13px',background:'#BA7517',color:'#fff',border:'none',borderRadius:'12px',fontSize:'13px',fontWeight:'600',cursor:'pointer',boxShadow:'0 2px 8px rgba(186,117,23,.3)'}}>
            Aprovo të gjitha ({counts.pending})
          </button>}
          {counts.approved>0&&<button onClick={()=>setModal('transfer')} style={{flex:1,padding:'13px',background:'#3B6D11',color:'#fff',border:'none',borderRadius:'12px',fontSize:'13px',fontWeight:'600',cursor:'pointer',boxShadow:'0 2px 8px rgba(59,109,17,.3)'}}>
            Kalogo {counts.approved} → TX
          </button>}
        </div>
      )}

      {/* MODALS */}
      {modal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.4)',zIndex:50,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setModal(null)}>
          <div style={{background:'#fff',borderRadius:'20px 20px 0 0',padding:'24px',width:'100%',maxWidth:'430px'}} onClick={e=>e.stopPropagation()}>
            <h3 style={{fontSize:'16px',fontWeight:'700',color:'#111',margin:'0 0 8px'}}>{modal==='bulk'?'Aprovo të gjitha Pending':'Kalogo në Transactions'}</h3>
            <p style={{fontSize:'13px',color:'#6b7280',margin:'0 0 16px'}}>{modal==='bulk'?`${counts.pending} transaksione do të aprovohen.`:`${counts.approved} transaksione do të kalohen si të aprovuar.`}</p>
            <div style={{background:'#f9fafb',borderRadius:'12px',padding:'12px',marginBottom:'16px'}}>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',padding:'3px 0'}}>
                <span style={{color:'#9ca3af'}}>Transaksione</span>
                <span style={{fontWeight:'600'}}>{modal==='bulk'?counts.pending:counts.approved}</span>
              </div>
              <div style={{display:'flex',justifyContent:'space-between',fontSize:'13px',padding:'3px 0'}}>
                <span style={{color:'#9ca3af'}}>Shuma totale</span>
                <span style={{fontWeight:'600',color:'#3B6D11'}}>{fmt(rows.filter(r=>r.review_status===(modal==='bulk'?'pending':'approved')).reduce((s,r)=>s+Number(r.amount),0))} LEK</span>
              </div>
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>setModal(null)} style={{flex:1,padding:'12px',background:'#f3f4f6',color:'#6b7280',border:'none',borderRadius:'12px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>Anulo</button>
              <button onClick={modal==='bulk'?doBulk:doTransfer} style={{flex:1,padding:'12px',background:modal==='bulk'?'#BA7517':'#3B6D11',color:'#fff',border:'none',borderRadius:'12px',fontSize:'14px',fontWeight:'600',cursor:'pointer'}}>
                {modal==='bulk'?'Po, Aprovo':'Kalogo tani'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* TOAST */}
      {toast&&<div style={{position:'fixed',bottom:'90px',left:'50%',transform:'translateX(-50%)',background:'#111',color:'#fff',padding:'8px 18px',borderRadius:'20px',fontSize:'12px',zIndex:99,whiteSpace:'nowrap'}}>{toast}</div>}
    </div>
  )
}
