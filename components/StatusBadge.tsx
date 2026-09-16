'use client'

// StatusBadge — visual pill badge indicating task progress state.

import type { TaskStatus } from '@/lib/types'

const config: Record<TaskStatus, { label: string; className: string; dot: string }> = {
  todo: {
    label: 'To Do',
    className: 'bg-slate-100 text-slate-700 border-slate-200/80',
    dot: 'bg-slate-400',
  },
  in_progress: {
    label: 'In Progress',
    className: 'bg-blue-50 text-blue-700 border-blue-200/70',
    dot: 'bg-blue-500',
  },
  done: {
    label: 'Done',
    className: 'bg-emerald-50 text-emerald-800 border-emerald-200/70',
    dot: 'bg-emerald-500',
  },
}

interface StatusBadgeProps {
  status: TaskStatus
  size?: 'sm' | 'md'
}

export default function StatusBadge({ status, size = 'md' }: StatusBadgeProps) {
  const { label, className, dot } = config[status]
  const isSmall = size === 'sm'

  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold rounded-md border ${className} ${
        isSmall ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1'
      }`}
    >
      <span
        className={`rounded-full flex-shrink-0 ${dot} ${
          isSmall ? 'w-1.5 h-1.5' : 'w-2 h-2'
        }`}
      />
      {label}
    </span>
  )
}
