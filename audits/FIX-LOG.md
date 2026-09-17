# Fix log

Running record of every fix: what changed, **why**, how it was verified, and what
guards it. Newest first. One entry per commit that changes behaviour or data.

Rule for new entries: never write only what changed. The *why* is the part that
is expensive to reconstruct later, and it is what stops the next person undoing
the fix by accident.

---

## 2026-09-17 · Finishing the sweep: 126 rendered employer lists and 1,022 testimonials removed sitewide

**Why this followed the 35-file repair.** Fixing the unparseable spec files
surfaced fabricated placement data in them. The same generator produced the rest
of the corpus, so the same defects were sitting in files that had never been
broken and therefore never looked at. This entry covers the other 396.

**What was live and is now gone.**

| defect | files | state |
|---|---:|---|
| `**Top hiring organisations:**` naming real companies | **126** | rendered on-page via `whoHires.body` |
| "X graduates from Y **are hired across** these industries" | **143** | rendered, asserts placement we have no data for |
| named "verified" testimonials in `sections.reviews` | **313** (1,022 items) | never rendered, dormant |

The employer rosters are the serious one because they were published. They name
real organisations as recruiting from a specific online MBA specialisation, with
nothing sourcing the claim, on a site whose entire positioning is that it
publishes only verifiable UGC, NAAC and NIRF data. Concentrated in eleven
universities: JAIN 19, Amity 18, Shoolini 16, MUJ 13, LPU 12, UPES 11, Amrita 10,
Chitkara 8, DSU 7, NMIMS 6, SMU 6.

The opening sentence was the same defect in milder form. "Graduates from X are
hired across these industries and roles" is a placement claim. It now reads
"This <spec> MBA syllabus maps to the following industries and roles", which is
a statement about the curriculum and is true. The 161 files that already said
"target these industries and roles" were left alone, because that framing was
already honest.

Every `whoHires` section now closes with a note telling the reader to ask the
university for its placement report covering their own programme and mode, and
saying plainly that we do not publish employer lists we cannot source. 304 files
carry it.

**Kept the role families.** Industries, entry, mid and senior role names are
generic and defensible. They describe what the syllabus prepares you for. Only
the named-organisation roster was removed.

**Deliberately left alone, for Rishi to decide.**

- `sections.topHirers` (44 files) and `sections.placements` (44 files) on the
  programme-hub `{uni}-mba.json` files. **Neither is rendered**: UniProgramBody
  reads only `tldr`, `faqs`, `redFlags`, `ugcDeb` and `abcId`. They are hedged
  in a way the spec-page rosters were not, mostly "alumni network spans" rather
  than "hired from this programme", and 30 of the 44 cite a source or a
  verification directive. Removing 44 dormant hedged blocks unasked is over-reach.
- The salary ranges inside `placements` carry a **bulk-generation fingerprint**
  worth recording: the sentence "Reported average salary range for MBA graduates
  is Rs.XL to Rs.YL per annum based on publicly available placement data" appears
  verbatim across Amity, DY Patil, NMIMS, Noida International, Symbiosis and UPES
  with only the numbers changed. Identical sentence, different numbers, is the
  same tell as identical feeMin/feeMax across two universities. The IGNOU and MUJ
  entries are better: they name NIRF filings and a dated placement source.

**Verified.** All 431 files parse, the new pre-commit gate passes, `tsc` clean,
sample pages across four swept universities return 200, the softened opener
renders, and a grep for the removed employer names on a live page returns zero.

---

## 2026-09-17 · A parse error hid three years of fabricated placement data on 35 spec pages

**How it was found.** While checking which universities carry AI and banking MBA
specialisations for a blog batch, a script that read every file in
`lib/data/page-content/` threw. **35 of 431 files are invalid JSON**: all 26
`chandigarh-university-online-mba-*` and 9 `symbiosis-university-online-mba-*`,
each with a literal CR/LF pair sitting unescaped inside one string value.

**Why nobody noticed.** `getSpecPageContent()` wraps the parse in a bare
`try { ... } catch { return null }`. A null return is indistinguishable from
"no content file exists", so `UniSpecBody.tsx` rendered the **generic thin
fallback** on all 35 while the files sat on disk looking complete. Every audit
that counted content coverage with `existsSync` has been overcounting by 35.
**File exists is not page is rich.** Repaired with a state machine that escapes
only control characters inside string values, so the content is otherwise
byte-identical.

**What the recovered content turned out to contain was worse than the bug.**

**Fabricated employer lists, rendered on-page.** 33 of the 35 carried a
`**Top hiring organisations:**` roster under `whoHires.body`, which *is*
rendered. Across the 35 they name roughly 300 real organisations as hiring from
specific online MBA specialisations: Netflix India, Google India, Disney+
Hotstar, NITI Aayog, UNICEF India, the World Food Programme, Oxfam India and the
American Red Cross India, the last four attached to a Chandigarh online MBA in
Disaster Management. Nothing sources any of it. Removed, replaced with a note
telling the reader to ask the university for the placement report covering their
programme and mode, and saying plainly that we do not publish employer lists we
cannot source. **This pattern is sitewide: 141 of 431 files carry one.**

**Fabricated testimonials, not rendered.** Each file carried three named reviews
with ratings, cities, years and outcome stories, introduced as "verified... from
post-completion surveys". Sitewide that is **1,127 review items, 750 distinct
invented names, 200 intros claiming verification**. The renderer never reads
`sections.reviews`, so none of it was ever published, and the schema equivalent
was already pulled on 2026-08-07 for exactly this reason. Removed from the 35
anyway, because a dormant field like this is a trap for whoever wires the section
up later.

**Wrong NIRF category, in both directions.** The `tldr` and `hero` led with the
University-category rank on MBA pages. For Chandigarh that meant quoting #19
where Management is #32, which flatters. For Symbiosis it meant quoting #24 where
Management is **#11**, which understates by a wide margin. Both now lead with
Management. The comparison sections were worse: **31 wrong claims about *other*
universities**, including Amity and MUJ both inflated to NAAC A++ when data.ts
says A+, JAIN and LPU deflated to A+ when both are A++, and Amity, MUJ, UPES and
LPU each compared on their University rank against a Management rank, which makes
the comparison meaningless.

**A fix that made things worse, then fixed again.** The first accreditation pass
spliced Chandigarh's lapsed-NAAC caveat inline at every mention, 105 times across
26 files, producing sentences like "at the NAAC A+ (accreditation cycle valid
to September 2026, reconfirm...) level". Collapsed to one note per page. The
comparator-grade fix also wrongly upgraded Chandigarh's *own* grade to A++ inside
two comparison blocks, since it rewrote every NAAC mention in a block rather than
only the comparator's. Caught by enumerating all 35 A++ occurrences with context
rather than trusting the heuristic that found only one of the two.

**Then the copy itself.** 37,500 words of rendered prose that opened by describing
the institution, dumped bold-label bullet lists, and never said who a programme
was wrong for. Rewrote `tldr`, `about` and `skills` on all 35 so each opens with
the reader's situation, names what the syllabus actually contains, and states a
limitation: business analytics trades depth for breadth, an MBA in IT moves you
away from building, product roles still hire on evidence of shipping, aviation
and media hire on sector experience so the degree helps insiders more than
entrants. Subject names, fee figures and accreditation values are carried over,
not restated.

**Verified.** All 431 files parse. `tsc --noEmit` clean. No em dash, no filler
words, no banned sentence starters in the new copy. Cross-check of
university-to-university accreditation claims down from 31 wrong to 0. Sample
pages across both universities return 200 and render the rich template with the
corrected ranks and the new copy. Note for anyone verifying content edits
locally: `getSpecPageContent()` caches per process, so the dev server must be
restarted, not just reloaded.

**What is still open.** The employer-list pattern in the other 106 files, the
review items in the other 313, and the same NIRF-category error wherever else it
appears. Those were left alone because the brief was these 35, not because they
are fine.

---

## 2026-09-17 · Twelve posts for three audiences the site has no footprint in: bankers, IT professionals, AI seekers

**Why these three clusters.** Rishi asked for content aimed at people who need an
MBA for a promotion in banking or tech, and at people shopping for AI programmes.
The 28-day GSC export (18 Aug to 14 Sep, 4,446 clicks / 987,942 impressions) says
the site has essentially **no footprint in any of them**:

| cluster | GSC evidence, 28 days | position |
|---|---|---:|
| AI / analytics programmes | `mba in business analytics` 135 impr, `...online` 11 impr | **72.3** |
| Finance / banking programmes | 5 generic `mba finance` variants, ~716 impr combined, 0 clicks | **68 to 77** |
| Working professionals | `bits pilani mba for working professionals` 278 impr, 0 clicks | 9.6 |
| Bank promotion, AI MBA, IT MBA | **no queries at all** | n/a |

Position 68 to 77 is page seven. This is not a rescue of existing impressions, it
is a bet on demand the site has never competed for, and it should be judged that
way when the next export is pulled.

**What justified the bet.** Career-intent content is the format that already works
here. `govt-jobs-after-mba-india-2026` is the site's second-biggest page after the
CGPA calculator (190 clicks, 15,723 impressions, position 6.73) and
`mca-vs-btech-which-is-better-2026` pulls 4,950 impressions at 6.8. Programme-intent
pages sit on page seven; career-intent and comparison pages sit on page one. All
twelve posts are written as career or decision content, not as programme brochures.

**The constraint that shaped every post: no rupee figures.** `scripts/check-blog-fees.mjs`
applies a strict rule to any slug not in `data/blog-fee-baseline.json`: every rupee,
Rs or INR figure must resolve to MATCH against `getDisplayFee()` or sit in the
allowlist, and NON_FEE no longer clears it. There is also no approved source for
Indian banking or tech salary data (CLAUDE.md permits official university portals,
deb.ugc.ac.in, naac.gov.in, nirfindia.org, ugc.gov.in and nothing else), so quoting
salaries would have meant fabricating them. **Both constraints point the same way**,
so these posts carry zero currency figures and route every money question to the
official portal. The gate confirms it: 2,433 unverified figures before and after.

**Accreditation claims were cross-checked against Supabase, and three universities
could not be.** Per the source-of-truth rule, every NAAC and NIRF claim in these posts
was verified against the `accreditations` table. Verified: JAIN A++ / NIRF Mgt 73, LPU
A++ / 44, Symbiosis A++ / 11, NMIMS A++ / 24, Amity A+ / 49, Chitkara A+ / 78, UPES
A / 36, BIT Mesra A / 97, SMU A+. **Not in Supabase at all: Manipal University Jaipur,
Dayananda Sagar, BITS Pilani.** Those three are named in the posts for their
specialisations only, with no accreditation claim attached. Two further findings worth
carrying: Chandigarh University's NAAC A+ row carries `valid_till 2026-09-09`, which
has now passed, so the posts say its validity needs a direct check rather than
asserting the grade; and NIRF ranks are always written with their category, since
Management is the relevant one for an MBA page.

**The posts.** Banking: `online-mba-bank-employees-promotion-2026`,
`online-mba-bfsi-india-2026`, `mba-vs-jaiib-caiib-bank-officers-2026`,
`online-mba-banking-insurance-vs-finance-vs-bfsi-2026`. Tech:
`online-mba-it-professionals-india-2026`,
`mba-tech-lead-to-engineering-manager-india-2026`,
`online-mba-information-technology-management-india-2026`,
`online-mba-vs-ms-vs-executive-pgp-software-engineers-2026`. AI:
`online-mba-artificial-intelligence-india-2026`,
`mba-ai-vs-mca-ai-vs-mtech-ai-india-2026`,
`mba-data-science-vs-business-analytics-2026`,
`online-mba-ai-eligibility-maths-coding-2026`.

**Verified.** `check-locked-rules.js` PASS (no em dash, no competitor link).
`check-blog-fees.mjs` OK, count unchanged. `tsc --noEmit` clean. A purpose-built
validator checked all twelve for filler words, banned sentence starters, currency
figures, H1-in-body, 5 to 10 unique internal links, dead link targets against
`valid-urls.json` and the runtime slug list, FAQ count and HTML tag balance: 0 errors.
All twelve return 200 on the dev server and appear in `sitemap.xml`. Runtime count
180 to 192 published.

**What to watch.** Pull GSC around 15 October. If the banking and AI clusters are
still unseen after four weeks, the conclusion is that these queries have no Indian
volume rather than that the posts are weak, and the cluster should be abandoned
rather than expanded. Do not add more posts to these clusters before that read.

---

## 2026-09-15 · Adichunchanagiri: the one uncovered university, and the placeholder fee that made it look cheap

**How it was found.** Rishi asked for blogs that do not exist yet. A fresh 28-day GSC
export (16 Aug to 12 Sep) was pulled and every non-calculator query with 100+
impressions was checked against the blog inventory. Three candidates I proposed
from the **July** export turned out to be dead or already covered, which is the
finding worth keeping:

| candidate | July impressions | Sept impressions | verdict |
|---|---:|---:|---|
| GLS University | 2,329 | **4** | demand collapsed, do not write |
| Sikkim Manipal | 1,322 | 176 | demand collapsed |
| Kurukshetra | 486 | 0 | gone from the export |
| Dayananda Sagar | 213 | 652 | already covered by `dsu-online-mba-review` |
| XLRI | 765 | 875 | already covered by `xlri-online-mba-review-2026` |
| Uttaranchal | n/a | 1,655 | already covered by `uu-doon-online-mba-review` |
| **Adichunchanagiri** | 269 | **319 @ pos 6.7, 1.88% CTR** | **no blog, written** |

Three of those "gaps" were covered by posts my slug-matching script missed
because the full university name lives only in `seoTitle`. **Grep every field,
not the slug.** The English blog inventory is effectively saturated at 195 posts;
Adichunchanagiri was the only university with live demand and no dedicated post.

**The data was wrong, and wrong in a way that mattered.** `lib/data.ts` carried
`feeMin: 75000, feeMax: 180000` for Adichunchanagiri. That pair is **byte-identical
to Bharath University's**, and both taglines follow the same "X university with
online programs" template, so it was bulk-generated placeholder, not a researched
fee. The official portal (`acuonline.edu.in/program/mba`, Fee Structure tab) states:

```
semester fee            35,000  x 4  = 1,40,000
registration (one time)  2,000
examination      4,000/yr x 2 =  8,000
                              -----------
all in                          1,50,000
```

There is **one fee and no cheaper tier**, so "starts from ₹75,000" was not merely
stale, it described a pricing structure that does not exist. The ₹75,000 floor was
₹65,000 below the real programme fee.

**We were publishing the wrong number, and arguing from it.** `online-mba-karnataka-2026`
claimed "Adichunchanagiri University starts from ₹75,000", listed it in the
"under-₹1L budget tier", and built a comparison on it: *the lower end of that range
competes directly with KSOU on price*. At ₹1,40,000 it does not compete with KSOU
at all. Five false claims in that post were corrected, and the post's unverified-figure
count dropped 25 → 23.

**Also corrected:** `city` was `Bengaluru`; the university is in **B G Nagara,
Nagamangala taluk, Mandya district**. `emiFrom` was 3125 against a portal figure
of ₹6,187.

**Verified independently, not taken from the portal alone:**
- NAAC **A+, CGPA 3.39/4.00, first cycle, 2024** (acu.edu.in/about/accreditations)
- UGC **Section 2(f) November 2022**, 12(B) listed
- UGC-DEB register (`deb.ugc.ac.in`) carries **exactly one** Adichunchanagiri entry,
  **online mode, session 2025-26**, which independently confirms the MBA is the only
  online programme. Listings showing an online BBA/BCA/B.Com for this university are wrong.
- NIRF **78 (2023) and 83 (2024) in Pharmacy**. No Management rank, no University rank.
  Per the NIRF-category rule, the post says so explicitly, because a pharmacy rank is
  being moved onto an MBA elsewhere on the web.

**The "specialisations" are not specialisations.** The portal lists nine
*micro-credential pathways* worth **6 credits of 86**, producing a separate digital
credential rather than a named track on the certificate. Our own data claims seven
named MBA specs and we publish seven spec URLs under this university. That is
**not resolved** and is flagged below.

**Cannibalisation.** Four pages now exist for this university and each owns a
different intent, consistent with the ownership rule settled 2026-09-14:

```
/blog/…-mba-review   "Adichunchanagiri Online MBA Review 2026: Honest Take"     review query
/universities/…/mba  "Adichunchanagiri Online MBA Fees 2026: ₹1.4L"             fee query
/universities/…      "Adichunchanagiri Online 2026: Fees ₹140K"                 brand query
/verify/…            "Is Adichunchanagiri University Fake? No."                 legitimacy query
```

The blog's `targetKeyword` is deliberately `adichunchanagiri university online mba`,
not the fee query, so it does not compete with its own hub. The Karnataka guide keeps
the cluster query. No title pair overlaps.

**Fee gate.** The post tripped `check-blog-fees` with 26 figures. All nine distinct
values were added to `data/blog-fee-allowlist.json` with portal source and
verified_date, including **75000 itself**, annotated as a figure the post cites only
in order to debunk it. Post baselined at **0** unverified figures.

**Verified.** Dev server: the post, the hub, the university page and the Karnataka
guide all return 200. Hub title now reads ₹1.4L. The Karnataka guide shows zero
occurrences of "starts from ₹75,000" and of "₹75K to ₹1.80L". `tsc --noEmit`: 0 errors.
`check-em-dash-baseline` and `check-fee-baseline`: unchanged. Post body: 0 em dashes,
0 H1, 0 filler words, 8 unique internal links, 4 approved external sources.

### Still open

- **Seven spec URLs may be fabricated.** We publish `/mba/data-science`,
  `/mba/international-business`, `/mba/digital-marketing`, `/mba/finance`,
  `/mba/hr-management`, `/mba/marketing` and `/mba/operations` for this university.
  The portal names no such MBA tracks, and the DEB register carries one programme,
  not seven. Deleting URLs needs the `check-gsc-404s` pass first, so this was not
  touched. Same class as the fabricated-spec-URL work in `audits/fabricated-spec-urls-2026-08-17.csv`.
- **The placeholder-fee pattern is wider than one university.** `feeMin: 75000,
  feeMax: 180000` is shared with Bharath University and possibly others. A sweep for
  identical feeMin/feeMax pairs across `lib/data.ts` would size it.

---
## 2026-09-14 · JAIN checked against its portal. Both our pages were wrong, at opposite ends.

**Source.** Rishi asked for the same portal check on JAIN after the BITS
correction. `onlinejain.com/online-mba` prices **every elective individually**,
in four tiers:

| Tier | Fee | Electives |
|---|---|---|
| Floor | **₹1,60,000** | HR Management, Marketing, General Management, Finance |
| Mid | ₹1,75,000 | the dual combinations (Finance+Marketing, HR+Finance, Marketing+HR, the Analytics pairs) |
| Upper | ₹1,96,000 | BI & Analytics, Digital Marketing & e-Commerce, Supply Chain, and every AI track |
| Ceiling | **₹2,98,000** | International Finance (Accredited by ACCA, UK) |

True span: **₹1,60,000 to ₹2,98,000**, across 19 electives.

**Each of our two pages had one end right and one end wrong.**

```
hub   ₹1.6L – ₹1.96L    floor correct, ceiling ₹1L too low (drops the ACCA tier)
blog  ₹1.96L – ₹2.98L   ceiling correct, floor a mid tier presented as the floor
```

Yesterday I recorded this pair as "the blog contradicts the governed hub" and
treated the hub as the trustworthy side because its number comes from
`getDisplayFee`. The portal says neither was right. **Governed provenance makes a
number auditable, not correct.** The ownership split still stands, one page
should carry the fee, but the reason I gave for trusting the hub was not a reason
to trust its value.

**The codebase had flagged it twice and I read past both.** `lib/data.ts` carried
`pd.fees: '₹1.75L–₹1.96L'` against `feeMin: 160000`, and
`lib/mba-seo-overrides.ts` carried a literal
`NEEDS-VERIFICATION: pd.fees ... starts higher than feeMin (₹1.6L)`. That note
had spotted the floor discrepancy. Nobody had looked at the other end, where
`feeMax: 196000` silently dropped the ACCA tier.

**Changed.** `lib/data.ts` feeMax 196000 → 298000 and `programDetails.MBA.fees`
→ `₹1.6L–₹2.98L`; `data/fees-hub-data.json` feeMax and feeStr → `₹1.60L – ₹2.98L`;
the JAIN override title, description and intro, with the intro rewritten to say
the programme has no single fee and to name the ACCA tier as what drives the top
of the range; and the JAIN review post's title, meta and comparison row, which
had claimed a ₹1,96,000 floor **while its own body already said "JAIN's
₹1,60,000 starting tier"**. The post contradicted itself.

`getDisplayFee` still returns `ok: true` at rule 1 on the wider range: the
suppression threshold is 3x and ₹2.98L / ₹1.6L is 1.86x.

### Deliberately not done in this pass

A sweep found **111 distinct post-and-figure JAIN fee claims across roughly 50
posts**, in at least six notations (`Rs 1.60L to 1.96L`, `Rs 1,75,000 to
Rs 1,96,000`, `₹1.96-2.98 lakh`, `₹1,96,000`, `Rs 1.60 to 1.96 L`, `Rs 1.96
lakh`). They are **not uniformly wrong**. Many are spec-level and correct:
"JAIN Finance & Business Analytics (₹1,96,000)" matches the portal exactly.
Others are wrong in ways a find-and-replace would not catch, such as a claim
that JAIN's three HR tracks are all ₹1,96,000 when the portal prices HR
Management at ₹1,60,000 and the two HR duals at ₹1,75,000.

Bulk-editing those on one reading is the exact failure that produced the wrong
BITS number earlier today. Each claim needs checking against the tier table
above. Left for a dedicated pass.

**Verified.** Hub title, H1 and fee block re-read from the running server, all
showing ₹1.6L to ₹2.98L. `/fees` row shows ₹1.60L – ₹2.98L. `getDisplayFee`
confirmed unsuppressed.

---

## 2026-09-14 (corrected) · BITS WILP is ₹3,12,400. My earlier ₹2,98,400 was wrong.

**Source.** Rishi sent the official portal screenshot,
`wilp.bits-pilani.ac.in` → Programme Fee and Eligibility. It states
**Programme Fee INR 3,12,400**, and its own table reconciles exactly:

```
application (one time)     1,500
admission   (one time)    18,500
semester fee              73,100  x 4  = 2,92,400
                                   ------------
Programme Fee                        3,12,400
Sem 1 total   1,500 + 18,500 + 73,100 =   93,100   (stated on the page)
```

**What I got wrong, and how.** Earlier the same day I "corrected" the fee to
₹2,98,400 and recorded that the figure was provable from the post's own table.
It was arithmetically consistent and it was wrong, because **the components it
rested on were stale**: the post said ₹70,100 per semester where the portal says
₹73,100, and ₹16,500 admission where the portal says ₹18,500. Deriving a total
from two unverified inputs produced a confident, internally consistent, wrong
number, which then propagated into five posts and matched `lib/data.ts` only
because `lib/data.ts` carried the same derivation.

`lib/data.ts` even said so: the line above the fee read
`NEEDS-VERIFICATION: confirm BITS Pilani WILP MBA ₹2,98,400 against the official
portal`. I treated agreement between `lib/data.ts` and a derivation as
confirmation, when both were the same unverified claim wearing two hats.

**The lesson is the house rule, restated.** Internal consistency is not
verification. A total that reconciles with its own components says nothing about
whether the components are current. Only the portal settles a fee. This is the
same failure mode as [[feedback_never_derive_fees]], one level up: not a derived
superlative but a derived total.

**The post's original number was closer than mine.** It said "Effective Total
Cost ₹3,15,000", which is ₹2,600 off the real ₹3,12,400. I replaced it with
₹2,98,400, which is ₹14,000 off. The edit made the page less accurate.

**What changed.** `lib/data.ts` feeMin/feeMax 298400 → 312400, `emiFrom` 12433 →
13017, `programDetails.MBA.fees` → ₹3,12,400 with the NEEDS-VERIFICATION comment
replaced by the portal reconciliation. `data/fees-hub-data.json` feeStr → ₹3.12L,
emiStr → ₹13K/mo. In `lib/blog.ts`: per-semester ₹70,100 → ₹73,100 (x5),
admission ₹16,500 → ₹18,500 (x5), tuition ₹2,80,400 → ₹2,92,400 (x4), all-in
₹2,98,400 → ₹3,12,400 (x8), tuition+admission → ₹3,10,900, first-year outflow
₹1,58,200 → ₹1,66,200, and six `2.98L` cross-references across
working-professionals, NMIMS, best-online-mba (x2) and the BITS title and meta.

**Four `₹2.98L` mentions were deliberately left.** They belong to JAIN's
International Finance ACCA tier, which genuinely is ₹2.98L. A blanket replace
would have corrupted three unrelated posts.

**This also settles the inflation question left open earlier.** ₹2,84,000 (2024)
→ ₹2,97,000 (2025) → ₹3,12,400 (2026) is +4.6% then +5.2%. The post's "roughly
4-5% annual fee inflation" gloss is correct and stays. The earlier doubt existed
only because ₹2,98,400 was wrong.

**And it revisits the Jain finding.** The Jain post's ₹1.96L-₹2.98L range, which
I read as contradicting its hub's ₹1.6L-₹1.96L, is the standard-to-ACCA spread.
The blog may be right and the **hub's range may be the incomplete one**, missing
the International Finance ACCA tier. The title fix still stands, two pages should
not publish different ranges, but the direction of that error is now open and
worth checking against the JAIN portal.

### The same fee is written three different ways, and I missed one twice

The first sweep searched `2,97,000` and found two posts. The second searched
`2.97L` and found four more. `check-blog-fees` then failed the commit and
surfaced a **third** form I had still not looked for: **`Rs 2.97 lakh` and
`₹2.97 lakh`, spelled out**, in thirteen more places across
`best-online-mba-colleges-india-2026`, `online-mba-with-placement-india-2026`,
`xlri-online-mba-review-2026` and the BITS post itself.

So one fee figure lives in the content as at least three shapes:

```
₹2,97,000      comma form
₹2.97L         lakh-abbreviated
₹2.97 lakh     lakh spelled out   <- missed twice
```

**Search all three, every time.** A sweep that finds and fixes two of the three
leaves the site contradicting itself while looking finished, which is worse than
not starting: the corrected pages now disagree with the uncorrected ones.

The gate is what caught it. `check-blog-fees` failed with
`best-online-mba-colleges-india-2026: 48 -> 49` and
`xlri-online-mba-review-2026: 19 -> 21`, i.e. my partial fix had *increased* the
unverified count by introducing figures that no longer matched their neighbours.
After the third sweep the count went the other way, **2444 -> 2441**, and the
BITS post dropped from 10 unverified figures to 7 because the corrected ones now
resolve as MATCH against `lib/data.ts`.

**Verified.** Both titles and all six component figures re-read from the running
server. `/fees` row shows ₹3.12L and ₹13K/mo. Final sweep across all three forms:
the only survivors are the two historical `₹2,97,000` lines in the BITS post and
four `₹2.98L` mentions that belong to JAIN's ACCA tier.

---

## 2026-09-14 (later still) · BITS WILP fee corrected to ₹2,98,400 across five posts

**Source.** Rishi confirmed the BITS Pilani WILP fee is 298K, and that BIT Mesra
is a different university. The first settles a figure that had been open since
the morning audit. The second confirms the id correction made earlier that day.

**The number was already provable from the post's own table.** It listed
per-semester tuition ₹70,100, total tuition ₹2,80,400 (4 × ₹70,100), a ₹16,500
admission fee and a ₹1,500 application fee. Those sum to **₹2,98,400**, exactly
what `lib/data.ts` carries and what Rishi confirmed. The post's headline
"₹2,97,000 total" was neither the tuition nor the all-in figure, and its
"Effective Total Cost ₹3,15,000" followed from nothing in the table.

**Two real bugs found while correcting it.** A sentence was truncated
mid-number, "priced at ₹2,97,000 total (₹70,100 per semester plus ₹16,`</p>`",
with the parenthesis never closed. And "First Year Outflow ₹1,57,000" did not
match its own stated components (1,500 + 16,500 + 70,100 + 70,100 = ₹1,58,200).

**The stale fee had spread to four other posts.** `online-mba-for-working-professionals-india`,
`nmims-online-mba-review-2026`, `best-online-mba-colleges-india-2026` (twice),
`upes-online-mba-review-2026` and `xlri-online-mba-review-2026` all quoted the
BITS fee in comparison tables or cross-references. The first audit pass missed
four of them because it searched `2,97,000` and those posts write `Rs 2.97L`.
**Lesson for the next fee correction: search both the comma form and the lakh
form, or the fix looks complete while most of the site still disagrees.**

**What was deliberately left alone.** The two historical lines, "the 2024 fee was
₹2,84,000, the 2025 fee moved to ₹2,97,000", are statements about past years and
stay. They do carry a forward-looking gloss ("roughly 4-5% annual fee
inflation") that the 2026 figure contradicts at +0.5%, but the 2025 number may
sit on a different basis (tuition + admission ≈ ₹2,96,900 rather than all-in), so
the trend claim is **open for Rishi** rather than rewritten on a guess.

**The NIRF conflict resolved itself, and was never a conflict.** The BITS post and
the XLRI post say "#16 Overall 2025"; the UPES post says "#7 University 2025";
`lib/data.ts` holds `nirf: 7`. Those are two different NIRF categories, both
plausibly correct, which is exactly why the house rule requires a category on
every NIRF claim. All three are category-labelled, so all three stay. The
unlabelled "NIRF #16" was removed from the post title, which is now review-led
under the ownership split: "BITS Pilani WILP Online MBA Review 2026: Is It Worth
₹2.98L?" against the hub's "Fees 2026: ₹2.98L".

**BIT Mesra separation re-checked.** No file conflates the two any more. Every
remaining `bits-pilani-online` string is the blog slug
`bits-pilani-online-mba-review-2026`, not a university id. The two rows now read
BIT Mesra (NAAC A, NIRF 92, ₹1.78L) and BITS Pilani WILP (NAAC A+, NIRF 7,
₹2.98L).

**Verified.** Both titles re-read from the running server. Final sweep: zero
`2.97L` and zero non-historical `2,97,000` remain; 10 `2.98L` and 8 `2,98,400`
in place.

---

## 2026-09-14 (later) · The hub and the blog were selling the same MBA at two different prices

**Source.** Rishi asked me to settle blog-versus-hub ownership of "{uni} online
mba fees" for the four universities not blocked on the BITS data question.
Rendering the two titles side by side settled it faster than any ranking
argument could.

### What the pairs actually looked like

```
Galgotias  HUB  Galgotias University Online MBA Fees 2026: ₹80,200, NAAC A+ [Review]
           BLOG Galgotias University Online MBA Fees 2026: ₹80,200, NAAC A+
Jain       HUB  JAIN Online MBA Fees 2026: ₹1.6L-₹1.96L
           BLOG Jain University Online MBA Fees 2026: ₹1.96L to ₹2.98L, NAAC A++
Jamia      HUB  Jamia Hamdard Online MBA Fees 2026: ₹75K-₹1.8L
           BLOG Jamia Hamdard Online MBA Fees 2026: NAAC A+, NIRF Management 87
```

Galgotias was character-identical bar the suffix, and **I had caused that** with
the title edit earlier the same day: removing the "Cheapest NAAC A+" superlative
was right, rewriting it onto the hub's exact construction was not.

Jain is the serious one. The hub caps the MBA at **₹1.96L**; the blog called
₹1.96L the *starting* fee and ran to **₹2.98L**. Two live pages on one domain
answering "what does this MBA cost" with numbers a lakh apart.

### The decision: the hub owns the fee query, the blog owns the review query

Not because the hub ranks better. It does not: Galgotias hub sits at 7.18 on 39
impressions while its blog sits at 8.25 on 2,576. The hub wins on **provenance**.
Its title is built by `clampTitleFeeLed` from `getDisplayFee`, the single
canonical fee source, with a suppression path when the data is inconsistent and
`check-fee-baseline` behind it. Blog fee figures are ungoverned: 2,446 unverified
against the baseline, and three of these four pairs contradicted their own hub.

When two of our pages disagree, the one that cannot be audited should not be the
one carrying the number into the SERP.

**Neither page was redirected.** Hubs have spec children and carry the lead CTA;
blogs hold the editorial. This is a differentiation fix, not a consolidation one,
which is the opposite call to the verify cluster earlier today and for a
different reason: there, two pages answered the *same* question, so one had to
go. Here they answer different questions and were merely titled as if they did
not.

Blog titles moved to review angles, `targetKeyword` moved off the fee query, and
each post now links its hub with the fee query as anchor text. Jain and BITS had
**no link to their own MBA hub at all**; Galgotias already had the pattern and it
was copied verbatim so there is one pattern, not three.

### Two things found on the way

**The BITS "discrepancy" was a year, not an error.** The post says the 2024 fee
was ₹2,84,000 and the 2025 fee ₹2,97,000. So its title's ₹2.97L is the 2025
number wearing a 2026 label, against `lib/data.ts` at ₹2,98,400. That is only
+0.5% where the post itself documents 4-5% annual inflation, so one of the two is
still wrong and **it stays open for Rishi**. The NIRF #16 versus `nirf: 7`
conflict is also still open. No fee was guessed.

**Another derived superlative, in body copy this time.** The Galgotias post
claimed ₹80,200 made it "one of the cheapest NAAC A+ accredited online MBAs in
India". Same defect as the title, same reason it fails: 63 of 125 fee rows are
placeholder ranges, so nothing can be ranked cheapest. Claim removed, verified
fee kept.

**Uttaranchal needed no decision.** It has no review blog. Its hub already owns
the query unopposed and sits at 30.74, which is a weak-page problem, not a
cannibalisation one.

**Verified.** All six titles re-read from the running server. Caught and fixed a
trailing "Review" left behind on the Jain title by a replacement that did not
span the whole original string. Hub links confirmed present on all four posts.

---

## 2026-09-14 · The impression cap on verify and coupons, and the 404 under the biggest fee query

**Source.** Rishi read 269 clicks (Sat 12 Sep, Last 7 days) against 39 (Last 24
hours) and thought traffic had collapsed. It had not. The 24-hour report
backfills for hours; the top 40 queries were all down by the same ~0.19 factor
with positions holding or improving. A penalty hits specific pages and blows out
position, it never scales every unrelated query by one constant. He then asked
what actually caps the verify and coupon clusters. Full working in
`audits/verify-coupon-impression-caps-2026-09-14.html`.

### 1. Coupons cannot grow, and the expansion worklist was arguing from the wrong number

Total coupon-intent demand across the whole site is **33 impressions a week**:
`mba online scholarships` 24 at position 22, `coupon code for manipal university
jaipur` 5 at position 1, `manipal university jaipur coupon code` 4 at position 2.
The 25 pages that exist earn 16 clicks a week and 19 have never been shown.

`audits/coupon-expansion-worklist-2026-09-13.md` proposed seven more pages
because "coupons convert at 3.00% CTR, the best of any page type on the site".
That is a real CTR on a 351-impression base at positions 1 and 2. There is no
ranking headroom left to win, and no pages to build that would find demand that
is not there. Marked **SHELVED** at the top of the file rather than deleted: every
NAAC, NIRF and fee value in it was verified on 13 Sep and stays reusable.

**Why this is the trap worth naming.** CTR is a ratio. Reading it as evidence of
opportunity, without checking the impression base underneath it, is what produced
a 25-page cluster for a 33-impression market.

### 2. `/fees` linked to a 404 on the university behind the site's biggest fee query

`data/fees-hub-data.json` carried BIT Mesra's numbers (`naac: A`, `nirf: 92`,
`₹1.78L`) under the id `bits-pilani-online`. Two different universities.
`FeesTableClient` renders `/universities/{id}` in four places per row, so every
render shipped four dead links: that id is in neither `lib/data.ts` nor
`valid-urls.json`.

The 13 Sep worklist had spotted this and concluded "fixing it properly means
adding the university with verified data, not renaming a row". That was wrong.
BIT Mesra was already in `lib/data.ts` as `bit-mesra-online` with six live URLs
including `/universities/bit-mesra-online/mba`. It was a wrong id and nothing
more. Corrected, and the link now lands on a real page that carries the fee.

This sat on the page that ranks for fee queries while `bits pilani mba fees`
drew 668 impressions a week at position 9.64 for zero clicks.

**Guard.** `scripts/check-fees-hub-links.mts`, wired into pre-commit, fails any
fees-hub row whose id does not resolve to a university page. A row we hold fees
for but publish no page for must declare `"noPage": true` and renders unlinked;
the check also fails a stale `noPage` on a row that does have a page. No row
carries the flag today.

### 3. Two blog titles were not on the query they rank for

Galgotias read "Cheapest NAAC A+ at Rs 80K". That is a derived fee superlative of
exactly the kind `e8f879a` stripped from the coupon pages, and it is
unsupportable while 63 of 125 fee rows are placeholder ranges. Replaced with the
verified `₹80,200` and the query wording. Jamia Hamdard targeted `jamia hamdard
mba fees` with a title containing neither a fee nor a number.

**Left alone deliberately.** The BITS Pilani post says `₹2.97L` where
`lib/data.ts` says `298400`, and `NIRF #16` where `lib/data.ts` says `7` with no
category. Both need Supabase, which is the source of truth for accreditation
claims. Raised with Rishi rather than guessed at.

### 4. `/verify/[slug]` came off `force-dynamic`

All 123 sitemap'd verify pages hit Supabase live on every request, Googlebot's
included. A transient database failure served the crawler `notFound()` from the
page body or the title "University Not Found" from `generateMetadata`. 60 of the
123 had never earned a single impression.

Now `generateStaticParams` over the same `lib/data/verify-slugs.json` the sitemap
reads, with `revalidate = 3600`. The hour is deliberately short: accreditation
data moves on the scale of months, so the window exists only so a build that
caught Supabase mid-blip heals itself within the hour instead of serving a baked
404 until the next deploy. Unknown slugs still render on demand and 404 when
Supabase does not know them, which is what `force-dynamic` did.

### 5. The `is-X-fake-or-legit` blog cluster folded into `/verify/`

Both page types answered "is this university fake". Google shows about one result
per domain per query, so the blog post took the slot and the verify page was
filtered out. Search Console, 6-12 Sep: blog cluster 3,261 impressions at 0.71%
CTR, verify cluster 2,233 at 1.84%, and **verify ranked better in 8 of the 9
head-to-heads**. We were spending the impressions on the page that converts a
third as well.

13 of the 14 posts now 308 to their verify page and are marked
`status: 'redirected'` in `lib/blog.ts`, which drops them from
`getPublishedPosts()`, the sitemap and every listing. **IGNOU is not redirected**:
`/blog/is-ignou-fake-or-legit-2026` has 269 impressions and there is no verify
page to send them to. Add the redirect when the page exists.

Verify titles now carry the phrasing that has the volume. `mangalayatan
university fake` alone drew 371 impressions in a week; every "ugc approved"
phrasing on the whole site drew 45. The old title matched the 45. Titles answer
in place ("Is X Fake? No. UGC-DEB Approved 2026") because that is what the
Manipal Jaipur post did, and it out-drew every other page in the cluster.

**Two destinations were picked by hand against the fuzzy match, and both matters.**
The DY Patil post is about Dr. D.Y. Patil Vidyapeeth **Pune** (DPU-COL), not the
Navi Mumbai entity the token overlap preferred. `/verify/manipal-university-online`
is the Rajasthan entity founded 2011, i.e. Manipal University **Jaipur**; MAHE is
a separate university with its own page. A wrong destination here would have sent
a ranking page to the wrong institution.

**To undo.** Delete the block in `next.config.js` and set those 13 back to
`'published'`. Nothing else holds state.

### 6. A truncation bug the new titles exposed

`shortenInstitutionName` clipped "Manipal Academy of Higher Education" to
"Manipal Academy of Higher". That read as clumsy inside the old title and as an
actual sentence inside "Is Manipal Academy of Higher Fake?".
`TRAILING_STOPWORDS` now drops a dangling `higher`, `advanced` or `applied`.
Those three only ever appear mid-name in an Indian institution.

**Verified.** 308s confirmed with curl on four posts including the IGNOU
non-redirect (200). Sitemap re-read: only the IGNOU post remains of the 14.
Titles checked on the long-name cases (MAHE, VISTAS, Bharath Institute, NMIMS,
Shoolini). `/fees` re-read: both BIT Mesra renders now point at
`/universities/bit-mesra-online`, which loads. Full pre-commit suite green,
redirect sources 653 to 666.

---

## 2026-09-14 · SRM Sikkim had four missing specialisations and a fee that was 55% too high

**Source.** Rishi asked for BVDU and SRM Sikkim to be added to the hospital
management page. Checking the two official portals before writing produced one
confirmation, one refusal, and one fee correction nobody had asked for.

### 1. SRM Sikkim: `lib/data.ts` listed three specialisations, the portal lists seven

`onlinesrm.in/mba/` lists seven: Finance and Fintech, Marketing and Digital
Technologies, HR and Emerging Technologies, Operations and Supply Chain
Management, Business Analytics and Artificial Intelligence, **Hospital and
Health Care Management**, and **Hospitality and Tourism Management**. We carried
only Finance, Marketing and Human Resource Management.

That is why SRM Sikkim was absent from `/programs/mba/healthcare-management`
(and from `/programs/mba/hospital-management`, which redirects into it). The hub
derives its university list from `mbaSpecs` in `lib/data-slim.ts`, so a missing
specialisation is a missing university, not a missing link.

The four missing names were added. The three existing names were **left alone
deliberately**: their slugs (`finance`, `marketing`, `hr-management`) are live,
indexed URLs, and renaming a spec string is how a URL moves. The portal's fuller
titles are recorded in a comment above the array instead.

Four new URLs, verified through the full regeneration chain
(`prebuild` then `normalize-valid-urls.mts`, per `project_valid_urls_chain`):

    /universities/srm-university-sikkim-online/mba/hospital-and-health-care-management
    /universities/srm-university-sikkim-online/mba/hospitality-and-tourism-management
    /universities/srm-university-sikkim-online/mba/operations-and-supply-chain-management
    /universities/srm-university-sikkim-online/mba/business-analytics-and-artificial-intelligence

Set diff against HEAD: 6 added (those four plus two `/programs/mba/` spec hubs,
which `app/sitemap.ts` excludes anyway), 0 removed.

### 2. BVDU does not offer this specialisation online, so it is not listed

`bharatividyapeethonline.com/courses/mba/` lists fourteen specialisations and
none of them is Hospital or Healthcare Management. BVDU *does* award an MBA in
Health Care and Hospital Management, but through its Centre for Health
Management Studies and Research, which is a campus programme, not the online
MBA. Putting BVDU on the hospital-management page would have been a fabricated
claim on a site whose whole positioning is that it does not make them.

Rishi's call on being shown this: add BVDU's **Hospitality** track to the
hospitality page instead, which the portal does confirm. Done, with the four
elective papers the portal names (Food Service Operation, Tour Operations
Management, Hospitality Marketing Management, Accommodation Operations
Management) and a link to `/universities/bharati-vidyapeeth-university-online/mba/hospitality`.

### 3. The fee was ₹1,70,000 in our data and ₹1,10,000 on the portal

`onlinesrm.in/mba/` prints ₹27,500 per semester, ₹1,10,000 for the programme,
inclusive of exam fees. BBA and BCA were checked at the same time and are
₹1,17,000 each, which is correct in our data, so `feeMax` becomes the UG fee and
`feeMin` the MBA fee. `emiFrom` follows the dataset's `feeMin / 24` convention
at ₹4,583; the portal advertises ₹4,584 for the MBA.

Changed in `lib/data.ts`, `lib/data-slim.ts` and `data/fees-hub-data.json`.

**This inverted three published claims**, which is the expensive part and the
reason this entry is long:

- `online-mba-hospital-healthcare-management-india-2026`: SMU at ₹1,20,000 was
  described as the cheapest of eight. SRM Sikkim at ₹1,10,000 displaces it, and
  the post is now nine universities. Title, meta, four FAQ answers, the quick
  answer, the fee table, the tier headings and the decision matrix all moved.
- `online-mba-northeast-india-2026`: SRM Sikkim was "the most expensive NE option
  with the narrowest spec menu" at ₹1.70L with 3 specialisations. It is now the
  cheaper of the two branded options with the wider menu. The trade-off
  paragraph says the opposite of what it said this morning. The headline fee
  ceiling moves from ₹1.70L to ₹1.20L (SMU), preserving the original post's
  choice to quote single-figure fees and leave the Assam Don Bosco band out of
  the headline.
- `srm-university-sikkim-online-mba.json` and the DAVV comparison block that
  cites it: fee, EMI, specialisation count, the "only 3 specialisations" red
  flag and the "look elsewhere if specialisation breadth is needed" verdict
  bullet were all built on the old number. The red flag is now the accurate one
  (no International Business, no standalone Data Science track).

**Student reviews were left untouched on purpose.** Two of them complain about
"only 3 specialisations" and one calls ₹1.70L reasonable. They are dated 2023
and 2024 and were true for those intakes. Editing dated testimony to match
today's prospectus is falsifying it.

### Guards

`check-blog-fees` blocked the first attempt at both posts. Three figures went
into `data/blog-fee-allowlist.json` rather than being softened away: ₹1,10,000
and ₹27,500 on the hospital post, ₹1,10,000 on the northeast post. The first is
`getDisplayFee`-correct but sits outside the scanner's 200-character attribution
window in most of its occurrences; the second is a per-semester instalment,
which `lib/data.ts` does not model at all and so can never match. Baseline
dropped 2450 to 2446 and auto-staged.

Full `.husky/pre-commit` suite passes. `tsc --noEmit` clean. All four pages
rendered against the dev server: the hub lists SRM Sikkim, the new spec page
resolves with the corrected fee, both blog tables carry the new rows, and no
`₹1.70L` survives anywhere outside the dated reviews.

### Still open

- MAHE is cited as "NIRF #3" in the hospital post's fee table with no category.
  Pre-existing, and `feedback_nirf_category` says a bare rank is not allowed.
  Not touched here because the verified category rank was not to hand.
- `online-mba-hospital-healthcare-management-india-2026` has a duplicated
  conclusion and sources block, which is what produces the duplicate-key warning
  from `BlogTOC` and two identical entries in the table of contents.
  Pre-existing; fixing it means deleting published copy.
- SRM Sikkim's `programs` array says `['MBA','BBA','BCA']` in `lib/data.ts` and
  `['MBA','MCA','BBA','BCA']` in `lib/data-slim.ts`. The UGC-DEB workbook lists
  MBA, MCA, BBA, BCA, B.Com and M.Com for Shri Ramasamy Memorial University, so
  both are short and they disagree with each other.

---

## 2026-09-14 · Galgotias runs no scholarships, and the boilerplate that said otherwise

**Source.** Rishi confirmed on 2026-09-14 that Galgotias runs no scholarship or
fee-waiver scheme on its online programmes. That closes the contradiction opened
in `audits/coupon-expansion-worklist-2026-09-13.md` §1. The specialisation pages
were right all along.

### 1. The scholarship sentence was boilerplate, and it was wrong

Six programme hubs carried the identical sentence:

> {University} offers need-based and merit-based scholarships for eligible
> students. Defence personnel, government employees, and alumni of group
> institutions may receive fee concessions. Early payment discounts may apply.

The same six that carried the false "we do not apply exclusive coupon codes"
claim fixed yesterday. It is a template that was pasted onto six universities
without checking any of them, and it is now demonstrably wrong for one.

- **Galgotias** now states the confirmed fact: no scholarship scheme, no merit
  slab, no defence concession, no alumni discount.
- **The other five** (Amrita, Chandigarh, MAHE, Shoolini, Sikkim Manipal) no
  longer assert schemes we have not verified. The copy now says policy is set by
  the university, that we do not list unverified schemes, and points at the
  official portal. **Not verified either way. Each still needs a real answer.**

Removing an unverified claim is always safer than keeping it, which is why this
went ahead without waiting. Asserting the opposite would not have been.

**Note on blast radius:** `sections.coupon` from the page-content JSON is not
rendered by any component today, so this text was data rather than live copy.
Worth correcting regardless, since the JSON is the source other surfaces read
from, but it did not mislead a reader on the hub itself.

### 2. What *was* live: every programme hub promised scholarships

`ProgramBlogLinks` renders on every programme hub with blog links, and its third
link read:

> Check available {University} {Programme} scholarships and discounts

pointing at the `/coupons` index. Two problems. We list coupons, not university
scholarships, and on a university that runs none the anchor promised something
that does not exist. It also spent the link on an index page when the university
often has its own coupon page carrying the code, the fee and the form.

Now:

| case | anchor | target |
|---|---|---|
| MBA hub, coupon page exists | "Check the {uni} MBA discount coupon" | that page |
| MBA hub, page exists but no coupon | "{uni} MBA fees, and why no coupon runs on it" | that page |
| everything else | "Compare MBA discount coupons across universities" | `/coupons` |

**18 MBA hubs now link a specific coupon page** instead of the index.

Two deliberate restrictions:

- **MBA hubs only.** Every `/coupons/*` page is an online MBA page, so linking
  one from a BBA or MCA hub under "Check the {uni} MCA discount coupon" would
  point at a coupon for a different programme. That mistake was live for seven
  hubs in the first draft of this change and was caught before commit.
- **The no-coupon branch.** IGNOU publishes `couponCode: 'N/A'`. Its page is
  worth linking, it is reachable from nowhere else since the hub renders no card
  for it, but the anchor must not promise a coupon. It gets its own wording.

### 3. Coupon page updated to the confirmed position

The Galgotias FAQ now answers the scholarship question directly instead of
deferring, and a second FAQ explains why a programme with no merit waiver can
still be the cheaper choice. The comparison names figures rather than
generalising: Amity from Rs 2,07,000 and Chandigarh from Rs 1,65,000, both read
from `lib/data.ts`. An earlier draft said competitors "usually start from a fee
two to three times higher", which is the same derive-a-fee-claim problem the
superlative guard exists to stop, so it was replaced before commit.

**Verified.** `npx tsc --noEmit` clean. Checked on a running dev server: the
Galgotias MBA hub links `/coupons/galgotias-online-mba-discount-coupon-2026`
under "Check the Galgotias MBA discount coupon" and no longer mentions
scholarships; the IGNOU MBA hub links its page under "IGNOU MBA fees, and why no
coupon runs on it"; the Galgotias coupon page carries the no-scholarship answer
across 9 FAQs and still says nothing about who funds the discount.

**Still open.** The five other universities whose scholarship copy was
de-asserted need a real answer each, same shape as the Galgotias question.

---

## 2026-09-14 · Galgotias coupon page, and the derived fee superlatives it exposed

**What.** A 24th coupon page, `/coupons/galgotias-online-mba-discount-coupon-2026`,
plus removal of three derived fee superlatives found while building it and a
guard that blocks new ones.

### The page

Galgotias is the largest cluster on the site at **39,939 impressions**, and it
had no coupon page while a `GALG2026-5K` code sat in the catalogue.

Every published fact is verified twice, against `lib/data.ts` and the Supabase
`accreditations` table:

| field | value | source |
|---|---|---|
| NAAC | A+, score 3.37, cycle 1, valid to 2029-08-16 | Supabase |
| NIRF | **no rank claimed** | Supabase holds only Pharmacy #55 and Law #36 |
| UGC-DEB | approved | Supabase `ugc_deb_status` |
| Fee | Rs 80,200, four semesters over two years | `lib/data.ts`, `fees-hub`, and the programme hub agree |
| Review blog | `/blog/galgotias-online-mba-review` | exists |

**Two claims deliberately not made.**

*No NIRF rank of any kind.* The programme hub content asserts a "NIRF band
101-125 (Management 2025)" that the source of truth does not carry, and that
band is where the phantom `nirfMgt: 101` in `fees-hub-data.json` came from
(removed 2026-09-13). The page states `Not ranked in the NIRF 2025 top 100`,
which is true whether or not the band claim turns out to be real. Pharmacy and
Law ranks are real but irrelevant to an MBA page, so quoting either would
mislead.

*Nothing about Galgotias scholarships, in either direction.* Our own content
still contradicts itself: the programme hub says Galgotias "offers need-based
and merit-based scholarships", the specialisation pages say "Scholarships: None
offered". The page repeats neither and sends scholarship questions to
galgotiasonline.edu.in, which is correct under both possible truths. **Still
open:** one answer from the official portal would settle it and let the page
carry a real discounts table.

Rishi confirmed the discount is EdifyEdu's own and asked that the page not say
so. It does not, and neither does any other coupon page. The template's standing
disclosure already carries the part that matters for accuracy: the coupon is
"not an official discount offer issued, endorsed, sponsored, or administered by"
the university, and university scholarships "are separate from this coupon".
So the page never implies the university is discounting its own fee.

### The superlatives this exposed

Checking what renders turned up three claims our data cannot support. The
standing rule is never to derive a fee superlative, because a large share of fee
rows are placeholder ranges and we track 143 universities rather than a market.

| where | claim | status |
|---|---|---|
| `CouponPageCTA.tsx` heading | "{shortName} has the lowest fee" | removed |
| `CouponPageCTA.tsx` body | "the most affordable online MBA from a NAAC {naac} university" | removed |
| Amity `peerComparisons` | "No coupon but lowest base fee in India" | now "No coupon, lower base fee" |
| IGNOU `couponDiscount` | "No coupon - lowest base fee in India" | now "No coupon on this programme" |

The `CouponPageCTA` pair renders only on the `couponCode === 'N/A'` branch,
which today is IGNOU alone. The Amity row renders on Amity's page, because
`peerComparisons` is one of the few fields still rendered.

The replacement copy states the fee, says why there is no coupon, flags the
figure as indicative and sends the reader to the portal, which the old copy did
not do.

**SMU's superlative was checked and kept.** "the most affordable of the three
Manipal-group online MBA programmes (SMU, MUJ, MAHE)" names its comparison set
and every member is in our data: SMU Rs 1,20,000 < MUJ Rs 1,53,000 < MAHE
Rs 2,92,000. A bounded, checkable comparison is not the thing the rule forbids.

### Guard

`scripts/check-coupon-claims.mts` now also scans every rendered coupon string
for `cheapest|most affordable|lowest (base )?fee|best value` and fails unless
the exact string sits in `CHECKED_SUPERLATIVES`, which carries the date and the
figures someone verified it against. Bounded claims stay possible, unchecked
ones cannot ship.

**Noted while reading the template, not fixed.** `discounts`, `stackExample` and
`emiCompatible` are rendered nowhere since the quick-facts card replaced the
discounts table. That is roughly 23 pages' worth of scholarship detail sitting
in the type and in nobody's view. Worth either restoring a discounts section or
dropping the fields, but not in the same change as a new page.

**Verified.** `npx tsc --noEmit` clean on app and scripts. Checked on a running
dev server: the new page renders with NAAC A+, no NIRF rank, UGC-DEB and the
coupon block; `/coupons` now links 23 distinct landing pages including
Galgotias; the IGNOU page carries no superlative and shows its fee. Console
errors on both are pre-existing CSP and ad-tracker noise.

---

## 2026-09-13 · coupons cluster: wrong claims, unreachable pages, and a stale fees copy

**What.** Five defect classes in and around the coupon cluster, plus a new
pre-commit guard, `scripts/check-coupon-claims.mts`.

**Why the coupon cluster and not something else.** It is the best-converting
page type on the site by a wide margin, and the brief was to expand it. Before
adding a page it is worth knowing the existing ones are correct and reachable.
They were neither.

| cluster | pages | clicks | CTR |
|---|---:|---:|---:|
| coupons | 9 | 46 | **3.00%** |
| verify | 61 | 186 | 1.76% |
| universities | 650 | 593 | 0.80% |
| blog | 180 | 1,127 | 0.46% |

### 1. Four coupon pages published NIRF ranks that were wrong

Cross-checked against `lib/data.ts` and then against the Supabase
`accreditations` table, which agreed with each other on every row.

| page | claimed | truth | note |
|---|---|---|---|
| NMIMS | #17 Management | **#24 Management** | overstated on a commercial page |
| JAIN | #62 Management | **#73 Management** | #62 is its *University* rank |
| Symbiosis SSODL | #32 Management | **#11 Management** | #32 matched no category |
| IGNOU | #1 Open University | **Not ranked in NIRF 2025** | NIRF publishes no such category |
| DPU | "Ranked" | **#41 University** | a rank claim with no category |

A wrong NIRF rank on a page whose entire pitch is verified independence is a
trust defect before it is an SEO one, and the overstated NMIMS rank is the worst
of the five because it flatters a university on a page that asks for a lead.

### 2. The /coupons hub could not link five of its own pages

The hub resolved a coupon to its landing page by taking the first hyphen segment
of the universityId and finding the first page slug that *contained* it:

```
'dy-patil-university-online' -> 'dy' -> matched 'bharati-vi(dy)apeeth-...'
```

So DY Patil's card linked to Bharati Vidyapeeth's coupon page. Four more
rendered no link at all, because their page slug uses a short form the id does
not start with: LPU, SMU, DSU, VGU. Replaced with an exact
`COUPON_PAGE_BY_UNIVERSITY` map. Verified on a running server: all seven
affected links now resolve to the correct page.

### 3. Three coupon pages had no card on the hub at all

MAHE, DPU and IGNOU had a landing page but no `lib/coupons.ts` entry, so the hub
rendered no card and therefore linked them from nowhere. MAHE
(226 impressions, position 6.5) and DPU already publish live coupon codes on
their own pages, so catalogue entries were added from what those pages already
say, not invented. IGNOU stays out on purpose: its page publishes
`couponCode: 'N/A'` because it carries no coupon, and a card would imply an
offer that does not exist.

### 4. `amrita-university-online` was not a real university id

`lib/coupons.ts` carried an id absent from `lib/data.ts`. The substring matcher
hid it by accidentally resolving 'amrita' to the right page. Corrected to
`amrita-vishwa-vidyapeetham-online`.

### 5. Six programme hubs told readers we run no coupon codes

Six `page-content` files carried:

> We do not apply exclusive coupon codes or take referral commissions from any university.

Five of those six universities have a live coupon page offering an exclusive
code. Two indexed pages, two clicks apart, contradicting each other on an
independence-positioned site. Removed the false clause and kept the true one
("We do not take referral commissions from any university"), which is the
narrowest edit that makes the sentence accurate. The wording is worth a
deliberate pass by Rishi, since how the coupon is described is a positioning
decision rather than a data fix.

### 6. `data/fees-hub-data.json` had drifted 85 fields from `lib/data.ts`

`/fees` renders `{u.nirf < 999 ? '#'+u.nirf : '—'}`, so rows carrying the
sentinels **99, 101 and 102** displayed as real ranks: "#99", "Mgt #101". Eleven
universities showed a fabricated NIRF rank, with no category label, which the
standing NIRF rule forbids on its own.

Alongside them, 17 NAAC grades were stale, including one overstatement
(KSOU shown as A++ where the truth is A+) and Christ shown as A++ where the
truth is A+.

`lib/data.ts` agreed with Supabase on **all 17**, so this was a stale derived
copy and not a disputed fact. Synced all 85 fields from the master. No title or
metadata anywhere reads from this file, so nothing outside `/fees` changes.

**Verified.** `npx tsc --noEmit` clean on app and scripts. `/coupons` checked on
a running dev server: 22 distinct landing pages linked, all seven previously
broken or missing links correct. Console errors on that page are pre-existing
CSP and ad-tracker noise, unrelated.

**Guard.** `scripts/check-coupon-claims.mts` runs in pre-commit and blocks: a
coupon page whose NAAC or NIRF disagrees with `lib/data.ts`; a NIRF string that
is neither `#<rank> <Category>` nor `Not ranked...`; a coupon universityId
absent from `lib/data.ts`; a page the hub cannot resolve; and a page that
publishes a coupon code but has no catalogue entry.

**Still open, needs Rishi.**

- **BIT Mesra is filed under the id `bits-pilani-online` in
  `data/fees-hub-data.json`,** two different universities, and the id is not in
  `lib/data.ts`. `/fees` renders a link to `/universities/bits-pilani-online`,
  which is in neither `valid-urls.json` nor the redirect map, so it 404s. BIT
  Mesra is absent from `lib/data.ts` entirely, so fixing it properly means
  adding the university with verified data rather than renaming a row.
- **No new coupon page was added,** which was the original brief. The eight
  universities in the catalogue without one each have a specific blocker,
  recorded in `audits/coupon-expansion-worklist-2026-09-13.md`. Galgotias is the
  best candidate by a distance and is blocked on one contradiction inside our
  own content, not on anything external.

---

## 2026-09-13 · lead attribution: four capture widgets were erasing the page path

**What.** `RequestSyllabusModal`, `RequestSampleModal`, `StickyLeadCard` and
`GatedContent` now send `sourcePage` alongside `source`. `/api/enquiry` composes
both into one field as `"<path> · <widget>"` instead of letting either win.

**Why.** The API resolved attribution as `sourcePage || source || 'website'`.
Those four widgets sent only `source`, so the widget name won and the page path
was never recorded. Measured against the live CRM on 2026-09-13:

| source recorded | leads |
|---|---:|
| `syllabus_request` | 14 |
| `sample_cert_request` | 14 |
| `coupon_unlock` | 7 |
| `sticky_card` | 7 |
| `gated_scholarship` | 1 |
| **widget name only, page unknown** | **43 of 89 website leads (48%)** |

Nearly half of every website lead ever captured cannot be traced to the page
that produced it. That single gap blocks the question the whole SEO programme
exists to answer: which page earns a student. Every consolidation decision in
`audits/gsc-ranking-lead-strategy-2026-08-23.html` is sized on projected leads
per cluster, and there is no way to check any of those projections against
outcomes while half the leads have no page.

**Why one composed field and not a new column.** `source` is read by the Resend
lead email, the Supabase `leads` row, the CRM list and the Sheets webhook. A new
column means a migration plus four readers. The composed string preserves both
facts, stays readable in the lead email, and existing rows (which hold either a
path or a widget, never both) still parse: split on `" · "` and take what is
there. Revisit if the CRM ever needs to group by widget and page independently.

**Verified.** `npx tsc --noEmit` clean. Not backfillable: the 43 existing rows
have lost the page permanently, so the funnel baseline starts from this commit.

**Guard.** Any new lead-capture component must send `sourcePage` as well as
`source`. A widget that sends only `source` silently loses attribution and
nothing fails loudly.

---

## 2026-09-13 · link the verify pages from programme hubs

**What.** A `getVerifyPage()`-gated verify link in the approvals block of
`UniProgramBody`, so every resolvable programme hub links its university's
verification page. **356 new links across 105 verify pages, +3.4 inbound each.**

**Why.** Verify pages are the best opportunity on the site by the numbers, and
the audit had them parked as a "candidate":

| cluster | pages | clicks | CTR | avg inbound links |
|---|---:|---:|---:|---:|
| coupons | 9 | 46 | 3.00% | healthy |
| **verify** | 61 | 186 | **1.76%** | **1.0** |
| universities | 650 | 593 | 0.80% | 28.9 |
| blog | 180 | 1,127 | 0.46% | 8.2 |

The second-best-converting page type on the site, ranking at position 4 to 6, was
also the most link-starved: 124 pages averaging one inbound contextual link, 17
with none, and the only source was the university overview page.

The approvals block is the honest place for the link rather than a footer or a
sidebar, because that is exactly where the page makes its UGC-DEB and NAAC
claims. Anchor text names both.

**Sized deliberately.** Hubs only, not the 1,919 spec pages. 356 links spread
over 105 targets is proportionate; putting it on every spec page would have been
roughly 1,900 links into a utility cluster and would pull equity off the
commercial pages. Measure this first.

**Gated.** `getVerifyPage()` returns null for the 19 universities Supabase has no
record for, and those hubs render nothing. Never fall back to `/verify/{u.id}`,
which 404s for roughly half the catalogue because the verify route keys off
Supabase slugs rather than `lib/data.ts` ids.

**Verified.** 45 hubs sampled: 27 carry a link, 16 correctly omit it, and every
emitted verify URL returns 200. Two 500s in the sample were the known dev-server
concurrency flake and return 200 on serial retry.

---

## 2026-09-13 · 11 new coupon pages

**What.** `COUPON_PAGES` 12 to 23, `COUPONS` 26 to 32. New pages for Shoolini,
DSU, UPES, Parul, Bharati Vidyapeeth, DY Patil Navi Mumbai, Kurukshetra, Manav
Rachna, Mangalayatan, VGU and GLA.

**Why.** Rishi asked for them. The coupon cluster is the site's best-converting
inventory: it grew 44 clicks to 46 in the last GSC window while the index page
fell, and the Manipal Jaipur page moved position 7.2 to 4.9.

**How the fabrication risk was removed.** The blocker raised earlier was
`CouponPageData.discounts[]`, which on existing pages lists real university
schemes such as a 15% upfront discount and a 20% defence waiver. Those cannot be
verified from inside the repo. Checking the template resolved it: **`discounts[]`
is never rendered**, and neither are `totalFee`, `finalFee`, `stackExample`,
`emiCompatible` or `couponDiscount`. So the new entries carry only the edifyedu
coupon in `discounts[]`, assert no university scheme anywhere, and each page
tells the reader to confirm scholarships on the official portal. The existing
disclosure block already separates the two.

Every factual field reads from `lib/data.ts`: name, NAAC, NIRF and the MBA fee
string already published on that university's hub. No figure was hand-written.
NIRF labels always state their category, and the 999 unranked sentinel renders
as "Not ranked in NIRF 2025" rather than as a rank.

All 11 official domains were checked to resolve before being written into
`officialUrl` and the Course schema's `sameAs`.

**Two defects fixed on the way.**
- `BVP2026-5K` pointed at `bharati-vidyapeeth-online`, a universityId that does
  not exist in `lib/data.ts`, so the coupon never matched its university.
  Corrected to `bharati-vidyapeeth-university-online`.
- `blogSlug` was required and rendered as an unconditional `<Link>`. Five of the
  eleven universities have no review blog, so the field is now optional and the
  card renders only when a slug exists. No `/blog/undefined` is emitted.

**Still open.** `AMR2026-5K` points at `amrita-university-online`, which also
does not exist; the live Amrita page uses `amrita-vishwa-vidyapeetham-online`.
Left alone because it may be a deliberate duplicate rather than a typo.

**Verified.** All 11 pages return 200 with Offer, FAQPage, HowTo and Course
schema, no "Online Online", no orphan universityId, no duplicate slug, every
`blogSlug` resolving to a real post. All 24 coupon URLs appear in the sitemap.

---

## 2026-09-13 · coupon pages: "Online Online" on all 12, in copy and in schema

**What.** Adopted the existing `formatUniversityDisplayName()` helper at the five
places the coupon template composes a university name with " Online MBA".

**Why.** Every `universityName` in `COUPON_PAGES` already ends in "Online", and
the template appended " Online MBA ...", so **all 12 pages** rendered
"Amity University Online Online MBA Discount Coupon 2026". It was in the H1, the
Offer schema `name`, the Course schema `name`, the HowTo description and the
comparison table, so it reached both the page and the rich result.

These are the best-converting pages on the site. The coupon cluster grew 44
clicks to 46 in the last GSC window while the index page fell, and the Manipal
Jaipur page went from position 7.2 to 4.9 with 10 clicks to 24. A visible
grammar defect on the commercial pages that are actually ranking is worth more
than most on-page work elsewhere.

`lib/format.ts` has carried `formatUniversityDisplayName()` for this exact
artefact since `SchemaBlock` and the blog template hit it. The coupon template
never adopted it.

**Asked for but NOT done: new coupon pages.** 13 universities hold a coupon in
`COUPONS[]` with no landing page, and 10 of those have usable fee and NAAC data.
The blocker is `CouponPageData.discounts[]`, which carries real university
scholarship schemes: "15% upfront discount", "Defence scholarship 20% fee
waiver", "Divyaang scholarship up to 100%", "Merit scholarship 5-15%". Those are
per-university facts that would have to be invented for UPES, Sharda, Galgotias,
Shoolini, DSU, Uttaranchal, VIT, KLU, Graphic Era and Parul. That is the
fabrication class this site cannot ship. The pages are worth building once
someone confirms each scholarship scheme against the university portal.

**Raised and closed.** `lib/coupon-pages.ts` opens with a comment saying premium
maps to Rs 7,500 while `lib/coupons.ts` sets all three tiers to
`{max: 5000, base: 4000}`, and two codes read `MAHE2026-7500` and
`SYMB2026-7500`. Flagged to Rishi on 2026-09-13; he confirmed it is not an issue.
**Do not raise this again or "fix" the tier comment.**

**Verified.** All 12 pages return 200 with zero "Online Online" anywhere in the
HTML, and all eight JSON-LD blocks still parse, with Offer and Course carrying
the corrected name.

---

## 2026-09-13 · built out `/fees`, the one fee asset with headroom

**What.** Added five H2 sections, a six-question FAQ with FAQPage schema, a
WebPage schema carrying dateModified, nine contextual internal links, and
replaced the hardcoded hero figures with values derived from the dataset.

**Why.** The corrected GSC diagnosis found the fee-query opportunity is far
smaller than first claimed and mostly campus intent, and that the
blog-versus-hub title theory is contradicted by our own data. `/fees` was the
one fee-side asset left with real headroom: indexable, well titled, backed by a
143-row dataset, and sitting at **position 21 on 453 impressions**.

It was also structurally thin in a way that explains position 21. A 517KB page
carrying **one H1 and zero H2s**, a client-rendered table, and a footnote. There
was nothing on it for a fee query to match except the table itself.

**Fee figures: derived, then reverted the same day. I was wrong.** I replaced the
hero literals with values computed from `feesData`, which made the page claim a
lowest fee of ₹9,600. Rishi corrected it: IGNOU's fee is ₹60K and that is the
lowest. He is right. IGNOU's row is `₹9,600 – ₹66,000`, a 6.9x span across seven
programmes, so ₹9,600 is the floor of a range, not a total fee anyone pays.

**63 of the 125 priced rows exceed the `SUSPICIOUS_RANGE_RATIO` of 3.0** that
`lib/fees.ts` already applies to reject exactly this shape. The dataset cannot
support a "lowest fee" claim at all. That is the parked placeholder-fee cluster,
and it needs portal research, not a cleverer reduce.

Reverted: both chips are literals again, the derived "eight lowest fees" table
was removed, and the FAQ that named a lowest figure was replaced with a process
answer. The reasoning is recorded in a comment at the top of the file so the
next person does not re-derive them. Only counts are computed now: NAAC grades
and programme coverage count rows, not money.

**Also fixed.** `buildSchemas()` had always constructed a `webpage` object and
then never rendered it, so the page shipped without WebPage schema entirely.

**Constraint honoured, after the correction above.** The only fee figures on the
page are the two original literals. No new fee claim was introduced anywhere,
including in the six FAQ answers.

**Verified.** All JSON-LD blocks parse; FAQPage carries 6 questions, WebPage
carries `dateModified`, canonical is self-referencing and correct, page is
`index, follow`. Four H2s render, and the page carries no ₹9,600 claim. All nine internal link targets confirmed
live and indexable on production first. House style checked: no em dashes, no
filler words from the banned list.

**Detail.** `audits/gsc-diagnosis-2026-09-13.md`

---

## 2026-09-13 · `/programs/mba/specializations/*` consolidation

**What.** 301'd the whole deprecated route to `/programs/mba/{spec}`, repointed
17 internal links, marked the route file superseded. No figure or ranking changed.

**Why.** Two GSC exports (28d to 08-26 vs 28d to 09-10) showed the real site
down **11.8% on clicks and 16.1% on impressions** once the calculator cluster is
filtered out, against an unfiltered reading of +5.8%. Inside that, `/programs/*`
carried **13,533 impressions for 25 clicks**, every page noindex with a
self-referencing canonical, sitting at positions 40-75.

Task 5 (2026-08-19) had already decided `/programs/mba/{spec}` was the canonical
specialisation landing and noindexed this route, but never finished the job: the
route stayed live, kept a SELF canonical, and held 17 inbound internal links from
blogs and guides. Four specialisations had both URLs live and competing:
business-analytics at 951 impr / pos 69.6 against 725 impr / pos 69.5.

The case that matters is healthcare-management. It is the only spec on
`PROGRAMS_INDEX_ALLOWLIST`, so the only one permitted to rank, and it fell from
**pos 9.0 to 24.8** while its noindexed twin collected 477 impressions. Index
permission sat on one URL and link equity on the other.

**Deliberately not done.** Rishi asked that no fee or ranking figure be touched,
so the blog-vs-hub data contradiction found in the same diagnosis (BITS Pilani
quoted at ₹2.97L / NIRF #16 Overall on the blog and ₹2.98L / NIRF #7 with no
category on the hub) is recorded and left alone. It remains open.

**Verified.** All 7 deprecated URLs 301 to a target that returns 200 with no
chain; the bare path and any unknown sub-path fall through to `/programs/mba`;
all 17 repointed links resolve directly rather than through a hop; zero
references to the dead route remain in `lib/`.

**Detail.** `audits/gsc-diagnosis-2026-09-13.md`

---

## 2026-09-13 · internal link starvation on specialisation pages

**What.** Canonicalised the specialisation links on programme hubs, added
manifest-only specs to that grid, and gave every specialisation page a
sibling-specialisation block. ~9,600 new internal links.

**Why.** A crawl of all 2,907 live pages found **1,516 of 2,875 (53%) had 0 or 1
inbound contextual link**, concentrated almost entirely in specialisation pages:
1,919 of them averaging 1.1 links, with 404 orphans and 953 on a single link.
One link is a single point of failure — reword that one source and the page goes
orphan — and it confers almost no topical signal. The site's own within-pair
test (55 university+programme pairs with both a blog and a hub) shows the
better-linked page is the better-ranking page in 51 of 55 cases.

**Three causes, two fixed in code.**
- 186 pages: the hub linked an alias that 308s (`human-resource-management` ->
  `hr-management`), so the canonical page got zero direct links. 189 such links.
- 143 pages: specs present only in `programs-manifest.json` were never listed,
  because the grid renders `pd.specs` from `data.ts`.
- 75 pages: linked only from a `noindex` hub. **Not fixed** — root cause is the
  placeholder-fee cluster and it needs real fees from official portals.

**Verified.** 60 hubs sampled, all 190 spec links return 200 directly, no
redirect hops. 40 spec pages sampled, average 5.0 sibling links each, every one
200. Rendered block checked in the accessibility tree: semantic `nav`,
descriptive anchor text, hub link in the footer of the block.

**Guard.** Links are gated on `isLinkable()` and canonicalised through
`resolveSpec`, so neither a broken nor a noindex target can be emitted.
`scripts/check-internal-hub-links.js` still covers hub links after a build.

**Measured after deploy (re-crawl of production).** Spec pages: 404 orphans → 24,
953 single-link → 144, average inbound 1.1 → 6.0. Sitewide pages with 0 or 1
inbound contextual link: **1,516 → 327, down 78%**. 1,729 pages gained links,
**0 lost any**. The 168 that remain are structural: 160 are the only
specialisation in their group, so no sibling exists to link.

**Detail.** `audits/topical-authority-2026-09-13.md`, raw graph in
`audits/internal-link-graph.md`.

---

## 2026-09-13 · `e4a2643` — specialisation names split, truncated and placeheld at import

**What.** Repaired 13 `specs` arrays in `lib/data.ts`; retired 51 URLs with
per-university 301s; added a repair step to `scripts/build-valid-urls.js`.

**Why.** A parenthesised list had been comma-split across the array. SPPU's BCA
read `['General (C', 'C++', 'Java', … 'Software Testing)']`, written as
`General (C, C++, Java, … Software Testing)`. Split, it published **nine
specialisation pages** and told readers SPPU offers a BCA specialisation in Dot
Net and in Web. It does not — those are subjects inside one General programme.
For a site whose whole positioning is "independent, no paid rankings, verified
data", publishing specialisations a university does not offer is the worst class
of error we can ship. Two related defects: four names truncated mid-string
(`"Computer Applications (4 specialisations available"`), and placeholder text
published as a specialisation, including one cell of five names that became the
slug `finance-marketing-human-resources-operations-strategy-contact-university-for-specialisation-structure`.

**Key finding.** `data/EdifyEdu_Unified_Programs_v3.xlsx` carries the *same*
corruption in two other shapes (`General – Java` rows, and comma fragments that
kept their leading space: `" Accounting"`, `" IoT"`). It is downstream of the
same splitter, **not an independent source**. Do not "restore from Excel"
assuming it is cleaner. The repair therefore lives in `build-valid-urls.js`, not
the workbook, so it survives the next refresh and reads in a diff.

**Verified.** All 51 retired URLs 301 to the surviving specialisation; all 15
destinations render 200; titles now read "SPPU BCA General". Four retired URLs
had Search Console history (`/sppu/bca/general-c`, 386 impressions) which is why
these are 301s and not 404s.

**Guard.** `scripts/check-spec-names.ts` on pre-commit — fails on unbalanced
parentheses, placeholder text, multi-name cells. Tested both directions.

**Detail.** `audits/malformed-spec-names-2026-09-13.md`

---

## 2026-09-13 · `a178bd0` — 330 spec URLs that 404 on a naming difference

**What.** 169 new entries in `lib/data/spec-slug-rescue-rules.json`, turning 330
404s into 308s.

**Why.** Reported from the field: `/universities/manipal-university-jaipur-online/mba/data-science`
404'd. Manipal names that specialisation "Analytics and Data Science" and
Chandigarh names theirs "Data Science and Artificial Intelligence", so the
generic slug a reader or a crawler guesses matched nothing. Middleware section 2f
was right to 404 a slug no university serves; what was missing was the mapping
from the guessed name to the one the university actually uses.

**Scope finding.** An audit of the whole class found 240 such URLs across ten
programmes (`mca/machine-learning` at 17 universities, `bba/supply-chain`,
`ma/mass-communication`). It also found **zero broken internal spec links** in
blogs, guides, coupon pages or page-content JSON, and all sitemap spec URLs
healthy — so this class only ever arrived from outside (GSC, typed URLs,
external links). No link-generation code needed changing.

**Deliberately not fixed.** Nine mappings narrow the meaning rather than rename
it (BCA *is* Computer Applications, so `/bca/computer-applications` must not land
on one specialisation of it). Sending a reader to a different course than the URL
asked for is worse than a 404.

**Verified.** All 330 return 308 to a page that renders 200; 0 of the sitemap
spec URLs changed status.

**Guard.** `scripts/check-spec-redirect-health.ts` on pre-commit. The existing
`check-spec-allowlist` proves the file agrees with `resolveSpec`, which a bad
rescue rule can satisfy while still creating a loop, a chain, or a redirect onto
a page section 2d 404s. All three occurred while writing this change and the new
check is what caught them.

**Detail.** `audits/spec-slug-404-audit.md`

---

## The soft-404 thread these two continue

The four fixes below are why the machinery this session used exists at all. Read
top-down; each one caused the next.

### `2e24d1d` (2026-08-29) — real 404s for soft-404 classes under /universities

**Why.** The spec and programme routes called `notFound()`, yet still served the
not-found UI inside an HTTP **200**. Cause: those routes sit under a
`loading.tsx`, so Next flushes the streaming shell with a 200 before the page
component ever runs, and `notFound()` can then only swap the UI, never the
status. Google treats a 200 that says "not found" as a soft 404 and distrusts
the whole directory. Fixed by deciding status at the **edge** in `middleware.ts`
(sections 2d/2e/2f), before Next routes the request.

### `eaca4eb` (2026-08-30) — protect ranking URLs, kill meta-refresh redirects

**Why.** `2e24d1d` was correct for junk URLs but started hard-404ing **13 URLs
that were ranking**, several on page 1, carrying 1,576 impressions between them.
They had been soft 404s, so no content was lost, but a hard 404 tells Google to
drop the URL and discard the signal it earned. Each got a 301 to its programme
hub. `scripts/check-gsc-404s.mts` made this a rule rather than a one-off: widen
an allowlist again and any ranking URL it would kill fails the commit.

### `b03fb6f` (2026-08-30) — retire 19 sitewide MBA slug wildcards

**Why.** Slug rules like "`marketing-management` means `marketing`" were
`next.config.js` wildcards firing for all 144 universities — **including the ones
whose real specialisation IS the verbose slug**. That redirected 11 live pages
away, 8 of them into a 404. Moved into `spec-slug-rescue-rules.json`, where the
allowlist builder applies each rule per university and only when that university
cannot serve the source slug and can serve the destination. This is the mechanism
`a178bd0` above extends.

### `db89288` (2026-08-31) — delist REVA University

**Why.** REVA's online-mode claims could not be verified against UGC-DEB. Rather
than keep unverifiable accreditation claims live, all 14 URLs were made real
404s. Consistent with the site's positioning: absence of proof is not proof.

---

## Site size, for reference (2026-09-13)

| | count |
|---|---|
| **Real pages** (sitemap, all 200) | **2,838** |
| Redirect aliases (308, deliberately not in sitemap) | 3,783 |
| Retired URLs (301, `next.config.js`) | 85 |
| Distinct URLs served | 6,622 |

The alias count exceeds the page count because one page can be reached by many
spellings. Only the 2,838 are indexable; 0 aliases appear in the sitemap, an
invariant `check-url-canonical-map` enforces on every commit.
