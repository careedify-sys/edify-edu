'use server'
// Server actions for referral campaigns: Contacts, Lists, Templates,
// Campaigns and campaign Settings under /leads/whatsapp.
//
// Same rules as actions.ts: middleware guards /leads, each action resolves
// the actor from the session cookie, the service checks can(actor, action),
// and errors carry a short message, never database text or secrets.
// WA_INBOX_MOCK=1 (ignored in production) swaps in fake data and a fake Meta
// that accepts templates but is never asked to send.
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { currentActor } from '@/lib/whatsapp/admin-session'
import { supabaseCampaignRepo, type CampaignRepo } from '@/lib/whatsapp/campaign-repo'
import { mockCampaignRepo } from '@/lib/whatsapp/campaign-mock'
import { readGraphEnv, type GraphEnv } from '@/lib/whatsapp/graph'
import type { DraftInput } from '@/lib/whatsapp/template-service'
import * as svc from '@/lib/whatsapp/campaign-service'

type Fail = { ok: false; error: string }

function mockEnabled() {
  return process.env.WA_INBOX_MOCK === '1' && process.env.NODE_ENV !== 'production'
}

const g = globalThis as unknown as { __waCampaignMock?: CampaignRepo }

// Fake Meta for mock mode: template create and list work, phone checks
// answer GREEN. A message send is refused, so even a bug cannot send.
const fakeMeta = (async (url: string, init?: RequestInit) => {
  const u = String(url)
  const json = (b: unknown, status = 200) => ({ status, json: async () => b }) as unknown as Response
  if (u.endsWith('/messages')) return json({ error: { code: 0, message: 'mock never sends' } }, 400)
  // Phase 4: header upload session, edit, delete and media upload.
  if (/\/uploads\?/.test(u)) return json({ id: 'upload:mock' })
  if (u.endsWith('/upload:mock')) return json({ h: '4::mockhandle' })
  if (u.includes('/message_templates') && init?.method === 'DELETE') return json({ success: true })
  if (/\/\d+$/.test(u) && init?.method === 'POST') return json({ success: true })
  if (/\/\d+\?fields=status/.test(u)) return json({ status: 'PENDING', category: 'MARKETING' })
  if (u.endsWith('/media') && init?.method === 'POST') return json({ id: `mockmedia_${Date.now()}` })
  if (u.includes('/message_templates') && init?.method === 'POST') {
    const body = JSON.parse(String(init.body ?? '{}'))
    return json({ id: String(Date.now()), status: 'PENDING', category: body.category })
  }
  if (u.includes('/message_templates')) return json({ data: [] })
  if (u.includes('quality_rating')) return json({ quality_rating: 'GREEN' })
  if (u.includes('messaging_limit')) return json({ whatsapp_business_manager_messaging_limit: 'TIER_250' })
  return json({}, 404)
}) as unknown as typeof fetch

function deps(): { repo: CampaignRepo; env: GraphEnv; f: typeof fetch } {
  if (mockEnabled()) {
    g.__waCampaignMock ??= mockCampaignRepo()
    return { repo: g.__waCampaignMock, env: { token: 'mock', phoneNumberId: 'mock', wabaId: 'mock', appId: 'mock', appSecret: 'mock', version: 'v26.0' }, f: fakeMeta }
  }
  return { repo: supabaseCampaignRepo(createSupabaseServiceClient()), env: readGraphEnv(), f: fetch }
}

function failure(e: unknown): Fail {
  const code = (e as { code?: string })?.code
  if (code === 'PGRST202' || code === 'PGRST205' || code === '42P01' || code === '42883' || code === '42703') {
    return { ok: false, error: 'The campaign database migration (Phase 3) has not been run yet.' }
  }
  if (code === 'P0001') return { ok: false, error: 'This campaign is locked. Move it back to draft first.' }
  console.warn('[wa-campaigns] action failed', code ?? (e as Error)?.name ?? 'error')
  return { ok: false, error: `Something went wrong${code ? ` (${code})` : ''}. Try again.` }
}

async function run<T>(fn: (d: ReturnType<typeof deps>, actor: NonNullable<Awaited<ReturnType<typeof currentActor>>>) => Promise<T>): Promise<T | Fail> {
  const actor = await currentActor()
  if (!actor) return { ok: false, error: 'Your session has ended. Sign in again.' }
  try {
    return await fn(deps(), actor)
  } catch (e) {
    return failure(e)
  }
}

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '')

// Contacts
export async function waCheckNumbers(phones: string[]) { return run(({ repo }, a) => svc.checkNumbers(repo, a, phones)) }
export async function waSaveNumbers(i: { phones: string[]; listId: string | null; newListName: string | null; source: string }) {
  return run(({ repo }, a) => svc.saveNumbers(repo, a, { phones: i?.phones, listId: i?.listId ? str(i.listId, 40) : null, newListName: i?.newListName ? str(i.newListName, 80) : null, source: str(i?.source, 10) }))
}
export async function waSourcePhones(from: 'inbox' | 'crm') { return run(({ repo }, a) => svc.sourcePhones(repo, a, from === 'crm' ? 'crm' : 'inbox')) }
export async function waRecordConsent(i: { contactIds?: string[]; listId?: string | null; granted: boolean; source: string; obtainedOn: string | null; evidence: string; confirm: string }) {
  return run(({ repo }, a) => svc.recordConsent(repo, a, {
    contactIds: i?.contactIds, listId: i?.listId ? str(i.listId, 40) : null, granted: i?.granted === true, source: str(i?.source, 30),
    obtainedOn: i?.obtainedOn ? str(i.obtainedOn, 10) : null, evidence: str(i?.evidence, 500), confirm: str(i?.confirm, 10),
  }))
}

// Lists
export async function waLists() { return run(({ repo }, a) => svc.loadLists(repo, a)) }
export async function waCreateList(name: string) { return run(({ repo }, a) => svc.createList(repo, a, str(name, 80))) }
export async function waRenameList(id: string, name: string) { return run(({ repo }, a) => svc.renameList(repo, a, str(id, 40), str(name, 80))) }
export async function waArchiveList(id: string) { return run(({ repo }, a) => svc.archiveList(repo, a, str(id, 40))) }
export async function waListMembers(i: { listId: string; search: string; offset: number }) {
  return run(({ repo }, a) => svc.loadMembers(repo, a, { listId: str(i?.listId, 40), search: str(i?.search, 20), offset: Number(i?.offset) || 0 }))
}
export async function waListReport(id: string) { return run(({ repo }, a) => svc.listReport(repo, a, str(id, 40))) }
export async function waRemoveMembers(listId: string, contactIds: string[]) { return run(({ repo }, a) => svc.removeMembers(repo, a, str(listId, 40), contactIds)) }
export async function waContactHistory(contactId: string) { return run(({ repo }, a) => svc.contactHistory(repo, a, str(contactId, 40))) }

// Templates
export async function waTemplates() { return run(({ repo }, a) => svc.loadTemplates(repo, a)) }
export async function waSyncTemplates() { return run(({ repo, env, f }, a) => svc.syncTemplates(repo, a, env, f)) }
export async function waSubmitTemplate(d: DraftInput) { return run(({ repo, env, f }, a) => svc.submitTemplate(repo, a, env, f, d)) }
export async function waEditTemplate(id: string, d: DraftInput) { return run(({ repo, env, f }, a) => svc.editTemplateDraft(repo, a, env, f, str(id, 40), d)) }
export async function waDeleteTemplate(id: string, confirmName: string) { return run(({ repo, env, f }, a) => svc.removeTemplate(repo, a, env, f, str(id, 40), str(confirmName, 520))) }
export async function waAttachHeaderFile(id: string, fileId: string | null) { return run(({ repo }, a) => svc.attachHeaderFile(repo, a, str(id, 40), fileId ? str(fileId, 40) : null)) }
export async function waHeaderFiles() { return run(({ repo }, a) => svc.listFiles(repo, a, 'template_header')) }

// Campaigns
export async function waCampaigns() { return run(({ repo }, a) => svc.loadCampaigns(repo, a)) }
export async function waCreateCampaign(name: string) { return run(({ repo }, a) => svc.createCampaign(repo, a, str(name, 100))) }
export async function waCampaign(id: string, i?: { state?: string | null; offset?: number }) {
  return run(({ repo }, a) => svc.loadCampaign(repo, a, str(id, 40), { state: i?.state ? str(i.state, 12) : null, offset: Number(i?.offset) || 0 }))
}
export async function waUpdateDraft(id: string, p: { name?: string; templateId?: string | null; scheduledAt?: string | null; batchSize?: number; dailyMax?: number; budgetInr?: number | string | null }) {
  return run(({ repo }, a) => svc.updateDraft(repo, a, str(id, 40), p ?? {}))
}
export async function waAddRecipients(id: string, i: { listId?: string | null; phones?: string[]; source?: string }) {
  return run(({ repo }, a) => svc.addRecipients(repo, a, str(id, 40), { listId: i?.listId ? str(i.listId, 40) : null, phones: i?.phones, source: str(i?.source, 10) }))
}
export async function waRemoveRecipients(id: string, contactIds: string[]) { return run(({ repo }, a) => svc.removeRecipients(repo, a, str(id, 40), contactIds)) }
export async function waKeepEligible(id: string) { return run(({ repo }, a) => svc.keepEligibleOnly(repo, a, str(id, 40))) }
export async function waApprove(id: string, i: { seenEligible: number; seenTemplate: string; confirm: string }) {
  return run(({ repo }, a) => svc.approveCampaign(repo, a, str(id, 40), { seenEligible: Number(i?.seenEligible), seenTemplate: str(i?.seenTemplate, 40), confirm: str(i?.confirm, 10) }))
}
export async function waControl(id: string, action: string) { return run(({ repo }, a) => svc.controlCampaign(repo, a, str(id, 40), str(action, 12))) }
export async function waDuplicate(id: string) { return run(({ repo }, a) => svc.duplicateCampaign(repo, a, str(id, 40))) }

// Settings
export async function waCampaignSettings() { return run(({ repo }, a) => svc.loadCampaignSettings(repo, a)) }
export async function waUpdateCampaignSettings(i: { dailyBudget: number; monthlyBudget: number; defaultBatch: number; taxPct: number; dailyMax: number }) {
  return run(({ repo }, a) => svc.updateCampaignSettings(repo, a, i ?? ({} as never)))
}
export async function waSetCampaignsEnabled(on: boolean, confirm: string) { return run(({ repo }, a) => svc.setCampaignsEnabled(repo, a, on === true, str(confirm, 10))) }
export async function waMetaLimits() { return run(({ repo, env, f }, a) => svc.metaLimits(repo, a, env, f)) }
