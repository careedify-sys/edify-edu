'use server'
// Server actions for the WhatsApp inbox at /leads/whatsapp.
//
// Auth at two layers, as in app/leads/actions.ts: middleware guards /leads,
// and every action here resolves the actor from the session cookie and the
// service layer checks can(actor, action). Errors return a short message and
// a code, never database text or secrets.
//
// WA_INBOX_MOCK=1 swaps in fake data and a fake Meta for local checks. It is
// ignored when NODE_ENV is 'production', so a deployed build cannot use it.
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { currentActor } from '@/lib/whatsapp/admin-session'
import { can } from '@/lib/whatsapp/access'
import { supabaseInboxRepo, type InboxRepo, type ConvRow, type ListFilter } from '@/lib/whatsapp/inbox-repo'
import { mockInboxRepo, mockCrm } from '@/lib/whatsapp/inbox-mock'
import { readGraphEnv, type GraphEnv } from '@/lib/whatsapp/graph'
import * as svc from '@/lib/whatsapp/inbox-service'
import { saveOutcome, quickSchedule, type OutcomeKey } from '../actions'

type Fail = { ok: false; error: string }

function mockEnabled() {
  return process.env.WA_INBOX_MOCK === '1' && process.env.NODE_ENV !== 'production'
}

const g = globalThis as unknown as { __waMock?: ReturnType<typeof mockInboxRepo> }

const fakeMeta = (async () => ({
  status: 200, json: async () => ({ messages: [{ id: `wamid.mock.${Date.now()}` }] }),
})) as unknown as typeof fetch

function deps(): { repo: InboxRepo; env: GraphEnv; f: typeof fetch; crm: { saveOutcome: typeof saveOutcome | ReturnType<typeof mockCrm>['saveOutcome']; quickSchedule: typeof quickSchedule | ReturnType<typeof mockCrm>['quickSchedule'] } } {
  if (mockEnabled()) {
    g.__waMock ??= mockInboxRepo()
    return {
      repo: g.__waMock,
      env: { token: 'mock', phoneNumberId: 'mock', wabaId: 'mock', appId: 'mock', appSecret: 'mock', version: 'v26.0' },
      f: fakeMeta,
      crm: mockCrm(g.__waMock),
    }
  }
  return { repo: supabaseInboxRepo(createSupabaseServiceClient()), env: readGraphEnv(), f: fetch, crm: { saveOutcome, quickSchedule } }
}

// PostgREST: PGRST202 function missing, PGRST205 / 42P01 table missing.
function failure(e: unknown): Fail {
  const code = (e as { code?: string })?.code
  if (code === 'PGRST202' || code === 'PGRST205' || code === '42P01' || code === '42883') {
    return { ok: false, error: 'The Phase 2 database migration has not been run yet.' }
  }
  console.warn('[wa-inbox] action failed', code ?? (e as Error)?.name ?? 'error')
  return { ok: false, error: `Something went wrong${code ? ` (${code})` : ''}. Try again.` }
}

async function run<T>(fn: (d: ReturnType<typeof deps>, actor: Awaited<ReturnType<typeof currentActor>>) => Promise<T>): Promise<T | Fail> {
  const actor = await currentActor()
  if (!actor) return { ok: false, error: 'Your session has ended. Sign in again.' }
  try {
    return await fn(deps(), actor)
  } catch (e) {
    return failure(e)
  }
}

export async function inboxMode(): Promise<'mock' | 'live'> {
  return mockEnabled() ? 'mock' : 'live'
}

export async function inboxList(f: { status: 'open' | 'archived' | null; search: string; unreadOnly: boolean; beforeAt: string | null; beforeId: string | null }) {
  return run(async ({ repo }, actor) => {
    if (!can(actor, 'view')) return { ok: false as const, error: 'You do not have permission for this' }
    const filter: ListFilter = {
      status: f.status === 'open' || f.status === 'archived' ? f.status : null,
      search: (f.search ?? '').slice(0, 80) || null,
      unreadOnly: f.unreadOnly === true,
      beforeAt: typeof f.beforeAt === 'string' ? f.beforeAt : null,
      beforeId: typeof f.beforeId === 'string' ? f.beforeId : null,
      limit: 30,
    }
    const rows: ConvRow[] = await repo.listConversations(filter)
    return { ok: true as const, rows, serverTime: new Date().toISOString() }
  })
}

// Cheap poll: ids changed since the last call. The client reloads the list
// page and the open thread only when something changed.
export async function inboxPoll(since: string) {
  return run(async ({ repo }, actor) => {
    if (!can(actor, 'view')) return { ok: false as const, error: 'You do not have permission for this' }
    const t = Date.parse(since)
    const from = Number.isFinite(t) ? new Date(t - 5000).toISOString() : new Date(Date.now() - 60_000).toISOString()
    const changed = await repo.changedSince(from)
    return { ok: true as const, changed, serverTime: new Date().toISOString() }
  })
}

export async function inboxThread(convId: string) {
  return run(({ repo }, actor) => svc.loadThread(repo, actor, convId))
}

export async function inboxSend(input: svc.SendInput) {
  return run(({ repo, env, f }, actor) => svc.sendReply(repo, env, f, actor, {
    convId: String(input?.convId ?? ''), clientRef: String(input?.clientRef ?? ''),
    kind: input?.kind === 'request_phone' ? 'request_phone' : 'text', text: typeof input?.text === 'string' ? input.text : '',
  }))
}

export async function inboxMarkRead(convId: string) {
  return run(({ repo }, actor) => svc.markRead(repo, actor, String(convId)))
}

export async function inboxNote(convId: string, body: string) {
  return run(({ repo }, actor) => svc.addNote(repo, actor, String(convId), String(body ?? '')))
}

export async function inboxConsent(i: { contactId: string; purpose: string; granted: boolean; source: string; evidence: string }) {
  return run(({ repo }, actor) => svc.recordConsent(repo, actor, {
    contactId: String(i?.contactId ?? ''), purpose: String(i?.purpose ?? ''), granted: i?.granted === true,
    source: String(i?.source ?? ''), evidence: String(i?.evidence ?? ''),
  }))
}

export async function inboxArchive(convId: string, archived: boolean) {
  return run(({ repo }, actor) => svc.setArchived(repo, actor, String(convId), archived === true))
}

export async function inboxLinkLead(contactId: string, leadId: string | null) {
  return run(({ repo }, actor) => svc.linkLead(repo, actor, String(contactId), leadId === null ? null : String(leadId)))
}

export async function inboxCreateLead(i: { contactId: string; name: string; program: string; university: string }) {
  return run(({ repo }, actor) => svc.createLeadFromContact(repo, actor, {
    contactId: String(i?.contactId ?? ''), name: String(i?.name ?? ''), program: String(i?.program ?? ''), university: String(i?.university ?? ''),
  }))
}

const OUTCOMES: OutcomeKey[] = ['No answer', 'Busy', 'Callback', 'Interested', 'Follow-up', 'Next session', 'Registered', 'Enrolled', 'Not interested', 'Add note']

// Call outcomes, reminders and follow-up notes go to the CRM's own actions,
// so the lead timeline in /leads stays the single record.
export async function inboxCallOutcome(i: { contactId: string; outcome: string; note: string; date: string | null; time: string | null }) {
  return run(async ({ repo, crm }, actor) => {
    if (!can(actor, 'record_call')) return { ok: false as const, error: 'You do not have permission for this' }
    const contact = await repo.getContact(String(i?.contactId ?? ''))
    if (!contact?.lead_id) return { ok: false as const, error: 'Link or create a lead first' }
    if (!OUTCOMES.includes(i.outcome as OutcomeKey)) return { ok: false as const, error: 'Unknown outcome' }
    const date = typeof i.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(i.date) ? i.date : null
    const time = typeof i.time === 'string' && /^\d{2}:\d{2}$/.test(i.time) ? i.time : null
    const r = await crm.saveOutcome({ leadId: contact.lead_id, outcome: i.outcome as OutcomeKey, note: String(i.note ?? '').slice(0, 2000), reason: null, date, time })
    if (!r.ok) return { ok: false as const, error: r.error }
    await repo.audit(actor!.id, 'call_outcome', contact.id, { lead_id: contact.lead_id, outcome: i.outcome })
    return { ok: true as const }
  })
}

export async function inboxSchedule(i: { contactId: string; chip: 'tomorrow' | 'in3' | 'nextweek' | 'none' }) {
  return run(async ({ repo, crm }, actor) => {
    if (!can(actor, 'record_call')) return { ok: false as const, error: 'You do not have permission for this' }
    const contact = await repo.getContact(String(i?.contactId ?? ''))
    if (!contact?.lead_id) return { ok: false as const, error: 'Link or create a lead first' }
    if (!['tomorrow', 'in3', 'nextweek', 'none'].includes(i.chip)) return { ok: false as const, error: 'Unknown reminder' }
    const r = await crm.quickSchedule({ leadId: contact.lead_id, chip: i.chip })
    if (!r.ok) return { ok: false as const, error: r.error }
    await repo.audit(actor!.id, 'call_reminder', contact.id, { lead_id: contact.lead_id, chip: i.chip })
    return { ok: true as const }
  })
}

export async function inboxSettings() {
  return run(({ repo }, actor) => svc.loadSettings(repo, actor))
}

export async function inboxSetSending(on: boolean) {
  return run(({ repo }, actor) => svc.setSending(repo, actor, on === true))
}

export async function inboxUpdateBilling(i: Parameters<typeof svc.updateBilling>[2]) {
  return run(({ repo }, actor) => svc.updateBilling(repo, actor, {
    capInr: Number(i?.capInr), service: Number(i?.service), utility: Number(i?.utility), marketing: Number(i?.marketing),
    authentication: Number(i?.authentication), effectiveFrom: String(i?.effectiveFrom ?? ''), verifiedOn: String(i?.verifiedOn ?? ''),
    source: String(i?.source ?? ''), freePerMonth: Number(i?.freePerMonth), freeSource: String(i?.freeSource ?? ''), timezone: String(i?.timezone ?? ''),
  }))
}

export async function inboxOverrideCap(extraInr: number, reason: string) {
  return run(({ repo }, actor) => svc.overrideCap(repo, actor, Number(extraInr), String(reason ?? '')))
}

export async function inboxConnectionCheck() {
  return run(({ repo, env, f }, actor) => svc.connectionCheck(repo, actor, env, f))
}

export async function inboxDeleteContact(contactId: string, confirm: string) {
  return run(({ repo }, actor) => svc.deleteContactData(repo, actor, String(contactId ?? ''), String(confirm ?? '')))
}
