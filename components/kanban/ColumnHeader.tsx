'use client'

// ColumnHeader — displays column title, colored indicator, task count, and quick-add button.

import type { TaskStatus } from '@/lib/types'

const COLUMN_CONFIG: Record<
  TaskStatus,
  { label: string; accent: string; dot: string; countBg: string; countText: string }
> = {
  todo: {
    label: 'To Do',
    accent: 'text-slate-700',
    countBg: 'bg-slate-200/80',
    countText: 'text-slate-700',
  },
  in_progress: {
    label: 'In Progress',
    accent: 'text-blue-700',
    countBg: 'bg-blue-100/80',
    countText: 'text-blue-800',
  },
  done: {
    label: 'Done',
    accent: 'text-emerald-700',
    countBg: 'bg-emerald-100/80',
    countText: 'text-emerald-800',
  },
}

interface ColumnHeaderProps {
  status: TaskStatus
  count: number
  onAddTask: () => void
}

export default function ColumnHeader({ status, count, onAddTask }: ColumnHeaderProps) {
  const { label, accent, dot, countBg, countText } = COLUMN_CONFIG[status]

  return (
    <div className="flex items-center justify-between mb-3 px-1">
      <div className="flex items-center gap-2.5">
        <h3 className={`text-sm font-bold tracking-tight ${accent}`}>{label}</h3>
        <span
          className={`text-xs font-semibold px-2 py-0.5 rounded-full min-w-[20px] text-center ${countBg} ${countText}`}
        >
          {count}
        </span>
      </div>

      <button
        id={`add-task-${status}`}
        onClick={onAddTask}
        aria-label={`Add task to ${label}`}
        title={`Add task to ${label}`}
        className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-500 hover:text-slate-900 hover:bg-slate-200/70 active:scale-95 transition-all duration-150 cursor-pointer"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
      </button>
    </div>
  )
}
