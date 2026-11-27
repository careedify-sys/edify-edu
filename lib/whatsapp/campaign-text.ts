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
