import type { Metadata } from 'next'
import './globals.css'
export const metadata: Metadata = {
  title: 'InRight',
  description: 'Menaxhim financiar për partnerë',
}
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="sq">
      <body style={{ fontFamily: 'system-ui, -apple-system, sans-serif', margin: 0 }}>
        {children}
      </body>
    </html>
  )
}
