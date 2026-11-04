// components/QuickAnswers.tsx
//
// Answer-first sections for an MBA hub whose university has no online MBA
// review blog (AI-citation sprint, 2026-11-04). Selection, the 5-backed-
// question minimum and the conflict rule live in lib/answers/hub-answers.ts;
// the HTML comes from the same renderer as the blog appendices, so a hub and
// a blog can never word the same answer differently. Server component.
import Link from 'next/link'
import type { HubAnswers } from '@/lib/answers/hub-answers'
import { sectionHtml } from '@/lib/answers/render-html'

export default function QuickAnswers({ answers }: { answers: HubAnswers }) {
  const html = answers.sections.map(sectionHtml).join('\n')
  return (
    <section id="quick-answers" className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="prose-article" dangerouslySetInnerHTML={{ __html: html }} />
      {answers.legit && (
        <p className="text-sm text-slate-600 mt-4">
          For the UGC-DEB and NAAC checks, read <Link href={answers.legit.href} className="underline" style={{ color: '#C8811A' }}>{answers.legit.title}</Link>
        </p>
      )}
      <p className="text-sm text-slate-600 mt-4">
        Edify compares public UGC/NAAC/NIRF data, no paid rankings. Talk to our counsellor before you pay any fee.
      </p>
    </section>
  )
}
