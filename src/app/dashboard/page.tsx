import { createClient } from '@/lib/supabase/server'
import { formatAmount, formatDateShort } from '@/lib/utils'
import Link from 'next/link'
import { AlertTriangle, ChevronRight, TrendingUp, TrendingDown, CreditCard, Building2, RefreshCw } from 'lucide-react'
import { DashboardSummary, Transaction } from '@/lib/types'

export default async function DashboardPage() {
  const supabase = await createClient()

  const [{ data: summary }, { data: recent }] = await Promise.all([
    supabase.rpc('rpc_dashboard_summary'),
    supabase.from('v_transactions_detail')
      .select('id,type,amount,description,date,status,category_color,category_name,created_by_name')
      .eq('is_deleted', false)
      .eq('status', 'approved')
      .order('date', { ascending: false })
      .limit(5),
  ])

  const s = summary as DashboardSummary | null
  const cashflow = s?.monthly_cashflow ?? []
  const maxVal = Math.max(...cashflow.map((m: { income: number; expenses: number }) => Math.max(m.income, m.expenses)), 1)

  return (
    <div className="px-4 py-4 space-y-4">

      {/* HERO — Bilanci */}
      <div className="bg-gray-900 rounded-2xl p-5 text-white">
        <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">Bilanci Neto</p>
        <p className="text-3xl font-mono font-medium tracking-tight">
          {formatAmount(s?.balance ?? 0)}
        </p>
        <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-gray-700">
          <div>
            <div className="flex items-center gap-1 text-green-400 text-xs mb-0.5">
              <TrendingUp className="w-3 h-3" /> Të Ardhura
            </div>
            <p className="text-sm font-mono font-medium">{formatAmount(s?.total_income ?? 0)}</p>
          </div>
          <div>
            <div className="flex items-center gap-1 text-red-400 text-xs mb-0.5">
              <TrendingDown className="w-3 h-3" /> Shpenzime
            </div>
            <p className="text-sm font-mono font-medium">{formatAmount(s?.total_expenses ?? 0)}</p>
          </div>
        </div>
      </div>

      {/* ALERT PENDING */}
      {(s?.pending_count ?? 0) > 0 && (
        <Link href="/dashboard/transactions?filter=pending">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-amber-900">
                {s?.pending_count} transaksione presin aprovimin
              </p>
              <p className="text-xs text-amber-600">{formatAmount(s?.pending_amount ?? 0)}</p>
            </div>
            <ChevronRight className="w-4 h-4 text-amber-400" />
          </div>
        </Link>
      )}

      {/* GRID STATISTIKA */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Kreditë aktive</span>
          </div>
          <p className="text-lg font-mono font-medium text-gray-900">
            {formatAmount(s?.loans_total ?? 0)}
          </p>
        </div>
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Building2 className="w-4 h-4 text-gray-400" />
            <span className="text-xs text-gray-500">Investime aktive</span>
          </div>
          <p className="text-lg font-mono font-medium text-gray-900">
            {s?.active_investments ?? 0}
          </p>
        </div>
        {(s?.reimbursements ?? []).length > 0 && (
          <div className="bg-white rounded-xl border border-gray-100 p-4 col-span-2">
            <div className="flex items-center gap-2 mb-2">
              <RefreshCw className="w-4 h-4 text-gray-400" />
              <span className="text-xs text-gray-500">Rimbursimet e pashlyera</span>
            </div>
            {(s?.reimbursements ?? []).map((r: { creditor_name: string; total_outstanding: number }, i: number) => (
              <div key={i} className="flex justify-between items-center py-1">
                <span className="text-xs text-gray-600">{r.creditor_name}</span>
                <span className="text-xs font-mono font-medium text-amber-700">{formatAmount(r.total_outstanding)}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* CASHFLOW CHART */}
      {cashflow.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-100 p-4">
          <p className="text-sm font-medium text-gray-900 mb-4">Cash Flow — 6 muajt</p>
          <div className="flex items-end gap-2 h-20">
            {cashflow.slice(-6).map((m: { month: string; month_label: string; income: number; expenses: number; net: number }, i: number) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="flex items-end gap-0.5 h-14 w-full">
                  <div
                    className="flex-1 bg-green-100 rounded-t-sm"
                    style={{ height: `${(m.income / maxVal) * 100}%` }}
                  />
                  <div
                    className="flex-1 bg-red-100 rounded-t-sm"
                    style={{ height: `${(m.expenses / maxVal) * 100}%` }}
                  />
                </div>
                <span className="text-[9px] text-gray-400">{m.month_label?.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <div className="flex gap-4 mt-3 pt-3 border-t border-gray-50">
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-green-100 border border-green-200" />
              <span className="text-[10px] text-gray-500">Të ardhura</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-sm bg-red-100 border border-red-200" />
              <span className="text-[10px] text-gray-500">Shpenzime</span>
            </div>
          </div>
        </div>
      )}

      {/* TRANSAKSIONET E FUNDIT */}
      <div className="bg-white rounded-xl border border-gray-100">
        <div className="flex items-center justify-between p-4 pb-2">
          <p className="text-sm font-medium text-gray-900">Transaksionet e fundit</p>
          <Link href="/dashboard/transactions" className="text-xs text-gray-400 flex items-center gap-0.5">
            Të gjitha <ChevronRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-gray-50">
          {(recent ?? []).length === 0 ? (
            <p className="text-sm text-gray-400 text-center py-8">Nuk ka transaksione</p>
          ) : (
            (recent as Transaction[]).map(tx => (
              <div key={tx.id} className="flex items-center gap-3 px-4 py-3">
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: tx.category_color ?? '#d1d5db' }}
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-900 truncate">{tx.description}</p>
                  <p className="text-xs text-gray-400">{formatDateShort(tx.date)}</p>
                </div>
                <p className={`text-sm font-mono font-medium ${tx.type === 'income' ? 'text-green-600' : 'text-red-600'}`}>
                  {tx.type === 'expense' ? '-' : '+'}{formatAmount(tx.amount, '')}
                </p>
              </div>
            ))
          )}
        </div>
      </div>

    </div>
  )
}
