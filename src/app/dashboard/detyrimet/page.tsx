'use client'
import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { fmt, fmtDate } from '@/lib/theme'

type Det = {
  id:string; lloji:string; pala:string; pershkrimi:string; referenca:string;
  shuma_totale:number; shuma_paguar:number; shuma_mbetur:number;
  norma_interesit:number; kesti_mujor:number; dita_kestit:number;
  data_fillimit:string; data_mbarimit:string; data_skadimit:string;
  statusi:string; shenime:string; progres_pct:number;
  pagesa_totale:number; pagesa_vonuara:number;
}
type Pagese = {id:string;detyrimi_id:string;data_pageses:string;shuma:number;shuma_principal:number;shuma_interesa:number;statusi:string;referenca:string;shenime:string}

const LLOJET = [
  {id:'kredi_bankare',    label:'Kredi Bankare',       icon:'🏦', color:'#67e8f9'},
  {id:'fature_e_papaguar',label:'Faturë e Papaguar',   icon:'📄', color:'#f59e0b'},
  {id:'borxh_ortaku',     label:'Borxh Ortaku',        icon:'🤝', color:'#a78bfa'},
  {id:'borxh_i_trete',    label:'Borxh i Tretë',       icon:'👤', color:'#f87171'},
  {id:'tjeter',           label:'Tjetër',               icon:'📦', color:'#888'},
]

const ST_COLOR: Record<string,string> = {aktiv:'#4ade80',paguar:'#c9a84c',vonuar:'#f87171',anuluar:'#555'}
const ST_LABEL: Record<string,string> = {aktiv:'Aktiv',paguar:'Paguar',vonuar:'Vonuar',anuluar:'Anuluar'}


export default function Detyrimet() {
  const [items, setItems] = useState<Det[]>([])
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState<Det|null>(null)
  const [pagesat, setPagesat] = useState<Pagese[]>([])
  const [showAdd, setShowAdd] = useState(false)
  const [showPay, setShowPay] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [toast, setToast] = useState('')

  const [form, setForm] = useState({
    lloji:'kredi_bankare', pala:'', pershkrimi:'', referenca:'',
    shuma_totale:'', norma_interesit:'', kesti_mujor:'', dita_kestit:'1',
    data_fillimit:new Date().toISOString().slice(0,10),
    data_mbarimit:'', data_skadimit:'', shenime:''
  })

  const [payForm, setPayForm] = useState({
    data_pageses:new Date().toISOString().slice(0,10),
    shuma:'', shuma_principal:'', shuma_interesa:'',
    statusi:'paguar', referenca:'', shenime:''
  })

  const sb = createClient()
  const showT = (m:string) => { setToast(m); setTimeout(()=>setToast(''),2500) }

  const load = useCallback(async () => {
    const {data} = await sb.from('v_detyrimet').select('*')
    setItems((data||[]) as unknown as Det[])
    setLoading(false)
  }, [])

  const loadPagesat = useCallback(async (id:string) => {
    const {data} = await sb.from('detyrimet_pagesat').select('*').eq('detyrimi_id',id).order('data_pageses',{ascending:false})
    setPagesat((data||[]) as unknown as Pagese[])
  }, [])

  useEffect(()=>{ load() },[load])

  const openDetail = (d:Det) => { setSelected(d); loadPagesat(d.id) }

  const filtered = filter==='all' ? items : items.filter(i=>i.lloji===filter||i.statusi===filter)

  const totals = {
    total: items.reduce((s,i)=>s+Number(i.shuma_totale),0),
    mbetur: items.reduce((s,i)=>s+Number(i.shuma_mbetur),0),
    paguar: items.reduce((s,i)=>s+Number(i.shuma_paguar),0),
    vonuar: items.filter(i=>i.statusi==='vonuar').length,
  }

  const saveDetyrimi = async () => {
    if (!form.pala||!form.shuma_totale||!form.pershkrimi) { showT('Plotëso fushat e detyrueshme'); return }
    setSaving(true)
    await sb.from('detyrimet').insert({
      lloji:form.lloji, pala:form.pala, pershkrimi:form.pershkrimi,
      referenca:form.referenca||null,
      shuma_totale:parseFloat(form.shuma_totale),
      norma_interesit:parseFloat(form.norma_interesit)||0,
      kesti_mujor:parseFloat(form.kesti_mujor)||0,
      dita_kestit:parseInt(form.dita_kestit)||1,
      data_fillimit:form.data_fillimit,
      data_mbarimit:form.data_mbarimit||null,
      data_skadimit:form.data_skadimit||null,
      shenime:form.shenime||null, statusi:'aktiv'
    })
    setSaving(false); setShowAdd(false)
    setForm({lloji:'kredi_bankare',pala:'',pershkrimi:'',referenca:'',shuma_totale:'',norma_interesit:'',kesti_mujor:'',dita_kestit:'1',data_fillimit:new Date().toISOString().slice(0,10),data_mbarimit:'',data_skadimit:'',shenime:''})
    showT('✓ Detyrimi u regjistrua'); load()
  }

  const savePagese = async () => {
    if (!selected||!payForm.shuma) { showT('Plotëso shumën'); return }
    setSaving(true)
    await sb.from('detyrimet_pagesat').insert({
      detyrimi_id:selected.id,
      data_pageses:payForm.data_pageses,
      shuma:parseFloat(payForm.shuma),
      shuma_principal:parseFloat(payForm.shuma_principal)||0,
      shuma_interesa:parseFloat(payForm.shuma_interesa)||0,
      statusi:payForm.statusi,
      referenca:payForm.referenca||null,
      shenime:payForm.shenime||null
    })
    setSaving(false); setShowPay(false)
    showT('✓ Pagesa u regjistrua')
    load(); loadPagesat(selected.id)
    // Refresh selected
    const {data} = await sb.from('v_detyrimet').select('*').eq('id',selected.id).single()
    if(data) setSelected(data as unknown as Det)
  }

  const lbl = (id:string) => LLOJET.find(l=>l.id===id)||LLOJET[4]

  // DETAIL VIEW
  if (selected) return (
    <div style={{padding:'20px 16px',minHeight:'100vh'}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .au{animation:fadeUp .4s ease forwards;opacity:0} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      <div className="au" style={{display:'flex',alignItems:'center',gap:'12px',marginBottom:'20px'}}>
        <button onClick={()=>setSelected(null)} style={{width:'36px',height:'36px',background:'rgba(255,255,255,.08)',border:'1px solid rgba(255,255,255,.1)',borderRadius:'10px',color:'#fff',fontSize:'16px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>‹</button>
        <div>
          <p style={{fontSize:'10px',color:'#c9a84c',textTransform:'uppercase',letterSpacing:'1.5px',margin:'0 0 2px'}}>{lbl(selected.lloji).icon} {lbl(selected.lloji).label}</p>
          <h2 style={{fontSize:'20px',fontWeight:'800',color:'#fff',margin:0,letterSpacing:'-0.5px'}}>{selected.pala}</h2>
        </div>
      </div>

      {/* HERO CARD */}
      <div className="au" style={{background:'linear-gradient(135deg,#111118,#1a1508)',border:'1px solid rgba(201,168,76,0.25)',borderRadius:'20px',padding:'20px',marginBottom:'14px',animationDelay:'.05s'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:'12px',marginBottom:'16px'}}>
          <div>
            <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Totale</p>
            <p style={{fontSize:'18px',fontWeight:'800',color:'#fff',margin:0,fontVariantNumeric:'tabular-nums'}}>{fmt(Number(selected.shuma_totale))}</p>
          </div>
          <div>
            <p style={{fontSize:'9px',color:'#4ade8088',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Paguar</p>
            <p style={{fontSize:'18px',fontWeight:'800',color:'#4ade80',margin:0,fontVariantNumeric:'tabular-nums'}}>{fmt(Number(selected.shuma_paguar))}</p>
          </div>
          <div>
            <p style={{fontSize:'9px',color:'#f8717188',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Mbetur</p>
            <p style={{fontSize:'18px',fontWeight:'800',color:'#f87171',margin:0,fontVariantNumeric:'tabular-nums'}}>{fmt(Number(selected.shuma_mbetur))}</p>
          </div>
        </div>
        {/* Progress */}
        <div style={{background:'rgba(255,255,255,.08)',borderRadius:'100px',height:'8px',overflow:'hidden',marginBottom:'8px'}}>
          <div style={{height:'100%',borderRadius:'100px',background:'linear-gradient(90deg,#c9a84c,#4ade80)',width:`${Math.min(100,Number(selected.progres_pct)||0)}%`,transition:'width 1s ease'}}></div>
        </div>
        <div style={{display:'flex',justifyContent:'space-between'}}>
          <span style={{fontSize:'10px',color:'#555'}}>{fmt(Number(selected.shuma_paguar))} L paguar</span>
          <span style={{fontSize:'10px',color:'#c9a84c',fontWeight:'700'}}>{Number(selected.progres_pct)||0}%</span>
        </div>
      </div>

      {/* DETAILS GRID */}
      <div className="au" style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'16px',padding:'16px',marginBottom:'14px',animationDelay:'.1s'}}>
        <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
          {[
            ['Interesa','%',selected.norma_interesit+'%','#f59e0b'],
            ['Kesti Mujor','LEK',fmt(Number(selected.kesti_mujor)),'#67e8f9'],
            ['Dita Kestit','',selected.dita_kestit+' i muajit','#a78bfa'],
            ['Statusi','',ST_LABEL[selected.statusi]||selected.statusi,ST_COLOR[selected.statusi]||'#888'],
            ['Fillimi','',fmtDate(selected.data_fillimit),'#c9a84c'],
            ['Mbarimi','',selected.data_mbarimit?fmtDate(selected.data_mbarimit):'—','#888'],
          ].map(([lbl,unit,val,color],i)=>(
            <div key={i} style={{background:'rgba(255,255,255,.03)',borderRadius:'10px',padding:'10px'}}>
              <p style={{fontSize:'9px',color:'#555',textTransform:'uppercase',letterSpacing:'.5px',margin:'0 0 4px'}}>{lbl}</p>
              <p style={{fontSize:'14px',fontWeight:'700',color:color as string,margin:0,fontVariantNumeric:'tabular-nums'}}>{val}</p>
            </div>
          ))}
        </div>
        {selected.pershkrimi && <div style={{marginTop:'10px',paddingTop:'10px',borderTop:'1px solid rgba(255,255,255,.06)'}}><p style={{fontSize:'9px',color:'#888',margin:'0 0 3px',textTransform:'uppercase',letterSpacing:'.5px'}}>Përshkrimi</p><p style={{fontSize:'12px',color:'#ccc',margin:0}}>{selected.pershkrimi}</p></div>}
        {selected.shenime && <p style={{fontSize:'11px',color:'#555',margin:'8px 0 0'}}>{selected.shenime}</p>}
      </div>

      {/* ADD PAYMENT BUTTON */}
      <button onClick={()=>setShowPay(!showPay)} style={{width:'100%',padding:'13px',background:showPay?'rgba(201,168,76,.15)':'linear-gradient(135deg,#c9a84c,#f0c060)',border:showPay?'1px solid rgba(201,168,76,.3)':'none',borderRadius:'14px',color:showPay?'#c9a84c':'#0a0a0f',fontSize:'14px',fontWeight:'800',cursor:'pointer',marginBottom:'14px',fontFamily:'inherit'}}>
        {showPay?'✕ Anulo':'+ Regjistro Pagesë'}
      </button>

      {showPay && (
        <div className="au" style={{background:'rgba(201,168,76,.05)',border:'1px solid rgba(201,168,76,.2)',borderRadius:'16px',padding:'16px',marginBottom:'14px'}}>
          <p style={{fontSize:'12px',fontWeight:'700',color:'#c9a84c',textTransform:'uppercase',letterSpacing:'1px',margin:'0 0 14px'}}>Pagese e Re</p>
          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              <div>
                <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Data</p>
                <input type="date" value={payForm.data_pageses} onChange={e=>setPayForm(p=>({...p,data_pageses:e.target.value}))}/>
              </div>
              <div>
                <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Shuma Totale *</p>
                <input type="number" placeholder={selected.kesti_mujor?String(selected.kesti_mujor):'0'} value={payForm.shuma} onChange={e=>setPayForm(p=>({...p,shuma:e.target.value}))}/>
              </div>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              <div>
                <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Principal</p>
                <input type="number" placeholder="0" value={payForm.shuma_principal} onChange={e=>setPayForm(p=>({...p,shuma_principal:e.target.value}))}/>
              </div>
              <div>
                <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Interesa</p>
                <input type="number" placeholder="0" value={payForm.shuma_interesa} onChange={e=>setPayForm(p=>({...p,shuma_interesa:e.target.value}))}/>
              </div>
            </div>
            <div>
              <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Statusi</p>
              <select value={payForm.statusi} onChange={e=>setPayForm(p=>({...p,statusi:e.target.value}))}>
                <option value="paguar">Paguar</option>
                <option value="planifikuar">Planifikuar</option>
                <option value="vonuar">Vonuar</option>
              </select>
            </div>
            <div>
              <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Referenca / Nr. Faturë</p>
              <input type="text" placeholder="opsional" value={payForm.referenca} onChange={e=>setPayForm(p=>({...p,referenca:e.target.value}))}/>
            </div>
            <button onClick={savePagese} disabled={saving} style={{padding:'12px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',border:'none',borderRadius:'12px',color:'#0a0a0f',fontSize:'14px',fontWeight:'800',cursor:'pointer'}}>
              {saving?'Duke regjistruar...':'Konfirmo Pagesën'}
            </button>
          </div>
        </div>
      )}

      {/* PAYMENT HISTORY */}
      <div className="au" style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'16px',padding:'16px',animationDelay:'.15s'}}>
        <p style={{fontSize:'12px',fontWeight:'700',color:'#fff',margin:'0 0 14px',textTransform:'uppercase',letterSpacing:'.8px'}}>Historia e Pagesave ({pagesat.length})</p>
        {pagesat.length===0 ? (
          <div style={{textAlign:'center',padding:'24px',color:'#444'}}>
            <p style={{fontSize:'20px',margin:'0 0 6px'}}>📋</p>
            <p style={{fontSize:'12px',margin:0}}>Nuk ka pagesa të regjistruara</p>
          </div>
        ) : pagesat.map((p,i)=>(
          <div key={p.id} style={{display:'flex',alignItems:'center',gap:'12px',padding:'11px 0',borderBottom:i<pagesat.length-1?'1px solid rgba(255,255,255,.05)':'none'}}>
            <div style={{width:'38px',height:'38px',borderRadius:'12px',flexShrink:0,display:'flex',alignItems:'center',justifyContent:'center',
              background:p.statusi==='paguar'?'rgba(74,222,128,.1)':p.statusi==='vonuar'?'rgba(248,113,113,.1)':'rgba(245,158,11,.1)',
              border:`1px solid ${p.statusi==='paguar'?'rgba(74,222,128,.2)':p.statusi==='vonuar'?'rgba(248,113,113,.2)':'rgba(245,158,11,.2)'}`}}>
              <span style={{fontSize:'14px'}}>{p.statusi==='paguar'?'✓':p.statusi==='vonuar'?'!':'○'}</span>
            </div>
            <div style={{flex:1,minWidth:0}}>
              <p style={{fontSize:'13px',fontWeight:'700',color:'#fff',margin:'0 0 3px',fontVariantNumeric:'tabular-nums'}}>{fmt(Number(p.shuma))} LEK</p>
              <div style={{display:'flex',gap:'8px',flexWrap:'wrap' as const}}>
                <span style={{fontSize:'10px',color:'#555'}}>{fmtDate(p.data_pageses)}</span>
                {Number(p.shuma_principal)>0 && <span style={{fontSize:'10px',color:'#888'}}>P: {fmt(Number(p.shuma_principal))}</span>}
                {Number(p.shuma_interesa)>0 && <span style={{fontSize:'10px',color:'#888'}}>I: {fmt(Number(p.shuma_interesa))}</span>}
                {p.referenca && <span style={{fontSize:'10px',color:'#555'}}>#{p.referenca}</span>}
              </div>
            </div>
            <span style={{fontSize:'10px',fontWeight:'600',padding:'3px 10px',borderRadius:'10px',
              background:p.statusi==='paguar'?'rgba(74,222,128,.15)':p.statusi==='vonuar'?'rgba(248,113,113,.15)':'rgba(245,158,11,.15)',
              color:p.statusi==='paguar'?'#4ade80':p.statusi==='vonuar'?'#f87171':'#f59e0b',flexShrink:0}}>
              {p.statusi==='paguar'?'Paguar':p.statusi==='vonuar'?'Vonuar':'Plan.'}
            </span>
          </div>
        ))}
      </div>

      {toast && <div style={{position:'fixed',bottom:'80px',left:'50%',transform:'translateX(-50%)',background:'#c9a84c',color:'#0a0a0f',padding:'8px 20px',borderRadius:'20px',fontSize:'12px',fontWeight:'700',zIndex:99,whiteSpace:'nowrap'}}>{toast}</div>}
    </div>
  )

  // LIST VIEW
  return (
    <div style={{padding:'20px 16px',display:'flex',flexDirection:'column',gap:'14px',minHeight:'100vh'}}>
      <style>{`@keyframes fadeUp{from{opacity:0;transform:translateY(10px)}to{opacity:1;transform:translateY(0)}} .au{animation:fadeUp .4s ease forwards;opacity:0} @keyframes spin{to{transform:rotate(360deg)}}`}</style>

      {/* HEADER */}
      <div className="au" style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start'}}>
        <div>
          <p style={{fontSize:'10px',color:'#c9a84c',textTransform:'uppercase',letterSpacing:'2px',margin:'0 0 4px'}}>Menaxhimi i Borxheve</p>
          <h1 style={{fontSize:'26px',fontWeight:'800',letterSpacing:'-1px',margin:0,background:'linear-gradient(135deg,#fff 0%,#c9a84c 100%)',WebkitBackgroundClip:'text',WebkitTextFillColor:'transparent'}}>Detyrimet</h1>
        </div>
        <button onClick={()=>setShowAdd(!showAdd)}
          style={{background:showAdd?'rgba(201,168,76,.2)':'rgba(201,168,76,.1)',border:'1px solid rgba(201,168,76,.3)',borderRadius:'12px',padding:'9px 16px',color:'#c9a84c',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>
          {showAdd?'✕':'+'}
        </button>
      </div>

      {/* TOTALS */}
      <div className="au" style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:'8px',animationDelay:'.06s'}}>
        <div style={{background:'rgba(248,113,113,.08)',border:'1px solid rgba(248,113,113,.2)',borderRadius:'14px',padding:'13px 10px',textAlign:'center'}}>
          <p style={{fontSize:'9px',color:'#f8717188',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 6px'}}>Borxh Total</p>
          <p style={{fontSize:'16px',fontWeight:'800',color:'#f87171',margin:0,fontVariantNumeric:'tabular-nums'}}>{fmt(totals.mbetur)}</p>
          <p style={{fontSize:'9px',color:'#555',margin:'2px 0 0'}}>LEK mbetur</p>
        </div>
        <div style={{background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'14px',padding:'13px 10px',textAlign:'center'}}>
          <p style={{fontSize:'9px',color:'#4ade8088',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 6px'}}>Paguar</p>
          <p style={{fontSize:'16px',fontWeight:'800',color:'#4ade80',margin:0,fontVariantNumeric:'tabular-nums'}}>{fmt(totals.paguar)}</p>
          <p style={{fontSize:'9px',color:'#555',margin:'2px 0 0'}}>LEK</p>
        </div>
        <div style={{background:totals.vonuar>0?'rgba(248,113,113,.08)':'rgba(255,255,255,.03)',border:`1px solid ${totals.vonuar>0?'rgba(248,113,113,.2)':'rgba(255,255,255,.07)'}`,borderRadius:'14px',padding:'13px 10px',textAlign:'center'}}>
          <p style={{fontSize:'9px',color:'#88888888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 6px'}}>Vonuar</p>
          <p style={{fontSize:'16px',fontWeight:'800',color:totals.vonuar>0?'#f87171':'#555',margin:0}}>{totals.vonuar}</p>
          <p style={{fontSize:'9px',color:'#555',margin:'2px 0 0'}}>detyrime</p>
        </div>
      </div>

      {/* ADD FORM */}
      {showAdd && (
        <div className="au" style={{background:'rgba(201,168,76,.05)',border:'1px solid rgba(201,168,76,.2)',borderRadius:'16px',padding:'16px',animationDelay:'0s'}}>
          <p style={{fontSize:'12px',fontWeight:'700',color:'#c9a84c',textTransform:'uppercase',letterSpacing:'1px',margin:'0 0 14px'}}>Detyrimi i Ri</p>

          {/* LLOJI SELECTOR */}
          <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 8px'}}>Lloji *</p>
          <div style={{display:'grid',gridTemplateColumns:'repeat(5,1fr)',gap:'6px',marginBottom:'14px'}}>
            {LLOJET.map(l=>(
              <button key={l.id} onClick={()=>setForm(p=>({...p,lloji:l.id}))}
                style={{padding:'8px 4px',borderRadius:'10px',border:`1px solid ${form.lloji===l.id?l.color:'rgba(255,255,255,.08)'}`,
                  background:form.lloji===l.id?`${l.color}18`:'transparent',cursor:'pointer',fontFamily:'inherit',
                  display:'flex',flexDirection:'column',alignItems:'center',gap:'4px'}}>
                <span style={{fontSize:'18px'}}>{l.icon}</span>
                <span style={{fontSize:'7px',color:form.lloji===l.id?l.color:'#555',textAlign:'center',lineHeight:1.2}}>{l.label.split(' ')[0]}</span>
              </button>
            ))}
          </div>

          <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
            <div>
              <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Pala (Banka/Furnitori/Ortaku) *</p>
              <input type="text" placeholder="p.sh. BKT, Valona Kostruksion..." value={form.pala} onChange={e=>setForm(p=>({...p,pala:e.target.value}))}/>
            </div>
            <div>
              <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Përshkrimi *</p>
              <input type="text" placeholder="p.sh. Kredi investimi magazina Fier" value={form.pershkrimi} onChange={e=>setForm(p=>({...p,pershkrimi:e.target.value}))}/>
            </div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              <div>
                <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Shuma Totale (LEK) *</p>
                <input type="number" placeholder="0" value={form.shuma_totale} onChange={e=>setForm(p=>({...p,shuma_totale:e.target.value}))}/>
              </div>
              <div>
                <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Referenca / Nr. Faturë</p>
                <input type="text" placeholder="opsional" value={form.referenca} onChange={e=>setForm(p=>({...p,referenca:e.target.value}))}/>
              </div>
            </div>
            {(form.lloji==='kredi_bankare'||form.lloji==='tjeter') && (
              <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
                <div>
                  <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Norma Interesit (%)</p>
                  <input type="number" step="0.01" placeholder="0" value={form.norma_interesit} onChange={e=>setForm(p=>({...p,norma_interesit:e.target.value}))}/>
                </div>
                <div>
                  <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Kesti Mujor (LEK)</p>
                  <input type="number" placeholder="0" value={form.kesti_mujor} onChange={e=>setForm(p=>({...p,kesti_mujor:e.target.value}))}/>
                </div>
              </div>
            )}
            {form.lloji==='kredi_bankare' && (
              <div>
                <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Dita e Kestit (1-31)</p>
                <input type="number" min="1" max="31" placeholder="1" value={form.dita_kestit} onChange={e=>setForm(p=>({...p,dita_kestit:e.target.value}))}/>
              </div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:'10px'}}>
              <div>
                <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Data Fillimit *</p>
                <input type="date" value={form.data_fillimit} onChange={e=>setForm(p=>({...p,data_fillimit:e.target.value}))}/>
              </div>
              <div>
                <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>{form.lloji==='fature_e_papaguar'?'Skadenca':'Mbarimi'}</p>
                <input type="date" value={form.lloji==='fature_e_papaguar'?form.data_skadimit:form.data_mbarimit}
                  onChange={e=>setForm(p=>form.lloji==='fature_e_papaguar'?{...p,data_skadimit:e.target.value}:{...p,data_mbarimit:e.target.value})}/>
              </div>
            </div>
            <div>
              <p style={{fontSize:'9px',color:'#888',textTransform:'uppercase',letterSpacing:'.8px',margin:'0 0 4px'}}>Shënime</p>
              <input type="text" placeholder="opsional" value={form.shenime} onChange={e=>setForm(p=>({...p,shenime:e.target.value}))}/>
            </div>
            <button onClick={saveDetyrimi} disabled={saving}
              style={{padding:'13px',background:'linear-gradient(135deg,#c9a84c,#f0c060)',border:'none',borderRadius:'12px',color:'#0a0a0f',fontSize:'14px',fontWeight:'800',cursor:'pointer',marginTop:'4px'}}>
              {saving?'Duke regjistruar...':'Regjistro Detyrimin'}
            </button>
          </div>
        </div>
      )}

      {/* FILTER TABS */}
      <div className="au" style={{display:'flex',gap:'6px',overflowX:'auto',animationDelay:'.1s',scrollbarWidth:'none' as const}}>
        <button onClick={()=>setFilter('all')} style={{flexShrink:0,padding:'6px 14px',borderRadius:'20px',border:'1px solid',fontSize:'11px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit',background:filter==='all'?'#c9a84c':'transparent',color:filter==='all'?'#0a0a0f':'#888',borderColor:filter==='all'?'#c9a84c':'rgba(255,255,255,.1)'}}>Të gjitha {items.length}</button>
        {LLOJET.map(l=>(
          <button key={l.id} onClick={()=>setFilter(l.id)} style={{flexShrink:0,padding:'6px 12px',borderRadius:'20px',border:'1px solid',fontSize:'10px',fontWeight:'600',cursor:'pointer',fontFamily:'inherit',background:filter===l.id?`${l.color}20`:'transparent',color:filter===l.id?l.color:'#555',borderColor:filter===l.id?`${l.color}60`:'rgba(255,255,255,.07)'}}>
            {l.icon} {l.label.split(' ')[0]}
          </button>
        ))}
      </div>

      {/* LIST */}
      {loading ? (
        <div style={{padding:'48px',textAlign:'center'}}><div style={{width:'28px',height:'28px',border:'2px solid #c9a84c30',borderTop:'2px solid #c9a84c',borderRadius:'50%',animation:'spin .8s linear infinite',margin:'0 auto'}}></div></div>
      ) : filtered.length===0 ? (
        <div className="au" style={{background:'rgba(255,255,255,.03)',border:'1px solid rgba(255,255,255,.07)',borderRadius:'16px',padding:'40px',textAlign:'center'}}>
          <p style={{fontSize:'36px',margin:'0 0 10px'}}>📋</p>
          <p style={{fontSize:'14px',color:'#fff',fontWeight:'600',margin:'0 0 6px'}}>Nuk ka detyrime</p>
          <p style={{fontSize:'12px',color:'#555',margin:'0 0 16px'}}>Shto kredinë, faturën ose borxhin e parë</p>
          <button onClick={()=>setShowAdd(true)} style={{background:'rgba(201,168,76,.15)',border:'1px solid rgba(201,168,76,.3)',borderRadius:'12px',padding:'10px 20px',color:'#c9a84c',fontSize:'13px',fontWeight:'700',cursor:'pointer',fontFamily:'inherit'}}>+ Shto tani</button>
        </div>
      ) : (
        <div style={{display:'flex',flexDirection:'column',gap:'10px'}}>
          {filtered.map((d,i)=>{
            const L = lbl(d.lloji)
            const pct = Math.min(100,Number(d.progres_pct)||0)
            return (
              <div key={d.id} className="au" onClick={()=>openDetail(d)}
                style={{background:'rgba(255,255,255,.03)',border:`1px solid ${d.statusi==='vonuar'?'rgba(248,113,113,.3)':'rgba(255,255,255,.07)'}`,borderRadius:'16px',padding:'16px',cursor:'pointer',animationDelay:`${.12+i*.05}s`}}>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:'10px'}}>
                  <div style={{display:'flex',alignItems:'center',gap:'10px'}}>
                    <div style={{width:'42px',height:'42px',borderRadius:'12px',background:`${L.color}15`,border:`1px solid ${L.color}30`,display:'flex',alignItems:'center',justifyContent:'center',fontSize:'20px',flexShrink:0}}>{L.icon}</div>
                    <div>
                      <p style={{fontSize:'14px',fontWeight:'700',color:'#fff',margin:'0 0 3px'}}>{d.pala}</p>
                      <div style={{display:'flex',gap:'5px',alignItems:'center'}}>
                        <span style={{fontSize:'9px',color:L.color,background:`${L.color}15`,padding:'1px 7px',borderRadius:'8px',fontWeight:'600'}}>{L.label}</span>
                        <span style={{fontSize:'9px',color:ST_COLOR[d.statusi]||'#888',background:`${ST_COLOR[d.statusi]||'#888'}15`,padding:'1px 7px',borderRadius:'8px',fontWeight:'600'}}>{ST_LABEL[d.statusi]||d.statusi}</span>
                      </div>
                    </div>
                  </div>
                  <div style={{textAlign:'right',flexShrink:0}}>
                    <p style={{fontSize:'16px',fontWeight:'800',color:'#f87171',margin:'0 0 2px',fontVariantNumeric:'tabular-nums'}}>{fmt(Number(d.shuma_mbetur))}</p>
                    <p style={{fontSize:'9px',color:'#555',margin:0}}>LEK mbetur</p>
                  </div>
                </div>
                {/* Mini progress bar */}
                <div style={{background:'rgba(255,255,255,.06)',borderRadius:'100px',height:'4px',overflow:'hidden',marginBottom:'8px'}}>
                  <div style={{height:'100%',borderRadius:'100px',background:`linear-gradient(90deg,${L.color},${L.color}88)`,width:`${pct}%`}}></div>
                </div>
                <div style={{display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                  <span style={{fontSize:'10px',color:'#555'}}>{fmt(Number(d.shuma_paguar))} / {fmt(Number(d.shuma_totale))} LEK</span>
                  <div style={{display:'flex',gap:'8px',alignItems:'center'}}>
                    {d.kesti_mujor>0 && <span style={{fontSize:'10px',color:'#67e8f9'}}>⟳ {fmt(Number(d.kesti_mujor))}/muaj</span>}
                    <span style={{fontSize:'10px',color:'#555'}}>{pct}% ›</span>
                  </div>
                </div>
                {d.pershkrimi && <p style={{fontSize:'11px',color:'#444',margin:'6px 0 0',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{d.pershkrimi}</p>}
              </div>
            )
          })}
        </div>
      )}

      {toast && <div style={{position:'fixed',bottom:'80px',left:'50%',transform:'translateX(-50%)',background:'#c9a84c',color:'#0a0a0f',padding:'8px 20px',borderRadius:'20px',fontSize:'12px',fontWeight:'700',zIndex:99,whiteSpace:'nowrap'}}>{toast}</div>}
    </div>
  )
}
