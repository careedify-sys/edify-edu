import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Online MBA Fees 2026 — Top Universities India',
  description: 'Compare online MBA fees 2026 — NMIMS, Amity, Symbiosis, UPES, Sikkim Manipal & 25+ universities. Total fees from ₹60,000. UGC DEB approved, NIRF ranked.',
  keywords: [
    'online mba fees', 'nmims online mba fees', 'amity online mba fees', 'symbiosis online mba fees',
    'amity university online mba fees', 'upes online mba fees', 'sikkim manipal university online mba fees',
    'online mba fees in india', 'mba online courses fees', 'online mba fee structure',
    'symbiosis pune online mba fees', 'sp jain online mba fees', 'icfai online mba fees',
    'online mba fees structure', 'amity online mba fee structure', 'compare online mba india',
    'online mba syllabus comparison 2026', 'best online mba colleges in india',
  ],
  alternates: { canonical: 'https://edifyedu.in/compare' },
  openGraph: {
    title: 'Compare Online MBA Fees 2026 — Top Universities India | Edify',
    description: 'Compare online MBA fees & syllabus side-by-side. NMIMS, Amity, Symbiosis, UPES, Sikkim Manipal & 25+ universities. Fees from ₹60,000. UGC DEB approved.',
    url: 'https://edifyedu.in/compare',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Compare Online MBA Syllabus India 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Online MBA Fees & Syllabus India 2026 | Edify',
    description: 'Compare MBA syllabus of 25+ top universities side-by-side. UGC DEB approved.',
  },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
