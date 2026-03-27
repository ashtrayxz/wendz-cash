import { NextRequest, NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase'

export async function GET() {
  const { data, error } = await supabase.from('user_config').select('*').single()
  if (error) return NextResponse.json({ salary: 0, name: 'Você' })
  return NextResponse.json(data)
}

export async function POST(req: NextRequest) {
  const body = await req.json()
  // upsert — cria ou atualiza o único registro de config
  const { data, error } = await supabase
    .from('user_config')
    .upsert({ id: 1, ...body, updated_at: new Date().toISOString() })
    .select()
    .single()
  if (error) return NextResponse.json({ error: error.message }, { status: 500 })
  return NextResponse.json(data)
}
