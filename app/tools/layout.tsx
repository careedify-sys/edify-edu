import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Online Degree ROI Calculator — Fees vs Salary Hike 2026 | Edify',
  description: 'Calculate the return on investment for your online MBA, MCA, or BBA. Compare your current salary against potential 2026 hikes. Unbiased, data-backed utility for online students.',
  keywords: [
    'online degree roi calculator', 'online mba salary hike calculator', 'best online degree tool 2026',
    'online degree fee vs salary comparison', 'edify edifyedu.in tools', 'calculate my online degree ROI',
  ],
  alternates: {
    canonical: 'https://edifyedu.in/tools',
  },
}

export default function ToolsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>
}
