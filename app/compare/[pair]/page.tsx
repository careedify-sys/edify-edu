import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getUniversityById, type Program } from '@/lib/data'
import { getProgramSchemaOffer } from '@/lib/seo/program-schema'
import { getExactFee, formatExactFee, formatPublishedSemesterFee, FEE_COUNSELLOR_LINE, type ExactFee } from '@/lib/fees'
import { getTitleName } from '@/lib/seo-title'
import { formatINR } from '@/lib/format'
import { PAIRS, PAIR_SLUGS, type PairSlug } from './pairs'
// These two gate the outbound links so this page cannot emit a 404.
// The /verify route keys off Supabase university slugs, which differ from
// lib/data.ts ids for 63 of 128 universities, so building the href from the id
// produced the 404 wave Search Console reported on 2026-08-23.
import { hubResolves, getVerifyPage } from '@/lib/seo/safe-internal-links'
import { shouldIndexUniversity } from '@/lib/seo/mode-unverified'

export const revalidate = false

export function generateStaticParams() {
  return PAIR_SLUGS.map(pair => ({ pair }))
}

// Visible fees come from getExactFee (lib/fees.ts): getDisplayFee decides
// whether a fee may show, the rupees come from an exact numeric field, and a
// discounted net is always labelled against the list price. The table read
// getDisplayFee's min/max directly in c83b505, which are parsed from
// abbreviated pd.fees strings: LPU's 1,61,600 printed as 1,61,000.
function getProgramFee(uni: ReturnType<typeof getUniversityById>, program: string): ExactFee {
  return uni ? getExactFee(uni, program as Program) : { kind: 'none' }
}
const feeText = (f: ExactFee) => formatExactFee(f) ?? FEE_COUNSELLOR_LINE
// Short form for prose: the list price where there is a breakdown.
const feePhrase = (f: ExactFee): string | null =>
  f.kind === 'labelled' && f.breakdown.modes?.length ? f.breakdown.modes.map(m => `${formatINR(m.amount)} ${m.label}`).join(' or ')
  : f.kind === 'labelled' ? `${formatINR(f.breakdown.list)} at list price` : f.kind === 'exact' ? (formatExactFee(f) ?? '').replace(/^From/, 'from') : null

function nirfDisplay(uni: NonNullable<ReturnType<typeof getUniversityById>>, program: string): string {
  if (program === 'MBA' || program === 'BBA') {
    if (uni.nirfMgt && uni.nirfMgt > 0 && uni.nirfMgt < 200) return `#${uni.nirfMgt} Management`
  }
  if (uni.nirf > 0 && uni.nirf < 200) return `#${uni.nirf} University`
  return 'Unranked'
}

export async function generateMetadata(
  { params }: { params: Promise<{ pair: string }> }
): Promise<Metadata> {
  const { pair } = await params
  const config = PAIRS[pair as PairSlug]
  if (!config) return { title: 'Not Found' }

  const uA = getUniversityById(config.uniA)
  const uB = getUniversityById(config.uniB)
  if (!uA || !uB) return { title: 'Not Found' }

  const nameA = getTitleName(uA.id, uA.name, uA.abbr)
  const nameB = getTitleName(uB.id, uB.name, uB.abbr)
  const prog = config.program
  const year = new Date().getFullYear()

  const title = `${nameA} vs ${nameB} Online ${prog} ${year}: Fees and Verdict | EdifyEdu`
  const feeA = getProgramFee(uA, prog)
  const feeB = getProgramFee(uB, prog)
  const phraseA = feePhrase(feeA), phraseB = feePhrase(feeB)
  const feeStr = phraseA && phraseB ? ` (${phraseA} vs ${phraseB})` : ''
  const desc = `${nameA} vs ${nameB} online ${prog} ${year}: NAAC grade, fees${feeStr}, NIRF rank and verdict. Independent, zero-commission comparison at EdifyEdu.`

  return {
    // Longest form that fits 60 chars. The old single fallback still ran to 76
    // on long names (MUJ vs Chandigarh), flagged as too long on 29 Oct 2026.
    title: {
      absolute: [
        title,
        `${nameA} vs ${nameB}: Online ${prog} Fees & Verdict ${year}`,
        `${nameA} vs ${nameB} Online ${prog} ${year}`,
      ].find(t => t.length <= 60) ?? `${nameA} vs ${nameB} Online ${prog} ${year}`,
    },
    description: desc.length > 155 ? desc.slice(0, 152) + '...' : desc,
    alternates: { canonical: `https://edifyedu.in/compare/${pair}` },
    openGraph: { title, description: desc.slice(0, 155), url: `https://edifyedu.in/compare/${pair}`, type: 'article' },
  }
}

export default async function PairPage({ params }: { params: Promise<{ pair: string }> }) {
  const { pair } = await params
  const config = PAIRS[pair as PairSlug]
  if (!config) notFound()

  const uA = getUniversityById(config.uniA)
  const uB = getUniversityById(config.uniB)
  if (!uA || !uB) notFound()

  const nameA = getTitleName(uA.id, uA.name, uA.abbr)
  const nameB = getTitleName(uB.id, uB.name, uB.abbr)
  const prog = config.program
  const year = new Date().getFullYear()
  const pdA = (uA.programDetails as Record<string, { specs?: unknown[]; duration?: string; fees?: string }> | undefined)?.[prog]
  const pdB = (uB.programDetails as Record<string, { specs?: unknown[]; duration?: string; fees?: string }> | undefined)?.[prog]
  const feeA = getProgramFee(uA, prog)
  const feeB = getProgramFee(uB, prog)

  // The fee-difference FAQ is generated from the same getExactFee values as the
  // table below, so the two cannot disagree. The hand-written answers quoted
  // unlabelled ranges (LPU "Rs 1,61,600 to Rs 2,00,000") and savings derived
  // from them; a suppressed fee now quotes no number at all.
  const feeAnswer = `${nameA}: ${formatExactFee(feeA) ?? 'contact our counsellor for current fee details'}. ${nameB}: ${formatExactFee(feeB) ?? 'contact our counsellor for current fee details'}. Fees are indicative, so confirm the current figure on each university's official portal.`
  const faqs = config.faqs.map(f =>
    /fee|cost|cheap|expens|price|afford/i.test(f.q) && /(Rs|₹)\s?[\d,.]+/.test(f.a) ? { q: f.q, a: feeAnswer } : f,
  )

  const specCountA = Array.isArray(pdA?.specs) ? pdA.specs.length : 0
  const specCountB = Array.isArray(pdB?.specs) ? pdB.specs.length : 0

  const breadcrumbSchema = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
      { '@type': 'ListItem', position: 2, name: 'Compare', item: 'https://edifyedu.in/compare' },
      { '@type': 'ListItem', position: 3, name: `${nameA} vs ${nameB}`, item: `https://edifyedu.in/compare/${pair}` },
    ],
  }
  const faqSchema = {
    '@context': 'https://schema.org', '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const courseWorkload = ['MBA', 'MCA', 'M.Com', 'MA', 'MSc'].includes(prog) ? 'P2Y' : 'P3Y'
  const courseSchemaA = {
    '@context': 'https://schema.org', '@type': 'Course',
    name: `Online ${prog} - ${uA.name}`,
    description: `Online ${prog} from ${uA.name}, compared with ${uB.name} on fees, specialisations and approvals. Fees are indicative, so confirm them on the official portal.`,
    provider: { '@type': 'Organization', name: uA.name, sameAs: `https://edifyedu.in/universities/${uA.id}` },
    educationalCredentialAwarded: prog,
    // Schema fees go through getProgramSchemaOffer (getDisplayFee). Course info needs offers.category and
    // a hasCourseInstance; courseMode is only valid on the instance.
    offers: { category: 'Online Education', ...(getProgramSchemaOffer(uA, prog as Program) ?? { '@type': 'Offer', priceCurrency: 'INR' }) },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: courseWorkload },
  }
  const courseSchemaB = {
    '@context': 'https://schema.org', '@type': 'Course',
    name: `Online ${prog} - ${uB.name}`,
    description: `Online ${prog} from ${uB.name}, compared with ${uA.name} on fees, specialisations and approvals. Fees are indicative, so confirm them on the official portal.`,
    provider: { '@type': 'Organization', name: uB.name, sameAs: `https://edifyedu.in/universities/${uB.id}` },
    educationalCredentialAwarded: prog,
    offers: { category: 'Online Education', ...(getProgramSchemaOffer(uB, prog as Program) ?? { '@type': 'Offer', priceCurrency: 'INR' }) },
    hasCourseInstance: { '@type': 'CourseInstance', courseMode: 'Online', courseWorkload: courseWorkload },
  }

  const relatedPairs = PAIR_SLUGS.filter(p => {
    if (p === pair) return false
    const c = PAIRS[p]
    return c.uniA === config.uniA || c.uniB === config.uniA || c.uniA === config.uniB || c.uniB === config.uniB
  }).slice(0, 4)

  const progSlug = prog.toLowerCase()
  const verifyA = getVerifyPage(uA.id)
  const verifyB = getVerifyPage(uB.id)

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      {/* Mode-unverified universities get no Course node: it would stamp
          courseMode 'Online' on a claim we cannot back. Same gate as SchemaBlock. */}
      {shouldIndexUniversity(uA.id) && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchemaA) }} />}
      {shouldIndexUniversity(uB.id) && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(courseSchemaB) }} />}

      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-1.5 text-xs text-slate-500 mb-6">
          <Link href="/" className="hover:text-amber-600 no-underline">Home</Link>
          <ChevronRight size={11} />
          <Link href="/compare" className="hover:text-amber-600 no-underline">Compare</Link>
          <ChevronRight size={11} />
          <span className="text-slate-800 font-semibold">{nameA} vs {nameB}</span>
        </nav>

        {/* H1 */}
        <h1 className="text-2xl md:text-3xl font-extrabold mb-4" style={{ color: '#0f172a' }}>
          {nameA} vs {nameB} Online {prog} {year}: Fees, Approvals, Verdict
        </h1>
        <p className="text-slate-600 text-sm mb-8 max-w-2xl">
          Independent, commission-free comparison of two popular online {prog} programmes.
          We verified NIRF ranks, NAAC grades, and fee structures directly from official sources.
          EdifyEdu takes no referral commissions from either university.
        </p>

        {/* Verdict Block */}
        <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-5 mb-8">
          <h2 className="text-base font-bold mb-2" style={{ color: '#0f172a' }}>Quick Verdict</h2>
          <p className="text-sm text-slate-700">
            {nameA} ({uA.naac}, NIRF {nirfDisplay(uA, prog)}) and {nameB} ({uB.naac}, NIRF {nirfDisplay(uB, prog)}) are
            both UGC-DEB approved for online {prog}.
            {feePhrase(feeA) && feePhrase(feeB) ? ` ${nameA} costs ${feePhrase(feeA)}; ${nameB} costs ${feePhrase(feeB)}.` : ''}
            {' '}Scroll down for a side-by-side breakdown and our pick-by-profile recommendation.
          </p>
        </div>

        {/* At-a-Glance Table */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white px-5 py-3">
            <h2 className="text-lg font-bold">Side-by-Side: {prog} at a Glance</h2>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            {[
              { label: 'University', vA: nameA, vB: nameB },
              { label: 'NAAC Grade', vA: uA.naac, vB: uB.naac },
              { label: 'NIRF Rank', vA: nirfDisplay(uA, prog), vB: nirfDisplay(uB, prog) },
              { label: 'UGC-DEB', vA: uA.ugc ? 'Approved' : 'Not listed', vB: uB.ugc ? 'Approved' : 'Not listed' },
              { label: 'Total Fees', vA: feeText(feeA), vB: feeText(feeB) },
              // Only a per-semester figure the university publishes; never a total
              // divided by four. The other side stays blank when it publishes none.
              ...(formatPublishedSemesterFee(feeA) || formatPublishedSemesterFee(feeB) ? [
                { label: 'Per Semester', vA: formatPublishedSemesterFee(feeA) ?? '', vB: formatPublishedSemesterFee(feeB) ?? '' },
              ] : []),
              ...(prog === 'MBA' ? [
                { label: 'EMI from', vA: uA.emiFrom > 0 ? formatINR(uA.emiFrom) + '/mo' : 'On request', vB: uB.emiFrom > 0 ? formatINR(uB.emiFrom) + '/mo' : 'On request' },
              ] : []),
              { label: 'Duration', vA: pdA?.duration || (prog === 'MBA' || prog === 'MCA' ? '2 Years' : '3 Years'), vB: pdB?.duration || (prog === 'MBA' || prog === 'MCA' ? '2 Years' : '3 Years') },
              { label: 'Specialisations', vA: `${specCountA}`, vB: `${specCountB}` },
            ].map((row, i) => (
              <div key={i} className={`col-span-2 grid grid-cols-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                <div className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50">{row.label}</div>
                <div className="px-4 py-3 text-sm font-semibold" style={{ color: '#0f172a' }}>{row.vA}</div>
                <div className="px-4 py-3 text-sm font-semibold text-amber-700">{row.vB}</div>
              </div>
            ))}
          </div>
        </div>
        <p className="text-xs text-slate-400 mb-8">Fees are indicative and change by intake. Confirm the current fee with our counsellor before enrolling.</p>

        {/* Who Should Pick Which */}
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f172a' }}>Who Should Pick Which?</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: '#0f172a' }}>Pick {nameA} if you...</h3>
            <ul className="space-y-2 text-sm text-slate-600">
              {config.verdictA.map((v, i) => <li key={i}>- {v}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-sm font-bold mb-3 text-amber-700">Pick {nameB} if you...</h3>
            <ul className="space-y-2 text-sm text-amber-800">
              {config.verdictB.map((v, i) => <li key={i}>- {v}</li>)}
            </ul>
          </div>
        </div>

        {/* FAQs */}
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f172a' }}>Frequently Asked Questions</h2>
        <div className="space-y-3 mb-8">
          {faqs.map((faq, i) => (
            <details key={i} className="rounded-xl border border-slate-200 bg-white">
              <summary className="px-5 py-3 text-sm font-semibold cursor-pointer" style={{ color: '#0f172a' }}>{faq.q}</summary>
              <p className="px-5 pb-4 text-sm text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>

        {/* University Links */}
        <h2 className="text-xl font-bold mb-3" style={{ color: '#0f172a' }}>Explore Each University</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400 mb-2">{nameA}</p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/universities/${uA.id}`} className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 no-underline hover:bg-amber-50 hover:text-amber-700">{nameA} Review</Link>
              {prog !== 'MBA' && hubResolves(uA.id, prog) && <Link href={`/universities/${uA.id}/${progSlug}`} className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 no-underline hover:bg-amber-50 hover:text-amber-700">{nameA} {prog}</Link>}
              {verifyA && <Link href={verifyA} className="px-3 py-1.5 text-xs font-medium rounded-full bg-slate-100 text-slate-700 no-underline hover:bg-amber-50 hover:text-amber-700">Verify {nameA}</Link>}
            </div>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs text-amber-500 mb-2">{nameB}</p>
            <div className="flex flex-wrap gap-2">
              <Link href={`/universities/${uB.id}`} className="px-3 py-1.5 text-xs font-medium rounded-full bg-white text-amber-700 no-underline hover:bg-amber-100">{nameB} Review</Link>
              {prog !== 'MBA' && hubResolves(uB.id, prog) && <Link href={`/universities/${uB.id}/${progSlug}`} className="px-3 py-1.5 text-xs font-medium rounded-full bg-white text-amber-700 no-underline hover:bg-amber-100">{nameB} {prog}</Link>}
              {verifyB && <Link href={verifyB} className="px-3 py-1.5 text-xs font-medium rounded-full bg-white text-amber-700 no-underline hover:bg-amber-100">Verify {nameB}</Link>}
            </div>
          </div>
        </div>

        {/* Related Comparisons */}
        {relatedPairs.length > 0 && (
          <>
            <h2 className="text-xl font-bold mb-3" style={{ color: '#0f172a' }}>Related Comparisons</h2>
            <div className="flex flex-wrap gap-2 mb-8">
              {relatedPairs.map(p => {
                const c = PAIRS[p]
                const a = getUniversityById(c.uniA)
                const b = getUniversityById(c.uniB)
                if (!a || !b) return null
                return (
                  <Link key={p} href={`/compare/${p}`}
                    className="px-4 py-2 rounded-full text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:bg-amber-50 no-underline transition-colors">
                    {getTitleName(a.id, a.name, a.abbr)} vs {getTitleName(b.id, b.name, b.abbr)} ({c.program})
                  </Link>
                )
              })}
            </div>
          </>
        )}

        {/* CTA */}
        <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-center text-white mb-8">
          <h2 className="text-xl font-bold mb-2">Still deciding?</h2>
          <p className="text-slate-300 text-sm mb-4">
            Edify compares public UGC/NAAC/NIRF data. No paid rankings, no referral commissions.
            Talk to a counsellor for personalised guidance.
          </p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href={`/compare?a=${config.uniA}&b=${config.uniB}`}
              className="px-5 py-2.5 bg-amber-500 text-slate-900 font-bold rounded-xl no-underline hover:bg-amber-400 transition-colors text-sm">
              Open Interactive Tool
            </Link>
            <Link href="/contact"
              className="px-5 py-2.5 border border-white/30 text-white font-bold rounded-xl no-underline hover:bg-white/10 transition-colors text-sm">
              Talk to Counsellor
            </Link>
          </div>
        </div>

        {/* Back links */}
        <div className="flex gap-4 text-sm">
          <Link href="/compare" className="text-amber-600 font-semibold no-underline">All Comparisons</Link>
          <Link href={`/programs/${progSlug}`} className="text-slate-500 no-underline hover:text-slate-700">Browse {prog} Universities</Link>
        </div>
      </div>
    </>
  )
}
