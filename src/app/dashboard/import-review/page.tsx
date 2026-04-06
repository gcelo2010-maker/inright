'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ImportStaging } from '@/lib/types'
import { formatAmount, formatDate, STATUS_LABELS, TIPDOK_LABELS } from '@/lib/utils'
import { ChevronDown, ChevronUp, CheckCircle2, XCircle, RotateCcw, Upload } from 'lucide-react'

const CATS = ['Investime Kapitale','Shpenzime Tjera','Qira','Paga & Sigurime','Materiale & Mallra','Transport','Mirëmbajtje','Taksa & Detyrime','Kredi & Interesa']
const FILTERS = [
  { id: 'all', label: 'Të gjitha' },
  { id: 'pending', label: 'Pending' },
  { id: 'approved', label: 'Aprovuar' },
  { id: 'rejected', label: 'Refuzuar' },
  { id: 'imported', label: 'Kaluar' },
] as const

const STATUS_COLORS = {
  pending: 'bg-amber-500',
  approved: 'bg-green-600',
  rejected: 'bg-red-600',
  imported: 'bg-blue-600',
}

const STATUS_BADGE = {
  pending: 'bg-amber-50 text-amber-800 border border-amber-200',
  approved: 'bg-green-50 text-green-800 border border-green-200',
  rejected: 'bg-red-50 text-red-800 border border-red-200',
  imported: 'bg-blue-50 text-blue-800 border border-blue-200',
}

type Filter = 'all' | 'pending' | 'approved' | 'rejected' | 'imported'

export default function ImportReviewPage() {
  const [rows, setRows] = useState<ImportStaging[]>([])
  const [filter, setFilter] = useState<Filter>('all')
  const [expanded, setExpanded] = useState<Set<string>>(new Set())
  const [edits, setEdits] = useState<Record<string, Partial<ImportStaging>>>({})
  const [toast, setToast] = useState('')
  const [showModal, setShowModal] = useState<'bulk' | 'transfer' | null>(null)
  const [showSuccess, setShowSuccess] = useState<{ transferred: number; total: number } | null>(null)
  const [saving, setSaving] = useState<string | null>(null)
  const supabase = createClient()

  const showToast = (msg: string) => {
    setToast(msg)
    setTimeout(() => setToast(''), 2500)
  }

  const load = useCallback(async () => {
    const { data } = await supabase
      .from('import_staging')
      .select('*')
      .eq('import_batch', 'azotiku.xls')
      .order('date', { ascending: true })
    setRows(data ?? [])
  }, [supabase])

  useEffect(() => { load() }, [load])

  const counts = {
    all: rows.length,
    pending: rows.filter(r => r.review_status === 'pending').length,
    approved: rows.filter(r => r.review_status === 'approved').length,
    rejected: rows.filter(r => r.review_status === 'rejected').length,
    imported: rows.filter(r => r.review_status === 'imported').length,
  }

  const totalAmt = rows.reduce((s, r) => s + Number(r.amount), 0)
  const filtered = filter === 'all' ? rows : rows.filter(r => r.review_status === filter)

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  const setEdit = (id: string, field: string, value: string | number) => {
    setEdits(prev => ({ ...prev, [id]: { ...prev[id], [field]: value } }))
  }

  const save = async (id: string) => {
    const e = edits[id]
    if (!e || !Object.keys(e).length) { showToast('Nuk ka ndryshime'); return }
    setSaving(id)
    const { error } = await supabase.from('import_staging').update(e).eq('id', id)
    if (!error) {
      setRows(prev => prev.map(r => r.id === id ? { ...r, ...e } : r))
      setEdits(prev => { const n = { ...prev }; delete n[id]; return n })
      showToast('✓ U ruajt')
    } else showToast('Gabim gjatë ruajtjes')
    setSaving(null)
  }

  const updateStatus = async (id: string, status: ImportStaging['review_status']) => {
    const { error } = await supabase.from('import_staging')
      .update({ review_status: status, reviewed_at: new Date().toISOString() })
      .eq('id', id)
    if (!error) {
      setRows(prev => prev.map(r => r.id === id ? { ...r, review_status: status } : r))
      setExpanded(prev => { const n = new Set(prev); n.delete(id); return n })
      showToast(status === 'approved' ? '✓ Aprovuar' : status === 'rejected' ? 'U refuzua' : 'U kthye Pending')
    }
  }

  const bulkApprove = async () => {
    setShowModal(null)
    const { error } = await supabase.from('import_staging')
      .update({ review_status: 'approved', reviewed_at: new Date().toISOString() })
      .eq('review_status', 'pending').eq('import_batch', 'azotiku.xls')
    if (!error) {
      setRows(prev => prev.map(r => r.review_status === 'pending' ? { ...r, review_status: 'approved' as const } : r))
      showToast(`✓ ${counts.pending} aprovuan`)
    }
  }

  const doTransfer = async () => {
    setShowModal(null)
    const { data, error } = await supabase.rpc('rpc_transfer_to_transactions', { p_batch: 'azotiku.xls' })
    if (!error && data?.success) {
      setShowSuccess({ transferred: data.transferred, total: data.total_amount })
      load()
    } else showToast('Gabim gjatë transferimit')
  }

  if (showSuccess) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-5">
          <CheckCircle2 className="w-8 h-8 text-green-600" />
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2 text-center">Import i Përfunduar!</h2>
        <p className="text-sm text-gray-500 text-center mb-6">
          {showSuccess.transferred} transaksione u kaluan me sukses.
        </p>
        <div className="grid grid-cols-2 gap-4 w-full max-w-xs mb-6">
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-2xl font-mono font-medium text-green-600">{showSuccess.transferred}</p>
            <p className="text-xs text-gray-500 mt-1">Të kaluar</p>
          </div>
          <div className="bg-white rounded-xl border border-gray-100 p-4 text-center">
            <p className="text-lg font-mono font-medium text-gray-900">{formatAmount(showSuccess.total, '')}</p>
            <p className="text-xs text-gray-500 mt-1">LEK total</p>
          </div>
        </div>
        <button
          onClick={() => setShowSuccess(null)}
          className="bg-gray-900 text-white rounded-xl px-8 py-3 text-sm font-medium w-full max-w-xs"
        >
          Kthehu te lista
        </button>
      </div>
    )
  }

  return (
    <div className="flex flex-col min-h-full">
      {/* Summary */}
      <div className="px-4 pt-4 space-y-3">
        <div className="grid grid-cols-4 gap-2">
          {(['pending','approved','rejected','imported'] as const).map(s => (
            <div key={s} className="bg-white rounded-xl border border-gray-100 p-2.5 text-center">
              <p className={`text-lg font-semibold ${s==='pending'?'text-amber-600':s==='approved'?'text-green-600':s==='rejected'?'text-red-600':'text-blue-600'}`}>
                {counts[s]}
              </p>
              <p className="text-[9px] text-gray-400 uppercase tracking-wide mt-0.5">{STATUS_LABELS[s]}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-100 px-4 py-2.5 flex justify-between items-center">
          <span className="text-xs text-gray-500">Total import</span>
          <span className="text-sm font-mono font-medium text-gray-900">{formatAmount(totalAmt)}</span>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 pt-3 overflow-x-auto scrollbar-none pb-1">
        {FILTERS.map(f => (
          <button
            key={f.id}
            onClick={() => setFilter(f.id as Filter)}
            className={`flex-shrink-0 px-3 py-1.5 rounded-full text-xs font-medium border transition-colors ${
              filter === f.id
                ? 'bg-gray-900 text-white border-gray-900'
                : 'bg-white text-gray-500 border-gray-200'
            }`}
          >
            {f.label} {counts[f.id as Filter]}
          </button>
        ))}
      </div>

      {/* Cards */}
      <div className="flex-1 px-4 pt-2 pb-32 space-y-2.5">
        {filtered.length === 0 && (
          <div className="text-center py-12 text-sm text-gray-400">Nuk ka të dhëna</div>
        )}
        {filtered.map(row => {
          const ed = edits[row.id] ?? {}
          const isExp = expanded.has(row.id)
          const hasEdit = Object.keys(ed).length > 0
          const st = row.review_status

          return (
            <div key={row.id} className="bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="flex">
                <div className={`w-1 flex-shrink-0 ${STATUS_COLORS[st]}`} />
                <div className="flex-1 p-3 min-w-0">
                  <div className="flex justify-between items-start gap-2">
                    <div>
                      <span className="text-base font-mono font-semibold text-gray-900">
                        {formatAmount(Number(ed.amount ?? row.amount), '')}
                      </span>
                      <span className="text-xs text-gray-400 ml-1">LEK</span>
                    </div>
                    <span className="text-[10px] bg-gray-50 text-gray-500 border border-gray-100 px-1.5 py-0.5 rounded-md flex-shrink-0">
                      {TIPDOK_LABELS[row.raw_tipdok] ?? row.raw_tipdok}
                    </span>
                  </div>
                  <div className="flex gap-1.5 mt-1.5 flex-wrap">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${STATUS_BADGE[st]}`}>
                      {STATUS_LABELS[st]}
                    </span>
                    {row.reference_no && (
                      <span className="text-[10px] bg-gray-50 text-gray-400 border border-gray-100 px-1.5 py-0.5 rounded-full">
                        {row.reference_no}
                      </span>
                    )}
                    {hasEdit && (
                      <span className="text-[10px] bg-blue-50 text-blue-600 border border-blue-100 px-1.5 py-0.5 rounded-full">
                        Ndryshuar
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-700 mt-1.5 leading-snug">{ed.description ?? row.description}</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">{ed.supplier_name ?? row.supplier_name}</p>
                  <div className="flex gap-3 mt-1">
                    <span className="text-[10px] text-gray-400">{formatDate(String(ed.date ?? row.date))}</span>
                    {(ed.category_name ?? row.category_name) && (
                      <span className="text-[10px] text-gray-400">{ed.category_name ?? row.category_name}</span>
                    )}
                  </div>
                </div>
                <button
                  onClick={() => toggleExpand(row.id)}
                  className="px-3 flex items-center text-gray-300 flex-shrink-0"
                >
                  {isExp ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </button>
              </div>

              {isExp && (
                <div className="border-t border-gray-50 p-3 space-y-3">
                  {/* Origjinal */}
                  <div className="bg-gray-50 rounded-lg p-2.5">
                    <p className="text-[9px] text-gray-400 uppercase tracking-wider font-medium mb-1.5">Origjinal Excel</p>
                    <p className="text-[10px] font-mono text-gray-500 leading-relaxed">
                      KOD: {row.raw_kod} | {row.raw_tipdok}-{row.raw_numdok}<br />
                      {row.raw_koment1}<br />
                      {row.raw_koment2}
                    </p>
                  </div>

                  {/* Fields */}
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-gray-400 uppercase tracking-wider">Data</label>
                      <input type="date" defaultValue={String(row.date)}
                        onChange={e => setEdit(row.id, 'date', e.target.value)}
                        className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 uppercase tracking-wider">Shuma (LEK)</label>
                      <input type="number" defaultValue={Number(row.amount)}
                        onChange={e => setEdit(row.id, 'amount', parseFloat(e.target.value))}
                        className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                    </div>
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 uppercase tracking-wider">Përshkrimi</label>
                    <input type="text" defaultValue={row.description}
                      onChange={e => setEdit(row.id, 'description', e.target.value)}
                      className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                  </div>
                  <div>
                    <label className="text-[9px] text-gray-400 uppercase tracking-wider">Furnitori</label>
                    <input type="text" defaultValue={row.supplier_name}
                      onChange={e => setEdit(row.id, 'supplier_name', e.target.value)}
                      className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[9px] text-gray-400 uppercase tracking-wider">Kategoria</label>
                      <select defaultValue={row.category_name}
                        onChange={e => setEdit(row.id, 'category_name', e.target.value)}
                        className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900">
                        {CATS.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="text-[9px] text-gray-400 uppercase tracking-wider">Shënime</label>
                      <input type="text" defaultValue={row.notes ?? ''}
                        onChange={e => setEdit(row.id, 'notes', e.target.value)}
                        className="mt-1 w-full text-xs border border-gray-200 rounded-lg px-2 py-1.5 bg-gray-50 focus:outline-none focus:ring-1 focus:ring-gray-900" />
                    </div>
                  </div>

                  {/* Actions */}
                  {st !== 'imported' && (
                    <div className="flex gap-2 pt-1">
                      {st !== 'approved' && (
                        <button onClick={() => updateStatus(row.id, 'approved')}
                          className="flex-1 flex items-center justify-center gap-1 bg-green-50 text-green-700 border border-green-200 rounded-lg py-2 text-xs font-medium">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Aprovo
                        </button>
                      )}
                      {st !== 'rejected' && (
                        <button onClick={() => updateStatus(row.id, 'rejected')}
                          className="flex-1 flex items-center justify-center gap-1 bg-red-50 text-red-700 border border-red-200 rounded-lg py-2 text-xs font-medium">
                          <XCircle className="w-3.5 h-3.5" /> Refuzo
                        </button>
                      )}
                      {st === 'approved' && (
                        <button onClick={() => updateStatus(row.id, 'pending')}
                          className="flex items-center justify-center gap-1 bg-gray-50 text-gray-600 border border-gray-200 rounded-lg py-2 px-3 text-xs font-medium">
                          <RotateCcw className="w-3.5 h-3.5" />
                        </button>
                      )}
                      <button onClick={() => save(row.id)} disabled={saving === row.id}
                        className="bg-gray-100 text-gray-700 rounded-lg py-2 px-4 text-xs font-medium flex-shrink-0 disabled:opacity-50">
                        {saving === row.id ? '...' : 'Ruaj'}
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Bottom Bar */}
      <div className="fixed bottom-16 left-1/2 -translate-x-1/2 w-full max-w-[430px] px-4 flex gap-2">
        {counts.pending > 0 && (
          <button onClick={() => setShowModal('bulk')}
            className="flex-1 bg-amber-600 text-white rounded-xl py-3 text-sm font-medium shadow-sm">
            Aprovo të gjitha ({counts.pending})
          </button>
        )}
        {counts.approved > 0 && (
          <button onClick={() => setShowModal('transfer')}
            className="flex-1 bg-green-700 text-white rounded-xl py-3 text-sm font-medium flex items-center justify-center gap-1.5 shadow-sm">
            <Upload className="w-4 h-4" /> Kalogo {counts.approved} → TX
          </button>
        )}
      </div>

      {/* Bulk Modal */}
      {showModal === 'bulk' && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end justify-center" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-[430px]" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Aprovo të gjitha Pending</h3>
            <p className="text-sm text-gray-500 mb-4">{counts.pending} transaksione do të aprovohen automatikisht.</p>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Transaksione</span><span className="font-medium">{counts.pending}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Shuma totale</span>
                <span className="font-medium text-green-700">{formatAmount(rows.filter(r=>r.review_status==='pending').reduce((s,r)=>s+Number(r.amount),0))}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(null)} className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium">Anulo</button>
              <button onClick={bulkApprove} className="flex-1 bg-amber-600 text-white rounded-xl py-3 text-sm font-medium">Po, Aprovo</button>
            </div>
          </div>
        </div>
      )}

      {/* Transfer Modal */}
      {showModal === 'transfer' && (
        <div className="fixed inset-0 bg-black/40 z-40 flex items-end justify-center" onClick={() => setShowModal(null)}>
          <div className="bg-white rounded-t-2xl p-6 w-full max-w-[430px]" onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-semibold text-gray-900 mb-1">Kalogo në Transactions</h3>
            <p className="text-sm text-gray-500 mb-4">Transaksionet kalojnë si të aprovuar dhe nuk mund të fshihen.</p>
            <div className="bg-gray-50 rounded-xl p-3 mb-4 space-y-2">
              <div className="flex justify-between text-sm"><span className="text-gray-500">Të aprovuar</span><span className="font-medium text-green-700">{counts.approved}</span></div>
              <div className="flex justify-between text-sm"><span className="text-gray-500">Shuma</span>
                <span className="font-medium text-green-700">{formatAmount(rows.filter(r=>r.review_status==='approved').reduce((s,r)=>s+Number(r.amount),0))}</span>
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowModal(null)} className="flex-1 bg-gray-100 text-gray-600 rounded-xl py-3 text-sm font-medium">Anulo</button>
              <button onClick={doTransfer} className="flex-1 bg-green-700 text-white rounded-xl py-3 text-sm font-medium">Kalogo tani</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-32 left-1/2 -translate-x-1/2 bg-gray-900 text-white text-xs px-4 py-2 rounded-full z-50 whitespace-nowrap">
          {toast}
        </div>
      )}
    </div>
  )
}
