export function formatAmount(amount: number, currency = 'LEK'): string {
  const v = Math.abs(amount)
  if (v >= 1_000_000) return `${(amount / 1_000_000).toFixed(2)}M ${currency}`
  if (v >= 1_000) return `${(amount / 1_000).toFixed(0)}K ${currency}`
  return `${new Intl.NumberFormat('sq-AL', { maximumFractionDigits: 0 }).format(amount)} ${currency}`
}

export function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('sq-AL', {
    day: '2-digit', month: 'short', year: 'numeric',
  })
}

export function formatDateShort(date: string): string {
  return new Date(date).toLocaleDateString('sq-AL', {
    day: '2-digit', month: 'short',
  })
}

export function cn(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(' ')
}

export function getInitials(name: string): string {
  return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase()
}

export const STATUS_LABELS: Record<string, string> = {
  pending: 'Në pritje',
  approved: 'Aprovuar',
  rejected: 'Refuzuar',
  imported: 'Kaluar',
  draft: 'Draft',
  active: 'Aktiv',
  paid: 'Paguar',
  planning: 'Planifikim',
  completed: 'Përfunduar',
}

export const TIPDOK_LABELS: Record<string, string> = {
  FF: 'Faturë Furnitori',
  MP: 'Mandatë Pagese',
  KR: 'Kredi',
  VS: 'Vlerësim Situacioni',
}
