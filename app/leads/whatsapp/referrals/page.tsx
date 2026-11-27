import type { Metadata } from 'next'
import '../whatsapp.css'
import ReferralsClient from './ReferralsClient'
import { refList } from '../referral-actions'
import { waMode } from '../mode'
import { currentActor } from '@/lib/whatsapp/admin-session'
import { can } from '@/lib/whatsapp/access'
import { universityOptions } from '@/lib/referrals/uni-options'
import { PROGRAMME_OPTIONS } from '@/lib/referrals/refer-rules'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = { title: 'Referrals · WhatsApp · edifyedu.in', robots: { index: false, follow: false } }

export default async function ReferralsPage() {
  const [l, actor] = await Promise.all([refList({ stage: 'open' }), currentActor()])
  return (
    <ReferralsClient
      mode={waMode()}
      initial={l.ok ? l : null}
      error={l.ok ? null : l.error}
      owner={can(actor, 'reward_approve')}
      universities={universityOptions()}
      programmes={[...PROGRAMME_OPTIONS]}
    />
  )
}
