// Rules for the public /refer form, shared by the page and the API route.
// Browser-safe: no secrets, no server imports.
import { normaliseIndianMobile } from '@/lib/whatsapp/phones'

export const REF_CODE_ALPHABET = '23456789ABCDEFGHJKMNPQRSTUVWXYZ' // no 0/O, 1/I/L
export const REF_CODE_RE = /^EDU-REF-[23456789ABCDEFGHJKMNPQRSTUVWXYZ]{8}$/
export const CAMPAIGN_TOKEN_RE = /^[0-9a-f]{16}$/

// The version of the terms text in lib/referrals/terms.ts. Stored with each
// referral so a later change to the terms never rewrites an earlier promise.
export const TERMS_VERSION = '2026-11-27'

export const PROGRAMME_OPTIONS = ['MBA', 'MCA', 'BBA', 'BCA', 'BA', 'B.Com', 'MA', 'M.Com', 'MSc', 'BSc', 'DBA', 'Other', 'Not decided yet'] as const
export const UNI_UNDECIDED = 'Not decided yet, need guidance'

// The form must be open this long before a submit counts as human.
export const MIN_FILL_MS = 3000

export type UniOption = { id: string; name: string }

export type ReferInput = {
  referrerName: string
  referrerPhone: string
  referredName: string
  referredPhone: string
  programme: string
  universityId: string
  note: string
  permission: boolean
  waOptin: boolean
  campaign: string
  website: string // honeypot: people never see it, so it stays empty
  elapsedMs: number
}

export type CleanReferral = {
  referrerName: string
  referrerPhone: string // +91XXXXXXXXXX
  referredName: string
  referredPhone: string
  programme: string | null
  universityId: string | null
  university: string | null
  note: string | null
  waOptin: boolean
  campaign: string | null
}

export type FieldErrors = Partial<Record<'referrerName' | 'referrerPhone' | 'referredName' | 'referredPhone' | 'programme' | 'universityId' | 'note' | 'permission', string>>

const cleanText = (v: unknown, max: number) =>
  typeof v === 'string' ? v.replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim().slice(0, max) : ''

// Letters in any script, spaces, dots, apostrophes and hyphens.
const NAME_RE = new RegExp("^[\\p{L}\\p{M} .'-]{2,80}$", 'u')

export function validateReferral(raw: Partial<ReferInput>, unis: UniOption[]):
  { ok: true; value: CleanReferral } | { ok: false; errors: FieldErrors; bot?: boolean } {
  if (typeof raw.website === 'string' && raw.website.trim() !== '') return { ok: false, errors: {}, bot: true }
  if (typeof raw.elapsedMs !== 'number' || !(raw.elapsedMs >= MIN_FILL_MS)) return { ok: false, errors: {}, bot: true }

  const errors: FieldErrors = {}
  const referrerName = cleanText(raw.referrerName, 80)
  const referredName = cleanText(raw.referredName, 80)
  if (!NAME_RE.test(referrerName)) errors.referrerName = 'Enter your name (letters only, at least 2).'
  if (!NAME_RE.test(referredName)) errors.referredName = "Enter your friend's name (letters only, at least 2)."

  const p1 = normaliseIndianMobile(cleanText(raw.referrerPhone, 30))
  const p2 = normaliseIndianMobile(cleanText(raw.referredPhone, 30))
  if (p1.kind !== 'valid') errors.referrerPhone = 'Enter a 10-digit Indian mobile number.'
  if (p2.kind !== 'valid') errors.referredPhone = 'Enter a 10-digit Indian mobile number.'

  const programme = cleanText(raw.programme, 40)
  if (programme && !(PROGRAMME_OPTIONS as readonly string[]).includes(programme)) errors.programme = 'Choose a programme from the list.'

  const uniId = cleanText(raw.universityId, 80)
  let university: string | null = null
  if (uniId === 'undecided') university = UNI_UNDECIDED
  else if (uniId) {
    const u = unis.find(x => x.id === uniId)
    if (!u) errors.universityId = 'Choose a university from the list.'
    else university = u.name.slice(0, 120)
  }

  const note = cleanText(raw.note, 1000)
  if (raw.permission !== true) errors.permission = 'Please confirm your friend agreed to be contacted.'

  if (Object.keys(errors).length) return { ok: false, errors }
  const campaign = cleanText(raw.campaign, 16)
  return {
    ok: true,
    value: {
      referrerName, referredName,
      referrerPhone: (p1 as { e164: string }).e164,
      referredPhone: (p2 as { e164: string }).e164,
      programme: programme || null,
      universityId: uniId && uniId !== 'undecided' ? uniId : null,
      university,
      note: note || null,
      waOptin: raw.waOptin === true,
      campaign: CAMPAIGN_TOKEN_RE.test(campaign) ? campaign : null,
    },
  }
}

export const FLAG_TEXT: Record<string, string> = {
  self_referral: 'Referrer and friend have the same number',
  already_referred: 'This friend was referred before',
  existing_lead: 'This friend is already a lead',
  many_from_referrer: 'Several referrals from this referrer today',
}
