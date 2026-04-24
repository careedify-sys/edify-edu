# EdifyEdu Blog Cannibalization Audit

**Date**: 2026-04-25 | **Total blog entries**: 127 (126 published, 1 draft)

---

## Critical Finding: 10 Orphan Entries Still in blog.ts

These slugs already have 301 redirects in next.config.js but their content still exists in BLOG_POSTS array. They inflate bundle size, confuse Google (redirect + live page = conflict), and cause duplicate cards on /blog listing.

| # | Slug to Remove | Redirects To | Action |
|---|---------------|-------------|--------|
| 1 | `smu-online-mba-review-2026` | `smu-online-mba-review` | DELETE entry |
| 2 | `distance-mba-vs-online-mba-india-2026` | `online-mba-vs-distance-mba-difference-2026` | DELETE entry |
| 3 | `chandigarh-university-online-review-2026` | `chandigarh-university-online-mba-review` | DELETE entry |
| 4 | `difference-online-mba-distance-mba-2026` | `online-mba-vs-distance-mba-difference-2026` | DELETE entry |
| 5 | `dy-patil-online-mba-fee-structure-2026` | `dy-patil-online-mba-review` | DELETE entry |
| 6 | `mba-course-duration-how-many-years-2026` | `mba-course-duration-india-2026` | DELETE entry |
| 7 | `mba-duration-in-india-guide-2026` | `mba-course-duration-india-2026` | DELETE entry |
| 8 | `mba-course-time-weekly-hours-2026` | `mba-course-duration-india-2026` | DELETE entry |
| 9 | `how-many-years-mba-india-2026` | `mba-course-duration-india-2026` | DELETE entry |
| 10 | `mba-graduate-or-postgraduate-india-2026` | `is-mba-post-graduation-india-2026` | DELETE entry |

---

## Critical Finding: 15 Posts Share One targetKeyword

Posts #55-69 all declare `targetKeyword: "online mba india 2026"` despite covering completely different topics. This is the single biggest metadata SEO error in the blog.

| Slug | Actual Topic | Correct targetKeyword |
|------|-------------|----------------------|
| mba-scope-india-2026 | MBA career scope | mba scope india 2026 |
| mba-vs-bba-which-is-better-2026 | MBA vs BBA | mba vs bba which is better |
| online-mba-government-employees-india-2026 | MBA for govt employees | online mba for government employees |
| mba-operations-management-career-2026 | Operations spec | mba operations management career |
| mba-international-business-career-2026 | IB spec | mba international business career |
| mba-digital-marketing-career-2026 | Digital marketing spec | mba digital marketing career |
| distance-mba-chennai-2026 | Distance MBA Chennai | distance mba chennai 2026 |
| distance-mba-hyderabad-2026 | Distance MBA Hyderabad | distance mba hyderabad 2026 |
| online-mba-ahmedabad-gujarat-2026 | MBA Ahmedabad | online mba ahmedabad gujarat 2026 |
| advantages-online-mba-manipal-university-2026 | Manipal advantages | online mba manipal university advantages |
| top-free-online-mba-courses-2026 | Free MBA courses | free online mba courses india |
| online-executive-mba-india-2026 | Executive MBA | online executive mba india 2026 |
| online-executive-mba-iim-2026 | Executive MBA IIM | executive mba iim online 2026 |
| difference-online-mba-distance-mba-2026 | Online vs Distance | REMOVE (redirect exists) |
| is-distance-mba-worth-it-india-2026 | Is distance MBA worth it | is distance mba worth it india |

---

## New Consolidations Recommended (P2)

| Keep (Canonical) | Redirect FROM | Reason |
|-----------------|--------------|--------|
| `cheapest-online-mba-india-2026` | `affordable-online-mba-india-2026` | Same intent: "cheapest" vs "affordable" |
| `distance-mba-mumbai-2026` | `distance-mba-colleges-mumbai-2026` | Same city + mode |
| `pgdm-vs-mba-difference-which-is-better-india` | `mba-vs-pgdm-online-india-2026` | Same comparison reversed |
| `top-executive-mba-programs-india-2026` | `best-college-executive-mba-india-2026` | Same intent |
| `best-mba-specialization-india-2026` | `which-mba-is-best-india-2026` | Same intent |
| `icfai-distance-mba-2026` | `icfai-online-mba-fees-2026` | Same university |
| `jamia-hamdard-mba-2026` | `jamia-hamdard-mba-fees-2026` | Same university |
| `online-manipal-mba-review-2026` | `advantages-online-mba-manipal-university-2026` | Overlapping Manipal content |

---

## Differentiated Pairs (KEEP BOTH, add cross-links)

| Blog A | Blog B | Why Keep Both |
|--------|--------|---------------|
| career-after-12th-science-courses-jobs-2026 | courses-after-12th-science-complete-list-2026 | Career vs courses intent |
| distance-mba-chennai-2026 | online-mba-courses-chennai-2026 | Distance vs online mode |
| career-after-12th-arts-courses-jobs-2026 | arts-stream-jobs-career-options-salary-india | 12th vs graduate audience |
| distance-mba-meaning-what-is-it-2026 | correspondence-mba-meaning-2026 | Different legacy search terms |

---

## Summary

| Metric | Count |
|--------|-------|
| Total blog entries | 127 |
| Orphan entries to remove (P0) | 10 |
| Wrong targetKeyword to fix (P1) | 15 |
| New consolidations needed (P2) | 8 |
| Cross-link pairs (P3) | 4 |
| **Net healthy blog count after cleanup** | **109** |
