'use client'
// Auto-reply controls: global switch, rules, per-chat stop list and history.
import { useState } from 'react'
import { WaShell, useToast, when } from '../WaShell'
import { autoLoad, autoSetEnabled, autoSaveRule, autoSetConversation } from '../automation-actions'
import { RULE_LABEL, REASON_TEXT, type AutoRuleKey } from '@/lib/whatsapp/auto-labels'

type Data = Extract<Awaited<ReturnType<typeof autoLoad>>, { ok: true }>

export default function AutomationClient({ mode, initial, error }: { mode: 'mock' | 'live'; initial: Data | null; error: string | null }) {
  const { show, node } = useToast()
  const [d, setD] = useState<Data | null>(initial)
  const [busy, setBusy] = useState(false)
  const [confirm, setConfirm] = useState('')
  const [edit, setEdit] = useState<Record<string, { enabled: boolean; keywords: string; reply: string }>>(() =>
    Object.fromEntries((initial?.rules ?? []).map(r => [r.key, { enabled: r.enabled, keywords: r.keywords.join(', '), reply: r.reply }])))

  const reload = async () => { const r = await autoLoad(); if (r.ok) setD(r); else show(r.error, true) }
  const act = async (fn: () => Promise<{ ok: boolean; error?: string }>, done: string) => {
    setBusy(true)
    try { const r = await fn(); if (!r.ok) { show(r.error ?? 'Failed.', true); return } show(done); await reload() } finally { setBusy(false) }
  }

  return (
    <WaShell active="automation" title="Auto-replies" mode={mode} error={error}>
      {node}
      {d && <>
        <section className="card">
          <h2 className="big">Auto-replies are {d.enabled ? 'ON' : 'OFF'}</h2>
          <p className="small">They answer replies to referral campaigns only: Interested, Know More, Reward and Call Me. STOP always opts the student out and is never answered.
            Anything else is left for you. At most 4 automatic replies per chat, only inside the 24-hour window. Your own reply in a chat stops auto-replies there.</p>
          {!d.sending && <div className="notice notice-amber">Sending is switched off in Inbox settings, so auto-replies cannot send even when on.</div>}
          {d.owner ? (
            d.enabled
              ? <div className="btn-row"><button className="btn btn-navy" disabled={busy} onClick={() => act(() => autoSetEnabled(false, ''), 'Auto-replies switched off')}>Switch off</button></div>
              : <div className="btn-row"><input className="field" style={{ width: 120 }} placeholder="Type ON" value={confirm} onChange={e => setConfirm(e.target.value)} aria-label="Type ON to confirm" />
                <button className="btn btn-orange" disabled={busy || confirm !== 'ON'} onClick={() => act(async () => { const r = await autoSetEnabled(true, confirm); if (r.ok) setConfirm(''); return r }, 'Auto-replies switched on')}>Switch on</button>
                <span className="small muted">Keep off until supervised testing passes.</span></div>
          ) : <p className="small muted">Only the owner can switch auto-replies on or off.</p>}
        </section>

        {d.rules.map(r => {
          const e = edit[r.key] ?? { enabled: r.enabled, keywords: r.keywords.join(', '), reply: r.reply }
          const set = (p: Partial<typeof e>) => setEdit(x => ({ ...x, [r.key]: { ...e, ...p } }))
          return (
            <section className="card" key={r.key}>
              <div className="btn-row" style={{ justifyContent: 'space-between' }}>
                <h3>{RULE_LABEL[r.key as AutoRuleKey]}</h3>
                <span className={`pill ${r.enabled ? 'pill-green' : 'pill-muted'}`}>{r.enabled ? 'Rule on' : 'Rule off'}</span>
              </div>
              <label className="small">Keywords (comma separated; a keyword matches the whole message or a short message of up to 6 words)
                <textarea className="field" rows={2} value={e.keywords} disabled={!d.owner} onChange={x => set({ keywords: x.target.value })} style={{ width: '100%' }} /></label>
              <label className="small">Reply ({e.reply.length}/1024)
                <textarea className="field" rows={5} value={e.reply} disabled={!d.owner} maxLength={1024} onChange={x => set({ reply: x.target.value })} style={{ width: '100%' }} /></label>
              {d.owner && <div className="btn-row">
                <label className="small"><input type="checkbox" checked={e.enabled} onChange={x => set({ enabled: x.target.checked })} /> Rule on</label>
                <button className="btn btn-navy" disabled={busy} onClick={() => act(() => autoSaveRule(r.key, e), 'Rule saved')}>Save rule</button>
                {r.updated_at && <span className="small muted">Last saved {when(r.updated_at)}{r.updated_by ? ` by ${r.updated_by}` : ''}</span>}
              </div>}
            </section>
          )
        })}

        <section className="card">
          <h3>Chats where auto-replies are stopped</h3>
          <p className="small muted">A chat stops automatically when you reply in it. Resume only if you want automation back in that chat.</p>
          {d.stopped.length === 0 ? <p className="small">None.</p> : (
            <ul className="small" style={{ listStyle: 'none', padding: 0 }}>
              {d.stopped.map(c => <li key={c.id} className="btn-row" style={{ borderTop: '1px solid var(--line)', padding: '6px 0' }}>
                <a href={`/leads/whatsapp?c=${c.id}`}>{c.contact_name ?? 'Chat'}</a>
                <button className="btn btn-ghost" disabled={busy} onClick={() => act(() => autoSetConversation(c.id, false), 'Auto-replies resumed for this chat')}>Resume</button>
              </li>)}
            </ul>
          )}
        </section>

        <section className="card">
          <h3>History (latest 100)</h3>
          <div className="tblwrap">
            <table className="tbl">
              <thead><tr><th>When</th><th>Chat</th><th>Rule</th><th>Result</th><th /></tr></thead>
              <tbody>
                {d.history.length === 0 && <tr><td colSpan={5} className="muted">Nothing yet.</td></tr>}
                {d.history.map(h => <tr key={h.inbound_message_id}>
                  <td>{when(h.created_at)}</td>
                  <td><a href={`/leads/whatsapp?c=${h.conversation_id}`}>{h.contact_name ?? 'Chat'}</a></td>
                  <td>{RULE_LABEL[h.rule as AutoRuleKey] ?? 'None'}</td>
                  <td>{h.state === 'sent' ? <span className="chip chip-green">Answered</span> : h.state === 'failed' ? <span className="chip chip-red">{REASON_TEXT[h.reason ?? 'failed'] ?? 'Failed'}</span>
                    : h.state === 'claimed' ? <span className="chip chip-amber">Sending</span> : <span className="small muted">{REASON_TEXT[h.reason ?? ''] ?? h.reason ?? 'Skipped'}</span>}</td>
                  <td>{!d.stopped.some(s => s.id === h.conversation_id) && <button className="btn btn-ghost" disabled={busy} onClick={() => act(() => autoSetConversation(h.conversation_id, true), 'Auto-replies stopped for this chat')}>Stop for this chat</button>}</td>
                </tr>)}
              </tbody>
            </table>
          </div>
        </section>
      </>}
    </WaShell>
  )
}
