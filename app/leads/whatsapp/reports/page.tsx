import type { Metadata } from 'next'
import '../whatsapp.css'
import { WaShell } from '../WaShell'
import { fmt, pct, when } from '../format'
import { waCampaigns } from '../campaign-actions'
import { waMode } from '../mode'
import { STATUS_TEXT } from '@/lib/whatsapp/campaign-text'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = { title: 'Reports · WhatsApp · edifyedu.in', robots: { index: false, follow: false } }

// Every figure comes from Meta message ids and status webhooks
// (wa_campaign_stats). Nothing here is estimated except where it says so.
export default async function ReportsPage() {
  const r = await waCampaigns()
  const rows = r.ok ? r.campaigns.filter(c => c.status !== 'draft') : []
  return (
    <WaShell active="reports" title="Campaign reports" mode={waMode()} error={r.ok ? null : r.error}>
      <div className="notice notice-amber">
        Delivered and read come from Meta&apos;s status updates; a student can turn read receipts off, so read is a floor. A reply counts only when the student answered the campaign message or pressed its button. Export a campaign for the per-number detail.
      </div>
      <section className="card">
        <div className="tblwrap">
          <table className="tbl">
            <thead><tr>
              <th>Campaign</th><th>Status</th><th className="num">Recipients</th><th className="num">Sent</th><th className="num">Delivered</th><th className="num">Read</th>
              <th className="num">Replies</th><th className="num">Failed</th><th className="num">Unknown</th><th className="num">Opt-outs</th><th className="num">Delivery rate</th><th className="num">Read rate</th><th className="num">Response rate</th><th></th>
            </tr></thead>
            <tbody>
              {rows.map(c => {
                const s = c.stats
                return (
                  <tr key={c.id}>
                    <td><a href={`/leads/whatsapp/campaigns/${c.id}`}>{c.name}</a><div className="small muted">{when(c.started_at ?? c.approved_at)}</div></td>
                    <td>{STATUS_TEXT[c.status]}</td>
                    {s ? (
                      <>
                        <td className="num">{fmt(s.total)}</td><td className="num">{fmt(s.sent)}</td><td className="num">{fmt(s.delivered)}</td><td className="num">{fmt(s.read)}</td>
                        <td className="num">{fmt(s.replies)}</td><td className="num">{fmt(s.failed)}</td><td className="num">{fmt(s.unknown)}</td><td className="num">{fmt(s.opt_outs)}</td>
                        <td className="num">{pct(s.delivered, s.sent)}</td><td className="num">{pct(s.read, s.delivered)}</td><td className="num">{pct(s.replies, s.delivered)}</td>
                      </>
                    ) : <td colSpan={11} className="muted small">Open the campaign for figures (only the 20 newest are summarised here).</td>}
                    <td><a className="small" href={`/leads/whatsapp/export?kind=campaign&id=${c.id}`}>CSV</a></td>
                  </tr>
                )
              })}
              {!rows.length && <tr><td colSpan={14} className="muted">No approved campaigns yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </WaShell>
  )
}
