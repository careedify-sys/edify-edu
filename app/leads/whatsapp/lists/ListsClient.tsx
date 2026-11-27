'use client'
// Lists: create, rename, archive, search, remove, export, consent, history.
import { useCallback, useEffect, useState } from 'react'
import { WaShell, useToast, fmt, when } from '../WaShell'
import {
  waLists, waCreateList, waRenameList, waArchiveList, waListMembers, waListReport, waRemoveMembers, waRecordConsent, waContactHistory,
} from '../campaign-actions'
import type { ListRow, HistoryRow } from '@/lib/whatsapp/campaign-repo'
import type { MemberView } from '@/lib/whatsapp/campaign-service'
import { CONSENT_SOURCES, CONSENT_SOURCE_TEXT } from '@/lib/whatsapp/consent-sources'

type Counts = { checked: number; consent_yes: number; consent_no: number; consent_unknown: number; opted_out: number; eligible: number }
const MARK: Record<string, [string, string]> = { yes: ['chip-green', 'Yes'], no: ['chip-red', 'No'], unknown: ['chip-amber', 'Unknown'] }

export default function ListsClient({ mode, initialLists, initialSelected, error }: { mode: 'mock' | 'live'; initialLists: ListRow[]; initialSelected: string | null; error: string | null }) {
  const { show, node } = useToast()
  const [lists, setLists] = useState(initialLists)
  const [sel, setSel] = useState<string | null>(initialSelected ?? initialLists[0]?.id ?? null)
  const [rows, setRows] = useState<MemberView[]>([])
  const [total, setTotal] = useState(0)
  const [offset, setOffset] = useState(0)
  const [search, setSearch] = useState('')
  const [picked, setPicked] = useState<Set<string>>(new Set())
  const [counts, setCounts] = useState<Counts | null>(null)
  const [newName, setNewName] = useState('')
  const [rename, setRename] = useState<string | null>(null)
  const [consent, setConsent] = useState<null | { scope: 'picked' | 'list' }>(null)
  const [history, setHistory] = useState<{ phone: string; rows: HistoryRow[] } | null>(null)
  const [busy, setBusy] = useState(false)
  const current = lists.find(l => l.id === sel) ?? null

  const reloadLists = useCallback(async () => { const r = await waLists(); if (r.ok) setLists(r.lists) }, [])
  const load = useCallback(async (id: string, off: number, q: string) => {
    setBusy(true)
    const [m, c] = await Promise.all([waListMembers({ listId: id, search: q, offset: off }), off === 0 ? waListReport(id) : Promise.resolve(null)])
    setBusy(false)
    if (!m.ok) { show(m.error, true); return }
    setRows(m.rows); setTotal(m.total); setOffset(off); setPicked(new Set())
    if (c && c.ok) setCounts(c)
  }, [show])

  useEffect(() => { if (sel) load(sel, 0, '') }, [sel, load])

  async function create() {
    const r = await waCreateList(newName)
    if (!r.ok) { show(r.error, true); return }
    setNewName(''); await reloadLists(); setSel(r.id); show('List created')
  }
  async function doRename() {
    if (!sel || rename == null) return
    const r = await waRenameList(sel, rename)
    if (!r.ok) { show(r.error, true); return }
    setRename(null); await reloadLists(); show('Renamed')
  }
  async function archive() {
    if (!sel || !current) return
    if (!window.confirm(`Archive "${current.name}"? The numbers and their consent records stay; only the list is hidden.`)) return
    const r = await waArchiveList(sel)
    if (!r.ok) { show(r.error, true); return }
    await reloadLists(); setSel(null); setRows([]); setCounts(null); show('List archived')
  }
  async function remove() {
    if (!sel || !picked.size) return
    if (!window.confirm(`Remove ${picked.size} numbers from this list? Their contact and consent records stay.`)) return
    const r = await waRemoveMembers(sel, Array.from(picked))
    if (!r.ok) { show(r.error, true); return }
    show(`${fmt(r.removed)} removed`); await reloadLists(); load(sel, 0, search)
  }
  async function openHistory(m: MemberView) {
    const r = await waContactHistory(m.contact_id)
    if (!r.ok) { show(r.error, true); return }
    setHistory({ phone: m.phone ?? '', rows: r.history })
  }

  const allOnPage = rows.length > 0 && rows.every(r => picked.has(r.contact_id))

  return (
    <WaShell active="lists" title="Contact lists" mode={mode} error={error}>
      <div className="split side">
        <section className="card" style={{ alignSelf: 'start' }}>
          <h2>Your lists</h2>
          {lists.length === 0 && <span className="muted small">No lists yet. Add numbers first.</span>}
          <ul className="plain">
            {lists.map(l => (
              <li key={l.id}>
                <button className={`row ${l.id === sel ? 'on' : ''}`} onClick={() => setSel(l.id)} style={{ borderRadius: 8 }}>
                  <span className="row-top"><span className="row-name">{l.name}</span><span className="row-time num">{fmt(l.members)}</span></span>
                </button>
              </li>
            ))}
          </ul>
          <div className="form">
            <input value={newName} maxLength={80} onChange={e => setNewName(e.target.value)} placeholder="New list name" />
            <button className="btn btn-ghost" disabled={!newName.trim()} onClick={create}>Create list</button>
            <a className="small" href="/leads/whatsapp/contacts">Add numbers to a list</a>
          </div>
        </section>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14, minWidth: 0 }}>
          {!current && <section className="card"><span className="muted">Choose a list.</span></section>}
          {current && (
            <>
              <section className="card">
                <div className="btn-row wrap" style={{ marginTop: 0, justifyContent: 'space-between' }}>
                  {rename == null ? <h2 className="big">{current.name}</h2> : (
                    <span className="btn-row" style={{ marginTop: 0 }}><input value={rename} maxLength={80} onChange={e => setRename(e.target.value)} /><button className="btn btn-navy" onClick={doRename}>Save</button><button className="btn btn-ghost" onClick={() => setRename(null)}>Cancel</button></span>
                  )}
                  <span className="btn-row wrap" style={{ marginTop: 0 }}>
                    <button className="btn btn-ghost" onClick={() => setRename(current.name)}>Rename</button>
                    <a className="btn btn-ghost" href={`/leads/whatsapp/export?kind=list&id=${current.id}`}>Export CSV</a>
                    <button className="btn btn-ghost" onClick={archive}>Archive</button>
                  </span>
                </div>
                {counts && (
                  <div className="tiles">
                    <div className="tile"><b>{fmt(counts.checked)}</b><span>Numbers</span></div>
                    <div className="tile good"><b>{fmt(counts.consent_yes)}</b><span>Consent recorded</span></div>
                    <div className="tile warn"><b>{fmt(counts.consent_unknown)}</b><span>Consent unknown</span></div>
                    <div className={`tile ${counts.consent_no ? 'badt' : ''}`}><b>{fmt(counts.consent_no)}</b><span>Said no</span></div>
                    <div className={`tile ${counts.opted_out ? 'badt' : ''}`}><b>{fmt(counts.opted_out)}</b><span>Opted out</span></div>
                    <div className="tile good"><b>{fmt(counts.eligible)}</b><span>Eligible now</span></div>
                  </div>
                )}
                <div className="btn-row wrap">
                  <button className="btn btn-navy" onClick={() => setConsent({ scope: 'list' })}>Record consent for the whole list</button>
                  <a className="btn btn-orange" href={`/leads/whatsapp/campaigns?list=${current.id}`}>Start a campaign from this list</a>
                </div>
              </section>

              {consent && (
                <ConsentForm count={consent.scope === 'list' ? counts?.checked ?? current.members : picked.size}
                  scopeText={consent.scope === 'list' ? `every number in "${current.name}"` : `the ${picked.size} selected numbers`}
                  onCancel={() => setConsent(null)}
                  onSubmit={async f => {
                    const r = await waRecordConsent({ ...f, contactIds: consent.scope === 'picked' ? Array.from(picked) : undefined, listId: consent.scope === 'list' ? current.id : null })
                    if (!r.ok) { show(r.error, true); return false }
                    show(`Recorded for ${fmt(r.recorded)} numbers`); setConsent(null); load(current.id, 0, search); return true
                  }} />
              )}

              <section className="card">
                <div className="btn-row wrap" style={{ marginTop: 0 }}>
                  <input style={{ maxWidth: 220 }} value={search} inputMode="numeric" placeholder="Search digits" onChange={e => setSearch(e.target.value)} onKeyDown={e => { if (e.key === 'Enter') load(current.id, 0, search) }} />
                  <button className="btn btn-ghost" onClick={() => load(current.id, 0, search)}>Search</button>
                  <span className="small muted">{fmt(total)} numbers{picked.size ? `, ${picked.size} selected` : ''}</span>
                  <span style={{ marginLeft: 'auto' }} className="btn-row" >
                    <button className="btn btn-ghost" disabled={!picked.size} onClick={() => setConsent({ scope: 'picked' })}>Record consent</button>
                    <button className="btn btn-ghost" disabled={!picked.size} onClick={remove}>Remove</button>
                  </span>
                </div>
                <div className="tblwrap">
                  <table className="tbl">
                    <thead><tr>
                      <th><input type="checkbox" aria-label="Select all on this page" checked={allOnPage} onChange={e => setPicked(e.target.checked ? new Set(rows.map(r => r.contact_id)) : new Set())} /></th>
                      <th>Phone</th><th>Marketing consent</th><th>Status</th><th>Added</th><th></th>
                    </tr></thead>
                    <tbody>
                      {rows.map(m => (
                        <tr key={m.contact_id} className={picked.has(m.contact_id) ? 'sel' : ''}>
                          <td className="pick"><label><input type="checkbox" aria-label={`Select ${m.phone}`} checked={picked.has(m.contact_id)} onChange={e => { const on = e.target.checked; setPicked(prev => { const s = new Set(prev); if (on) s.add(m.contact_id); else s.delete(m.contact_id); return s }) }} /></label></td>
                          <td className="num">{m.phone}</td>
                          <td><span className={`chip ${MARK[m.marketing]?.[0] ?? 'chip-amber'}`}>{MARK[m.marketing]?.[1] ?? 'Unknown'}</span></td>
                          <td>{m.opted_out ? <span className="bad">Opted out</span> : m.eligible ? <span className="ok">Eligible</span> : <span className="muted">Not eligible</span>}</td>
                          <td className="small muted">{when(m.added_at)}</td>
                          <td><button className="link" onClick={() => openHistory(m)}>History</button></td>
                        </tr>
                      ))}
                      {!rows.length && <tr><td colSpan={6} className="muted">{busy ? 'Loading…' : 'No numbers.'}</td></tr>}
                    </tbody>
                  </table>
                </div>
                <div className="btn-row">
                  <button className="btn btn-ghost" disabled={offset === 0 || busy} onClick={() => load(current.id, Math.max(0, offset - 100), search)}>Previous</button>
                  <span className="small muted">{total ? `${offset + 1} to ${Math.min(offset + 100, total)} of ${fmt(total)}` : ''}</span>
                  <button className="btn btn-ghost" disabled={offset + 100 >= total || busy} onClick={() => load(current.id, offset + 100, search)}>Next</button>
                </div>
              </section>
            </>
          )}
        </div>
      </div>

      {history && (
        <div className="modal" onClick={() => setHistory(null)}>
          <div className="modal-card" onClick={e => e.stopPropagation()} style={{ height: 'auto', maxHeight: '100%', alignSelf: 'flex-start' }}>
            <div className="modal-head"><h2>Campaign history: {history.phone}</h2><button className="btn btn-ghost" onClick={() => setHistory(null)}>Close</button></div>
            {history.rows.length === 0 ? <span className="muted">No campaign has included this number.</span> : (
              <div className="tblwrap"><table className="tbl"><thead><tr><th>Campaign</th><th>Result</th><th>Meta status</th><th>Sent</th></tr></thead>
                <tbody>{history.rows.map((h, i) => <tr key={i}><td><a href={`/leads/whatsapp/campaigns/${h.campaign_id}`}>{h.campaign_name}</a></td><td>{h.state}</td><td>{h.message_status ?? ''}</td><td className="small">{when(h.claimed_at)}</td></tr>)}</tbody>
              </table></div>
            )}
          </div>
        </div>
      )}
      {node}
    </WaShell>
  )
}

function ConsentForm({ count, scopeText, onCancel, onSubmit }: { count: number; scopeText: string; onCancel: () => void; onSubmit: (f: { granted: boolean; source: string; obtainedOn: string | null; evidence: string; confirm: string }) => Promise<boolean> }) {
  const [granted, setGranted] = useState(true)
  const [source, setSource] = useState('')
  const [obtainedOn, setObtainedOn] = useState('')
  const [evidence, setEvidence] = useState('')
  const [confirm, setConfirm] = useState('')
  const [agree, setAgree] = useState(false)
  const [busy, setBusy] = useState(false)
  return (
    <section className="card" style={{ borderColor: 'var(--amber)' }}>
      <h2 className="big">Record marketing consent for {scopeText}</h2>
      <div className="notice notice-amber">
        Record a Yes only when you hold proof that these students agreed to receive promotional WhatsApp messages from edifyedu.in, for example an opt-in on the admission form. Having enrolled before is not consent. This is logged with your name and the date.
      </div>
      <div className="seg">
        <button className={granted ? 'on' : ''} onClick={() => setGranted(true)}>They agreed (Yes)</button>
        <button className={!granted ? 'on' : ''} onClick={() => setGranted(false)}>Withdraw or record No</button>
      </div>
      <div className="formgrid">
        <label>Where they agreed
          <select value={source} onChange={e => setSource(e.target.value)}>
            <option value="">Choose…</option>
            {CONSENT_SOURCES.map(s => <option key={s} value={s}>{CONSENT_SOURCE_TEXT[s]}</option>)}
          </select>
        </label>
        {granted && <label>Date they agreed<input type="date" value={obtainedOn} max={new Date().toISOString().slice(0, 10)} onChange={e => setObtainedOn(e.target.value)} /></label>}
      </div>
      <label className="field">Evidence {granted ? '(required)' : '(optional)'}
        <textarea rows={2} maxLength={500} value={evidence} onChange={e => setEvidence(e.target.value)} placeholder="e.g. Admission form 2024, WhatsApp updates box ticked; forms kept in the office file" />
      </label>
      {granted && <label className="check"><input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} /> I hold this evidence for every one of these numbers.</label>}
      <label className="field">Type {count} to confirm the number of contacts<input inputMode="numeric" value={confirm} onChange={e => setConfirm(e.target.value)} style={{ maxWidth: 160 }} /></label>
      <div className="btn-row">
        <button className="btn btn-navy" disabled={busy || !source || (granted && !agree)} onClick={async () => { setBusy(true); await onSubmit({ granted, source, obtainedOn: obtainedOn || null, evidence, confirm }); setBusy(false) }}>Record</button>
        <button className="btn btn-ghost" onClick={onCancel}>Cancel</button>
      </div>
    </section>
  )
}
