import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online Degree Guides India 2026 — Honest Answers to Every Question',
  description: 'Straight answers on online MBA, MCA, BBA degrees in India. Is it valid for government jobs? How to choose a university? UGC DEB explained. No fluff, no paid placements.',
  keywords: [
    'online degree guide india 2026', 'is online mba valid for government jobs', 'how to choose online university india',
    'ugc deb approved degree guide', 'online mba vs distance education india', 'naac nirf explained',
  ],
  alternates: { canonical: 'https://edifyedu.in/guides' },
  openGraph: {
    title: 'Online Degree Guides India 2026 — Honest Answers | Edify',
    description: 'Straight answers on online degrees in India. Is it valid for govt jobs? How to choose? UGC DEB explained. No paid content.',
    url: 'https://edifyedu.in/guides',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Online Degree Guides India 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Online Degree Guides India 2026 — Honest Answers | Edify',
    description: 'Straight answers on online MBA, MCA, BBA in India. No fluff, no paid placements.',
  },
}

export default function GuidesLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
