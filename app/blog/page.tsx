import type { Metadata } from 'next'
import BlogIndexView from './BlogIndexView'

export const metadata: Metadata = {
  title: 'Online MBA Blog India 2026: Guides, Reviews & Advice',
  description: 'No-fluff guides on online MBA, MCA, BBA in India. Compare fees, accreditation, career outcomes. Written by Edify experts. Updated for 2026 admissions.',
  keywords: 'online mba blog india, online degree guide 2026, ugc deb approved universities, best online mba india, online mba for working professionals, mba course duration, mba how many years, mba specializations, correspondence mba india, distance mba guide, mba salary per month, best online mba colleges in india, amity online mba review, chandigarh university mba fees, manipal online mba review, iim ranking, iim in india, best iim in india, top iim in india, iim colleges in india, total iim in india, number of iims in india, list of iim in india rank wise, iim ranking in india, nirf iim ranking, top 10 mba colleges in india, best mba colleges in mumbai, best mba colleges in pune, mba colleges in kerala, mba colleges in ahmedabad, government college for mba, govt mba colleges in india, iim ahmedabad mba, iim online courses, iim certificate courses, iim executive program, online mba is good or bad, is mba from ignou worth it, is online mba valid in india, difference between pgdm and mba, online mba cost, cheapest online mba in india, best online mba courses in india, top online mba programs, accredited online mba, is distance education degree valid for government jobs, is open university degree valid for government jobs, online phd in india, online phd courses in india, distance phd, easy phd in india, online phd programs in india, mba after engineering, mba after bcom, career after mba, career options after mba, after mba what next, after mba jobs and salary, after mba what can i do, jobs after doing mba, best jobs after mba, govt jobs after mba, government exams after mba, government exams for mba, government jobs after mba in marketing, mba scope in future, mba in india, average salary after mba in india, mba graduate salary in india, mba business analytics salary in india, mba in data science salary, mba project management salary, mba hospital management salary in india, mba operations management salary, executive mba from iim, online executive mba from iim, iim mba for working professionals, 1 year mba in india, one year mba in india, iim ahmedabad online mba, iim bangalore online mba, iim kozhikode online mba, iim indore online mba',
  alternates: { canonical: 'https://edifyedu.in/blog' },
  openGraph: {
    title: 'edifyedu.in Blog: Online Degree Guides & University Reviews India 2026',
    description: 'Honest, independent guides on online degrees in India. No paid placements. NIRF-ranked comparisons.',
    url: 'https://edifyedu.in/blog',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Edify Blog: Online Degree Guides India 2026' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Edify Blog: Online Degree Guides & University Reviews India 2026',
    description: 'Honest, independent guides on online degrees in India. No paid placements. NIRF-ranked comparisons.',
    images: ['https://edifyedu.in/og.webp'],
  },
}

export default function BlogPage() {
  return <BlogIndexView page={1} />
}
