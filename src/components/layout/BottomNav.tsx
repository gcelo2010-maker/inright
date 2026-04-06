'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ArrowLeftRight, Upload, CreditCard, TrendingUp } from 'lucide-react'
import { cn } from '@/lib/utils'

const NAV = [
  { href: '/dashboard',                icon: LayoutDashboard, label: 'Paneli' },
  { href: '/dashboard/transactions',   icon: ArrowLeftRight,  label: 'Transaksione' },
  { href: '/dashboard/import-review',  icon: Upload,          label: 'Importi' },
  { href: '/dashboard/loans',          icon: CreditCard,      label: 'Kreditë' },
  { href: '/dashboard/investments',    icon: TrendingUp,      label: 'Investimet' },
]

export default function BottomNav() {
  const path = usePathname()

  return (
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[430px] bg-white border-t border-gray-100 z-20">
      <div className="flex items-center justify-around px-1 pb-safe" style={{ paddingBottom: 'max(8px, env(safe-area-inset-bottom))' }}>
        {NAV.map(({ href, icon: Icon, label }) => {
          const active = path === href || (href !== '/dashboard' && path.startsWith(href))
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex flex-col items-center gap-0.5 pt-2 pb-1 px-3 min-w-[52px]',
                'border-t-2 transition-colors',
                active
                  ? 'border-gray-900 text-gray-900'
                  : 'border-transparent text-gray-400'
              )}
            >
              <Icon className="w-5 h-5" />
              <span className={cn('text-[10px]', active ? 'font-medium' : 'font-normal')}>
                {label}
              </span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
