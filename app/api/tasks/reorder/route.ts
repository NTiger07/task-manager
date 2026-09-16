import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'
import type { ReorderPayload } from '@/lib/types'

// PATCH /api/tasks/reorder — bulk update positions and statuses after drag-and-drop
export async function PATCH(request: Request) {
  const supabase = await createClient()

  const { data: { user }, error: authError } = await supabase.auth.getUser()
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: ReorderPayload
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 })
  }

  const { updates } = body

  if (!Array.isArray(updates) || updates.length === 0) {
    return NextResponse.json({ error: 'updates array is required' }, { status: 400 })
  }

  const validStatuses = ['todo', 'in_progress', 'done']
  for (const u of updates) {
    if (!u.id || typeof u.position !== 'number' || !validStatuses.includes(u.status)) {
      return NextResponse.json({ error: 'Invalid update entry' }, { status: 400 })
    }
  }

  // Use Promise.all for concurrent updates
  const promises = updates.map(({ id, position, status }) =>
    supabase
      .from('tasks')
      .update({ position, status })
      .eq('id', id)
      .eq('user_id', user.id)
  )

  const results = await Promise.all(promises)
  const failed = results.find(r => r.error)
  if (failed?.error) {
    return NextResponse.json({ error: failed.error.message }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}
