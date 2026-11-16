# Exam-mode verification, 31 serviced universities (16 Nov 2026, audit only)

Scope: the 29 `universityId`s in lib/coupons.ts, plus Mody and Sathyabama. For each, I looked for the exam mode on the university's own online-programme page, FAQ, brochure or prospectus. Rows, source URLs and the exact sentences: `audits/exam-mode-verified-2026-11-16.csv`. Nothing was changed.

All 31 carry `examMode: 'Online'`, the importer default. BITS (`'Exam Centre'` since 1a2dcb0) is not among the 31.

## Result

| What the university's own page says | Universities |
|---|---:|
| Online proctored, and says from home or from anywhere | 11 |
| Online proctored, location not stated | 9 |
| Online, proctoring not stated | 2 |
| In person at exam centres | **1 (VIT)** |
| Online and campus-invigilated both described | 1 (Shoolini) |
| Not stated, or conflicting | 7 |

The groups:

- **From home or anywhere (11):** Amity, Amrita, Bharati Vidyapeeth, DPU Pune, LPU ("There are no Offline Exams"), Mangalayatan, MAHE, MUJ, SMU, Parul, Uttaranchal.
  - LPU says only "no offline exams", so it is counted here on that wording.
- **Online proctored, location not stated (9):** Chandigarh, CHRIST, Galgotias, GLA, JAIN, KL, Manav Rachna, UPES, VGU.
- **Online, proctoring not stated (2):** Symbiosis SSODL, Kurukshetra.
- **Not stated or conflicting (7):**
  - DSU: the third-party "from home" claims copy our own template.
  - DY Patil Navi Mumbai.
  - Graphic Era: an old guidelines page said both online proctored and exam centres.
  - NMIMS: the "designated centres" line is about its entrance tests.
  - Sharda, Mody and Sathyabama.

**Source quality:** 6 rows (MAHE, MUJ, SMU, KL, Manav Rachna, Kurukshetra) come from search-index snippets of the official page, because the page refused a fetch (onlinemanipal.com returns 403) or no longer resolves. They are marked in `source_type`. Re-read them in a browser before relying on them.

## examMode values that would change

- **VIT: `'Online'` to `'Exam Centre'`.**
  - The VIT Online MBA page says: "The Final Assessment Test (End term examination) will be conducted in centres in offline mode."
  - It also says learners "may be required to travel to the examination centre allotted to them".
  - vitonline.in/exam-centers lists 33 cities.
  - Today every VIT hub, spec page and FAQ tells readers "Online proctored examinations from home. No exam centre visit required." That is the same error BITS had.
  - The change is one field in lib/data.ts. The templates already branch on `'Exam Centre'` (lib/exam-mode.ts). Not applied, per the brief.
- **No other value changes.** 22 universities confirm `'Online'`. Shoolini is ambiguous and stays `'Online'` until Rishi confirms. The 7 unverified universities keep the default, but the "from home" line should stop printing for them (below).

## Wording for unverified universities (draft, not applied; ships after the 28 Nov check)

**Mechanism:**
- Add `examModeSource?: string` to `University`, holding the URL the mode was read from, the way `officialUrl` records where a fee was read.
- Fill it from this CSV for the 22 confirmed universities, plus BITS and VIT.
- A university counts as verified when `examModeSource` is set.

**Three tiers of wording:**

| Template | Verified, says from home or anywhere | Verified, location not stated | Unverified (no source) |
|---|---|---|---|
| SectionExams, "Exam Mode" | Online proctored examinations from home. No exam centre visit required. (unchanged) | End-semester exams are online and proctored. | Talk to our counsellor for how and where exams are held. |
| SectionClasses, "Assessments" | Online assessments. No mandatory campus visits for exams in most semesters. (unchanged) | End-semester exams are online and proctored. | Talk to our counsellor for how and where exams are held. |
| UniProgramBody FAQ "What exam mode does X use?" | Online examinations. (unchanged) | End-semester exams are online and proctored. | Talk to our counsellor for how and where exams are held. |
| UniSpecBody FAQ "What is the exam mode…" | Online assessments. (unchanged) | End-semester exams are online and proctored. | Talk to our counsellor for how and where exams are held. |
| UniSpecBody FAQ "Can I work while…" | …Online assessments. No campus visits required. (unchanged) | …End-semester exams are online and proctored. | …Talk to our counsellor for how and where exams are held. |
| UniversityPageClient FAQ "How are exams conducted at X?" | (unchanged) | Assessments include internal assignments and end-semester exams, which are online and proctored. | Assessments include internal assignments and end-semester exams. Talk to our counsellor for how and where exams are held. |

**Notes:**
- `'Exam Centre'` keeps `EXAM_CENTRE_LINE` everywhere.
- The UniversityPageClient FAQ today adds "via webcam from home or office" for every `'Online'` university. Under the draft that wording survives only for the from-home tier.
- The draft line follows the site's existing "talk to our counsellor for the current fee" pattern and states nothing about exams.

**Scale:**
- 7 of the 31 serviced universities fall to the counsellor line.
- So do the other 111 records in lib/data.ts, none of which has a source yet. That is most of the site.
- Sequence it after the 28 Nov check so the ranking read is not confounded.
