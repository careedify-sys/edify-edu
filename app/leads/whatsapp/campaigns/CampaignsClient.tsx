'use client'
import { useState } from 'react'
import { WaShell, useToast, fmt, when } from '../WaShell'
import { waCreateCampaign, waAddRecipients } from '../campaign-actions'
import { STATUS_TEXT } from '@/lib/whatsapp/campaign-text'
import type { CampaignRow, ListRow, Stats } from '@/lib/whatsapp/campaign-repo'

const PILL: Record<string, string> = { draft: 'pill-muted', approved: 'pill-amber', sending: 'pill-green', paused: 'pill-red', completed: 'pill-muted', cancelled: 'pill-muted' }

export default function CampaignsClient({ mode, campaigns, lists, presetList, enabled, error }: {
  mode: 'mock' | 'live'; campaigns: Array<CampaignRow & { stats: Stats | null }>; lists: ListRow[]; presetList: string | null; enabled: boolean; error: string | null
}) {
  const { show, node } = useToast()
  const [name, setName] = useState('')
  const [list, setList] = useState(presetList ?? '')
  const [busy, setBusy] = useState(false)

  async function create() {
    setBusy(true)
    const r = await waCreateCampaign(name)
    if (!r.ok) { setBusy(false); show(r.error, true); return }
    if (list) {
      const a = await waAddRecipients(r.id, { listId: list })
      if (!a.ok) show(a.error, true)
    }
    window.location.href = `/leads/whatsapp/campaigns/${r.id}`
  }

  return (
    <WaShell active="campaigns" title="Referral campaigns" mode={mode} error={error}>
      <div className={`notice ${enabled ? 'notice-green' : 'notice-amber'}`}>
        {enabled
          ? 'Campaign sending is ON. Approved campaigns send in batches every 5 minutes, within your budgets.'
          : 'Campaign sending is OFF (Campaign settings). You can prepare and approve campaigns; nothing is sent until you switch it on.'}
      </div>
      <section className="card">
        <h2 className="big">New campaign</h2>
        <div className="formgrid">
          <label>Campaign name<input value={name} maxLength={100} onChange={e => setName(e.target.value)} placeholder="e.g. December referrals, MBA 2024 batch" /></label>
          <label>Recipients from list (optional)
            <select value={list} onChange={e => setList(e.target.value)}>
              <option value="">Add later</option>
              {lists.map(l => <option key={l.id} value={l.id}>{l.name} ({fmt(l.members)})</option>)}
            </select>
          </label>
        </div>
        <div className="btn-row"><button className="btn btn-orange" disabled={busy || !name.trim()} onClick={create}>Create draft</button><span className="small muted">A draft sends nothing.</span></div>
      </section>
      <section className="card">
        <h2 className="big">Campaigns</h2>
        <div className="tblwrap">
          <table className="tbl">
            <thead><tr><th>Name</th><th>Status</th><th className="num">Recipients</th><th className="num">Sent</th><th className="num">Delivered</th><th className="num">Read</th><th className="num">Replies</th><th>Created</th></tr></thead>
            <tbody>
              {campaigns.map(c => (
                <tr key={c.id}>
                  <td><a href={`/leads/whatsapp/campaigns/${c.id}`}>{c.name}</a></td>
                  <td><span className={`pill ${PILL[c.status]}`}>{STATUS_TEXT[c.status]}</span></td>
                  <td className="num">{c.stats ? fmt(c.stats.total) : ''}</td>
                  <td className="num">{c.stats ? fmt(c.stats.sent) : ''}</td>
                  <td className="num">{c.stats ? fmt(c.stats.delivered) : ''}</td>
                  <td className="num">{c.stats ? fmt(c.stats.read) : ''}</td>
                  <td className="num">{c.stats ? fmt(c.stats.replies) : ''}</td>
                  <td className="small muted">{when(c.created_at)}</td>
                </tr>
              ))}
              {!campaigns.length && <tr><td colSpan={8} className="muted">No campaigns yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
      {node}
    </WaShell>
  )
}
