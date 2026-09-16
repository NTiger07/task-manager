import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Task Not Found — Stride',
}

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#f9fafb] flex items-center justify-center px-4">
      <div className="text-center max-w-sm">
        <div className="text-6xl font-black text-[#e5e7eb] mb-4">404</div>
        <h1 className="text-xl font-bold text-[#111827] mb-2">Task not found</h1>
        <p className="text-sm text-[#6b7280] mb-6 leading-relaxed">
          This task doesn&apos;t exist or you don&apos;t have access to it.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#00e676] hover:bg-[#00c853] text-[#111827] transition-colors"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          Back to board
        </Link>
      </div>
    </div>
  )
}
