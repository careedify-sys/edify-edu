// WhatsApp webhook sweeper. Schedule: vercel.json, every 5 minutes.
//
// 1. Re-processes webhook events that are stored but not completed (the
//    database was slow, a deploy cut a request short, a processing bug was
//    fixed). Each event gets at most 5 attempts; after that it is counted as
//    exhausted and left for a person to look at.
// 2. Retention: nulls raw webhook bodies 30 days after receipt, any state.
//    Events older than 7 days are no longer retried and count as exhausted.
// 3. Opt-outs (Phase 2): a STOP-like message becomes a recorded No for
//    WhatsApp replies and for calls.
// 4. Retention (Phase 2, Q-WA2): messages, notes and inactive contacts are
//    deleted after 24 months. Due at most once every 20 hours; the database
//    decides, so a run every 5 minutes costs one cheap read.
// 5. Campaigns (Phase 3): a STOP or "Stop promotions" becomes a recorded
//    marketing No, then lib/whatsapp/campaign-worker.ts sends at most one
//    batch per approved campaign. It does nothing unless the owner switched
//    campaigns on and approved a campaign. Campaign recipient rows follow the
//    same 24-month retention.
//
// Auth: Vercel Cron sends `Authorization: Bearer $CRON_SECRET`. Anything else
// gets 401. Responses and logs carry counts only.
import { NextRequest, NextResponse } from 'next/server'
import { timingSafeEqual } from 'crypto'
import { errorClass } from '@/lib/whatsapp/ingest'
import {
  supabaseEventStore, retryIds, purgeRawBodies, exhaustedCount, whatsappServiceClient, recordSweep,
  recordOptOuts, applyRetention,
} from '@/lib/whatsapp/store'
import { supabaseCampaignRepo } from '@/lib/whatsapp/campaign-repo'
import { runCampaignWorker } from '@/lib/whatsapp/campaign-worker'
import { readGraphEnv } from '@/lib/whatsapp/graph'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'
// Retries get 20 s, campaign sending stops starting new messages by 50 s.
export const maxDuration = 60

const BATCH = 25
const TIME_BUDGET_MS = 20_000
const CAMPAIGN_DEADLINE_MS = 50_000

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
  const counts = {
    retried: 0, completed: 0, failed: 0, busy: 0, errors: 0, purged: 0, exhausted: 0, optOuts: -1, retention: 'skipped',
    marketingOptOuts: -1, campaign: 'skipped' as string, campaignSent: 0, campaignFailed: 0, campaignUnknown: 0, campaignRetention: -1,
  }
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
    // After the retries, so an opt-out that just arrived is already stored.
    counts.optOuts = (await recordOptOuts(sb)) ?? -1
    const r = await applyRetention(sb)
    counts.retention = r == null ? 'error' : r === 'not_due' ? 'not_due' : 'ran'
    await runCampaigns(sb, counts, started)
  } catch (err) {
    console.error('[whatsapp-sweep] failed', errorClass(err))
    await recordSweep(sb, { at: new Date().toISOString(), ok: false, ms: Date.now() - started, ...counts })
    return NextResponse.json({ error: 'Sweep failed', ...counts }, { status: 500 })
  }

  if (counts.retried || counts.purged || counts.exhausted || counts.optOuts !== 0 || counts.retention !== 'not_due'
      || counts.marketingOptOuts > 0 || (counts.campaign !== 'off' && counts.campaign !== 'idle')) {
    console.info('[whatsapp-sweep]', JSON.stringify(counts))
  }
  await recordSweep(sb, { at: new Date().toISOString(), ok: true, ms: Date.now() - started, ...counts })
  return NextResponse.json(counts, { headers: { 'Cache-Control': 'no-store' } })
}

// Separate try: a campaign problem must never stop the webhook retries above
// from being recorded, and the reverse. Counts only in logs.
async function runCampaigns(sb: NonNullable<ReturnType<typeof whatsappServiceClient>>, counts: Record<string, unknown>, started: number) {
  const repo = supabaseCampaignRepo(sb)
  try {
    counts.marketingOptOuts = await repo.recordMarketingOptOuts()
    if (counts.retention === 'ran') counts.campaignRetention = await repo.retention()
    const w = await runCampaignWorker(repo, readGraphEnv(), fetch, started + CAMPAIGN_DEADLINE_MS)
    counts.campaign = w.blocked.length ? `${w.state}:${w.blocked.join(',')}` : w.state
    counts.campaignSent = w.sent
    counts.campaignFailed = w.failed
    counts.campaignUnknown = w.unknown
  } catch (err) {
    // 42883 / PGRST202: the Phase 3 migration has not run. Not an error for the sweep.
    counts.campaign = `error:${errorClass(err)}`
    console.warn('[whatsapp-sweep] campaign step failed', errorClass(err))
  }
}
