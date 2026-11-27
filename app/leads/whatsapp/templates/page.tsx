import type { Metadata } from 'next'
import '../whatsapp.css'
import TemplatesClient from './TemplatesClient'
import { waTemplates } from '../campaign-actions'
import { waMode } from '../mode'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = { title: 'Templates · WhatsApp · edifyedu.in', robots: { index: false, follow: false } }

export default async function TemplatesPage() {
  const r = await waTemplates()
  return <TemplatesClient mode={waMode()} initial={r.ok ? r.templates : []} error={r.ok ? null : r.error} />
}
