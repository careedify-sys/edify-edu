// In-memory referrals for WA_INBOX_MOCK=1 and tests. Shares rows with the
// /refer mock store, so a test submission appears on the dashboard.
import type { ReferralRepo } from './referral-repo'
import type { ActivityRow, ReferralRow, RewardRule } from './referral-types'
import { cleanSearch } from './referral-repo'
import type { mockReferralStore } from './refer-service'

type Store = ReturnType<typeof mockReferralStore>
const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10)

export function mockReferralRepo(store: Store): ReferralRepo & { activityLog: ActivityRow[]; leadNotes: string[] } {
  const activityLog: ActivityRow[] = []
  const leadNotes: string[] = []
  const rules: RewardRule[] = []
  let n = 0
  const rows = () => store.rows.map(x => x.row)
  return {
    activityLog, leadNotes,
    async list(f, today, limit = 500) {
      const s = cleanSearch(f.q ?? '').toLowerCase()
      const digits = s.replace(/\D/g, '')
      return rows().filter(r => {
        if (f.stage === 'open' && (r.stage === 'reward_paid' || r.stage === 'closed')) return false
        if (f.stage && f.stage !== 'open' && r.stage !== f.stage) return false
        if (f.review === 'needs_review' && r.review_state !== 'needs_review') return false
        if (f.campaignId && r.campaign_id !== f.campaignId) return false
        const dueStage = r.stage === 'admission_confirmed' || r.stage === 'reward_approved'
        if (f.due === 'pending' && !(dueStage && r.reward_due_on && r.reward_due_on >= today)) return false
        if (f.due === 'overdue' && !(dueStage && r.reward_due_on && r.reward_due_on < today)) return false
        if (f.due === 'followup_due' && !(r.next_follow_up && r.next_follow_up <= today && r.stage !== 'reward_paid' && r.stage !== 'closed')) return false
        if (s) {
          const hay = `${r.ref_code} ${r.referrer_name} ${r.referred_name}`.toLowerCase()
          const ph = digits.length >= 4 && (r.referrer_phone.includes(digits) || r.referred_phone.includes(digits))
          if (!hay.includes(s) && !ph) return false
        }
        return true
      }).sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, limit).map(r => ({ ...r, flags: [...r.flags] }))
    },
    async get(id) { const r = rows().find(x => x.id === id); return r ? { ...r, flags: [...r.flags] } : null },
    async activity(id) { return activityLog.filter(a => a.referral_id === id).sort((a, b) => b.created_at.localeCompare(a.created_at)) },
    async update(id, expectStage, patch) {
      const r = rows().find(x => x.id === id)
      if (!r || r.stage !== expectStage) return null
      Object.assign(r, patch, { updated_at: new Date().toISOString() })
      r.reward_due_on = r.admission_confirmed_on ? addDays(r.admission_confirmed_on, 7) : null
      return { ...r, flags: [...r.flags] } as ReferralRow
    },
    async addActivity(id, kind, body, actor) {
      activityLog.push({ id: `a${++n}`, referral_id: id, kind, body, actor, created_at: new Date(Date.now() + n).toISOString() })
    },
    async leadNote(_leadId, remark) { leadNotes.push(remark) },
    async rules() { return rules.map(r => ({ ...r })) },
    async saveRule(r) {
      if (r.id) { const x = rules.find(y => y.id === r.id); if (!x) throw new Error('no rule'); Object.assign(x, r); return { ...x } }
      const x = { ...r, id: `00000000-0000-4000-8000-${String(rules.length + 1).padStart(12, '0')}` } as RewardRule
      rules.push(x); return { ...x }
    },
    async campaigns() { return [{ id: '00000000-0000-4000-8000-00000000c001', name: 'Mock campaign' }] },
    async conversationFor() { return null },
    async funnel(campaignId) {
      const r = rows().filter(x => x.campaign_id === campaignId)
      const adm = r.filter(x => ['admission_confirmed', 'reward_approved', 'reward_paid'].includes(x.stage))
      return {
        form_opens: store.opens.size ? Array.from(store.opens.values()).reduce((a, b) => a + b, 0) : 0,
        submitted: r.length, by_link: r.filter(x => x.attribution === 'link').length, by_phone_match: r.filter(x => x.attribution === 'phone_match').length,
        unique_valid: new Set(r.filter(x => x.stage !== 'closed' && !x.flags.includes('self_referral')).map(x => x.referred_phone)).size,
        contacted: r.filter(x => !['new', 'contact_attempted', 'closed'].includes(x.stage)).length,
        applications: r.filter(x => ['application_started', 'admission_confirmed', 'reward_approved', 'reward_paid'].includes(x.stage)).length,
        admissions: adm.length,
        rewards_pending_n: r.filter(x => x.stage === 'reward_approved').length,
        rewards_pending_inr: r.filter(x => x.stage === 'reward_approved').reduce((a, x) => a + (x.reward_amount_inr ?? 0), 0),
        rewards_paid_n: r.filter(x => x.stage === 'reward_paid').length,
        rewards_paid_inr: r.filter(x => x.stage === 'reward_paid').reduce((a, x) => a + (x.reward_amount_inr ?? 0), 0),
      }
    },
  }
}
