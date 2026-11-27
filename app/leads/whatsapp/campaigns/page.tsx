import type { Metadata } from 'next'
import '../whatsapp.css'
import CampaignsClient from './CampaignsClient'
import { waCampaigns, waLists, waCampaignSettings } from '../campaign-actions'
import { waMode } from '../mode'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = { title: 'Campaigns · WhatsApp · edifyedu.in', robots: { index: false, follow: false } }

export default async function CampaignsPage({ searchParams }: { searchParams: { list?: string } }) {
  const [c, l, s] = await Promise.all([waCampaigns(), waLists(), waCampaignSettings()])
  const lists = l.ok ? l.lists : []
  const want = typeof searchParams?.list === 'string' ? searchParams.list : null
  return (
    <CampaignsClient mode={waMode()} campaigns={c.ok ? c.campaigns : []} lists={lists}
      presetList={lists.some(x => x.id === want) ? want : null} enabled={s.ok ? s.settings.enabled : false}
      error={!c.ok ? c.error : !l.ok ? l.error : null} />
  )
}
