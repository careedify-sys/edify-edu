// CSV export of referrals. Owner only (phone numbers are personal data).
// GET /leads/whatsapp/referrals/export?stage=&review=&due=&campaignId=&q=&university=&from=&to=
// from/to are YYYY-MM-DD in IST; bad dates are dropped by cleanFilter.
// Cells are guarded against spreadsheet formula injection (csvCell via toCsv).
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { currentActor } from '@/lib/whatsapp/admin-session'
import { toCsv } from '@/lib/whatsapp/phones'
import { supabaseReferralRepo, type ReferralRepo } from '@/lib/referrals/referral-repo'
import { mockReferralRepo } from '@/lib/referrals/referral-mock'
import { referMockMode, referMockStore } from '@/lib/referrals/refer-store'
import { exportReferrals } from '@/lib/referrals/referral-service'
import type { ReferralFilter } from '@/lib/referrals/referral-types'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' }
const g = globalThis as unknown as { __referralRepoMock?: ReferralRepo }

export async function GET(req: NextRequest) {
  const actor = await currentActor()
  if (!actor) return NextResponse.json({ error: 'Sign in again.' }, { status: 401, headers })
  const p = req.nextUrl.searchParams
  const f = { q: p.get('q') ?? '', stage: p.get('stage') ?? '', review: p.get('review') ?? '', due: p.get('due') ?? '', campaignId: p.get('campaignId') ?? undefined,
    university: p.get('university') ?? '', from: p.get('from') ?? '', to: p.get('to') ?? '' } as ReferralFilter
  const repo = referMockMode() ? (g.__referralRepoMock ??= mockReferralRepo(referMockStore())) : supabaseReferralRepo(createSupabaseServiceClient())
  try {
    // exportReferrals cleans the filter the same way the list does.
    const r = await exportReferrals(repo, actor, f)
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: 403, headers })
    const file = `referrals-${new Date().toISOString().slice(0, 10)}.csv`
    // BOM so Excel reads ₹ and names correctly.
    return new NextResponse('﻿' + toCsv(r.header, r.rows), {
      headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${file}"` },
    })
  } catch (e) {
    console.warn('[referrals] export failed', (e as { code?: string })?.code ?? 'error')
    return NextResponse.json({ error: 'Export failed. Try again.' }, { status: 500, headers })
  }
}
