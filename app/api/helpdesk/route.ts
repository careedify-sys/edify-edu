import { NextRequest, NextResponse } from 'next/server';
import { createSupabaseServerClient } from '@/lib/supabase/server';

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
    const body = await req.json();
    const { name, whatsapp, email, university, question } = body;

    if (!name?.trim() || !whatsapp?.trim() || !question?.trim()) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();

    const { error } = await supabase.from('pro_report_requests').insert({
      name: name.trim(),
      whatsapp: whatsapp.trim(),
      email: email?.trim() || null,
      university_interest: university?.trim() || null,
      question: question.trim(),
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
