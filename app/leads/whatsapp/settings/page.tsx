import type { Metadata } from 'next'
import '../whatsapp.css'
import SettingsClient from './SettingsClient'
import { waCampaignSettings } from '../campaign-actions'
import { waMode } from '../mode'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = { title: 'Campaign settings · WhatsApp · edifyedu.in', robots: { index: false, follow: false } }

export default async function CampaignSettingsPage() {
  const r = await waCampaignSettings()
  return <SettingsClient mode={waMode()} initial={r.ok ? r.settings : null} migrationReady={r.ok ? r.migrationReady : false} error={r.ok ? null : r.error} />
}
