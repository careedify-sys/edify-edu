import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import { validateBody } from '@/lib/validate-body';

const RATE_LIMIT_WINDOW = 60_000
const RATE_LIMIT_MAX = 5
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
    return NextResponse.json({ error: 'Too many requests' }, { status: 429 })
  }

  try {
    const raw = await req.json();
    const check = validateBody(raw, 10000);
    if (!check.ok) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const cap = (v: unknown, max: number) => typeof v === 'string' ? v.trim().slice(0, max) : '';
    const name = cap(raw.name, 200);
    const whatsapp = cap(raw.whatsapp, 20);
    const email = cap(raw.email, 200);
    const university = cap(raw.university, 200);
    const question = cap(raw.question, 5000);

    if (!name || !whatsapp || !question) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from('pro_report_requests').insert({
      name,
      whatsapp,
      email: email || null,
      university_interest: university || null,
      question,
      status: 'new',
    });

    if (error) {
      console.error('Helpdesk insert error:', error);
      return NextResponse.json({ error: 'Database error' }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Helpdesk API error:', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
