'use client'

// KanbanBoard — the root drag-and-drop controller and interactive dashboard.
// Owns task state, real-time search filtering, dynamic task metrics, API calls, and DndContext.

import { useState, useMemo } from 'react'
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  closestCorners,
  type DragStartEvent,
  type DragOverEvent,
  type DragEndEvent,
} from '@dnd-kit/core'
import { arrayMove } from '@dnd-kit/sortable'
import KanbanColumn from './KanbanColumn'
import TaskCard from './TaskCard'
import TaskModal from '@/components/task-modal/TaskModal'
import ConfirmDialog from '@/components/ConfirmDialog'
import { showToast } from '@/components/Toast'
import type { Task, TaskStatus } from '@/lib/types'
import type { TaskFormValues } from '@/components/task-modal/TaskForm'

const COLUMNS: TaskStatus[] = ['todo', 'in_progress', 'done']

interface KanbanBoardProps {
  initialTasks: Task[]
}

export default function KanbanBoard({ initialTasks }: KanbanBoardProps) {
  const [tasks, setTasks] = useState<Task[]>(initialTasks)
  const [activeTask, setActiveTask] = useState<Task | null>(null)
  const [searchQuery, setSearchQuery] = useState('')

  // Modal state
  const [modalOpen, setModalOpen] = useState(false)
  const [modalMode, setModalMode] = useState<'create' | 'edit'>('create')
  const [modalInitial, setModalInitial] = useState<Partial<TaskFormValues>>({})
  const [editingTask, setEditingTask] = useState<Task | null>(null)
  const [modalLoading, setModalLoading] = useState(false)

  // Delete confirm state
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)

  // ── Drag sensors ──────────────────────────────────────────────────────
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  )

  // ── Search & Metrics ──────────────────────────────────────────────────
  const filteredTasks = useMemo(() => {
    if (!searchQuery.trim()) return tasks
    const query = searchQuery.toLowerCase()
    return tasks.filter(
      t =>
        t.title.toLowerCase().includes(query) ||
        (t.description && t.description.toLowerCase().includes(query))
    )
  }, [tasks, searchQuery])

  const counts = useMemo(() => {
    return {
      total: tasks.length,
      todo: tasks.filter(t => t.status === 'todo').length,
      in_progress: tasks.filter(t => t.status === 'in_progress').length,
      done: tasks.filter(t => t.status === 'done').length,
    }
  }, [tasks])

  function tasksForColumn(status: TaskStatus) {
    return filteredTasks
      .filter(t => t.status === status)
      .sort((a, b) => a.position - b.position)
  }

  // ── Drag handlers ─────────────────────────────────────────────────────
  function onDragStart({ active }: DragStartEvent) {
    const task = tasks.find(t => t.id === active.id)
    setActiveTask(task ?? null)
  }

  function onDragOver({ active, over }: DragOverEvent) {
    if (!over) return
    const activeId = active.id as string
    const overId = over.id as string
    if (activeId === overId) return

    const activeTaskItem = tasks.find(t => t.id === activeId)
    if (!activeTaskItem) return

    const overIsColumn = COLUMNS.includes(overId as TaskStatus)
    const overTask = tasks.find(t => t.id === overId)
    const targetStatus: TaskStatus = overIsColumn
      ? (overId as TaskStatus)
      : overTask?.status ?? activeTaskItem.status

    if (activeTaskItem.status !== targetStatus) {
      setTasks(prev =>
        prev.map(t => (t.id === activeId ? { ...t, status: targetStatus } : t))
      )
    }
  }

  function onDragEnd({ active, over }: DragEndEvent) {
    setActiveTask(null)
    if (!over) return

    const activeId = active.id as string
    const overId = over.id as string

    const activeTaskObj = tasks.find(t => t.id === activeId)
    if (!activeTaskObj) return

    const overIsColumn = COLUMNS.includes(overId as TaskStatus)
    const targetStatus: TaskStatus = overIsColumn
      ? (overId as TaskStatus)
      : (tasks.find(t => t.id === overId)?.status ?? activeTaskObj.status)

    const columnTasks = tasks
      .filter(t => t.status === targetStatus)
      .sort((a, b) => a.position - b.position)

    const oldIndex = columnTasks.findIndex(t => t.id === activeId)
    const newIndex = overIsColumn
      ? columnTasks.length - 1
      : columnTasks.findIndex(t => t.id === overId)

    const reordered = arrayMove(
      columnTasks,
      oldIndex < 0 ? columnTasks.length - 1 : oldIndex,
      newIndex < 0 ? 0 : newIndex
    )
    const withPositions = reordered.map((t, i) => ({
      ...t,
      position: i,
      status: targetStatus,
    }))

    setTasks(prev => {
      const remaining = prev.filter(t => t.status !== targetStatus)
      return [...remaining, ...withPositions]
    })

    // Persist to API
    const updates = withPositions.map(t => ({
      id: t.id,
      position: t.position,
      status: t.status,
    }))
    fetch('/api/tasks/reorder', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ updates }),
    }).catch(() => showToast('Failed to save order', 'error'))
  }

  // ── CRUD handlers ─────────────────────────────────────────────────────
  function openCreateModal(status: TaskStatus = 'todo') {
    setModalMode('create')
    setModalInitial({ status })
    setEditingTask(null)
    setModalOpen(true)
  }

  function openEditModal(task: Task) {
    setModalMode('edit')
    setEditingTask(task)
    setModalInitial({
      title: task.title,
      description: task.description ?? '',
      status: task.status,
      due_date: task.due_date ?? '',
    })
    setModalOpen(true)
  }

  async function handleModalSubmit(values: TaskFormValues) {
    setModalLoading(true)
    try {
      if (modalMode === 'create') {
        const res = await fetch('/api/tasks', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? 'Failed to create task')
        }
        const created: Task = await res.json()
        setTasks(prev => [...prev, created])
        showToast('Task created successfully', 'success')
      } else if (editingTask) {
        const res = await fetch(`/api/tasks/${editingTask.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(values),
        })
        if (!res.ok) {
          const err = await res.json()
          throw new Error(err.error ?? 'Failed to update task')
        }
        const updated: Task = await res.json()
        setTasks(prev => prev.map(t => (t.id === updated.id ? updated : t)))
        showToast('Task updated successfully', 'success')
      }
      setModalOpen(false)
    } catch (err) {
      showToast(err instanceof Error ? err.message : 'Something went wrong', 'error')
    } finally {
      setModalLoading(false)
    }
  }

  function requestDelete(taskId: string) {
    setDeletingId(taskId)
    setConfirmOpen(true)
  }

  async function confirmDelete() {
    if (!deletingId) return
    setConfirmOpen(false)
    try {
      const res = await fetch(`/api/tasks/${deletingId}`, { method: 'DELETE' })
      if (!res.ok && res.status !== 204) throw new Error('Failed to delete')
      setTasks(prev => prev.filter(t => t.id !== deletingId))
      showToast('Task deleted', 'success')
    } catch {
      showToast('Failed to delete task', 'error')
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Dynamic Dashboard Controls Bar ── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white rounded-2xl p-5 border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">My Board</h1>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {counts.total} {counts.total === 1 ? 'task' : 'tasks'}
            </span>
          </div>

          {/* Column Breakdown Pills */}
          <div className="flex items-center gap-2 mt-2 flex-wrap text-xs font-medium text-slate-500">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-slate-50 text-slate-600 border border-slate-100">
              To Do: <strong className="text-slate-800">{counts.todo}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-blue-50/60 text-blue-700 border border-blue-100/60">
              In Progress: <strong className="text-blue-900">{counts.in_progress}</strong>
            </span>
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-emerald-50/60 text-emerald-700 border border-emerald-100/60">
              Done: <strong className="text-emerald-900">{counts.done}</strong>
            </span>
          </div>
        </div>

        {/* Right side controls: Search input & + Add Task button */}
        <div className="flex items-center gap-3 flex-wrap sm:flex-nowrap">
          <div className="relative w-full sm:w-64">
            <svg
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search tasks…"
              className="w-full pl-9 pr-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg placeholder-slate-400 focus:bg-white focus:outline-none focus:border-[#00e676] focus:ring-2 focus:ring-[#00e676]/20 transition-all"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 text-xs"
              >
                ✕
              </button>
            )}
          </div>

          <button
            id="global-add-task-btn"
            onClick={() => openCreateModal('todo')}
            className="flex-shrink-0 inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold rounded-lg bg-[#00e676] hover:bg-[#00c853] text-slate-950 shadow-sm hover:shadow transition-all duration-150 cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            <span>New Task</span>
          </button>
        </div>
      </div>

      {/* ── Search Active Notice ── */}
      {searchQuery && (
        <div className="text-xs text-slate-500 px-1 flex items-center justify-between">
          <span>
            Showing results matching &ldquo;<strong className="text-slate-700">{searchQuery}</strong>&rdquo; ({filteredTasks.length} found)
          </span>
          <button
            onClick={() => setSearchQuery('')}
            className="text-emerald-600 hover:underline font-medium cursor-pointer"
          >
            Clear filter
          </button>
        </div>
      )}

      {/* ── Drag & Drop Kanban Grid ── */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={onDragStart}
        onDragOver={onDragOver}
        onDragEnd={onDragEnd}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {COLUMNS.map(status => (
            <KanbanColumn
              key={status}
              status={status}
              tasks={tasksForColumn(status)}
              onAddTask={openCreateModal}
              onEditTask={openEditModal}
              onDeleteTask={requestDelete}
            />
          ))}
        </div>

        {/* Floating drag preview */}
        <DragOverlay dropAnimation={{ duration: 150, easing: 'ease' }}>
          {activeTask ? (
            <TaskCard
              task={activeTask}
              onEdit={() => {}}
              onDelete={() => {}}
              isDragOverlay
            />
          ) : null}
        </DragOverlay>
      </DndContext>

      {/* Create / Edit modal */}
      <TaskModal
        isOpen={modalOpen}
        mode={modalMode}
        initialValues={modalInitial}
        onSubmit={handleModalSubmit}
        onClose={() => setModalOpen(false)}
        isLoading={modalLoading}
      />

      {/* Delete confirmation */}
      <ConfirmDialog
        isOpen={confirmOpen}
        title="Delete task?"
        message="This action cannot be undone. The task will be permanently removed."
        confirmLabel="Delete"
        cancelLabel="Keep it"
        danger
        onConfirm={confirmDelete}
        onCancel={() => {
          setConfirmOpen(false)
          setDeletingId(null)
        }}
      />
    </div>
  )
}
