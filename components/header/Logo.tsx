// Logo mark + wordmark for TaskFlow, with navigation to board root.

import Link from 'next/link'

export default function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5 group transition-opacity hover:opacity-90">
      <span className="font-bold text-slate-900 text-xl tracking-tight">
        Task<span className="text-[#00c853]">Flow</span>
      </span>
    </Link>
  )
}
