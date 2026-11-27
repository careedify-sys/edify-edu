// POST /api/refer/open {c}: counts one /refer page open for a campaign link.
// Counted from the browser, not the page render, because the edge caches the
// page HTML. These are page opens, not button clicks: Meta does not report clicks.
import { NextRequest, NextResponse } from 'next/server'
import { CAMPAIGN_TOKEN_RE } from '@/lib/referrals/refer-rules'
import { referralStore } from '@/lib/referrals/refer-store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  const headers = { 'Cache-Control': 'private, no-store, max-age=0' }
  const origin = req.headers.get('origin')
  const host = req.headers.get('x-forwarded-host') ?? req.headers.get('host')
  let same = false
  try { same = !!origin && !!host && new URL(origin).host === host } catch { same = false }
  if (!same) return new NextResponse(null, { status: 204, headers })
  try {
    const body = (await req.json()) as { c?: unknown }
    if (typeof body?.c === 'string' && CAMPAIGN_TOKEN_RE.test(body.c)) await referralStore().countOpen(body.c)
  } catch { /* counting is best effort */ }
  return new NextResponse(null, { status: 204, headers })
}
