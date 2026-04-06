'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'

const fmt=(n:number)=>{if(!n&&n!==0)return'0';const v=Math.abs(n);if(v>=1e6)return(n/1e6).toFixed(2)+'M';if(v>=1000)return Math.round(n/1000)+'K';return new Intl.NumberFormat('sq-AL',{maximumFractionDigits:0}).format(n)}
const fmtD=(d:string)=>d?new Date(d).toLocaleDateString('sq-AL',{day:'2-digit',month:'short',year:'numeric'}):''
const SL:{[k:string]:string}={pending:'Pending',approved:'Aprovuar',rejected:'Refuzuar',imported:'Importuar'}
const SC:{[k:string]:string}={pending:'#fbbf24',approved:'#4ade80',rejected:'#f87171',imported:'#a78bfa'}
const CATS=['Investime Kapitale','Shpenzime Tjera','Qira','Paga & Sigurime','Materiale & Mallra','Transport','Mirëmbajtje','Taksa & Detyrime','Kredi & Interesa']

type Row={id:string;date:string;amount:number;description:string;supplier_name:string;category_name:string;tipdok_label:string;reference_no:string;review_status:string;raw_kod:string;raw_tipdok:string;raw_numdok:string;raw_koment1:string;raw_koment2:string;notes:string}

export default function ImportPage() {
  const [rows,setRows]=useState<Row[]>([])
  const [filt,setFilt]=useState('all')
  const [exp,setExp]=useState<string|null>(null)
  const [edits,setEdits]=useState<Record<string,Partial<Row>>>({})
  const [toast,setToast]=useState('')
  const [modal,setModal]=useState<'bulk'|'transfer'|null>(null)
  const [succ,setSucc]=useState<{n:number,total:number}|null>(null)
  const [saving,setSaving]=useState(false)
  const [loading,setLoading]=useState(true)
  const sb=createClient()

  const load=useCallback(async()=>{
    const{data}=await sb.from('import_staging').select('*').eq('import_batch','azotiku.xls').order('date',{ascending:true})
    setRows((data||[]) as Row[]);setLoading(false)
  },[sb])

  useEffect(()=>{load()},[load])

  const showToast=(m:string)=>{setToast(m);setTimeout(()=>setToast(''),2400)}
  const c={all:rows.length,pending:rows.filter(r=>r.review_status==='pending').length,approved:rows.filter(r=>r.review_status==='approved').length,rejected:rows.filter(r=>r.review_status==='rejected').length,imported:rows.filter(r=>r.review_status==='imported').length}
  const filtered=filt==='all'?rows:rows.filter(r=>r.review_status===filt)
  const totalAmt=rows.reduce((s,r)=>s+Number(r.amount),0)
  const setEd=(id:string,f:string,v:string|number)=>setEdits(p=>({...p,[id]:{...p[id],[f]:v}}))

  const save=async(id:string)=>{
    const e=edits[id];if(!e||!Object.keys(e).length){showToast('Nuk ka ndryshime');return}
    setSaving(true)
    await sb.from('import_staging').update(e).eq('id',id)
    setRows(p=>p.map(r=>r.id===id?{...r,...e as Row}:r))
    setEdits(p=>{const n={...p};delete n[id];return n})
    showToast('✓ U ruajt');setSaving(false)
  }

  const updSt=async(id:string,status:string)=>{
    await sb.from('import_staging').update({review_status:status,reviewed_at:new Date().toISOString()}).eq('id',id)
    setRows(p=>p.map(r=>r.id===id?{...r,review_status:status}:r))
    setExp(null);showToast(status==='approved'?'✓ Aprovuar':status==='rejected'?'✕ Refuzuar':'↩ Kthyer')
  }

  const bulkApprove=async()=>{
    setModal(null)
    await sb.from('import_staging').update({review_status:'approved',reviewed_at:new Date().toISOString()}).eq('review_status','pending').eq('import_batch','azotiku.xls')
    setRows(p=>p.map(r=>r.review_status==='pending'?{...r,review_status:'approved'}:r))
    showToast(`✓ ${c.pending} aprovuan`)
  }

  const doTransfer=async()=>{
    setModal(null)
    const{data}=await sb.rpc('rpc_transfer_to_transactions',{p_batch:'azotiku.xls'})
    if(data?.success){setSucc({n:data.transferred,total:data.total_amount});load()}
    else showToast('Gabim gjatë transferimit')
  }

  if(succ) return (
    <div style={{display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',minHeight:'70vh',padding:'32px',textAlign:'center'}}>
      <div style={{width:'80px',height:'80px',background:'rgba(74,222,128,.1)',border:'2px solid rgba(74,222,128,.3)',borderRadius:'50%',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 20px',fontSize:'32px'}}>✓</div>
      <h2 style={{fontSize:'24px',fontWeight:'800',background:'linear-gradient(135deg,#fff,#4ade80)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent',margin:'0 0 8px'}}>Import i Përfunduar!</h2>
      <p style={{fontSize:'14px',color:'#606070',margin:'0 0 28px'}}>{succ.n} transaksione u kaluan me sukses</p>
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'12px',width:'100%',maxWidth:'280px',marginBottom:'28px'}}>
        <div style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'14px',padding:'16px',textAlign:'center'}}>
          <p style={{fontSize:'30px',fontWeight:'800',color:'#4ade80',margin:0,fontVariantNumeric:'tabular-nums'}}>{succ.n}</p>
          <p style={{fontSize:'10px',color:'#606070',margin:'4px 0 0',textTransform:'uppercase',letterSpacing:'.5px'}}>Të kaluar</p>
        </div>
        <div style={{background:'rgba(201,168,76,.08)',border:'1px solid rgba(201,168,76,.2)',borderRadius:'14px',padding:'16px',textAlign:'center'}}>
          <p style={{fontSize:'20px',fontWeight:'800',color:'#c9a84c',margin:0,fontVariantNumeric:'tabular-nums'}}>{fmt(succ.total)}</p>
          <p style={{fontSize:'10px',color:'#606070',margin:'4px 0 0',textTransform:'uppercase',letterSpacing:'.5px'}}>LEK</p>
        </div>
      </div>
      <button onClick={()=>setSucc(null)} style={{background:'linear-gradient(135deg,#c9a84c,#8b5e0a)',color:'#fff',border:'none',borderRadius:'14px',padding:'14px 36px',fontSize:'14px',fontWeight:'700',cursor:'pointer',letterSpacing:'.5px'}}>Kthehu</button>
    </div>
  )

  if(loading) return <div style={{display:'flex',alignItems:'center',justifyContent:'center',height:'60vh'}}><div className="spinner"></div></div>

  return (
    <div style={{display:'flex',flexDirection:'column',minHeight:'100%'}}>
      <div style={{padding:'16px 16px 0'}}>
        {/* Stats */}
        <div className="fade-up" style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:'6px',marginBottom:'10px'}}>
          {(['pending','approved','rejected','imported'] as const).map(s=>(
            <div key={s} style={{background:'#111118',border:`1px solid ${SC[s]}20`,borderRadius:'12px',padding:'10px 6px',textAlign:'center'}}>
              <p style={{fontSize:'20px',fontWeight:'800',color:SC[s],margin:0,fontVariantNumeric:'tabular-nums'}}>{c[s]}</p>
              <p style={{fontSize:'7px',color:'#606070',margin:'3px 0 0',textTransform:'uppercase',letterSpacing:'.3px'}}>{SL[s]}</p>
            </div>
          ))}
        </div>
        <div className="fade-up fade-up-1" style={{background:'rgba(201,168,76,.06)',border:'1px solid rgba(201,168,76,.15)',borderRadius:'12px',padding:'10px 14px',display:'flex',justifyContent:'space-between',marginBottom:'10px'}}>
          <span style={{fontSize:'11px',color:'#606070'}}>Total · azotiku.xls</span>
          <span style={{fontSize:'13px',fontWeight:'700',color:'#c9a84c',fontVariantNumeric:'tabular-nums'}}>{fmt(totalAmt)} LEK</span>
        </div>
        {/* Filter tabs */}
        <div className="fade-up fade-up-2" style={{display:'flex',gap:'5px',overflowX:'auto',marginBottom:'10px',scrollbarWidth:'none'}}>
          {[['all','Të gjitha'],['pending','Pending'],['approved','Aprovuar'],['rejected','Refuzuar'],['imported','Importuar']].map(([id,lbl])=>(
            <button key={id} onClick={()=>setFilt(id)} style={{flexShrink:0,padding:'5px 12px',borderRadius:'20px',border:`1px solid ${filt===id?'#c9a84c':'rgba(255,255,255,.08)'}`,fontSize:'10px',fontWeight:'600',cursor:'pointer',background:filt===id?'rgba(201,168,76,.15)':'transparent',color:filt===id?'#c9a84c':'#606070',transition:'all .15s'}}>
              {lbl} {c[id as keyof typeof c]}
            </button>
          ))}
        </div>
      </div>

      {/* Cards */}
      <div style={{flex:1,padding:'0 16px',paddingBottom:(c.pending>0||c.approved>0)?'90px':'16px',display:'flex',flexDirection:'column',gap:'8px'}}>
        {filtered.length===0 && <p style={{textAlign:'center',color:'#606070',padding:'48px',fontSize:'13px'}}>Nuk ka të dhëna</p>}
        {filtered.map(r=>{
          const ed=edits[r.id]||{};const st=r.review_status;const isE=exp===r.id
          return (
            <div key={r.id} style={{background:'#111118',border:`1px solid ${SC[st]}20`,borderRadius:'14px',overflow:'hidden'}}>
              <div style={{display:'flex',cursor:'pointer'}} onClick={()=>setExp(isE?null:r.id)}>
                <div style={{width:'3px',background:SC[st],flexShrink:0}}></div>
                <div style={{flex:1,padding:'12px',minWidth:0}}>
                  <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'5px'}}>
                    <span style={{fontSize:'16px',fontWeight:'800',color:'#fff',fontVariantNumeric:'tabular-nums'}}>{fmt(Number(ed.amount??r.amount))} <span style={{fontSize:'10px',color:'#606070',fontWeight:'400'}}>LEK</span></span>
                    <span style={{fontSize:'9px',background:'rgba(255,255,255,.06)',color:'#a0a0b0',padding:'2px 8px',borderRadius:'8px',flexShrink:0}}>{r.tipdok_label}</span>
                  </div>
                  <div style={{display:'flex',gap:'5px',marginBottom:'5px',flexWrap:'wrap'}}>
                    <span style={{fontSize:'9px',background:`${SC[st]}15`,color:SC[st],padding:'2px 8px',borderRadius:'8px',fontWeight:'700'}}>{SL[st]}</span>
                    {r.reference_no&&<span style={{fontSize:'9px',background:'rgba(255,255,255,.05)',color:'#606070',padding:'2px 8px',borderRadius:'8px'}}>{r.reference_no}</span>}
                  </div>
                  <p style={{fontSize:'12px',color:'#e0e0e8',margin:'0 0 2px',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{String(ed.description??r.description)}</p>
                  <p style={{fontSize:'10px',color:'#606070',margin:'0 0 2px'}}>{String(ed.supplier_name??r.supplier_name)}</p>
                  <p style={{fontSize:'9px',color:'#404050',margin:0}}>{fmtD(String(ed.date??r.date))} · {String(ed.category_name??r.category_name)}</p>
                </div>
                {st!=='imported'&&<div style={{padding:'12px 12px 12px 4px',color:'#404050',fontSize:'12px',display:'flex',alignItems:'center',flexShrink:0}}>{isE?'▲':'▼'}</div>}
              </div>
              {isE&&(
                <div style={{borderTop:'1px solid rgba(255,255,255,.05)',padding:'14px',background:'rgba(0,0,0,.2)'}}>
                  <div style={{background:'rgba(255,255,255,.03)',borderRadius:'10px',padding:'10px 12px',marginBottom:'12px',fontFamily:'monospace'}}>
                    <p style={{fontSize:'8px',color:'#c9a84c',textTransform:'uppercase',letterSpacing:'.8px',fontWeight:'700',margin:'0 0 5px',fontFamily:'system-ui'}}>Origjinal Excel</p>
                    <p style={{fontSize:'10px',color:'#606070',margin:0,lineHeight:1.8}}>{r.raw_kod}|{r.raw_tipdok}-{r.raw_numdok}<br/>{r.raw_koment1}<br/>{r.raw_koment2}</p>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'7px',marginBottom:'7px'}}>
                    <div>
                      <label style={{fontSize:'8px',color:'#606070',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'4px'}}>Data</label>
                      <input type="date" defaultValue={String(r.date)} onChange={e=>setEd(r.id,'date',e.target.value)}
                        style={{width:'100%',padding:'7px 10px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'8px',fontSize:'11px',color:'#fff',boxSizing:'border-box'}}/>
                    </div>
                    <div>
                      <label style={{fontSize:'8px',color:'#606070',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'4px'}}>Shuma</label>
                      <input type="number" defaultValue={Number(r.amount)} onChange={e=>setEd(r.id,'amount',parseFloat(e.target.value))}
                        style={{width:'100%',padding:'7px 10px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'8px',fontSize:'11px',color:'#fff',boxSizing:'border-box'}}/>
                    </div>
                  </div>
                  <div style={{marginBottom:'7px'}}>
                    <label style={{fontSize:'8px',color:'#606070',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'4px'}}>Përshkrimi</label>
                    <input type="text" defaultValue={r.description} onChange={e=>setEd(r.id,'description',e.target.value)}
                      style={{width:'100%',padding:'7px 10px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'8px',fontSize:'11px',color:'#fff',boxSizing:'border-box'}}/>
                  </div>
                  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'7px',marginBottom:'12px'}}>
                    <div>
                      <label style={{fontSize:'8px',color:'#606070',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'4px'}}>Furnitori</label>
                      <input type="text" defaultValue={r.supplier_name} onChange={e=>setEd(r.id,'supplier_name',e.target.value)}
                        style={{width:'100%',padding:'7px 10px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'8px',fontSize:'11px',color:'#fff',boxSizing:'border-box'}}/>
                    </div>
                    <div>
                      <label style={{fontSize:'8px',color:'#606070',textTransform:'uppercase',letterSpacing:'.5px',display:'block',marginBottom:'4px'}}>Kategoria</label>
                      <select defaultValue={r.category_name} onChange={e=>setEd(r.id,'category_name',e.target.value)}
                        style={{width:'100%',padding:'7px 10px',background:'#1a1a24',border:'1px solid rgba(255,255,255,.1)',borderRadius:'8px',fontSize:'11px',color:'#fff',boxSizing:'border-box'}}>
                        {CATS.map(c=><option key={c} style={{background:'#1a1a24'}}>{c}</option>)}
                      </select>
                    </div>
                  </div>
                  <div style={{display:'flex',gap:'7px'}}>
                    {st!=='approved'&&<button onClick={()=>updSt(r.id,'approved')} style={{flex:1,padding:'9px',background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.3)',borderRadius:'10px',color:'#4ade80',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>✓ Aprovo</button>}
                    {st!=='rejected'&&<button onClick={()=>updSt(r.id,'rejected')} style={{flex:1,padding:'9px',background:'rgba(248,113,113,.1)',border:'1px solid rgba(248,113,113,.3)',borderRadius:'10px',color:'#f87171',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>✕ Refuzo</button>}
                    {st==='approved'&&<button onClick={()=>updSt(r.id,'pending')} style={{padding:'9px 12px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'10px',color:'#a0a0b0',fontSize:'12px',cursor:'pointer'}}>↩</button>}
                    <button onClick={()=>save(r.id)} disabled={saving} style={{padding:'9px 16px',background:'rgba(201,168,76,.1)',border:'1px solid rgba(201,168,76,.3)',borderRadius:'10px',color:'#c9a84c',fontSize:'12px',fontWeight:'600',cursor:'pointer',flexShrink:0}}>{saving?'...':'Ruaj'}</button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom bar */}
      {(c.pending>0||c.approved>0)&&(
        <div style={{position:'fixed',bottom:'60px',left:'50%',transform:'translateX(-50%)',width:'100%',maxWidth:'430px',padding:'10px 16px',background:'rgba(10,10,15,.98)',backdropFilter:'blur(20px)',borderTop:'1px solid rgba(201,168,76,.1)',display:'flex',gap:'8px',zIndex:30}}>
          {c.pending>0&&<button onClick={()=>setModal('bulk')} style={{flex:1,padding:'11px',background:'rgba(251,191,36,.1)',border:'1px solid rgba(251,191,36,.3)',color:'#fbbf24',borderRadius:'12px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>Aprovo të gjitha ({c.pending})</button>}
          {c.approved>0&&<button onClick={()=>setModal('transfer')} style={{flex:1,padding:'11px',background:'rgba(74,222,128,.1)',border:'1px solid rgba(74,222,128,.3)',color:'#4ade80',borderRadius:'12px',fontSize:'12px',fontWeight:'700',cursor:'pointer'}}>Kalogo {c.approved} → TX</button>}
        </div>
      )}

      {/* Modal */}
      {modal&&(
        <div style={{position:'fixed',inset:0,background:'rgba(0,0,0,.7)',backdropFilter:'blur(10px)',zIndex:50,display:'flex',alignItems:'flex-end',justifyContent:'center'}} onClick={()=>setModal(null)}>
          <div style={{background:'#1a1a24',borderRadius:'20px 20px 0 0',padding:'24px',width:'100%',maxWidth:'430px',border:'1px solid rgba(201,168,76,.15)'}} onClick={e=>e.stopPropagation()}>
            <div style={{width:'40px',height:'4px',background:'rgba(255,255,255,.1)',borderRadius:'2px',margin:'0 auto 20px'}}></div>
            <h3 style={{fontSize:'18px',fontWeight:'700',color:'#fff',margin:'0 0 6px'}}>{modal==='bulk'?'Aprovo të gjitha':'Kalogo në Transactions'}</h3>
            <p style={{fontSize:'13px',color:'#606070',margin:'0 0 16px'}}>{modal==='bulk'?`${c.pending} transaksione do të aprovohen automatikisht.`:`${c.approved} transaksione kalohen si të aprovuar.`}</p>
            <div style={{background:'rgba(255,255,255,.04)',borderRadius:'12px',padding:'14px',marginBottom:'16px'}}>
              {[['Transaksione',modal==='bulk'?c.pending:c.approved],['Shuma LEK',fmt(rows.filter(r=>r.review_status===(modal==='bulk'?'pending':'approved')).reduce((s,r)=>s+Number(r.amount),0))]].map(([l,v])=>(
                <div key={String(l)} style={{display:'flex',justifyContent:'space-between',padding:'4px 0'}}>
                  <span style={{fontSize:'12px',color:'#606070'}}>{l}</span>
                  <span style={{fontSize:'13px',fontWeight:'700',color:'#c9a84c'}}>{v}</span>
                </div>
              ))}
            </div>
            <div style={{display:'flex',gap:'10px'}}>
              <button onClick={()=>setModal(null)} style={{flex:1,padding:'13px',background:'rgba(255,255,255,.06)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'12px',fontSize:'14px',color:'#a0a0b0',cursor:'pointer'}}>Anulo</button>
              <button onClick={modal==='bulk'?bulkApprove:doTransfer} style={{flex:1,padding:'13px',background:modal==='bulk'?'rgba(251,191,36,.15)':'rgba(74,222,128,.15)',border:`1px solid ${modal==='bulk'?'rgba(251,191,36,.4)':'rgba(74,222,128,.4)'}`,borderRadius:'12px',fontSize:'14px',fontWeight:'700',color:modal==='bulk'?'#fbbf24':'#4ade80',cursor:'pointer'}}>
                {modal==='bulk'?'Po, Aprovo':'Kalogo tani'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast&&<div style={{position:'fixed',bottom:'80px',left:'50%',transform:'translateX(-50%)',background:'#1a1a24',border:'1px solid rgba(201,168,76,.3)',color:'#c9a84c',padding:'10px 20px',borderRadius:'20px',fontSize:'12px',fontWeight:'600',zIndex:99,whiteSpace:'nowrap'}}>{toast}</div>}
    </div>
  )
}
