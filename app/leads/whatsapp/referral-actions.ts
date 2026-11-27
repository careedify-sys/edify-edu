'use server'
// Server actions for the referrals dashboard (/leads/whatsapp/referrals).
// Same rules as campaign-actions.ts: middleware guards /leads, each action
// resolves the actor from the session cookie, the service checks
// can(actor, action), and errors never carry database text.
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { currentActor } from '@/lib/whatsapp/admin-session'
import { supabaseReferralRepo, type ReferralRepo } from '@/lib/referrals/referral-repo'
import { mockReferralRepo } from '@/lib/referrals/referral-mock'
import { referMockMode, referMockStore } from '@/lib/referrals/refer-store'
import * as svc from '@/lib/referrals/referral-service'
import type { ReferralFilter, RewardRule, Stage } from '@/lib/referrals/referral-types'

type Fail = { ok: false; error: string }
const g = globalThis as unknown as { __referralRepoMock?: ReferralRepo }

function repo(): ReferralRepo {
  if (referMockMode()) return (g.__referralRepoMock ??= mockReferralRepo(referMockStore()))
  return supabaseReferralRepo(createSupabaseServiceClient())
}

function failure(e: unknown): Fail {
  const code = (e as { code?: string })?.code
  if (code === 'PGRST202' || code === 'PGRST205' || code === '42P01' || code === '42883' || code === '42703') {
    return { ok: false, error: 'The referral database migration (Phase 4) has not been run yet.' }
  }
  if (code === '23505') return { ok: false, error: 'This student already has an approved or paid reward on another referral.' }
  if (code === '23514') return { ok: false, error: 'That change breaks a reward rule (date, amount or review). Check the fields.' }
  console.warn('[referrals] action failed', code ?? (e as Error)?.name ?? 'error')
  return { ok: false, error: `Something went wrong${code ? ` (${code})` : ''}. Try again.` }
}

async function run<T>(fn: (r: ReferralRepo, actor: NonNullable<Awaited<ReturnType<typeof currentActor>>>) => Promise<T>): Promise<T | Fail> {
  const actor = await currentActor()
  if (!actor) return { ok: false, error: 'Your session has ended. Sign in again.' }
  try { return await fn(repo(), actor) } catch (e) { return failure(e) }
}

const str = (v: unknown, max = 200) => (typeof v === 'string' ? v.slice(0, max) : '')

export async function refList(f: ReferralFilter) { return run((r, a) => svc.listReferrals(r, a, f ?? {})) }
export async function refDetail(id: string) { return run((r, a) => svc.referralDetail(r, a, str(id, 40))) }
export async function refSetStage(id: string, stage: Stage, reason?: string) { return run((r, a) => svc.setStage(r, a, str(id, 40), str(stage, 30) as Stage, str(reason, 300))) }
export async function refConfirmAdmission(id: string, date: string, uni: string) { return run((r, a) => svc.confirmAdmission(r, a, str(id, 40), str(date, 10), str(uni, 120))) }
export async function refApprove(id: string, amount: number, ruleId: string | null) { return run((r, a) => svc.approveReward(r, a, str(id, 40), Number(amount), ruleId ? str(ruleId, 40) : null)) }
export async function refUndoApproval(id: string, reason: string) { return run((r, a) => svc.undoApproval(r, a, str(id, 40), str(reason, 300))) }
export async function refMarkPaid(id: string, paidOn: string, ref: string) { return run((r, a) => svc.markPaid(r, a, str(id, 40), str(paidOn, 10), str(ref, 100))) }
export async function refResolveReview(id: string, note: string) { return run((r, a) => svc.resolveReview(r, a, str(id, 40), str(note, 500))) }
export async function refFollowUp(id: string, date: string | null) { return run((r, a) => svc.setFollowUp(r, a, str(id, 40), date ? str(date, 10) : null)) }
export async function refNote(id: string, kind: 'note' | 'call', body: string) { return run((r, a) => svc.addNote(r, a, str(id, 40), kind === 'call' ? 'call' : 'note', str(body, 2000))) }
export async function refSaveRule(rule: Partial<RewardRule>) { return run((r, a) => svc.saveRewardRule(r, a, rule)) }
export async function refFunnels(ids: string[]) { return run((r, a) => svc.campaignFunnels(r, a, Array.isArray(ids) ? ids.map(x => str(x, 40)) : [])) }
