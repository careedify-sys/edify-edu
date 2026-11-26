'use client'
// WhatsApp inbox UI. Every value from WhatsApp is rendered as a React text
// node: no raw HTML injection, no auto-linking, so a message can never
// inject markup or a disguised link.
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import type { ConvRow, MessageRow } from '@/lib/whatsapp/inbox-repo'
import type { ThreadView, SettingsView } from '@/lib/whatsapp/inbox-service'
import type { ConnectionReport } from '@/lib/whatsapp/graph'
import {
  inboxList, inboxPoll, inboxThread, inboxSend, inboxMarkRead, inboxNote, inboxConsent, inboxArchive,
  inboxLinkLead, inboxCreateLead, inboxCallOutcome, inboxSchedule, inboxSettings, inboxSetSending,
  inboxUpdateBilling, inboxOverrideCap, inboxConnectionCheck, inboxDeleteContact,
} from './actions'

type Filter = 'open' | 'unread' | 'archived'
const POLL_MS = 15_000
const WINDOW_MS = 24 * 60 * 60 * 1000
const TZ = 'Asia/Kolkata'

// ── Formatting ──────────────────────────────────────────────────────────────

function fmtPhone(e164: string | null): string {
  if (!e164) return ''
  const d = e164.replace(/\D/g, '')
  if (/^91[6-9]\d{9}$/.test(d)) return `+91 ${d.slice(2, 7)} ${d.slice(7)}`
  return `+${d}`
}
function fmtTime(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const today = new Date()
  const sameDay = d.toLocaleDateString('en-IN', { timeZone: TZ }) === today.toLocaleDateString('en-IN', { timeZone: TZ })
  return sameDay
    ? d.toLocaleTimeString('en-IN', { timeZone: TZ, hour: 'numeric', minute: '2-digit' })
    : d.toLocaleDateString('en-IN', { timeZone: TZ, day: 'numeric', month: 'short' })
}
function fmtDateTime(iso: string | null): string {
  if (!iso) return ''
  return new Date(iso).toLocaleString('en-IN', { timeZone: TZ, day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' })
}
function fmtAgo(iso: string | null, now: number): string {
  if (!iso) return 'never'
  const m = Math.round((now - Date.parse(iso)) / 60_000)
  if (m < 1) return 'just now'
  if (m < 60) return `${m} min ago`
  const h = Math.round(m / 60)
  return h < 48 ? `${h} h ago` : `${Math.round(h / 24)} days ago`
}
const inr = (n: number | null | undefined, dp = 2) => n == null ? 'not set' : `₹${n.toLocaleString('en-IN', { minimumFractionDigits: dp, maximumFractionDigits: dp })}`
function windowLeft(lastInbound: string | null, now: number) {
  const t = lastInbound ? Date.parse(lastInbound) : NaN
  if (!Number.isFinite(t)) return { open: false, label: 'No message from the student yet' }
  const left = t + WINDOW_MS - now
  if (left <= 0) return { open: false, label: 'Reply window closed' }
  const h = Math.floor(left / 3_600_000), m = Math.floor((left % 3_600_000) / 60_000)
  return { open: true, label: `Reply window: ${h} h ${m} min left` }
}
const displayName = (c: Pick<ConvRow, 'lead_name' | 'profile_name' | 'username' | 'phone_e164'>) =>
  c.lead_name || c.profile_name || (c.username ? `@${c.username}` : '') || fmtPhone(c.phone_e164) || 'WhatsApp user'

const newRef = () => (typeof crypto !== 'undefined' && 'randomUUID' in crypto ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`)

// ── Small pieces ────────────────────────────────────────────────────────────

function Tick({ m }: { m: MessageRow }) {
  if (m.direction !== 'outbound') return null
  if (m.send_state === 'sending') return <span className="tick" title="Sending">○</span>
  if (m.send_state === 'unknown' && m.status_rank === 0) return <span className="tick warn" title="Meta did not confirm this message">?</span>
  if (m.status === 'failed' || (m.send_state === 'failed' && m.status_rank === 0)) return <span className="tick bad" title={m.error_title ?? 'Failed'}>!</span>
  if (m.status_rank >= 3) return <span className="tick read" title="Read">✓✓</span>
  if (m.status_rank === 2) return <span className="tick" title="Delivered">✓✓</span>
  if (m.status_rank === 1 || m.send_state === 'accepted') return <span className="tick" title="Sent">✓</span>
  return null
}

function MessageBubble({ m }: { m: MessageRow }) {
  const text = m.body ?? `[${m.type}]`
  return (
    <div className={`msg ${m.direction}`}>
      <div className="bubble">
        {m.type !== 'text' && m.type !== 'interactive' && <span className="mtype">{m.type}</span>}
        <span className="mtext">{text}</span>
        <span className="mmeta">
          {fmtTime(m.meta_timestamp ?? m.created_at)} <Tick m={m} />
        </span>
        {m.direction === 'outbound' && (m.status === 'failed' || m.send_state === 'failed') && (
          <span className="merr">{m.error_title ?? 'Not delivered'}{m.error_code ? ` (code ${m.error_code})` : ''}</span>
        )}
        {m.direction === 'outbound' && m.send_state === 'unknown' && m.status_rank === 0 && (
          <span className="merr">Not confirmed by Meta. Check before sending it again.</span>
        )}
      </div>
    </div>
  )
}

// ── Main component ──────────────────────────────────────────────────────────

export default function InboxClient(props: {
  mode: 'mock' | 'live'
  initialRows: ConvRow[]
  initialServerTime: string
  initialSettings: SettingsView | null
  loadError: string | null
}) {
  const [rows, setRows] = useState<ConvRow[]>(props.initialRows)
  const [filter, setFilter] = useState<Filter>('open')
  const [search, setSearch] = useState('')
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [thread, setThread] = useState<ThreadView | null>(null)
  const [settings, setSettings] = useState<SettingsView | null>(props.initialSettings)
  const [showSettings, setShowSettings] = useState(false)
  const [toast, setToast] = useState<{ text: string; bad?: boolean } | null>(props.loadError ? { text: props.loadError, bad: true } : null)
  const [now, setNow] = useState(() => Date.now())
  const [hasMore, setHasMore] = useState(props.initialRows.length >= 30)
  const since = useRef(props.initialServerTime)
  const selectedRef = useRef<string | null>(null)
  selectedRef.current = selectedId

  const say = useCallback((text: string, bad = false) => {
    setToast({ text, bad })
    window.setTimeout(() => setToast(t => (t?.text === text ? null : t)), bad ? 8000 : 3500)
  }, [])

  const listArgs = useCallback((more?: { at: string | null; id: string }) => ({
    status: filter === 'archived' ? 'archived' as const : 'open' as const,
    search, unreadOnly: filter === 'unread',
    beforeAt: more?.at ?? null, beforeId: more?.id ?? null,
  }), [filter, search])

  const reloadList = useCallback(async () => {
    const r = await inboxList(listArgs())
    if (r.ok) { setRows(r.rows); setHasMore(r.rows.length >= 30) } else say(r.error, true)
  }, [listArgs, say])

  const loadMore = async () => {
    const last = rows[rows.length - 1]
    if (!last) return
    const r = await inboxList(listArgs({ at: last.last_message_at, id: last.id }))
    if (r.ok) { setRows(prev => [...prev, ...r.rows.filter(x => !prev.some(p => p.id === x.id))]); setHasMore(r.rows.length >= 30) }
  }

  const reloadThread = useCallback(async (id: string) => {
    const r = await inboxThread(id)
    if (selectedRef.current !== id) return
    if (r.ok) setThread(r.thread)
    else say(r.error, true)
  }, [say])

  const reloadSettings = useCallback(async () => {
    const r = await inboxSettings()
    if (r.ok) setSettings(r.settings)
  }, [])

  // Search and filter changes reload the first page (debounced).
  const first = useRef(true)
  useEffect(() => {
    if (first.current) { first.current = false; return }
    const t = window.setTimeout(reloadList, 250)
    return () => window.clearTimeout(t)
  }, [reloadList])

  // Clock for the window countdown.
  useEffect(() => {
    const t = window.setInterval(() => setNow(Date.now()), 30_000)
    return () => window.clearInterval(t)
  }, [])

  // Poll every 15 s, only while the tab is visible. One cheap query when
  // nothing changed; list and thread reload only when something did.
  const threadRef = useRef<ThreadView | null>(null)
  threadRef.current = thread
  useEffect(() => {
    let busy = false
    const tick = async () => {
      if (busy || document.visibilityState !== 'visible') return
      busy = true
      try {
        const r = await inboxPoll(since.current)
        if (!r.ok) return
        since.current = r.serverTime
        const open = selectedRef.current
        const pendingTicks = threadRef.current?.messages.some(m =>
          m.direction === 'outbound' && m.status_rank < 3 && m.send_state !== 'failed' && Date.now() - Date.parse(m.created_at) < 10 * 60_000)
        if (r.changed.length) await reloadList()
        if (open && (r.changed.includes(open) || pendingTicks)) await reloadThread(open)
      } finally { busy = false }
    }
    const t = window.setInterval(tick, POLL_MS)
    const onVis = () => { if (document.visibilityState === 'visible') tick() }
    document.addEventListener('visibilitychange', onVis)
    return () => { window.clearInterval(t); document.removeEventListener('visibilitychange', onVis) }
  }, [reloadList, reloadThread])

  const select = async (c: ConvRow) => {
    setSelectedId(c.id)
    setThread(null)
    await reloadThread(c.id)
    if (c.unread_count > 0) {
      setRows(prev => prev.map(x => (x.id === c.id ? { ...x, unread_count: 0 } : x)))
      inboxMarkRead(c.id)
    }
  }

  const unreadTotal = useMemo(() => rows.reduce((n, r) => n + (r.unread_count > 0 ? 1 : 0), 0), [rows])
  const sweepStale = settings?.lastSweep ? now - Date.parse(settings.lastSweep.at) > 15 * 60_000 || !settings.lastSweep.ok : true

  return (
    <div className="wa">
      <header className="wa-top">
        <a href="/leads" className="wa-brand" title="Back to the CRM">
          <img src="/logos/university_logos/edify_logo_transparent_onlight.svg" alt="edifyedu.in" width={108} height={36} />
        </a>
        <h1 className="wa-title">WhatsApp inbox</h1>
        {props.mode === 'mock' && <span className="pill pill-amber">Mock data: nothing is sent or saved</span>}
        <nav className="wa-nav">
          <a href="/leads">Leads CRM</a>
          {settings && (
            <span className={`pill ${settings.sendingEnabled ? 'pill-green' : 'pill-muted'}`}>
              {settings.sendingEnabled ? 'Sending on' : 'Sending off'}
            </span>
          )}
          {settings && (
            <span className="pill pill-muted" title="Estimated charges this month against the cap">
              {inr(settings.spend.chargesInr)} of {inr(settings.spend.budgetInr, 0)}
            </span>
          )}
          {settings && sweepStale && <span className="pill pill-red" title="The retry job has not reported recently">Retry job: check</span>}
          <button className="btn btn-ghost" onClick={() => { setShowSettings(true); reloadSettings() }}>Settings</button>
        </nav>
      </header>

      {settings && !settings.migrationReady && (
        <div className="banner banner-red">The Phase 2 database migration has not been run, so spend limits and settings are missing. Sending stays blocked.</div>
      )}

      <div className={`wa-main ${selectedId ? 'has-thread' : ''}`}>
        {/* List */}
        <aside className="wa-list">
          <div className="wa-search">
            <input placeholder="Search name, @username or phone" value={search} onChange={e => setSearch(e.target.value)} aria-label="Search conversations" />
          </div>
          <div className="wa-tabs" role="tablist">
            {(['open', 'unread', 'archived'] as Filter[]).map(f => (
              <button key={f} role="tab" aria-selected={filter === f} className={`tab ${filter === f ? 'on' : ''}`} onClick={() => setFilter(f)}>
                {f === 'open' ? 'Open' : f === 'unread' ? `Unread${unreadTotal && filter !== 'unread' ? ` · ${unreadTotal}` : ''}` : 'Archived'}
              </button>
            ))}
          </div>
          <ul className="wa-rows">
            {rows.length === 0 && <li className="empty">No conversations{search ? ' match this search' : ' yet'}.</li>}
            {rows.map(c => {
              const w = windowLeft(c.last_inbound_at, now)
              return (
                <li key={c.id}>
                  <button className={`row ${selectedId === c.id ? 'on' : ''}`} onClick={() => select(c)}>
                    <span className="row-top">
                      <span className="row-name">{displayName(c)}</span>
                      <span className="row-time">{fmtTime(c.last_message_at)}</span>
                    </span>
                    <span className="row-bottom">
                      <span className="row-preview">{c.last_message_preview ?? ''}</span>
                      {c.unread_count > 0 && <span className="badge">{c.unread_count}</span>}
                    </span>
                    <span className="row-tags">
                      {c.phone_e164 ? <span className="tag">{fmtPhone(c.phone_e164)}</span> : <span className="tag tag-amber">No phone</span>}
                      {c.lead_id ? <span className="tag tag-navy">Lead · {c.lead_stage}</span> : <span className="tag">Not in CRM</span>}
                      {w.open && <span className="tag tag-green">Window open</span>}
                    </span>
                  </button>
                </li>
              )
            })}
          </ul>
          {hasMore && <button className="btn btn-ghost more" onClick={loadMore}>Load more</button>}
        </aside>

        {/* Thread */}
        <section className="wa-thread">
          {!selectedId && <div className="placeholder">Pick a conversation.</div>}
          {selectedId && !thread && <div className="placeholder">Loading…</div>}
          {thread && (
            <Thread key={thread.conv.id} thread={thread} settings={settings} now={now} say={say}
              onBack={() => { setSelectedId(null); setThread(null) }}
              onChanged={async () => { await reloadThread(thread.conv.id); await reloadList(); await reloadSettings() }} />
          )}
        </section>
      </div>

      {showSettings && settings && (
        <SettingsPanel settings={settings} mode={props.mode} now={now} say={say}
          onClose={() => setShowSettings(false)} onChanged={reloadSettings} />
      )}

      {toast && <div className={`toast ${toast.bad ? 'bad' : ''}`} role="status">{toast.text}</div>}
    </div>
  )
}

// ── Thread and contact panel ────────────────────────────────────────────────

function Thread({ thread, settings, now, say, onChanged, onBack }: {
  thread: ThreadView; settings: SettingsView | null; now: number
  say: (t: string, bad?: boolean) => void; onChanged: () => Promise<void>; onBack: () => void
}) {
  const { conv, contact, messages, lead } = thread
  const [text, setText] = useState('')
  const [busy, setBusy] = useState(false)
  const ref = useRef(newRef())
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView({ block: 'end' }) }, [messages.length])

  const w = windowLeft(conv.last_inbound_at, now)
  const optedOut = thread.consent.service && !thread.consent.service.granted
  const spend = settings?.spend
  const blocked =
    !settings ? 'Settings could not be loaded'
    : !settings.migrationReady ? 'Run the Phase 2 migration first'
    : !settings.sendingEnabled ? 'Sending is switched off (Settings)'
    : !w.open ? 'The 24-hour window is closed. A reply needs an approved template, which comes in a later phase.'
    : optedOut ? 'The student asked not to be messaged'
    : spend && !spend.next.allowed ? spend.next.reason
    : null

  const send = async (kind: 'text' | 'request_phone') => {
    if (busy) return
    setBusy(true)
    try {
      const r = await inboxSend({ convId: conv.id, clientRef: ref.current, kind, text })
      if (!r.ok) { say(r.error, true); return }
      ref.current = newRef()
      if (r.state === 'accepted') { if (kind === 'text') setText(''); say(kind === 'text' ? 'Sent' : 'Phone request sent') }
      else if (r.state === 'failed') say(r.error ?? 'Meta refused the message', true)
      else if (r.state === 'unknown') { if (kind === 'text') setText(''); say(r.error ?? 'Not confirmed', true) }
      else if (r.duplicate) say('Already sent')
      await onChanged()
    } catch {
      // Network error: keep the same reference so pressing Send again cannot duplicate.
      say('Connection problem. Press Send again; it will not send twice.', true)
    } finally { setBusy(false) }
  }

  const nextCost = spend?.next.paid ? `This reply costs about ${inr(spend.next.costInr, 3)}` : spend ? `This reply is free (${spend.freeUsed.toLocaleString('en-IN')} of ${spend.freePerMonth?.toLocaleString('en-IN') ?? '?'} free used this month)` : ''

  return (
    <div className="thread">
      <div className="thread-main">
        <div className="thread-head">
          <button className="btn btn-ghost back" onClick={onBack} aria-label="Back to list">←</button>
          <div>
            <div className="thread-name">{displayName(conv)}</div>
            <div className={`thread-window ${w.open ? 'open' : 'closed'}`}>{w.label}</div>
          </div>
          <button className="btn btn-ghost" onClick={async () => {
            const r = await inboxArchive(conv.id, conv.status !== 'archived')
            if (r.ok) { say(conv.status === 'archived' ? 'Moved back to Open' : 'Archived'); await onChanged() } else say(r.error, true)
          }}>{conv.status === 'archived' ? 'Unarchive' : 'Archive'}</button>
        </div>
        {thread.optOutHint && (
          <div className="banner banner-red">The student may have asked to stop (for example, "STOP"). Record it under Consent, Replies on WhatsApp: No.</div>
        )}
        <div className="messages">
          {messages.length === 0 && <div className="placeholder">No messages stored yet.</div>}
          {messages.map(m => <MessageBubble key={m.id} m={m} />)}
          <div ref={end} />
        </div>
        <div className="composer">
          {blocked ? <div className="composer-note">{blocked}</div> : <div className="composer-note muted">{nextCost}</div>}
          <div className="composer-row">
            <textarea value={text} onChange={e => setText(e.target.value)} maxLength={4096} rows={3}
              placeholder={blocked ? 'Replying is not available right now' : 'Type a reply. It is sent only when you press Send.'}
              disabled={!!blocked || busy} aria-label="Reply" />
            <button className="btn btn-orange" disabled={!!blocked || busy || !text.trim()} onClick={() => send('text')}>{busy ? 'Sending…' : 'Send'}</button>
          </div>
        </div>
      </div>
      <ContactPanel thread={thread} canMessage={!blocked} busy={busy} say={say} onChanged={onChanged} onRequestPhone={() => send('request_phone')} />
    </div>
  )
}

const OUTCOMES = ['No answer', 'Busy', 'Callback', 'Interested', 'Follow-up', 'Next session', 'Registered', 'Enrolled', 'Not interested', 'Add note']
const PHONE_SOURCE: Record<string, string> = {
  webhook: 'from WhatsApp', contact_request: 'shared by the student', crm_link: 'from the CRM', import: 'imported',
}
const CONSENT_LABEL: Record<string, string> = {
  counselling_call: 'Counselling calls', service: 'Replies on WhatsApp',
}
const SOURCE_LABEL: Record<string, string> = {
  lead_form: 'Enquiry form', whatsapp_message: 'Said so on WhatsApp', phone_call: 'Said so on a call', admin_entry: 'Other (explain)',
}

function ContactPanel({ thread, canMessage, busy, say, onChanged, onRequestPhone }: {
  thread: ThreadView; canMessage: boolean; busy: boolean
  say: (t: string, bad?: boolean) => void; onChanged: () => Promise<void>; onRequestPhone: () => void
}) {
  const { contact, lead } = thread
  const phone = contact.phone_e164
  const callConsent = thread.consent.counselling_call

  const copy = async (v: string, what: string) => {
    try { await navigator.clipboard.writeText(v); say(`${what} copied`) } catch { say('Copy failed. Select the text instead.', true) }
  }
  const callNow = (e: React.MouseEvent) => {
    if (callConsent?.granted) return
    const msg = callConsent && !callConsent.granted
      ? 'This student said no to calls. Call anyway?'
      : 'No call consent is recorded. Starting a chat is not consent to a call. Call anyway?'
    if (!window.confirm(msg)) e.preventDefault()
  }

  return (
    <aside className="panel">
      <section className="card">
        <h2>Contact</h2>
        <div className="pname">{contact.profile_name || 'No WhatsApp name'}</div>
        {phone ? (
          <>
            <div className="phone num">{fmtPhone(phone)}</div>
            <div className="muted small">Number {PHONE_SOURCE[contact.phone_source ?? ''] ?? 'on file'}</div>
            <div className="btn-row">
              <a className="btn btn-navy" href={`tel:${phone}`} onClick={callNow}>Call now</a>
              <button className="btn btn-ghost" onClick={() => copy(phone, 'Number')}>Copy number</button>
            </div>
          </>
        ) : (
          <>
            <div className="phone muted">Phone hidden</div>
            <p className="muted small">This student uses a WhatsApp username, so Meta does not share the number. You can ask; sharing is up to them.</p>
            <button className="btn btn-orange" disabled={!canMessage || busy} onClick={onRequestPhone}>Ask for phone number</button>
          </>
        )}
        {contact.username && <div className="kv"><span>Username</span><span>@{contact.username}</span></div>}
        {contact.bsuid && (
          <div className="kv"><span>WhatsApp ID</span><span className="mono">{contact.bsuid} <button className="link" onClick={() => copy(contact.bsuid!, 'ID')}>copy</button></span></div>
        )}
      </section>

      <ConsentCard thread={thread} say={say} onChanged={onChanged} />
      {lead ? <LeadCard thread={thread} say={say} onChanged={onChanged} /> : <LinkLeadCard thread={thread} say={say} onChanged={onChanged} />}
      <NotesCard thread={thread} say={say} onChanged={onChanged} />
      <section className="card">
        <h2>Privacy request</h2>
        <p className="muted small">Deletes this chat, its notes, consent records and the contact. The CRM lead is kept. Owner only. This cannot be undone.</p>
        <button className="btn btn-ghost" onClick={async () => {
          const typed = window.prompt('Type DELETE to remove all WhatsApp data held for this contact.')
          if (typed == null) return
          const r = await inboxDeleteContact(contact.id, typed)
          if (r.ok) { say('WhatsApp data deleted'); window.location.reload() } else say(r.error, true)
        }}>Delete WhatsApp data</button>
      </section>
    </aside>
  )
}

function ConsentCard({ thread, say, onChanged }: { thread: ThreadView; say: (t: string, bad?: boolean) => void; onChanged: () => Promise<void> }) {
  const [open, setOpen] = useState<null | 'counselling_call' | 'service'>(null)
  const [granted, setGranted] = useState(true)
  const [source, setSource] = useState('whatsapp_message')
  const [evidence, setEvidence] = useState('')
  const save = async () => {
    if (!open) return
    const r = await inboxConsent({ contactId: thread.contact.id, purpose: open, granted, source, evidence })
    if (r.ok) { say('Recorded'); setOpen(null); setEvidence(''); await onChanged() } else say(r.error, true)
  }
  return (
    <section className="card">
      <h2>Consent</h2>
      {(['counselling_call', 'service'] as const).map(p => {
        const c = thread.consent[p]
        return (
          <div key={p} className="consent-row">
            <span>{CONSENT_LABEL[p]}</span>
            <span className={`chip ${!c ? 'chip-amber' : c.granted ? 'chip-green' : 'chip-red'}`}
              title={c ? `${SOURCE_LABEL[c.source]}: ${c.evidence ?? ''} (${fmtDateTime(c.recorded_at)})` : 'Nothing recorded'}>
              {!c ? 'Not recorded' : c.granted ? 'Yes' : 'No'}
            </span>
            <button className="link" onClick={() => { setOpen(p); setGranted(true) }}>Record</button>
          </div>
        )
      })}
      <p className="muted small">A chat on its own is not consent to calls or promotions. Record what the student actually said.</p>
      {open && (
        <div className="form">
          <div className="muted small">{CONSENT_LABEL[open]}</div>
          <label><input type="radio" checked={granted} onChange={() => setGranted(true)} /> Agreed</label>
          <label><input type="radio" checked={!granted} onChange={() => setGranted(false)} /> Refused or withdrew</label>
          <select value={source} onChange={e => setSource(e.target.value)} aria-label="Where it came from">
            {Object.entries(SOURCE_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
          </select>
          <input value={evidence} onChange={e => setEvidence(e.target.value)} maxLength={500} placeholder="Evidence, e.g. 'Asked me to call after 6 pm, 2 Dec'" aria-label="Evidence" />
          <div className="btn-row">
            <button className="btn btn-navy" onClick={save}>Save</button>
            <button className="btn btn-ghost" onClick={() => setOpen(null)}>Cancel</button>
          </div>
        </div>
      )}
    </section>
  )
}

function LeadCard({ thread, say, onChanged }: { thread: ThreadView; say: (t: string, bad?: boolean) => void; onChanged: () => Promise<void> }) {
  const lead = thread.lead!
  const [outcome, setOutcome] = useState('No answer')
  const [note, setNote] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('')
  const [busy, setBusy] = useState(false)
  const save = async () => {
    setBusy(true)
    const r = await inboxCallOutcome({ contactId: thread.contact.id, outcome, note, date: date || null, time: time || null })
    setBusy(false)
    if (r.ok) { say('Saved to the lead'); setNote(''); setDate(''); setTime(''); await onChanged() } else say(r.error, true)
  }
  const chip = async (c: 'tomorrow' | 'in3' | 'nextweek' | 'none') => {
    const r = await inboxSchedule({ contactId: thread.contact.id, chip: c })
    if (r.ok) { say(c === 'none' ? 'Reminder cleared' : 'Reminder set'); await onChanged() } else say(r.error, true)
  }
  return (
    <section className="card">
      <h2>CRM lead</h2>
      <div className="kv"><span>Name</span><span>{lead.name}</span></div>
      <div className="kv"><span>Stage</span><span>{lead.stage}</span></div>
      {(lead.program || lead.university) && <div className="kv"><span>Interest</span><span>{[lead.program, lead.university].filter(Boolean).join(' · ')}</span></div>}
      <div className="kv"><span>Next call</span><span>{lead.next_call_date ? `${lead.next_call_date}${lead.next_call_time ? ` ${lead.next_call_time.slice(0, 5)}` : ''}` : 'None'}</span></div>
      <div className="btn-row wrap">
        <button className="chipbtn" onClick={() => chip('tomorrow')}>Call tomorrow</button>
        <button className="chipbtn" onClick={() => chip('in3')}>In 3 days</button>
        <button className="chipbtn" onClick={() => chip('nextweek')}>Next week</button>
        <button className="chipbtn" onClick={() => chip('none')}>Clear</button>
      </div>
      <div className="form">
        <div className="muted small">Log a call or follow-up note</div>
        <select value={outcome} onChange={e => setOutcome(e.target.value)} aria-label="Call outcome">
          {OUTCOMES.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
        <textarea rows={2} value={note} onChange={e => setNote(e.target.value)} maxLength={2000} placeholder="What was said" aria-label="Note" />
        <div className="btn-row">
          <input type="date" value={date} onChange={e => setDate(e.target.value)} aria-label="Next call date" />
          <input type="time" value={time} onChange={e => setTime(e.target.value)} aria-label="Next call time" />
        </div>
        <button className="btn btn-navy" disabled={busy} onClick={save}>Save to lead</button>
      </div>
      {thread.leadActivity.length > 0 && (
        <ul className="activity">
          {thread.leadActivity.map(a => (
            <li key={a.id}><span className="muted small">{a.occurred_on}</span> {a.outcome ?? 'Note'}{a.remark ? `: ${a.remark}` : ''}</li>
          ))}
        </ul>
      )}
      <div className="btn-row">
        <a className="link" href="/leads">Open the CRM</a>
        <button className="link" onClick={async () => {
          if (!window.confirm('Unlink this conversation from the lead? The lead itself is kept.')) return
          const r = await inboxLinkLead(thread.contact.id, null)
          if (r.ok) { say('Unlinked'); await onChanged() } else say(r.error, true)
        }}>Unlink</button>
      </div>
    </section>
  )
}

function LinkLeadCard({ thread, say, onChanged }: { thread: ThreadView; say: (t: string, bad?: boolean) => void; onChanged: () => Promise<void> }) {
  const { contact } = thread
  const [name, setName] = useState(contact.profile_name ?? '')
  const [program, setProgram] = useState('')
  const [university, setUniversity] = useState('')
  const [busy, setBusy] = useState(false)
  const link = async (leadId: string) => {
    const r = await inboxLinkLead(contact.id, leadId)
    if (r.ok) { say('Linked to the lead'); await onChanged() } else say(r.error, true)
  }
  const create = async () => {
    setBusy(true)
    const r = await inboxCreateLead({ contactId: contact.id, name, program, university })
    setBusy(false)
    if (r.ok) { say(r.existing ? 'A lead with this number already existed. Linked it.' : 'Lead created'); await onChanged() } else say(r.error, true)
  }
  return (
    <section className="card">
      <h2>CRM lead</h2>
      {thread.leadMatches.length > 0 && (
        <div className="form">
          <div className="muted small">A lead has this exact number:</div>
          {thread.leadMatches.map(l => (
            <div key={l.id} className="consent-row">
              <span>{l.name} · {l.stage}</span>
              <button className="btn btn-navy" onClick={() => link(l.id)}>Link</button>
            </div>
          ))}
        </div>
      )}
      {thread.leadMatches.length > 0 ? null : contact.phone_e164 ? (
        <div className="form">
          <div className="muted small">Create a new lead from this chat</div>
          <input value={name} onChange={e => setName(e.target.value)} maxLength={200} placeholder="Name" aria-label="Lead name" />
          <input value={program} onChange={e => setProgram(e.target.value)} maxLength={200} placeholder="Programme (optional)" aria-label="Programme" />
          <input value={university} onChange={e => setUniversity(e.target.value)} maxLength={200} placeholder="University (optional)" aria-label="University" />
          <button className="btn btn-navy" disabled={busy} onClick={create}>Create lead</button>
        </div>
      ) : (
        <p className="muted small">A lead needs a phone number. Ask the student to share it.</p>
      )}
    </section>
  )
}

function NotesCard({ thread, say, onChanged }: { thread: ThreadView; say: (t: string, bad?: boolean) => void; onChanged: () => Promise<void> }) {
  const [body, setBody] = useState('')
  const add = async () => {
    const r = await inboxNote(thread.conv.id, body)
    if (r.ok) { setBody(''); await onChanged() } else say(r.error, true)
  }
  return (
    <section className="card">
      <h2>Internal notes</h2>
      <p className="muted small">Only you see these. They are never sent.</p>
      <textarea rows={2} value={body} onChange={e => setBody(e.target.value)} maxLength={4000} placeholder="Add a note" aria-label="New note" />
      <button className="btn btn-ghost" disabled={!body.trim()} onClick={add}>Add note</button>
      <ul className="notes">
        {thread.notes.map(n => <li key={n.id}><span className="muted small">{fmtDateTime(n.created_at)}</span><span className="note-body">{n.body}</span></li>)}
      </ul>
    </section>
  )
}

// ── Settings ────────────────────────────────────────────────────────────────

function SettingsPanel({ settings, mode, now, say, onClose, onChanged }: {
  settings: SettingsView; mode: 'mock' | 'live'; now: number
  say: (t: string, bad?: boolean) => void; onClose: () => void; onChanged: () => Promise<void>
}) {
  const s = settings.spend
  const r = settings.rates
  const [f, setF] = useState({
    capInr: String(settings.capInr ?? ''), service: String(r?.service ?? ''), utility: String(r?.utility ?? ''),
    marketing: String(r?.marketing ?? ''), authentication: String(r?.authentication ?? ''),
    effectiveFrom: r?.effective_from ?? '', verifiedOn: r?.verified_on ?? '', source: r?.source ?? '',
    freePerMonth: String(settings.freePerMonth ?? ''), freeSource: settings.freeSource ?? '', timezone: settings.timezone,
  })
  const [extra, setExtra] = useState('')
  const [reason, setReason] = useState('')
  const [report, setReport] = useState<ConnectionReport | null>(null)
  const [checking, setChecking] = useState(false)
  const set = (k: keyof typeof f) => (e: React.ChangeEvent<HTMLInputElement>) => setF(p => ({ ...p, [k]: e.target.value }))

  const saveBilling = async () => {
    const res = await inboxUpdateBilling({
      capInr: Number(f.capInr), service: Number(f.service), utility: Number(f.utility), marketing: Number(f.marketing),
      authentication: Number(f.authentication), effectiveFrom: f.effectiveFrom, verifiedOn: f.verifiedOn, source: f.source,
      freePerMonth: Number(f.freePerMonth), freeSource: f.freeSource, timezone: f.timezone,
    })
    if (res.ok) { say('Billing settings saved'); await onChanged() } else say(res.error, true)
  }
  const toggle = async () => {
    const on = !settings.sendingEnabled
    if (on && !window.confirm('Switch sending on? Replies are still sent only when you press Send, never automatically.')) return
    const res = await inboxSetSending(on)
    if (res.ok) { say(on ? 'Sending switched on' : 'Sending switched off'); await onChanged() } else say(res.error, true)
  }
  const override = async () => {
    const res = await inboxOverrideCap(Number(extra), reason)
    if (res.ok) { say(Number(extra) === 0 ? 'Override removed' : 'Cap raised for this month'); setExtra(''); setReason(''); await onChanged() } else say(res.error, true)
  }
  const check = async () => {
    setChecking(true)
    const res = await inboxConnectionCheck()
    setChecking(false)
    if (res.ok) setReport(res.report); else say(res.error, true)
  }

  return (
    <div className="modal" role="dialog" aria-modal="true" aria-label="Inbox settings">
      <div className="modal-card">
        <div className="modal-head">
          <h2>Settings</h2>
          <button className="btn btn-ghost" onClick={onClose}>Close</button>
        </div>

        <section className="card">
          <h3>This month</h3>
          <div className="stats">
            <div><span className="stat">{s.freeUsed.toLocaleString('en-IN')}</span><span className="muted small">free messages used{s.freeLeft != null ? `, ${s.freeLeft.toLocaleString('en-IN')} left` : ''}</span></div>
            <div><span className="stat">{s.paidMessages.toLocaleString('en-IN')}</span><span className="muted small">paid messages (Meta reports {s.metaBillable.toLocaleString('en-IN')})</span></div>
            <div><span className="stat">{inr(s.chargesInr)}</span><span className="muted small">estimated charges</span></div>
            <div><span className="stat">{inr(s.remainingInr)}</span><span className="muted small">left of {inr(s.budgetInr, 0)}{s.overrideActive ? ' (raised this month)' : ''}</span></div>
          </div>
          <p className="muted small">An estimate from delivered and in-flight replies; Meta&apos;s invoice is final. Month starts {fmtDateTime(s.monthStart)} ({s.timezone}).</p>
        </section>

        <section className="card">
          <h3>Sending</h3>
          <div className="consent-row">
            <span>{settings.sendingEnabled ? 'Manual replies are switched on.' : 'Manual replies are switched off.'}</span>
            <button className={`btn ${settings.sendingEnabled ? 'btn-ghost' : 'btn-orange'}`} onClick={toggle}>{settings.sendingEnabled ? 'Switch off' : 'Switch on'}</button>
          </div>
          <p className="muted small">There are no automatic replies and no bulk campaigns. Every message is typed and sent by a person.</p>
        </section>

        <section className="card">
          <h3>Cap and rates</h3>
          <div className="grid2">
            <label>Monthly cap (₹)<input inputMode="decimal" value={f.capInr} onChange={set('capInr')} /></label>
            <label>Free service messages a month<input inputMode="numeric" value={f.freePerMonth} onChange={set('freePerMonth')} /></label>
            <label>Service rate (₹)<input inputMode="decimal" value={f.service} onChange={set('service')} /></label>
            <label>Utility rate (₹)<input inputMode="decimal" value={f.utility} onChange={set('utility')} /></label>
            <label>Marketing rate (₹)<input inputMode="decimal" value={f.marketing} onChange={set('marketing')} /></label>
            <label>Authentication rate (₹)<input inputMode="decimal" value={f.authentication} onChange={set('authentication')} /></label>
            <label>Rates effective from<input value={f.effectiveFrom} onChange={set('effectiveFrom')} placeholder="2026-10-01" /></label>
            <label>Checked on<input value={f.verifiedOn} onChange={set('verifiedOn')} placeholder="2026-11-26" /></label>
            <label className="span2">Rate source<input value={f.source} onChange={set('source')} /></label>
            <label className="span2">Free allowance source<input value={f.freeSource} onChange={set('freeSource')} /></label>
            <label>Billing time zone<input value={f.timezone} onChange={set('timezone')} /></label>
          </div>
          <p className="muted small">Rates come from Meta&apos;s INR rate card for India. Meta can change them on the first day of any quarter, so check the card then.</p>
          <button className="btn btn-navy" onClick={saveBilling}>Save</button>
        </section>

        <section className="card">
          <h3>Raise the cap for this month</h3>
          {settings.override && s.overrideActive && <p className="small">Raised by {inr(settings.override.extra_inr, 0)} on {fmtDateTime(settings.override.at)}{settings.override.reason ? `: ${settings.override.reason}` : ''}</p>}
          <div className="grid2">
            <label>Extra (₹, 0 removes it)<input inputMode="decimal" value={extra} onChange={e => setExtra(e.target.value)} /></label>
            <label>Reason<input value={reason} onChange={e => setReason(e.target.value)} maxLength={300} /></label>
          </div>
          <button className="btn btn-ghost" onClick={override}>Apply</button>
        </section>

        <section className="card">
          <h3>Health</h3>
          <div className="kv"><span>Retry job</span>
            <span className={settings.lastSweep && settings.lastSweep.ok && now - Date.parse(settings.lastSweep.at) < 15 * 60_000 ? 'ok' : 'bad'}>
              {settings.lastSweep ? `Last ran ${fmtAgo(settings.lastSweep.at, now)}${settings.lastSweep.ok ? '' : ', with an error'}` : 'No run recorded yet'}
            </span>
          </div>
          {settings.lastSweep && (
            <p className="muted small">Retried {String(settings.lastSweep.retried ?? 0)}, stuck after 5 tries {String(settings.lastSweep.exhausted ?? 0)}. It should run every 5 minutes.</p>
          )}
          <button className="btn btn-ghost" disabled={checking} onClick={check}>{checking ? 'Checking…' : 'Check WhatsApp connection'}</button>
          {mode === 'mock' && <p className="muted small">Mock mode: the check talks to a fake Meta, so its answers mean nothing.</p>}
          {report && (
            <div className="report">
              {Object.entries(report.vars).map(([k, v]) => (
                <div key={k} className="kv"><span className="mono">{k}</span><span className={v === 'ok' ? 'ok' : v === 'unchecked' ? 'muted' : 'bad'}>{v}</span></div>
              ))}
              {report.token && (
                <div className="kv"><span>Token</span><span>{report.token.type ?? 'unknown type'}, expires {report.token.expires ?? 'unknown'}{report.token.extraScopes.length ? `, extra scopes: ${report.token.extraScopes.join(', ')}` : ''}</span></div>
              )}
              {report.phone && <div className="kv"><span>Number</span><span>{report.phone.displayNumber} · {report.phone.verifiedName} · quality {report.phone.quality ?? 'unknown'}</span></div>}
              {report.waba && <div className="kv"><span>Account</span><span>{report.waba.name} · billing {report.waba.currency ?? 'unknown'}</span></div>}
              {report.problems.length === 0 ? <p className="ok small">No problems found.</p> : (
                <ul className="problems">{report.problems.map(p => <li key={p}>{p}</li>)}</ul>
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  )
}
