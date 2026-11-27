// Referral funnel and cost per outcome for one campaign. Pure; browser-safe.
// Message spend is an ESTIMATE: Meta-billable messages x the marketing rate
// entered in Settings x (1 + tax). Meta's invoice is the actual figure.

export type Funnel = {
  form_opens: number; submitted: number; by_link: number; by_phone_match: number; unique_valid: number
  contacted: number; applications: number; admissions: number
  rewards_pending_n: number; rewards_pending_inr: number; rewards_paid_n: number; rewards_paid_inr: number
}
export const EMPTY_FUNNEL: Funnel = {
  form_opens: 0, submitted: 0, by_link: 0, by_phone_match: 0, unique_valid: 0, contacted: 0, applications: 0, admissions: 0,
  rewards_pending_n: 0, rewards_pending_inr: 0, rewards_paid_n: 0, rewards_paid_inr: 0,
}

export type FunnelCosts = {
  estSpendInr: number | null       // message spend, estimated
  perReferralInr: number | null    // estimated spend / unique valid referrals
  perAdmissionInr: number | null   // estimated spend / admissions
  rewardSpendInr: number           // paid rewards (actual, from recorded payments)
  allInPerAdmissionInr: number | null // (estimated spend + rewards paid and approved) / admissions
}

const r2 = (n: number) => Math.round(n * 100) / 100

export function funnelCosts(f: Funnel, metaBillable: number, marketingRate: number | null, taxPct: number): FunnelCosts {
  const est = marketingRate == null ? null : r2(metaBillable * marketingRate * (1 + taxPct / 100))
  const per = (n: number) => (est == null || n <= 0 ? null : r2(est / n))
  const rewards = f.rewards_paid_inr + f.rewards_pending_inr
  return {
    estSpendInr: est,
    perReferralInr: per(f.unique_valid),
    perAdmissionInr: per(f.admissions),
    rewardSpendInr: f.rewards_paid_inr,
    allInPerAdmissionInr: est == null || f.admissions <= 0 ? null : r2((est + rewards) / f.admissions),
  }
}

export function toFunnel(j: unknown): Funnel {
  const o = (j && typeof j === 'object' ? j : {}) as Record<string, unknown>
  const out = { ...EMPTY_FUNNEL }
  for (const k of Object.keys(out) as Array<keyof Funnel>) { const v = Number(o[k]); out[k] = Number.isFinite(v) && v >= 0 ? v : 0 }
  return out
}
