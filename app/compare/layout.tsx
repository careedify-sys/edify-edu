import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Compare Online MBA Syllabus India 2026 — Amity vs NMIMS vs LPU',
  description: 'Compare MBA syllabus of 25+ top online universities side-by-side. See semester-wise subjects, specialisation options, and course overlap. UGC DEB approved, NIRF ranked.',
  keywords: [
    'compare online mba india', 'online mba syllabus comparison 2026', 'amity vs manipal online mba syllabus',
    'compare ugc approved online degree', 'online mba fees comparison india', 'best online mba syllabus india 2026',
  ],
  alternates: { canonical: 'https://edifyedu.in/compare' },
  openGraph: {
    title: 'Compare Online MBA Syllabus India 2026 — Side-by-Side Tool | Edify',
    description: 'Compare MBA syllabus of 25+ top universities side-by-side. Semester-wise subjects, specialisation options. UGC DEB approved.',
    url: 'https://edifyedu.in/compare',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Compare Online MBA Syllabus India 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Compare Online MBA Syllabus India 2026 | Edify',
    description: 'Compare MBA syllabus of 25+ top universities side-by-side. UGC DEB approved.',
  },
}

export default function CompareLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
