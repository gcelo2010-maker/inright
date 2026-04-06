'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut, ChevronDown } from 'lucide-react'
import { MyProfile } from '@/lib/types'
import { getInitials } from '@/lib/utils'

export default function TopBar({ profile }: { profile: MyProfile | null }) {
  const [open, setOpen] = useState(false)
  const supabase = createClient()
  const router = useRouter()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div className="sticky top-0 z-20 bg-white border-b border-gray-100 px-4 py-3 flex items-center justify-between">
      <div>
        <span className="text-lg font-semibold text-gray-900 tracking-tight">InRight</span>
        {profile?.role === 'admin' && (
          <span className="ml-2 text-[10px] bg-gray-900 text-white px-2 py-0.5 rounded-full uppercase tracking-wider">
            Admin
          </span>
        )}
      </div>

      <div className="relative">
        <button
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2"
        >
          <div className="w-8 h-8 rounded-full bg-gray-900 text-white text-xs font-medium flex items-center justify-center">
            {profile ? getInitials(profile.full_name) : '?'}
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
        </button>

        {open && (
          <div className="absolute right-0 top-10 bg-white border border-gray-100 rounded-xl shadow-lg py-1 w-48 z-30">
            <div className="px-3 py-2 border-b border-gray-50">
              <p className="text-sm font-medium text-gray-900 truncate">{profile?.full_name}</p>
              <p className="text-xs text-gray-400 truncate">{profile?.email}</p>
            </div>
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              Dilni
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
