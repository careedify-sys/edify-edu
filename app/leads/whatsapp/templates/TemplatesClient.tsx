'use client'
// Templates: what Meta holds, their status and rejection reasons, and a form
// to submit a new one. Submitting asks Meta to review it; it sends nothing.
import { Fragment, useState } from 'react'
import { WaShell, useToast, when } from '../WaShell'
import { waTemplates, waSyncTemplates, waSubmitTemplate } from '../campaign-actions'
import type { TemplateRow } from '@/lib/whatsapp/campaign-repo'

// Kept in step with graph-templates.ts (server-only); the server checks again.
const LANGUAGES: Array<[string, string]> = [
  ['en', 'English'], ['en_US', 'English (US)'], ['en_GB', 'English (UK)'], ['hi', 'Hindi'], ['bn', 'Bengali'], ['gu', 'Gujarati'],
  ['kn', 'Kannada'], ['ml', 'Malayalam'], ['mr', 'Marathi'], ['pa', 'Punjabi'], ['ta', 'Tamil'], ['te', 'Telugu'], ['ur', 'Urdu'],
]
const STATUS: Record<string, [string, string]> = {
  APPROVED: ['pill-green', 'Approved'], PENDING: ['pill-amber', 'In review'], IN_APPEAL: ['pill-amber', 'In appeal'],
  REJECTED: ['pill-red', 'Rejected'], PAUSED: ['pill-red', 'Paused by Meta'], DISABLED: ['pill-red', 'Disabled'],
  LIMIT_EXCEEDED: ['pill-red', 'Limit exceeded'], DELETED: ['pill-muted', 'Deleted'],
}
type Btn = { type: 'QUICK_REPLY'; text: string } | { type: 'URL'; text: string; url: string }

export function Preview({ header, body, footer, buttons }: { header?: string | null; body: string; footer?: string | null; buttons: string[] }) {
  return (
    <div className="phonebox" aria-label="Preview of the message">
      <div className="wbubble">
        {header && <div className="whead">{header}</div>}
        <div className="wbody">{body || <span className="muted">Your message appears here.</span>}</div>
        {footer && <div className="wfoot">{footer}</div>}
      </div>
      {buttons.filter(Boolean).map((b, i) => <div key={i} className="wbtn">{b}</div>)}
    </div>
  )
}

function parts(components: unknown[]) {
  const get = (t: string) => (components as any[]).find(c => c?.type === t)
  return { header: get('HEADER')?.text ?? null, body: get('BODY')?.text ?? '', footer: get('FOOTER')?.text ?? null, buttons: ((get('BUTTONS')?.buttons ?? []) as any[]).map(b => String(b?.text ?? '')) }
}

export default function TemplatesClient({ mode, initial, error }: { mode: 'mock' | 'live'; initial: TemplateRow[]; error: string | null }) {
  const { show, node } = useToast()
  const [rows, setRows] = useState(initial)
  const [busy, setBusy] = useState(false)
  const [open, setOpen] = useState<string | null>(null)
  const [form, setForm] = useState(false)
  const [name, setName] = useState('')
  const [language, setLanguage] = useState('en')
  const [category, setCategory] = useState<'MARKETING' | 'UTILITY'>('MARKETING')
  const [header, setHeader] = useState('')
  const [body, setBody] = useState('')
  const [footer, setFooter] = useState('edifyedu.in')
  const [buttons, setButtons] = useState<Btn[]>([{ type: 'QUICK_REPLY', text: 'Stop promotions' }])
  const [understood, setUnderstood] = useState(false)

  async function reload() { const r = await waTemplates(); if (r.ok) setRows(r.templates) }
  async function sync() {
    setBusy(true)
    const r = await waSyncTemplates()
    setBusy(false)
    if (!r.ok) { show(r.error, true); return }
    await reload(); show(`Synced ${r.synced} templates from Meta`)
  }
  async function submit() {
    setBusy(true)
    const r = await waSubmitTemplate({ name: slug, language, category, header: header || undefined, body, footer: footer || undefined, buttons })
    setBusy(false)
    if (!r.ok) { show(r.error, true); return }
    show(r.category !== category ? `Submitted. Meta classed it as ${r.category}.` : 'Submitted to Meta for review')
    setForm(false); setName(''); setBody(''); setUnderstood(false); await reload()
  }
  const slug = name.toLowerCase().replace(/[^a-z0-9_]+/g, '_').replace(/^_+|_+$/g, '')

  return (
    <WaShell active="templates" title="Message templates" mode={mode} error={error}>
      <div className="notice notice-amber">
        WhatsApp only allows a business to start a conversation with a template Meta has approved. A referral invitation is a <b>Marketing</b> template, never Utility. Meta charges per delivered marketing message, and people can block or report it, so keep it short, clear and easy to stop.
      </div>
      <section className="card">
        <div className="btn-row wrap" style={{ marginTop: 0 }}>
          <h2 className="big" style={{ marginRight: 'auto' }}>Templates</h2>
          <button className="btn btn-ghost" disabled={busy} onClick={sync}>{busy ? 'Working…' : 'Sync from Meta'}</button>
          <button className="btn btn-orange" onClick={() => setForm(true)}>New template</button>
        </div>
        <div className="tblwrap">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Category</th><th>Language</th><th>Status</th><th>Last synced</th></tr></thead>
            <tbody>
              {rows.map(t => (
                <Fragment key={t.id}>
                  <tr onClick={() => setOpen(open === t.id ? null : t.id)} style={{ cursor: 'pointer' }}>
                    <td className="mono">{t.name}</td>
                    <td>{t.category === 'MARKETING' ? 'Marketing' : t.category === 'UTILITY' ? 'Utility' : t.category === 'AUTHENTICATION' ? 'Authentication' : t.category}</td>
                    <td>{t.language}</td>
                    <td><span className={`pill ${STATUS[t.status]?.[0] ?? 'pill-muted'}`}>{STATUS[t.status]?.[1] ?? t.status}</span>{t.reason && <div className="small bad">Reason: {t.reason.replace(/_/g, ' ').toLowerCase()}</div>}</td>
                    <td className="small muted">{when(t.synced_at)}</td>
                  </tr>
                  {open === t.id && (
                    <tr><td colSpan={5}><Preview {...parts(t.components)} />{t.category !== 'MARKETING' && <div className="small muted" style={{ marginTop: 6 }}>Campaigns only use Marketing templates.</div>}</td></tr>
                  )}
                </Fragment>
              ))}
              {!rows.length && <tr><td colSpan={5} className="muted">No templates yet. Press Sync from Meta, or create one.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>

      {form && (
        <section className="card">
          <h2 className="big">New template</h2>
          <div className="split">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <div className="formgrid">
                <label>Template name<input value={name} maxLength={250} onChange={e => setName(e.target.value)} placeholder="Referral invite December" />{slug && <span className="small muted" style={{ fontWeight: 400 }}>Saved at Meta as <span className="mono">{slug}</span></span>}</label>
                <label>Language<select value={language} onChange={e => setLanguage(e.target.value)}>{LANGUAGES.map(([c, l]) => <option key={c} value={c}>{l}</option>)}</select></label>
                <label>Category
                  <select value={category} onChange={e => setCategory(e.target.value as 'MARKETING' | 'UTILITY')}>
                    <option value="MARKETING">Marketing (referrals, offers)</option>
                    <option value="UTILITY">Utility (updates about something they asked for)</option>
                  </select>
                </label>
              </div>
              {category === 'UTILITY' && <div className="notice notice-red">Utility is only for updates about a transaction the student started. A referral invitation submitted as Utility is reclassified or rejected by Meta, and campaigns here only send Marketing templates.</div>}
              <span className="small muted">Authentication templates (login codes) are not offered: edifyedu.in sends no login codes.</span>
              <label className="field">Header (optional, 60 characters, no emoji)<input value={header} maxLength={60} onChange={e => setHeader(e.target.value)} /></label>
              <label className="field">Message ({body.length} of 1,024)<textarea rows={7} maxLength={1024} value={body} onChange={e => setBody(e.target.value)} placeholder="Write the referral message. Every student gets the same text; personalised fields are not supported because your list holds phone numbers only." /></label>
              <label className="field">Footer (optional, 60 characters)<input value={footer} maxLength={60} onChange={e => setFooter(e.target.value)} /></label>
              <div className="field" style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span className="small muted" style={{ fontWeight: 600 }}>Buttons (optional, up to 10; quick replies come back to the inbox)</span>
                {buttons.map((b, i) => (
                  <div key={i} className="btn-row" style={{ marginTop: 0 }}>
                    <select style={{ maxWidth: 150 }} value={b.type} onChange={e => { const n = [...buttons]; n[i] = e.target.value === 'URL' ? { type: 'URL', text: b.text, url: 'https://edifyedu.in/' } : { type: 'QUICK_REPLY', text: b.text }; setButtons(n) }}>
                      <option value="QUICK_REPLY">Quick reply</option><option value="URL">Website link</option>
                    </select>
                    <input value={b.text} maxLength={25} placeholder="Button text" onChange={e => { const n = [...buttons]; n[i] = { ...b, text: e.target.value }; setButtons(n) }} />
                    {b.type === 'URL' && <input value={b.url} placeholder="https://" onChange={e => { const n = [...buttons]; n[i] = { ...b, url: e.target.value }; setButtons(n) }} />}
                    <button className="btn btn-ghost" onClick={() => setButtons(buttons.filter((_, j) => j !== i))} aria-label="Remove button">×</button>
                  </div>
                ))}
                {buttons.length < 10 && <button className="link" style={{ alignSelf: 'flex-start' }} onClick={() => setButtons([...buttons, { type: 'QUICK_REPLY', text: '' }])}>Add a button</button>}
                <span className="small muted">A &quot;Stop promotions&quot; quick reply is recorded as an opt-out automatically.</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              <span className="small muted" style={{ fontWeight: 600 }}>Preview</span>
              <Preview header={header} body={body} footer={footer} buttons={buttons.map(b => b.text)} />
              <label className="check"><input type="checkbox" checked={understood} onChange={e => setUnderstood(e.target.checked)} /> I wrote this text and approve submitting it to Meta for review. Submitting sends nothing to students.</label>
              <div className="btn-row">
                <button className="btn btn-orange" disabled={busy || !understood || !slug || !body.trim()} onClick={submit}>Submit to Meta</button>
                <button className="btn btn-ghost" onClick={() => setForm(false)}>Cancel</button>
              </div>
            </div>
          </div>
        </section>
      )}
      {node}
    </WaShell>
  )
}
