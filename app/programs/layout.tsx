// app/programs/layout.tsx
// SEO metadata for the Programs Index page
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online Degree Programs India 2026 — MBA, MCA, BBA, BCA | UGC Approved | Edify',
  description: 'Explore all UGC DEB approved online programs in India 2026. Online MBA, MCA, BBA, BCA, B.Com, M.Com — fees, syllabus, top universities. Compare and choose the right program.',
  keywords: 'online programs india 2026, online mba mca bba bca india, ugc approved online programs india, best online degree india',
  alternates: { canonical: 'https://edifyedu.in/programs' },
  openGraph: {
    title: 'Online Degree Programs India 2026 — MBA, MCA, BBA, BCA | Edify',
    description: 'All UGC DEB approved online programs: MBA, MCA, BBA, BCA. Fees, syllabus, universities. Find your program.',
    url: 'https://edifyedu.in/programs',
    type: 'website',
    images: [{ url: '/og.webp', width: 1200, height: 630 }],
  },
  robots: { index: true, follow: true },
}

export default function ProgramsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
