import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServiceClient, createSupabaseServerClient } from '@/lib/supabase/server';

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
    const body = await req.json();
    const supabase = createSupabaseServiceClient();
    const ssrClient = await createSupabaseServerClient();
    const { data: { user } } = await ssrClient.auth.getUser();

    await supabase.from('events').insert({
      user_id: user?.id ?? null,
      anon_session_id: body.anon_session_id ?? null,
      event_type: body.event_type,
      event_target: body.event_target ?? null,
      metadata: body.metadata ?? null,
      page_path: body.page_path ?? null,
    });

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Event tracking error', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
