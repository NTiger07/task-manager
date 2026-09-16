// Logo mark + wordmark for Stride, with navigation to board root.

import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-90">
      <div className="w-8 h-8 rounded-xl bg-slate-900 flex items-center justify-center shadow-xs border border-slate-800 text-[#00e676] group-hover:scale-105 transition-transform">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.8} strokeLinecap="round" strokeLinejoin="round">
          <path d="M13 5l7 7-7 7" />
          <path d="M5 5l7 7-7 7" opacity="0.45" />
        </svg>
      </div>
      <span className="font-bold text-slate-900 text-xl tracking-tight">
        Stride
      </span>
    </Link>
  )
}
