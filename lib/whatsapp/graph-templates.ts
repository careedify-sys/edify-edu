// Meta message templates and account limits (Phase 3).
//
// Create: POST /{WABA}/message_templates. List: GET the same edge. Templates
// here carry no variables: Rishi's list holds phone numbers only, so every
// recipient gets the same text. Errors keep Meta's code and a redacted
// title, never the token.
import { graphCall, safeErrorTitle, type GraphEnv } from './graph'

type Fetch = typeof fetch

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
export type TemplateButton = { type: 'QUICK_REPLY'; text: string } | { type: 'URL'; text: string; url: string }
export type TemplateDraft = {
  name: string
  language: string
  category: TemplateCategory
  header?: string
  body: string
  footer?: string
  buttons?: TemplateButton[]
}
export type MetaTemplate = {
  meta_id: string; name: string; language: string; category: TemplateCategory | string
  status: string; components: unknown[]; reason: string | null; quality: string | null
}

export const LANGUAGES: Array<[string, string]> = [
  ['en', 'English'], ['en_US', 'English (US)'], ['en_GB', 'English (UK)'], ['hi', 'Hindi'],
  ['bn', 'Bengali'], ['gu', 'Gujarati'], ['kn', 'Kannada'], ['ml', 'Malayalam'], ['mr', 'Marathi'],
  ['pa', 'Punjabi'], ['ta', 'Tamil'], ['te', 'Telugu'], ['ur', 'Urdu'],
]

// Limits from Meta's template rules: name lowercase letters, digits and
// underscores; header and footer 60 characters; body 1,024; button text 25;
// at most 10 buttons, URL buttons at most 2.
export function validateDraft(d: TemplateDraft): string | null {
  if (!/^[a-z0-9_]{1,250}$/.test(d.name)) return 'Template name: lowercase letters, numbers and underscores only, for example referral_invite_nov.'
  if (!LANGUAGES.some(([c]) => c === d.language)) return 'Pick a language from the list.'
  if (d.category === 'AUTHENTICATION') return 'Authentication templates are one-time login codes in a fixed Meta format. edifyedu.in sends no login codes, so they are not created here.'
  if (d.category !== 'MARKETING' && d.category !== 'UTILITY') return 'Pick Marketing or Utility.'
  const body = (d.body ?? '').trim()
  if (!body) return 'Write the message.'
  if (body.length > 1024) return `The message is ${body.length} characters; Meta allows 1,024.`
  for (const [label, t, max] of [['Header', d.header, 60], ['Footer', d.footer, 60]] as const) {
    if (t && t.trim().length > max) return `${label} is longer than ${max} characters.`
    if (t && /[\n*_~]|[\uD800-\uDFFF]|[☀-➿]/.test(t) && label === 'Header') return 'The header cannot contain new lines, formatting or emoji.'
  }
  for (const t of [d.header, body, d.footer]) {
    if (t && /\{\{/.test(t)) return 'Personalised fields like {{1}} are not supported: your list holds phone numbers only, so every student gets the same text.'
  }
  const buttons = d.buttons ?? []
  if (buttons.length > 10) return 'At most 10 buttons.'
  if (buttons.filter(b => b.type === 'URL').length > 2) return 'At most 2 website buttons.'
  for (const b of buttons) {
    if (!b.text.trim() || b.text.trim().length > 25) return 'Button text must be 1 to 25 characters.'
    if (b.type === 'URL' && !/^https:\/\/[^\s{}]+$/.test(b.url)) return 'Website buttons need a full https:// link.'
  }
  return null
}

export function draftComponents(d: TemplateDraft): unknown[] {
  const c: unknown[] = []
  if (d.header?.trim()) c.push({ type: 'HEADER', format: 'TEXT', text: d.header.trim() })
  c.push({ type: 'BODY', text: d.body.trim() })
  if (d.footer?.trim()) c.push({ type: 'FOOTER', text: d.footer.trim() })
  if (d.buttons?.length) {
    c.push({ type: 'BUTTONS', buttons: d.buttons.map(b => b.type === 'URL'
      ? { type: 'URL', text: b.text.trim(), url: b.url }
      : { type: 'QUICK_REPLY', text: b.text.trim() }) })
  }
  return c
}

// What a recipient sees, for previews. Same text order as WhatsApp shows it.
export function previewText(components: unknown[]): { header: string | null; body: string; footer: string | null; buttons: string[] } {
  const get = (type: string) => (components as any[]).find(c => c?.type === type)
  return {
    header: get('HEADER')?.format === 'TEXT' || get('HEADER')?.text ? get('HEADER')?.text ?? null : null,
    body: get('BODY')?.text ?? '',
    footer: get('FOOTER')?.text ?? null,
    buttons: ((get('BUTTONS')?.buttons ?? []) as any[]).map(b => String(b?.text ?? '')),
  }
}

export function templateSendPayload(name: string, language: string) {
  return { type: 'template', template: { name, language: { code: language } } }
}

export type GraphFail = { ok: false; code: number | null; error: string }

export async function createTemplate(env: GraphEnv, d: TemplateDraft, f: Fetch = fetch): Promise<{ ok: true; meta_id: string; status: string; category: string } | GraphFail> {
  const bad = validateDraft(d)
  if (bad) return { ok: false, code: null, error: bad }
  if (!env.token || !env.wabaId) return { ok: false, code: null, error: 'WhatsApp is not configured (business account id or token missing).' }
  try {
    const r = await graphCall(f, `https://graph.facebook.com/${env.version}/${encodeURIComponent(env.wabaId)}/message_templates`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: d.name, language: d.language, category: d.category, components: draftComponents(d) }),
    })
    if (r.status >= 200 && r.status < 300 && typeof r.json?.id === 'string') {
      return { ok: true, meta_id: r.json.id, status: String(r.json.status ?? 'PENDING'), category: String(r.json.category ?? d.category) }
    }
    return fail(r)
  } catch {
    return { ok: false, code: null, error: 'Meta did not answer. Sync templates before trying again, in case it was created.' }
  }
}

function fail(r: { status: number; json: any }): GraphFail {
  const code = Number(r.json?.error?.code)
  const msg = safeErrorTitle(r.json?.error?.error_user_msg ?? r.json?.error?.message) ?? `Meta returned ${r.status}`
  return { ok: false, code: Number.isFinite(code) ? code : null, error: msg }
}

const LIST_FIELDS = 'id,name,language,status,category,components,quality_score'

export async function listTemplates(env: GraphEnv, f: Fetch = fetch, maxPages = 5): Promise<{ ok: true; templates: MetaTemplate[] } | GraphFail> {
  if (!env.token || !env.wabaId) return { ok: false, code: null, error: 'WhatsApp is not configured (business account id or token missing).' }
  const out: MetaTemplate[] = []
  // rejected_reason is asked for first; if this API version refuses the field,
  // ask again without it rather than failing the sync.
  let fields = LIST_FIELDS + ',rejected_reason'
  let url: string | null = `https://graph.facebook.com/${env.version}/${encodeURIComponent(env.wabaId)}/message_templates?limit=100&fields=${fields}`
  for (let page = 0; url && page < maxPages; page++) {
    let r: { status: number; json: any }
    try {
      r = await graphCall(f, url, { headers: { Authorization: `Bearer ${env.token}` } })
    } catch {
      return { ok: false, code: null, error: 'Meta did not answer. Try again.' }
    }
    if (r.status === 400 && page === 0 && fields.includes('rejected_reason') && Number(r.json?.error?.code) === 100) {
      fields = LIST_FIELDS
      url = `https://graph.facebook.com/${env.version}/${encodeURIComponent(env.wabaId)}/message_templates?limit=100&fields=${fields}`
      page--
      continue
    }
    if (r.status < 200 || r.status >= 300) return fail(r)
    for (const t of (r.json?.data ?? []) as any[]) {
      if (typeof t?.id !== 'string' || typeof t?.name !== 'string') continue
      const reason = typeof t.rejected_reason === 'string' && t.rejected_reason !== 'NONE' ? t.rejected_reason : null
      out.push({
        meta_id: t.id, name: t.name, language: String(t.language ?? ''), category: String(t.category ?? ''),
        status: String(t.status ?? 'UNKNOWN'), components: Array.isArray(t.components) ? t.components : [],
        reason, quality: typeof t.quality_score?.score === 'string' ? t.quality_score.score : null,
      })
    }
    const next = r.json?.paging?.next
    // Only follow Meta's own pagination links.
    url = typeof next === 'string' && next.startsWith('https://graph.facebook.com/') ? next : null
  }
  return { ok: true, templates: out }
}

// One template's current status, for the worker before each run.
export async function templateStatus(env: GraphEnv, metaId: string, f: Fetch = fetch): Promise<{ status: string; category: string } | null> {
  if (!env.token || !metaId) return null
  try {
    const r = await graphCall(f, `https://graph.facebook.com/${env.version}/${encodeURIComponent(metaId)}?fields=status,category`, {
      headers: { Authorization: `Bearer ${env.token}` },
    })
    if (r.status >= 200 && r.status < 300 && typeof r.json?.status === 'string') return { status: r.json.status, category: String(r.json.category ?? '') }
  } catch { /* unknown: the caller treats null as "do not send" */ }
  return null
}

// The phone number's quality and Meta's 24-hour messaging limit. Fields are
// read separately so one unsupported field cannot hide the other.
export type AccountLimits = { quality: string | null; messagingLimit: string | null; error: string | null }
export async function accountLimits(env: GraphEnv, f: Fetch = fetch): Promise<AccountLimits> {
  if (!env.token || !env.phoneNumberId) return { quality: null, messagingLimit: null, error: 'WhatsApp is not configured.' }
  const get = async (field: string) => {
    try {
      const r = await graphCall(f, `https://graph.facebook.com/${env.version}/${encodeURIComponent(env.phoneNumberId!)}?fields=${field}`, {
        headers: { Authorization: `Bearer ${env.token}` },
      })
      return r.status >= 200 && r.status < 300 ? r.json?.[field] : undefined
    } catch { return undefined }
  }
  const [q, l] = await Promise.all([get('quality_rating'), get('whatsapp_business_manager_messaging_limit')])
  const limit = typeof l === 'string' ? l : typeof l?.current_limit === 'string' ? l.current_limit : l != null ? JSON.stringify(l).slice(0, 80) : null
  return {
    quality: typeof q === 'string' ? q : null,
    messagingLimit: limit,
    error: q === undefined && l === undefined ? 'Meta did not return the quality rating or the messaging limit.' : null,
  }
}
