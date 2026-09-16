// Task detail page — server component that fetches the task by ID,
// validates ownership, then renders the client TaskDetailPanel.

import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import TaskDetailPanel from '@/components/task-detail/TaskDetailPanel'
import Header from '@/components/header/Header'
import Toast from '@/components/Toast'
import type { Task } from '@/lib/types'
import type { Metadata } from 'next'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params
  const supabase = await createClient()
  const { data } = await supabase.from('tasks').select('title').eq('id', id).single()
  return {
    title: data ? `${data.title} — TaskFlow` : 'Task — TaskFlow',
  }
}

export default async function TaskDetailPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) notFound()

  const task = data as Task

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Header email={user.email ?? ''} />
      <main className="flex-1 px-4 sm:px-6 py-8 max-w-4xl mx-auto w-full">
        <TaskDetailPanel task={task} />
      </main>
      <Toast />
    </div>
  )
}
