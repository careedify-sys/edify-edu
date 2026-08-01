// Server-only helpers for the admin 2FA OTP flow.
// We keep no server state — the pending OTP is stored in an HMAC-signed,
// httpOnly cookie so it works across Vercel serverless invocations without
// a database round-trip.

import crypto from 'node:crypto';

if (typeof window !== 'undefined') {
  throw new Error('lib/admin-otp.ts must not be imported in the browser');
}

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes
export const OTP_COOKIE = 'edify_otp_pending';
export const OTP_MAX_ATTEMPTS = 5;

// 6-digit code, crypto-secure random.
export function generateCode(): string {
  return String(crypto.randomInt(0, 1_000_000)).padStart(6, '0');
}

// SHA-256(code) → base64url. We store this in the cookie, never the code.
export function hashCode(code: string): string {
  return crypto.createHash('sha256').update(code).digest('base64url');
}

function sign(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('base64url');
}

export type PendingPayload = {
  h: string;   // hashCode(otp)
  exp: number; // unix ms
  n: number;   // attempts used
};

// Cookie format: "<payloadB64>.<sig>". Sig prevents tampering with h/exp/n.
export function packPending(payload: PendingPayload, secret: string): string {
  const b = Buffer.from(JSON.stringify(payload)).toString('base64url');
  return `${b}.${sign(b, secret)}`;
}

export function unpackPending(cookieValue: string, secret: string): PendingPayload | null {
  const parts = cookieValue.split('.');
  if (parts.length !== 2) return null;
  const [b, s] = parts;
  const expected = sign(b, secret);
  const a = Buffer.from(expected);
  const c = Buffer.from(s);
  if (a.length !== c.length) return null;
  try {
    if (!crypto.timingSafeEqual(a, c)) return null;
    return JSON.parse(Buffer.from(b, 'base64url').toString('utf8')) as PendingPayload;
  } catch {
    return null;
  }
}

export function newExp(): number { return Date.now() + OTP_TTL_MS; }
export function isExpired(exp: number): boolean { return Date.now() > exp; }

// Timing-safe hash comparison.
export function codesMatch(submittedHash: string, storedHash: string): boolean {
  const a = Buffer.from(submittedHash, 'base64url');
  const b = Buffer.from(storedHash, 'base64url');
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}
