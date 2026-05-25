import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { notFound } from 'next/navigation'
import {
  CGPA_VALUES,
  TIER_COPY,
  getEntryBySlug,
  type CgpaValueEntry,
} from './data'
import CgpaValueHero from '@/components/cgpa/CgpaValueHero'
import CgpaGradeTable from '@/components/cgpa/CgpaGradeTable'
import CgpaInlineCalculator from '@/components/cgpa/CgpaInlineCalculator'
import CgpaFaq, { type CgpaFaqItem } from '@/components/cgpa/CgpaFaq'
import CgpaEligibilityBanner from '@/components/cgpa/CgpaEligibilityBanner'

export const dynamic = 'force-static'
export const dynamicParams = false
export const revalidate = false

const BASE = 'https://edifyedu.in'

export function generateStaticParams() {
  return CGPA_VALUES.map(e => ({ value: e.slug }))
}

export function generateMetadata({
  params,
}: {
  params: { value: string }
}): Metadata {
  const entry = getEntryBySlug(params.value)
  if (!entry) return {}

  // Title leads with the answer itself ("X CGPA = Y%") so the searcher
  // sees their answer in the SERP. Bracket hook = year stamp + UGC trust mark.
  const title = `${entry.label} CGPA = ${entry.percentage}% in Percentage [UGC 2026] | EdifyEdu`
  const description = `${entry.label} CGPA = ${entry.percentage}% via UGC formula (×9.5). Mumbai Univ variant: ${entry.mumbaiPct}%. Check MBA eligibility, 6.0-10.0 grade table & SGPA conversion.`
  const url = `${BASE}/tools/cgpa-calculator/${entry.slug}`

  return {
    title,
    description,
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      type: 'article',
      siteName: 'edifyedu.in',
      images: [
        {
          url: `${BASE}/og.webp`,
          width: 1200,
          height: 630,
          alt: `${entry.label} CGPA in Percentage`,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
    },
  }
}

function buildFaqs(entry: CgpaValueEntry): CgpaFaqItem[] {
  const { label, percentage, mumbaiPct, tier } = entry

  const eligibilityAnswer =
    tier === 'below-50'
      ? `Not for most programmes. ${percentage}% sits below the 50% minimum that UGC-DEB approved online MBAs use as their floor. You can still apply to a few open universities or take a bridge course to reach the eligibility threshold before applying to NMIMS, Symbiosis, MAHE or Amity.`
      : tier === 'tier-50-60'
        ? `Partly. ${percentage}% clears the 50% floor used by Galgotias, Sharda, LPU, Amity and Jain for online MBA admission. Premium programmes like NMIMS, Symbiosis SCDL and MAHE Online ask for 60% and above, so ${label} CGPA falls short of those.`
        : tier === 'tier-60-70'
          ? `Yes. ${percentage}% qualifies you for the broader online MBA catalogue including NMIMS, Symbiosis, MAHE, Amity, LPU, Galgotias and 120+ UGC-DEB approved universities. Merit scholarships at most top programmes start at 70% and above, so you remain just outside fee-waiver slabs.`
          : `Yes. ${percentage}% clears every UGC-DEB approved online MBA in India including NMIMS, Symbiosis, MAHE, Amity, LPU and 120+ others. You also qualify for merit-based scholarships and fee waivers at most premium universities.`

  return [
    {
      q: `What is ${label} CGPA in percentage?`,
      a: `${label} CGPA equals ${percentage}% using the UGC standard formula (CGPA × 9.5). Most Indian universities including CBSE, Delhi University, Anna University and VTU accept this conversion.`,
    },
    {
      q: `Is ${label} CGPA good for online MBA admission?`,
      a: eligibilityAnswer,
    },
    {
      q: `How is ${label} CGPA calculated in percentage?`,
      a: `Multiply ${label} by 9.5. The result is ${percentage}%. This is the formula recommended by UGC for 10-point CGPA scales used by most Indian universities.`,
    },
    {
      q: `Does Mumbai University use a different formula for ${label} CGPA?`,
      a: `Yes. Mumbai University uses Percentage = (CGPA × 7.1) + 11 for engineering programmes, which gives ${mumbaiPct}% for ${label} CGPA. For arts and commerce streams it uses the 7-point scale. Most other Indian universities use the standard UGC formula.`,
    },
  ]
}

export default function CgpaValuePage({
  params,
}: {
  params: { value: string }
}) {
  const entry = getEntryBySlug(params.value)
  if (!entry) return notFound()

  const { label, percentage, mumbaiPct, cgpa, tier } = entry
  const url = `${BASE}/tools/cgpa-calculator/${entry.slug}`
  const faqs = buildFaqs(entry)

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to convert ${label} CGPA to percentage`,
    description: `Convert ${label} CGPA to percentage using the UGC formula`,
    step: [
      {
        '@type': 'HowToStep',
        name: 'Identify your CGPA',
        text: `Confirm your CGPA is ${label} on a 10-point scale.`,
      },
      {
        '@type': 'HowToStep',
        name: 'Apply the UGC formula',
        text: `Multiply ${label} by 9.5.`,
      },
      {
        '@type': 'HowToStep',
        name: 'Get your percentage',
        text: `The result is ${percentage}%.`,
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(f => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: BASE },
      { '@type': 'ListItem', position: 2, name: 'Tools', item: `${BASE}/tools` },
      {
        '@type': 'ListItem',
        position: 3,
        name: 'CGPA Calculator',
        item: `${BASE}/tools/cgpa-calculator`,
      },
      {
        '@type': 'ListItem',
        position: 4,
        name: `${label} CGPA in Percentage`,
        item: url,
      },
    ],
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="min-h-screen bg-surface-2">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-border">
          <div className="max-w-4xl mx-auto px-4 py-3">
            <div className="flex items-center gap-1.5 text-xs text-ink-2 flex-wrap">
              <Link href="/" className="hover:text-amber">Home</Link>
              <ChevronRight size={12} />
              <Link href="/tools" className="hover:text-amber">Tools</Link>
              <ChevronRight size={12} />
              <Link href="/tools/cgpa-calculator" className="hover:text-amber">
                CGPA Calculator
              </Link>
              <ChevronRight size={12} />
              <span className="text-amber font-semibold">
                {label} CGPA in Percentage
              </span>
            </div>
          </div>
        </div>

        <div className="max-w-4xl mx-auto px-4 py-8 md:py-12 space-y-10">
          <CgpaValueHero label={label} percentage={percentage} />

          <CgpaEligibilityBanner percentage={percentage} />

          {/* How we calculated */}
          <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-navy mb-4">
              How we calculated {label} CGPA in percentage
            </h2>
            <p className="text-ink-2 mb-3 text-sm md:text-base leading-relaxed">
              UGC recommends multiplying CGPA by 9.5 for the 10-point scale used
              by most Indian universities. For a {label} CGPA the math is one step.
            </p>
            <div className="bg-surface-2 rounded-xl p-5 my-4 font-mono text-center text-navy">
              <div className="text-sm text-ink-3 mb-1">Step 1 · Apply the formula</div>
              <div className="text-lg md:text-xl font-bold">
                Percentage = {label} × 9.5
              </div>
              <div className="text-sm text-ink-3 mt-3 mb-1">Step 2 · Result</div>
              <div className="text-2xl font-bold text-amber">{percentage}%</div>
            </div>
            <p className="text-ink-2 text-sm md:text-base leading-relaxed">
              Anna University, VTU, JNTU, Amity, LPU and most UGC-DEB online
              programmes use this same conversion. The official UGC list is on{' '}
              <a
                href="https://deb.ugc.ac.in"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber font-semibold hover:underline"
              >
                deb.ugc.ac.in
              </a>.
            </p>
          </section>

          {/* Eligibility */}
          <section className="bg-white rounded-2xl border border-border p-6 md:p-8">
            <h2 className="font-display text-2xl font-bold text-navy mb-4">
              Is {percentage}% a good score for online MBA, MCA, or BBA?
            </h2>
            <p className="text-ink-2 text-sm md:text-base leading-relaxed mb-4">
              {TIER_COPY[tier]}
            </p>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div className="bg-surface-2 rounded-lg p-3">
                <div className="font-bold text-navy mb-1">Below 50% (under 5.26 CGPA)</div>
                <div className="text-ink-3">Not eligible for most online MBA programmes</div>
              </div>
              <div className="bg-surface-2 rounded-lg p-3">
                <div className="font-bold text-navy mb-1">50 to 60% (5.26 to 6.32 CGPA)</div>
                <div className="text-ink-3">Eligible for Galgotias, Sharda, LPU and similar</div>
              </div>
              <div className="bg-surface-2 rounded-lg p-3">
                <div className="font-bold text-navy mb-1">60 to 70% (6.32 to 7.37 CGPA)</div>
                <div className="text-ink-3">Eligible for NMIMS, Symbiosis, MAHE</div>
              </div>
              <div className="bg-surface-2 rounded-lg p-3">
                <div className="font-bold text-navy mb-1">70% and above (7.37+ CGPA)</div>
                <div className="text-ink-3">All top-tier programmes plus merit scholarships</div>
              </div>
            </div>
          </section>

          {/* Full grade table */}
          <section>
            <h2 className="font-display text-2xl font-bold text-navy mb-4">
              CGPA to percentage conversion table (full 6.0 to 10.0)
            </h2>
            <CgpaGradeTable highlight={cgpa >= 6 && cgpa <= 10 ? cgpa : undefined} />
            <p className="text-xs text-ink-3 mt-3">
              Verify your specific conversion with your university registrar.
              NAAC and NIRF data: <a href="https://naac.gov.in" target="_blank" rel="noopener noreferrer" className="text-amber font-semibold hover:underline">naac.gov.in</a>,{' '}
              <a href="https://nirfindia.org" target="_blank" rel="noopener noreferrer" className="text-amber font-semibold hover:underline">nirfindia.org</a>.
            </p>
          </section>

          {/* Inline calculator */}
          <section>
            <h2 className="font-display text-2xl font-bold text-navy mb-4">
              Calculate any CGPA value
            </h2>
            <CgpaInlineCalculator defaultValue={label} />
          </section>

          {/* FAQs */}
          <section>
            <h2 className="font-display text-2xl font-bold text-navy mb-4">
              Frequently asked questions
            </h2>
            <CgpaFaq items={faqs} />
          </section>

          {/* CTA box */}
          <section className="bg-gradient-to-br from-navy to-[#142540] rounded-2xl p-6 md:p-8 text-center">
            <h2 className="font-display text-xl md:text-2xl font-bold text-white mb-2">
              Want to know which universities accept {percentage}%?
            </h2>
            <p className="text-white/70 text-sm md:text-base mb-5 max-w-xl mx-auto">
              Talk to a counsellor at edifyedu.in. Independent comparison of UGC-DEB
              approved programmes, no paid rankings, no referral commissions.
            </p>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 bg-amber text-white px-6 py-3 rounded-xl text-sm font-bold hover:bg-amber/90 transition-colors"
            >
              Talk to a counsellor
              <ChevronRight size={16} />
            </Link>
          </section>

          {/* Related links */}
          <section>
            <h2 className="font-display text-xl font-bold text-navy mb-4">Related</h2>
            <div className="grid sm:grid-cols-2 gap-3">
              <Link
                href="/tools/cgpa-calculator"
                className="bg-white border border-border rounded-xl p-4 hover:border-amber transition-colors"
              >
                <div className="font-bold text-navy text-sm">Full CGPA calculator</div>
                <div className="text-xs text-ink-3 mt-1">Convert any CGPA or percentage</div>
              </Link>
              <Link
                href="/programs/mba"
                className="bg-white border border-border rounded-xl p-4 hover:border-amber transition-colors"
              >
                <div className="font-bold text-navy text-sm">Online MBA programmes</div>
                <div className="text-xs text-ink-3 mt-1">Compare 120+ UGC-DEB approved MBAs</div>
              </Link>
              <Link
                href="/universities"
                className="bg-white border border-border rounded-xl p-4 hover:border-amber transition-colors"
              >
                <div className="font-bold text-navy text-sm">Browse universities</div>
                <div className="text-xs text-ink-3 mt-1">125+ universities, NIRF and NAAC data</div>
              </Link>
              <Link
                href="/tools/emi-calculator"
                className="bg-white border border-border rounded-xl p-4 hover:border-amber transition-colors"
              >
                <div className="font-bold text-navy text-sm">Fee EMI calculator</div>
                <div className="text-xs text-ink-3 mt-1">Estimate monthly fee instalments</div>
              </Link>
              <Link
                href="/coupons"
                className="bg-white border border-border rounded-xl p-4 hover:border-amber transition-colors"
              >
                <div className="font-bold text-navy text-sm">Active coupons</div>
                <div className="text-xs text-ink-3 mt-1">Verified university fee discounts</div>
              </Link>
              <Link
                href="/contact"
                className="bg-white border border-border rounded-xl p-4 hover:border-amber transition-colors"
              >
                <div className="font-bold text-navy text-sm">Talk to a counsellor</div>
                <div className="text-xs text-ink-3 mt-1">Free guidance on eligibility</div>
              </Link>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}
