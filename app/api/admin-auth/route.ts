// Step 1 of the two-step admin login.
// - POST accepts { password }. On correct password, we generate a 6-digit
//   OTP, email it via Resend, and set an HMAC-signed pending cookie holding
//   its hash + expiry. The session cookie is NOT set here; step 2 does that.
// - DELETE clears both cookies (logout).

import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';
import { generateCode, hashCode, packPending, newExp, OTP_COOKIE } from '@/lib/admin-otp';
import { checkRateLimit, clientIP } from '@/lib/rate-limit';

const ADMIN_SECRET  = process.env.ADMIN_SECRET;
const SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN;
const OTP_EMAIL     = process.env.ADMIN_OTP_EMAIL;
const RESEND_KEY    = process.env.RESEND_API_KEY;
const COOKIE_NAME   = 'edify_admin_session';

function isProd(req: NextRequest) {
  return process.env.NODE_ENV === 'production' && !req.nextUrl.hostname.includes('localhost');
}

function maskEmail(e: string): string {
  const [u, d] = e.split('@');
  if (!u || !d) return e;
  if (u.length <= 2) return `${u[0]}*@${d}`;
  return `${u[0]}${'*'.repeat(u.length - 2)}${u[u.length - 1]}@${d}`;
}

export async function POST(req: NextRequest) {
  // Per-IP rate limit: 10 password attempts per 15 min. Prevents someone
  // who's guessed the password from burning through OTPs by repeatedly
  // triggering fresh pending cookies.
  const ip = clientIP(req);
  const rate = checkRateLimit('admin-auth', ip, 10, 15 * 60 * 1000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Too many login attempts — try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
    );
  }

  if (!ADMIN_SECRET || !SESSION_TOKEN) {
    return NextResponse.json(
      { error: 'Server misconfigured — ADMIN_SECRET and ADMIN_SESSION_TOKEN must be set' },
      { status: 503 },
    );
  }
  if (!OTP_EMAIL || !RESEND_KEY) {
    return NextResponse.json(
      { error: 'Server misconfigured — ADMIN_OTP_EMAIL and RESEND_API_KEY must be set for 2FA' },
      { status: 503 },
    );
  }

  const { password } = await req.json().catch(() => ({ password: '' }));

  if (password !== ADMIN_SECRET) {
    // Small random delay slows brute-force.
    await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
    return NextResponse.json({ error: 'Incorrect password' }, { status: 401 });
  }

  const code = generateCode();
  const pending = packPending({ h: hashCode(code), exp: newExp(), n: 0 }, SESSION_TOKEN);

  try {
    const resend = new Resend(RESEND_KEY);
    await resend.emails.send({
      from: 'edifyedu.in Admin <leads@edifyedu.in>',
      to: [OTP_EMAIL],
      subject: `Your admin login code: ${code}`,
      text: [
        `Your edifyedu.in admin login code is:`,
        ``,
        `    ${code}`,
        ``,
        `This code expires in 10 minutes and can only be used once.`,
        ``,
        `If you did not request this, ignore this email — your password is still safe.`,
      ].join('\n'),
      html: `
        <div style="font-family:Arial,Helvetica,sans-serif;max-width:420px;padding:24px;color:#1e293b">
          <h2 style="margin:0 0 14px;color:#0f172a;font-size:18px">Admin login code</h2>
          <p style="margin:0 0 18px;font-size:14px;color:#475569">Enter this code to finish signing in:</p>
          <div style="background:#f8fafc;border:1px solid #e2e8f0;border-radius:10px;padding:18px;text-align:center;margin:0 0 18px">
            <span style="font-size:32px;letter-spacing:8px;font-weight:700;color:#0f172a;font-family:'Courier New',monospace">${code}</span>
          </div>
          <p style="margin:0 0 6px;font-size:12px;color:#94a3b8">Expires in 10 minutes. One-time use.</p>
          <p style="margin:0;font-size:12px;color:#94a3b8">If you did not request this, ignore this email — your password is still safe.</p>
        </div>
      `,
    });
  } catch (err) {
    console.error('OTP email send failed:', err);
    return NextResponse.json({ error: 'Failed to send OTP email — try again in a moment' }, { status: 502 });
  }

  const res = NextResponse.json({ step: 'otp', to: maskEmail(OTP_EMAIL) });
  res.cookies.set(OTP_COOKIE, pending, {
    httpOnly: true,
    secure: isProd(req),
    sameSite: 'strict',
    maxAge: 60 * 10, // 10 minutes
    path: '/',
  });
  return res;
}

export async function DELETE(req: NextRequest) {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  res.cookies.delete(OTP_COOKIE);
  return res;
}
