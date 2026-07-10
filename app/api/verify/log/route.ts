import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { validateBody } from '@/lib/validate-body';

const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 15
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

    const ua = req.headers.get('user-agent') || '';
    const deviceType = /Mobile/i.test(ua) ? 'mobile' : /Tablet/i.test(ua) ? 'tablet' : 'desktop';

    const { error } = await supabase.from('verifications').insert({
      user_id: user?.id ?? null,
      anon_session_id: typeof body.anon_session_id === 'string' ? body.anon_session_id : null,
      university_id: typeof body.university_id === 'string' ? body.university_id : null,
      source: typeof body.source === 'string' ? body.source.slice(0, 200) : null,
      referrer_url: typeof body.referrer_url === 'string' ? body.referrer_url.slice(0, 2000) : null,
      user_agent: ua,
      device_type: deviceType,
    });

    if (error) {
      console.error('Verify log insert failed (check RLS policy)', error);
      return NextResponse.json({ error: 'Insert failed' }, { status: 500 });
    }

    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error('Verify log error', e);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
