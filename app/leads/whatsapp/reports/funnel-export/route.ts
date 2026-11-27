// CSV export of the referral funnel and cost table on the reports page. Owner only.
// GET /leads/whatsapp/reports/funnel-export
// Same rows as the page: the 20 newest non-draft campaigns that have stats.
// Cost columns are ESTIMATES: Meta-billable messages x marketing rate x (1 + GST %).
// Cells are guarded against spreadsheet formula injection (csvCell via toCsv).
import { NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { currentActor } from '@/lib/whatsapp/admin-session'
import { can } from '@/lib/whatsapp/access'
import { toCsv } from '@/lib/whatsapp/phones'
import { supabaseCampaignRepo, type CampaignRepo } from '@/lib/whatsapp/campaign-repo'
import { mockCampaignRepo } from '@/lib/whatsapp/campaign-mock'
import { loadCampaigns, loadCampaignSettings } from '@/lib/whatsapp/campaign-service'
import { supabaseReferralRepo, type ReferralRepo } from '@/lib/referrals/referral-repo'
import { mockReferralRepo } from '@/lib/referrals/referral-mock'
import { referMockMode, referMockStore } from '@/lib/referrals/refer-store'
import { campaignFunnels } from '@/lib/referrals/referral-service'
import { funnelCosts, EMPTY_FUNNEL } from '@/lib/referrals/funnel'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const headers = { 'Cache-Control': 'private, no-store', 'X-Robots-Tag': 'noindex, nofollow' }
const g = globalThis as unknown as { __waCampaignMock?: CampaignRepo; __referralRepoMock?: ReferralRepo }

export async function GET() {
  const actor = await currentActor()
  if (!actor) return NextResponse.json({ error: 'Sign in again.' }, { status: 401, headers })
  if (!can(actor, 'export')) return NextResponse.json({ error: 'You do not have permission for this.' }, { status: 403, headers })
  const campaignMock = process.env.WA_INBOX_MOCK === '1' && process.env.NODE_ENV !== 'production'
  const campaigns = campaignMock ? (g.__waCampaignMock ??= mockCampaignRepo()) : supabaseCampaignRepo(createSupabaseServiceClient())
  const referrals = referMockMode() ? (g.__referralRepoMock ??= mockReferralRepo(referMockStore())) : supabaseReferralRepo(createSupabaseServiceClient())
  try {
    const [cr, st] = await Promise.all([loadCampaigns(campaigns, actor), loadCampaignSettings(campaigns, actor)])
    if (!cr.ok) return NextResponse.json({ error: cr.error }, { status: 403, headers })
    const withStats = cr.campaigns.filter(c => c.status !== 'draft' && c.stats)
    const fr = await campaignFunnels(referrals, actor, withStats.map(c => c.id))
    if (!fr.ok) return NextResponse.json({ error: fr.error }, { status: 403, headers })
    // Rate and GST read the same way as reports/page.tsx.
    const rate = st.ok ? st.settings.marketingRate : null
    const tax = st.ok ? st.settings.taxPct : 18
    const header = ['Campaign', 'Started', 'Form opens', 'Referrals', 'From link', 'Matched by phone', 'Unique valid', 'Contacted',
      'Applications', 'Admissions', 'Rewards pending', 'Rewards pending (Rs)', 'Rewards paid', 'Rewards paid (Rs)',
      'Meta-billable messages', 'Marketing rate (Rs)', 'GST %', 'Est. message spend (Rs)', 'Est. cost per referral (Rs)',
      'Est. cost per admission (Rs)', 'Est. all-in cost per admission (Rs)']
    const blank = (n: number | null) => (n == null ? '' : n)
    const rows = withStats.map(c => {
      const f = fr.funnels[c.id] ?? EMPTY_FUNNEL
      const billable = c.stats!.meta_billable
      const k = funnelCosts(f, billable, rate, tax)
      return [c.name, String(c.started_at ?? c.approved_at ?? '').slice(0, 10), f.form_opens, f.submitted, f.by_link, f.by_phone_match,
        f.unique_valid, f.contacted, f.applications, f.admissions, f.rewards_pending_n, f.rewards_pending_inr, f.rewards_paid_n, f.rewards_paid_inr,
        billable, blank(rate), tax, blank(k.estSpendInr), blank(k.perReferralInr), blank(k.perAdmissionInr), blank(k.allInPerAdmissionInr)]
    })
    const file = `referral-funnel-${new Date().toISOString().slice(0, 10)}.csv`
    // BOM so Excel reads ₹ and names correctly.
    return new NextResponse('﻿' + toCsv(header, rows), {
      headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${file}"` },
    })
  } catch (e) {
    console.warn('[referrals] funnel export failed', (e as { code?: string })?.code ?? 'error')
    return NextResponse.json({ error: 'Export failed. Try again.' }, { status: 500, headers })
  }
}
