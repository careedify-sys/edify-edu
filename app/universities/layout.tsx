// app/universities/layout.tsx
// SEO metadata for the Universities Listing page
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '127+ Best Online Universities India 2026 — UGC DEB Approved',
  description: 'Compare 127+ UGC DEB approved online universities in India 2026. Filter by NIRF rank, NAAC grade, program (MBA, MCA, BBA, BCA), fees, and region. All universities independently verified.',
  keywords: 'best online universities india 2026, ugc deb approved universities list, nirf ranked online universities, online university comparison india, naac a++ online university',
  alternates: { canonical: 'https://edifyedu.in/universities' },
  openGraph: {
    title: '127+ Best Online Universities India 2026 — UGC DEB Approved',
    description: 'Compare UGC DEB approved online universities in India. NIRF rankings, NAAC grades, fees from ₹40K. July 2026 batch open.',
    url: 'https://edifyedu.in/universities',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Compare Online Universities India 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: '127+ Best Online Universities India 2026 — UGC DEB Approved',
    description: 'Compare UGC DEB approved online universities in India. NIRF rankings, NAAC grades, fees from ₹40K.',
    images: ['https://edifyedu.in/og.webp'],
  },
  robots: { index: true, follow: true },
}

export default function UniversitiesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
