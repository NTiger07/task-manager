'use client'

// DueDateIndicator — visual badge displaying relative time or formatted due date.

import { useMemo } from 'react'

interface DueDateIndicatorProps {
  dueDate: string | null
  compact?: boolean
}

export default function DueDateIndicator({ dueDate, compact = false }: DueDateIndicatorProps) {
  const info = useMemo(() => {
    if (!dueDate) return null

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const due = new Date(dueDate + 'T00:00:00')
    if (isNaN(due.getTime()) || due.getFullYear() > 2100 || due.getFullYear() < 1970) return null

    const diffMs = due.getTime() - today.getTime()
    const diffDays = Math.round(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      const days = Math.abs(diffDays)
      return {
        label: compact ? `${days}d overdue` : `${days} day${days !== 1 ? 's' : ''} overdue`,
        className: 'text-red-700 bg-red-50 border-red-200/70',
        type: 'overdue',
      }
    }
    if (diffDays === 0) {
      return {
        label: 'Due today',
        className: 'text-amber-800 bg-amber-50 border-amber-200/70',
        type: 'today',
      }
    }
    if (diffDays === 1) {
      return {
        label: 'Due tomorrow',
        className: 'text-amber-800 bg-amber-50 border-amber-200/70',
        type: 'soon',
      }
    }
    if (diffDays <= 7) {
      return {
        label: compact ? `${diffDays}d left` : `${diffDays} days left`,
        className: 'text-slate-700 bg-slate-100 border-slate-200/70',
        type: 'soon',
      }
    }

    const formatted = due.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    return {
      label: formatted,
      className: 'text-slate-600 bg-slate-50 border-slate-200/60',
      type: 'future',
    }
  }, [dueDate, compact])

  if (!info) return null

  return (
    <span
      className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${info.className}`}
    >
      <svg
        width="11"
        height="11"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.5}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="flex-shrink-0"
      >
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
      <span>{info.label}</span>
    </span>
  )
}
