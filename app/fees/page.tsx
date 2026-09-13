import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import FeesTableClient from '@/components/FeesTableClient'
import feesData from '@/data/fees-hub-data.json'
import { naacPhrase } from '@/lib/seo/display-guards'

const BASE = 'https://edifyedu.in'
const year = new Date().getFullYear()

// ── Summary figures ──────────────────────────────────────────────────────────
// The two fee chips stay literals ON PURPOSE. Deriving them from feesData was
// tried on 2026-09-13 and reverted the same day: min(feeMin) returned IGNOU at
// ₹9,600, which is the floor of a ₹9,600 to ₹66,000 row spanning seven
// programmes, not a total fee anyone pays. 63 of the 125 priced rows exceed the
// SUSPICIOUS_RANGE_RATIO of 3.0 that lib/fees.ts already uses to reject exactly
// this shape, so the dataset cannot support a trustworthy "lowest fee" claim.
// That is the parked placeholder-fee cluster, and it needs portal research
// rather than a cleverer reduce. Do not re-derive these without fixing the data.
//
// Counts below are safe to derive: they count rows and programme memberships,
// not money.
const priced = feesData.filter(u => typeof u.feeMin === 'number' && u.feeMin > 0)
const naacAPlusPlus = feesData.filter(u => u.naac === 'A++').length
const naacAPlus = feesData.filter(u => u.naac === 'A+').length

const programCounts = (() => {
  const counts: Record<string, number> = {}
  for (const u of feesData) for (const p of (u.programs || [])) counts[p] = (counts[p] || 0) + 1
  return Object.entries(counts).sort((a, b) => b[1] - a[1])
})()

export const metadata: Metadata = {
  title: { absolute: `Online University Fees ${year}: Compare ${priced.length}+ UGC-DEB Approved Programs | EdifyEdu` },
  description: `Compare total fees and EMI for ${priced.length}+ UGC-DEB approved online MBA, MCA, BBA and BCA programs. Filter by NAAC grade, program type and region. Free, no login.`,
  keywords: [
    'online mba fees india 2026',
    'online degree fees comparison',
    'ugc deb approved universities fees',
    'online mba fee structure',
    'cheapest online mba india',
    'online mca fees',
    'online bba fees',
    'naac a++ university fees',
    'online degree emi',
    'online university fee comparison',
  ].join(', '),
  alternates: { canonical: `${BASE}/fees` },
  openGraph: {
    title: `Online University Fees ${year}: Compare ${priced.length}+ Programs | EdifyEdu`,
    description: `Compare fees and EMI for ${priced.length}+ UGC-DEB approved online degrees. Filter by NAAC, program and region.`,
    url: `${BASE}/fees`,
    type: 'website',
    siteName: 'edifyedu.in',
    images: [{ url: `${BASE}/og.webp`, width: 1200, height: 630, alt: 'Online University Fee Comparison | EdifyEdu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Online University Fees ${year} | EdifyEdu`,
    description: `Compare fees for ${priced.length}+ UGC-DEB approved online MBAs and degrees. Filter by NAAC, program and region.`,
  },
  robots: { index: true, follow: true },
}

// Answers are derived from feesData or describe process. No figure here is
// written by hand, so the FAQ cannot drift out of step with the table above it.
const faqs: { q: string; a: string }[] = [
  {
    q: 'How do I find the lowest fee for the programme I want?',
    a: 'Filter the table by programme first, then sort by fee. A figure that looks unusually low is often the floor of a range covering several programmes at that university rather than the price of the one you want. Open the university page to see the fee for your specific programme, then confirm it on the official portal.',
  },
  {
    q: 'How many NAAC A++ universities offer online degrees?',
    a: `${naacAPlusPlus} universities in this comparison hold a NAAC A++ grade and ${naacAPlus} hold A+. Grade and cycle both matter, because a grade from an older cycle may since have been revised. Verify the current grade at naac.gov.in.`,
  },
  {
    q: 'Is the fee shown the total course fee or the fee per semester?',
    a: 'Every figure in this table is the total programme fee across the full duration, not a semester instalment. Universities publish fees in both forms, so compare like with like before deciding one is cheaper than another.',
  },
  {
    q: 'Why does a fee here differ from the number on the university website?',
    a: 'Universities revise fees between cycles, and some quote a base fee that excludes examination or registration charges. Treat the figures here as a starting point for comparison and confirm the current total with the university before you apply.',
  },
  {
    q: 'Can online degree fees be paid in instalments?',
    a: 'Most universities in this comparison accept semester-wise payment, and many list a no-cost EMI option. The EMI column shows the lowest monthly figure a university advertises. Confirm the tenure and any processing charge directly with the university.',
  },
  {
    q: 'Does a higher fee mean better placement outcomes?',
    a: 'No. Fee and outcome are set independently, and this comparison shows NAAC grade and NIRF rank next to fee precisely so the two can be weighed separately. Edify compares public UGC, NAAC and NIRF data, with no paid rankings.',
  },
]

function buildSchemas() {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Fees Comparison', item: `${BASE}/fees` },
    ],
  }

  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `Online University Fee Comparison ${year}`,
    description: `Total fees for UGC-DEB approved online degree programs from ${feesData.length} universities in India`,
    numberOfItems: feesData.length,
    itemListElement: feesData.slice(0, 20).map((u, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: u.name,
      url: `${BASE}/universities/${u.id}`,
      description: `${u.name}: ${u.feeStr} total fee, ${naacPhrase(u.naac)}`,
    })),
  }

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  // Previously built and then never rendered, so the page shipped without it.
  // dateModified is the build date, which is when the underlying dataset was
  // last published.
  const webpage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Online University Fees ${year}: Compare ${priced.length}+ Programs`,
    description: `Compare fees and EMI for ${priced.length} UGC-DEB approved online degree programs`,
    url: `${BASE}/fees`,
    dateModified: new Date().toISOString().slice(0, 10),
    isPartOf: { '@type': 'WebSite', name: 'EdifyEdu', url: BASE },
    breadcrumb: { '@type': 'BreadcrumbList', itemListElement: breadcrumb.itemListElement },
  }

  return { breadcrumb, itemList, faqPage, webpage }
}

export default function FeesPage() {
  const { breadcrumb, itemList, faqPage, webpage } = buildSchemas()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqPage) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webpage) }} />

      <div className="min-h-screen bg-surface-2">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-2">
              <Link href="/" className="hover:text-amber">Home</Link>
              <ChevronRight size={12} />
              <span className="text-amber font-semibold">Fees Comparison</span>
            </div>
          </div>
        </div>

        {/* Hero */}
        <div className="bg-white border-b border-border">
          <div className="max-w-7xl mx-auto px-4 py-8 md:py-10">
            <h1 className="font-display text-2xl md:text-3xl font-bold text-navy mb-2">
              Online University Fees Comparison {year}
            </h1>
            <p className="text-ink-2 text-sm md:text-base max-w-2xl">
              Total fee and EMI for <strong>{priced.length}+</strong> UGC-DEB approved online degrees.
              Filter by program, NAAC grade, or region. Fees are indicative. Verify with the official portal before applying.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="bg-surface-2 rounded-lg px-3 py-2 text-xs text-ink-2">
                <span className="font-bold text-navy">₹60K</span> lowest fee
              </div>
              <div className="bg-surface-2 rounded-lg px-3 py-2 text-xs text-ink-2">
                <span className="font-bold text-navy">₹3.70L</span> highest fee
              </div>
              <div className="bg-surface-2 rounded-lg px-3 py-2 text-xs text-ink-2">
                <span className="font-bold text-navy">{naacAPlusPlus}</span> NAAC A++ universities
              </div>
              <Link
                href="/contact"
                className="bg-amber text-white rounded-lg px-3 py-2 text-xs font-semibold hover:bg-amber/90 transition-colors"
              >
                Free counselling →
              </Link>
            </div>
          </div>
        </div>

        {/* Table + filters (client) */}
        <div className="pb-6">
          <FeesTableClient />
        </div>

        {/* ── Supporting content ──────────────────────────────────────────────
            Added 2026-09-13. The page previously carried one H1, a table and a
            footnote, with no H2 anywhere, which left nothing for a fee query to
            match beyond the table itself. Every figure below is read from
            feesData. See audits/gsc-diagnosis-2026-09-13.md. */}
        <div className="max-w-7xl mx-auto px-4 pb-12 space-y-10">

          <section className="bg-white rounded-xl border border-border p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-navy mb-3">
              How to read these fees
            </h2>
            <p className="text-sm text-ink-2 max-w-3xl mb-3">
              Every figure in this table is the total programme fee across the full duration,
              not a semester instalment. Universities publish fees in both forms, so compare
              like with like before deciding one is cheaper.
            </p>
            <p className="text-sm text-ink-2 max-w-3xl mb-3">
              Fees move between admission cycles, and some universities quote a base fee that
              leaves out examination or registration charges. Treat these numbers as a starting
              point and confirm the current total on the university portal before you pay.
            </p>
            <p className="text-sm text-ink-2 max-w-3xl">
              Fee and outcome are set independently. NAAC grade and NIRF rank sit next to the fee
              in this table so you can weigh them separately. Edify compares public UGC, NAAC and
              NIRF data, with no paid rankings and no referral commissions.
            </p>
          </section>

          <section className="bg-white rounded-xl border border-border p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-navy mb-1">
              Fees by programme
            </h2>
            <p className="text-sm text-ink-3 mb-5">
              How many universities in this comparison offer each programme online.
            </p>
            <div className="flex flex-wrap gap-2">
              {programCounts.map(([prog, n]) => (
                <span key={prog} className="px-3 py-1.5 rounded-full text-xs font-medium border border-border bg-surface-2 text-ink-2">
                  {prog}: <strong className="text-navy">{n}</strong>
                </span>
              ))}
            </div>
            <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <Link href="/programs/mba" className="text-amber hover:underline no-underline">Online MBA universities and fees</Link>
              <Link href="/programs/mca" className="text-amber hover:underline no-underline">Online MCA universities and fees</Link>
              <Link href="/programs/bba" className="text-amber hover:underline no-underline">Online BBA universities and fees</Link>
              <Link href="/programs/bca" className="text-amber hover:underline no-underline">Online BCA universities and fees</Link>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-border p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-navy mb-3">
              Check the approval before you check the fee
            </h2>
            <p className="text-sm text-ink-2 max-w-3xl mb-4">
              A fee only means something if the programme is entitled to run online. UGC-DEB
              publishes the list of entitled universities and the programmes each one may offer
              in online mode. Confirm both before you compare cost.
            </p>
            <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm font-semibold">
              <Link href="/guides/how-to-check-ugc-deb-approval" className="text-amber hover:underline no-underline">How to check UGC-DEB approval</Link>
              <Link href="/guides/naac-nirf-rankings-explained" className="text-amber hover:underline no-underline">What NAAC grades and NIRF ranks mean</Link>
              <Link href="/verify" className="text-amber hover:underline no-underline">Verify a university</Link>
              <Link href="/tools/emi-calculator" className="text-amber hover:underline no-underline">Work out the monthly EMI</Link>
              <Link href="/compare" className="text-amber hover:underline no-underline">Compare two universities side by side</Link>
            </div>
          </section>

          <section className="bg-white rounded-xl border border-border p-6 md:p-8">
            <h2 className="font-display text-xl font-bold text-navy mb-5">
              Online university fees: common questions
            </h2>
            <div className="space-y-5">
              {faqs.map((f, i) => (
                <div key={i}>
                  <h3 className="text-sm font-bold text-navy mb-1.5">{f.q}</h3>
                  <p className="text-sm text-ink-2 max-w-3xl">{f.a}</p>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Footer note */}
        <div className="max-w-7xl mx-auto px-4 pb-10">
          <p className="text-xs text-ink-3 max-w-2xl">
            Fee data sourced from official university portals and UGC-DEB records.
            All fees are indicative and subject to change. NAAC grades from{' '}
            <a href="https://naac.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">naac.gov.in</a>.
            NIRF ranks from{' '}
            <a href="https://nirfindia.org" target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">nirfindia.org</a>.
            UGC-DEB approved list at{' '}
            <a href="https://deb.ugc.ac.in" target="_blank" rel="noopener noreferrer" className="text-amber hover:underline">deb.ugc.ac.in</a>.
          </p>
        </div>
      </div>
    </>
  )
}
