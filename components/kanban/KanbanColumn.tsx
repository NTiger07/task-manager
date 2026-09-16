'use client'

// KanbanColumn — a droppable sortable column card.
// Renders ColumnHeader + SortableContext of TaskCards, with elevated visual container styling.

import { useDroppable } from '@dnd-kit/core'
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable'
import ColumnHeader from './ColumnHeader'
import TaskCard from './TaskCard'
import type { Task, TaskStatus } from '@/lib/types'

interface KanbanColumnProps {
  status: TaskStatus
  tasks: Task[]
  onAddTask: (status: TaskStatus) => void
  onEditTask: (task: Task) => void
  onDeleteTask: (taskId: string) => void
}

export default function KanbanColumn({
  status,
  tasks,
  onAddTask,
  onEditTask,
  onDeleteTask,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: status })

  return (
    <div className="flex flex-col min-w-0 flex-1 bg-slate-100/75 border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
      <ColumnHeader
        status={status}
        count={tasks.length}
        onAddTask={() => onAddTask(status)}
      />

      {/* Droppable task container */}
      <div
        ref={setNodeRef}
        className={`flex-1 flex flex-col gap-3 min-h-[180px] p-1.5 rounded-xl transition-all duration-150 ${
          isOver
            ? 'bg-emerald-500/10 ring-2 ring-[#00e676] ring-inset'
            : 'bg-transparent'
        }`}
      >
        <SortableContext
          items={tasks.map(t => t.id)}
          strategy={verticalListSortingStrategy}
        >
          {tasks.map(task => (
            <TaskCard
              key={task.id}
              task={task}
              onEdit={onEditTask}
              onDelete={onDeleteTask}
            />
          ))}
        </SortableContext>

        {/* Polished Empty state */}
        {tasks.length === 0 && (
          <div
            onClick={() => onAddTask(status)}
            className="flex-1 border-2 border-dashed border-slate-200/90 rounded-xl flex flex-col items-center justify-center p-6 text-center hover:border-slate-300 hover:bg-white/40 cursor-pointer transition-all duration-150 group"
          >
            <div className="w-8 h-8 rounded-full bg-slate-200/60 text-slate-400 group-hover:bg-[#00e676]/20 group-hover:text-emerald-700 flex items-center justify-center transition-colors mb-2">
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
            </div>
            <p className="text-xs font-semibold text-slate-500 group-hover:text-slate-700 transition-colors">
              No tasks here
            </p>
            <p className="text-[11px] text-slate-400 mt-0.5">Click to add a task</p>
          </div>
        )}
      </div>
    </div>
  )
}
