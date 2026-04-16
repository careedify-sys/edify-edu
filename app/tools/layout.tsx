import { Metadata } from 'next'

export const metadata: Metadata = {
  title: { absolute: 'Free Online Degree Tools 2026 — EMI, ROI & Salary Calculators | Edify' },
  description: 'Free calculators for online MBA, MCA, BBA students. Calculate EMI payments, salary hike ROI, GPA conversion, and compare degree value. Unbiased, data-backed tools.',
  keywords: [
    'online degree roi calculator', 'online mba salary hike calculator', 'online mba emi calculator',
    'online degree fee vs salary comparison', 'gpa percentage converter india', 'calculate my online degree ROI',
  ],
  alternates: { canonical: 'https://edifyedu.in/tools' },
  openGraph: {
    title: 'Free Online Degree Tools — EMI, ROI & Salary Calculators 2026 | Edify',
    description: 'Free EMI, ROI, and salary calculators for online MBA & MCA students. Find your degree payback period and expected salary hike.',
    url: 'https://edifyedu.in/tools',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Free Online Degree Calculators' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Free Online Degree Tools — EMI, ROI & Salary Calculators | Edify',
    description: 'Free EMI, ROI, and salary calculators for online MBA & MCA students.',
  },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
