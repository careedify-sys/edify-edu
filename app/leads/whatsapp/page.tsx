import type { Metadata } from 'next'
import './whatsapp.css'
import InboxClient from './InboxClient'
import { inboxList, inboxSettings, inboxMode } from './actions'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export const metadata: Metadata = {
  title: 'WhatsApp inbox · edifyedu.in',
  robots: { index: false, follow: false },
}

// Auth: middleware.ts guards /leads; each action below checks the session
// again and returns an error instead of data when it is missing.
export default async function WhatsAppInboxPage() {
  const [list, settings, mode] = await Promise.all([
    inboxList({ status: 'open', search: '', unreadOnly: false, beforeAt: null, beforeId: null }),
    inboxSettings(),
    inboxMode(),
  ])
  return (
    <InboxClient
      mode={mode}
      initialRows={list.ok ? list.rows : []}
      initialServerTime={list.ok ? list.serverTime : new Date().toISOString()}
      initialSettings={settings.ok ? settings.settings : null}
      loadError={!list.ok ? list.error : !settings.ok ? settings.error : null}
    />
  )
}
