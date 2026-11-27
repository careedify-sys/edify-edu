// Shared referral types and labels for the dashboard. Browser-safe.

export const STAGES = [
  'new', 'contact_attempted', 'contacted', 'counselling', 'follow_up',
  'application_started', 'admission_confirmed', 'reward_approved', 'reward_paid', 'closed',
] as const
export type Stage = (typeof STAGES)[number]

export const STAGE_LABEL: Record<Stage, string> = {
  new: 'New',
  contact_attempted: 'Contact attempted',
  contacted: 'Contacted',
  counselling: 'Counselling',
  follow_up: 'Follow-up',
  application_started: 'Application started',
  admission_confirmed: 'Admission confirmed',
  reward_approved: 'Reward approved',
  reward_paid: 'Reward paid',
  closed: 'Closed',
}

// Stages a counsellor moves freely between. The last four carry dates,
// amounts or payments and go through their own checked actions.
export const FREE_STAGES: readonly Stage[] = ['new', 'contact_attempted', 'contacted', 'counselling', 'follow_up', 'application_started']

export type ReferralRow = {
  id: string
  ref_code: string
  referrer_name: string
  referrer_phone: string
  referred_name: string
  referred_phone: string
  programme: string | null
  preferred_university_id: string | null
  preferred_university: string | null
  final_university: string | null
  referrer_note: string | null
  referrer_wa_optin: boolean
  terms_version: string
  campaign_id: string | null
  campaign_name: string | null
  attribution: 'link' | 'phone_match' | 'none'
  lead_id: string | null
  stage: Stage
  flags: string[]
  review_state: 'clear' | 'needs_review' | 'resolved'
  next_follow_up: string | null
  admission_confirmed_on: string | null
  reward_rule_id: string | null
  reward_amount_inr: number | null
  reward_due_on: string | null
  reward_approved_at: string | null
  reward_approved_by: string | null
  reward_paid_on: string | null
  payment_ref: string | null
  closed_reason: string | null
  created_at: string
  updated_at: string
}

export type ActivityRow = { id: string; referral_id: string; kind: 'system' | 'note' | 'call' | 'stage' | 'reward' | 'whatsapp'; body: string; actor: string | null; created_at: string }

export type RewardRule = {
  id: string
  label: string
  programme: string | null
  university_id: string | null
  amount_inr: number
  conditions: string
  active: boolean
}

export type ReferralFilter = {
  q?: string
  stage?: Stage | 'open' | ''
  review?: 'needs_review' | ''
  due?: 'pending' | 'overdue' | 'followup_due' | ''
  campaignId?: string
}

// Today in India, as YYYY-MM-DD. Due dates and overdue checks use IST.
export function todayIST(now = Date.now()): string {
  return new Date(now + 5.5 * 3600_000).toISOString().slice(0, 10)
}

export type RewardStatus = 'none' | 'pending' | 'overdue' | 'paid'
export function rewardStatus(r: Pick<ReferralRow, 'stage' | 'reward_due_on'>, today = todayIST()): RewardStatus {
  if (r.stage === 'reward_paid') return 'paid'
  if ((r.stage === 'admission_confirmed' || r.stage === 'reward_approved') && r.reward_due_on) {
    return r.reward_due_on < today ? 'overdue' : 'pending'
  }
  return 'none'
}

// Best matching active rule: programme and university both match beats one
// match beats a general rule. A suggestion only; the owner approves the amount.
export function suggestRule(rules: RewardRule[], programme: string | null, universityId: string | null): RewardRule | null {
  let best: { r: RewardRule; score: number } | null = null
  for (const r of rules) {
    if (!r.active) continue
    if (r.programme && r.programme !== programme) continue
    if (r.university_id && r.university_id !== universityId) continue
    const score = (r.programme ? 2 : 0) + (r.university_id ? 1 : 0)
    if (!best || score > best.score) best = { r, score }
  }
  return best?.r ?? null
}
