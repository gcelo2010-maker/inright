export const dynamic = 'force-dynamic'
export const revalidate = 0

import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'InRight — Menaxhim Financiar',
  description: 'Platforma e menaxhimit financiar për partnerë',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif' }}>{children}</body>
    </html>
  )
}
