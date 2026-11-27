// Campaign sender, run by the existing WhatsApp sweep (every 5 minutes).
// Server-only. No new cron, no long function: each run sends at most one
// batch per campaign, for at most 3 campaigns, inside a time budget.
//
// Order of checks, every run:
//  1. campaigns switched on (the database checks again inside the claim);
//  2. Meta configured, and the phone number's quality is not RED or FLAGGED
//     (either pauses every campaign); unreadable quality means no send;
//  3. the template is still APPROVED at Meta (else the claim pauses it);
//  4. the locked claim: eligibility per recipient, budgets, Meta's limit;
//  5. one HTTP call per message, never retried. A timeout is "unknown".
// Claimed rows not sent before the time budget runs out are released, which
// is safe because no request was made for them.
import type { CampaignRepo } from './campaign-repo'
import { sendMessage, type GraphEnv } from './graph'
import { accountLimits, templateStatus } from './graph-templates'
import { sendPlan, templatePayload } from './template-rules'
import { ensureMetaMediaId } from './template-service'
import { readCampaignSettings } from './campaign-service'

// Same list as wa_campaign_stop_codes() in the migration.
export const STOP_CODES = new Set([190, 4, 80007, 130429, 368, 131031, 131042, 131048, 132000, 132001, 132012, 132015, 132016])
const PARALLEL = 5
const SEND_TIMEOUT_MS = 8_000

export type WorkerReport = {
  state: 'off' | 'not_configured' | 'idle' | 'quality_paused' | 'meta_unreadable' | 'ran'
  campaigns: number; sent: number; failed: number; unknown: number; released: number; blocked: string[]; errors: number
}

export async function runCampaignWorker(repo: CampaignRepo, env: GraphEnv, f: typeof fetch, deadline: number, now = () => Date.now()): Promise<WorkerReport> {
  const rep: WorkerReport = { state: 'idle', campaigns: 0, sent: 0, failed: 0, unknown: 0, released: 0, blocked: [], errors: 0 }
  const s = readCampaignSettings(await repo.getSettings())
  if (!s.enabled) return { ...rep, state: 'off' }
  if (!env.token || !env.phoneNumberId) return { ...rep, state: 'not_configured' }
  const due = await repo.dueCampaigns(new Date(now()).toISOString(), 3)
  if (!due.length) return rep

  const limits = await accountLimits(env, f)
  if (limits.quality === 'RED' || limits.quality === 'FLAGGED') {
    await repo.pauseAll(`quality_${limits.quality.toLowerCase()}`)
    return { ...rep, state: 'quality_paused' }
  }
  if (!limits.quality) return { ...rep, state: 'meta_unreadable' }

  rep.state = 'ran'
  for (const c of due) {
    if (now() > deadline - SEND_TIMEOUT_MS) break
    rep.campaigns++
    const tpl = c.template_id ? await repo.getTemplate(c.template_id) : null
    if (!tpl?.meta_id) { rep.blocked.push('template_missing'); continue }
    const plan = sendPlan(tpl.components, !!tpl.header_file_id)
    if (!plan.ok) { rep.blocked.push('template_needs_parameters'); continue }
    const live = await templateStatus(env, tpl.meta_id, f)
    if (!live) { rep.blocked.push('template_unreadable'); continue }
    if (live.status !== tpl.status || (live.category && live.category !== tpl.category)) {
      await repo.setTemplateStatus(tpl.id, live.status, live.category || null)
    }
    // An image or PDF header goes out by Meta media id, uploaded once and
    // reused for 29 days. Done before the claim, so a failed upload claims
    // nobody.
    let payload: Record<string, unknown>
    try {
      let mediaId: string | null = null, fileName: string | null = null
      if (plan.plan.header) {
        const m = await ensureMetaMediaId(repo, env, f, tpl.header_file_id!, now())
        if (!m.ok) { rep.blocked.push('header_upload_failed'); continue }
        mediaId = m.mediaId; fileName = m.file.file_name
      }
      payload = templatePayload(tpl.name, tpl.language, plan.plan, { mediaId, fileName, refToken: c.ref_token })
    } catch { rep.blocked.push('template_needs_parameters'); continue }
    const rows = await repo.claim(c.id, c.batch_size, env.phoneNumberId)
    if (rows.length && rows[0].blocked) { rep.blocked.push(rows[0].blocked); continue }

    const pending = rows.filter(r => r.client_ref && r.phone)
    const unsent: string[] = []
    let stop = false
    try {
      for (let i = 0; i < pending.length; i += PARALLEL) {
        const group = pending.slice(i, i + PARALLEL)
        if (stop || now() > deadline - SEND_TIMEOUT_MS) { unsent.push(...pending.slice(i).map(r => r.client_ref!)); break }
        await Promise.all(group.map(async r => {
          const res = await sendMessage(env, { phoneDigits: r.phone!.replace(/^\+/, '') }, payload, f, SEND_TIMEOUT_MS)
          try {
            if (res.state === 'accepted') { await repo.finish(r.client_ref!, res.wamid, 'accepted', null, null); rep.sent++ }
            else if (res.state === 'failed') {
              await repo.finish(r.client_ref!, null, 'failed', res.code, res.title); rep.failed++
              if (res.code != null && STOP_CODES.has(res.code)) stop = true
            } else { await repo.finish(r.client_ref!, null, 'unknown', null, res.reason); rep.unknown++ }
          } catch {
            // The send happened but recording it failed. Leave the row as
            // 'sending': the next claim marks it unknown after 10 minutes and
            // it is never resent.
            rep.errors++
          }
        }))
      }
    } finally {
      if (unsent.length) rep.released += await repo.release(unsent)
    }
  }
  return rep
}
