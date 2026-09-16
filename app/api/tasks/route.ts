import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { CreateTaskPayload } from '@/lib/types'

// GET /api/tasks — list all tasks for the authenticated user
export async function GET() {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { data, error } = await supabase
    .from('tasks')
    .select('*')
    .eq('user_id', user.id)
    .order('status')
    .order('position')

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data)
}

// POST /api/tasks — create a new task
export async function POST(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: CreateTaskPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { title, description, status = 'todo', due_date } = body

  if (!title || typeof title !== 'string' || title.trim().length === 0) {
    return NextResponse.json({ error: 'Title is required' }, { status: 400 })
  }

  if (title.trim().length > 255) {
    return NextResponse.json({ error: 'Title must be 255 characters or fewer' }, { status: 400 })
  }

  const validStatuses = ['todo', 'in_progress', 'done']
  if (status && !validStatuses.includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }

  // Determine max position in the target column
  const { data: maxPos } = await supabase
    .from('tasks')
    .select('position')
    .eq('user_id', user.id)
    .eq('status', status)
    .order('position', { ascending: false })
    .limit(1)
    .single()

  const position = maxPos ? maxPos.position + 1 : 0

  const { data, error } = await supabase
    .from('tasks')
    .insert({
      user_id: user.id,
      title: title.trim(),
      description: description?.trim() || null,
      status,
      due_date: due_date || null,
      position,
    })
    .select()
    .single()

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  return NextResponse.json(data, { status: 201 })
}
