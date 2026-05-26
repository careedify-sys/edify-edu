import type { Metadata } from 'next'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'
import FeesTableClient from '@/components/FeesTableClient'
import feesData from '@/data/fees-hub-data.json'

const BASE = 'https://edifyedu.in'
const year = new Date().getFullYear()

export const metadata: Metadata = {
  title: `Online University Fees ${year}: Compare 125+ UGC-DEB Approved Programs | EdifyEdu`,
  description: `Compare total fees and EMI for 125+ UGC-DEB approved online MBA, MCA, BBA and BCA programs. Filter by NAAC grade, program type and region. Free, no login.`,
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
    title: `Online University Fees ${year}: Compare 125+ Programs | EdifyEdu`,
    description: `Compare fees and EMI for 125+ UGC-DEB approved online degrees. Filter by NAAC, program and region.`,
    url: `${BASE}/fees`,
    type: 'website',
    siteName: 'edifyedu.in',
    images: [{ url: `${BASE}/og.webp`, width: 1200, height: 630, alt: 'Online University Fee Comparison | EdifyEdu' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: `Online University Fees ${year} | EdifyEdu`,
    description: `Compare fees for 125+ UGC-DEB approved online MBAs and degrees. Filter by NAAC, program and region.`,
  },
  robots: { index: true, follow: true },
}

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
      description: `${u.name}: ${u.feeStr} total fee, NAAC ${u.naac}`,
    })),
  }

  const webpage = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: `Online University Fees ${year}: Compare 125+ Programs`,
    description: `Compare fees and EMI for ${feesData.length} UGC-DEB approved online degree programs`,
    url: `${BASE}/fees`,
    breadcrumb: { '@type': 'BreadcrumbList', itemListElement: breadcrumb.itemListElement },
  }

  return { breadcrumb, itemList, webpage }
}

export default function FeesPage() {
  const { breadcrumb, itemList } = buildSchemas()

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }} />

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
              Total fee and EMI for <strong>{feesData.length}+</strong> UGC-DEB approved online degrees.
              Filter by program, NAAC grade, or region. Fees are indicative. Verify with the official portal before applying.
            </p>
            <div className="mt-4 flex flex-wrap gap-3">
              <div className="bg-surface-2 rounded-lg px-3 py-2 text-xs text-ink-2">
                <span className="font-bold text-navy">₹60K</span> — Lowest fee
              </div>
              <div className="bg-surface-2 rounded-lg px-3 py-2 text-xs text-ink-2">
                <span className="font-bold text-navy">₹3.70L</span> — Highest fee
              </div>
              <div className="bg-surface-2 rounded-lg px-3 py-2 text-xs text-ink-2">
                <span className="font-bold text-navy">{feesData.filter(u => u.naac === 'A++').length}</span> NAAC A++ universities
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
        <div className="pb-12">
          <FeesTableClient />
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
