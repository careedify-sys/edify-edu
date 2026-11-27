// Template rules shared by the server and the browser (no server imports).
//
// Sources, read 27 Nov 2026 on developers.facebook.com:
//  - components: at most 10 buttons, 2 URL buttons, 10 quick replies; quick
//    replies and other buttons sit in two groups ("URL, QR, QR" is valid,
//    "QR, URL, QR" is not).
//  - media headers: JPEG/PNG image or PDF document, uploaded with the
//    Resumable Upload API for the example handle.
//  - message_template_status_update reasons.

// The only variable a campaign fills: the campaign token at the end of the
// referral link. Same value for every recipient of one campaign, so it is not
// personalisation, and it carries no phone number.
export const REFER_URL_BASE = 'https://edifyedu.in/refer'
export const REFER_URL_VAR = `${REFER_URL_BASE}?c={{1}}`
export const REFER_URL_EXAMPLE = `${REFER_URL_BASE}?c=0123456789abcdef`

export const HEADER_LIMITS = {
  image: { mimes: ['image/jpeg', 'image/png'], maxBytes: 4 * 1024 * 1024, label: 'JPEG or PNG, up to 4 MB' },
  document: { mimes: ['application/pdf'], maxBytes: 4 * 1024 * 1024, label: 'PDF, up to 4 MB' },
} as const

// Files sent from the inbox. Meta allows larger, but uploads pass through a
// Vercel function, whose request body limit is 4.5 MB.
export const OUTBOUND_MIMES: Record<string, 'image' | 'document'> = {
  'image/jpeg': 'image', 'image/png': 'image', 'application/pdf': 'document',
  'application/msword': 'document',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'document',
  'application/vnd.ms-excel': 'document',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'document',
  'application/vnd.ms-powerpoint': 'document',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'document',
  'text/plain': 'document',
}
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

export type DraftButton = { type: 'QUICK_REPLY'; text: string } | { type: 'URL'; text: string; url: string }

// Meta's grouping rule: all quick replies together, all other buttons
// together. Returns an error or null.
export function checkButtons(buttons: DraftButton[]): string | null {
  if (buttons.length > 10) return 'At most 10 buttons.'
  if (buttons.filter(b => b.type === 'URL').length > 2) return 'At most 2 website buttons.'
  const kinds = buttons.map(b => (b.type === 'QUICK_REPLY' ? 'Q' : 'O')).join('')
  if (/Q+O+Q|O+Q+O/.test(kinds)) return 'Keep quick replies together: put the website buttons first, then the quick replies (for example Refer a Friend, Know More, Stop Promotions).'
  for (const b of buttons) {
    if (!b.text.trim() || b.text.trim().length > 25) return 'Button text must be 1 to 25 characters.'
    if (b.type === 'URL') {
      if (b.url === REFER_URL_VAR) continue
      if (/\{\{/.test(b.url)) return `The only link with a variable allowed is the referral link ${REFER_URL_VAR}.`
      if (!/^https:\/\/[^\s{}]+$/.test(b.url)) return 'Website buttons need a full https:// link.'
    }
  }
  return null
}

// How a campaign or inbox send fills a template, or why it cannot.
export type SendPlan = {
  header: null | { kind: 'image' | 'document' }
  urlTokenButtons: number[]    // button indexes whose URL ends in {{1}} (the referral link)
}
export function sendPlan(components: unknown, hasHeaderFile: boolean): { ok: true; plan: SendPlan } | { ok: false; error: string } {
  const list = Array.isArray(components) ? components : []
  if (list.length === 0) return { ok: false, error: 'This template has no content on record. Sync templates from Meta first.' }
  const plan: SendPlan = { header: null, urlTokenButtons: [] }
  for (const raw of list) {
    const c = (raw ?? {}) as Record<string, unknown>
    const type = String(c.type ?? '').toUpperCase()
    if (type === 'HEADER') {
      const fmt = String(c.format ?? 'TEXT').toUpperCase()
      if (fmt === 'IMAGE' || fmt === 'DOCUMENT') {
        if (!hasHeaderFile) return { ok: false, error: `This template has ${fmt === 'IMAGE' ? 'an image' : 'a document'} header. Attach the ${fmt === 'IMAGE' ? 'image' : 'PDF'} to it in Templates first.` }
        plan.header = { kind: fmt === 'IMAGE' ? 'image' : 'document' }
      } else if (fmt !== 'TEXT') {
        return { ok: false, error: `This template has a ${fmt.toLowerCase()} header, which campaigns here do not send.` }
      } else if (/\{\{/.test(String(c.text ?? ''))) {
        return { ok: false, error: 'This template has a personalised header. Your lists hold phone numbers only.' }
      }
    } else if (type === 'BUTTONS' && Array.isArray(c.buttons)) {
      const buttons = c.buttons as Array<Record<string, unknown>>
      for (let i = 0; i < buttons.length; i++) {
        const b = buttons[i]
        const bt = String(b?.type ?? '').toUpperCase()
        if (['COPY_CODE', 'OTP', 'FLOW', 'CATALOG', 'MPM', 'SPM'].includes(bt)) {
          return { ok: false, error: `This template has a ${bt.toLowerCase().replace(/_/g, ' ')} button, which needs a value for every send.` }
        }
        const url = String(b?.url ?? '')
        if (bt === 'URL' && /\{\{/.test(url)) {
          if (url !== REFER_URL_VAR) return { ok: false, error: 'This template has a website button with a variable part other than the referral link.' }
          plan.urlTokenButtons.push(i)
        }
      }
    } else if (/\{\{\s*[\w.]+\s*\}\}/.test(JSON.stringify(c))) {
      return { ok: false, error: 'This template has personalised fields like {{1}}; your lists hold phone numbers only.' }
    }
  }
  return { ok: true, plan }
}

// The send payload for a template, filled from the plan.
export function templatePayload(name: string, language: string, plan: SendPlan,
  fill: { mediaId?: string | null; fileName?: string | null; refToken?: string | null }) {
  const components: unknown[] = []
  if (plan.header) {
    if (!fill.mediaId) throw new Error('header media missing')
    components.push({ type: 'header', parameters: [plan.header.kind === 'image'
      ? { type: 'image', image: { id: fill.mediaId } }
      : { type: 'document', document: { id: fill.mediaId, filename: (fill.fileName || 'document.pdf').slice(0, 100) } }] })
  }
  for (const i of plan.urlTokenButtons) {
    if (!fill.refToken || !/^[0-9a-f]{16}$/.test(fill.refToken)) throw new Error('campaign token missing')
    components.push({ type: 'button', sub_type: 'url', index: String(i), parameters: [{ type: 'text', text: fill.refToken }] })
  }
  return { type: 'template', template: { name, language: { code: language }, ...(components.length ? { components } : {}) } }
}

// Meta's rejection and pause reasons, in plain words.
export const REASON_TEXT: Record<string, string> = {
  ABUSIVE_CONTENT: 'Meta judged the content abusive or against its policies. Rewrite it in a calm, factual tone.',
  INCORRECT_CATEGORY: 'Meta thinks the category is wrong. Referral invitations are Marketing; order or account updates are Utility.',
  INVALID_FORMAT: 'The format is wrong, for example a bad variable, an unclear sample or a broken link. Check the text and buttons.',
  PROMOTIONAL: 'Meta found promotional content in a Utility template. Submit it as Marketing instead.',
  SCAM: 'Meta suspects the message could mislead people. Remove anything that sounds like a guaranteed reward or prize, and state the conditions plainly.',
  TAG_CONTENT_MISMATCH: 'The category or language does not match the text. Check both.',
  CATEGORY_NOT_AVAILABLE: 'This category is not available for this template.',
  NONE: 'No reason given (usually a pause for low quality: many people blocked or reported it).',
}
export function reasonText(reason: string | null | undefined): string | null {
  if (!reason) return null
  return REASON_TEXT[reason] ?? reason.replace(/_/g, ' ').toLowerCase()
}

// Common Meta send errors, in plain words. Codes from Meta's error-code page.
export const ERROR_TEXT: Record<number, string> = {
  131047: 'The 24-hour reply window has closed. Send an approved template instead.',
  131026: 'The message could not be delivered: the number may not be on WhatsApp, or the person has an old app version.',
  131049: 'Meta withheld this marketing message to protect the person from too many messages. Wait at least 24 hours before trying again.',
  131050: 'The person has stopped marketing messages from businesses on WhatsApp.',
  131051: 'This message type is not supported.',
  131052: 'The file could not be downloaded from WhatsApp (too large or expired).',
  131053: 'The file could not be uploaded: check the type and size.',
  131042: 'There is a payment problem on the WhatsApp Business account. Check the payment method in WhatsApp Manager.',
  131031: 'The WhatsApp Business account is restricted or locked. Check WhatsApp Manager.',
  131048: 'Spam rate limit: too many recent messages were blocked or reported. Pause and check quality in WhatsApp Manager.',
  131056: 'Too many messages to the same number in a short time. Wait before sending again.',
  130429: 'Meta\'s throughput limit was hit. The campaign paused; resume later.',
  132000: 'The template parameters do not match the template.',
  132001: 'The template does not exist in this language, or is not approved.',
  132012: 'The template parameters are in the wrong format.',
  132015: 'The template is paused for low quality.',
  132016: 'The template is disabled for low quality.',
  133010: 'The phone number is not registered with the WhatsApp Cloud API.',
  190: 'The access token expired or is wrong. Generate a new one in Meta and update it in Vercel.',
  368: 'Meta temporarily blocked this account for policy reasons. Check WhatsApp Manager.',
  100: 'Meta refused a parameter in the request.',
}
export function errorText(code: number | null | undefined): string | null {
  return code != null && ERROR_TEXT[code] ? ERROR_TEXT[code] : null
}
