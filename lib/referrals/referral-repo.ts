// Data access for the referrals dashboard. Server only (service-role client).
import type { SupabaseClient } from '@supabase/supabase-js'
import type { ActivityRow, ReferralFilter, ReferralRow, RewardRule, Stage } from './referral-types'

export type ReferralPatch = Partial<Pick<ReferralRow,
  'stage' | 'review_state' | 'next_follow_up' | 'final_university' | 'admission_confirmed_on' | 'reward_rule_id' |
  'reward_amount_inr' | 'reward_approved_at' | 'reward_approved_by' | 'reward_paid_on' | 'payment_ref' | 'closed_reason'>>

export interface ReferralRepo {
  list(f: ReferralFilter, today: string, limit?: number): Promise<ReferralRow[]>
  get(id: string): Promise<ReferralRow | null>
  activity(id: string): Promise<ActivityRow[]>
  // Applies only while the row is still at expectStage, so two tabs cannot
  // both approve or both pay. Returns null when the row had moved on.
  update(id: string, expectStage: Stage, patch: ReferralPatch): Promise<ReferralRow | null>
  addActivity(id: string, kind: ActivityRow['kind'], body: string, actor: string): Promise<void>
  leadNote(leadId: string, remark: string): Promise<void>
  rules(): Promise<RewardRule[]>
  saveRule(r: Omit<RewardRule, 'id'> & { id?: string }): Promise<RewardRule>
  campaigns(): Promise<Array<{ id: string; name: string }>>
  conversationFor(phone: string): Promise<string | null>
}

const SELECT = '*, wa_campaigns(name)'
const flatten = (r: Record<string, unknown>): ReferralRow => {
  const { wa_campaigns, ...rest } = r as Record<string, unknown> & { wa_campaigns?: { name?: string } | null }
  return { ...(rest as unknown as ReferralRow), campaign_name: wa_campaigns?.name ?? null }
}
// PostgREST filter syntax treats , ( ) . : * as operators; keep search text plain.
const SEARCH_JUNK = new RegExp('[^\\p{L}\\p{N} +-]', 'gu')
export const cleanSearch = (q: string) => q.replace(SEARCH_JUNK, ' ').replace(/\s+/g, ' ').trim().slice(0, 60)

export function supabaseReferralRepo(sb: SupabaseClient): ReferralRepo {
  const must = <T,>(r: { data: T | null; error: { code?: string } | null }): T => {
    if (r.error) throw Object.assign(new Error('referral db error'), { code: r.error.code })
    return r.data as T
  }
  return {
    async list(f, today, limit = 500) {
      let q = sb.from('referrals').select(SELECT).order('created_at', { ascending: false }).limit(limit)
      if (f.stage === 'open') q = q.not('stage', 'in', '(reward_paid,closed)')
      else if (f.stage) q = q.eq('stage', f.stage)
      if (f.review === 'needs_review') q = q.eq('review_state', 'needs_review')
      if (f.campaignId) q = q.eq('campaign_id', f.campaignId)
      if (f.due === 'pending') q = q.in('stage', ['admission_confirmed', 'reward_approved']).gte('reward_due_on', today)
      if (f.due === 'overdue') q = q.in('stage', ['admission_confirmed', 'reward_approved']).lt('reward_due_on', today)
      if (f.due === 'followup_due') q = q.lte('next_follow_up', today).not('stage', 'in', '(reward_paid,closed)')
      const s = cleanSearch(f.q ?? '')
      if (s) {
        const digits = s.replace(/\D/g, '')
        const ors = [`ref_code.ilike.*${s}*`, `referrer_name.ilike.*${s}*`, `referred_name.ilike.*${s}*`]
        if (digits.length >= 4) ors.push(`referrer_phone.ilike.*${digits}*`, `referred_phone.ilike.*${digits}*`)
        q = q.or(ors.join(','))
      }
      return (must(await q) as Record<string, unknown>[]).map(flatten)
    },
    async get(id) {
      const r = must(await sb.from('referrals').select(SELECT).eq('id', id).maybeSingle())
      return r ? flatten(r as Record<string, unknown>) : null
    },
    async activity(id) {
      return must(await sb.from('referral_activity').select('*').eq('referral_id', id).order('created_at', { ascending: false }).limit(200)) as ActivityRow[]
    },
    async update(id, expectStage, patch) {
      const r = must(await sb.from('referrals').update(patch).eq('id', id).eq('stage', expectStage).select(SELECT).maybeSingle())
      return r ? flatten(r as Record<string, unknown>) : null
    },
    async addActivity(id, kind, body, actor) {
      must(await sb.from('referral_activity').insert({ referral_id: id, kind, body: body.slice(0, 2000), actor }))
    },
    async leadNote(leadId, remark) {
      must(await sb.from('lead_activity').insert({ lead_id: leadId, type: 'note', remark: remark.slice(0, 1000) }))
    },
    async rules() {
      return must(await sb.from('referral_reward_rules').select('id,label,programme,university_id,amount_inr,conditions,active').order('created_at')) as RewardRule[]
    },
    async saveRule(r) {
      const { id, ...rest } = r
      const res = id
        ? await sb.from('referral_reward_rules').update(rest).eq('id', id).select('id,label,programme,university_id,amount_inr,conditions,active').single()
        : await sb.from('referral_reward_rules').insert(rest).select('id,label,programme,university_id,amount_inr,conditions,active').single()
      return must(res) as RewardRule
    },
    async campaigns() {
      return must(await sb.from('wa_campaigns').select('id,name').order('created_at', { ascending: false }).limit(200)) as Array<{ id: string; name: string }>
    },
    async conversationFor(phone) {
      const c = must(await sb.from('wa_contacts').select('id').eq('phone_e164', phone).maybeSingle()) as { id: string } | null
      if (!c) return null
      const conv = must(await sb.from('wa_conversations').select('id').eq('contact_id', c.id).order('last_message_at', { ascending: false, nullsFirst: false }).limit(1).maybeSingle()) as { id: string } | null
      return conv?.id ?? null
    },
  }
}
