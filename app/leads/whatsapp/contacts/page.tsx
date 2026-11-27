import type { Metadata } from 'next'
import '../whatsapp.css'
import ContactsClient from './ContactsClient'
import { waLists } from '../campaign-actions'
import { waMode } from '../mode'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = { title: 'Add numbers · WhatsApp · edifyedu.in', robots: { index: false, follow: false } }

// Auth: middleware.ts guards /leads; every action checks the session again.
export default async function ContactsPage() {
  const r = await waLists()
  return <ContactsClient mode={waMode()} lists={r.ok ? r.lists : []} error={r.ok ? null : r.error} />
}
