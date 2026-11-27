// Meta message templates and account limits (Phase 3).
//
// Create: POST /{WABA}/message_templates. List: GET the same edge. Templates
// here carry no variables: Rishi's list holds phone numbers only, so every
// recipient gets the same text. Errors keep Meta's code and a redacted
// title, never the token.
import { graphCall, safeErrorTitle, type GraphEnv } from './graph'
import { checkButtons, REFER_URL_EXAMPLE, REFER_URL_VAR } from './template-rules'

type Fetch = typeof fetch

export type TemplateCategory = 'MARKETING' | 'UTILITY' | 'AUTHENTICATION'
export type TemplateButton = { type: 'QUICK_REPLY'; text: string } | { type: 'URL'; text: string; url: string }
export type TemplateDraft = {
  name: string
  language: string
  category: TemplateCategory
  header?: string
  // An image or PDF header: the handle comes from uploadHeaderSample.
  headerMedia?: { kind: 'image' | 'document'; handle: string }
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
  if (d.headerMedia && d.header?.trim()) return 'Choose a text header or an image/PDF header, not both.'
  if (d.headerMedia && !/^[\w:.=+/-]{4,2000}$/.test(d.headerMedia.handle)) return 'The header file was not uploaded to Meta.'
  return checkButtons(d.buttons ?? [])
}

export function draftComponents(d: TemplateDraft): unknown[] {
  const c: unknown[] = []
  if (d.headerMedia) c.push({ type: 'HEADER', format: d.headerMedia.kind === 'image' ? 'IMAGE' : 'DOCUMENT', example: { header_handle: [d.headerMedia.handle] } })
  else if (d.header?.trim()) c.push({ type: 'HEADER', format: 'TEXT', text: d.header.trim() })
  c.push({ type: 'BODY', text: d.body.trim() })
  if (d.footer?.trim()) c.push({ type: 'FOOTER', text: d.footer.trim() })
  if (d.buttons?.length) {
    c.push({ type: 'BUTTONS', buttons: d.buttons.map(b => b.type === 'URL'
      ? (b.url === REFER_URL_VAR ? { type: 'URL', text: b.text.trim(), url: b.url, example: [REFER_URL_EXAMPLE] } : { type: 'URL', text: b.text.trim(), url: b.url })
      : { type: 'QUICK_REPLY', text: b.text.trim() }) })
  }
  return c
}

// What a recipient sees, for previews. Same text order as WhatsApp shows it.
export function previewText(components: unknown[]): { header: string | null; headerKind: 'image' | 'document' | null; body: string; footer: string | null; buttons: string[] } {
  const get = (type: string) => (components as any[]).find(c => c?.type === type)
  const fmt = String(get('HEADER')?.format ?? '').toUpperCase()
  return {
    header: get('HEADER')?.format === 'TEXT' || get('HEADER')?.text ? get('HEADER')?.text ?? null : null,
    headerKind: fmt === 'IMAGE' ? 'image' : fmt === 'DOCUMENT' ? 'document' : null,
    body: get('BODY')?.text ?? '',
    footer: get('FOOTER')?.text ?? null,
    buttons: ((get('BUTTONS')?.buttons ?? []) as any[]).map(b => String(b?.text ?? '')),
  }
}

export { needsParameters } from './campaign-text'

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

// ── Header samples, edit and delete (Phase 4) ───────────────────────────────

// Meta's Resumable Upload API, used only for a template's example image or
// PDF: start a session on the app, upload the bytes, get a handle.
// https://developers.facebook.com/docs/graph-api/guides/upload
export async function uploadHeaderSample(env: GraphEnv, bytes: Uint8Array, mime: string, fileName: string, f: Fetch = fetch): Promise<{ ok: true; handle: string } | GraphFail> {
  if (!env.token || !env.appId) return { ok: false, code: null, error: 'WhatsApp is not configured (app id or token missing).' }
  if (!['image/jpeg', 'image/png', 'application/pdf'].includes(mime)) return { ok: false, code: null, error: 'Header files must be JPEG, PNG or PDF.' }
  try {
    const q = new URLSearchParams({ file_name: fileName.slice(0, 100), file_length: String(bytes.byteLength), file_type: mime })
    const start = await graphCall(f, `https://graph.facebook.com/${env.version}/${encodeURIComponent(env.appId)}/uploads?${q}`, {
      method: 'POST', headers: { Authorization: `Bearer ${env.token}` },
    })
    const session = start.json?.id
    if (start.status < 200 || start.status >= 300 || typeof session !== 'string' || !/^upload:[\w=:.-]+$/.test(session)) return fail(start)
    const up = await graphCall(f, `https://graph.facebook.com/${env.version}/${session}`, {
      method: 'POST',
      headers: { Authorization: `OAuth ${env.token}`, file_offset: '0', 'Content-Type': mime },
      body: bytes as unknown as BodyInit,
    }, 30_000)
    if (up.status >= 200 && up.status < 300 && typeof up.json?.h === 'string') return { ok: true, handle: up.json.h }
    return fail(up)
  } catch {
    return { ok: false, code: null, error: 'Meta did not answer the upload. Try again.' }
  }
}

// Edit: POST /{template-id} with the new components. Meta allows it for
// APPROVED (once a day, 10 times in 30 days), REJECTED and PAUSED templates.
// The category is never sent: Meta's pages disagree on whether it may change.
export async function editTemplate(env: GraphEnv, metaId: string, components: unknown[], f: Fetch = fetch): Promise<{ ok: true } | GraphFail> {
  if (!env.token) return { ok: false, code: null, error: 'WhatsApp is not configured.' }
  if (!/^\d{1,30}$/.test(metaId)) return { ok: false, code: null, error: 'Unknown template.' }
  try {
    const r = await graphCall(f, `https://graph.facebook.com/${env.version}/${metaId}`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ components }),
    })
    if (r.status >= 200 && r.status < 300 && r.json?.success !== false) return { ok: true }
    return fail(r)
  } catch {
    return { ok: false, code: null, error: 'Meta did not answer. Sync templates before trying again.' }
  }
}

// Delete one language of a template: DELETE /{WABA}/message_templates with
// name and hsm_id. A deleted approved name cannot be reused for 30 days.
export async function deleteTemplate(env: GraphEnv, name: string, metaId: string, f: Fetch = fetch): Promise<{ ok: true } | GraphFail> {
  if (!env.token || !env.wabaId) return { ok: false, code: null, error: 'WhatsApp is not configured.' }
  if (!/^[a-z0-9_]{1,512}$/.test(name) || !/^\d{1,30}$/.test(metaId)) return { ok: false, code: null, error: 'Unknown template.' }
  try {
    const q = new URLSearchParams({ name, hsm_id: metaId })
    const r = await graphCall(f, `https://graph.facebook.com/${env.version}/${encodeURIComponent(env.wabaId)}/message_templates?${q}`, {
      method: 'DELETE', headers: { Authorization: `Bearer ${env.token}` },
    })
    if (r.status >= 200 && r.status < 300 && r.json?.success !== false) return { ok: true }
    return fail(r)
  } catch {
    return { ok: false, code: null, error: 'Meta did not answer. Sync templates to see whether it was removed.' }
  }
}

// ── Media for sending (Phase 4) ─────────────────────────────────────────────
// POST /{phone-number-id}/media returns an id usable in messages for 30 days.
export async function uploadMedia(env: GraphEnv, bytes: Uint8Array, mime: string, fileName: string, f: Fetch = fetch): Promise<{ ok: true; id: string } | GraphFail> {
  if (!env.token || !env.phoneNumberId) return { ok: false, code: null, error: 'WhatsApp is not configured.' }
  try {
    const form = new FormData()
    form.append('messaging_product', 'whatsapp')
    form.append('type', mime)
    form.append('file', new Blob([bytes as unknown as BlobPart], { type: mime }), fileName.slice(0, 100) || 'file')
    const r = await graphCall(f, `https://graph.facebook.com/${env.version}/${encodeURIComponent(env.phoneNumberId)}/media`, {
      method: 'POST', headers: { Authorization: `Bearer ${env.token}` }, body: form,
    }, 30_000)
    if (r.status >= 200 && r.status < 300 && typeof r.json?.id === 'string') return { ok: true, id: r.json.id }
    return fail(r)
  } catch {
    return { ok: false, code: null, error: 'Meta did not answer the upload. Try again.' }
  }
}

// A received file: GET /{media-id} gives a URL valid for 5 minutes that
// needs the token; the bytes are fetched and handed back, never stored.
// Meta keeps webhook media for 7 days.
export const MAX_DOWNLOAD_BYTES = 25 * 1024 * 1024
export async function downloadMedia(env: GraphEnv, mediaId: string, f: Fetch = fetch): Promise<{ ok: true; mime: string; bytes: Uint8Array } | GraphFail> {
  if (!env.token) return { ok: false, code: null, error: 'WhatsApp is not configured.' }
  if (!/^\d{1,40}$/.test(mediaId)) return { ok: false, code: null, error: 'Unknown file.' }
  try {
    const meta = await graphCall(f, `https://graph.facebook.com/${env.version}/${mediaId}`, { headers: { Authorization: `Bearer ${env.token}` } })
    const url = meta.json?.url
    if (meta.status < 200 || meta.status >= 300 || typeof url !== 'string') return fail(meta)
    let host = ''
    try { host = new URL(url).hostname } catch { /* bad url */ }
    // Only Meta's own media hosts ever receive the token.
    if (!url.startsWith('https://') || !/(^|\.)(fbsbx\.com|facebook\.com|whatsapp\.net|fbcdn\.net)$/.test(host)) {
      return { ok: false, code: null, error: 'Meta returned an unexpected file address.' }
    }
    if (Number(meta.json?.file_size) > MAX_DOWNLOAD_BYTES) return { ok: false, code: null, error: 'This file is larger than 25 MB. Open it in WhatsApp on the phone.' }
    const ctl = new AbortController()
    const t = setTimeout(() => ctl.abort(), 20_000)
    try {
      const res = await f(url, { headers: { Authorization: `Bearer ${env.token}` }, signal: ctl.signal, cache: 'no-store', redirect: 'error' })
      if (!res.ok) return { ok: false, code: null, error: `Meta returned ${res.status} for the file. Files older than 7 days are no longer available.` }
      const buf = new Uint8Array(await res.arrayBuffer())
      if (buf.byteLength > MAX_DOWNLOAD_BYTES) return { ok: false, code: null, error: 'This file is larger than 25 MB.' }
      return { ok: true, mime: String(meta.json?.mime_type ?? res.headers.get('content-type') ?? 'application/octet-stream').split(';')[0], bytes: buf }
    } finally { clearTimeout(t) }
  } catch {
    return { ok: false, code: null, error: 'Meta did not answer. Try again.' }
  }
}
