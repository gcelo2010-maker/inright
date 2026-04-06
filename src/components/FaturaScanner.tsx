'use client'
import { useState, useRef } from 'react'

type OCRResult = {
  pala?: string
  pershkrimi?: string
  referenca?: string
  shuma_totale?: string
  data_skadimit?: string
  data_fillimit?: string
  shenime?: string
  raw?: string
}

type Props = {
  onResult: (data: OCRResult, imageUrl: string) => void
  supabaseUrl: string
  supabaseKey: string
}

export default function FaturaScanner({ onResult, supabaseUrl, supabaseKey }: Props) {
  const [scanning, setScanning] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  const handleFile = async (file: File) => {
    if (!file) return
    setError('')
    setDone(false)

    // Preview
    const reader = new FileReader()
    reader.onload = (e) => setPreview(e.target?.result as string)
    reader.readAsDataURL(file)

    setScanning(true)

    try {
      // 1. Upload to Supabase Storage
      const filename = `faturat/${Date.now()}-${file.name.replace(/\s/g,'_')}`
      const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/${filename}`, {
        method: 'POST',
        headers: {
          'apikey': supabaseKey,
          'Authorization': `Bearer ${supabaseKey}`,
          'Content-Type': file.type,
        },
        body: file
      })

      let imageUrl = ''
      if (uploadRes.ok) {
        imageUrl = `${supabaseUrl}/storage/v1/object/public/${filename}`
      }

      // 2. Convert to base64 for Claude API
      const base64 = await new Promise<string>((resolve) => {
        const r = new FileReader()
        r.onload = () => resolve((r.result as string).split(',')[1])
        r.readAsDataURL(file)
      })

      // 3. Call Claude API with vision
      const claudeRes = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          model: 'claude-sonnet-4-20250514',
          max_tokens: 1000,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: file.type as 'image/jpeg' | 'image/png' | 'image/webp',
                  data: base64
                }
              },
              {
                type: 'text',
                text: `Analize këtë faturë/dokument financiar dhe ekstrago informacionin në formatin JSON të mëposhtëm. Kthej VETËM JSON, asgjë tjetër:
{
  "pala": "emri i furnitorit/kompanisë/bankës",
  "pershkrimi": "përshkrimi i shërbimit/mallit",
  "referenca": "numri i faturës ose referencës",
  "shuma_totale": "shuma totale si numër (pa simbol monedhe)",
  "data_fillimit": "data e faturës në format YYYY-MM-DD",
  "data_skadimit": "data e skadencës/pagesës në format YYYY-MM-DD ose null",
  "shenime": "çdo informacion tjetër relevant"
}
Nëse nuk gjen ndonjë vlerë, vendos null. Shumat duhet të jenë vetëm numra.`
              }
            ]
          }]
        })
      })

      const claudeData = await claudeRes.json()
      const text = claudeData.content?.[0]?.text || '{}'
      
      // Parse JSON
      let result: OCRResult = {}
      try {
        const cleaned = text.replace(/```json|```/g, '').trim()
        result = JSON.parse(cleaned)
      } catch {
        result = { raw: text, shenime: text }
      }

      setDone(true)
      onResult(result, imageUrl)

    } catch (e) {
      setError('Gabim gjatë skanimit. Provoni përsëri.')
      console.error(e)
    } finally {
      setScanning(false)
    }
  }

  return (
    <div style={{marginBottom:'14px'}}>
      {/* Upload Area */}
      <input
        ref={inputRef}
        type="file"
        accept="image/*,.pdf"
        capture="environment"
        onChange={e => e.target.files?.[0] && handleFile(e.target.files[0])}
        style={{display:'none'}}
      />

      {!preview ? (
        <div
          onClick={() => inputRef.current?.click()}
          style={{
            border:'2px dashed rgba(201,168,76,0.3)',
            borderRadius:'14px',
            padding:'28px 16px',
            textAlign:'center',
            cursor:'pointer',
            background:'rgba(201,168,76,0.04)',
            transition:'all .2s'
          }}
        >
          <div style={{fontSize:'36px',marginBottom:'10px'}}>📸</div>
          <p style={{fontSize:'13px',fontWeight:'700',color:'#c9a84c',margin:'0 0 4px'}}>Fotografo ose ngarko faturën</p>
          <p style={{fontSize:'11px',color:'#555',margin:'0 0 12px'}}>Claude do të lexojë automatikisht të dhënat</p>
          <div style={{display:'flex',gap:'8px',justifyContent:'center'}}>
            <span style={{fontSize:'10px',background:'rgba(201,168,76,.15)',color:'#c9a84c',padding:'4px 10px',borderRadius:'20px'}}>📱 Kamera</span>
            <span style={{fontSize:'10px',background:'rgba(201,168,76,.15)',color:'#c9a84c',padding:'4px 10px',borderRadius:'20px'}}>🖼 Galeri</span>
            <span style={{fontSize:'10px',background:'rgba(201,168,76,.15)',color:'#c9a84c',padding:'4px 10px',borderRadius:'20px'}}>📄 PDF</span>
          </div>
        </div>
      ) : (
        <div style={{position:'relative'}}>
          <img src={preview} alt="Fatura" style={{width:'100%',borderRadius:'14px',maxHeight:'200px',objectFit:'cover',border:'1px solid rgba(201,168,76,0.2)'}} />
          
          {scanning && (
            <div style={{position:'absolute',inset:0,background:'rgba(10,10,15,0.85)',borderRadius:'14px',display:'flex',flexDirection:'column',alignItems:'center',justifyContent:'center',gap:'10px'}}>
              <style>{`@keyframes spin{to{transform:rotate(360deg)}} @keyframes pulse{0%,100%{opacity:.5}50%{opacity:1}}`}</style>
              <div style={{width:'36px',height:'36px',border:'2px solid rgba(201,168,76,.3)',borderTop:'2px solid #c9a84c',borderRadius:'50%',animation:'spin .8s linear infinite'}}></div>
              <p style={{fontSize:'12px',color:'#c9a84c',margin:0,animation:'pulse 1.5s infinite',letterSpacing:'1px'}}>Claude po lexon faturën...</p>
            </div>
          )}

          {done && !scanning && (
            <div style={{position:'absolute',top:'8px',right:'8px',background:'#4ade80',color:'#0a0a0f',borderRadius:'20px',padding:'4px 12px',fontSize:'11px',fontWeight:'700'}}>
              ✓ OCR i kryer
            </div>
          )}

          <button
            onClick={() => { setPreview(null); setDone(false); if(inputRef.current) inputRef.current.value='' }}
            style={{position:'absolute',top:'8px',left:'8px',width:'28px',height:'28px',background:'rgba(10,10,15,.8)',border:'1px solid rgba(255,255,255,.2)',borderRadius:'50%',color:'#fff',fontSize:'14px',cursor:'pointer',display:'flex',alignItems:'center',justifyContent:'center'}}
          >×</button>
        </div>
      )}

      {error && <p style={{fontSize:'11px',color:'#f87171',margin:'8px 0 0',textAlign:'center'}}>{error}</p>}

      {done && (
        <div style={{marginTop:'8px',background:'rgba(74,222,128,.08)',border:'1px solid rgba(74,222,128,.2)',borderRadius:'10px',padding:'10px 12px'}}>
          <p style={{fontSize:'11px',color:'#4ade80',margin:0,fontWeight:'600'}}>✓ Të dhënat u lexuan dhe u vendosën automatikisht në formular. Kontrolloni dhe korrigjoni nëse nevojitet.</p>
        </div>
      )}
    </div>
  )
}
