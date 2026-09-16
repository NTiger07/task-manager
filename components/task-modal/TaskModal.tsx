'use client'

// TaskModal — presentation shell for task creation and editing.
// Encapsulates the modal backdrop, keyboard escape handler, focus containment, and header.

import { useEffect, useRef } from 'react'
import TaskForm, { type TaskFormValues } from './TaskForm'

interface TaskModalProps {
  isOpen: boolean
  mode: 'create' | 'edit'
  initialValues?: Partial<TaskFormValues>
  onSubmit: (values: TaskFormValues) => Promise<void>
  onClose: () => void
  isLoading?: boolean
}

export default function TaskModal({
  isOpen,
  mode,
  initialValues,
  onSubmit,
  onClose,
  isLoading,
}: TaskModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null)

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [isOpen, onClose])

  // Lock body scroll while open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen) return null

  const isCreate = mode === 'create'
  const title = isCreate ? 'New task' : 'Edit task'
  const subtitle = isCreate
    ? 'Add a new task'
    : 'Update details for this task'

  return (
    <div
      ref={overlayRef}
      id="task-modal-overlay"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/45 backdrop-blur-sm transition-opacity duration-200"
      onClick={e => {
        if (e.target === overlayRef.current) onClose()
      }}
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <div
        id="task-modal"
        className="bg-white rounded-2xl w-full max-w-lg border border-slate-200/90 shadow-2xl overflow-hidden flex flex-col max-h-[92vh] transition-all transform duration-200 scale-100"
      >
        {/* Modal header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-white">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100/60">
              {isCreate ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
              ) : (
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
              )}
            </div>
            <div>
              <h2 className="text-slate-900 font-bold text-base leading-none">{title}</h2>
              <p className="text-xs text-slate-500 mt-1">{subtitle}</p>
            </div>
          </div>

          <button
            id="task-modal-close"
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 flex items-center justify-center rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* Form body + footer */}
        <TaskForm
          key={mode === 'create' ? 'create' : (initialValues?.title ?? 'edit')}
          mode={mode}
          initialValues={initialValues}
          onSubmit={onSubmit}
          onCancel={onClose}
          submitLabel={isCreate ? 'Create task' : 'Save changes'}
          isLoading={isLoading}
        />
      </div>
    </div>
  )
}
