import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { validateBody } from '@/lib/validate-body';

const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 30 // events fire more frequently
const ipCounts = new Map<string, { count: number; reset: number }>()

function checkRateLimit(ip: string): boolean {
  const now = Date.now()
  const record = ipCounts.get(ip)
  if (!record || now > record.reset) {
    ipCounts.set(ip, { count: 1, reset: now + RATE_LIMIT_WINDOW })
    return true
  }
  if (record.count >= RATE_LIMIT_MAX) return false
  record.count++
  return true
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown'
  if (!checkRateLimit(ip)) {
    return NextResponse.json({ ok: false }, { status: 429 })
  }

  try {
    const raw = await req.json();
    const check = validateBody(raw);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }
    const body = check.body;

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    const { error } = await supabase.from('events').insert({
      user_id: user?.id ?? null,
      anon_session_id: typeof body.anon_session_id === 'string' ? body.anon_session_id : null,
      event_type: typeof body.event_type === 'string' ? body.event_type : '',
      event_target: typeof body.event_target === 'string' ? body.event_target : null,
      metadata: body.metadata && typeof body.metadata === 'object' && !Array.isArray(body.metadata) && JSON.stringify(body.metadata).length < 2000 ? body.metadata : {},
      page_path: typeof body.page_path === 'string' ? body.page_path : null,
    });

    if (error) {
      console.error('Event insert failed (check RLS policy)', error);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Event tracking error', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
