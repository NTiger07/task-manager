'use client'

// TaskCard — a single draggable task card with interactive controls and micro-interactions.

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import DueDateIndicator from '@/components/DueDateIndicator'
import type { Task } from '@/lib/types'

interface TaskCardProps {
  task: Task
  onEdit: (task: Task) => void
  onDelete: (taskId: string) => void
  isDragOverlay?: boolean
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  isDragOverlay = false,
}: TaskCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id, data: { task } })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  return (
    <div
      ref={isDragOverlay ? undefined : setNodeRef}
      style={isDragOverlay ? {} : style}
      className={`group bg-white rounded-xl p-4 flex flex-col gap-3 transition-all duration-200 select-none ${
        isDragging
          ? 'opacity-30 border-2 border-dashed border-emerald-400 bg-emerald-50/20 shadow-none'
          : 'border border-slate-200/90 shadow-xs hover:shadow-md hover:-translate-y-0.5 hover:border-slate-300'
      } ${
        isDragOverlay
          ? 'shadow-2xl ring-2 ring-[#00e676] rotate-1 cursor-grabbing scale-[1.02] border-emerald-300 bg-white'
          : ''
      }`}
    >
      {/* Top row: drag handle, title, action buttons */}
      <div className="flex items-start gap-2.5">
        {/* Drag handle */}
        {!isDragOverlay && (
          <button
            {...attributes}
            {...listeners}
            aria-label="Drag to reorder"
            title="Drag to reorder"
            className="mt-0.5 -ml-1 p-1 text-slate-300 hover:text-slate-500 cursor-grab active:cursor-grabbing opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <circle cx="9" cy="5" r="1.5" />
              <circle cx="15" cy="5" r="1.5" />
              <circle cx="9" cy="12" r="1.5" />
              <circle cx="15" cy="12" r="1.5" />
              <circle cx="9" cy="19" r="1.5" />
              <circle cx="15" cy="19" r="1.5" />
            </svg>
          </button>
        )}

        {/* Title link */}
        <Link
          href={`/tasks/${task.id}`}
          className="flex-1 text-sm font-semibold text-slate-900 hover:text-emerald-600 transition-colors leading-snug line-clamp-2"
        >
          {task.title}
        </Link>

        {/* Quick action buttons on hover */}
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
          <button
            id={`edit-task-${task.id}`}
            onClick={e => {
              e.stopPropagation()
              onEdit(task)
            }}
            aria-label="Edit task"
            title="Edit task"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
          </button>
          <button
            id={`delete-task-${task.id}`}
            onClick={e => {
              e.stopPropagation()
              onDelete(task.id)
            }}
            aria-label="Delete task"
            title="Delete task"
            className="w-7 h-7 flex items-center justify-center rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
              <path d="M10 11v6M14 11v6M9 6V4h6v2" />
            </svg>
          </button>
        </div>
      </div>

      {/* Description preview */}
      {task.description && (
        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2">
          {task.description}
        </p>
      )}

      {/* Footer metadata */}
      <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
        <DueDateIndicator dueDate={task.due_date} compact />
        <StatusBadge status={task.status} size="sm" />
      </div>
    </div>
  )
}
