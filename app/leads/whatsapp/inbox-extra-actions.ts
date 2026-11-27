'use server'
// Server actions for the inbox additions: thread facts, template sends,
// a new chat by number, and image or PDF sends. Same session rule as
// actions.ts. Mock mode (WA_INBOX_MOCK=1, never in production) shares the
// inbox and campaign mocks and a fake Meta.
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { currentActor } from '@/lib/whatsapp/admin-session'
import { supabaseInboxRepo } from '@/lib/whatsapp/inbox-repo'
import { mockInboxRepo } from '@/lib/whatsapp/inbox-mock'
import { supabaseCampaignRepo, type CampaignRepo } from '@/lib/whatsapp/campaign-repo'
import { mockCampaignRepo } from '@/lib/whatsapp/campaign-mock'
import { readGraphEnv } from '@/lib/whatsapp/graph'
import * as x from '@/lib/whatsapp/inbox-extras'
import { mockAutoAdminRepo, type AutoAdminRepo } from '@/lib/whatsapp/auto-admin'

type Fail = { ok: false; error: string }
const g = globalThis as unknown as { __waMock?: ReturnType<typeof mockInboxRepo>; __waCampaignMock?: CampaignRepo; __waExtrasMock?: x.ExtrasStore; __waAutoMock?: AutoAdminRepo }
const mock = () => process.env.WA_INBOX_MOCK === '1' && process.env.NODE_ENV !== 'production'

const fakeMeta = (async (url: string) => {
  const u = String(url)
  if (u.endsWith('/media')) return { status: 200, json: async () => ({ id: `mockmedia_${Date.now()}` }) }
  return { status: 200, json: async () => ({ messages: [{ id: `wamid.mock.${Date.now()}` }] }) }
}) as unknown as typeof fetch

function ctx() {
  if (mock()) {
    const inbox = (g.__waMock ??= mockInboxRepo())
    const crepo = (g.__waCampaignMock ??= mockCampaignRepo())
    // Shares the auto-reply mock's per-chat switch, as live shares wa_conversations.auto_off.
    const auto = (g.__waAutoMock ??= mockAutoAdminRepo()) as ReturnType<typeof mockAutoAdminRepo>
    const store = (g.__waExtrasMock ??= x.mockExtrasStore(inbox, auto.state.off, async id => (await crepo.templates()).find(t => t.id === id)?.category ?? null))
    return { store, crepo, inbox, env: { token: 'mock', phoneNumberId: 'mock', wabaId: 'mock', appId: 'mock', appSecret: 'mock', version: 'v26.0' }, f: fakeMeta }
  }
  const sb = createSupabaseServiceClient()
  return { store: x.supabaseExtrasStore(sb), crepo: supabaseCampaignRepo(sb), inbox: supabaseInboxRepo(sb), env: readGraphEnv(), f: fetch }
}

async function run<T>(fn: (c: ReturnType<typeof ctx>, a: NonNullable<Awaited<ReturnType<typeof currentActor>>>) => Promise<T>): Promise<T | Fail> {
  const actor = await currentActor()
  if (!actor) return { ok: false, error: 'Your session has ended. Sign in again.' }
  try { return await fn(ctx(), actor) } catch (e) {
    const code = (e as { code?: string })?.code
    if (code === 'PGRST202' || code === 'PGRST205' || code === '42P01' || code === '42883' || code === '42703') return { ok: false, error: 'The Phase 4 database migration has not been run yet.' }
    console.warn('[wa-inbox-extras] action failed', code ?? (e as Error)?.name ?? 'error')
    return { ok: false, error: `Something went wrong${code ? ` (${code})` : ''}. Check the thread before trying again.` }
  }
}
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')

export async function inboxExtras(convId: string) { return run((c, a) => x.threadExtras(c.store, c.crepo, a, str(convId, 40))) }
export async function inboxTemplates() { return run(async (c) => ({ ok: true as const, templates: x.usableTemplates(await c.crepo.templates()) })) }
export async function inboxSendTemplate(i: { convId: string; templateId: string; clientRef: string }) {
  return run((c, a) => x.sendTemplateMessage(c, a, { convId: str(i?.convId, 40), templateId: str(i?.templateId, 40), clientRef: str(i?.clientRef, 40) }))
}
export async function inboxStartChat(i: { phone: string; templateId: string; clientRef: string; confirmOptIn: boolean }) {
  return run((c, a) => x.startChat(c, a, { phone: str(i?.phone, 30), templateId: str(i?.templateId, 40), clientRef: str(i?.clientRef, 40), confirmOptIn: i?.confirmOptIn === true }))
}
export async function inboxSendFile(i: { convId: string; fileId: string; caption: string; clientRef: string }) {
  return run((c, a) => x.sendFile(c, a, { convId: str(i?.convId, 40), fileId: str(i?.fileId, 40), caption: str(i?.caption, 1024), clientRef: str(i?.clientRef, 40) }))
}
