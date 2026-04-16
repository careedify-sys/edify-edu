// app/programs/layout.tsx
// SEO metadata for the Programs Index page
import type { Metadata } from 'next'

export const metadata: Metadata = {
  // Note: root layout template appends ' | Edify' — do NOT add it here
  title: 'Online MBA, MCA, BBA, BCA — UGC Approved Degrees India 2026',
  description: 'Explore UGC DEB approved online programs in India 2026. MBA, MCA, BBA, BCA, B.Com, M.Com — compare fees, syllabus & top universities.',
  keywords: 'online programs india 2026, online mba mca bba bca india, ugc approved online programs india, best online degree india, online degree courses, online mba for working professionals, best online mba colleges in india, online bca course, courses after bcom, courses after graduation, mba course details, mba specializations, types of mba',
  alternates: { canonical: 'https://edifyedu.in/programs' },
  openGraph: {
    title: 'Online MBA, MCA, BBA, BCA — UGC Approved Degrees India 2026 | Edify',
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
