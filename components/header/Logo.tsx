// Logo mark + wordmark for TaskFlow, with navigation to board root.

import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-90">
      <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-[#00e676] text-slate-950 shadow-sm shadow-[#00e676]/30 flex-shrink-0 group-hover:scale-105 transition-transform duration-150">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M9 12L11 14L15 10M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <span className="font-bold text-slate-900 text-lg tracking-tight">
        Task<span className="text-[#00c853]">Flow</span>
      </span>
    </Link>
  )
}
