import type { Metadata } from 'next'
import '../whatsapp.css'
import AutomationClient from './AutomationClient'
import { autoLoad } from '../automation-actions'
import { waMode } from '../mode'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = { title: 'Auto-replies · WhatsApp · edifyedu.in', robots: { index: false, follow: false } }

export default async function AutomationPage() {
  const d = await autoLoad()
  return <AutomationClient mode={waMode()} initial={d.ok ? d : null} error={d.ok ? null : d.error} />
}
