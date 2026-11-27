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

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export default async function ReferralsPage({ searchParams }: { searchParams: { campaign?: string; id?: string } }) {
  const campaignId = typeof searchParams?.campaign === 'string' && UUID.test(searchParams.campaign) ? searchParams.campaign : undefined
  const filter = campaignId ? { stage: '' as const, campaignId } : { stage: 'open' as const }
  const openId = typeof searchParams?.id === 'string' && UUID.test(searchParams.id) ? searchParams.id : null
  const [l, actor] = await Promise.all([refList(filter), currentActor()])
  return (
    <ReferralsClient
      mode={waMode()}
      initial={l.ok ? l : null}
      initialFilter={filter}
      initialOpenId={openId}
      error={l.ok ? null : l.error}
      owner={can(actor, 'reward_approve')}
      universities={universityOptions()}
      programmes={[...PROGRAMME_OPTIONS]}
    />
  )
}
