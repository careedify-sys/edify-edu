// lib/answers/targets.ts
//
// Which page owns the autocomplete answers for each university (AI-citation
// sprint, 2026-11-04). One primary page per question per university, so the
// blog and the hub never carry the same section.
//
// REVIEW_BLOG_FOR: the university's own online MBA review. When present, new
// Q-sections are appended there (review blogs outrank hubs in 10 of 10
// universities in the Aug GSC data). When absent, the MBA hub renders
// <QuickAnswers>. Built by hand from lib/internal-links.ts keywordLink/blogs
// plus BLOG_POSTS whose first relatedUniversities entry is the university;
// multi-university posts (icfai-distance-mba-2026, xlri-..., 1-year-mba-...)
// were excluded because they are not that university's review.
//
// Note: lib/internal-links.ts registers dy-patil-online-mba-review under
// dy-patil-university-online (Navi Mumbai), but the post reviews Dr. D.Y.
// Patil Vidyapeeth, Pune (relatedUniversities, fee Rs 1,89,400, 23 "Pune"
// mentions). It is mapped to Pune here. The existing entry is logged in
// audits/ai-citation-flags-2026-11-04.md and left untouched.
export const REVIEW_BLOG_FOR: Record<string, string> = {
  'amity-university-online': 'amity-online-mba-review-2026',
  'manipal-university-jaipur-online': 'muj-online-mba-review-2026',
  'manipal-academy-higher-education-online': 'mahe-online-mba-review-2026',
  'sikkim-manipal-university-online': 'smu-online-mba-review',
  'chandigarh-university-online': 'chandigarh-university-online-mba-review',
  'symbiosis-university-online': 'symbiosis-online-mba-review-2026',
  'nmims-online': 'nmims-online-mba-review-2026',
  'lovely-professional-university-online': 'online-mba-lpu-review-2026',
  'uttaranchal-university-online': 'uu-doon-online-mba-review',
  'vignan-university-online': 'vignan-online-mba-review',
  'bits-pilani-work-integrated-online': 'bits-pilani-online-mba-review-2026',
  'srm-institute-science-technology-online': 'srm-online-mba-2026',
  'jain-university-online': 'jain-online-mba-review-2026',
  'dr-dy-patil-vidyapeeth-online': 'dy-patil-online-mba-review',
  'galgotias-university-online': 'galgotias-online-mba-review',
  'amrita-vishwa-vidyapeetham-online': 'amrita-online-mba-review',
  'parul-university-online': 'parul-online-mba-review',
  'bharati-vidyapeeth-university-online': 'bharati-vidyapeeth-online-mba-review',
  'upes-online': 'upes-online-mba-review-2026',
  'jamia-hamdard-online': 'jamia-hamdard-mba-2026',
  'shoolini-university-online': 'shoolini-online-mba-review',
  'ignou-online': 'ignou-online-mba-review-2026',
  'dayananda-sagar-university-online': 'dsu-online-mba-review',
  'jaypee-university-online': 'jaypee-jiit-online-mba-review',
  'savitribai-phule-pune-university-online': 'sppu-online-mba-review',
  'noida-international-university-online': 'noida-international-university-online-mba-review',
  'arka-jain-university-online': 'arka-jain-online-mba-review',
  'adichunchanagiri-university-online': 'adichunchanagiri-university-online-mba-review',
  'deen-dayal-upadhyay-gorakhpur-university-online': 'ddu-gorakhpur-online-mba-review',
}

// The is-{uni}-fake-or-legit-2026 posts already own the validity (Q4) and
// approvals (Q9) questions for their university. New answers link to them
// instead of repeating them.
export const LEGIT_BLOG_FOR: Record<string, string> = {
  'amity-university-online': 'is-amity-university-online-fake-or-legit-2026',
  'lovely-professional-university-online': 'is-lpu-online-fake-or-legit-2026',
  'parul-university-online': 'is-parul-university-online-fake-or-legit-2026',
  'mangalayatan-university-online': 'is-mangalayatan-university-online-fake-or-legit-2026',
  'manipal-university-jaipur-online': 'is-manipal-university-jaipur-fake-or-legit-2026',
  'galgotias-university-online': 'is-galgotias-university-online-fake-or-legit-2026',
  'sharda-university-online': 'is-sharda-university-online-fake-or-legit-2026',
  'nmims-online': 'is-nmims-online-fake-or-legit-2026',
  'chandigarh-university-online': 'is-chandigarh-university-online-fake-or-legit-2026',
  'integral-university-online': 'is-integral-university-online-fake-or-legit-2026',
  'dr-dy-patil-vidyapeeth-online': 'is-dy-patil-online-fake-or-legit-2026',
  'jamia-hamdard-online': 'is-jamia-hamdard-online-fake-or-legit-2026',
  'deen-dayal-upadhyay-gorakhpur-university-online': 'is-ddu-gorakhpur-online-fake-or-legit-2026',
  'ignou-online': 'is-ignou-fake-or-legit-2026',
}

// Frozen pending Rishi (FLAG 1): the review's title quotes Rs 1.18L while the
// fee Rishi read on 4 Nov 2026 differs. No Q-section may be added to it.
export const FROZEN_UNIVERSITIES: ReadonlySet<string> = new Set(['shoolini-university-online'])
