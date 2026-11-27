// Referral dashboard rules. Every action checks can(actor, ...) first.
// Rewards: admission date -> owner approves an amount -> owner marks paid with
// a date and transaction reference. No payment is ever made from here.
import { can, type Actor } from '@/lib/whatsapp/access'
import type { ReferralRepo, ReferralPatch } from './referral-repo'
import { FREE_STAGES, STAGES, STAGE_LABEL, todayIST, suggestRule, rewardStatus, type ReferralFilter, type ReferralRow, type RewardRule, type Stage } from './referral-types'
import { FLAG_TEXT } from './refer-rules'

type Fail = { ok: false; error: string }
const deny: Fail = { ok: false, error: 'You do not have permission for this.' }
const moved: Fail = { ok: false, error: 'This referral changed in another tab. Reload and try again.' }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const DATE = /^\d{4}-\d{2}-\d{2}$/
const validDate = (d: string) => DATE.test(d) && !Number.isNaN(Date.parse(`${d}T00:00:00Z`)) && new Date(`${d}T00:00:00Z`).toISOString().slice(0, 10) === d
const addDays = (d: string, n: number) => new Date(Date.parse(`${d}T00:00:00Z`) + n * 864e5).toISOString().slice(0, 10)
const text = (v: unknown, max: number) => (typeof v === 'string' ? v.replace(/[\u0000-\u0008\u000b-\u001f\u007f]/g, '').trim().slice(0, max) : '')

export function cleanFilter(f: ReferralFilter): ReferralFilter {
  return {
    q: text(f?.q, 60),
    stage: f?.stage === 'open' || (STAGES as readonly string[]).includes(String(f?.stage)) ? f.stage : '',
    review: f?.review === 'needs_review' ? 'needs_review' : '',
    due: f?.due === 'pending' || f?.due === 'overdue' || f?.due === 'followup_due' ? f.due : '',
    campaignId: typeof f?.campaignId === 'string' && UUID.test(f.campaignId) ? f.campaignId : undefined,
  }
}

export async function listReferrals(repo: ReferralRepo, actor: Actor, f: ReferralFilter) {
  if (!can(actor, 'referral_view')) return deny
  const filter = cleanFilter(f)
  const today = todayIST()
  const [rows, campaigns, rules] = await Promise.all([repo.list(filter, today), repo.campaigns(), repo.rules()])
  const all = filter.q || filter.stage || filter.review || filter.due || filter.campaignId ? await repo.list({}, today, 2000) : rows
  const counts = {
    total: all.length,
    needsReview: all.filter(r => r.review_state === 'needs_review').length,
    pending: all.filter(r => rewardStatus(r, today) === 'pending').length,
    overdue: all.filter(r => rewardStatus(r, today) === 'overdue').length,
    followUpDue: all.filter(r => r.next_follow_up && r.next_follow_up <= today && r.stage !== 'reward_paid' && r.stage !== 'closed').length,
    pendingInr: all.filter(r => r.stage === 'reward_approved').reduce((n, r) => n + (r.reward_amount_inr ?? 0), 0),
    paidInr: all.filter(r => r.stage === 'reward_paid').reduce((n, r) => n + (r.reward_amount_inr ?? 0), 0),
  }
  return { ok: true as const, rows, campaigns, rules, counts, today }
}

export async function referralDetail(repo: ReferralRepo, actor: Actor, id: string) {
  if (!can(actor, 'referral_view')) return deny
  if (!UUID.test(id)) return { ok: false as const, error: 'Unknown referral.' }
  const r = await repo.get(id)
  if (!r) return { ok: false as const, error: 'Unknown referral.' }
  const [activity, referredConv, referrerConv, rules] = await Promise.all([
    repo.activity(id), repo.conversationFor(r.referred_phone), repo.conversationFor(r.referrer_phone), repo.rules(),
  ])
  return {
    ok: true as const, referral: r, activity, referredConv, referrerConv,
    suggested: suggestRule(rules, r.programme, r.preferred_university_id),
    flagText: r.flags.map(f => FLAG_TEXT[f] ?? f),
  }
}

async function apply(repo: ReferralRepo, actor: Actor, r: ReferralRow, patch: ReferralPatch, log: { kind: 'stage' | 'reward' | 'note'; body: string }) {
  const next = await repo.update(r.id, r.stage, patch)
  if (!next) return moved
  await repo.addActivity(r.id, log.kind, log.body, actor.id)
  // CRM: the referred student's lead gets the same line, so the lead
  // timeline shows referral progress without a second record.
  if (r.lead_id && log.kind !== 'note') await repo.leadNote(r.lead_id, `Referral ${r.ref_code}: ${log.body}`).catch(() => {})
  return { ok: true as const, referral: next }
}

async function load(repo: ReferralRepo, id: string) {
  if (!UUID.test(id)) return null
  return repo.get(id)
}

// Free movement among the counselling stages, plus Closed with a reason.
export async function setStage(repo: ReferralRepo, actor: Actor, id: string, stage: Stage, reason?: string) {
  if (!can(actor, 'referral_edit')) return deny
  const r = await load(repo, id)
  if (!r) return { ok: false as const, error: 'Unknown referral.' }
  if (r.stage === 'reward_paid') return { ok: false as const, error: 'A paid referral cannot change stage.' }
  if (r.stage === 'reward_approved') return { ok: false as const, error: 'Undo the approval first.' }
  if (stage === 'closed') {
    const why = text(reason, 300)
    if (why.length < 3) return { ok: false as const, error: 'Give a reason for closing.' }
    return apply(repo, actor, r, { stage: 'closed', closed_reason: why }, { kind: 'stage', body: `Closed: ${why}` })
  }
  if (!FREE_STAGES.includes(stage)) return { ok: false as const, error: 'Use the admission and reward buttons for that stage.' }
  // Leaving admission_confirmed backwards clears the date, so no reward
  // stays due for an admission that is no longer confirmed.
  const patch: ReferralPatch = { stage, closed_reason: null }
  if (r.stage === 'admission_confirmed') Object.assign(patch, { admission_confirmed_on: null })
  return apply(repo, actor, r, patch, { kind: 'stage', body: `Stage: ${STAGE_LABEL[r.stage]} to ${STAGE_LABEL[stage]}` })
}

export async function confirmAdmission(repo: ReferralRepo, actor: Actor, id: string, date: string, finalUniversity: string) {
  if (!can(actor, 'referral_edit')) return deny
  const r = await load(repo, id)
  if (!r) return { ok: false as const, error: 'Unknown referral.' }
  if (!FREE_STAGES.includes(r.stage) && r.stage !== 'admission_confirmed') return { ok: false as const, error: 'Only an open referral can be marked admitted.' }
  const today = todayIST()
  if (!validDate(date) || date > today) return { ok: false as const, error: 'Enter the admission date (today or earlier).' }
  if (date < addDays(today, -365)) return { ok: false as const, error: 'That date is more than a year ago. Check it.' }
  const uni = text(finalUniversity, 120)
  if (uni.length < 2) return { ok: false as const, error: 'Enter the university the student joined.' }
  return apply(repo, actor, r, { stage: 'admission_confirmed', admission_confirmed_on: date, final_university: uni },
    { kind: 'stage', body: `Admission confirmed on ${date} at ${uni}. Reward due by ${addDays(date, 7)}` })
}

export async function approveReward(repo: ReferralRepo, actor: Actor, id: string, amount: number, ruleId: string | null, rules?: RewardRule[]) {
  if (!can(actor, 'reward_approve')) return deny
  const r = await load(repo, id)
  if (!r) return { ok: false as const, error: 'Unknown referral.' }
  if (r.stage !== 'admission_confirmed') return { ok: false as const, error: 'Confirm the admission first.' }
  if (r.review_state === 'needs_review') return { ok: false as const, error: 'Resolve the review flags first.' }
  if (r.flags.includes('self_referral')) return { ok: false as const, error: 'Self-referrals are not eligible.' }
  if (!Number.isInteger(amount) || amount < 1 || amount > 100000) return { ok: false as const, error: 'Enter a whole rupee amount from 1 to 1,00,000.' }
  const list = rules ?? await repo.rules()
  const rule = ruleId ? list.find(x => x.id === ruleId) ?? null : null
  if (ruleId && !rule) return { ok: false as const, error: 'That reward rule no longer exists.' }
  return apply(repo, actor, r, {
    stage: 'reward_approved', reward_amount_inr: amount, reward_rule_id: rule?.id ?? null,
    reward_approved_at: new Date().toISOString(), reward_approved_by: actor.id,
  }, { kind: 'reward', body: `Reward of Rs ${amount.toLocaleString('en-IN')} approved${rule ? ` (rule: ${rule.label})` : ''}. Due by ${r.reward_due_on ?? 'n/a'}` })
}

export async function undoApproval(repo: ReferralRepo, actor: Actor, id: string, reason: string) {
  if (!can(actor, 'reward_approve')) return deny
  const r = await load(repo, id)
  if (!r) return { ok: false as const, error: 'Unknown referral.' }
  if (r.stage !== 'reward_approved') return { ok: false as const, error: 'Only an approved, unpaid reward can be undone.' }
  const why = text(reason, 300)
  if (why.length < 3) return { ok: false as const, error: 'Give a reason.' }
  return apply(repo, actor, r, { stage: 'admission_confirmed', reward_amount_inr: null, reward_rule_id: null, reward_approved_at: null, reward_approved_by: null },
    { kind: 'reward', body: `Approval undone: ${why}` })
}

export async function markPaid(repo: ReferralRepo, actor: Actor, id: string, paidOn: string, paymentRef: string) {
  if (!can(actor, 'reward_pay')) return deny
  const r = await load(repo, id)
  if (!r) return { ok: false as const, error: 'Unknown referral.' }
  if (r.stage !== 'reward_approved') return { ok: false as const, error: 'Approve the reward first.' }
  const today = todayIST()
  if (!validDate(paidOn) || paidOn > today) return { ok: false as const, error: 'Enter the payment date (today or earlier).' }
  if (r.admission_confirmed_on && paidOn < r.admission_confirmed_on) return { ok: false as const, error: 'The payment date is before the admission date.' }
  const ref = text(paymentRef, 100)
  if (ref.length < 3) return { ok: false as const, error: 'Enter the transaction reference (UTR or UPI id).' }
  const late = r.reward_due_on && paidOn > r.reward_due_on ? ` (${Math.round((Date.parse(paidOn) - Date.parse(r.reward_due_on)) / 864e5)} days late)` : ''
  return apply(repo, actor, r, { stage: 'reward_paid', reward_paid_on: paidOn, payment_ref: ref },
    { kind: 'reward', body: `Reward of Rs ${(r.reward_amount_inr ?? 0).toLocaleString('en-IN')} paid on ${paidOn}${late}. Ref ${ref}` })
}

export async function resolveReview(repo: ReferralRepo, actor: Actor, id: string, note: string) {
  if (!can(actor, 'referral_edit')) return deny
  const r = await load(repo, id)
  if (!r) return { ok: false as const, error: 'Unknown referral.' }
  if (r.review_state !== 'needs_review') return { ok: false as const, error: 'Nothing to review.' }
  const why = text(note, 500)
  if (why.length < 3) return { ok: false as const, error: 'Write what you checked.' }
  return apply(repo, actor, r, { review_state: 'resolved' }, { kind: 'note', body: `Review resolved: ${why}` })
}

export async function setFollowUp(repo: ReferralRepo, actor: Actor, id: string, date: string | null) {
  if (!can(actor, 'referral_edit')) return deny
  const r = await load(repo, id)
  if (!r) return { ok: false as const, error: 'Unknown referral.' }
  if (date !== null && !validDate(date)) return { ok: false as const, error: 'Enter a valid date.' }
  return apply(repo, actor, r, { next_follow_up: date }, { kind: 'note', body: date ? `Follow-up set for ${date}` : 'Follow-up cleared' })
}

export async function addNote(repo: ReferralRepo, actor: Actor, id: string, kind: 'note' | 'call', body: string) {
  if (!can(actor, 'referral_edit')) return deny
  const r = await load(repo, id)
  if (!r) return { ok: false as const, error: 'Unknown referral.' }
  const t = text(body, 2000)
  if (!t) return { ok: false as const, error: 'Write something first.' }
  await repo.addActivity(id, kind === 'call' ? 'call' : 'note', t, actor.id)
  if (kind === 'call' && r.lead_id) await repo.leadNote(r.lead_id, `Referral ${r.ref_code} call: ${t}`).catch(() => {})
  return { ok: true as const }
}

export async function saveRewardRule(repo: ReferralRepo, actor: Actor, input: Partial<RewardRule>) {
  if (!can(actor, 'referral_rules')) return deny
  const label = text(input?.label, 80)
  const amount = Number(input?.amount_inr)
  if (label.length < 1) return { ok: false as const, error: 'Give the rule a name.' }
  if (!Number.isInteger(amount) || amount < 1 || amount > 100000) return { ok: false as const, error: 'Enter a whole rupee amount from 1 to 1,00,000.' }
  const programme = text(input?.programme, 40) || null
  const university_id = text(input?.university_id, 80) || null
  if (university_id && !/^[a-z0-9-]{2,80}$/.test(university_id)) return { ok: false as const, error: 'Unknown university.' }
  const id = typeof input?.id === 'string' && UUID.test(input.id) ? input.id : undefined
  const rule = await repo.saveRule({ id, label, programme, university_id, amount_inr: amount, conditions: text(input?.conditions, 1000), active: input?.active !== false })
  return { ok: true as const, rule }
}

// Referral half of the campaign reports, for up to 20 campaigns.
export async function campaignFunnels(repo: ReferralRepo, actor: Actor, ids: string[]) {
  if (!can(actor, 'campaign_view')) return deny
  const list = (Array.isArray(ids) ? ids : []).filter(x => typeof x === 'string' && UUID.test(x)).slice(0, 20)
  const out: Record<string, Awaited<ReturnType<ReferralRepo['funnel']>>> = {}
  await Promise.all(list.map(async id => { out[id] = await repo.funnel(id) }))
  return { ok: true as const, funnels: out }
}

// CSV rows for the owner. Phone numbers are personal data, so export is owner-only.
export async function exportReferrals(repo: ReferralRepo, actor: Actor, f: ReferralFilter) {
  if (!can(actor, 'export')) return deny
  const today = todayIST()
  const rows = await repo.list(cleanFilter(f ?? {}), today, 5000)
  const header = ['Referral ID', 'Submitted', 'Stage', 'Review', 'Flags', 'Referrer', 'Referrer phone', 'Friend', 'Friend phone', 'Programme',
    'Preferred university', 'Final university', 'Campaign', 'Attribution', 'Next follow-up', 'Admission date', 'Reward due', 'Reward status',
    'Reward (Rs)', 'Paid on', 'Payment ref', 'Closed reason']
  const data = rows.map(r => [r.ref_code, r.created_at.slice(0, 10), STAGE_LABEL[r.stage], r.review_state, r.flags.map(x => FLAG_TEXT[x] ?? x).join('; '),
    r.referrer_name, r.referrer_phone, r.referred_name, r.referred_phone, r.programme ?? '', r.preferred_university ?? '', r.final_university ?? '',
    r.campaign_name ?? '', r.attribution, r.next_follow_up ?? '', r.admission_confirmed_on ?? '', r.reward_due_on ?? '', rewardStatus(r, today),
    r.reward_amount_inr ?? '', r.reward_paid_on ?? '', r.payment_ref ?? '', r.closed_reason ?? ''])
  return { ok: true as const, header, rows: data }
}
