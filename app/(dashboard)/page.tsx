// Dashboard home — server component that fetches tasks from Supabase and
// mounts the interactive client-side KanbanBoard.

import { createClient } from '@/lib/supabase/server'
import KanbanBoard from '@/components/kanban/KanbanBoard'
import type { Task } from '@/lib/types'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Board — Stride',
  description: 'Manage your tasks on your personal board.',
}

export default async function DashboardPage() {
  const supabase = await createClient()

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .order('status')
    .order('position')

  const tasks: Task[] = (error ? [] : data) ?? []

  return <KanbanBoard initialTasks={tasks} />
}
