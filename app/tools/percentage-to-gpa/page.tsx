import type { Metadata } from 'next'
import PercentageToGpaClient from './PercentageToGpaClient'

export const metadata: Metadata = {
  title: 'Percentage to GPA Calculator 2026 — Convert Instantly (4.0 & 10-Point Scale) | Edify',
  description:
    'Free percentage to GPA calculator for India 2026. Convert percentage to 4.0 GPA scale (for US/international applications) or 10-point CGPA (for Indian universities). Instant results with grade table.',
  keywords: [
    'percentage to gpa',
    'percentage to gpa calculator',
    'percentage to gpa converter india',
    'convert percentage to gpa',
    'percentage to 4.0 gpa',
    'indian percentage to gpa',
    'percentage to cgpa',
    'percentage to gpa india',
    '75 percent to gpa',
    '80 percent to gpa',
    '70 percent gpa',
    '65 percent gpa',
    'gpa calculator india',
    'percentage to grade point',
    'percentage to gpa for us universities',
  ],
  alternates: { canonical: 'https://edifyedu.in/tools/percentage-to-gpa' },
  openGraph: {
    title: 'Percentage to GPA Calculator 2026 — 4.0 & 10-Point Scale | Edify',
    description:
      'Convert Indian percentage to GPA instantly. 4.0 scale for international applications, 10-point CGPA for Indian universities. Free, no login.',
    url: 'https://edifyedu.in/tools/percentage-to-gpa',
    type: 'website',
    images: [{ url: 'https://edifyedu.in/og.webp', width: 1200, height: 630, alt: 'Percentage to GPA Calculator — Edify' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Percentage to GPA Calculator 2026 | Edify',
    description: 'Convert Indian percentage to 4.0 GPA or 10-point CGPA. Free, instant, no login required.',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How to convert percentage to GPA in India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'For Indian universities using a 10-point scale: GPA = Percentage ÷ 9.5. For example, 76% ÷ 9.5 = 8.0 CGPA. For international (4.0 scale) conversion, refer to the grade band table: 90%+ = 4.0, 80–89% = 3.7, 70–79% = 3.3, 60–69% = 3.0, 50–59% = 2.0.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is 75% in GPA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '75% converts to approximately 7.89 CGPA on a 10-point scale (75 ÷ 9.5). On a 4.0 GPA scale used in the US, 75% falls in the B+ range, typically 3.3 GPA.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is 60% in GPA?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '60% is approximately 6.32 CGPA on a 10-point scale (60 ÷ 9.5). On the 4.0 scale, 60–69% is typically B grade (3.0 GPA).',
      },
    },
    {
      '@type': 'Question',
      name: 'Is a 4.0 GPA the same worldwide?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. The 4.0 scale is primarily used in the US and Canada. Indian universities typically use a 10-point CGPA scale. UK uses class grades (First, 2:1, 2:2). When applying internationally, always check the specific university\'s conversion table.',
      },
    },
    {
      '@type': 'Question',
      name: 'What GPA is required for US university admissions from India?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most US universities require a minimum 3.0 GPA (roughly 70% or 7.37 CGPA on Indian scale) for master\'s admissions. Competitive programs at top universities expect 3.5+ (roughly 80%+). Some universities also accept WES-evaluated transcripts which convert your Indian percentage directly.',
      },
    },
  ],
}

export default function PercentageToGpaPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <PercentageToGpaClient />
    </>
  )
}
