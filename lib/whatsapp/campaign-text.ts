// Plain-language text for campaign states, shared by the server rules and the
// browser screens, so it holds no server-only imports.
export const SKIP_TEXT: Record<string, string> = {
  no_consent: 'No recorded marketing consent',
  marketing_no: 'Said no to marketing',
  opted_out: 'Opted out (STOP)',
  no_phone: 'No phone number',
}

export const STATUS_TEXT: Record<string, string> = {
  draft: 'Draft', approved: 'Approved, waiting to start', sending: 'Sending', paused: 'Paused', completed: 'Completed', cancelled: 'Cancelled',
}

export function pauseText(reason: string | null): string {
  if (!reason) return ''
  if (reason === 'owner') return 'Paused by you.'
  if (reason.startsWith('meta_error_')) return `Meta returned error ${reason.slice(11)}, which means stop. Check WhatsApp Manager before resuming.`
  const t: Record<string, string> = {
    meta_error: 'Meta reported an error that means stop. Check WhatsApp Manager before resuming.',
    template_not_approved: 'The template is no longer approved by Meta (paused, disabled or recategorised).',
    rate_changed: 'The marketing rate in Settings went up after approval. Move back to draft and approve the new cost.',
    campaign_budget_reached: 'This campaign spent its budget.',
    monthly_budget_reached: 'The monthly campaign budget is used up.',
    quality_red: 'Meta rated the phone number quality RED. Every campaign was paused.',
    quality_flagged: 'Meta flagged the phone number. Every campaign was paused.',
    campaigns_switched_off: 'Campaign sending was switched off in Campaign settings.',
  }
  return t[reason] ?? reason
}

// Why a sweep run did not send for this campaign (from the claim).
export const BLOCKED_TEXT: Record<string, string> = {
  campaigns_off: 'Campaign sending is switched off in Campaign settings.',
  daily_limit: 'Today\'s budget or Meta\'s 24-hour limit is reached; it continues tomorrow.',
  budget_missing: 'A daily or monthly campaign budget is not set.',
  rate_missing: 'The marketing rate is not set.',
}

// Campaigns send a template with no parameters (the list holds phone numbers
// only). A template synced from Meta that needs any, such as a {{1}}, a media
// header or a copy-code button, would fail at Meta with 132000 and pause the
// campaign, so it is refused up front. Returns the reason, or null if it can
// be sent as is.
const PARAM_BUTTONS = new Set(['COPY_CODE', 'OTP', 'FLOW', 'CATALOG', 'MPM', 'SPM'])
export function needsParameters(components: unknown): string | null {
  const list = Array.isArray(components) ? components : []
  for (const raw of list) {
    const c = (raw ?? {}) as Record<string, unknown>
    const type = String(c.type ?? '').toUpperCase()
    if (type === 'HEADER' && c.format && String(c.format).toUpperCase() !== 'TEXT') {
      return 'This template has an image, video, document or location header, which needs a file for every send.'
    }
    if (type === 'BUTTONS' && Array.isArray(c.buttons)) {
      for (const b of c.buttons as Array<Record<string, unknown>>) {
        const bt = String(b?.type ?? '').toUpperCase()
        if (PARAM_BUTTONS.has(bt)) return `This template has a ${bt.toLowerCase().replace(/_/g, ' ')} button, which needs a value for every send.`
        if (/\{\{/.test(String(b?.url ?? ''))) return 'This template has a website button with a variable part.'
      }
    }
  }
  if (/\{\{\s*[\w.]+\s*\}\}/.test(JSON.stringify(list))) {
    return 'This template has personalised fields like {{1}}; your lists hold phone numbers only.'
  }
  if (list.length === 0) return 'This template has no content on record. Sync templates from Meta first.'
  return null
}
