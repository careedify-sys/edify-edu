'use client'
// Inbox additions: thread facts (referrals, campaigns, auto-replies), template
// send when the window is closed, image/PDF send inside it, and a new chat by
// number. Every send uses one client reference per attempt, kept on a network
// error so pressing Send again cannot message twice.
import { useCallback, useEffect, useRef, useState } from 'react'
import { inboxExtras, inboxTemplates, inboxSendTemplate, inboxStartChat, inboxSendFile } from './inbox-extra-actions'
import { autoSetConversation } from './automation-actions'

type Extras = Extract<Awaited<ReturnType<typeof inboxExtras>>, { ok: true }>
type Tpl = Extras['templates'][number]
const newRef = () => crypto.randomUUID()
const STAGE: Record<string, string> = {
  new: 'New', contact_attempted: 'Contact attempted', contacted: 'Contacted', counselling: 'Counselling', follow_up: 'Follow-up',
  application_started: 'Application started', admission_confirmed: 'Admission confirmed', reward_approved: 'Reward approved', reward_paid: 'Reward paid', closed: 'Closed',
}

function TemplatePreview({ t }: { t: Tpl | undefined }) {
  if (!t) return null
  return (
    <div className="small" style={{ background: '#f1f5f9', borderRadius: 8, padding: 8, whiteSpace: 'pre-wrap' }}>
      {t.headerKind && <div className="muted">[{t.headerKind === 'image' ? 'Image' : 'PDF'} header]</div>}
      {t.body}
      {t.buttons.length > 0 && <div className="muted" style={{ marginTop: 4 }}>Buttons: {t.buttons.join(' · ')}</div>}
      <div className="muted" style={{ marginTop: 4 }}>{t.category === 'MARKETING' ? 'Marketing: needs recorded marketing consent; charged at the marketing rate.' : 'Utility: charged at the utility rate.'}</div>
    </div>
  )
}

export function ThreadExtras({ convId, windowOpen, say, onChanged }: {
  convId: string; windowOpen: boolean; say: (t: string, bad?: boolean) => void; onChanged: () => Promise<void>
}) {
  const [d, setD] = useState<Extras | null>(null)
  const [tplId, setTplId] = useState('')
  const [fileId, setFileId] = useState('')
  const [caption, setCaption] = useState('')
  const [busy, setBusy] = useState(false)
  const [uploading, setUploading] = useState(false)
  const ref = useRef<{ what: string; key: string } | null>(null)
  const keyFor = (what: string) => { if (!ref.current || ref.current.what !== what) ref.current = { what, key: newRef() }; return ref.current.key }

  const load = useCallback(async () => { const r = await inboxExtras(convId); if (r.ok) setD(r) }, [convId])
  useEffect(() => { setD(null); ref.current = null; load() }, [load])

  const finish = async (r: Awaited<ReturnType<typeof inboxSendTemplate>>, done: string) => {
    if (r.ok) ref.current = null
    if (!r.ok) { say(r.error, true); return }
    if (r.state === 'accepted') say(r.duplicate ? 'Already sent' : done)
    else say(r.error ?? 'Not confirmed', true)
    await onChanged()
  }
  const sendTpl = async () => {
    if (busy || !tplId) return
    setBusy(true)
    try { await finish(await inboxSendTemplate({ convId, templateId: tplId, clientRef: keyFor(`t:${tplId}`) }), 'Template sent') }
    catch { say('Connection problem. Press Send again; it will not send twice.', true) } finally { setBusy(false) }
  }
  const sendFile = async () => {
    if (busy || !fileId) return
    setBusy(true)
    try { const r = await inboxSendFile({ convId, fileId, caption, clientRef: keyFor(`f:${fileId}:${caption}`) }); if (r.ok && r.state === 'accepted') setCaption(''); await finish(r, 'File sent') }
    catch { say('Connection problem. Press Send again; it will not send twice.', true) } finally { setBusy(false) }
  }
  const upload = async (file: File) => {
    setUploading(true)
    try {
      const fd = new FormData(); fd.append('purpose', 'outbound'); fd.append('file', file)
      const res = await fetch('/leads/whatsapp/media', { method: 'POST', body: fd })
      const j = await res.json().catch(() => ({ ok: false, error: 'Upload failed.' }))
      if (!j.ok) { say(j.error ?? 'Upload failed.', true); return }
      say('Uploaded'); await load(); setFileId(j.id)
    } finally { setUploading(false) }
  }

  const t = d?.templates.find(x => x.id === tplId)
  return (
    <div className="extras" style={{ borderTop: '1px solid var(--line)', padding: '8px 12px', display: 'grid', gap: 8 }}>
      <div className="btn-row" style={{ flexWrap: 'wrap', gap: 6 }}>
        {d && (d.facts.autoOff
          ? <span className="small muted">Auto-replies stopped here <button className="linklike" onClick={async () => { const r = await autoSetConversation(convId, false); if (r.ok) { say('Auto-replies resumed for this chat'); load() } else say(r.error, true) }}>Resume</button></span>
          : <button className="btn btn-ghost" onClick={async () => { const r = await autoSetConversation(convId, true); if (r.ok) { say('Auto-replies stopped for this chat'); load() } else say(r.error, true) }}>Stop auto-replies here</button>)}
      </div>
      {d && (d.facts.referrals.length > 0 || d.facts.campaigns.length > 0) && (
        <div className="small">
          {d.facts.referrals.map(r => <span key={r.id} style={{ marginRight: 10 }}>
            <a href={`/leads/whatsapp/referrals?id=${r.id}`} className="mono">{r.ref_code}</a> ({r.role === 'referrer' ? 'referred someone' : 'was referred'}, {STAGE[r.stage] ?? r.stage})</span>)}
          {d.facts.campaigns.length > 0 && <span className="muted">Campaigns: {d.facts.campaigns.map(c => c.name).join(', ')}</span>}
        </div>
      )}
      {d && !windowOpen && (
        <div style={{ display: 'grid', gap: 6 }}>
          <strong className="small">Send an approved template (the 24-hour window is closed)</strong>
          {d.templates.length === 0 ? <span className="small muted">No approved Marketing or Utility templates yet.</span> : <>
            <select className="field" value={tplId} onChange={e => setTplId(e.target.value)} aria-label="Template">
              <option value="">Choose a template</option>
              {d.templates.map(x => <option key={x.id} value={x.id} disabled={!x.usable}>{x.name} ({x.category.toLowerCase()}){x.usable ? '' : ` · ${x.why}`}</option>)}
            </select>
            <TemplatePreview t={t} />
            <div className="btn-row"><button className="btn btn-orange" disabled={busy || !tplId || !t?.usable} onClick={sendTpl}>{busy ? 'Sending…' : 'Send template'}</button></div>
          </>}
        </div>
      )}
      {d && windowOpen && (
        <details>
          <summary className="small" style={{ cursor: 'pointer' }}>Send an image or PDF (brochure)</summary>
          <div style={{ display: 'grid', gap: 6, marginTop: 6 }}>
            <div className="btn-row" style={{ flexWrap: 'wrap' }}>
              <select className="field" value={fileId} onChange={e => setFileId(e.target.value)} aria-label="File" style={{ width: 'auto' }}>
                <option value="">Choose a file</option>
                {d.files.map(f => <option key={f.id} value={f.id}>{f.file_name} ({f.kind === 'image' ? 'image' : 'PDF'}, {Math.ceil(f.size_bytes / 1024)} KB)</option>)}
              </select>
              <label className="btn btn-ghost" style={{ cursor: 'pointer' }}>{uploading ? 'Uploading…' : 'Upload new'}
                <input type="file" accept="image/jpeg,image/png,application/pdf" hidden disabled={uploading} onChange={e => { const f = e.target.files?.[0]; if (f) upload(f); e.target.value = '' }} /></label>
              <span className="small muted">JPEG, PNG or PDF, up to 4 MB.</span>
            </div>
            <input className="field" placeholder="Caption (optional)" value={caption} onChange={e => setCaption(e.target.value)} maxLength={1024} />
            <div className="btn-row"><button className="btn btn-navy" disabled={busy || !fileId} onClick={sendFile}>{busy ? 'Sending…' : 'Send file'}</button></div>
          </div>
        </details>
      )}
    </div>
  )
}

export function StartChat({ say, onStarted }: { say: (t: string, bad?: boolean) => void; onStarted: (convId: string) => void }) {
  const [open, setOpen] = useState(false)
  const [tpls, setTpls] = useState<Tpl[] | null>(null)
  const [phone, setPhone] = useState('')
  const [tplId, setTplId] = useState('')
  const [optIn, setOptIn] = useState(false)
  const [busy, setBusy] = useState(false)
  const ref = useRef<{ what: string; key: string } | null>(null)
  const keyFor = (what: string) => { if (!ref.current || ref.current.what !== what) ref.current = { what, key: newRef() }; return ref.current.key }

  useEffect(() => { if (open && !tpls) inboxTemplates().then(r => setTpls(r.ok ? r.templates : [])) }, [open, tpls])
  const t = tpls?.find(x => x.id === tplId)
  const go = async () => {
    if (busy) return
    setBusy(true)
    try {
      const r = await inboxStartChat({ phone, templateId: tplId, clientRef: keyFor(`${phone}:${tplId}`), confirmOptIn: optIn })
      if (r.ok) ref.current = null
      if (!r.ok) { say(r.error, true); return }
      if (r.state === 'accepted') say('Template sent. The chat is open.'); else say(r.error ?? 'Not confirmed', true)
      setOpen(false); setPhone(''); setTplId(''); setOptIn(false)
      onStarted(r.convId)
    } catch { say('Connection problem. Press Send again; it will not send twice.', true) } finally { setBusy(false) }
  }
  return <>
    <button className="btn btn-navy" onClick={() => setOpen(true)}>New chat</button>
    {open && (
      <div className="modal" role="dialog" aria-modal="true" aria-label="New chat" onClick={() => setOpen(false)}>
        <div className="modal-card" onClick={e => e.stopPropagation()} style={{ height: 'auto', maxHeight: '100%', alignSelf: 'flex-start' }}>
          <div className="modal-head"><h2>New chat</h2><button className="btn btn-ghost" onClick={() => setOpen(false)}>Close</button></div>
          <p className="small muted">WhatsApp lets a business start a chat only with an approved template. Free text is possible after the person replies.</p>
          <label className="small">Mobile number<input className="field" inputMode="tel" placeholder="10-digit mobile" value={phone} onChange={e => setPhone(e.target.value)} maxLength={16} /></label>
          <label className="small">Template
            <select className="field" value={tplId} onChange={e => setTplId(e.target.value)}>
              <option value="">{tpls === null ? 'Loading…' : tpls.length ? 'Choose a template' : 'No approved templates yet'}</option>
              {(tpls ?? []).map(x => <option key={x.id} value={x.id} disabled={!x.usable}>{x.name} ({x.category.toLowerCase()}){x.usable ? '' : ` · ${x.why}`}</option>)}
            </select></label>
          <TemplatePreview t={t} />
          <label className="small" style={{ display: 'flex', gap: 8, alignItems: 'flex-start' }}>
            <input type="checkbox" checked={optIn} onChange={e => setOptIn(e.target.checked)} style={{ marginTop: 3 }} />
            <span>This person agreed to receive WhatsApp messages from Edify (Meta requires this before a business messages first).</span></label>
          <div className="btn-row"><button className="btn btn-orange" disabled={busy || !phone.trim() || !tplId || !optIn || !t?.usable} onClick={go}>{busy ? 'Sending…' : 'Send template'}</button></div>
        </div>
      </div>
    )}
  </>
}
