'use client'
// Referrals dashboard: list, filters, detail drawer with stage, admission,
// reward approval and payment record, notes and the reward rules (owner).
import { useCallback, useEffect, useState } from 'react'
import { WaShell, useToast, fmt, when } from '../WaShell'
import {
  refList, refDetail, refSetStage, refConfirmAdmission, refApprove, refUndoApproval,
  refMarkPaid, refResolveReview, refFollowUp, refNote, refSaveRule,
} from '../referral-actions'
import { STAGES, STAGE_LABEL, FREE_STAGES, rewardStatus, type ReferralFilter, type ReferralRow, type RewardRule, type Stage, type ActivityRow } from '@/lib/referrals/referral-types'
import { FLAG_TEXT, type UniOption } from '@/lib/referrals/refer-rules'

type ListData = Extract<Awaited<ReturnType<typeof refList>>, { ok: true }>
type Detail = Extract<Awaited<ReturnType<typeof refDetail>>, { ok: true }>

const STAGE_PILL: Record<Stage, string> = {
  new: 'pill-amber', contact_attempted: 'pill-muted', contacted: 'pill-muted', counselling: 'pill-muted', follow_up: 'pill-amber',
  application_started: 'pill-muted', admission_confirmed: 'pill-green', reward_approved: 'pill-green', reward_paid: 'pill-green', closed: 'pill-muted',
}
const rupees = (n: number | null | undefined) => (n == null ? '' : `₹${n.toLocaleString('en-IN')}`)
const ATTR: Record<string, string> = { link: 'from the link', phone_match: 'matched by phone', none: 'no campaign' }

export default function ReferralsClient({ mode, initial, error, owner, universities, programmes }: {
  mode: 'mock' | 'live'; initial: ListData | null; error: string | null; owner: boolean; universities: UniOption[]; programmes: string[]
}) {
  const { show, node } = useToast()
  const [data, setData] = useState<ListData | null>(initial)
  const [f, setF] = useState<ReferralFilter>({ stage: 'open' })
  const [openId, setOpenId] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)

  const reload = useCallback(async (filter: ReferralFilter) => {
    const r = await refList(filter)
    if (r.ok) setData(r); else show(r.error, true)
  }, [show])

  const first = useState({ v: true })[0]
  useEffect(() => {
    if (first.v) { first.v = false; return }
    const t = window.setTimeout(() => reload(f), 250)
    return () => window.clearTimeout(t)
  }, [f, reload, first])

  const chip = (label: string, patch: ReferralFilter, n?: number) => {
    const on = Object.entries(patch).every(([k, v]) => (f as Record<string, unknown>)[k] === v)
    return (
      <button className={`chipbtn ${on ? 'on' : ''}`} onClick={() => setF(on ? { stage: 'open' } : { ...patch })}>
        {label}{n != null ? ` (${n})` : ''}
      </button>
    )
  }
  const c = data?.counts
  const exportHref = `/leads/whatsapp/referrals/export?${new URLSearchParams(Object.entries(f).filter(([, v]) => v).map(([k, v]) => [k, String(v)])).toString()}`

  return (
    <WaShell active="referrals" title="Referrals" mode={mode} error={error}>
      {node}
      <section className="card">
        <div className="stats" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))' }}>
          <div><span className="stat">{fmt(c?.total)}</span><span className="muted small">referrals</span></div>
          <div><span className="stat">{fmt(c?.needsReview)}</span><span className="muted small">need review</span></div>
          <div><span className="stat">{fmt(c?.followUpDue)}</span><span className="muted small">follow-ups due</span></div>
          <div><span className="stat">{fmt(c?.pending)}</span><span className="muted small">rewards due (within 7 days)</span></div>
          <div><span className="stat" style={c?.overdue ? { color: '#ef4444' } : undefined}>{fmt(c?.overdue)}</span><span className="muted small">rewards overdue</span></div>
          <div><span className="stat">{rupees(c?.pendingInr ?? 0)}</span><span className="muted small">approved, not paid</span></div>
          <div><span className="stat">{rupees(c?.paidInr ?? 0)}</span><span className="muted small">paid in total</span></div>
        </div>
      </section>

      <section className="card">
        <div className="btn-row" style={{ flexWrap: 'wrap', gap: 8 }}>
          <input className="field" style={{ minWidth: 220, width: 'auto', flex: 1 }} placeholder="Search ID, name or phone" value={f.q ?? ''} onChange={e => setF(p => ({ ...p, q: e.target.value }))} aria-label="Search referrals" />
          <select className="field" style={{ width: 'auto' }} value={f.stage ?? ''} onChange={e => setF(p => ({ ...p, stage: e.target.value as ReferralFilter['stage'] }))} aria-label="Stage">
            <option value="open">All open</option>
            <option value="">All stages</option>
            {STAGES.map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
          </select>
          <select className="field" style={{ width: 'auto' }} value={f.campaignId ?? ''} onChange={e => setF(p => ({ ...p, campaignId: e.target.value || undefined }))} aria-label="Campaign">
            <option value="">Any campaign</option>
            {(data?.campaigns ?? []).map(x => <option key={x.id} value={x.id}>{x.name}</option>)}
          </select>
          {owner && <a className="btn btn-ghost" href={exportHref}>Export CSV</a>}
        </div>
        <div className="btn-row" style={{ flexWrap: 'wrap', gap: 6, marginTop: 8 }}>
          {chip('Needs review', { review: 'needs_review' }, c?.needsReview)}
          {chip('Follow-up due', { due: 'followup_due' }, c?.followUpDue)}
          {chip('Reward pending', { due: 'pending' }, c?.pending)}
          {chip('Reward overdue', { due: 'overdue' }, c?.overdue)}
        </div>
        <div className="tblwrap" style={{ marginTop: 10 }}>
          <table className="tbl">
            <thead><tr><th>ID</th><th>Submitted</th><th>Friend</th><th>Referred by</th><th>Programme</th><th>Stage</th><th>Reward</th><th>Follow-up</th></tr></thead>
            <tbody>
              {(data?.rows ?? []).length === 0 && <tr><td colSpan={8} className="muted">No referrals match.</td></tr>}
              {(data?.rows ?? []).map(r => {
                const rs = rewardStatus(r, data!.today)
                return (
                  <tr key={r.id} onClick={() => setOpenId(r.id)} style={{ cursor: 'pointer' }}>
                    <td className="mono"><button className="linklike" onClick={e => { e.stopPropagation(); setOpenId(r.id) }}>{r.ref_code}</button></td>
                    <td>{when(r.created_at)}</td>
                    <td>{r.referred_name}{r.review_state === 'needs_review' && <> <span className="chip chip-amber">review</span></>}</td>
                    <td>{r.referrer_name}</td>
                    <td>{r.programme ?? ''}</td>
                    <td><span className={`pill ${STAGE_PILL[r.stage]}`}>{STAGE_LABEL[r.stage]}</span></td>
                    <td>{rs === 'overdue' ? <span className="chip chip-red">overdue, due {r.reward_due_on}</span>
                      : rs === 'pending' ? <span className="chip chip-amber">due {r.reward_due_on}</span>
                      : rs === 'paid' ? <span className="chip chip-green">paid {rupees(r.reward_amount_inr)}</span> : ''}</td>
                    <td>{r.next_follow_up && r.next_follow_up <= data!.today && r.stage !== 'reward_paid' && r.stage !== 'closed'
                      ? <span className="chip chip-red">{r.next_follow_up}</span> : r.next_follow_up ?? ''}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="small muted" style={{ marginTop: 6 }}>Showing up to 500. Narrow with search or filters.</p>
      </section>

      {owner && <RulesCard rules={data?.rules ?? []} programmes={programmes} universities={universities} busy={busy} setBusy={setBusy}
        onSaved={() => reload(f)} show={show} />}

      {openId && <DetailDrawer id={openId} owner={owner} onClose={() => setOpenId(null)} onChanged={() => reload(f)} show={show} />}
    </WaShell>
  )
}

function DetailDrawer({ id, owner, onClose, onChanged, show }: { id: string; owner: boolean; onClose: () => void; onChanged: () => void; show: (t: string, bad?: boolean) => void }) {
  const [d, setD] = useState<Detail | null>(null)
  const [busy, setBusy] = useState(false)
  const [note, setNote] = useState('')
  const [form, setForm] = useState({ stage: '' as Stage | '', reason: '', admitDate: '', uni: '', amount: '', ruleId: '', paidOn: '', payRef: '', review: '', undo: '', follow: '' })

  const load = useCallback(async () => {
    const r = await refDetail(id)
    if (!r.ok) { show(r.error, true); onClose(); return }
    setD(r)
    setForm(p => ({ ...p, stage: '', follow: r.referral.next_follow_up ?? '', uni: r.referral.final_university ?? r.referral.preferred_university ?? '',
      admitDate: r.referral.admission_confirmed_on ?? '', amount: r.suggested ? String(r.suggested.amount_inr) : '', ruleId: r.suggested?.id ?? '' }))
  }, [id, show, onClose])
  useEffect(() => { load() }, [load])

  const act = async (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) => {
    setBusy(true)
    try {
      const r = await fn()
      if (!r.ok) { show(r.error ?? 'Failed.', true); return }
      show(done); await load(); onChanged()
    } finally { setBusy(false) }
  }
  const copy = async (t: string) => { try { await navigator.clipboard.writeText(t); show('Copied') } catch { show('Copy failed', true) } }
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => setForm(p => ({ ...p, [k]: e.target.value }))

  const r: ReferralRow | undefined = d?.referral
  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Referral" onClick={onClose}>
      <div className="modal-card" onClick={e => e.stopPropagation()}>
        <div className="modal-head">
          <h2 className="mono">{r?.ref_code ?? 'Loading…'}</h2>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>
        {r && d && <>
          <div className="btn-row" style={{ flexWrap: 'wrap', gap: 6 }}>
            <span className={`pill ${STAGE_PILL[r.stage]}`}>{STAGE_LABEL[r.stage]}</span>
            {r.review_state === 'needs_review' && <span className="chip chip-amber">needs review</span>}
            {r.review_state === 'resolved' && <span className="chip chip-green">review resolved</span>}
            <span className="small muted">Submitted {when(r.created_at)} · terms {r.terms_version}</span>
          </div>

          {d.flagText.length > 0 && (
            <div className={`notice ${r.review_state === 'needs_review' ? 'notice-amber' : 'notice-navy'}`}>
              <strong>Flags:</strong> {d.flagText.join('; ')}
              {r.review_state === 'needs_review' && (
                <div className="btn-row" style={{ marginTop: 6 }}>
                  <input className="field" placeholder="What you checked" value={form.review} onChange={set('review')} maxLength={500} />
                  <button className="btn btn-navy" disabled={busy} onClick={() => act(() => refResolveReview(r.id, form.review), 'Review resolved')}>Mark resolved</button>
                </div>
              )}
            </div>
          )}

          <section className="card">
            <h3>Friend (referred student)</h3>
            <Person name={r.referred_name} phone={r.referred_phone} conv={d.referredConv} copy={copy} />
            <p className="small">Programme: {r.programme ?? 'not given'} · Preferred university: {r.preferred_university ?? 'not given'}</p>
            {r.referrer_note && <p className="small">Note from referrer: {r.referrer_note}</p>}
            {r.lead_id && <p className="small"><a href={`/leads?lead=${r.lead_id}`}>Open the CRM lead</a></p>}
            <p className="small muted">Contact permission is for counselling only. It is not marketing consent.</p>
          </section>

          <section className="card">
            <h3>Referred by</h3>
            <Person name={r.referrer_name} phone={r.referrer_phone} conv={d.referrerConv} copy={copy} />
            <p className="small">Campaign: {r.campaign_name ? `${r.campaign_name} (${ATTR[r.attribution]})` : 'none'}{r.referrer_wa_optin ? ' · asked for a WhatsApp confirmation' : ''}</p>
          </section>

          <section className="card">
            <h3>Progress</h3>
            {(FREE_STAGES.includes(r.stage) || r.stage === 'admission_confirmed' || r.stage === 'closed') && (
              <div className="btn-row" style={{ flexWrap: 'wrap' }}>
                <select className="field" value={form.stage} onChange={set('stage')} aria-label="Move to stage">
                  <option value="">Move to…</option>
                  {[...FREE_STAGES, 'closed' as Stage].filter(s => s !== r.stage).map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
                </select>
                {form.stage === 'closed' && <input className="field" placeholder="Reason for closing" value={form.reason} onChange={set('reason')} maxLength={300} />}
                <button className="btn btn-navy" disabled={busy || !form.stage} onClick={() => act(() => refSetStage(r.id, form.stage as Stage, form.reason), 'Stage updated')}>Save stage</button>
              </div>
            )}
            <div className="btn-row" style={{ marginTop: 8 }}>
              <label className="small">Next follow-up <input type="date" className="field" value={form.follow} onChange={set('follow')} /></label>
              <button className="btn btn-ghost" disabled={busy} onClick={() => act(() => refFollowUp(r.id, form.follow || null), form.follow ? 'Follow-up set' : 'Follow-up cleared')}>Save</button>
            </div>
            {r.closed_reason && <p className="small">Closed: {r.closed_reason}</p>}
          </section>

          {(FREE_STAGES.includes(r.stage) || r.stage === 'admission_confirmed') && (
            <section className="card">
              <h3>Admission</h3>
              <div className="formgrid">
                <label className="small">Admission date<input type="date" className="field" value={form.admitDate} onChange={set('admitDate')} /></label>
                <label className="small">University joined<input className="field" value={form.uni} onChange={set('uni')} maxLength={120} /></label>
              </div>
              <div className="btn-row"><button className="btn btn-navy" disabled={busy || !form.admitDate} onClick={() => act(() => refConfirmAdmission(r.id, form.admitDate, form.uni), 'Admission recorded')}>
                {r.stage === 'admission_confirmed' ? 'Update admission' : 'Confirm admission'}</button>
                <span className="small muted">The reward falls due 7 days after this date.</span></div>
            </section>
          )}

          {(r.stage === 'admission_confirmed' || r.stage === 'reward_approved' || r.stage === 'reward_paid') && (
            <section className="card">
              <h3>Reward</h3>
              <p className="small">Admission {r.admission_confirmed_on} · due by <strong>{r.reward_due_on}</strong>
                {rewardStatus(r) === 'overdue' && <> <span className="chip chip-red">overdue</span></>}</p>
              {r.stage === 'admission_confirmed' && (owner ? (
                <>
                  <div className="formgrid">
                    <label className="small">Amount (₹)<input className="field" inputMode="numeric" value={form.amount} onChange={set('amount')} /></label>
                    <span className="small muted">{d.suggested ? `Suggested by rule "${d.suggested.label}"` : 'No reward rule matches. Enter the amount you agreed.'}</span>
                  </div>
                  <div className="btn-row"><button className="btn btn-orange" disabled={busy || !form.amount}
                    onClick={() => act(() => refApprove(r.id, Number(form.amount), d.suggested && Number(form.amount) === d.suggested.amount_inr ? d.suggested.id : null), 'Reward approved')}>Approve reward</button></div>
                </>
              ) : <p className="small muted">The owner approves rewards.</p>)}
              {r.stage === 'reward_approved' && (
                <>
                  <p className="small">Approved {rupees(r.reward_amount_inr)} on {when(r.reward_approved_at)}.</p>
                  {owner && <>
                    <div className="formgrid">
                      <label className="small">Paid on<input type="date" className="field" value={form.paidOn} onChange={set('paidOn')} /></label>
                      <label className="small">Transaction reference (UTR or UPI)<input className="field" value={form.payRef} onChange={set('payRef')} maxLength={100} /></label>
                    </div>
                    <div className="btn-row"><button className="btn btn-orange" disabled={busy || !form.paidOn || !form.payRef} onClick={() => act(() => refMarkPaid(r.id, form.paidOn, form.payRef), 'Marked paid')}>Mark paid</button>
                      <span className="small muted">Record a payment you already made. Nothing is paid from here.</span></div>
                    <div className="btn-row" style={{ marginTop: 6 }}>
                      <input className="field" placeholder="Reason to undo the approval" value={form.undo} onChange={set('undo')} maxLength={300} />
                      <button className="btn btn-ghost" disabled={busy || !form.undo} onClick={() => act(() => refUndoApproval(r.id, form.undo), 'Approval undone')}>Undo approval</button>
                    </div>
                  </>}
                </>
              )}
              {r.stage === 'reward_paid' && <p className="small">Paid {rupees(r.reward_amount_inr)} on {r.reward_paid_on} · ref <span className="mono">{r.payment_ref}</span></p>}
            </section>
          )}

          <section className="card">
            <h3>Notes and calls</h3>
            <textarea className="field" rows={2} value={note} onChange={e => setNote(e.target.value)} maxLength={2000} placeholder="What happened" style={{ width: '100%' }} />
            <div className="btn-row">
              <button className="btn btn-navy" disabled={busy || !note.trim()} onClick={() => act(async () => { const x = await refNote(r.id, 'call', note); if (x.ok) setNote(''); return x }, 'Call logged')}>Log call</button>
              <button className="btn btn-ghost" disabled={busy || !note.trim()} onClick={() => act(async () => { const x = await refNote(r.id, 'note', note); if (x.ok) setNote(''); return x }, 'Note added')}>Add note</button>
            </div>
            <ul className="small" style={{ listStyle: 'none', padding: 0, marginTop: 8 }}>
              {d.activity.map((a: ActivityRow) => <li key={a.id} style={{ borderTop: '1px solid var(--line)', padding: '6px 0' }}>
                <span className="muted">{when(a.created_at)} · {a.kind}{a.actor && a.actor !== 'system' ? ` · ${a.actor}` : ''}</span><br />{a.body}</li>)}
            </ul>
          </section>
        </>}
      </div>
    </div>
  )
}

function Person({ name, phone, conv, copy }: { name: string; phone: string; conv: string | null; copy: (t: string) => void }) {
  return (
    <div className="btn-row" style={{ flexWrap: 'wrap' }}>
      <strong>{name}</strong>
      <span className="mono">{phone}</span>
      <a className="btn btn-ghost" href={`tel:${phone}`}>Call</a>
      <button className="btn btn-ghost" onClick={() => copy(phone)}>Copy</button>
      {conv ? <a className="btn btn-ghost" href={`/leads/whatsapp?c=${conv}`}>WhatsApp thread</a> : <span className="small muted">No WhatsApp thread yet</span>}
    </div>
  )
}

function RulesCard({ rules, programmes, universities, busy, setBusy, onSaved, show }: {
  rules: RewardRule[]; programmes: string[]; universities: UniOption[]; busy: boolean; setBusy: (b: boolean) => void; onSaved: () => void; show: (t: string, bad?: boolean) => void
}) {
  const blank = { id: '', label: '', programme: '', university_id: '', amount_inr: '', conditions: '', active: true }
  const [e, setE] = useState(blank)
  const uniName = (id: string | null) => universities.find(u => u.id === id)?.name ?? id ?? 'Any'
  const save = async () => {
    setBusy(true)
    try {
      const r = await refSaveRule({ id: e.id || undefined, label: e.label, programme: e.programme || null, university_id: e.university_id || null, amount_inr: Number(e.amount_inr), conditions: e.conditions, active: e.active })
      if (!r.ok) { show(r.error, true); return }
      show('Rule saved'); setE(blank); onSaved()
    } finally { setBusy(false) }
  }
  return (
    <section className="card">
      <h2 className="big">Reward rules</h2>
      <p className="small muted">Internal only. The approve screen suggests the best matching active rule; you still confirm every amount. Amounts never appear on the public page.</p>
      <div className="tblwrap">
        <table className="tbl">
          <thead><tr><th>Name</th><th>Programme</th><th>University</th><th className="num">Amount</th><th>Conditions</th><th>Active</th><th /></tr></thead>
          <tbody>
            {rules.length === 0 && <tr><td colSpan={7} className="muted">No rules yet. Rewards can still be approved with a typed amount.</td></tr>}
            {rules.map(r => <tr key={r.id}><td>{r.label}</td><td>{r.programme ?? 'Any'}</td><td>{uniName(r.university_id)}</td><td className="num">{rupees(r.amount_inr)}</td>
              <td className="small">{r.conditions}</td><td>{r.active ? 'Yes' : 'No'}</td>
              <td><button className="btn btn-ghost" onClick={() => setE({ id: r.id, label: r.label, programme: r.programme ?? '', university_id: r.university_id ?? '', amount_inr: String(r.amount_inr), conditions: r.conditions, active: r.active })}>Edit</button></td></tr>)}
          </tbody>
        </table>
      </div>
      <div className="formgrid" style={{ marginTop: 8 }}>
        <label className="small">Name<input className="field" value={e.label} onChange={x => setE(p => ({ ...p, label: x.target.value }))} maxLength={80} /></label>
        <label className="small">Programme<select className="field" value={e.programme} onChange={x => setE(p => ({ ...p, programme: x.target.value }))}><option value="">Any</option>{programmes.map(p => <option key={p} value={p}>{p}</option>)}</select></label>
        <label className="small">University<select className="field" value={e.university_id} onChange={x => setE(p => ({ ...p, university_id: x.target.value }))}><option value="">Any</option>{universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}</select></label>
        <label className="small">Amount (₹)<input className="field" inputMode="numeric" value={e.amount_inr} onChange={x => setE(p => ({ ...p, amount_inr: x.target.value }))} /></label>
        <label className="small">Conditions<input className="field" value={e.conditions} onChange={x => setE(p => ({ ...p, conditions: x.target.value }))} maxLength={1000} /></label>
        <label className="small"><input type="checkbox" checked={e.active} onChange={x => setE(p => ({ ...p, active: x.target.checked }))} /> Active</label>
      </div>
      <div className="btn-row">
        <button className="btn btn-orange" disabled={busy || !e.label || !e.amount_inr} onClick={save}>{e.id ? 'Save changes' : 'Add rule'}</button>
        {e.id && <button className="btn btn-ghost" onClick={() => setE(blank)}>Cancel</button>}
      </div>
    </section>
  )
}
