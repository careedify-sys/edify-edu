import type { Metadata } from 'next'
import '../whatsapp.css'
import { WaShell } from '../WaShell'
import { fmt, pct, when } from '../format'
import { waCampaigns, waCampaignSettings } from '../campaign-actions'
import { refFunnels } from '../referral-actions'
import { funnelCosts, EMPTY_FUNNEL } from '@/lib/referrals/funnel'
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
  const withStats = rows.filter(c => c.stats)
  const [fr, st] = await Promise.all([refFunnels(withStats.map(c => c.id)), waCampaignSettings()])
  const funnels = fr.ok ? fr.funnels : {}
  const rate = st.ok ? st.settings.marketingRate : null
  const tax = st.ok ? st.settings.taxPct : 18
  const rs = (n: number | null) => (n == null ? 'n/a' : `₹${n.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`)
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

      <section className="card">
        <div className="btn-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 className="big">Referral funnel and cost</h2>
          <a className="btn btn-ghost" href="/leads/whatsapp/reports/funnel-export">Download funnel CSV</a>
        </div>
        <p className="small muted">
          Form opens are /refer page loads from the campaign link (Meta does not report button clicks). A referral counts for a campaign through its link, or when the referrer is a number that campaign messaged in the last 30 days.
          Message spend is an <strong>estimate</strong>: Meta-billable messages × the marketing rate in Settings{rate == null ? ' (not set)' : ` (₹${rate})`} + {tax}% tax. Meta&apos;s invoice is the actual figure. Rewards are the payments you recorded.
          {!fr.ok && <> <span style={{ color: '#ef4444' }}>{fr.error}</span></>}
        </p>
        <p className="small muted">
          How the estimates are worked out: Meta-billable messages × marketing rate × (1 + GST %). Est. cost per referral divides that by unique valid referrals; Est. cost per admission divides it by admissions; the all-in figure adds rewards approved and paid before dividing by admissions.
        </p>
        <div className="tblwrap">
          <table className="tbl">
            <thead><tr>
              <th>Campaign</th><th className="num">Form opens</th><th className="num">Referrals</th><th className="num">Unique valid</th><th className="num">Contacted</th>
              <th className="num">Applications</th><th className="num">Admissions</th><th className="num">Rewards pending</th><th className="num">Rewards paid</th>
              <th className="num">Est. message spend</th><th className="num">Est. cost per referral</th><th className="num">Est. cost per admission</th><th className="num">Est. all-in cost per admission</th>
            </tr></thead>
            <tbody>
              {withStats.map(c => {
                const f = funnels[c.id] ?? EMPTY_FUNNEL
                const k = funnelCosts(f, c.stats!.meta_billable, rate, tax)
                return (
                  <tr key={c.id}>
                    <td><a href={`/leads/whatsapp/referrals?campaign=${c.id}`}>{c.name}</a></td>
                    <td className="num">{fmt(f.form_opens)}</td><td className="num">{fmt(f.submitted)}<div className="small muted">{f.by_link} link · {f.by_phone_match} phone</div></td>
                    <td className="num">{fmt(f.unique_valid)}</td><td className="num">{fmt(f.contacted)}</td><td className="num">{fmt(f.applications)}</td><td className="num">{fmt(f.admissions)}</td>
                    <td className="num">{fmt(f.rewards_pending_n)}<div className="small muted">{rs(f.rewards_pending_inr)}</div></td>
                    <td className="num">{fmt(f.rewards_paid_n)}<div className="small muted">{rs(f.rewards_paid_inr)}</div></td>
                    <td className="num">{rs(k.estSpendInr)}</td><td className="num">{rs(k.perReferralInr)}</td><td className="num">{rs(k.perAdmissionInr)}</td><td className="num">{rs(k.allInPerAdmissionInr)}</td>
                  </tr>
                )
              })}
              {!withStats.length && <tr><td colSpan={13} className="muted">No campaign figures yet.</td></tr>}
            </tbody>
          </table>
        </div>
      </section>
    </WaShell>
  )
}
