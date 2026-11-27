// Meta Graph API client for the WhatsApp inbox. Server-only.
//
// Rules:
// - The access token and app secret never leave this module: no logging, no
//   return values, no error text that could echo them.
// - One send is one HTTP call. Nothing here retries. A timeout or a 5xx is
//   reported as 'unknown' because Meta may already have delivered it, and a
//   blind retry would message the student twice (and bill twice).
// - fetch is injectable so tests never reach Meta.

if (typeof window !== 'undefined') {
  throw new Error('lib/whatsapp/graph.ts must not be imported in the browser')
}

export type GraphEnv = {
  token?: string
  phoneNumberId?: string
  wabaId?: string
  appId?: string
  appSecret?: string
  version: string
}

// The app id is public (it appears in every Meta login dialog for the app),
// so a default is safe. The secret and token have no default.
const DEFAULT_APP_ID = '1673517570814877'

export function readGraphEnv(env: Record<string, string | undefined> = process.env): GraphEnv {
  const clean = (v?: string) => (v && v.trim() ? v.trim() : undefined)
  return {
    token: clean(env.WHATSAPP_ACCESS_TOKEN),
    phoneNumberId: clean(env.WHATSAPP_PHONE_NUMBER_ID),
    wabaId: clean(env.WHATSAPP_BUSINESS_ACCOUNT_ID),
    appId: clean(env.META_APP_ID) ?? DEFAULT_APP_ID,
    appSecret: clean(env.META_APP_SECRET),
    version: /^v\d+\.\d+$/.test(env.WHATSAPP_GRAPH_VERSION ?? '') ? env.WHATSAPP_GRAPH_VERSION! : 'v26.0',
  }
}

type Fetch = typeof fetch
const TIMEOUT_MS = 10_000

// Meta error text can quote the recipient number. Keep codes, drop digits.
export function safeErrorTitle(s: unknown): string | null {
  if (typeof s !== 'string' || !s) return null
  return s.replace(/\+?\d[\d\s.()-]{6,}\d/g, '[number]').slice(0, 200)
}

async function call(f: Fetch, url: string, init: RequestInit, timeoutMs = TIMEOUT_MS) {
  const ctl = new AbortController()
  const t = setTimeout(() => ctl.abort(), timeoutMs)
  try {
    const res = await f(url, { ...init, signal: ctl.signal, cache: 'no-store' })
    let json: any = null
    try { json = await res.json() } catch { /* empty or non-JSON body */ }
    return { status: res.status, json }
  } finally {
    clearTimeout(t)
  }
}

// ── Sending ──────────────────────────────────────────────────────────────────

export type Recipient = { phoneDigits?: string | null; bsuid?: string | null }

export type SendResult =
  | { state: 'accepted'; wamid: string }
  | { state: 'failed'; code: number | null; title: string | null }
  | { state: 'unknown'; reason: 'timeout' | 'network' | 'server' | 'bad_response' }

// Phone when known (works everywhere); BSUID otherwise, for username users
// who hide their number.
export function recipientFields(r: Recipient): Record<string, string> | null {
  if (r.phoneDigits && /^\d{8,15}$/.test(r.phoneDigits)) return { to: r.phoneDigits }
  if (r.bsuid && r.bsuid.trim()) return { recipient: r.bsuid.trim() }
  return null
}

export function textPayload(body: string) {
  return { type: 'text', text: { body, preview_url: false } }
}

// Asks the student to share their phone number. Their answer comes back as a
// 'contacts' message with origin 'contact_request', which the webhook applies.
export function requestContactInfoPayload(text: string) {
  return {
    type: 'interactive',
    interactive: { type: 'request_contact_info', body: { text }, action: { name: 'request_contact_info' } },
  }
}

export async function sendMessage(
  env: GraphEnv, to: Recipient, content: Record<string, unknown>, f: Fetch = fetch, timeoutMs = TIMEOUT_MS,
): Promise<SendResult> {
  if (!env.token || !env.phoneNumberId) return { state: 'failed', code: null, title: 'WhatsApp is not configured' }
  const rcpt = recipientFields(to)
  if (!rcpt) return { state: 'failed', code: null, title: 'Contact has no phone number or BSUID' }
  const url = `https://graph.facebook.com/${env.version}/${encodeURIComponent(env.phoneNumberId)}/messages`
  let r: { status: number; json: any }
  try {
    r = await call(f, url, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ messaging_product: 'whatsapp', recipient_type: 'individual', ...rcpt, ...content }),
    }, timeoutMs)
  } catch (e) {
    return { state: 'unknown', reason: (e as Error)?.name === 'AbortError' ? 'timeout' : 'network' }
  }
  const wamid = r.json?.messages?.[0]?.id
  if (r.status >= 200 && r.status < 300 && typeof wamid === 'string' && wamid) return { state: 'accepted', wamid }
  if (r.status >= 500) return { state: 'unknown', reason: 'server' }
  if (r.status >= 400) {
    const code = Number(r.json?.error?.code)
    return { state: 'failed', code: Number.isFinite(code) ? code : null, title: safeErrorTitle(r.json?.error?.message) }
  }
  return { state: 'unknown', reason: 'bad_response' }
}

// ── Connection check (B2) ────────────────────────────────────────────────────
// Read-only. Reports what is set and what Meta says about it, never a value.

export type VarState = 'ok' | 'missing' | 'wrong' | 'unchecked'

export type ConnectionReport = {
  checkedAt: string
  vars: {
    WHATSAPP_ACCESS_TOKEN: VarState
    WHATSAPP_PHONE_NUMBER_ID: VarState
    WHATSAPP_BUSINESS_ACCOUNT_ID: VarState
    META_APP_SECRET: VarState
  }
  token?: {
    valid: boolean
    type: string | null            // SYSTEM_USER is what D4 asks for
    expires: 'never' | string | null
    hasMessaging: boolean
    hasManagement: boolean
    extraScopes: string[]
    wabaGranted: boolean | null    // null when Meta gave no per-asset list
    systemUser: boolean
  }
  phone?: { displayNumber: string | null; verifiedName: string | null; quality: string | null; inWaba: boolean | null }
  waba?: { name: string | null; currency: string | null; timezoneId: string | null }
  problems: string[]
}

const REQUIRED = ['whatsapp_business_messaging', 'whatsapp_business_management']

export async function checkConnection(env: GraphEnv, f: Fetch = fetch): Promise<ConnectionReport> {
  const rep: ConnectionReport = {
    checkedAt: new Date().toISOString(),
    vars: {
      WHATSAPP_ACCESS_TOKEN: env.token ? 'unchecked' : 'missing',
      WHATSAPP_PHONE_NUMBER_ID: env.phoneNumberId ? 'unchecked' : 'missing',
      WHATSAPP_BUSINESS_ACCOUNT_ID: env.wabaId ? 'unchecked' : 'missing',
      META_APP_SECRET: env.appSecret ? 'unchecked' : 'missing',
    },
    problems: [],
  }
  const base = `https://graph.facebook.com/${env.version}`
  const auth = { Authorization: `Bearer ${env.token}` }

  // 1. The token itself, through debug_token (needs the app secret).
  if (env.token && env.appSecret && env.appId) {
    try {
      const q = new URLSearchParams({ input_token: env.token, access_token: `${env.appId}|${env.appSecret}` })
      const r = await call(f, `${base}/debug_token?${q}`, { method: 'GET' })
      const d = r.json?.data
      if (r.status === 200 && d) {
        const scopes: string[] = Array.isArray(d.scopes) ? d.scopes.map(String) : []
        const gran: Array<{ scope?: string; target_ids?: string[] }> = Array.isArray(d.granular_scopes) ? d.granular_scopes : []
        const targets = gran.filter(g => REQUIRED.includes(String(g.scope))).flatMap(g => g.target_ids ?? [])
        const expiresAt = Number(d.expires_at)
        rep.token = {
          valid: d.is_valid === true,
          type: typeof d.type === 'string' ? d.type : null,
          expires: expiresAt === 0 ? 'never' : Number.isFinite(expiresAt) ? new Date(expiresAt * 1000).toISOString() : null,
          hasMessaging: scopes.includes(REQUIRED[0]),
          hasManagement: scopes.includes(REQUIRED[1]),
          extraScopes: scopes.filter(s => !REQUIRED.includes(s)),
          wabaGranted: targets.length ? (env.wabaId ? targets.map(String).includes(env.wabaId) : null) : null,
          systemUser: d.type === 'SYSTEM_USER',
        }
        if (String(d.app_id ?? '') && String(d.app_id) !== env.appId) rep.problems.push('Token belongs to a different Meta app')
        rep.vars.WHATSAPP_ACCESS_TOKEN = rep.token.valid ? 'ok' : 'wrong'
        rep.vars.META_APP_SECRET = 'ok'
        if (!rep.token.valid) rep.problems.push('Meta says the access token is not valid')
        if (!rep.token.systemUser) rep.problems.push('Token is not a System User token (D4)')
        if (rep.token.expires !== 'never') rep.problems.push('Token expires; a System User token should not')
        if (!rep.token.hasMessaging) rep.problems.push('Token lacks whatsapp_business_messaging')
        if (!rep.token.hasManagement) rep.problems.push('Token lacks whatsapp_business_management')
        if (rep.token.wabaGranted === false) rep.problems.push('Token is not granted this WhatsApp Business Account')
      } else if (r.status === 400 || r.status === 401 || r.status === 403) {
        // debug_token fails when the app token (id|secret) is wrong.
        rep.vars.META_APP_SECRET = 'wrong'
        rep.problems.push('Could not inspect the token: META_APP_SECRET or META_APP_ID does not match the app')
      } else {
        rep.problems.push(`Token check returned HTTP ${r.status}`)
      }
    } catch {
      rep.problems.push('Token check could not reach Meta')
    }
  }

  // 2. The phone number id, read with the token.
  if (env.token && env.phoneNumberId) {
    try {
      const r = await call(f, `${base}/${encodeURIComponent(env.phoneNumberId)}?fields=display_phone_number,verified_name,quality_rating`, { method: 'GET', headers: auth })
      if (r.status === 200 && r.json?.id) {
        rep.phone = {
          displayNumber: typeof r.json.display_phone_number === 'string' ? r.json.display_phone_number : null,
          verifiedName: typeof r.json.verified_name === 'string' ? r.json.verified_name : null,
          quality: typeof r.json.quality_rating === 'string' ? r.json.quality_rating : null,
          inWaba: null,
        }
        rep.vars.WHATSAPP_PHONE_NUMBER_ID = 'ok'
      } else if (r.status === 401 || r.json?.error?.code === 190) {
        rep.vars.WHATSAPP_ACCESS_TOKEN = 'wrong'
        rep.problems.push('Meta rejected the access token')
      } else {
        rep.vars.WHATSAPP_PHONE_NUMBER_ID = 'wrong'
        rep.problems.push('WHATSAPP_PHONE_NUMBER_ID is not readable with this token')
      }
    } catch {
      rep.problems.push('Phone number check could not reach Meta')
    }
  }

  // 3. The business account, and whether the phone number belongs to it.
  if (env.token && env.wabaId) {
    try {
      const r = await call(f, `${base}/${encodeURIComponent(env.wabaId)}?fields=name,currency,timezone_id`, { method: 'GET', headers: auth })
      if (r.status === 200 && r.json?.id) {
        rep.waba = {
          name: typeof r.json.name === 'string' ? r.json.name : null,
          currency: typeof r.json.currency === 'string' ? r.json.currency : null,
          timezoneId: r.json.timezone_id != null ? String(r.json.timezone_id) : null,
        }
        rep.vars.WHATSAPP_BUSINESS_ACCOUNT_ID = 'ok'
        if (rep.waba.currency && rep.waba.currency !== 'INR') rep.problems.push(`Billing currency is ${rep.waba.currency}; Meta asks Indian accounts to move to INR by 31 Dec 2026 (B5)`)
        if (env.phoneNumberId) {
          const p = await call(f, `${base}/${encodeURIComponent(env.wabaId)}/phone_numbers?fields=id&limit=100`, { method: 'GET', headers: auth })
          const ids: string[] = Array.isArray(p.json?.data) ? p.json.data.map((x: any) => String(x.id)) : []
          if (rep.phone) rep.phone.inWaba = p.status === 200 ? ids.includes(env.phoneNumberId) : null
          if (rep.phone?.inWaba === false) rep.problems.push('The phone number id is not in this WhatsApp Business Account')
        }
      } else if (rep.vars.WHATSAPP_ACCESS_TOKEN !== 'wrong') {
        rep.vars.WHATSAPP_BUSINESS_ACCOUNT_ID = 'wrong'
        rep.problems.push('WHATSAPP_BUSINESS_ACCOUNT_ID is not readable with this token')
      }
    } catch {
      rep.problems.push('Business account check could not reach Meta')
    }
  }

  for (const [k, v] of Object.entries(rep.vars)) if (v === 'missing') rep.problems.push(`${k} is not set in this deployment`)
  return rep
}

// Shared with graph-templates.ts (Phase 3). Same timeout and no-store rules.
export { call as graphCall }
