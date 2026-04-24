import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import { getUniversityById } from '@/lib/data'
import { getTitleName } from '@/lib/seo-title'
import { formatINR } from '@/lib/format'
import { PAIRS, PAIR_SLUGS, type PairSlug } from './pairs'

export const revalidate = 3600

export function generateStaticParams() {
  return PAIR_SLUGS.map(pair => ({ pair }))
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
  const year = new Date().getFullYear()

  const title = `${nameA} vs ${nameB} Online MBA ${year} - Fees, Syllabus & Rankings Compared | EdifyEdu`
  const feeA = formatINR(uA.feeMin)
  const feeB = formatINR(uB.feeMin)
  const description = `${nameA} or ${nameB} for Online MBA in ${year}? Compare NIRF rank, NAAC grade, total fees (${feeA} vs ${feeB}), specialisations and placements. Independent verdict.`

  return {
    title,
    description: description.length > 160 ? description.slice(0, 157) + '...' : description,
    alternates: { canonical: `https://edifyedu.in/compare/${pair}` },
    openGraph: { title, description, url: `https://edifyedu.in/compare/${pair}`, type: 'article' },
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
  const year = new Date().getFullYear()
  const pdA = uA.programDetails['MBA']
  const pdB = uB.programDetails['MBA']

  // Schema
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
    mainEntity: config.faqs.map(f => ({
      '@type': 'Question', name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const specCountA = pdA?.specs?.length || 0
  const specCountB = pdB?.specs?.length || 0

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />

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
        <h1 className="text-2xl md:text-3xl font-extrabold mb-4" style={{ color: '#0f2756' }}>
          {nameA} vs {nameB} Online MBA {year} - Fees, Syllabus, Placements Compared
        </h1>
        <p className="text-slate-600 text-sm mb-8 max-w-2xl">
          Independent, commission-free comparison of two popular online MBA programmes.
          We verified NIRF 2025 ranks, NAAC grades, and fee structures directly from official sources.
          EdifyEdu takes no referral commissions from either university.
        </p>

        {/* At-a-Glance */}
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden mb-8">
          <div className="bg-gradient-to-r from-slate-900 to-slate-700 text-white px-5 py-3">
            <h2 className="text-lg font-bold">At a Glance</h2>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-100">
            {[
              { label: 'University', vA: nameA, vB: nameB },
              { label: 'NIRF Rank', vA: uA.nirf > 0 && uA.nirf < 200 ? `#${uA.nirf}` : 'Unranked', vB: uB.nirf > 0 && uB.nirf < 200 ? `#${uB.nirf}` : 'Unranked' },
              { label: 'NAAC Grade', vA: uA.naac, vB: uB.naac },
              { label: 'Total Fees', vA: formatINR(uA.feeMin), vB: formatINR(uB.feeMin) },
              { label: 'Duration', vA: pdA?.duration || '2 Years', vB: pdB?.duration || '2 Years' },
              { label: 'Specialisations', vA: `${specCountA}`, vB: `${specCountB}` },
            ].map((row, i) => (
              <div key={i} className={`col-span-2 grid grid-cols-3 ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                <div className="px-4 py-3 text-xs font-bold text-slate-500 uppercase tracking-wide bg-slate-50">{row.label}</div>
                <div className="px-4 py-3 text-sm font-semibold" style={{ color: '#0f2756' }}>{row.vA}</div>
                <div className="px-4 py-3 text-sm font-semibold text-amber-700">{row.vB}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Fees */}
        <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>Fees and EMI</h2>
        <p className="text-xs text-slate-400 mb-4">Fees are indicative. Verify with the university before enrolling.</p>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold mb-2" style={{ color: '#0f2756' }}>{nameA}</h3>
            <p className="text-2xl font-black" style={{ color: '#0f2756' }}>{formatINR(uA.feeMin)}</p>
            <p className="text-xs text-slate-500 mt-1">EMI from {formatINR(uA.emiFrom)}/month</p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
            <h3 className="text-sm font-bold mb-2 text-amber-700">{nameB}</h3>
            <p className="text-2xl font-black text-amber-700">{formatINR(uB.feeMin)}</p>
            <p className="text-xs text-amber-600 mt-1">EMI from {formatINR(uB.emiFrom)}/month</p>
          </div>
        </div>

        {/* NIRF & NAAC */}
        <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>NIRF and NAAC Rankings</h2>
        <p className="text-sm text-slate-600 mb-4">
          NIRF ranks universities across categories (Management, University, Overall).
          NAAC grades institutional quality on a scale from C to A++.
          Both {nameA} and {nameB} are UGC-DEB approved for online degrees.
        </p>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs text-slate-400 mb-1">{nameA}</p>
            <p className="text-lg font-bold" style={{ color: '#0f2756' }}>
              {uA.nirf > 0 && uA.nirf < 200 ? `NIRF #${uA.nirf}` : 'Not individually ranked'} · NAAC {uA.naac}
            </p>
          </div>
          <div className="rounded-xl border border-amber-200 bg-amber-50 p-4">
            <p className="text-xs text-amber-500 mb-1">{nameB}</p>
            <p className="text-lg font-bold text-amber-700">
              {uB.nirf > 0 && uB.nirf < 200 ? `NIRF #${uB.nirf}` : 'Not individually ranked'} · NAAC {uB.naac}
            </p>
          </div>
        </div>

        {/* Which should you pick */}
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f2756' }}>Which Should You Pick?</h2>
        <div className="grid md:grid-cols-2 gap-4 mb-8">
          <div className="rounded-xl border border-slate-200 bg-white p-5">
            <h3 className="text-sm font-bold mb-3" style={{ color: '#0f2756' }}>Pick {nameA} if you...</h3>
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
        <h2 className="text-xl font-bold mb-4" style={{ color: '#0f2756' }}>Frequently Asked Questions</h2>
        <div className="space-y-3 mb-8">
          {config.faqs.map((faq, i) => (
            <details key={i} className="rounded-xl border border-slate-200 bg-white">
              <summary className="px-5 py-3 text-sm font-semibold cursor-pointer" style={{ color: '#0f2756' }}>{faq.q}</summary>
              <p className="px-5 pb-4 text-sm text-slate-600">{faq.a}</p>
            </details>
          ))}
        </div>

        {/* Related Comparisons */}
        <h2 className="text-xl font-bold mb-3" style={{ color: '#0f2756' }}>Related Comparisons</h2>
        <div className="flex flex-wrap gap-2 mb-8">
          {PAIR_SLUGS.filter(p => p !== pair).slice(0, 3).map(p => {
            const c = PAIRS[p]
            const a = getUniversityById(c.uniA)
            const b = getUniversityById(c.uniB)
            if (!a || !b) return null
            return (
              <Link key={p} href={`/compare/${p}`}
                className="px-4 py-2 rounded-full text-sm font-medium bg-white text-slate-700 border border-slate-200 hover:border-amber-400 hover:bg-amber-50 no-underline transition-colors">
                {getTitleName(a.id, a.name, a.abbr)} vs {getTitleName(b.id, b.name, b.abbr)}
              </Link>
            )
          })}
        </div>

        {/* CTA */}
        <div className="rounded-xl bg-gradient-to-r from-slate-900 to-slate-700 p-6 text-center text-white mb-8">
          <h2 className="text-xl font-bold mb-2">Still deciding?</h2>
          <p className="text-slate-300 text-sm mb-4">Try our interactive comparison tool or talk to a counsellor.</p>
          <div className="flex gap-3 justify-center flex-wrap">
            <Link href={`/compare?a=${config.uniA}&b=${config.uniB}`}
              className="px-5 py-2.5 bg-amber-500 text-slate-900 font-bold rounded-xl no-underline hover:bg-amber-400 transition-colors text-sm">
              Open Interactive Tool →
            </Link>
            <Link href="/contact"
              className="px-5 py-2.5 border border-white/30 text-white font-bold rounded-xl no-underline hover:bg-white/10 transition-colors text-sm">
              Talk to Counsellor
            </Link>
          </div>
        </div>

        {/* Back links */}
        <div className="flex gap-4 text-sm">
          <Link href="/compare" className="text-amber-600 font-semibold no-underline">← All Comparisons</Link>
          <Link href="/programs/mba" className="text-slate-500 no-underline hover:text-slate-700">Browse MBA Universities</Link>
        </div>
      </div>
    </>
  )
}
