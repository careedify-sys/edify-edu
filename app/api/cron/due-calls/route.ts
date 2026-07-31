// Daily reminder: emails Rishi the list of leads that need a call today.
//
// Schedule: vercel.json → "30 2 * * *" (02:30 UTC = 08:00 IST).
// Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. We reject
// anything without that header, so manually hitting the URL from a browser
// or a bot won't spam Rishi's inbox.

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { createSupabaseServiceClient } from '@/lib/supabase/service';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

type LeadRow = {
  id: string;
  name: string;
  phone: string;
  program: string | null;
  university: string | null;
  stage: string;
  next_call_date: string | null;
  next_call_time: string | null;
  created_at: string;
};

function fmtPhone(p: string) {
  const d = p.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('91')) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`;
  if (d.length === 10) return `+91 ${d.slice(0, 5)} ${d.slice(5)}`;
  return p;
}

function escHtml(s: string) {
  return s.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
          .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}

export async function GET(req: NextRequest) {
  // Auth. Vercel Cron always sends this header if CRON_SECRET is set.
  const expected = process.env.CRON_SECRET;
  const authOK =
    !!expected &&
    req.headers.get('authorization') === `Bearer ${expected}`;
  if (!authOK) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const sb = createSupabaseServiceClient();

  // Pull every "active" lead (small enough set to filter in memory).
  // Active = not Converted, not Not-interested, not Next-session.
  const { data: leadsData, error: leadsErr } = await sb
    .from('leads')
    .select('id,name,phone,program,university,stage,next_call_date,next_call_time,created_at')
    .not('stage', 'in', '("Converted","Not interested","Next session")');
  if (leadsErr) {
    return NextResponse.json({ error: `leads query: ${leadsErr.message}` }, { status: 500 });
  }
  const leads = (leadsData ?? []) as LeadRow[];
  if (leads.length === 0) {
    return NextResponse.json({ ok: true, sent: false, reason: 'no active leads' });
  }

  // For "Fresh with no calls" detection we need to know which leads have
  // ever had a call logged. One targeted query rather than N+1.
  const { data: callsData, error: callsErr } = await sb
    .from('lead_activity')
    .select('lead_id')
    .eq('type', 'call')
    .in('lead_id', leads.map(l => l.id));
  if (callsErr) {
    return NextResponse.json({ error: `activity query: ${callsErr.message}` }, { status: 500 });
  }
  const leadsWithCalls = new Set((callsData ?? []).map(r => r.lead_id));

  // "Due today" = (next_call_date <= today) OR (Fresh with no calls).
  const todayISO = new Date().toISOString().slice(0, 10);
  type Due = LeadRow & { reason: string };
  const due: Due[] = [];
  for (const l of leads) {
    let reason = '';
    if (l.next_call_date && l.next_call_date <= todayISO) {
      reason = l.next_call_date === todayISO ? 'due today' : `overdue since ${l.next_call_date}`;
    } else if (l.stage === 'Fresh' && !leadsWithCalls.has(l.id)) {
      reason = 'new lead — no calls yet';
    }
    if (reason) due.push({ ...l, reason });
  }

  if (due.length === 0) {
    return NextResponse.json({ ok: true, sent: false, reason: 'nothing due' });
  }

  // Sort: overdue first (oldest date), then Fresh with no calls, then today.
  due.sort((a, b) => {
    const aOver = a.next_call_date && a.next_call_date < todayISO;
    const bOver = b.next_call_date && b.next_call_date < todayISO;
    if (aOver && !bOver) return -1;
    if (!aOver && bOver) return 1;
    return (a.next_call_date || '9999').localeCompare(b.next_call_date || '9999');
  });

  // Build email body.
  const listText = due
    .map(l => {
      const bits = [l.program, l.university].filter(Boolean).join(' · ');
      return `• ${l.name} · ${fmtPhone(l.phone)}${bits ? ` — ${bits}` : ''}  [${l.reason}]`;
    })
    .join('\n');

  const listHtml = due.map(l => {
    const bits = [l.program, l.university].filter(Boolean).map(escHtml).join(' · ');
    return `<tr>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:14px"><b>${escHtml(l.name)}</b><br><span style="color:#64748b;font-size:12px">${escHtml(fmtPhone(l.phone))}</span></td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:13px;color:#334155">${bits || '<span style="color:#94a3b8">—</span>'}</td>
      <td style="padding:8px 10px;border-bottom:1px solid #e2e8f0;font-size:12px;color:${l.reason.startsWith('overdue') ? '#dc2626' : '#0f172a'}">${escHtml(l.reason)}</td>
    </tr>`;
  }).join('');

  const subject = `${due.length} lead${due.length === 1 ? '' : 's'} to call today — edifyedu.in`;
  const crmUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://edifyedu.in';

  const resendKey = process.env.RESEND_API_KEY;
  if (!resendKey) {
    return NextResponse.json({ ok: true, sent: false, reason: 'RESEND_API_KEY not set', count: due.length });
  }
  const resend = new Resend(resendKey);

  const to = process.env.LEAD_EMAIL_PRIMARY || 'hello@edifyedu.in';

  const { error: mailErr } = await resend.emails.send({
    from: 'edifyedu.in Leads <leads@edifyedu.in>',
    to: [to],
    subject,
    text: [
      `Good morning Rishi,`,
      ``,
      `${due.length} lead${due.length === 1 ? '' : 's'} need${due.length === 1 ? 's' : ''} a call today:`,
      ``,
      listText,
      ``,
      `Open the CRM: ${crmUrl}/leads`,
    ].join('\n'),
    html: `
      <div style="font-family:Arial,Helvetica,sans-serif;max-width:640px;color:#1e293b">
        <h2 style="color:#0f172a;margin:0 0 8px;font-size:18px">Good morning Rishi</h2>
        <p style="margin:0 0 16px;font-size:14px;color:#475569">${due.length} lead${due.length === 1 ? '' : 's'} need${due.length === 1 ? 's' : ''} a call today.</p>
        <table style="width:100%;border-collapse:collapse;font-family:Arial,Helvetica,sans-serif;margin:0 0 20px">
          ${listHtml}
        </table>
        <p style="margin:0"><a href="${crmUrl}/leads" style="background:#147D5A;color:#fff;padding:10px 18px;border-radius:8px;text-decoration:none;font-size:14px;font-weight:600">Open the CRM →</a></p>
      </div>
    `,
  });

  if (mailErr) {
    return NextResponse.json({ ok: false, error: mailErr.message, count: due.length }, { status: 500 });
  }

  return NextResponse.json({ ok: true, sent: true, count: due.length, to });
}
