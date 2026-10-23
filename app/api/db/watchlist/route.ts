import { NextResponse, type NextRequest } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const status = request.nextUrl.searchParams.get('status')

  let query = supabase
    .from('users_watchlists')
    .select('*')
    .eq('user_id', user.id)
    .order('created_at', { ascending: false })

  if (status) query = query.eq('list_status', status)

  const { data, error } = await query
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}

// POST /api/db/watchlist  body: { tmdb_id, media_type, media_title, list_status }
export async function POST(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const body = await request.json()

  const { data, error } = await supabase
    .from('users_watchlists')
    .upsert({ ...body, user_id: user.id }, { onConflict: 'user_id,media_type,tmdb_id' })
    .select()
    .single()

  if (error) { console.log(error); return NextResponse.json({ error: error.message }, { status: 500 }) }
  return NextResponse.json(data)
}

// DELETE /api/db/watchlist?media_type=movie&tmdb_id=603
export async function DELETE(request: NextRequest) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const params = request.nextUrl.searchParams
  const { error } = await supabase
    .from('users_watchlists')
    .delete()
    .eq('user_id', user.id)
    .eq('media_type', params.get('media_type')!)
    .eq('tmdb_id', Number(params.get('tmdb_id')))

  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json({ ok: true })
}