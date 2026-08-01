// Simple in-memory sliding-window rate limiter.
// On Vercel serverless this resets per instance cold-start — imperfect, but
// good enough for the admin login gate (single user, very low volume).
// For higher-scale, back this with Upstash Redis or Vercel KV later.

if (typeof window !== 'undefined') {
  throw new Error('lib/rate-limit.ts must not be imported in the browser');
}

type Slot = { count: number; reset: number };

// One store per bucket so different endpoints don't collide.
const stores = new Map<string, Map<string, Slot>>();

export type RateResult = { ok: true } | { ok: false; retryAfter: number };

export function checkRateLimit(
  bucket: string,
  key: string,
  max: number,
  windowMs: number,
): RateResult {
  let store = stores.get(bucket);
  if (!store) { store = new Map(); stores.set(bucket, store); }
  const now = Date.now();
  const rec = store.get(key);
  if (!rec || now > rec.reset) {
    store.set(key, { count: 1, reset: now + windowMs });
    return { ok: true };
  }
  if (rec.count >= max) {
    return { ok: false, retryAfter: Math.ceil((rec.reset - now) / 1000) };
  }
  rec.count++;
  return { ok: true };
}

// Best-effort client IP from proxy headers. Vercel sets x-forwarded-for.
export function clientIP(req: { headers: { get: (name: string) => string | null } }): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0].trim();
  return req.headers.get('x-real-ip') || 'unknown';
}
