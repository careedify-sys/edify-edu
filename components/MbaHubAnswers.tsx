// components/MbaHubAnswers.tsx
//
// Four direct answers on /programs/mba (ranking plan row 2.4, 2026-11-14):
// what an online MBA costs, the cheapest, whether a one-year online MBA
// exists, and the best. Server-rendered, every figure passed in from
// lib/data.ts by the page: the fee range and the cheapest rows come from the
// same getExactFee bounds over indexable hubs that set the hero range, so a
// placeholder fee never names the "cheapest". NIRF ranks always carry their
// category. The full fee table is ProgrammeComparisonTable, just below.

import Link from 'next/link'

export interface MbaAnswerFee { id: string; name: string; fee: string }
export interface MbaAnswerRank { id: string; name: string; rank: number }

export default function MbaHubAnswers({
  range,
  cheapest,
  topNirf,
  jguHref,
}: {
  range: { min: string; max: string; count: number } | null
  cheapest: MbaAnswerFee[]
  topNirf: MbaAnswerRank[]
  /** JGU's MBA hub, passed only when it resolves and is indexable. */
  jguHref: string | null
}) {
  return (
    <section className="max-w-7xl mx-auto px-4 pt-10 pb-2" aria-labelledby="mba-answers">
      <h2 id="mba-answers" className="text-2xl font-bold text-navy mb-6">Online MBA fees, cheapest, one-year and best: quick answers</h2>

      <div className="grid gap-6 md:grid-cols-2">
        <div>
          <h3 className="text-lg font-bold text-navy mb-2">How much does an online MBA cost?</h3>
          <p className="text-sm text-slate-700 leading-relaxed">
            {range
              ? <>Total programme fees run from {range.min} to {range.max} at list price across the {range.count} online MBA programmes we index. </>
              : <>Fees differ by university. </>}
            Every university&apos;s fee is in the comparison table below. Fees are indicative; talk to our counsellor for your intake.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-navy mb-2">Which is the cheapest online MBA?</h3>
          {cheapest.length ? (
            <>
              <p className="text-sm text-slate-700 leading-relaxed mb-2">The lowest list prices among the online MBAs we index:</p>
              <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1">
                {cheapest.map(c => (
                  <li key={c.id}><Link href={`/universities/${c.id}/mba`} className="text-amber-700 underline">{c.name}</Link>: {c.fee}</li>
                ))}
              </ul>
              <p className="text-xs text-slate-500 mt-2">The lowest price is not always the best value. Check the NAAC grade and UGC-DEB entitlement in the table below before you choose on price.</p>
            </>
          ) : (
            <p className="text-sm text-slate-700">See the comparison table below, sorted by NIRF rank, with every fee we hold.</p>
          )}
        </div>

        <div>
          <h3 className="text-lg font-bold text-navy mb-2">Is there a one-year online MBA?</h3>
          <p className="text-sm text-slate-700 leading-relaxed mb-2">
            The standard UGC-entitled online MBA runs two years, in four semesters. A one-year online MBA exists in two cases:
          </p>
          <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1 mb-2">
            <li>
              Institutions of Eminence can run online programmes without prior UGC approval.{' '}
              {jguHref
                ? <Link href={jguHref} className="text-amber-700 underline">O.P. Jindal Global University</Link>
                : <>O.P. Jindal Global University</>}{' '}
              runs a one-year online MBA open to any graduate with 50%. JGU does not appear on the UGC-DEB entitlement list of August 2026, so confirm with JGU which approval the programme rests on.
            </li>
            <li>
              Under UGC circular F.No. 7-2/2026 (DEB-NWR) of 28 July 2026, universities entitled for the two-year online MBA can offer a one-year version, but only to four-year Honours graduates.
            </li>
          </ul>
          <p className="text-sm text-slate-700 leading-relaxed">
            See <Link href="/blog/1-year-mba-india-executive-mba-2026" className="text-amber-700 underline">one-year MBA options in India</Link> and{' '}
            <Link href="/blog/mba-course-duration-india-2026" className="text-amber-700 underline">MBA course duration</Link>.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-bold text-navy mb-2">Which is the best online MBA?</h3>
          <p className="text-sm text-slate-700 leading-relaxed mb-2">
            It depends on your budget, specialisation and goal. By NIRF 2025 Management rank, the highest-ranked universities offering an online MBA are:
          </p>
          {topNirf.length > 0 && (
            <ul className="text-sm text-slate-700 list-disc pl-5 space-y-1 mb-2">
              {topNirf.map(t => (
                <li key={t.id}><Link href={`/universities/${t.id}/mba`} className="text-amber-700 underline">{t.name}</Link>: NIRF Management #{t.rank}</li>
              ))}
            </ul>
          )}
          <p className="text-sm text-slate-700">
            The full order is on our <Link href="/blog/best-online-mba-colleges-india-2026" className="text-amber-700 underline">best online MBA colleges</Link> page. edifyedu.in compares public UGC/NAAC/NIRF data, no paid rankings.
          </p>
        </div>
      </div>
    </section>
  )
}
