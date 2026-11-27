'use client'
// One campaign: the draft wizard, then approval, then progress and results.
import { useState, type Dispatch, type SetStateAction } from 'react'
import { WaShell, useToast, fmt, inr, when, pct } from '../../WaShell'
import { Preview } from '../../templates/TemplatesClient'
import {
  waCampaign, waUpdateDraft, waAddRecipients, waRemoveRecipients, waKeepEligible, waApprove, waControl, waDuplicate,
} from '../../campaign-actions'
import { splitPasted, summarise } from '@/lib/whatsapp/phones'
import { SKIP_TEXT, STATUS_TEXT, pauseText } from '@/lib/whatsapp/campaign-text'
import type { CampaignView } from '@/lib/whatsapp/campaign-service'
import type { ListRow, TemplateRow } from '@/lib/whatsapp/campaign-repo'

const STATE_TEXT: Record<string, string> = { queued: 'Waiting', sending: 'Sending', accepted: 'Sent', failed: 'Failed', unknown: 'Unknown (not resent)', skipped: 'Skipped', cancelled: 'Cancelled' }
const toLocal = (iso: string | null) => {
  if (!iso) return ''
  const d = new Date(iso); const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`
}

export default function CampaignClient({ mode, initial, lists, templates }: { mode: 'mock' | 'live'; initial: CampaignView; lists: ListRow[]; templates: TemplateRow[] }) {
  const { show, node } = useToast()
  const [v, setV] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [filter, setFilter] = useState<string | null>(null)
  const [offset, setOffset] = useState(0)
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [paste, setPaste] = useState('')
  const [listId, setListId] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const c = v.campaign
  const draft = c.status === 'draft'
  const usable = templates.filter(t => t.category === 'MARKETING' && t.status === 'APPROVED')
  const p = v.preview
  const s = v.stats

  async function reload(state = filter, off = offset) {
    const r = await waCampaign(c.id, { state, offset: off })
    if (!r.ok) { show(r.error, true); return }
    setV(r.view); setFilter(state); setOffset(off); setPicked(new Set())
  }
  async function act<T extends { ok: boolean }>(f: () => Promise<T | { ok: false; error: string }>, okText: string) {
    setBusy(true)
    const r = await f()
    setBusy(false)
    if (!r.ok) { show((r as { error: string }).error, true); return null }
    show(okText); await reload(); return r as T
  }
  const save = (patch: Parameters<typeof waUpdateDraft>[1], text = 'Saved') => act(() => waUpdateDraft(c.id, patch), text)

  async function addPasted() {
    const sum = summarise(splitPasted(paste))
    if (!sum.numbers.length) { show('No valid numbers in the box.', true); return }
    const r = await act(() => waAddRecipients(c.id, { phones: sum.numbers, source: 'paste' }), `Added (${sum.invalid.length + sum.ambiguous.length} values not used)`)
    if (r) setPaste('')
  }

  const excluded = Object.entries(p.excluded ?? {}).filter(([, n]) => n > 0)
  const overBudget = c.budget_inr != null && p.cost_with_tax > c.budget_inr
  const done = s.sent + s.failed + s.unknown + s.skipped + s.cancelled
  const steps = {
    recipients: p.recipients_queued > 0 || s.total > 0,
    template: !!c.template_id,
    limits: c.budget_inr != null,
  }

  return (
    <WaShell active="campaigns" title={c.name} mode={mode}>
      <div className="btn-row wrap" style={{ marginTop: 0 }}>
        <a href="/leads/whatsapp/campaigns" className="small">All campaigns</a>
        <span className={`pill ${c.status === 'sending' ? 'pill-green' : c.status === 'paused' ? 'pill-red' : c.status === 'approved' ? 'pill-amber' : 'pill-muted'}`}>{STATUS_TEXT[c.status]}</span>
        {!v.settings.enabled && <span className="pill pill-amber">Campaign sending is off</span>}
        <span style={{ marginLeft: 'auto' }} className="btn-row">
          <button className="btn btn-ghost" disabled={busy} onClick={async () => { const r = await act(() => waDuplicate(c.id), 'Copy created'); if (r) window.location.href = `/leads/whatsapp/campaigns/${(r as unknown as { id: string }).id}` }}>Duplicate (skips people already reached)</button>
          <a className="btn btn-ghost" href={`/leads/whatsapp/export?kind=campaign&id=${c.id}`}>Export CSV</a>
        </span>
      </div>
      {c.paused_reason && c.status === 'paused' && <div className="notice notice-red">{pauseText(c.paused_reason)}</div>}

      {!draft && (
        <section className="card">
          <h2 className="big">Progress</h2>
          <div className="bar" title={`${done} of ${s.total} finished`}>
            <span style={{ width: `${s.total ? (s.sent / s.total) * 100 : 0}%`, background: 'var(--green)' }} />
            <span style={{ width: `${s.total ? ((s.failed + s.unknown) / s.total) * 100 : 0}%`, background: 'var(--red)' }} />
            <span style={{ width: `${s.total ? ((s.skipped + s.cancelled) / s.total) * 100 : 0}%`, background: 'var(--slate)' }} />
          </div>
          <div className="tiles">
            <div className="tile"><b>{fmt(s.total)}</b><span>Recipients</span></div>
            <div className="tile"><b>{fmt(s.queued)}</b><span>Waiting</span></div>
            <div className="tile"><b>{fmt(s.processing)}</b><span>Sending now</span></div>
            <div className="tile good"><b>{fmt(s.sent)}</b><span>Sent to Meta</span></div>
            <div className="tile good"><b>{fmt(s.delivered)}</b><span>Delivered ({pct(s.delivered, s.sent)})</span></div>
            <div className="tile good"><b>{fmt(s.read)}</b><span>Read ({pct(s.read, s.delivered)})</span></div>
            <div className="tile good"><b>{fmt(s.replies)}</b><span>Replies ({pct(s.replies, s.delivered)})</span></div>
            <div className={`tile ${s.failed ? 'badt' : ''}`}><b>{fmt(s.failed)}</b><span>Failed</span></div>
            <div className={`tile ${s.unknown ? 'warn' : ''}`}><b>{fmt(s.unknown)}</b><span>Unknown (never resent)</span></div>
            <div className="tile"><b>{fmt(s.skipped)}</b><span>Skipped at send time</span></div>
            <div className="tile"><b>{fmt(s.cancelled)}</b><span>Cancelled</span></div>
            <div className={`tile ${s.opt_outs ? 'warn' : ''}`}><b>{fmt(s.opt_outs)}</b><span>Opted out after</span></div>
          </div>
          <span className="small muted">
            Replies count only when the student answered the campaign message itself or pressed its button. {fmt(s.messaged_after_unconfirmed)} more wrote to you within 7 days without that link; they are not counted.
            {' '}Estimated spend: {inr(v.budgetLeft.unitCost == null ? null : s.sent * v.budgetLeft.unitCost)} at most, counting every sent message as delivered (Meta&apos;s invoice is final{s.meta_billable ? `, Meta reported ${fmt(s.meta_billable)} billable` : ''}).
          </span>
          <div className="btn-row wrap">
            {(c.status === 'approved' || c.status === 'sending') && <button className="btn btn-navy" disabled={busy} onClick={() => act(() => waControl(c.id, 'pause'), 'Paused')}>Pause</button>}
            {c.status === 'paused' && <button className="btn btn-orange" disabled={busy} onClick={() => { if (window.confirm('Resume sending this campaign?')) act(() => waControl(c.id, 'resume'), 'Resumed') }}>Resume</button>}
            {(c.status === 'approved' || c.status === 'paused') && <button className="btn btn-ghost" disabled={busy} onClick={() => act(() => waControl(c.id, 'unapprove'), 'Back to draft')}>Back to draft</button>}
            {!['completed', 'cancelled'].includes(c.status) && <button className="btn btn-ghost" disabled={busy} onClick={() => { if (window.confirm('Cancel? Messages not yet sent will never be sent. This cannot be undone.')) act(() => waControl(c.id, 'cancel'), 'Cancelled') }}>Cancel unsent</button>}
          </div>
        </section>
      )}

      {draft && (
        <>
          <section className={`card ${c.name ? 'done' : ''}`}>
            <h2 className="big"><span className="stepno">1</span>Name</h2>
            <NameEdit value={c.name} onSave={n => save({ name: n })} />
          </section>

          <section className={`card ${steps.recipients ? 'done' : ''}`}>
            <h2 className="big"><span className="stepno">2</span>Recipients</h2>
            <div className="split">
              <div className="form" style={{ borderTop: 0, paddingTop: 0 }}>
                <label className="field">Add everyone in a list
                  <select value={listId} onChange={e => setListId(e.target.value)}><option value="">Choose a list…</option>{lists.map(l => <option key={l.id} value={l.id}>{l.name} ({fmt(l.members)})</option>)}</select>
                </label>
                <button className="btn btn-ghost" disabled={!listId || busy} onClick={() => act(() => waAddRecipients(c.id, { listId }), 'List added')}>Add list</button>
              </div>
              <div className="form" style={{ borderTop: 0, paddingTop: 0 }}>
                <label className="field">Or paste numbers<textarea rows={3} value={paste} onChange={e => setPaste(e.target.value)} placeholder="One per line, or comma separated" /></label>
                <button className="btn btn-ghost" disabled={!paste.trim() || busy} onClick={addPasted}>Add numbers</button>
              </div>
            </div>
            <span className="small muted">Adding the same person twice has no effect. <a href="/leads/whatsapp/contacts">Upload an Excel file</a> to a list first for large imports.</span>
          </section>

          <section className={`card ${steps.recipients && p.eligible > 0 ? 'done' : ''}`}>
            <h2 className="big"><span className="stepno">3</span>Consent check</h2>
            <div className="tiles">
              <div className="tile"><b>{fmt(p.recipients_queued)}</b><span>Recipients</span></div>
              <div className="tile good"><b>{fmt(p.eligible)}</b><span>Eligible (consent recorded)</span></div>
              {excluded.map(([k, n]) => <div key={k} className="tile warn"><b>{fmt(n)}</b><span>{SKIP_TEXT[k] ?? k}: excluded</span></div>)}
            </div>
            {p.recipients_queued > 0 && p.eligible === 0 && (
              <div className="notice notice-amber">Nobody here has recorded marketing consent, so this campaign cannot be approved. Record consent on the <a href="/leads/whatsapp/lists">Lists</a> page once you hold the evidence. Unknown consent is treated as no consent.</div>
            )}
            <span className="small muted">Excluded people are never messaged. Eligibility is checked again at the moment each message is sent, so a STOP after approval still stops it.</span>
          </section>

          <section className={`card ${steps.recipients ? '' : 'locked'}`}>
            <h2 className="big"><span className="stepno">4</span>Select recipients</h2>
            <div className="btn-row wrap" style={{ marginTop: 0 }}>
              <button className="btn btn-navy" disabled={busy || excluded.length === 0} onClick={() => act(() => waKeepEligible(c.id), 'Only eligible recipients kept')}>Keep all eligible, remove the rest</button>
              <button className="btn btn-ghost" disabled={busy || !picked.size} onClick={() => act(() => waRemoveRecipients(c.id, Array.from(picked)), `${picked.size} removed`)}>Remove {picked.size || ''} selected</button>
            </div>
            <RecipientTable v={v} picked={picked} setPicked={setPicked} filter={filter} offset={offset} reload={reload} selectable />
          </section>

          <section className={`card ${steps.template ? 'done' : ''}`}>
            <h2 className="big"><span className="stepno">5</span>Template</h2>
            {usable.length === 0 ? (
              <div className="notice notice-amber">No approved Marketing template yet. <a href="/leads/whatsapp/templates">Create one or sync from Meta</a>; Meta usually reviews within a day.</div>
            ) : (
              <label className="field">Approved Marketing template
                <select value={c.template_id ?? ''} disabled={busy} onChange={e => save({ templateId: e.target.value || null }, 'Template chosen')}>
                  <option value="">Choose…</option>
                  {usable.map(t => <option key={t.id} value={t.id}>{t.name} ({t.language})</option>)}
                </select>
              </label>
            )}
          </section>

          <section className={`card ${steps.template ? '' : 'locked'}`}>
            <h2 className="big"><span className="stepno">6</span>Exactly what students receive</h2>
            {v.template ? <Preview header={v.template.header} body={v.template.body} footer={v.template.footer} buttons={v.template.buttons} /> : <span className="muted">Choose a template first.</span>}
          </section>

          <section className="card done">
            <h2 className="big"><span className="stepno">7</span>When</h2>
            <div className="formgrid">
              <label>Start
                <select value={c.scheduled_at ? 'later' : 'now'} onChange={e => save({ scheduledAt: e.target.value === 'now' ? null : new Date(Date.now() + 3600_000).toISOString() })}>
                  <option value="now">As soon as I approve (and sending is on)</option>
                  <option value="later">At a scheduled time</option>
                </select>
              </label>
              {c.scheduled_at && <label>Date and time (your clock)<input type="datetime-local" defaultValue={toLocal(c.scheduled_at)} onBlur={e => e.target.value && save({ scheduledAt: new Date(e.target.value).toISOString() }, 'Schedule saved')} /></label>}
            </div>
          </section>

          <section className={`card ${steps.limits ? 'done' : ''}`}>
            <h2 className="big"><span className="stepno">8</span>Batches and limits</h2>
            <Limits c={c} onSave={save} />
            <span className="small muted">One batch goes out every 5 minutes. Shared limits from Campaign settings also apply: {inr(v.settings.dailyBudget, 0)} a day, {inr(v.settings.monthlyBudget, 0)} a month, {fmt(v.settings.dailyMax)} people in 24 hours.</span>
          </section>

          <section className="card">
            <h2 className="big"><span className="stepno">9</span>Estimated cost</h2>
            {p.rate == null ? <div className="notice notice-red">The marketing rate is not set. Set it in the inbox Settings (rate card), then come back.</div> : (
              <div className="tblwrap"><table className="tbl"><tbody>
                <tr><td>Eligible recipients</td><td className="num">{fmt(p.eligible)}</td></tr>
                <tr><td>Category</td><td className="num">{p.category ?? 'choose a template'}</td></tr>
                <tr><td>Rate per delivered marketing message</td><td className="num">{inr(p.rate, 4)}</td></tr>
                <tr><td>Cost before tax</td><td className="num">{inr(p.cost_before_tax)}</td></tr>
                <tr><td>Tax ({p.tax_pct}%, assumed until confirmed)</td><td className="num">{inr(p.cost_with_tax - p.cost_before_tax)}</td></tr>
                <tr><td><b>Total estimate</b></td><td className="num"><b>{inr(p.cost_with_tax)}</b></td></tr>
                <tr><td>This campaign&apos;s budget</td><td className={`num ${overBudget ? 'bad' : ''}`}>{inr(c.budget_inr)}</td></tr>
                <tr><td>Left today / this month (all campaigns)</td><td className="num">{inr(v.budgetLeft.today)} / {inr(v.budgetLeft.month)}</td></tr>
              </tbody></table></div>
            )}
            <span className="small muted">An estimate: the maximum if every message is delivered. Meta bills per delivered message and its invoice is final. If today&apos;s budget runs out, sending continues the next day.</span>
          </section>

          <section className="card" style={{ borderColor: 'var(--amber)' }}>
            <h2 className="big"><span className="stepno">10</span>Your approval</h2>
            {!v.settings.enabled && <div className="notice notice-amber">Campaign sending is switched off. You can approve now; nothing goes out until you switch it on in Campaign settings.</div>}
            <ul className="plain">
              <li>{p.eligible > 0 ? '✓' : '✗'} {fmt(p.eligible)} eligible recipients with recorded consent</li>
              <li>{p.template_status === 'APPROVED' && p.category === 'MARKETING' ? '✓' : '✗'} Approved Marketing template</li>
              <li>{p.rate != null ? '✓' : '✗'} Marketing rate set</li>
              <li>{c.budget_inr != null && !overBudget ? '✓' : '✗'} Estimate within the campaign budget</li>
            </ul>
            <label className="check"><input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} /> I approve sending the template above to {fmt(p.eligible)} people, estimated at {inr(p.cost_with_tax)} including tax, in batches of {fmt(c.batch_size)}.</label>
            <label className="field">Type APPROVE<input value={confirm} onChange={e => setConfirm(e.target.value)} style={{ maxWidth: 200 }} autoComplete="off" /></label>
            <div className="btn-row">
              <button className="btn btn-orange" disabled={busy || !agree || confirm.trim() !== 'APPROVE' || !p.template_id
                || p.eligible === 0 || p.template_status !== 'APPROVED' || p.category !== 'MARKETING' || p.rate == null || c.budget_inr == null || overBudget}
                onClick={() => act(() => waApprove(c.id, { seenEligible: p.eligible, seenTemplate: p.template_id!, confirm }), 'Approved')}>Approve campaign</button>
            </div>
          </section>
        </>
      )}

      {!draft && (
        <section className="card">
          <h2 className="big">Recipients</h2>
          <RecipientTable v={v} picked={picked} setPicked={setPicked} filter={filter} offset={offset} reload={reload} />
          {c.approved_at && <span className="small muted">Approved {when(c.approved_at)} for {fmt((c.approval as { eligible?: number } | null)?.eligible ?? 0)} recipients at {inr((c.approval as { cost_with_tax?: number } | null)?.cost_with_tax ?? null)} estimated.{c.started_at ? ` Started ${when(c.started_at)}.` : ''}</span>}
        </section>
      )}
      {node}
    </WaShell>
  )
}

function NameEdit({ value, onSave }: { value: string; onSave: (n: string) => void }) {
  const [n, setN] = useState(value)
  return <div className="btn-row" style={{ marginTop: 0 }}><input value={n} maxLength={100} onChange={e => setN(e.target.value)} /><button className="btn btn-ghost" disabled={n.trim() === value || !n.trim()} onClick={() => onSave(n)}>Save</button></div>
}

function Limits({ c, onSave }: { c: CampaignView['campaign']; onSave: (p: { batchSize: number; dailyMax: number; budgetInr: string | null }) => void }) {
  const [batch, setBatch] = useState(String(c.batch_size))
  const [daily, setDaily] = useState(String(c.daily_max))
  const [budget, setBudget] = useState(c.budget_inr == null ? '' : String(c.budget_inr))
  return (
    <>
      <div className="formgrid">
        <label>Batch size (per 5 minutes, 1 to 200)<input inputMode="numeric" value={batch} onChange={e => setBatch(e.target.value)} /></label>
        <label>Most people per day for this campaign<input inputMode="numeric" value={daily} onChange={e => setDaily(e.target.value)} /></label>
        <label>Campaign budget, ₹ incl. tax (required)<input inputMode="decimal" value={budget} onChange={e => setBudget(e.target.value)} placeholder="e.g. 250" /></label>
      </div>
      <div className="btn-row"><button className="btn btn-ghost" onClick={() => onSave({ batchSize: Number(batch), dailyMax: Number(daily), budgetInr: budget.trim() === '' ? null : budget })}>Save limits</button></div>
    </>
  )
}

function RecipientTable({ v, picked, setPicked, filter, offset, reload, selectable }: {
  v: CampaignView; picked: Set<string>; setPicked: Dispatch<SetStateAction<Set<string>>>; filter: string | null; offset: number
  reload: (state: string | null, off: number) => void; selectable?: boolean
}) {
  const rows = v.recipients.rows
  const all = rows.length > 0 && rows.filter(r => r.state === 'queued').every(r => picked.has(r.contact_id))
  return (
    <>
      <div className="seg" style={{ alignSelf: 'flex-start' }}>
        {[null, 'queued', 'accepted', 'failed', 'unknown', 'skipped', 'cancelled'].map(s => (
          <button key={s ?? 'all'} className={filter === s ? 'on' : ''} onClick={() => reload(s, 0)}>{s ? STATE_TEXT[s] : 'All'}</button>
        ))}
      </div>
      <div className="tblwrap">
        <table className="tbl">
          <thead><tr>
            {selectable && <th><input type="checkbox" aria-label="Select all on this page" checked={all} onChange={e => setPicked(e.target.checked ? new Set(rows.filter(r => r.state === 'queued').map(r => r.contact_id)) : new Set())} /></th>}
            <th>Phone</th><th>Consent now</th><th>State</th><th>Meta status</th><th>Sent</th>
          </tr></thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.id} className={picked.has(r.contact_id) ? 'sel' : ''}>
                {selectable && <td className="pick">{r.state === 'queued' && <label><input type="checkbox" aria-label={`Select ${r.phone}`} checked={picked.has(r.contact_id)} onChange={e => { const on = e.target.checked; setPicked(prev => { const s = new Set(prev); if (on) s.add(r.contact_id); else s.delete(r.contact_id); return s }) }} /></label>}</td>}
                <td className="num">{r.phone}</td>
                <td>{r.opted_out ? <span className="bad">Opted out</span> : r.marketing === 'yes' ? <span className="ok">Yes</span> : r.marketing === 'no' ? <span className="bad">No</span> : <span className="muted">Unknown</span>}</td>
                <td>{STATE_TEXT[r.state] ?? r.state}{r.skip_reason ? `: ${SKIP_TEXT[r.skip_reason] ?? r.skip_reason}` : ''}{r.error_code ? ` (error ${r.error_code})` : ''}</td>
                <td>{r.message_status ?? ''}</td>
                <td className="small muted">{when(r.claimed_at)}</td>
              </tr>
            ))}
            {!rows.length && <tr><td colSpan={selectable ? 6 : 5} className="muted">No recipients{filter ? ' in this state' : ''}.</td></tr>}
          </tbody>
        </table>
      </div>
      <div className="btn-row">
        <button className="btn btn-ghost" disabled={offset === 0} onClick={() => reload(filter, Math.max(0, offset - 100))}>Previous</button>
        <span className="small muted">{v.recipients.total ? `${offset + 1} to ${Math.min(offset + 100, v.recipients.total)} of ${fmt(v.recipients.total)}` : ''}</span>
        <button className="btn btn-ghost" disabled={offset + 100 >= v.recipients.total} onClick={() => reload(filter, offset + 100)}>Next</button>
      </div>
    </>
  )
}
