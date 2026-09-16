'use client'

// TaskDetailPanel — detailed task view with inline status transitions, edit, and deletion.

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import StatusBadge from '@/components/StatusBadge'
import DueDateIndicator from '@/components/DueDateIndicator'
import ConfirmDialog from '@/components/ConfirmDialog'
import TaskModal from '@/components/task-modal/TaskModal'
import { showToast } from '@/components/Toast'
import type { Task, TaskStatus } from '@/lib/types'
import type { TaskFormValues } from '@/components/task-modal/TaskForm'

interface TaskDetailPanelProps {
  task: Task
}

export default function TaskDetailPanel({ task: initialTask }: TaskDetailPanelProps) {
  const [task, setTask] = useState<Task>(initialTask)
  const [editOpen, setEditOpen] = useState(false)
  const [editLoading, setEditLoading] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const router = useRouter()

  async function handleQuickStatusChange(newStatus: TaskStatus) {
    if (task.status === newStatus || updatingStatus) return
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to update status')
      }
      const updated: Task = await res.json()
      setTask(updated)
      showToast(`Status updated to ${newStatus.replace('_', ' ')}`, 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Failed to update status', 'error')
    } finally {
      setUpdatingStatus(false)
    }
  }

  async function handleEdit(values: TaskFormValues) {
    setEditLoading(true)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      })
      if (!res.ok) {
        const err = await res.json()
        throw new Error(err.error ?? 'Failed to update task')
      }
      const updated: Task = await res.json()
      setTask(updated)
      setEditOpen(false)
      showToast('Task updated successfully', 'success')
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong', 'error')
    } finally {
      setEditLoading(false)
    }
  }

  async function handleDelete() {
    setConfirmOpen(false)
    try {
      const res = await fetch(`/api/tasks/${task.id}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error('Delete failed')
      showToast('Task deleted', 'success')
      router.push('/')
      router.refresh()
    } catch {
      showToast('Failed to delete task', 'error')
    }
  }

  const createdAt = new Date(task.created_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
  const updatedAt = new Date(task.updated_at).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <>
      <div className="w-full flex flex-col gap-5">
        {/* Navigation Breadcrumb */}
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-sm text-slate-500 hover:text-slate-900 font-semibold transition-colors group"
          >
            <div className="w-6 h-6 rounded-md bg-white border border-slate-200 flex items-center justify-center text-slate-400 group-hover:text-slate-700 group-hover:border-slate-300 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </div>
            <span>Back to board</span>
          </Link>
        </div>

        {/* Main Task Card */}
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          {/* Card Header */}
          <div className="p-6 sm:p-7 border-b border-slate-100 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2.5 mb-3 flex-wrap">
                <StatusBadge status={task.status} />
                <DueDateIndicator dueDate={task.due_date} />
              </div>
              <h1 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug break-words">
                {task.title}
              </h1>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 flex-shrink-0 self-start">
              <button
                id="edit-task-btn"
                onClick={() => setEditOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-50 hover:text-slate-900 transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                <span>Edit</span>
              </button>
              <button
                id="delete-task-btn"
                onClick={() => setConfirmOpen(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg border border-red-200 text-red-600 bg-white hover:bg-red-50 transition-colors cursor-pointer"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                  <path d="M10 11v6M14 11v6M9 6V4h6v2" />
                </svg>
                <span>Delete</span>
              </button>
            </div>
          </div>

          {/* Quick Status Action Bar */}
          <div className="px-6 sm:px-7 py-3 bg-slate-50 border-b border-slate-100 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Status Actions:
            </span>
            {task.status === 'todo' && (
              <div className="flex items-center gap-2">
                <button
                  id="action-mark-in-progress"
                  onClick={() => handleQuickStatusChange('in_progress')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-blue-50 hover:bg-blue-100/90 text-blue-700 border border-blue-200/80 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  <span>Mark as in progress</span>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>
                <button
                  id="action-mark-done"
                  onClick={() => handleQuickStatusChange('done')}
                  disabled={updatingStatus}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span>Mark as done</span>
                </button>
              </div>
            )}
            {task.status === 'in_progress' && (
              <button
                id="action-mark-done"
                onClick={() => handleQuickStatusChange('done')}
                disabled={updatingStatus}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg bg-emerald-50 hover:bg-emerald-100/90 text-emerald-800 border border-emerald-200/80 transition-all cursor-pointer disabled:opacity-50 active:scale-[0.98]"
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Mark as done</span>
              </button>
            )}
            {task.status === 'done' && (
              <div className="flex items-center gap-1.5 text-xs font-medium text-emerald-700 bg-emerald-50/80 px-2.5 py-1 rounded-md border border-emerald-200/60">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                <span>Task is completed</span>
              </div>
            )}
          </div>

          {/* Description */}
          <div className="p-6 sm:p-7 border-b border-slate-100">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2.5">
              Description
            </h2>
            {task.description ? (
              <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">
                {task.description}
              </p>
            ) : (
              <p className="text-sm text-slate-400 italic">No description provided.</p>
            )}
          </div>

          {/* Metadata Grid */}
          <div className="p-6 sm:p-7 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetaItem label="Status">
              <StatusBadge status={task.status} />
            </MetaItem>
            <MetaItem label="Due date">
              {(() => {
                if (!task.due_date) return <span className="text-sm text-slate-400">Not set</span>
                const d = new Date(task.due_date + 'T00:00:00')
                if (isNaN(d.getTime()) || d.getFullYear() > 2100 || d.getFullYear() < 1970) {
                  return <span className="text-sm text-slate-400">Not set</span>
                }
                return (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-slate-800 font-medium">
                      {d.toLocaleDateString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                      })}
                    </span>
                  </div>
                )
              })()}
            </MetaItem>
            <MetaItem label="Created">
              <span className="text-sm text-slate-600">{createdAt}</span>
            </MetaItem>
            <MetaItem label="Last updated">
              <span className="text-sm text-slate-600">{updatedAt}</span>
            </MetaItem>
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <TaskModal
        isOpen={editOpen}
        mode="edit"
        initialValues={{
          title: task.title,
          description: task.description ?? '',
          status: task.status,
          due_date: task.due_date ?? '',
        }}
        onSubmit={handleEdit}
        onClose={() => setEditOpen(false)}
        isLoading={editLoading}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete task?"
        message={`"${task.title}" will be permanently removed. This action cannot be undone.`}
        confirmLabel="Delete"
        cancelLabel="Keep it"
        danger
        onConfirm={handleDelete}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  )
}

function MetaItem({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{label}</p>
      <div>{children}</div>
    </div>
  )
}
