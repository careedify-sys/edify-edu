import type { Metadata } from 'next'
import '../../whatsapp.css'
import CampaignClient from './CampaignClient'
import { WaShell } from '../../WaShell'
import { waCampaign, waLists, waTemplates } from '../../campaign-actions'
import { waMode } from '../../mode'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = { title: 'Campaign · WhatsApp · edifyedu.in', robots: { index: false, follow: false } }

export default async function CampaignPage({ params }: { params: { id: string } }) {
  const [c, l, t] = await Promise.all([waCampaign(params.id), waLists(), waTemplates()])
  if (!c.ok) {
    return <WaShell active="campaigns" title="Campaign" mode={waMode()} error={c.error}><a href="/leads/whatsapp/campaigns">Back to campaigns</a></WaShell>
  }
  return <CampaignClient mode={waMode()} initial={c.view} lists={l.ok ? l.lists : []} templates={t.ok ? t.templates : []} />
}
