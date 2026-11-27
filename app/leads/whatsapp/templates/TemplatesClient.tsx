'use client'
// Templates: what Meta holds, their status and the reason for any rejection
// in plain words, and a form to submit, edit or delete one. Submitting or
// editing asks Meta to review it; it sends nothing to students.
import { Fragment, useState } from 'react'
import { WaShell, useToast, when } from '../WaShell'
import {
  waTemplates, waSyncTemplates, waSubmitTemplate, waEditTemplate, waDeleteTemplate, waAttachHeaderFile, waHeaderFiles,
} from '../campaign-actions'
import type { TemplateRow } from '@/lib/whatsapp/campaign-repo'
import { checkButtons, reasonText, REFER_URL_VAR, HEADER_LIMITS } from '@/lib/whatsapp/template-rules'

// Kept in step with graph-templates.ts (server-only); the server checks again.
const LANGUAGES: Array<[string, string]> = [
  ['en', 'English'], ['en_US', 'English (US)'], ['en_GB', 'English (UK)'], ['hi', 'Hindi'], ['bn', 'Bengali'], ['gu', 'Gujarati'],
  ['kn', 'Kannada'], ['ml', 'Malayalam'], ['mr', 'Marathi'], ['pa', 'Punjabi'], ['ta', 'Tamil'], ['te', 'Telugu'], ['ur', 'Urdu'],
]
const STATUS: Record<string, [string, string]> = {
  APPROVED: ['pill-green', 'Approved'], PENDING: ['pill-amber', 'In review'], IN_APPEAL: ['pill-amber', 'In appeal'],
  REJECTED: ['pill-red', 'Rejected'], PAUSED: ['pill-red', 'Paused by Meta'], DISABLED: ['pill-red', 'Disabled'],
  LIMIT_EXCEEDED: ['pill-red', 'Limit exceeded'], DELETED: ['pill-muted', 'Deleted'], PENDING_DELETION: ['pill-muted', 'Being deleted'],
  FLAGGED: ['pill-red', 'Flagged'],
}
const EDITABLE = new Set(['APPROVED', 'REJECTED', 'PAUSED'])
type Btn = { type: 'QUICK_REPLY'; text: string } | { type: 'URL'; text: string; url: string }
type HeaderKind = 'none' | 'text' | 'image' | 'document'
type FileRef = { id: string; kind: 'image' | 'document'; file_name: string }

const fileUrl = (id: string) => `/leads/whatsapp/media?file=${encodeURIComponent(id)}`

export function Preview({ header, headerKind, imageUrl, docName, body, footer, buttons }: {
  header?: string | null; headerKind?: 'image' | 'document' | null; imageUrl?: string | null; docName?: string | null
  body: string; footer?: string | null; buttons: string[] | Array<{ text: string; url?: boolean }>
}) {
  const btns = (buttons as Array<string | { text: string; url?: boolean }>).map(b => (typeof b === 'string' ? { text: b, url: false } : b)).filter(b => b.text)
  return (
    <div className="phonebox" aria-label="Preview of the message">
      <div className="wbubble">
        {headerKind === 'image' && (imageUrl ? <img className="wimg" src={imageUrl} alt="Header image" /> : <div className="wimgph">Image header</div>)}
        {headerKind === 'document' && <div className="wdoc">📄 {docName || 'PDF document'}</div>}
        {header && <div className="whead">{header}</div>}
        <div className="wbody">{body || <span className="muted">Your message appears here.</span>}</div>
        {footer && <div className="wfoot">{footer}</div>}
      </div>
      {btns.map((b, i) => <div key={i} className="wbtn">{b.url && <span className="wico" aria-hidden>↗</span>}{b.text}</div>)}
    </div>
  )
}

function parts(t: TemplateRow) {
  const get = (x: string) => (t.components as any[]).find(c => String(c?.type).toUpperCase() === x)
  const fmt = String(get('HEADER')?.format ?? '').toUpperCase()
  const rawButtons = ((get('BUTTONS')?.buttons ?? []) as any[])
  return {
    header: fmt === 'TEXT' || (!fmt && get('HEADER')?.text) ? get('HEADER')?.text ?? null : null,
    headerKind: fmt === 'IMAGE' ? 'image' as const : fmt === 'DOCUMENT' ? 'document' as const : null,
    body: get('BODY')?.text ?? '', footer: get('FOOTER')?.text ?? null,
    buttons: rawButtons.map(b => ({ text: String(b?.text ?? ''), url: String(b?.type).toUpperCase() === 'URL' })),
    draftButtons: rawButtons.filter(b => ['URL', 'QUICK_REPLY'].includes(String(b?.type).toUpperCase())).map(b =>
      String(b.type).toUpperCase() === 'URL' ? { type: 'URL' as const, text: String(b.text ?? ''), url: String(b.url ?? '') } : { type: 'QUICK_REPLY' as const, text: String(b.text ?? '') }),
  }
}

// A neutral starting point: edifyedu.in as an independent comparison and counselling
// service, no university named, no reward amount (none is configured).
const STARTER = {
  body: 'Know someone planning an online degree?\n\nedifyedu.in helps students compare online universities using public UGC, NAAC and NIRF data, and our counsellors help them choose a suitable programme.\n\nRefer a friend, colleague or family member. Our team will connect with you to explain the referral programme and its benefits. Terms apply.',
  footer: 'edifyedu.in · Tap Stop Promotions to opt out',
  buttons: [
    { type: 'URL', text: 'Refer a Friend', url: REFER_URL_VAR },
    { type: 'QUICK_REPLY', text: 'Know More' },
    { type: 'QUICK_REPLY', text: 'Stop Promotions' },
  ] as Btn[],
}

export default function TemplatesClient({ mode, initial, error }: { mode: 'mock' | 'live'; initial: TemplateRow[]; error: string | null }) {
  const { show, node } = useToast()
  const [rows, setRows] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [form, setForm] = useState<null | { editId: string | null }>(null)
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('en')
  const [category, setCategory] = useState<'MARKETING' | 'UTILITY'>('MARKETING')
  const [headerKind, setHeaderKind] = useState<HeaderKind>('none')
  const [header, setHeader] = useState('')
  const [headerFile, setHeaderFile] = useState<FileRef | null>(null)
  const [files, setFiles] = useState<FileRef[] | null>(null)
  const [body, setBody] = useState('')
  const [footer, setFooter] = useState('edifyedu.in')
  const [buttons, setButtons] = useState<Btn[]>([{ type: 'QUICK_REPLY', text: 'Stop Promotions' }])
  const [understood, setUnderstood] = useState(false)
  const [del, setDel] = useState<{ id: string; name: string; typed: string } | null>(null)

  async function reload() { const r = await waTemplates(); if (r.ok) setRows(r.templates) }
  async function loadFiles() { const r = await waHeaderFiles(); if (r.ok) setFiles(r.files as FileRef[]) }
  async function sync() {
    setBusy(true)
    const r = await waSyncTemplates()
    setBusy(false)
    if (!r.ok) { show(r.error, true); return }
    await reload(); show(`Synced ${r.synced} templates from Meta`)
  }
  function resetForm() {
    setName(''); setLanguage('en'); setCategory('MARKETING'); setHeaderKind('none'); setHeader(''); setHeaderFile(null)
    setBody(''); setFooter('edifyedu.in'); setButtons([{ type: 'QUICK_REPLY', text: 'Stop Promotions' }]); setUnderstood(false)
  }
  function startNew() { resetForm(); setForm({ editId: null }); loadFiles() }
  function starter() {
    const month = new Date().toLocaleString('en-GB', { month: 'short' }).toLowerCase()
    setName(`referral_invite_${month}`); setCategory('MARKETING'); setHeaderKind('image')
    setBody(STARTER.body); setFooter(STARTER.footer); setButtons(STARTER.buttons)
  }
  function startEdit(t: TemplateRow) {
    const p = parts(t)
    resetForm()
    setName(t.name); setLanguage(t.language); setCategory(t.category === 'UTILITY' ? 'UTILITY' : 'MARKETING')
    setHeaderKind(p.headerKind ?? (p.header ? 'text' : 'none')); setHeader(p.header ?? '')
    setHeaderFile(t.header_file_id ? { id: t.header_file_id, kind: p.headerKind === 'document' ? 'document' : 'image', file_name: 'Current file' } : null)
    setBody(p.body); setFooter(p.footer ?? ''); setButtons(p.draftButtons)
    setForm({ editId: t.id }); loadFiles()
  }
  async function upload(file: File) {
    const fd = new FormData(); fd.append('purpose', 'template_header'); fd.append('file', file)
    setBusy(true)
    try {
      const res = await fetch('/leads/whatsapp/media', { method: 'POST', body: fd })
      const r = await res.json().catch(() => ({ ok: false, error: 'Upload failed.' }))
      if (!r.ok) { show(r.error, true); return }
      if ((headerKind === 'image') !== (r.kind === 'image')) { show(headerKind === 'image' ? 'That is not an image.' : 'That is not a PDF.', true); return }
      setHeaderFile({ id: r.id, kind: r.kind, file_name: r.fileName }); loadFiles()
    } catch { show('Upload failed. Try again.', true) } finally { setBusy(false) }
  }
  async function submit() {
    if (!form) return
    const draft = {
      name: slug, language, category, body, footer: footer || undefined, buttons,
      header: headerKind === 'text' && header ? header : undefined,
      headerFileId: headerKind === 'image' || headerKind === 'document' ? headerFile?.id ?? null : null,
    }
    if ((headerKind === 'image' || headerKind === 'document') && !headerFile) { show(`Upload the ${headerKind === 'image' ? 'image' : 'PDF'} first.`, true); return }
    setBusy(true)
    const r = form.editId ? await waEditTemplate(form.editId, draft) : await waSubmitTemplate(draft)
    setBusy(false)
    if (!r.ok) { show(r.error, true); return }
    if (form.editId) show('Edit sent to Meta for review')
    else show('category' in r && r.category !== category ? `Submitted. Meta classed it as ${r.category}.` : 'Submitted to Meta for review')
    setForm(null); resetForm(); await reload()
  }
  async function remove() {
    if (!del) return
    setBusy(true)
    const r = await waDeleteTemplate(del.id, del.typed)
    setBusy(false)
    if (!r.ok) { show(r.error, true); return }
    show('Deleted at Meta'); setDel(null); await reload()
  }
  async function attach(t: TemplateRow, fileId: string | null) {
    setBusy(true)
    const r = await waAttachHeaderFile(t.id, fileId)
    setBusy(false)
    if (!r.ok) { show(r.error, true); return }
    show(fileId ? 'File attached' : 'File removed'); await reload()
  }

  const slug = name.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '')
  const buttonProblem = checkButtons(buttons)
  const editing = form?.editId ? rows.find(r => r.id === form.editId) ?? null : null
  const kindFiles = (files ?? []).filter(f => headerKind === 'image' ? f.kind === 'image' : f.kind === 'document')

  return (
    <WaShell active="templates" title="Message templates" mode={mode} error={error}>
      <div className="notice notice-amber">
        WhatsApp only allows a business to start a conversation with a template Meta has approved. A referral invitation is a <b>Marketing</b> template, never Utility. Meta charges per delivered marketing message, and people can block or report it, so keep it short, clear and easy to stop.
      </div>
      <section className="card">
        <div className="btn-row wrap" style={{ marginTop: 0 }}>
          <h2 className="big" style={{ marginRight: 'auto' }}>Templates</h2>
          <button className="btn btn-ghost" disabled={busy} onClick={sync}>{busy ? 'Working…' : 'Sync from Meta'}</button>
          <button className="btn btn-orange" onClick={startNew}>New template</button>
        </div>
        <p className="small muted" style={{ margin: '6px 0 0' }}>Approvals and rejections arrive automatically once the template status webhook is switched on in Meta; Sync fetches them any time.</p>
        <div className="tblwrap">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Category</th><th>Language</th><th>Status</th><th>Last synced</th></tr></thead>
            <tbody>
              {rows.map(t => {
                const p = parts(t)
                const needsFile = (p.headerKind === 'image' || p.headerKind === 'document') && !t.header_file_id
                return (
                  <Fragment key={t.id}>
                    <tr onClick={() => { setOpen(open === t.id ? null : t.id); if (!files) loadFiles() }} style={{ cursor: 'pointer' }}>
                      <td className="mono">{t.name}{p.headerKind && <span className="small muted"> · {p.headerKind === 'image' ? 'image' : 'PDF'}</span>}</td>
                      <td>{t.category === 'MARKETING' ? 'Marketing' : t.category === 'UTILITY' ? 'Utility' : t.category === 'AUTHENTICATION' ? 'Authentication' : t.category}</td>
                      <td>{t.language}</td>
                      <td>
                        <span className={`pill ${STATUS[t.status]?.[0] ?? 'pill-muted'}`}>{STATUS[t.status]?.[1] ?? t.status}</span>
                        {t.reason && <div className="small bad" style={{ maxWidth: 360 }}>{reasonText(t.reason)}</div>}
                        {needsFile && <div className="small bad">Attach the {p.headerKind === 'image' ? 'image' : 'PDF'} before a campaign can use it.</div>}
                      </td>
                      <td className="small muted">{when(t.synced_at)}</td>
                    </tr>
                    {open === t.id && (
                      <tr><td colSpan={5}>
                        <div className="split">
                          <Preview {...p} imageUrl={t.header_file_id && p.headerKind === 'image' ? fileUrl(t.header_file_id) : null} />
                          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            {t.category !== 'MARKETING' && <div className="small muted">Campaigns only use Marketing templates.</div>}
                            {(p.headerKind === 'image' || p.headerKind === 'document') && t.status !== 'DELETED' && (
                              <label className="field small">File sent with every message
                                <select value={t.header_file_id ?? ''} disabled={busy} onChange={e => attach(t, e.target.value || null)}>
                                  <option value="">None attached</option>
                                  {(files ?? []).filter(f => (f.kind === 'image') === (p.headerKind === 'image')).map(f => <option key={f.id} value={f.id}>{f.file_name}</option>)}
                                </select>
                                <span className="muted" style={{ fontWeight: 400 }}>Upload new files in New template. The file must be the same promotion Meta approved.</span>
                              </label>
                            )}
                            <div className="btn-row">
                              {t.meta_id && EDITABLE.has(t.status) && <button className="btn btn-ghost" onClick={() => startEdit(t)}>Edit</button>}
                              {t.meta_id && !['DELETED', 'PENDING_DELETION', 'DISABLED'].includes(t.status) && <button className="btn btn-ghost bad" onClick={() => setDel({ id: t.id, name: t.name, typed: '' })}>Delete</button>}
                            </div>
                            {t.status === 'APPROVED' && <span className="small muted">Meta allows editing an approved template once a day and 10 times in 30 days, and reviews it again.</span>}
                            {del?.id === t.id && (
                              <div className="notice notice-red" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                                <span>Deleting removes <b className="mono">{t.name}</b> at Meta. An approved name cannot be used again for 30 days. Type the name to confirm.</span>
                                <input value={del.typed} onChange={e => setDel({ ...del, typed: e.target.value })} placeholder={t.name} />
                                <div className="btn-row"><button className="btn btn-orange" disabled={busy || del.typed !== t.name} onClick={remove}>Delete at Meta</button><button className="btn btn-ghost" onClick={() => setDel(null)}>Keep it</button></div>
                              </div>
                            )}
                          </div>
                        </div>
                      </td></tr>
                    )}
                  </Fragment>
                )
              })}
              {!rows.length && <tr><td colSpan={5} className="muted">No templates yet. Press Sync from Meta, or create one.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {form && (
        <section className="card">
          <div className="btn-row wrap" style={{ marginTop: 0 }}>
            <h2 className="big" style={{ marginRight: 'auto' }}>{editing ? `Edit ${editing.name}` : 'New template'}</h2>
            {!editing && <button className="btn btn-ghost" onClick={starter}>Use the referral starter</button>}
          </div>
          <div className="split">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="formgrid">
                <label>Template name<input value={name} maxLength={250} disabled={!!editing} onChange={e => setName(e.target.value)} placeholder="Referral invite December" />{slug && <span className="small muted" style={{ fontWeight: 400 }}>Saved at Meta as <span className="mono">{slug}</span></span>}</label>
                <label>Language<select value={language} disabled={!!editing} onChange={e => setLanguage(e.target.value)}>{LANGUAGES.map(([c, l]) => <option key={c} value={c}>{l}</option>)}</select></label>
                <label>Category
                  <select value={category} disabled={!!editing} onChange={e => setCategory(e.target.value as 'MARKETING' | 'UTILITY')}>
                    <option value="MARKETING">Marketing (referrals, offers)</option>
                    <option value="UTILITY">Utility (updates about something they asked for)</option>
                  </select>
                </label>
              </div>
              {editing && <span className="small muted">Name, language and category stay as they are. Meta reviews the edited template again before it can be sent.</span>}
              {category === 'UTILITY' && <div className="notice notice-red">Utility is only for updates about a transaction the student started. A referral invitation submitted as Utility is reclassified or rejected by Meta, and campaigns here only send Marketing templates.</div>}
              <label className="field">Header
                <select value={headerKind} onChange={e => { setHeaderKind(e.target.value as HeaderKind); setHeaderFile(null) }}>
                  <option value="none">No header</option>
                  <option value="text">Text (60 characters, no emoji)</option>
                  <option value="image">Image ({HEADER_LIMITS.image.label})</option>
                  <option value="document">Document ({HEADER_LIMITS.document.label})</option>
                </select>
              </label>
              {headerKind === 'text' && <label className="field">Header text<input value={header} maxLength={60} onChange={e => setHeader(e.target.value)} /></label>}
              {(headerKind === 'image' || headerKind === 'document') && (
                <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span className="small muted" style={{ fontWeight: 600 }}>{headerKind === 'image' ? 'Promotional image' : 'PDF'}: {headerFile ? <b>{headerFile.file_name}</b> : 'none chosen'}</span>
                  <input type="file" accept={headerKind === 'image' ? 'image/jpeg,image/png' : 'application/pdf'} disabled={busy} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} />
                  {!!kindFiles.length && (
                    <select value="" onChange={e => { const f = kindFiles.find(x => x.id === e.target.value); if (f) setHeaderFile(f) }}>
                      <option value="">Or reuse an uploaded file…</option>
                      {kindFiles.map(f => <option key={f.id} value={f.id}>{f.file_name}</option>)}
                    </select>
                  )}
                  <span className="small muted">The same file is sent to every recipient. Meta reviews it with the text, so do not swap in a different promotion later. Use a 1.91:1 or square image, under 4 MB, with no small print.</span>
                </div>
              )}
              <label className="field">Message ({body.length} of 1,024)<textarea rows={8} maxLength={1024} value={body} onChange={e => setBody(e.target.value)} placeholder="Write the referral message. Every student gets the same text; personalised fields are not supported because your list holds phone numbers only." /></label>
              <label className="field">Footer (optional, 60 characters)<input value={footer} maxLength={60} onChange={e => setFooter(e.target.value)} /></label>
              <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="small muted" style={{ fontWeight: 600 }}>Buttons (up to 10: website links first, then quick replies)</span>
                {buttons.map((b, i) => (
                  <div key={i} className="btn-row" style={{ marginTop: 0 }}>
                    <select style={{ maxWidth: 170 }} value={b.type === 'URL' ? (b.url === REFER_URL_VAR ? 'REFER' : 'URL') : 'QUICK_REPLY'} onChange={e => {
                      const n = [...buttons]; const v = e.target.value
                      n[i] = v === 'REFER' ? { type: 'URL', text: b.text || 'Refer a Friend', url: REFER_URL_VAR } : v === 'URL' ? { type: 'URL', text: b.text, url: 'https://edifyedu.in/' } : { type: 'QUICK_REPLY', text: b.text }
                      setButtons(n)
                    }}>
                      <option value="QUICK_REPLY">Quick reply</option><option value="REFER">Referral form link</option><option value="URL">Other website link</option>
                    </select>
                    <input value={b.text} maxLength={25} placeholder="Button text" onChange={e => { const n = [...buttons]; n[i] = { ...b, text: e.target.value }; setButtons(n) }} />
                    {b.type === 'URL' && b.url !== REFER_URL_VAR && <input value={b.url} placeholder="https://" onChange={e => { const n = [...buttons]; n[i] = { ...b, url: e.target.value }; setButtons(n) }} />}
                    {b.type === 'URL' && b.url === REFER_URL_VAR && <span className="small muted mono">edifyedu.in/refer + campaign code</span>}
                    <button className="btn btn-ghost" onClick={() => setButtons(buttons.filter((_, j) => j !== i))} aria-label="Remove button">×</button>
                  </div>
                ))}
                {buttons.length < 10 && <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setButtons([...buttons, { type: 'QUICK_REPLY', text: '' }])}>Add a button</button>}
                {buttonProblem && buttons.length > 0 && <span className="small bad">{buttonProblem}</span>}
                <span className="small muted">The referral form link adds a random campaign code (never a phone number) so referrals can be counted per campaign. A &quot;Stop Promotions&quot; quick reply is recorded as an opt-out automatically.</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="small muted" style={{ fontWeight: 600 }}>Preview</span>
              <Preview header={headerKind === 'text' ? header : null} headerKind={headerKind === 'image' || headerKind === 'document' ? headerKind : null}
                imageUrl={headerKind === 'image' && headerFile ? fileUrl(headerFile.id) : null} docName={headerFile?.file_name}
                body={body} footer={footer} buttons={buttons.map(b => ({ text: b.text, url: b.type === 'URL' }))} />
              <label className="check"><input type="checkbox" checked={understood} onChange={e => setUnderstood(e.target.checked)} /> I wrote this text and approve {editing ? 'sending this edit' : 'submitting it'} to Meta for review. This sends nothing to students.</label>
              <div className="btn-row">
                <button className="btn btn-orange" disabled={busy || !understood || !slug || !body.trim() || (!!buttonProblem && buttons.length > 0)} onClick={submit}>{editing ? 'Send edit to Meta' : 'Submit to Meta'}</button>
                <button className="btn btn-ghost" onClick={() => { setForm(null); resetForm() }}>Cancel</button>
              </div>
            </div>
          </div>
        </section>
      )}
      {node}
    </WaShell>
  )
}
