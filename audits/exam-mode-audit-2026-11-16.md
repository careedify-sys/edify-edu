# Exam-mode audit, 16 Nov 2026 (batch 3.4 part B, audit only)

Scope: the 17 universities whose page-content was flagged as mentioning in-person or exam-centre exams while `examMode` is `'Online'`. These are Assam Don Bosco, Graphic Era, GNDU, GLS, UPES, MATS, Hindustan, Centurion, CSJMU, Mody, VGU, BS Abdur Rahman, Jaipur National, Mysore, VTU, Guru Kashi and IIFT. Rows: `audits/exam-mode-audit-2026-11-16.csv`. Nothing was changed.

## Result: no own-exam in-person claim exists

The list came from wording matches, not exam claims. I ran two searches over every page-content JSON of the 17:

1. **In-person or exam-centre wording:** 25 sentences.
   - 20 are one templated red flag, "If you want in-person teaching or lab access (a campus experience), this is not the right format for you." It is a negation about teaching format and says nothing about exams. Found on 16 MCA, BBA, B.Com, BCA and MBA hubs.
   - 5 are "Applied Psychology in Personnel Administration", where "in Person" matched "in person". This is a subject name on Assam Don Bosco's MBA and HR pages.
2. **Every sentence that mentions an exam and a place or method** (centre, campus, online, proctored, webcam, home and similar): 9 sentences, all claims about the university's own exams, and all say online proctored.
   - Assam Don Bosco MBA: 4 (`exams.body`, which the hub never renders, and FAQ 5, which it does).
   - UPES MBA: 5 (hero, `exams.body` and FAQ 3).

| Class | Rows |
|---|---:|
| Own-exam claim, in person or exam centre | 0 |
| Own-exam claim, online | 9 |
| Comparison with another university | 0 |
| Negation (about teaching, not exams) | 20 |
| Not an exam claim (substring match) | 5 |

## Which examMode values look wrong

None of the 17 can be shown wrong from page-content. Their text either agrees with `'Online'` or says nothing about exams.

That is weaker than it sounds:

- **`'Online'` is the importer's default.** Before this batch all 143 records carried it. It records nothing unless someone checked. BITS was wrong for that reason.
- **The shared templates say "Online proctored examinations from home. No exam centre visit required."** This is in `SectionExams`, and similar lines are in `SectionClasses`, the university FAQ and the spec FAQ. They say it for every university whose `examMode` is `'Online'`, so an unverified default prints as a confident claim on every hub and spec page.
- **Assam Don Bosco's "online in a proctored format, webcam, government ID" paragraph is word for word the template the BITS hub carried**, and that one was wrong. Its FAQ 5 ("All exams are online and proctored.") renders on the hub. No official online-programme URL is on record for Assam Don Bosco, so it is unchecked.
- **UPES:** upesonline.ac.in/online-mba, fetched 16 Nov, does not state the exam mode either way.

## Suggested next step (not done)

Record a source for `examMode`, as `officialUrl` does for fees. Until a university's mode is read from its own page, the templates should say "Ask our counsellor how exams are held" instead of "from home, no exam centre visit". The same applies to the CSV's 9 online rows.
