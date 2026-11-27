// Who may do what in the WhatsApp inbox.
//
// D2 (approved 26 Nov 2026): Rishi counsels alone, so the existing CRM login
// stays and its one shared session maps to the owner. Every inbox action asks
// can(actor, action) and never checks a role directly, so per-counsellor
// accounts later only need a new way to build an Actor, not edits to each
// action.

export type Role = 'owner' | 'counsellor'
export type Actor = { id: string; role: Role }

export type Action =
  | 'view' | 'send' | 'request_phone' | 'note' | 'link_lead' | 'create_lead'
  | 'record_call' | 'record_consent' | 'archive'
  | 'edit_settings' | 'toggle_sending' | 'override_cap' | 'connection_check' | 'delete_contact'
  // Phase 3 campaigns
  | 'campaign_view' | 'contacts_import' | 'list_edit' | 'campaign_edit' | 'campaign_pause'
  | 'consent_bulk' | 'template_submit' | 'campaign_approve' | 'campaign_resume' | 'campaign_settings' | 'export'

// Anything that can cause a send, spend money, change what students are
// recorded as agreeing to, or take student numbers out of the system.
const OWNER_ONLY: ReadonlySet<Action> = new Set<Action>([
  'edit_settings', 'toggle_sending', 'override_cap', 'connection_check', 'delete_contact',
  'consent_bulk', 'template_submit', 'campaign_approve', 'campaign_resume', 'campaign_settings', 'export',
])

export function can(actor: Actor | null, action: Action): boolean {
  if (!actor) return false
  if (actor.role === 'owner') return true
  return !OWNER_ONLY.has(action)
}

// The shared CRM session. A per-user session would return that user instead.
export const OWNER: Actor = Object.freeze({ id: 'owner', role: 'owner' }) as Actor
