'use client'

import { useState } from 'react'
import { ChevronDown, HelpCircle } from 'lucide-react'
import { splitParagraph } from '@/lib/split-paragraphs'
import { stripLinks } from '@/lib/link-markup'
import { FirstHandText } from './FirstHandShared'

interface FAQ { q: string; a: string }

interface Props {
  faqs: FAQ[]
  title?: string
  // Render "[text](/path)" as links and strip it from the schema. Opt-in: some
  // page-content JSON already carries that markup and prints it as-is.
  linkMarkup?: boolean
}

export default function FAQBlock({ faqs, title = 'Frequently Asked Questions', linkMarkup = false }: Props) {
  const [open, setOpen] = useState<number | null>(0)

  const validFaqs = faqs.filter(f => f.q?.trim() && f.a?.trim())
  const faqSchema = validFaqs.length > 0 ? {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: validFaqs.map(f => ({
      '@type': 'Question',
      name: f.q.trim(),
      acceptedAnswer: { '@type': 'Answer', text: linkMarkup ? stripLinks(f.a.trim()) : f.a.trim() },
    })),
  } : null

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      {faqSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      )}
      <div className="flex items-center gap-2 mb-5">
        <HelpCircle size={16} className="text-slate-400" />
        <h2 className="text-lg font-bold" style={{ color: '#0B1533' }}>{title}</h2>
      </div>
      <div className="space-y-2">
        {faqs.map((faq, i) => (
          <div key={i} className="border border-slate-200 rounded-lg overflow-hidden">
            <button
              onClick={() => setOpen(open === i ? null : i)}
              className="w-full flex items-center justify-between px-4 py-3.5 text-left bg-white hover:bg-slate-50 transition-colors"
            >
              <span className="text-sm font-semibold text-slate-800 pr-4">{faq.q}</span>
              <ChevronDown
                size={15}
                className={`text-slate-400 shrink-0 transition-transform ${open === i ? 'rotate-180' : ''}`}
              />
            </button>
            {open === i && (
              <div className="px-4 pb-4 pt-1 bg-slate-50 border-t border-slate-100">
                <div className="text-sm text-slate-600 leading-relaxed space-y-2">
                  {splitParagraph(faq.a).map((para, pi) => <p key={pi}>{linkMarkup ? <FirstHandText text={para} /> : para}</p>)}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
