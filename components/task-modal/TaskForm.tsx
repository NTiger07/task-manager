'use client'

// TaskForm — handles field inputs, validation, and submission for tasks.
// Used inside TaskModal for create/edit operations.

import { useState, useEffect } from 'react'
import FormField from './FormField'
import type { TaskStatus } from '@/lib/types'

export interface TaskFormValues {
  title: string
  description: string
  status: TaskStatus
  due_date: string
}

interface TaskFormProps {
  initialValues?: Partial<TaskFormValues>
  onSubmit: (values: TaskFormValues) => Promise<void>
  onCancel: () => void
  submitLabel?: string
  isLoading?: boolean
}

const STATUS_OPTIONS: { value: TaskStatus; label: string }[] = [
  { value: 'todo', label: 'To Do' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'done', label: 'Done' },
]

const inputClass =
  'w-full px-3.5 py-2.5 text-sm text-slate-900 bg-white border border-slate-200 rounded-lg placeholder-slate-400 focus:outline-none focus:border-[#00e676] focus:ring-2 focus:ring-[#00e676]/20 transition-all duration-150'

export default function TaskForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Create task',
  isLoading = false,
}: TaskFormProps) {
  const [values, setValues] = useState<TaskFormValues>({
    title: initialValues?.title ?? '',
    description: initialValues?.description ?? '',
    status: initialValues?.status ?? 'todo',
    due_date: initialValues?.due_date ?? '',
  })
  const [errors, setErrors] = useState<Partial<Record<keyof TaskFormValues, string>>>({})

  // Sync when initialValues change (e.g. when opening edit for a different task)
  useEffect(() => {
    if (initialValues) {
      setValues({
        title: initialValues.title ?? '',
        description: initialValues.description ?? '',
        status: initialValues.status ?? 'todo',
        due_date: initialValues.due_date ?? '',
      })
      setErrors({})
    }
  }, [initialValues?.title, initialValues?.status, initialValues?.due_date, initialValues?.description])

  function validate(): boolean {
    const next: typeof errors = {}
    if (!values.title.trim()) {
      next.title = 'Title is required'
    } else if (values.title.trim().length > 255) {
      next.title = 'Title must be 255 characters or fewer'
    }
    setErrors(next)
    return Object.keys(next).length === 0
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    await onSubmit(values)
  }

  function field(key: keyof TaskFormValues) {
    return {
      value: values[key],
      onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setValues(v => ({ ...v, [key]: e.target.value }))
        if (errors[key]) setErrors(e2 => ({ ...e2, [key]: undefined }))
      },
    }
  }

  return (
    <form id="task-form" onSubmit={handleSubmit} noValidate className="flex flex-col flex-1">
      {/* Form Fields Body */}
      <div className="px-6 py-5 flex flex-col gap-4 overflow-y-auto">
        {/* Title */}
        <FormField id="task-title" label="Title" required error={errors.title}>
          <input
            id="task-title"
            type="text"
            placeholder="e.g. Design user onboarding flow"
            maxLength={255}
            className={inputClass}
            autoFocus
            {...field('title')}
          />
        </FormField>

        {/* Description */}
        <FormField id="task-description" label="Description">
          <textarea
            id="task-description"
            placeholder="Add additional context, notes, or acceptance criteria…"
            rows={3}
            className={`${inputClass} resize-none`}
            {...field('description')}
          />
        </FormField>

        {/* Status + Due date in a 2-column grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <FormField id="task-status" label="Status">
            <select id="task-status" className={inputClass} {...field('status')}>
              {STATUS_OPTIONS.map(o => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </FormField>

          <FormField id="task-due-date" label="Due date">
            <input
              id="task-due-date"
              type="date"
              className={inputClass}
              {...field('due_date')}
            />
          </FormField>
        </div>
      </div>

      {/* Modal Footer with Action Buttons */}
      <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-end gap-3 rounded-b-2xl mt-auto">
        <button
          type="button"
          onClick={onCancel}
          disabled={isLoading}
          className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 text-slate-700 bg-white hover:bg-slate-100 hover:text-slate-900 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          id="task-form-submit"
          disabled={isLoading}
          className="px-4.5 py-2 text-sm font-semibold rounded-lg bg-[#00e676] hover:bg-[#00c853] text-slate-950 shadow-sm transition-all duration-150 hover:shadow disabled:opacity-60 flex items-center gap-2 cursor-pointer"
        >
          {isLoading && (
            <svg className="animate-spin w-4 h-4 text-slate-900" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
            </svg>
          )}
          {submitLabel}
        </button>
      </div>
    </form>
  )
}
