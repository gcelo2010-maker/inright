import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import TopBar from '@/components/layout/TopBar'
import BottomNav from '@/components/layout/BottomNav'
import { MyProfile } from '@/lib/types'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase.rpc('rpc_my_profile')

  if (profile && !profile.authenticated) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4 bg-gray-50">
        <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center max-w-sm w-full">
          <div className="text-4xl mb-4">🔒</div>
          <h2 className="text-lg font-semibold text-gray-900 mb-2">Akses i kufizuar</h2>
          <p className="text-sm text-gray-500">
            Email-i juaj nuk është i regjistruar si partner. Kontaktoni administratorin.
          </p>
          <p className="text-xs text-gray-400 mt-2">{user.email}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-[430px] mx-auto min-h-screen bg-gray-50 flex flex-col">
      <TopBar profile={profile as MyProfile} />
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>
      <BottomNav />
    </div>
  )
}
