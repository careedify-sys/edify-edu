'use client'
// Add numbers: paste, Excel/CSV, or from the inbox or CRM. The file is read in
// this browser; only the normalised numbers are sent to the server, and only
// when you press Check or Save. Saving never sends a message.
import { useMemo, useRef, useState } from 'react'
import { WaShell, useToast, fmt } from '../WaShell'
import { splitPasted, summarise, detectPhoneColumn, REASON_TEXT, MAX_IMPORT_VALUES, type ImportSummary } from '@/lib/whatsapp/phones'
import { readSheetFile, MAX_FILE_BYTES, SheetError } from '@/lib/whatsapp/sheet-reader'
import { waCheckNumbers, waSaveNumbers, waSourcePhones } from '../campaign-actions'
import type { ListRow } from '@/lib/whatsapp/campaign-repo'

type Method = 'paste' | 'file' | 'inbox' | 'crm'
type Server = { checked: number; existing: number; new: number; consent_yes: number; consent_no: number; consent_unknown: number; opted_out: number; eligible: number }

export default function ContactsClient({ mode, lists, error }: { mode: 'mock' | 'live'; lists: ListRow[]; error: string | null }) {
  const { show, node } = useToast()
  const [method, setMethod] = useState<Method>('paste')
  const [text, setText] = useState('')
  const [sheet, setSheet] = useState<{ name: string; rows: string[][] } | null>(null)
  const [column, setColumn] = useState<number | null>(null)
  const [hasHeader, setHasHeader] = useState(false)
  const [sourceValues, setSourceValues] = useState<string[] | null>(null)
  const [summary, setSummary] = useState<ImportSummary | null>(null)
  const [server, setServer] = useState<Server | null>(null)
  const [busy, setBusy] = useState(false)
  const [target, setTarget] = useState<string>('new')
  const [newName, setNewName] = useState('')
  const [saved, setSaved] = useState<{ listId: string | null; text: string } | null>(null)
  const [over, setOver] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  const reset = () => { setSummary(null); setServer(null); setSaved(null) }

  async function onFile(f: File | undefined) {
    reset(); setSheet(null); setColumn(null)
    if (!f) return
    if (f.size > MAX_FILE_BYTES) { show(`That file is ${(f.size / 1048576).toFixed(1)} MB. The limit is 5 MB.`, true); return }
    try {
      const rows = await readSheetFile(f.name, new Uint8Array(await f.arrayBuffer()))
      if (!rows.length) { show('The file has no rows.', true); return }
      const g = detectPhoneColumn(rows)
      setSheet({ name: f.name, rows }); setColumn(g.column); setHasHeader(g.hasHeader)
      if (g.column == null) show('No column looks like phone numbers. Pick the column below.', true)
    } catch (e) {
      show(e instanceof SheetError ? e.message : 'Could not read that file. Save it as .xlsx or .csv and try again.', true)
    }
  }

  const width = useMemo(() => (sheet ? Math.min(50, sheet.rows.reduce((m, r) => Math.max(m, r.length), 0)) : 0), [sheet])

  function values(): Array<string | { raw: string; spaced?: true }> | null {
    if (method === 'paste') return splitPasted(text)
    if (method === 'file') {
      if (!sheet || column == null) return null
      return sheet.rows.slice(hasHeader ? 1 : 0).map(r => String(r[column] ?? ''))
    }
    return sourceValues
  }

  async function check() {
    reset()
    const v = values()
    if (!v || !v.length) { show(method === 'file' ? 'Choose a file and its phone column first.' : 'Nothing to check yet.', true); return }
    if (v.length > MAX_IMPORT_VALUES) { show(`Up to ${fmt(MAX_IMPORT_VALUES)} values at a time. Split the file.`, true); return }
    const s = summarise(v)
    setSummary(s)
    if (!s.numbers.length) return
    setBusy(true)
    const r = await waCheckNumbers(s.numbers)
    setBusy(false)
    if (!r.ok) { show(r.error, true); return }
    setServer(r.counts)
  }

  async function loadSource(from: 'inbox' | 'crm') {
    reset(); setSourceValues(null); setBusy(true)
    const r = await waSourcePhones(from)
    setBusy(false)
    if (!r.ok) { show(r.error, true); return }
    setSourceValues(r.values)
    show(`${fmt(r.values.length)} numbers loaded from the ${from === 'crm' ? 'CRM' : 'inbox'}. Press Check.`)
  }

  async function save() {
    if (!summary?.numbers.length) return
    if (target === 'new' && !newName.trim()) { show('Name the new list.', true); return }
    setBusy(true)
    const r = await waSaveNumbers({ phones: summary.numbers, listId: target === 'new' || target === 'none' ? null : target, newListName: target === 'new' ? newName.trim() : null, source: method })
    setBusy(false)
    if (!r.ok) { show(r.error, true); return }
    const x = r.result
    setSaved({ listId: r.listId, text: `Saved ${fmt(x.valid)} numbers: ${fmt(x.new_contacts)} new, ${fmt(x.added_to_list)} added to the list, ${fmt(x.already_in_list)} were already in it. Nothing was sent.` })
  }

  const problems = summary ? [...summary.ambiguous.map(a => ({ ...a, kind: 'Check by hand' })), ...summary.invalid.map(a => ({ ...a, kind: 'Invalid' }))] : []

  return (
    <WaShell active="contacts" title="Add numbers" mode={mode} error={error}>
      <div className="notice notice-amber">
        Adding numbers never sends a message, and a number on WhatsApp is not something this page can know. A number is eligible for a referral campaign only once you record that the student agreed to marketing messages from edifyedu.in.
      </div>

      <section className="card">
        <h2 className="big"><span className="stepno">1</span>Where are the numbers?</h2>
        <div className="seg" role="tablist">
          {([['paste', 'Paste'], ['file', 'Excel or CSV file'], ['inbox', 'From the inbox'], ['crm', 'From the CRM']] as const).map(([k, l]) => (
            <button key={k} className={method === k ? 'on' : ''} onClick={() => { setMethod(k); reset(); setSourceValues(null) }}>{l}</button>
          ))}
        </div>

        {method === 'paste' && (
          <>
            <textarea rows={9} value={text} onChange={e => { setText(e.target.value); reset() }}
              placeholder={'Paste numbers here: one per line, or separated by commas, semicolons or tabs.\nCells copied from Excel work too.\n\n98765 43210\n+91 91234 56789, 919988776655'} />
            <span className="small muted">+91, 91 and 0 prefixes, spaces, dashes and brackets are all fine.</span>
          </>
        )}

        {method === 'file' && (
          <>
            <div className={`drop ${over ? 'over' : ''}`} onClick={() => fileRef.current?.click()}
              onDragOver={e => { e.preventDefault(); setOver(true) }} onDragLeave={() => setOver(false)}
              onDrop={e => { e.preventDefault(); setOver(false); onFile(e.dataTransfer.files?.[0]) }}>
              <b>{sheet ? sheet.name : 'Choose or drop an .xlsx or .csv file'}</b>
              <div className="small muted">Up to 5 MB and 20,000 rows. The file stays in this browser; only the numbers go to the server.</div>
              <input ref={fileRef} type="file" accept=".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" hidden onChange={e => onFile(e.target.files?.[0])} />
            </div>
            {sheet && (
              <>
                <div className="formgrid">
                  <label>Phone column
                    <select value={column ?? ''} onChange={e => { setColumn(e.target.value === '' ? null : Number(e.target.value)); reset() }}>
                      <option value="">Choose…</option>
                      {Array.from({ length: width }, (_, i) => (
                        <option key={i} value={i}>Column {String.fromCharCode(65 + (i % 26))}{i >= 26 ? Math.floor(i / 26) : ''}{hasHeader && sheet.rows[0]?.[i] ? `: ${String(sheet.rows[0][i]).slice(0, 30)}` : ''}</option>
                      ))}
                    </select>
                  </label>
                  <label className="check" style={{ alignSelf: 'end' }}>
                    <input type="checkbox" checked={hasHeader} onChange={e => { setHasHeader(e.target.checked); reset() }} /> First row is a heading
                  </label>
                </div>
                <div className="tblwrap">
                  <table className="tbl">
                    <tbody>
                      {sheet.rows.slice(0, 5).map((r, i) => (
                        <tr key={i}>{Array.from({ length: Math.min(width, 8) }, (_, c) => (
                          <td key={c} style={c === column ? { background: '#fff7ed', fontWeight: 600 } : undefined}>{String(r[c] ?? '').slice(0, 30)}</td>
                        ))}</tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                <span className="small muted">First 5 rows of {fmt(sheet.rows.length)}. The highlighted column is used. If Excel shows numbers like 9.19877E+11, format the column as Text before saving; those values are flagged, never guessed.</span>
              </>
            )}
          </>
        )}

        {(method === 'inbox' || method === 'crm') && (
          <div className="btn-row wrap">
            <button className="btn btn-ghost" disabled={busy} onClick={() => loadSource(method)}>
              Load numbers from the {method === 'crm' ? 'CRM leads' : 'WhatsApp inbox'}
            </button>
            {sourceValues && <span className="small muted">{fmt(sourceValues.length)} loaded (newest first, up to 2,000).</span>}
          </div>
        )}

        <div className="btn-row"><button className="btn btn-navy" disabled={busy} onClick={check}>{busy ? 'Checking…' : 'Check numbers'}</button></div>
      </section>

      {summary && (
        <section className="card">
          <h2 className="big"><span className="stepno">2</span>Check result</h2>
          <div className="tiles">
            <div className="tile"><b>{fmt(summary.total)}</b><span>Values with digits</span></div>
            <div className="tile good"><b>{fmt(summary.valid)}</b><span>Valid unique numbers</span></div>
            <div className="tile"><b>{fmt(summary.duplicates)}</b><span>Duplicates in this import</span></div>
            <div className={`tile ${summary.invalid.length ? 'badt' : ''}`}><b>{fmt(summary.invalid.length)}</b><span>Invalid</span></div>
            <div className={`tile ${summary.ambiguous.length ? 'warn' : ''}`}><b>{fmt(summary.ambiguous.length)}</b><span>Need checking by hand</span></div>
            {summary.ignored > 0 && <div className="tile"><b>{fmt(summary.ignored)}</b><span>Ignored (no digits)</span></div>}
          </div>
          {server && (
            <div className="tiles">
              <div className="tile"><b>{fmt(server.existing)}</b><span>Already saved</span></div>
              <div className="tile"><b>{fmt(server.new)}</b><span>New</span></div>
              <div className="tile good"><b>{fmt(server.consent_yes)}</b><span>Marketing consent recorded</span></div>
              <div className="tile warn"><b>{fmt(server.consent_unknown)}</b><span>Consent unknown</span></div>
              <div className={`tile ${server.consent_no ? 'badt' : ''}`}><b>{fmt(server.consent_no)}</b><span>Said no</span></div>
              <div className={`tile ${server.opted_out ? 'badt' : ''}`}><b>{fmt(server.opted_out)}</b><span>Opted out</span></div>
              <div className="tile good"><b>{fmt(server.eligible)}</b><span>Eligible for a campaign now</span></div>
            </div>
          )}
          {server && server.eligible === 0 && summary.valid > 0 && (
            <div className="notice notice-amber">None of these numbers can receive a referral message yet, because no marketing consent is recorded for them. Save them to a list, then record consent on the Lists page once you have the evidence.</div>
          )}
          {problems.length > 0 && (
            <details>
              <summary className="small" style={{ cursor: 'pointer', fontWeight: 600 }}>Show the {fmt(problems.length)} values that were not used</summary>
              <div className="tblwrap" style={{ marginTop: 8, maxHeight: 280, overflowY: 'auto' }}>
                <table className="tbl"><thead><tr><th>Value</th><th>Why</th></tr></thead>
                  <tbody>{problems.slice(0, 500).map((p, i) => <tr key={i}><td className="mono">{p.raw.slice(0, 60)}</td><td>{p.kind}: {REASON_TEXT[p.reason]}</td></tr>)}</tbody>
                </table>
              </div>
            </details>
          )}
        </section>
      )}

      {summary && summary.numbers.length > 0 && (
        <section className="card">
          <h2 className="big"><span className="stepno">3</span>Save the {fmt(summary.numbers.length)} valid numbers</h2>
          <div className="formgrid">
            <label>Save to
              <select value={target} onChange={e => setTarget(e.target.value)}>
                <option value="new">A new list</option>
                {lists.map(l => <option key={l.id} value={l.id}>{l.name} ({fmt(l.members)})</option>)}
                <option value="none">No list (contacts only)</option>
              </select>
            </label>
            {target === 'new' && <label>New list name<input value={newName} maxLength={80} onChange={e => setNewName(e.target.value)} placeholder="e.g. MBA 2024 batch" /></label>}
          </div>
          <div className="btn-row"><button className="btn btn-orange" disabled={busy || !!saved} onClick={save}>Save numbers</button><span className="small muted">Saving never sends a message.</span></div>
          {saved && (
            <div className="notice notice-green">
              {saved.text}{' '}
              {saved.listId && <a href={`/leads/whatsapp/lists?list=${saved.listId}`}>Open the list to record consent</a>}
            </div>
          )}
        </section>
      )}
      {node}
    </WaShell>
  )
}
