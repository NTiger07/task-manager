export type TaskStatus = 'todo' | 'in_progress' | 'done'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  status: TaskStatus
  due_date: string | null // ISO date string e.g. "2024-12-31"
  created_at: string
  updated_at: string
  position: number
}

export interface CreateTaskPayload {
  title: string
  description?: string
  status?: TaskStatus
  due_date?: string
}

export interface UpdateTaskPayload {
  title?: string
  description?: string
  status?: TaskStatus
  due_date?: string | null
  position?: number
}

export interface ReorderPayload {
  updates: { id: string; position: number; status: TaskStatus }[]
}

export interface ApiError {
  error: string
  status: number
}
