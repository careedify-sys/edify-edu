// lib/answers/generic-appendices.ts
// Batch C: answer-first sections appended to existing generic posts that
// already target a discovery intent (fee ladder, placements, validity, ...).
// Filled in Batch C; see scripts/build-ai-citation-appendix.mts.
import type { BlogPlan } from './blog-plan'
import type { AnswerSection } from './university-answers'

export interface GenericAppendix {
  plan: BlogPlan
  build: () => { slug: string; html: string; faqs: { q: string; a: string }[]; sections: AnswerSection[] }
}

export const GENERIC_APPENDICES: GenericAppendix[] = []
