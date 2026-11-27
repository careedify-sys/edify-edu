'use client'
// Campaign settings: budgets, batch default, tax, Meta's 24-hour limit, the
// campaign on/off switch and a read-only check of Meta's limits. Separate from
// the ₹500 inbox cap, which stays in the inbox Settings.
import { useState } from 'react'
import { WaShell, useToast, inr } from '../WaShell'
import { waUpdateCampaignSettings, waSetCampaignsEnabled, waMetaLimits, waCampaignSettings } from '../campaign-actions'
import type { CampaignSettings } from '@/lib/whatsapp/campaign-service'

export default function SettingsClient({ mode, initial, migrationReady, error }: { mode: 'mock' | 'live'; initial: CampaignSettings | null; migrationReady: boolean; error: string | null }) {
  const { show, node } = useToast()
  const [s, setS] = useState(initial)
  const [f, setF] = useState({
    dailyBudget: String(initial?.dailyBudget ?? ''), monthlyBudget: String(initial?.monthlyBudget ?? ''),
    defaultBatch: String(initial?.defaultBatch ?? 50), taxPct: String(initial?.taxPct ?? 18), dailyMax: String(initial?.dailyMax ?? 250),
  })
  const [confirm, setConfirm] = useState('')
  const [limits, setLimits] = useState<{ quality: string | null; messagingLimit: string | null; error: string | null } | null>(null)
  const [busy, setBusy] = useState(false)

  async function reload() { const r = await waCampaignSettings(); if (r.ok) setS(r.settings) }
  async function save() {
    setBusy(true)
    const r = await waUpdateCampaignSettings({ dailyBudget: Number(f.dailyBudget), monthlyBudget: Number(f.monthlyBudget), defaultBatch: Number(f.defaultBatch), taxPct: Number(f.taxPct), dailyMax: Number(f.dailyMax) })
    setBusy(false)
    if (!r.ok) { show(r.error, true); return }
    show('Saved'); reload()
  }
  async function toggle(on: boolean) {
    if (!on && !window.confirm('Switch campaign sending off? Running campaigns are paused and need Resume later.')) return
    setBusy(true)
    const r = await waSetCampaignsEnabled(on, confirm)
    setBusy(false)
    if (!r.ok) { show(r.error, true); return }
    setConfirm(''); show(on ? 'Campaign sending is on' : 'Campaign sending is off; running campaigns paused'); reload()
  }
  async function check() {
    setBusy(true)
    const r = await waMetaLimits()
    setBusy(false)
    if (!r.ok) { show(r.error, true); return }
    setLimits(r.limits)
  }
  const field = (k: keyof typeof f, label: string, hint?: string) => (
    <label>{label}<input inputMode="decimal" value={f[k]} onChange={e => setF({ ...f, [k]: e.target.value })} />{hint && <span className="small muted" style={{ fontWeight: 400 }}>{hint}</span>}</label>
  )

  return (
    <WaShell active="settings" title="Campaign settings" mode={mode} error={error ?? (!migrationReady ? 'The campaign database migration (Phase 3) has not been run, so these settings are missing and nothing can send.' : null)}>
      <section className="card" style={{ borderColor: s?.enabled ? 'var(--green)' : 'var(--line)' }}>
        <h2 className="big">Campaign sending: {s?.enabled ? <span className="ok">ON</span> : <span className="muted">OFF</span>}</h2>
        <span className="lead small">
          Off by default. When on, campaigns you approved send in batches every 5 minutes, within the budgets below. Each campaign still needs your approval. The inbox and its ₹500 cap are not affected.
        </span>
        {s?.enabled ? (
          <div className="btn-row"><button className="btn btn-navy" disabled={busy} onClick={() => toggle(false)}>Switch off and pause all campaigns</button></div>
        ) : (
          <div className="btn-row wrap">
            <input style={{ maxWidth: 160 }} value={confirm} onChange={e => setConfirm(e.target.value)} placeholder="Type ENABLE" autoComplete="off" />
            <button className="btn btn-orange" disabled={busy || confirm.trim() !== 'ENABLE'} onClick={() => toggle(true)}>Switch campaign sending on</button>
          </div>
        )}
      </section>

      <section className="card">
        <h2 className="big">Budgets and limits</h2>
        <div className="formgrid">
          {field('dailyBudget', 'Daily campaign budget, ₹', 'All campaigns together, tax included')}
          {field('monthlyBudget', 'Monthly campaign budget, ₹', 'All campaigns together, tax included')}
          {field('defaultBatch', 'Default batch size', 'Messages per 5-minute run for new campaigns (1 to 200)')}
          {field('dailyMax', 'Meta 24-hour limit (people)', 'From WhatsApp Manager; never set above your tier')}
          {field('taxPct', 'Tax on Meta charges, %', 'GST assumed 18% until you confirm from an invoice')}
        </div>
        <div className="btn-row"><button className="btn btn-orange" disabled={busy} onClick={save}>Save</button></div>
        {s && (
          <span className="small muted">
            Marketing rate: {s.marketingRate == null ? 'not set (set it in the inbox Settings rate card)' : `${inr(s.marketingRate, 4)} per delivered message${s.rateVerifiedOn ? `, checked ${s.rateVerifiedOn}` : ''}`}.
            {s.marketingRate != null && s.dailyBudget != null && ` The daily budget covers about ${Math.floor(s.dailyBudget / (s.marketingRate * (1 + s.taxPct / 100)))} messages.`}
          </span>
        )}
      </section>

      <section className="card">
        <h2 className="big">Meta account check</h2>
        <span className="small muted">Read-only. Asks Meta for the phone number&apos;s quality rating and messaging limit. Sends nothing.</span>
        <div className="btn-row"><button className="btn btn-ghost" disabled={busy} onClick={check}>Check now</button></div>
        {limits && (
          <div className="tblwrap"><table className="tbl"><tbody>
            <tr><td>Quality rating</td><td>{limits.quality ?? 'not returned'}{(limits.quality === 'RED' || limits.quality === 'FLAGGED') && <span className="bad"> (campaigns pause automatically)</span>}</td></tr>
            <tr><td>Messaging limit</td><td>{limits.messagingLimit ?? 'not returned'}</td></tr>
            {limits.error && <tr><td colSpan={2} className="bad">{limits.error}</td></tr>}
          </tbody></table></div>
        )}
      </section>
      {node}
    </WaShell>
  )
}
