// POST /api/refer: one referral from the public /refer form.
// Details travel in the JSON body only, never in the URL. The response is the
// referral id and nothing about anyone else.
import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { validateReferral, type ReferInput } from '@/lib/referrals/refer-rules'
import { submitReferral, hashIp, notificationEmail } from '@/lib/referrals/refer-service'
import { referralStore, referMockMode } from '@/lib/referrals/refer-store'
import { universityOptions } from '@/lib/referrals/uni-options'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const HEADERS = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow' }
const reply = (body: unknown, status = 200) => NextResponse.json(body, { status, headers: HEADERS })
const MAX_BODY = 8 * 1024

// Only the site's own pages may post here.
// The host must be the real site (or localhost in development), so a script
// pointed at the *.vercel.app address cannot pass by sending matching headers.
const SITE_HOSTS = new Set(['edifyedu.in', 'www.edifyedu.in'])
function sameOrigin(req: NextRequest): boolean {
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  if (!origin || !host) return false
  const dev = process.env.NODE_ENV !== 'production' && /^localhost(:\d+)?$/.test(host)
  if (!SITE_HOSTS.has(host) && !dev) return false
  try { return new URL(origin).host === host } catch { return false }
}

// Cloudflare sets cf-connecting-ip and overwrites any value the client sent;
// the first x-forwarded-for entry is client-controlled, so it is never used.
function clientIp(req: NextRequest): string {
  return req.headers.get('cf-connecting-ip')?.trim() || req.headers.get('x-real-ip')?.trim() || 'unknown'
}

export async function POST(req: NextRequest) {
  if (!sameOrigin(req)) return reply({ ok: false, error: 'Please submit the form on edifyedu.in/refer.' }, 403)
  // Browsers always send Content-Length for this form; without it the body
  // would be read in full before the size check.
  const len = Number(req.headers.get('content-length') ?? NaN)
  if (!Number.isFinite(len)) return reply({ ok: false, error: 'Could not read the form. Please try again.' }, 411)
  if (len > MAX_BODY) return reply({ ok: false, error: 'The form is too long.' }, 413)
  let raw: Partial<ReferInput>
  try {
    const text = await req.text()
    if (text.length > MAX_BODY) return reply({ ok: false, error: 'The form is too long.' }, 413)
    raw = JSON.parse(text)
    if (!raw || typeof raw !== 'object') throw new Error('not an object')
  } catch { return reply({ ok: false, error: 'Could not read the form. Please try again.' }, 400) }

  const v = validateReferral(raw, universityOptions())
  if (!v.ok) {
    // A bot gets a plain refusal with nothing it can tune against.
    if (v.bot) return reply({ ok: false, error: 'Please wait a moment and submit again.' }, 400)
    return reply({ ok: false, error: 'Please check the highlighted fields.', fields: v.errors }, 400)
  }

  try {
    const store = referralStore()
    if (!(await store.disclosure())) return reply({ ok: false, error: 'Referrals are not open yet.' }, 503)
    const key = process.env.SUPABASE_SERVICE_ROLE_KEY ?? (referMockMode() ? 'mock' : '')
    const r = await submitReferral(store, v.value, hashIp(clientIp(req), key))
    if (!r.ok) return reply({ ok: false, error: r.error }, r.status)

    if (r.outcome === 'created') {
      const resendKey = process.env.RESEND_API_KEY
      if (resendKey && !referMockMode()) {
        try {
          const mail = notificationEmail(r.refCode, v.value, await store.details(r.referralId))
          await new Resend(resendKey).emails.send({
            from: 'edifyedu.in Leads <leads@edifyedu.in>',
            to: [process.env.LEAD_EMAIL_PRIMARY || 'hello@edifyedu.in', ...(process.env.LEAD_EMAIL_SECONDARY ? [process.env.LEAD_EMAIL_SECONDARY] : [])],
            subject: mail.subject, html: mail.html, text: mail.text,
          })
        } catch { console.warn('[refer] notification email failed') }
      }
    }
    return reply({ ok: true, refCode: r.refCode, repeat: r.outcome === 'repeat' })
  } catch (e) {
    console.warn('[refer] submit failed', (e as { code?: string })?.code ?? 'error')
    return reply({ ok: false, error: 'We could not save your referral. Please try again.' }, 500)
  }
}
