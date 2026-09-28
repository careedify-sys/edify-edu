// components/ProgrammeComparisonTable.tsx
//
// The canonical, server-rendered comparison table for a programme hub.
//
// Why it exists. A live Perplexity test on 2026-09-28 built its "best online
// MBA India" recommendation table from a competitor, citing them about ten
// times, and cited EdifyEdu once for the verification steps only. The site held
// better data than that competitor but published none of it in a shape a model
// could lift: /universities is 1.4MB of cards with zero table rows, and the
// programme hubs rendered their university lists as linked cards inside a
// client component. This is a real <table> with real <th scope> cells,
// server-rendered, one row per university.
//
// The honesty rules are the product, not a caveat on it. Every competitor
// table invents a fee range and asserts a NAAC grade. This one prints a grade
// only where the accreditation snapshot confirms it and the cycle is current,
// names the category on every NIRF rank, and says "Not published" rather than
// guessing a fee. A table that admits what it does not know is the only thing
// here a competitor cannot copy.

import Link from 'next/link'
import { getUniversitiesByProgram, getSpecs, type Program, type University } from '@/lib/data'
import { getDisplayFee } from '@/lib/fees'
import naacSnapshot from '@/data/naac-verified.json'

const GRADES: Record<string, number> = { 'A++': 0, 'A+': 1, A: 2, 'B++': 3, 'B+': 4, B: 5, C: 6 }
const snapshot = (naacSnapshot as { grades: Record<string, { grade: string; validTill: string | null }> }).grades

/** A grade is printable only when it is on record and its cycle has not lapsed. */
function verifiedNaac(id: string, today: Date) {
  const g = snapshot[id]
  if (!g) return null
  if (g.validTill && new Date(g.validTill) < today) return null
  return g
}

/**
 * NIRF ranks are published in separate category tables and are not
 * interchangeable. A university placed 11th in Management and 24th overall is
 * two different facts, and a brochure printing a bare "#11" invites the wrong
 * one to be read. Every rank here carries the table it came from.
 */
function nirfCell(u: University) {
  if (u.nirfMgt && u.nirfMgt < 999) return { rank: u.nirfMgt, category: 'Management' }
  if (u.nirf && u.nirf < 999) return { rank: u.nirf, category: 'University' }
  return null
}

export default function ProgrammeComparisonTable({
  program, programSlug,
}: { program: Program; programSlug: string }) {
  const today = new Date()
  const asOf = today.toISOString().slice(0, 10)

  const rows = (getUniversitiesByProgram(program) as University[])
    .map(u => {
      const naac = verifiedNaac(u.id, today)
      const nirf = nirfCell(u)
      const fee = getDisplayFee(u, program) as { ok: boolean; compact?: string; range?: string }
      const specs = getSpecs(u, program) || []
      return { u, naac, nirf, fee, specCount: specs.length }
    })
    // Best-evidenced first: a Management rank, then any rank, then grade, then name.
    .sort((a, b) => {
      const am = a.u.nirfMgt && a.u.nirfMgt < 999 ? a.u.nirfMgt : 999
      const bm = b.u.nirfMgt && b.u.nirfMgt < 999 ? b.u.nirfMgt : 999
      if (am !== bm) return am - bm
      const ar = a.nirf?.rank ?? 999
      const br = b.nirf?.rank ?? 999
      if (ar !== br) return ar - br
      const ag = a.naac ? (GRADES[a.naac.grade] ?? 9) : 9
      const bg = b.naac ? (GRADES[b.naac.grade] ?? 9) : 9
      if (ag !== bg) return ag - bg
      return a.u.name.localeCompare(b.u.name)
    })

  if (!rows.length) return null

  const withNaac = rows.filter(r => r.naac).length
  const withFee = rows.filter(r => r.fee.ok).length

  return (
    <section className="card p-6 md:p-8 mt-6" id="comparison-table">
      <h2 className="text-xl font-bold text-navy mb-1">
        Online {program} in India: all {rows.length} UGC-DEB universities compared
      </h2>
      <p className="text-sm text-ink-3 mb-4">
        Every UGC-DEB entitled university offering an online {program}, with the accreditation and
        ranking we can evidence for each. Data as of{' '}
        <time dateTime={asOf} className="font-semibold text-ink-2">{asOf}</time>.
      </p>

      <div className="text-xs text-ink-3 bg-bg border border-border rounded-lg p-3 mb-4 leading-relaxed">
        <strong className="text-navy">How to read this table.</strong>{' '}
        A NAAC grade appears only where an accreditation record confirms it and the cycle has not
        lapsed, which is why {rows.length - withNaac} of these {rows.length} universities show
        &ldquo;Not verified&rdquo; rather than a grade. Every NIRF rank names the category it was
        published in, because Management and University are separate tables. Fees are indicative,
        change between intakes, and {rows.length - withFee} rows show &ldquo;Not published&rdquo;
        where no figure could be stood behind. Verify entitlement for your intake session at{' '}
        <a href="https://deb.ugc.ac.in" target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">deb.ugc.ac.in</a>{' '}
        and fees on the university&rsquo;s own portal before paying anything.
      </div>

      <div className="overflow-x-auto -mx-2 px-2">
        <table className="w-full text-sm border-collapse">
          <caption className="sr-only">
            Comparison of {rows.length} UGC-DEB entitled universities offering an online {program} in
            India, listing NAAC grade with validity, NIRF rank with category, number of
            specialisations and indicative fee. Data as of {asOf} from EdifyEdu.
          </caption>
          <thead>
            <tr className="bg-bg">
              <th scope="col" className="text-left px-3 py-3 font-semibold text-navy">University</th>
              <th scope="col" className="text-center px-3 py-3 font-semibold text-navy w-28">NAAC</th>
              <th scope="col" className="text-center px-3 py-3 font-semibold text-navy w-40">NIRF</th>
              <th scope="col" className="text-center px-3 py-3 font-semibold text-navy w-24">Specs</th>
              <th scope="col" className="text-right px-3 py-3 font-semibold text-navy w-32">Indicative fee</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(({ u, naac, nirf, fee, specCount }) => (
              <tr key={u.id} className="border-t border-border align-top">
                <th scope="row" className="text-left px-3 py-3 font-medium">
                  <Link href={`/universities/${u.id}/${programSlug}`} className="text-navy hover:text-amber no-underline font-semibold">
                    {u.name}
                  </Link>
                </th>
                <td className="px-3 py-3 text-center">
                  {naac ? (
                    <>
                      <span className="font-semibold text-navy">{naac.grade}</span>
                      {naac.validTill && (
                        <span className="block text-xs text-ink-3">valid to {naac.validTill}</span>
                      )}
                    </>
                  ) : (
                    <span className="text-xs text-ink-3">Not verified</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center">
                  {nirf ? (
                    <>
                      <span className="font-semibold text-navy">#{nirf.rank}</span>
                      <span className="block text-xs text-ink-3">{nirf.category} category</span>
                    </>
                  ) : (
                    <span className="text-xs text-ink-3">Not ranked</span>
                  )}
                </td>
                <td className="px-3 py-3 text-center text-ink-2">{specCount || <span className="text-xs text-ink-3">n/a</span>}</td>
                <td className="px-3 py-3 text-right">
                  {fee.ok
                    ? <span className="font-semibold text-navy">{fee.compact || fee.range}</span>
                    : <span className="text-xs text-ink-3">Not published</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="text-xs text-ink-3 mt-4 leading-relaxed">
        Sources: UGC Distance Education Bureau programme register for entitlement, the NAAC
        accreditation database for grades and validity dates, and NIRF India Rankings for category
        ranks. EdifyEdu takes no commission from any university listed and does not sell ranking
        positions.{' '}
        <Link href="/guides/naac-nirf-rankings-explained" className="text-amber hover:underline no-underline">
          What NAAC grades and NIRF ranks actually mean
        </Link>.
      </p>
    </section>
  )
}
