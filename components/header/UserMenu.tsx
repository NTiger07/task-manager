'use client'

// UserMenu — user avatar trigger and dropdown profile menu.

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { showToast } from '@/components/Toast'

interface UserMenuProps {
  email: string
}

export default function UserMenu({ email }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const supabase = createClient()

  // Close on click outside
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  async function handleSignOut() {
    await supabase.auth.signOut()
    showToast('Signed out successfully', 'success')
    router.push('/login')
    router.refresh()
  }

  const initials = email.slice(0, 2).toUpperCase() || 'U'

  return (
    <div className="relative" ref={ref}>
      <button
        id="user-menu-trigger"
        onClick={() => setOpen(o => !o)}
        className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl hover:bg-slate-100/80 border border-transparent hover:border-slate-200 transition-all cursor-pointer"
        aria-haspopup="true"
        aria-expanded={open}
      >
        <div className="w-8 h-8 rounded-full bg-[#00e676] text-slate-950 flex items-center justify-center text-xs font-bold shadow-xs flex-shrink-0">
          {initials}
        </div>
        <span className="text-sm text-slate-700 font-medium max-w-[200px] sm:max-w-[260px] truncate hidden sm:block">
          {email}
        </span>
        <svg
          className={`w-4 h-4 text-slate-400 transition-transform duration-200 ${
            open ? 'rotate-180 text-slate-600' : ''
          }`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl border border-slate-200/90 shadow-xl z-50 overflow-hidden"
          role="menu"
        >
          <div className="px-4 py-3.5 border-b border-slate-100 bg-slate-50/50">
            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-wider mb-1">
              Signed in as
            </p>
            <p className="text-sm text-slate-900 font-semibold truncate" title={email}>
              {email}
            </p>
          </div>

          <div className="p-1.5">
            <button
              id="sign-out-btn"
              onClick={handleSignOut}
              className="w-full text-left px-3 py-2 text-sm text-red-600 font-medium hover:bg-red-50 rounded-lg transition-colors flex items-center gap-2.5 cursor-pointer"
              role="menuitem"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
              </svg>
              <span>Sign out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
