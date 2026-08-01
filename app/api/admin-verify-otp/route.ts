// Step 2 of the two-step admin login.
// - Reads the HMAC-signed pending cookie set by /api/admin-auth.
// - Verifies the submitted 6-digit code against the stored hash.
// - On success: clears the pending cookie, sets the session cookie.
// - On failure: increments the attempts counter in the pending cookie
//   (max 5 before the cookie is invalidated).

import { NextRequest, NextResponse } from 'next/server';
import {
  hashCode, unpackPending, packPending, isExpired, codesMatch,
  OTP_COOKIE, OTP_MAX_ATTEMPTS,
} from '@/lib/admin-otp';
import { checkRateLimit, clientIP } from '@/lib/rate-limit';

const SESSION_TOKEN = process.env.ADMIN_SESSION_TOKEN;
const COOKIE_NAME   = 'edify_admin_session';
const COOKIE_MAX    = 60 * 60 * 24; // 24h session

function isProd(req: NextRequest) {
  return process.env.NODE_ENV === 'production' && !req.nextUrl.hostname.includes('localhost');
}

function cookieOpts(req: NextRequest, maxAge: number) {
  return {
    httpOnly: true,
    secure: isProd(req),
    sameSite: 'strict' as const,
    maxAge,
    path: '/',
  };
}

export async function POST(req: NextRequest) {
  // Per-IP rate limit: 20 verify attempts per 15 min. Backs up the 5-attempt
  // limit inside the signed pending cookie so an attacker can't just keep
  // requesting fresh pending cookies from admin-auth to reset attempts.
  const ip = clientIP(req);
  const rate = checkRateLimit('admin-verify-otp', ip, 20, 15 * 60 * 1000);
  if (!rate.ok) {
    return NextResponse.json(
      { error: 'Too many attempts — try again shortly.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfter) } },
    );
  }

  if (!SESSION_TOKEN) {
    return NextResponse.json({ error: 'Server misconfigured' }, { status: 503 });
  }

  const pending = req.cookies.get(OTP_COOKIE)?.value;
  if (!pending) {
    return NextResponse.json({ error: 'No pending login — enter your password again.' }, { status: 401 });
  }

  const p = unpackPending(pending, SESSION_TOKEN);
  if (!p) {
    const res = NextResponse.json({ error: 'Invalid session — enter your password again.' }, { status: 401 });
    res.cookies.delete(OTP_COOKIE);
    return res;
  }

  if (isExpired(p.exp)) {
    const res = NextResponse.json({ error: 'Code expired — enter your password again.' }, { status: 401 });
    res.cookies.delete(OTP_COOKIE);
    return res;
  }

  if (p.n >= OTP_MAX_ATTEMPTS) {
    const res = NextResponse.json({ error: 'Too many attempts — enter your password again.' }, { status: 429 });
    res.cookies.delete(OTP_COOKIE);
    return res;
  }

  const { code } = await req.json().catch(() => ({ code: '' }));
  const submitted = String(code || '').replace(/\D/g, '').slice(0, 6);

  const bumpAttempts = () => packPending({ ...p, n: p.n + 1 }, SESSION_TOKEN);

  if (submitted.length !== 6) {
    await new Promise(r => setTimeout(r, 300));
    const res = NextResponse.json({ error: 'Enter the 6-digit code from your email.' }, { status: 400 });
    res.cookies.set(OTP_COOKIE, bumpAttempts(), cookieOpts(req, 60 * 10));
    return res;
  }

  const ok = codesMatch(hashCode(submitted), p.h);

  if (!ok) {
    await new Promise(r => setTimeout(r, 300 + Math.random() * 200));
    const res = NextResponse.json({ error: 'Wrong code — try again.' }, { status: 401 });
    res.cookies.set(OTP_COOKIE, bumpAttempts(), cookieOpts(req, 60 * 10));
    return res;
  }

  // Success. Clear pending, set session.
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(OTP_COOKIE);
  res.cookies.set(COOKIE_NAME, SESSION_TOKEN, cookieOpts(req, COOKIE_MAX));
  return res;
}
