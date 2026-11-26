// Monthly spend estimate and cap check for manual replies (D6).
//
// Meta bills service (non-template) messages per DELIVERED message since
// 1 Oct 2026, after a free tier per business number per month. Rates and the
// free tier are settings (wa_settings), verified from Meta's INR rate card,
// never constants here. This module is pure so it can be tested exactly.
//
// Conservative on purpose: messages still in flight count as if delivered,
// and when Meta's own billable count (from status webhooks) is higher than
// our estimate, Meta's number wins.

export type Usage = {
  month_start: string
  service_delivered: number
  service_in_flight: number
  service_failed?: number
  templates_sent?: number
  meta_billable: number
  meta_free: number
}

export type Rates = {
  currency: string
  service: number | null
  utility?: number | null
  marketing?: number | null
  authentication?: number | null
  effective_from?: string
  verified_on?: string
  source?: string
}

export type CapOverride = { month_start: string; extra_inr: number; by: string; at: string; reason?: string } | null

export type SpendInput = {
  usage: Usage
  rates: Rates | null
  freePerMonth: number | null
  capInr: number | null
  override: CapOverride
}

export type SpendSummary = {
  monthStart: string
  freePerMonth: number | null
  serviceSent: number            // delivered + in flight this month
  freeUsed: number
  freeLeft: number | null
  paidMessages: number
  metaBillable: number
  chargesInr: number | null
  budgetInr: number | null
  remainingInr: number | null
  overrideActive: boolean
  next: { allowed: boolean; paid: boolean; costInr: number | null; reason: string | null }
}

const round = (n: number) => Math.round(n * 10000) / 10000

function num(v: unknown, max: number): number | null {
  const n = typeof v === 'number' ? v : typeof v === 'string' && v.trim() ? Number(v) : NaN
  return Number.isFinite(n) && n >= 0 && n <= max ? n : null
}

export function parseRates(v: unknown): Rates | null {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  if (o.currency !== 'INR') return null
  return {
    currency: 'INR',
    service: num(o.service, 100),
    utility: num(o.utility, 100),
    marketing: num(o.marketing, 100),
    authentication: num(o.authentication, 100),
    effective_from: typeof o.effective_from === 'string' ? o.effective_from : undefined,
    verified_on: typeof o.verified_on === 'string' ? o.verified_on : undefined,
    source: typeof o.source === 'string' ? o.source : undefined,
  }
}

export function parseFreePerMonth(v: unknown): number | null {
  if (!v || typeof v !== 'object') return null
  const n = num((v as Record<string, unknown>).per_month, 1_000_000)
  return n == null ? null : Math.floor(n)
}

export function parseCap(v: unknown): number | null {
  return num(v, 10_000_000)
}

export function parseOverride(v: unknown): CapOverride {
  if (!v || typeof v !== 'object') return null
  const o = v as Record<string, unknown>
  const extra = num(o.extra_inr, 10_000_000)
  if (typeof o.month_start !== 'string' || extra == null || typeof o.by !== 'string' || typeof o.at !== 'string') return null
  return { month_start: o.month_start, extra_inr: extra, by: o.by, at: o.at, reason: typeof o.reason === 'string' ? o.reason : undefined }
}

function sameInstant(a: string, b: string): boolean {
  const x = Date.parse(a), y = Date.parse(b)
  return Number.isFinite(x) && x === y
}

export function summariseSpend(i: SpendInput): SpendSummary {
  const sent = Math.max(0, i.usage.service_delivered) + Math.max(0, i.usage.service_in_flight)
  const free = i.freePerMonth
  const metaBillable = Math.max(0, i.usage.meta_billable)
  const rate = i.rates?.service ?? null

  // Unknown free tier: assume none, so nothing is undercounted.
  const freeUsed = free == null ? 0 : Math.min(sent, free)
  const freeLeft = free == null ? null : Math.max(0, free - sent)
  const paidMessages = Math.max(free == null ? sent : sent - free, metaBillable, 0)
  const chargesInr = rate == null ? (paidMessages === 0 ? 0 : null) : round(paidMessages * rate)

  const overrideActive = !!i.override && sameInstant(i.override.month_start, i.usage.month_start)
  const budgetInr = i.capInr == null ? null : round(i.capInr + (overrideActive ? i.override!.extra_inr : 0))
  const remainingInr = budgetInr == null || chargesInr == null ? null : round(budgetInr - chargesInr)

  // The next message is paid once our count or Meta's says the free tier is used.
  const nextPaid = free == null || sent + 1 > free || metaBillable > 0
  let next: SpendSummary['next']
  if (!nextPaid) {
    next = { allowed: true, paid: false, costInr: 0, reason: null }
  } else if (rate == null) {
    next = { allowed: false, paid: true, costInr: null, reason: 'The service message rate is not set, so the cost cannot be checked' }
  } else if (budgetInr == null) {
    next = { allowed: false, paid: true, costInr: rate, reason: 'The monthly cap is not set' }
  } else if (chargesInr == null || chargesInr + rate > budgetInr + 1e-9) {
    next = { allowed: false, paid: true, costInr: rate, reason: 'This month\'s cap is reached. The owner can raise it in Settings' }
  } else {
    next = { allowed: true, paid: true, costInr: rate, reason: null }
  }

  return {
    monthStart: i.usage.month_start, freePerMonth: free, serviceSent: sent, freeUsed, freeLeft, paidMessages, metaBillable,
    chargesInr, budgetInr, remainingInr, overrideActive, next,
  }
}

// The 24-hour customer service window: free-form replies are allowed only
// within 24 hours of the student's last message.
export const WINDOW_MS = 24 * 60 * 60 * 1000
export function windowState(lastInboundAt: string | null, now = Date.now()): { open: boolean; msLeft: number } {
  const t = lastInboundAt ? Date.parse(lastInboundAt) : NaN
  if (!Number.isFinite(t)) return { open: false, msLeft: 0 }
  const left = t + WINDOW_MS - now
  return { open: left > 0, msLeft: Math.max(0, left) }
}
