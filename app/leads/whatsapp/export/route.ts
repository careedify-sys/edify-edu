// CSV export of a contact list or a campaign report. Owner only.
// GET /leads/whatsapp/export?kind=list|campaign&id=<uuid>
// Same session check as the server actions; middleware guards /leads too.
// Cells are guarded against spreadsheet formula injection (csvCell).
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { currentActor } from '@/lib/whatsapp/admin-session'
import { supabaseCampaignRepo } from '@/lib/whatsapp/campaign-repo'
import { mockCampaignRepo } from '@/lib/whatsapp/campaign-mock'
import { exportRows } from '@/lib/whatsapp/campaign-service'
import { toCsv } from '@/lib/whatsapp/phones'
import type { CampaignRepo } from '@/lib/whatsapp/campaign-repo'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const headers = { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex, nofollow' }
const g = globalThis as unknown as { __waCampaignMock?: CampaignRepo }

export async function GET(req: NextRequest) {
  const actor = await currentActor()
  if (!actor) return NextResponse.json({ error: 'Sign in again.' }, { status: 401, headers })
  const kind = req.nextUrl.searchParams.get('kind') === 'campaign' ? 'campaign' : 'list'
  const id = String(req.nextUrl.searchParams.get('id') ?? '').slice(0, 40)
  const mock = process.env.WA_INBOX_MOCK === '1' && process.env.NODE_ENV !== 'production'
  const repo = mock ? (g.__waCampaignMock ??= mockCampaignRepo()) : supabaseCampaignRepo(createSupabaseServiceClient())
  try {
    const r = await exportRows(repo, actor, kind, id)
    if (!r.ok) return NextResponse.json({ error: r.error }, { status: r.error.includes('permission') ? 403 : 404, headers })
    const file = `${kind}-${r.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '').slice(0, 40) || 'export'}-${new Date().toISOString().slice(0, 10)}.csv`
    // BOM so Excel reads ₹ and names correctly.
    return new NextResponse('﻿' + toCsv(r.header, r.rows), {
      headers: { ...headers, 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': `attachment; filename="${file}"` },
    })
  } catch (e) {
    console.warn('[wa-campaigns] export failed', (e as { code?: string })?.code ?? 'error')
    return NextResponse.json({ error: 'Export failed. Try again.' }, { status: 500, headers })
  }
}
