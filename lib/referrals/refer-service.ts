// Server side of /refer: referral ids, the database call, the notification.
// The store is passed in so tests and mock mode run without Supabase.
import { randomInt, createHmac } from 'crypto'
import { REF_CODE_ALPHABET, TERMS_VERSION, FLAG_TEXT, type CleanReferral } from './refer-rules'

export type SubmitOutcome = 'created' | 'repeat' | 'rate_limited' | 'code_taken'
export type SubmitRow = { ref_code: string | null; outcome: SubmitOutcome; referral_id: string | null }

export interface ReferralStore {
  submit(code: string, r: CleanReferral, ipHash: string | null): Promise<SubmitRow>
  countOpen(token: string): Promise<boolean>
  // Empty until Rishi approves the disclosure sentence (Q55); the page stays
  // closed while it is empty.
  disclosure(): Promise<string>
  // Details for the notification email: flags and campaign attribution.
  details(id: string): Promise<{ flags: string[]; attribution: string; campaign: string | null } | null>
}

export function newRefCode(): string {
  let s = ''
  for (let i = 0; i < 8; i++) s += REF_CODE_ALPHABET[randomInt(0, REF_CODE_ALPHABET.length)]
  return `EDU-REF-${s}`
}

// The IP is never stored. A keyed hash lets the database count submissions
// per address for the rate limit without being able to reverse it.
export function hashIp(ip: string, key: string): string | null {
  if (!ip || ip === 'unknown' || !key) return null
  return createHmac('sha256', key).update(`refer:${ip}`).digest('hex')
}

export type SubmitResult =
  | { ok: true; refCode: string; outcome: 'created' | 'repeat'; referralId: string }
  | { ok: false; status: number; error: string }

export async function submitReferral(store: ReferralStore, r: CleanReferral, ipHash: string | null, gen = newRefCode): Promise<SubmitResult> {
  for (let attempt = 0; attempt < 5; attempt++) {
    const row = await store.submit(gen(), r, ipHash)
    if (row.outcome === 'code_taken') continue
    if (row.outcome === 'rate_limited') return { ok: false, status: 429, error: 'Too many referrals from this connection or number. Please try again later.' }
    if (!row.ref_code || !row.referral_id) break
    return { ok: true, refCode: row.ref_code, outcome: row.outcome, referralId: row.referral_id }
  }
  return { ok: false, status: 500, error: 'We could not save your referral. Please try again.' }
}

const esc = (s: string) => s.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!))

export function notificationEmail(code: string, r: CleanReferral, d: { flags: string[]; attribution: string; campaign: string | null } | null) {
  const flags = (d?.flags ?? []).map(f => FLAG_TEXT[f] ?? f)
  const rows: Array<[string, string]> = [
    ['Referral ID', code],
    ['Referred student', `${r.referredName} (${r.referredPhone})`],
    ['Referred by', `${r.referrerName} (${r.referrerPhone})`],
    ['Programme', r.programme ?? 'Not given'],
    ['Preferred university', r.university ?? 'Not given'],
    ['Campaign', d?.campaign ? `${d.campaign} (${d.attribution === 'link' ? 'from the link' : 'matched by phone'})` : 'None'],
    ['Note', r.note ?? ''],
    ['Needs review', flags.length ? flags.join('; ') : 'No'],
    ['Terms version', TERMS_VERSION],
  ]
  const subject = `New referral ${code}${flags.length ? ' (needs review)' : ''}`
  const html = `<div style="font-family:Arial,Helvetica,sans-serif;max-width:520px">
<h2 style="color:#0f172a;margin:0 0 12px">New referral ${esc(code)}</h2>
<table style="border-collapse:collapse;font-size:14px">${rows.map(([k, v]) => `<tr><td style="padding:4px 12px 4px 0;color:#64748b;vertical-align:top">${esc(k)}</td><td style="padding:4px 0;color:#0f172a">${esc(v)}</td></tr>`).join('')}</table>
<p style="font-size:13px;color:#64748b;margin-top:14px">The friend gave permission to be contacted for education guidance only. Do not add them to marketing lists from this form.</p>
<p><a href="https://edifyedu.in/leads/whatsapp/referrals" style="color:#f97316">Open referrals</a></p></div>`
  const text = rows.map(([k, v]) => `${k}: ${v}`).join('\n')
  return { subject, html, text }
}

// ── Mock store (WA_INBOX_MOCK=1, never in production) ──────────────────────
type MockRow = { id: string; code: string; r: CleanReferral; at: number; flags: string[]; campaign: string | null; attribution: string }
export function mockReferralStore(disclosure = 'Mock disclosure. The real sentence goes here once Rishi approves it (Q55).'): ReferralStore & { rows: MockRow[]; opens: Map<string, number> } {
  const rows: MockRow[] = []
  const opens = new Map<string, number>()
  const hits: Array<{ b: string; at: number }> = []
  return {
    rows, opens,
    async submit(code, r, ipHash) {
      const now = Date.now()
      const prev = [...rows].reverse().find(x => x.r.referrerPhone === r.referrerPhone && x.r.referredPhone === r.referredPhone && now - x.at < 864e5)
      if (prev) return { ref_code: prev.code, outcome: 'repeat', referral_id: prev.id }
      if (ipHash && hits.filter(h => h.b === `ip:${ipHash}` && now - h.at < 36e5).length >= 5) return { ref_code: null, outcome: 'rate_limited', referral_id: null }
      if (hits.filter(h => h.b === `ph:${r.referrerPhone}` && now - h.at < 864e5).length >= 10) return { ref_code: null, outcome: 'rate_limited', referral_id: null }
      if (rows.some(x => x.code === code)) return { ref_code: null, outcome: 'code_taken', referral_id: null }
      const flags: string[] = []
      if (r.referrerPhone === r.referredPhone) flags.push('self_referral')
      if (rows.some(x => x.r.referredPhone === r.referredPhone)) flags.push('already_referred')
      if (rows.some(x => x.r.referrerPhone === r.referrerPhone && now - x.at < 864e5)) flags.push('many_from_referrer')
      const id = `00000000-0000-4000-8000-${String(rows.length + 1).padStart(12, '0')}`
      rows.push({ id, code, r, at: now, flags, campaign: r.campaign ? 'Mock campaign' : null, attribution: r.campaign ? 'link' : 'none' })
      hits.push({ b: `ph:${r.referrerPhone}`, at: now })
      if (ipHash) hits.push({ b: `ip:${ipHash}`, at: now })
      return { ref_code: code, outcome: 'created', referral_id: id }
    },
    async countOpen(token) { opens.set(token, (opens.get(token) ?? 0) + 1); return true },
    async disclosure() { return disclosure },
    async details(id) { const x = rows.find(y => y.id === id); return x ? { flags: x.flags, attribution: x.attribution, campaign: x.campaign } : null },
  }
}
