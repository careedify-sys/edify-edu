'use server'
// Server actions for the auto-reply controls (/leads/whatsapp/automation).
// Same rules as the other WhatsApp actions: the session is checked here and
// the service checks can(actor, action).
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { currentActor } from '@/lib/whatsapp/admin-session'
import * as svc from '@/lib/whatsapp/auto-admin'

type Fail = { ok: false; error: string }
const g = globalThis as unknown as { __waAutoMock?: svc.AutoAdminRepo }
const mock = () => process.env.WA_INBOX_MOCK === '1' && process.env.NODE_ENV !== 'production'
const repo = () => (mock() ? (g.__waAutoMock ??= svc.mockAutoAdminRepo()) : svc.supabaseAutoAdminRepo(createSupabaseServiceClient()))

async function run<T>(fn: (r: svc.AutoAdminRepo, a: NonNullable<Awaited<ReturnType<typeof currentActor>>>) => Promise<T>): Promise<T | Fail> {
  const actor = await currentActor()
  if (!actor) return { ok: false, error: 'Your session has ended. Sign in again.' }
  try { return await fn(repo(), actor) } catch (e) {
    const code = (e as { code?: string })?.code
    if (code === 'PGRST205' || code === '42P01' || code === '42703') return { ok: false, error: 'The referral database migration (Phase 4) has not been run yet.' }
    console.warn('[wa-auto] action failed', code ?? 'error')
    return { ok: false, error: `Something went wrong${code ? ` (${code})` : ''}. Try again.` }
  }
}
const str = (v: unknown, max: number) => (typeof v === 'string' ? v.slice(0, max) : '')

export async function autoLoad() { return run((r, a) => svc.loadAutomation(r, a)) }
export async function autoSetEnabled(on: boolean, confirm: string) { return run((r, a) => svc.setAutomationEnabled(r, a, on === true, str(confirm, 5))) }
export async function autoSaveRule(key: string, i: { enabled: boolean; keywords: string; reply: string }) {
  return run((r, a) => svc.saveAutoRule(r, a, str(key, 20), { enabled: i?.enabled === true, keywords: str(i?.keywords, 2000), reply: str(i?.reply, 1100) }))
}
export async function autoSetConversation(convId: string, off: boolean) { return run((r, a) => svc.setConversationAuto(r, a, str(convId, 40), off === true)) }
