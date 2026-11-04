// lib/answers/generic-appendices.ts
// Batch C: answer-first sections appended to existing generic posts where the
// post does not already answer the question. Consumed by
// scripts/build-ai-citation-appendix.mts (--batch=C).
//
// Considered and skipped (see audits/ai-citation-flags-2026-11-04.md):
// - affordable-online-mba-india-2026: the post has its own fee ladder with
//   MISMATCH figures for IGNOU, Mangalayatan, SMU and LPU, so a getExactFee
//   ladder would contradict it on the same page (CONFLICT RULE).
// - online-mba-without-entrance-exam-india-2026, ugc-deb-approved-universities-
//   list-2026, best-online-mba-colleges-india-2026 and the specialisation
//   posts already answer their question in an H2 of their own.
import type { BlogPlan } from './blog-plan'
import { getUniversityById } from '../data'
import { displayName, PLACEMENT_FACTS, type AnswerSection } from './university-answers'
import { provenance } from './provenance'
import { appendixHtml } from './render-html'

export interface GenericAppendix {
  plan: BlogPlan
  build: () => { slug: string; html: string; faqs: { q: string; a: string }[]; sections: AnswerSection[] }
}

function validity(): AnswerSection {
  provenance('ugc-reg22-equivalence')
  const lead = 'Yes. An online MBA is a valid degree in India when the university held UGC-DEB entitlement for that programme in the session you joined. Regulation 22 of the UGC ODL and Online Programmes Regulations, 2020 says such degrees "shall be treated as equivalent" to the corresponding campus degrees at postgraduate level.'
  return {
    key: 'online-mba-valid-reg22', q: 'Q4', heading: 'Is an online MBA valid in India? What UGC Regulation 22 says',
    lead,
    bullets: [
      'Equivalence clause: UGC Regulation 22, read at [deb.ugc.ac.in](https://deb.ugc.ac.in/FAQ)',
      'Entitlement is granted per programme and per session, so check your intake year',
      'Check the university and the programme on the [UGC-DEB register](https://deb.ugc.ac.in) before you pay',
    ],
    notPublished: 'Not confirmed by edifyedu.in: how a particular employer or recruitment board treats online degrees. Read the notification for the post you are applying to.',
    // No FAQ item: the post already asks 'Is an online MBA valid in India in 2026?'.
    sources: ['provenance ugc-reg22-equivalence'], backed: true,
  }
}

// Symbiosis (SSODL) is left out: this post says SSODL leads "with active
// placement cells", while the SSODL pages edifyedu.in read carry no placement
// statement (provenance ssodl-no-placement-statement).
const PLACEMENT_ROWS = Object.keys(PLACEMENT_FACTS).filter(id => id !== 'symbiosis-university-online')

function placementTable(): AnswerSection {
  const rows = PLACEMENT_ROWS.map(id => {
    const u = getUniversityById(id)!
    return [displayName(u), PLACEMENT_FACTS[id].cell]
  })
  const lead = `Of the ${rows.length} online MBA universities in the table below, none publishes a placement rate or a package figure labelled for its online MBA graduates on the pages edifyedu.in read on 4 November 2026. Most describe placement assistance or give a hiring-partner count. Ask for an online MBA outcome figure in writing before you pay.`
  return {
    key: 'placement-disclosure', q: 'Q3', heading: 'Which online MBA universities publish placement data?',
    lead,
    table: { head: ['University', 'What the university publishes about placements'], rows },
    notPublished: 'Not published by any university in this table: a placed-student count, placement rate or median salary for online MBA graduates.',
    faq: { q: 'Which online MBA universities publish placement data?', a: lead },
    sources: PLACEMENT_ROWS.flatMap(id => PLACEMENT_FACTS[id].prov.map(p => `provenance ${p}`)), backed: true,
  }
}

function single(slug: string, s: AnswerSection) {
  return { slug, html: appendixHtml([s]), faqs: s.faq ? [s.faq] : [], sections: [s] }
}

export const GENERIC_APPENDICES: GenericAppendix[] = [
  { plan: { slug: 'is-online-mba-valid-india-2026', uni: 'generic', batch: 'C', sections: [] }, build: () => single('is-online-mba-valid-india-2026', validity()) },
  { plan: { slug: 'online-mba-with-placement-india-2026', uni: 'generic', batch: 'C', sections: [] }, build: () => single('online-mba-with-placement-india-2026', placementTable()) },
]
