import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { UpdateTaskPayload } from '@/lib/types'

type RouteContext = { params: Promise<{ id: string }> }

// GET /api/tasks/[id] — fetch single task
export async function GET(_req: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (error || !data) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  return NextResponse.json(data)
}

// PATCH /api/tasks/[id] — update a task
export async function PATCH(request: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: UpdateTaskPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { title, description, status, due_date, position } = body

  // Validate title if provided
  if (title !== undefined) {
    if (typeof title !== 'string' || title.trim().length === 0) {
      return NextResponse.json({ error: 'Title cannot be empty' }, { status: 400 })
    }
    if (title.trim().length > 255) {
      return NextResponse.json({ error: 'Title must be 255 characters or fewer' }, { status: 400 })
    }
  }

  const validStatuses = ['todo', 'in_progress', 'done']
  if (status !== undefined && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Ensure task belongs to user
  const { data: existing } = await supabase
    .from('tasks')
    .select('id')
    .eq('id', id)
    .eq('user_id', user.id)
    .single()

  if (!existing) {
    return NextResponse.json({ error: 'Task not found' }, { status: 404 })
  }

  const updates: Record<string, unknown> = {}
  if (title !== undefined) updates.title = title.trim()
  if (description !== undefined) updates.description = description?.trim() || null
  if (status !== undefined) updates.status = status
  if (due_date !== undefined) updates.due_date = due_date
  if (position !== undefined) updates.position = position

  const { data, error } = await supabase
    .from('tasks')
    .update(updates)
    .eq('id', id)
    .eq('user_id', user.id)
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// DELETE /api/tasks/[id] — delete a task
export async function DELETE(_req: Request, { params }: RouteContext) {
  const { id } = await params
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)
    .eq('user_id', user.id)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return new NextResponse(null, { status: 204 })
}
