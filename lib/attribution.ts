// Lead attribution: where a visitor came from before they filled a form.
//
// Rule: last non-direct touch, kept 30 days. A visit that arrives with a UTM
// tag or from an external site overwrites the `edify_attr` cookie; a direct
// visit or internal navigation leaves it alone. So a student who finds us on
// YouTube and comes back by typing the address 3 days later still counts as
// YouTube. The channel itself is derived on the server from the cookie, so the
// mapping below lives in one place.
//
// The cookie never carries personal data: landing path, referrer host + path
// (no query string), the four UTM values and a timestamp.

export const ATTR_COOKIE = 'edify_attr'
export const ATTR_MAX_AGE_SECONDS = 30 * 24 * 60 * 60
const FIELD_MAX = 200

export type Attribution = {
  lp: string   // landing path, first page of the attributed visit
  ref: string  // referrer host + path, no query string ('' when none)
  us: string   // utm_source
  um: string   // utm_medium
  uc: string   // utm_campaign
  uct: string  // utm_content
  ts: number   // epoch ms of the touch
}

const cap = (v: unknown): string => (typeof v === 'string' ? v.slice(0, FIELD_MAX) : '')

// ── Channel mapping ─────────────────────────────────────────────────────────
// Order matters: AI hosts are checked before Google, because gemini.google.com
// would otherwise land in organic-search.
const AI_HOSTS = ['chatgpt.com', 'chat.openai.com', 'perplexity.ai', 'gemini.google.com', 'copilot.microsoft.com']
const SEARCH_HOSTS = ['bing.com', 'duckduckgo.com', 'yahoo.com']
const SOCIAL: Array<[string, string[]]> = [
  ['youtube', ['youtube.com', 'youtu.be']],
  ['instagram', ['instagram.com']],
  ['facebook', ['facebook.com']],
  ['reddit', ['reddit.com']],
  ['quora', ['quora.com']],
  ['linkedin', ['linkedin.com', 'lnkd.in']],
  ['whatsapp', ['wa.me', 'whatsapp.com']],
]

/** Host without a leading "www.", lowercased. */
export function normalizeHost(host: string): string {
  return host.trim().toLowerCase().replace(/^www\./, '').replace(/\.$/, '')
}

/** True when `host` is `domain` or a subdomain of it (l.instagram.com, m.facebook.com). */
function onDomain(host: string, domain: string): boolean {
  return host === domain || host.endsWith('.' + domain)
}

/** google.com, google.co.in, google.com.au and so on, with or without www. */
function isGoogleSearch(host: string): boolean {
  return /^google\.(com|[a-z]{2}|co\.[a-z]{2}|com\.[a-z]{2})$/.test(host)
}

export function deriveChannel(utmSource: string | null | undefined, referrerHost: string | null | undefined): string {
  const us = (utmSource || '').trim().toLowerCase()
  if (us) return us.slice(0, FIELD_MAX)

  const host = normalizeHost(referrerHost || '')
  if (!host) return 'direct'

  if (AI_HOSTS.some(d => onDomain(host, d))) return 'ai-assistant'
  if (isGoogleSearch(host) || SEARCH_HOSTS.some(d => onDomain(host, d))) return 'organic-search'
  for (const [channel, domains] of SOCIAL) {
    if (domains.some(d => onDomain(host, d))) return channel
  }
  return `referral:${host}`.slice(0, FIELD_MAX)
}

/** The host part of a stored `ref` value ("youtube.com/watch" -> "youtube.com"). */
export function refHost(ref: string): string {
  return ref.split('/')[0] || ''
}

// ── Server side ─────────────────────────────────────────────────────────────

/**
 * Parse the cookie value. Never throws: a missing, truncated or tampered
 * cookie returns null and the lead is recorded as direct.
 */
export function parseAttribution(raw: string | null | undefined): Attribution | null {
  if (!raw) return null
  let obj: unknown = null
  for (const candidate of [raw, safeDecode(raw)]) {
    if (!candidate) continue
    try { obj = JSON.parse(candidate); break } catch { /* try the next form */ }
  }
  if (!obj || typeof obj !== 'object') return null
  const o = obj as Record<string, unknown>
  return {
    lp: cap(o.lp),
    ref: cap(o.ref),
    us: cap(o.us),
    um: cap(o.um),
    uc: cap(o.uc),
    uct: cap(o.uct),
    ts: typeof o.ts === 'number' && Number.isFinite(o.ts) ? o.ts : 0,
  }
}

function safeDecode(s: string): string | null {
  try { return decodeURIComponent(s) } catch { return null }
}

/** The seven CRM columns for a lead, from the cookie (null cookie = direct). */
export function attributionColumns(a: Attribution | null) {
  const orNull = (s: string | undefined) => (s ? s : null)
  return {
    channel: deriveChannel(a?.us, a ? refHost(a.ref) : ''),
    landing_page: orNull(a?.lp),
    referrer: orNull(a?.ref),
    utm_source: orNull(a?.us),
    utm_medium: orNull(a?.um),
    utm_campaign: orNull(a?.uc),
    utm_content: orNull(a?.uct),
  }
}

export type AttributionColumns = ReturnType<typeof attributionColumns>
export const ATTRIBUTION_COLUMN_NAMES = [
  'channel', 'landing_page', 'referrer', 'utm_source', 'utm_medium', 'utm_campaign', 'utm_content',
] as const

// ── Client side ─────────────────────────────────────────────────────────────

const SITE_HOST = 'edifyedu.in'

/**
 * Build the cookie value for this page load, or null when the visit is direct
 * or internal and the existing cookie must be left alone.
 */
export function attributionFromLocation(
  href: string,
  referrer: string,
  currentHost: string,
  now: number = Date.now(),
): Attribution | null {
  let url: URL
  try { url = new URL(href) } catch { return null }
  const q = url.searchParams
  const us = cap((q.get('utm_source') || '').trim().toLowerCase())
  const um = cap((q.get('utm_medium') || '').trim().toLowerCase())
  const uc = cap((q.get('utm_campaign') || '').trim().toLowerCase())
  const uct = cap((q.get('utm_content') || '').trim())

  let ref = ''
  if (referrer) {
    try {
      const r = new URL(referrer)
      const host = normalizeHost(r.hostname)
      const internal = onDomain(host, SITE_HOST) || host === normalizeHost(currentHost)
      if (!internal && host) ref = cap(host + (r.pathname === '/' ? '' : r.pathname))
    } catch { /* unparseable referrer counts as none */ }
  }

  const hasUtm = !!(us || um || uc || uct)
  if (!hasUtm && !ref) return null

  return { lp: cap(url.pathname), ref, us, um, uc, uct, ts: now }
}
