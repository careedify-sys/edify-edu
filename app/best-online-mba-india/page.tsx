import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle, ArrowRight, Shield, BarChart2, BookOpen, IndianRupee, AlertTriangle } from 'lucide-react'
import BestMBAClient from './BestMBAClient'
import {
  BEST_MBA_RANKING,
  RANKING_COUNTS,
  RANKING_AS_OF,
  type RankedMba,
} from '@/lib/best-mba-ranking'

// Every fact on this page is derived from lib/best-mba-ranking.ts, which reads
// lib/data.ts, the Supabase NAAC snapshot, and getDisplayFee. Nothing below is
// hand-typed. The previous version of this page hardcoded a ten-row array that
// had drifted: it ordered universities by NIRF *University* rank while claiming
// to rank online MBAs, printed "NIRF #8" with no category, quoted a fee for LPU
// that lib/data.ts contradicts, and told readers fees "start at Rs 60,000" when
// Rs 60,000 was the floor of a placeholder range nine universities shared.

// ── Derived figures used in copy, so no sentence can drift from the table ─────

const WITH_FEE = BEST_MBA_RANKING.filter(r => r.feeMin !== null)
const CHEAPEST = WITH_FEE.reduce((a, b) => ((a.feeMin as number) <= (b.feeMin as number) ? a : b))
const DEAREST = WITH_FEE.reduce((a, b) => ((a.feeMax as number) >= (b.feeMax as number) ? a : b))
const TOP_RANKED = BEST_MBA_RANKING[0]
const NO_FEE = BEST_MBA_RANKING.filter(r => r.fee === null)

// Strongest across both NIRF tables at once, by sum of the two ranks. Only
// universities NIRF ranks in both categories can qualify.
const BEST_COMBINED = BEST_MBA_RANKING
  .filter(r => r.nirfUniversity !== null)
  .reduce((a, b) =>
    a.nirfManagement + (a.nirfUniversity as number) <= b.nirfManagement + (b.nirfUniversity as number) ? a : b)

const FEE_SPAN = `${CHEAPEST.fee} to ${DEAREST.fee}`

export const metadata: Metadata = {
  title: `Best Online MBA in India 2026: ${RANKING_COUNTS.ranked} Ranked by NIRF Management`,
  description: `The ${RANKING_COUNTS.ranked} UGC DEB approved online MBA universities that hold a NIRF Management category rank, ordered best rank first. Fees ${FEE_SPAN} where the university publishes them. No paid rankings.`,
  keywords: 'best online mba in india 2026, top online mba colleges india, ugc approved online mba, nirf management ranked online mba, naac a++ online mba india, online mba for working professionals india',
  alternates: { canonical: 'https://edifyedu.in/best-online-mba-india' },
  openGraph: {
    title: `Best Online MBA in India 2026: ${RANKING_COUNTS.ranked} Ranked by NIRF Management`,
    description: `Ranked by NIRF Management category, not the University table. ${RANKING_COUNTS.ranked} of ${RANKING_COUNTS.mbaUniversities} online MBA universities hold that rank. Fees shown only where published.`,
    url: 'https://edifyedu.in/best-online-mba-india',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Best Online MBA in India 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Best Online MBA in India 2026: Ranked by NIRF Management`,
    description: `${RANKING_COUNTS.ranked} UGC DEB approved online MBA universities with a NIRF Management rank, compared on NAAC and published fees.`,
  },
}

// ── Structured Data ───────────────────────────────────────────────────────────

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
    { '@type': 'ListItem', position: 2, name: 'Best Online MBA in India 2026', item: 'https://edifyedu.in/best-online-mba-india' },
  ],
}

// The ranking as machine-readable data. Each description states the category of
// every rank, because "NIRF #24" on its own is ambiguous between two tables and
// an assistant quoting it has no way to tell which one it came from.
const itemListSchema = {
  '@context': 'https://schema.org',
  '@type': 'ItemList',
  name: `Online MBA universities in India ranked by NIRF Management category, ${RANKING_AS_OF}`,
  numberOfItems: BEST_MBA_RANKING.length,
  itemListOrder: 'https://schema.org/ItemListOrderAscending',
  itemListElement: BEST_MBA_RANKING.map(r => ({
    '@type': 'ListItem',
    position: r.position,
    item: {
      '@type': 'CollegeOrUniversity',
      name: r.name,
      url: `https://edifyedu.in${r.href}`,
      description: [
        `NIRF Management category rank ${r.nirfManagement}`,
        r.nirfUniversity ? `NIRF University category rank ${r.nirfUniversity}` : 'not ranked in the NIRF University category',
        r.naac.grade ? `NAAC ${r.naac.grade}` : `NAAC grade not stated by EdifyEdu (${r.naac.note.toLowerCase()})`,
        r.fee ? `total online MBA fee ${r.fee}` : 'total fee not published by the university',
      ].join('; ') + '.',
    },
  })),
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'Which is the best online MBA in India in 2026?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `On the only ranking that applies to a management degree, NIRF's Management category, ${TOP_RANKED.name} holds the best placement of any university offering an online MBA at rank ${TOP_RANKED.nirfManagement}, followed by ${BEST_MBA_RANKING[1].name} at ${BEST_MBA_RANKING[1].nirfManagement} and ${BEST_MBA_RANKING[2].name} at ${BEST_MBA_RANKING[2].nirfManagement}. A caution about how this is usually reported: most lists order online MBAs by the NIRF University rank, which measures the whole institution and not its management school. ${BEST_COMBINED.name} is the strongest university across both tables at once, Management ${BEST_COMBINED.nirfManagement} and University ${BEST_COMBINED.nirfUniversity}. Only ${RANKING_COUNTS.ranked} of the ${RANKING_COUNTS.mbaUniversities} universities offering a UGC DEB approved online MBA hold any NIRF Management rank at all.`,
      },
    },
    {
      '@type': 'Question',
      name: 'Is an online MBA from India valid for government jobs?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes, provided the university is UGC DEB approved for that programme in online mode. Online MBAs from UGC DEB approved universities are treated equivalent to regular on-campus MBAs under UGC guidelines and are accepted for UPSC, SSC, state PSC, banking and railway exams where an MBA is a listed qualification. Check the university and the specific programme on the DEB list at deb.ugc.ac.in before you pay anything, because entitlement is granted per programme and per mode, not to the university as a whole.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum fee for an online MBA in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: `Among the ${RANKING_COUNTS.ranked} NIRF Management ranked universities, the lowest fee we can verify from a published source is ${CHEAPEST.fee} at ${CHEAPEST.name}, and the highest is ${DEAREST.fee} at ${DEAREST.name}. Treat any figure below that as unverified until you see it on the university's own fee page. ${NO_FEE.length} of the ${RANKING_COUNTS.ranked} publish no fee at all, and a further group of universities across our database carry fee ranges that turned out to be one placeholder copied across several institutions, so we suppress those rather than print them as prices. Fees change between intakes, so confirm the current number with the university before you decide.`,
      },
    },
    {
      '@type': 'Question',
      name: 'Which online MBA has the best placement support in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'We do not rank placement support, because no Indian university publishes audited placement data for its online MBA cohort separately from its campus cohort. Any list claiming to know online MBA placement rates is using campus numbers or numbers the university supplied without audit. What you can verify is whether the university has a NIRF Management placement, which NIRF scores partly on graduate outcomes, and that is the ranking on this page. Ask any university for the median salary of its online cohort specifically, in writing, and treat a refusal as the answer.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the difference between online MBA and distance MBA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Online MBA is delivered through a live Learning Management System with scheduled online classes, proctored online exams, and UGC DEB approval in online mode. Distance MBA is primarily correspondence-based, with study material sent by post and physical exam centres. Both are valid degrees if the university holds DEB entitlement for that programme in that mode, and the mode matters: a university approved for distance mode is not automatically approved for online mode.',
      },
    },
    {
      '@type': 'Question',
      name: 'Can I do an online MBA while working full time?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Yes. Online MBA programmes are built for working professionals. Live classes usually run on weekends and lectures are recorded for on-demand access, with exams proctored online from home. Most students report 8 to 12 hours of study a week alongside full-time work, though that varies with the specialisation and your background.',
      },
    },
  ],
}

const articleSchema = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: `Best Online MBA in India 2026: ${RANKING_COUNTS.ranked} Universities Ranked by NIRF Management`,
  description: `The UGC DEB approved online MBA universities holding a NIRF Management category rank, with NAAC status and published fees.`,
  datePublished: '2026-04-16',
  dateModified: RANKING_AS_OF,
  image: { '@type': 'ImageObject', url: 'https://edifyedu.in/og.webp', width: 1200, height: 630 },
  author: {
    '@type': 'Person',
    name: 'Rishi Kumar',
    url: 'https://edifyedu.in/about#team',
    jobTitle: 'Senior Education Researcher, Founder, EdifyEdu',
  },
  publisher: {
    '@type': 'Organization',
    name: 'edifyedu.in',
    url: 'https://edifyedu.in',
    logo: { '@type': 'ImageObject', url: 'https://edifyedu.in/logos/edify_logo_192.png', width: 192, height: 192 },
  },
  mainEntityOfPage: { '@type': 'WebPage', '@id': 'https://edifyedu.in/best-online-mba-india' },
}

// ── Small presentational helpers ──────────────────────────────────────────────

function NaacCell({ r }: { r: RankedMba }) {
  if (r.naac.grade) {
    return (
      <span className="font-bold text-xs" style={{ color: '#10b981' }}>
        {r.naac.grade}
      </span>
    )
  }
  return (
    <span className="text-[11px] font-semibold" style={{ color: '#64748b' }} title={r.naac.note}>
      {r.naac.status === 'lapsed' ? 'Cycle expired' : 'Not verified'}
    </span>
  )
}

function FeeCell({ r }: { r: RankedMba }) {
  if (r.fee) return <span className="font-semibold text-navy text-xs">{r.fee}</span>
  return (
    <span className="text-[11px] font-semibold" style={{ color: '#64748b' }}>
      Not published
    </span>
  )
}

const BUDGET_BANDS = [
  { label: 'Under ₹1 lakh', test: (r: RankedMba) => (r.feeMin as number) < 100000, color: '#10b981', bg: '#ecfdf5', border: '#a7f3d0' },
  { label: '₹1 lakh to ₹2 lakh', test: (r: RankedMba) => (r.feeMin as number) >= 100000 && (r.feeMin as number) < 200000, color: '#f97316', bg: '#fff7ed', border: '#fed7aa' },
  { label: '₹2 lakh and above', test: (r: RankedMba) => (r.feeMin as number) >= 200000, color: '#0f172a', bg: '#f1f5f9', border: '#cbd5e1' },
]

export default function Page() {
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }} />

      <div className="bg-surface min-h-screen">

        {/* ── Hero ───────────────────────────────────────────────────────── */}
        <div className="bg-navy text-white py-14">
          <div className="max-w-5xl mx-auto px-4 sm:px-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold mb-5"
              style={{ background: 'rgba(249,115,22,0.18)', color: '#fb923c', border: '1px solid rgba(249,115,22,0.3)' }}>
              <Shield className="w-3 h-3" /> Updated {RANKING_AS_OF} · Zero paid rankings
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold leading-tight mb-4">
              Best Online MBA in India 2026
            </h1>
            <p className="text-lg text-white/70 max-w-2xl leading-relaxed mb-3">
              Ranked by NIRF&apos;s <strong className="text-white">Management</strong> category, best rank first.
              That is the table that measures a management school. Most lists use the
              University table instead, which scores the whole institution.
            </p>
            <p className="text-sm text-white/55 max-w-2xl leading-relaxed mb-6">
              {RANKING_COUNTS.ranked} of the {RANKING_COUNTS.mbaUniversities} universities in our database offering a
              UGC DEB approved online MBA hold a Management rank. Every rank below names its category.
            </p>

            <div className="flex flex-wrap gap-2">
              {[
                { label: 'The ranking', href: '#rankings' },
                { label: 'What we ranked on', href: '#criteria' },
                { label: 'By budget', href: '#by-budget' },
                { label: 'By use case', href: '#by-usecase' },
                { label: 'Specialisations', href: '#specializations' },
                { label: 'FAQs', href: '#faq' },
              ].map(pill => (
                <a key={pill.href} href={pill.href}
                  className="px-3 py-1.5 rounded-full text-xs font-bold no-underline"
                  style={{ background: 'rgba(255,255,255,0.1)', color: '#fff', border: '1px solid rgba(255,255,255,0.2)' }}>
                  {pill.label}
                </a>
              ))}
            </div>
          </div>
        </div>

        {/* ── Methodology strip ──────────────────────────────────────────── */}
        <div className="bg-white border-b border-border">
          <div className="max-w-5xl mx-auto px-4 sm:px-6 py-3 flex flex-wrap items-center gap-x-6 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-sage" /> Ordered by NIRF Management rank (nirfindia.org)</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-sage" /> NAAC grade printed for {RANKING_COUNTS.naacConfirmed} of {RANKING_COUNTS.ranked}, cross-checked</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-sage" /> UGC DEB approved only</span>
            <span className="flex items-center gap-1.5"><CheckCircle className="w-3.5 h-3.5 text-sage" /> Fees shown for {RANKING_COUNTS.feesPublished} of {RANKING_COUNTS.ranked}, rest not published</span>
            <span className="flex items-center gap-1.5"><Shield className="w-3.5 h-3.5 text-amber" /> Zero paid placements</span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10">

          {/* ── Quick verdict ─────────────────────────────────────────────── */}
          <div className="card p-6 mb-8 border-l-4 border-amber">
            <h2 className="text-lg font-bold text-navy mb-1">Quick verdict</h2>
            <p className="text-xs text-ink-2 mb-4">
              Each line names the category of every rank it quotes. Derived from the table below, so the two cannot disagree.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                {
                  label: 'Best NIRF Management rank',
                  value: `${TOP_RANKED.displayName}, Management #${TOP_RANKED.nirfManagement}${TOP_RANKED.naac.grade ? `, NAAC ${TOP_RANKED.naac.grade}` : ''}`,
                },
                {
                  label: 'Strongest across both NIRF tables',
                  value: `${BEST_COMBINED.displayName}, Management #${BEST_COMBINED.nirfManagement} and University #${BEST_COMBINED.nirfUniversity}`,
                },
                {
                  label: 'Lowest fee we can verify',
                  value: `${CHEAPEST.displayName}, ${CHEAPEST.fee}, Management #${CHEAPEST.nirfManagement}`,
                },
                {
                  label: 'Highest fee we can verify',
                  value: `${DEAREST.displayName}, ${DEAREST.fee}, Management #${DEAREST.nirfManagement}`,
                },
                {
                  label: 'Ranked but fee not published',
                  value: `${NO_FEE.map(r => r.displayName).join(', ')}. Ask the university directly.`,
                },
                {
                  label: 'Not on this page',
                  value: `${RANKING_COUNTS.unranked} online MBA universities hold no NIRF Management rank. That is a gap in the data, not a verdict on them.`,
                },
              ].map(item => (
                <div key={item.label} className="flex gap-2">
                  <CheckCircle className="w-4 h-4 text-sage shrink-0 mt-0.5" />
                  <div>
                    <div className="text-xs font-bold text-navy">{item.label}</div>
                    <div className="text-xs text-ink-2 leading-relaxed">{item.value}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* ── Ranking table ─────────────────────────────────────────────── */}
          <section id="rankings" className="mb-10 scroll-mt-20">
            <h2 className="text-2xl font-bold text-navy mb-2">
              Online MBA universities ranked by NIRF Management, {RANKING_AS_OF}
            </h2>
            <p className="text-sm text-ink-2 mb-6">
              All {RANKING_COUNTS.ranked} universities that offer a UGC DEB approved online MBA and hold a placement in
              NIRF&apos;s Management category, best rank first. Both NIRF columns are shown so you can see where the two
              tables disagree, and they disagree a lot: {BEST_MBA_RANKING.filter(r => r.nirfUniversity !== null && Math.abs(r.nirfManagement - (r.nirfUniversity as number)) >= 20).length} of
              these universities sit at least 20 places apart in the two rankings.
            </p>

            <div className="overflow-x-auto rounded-2xl border border-border">
              <table className="w-full text-sm">
                <caption className="sr-only">
                  Online MBA universities in India holding a NIRF Management category rank, with NIRF University rank,
                  NAAC grade and total published fee, as of {RANKING_AS_OF}.
                </caption>
                <thead>
                  <tr style={{ background: 'var(--navy)', color: '#fff' }}>
                    <th scope="col" className="px-3 py-3 font-bold text-xs text-center">#</th>
                    <th scope="col" className="text-left px-4 py-3 font-bold text-xs">University</th>
                    <th scope="col" className="px-4 py-3 font-bold text-xs text-center">NIRF<br />Management</th>
                    <th scope="col" className="px-4 py-3 font-bold text-xs text-center">NIRF<br />University</th>
                    <th scope="col" className="px-4 py-3 font-bold text-xs text-center">NAAC</th>
                    <th scope="col" className="px-4 py-3 font-bold text-xs text-center">Total fee</th>
                  </tr>
                </thead>
                <tbody>
                  {BEST_MBA_RANKING.map(r => (
                    <tr key={r.id} style={{ background: r.position % 2 === 0 ? 'var(--surface-2)' : '' }}>
                      <td className="px-3 py-3 text-center">
                        <span className="inline-flex w-6 h-6 rounded-full items-center justify-center font-black text-[11px]"
                          style={{
                            background: r.position <= 3 ? 'linear-gradient(135deg,#f97316,#fb923c)' : 'var(--surface-2)',
                            color: r.position <= 3 ? '#fff' : 'var(--ink-2)',
                          }}>
                          {r.position}
                        </span>
                      </td>
                      <th scope="row" className="px-4 py-3 font-medium text-navy text-xs text-left">
                        <Link href={`${r.href}/mba`} className="hover:text-amber no-underline">{r.displayName}</Link>
                        {r.city ? <span className="block text-[10px] text-ink-3 font-normal">{r.city}</span> : null}
                      </th>
                      <td className="px-4 py-3 text-center text-xs font-bold" style={{ color: '#0f172a' }}>
                        #{r.nirfManagement}
                      </td>
                      <td className="px-4 py-3 text-center text-xs" style={{ color: '#64748b' }}>
                        {r.nirfUniversity ? `#${r.nirfUniversity}` : <span className="text-[11px]">Not ranked</span>}
                      </td>
                      <td className="px-4 py-3 text-center"><NaacCell r={r} /></td>
                      <td className="px-4 py-3 text-center"><FeeCell r={r} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <p className="text-xs text-ink-3 mt-2">
              Every university listed is UGC DEB approved. Entitlement is granted per programme and per mode, so confirm
              your specific programme on{' '}
              <Link href="/verify" className="font-semibold text-amber hover:underline">our verification pages</Link>{' '}
              or directly at deb.ugc.ac.in before you pay.
            </p>
          </section>

          {/* ── Criteria ──────────────────────────────────────────────────── */}
          <section id="criteria" className="mb-10 scroll-mt-20">
            <div className="card p-6" style={{ borderLeft: '4px solid #f97316' }}>
              <h2 className="text-xl font-bold text-navy mb-3">What we ranked on, and what we left out</h2>
              <div className="space-y-3 text-sm text-ink-2 leading-relaxed">
                <p>
                  <strong className="text-navy">The one criterion for inclusion:</strong> the university holds a
                  placement in NIRF&apos;s Management category. {RANKING_COUNTS.ranked} of {RANKING_COUNTS.mbaUniversities} do.
                  We use that table rather than the NIRF University table because a University rank scores the whole
                  institution, including departments that have nothing to do with an MBA.
                </p>
                <p>
                  The difference is not cosmetic. {BEST_MBA_RANKING[0].displayName} ranks{' '}
                  #{BEST_MBA_RANKING[0].nirfManagement} for Management and{' '}
                  #{BEST_MBA_RANKING[0].nirfUniversity} as a university. Order the same set by the University column and
                  a completely different name comes first. A list that prints only &quot;NIRF #3&quot; has told you nothing
                  you can act on.
                </p>
                <p>
                  <strong className="text-navy">NAAC grades are gated.</strong> We print a grade only where our
                  Supabase record confirms it and the accreditation cycle has not expired. That is why{' '}
                  {RANKING_COUNTS.ranked - RANKING_COUNTS.naacConfirmed} rows read &quot;Not verified&quot; or &quot;Cycle
                  expired&quot; instead of a letter. An expired cycle does not mean the university lost its grade, it means
                  we will not assert a current grade we cannot stand behind.
                </p>
                <p>
                  <strong className="text-navy">Fees are suppressed rather than guessed.</strong>{' '}
                  {NO_FEE.length} of {RANKING_COUNTS.ranked} rows show no fee. Some universities publish none. Others
                  carried a fee range that several unrelated universities carried byte for byte, which makes it a
                  placeholder someone copied, not a price. A blank cell costs you nothing. A wrong price costs you money.
                </p>
                <div className="flex gap-2 p-3 rounded-lg" style={{ background: '#fef2f2', border: '1px solid #fecaca' }}>
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#ef4444' }} />
                  <p className="text-xs" style={{ color: '#7f1d1d' }}>
                    <strong>What this ranking cannot tell you:</strong> placement outcomes for online cohorts. No Indian
                    university publishes audited salary or placement data for its online MBA students separately from its
                    campus students. Any ranking that claims otherwise is reusing campus numbers.
                  </p>
                </div>
                <p className="text-xs text-ink-3">
                  All fees are indicative and change between intakes. Verify the current figure on the university&apos;s own
                  fee page before deciding. Read the full{' '}
                  <Link href="/methodology" className="font-semibold text-amber hover:underline">EdifyEdu methodology</Link>{' '}
                  for how we source and gate every field, or see all{' '}
                  <Link href="/programs/mba" className="font-semibold text-amber hover:underline">
                    {RANKING_COUNTS.mbaUniversities} online MBA universities
                  </Link>{' '}
                  including the {RANKING_COUNTS.unranked} without a Management rank.
                </p>
              </div>
            </div>
          </section>

          {/* ── By budget ─────────────────────────────────────────────────── */}
          <section id="by-budget" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-bold text-navy mb-2">Ranked universities by budget</h2>
            <p className="text-sm text-ink-2 mb-4">
              Only the {RANKING_COUNTS.feesPublished} universities with a fee we can verify appear here, grouped by the
              lower bound of their published fee. Management rank shown against each.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {BUDGET_BANDS.map(band => {
                const inBand = WITH_FEE.filter(band.test)
                return (
                  <div key={band.label} className="rounded-xl p-4"
                    style={{ background: band.bg, border: `1px solid ${band.border}` }}>
                    <div className="font-bold text-sm mb-1" style={{ color: band.color }}>{band.label}</div>
                    <div className="text-[10px] font-semibold mb-3" style={{ color: '#64748b' }}>
                      {inBand.length} of {RANKING_COUNTS.feesPublished} ranked universities
                    </div>
                    <ul className="space-y-2">
                      {inBand.map(r => (
                        <li key={r.id} className="text-xs">
                          <Link href={`${r.href}/mba`} className="font-semibold text-navy hover:text-amber no-underline">
                            {r.displayName}
                          </Link>
                          <span className="block text-ink-2">
                            {r.fee} · Management #{r.nirfManagement}
                            {r.naac.grade ? ` · NAAC ${r.naac.grade}` : ''}
                          </span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )
              })}
            </div>
            <p className="text-xs text-ink-3 mt-3">
              Work out the monthly cost of any of these with the{' '}
              <Link href="/tools/emi-calculator" className="font-semibold text-amber hover:underline">EMI calculator</Link>.
              We do not print per-university EMI figures on this page, because the stored EMI values share the same
              duplication problem as the placeholder fees.
            </p>
          </section>

          {/* ── By use case ───────────────────────────────────────────────── */}
          <section id="by-usecase" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-bold text-navy mb-2">Which of these fits your situation</h2>
            <p className="text-sm text-ink-2 mb-4">
              Picks are drawn from the table above, so every name here holds a NIRF Management rank.
            </p>
            <div className="space-y-4">
              {[
                {
                  useCase: 'Government job or PSU eligibility',
                  icon: '🏛️',
                  desc: 'Any UGC DEB approved online MBA qualifies where an MBA is a listed qualification, so rank matters less than cost and DEB entitlement for your exact programme. Choose on price and verify the mode.',
                  picks: WITH_FEE.slice().sort((a, b) => (a.feeMin as number) - (b.feeMin as number)).slice(0, 3),
                  link: '/guides/online-mba-for-government-jobs',
                  linkLabel: 'Read: online MBA and government jobs',
                },
                {
                  useCase: 'Employers who screen on the university name',
                  icon: '🏢',
                  desc: 'Where a recruiter filters on institution, the two NIRF tables together are the closest thing to a defensible signal. These are the universities ranked well in both.',
                  picks: BEST_MBA_RANKING
                    .filter(r => r.nirfUniversity !== null)
                    .slice()
                    .sort((a, b) => (a.nirfManagement + (a.nirfUniversity as number)) - (b.nirfManagement + (b.nirfUniversity as number)))
                    .slice(0, 3),
                  link: '/compare',
                  linkLabel: 'Compare these side by side',
                },
                {
                  useCase: 'Strongest management ranking, cost aside',
                  icon: '📊',
                  desc: 'If the management school itself is what you are buying, read the Management column and nothing else. Note that the top of this list is not the top of most published rankings.',
                  picks: BEST_MBA_RANKING.slice(0, 3),
                  link: '/programs/mba',
                  linkLabel: 'All online MBA universities',
                },
              ].map(item => (
                <div key={item.useCase} className="card p-6">
                  <div className="flex items-start gap-3 mb-3">
                    <span className="text-2xl">{item.icon}</span>
                    <div>
                      <h3 className="font-bold text-navy text-base">{item.useCase}</h3>
                      <p className="text-sm text-ink-2 mt-1 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                  <ul className="space-y-1 mb-3 pl-2">
                    {item.picks.map(r => (
                      <li key={r.id} className="flex items-center gap-2 text-sm text-ink-1">
                        <CheckCircle className="w-3.5 h-3.5 text-sage shrink-0" />
                        <Link href={`${r.href}/mba`} className="no-underline text-ink-1 hover:text-amber">
                          {r.displayName}
                        </Link>
                        <span className="text-xs text-ink-2">
                          Management #{r.nirfManagement}
                          {r.nirfUniversity ? `, University #${r.nirfUniversity}` : ''}
                          {r.fee ? `, ${r.fee}` : ', fee not published'}
                        </span>
                      </li>
                    ))}
                  </ul>
                  <Link href={item.link} className="text-xs font-bold text-amber hover:underline flex items-center gap-1 no-underline">
                    {item.linkLabel} <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              ))}
            </div>
          </section>

          {/* ── Specialisations ───────────────────────────────────────────── */}
          <section id="specializations" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-bold text-navy mb-2">Choosing a specialisation</h2>
            <p className="text-sm text-ink-2 mb-5">
              These specialisations are offered across UGC DEB approved online MBA programmes. We do not publish salary
              figures by specialisation, because the numbers circulating for online cohorts are not traceable to an
              audited source.
            </p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { spec: 'Finance', career: 'Banking, treasury, investment, fintech', link: '/programs/mba/finance' },
                { spec: 'Marketing', career: 'Brand management, digital marketing, sales', link: '/programs/mba/marketing' },
                { spec: 'Human Resource Management', career: 'HR business partner, L&D, talent acquisition', link: '/programs/mba/human-resource-management' },
                { spec: 'Business Analytics', career: 'Data analysis, business intelligence, consulting', link: '/programs/mba/business-analytics' },
                { spec: 'Operations Management', career: 'Supply chain, logistics, process management', link: '/programs/mba/operations-management' },
                { spec: 'International Business', career: 'Export and import, global strategy, trade finance', link: '/programs/mba/international-business' },
              ].map(item => (
                <Link key={item.spec} href={item.link}
                  className="card p-4 hover:border-amber transition-colors no-underline block">
                  <div className="font-bold text-navy text-sm mb-0.5">{item.spec}</div>
                  <div className="text-xs text-ink-2">{item.career}</div>
                </Link>
              ))}
            </div>
            <div className="mt-3">
              <Link href="/blog/best-mba-specialization-india-2026" className="text-xs font-bold text-amber hover:underline flex items-center gap-1">
                Read: best MBA specialisation in India 2026 <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </section>

          {/* ── How to choose ─────────────────────────────────────────────── */}
          <section className="card p-7 mb-10">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-full bg-amber/10 flex items-center justify-center">
                <BarChart2 className="w-5 h-5 text-amber" />
              </div>
              <h2 className="text-xl font-bold text-navy">How to choose, in order</h2>
            </div>
            <div className="space-y-3">
              {[
                {
                  step: '1',
                  title: 'Check DEB entitlement for the programme and the mode',
                  desc: 'Look the university up at deb.ugc.ac.in and confirm the MBA is listed in online mode specifically. Entitlement is per programme and per mode. A university approved for distance mode is not approved for online mode, and that distinction has caught real students.',
                },
                {
                  step: '2',
                  title: 'Read the right NIRF column',
                  desc: `For a management degree, the Management category is the relevant table. Ask which category any rank you are quoted refers to. Only ${RANKING_COUNTS.ranked} of ${RANKING_COUNTS.mbaUniversities} online MBA universities hold a Management rank at all, so an unranked university is common rather than disqualifying.`,
                },
                {
                  step: '3',
                  title: 'Check the NAAC cycle, not just the grade',
                  desc: 'A grade has an expiry date. An A++ whose cycle ended last year is not a current A++. Ask for the accreditation certificate with its validity period, which universities will provide on request.',
                },
                {
                  step: '4',
                  title: 'Get the total fee in writing',
                  desc: `Across the ranked universities that publish a fee, the verified span is ${FEE_SPAN} for the full programme. Ask for the all-in figure including registration and examination charges, not the per-semester number, and get it on university letterhead or a university email.`,
                },
                {
                  step: '5',
                  title: 'Pick the specialisation on your actual work',
                  desc: 'Choose on the role you hold now or the one you are moving to, not on which specialisation is being marketed hardest this year. The curriculum difference between specialisations is usually four to six papers.',
                },
              ].map(item => (
                <div key={item.step} className="flex gap-4">
                  <div className="w-7 h-7 rounded-full flex items-center justify-center font-black text-xs shrink-0"
                    style={{ background: 'linear-gradient(135deg,#f97316,#fb923c)', color: '#fff' }}>
                    {item.step}
                  </div>
                  <div>
                    <div className="font-bold text-navy text-sm">{item.title}</div>
                    <div className="text-sm text-ink-2 leading-relaxed">{item.desc}</div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 pt-4 border-t border-border flex flex-col gap-2">
              <Link href="/blog/how-to-choose-online-mba-university-india-2026" className="text-sm font-bold text-amber hover:underline flex items-center gap-1">
                The full 2026 guide: how to choose an online MBA university <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link href="/contact" className="text-sm font-bold text-amber hover:underline flex items-center gap-1">
                Ask us about a university that is not on this list <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </section>

          {/* ── Related ───────────────────────────────────────────────────── */}
          <section className="mb-10">
            <h2 className="text-xl font-bold text-navy mb-4">Related guides and articles</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { icon: BookOpen, title: 'Is an online MBA worth it in 2026?', desc: 'ROI, employer perception, and who should not do one.', href: '/blog/is-online-mba-worth-it-2026', tag: 'Blog' },
                { icon: BookOpen, title: 'Affordable online MBA India 2026', desc: 'Programmes under ₹1 lakh, with the fees we can and cannot verify marked.', href: '/blog/affordable-online-mba-india-2026', tag: 'Blog' },
                { icon: BookOpen, title: 'Online MBA vs distance MBA', desc: 'Delivery, recognition, and why DEB mode matters.', href: '/guides/online-mba-vs-distance-mba', tag: 'Guide' },
                { icon: Shield, title: 'How we verify a university', desc: 'The checks behind every claim on this page.', href: '/methodology', tag: 'Method' },
                { icon: BarChart2, title: 'All online MBA universities', desc: `Every one of the ${RANKING_COUNTS.mbaUniversities}, ranked and unranked.`, href: '/programs/mba', tag: 'Compare' },
                { icon: IndianRupee, title: 'EMI calculator', desc: 'Monthly cost for any fee you have been quoted.', href: '/tools/emi-calculator', tag: 'Tool' },
              ].map(item => (
                <Link key={item.href} href={item.href} className="card p-5 hover:border-amber transition-colors no-underline block">
                  <div className="text-[10px] font-bold uppercase tracking-widest text-amber mb-2">{item.tag}</div>
                  <div className="font-bold text-navy text-sm mb-1">{item.title}</div>
                  <div className="text-xs text-ink-2 leading-relaxed">{item.desc}</div>
                </Link>
              ))}
            </div>
          </section>

          {/* ── FAQ ───────────────────────────────────────────────────────── */}
          <section id="faq" className="mb-10 scroll-mt-20">
            <h2 className="text-xl font-bold text-navy mb-5">Frequently asked questions</h2>
            <div className="space-y-3">
              {faqSchema.mainEntity.map((faq) => (
                <details key={faq.name} className="card p-5 group">
                  <summary className="font-bold text-navy text-sm cursor-pointer list-none flex items-center justify-between gap-3">
                    {faq.name}
                    <span className="text-amber text-lg shrink-0 group-open:rotate-45 transition-transform">+</span>
                  </summary>
                  <p className="text-sm text-ink-2 mt-3 leading-relaxed">{faq.acceptedAnswer.text}</p>
                </details>
              ))}
            </div>
          </section>

          {/* ── CTA ───────────────────────────────────────────────────────── */}
          <BestMBAClient />

        </div>
      </div>
    </>
  )
}
