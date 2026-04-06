import type { Metadata } from 'next'
import CgpaCalculatorClient from './CgpaCalculatorClient'

export const metadata: Metadata = {
  title: 'CGPA to Percentage Calculator — How to Convert CGPA Instantly | Edify',
  description:
    'Free CGPA to percentage calculator using the UGC formula (CGPA × 9.5). How to convert CGPA into percentage — instant results. SGPA to percentage, 6.6 to 9.5 CGPA conversion table, grade classification.',
  keywords: [
    'cgpa to percentage',
    'cgpa to percentage calculator',
    'how to convert cgpa into percentage',
    'how to calculate percentage from cgpa',
    'sgpa to percentage',
    'sgpa calculator',
    'cgpa multiplying factor',
    '8.75 cgpa in percentage',
    '7.5 cgpa in percentage',
    '8.5 cgpa in percentage',
    '9.0 cgpa in percentage',
    '9.5 cgpa in percentage',
    '8.9 cgpa in percentage',
    '8.1 cgpa in percentage',
    '7.3 cgpa in percentage',
    '6.6 cgpa in percentage',
    '6.5 cgpa in percentage',
    'change cgpa into percentage',
    'convert cgpa to percentage',
    'cgpa full form',
    'full form of cgpa and sgpa',
    'cgpa to percentage formula',
    'cgpa calculator india',
    'cgpa percentage conversion table',
    'cgpa to marks',
    'what is cgpa',
    'cgpa meaning',
    'anna university cgpa to percentage',
    'vtu cgpa to percentage',
    // Extended CGPA value keywords
    '9.1 cgpa in percentage',
    '9.2 cgpa into percentage',
    '9.25 cgpa to percentage',
    '9.15 cgpa in percentage',
    '9.09 cgpa to percentage',
    '9.23 cgpa to percentage',
    '9.42 cgpa to percentage',
    '8.93 cgpa in percentage',
    '8.91 cgpa to percentage',
    '8.88 cgpa to percentage',
    '8.79 cgpa to percentage',
    '8.70 cgpa to percentage',
    '8.65 cgpa to percentage',
    '8.56 cgpa to percentage',
    '8.49 cgpa to percentage',
    '8.34 cgpa in percentage',
    '8.29 cgpa in percentage',
    '8.19 cgpa in percentage',
    '8.15 cgpa in percentage',
    '8.09 cgpa to percentage',
    '8.07 cgpa to percentage',
    '7.99 cgpa in percentage',
    '7.90 cgpa to percentage',
    '7.87 cgpa to percentage',
    '7.84 cgpa to percentage',
    '7.77 cgpa to percentage',
    '7.75 cgpa in percentage',
    '7.68 cgpa in percentage',
    '7.65 cgpa to percentage',
    '7.57 cgpa in percentage',
    '7.27 cgpa in percentage',
    '6.91 cgpa to percentage',
    '6.77 cgpa in percentage',
    '6.3 cgpa to percentage',
    // Formula & concept keywords
    'cgpa conversion formula',
    'cgpa stands for',
    'cgpa full meaning',
    'difference between cgpa and percentage',
    'equivalent percentage of cgpa',
    'how to convert grade point into percentage',
    'convert points to percentage',
    'cgpa to percentage engineering',
    'cgpa sgpa full form',
    'cgpa to percentage certificate',
    'formula to convert cgpa to percentage',
    'how to get percentage from cgpa',
    'how to turn cgpa into percentage',
    'how to change cgpa to percentage',
    'convert grade point to percentage',
    'online convert cgpa to percentage',
    // More specific values
    '7.51 cgpa to percentage',
    '7.53 cgpa to percentage',
    '7.54 cgpa to percentage',
    '7.6 cgpa to percentage',
    '7.95 cgpa to percentage',
    '8 cgpa means how much percentage',
    '8.6 cgpa in percentage',
    '8.7 cgpa in percentage',
    // Low CGPA values
    '6.09 cgpa to percentage',
    '6.10 cgpa in percentage',
    '6.18 cgpa to percentage',
    '6.41 cgpa to percentage',
    '6.63 cgpa in percentage',
    '5.75 cgpa to percentage',
    '5.88 cgpa in percentage',
    '5.91 cgpa to percentage',
    '5.97 cgpa to percentage',
    // Convert-X keywords
    'convert 7.4 cgpa into percentage',
    'convert 7.6 cgpa into percentage',
    'convert 7.8 cgpa into percentage',
    'convert 8 cgpa into percentage',
    'convert 8.6 cgpa into percentage',
    'convert 8.7 cgpa into percentage',
    'convert 8.9 cgpa into percentage',
    'convert 9.4 cgpa into percentage',
    'convert 9.6 cgpa into percentage',
    'convert 9.8 cgpa into percentage',
    // How-to variants
    'how to calculate cgpa in engineering',
    'how to calculate cgpa percentage',
    'how to calculate percentage from cgpa in graduation',
    'how to convert cgpa into marks obtained',
    'how to convert cgpa into total marks',
    'how to convert points into percentage',
    'how to convert percentage to gpa',
    'how to find total marks from cgpa',
    'how to take out percentage from cgpa',
    'how to change cgpa into percentage',
    'how calculate percentage from cgpa',
    // University-specific CGPA
    'hpu cgpa to percentage',
    'delhi university cgpa to percentage',
    'cgpa to percentage gndu',
    'bcom cgpa to percentage',
    // Concept variants
    'cgpa multiplying factor means',
    'cgpa percentage means',
    'cgpa to marks factor',
    'cgpa to percentage converter online',
    'cgpa to equivalent percentage',
    'conversion factor of cgpa',
    'credit point to percentage',
    'degree cgpa to percentage',
    'equivalent percentage from cgpa',
    'cgpa sgpa difference',
    'cgpa or sgpa',
    'cgpa 6 to percentage',
    'cgpa 7 to percentage',
  ],
  alternates: { canonical: 'https://edifyedu.in/tools/cgpa-calculator' },
  openGraph: {
    title: 'CGPA to Percentage Calculator 2026 — Convert Instantly | Edify',
    description:
      'Free CGPA ↔ Percentage converter using UGC formula (CGPA × 9.5). Includes full table for 6.0 to 10.0 CGPA and grade classification.',
    url: 'https://edifyedu.in/tools/cgpa-calculator',
    type: 'website',
    images: [
      {
        url: 'https://edifyedu.in/og.webp',
        width: 1200,
        height: 630,
        alt: 'CGPA to Percentage Calculator — Edify',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CGPA to Percentage Calculator 2026 | Edify',
    description:
      'Convert any CGPA to percentage using the UGC formula. Free, instant, no login required.',
  },
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is CGPA full form?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'CGPA stands for Cumulative Grade Point Average. SGPA stands for Semester Grade Point Average. CGPA is the overall average of all SGPAs across all semesters of a degree program.',
      },
    },
    {
      '@type': 'Question',
      name: 'How to convert CGPA to percentage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'To convert CGPA to percentage, use the UGC formula: Percentage = CGPA × 9.5. For example, 8.0 CGPA = 8.0 × 9.5 = 76%. This formula is standard across most Indian universities including Anna University, VTU, and JNTU.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is 8.75 CGPA in percentage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '8.75 CGPA in percentage = 8.75 × 9.5 = 83.13%. This is considered a first-class with distinction result at most Indian universities.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is 7.5 CGPA in percentage?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: '7.5 CGPA in percentage = 7.5 × 9.5 = 71.25%. This is a first-class result (above 60%) at most Indian universities.',
      },
    },
    {
      '@type': 'Question',
      name: 'Is CGPA to percentage conversion the same at all universities?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'No. Most Indian universities follow the UGC formula (CGPA × 9.5). However, Mumbai University (7-point scale), Pune University, and universities using 4.0-scale GPA have different conversion methods. Always confirm with your university registrar.',
      },
    },
    {
      '@type': 'Question',
      name: 'What is the minimum CGPA required for Online MBA admission?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Most online MBA programs in India require a minimum of 50% aggregate in a bachelor\'s degree, which is approximately 5.26 CGPA on a 10-point scale. Some universities like NMIMS or Manipal require 60% (approximately 6.32 CGPA).',
      },
    },
  ],
}

const webAppSchema = {
  '@context': 'https://schema.org',
  '@type': 'WebApplication',
  name: 'CGPA to Percentage Calculator',
  description:
    'Free online CGPA to percentage calculator using the UGC standard formula (CGPA × 9.5). Supports both CGPA to percentage and percentage to CGPA conversion.',
  applicationCategory: 'EducationApplication',
  operatingSystem: 'Web',
  offers: { '@type': 'Offer', price: '0', priceCurrency: 'INR' },
  url: 'https://edifyedu.in/tools/cgpa-calculator',
}

const breadcrumbSchema = {
  '@context': 'https://schema.org',
  '@type': 'BreadcrumbList',
  itemListElement: [
    { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://edifyedu.in' },
    { '@type': 'ListItem', position: 2, name: 'Tools', item: 'https://edifyedu.in/tools' },
    {
      '@type': 'ListItem',
      position: 3,
      name: 'CGPA Calculator',
      item: 'https://edifyedu.in/tools/cgpa-calculator',
    },
  ],
}

export default function CgpaCalculatorPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <CgpaCalculatorClient />
    </>
  )
}
