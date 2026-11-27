// Supabase store for /refer, and the store picker shared by the page and the
// API routes. Server only: it uses the service-role client.
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { mockReferralStore, type ReferralStore, type SubmitRow } from './refer-service'
import { TERMS_VERSION } from './refer-rules'

export function supabaseReferralStore(): ReferralStore {
  const sb = createSupabaseServiceClient()
  return {
    async submit(code, r, ipHash) {
      const { data, error } = await sb.rpc('referral_submit', {
        p_code: code, p_referrer_name: r.referrerName, p_referrer_phone: r.referrerPhone,
        p_referred_name: r.referredName, p_referred_phone: r.referredPhone,
        p_programme: r.programme, p_pref_uni_id: r.universityId, p_pref_uni: r.university, p_note: r.note,
        p_terms_version: TERMS_VERSION, p_wa_optin: r.waOptin, p_campaign_token: r.campaign, p_ip_hash: ipHash,
      })
      if (error) throw Object.assign(new Error('referral_submit failed'), { code: error.code })
      const row = (Array.isArray(data) ? data[0] : data) as SubmitRow | undefined
      if (!row) throw new Error('referral_submit returned nothing')
      return row
    },
    async countOpen(token) {
      const { data, error } = await sb.rpc('referral_count_open', { p_token: token })
      return !error && data === true
    },
    async disclosure() {
      const { data, error } = await sb.from('wa_settings').select('value').eq('key', 'referral_disclosure').maybeSingle()
      if (error || !data) return ''
      return typeof data.value === 'string' ? data.value.trim() : ''
    },
    async details(id) {
      const { data, error } = await sb.from('referrals').select('flags,attribution,campaign_id,wa_campaigns(name)').eq('id', id).maybeSingle()
      if (error || !data) return null
      const c = (data as { wa_campaigns?: { name?: string } | null }).wa_campaigns
      return { flags: (data.flags as string[]) ?? [], attribution: String(data.attribution), campaign: c?.name ?? null }
    },
  }
}

const g = globalThis as unknown as { __referMock?: ReturnType<typeof mockReferralStore> }
export const referMockMode = () => process.env.WA_INBOX_MOCK === '1' && process.env.NODE_ENV !== 'production'
export function referralStore(): ReferralStore {
  return referMockMode() ? (g.__referMock ??= mockReferralStore()) : supabaseReferralStore()
}
