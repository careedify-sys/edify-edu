// WhatsApp webhook sweeper. Schedule: vercel.json, every 5 minutes.
//
// 1. Re-processes webhook events that are stored but not completed (the
//    database was slow, a deploy cut a request short, a processing bug was
//    fixed). Each event gets at most 5 attempts; after that it is counted as
//    exhausted and left for a person to look at.
// 2. Retention: nulls raw webhook bodies 30 days after receipt, any state.
//    Events older than 7 days are no longer retried and count as exhausted.
//
// Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Anything else
// gets 401. Responses and logs carry counts only.
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { errorClass } from '@/lib/whatsapp/ingest'
import {
  supabaseEventStore, retryIds, purgeRawBodies, exhaustedCount, whatsappServiceClient,
} from '@/lib/whatsapp/store'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const BATCH = 25
const TIME_BUDGET_MS = 20_000

function authorised(header: string | null, secret: string): boolean {
  const want = Buffer.from(`Bearer ${secret}`)
  const got = Buffer.from(header ?? '')
  return got.length === want.length && timingSafeEqual(got, want)
}

export async function GET(req: NextRequest) {
  const secret = process.env.CRON_SECRET
  if (!secret) {
    console.error('[whatsapp-sweep] CRON_SECRET is not set')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }
  if (!authorised(req.headers.get('authorization'), secret)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const sb = whatsappServiceClient()
  const store = supabaseEventStore(sb)
  if (!sb || !store) {
    console.error('[whatsapp-sweep] database not configured')
    return NextResponse.json({ error: 'Not configured' }, { status: 500 })
  }

  const started = Date.now()
  const counts = { retried: 0, completed: 0, failed: 0, busy: 0, errors: 0, purged: 0, exhausted: 0 }
  try {
    const ids = await retryIds(sb, BATCH)
    for (const id of ids) {
      if (Date.now() - started > TIME_BUDGET_MS) break
      counts.retried++
      try {
        const r = await store.process(id)
        if (r.state === 'completed') counts.completed++
        else if (r.state === 'busy' || r.state === 'skipped') counts.busy++
        else counts.failed++
      } catch (err) {
        counts.errors++
        console.warn('[whatsapp-sweep] process error', errorClass(err))
      }
    }
    counts.purged = await purgeRawBodies(sb)
    counts.exhausted = await exhaustedCount(sb)
  } catch (err) {
    console.error('[whatsapp-sweep] failed', errorClass(err))
    return NextResponse.json({ error: 'Sweep failed', ...counts }, { status: 500 })
  }

  if (counts.retried || counts.purged || counts.exhausted) {
    console.info('[whatsapp-sweep]', JSON.stringify(counts))
  }
  return NextResponse.json(counts, { headers: { 'Cache-Control': 'no-store' } })
}
