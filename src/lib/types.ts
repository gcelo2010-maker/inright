export interface Partner {
  id: string
  user_id: string | null
  full_name: string
  email: string
  role: 'admin' | 'partner' | 'accountant' | 'viewer'
  ownership_pct: number
  avatar_url: string | null
  is_active: boolean
  invited_at: string
  joined_at: string | null
}

export interface MyProfile {
  authenticated: boolean
  id: string
  full_name: string
  email: string
  role: 'admin' | 'partner' | 'accountant' | 'viewer'
  ownership_pct: number
  avatar_url: string | null
  error?: string
}

export interface Transaction {
  id: string
  type: 'income' | 'expense' | 'transfer'
  category_id: string | null
  amount: number
  currency: string
  description: string
  reference_no: string | null
  date: string
  status: 'draft' | 'pending' | 'partially_approved' | 'approved' | 'rejected' | 'cancelled'
  created_by_partner_id: string
  is_reimbursement: boolean
  requires_approvals: number
  approval_count: number
  category_name?: string
  category_color?: string
  category_icon?: string
  created_by_name?: string
  notes?: string | null
}

export interface ImportStaging {
  id: string
  raw_kod: string
  raw_dtdok: string
  raw_koment1: string
  raw_koment2: string
  raw_debi: number
  raw_tipdok: string
  raw_numdok: string
  date: string
  amount: number
  description: string
  notes: string | null
  reference_no: string
  category_name: string
  supplier_name: string
  transaction_type: string
  tipdok_label: string
  review_status: 'pending' | 'approved' | 'rejected' | 'imported'
  import_batch: string
  import_row: number
  transaction_id: string | null
  reviewed_at: string | null
}

export interface Category {
  id: string
  name: string
  type: 'income' | 'expense' | 'both'
  color: string
  icon: string
  is_supplier: boolean
  is_active: boolean
}

export interface Loan {
  id: string
  bank_name: string
  loan_type: string
  total_amount: number
  interest_rate: number
  monthly_payment: number
  start_date: string
  end_date: string | null
  status: string
  remaining_balance?: number
  late_payments_count?: number
  notes?: string | null
}

export interface Investment {
  id: string
  project_name: string
  location: string | null
  description: string | null
  category: string
  total_budget: number
  amount_paid: number
  status: string
  progress_pct?: number
  remaining_budget?: number
  responsible_name?: string | null
  start_date?: string | null
  expected_end_date?: string | null
}

export interface DashboardSummary {
  balance: number
  total_income: number
  total_expenses: number
  pending_count: number
  pending_amount: number | null
  loans_total: number
  active_investments: number
  monthly_cashflow: {
    month: string
    month_label: string
    income: number
    expenses: number
    net: number
  }[]
  reimbursements: { creditor_name: string; total_outstanding: number }[] | null
}
