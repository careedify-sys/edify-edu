// lib/answers/blog-plan.ts
//
// Which Q-sections are appended to which existing review post (Batch A of the
// AI-citation sprint, 2026-11-04). Derived from
// audits/ai-citation-coverage-2026-11-04.csv: a question is listed here only
// when the post has no heading or FAQ for it, the data exists, and adding it
// would not contradict a claim already on the post.
//
// `omit` drops a fact type from the new copy because the post already states
// a different value for it (CONFLICT RULE). Each omission is logged in
// audits/ai-citation-flags-2026-11-04.md with the existing claim's location.
//
// Consumed only by scripts/build-ai-citation-appendix.mts, which writes the
// rendered sections into lib/blog.ts between ai-answers markers.

import type { QId } from './university-answers'

export type Omit = 'fee' | 'specCount' | 'naac' | 'nirf'

export interface BlogPlan {
  slug: string
  uni: string
  batch: 'A1' | 'A2' | 'A3' | 'A4' | 'C'
  sections: QId[]
  omit?: Omit[]
  /** Extra FAQ builders by key, see EXTRA_FAQS in the build script. */
  extraFaqs?: string[]
  /** Link to the legit post that owns Q4/Q9, if the post does not already. */
  linkLegit?: boolean
}

export const BLOG_PLAN: BlogPlan[] = [
  // A1
  { slug: 'amity-online-mba-review-2026', uni: 'amity-university-online', batch: 'A1', sections: ['Q8'], omit: ['fee', 'specCount'], extraFaqs: ['amity-good-or-bad', 'amity-dual', 'amity-wes'], linkLegit: true },
  { slug: 'muj-online-mba-review-2026', uni: 'manipal-university-jaipur-online', batch: 'A1', sections: ['Q2', 'Q6', 'Q7', 'Q8'], omit: ['fee'], extraFaqs: ['searched-specs'], linkLegit: true },
  { slug: 'mahe-online-mba-review-2026', uni: 'manipal-academy-higher-education-online', batch: 'A1', sections: ['Q4', 'Q6', 'Q7', 'Q8', 'Q9'], omit: ['fee'] },
  { slug: 'smu-online-mba-review', uni: 'sikkim-manipal-university-online', batch: 'A1', sections: ['Q2'], omit: ['fee'] },
  { slug: 'chandigarh-university-online-mba-review', uni: 'chandigarh-university-online', batch: 'A1', sections: ['Q2'], omit: ['fee', 'specCount', 'nirf'], extraFaqs: ['searched-specs'], linkLegit: true },
  // A2
  { slug: 'symbiosis-online-mba-review-2026', uni: 'symbiosis-university-online', batch: 'A2', sections: ['Q3', 'Q7', 'Q8', 'Q9'], omit: ['fee', 'specCount'], extraFaqs: ['searched-specs', 'ssodl-vs-distance'] },
  { slug: 'nmims-online-mba-review-2026', uni: 'nmims-online', batch: 'A2', sections: [], omit: ['fee', 'naac', 'nirf'], extraFaqs: ['searched-specs'], linkLegit: true },
  { slug: 'online-mba-lpu-review-2026', uni: 'lovely-professional-university-online', batch: 'A2', sections: ['Q6', 'Q7'], omit: ['fee'], linkLegit: true },
  { slug: 'uu-doon-online-mba-review', uni: 'uttaranchal-university-online', batch: 'A2', sections: ['Q2', 'Q3', 'Q4', 'Q7'], omit: ['fee'] },
  { slug: 'bits-pilani-online-mba-review-2026', uni: 'bits-pilani-work-integrated-online', batch: 'A2', sections: ['Q4', 'Q7', 'Q8'], omit: ['fee', 'specCount', 'naac', 'nirf'], extraFaqs: ['bits-offers-mba'] },
  // A3
  { slug: 'srm-online-mba-2026', uni: 'srm-institute-science-technology-online', batch: 'A3', sections: ['Q2', 'Q4', 'Q6'], omit: ['fee'] }, // the post covers two SRMs, so a fee figure attributes ambiguously (check-blog-fees)
  { slug: 'jain-online-mba-review-2026', uni: 'jain-university-online', batch: 'A3', sections: ['Q6', 'Q7', 'Q8'], omit: ['fee'] },
  { slug: 'dy-patil-online-mba-review', uni: 'dr-dy-patil-vidyapeeth-online', batch: 'A3', sections: ['Q2', 'Q6'], omit: ['fee'], linkLegit: true },
  { slug: 'galgotias-online-mba-review', uni: 'galgotias-university-online', batch: 'A3', sections: ['Q3'], omit: ['fee'], linkLegit: true },
  { slug: 'amrita-online-mba-review', uni: 'amrita-vishwa-vidyapeetham-online', batch: 'A3', sections: ['Q6', 'Q7', 'Q8'], omit: ['fee'], extraFaqs: ['searched-specs'] },
  // A4
  { slug: 'parul-online-mba-review', uni: 'parul-university-online', batch: 'A4', sections: ['Q2', 'Q7'], omit: ['fee'], linkLegit: true },
  { slug: 'bharati-vidyapeeth-online-mba-review', uni: 'bharati-vidyapeeth-university-online', batch: 'A4', sections: ['Q2', 'Q4', 'Q7'], omit: ['fee'] },
  { slug: 'upes-online-mba-review-2026', uni: 'upes-online', batch: 'A4', sections: ['Q7', 'Q8'], omit: ['fee'], extraFaqs: ['searched-specs'] },
  { slug: 'jamia-hamdard-mba-2026', uni: 'jamia-hamdard-online', batch: 'A4', sections: ['Q5', 'Q6'], omit: ['fee'], extraFaqs: ['searched-specs'], linkLegit: true },
  { slug: 'christ-online-admission-guide', uni: 'christ-university-online', batch: 'A4', sections: [], extraFaqs: ['christ-mba'] },
]
