# Fix log

Running record of every fix: what changed, **why**, how it was verified, and what
guards it. Newest first. One entry per commit that changes behaviour or data.

Rule for new entries: never write only what changed. The *why* is the part that
is expensive to reconstruct later, and it is what stops the next person undoing
the fix by accident.

---

## 2026-10-03 · The fonts now actually render

Follow-up to the self-hosting commit, which recorded that neither font had ever reached a
visitor and left the wiring for Rishi to decide. He asked for it.

**The cause, restated.** `next/font` does not expose the real family name. It generates a
hashed one and exposes it through the CSS variable it sets on `<html>`. Asking for
`font-family: 'Plus Jakarta Sans'` by name only resolves if the visitor has that font
installed locally, so body text fell through to the system sans-serif and every heading
fell through to Georgia.

**What changed.** Eight `font-family` declarations in `app/globals.css` and the inline
styles across `app/page.tsx`, `app/universities/page.tsx`, `app/verify/page.tsx`,
`app/tools/percentage-to-gpa/PercentageToGpaClient.tsx`, `components/UniversityCard.tsx`
and `components/verify/HeroSection.tsx` now read `var(--font-body)` or
`var(--font-display)`. `app/admin/` is untouched, per the CMS rule.

**The two variable definitions at globals.css:164-165 are deliberately left alone.** They
read `--font-body: var(--font-body, 'Plus Jakarta Sans', system-ui, sans-serif)`, which
resolves to next/font’s value with the fallback chain appended. That self-reference looks
wrong and is what makes `var(--font-body)` safe to use everywhere else, so it stays.

**Verified by measurement, not by eye.** Before, `getComputedStyle(document.body)` returned
`"Plus Jakarta Sans", -apple-system, ...` and every `@font-face` reported status
`unloaded`. After, it returns `__plusJakarta_fddcb3, ...`, the `h1` returns
`__fraunces_b36429, ...`, and all six faces report `loaded`. Rendered width at 48px bold
moved off both fallbacks: body 757.02px against plain sans-serif at 741.70px, heading
766.47px against Georgia at 787.11px. Checked on the homepage and a blog post with no
console errors, and the production build exits 0.

**Note for next time.** `document.fonts.check('700 48px "Plus Jakarta Sans"')` returned
true throughout, including while the font was definitively not in use. It answers "can
something render this text", not "is this font present". Measuring the rendered width
against a known fallback is the test that actually distinguishes them.

---

## 2026-10-03 · Fonts self-hosted, and neither font was ever reaching a visitor

**The build failure.** `app/layout.tsx` loaded Plus Jakarta Sans and Fraunces through
`next/font/google`, which fetches the font from Google at BUILD time. When that call was
rate-limited the loader’s regex matched null and the build died in 18 seconds:

```
An error occurred in `next/font`.
TypeError: Cannot read properties of null (reading '1')
  at @next/font/dist/google/loader.js:112
```

It happened twice on 3 October on the `edify-edu` Vercel project while the *same commit*
built green on `edify-edu-dh2m` and `edify-next` minutes apart, which is what identified it
as an external, intermittent fault rather than a code defect.

**Now self-hosted.** `app/fonts/` holds the latin subset of each font’s VARIABLE build, one
file per style, so two files cover the whole 400 to 800 range the site asks for instead of
nine static instances. 139 KB for all four. Both fonts are SIL OFL 1.1 and the licences sit
beside them. `next/font/local` keeps the preloading and the fallback metric adjustment, so
nothing about loading behaviour changes; the build simply no longer touches the network.
Verified: four woff2 files emitted into `.next/static/media`, no `fonts.gstatic.com` or
`fonts.googleapis.com` anywhere in the server output, build exits 0.

**What that uncovered, and it is the bigger finding.** Neither font has ever rendered for a
visitor. `next/font` does not expose the real family name: it generates a hashed one
(`__plusJakarta_fddcb3`) and exposes it through the CSS variable it sets on `<html>`. But
`app/globals.css` and the inline styles ask for the literal names, `font-family: 'Plus
Jakarta Sans'` and `'Fraunces'`, which only resolve if the visitor happens to have those
fonts installed locally. Measured in the browser at 48px bold:

| declaration | rendered width |
|---|---|
| body, as the CSS asks for it | 741.71px |
| plain `sans-serif` | **741.71px, identical** |
| body, via the next/font variable | 744.98px |
| heading, as the CSS asks for it | 787.11px (this is Georgia) |
| heading, via the next/font variable | 795.21px |

So body text renders in the system sans-serif and headings render in Georgia, while the
site downloads two fonts nothing points at. `document.fonts.check()` returns true for both
names, which is misleading: it answers "can something render this", not "is this font
present".

This predates the change above. `next/font/google` had exactly the same hashed-name
behaviour, so the fonts were decorative in the build and absent from the page throughout.

**Deliberately not fixed here.** Wiring them up means pointing 12 declarations in
`app/globals.css` and 25 inline styles across six components at `var(--font-body)` and
`var(--font-display)`. That is a visible change to every page, body going from system sans
to Plus Jakarta Sans and every heading from Georgia to Fraunces. It is a design decision,
not a build fix, so it is Rishi’s call and is left out of this commit.

**Re-downloading the fonts**, if the weight range or subset ever changes: request the
variable range from the css2 API with a desktop browser User-Agent (it serves ttf to
anything else), keep only the `/* latin */` blocks, and save one woff2 per style, e.g.
`https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:ital,wght@0,400..800;1,400..800`.

---

## 2026-10-03 · City/state gate, and 22 universities filed under the wrong region

**The gate.** `scripts/check-city-state.mts` blocks a location field in `lib/data.ts` that
is not a location. Wired into pre-commit.

**What blocks and what is only tracked.** A FALSE value always blocks: "Online" is not a
place, "UTTAR PRADESH" is not how the field is written anywhere else, "Punjab 144411"
carries a PIN code, "Block 32" is an address fragment, and a region contradicting its own
state is wrong whichever one you believe. An ABSENT value does not block, because there is
no city source: Supabase has a city for 1 of its 124 rows and nothing else in the repo
carries one. 43 records have no city and 2 have no state, and those counts are ratcheted
through `data/city-state-baseline.json` so absence can shrink but never grow. Inventing a
city to satisfy a gate would be worse than the gap.

**Writing it found a second fault.** Region is derivable from state, so the gate checks the
two agree. They did not, on 22 records. Twenty of those were the ones whose state had been
the string "Online" and whose region was left on the default "Central", so seven Gujarat
universities, five Karnataka and three Tamil Nadu were filed under the Central filter on
`/universities`. Two more were plain errors: BITS Goa marked South, Jammu marked South.
All 22 now derive from state, and the drift gate immediately caught the mirror going stale
on the same field, which is the second time this week it has earned its place.

**Proven against injected defects**, nine of them, one per rule plus the ratchet: state
"Online", uppercase state, PIN-suffixed state, city "Online", city as a region label, city
as an address fragment, region contradicting state, region outside the vocabulary, and a
city going missing. All nine rejected, then restored and confirmed green.

**Still open.** 43 records have no city and SGT and Alva’s have no state. The gate stops
that growing; filling it needs a pass against the universities’ own portals.

---

## 2026-10-03 · City and state were junk on half the database, and I had the mirror backwards

**The shape of it.** 74 of 143 records carried a city or state that was not one. Twenty had
`city` and `state` set to the literal string "Online". Thirty-one had an uppercase state
("UTTAR PRADESH"). Five had a PIN code welded on ("Punjab 144411"). Three had an address
fragment as the city ("Block 32", "Sector 7", "NH-95"). One had a city in the state field
(Vels: state "Chennai", city "Pallavaram").

**Why it was not cosmetic.** `app/universities/[id]/page.tsx` built schema.org PostalAddress
from these. When the city was "Online" it fell back to `u.name.split(' ')[0]`, so GLS
published `addressLocality: "GLS"` and SGT published `"SGT"`: a fabricated locality, in
structured data, on the field search engines read for location. The region fallback was
`'India'`, which is a country. Both now omit the field instead, and the visible Location
card and table row hide themselves when there is nothing to show.

**States: fixed from sources, in that order.** Deterministic normalisation (case, trailing
PIN, "&" to "and") resolved 51. The Supabase `universities` table resolved 19 more, but
only after switching from a name match to `scripts/lib/supabase-uni-map.mjs`, the repo's
hand-verified slug map: the naive join found 11. One came from the university's own name
("Central University of Himachal Pradesh"). Vels was a field mix-up, and Chennai being in
Tamil Nadu is not new information. That left two, SGT and Alva’s, both genuinely absent
from Supabase and from the UGC-DEB CSV, so their state is now empty rather than "Online".

**Cities: no source exists, so none were invented.** Supabase has a `city` column populated
for 1 of its 124 rows. Nothing else in the repo carries one. The junk values were cleared.
43 records now have no city, which is incomplete; "Online" was false.

**The correction this entry is really for.** Yesterday I excluded `city` from
check-data-slim-drift and wrote in its header that the mirror held the better value,
because the master had been cut to "Block 32" where the mirror read "Phagwara". I checked
two records and generalised from them. Counting all 143: **134 of the mirror’s cities were
region labels** ("North India", "Central India", "West India") while the master held the
real city, Bangalore, Dehradun, Gangtok, Pune. The master wins 98, the mirror wins 2, 43
have neither. So every university card on the site has been showing a compass direction
where a city belongs.

Merged best-of-both into both files, 4 writes to the master and 118 to the mirror, and
`city` is now enforced by the drift gate like the other mirrored fields. The header comment
there now records the count rather than the two examples.

**Verified.** Re-audit shows no false city or state left, only absent ones. Schema checked
on the rendered pages: GLS now emits Gujarat with no locality, UPES emits Dehradun and
Uttarakhand, SGT emits only the country. The drift gate passes with 13 mirrored fields, and
the full pre-commit suite is green.

**Still open.** SGT and Alva’s have no state, and 43 records have no city. Those want a
pass against the universities’ own portals. Nothing gates a city or state being junk in the
first place, which is how "Online" survived; the audit used here is a few lines and belongs
in pre-commit next.

---

## 2026-10-03 · Clone gate, and a sitemap page every build was deleting

**Two separate things, one of them urgent.** Rishi reported a failed deployment mid-task.
The build reproduces clean locally, exit 0, so it is not a compile error and I could not
reproduce the failure. What reproducing it did turn up is below.

### Every build since 28 September deleted /methodology from the sitemap

Two scripts write `lib/data/valid-urls.json`, in order: `build-valid-urls.js`, then
`backfill-manifest-from-data.js`, which rebuilds the file from the manifest. Each carried
its own copy of the static-page list. `/methodology` was added to the first copy on
2026-09-28 and not the second, so every build wrote a sitemap containing the URL and then
immediately rewrote the file without it.

Nothing gave it away. The page exists at `app/methodology/page.tsx`, is linked from the
footer and from `/best-online-mba-india`, and sets its own canonical, so it looked healthy
from every direction except the sitemap. It is also the page the site is most likely to be
cited for: the comment added beside it records a Perplexity test that cited EdifyEdu on
verification method rather than on any recommendation.

The list now lives once, in `scripts/lib/static-urls.js`. Verified by running the prebuild
chain a step at a time: before the fix the URL survived three steps and vanished at the
fourth; after it, it survives all seven, and the regenerated file is content-identical to
the committed one at 2845 URLs with nothing lost or gained. Only sort order still differs,
which the sitemap does not care about.

### The clone gate

`scripts/check-cloned-programme-block.mts` blocks one university’s programme data being a
copy of another’s. `check-duplicate-tagline` only ever saw the tagline half of that defect.

**Counting shared values does not work.** 55 universities share one MCA recruiter list and
18 share one MA specialisation list: those are seed defaults. Raw overlap also puts
lovely-professional and symbiosis at four shared values, but their specialisations and fees
differ and all four matches are generic recruiter names, job titles and a salary band. Not
a clone.

So fields are weighted. STRONG is `specs`, `syllabus` and the three `edify*` lists, what a
university actually teaches; two institutions independently writing the same list of five
or more is not credible. WEAK is `topCompanies`, `roles`, `avgSalary`, `fees`, `duration`,
`internshipType`, which repeat legitimately across the sector. A pair fails on two or more
shared STRONG values. Weak-only overlap is reported as a note and never blocks, so the
Chitkara, GLS and SGT recruiter-list cluster stays visible without being asserted as a
clone. Any value held by five or more universities is skipped before pairing.

**It found two pairs, and one of them was new.** GLS and SGT, already known. And
**amity-university-online and gla-university-online**: GLA still carries Amity’s
specialisation lists for BBA, BCA and B.Com, and its role lists for four programmes. Only
the tagline half of that was visible yesterday, and replacing the tagline left the rest in
place. The direction is known here, GLA is the copy, but GLA’s real specialisations have
to come from its own portal, so both pairs are recorded in
`data/cloned-programme-allowlist.json` rather than guessed at.

**Proven against injected defects**, not just observed green: a clone injected by copying
two of one university’s specialisation lists onto another is rejected; generic-only overlap
stays a note; site-wide templates are skipped before pairing; and the file restores clean.

**Guarded by.** Itself. Still unguarded: `city` and `state` set to the literal string
"Online" on both GLS and SGT, which is junk data that no check looks at.

---

## 2026-10-03 · Duplicate-claim gate, and the hole it found in yesterday’s gate

**The gate.** `scripts/check-duplicate-tagline.mts` blocks a university-specific claim in
`lib/data.ts` being carried by more than one university. A shared claim is false for at
least one of them, and false in the voice of a site whose entire position is that its
numbers can be trusted. Wired into pre-commit.

**The distinction it has to make.** 77 records share a generic fallback, "NAAC A+
accredited, UGC DEB approved online programs" or "Tamil Nadu university with online
programs". Those restate fields already on the record and carry no claim, so they are
allowed by pattern. Everything else that repeats is a copy.

**Scope narrowed after measuring.** The first run also checked `careerOutcome` and
reported 10 shared values. Every one turned out to be a statement about a degree type
rather than an institution: "BA is valid for most government jobs and civil services"
across 9 records, "UGC-DEB entitled M.Com, valid for commerce and finance roles and for
NET eligibility" across 3. All true of all of them. The specific form of that field is
built as "UGC DEB approved MBA from {name}", which contains the university name and so
cannot collide. Including the field added noise and no signal, so it is excluded and the
header says why.

**What it found, and why it is worse than a shared tagline.** One hit:
`gls-university-online` and `sgt-university-online` share "Minor in AI in Business (GenAI
for Finance) in every MBA; EY DS track available as upgrade; 500+ recruiters incl.
Google". Pulling both records up, the duplication is not limited to the tagline. They
carry the identical MBA block, the same eight specialisations, the same topCompanies list
ending "500+ recruiters", and both have `city` and `state` set to the literal string
"Online". GLS is in Ahmedabad and SGT is in Gurugram. One record was cloned from the other.

Nothing in the data says which one the EY and Google claims belong to. Guessing would put
a false claim on a real university, which is exactly what GLA’s copy of Amity’s tagline
already did, so it is recorded in `data/duplicate-tagline-allowlist.json` with the full
finding and left for Rishi. One of those records needs rebuilding from the university’s
own portal, not editing.

**The hole this opened in yesterday’s truncation gate.** Reading the GLS and SGT records
showed a `careerOutcome` reading "UGC DEB approved MBA from SGT University (Centre for
Distance", then a dash, then "recognised for corporate hiring." The gate shipped yesterday
passes it. R1 wants a dangling connective and "Distance" is a complete word. R2 wants a cut
form of a word in the record’s own name, and "SGT University Online" contains no
"Distance...". R3 only looks at the very end of the value. The unbalanced bracket is the
only signal, and that was the FIRST sweep’s rule, which I dropped when writing the gate.

Added back as R4. It immediately found **86 strings** the shipped gate was passing: 79
`careerOutcome` values rebuilt from each record’s own name, and 7 more truncated taglines.
Keep all four rules: each catches a cut the other three cannot, and every version of this
detector that dropped one reported a clean result that was false.

**Both gates proven against injected defects, not just observed green.** R4 rejects a cut
inside a parenthetical; the duplicate gate rejects a specific claim copied onto a second
university; and it does not fire on the 77 generic fallbacks.

**Open for Rishi**, now 17 truncated taglines in the allowlist rather than 11, plus two
superlatives the data does not support, both noted inside their allowlist entries so they
travel with the text: Amity’s "ONLY QS-ranked online MBA in India", contradicted by the 36
records carrying a `qsRank`, and Chandigarh’s "India’s ONLY online MBA with Triple
Industry Certification", which nothing in `lib/data.ts` supports.

**Verified.** Both gates green, the full pre-commit suite, and the Parul and SGT pages now
render complete career lines with no console errors.

**Guarded by.** Each other, in effect: the duplicate gate found the truncation gate’s
blind spot. Still unguarded is a whole programme block being cloned between records, which
is the actual GLS and SGT defect and which a tagline check only hints at.

---

## 2026-10-02 · Truncation gate, and the 120-character cut it exposed

**The gate.** `scripts/check-string-truncation.mts` blocks a string in `lib/data.ts` that
was cut off mid-sentence. These render verbatim on university pages, in the description
block, the per-programme career line and the hero tagline. Wired into pre-commit.

**Three rules, each earning its place from a cut the previous version missed.**
R1 flags a sentence ending on a word that cannot end one ("...Institute of Science and.").
R2 flags a token that is a cut form of a word in the same record's `name` ("Technolog"
against "Technology"), before any terminator rather than only before a full stop, because
all 75 of the `careerOutcome` cuts sit before a dash. R3 flags a value that just stops on a
one or two letter stub ("...Business Analytics & A"). A token preceded by a dot is skipped
throughout, or every value ending "...at deb.ugc.ac.in." trips R1 on the final ".in.".

**Proven before it was trusted, because four earlier detector versions each reported
clean and were wrong.** Five behaviours tested: R1, R2 and R3 each rejected an injected
instance; R3 was re-tested in isolation after the first attempt turned out to be caught by
R2 instead; and a stale allowlist entry is reported without failing the build. Then
restored and confirmed green.

**What R3 found that nothing had seen before.** Taglines were cut at a hard 120
characters on import. 26 records sit at exactly 120. Eleven of them still end mid-word and
are visible to a reader; the other fifteen happen to land on a word boundary, so they read
fine but silently lost whatever came after. The eleven visible ones are editorial and the
missing half cannot be reconstructed from the record, only invented, so they are listed in
`data/string-truncation-allowlist.json` with a reason each. That file is a to-do list, not
a set of exemptions, and the gate reports entries that stop matching so they get removed.

**A content defect the same probe turned up, and this one was fixable.** Scanning for
duplicate taglines showed `gla-university-online` carrying Amity's tagline verbatim:
"ONLY QS-ranked online MBA in India offering 19 specialisations". GLA has no `qsRank` at
all and 16 MBA specialisations, so every claim in that sentence was false for it. Replaced
with the site's own default for a NAAC A+ university, which 16 other records already use
and which is true.

**Two things left for Rishi, both flagged rather than guessed.**

Amity's own tagline claims "ONLY QS-ranked online MBA in India". `lib/data.ts` contradicts
it: 36 universities carry a `qsRank`. The superlative is false on the site's own data and
needs removing by whoever rewrites the truncated line. Noted inside that allowlist entry so
it travels with the text.

`gls-university-online` and `sgt-university-online` share a tagline word for word ("Minor
in AI in Business (GenAI for Finance) ... 500+ recruiters incl. Google"). Both are NAAC
A+ with 8 MBA specialisations and no NIRF rank, so nothing in the data says which one owns
it. Unlike the GLA case there is no basis to pick, so it stays as found.

**Verified.** Gate green at 11 found and 11 allowlisted, the full pre-commit suite, and
`/universities/gla-university-online` on the dev server no longer renders any QS claim,
with no console errors.

**Guarded by.** Itself, for new truncations. Nothing yet guards a tagline being copied
verbatim between two universities, which is how the GLA claim arrived; a duplicate-tagline
check is the obvious next one.

---

## 2026-10-02 · The data-slim gate, and the 89 truncations my first sweep missed

**The gate.** `scripts/check-data-slim-drift.mts` compares `lib/data-slim.ts` to
`lib/data.ts` on the twelve fields where mirroring is the contract, and fails on a
missing record, an extra record, or any value that disagrees. Wired into pre-commit.

**Its scope is narrower than "every shared field", on purpose.** Five shared fields are
curated in the mirror rather than copied, and enforcing them would be a regression:
`city` (120 differ, and the mirror is the better value: the master holds raw address
fragments like "Block 32" and "Sector 7" where the mirror holds "Phagwara" and "Navi
Mumbai"), `approvals` (136 differ, mirror abbreviated or absent, and its strings predate
the NIRF-category rule, so that one wants its own cleanup), `qsRank` (36 differ, all
present in the mirror and absent from the master, so the mirror is the only source),
`logo` (separate slim-logo pipeline) and `color` (presentational).

**Proven before it was trusted.** Four injected defects, one per class: a removed record,
a `programs` array missing a programme, a `programs` array carrying one the master does
not have, and a reintroduced truncated name. All four failed the gate with the right
diagnosis, including "hidden from hubs" against "falsely listed on hubs". It then caught a
real one unprompted: two names I had just fixed in the master left the mirror stale, and
the gate flagged it before I noticed.

**Which is also the correction this entry exists for.** Yesterday I reported the
truncated university strings as fixed. They were not. That sweep detected truncation by
unbalanced parentheses, so it only ever found a cut that happened to land inside a
bracket. Everything cut in open prose passed:

- 14 more `description` values, including Sathyabama's "...from Sathyabama Institute of
  Science and Technolog." which was still live on the page a day after I said it was fixed.
- 75 `careerOutcome` values across 40 distinct strings. Each one cut the university name
  mid-word just before the dash, so the page read "UGC DEB approved MBA from Koneru
  Lakshmaiah Education Foundat", then a dash, then "recognised for corporate hiring."
  These render on the programme block of each university page.
- 2 more `name` values, "B.S. Abdur Rahman Crescent Institute of Science and Online" and
  "Sri Ramachandra Institute of Higher Education and Online". Both end on "and" with no
  bracket anywhere, so neither could ever have been caught by the first detector. Worse,
  rebuilding a description from a truncated name just reproduces the truncation, which is
  what happened on the first repair attempt here.

**The detector needed four passes, and each failure is the same shape.** v1 keyed on
bracket balance. v2 looked for a sentence ending on a dangling connective or a cut word,
and flagged three complete descriptions because they end "...at deb.ugc.ac.in." where the
final ".in." reads as a sentence ending on "in". v3 skipped dotted tokens but only looked
for a cut word before a full stop, so "Crescent Institut", cut before a dash, survived. v4
checks a cut word before any terminator. Each version reported a clean result that was
not clean, which is the real lesson: a detector that finds nothing is not evidence of
nothing until it has been shown to find something.

Names taken from Supabase `universities.name`. The rebuilt `careerOutcome` strings also
drop their em dash, so the em-dash baseline fell rather than held.

**Not fixed, needs Rishi.** Three taglines are truncated and editorial, so the missing
text cannot be reconstructed, only invented:
- `jain-university-online`: ends "Business Analytics & A"
- `mangalayatan-university-online`: ends "Organization Development + Group and"
- `nmims-online`: ends "SCM, IS for Managemen"

**Verified.** Gate green, `check-em-dash`, `check-em-dash-baseline`, `verify-fees`,
`tsc --noEmit`, and the full pre-commit suite. On the dev server the Sathyabama, UPES and
B.S. Abdur Rahman pages now render complete sentences in both the description and the
programme block, with no console errors.

**Guarded by.** `check-data-slim-drift` for the mirror. Nothing guards string truncation
in `lib/data.ts` itself; the v4 rule is cheap and belongs in pre-commit next, which would
have caught all 89 of these on the day they were imported.

---

## 2026-10-02 · Two hubs carried a blog post's title, and the count that exposed it was wrong

**The collision.** `/programs/mba` and `/programs/bba` each carried a "Best Online X
Colleges in India 2026" title, added together on 2026-07-04 in a43d7e7. Each is the
opening of a blog post that already targets that phrase. Two URLs with the same title
compete for one SERP slot and read as duplicate content, which is why the repo already
gates it for specialisation pages.

**Equally important, each title contradicted its own page.** The hub H1 says "Online MBA
in India 2026: N UGC-Approved Universities Compared" and the page is a filterable database
of every UGC-DEB university. The title promised a curated best-of. The page did not
deliver what its title sold.

**Two hypotheses I had to abandon, recorded so they are not re-run.**

The hub fell from position 6.93 to 11.90 across the GSC windows either side of the
retitle, which looked causal. It is not. Every programme hub fell in that period and the
ones the commit did not touch fell further on average, 21.51 places against 14.13. A
control group is cheap and it killed the story I wanted to tell.

Separately, September's `Queries.csv` shows almost no impressions on "best online MBA"
phrasing, which read like proof the cluster is dead. `Queries.csv` is capped at 1,000 rows
and covers 36.5% of that window's impressions, so it cannot prove a negative. `Pages.csv`
covers 99.8% and is safe to reason from. The decision rests on the duplicate title and the
title/content mismatch, both provable from the code and neither needing traffic data.

**Resolved by intent, not by merge or canonical.** Pointing the hub's canonical at the
blog would drop a 121-university tool from the index in favour of a 15-university article;
they answer different questions. The blog keeps "best online MBA colleges in India", where
it holds the best position of the three. The hubs take "online MBA in India" and "online
BBA in India", which their H1 and content already answer and which no title owned.
`/best-online-mba-india` needed nothing: 30bcb4c had already re-angled it onto NIRF
Management.

**The guard, and why its first version was useless.** `scripts/check-hub-blog-title-collision.mts`
compares hub titles to published blog titles. The first version scored Jaccard similarity
over word sets. It flagged 13 specialisation hubs whose titles merely share the template
vocabulary ("online mba in X management universities fees") and it missed both real
collisions, which differ in their tails and scored 0.50. What collides in a SERP is the
leading phrase a reader sees first, and word order is exactly what a set comparison throws
away. Rewritten to measure the shared leading phrase: it now flags the two real pairs and
nothing else. Hub SEO overrides moved to `lib/program-hub-seo.ts` so the gate can import
them rather than parse a route file.

**What putting a number in a title exposed.** `/programs/mba` rendered three different
counts at once: title 121, H1 119, comparison table 121. `lib/data-slim.ts` is
hand-maintained, the client hubs filter on its `programs` array, and 32 of its records
disagreed with `lib/data.ts` while one university was missing from the file entirely.

Both directions were live defects. Missing entries hid universities from their own hub:
the MCA hub was short 8, and SPPU and IIIT Bangalore were absent from the MBA hub. Extra
entries advertised programmes that do not exist: SASTRA was listed on the MCA hub when it
offers MBA only, Chitkara on the B.Com and BCA hubs. IIIT Bangalore was tagged MCA when it
offers MBA, so it was simultaneously missing and wrong.

All 32 synced from `lib/data.ts`, the documented master, and the missing record added.
`UNIS_SLIM` is now 143 records with zero drift. Had I taken the H1's 119 at face value I
would have shipped the stale number in a title and called the job done.

**Verified.** The full pre-commit suite, plus `check-university-count`,
`check-programme-allowlist-resolver` and `check-sitemap-vs-404` run early because
`slim.programs` decides hub membership. On the dev server all three counts on
`/programs/mba` now read 121, `/programs/mca` reads 74 throughout, and the four pages in
the cluster carry four distinct titles with no console errors.

**Guarded by.** `check-hub-blog-title-collision` in pre-commit. `lib/data-slim.ts` still
has no generator and no gate, so it will drift again; a `--check` against `lib/data.ts`
is the obvious next one.

---

## 2026-10-02 · A keyword export exposed a wrong NIRF rank and 33 truncated records

**What prompted it.** Rishi supplied a 108-keyword export for the online-degree
market and asked for the gaps to be filled. Mapping every keyword to an owning
URL (`audits/keyword-map-2026-10-02.md`) showed the gap was almost closed
already: 70 of 71 in-scope keywords had a page. Auditing the data behind those
pages is what turned up the actual defects.

**SRMIST claimed NIRF #18 in the University category. Its rank is #11.**
The `tagline`, the `description` and the M.Com `careerOutcome` all said #18. The
record's own `nirf` field said 11, and Supabase `accreditations` says University
rank 11 of 200. #18 is SRMIST's Medical and Architecture rank, so the number was
real and attached to the wrong category. That is the failure mode the
"NIRF ranks must state category" rule exists to stop, and here the category *was*
stated, which made the claim read as carefully sourced rather than wrong.

**Why it was worth a sweep rather than a one-line fix.** A rank that contradicts
its own record cannot be caught by reading the page, because the page renders the
field and the prose in different components. A scan of all 143 records comparing
NIRF numbers in `tagline`/`description` against `nirf`/`nirfMgt`/`nirfEng` found
this was the only contradiction in the database. Worth knowing; the scan is in
the session notes and is cheap to re-run.

**29 descriptions and 4 names were truncated by an importer.** Every broken
description followed one template and was cut at exactly 45 characters after
"UGC DEB approved online programs from ", leaving a half word and an unclosed
bracket: "from NMIMS (Narsee Monjee Institute of Management. NAAC A++
accredited." It renders twice as body text on every affected university page.
Four `name` values were cut the same way, so "Sathyabama Institute of Science and
Technology (Centre Online" appeared in every heading, title and FAQ on that
university's pages. Names were rebuilt from Supabase `universities.name`, which
also corrected VIT: the record said "Vellore Institute of Science and Technology"
where VIT is "Vellore Institute of Technology".

**One thing that went wrong while fixing it, recorded because it was invisible.**
The first repair script scanned record boundaries from the pristine source but
mutated the source inside the same loop. Every replacement shifted the offsets,
so each record read the *next* record's name: SASTRA was given D.Y. Patil's name,
Anna University was given Vels. It wrote 26 wrong descriptions and reported
"applied 35/35". Reverted with `git checkout` and rewritten to plan all edits
against the pristine source and apply them in one pass, with each needle required
to match exactly once. A bulk data edit that reports success is not evidence it
paired the right values.

**New content: `/blog/srm-online-mba-2026`.** The only in-scope keyword with no
page was `srm online mba` (1,300/mo, KD 6), and the reason it is worth a page is
that two different universities answer to it. SRM Institute of Science and
Technology (Tamil Nadu, NAAC A++, NIRF #11 University, #56 Management) and SRM
University Sikkim (Gangtok, NAAC A+, no NIRF rank) are separate legal entities
with separate UGC-DEB entries and a fee gap of roughly 36% to 72%. Neither is
listed on the DEB register under "SRM": they appear as "Shri Ramasamy Memorial
University" and "S.R.M. Institute of Sciences and Technology", so an applicant
who checks the register for "SRM" finds nothing and concludes wrongly.

**Verified.** `verify-fees`, `check-em-dash`, `check-blog-fees` (new post
baselined at 0), `tsc --noEmit`, and the post rendered on the dev server with the
table, Quick Facts card and hero image correct and no console errors. The NIRF
fix was confirmed on the live SRMIST page, which now renders "NIRF (Uni) #11".

**Guarded by.** Nothing new. The NIRF prose-versus-data check and the
truncated-string check are not in `.husky/pre-commit`; both are cheap and should
be, and that is the obvious follow-up.

---

## 2026-10-01 · Shoolini review counted patent filings as patents granted

**The post said "the university has generated over 1,500 patents".** It did not.
That figure belongs to Shoolini's *filing* count, which covers utility patents,
designs, copyrights and trademarks, and which the university's own press history
tracks past 1,000 (2022) and past 2,000 (2026). A filing is an application. It
proves intent, not an award. Printing it as "generated patents" turned the
university's marketing arithmetic into an Edify factual claim in Edify's voice.

**Why this one was liftable.** It sat in the Accreditation and Recognition
Profile section, the block an assistant quotes when asked "is Shoolini research
active", directly beside verified NAAC, NIRF and UGC-DEB values. A wrong number
with correct neighbours reads as verified.

**The fix separates the two counts instead of deleting the claim.** Rishi
supplied the grant-side figure, 650+ granted or registered intellectual
properties. The paragraph now states that, states the #3-in-India-for-patents-
filed claim as the university's portal claim rather than ours, and tells the
reader the two numbers measure different things. Checked against
`shoolini.online`, which asserts "#3 IN INDIA PATENTS FILED" with no number
attached, so the rank is quotable only as their claim.

**Not verified, carried as the university's figure:** the 650 count itself.
`shoolini.com` was unreachable from this environment, and no approved source
states a grant total. If it is ever restated, restate it as a grant count, never
as a filing count.

**What guards it:** nothing automated. `lib/blog.ts` has no fact gate, and the
only other patent mentions in the file are the Parul NIRF Innovation note and an
NIRF parameter gloss, both correct. Grep `patent` in `lib/blog.ts` before
adding a research claim to any review.

---

## 2026-09-29 (seventh) · /best-online-mba-india ranked by the wrong NIRF table

**The page promising a ranked online MBA list was ordered by the NIRF University
table, and never said so.** `/best-online-mba-india` carried a hand-typed
`TOP_10` array with zero imports from `lib/data.ts`. Its defects, all visible to
a reader and all quotable by an assistant:

| Defect | Evidence |
|---|---|
| Ordered by the wrong NIRF table | Top 3 were MAHE, Amrita, SRM: University #3, #8, #11. By Management they are #39, #26, #56, so none belongs in the top 3 |
| Ranks printed with no category | Badges read `NIRF #8`, `NIRF #11`. One entry said `NIRF Mgmt #24`, so the page was inconsistent with itself |
| Fee claims from placeholder data | `from Rs 60K` in the verdict box and FAQ. Rs 60,000 is the floor of a range shared across universities, suppressed by rule 4d two commits earlier |
| A fee contradicting the database | LPU quoted at Rs 1.46L; `lib/data.ts` says Rs 1.61L to Rs 2L |
| A lapsed NAAC grade printed as current | Chandigarh University A+, cycle expired 2026-09-09 |
| Unsourced salary figures | Six specialisation cards carried salary bands traceable to no source |
| `dateModified` five months stale | `2026-04-16`, unchanged while the underlying data moved |

**Why the FAQ mattered most.** FAQ answer 1 listed University ranks as the
answer to "which is the best online MBA", inside `FAQPage` schema. That is the
single most liftable block on the page: an assistant quoting it would have
repeated a management ranking built from the wrong table, attributed to us.

**The fix is structural, not editorial.** New `lib/best-mba-ranking.ts` derives
the ranking at build time from `lib/data.ts`, the Supabase NAAC snapshot and
`getDisplayFee`. Nothing on the page is hand-typed any more, including the
verdict box, the budget bands, the use-case picks and the FAQ answers, so a
sentence cannot drift from the table beneath it.

Inclusion rule, stated on the page: the university holds a NIRF **Management**
placement. **23 of 121.** The other 98 are named as unranked in that category
rather than quietly omitted, because omission reads as a quality judgement.

Suppression carried over from the fee work. Of the 23 rows: **20** print a NAAC
grade (1 lapsed, 2 absent from Supabase), **20** print a fee (3 publish none).
Blank cells say "Not published" or "Cycle expired" rather than guessing.

**Two things removed rather than fixed.** Per-university EMI figures are gone:
`emiFrom` shows the same duplication fingerprint as the placeholder fees, with
seven universities on exactly 2500. The page links to the EMI calculator and
explains the omission. Specialisation salary bands are gone, being unsourced.

**A data defect surfaced, not fixed.** Rendering `city` exposed junk in
`lib/data.ts`: Amrita and Jamia Millia Islamia carry `"Online"`, Chandigarh
University `"NH-95"`, LPU `"Block 32"`. The module drops any value containing a
digit or naming a delivery mode. The underlying records are still wrong.

**Verified on the rendered page, not the source.** A previous section of work
shipped a table into unreachable code that compiled and typechecked and rendered
nothing, so source inspection is not evidence. Fetched the live HTML and
asserted against the table block only, to keep the RSC flight payload from
doubling the counts: 24 `<tr>` (1 header + 23 rows), 23 `scope="row"`, exactly
3 "Not published", 1 "Cycle expired", 2 "Not verified", 3 "Not ranked". Parsed
all 7 JSON-LD blocks: `ItemList` carries 23 items with `numberOfItems` agreeing,
`Article.dateModified` is 2026-09-29. Confirmed the strings `Rs 60,000`,
`Rs 60K` and `Rs 1.46L` no longer appear, and that the only bare uncategorised
`NIRF #n` left is a deliberate quotation illustrating the problem. Full
pre-commit suite passes; `check-em-dash-baseline` recorded a drop for this file.

**What still guards nothing.** No gate asserts that a NIRF rank stated anywhere
in page or blog copy names its category. This page is now derived so it cannot
regress, but the 225 blog posts are not, and eight of them carried a false NIRF
claim as recently as the previous commit.

---

## 2026-09-29 (sixth) · I published a false NIRF claim in eight posts

**My error, found while working on something else.** Eight of the sixteen posts
written on 2026-09-28 stated "No NIRF Management placement on record" for a
university that holds one:

| University | Actual NIRF Management rank | Posts affected |
|---|---:|---:|
| MAHE Online | **39** | 6 |
| Manipal University Jaipur Online | **81** | 3 |

Nine table rows across eight distinct posts, one post carrying both.

**How it happened.** The tables were built on 28 September from a Supabase query
whose printed output did not include every university. Absence from that output
was read as absence of a rank. `lib/data.ts` carries `nirfMgt: 39` and
`nirfMgt: 81` for these two in plain sight, and a single check against it would
have caught both. This is precisely the failure
`project_supabase_accreditation_gap` exists to prevent: joining Supabase without
care produces confident wrong answers, and I produced two.

**Direction of the error matters but does not excuse it.** The claim understated
two universities rather than overstating them, which is the less harmful
direction. It is still a false statement of fact, published nine times, on a
site whose whole argument is that it does not do this, and two days after
shipping a methodology page promising that every NIRF rank names its category
and that absence is stated only where it is real.

**How it was found and fixed.** A row-level audit parsing every `<tr>` and
resolving the first cell to a university record. The first pass used a looser
regex, reported three different universities, and was wrong: it missed MAHE,
which was already confirmed by hand, and flagged Symbiosis and Alliance, which
were mis-resolutions. Only the row-level parse agreed with manual checking.
Corrected to "NIRF Management category rank 39" and "... rank 81". Re-audit
reports 30 remaining absence claims, all of them true.

**What is not fixed.** There is no gate on NIRF claims in blog content. The 30
surviving "no placement" claims were verified correct today, but nothing stops
the next one being wrong. A `check-nirf-claims` gate along the lines of
`check-coupon-claims` would close it.

---

## 2026-09-29 (fifth) · The fees cannot be fetched, so the queue is the deliverable

**What was asked.** Fix it, meaning go and get the real fees behind the 242
suppressed rows.

**What was tried first.** Official university portals are an approved source, so
fetching them is legitimate research rather than guesswork. Two of the three
highest-demand targets were attempted:

| University | Fee-query impressions, 28d | Result |
|---|---:|---|
| Galgotias | 2,778 | Portal reachable, **publishes no fee anywhere on the site** |
| Jamia Hamdard | 429 | `jamiahamdardonline.in` **does not resolve** |

The existing worklist already records the same outcome for GLS on 2026-08-04:
"does not publish any fees on its website". **Many Indian online university
portals gate fees behind an enquiry form.** That is not an obstacle to work
around, it is the reason the placeholder ranges were authored in the first
place, and it is why `feedback_fee_workflow` says to ask Rishi rather than
block.

**A related gap found on the way.** `lib/data.ts` holds **no official portal URL
for any of the 143 universities**. A site whose method page commits to
verifying against official portals does not record which portal. Every
verification therefore starts with a search. Not fixed here, but it is a
cheap piece of data that would make every future fee check faster.

**What was built instead.** `data/fee-backfill-worklist-4d.csv`, generated by
`scripts/build-fee-backfill-worklist-4d.mjs`. Every one of the 242 suppressed
rows, in the same column shape as the existing worklist so it drops into the
established ingest (fill `VERIFIED_TOTAL_FEE`, edit `lib/data.ts`, validate with
`apply-verified-fees.mjs`).

**The ranking is the point.** Rows are ordered by how many people actually
search that university's fees, from the 28-day GSC export. That turns an
unusable pile into a short call list:

- **242** suppressed rows in total
- **53** of them sit on a university with any fee-query demand at all
- **18** universities cover all 53
- Those 18 carry **4,498** fee-query impressions between them

So the ask is roughly eighteen conversations, not two hundred and forty-two. The
top five alone (Galgotias, Uttaranchal, Jamia Hamdard, Maharshi Dayanand,
Bangalore University) account for 3,980 of the 4,498 impressions across 15 rows.

The remaining 189 rows sit on universities nobody searches fees for. They should
stay suppressed indefinitely rather than being filled with anything approximate.

**One thing worth noticing in the data.** EdifyEdu's own blog is titled "Jamia
Hamdard Online MBA Fees 2026: ₹1.03L" while the university page shows the
shared placeholder. The post cites no university portal for that figure, only
the four approved regulator sources, so it cannot be promoted into `lib/data.ts`
as a verified fee without a source. It is a lead for the call, not an answer.

---

## 2026-09-29 (fourth) · Nine universities were quoting the same fee, and it printed as each one's price

**What was asked.** Do the fee cluster.

**What was already handled.** `audits/placeholder-fee-cluster-2026-08-21.md`
enumerates 125 programme rows across 59 universities that `getDisplayFee`
already suppresses. Those are parked pending portal research and were not
touched. The problem this entry is about is a different set: fees that
**passed** every guard and printed as real prices.

### The fingerprint the width test could not see

`SUSPICIOUS_RANGE_RATIO` rejects a range wider than 3x its own floor. That
measures how wide a range is, which is not what gives a bulk-authored
placeholder away. Duplication is.

| Authored string | Universities carrying it, byte-identical | Programme | Ratio |
|---|---:|---|---:|
| `₹48K – ₹117K` | **9** | MA | 2.4x |
| `₹60K – ₹200K` | 8 | five programmes | 3.3x |
| `₹37K – ₹90K` | 7 | BA | 2.4x |
| `₹41K – ₹99K` | 7 | B.Com | 2.4x |
| `₹52K – ₹125K` | 7 | M.Com | 2.4x |
| `₹75K – ₹180K` | 5 | MBA | 2.4x |

At 2.4x every one of these passed rule 4a and reached the page as that
university's own fee, including in the comparison table on all ten programme
hubs shipped two days earlier. A range is two numbers. Two institutions
independently publishing the same minimum **and** the same maximum is not
plausible, and the raw data confirms it: these are the same string copied down
a column, not nine pricing decisions.

**Rule 4d** suppresses a parsed range that two or more universities claim
identically. Input is `data/placeholder-fee-ranges.json`, generated by
`scripts/build-placeholder-fee-ranges.mjs` and gated in pre-commit. 25 shared
ranges covering 101 programme rows.

### What was deliberately not suppressed

Single values. Thirteen universities print `₹1.2L`, nine print `₹1.5L`, nine
print `₹80,000`. A round number is a plausible thing for many institutions to
charge, and suppressing those would discard real data to remove a coincidence.
124 rows sit on a shared single value and all of them still display. Ranges are
the fingerprint; single values are not.

**Threshold is two, not three, and that was a judgement about harm.**
Suppressing a real fee costs a "Not published" cell and a link to the
university's portal. Printing a placeholder invites someone to plan money
around a number nobody charges. The asymmetry decides it.

### The visible cost, which is real

Total suppressions rise from 163 to 242. The fee column gets much sparser, and
`/programs/ma` is the extreme case: **47 of its 52 rows now read "Not
published"**, against 17 rows that were previously showing a fabricated range.
The table says so itself, since the explanatory note counts its own
suppressions and updates with them.

That is a visible product regression in exchange for not publishing fiction,
and it is worth being explicit that it is a trade rather than a pure win. The
count falls as real fees are researched; `data/placeholder-fee-ranges.json`
names the universities to research, grouped by the placeholder they share.

**The baseline was raised deliberately, not auto-updated.**
`check-fee-baseline` blocks a rising suppression count precisely so this cannot
happen silently. 163 to 242 is recorded in `data/fee-mismatch-baseline.json`
with the reason, in the same style as the rule 4c entry before it.

**One repeat of a known trap.** The edit re-added an existing line containing an
em dash, which made it an added line and failed `check-em-dash`, exactly as on
2026-09-28. Editing a line makes you the author of its existing style
violations. Rewritten, not exempted.

**How it was verified.** `₹48K` no longer appears anywhere in the rendered MA
table. Rule distribution after the change: 4a 46, 4b 39, 4c 78, 4d 79. The gate
was tested by removing an entry from the generated file and confirming exit 1.
Full pre-commit suite passes.

---

## 2026-09-29 (third) · A stale comment produced a wrong conclusion, and /programs/ba

**What was asked.** What is next, fix it.

### The correction first

On 2026-09-28 I recorded, in the fix log, in memory and in the strategy doc,
that `app/sitemap.ts` drops every `/programs/{prog}` hub except
`/programs/mba`, and therefore that nine of the ten comparison tables shipped in
`fa7e62f` were invisible to crawlers.

**That was wrong.** Nine of the ten hubs were already in
`PROGRAMS_INDEX_ALLOWLIST`, already in the sitemap, already emitting
`index, follow`. The tables were landing.

The source of the error was `app/sitemap.ts:141`, a comment reading "only
/programs/mba earns its slot" that stopped being true as the allowlist grew.
I read the comment and did not check the allowlist three lines below it, or
curl the sitemap, either of which would have caught it immediately. A stale
comment is more dangerous than no comment, because it reads as a finding
somebody already made.

The comment now describes what the code does and says explicitly to read the
allowlist rather than the prose. The wrong claim is struck through in the
entries that carry it rather than quietly deleted.

### The one real gap it exposed

Checking properly turned up an inconsistency the wrong belief had been hiding:

| Hub | Table rows | Indexed |
|---|---:|---|
| `/programs/bcom` | 57 | yes |
| `/programs/ma` | 52 | yes |
| `/programs/mcom` | 50 | yes |
| **`/programs/ba`** | **27** | **no** |
| `/programs/msc` | 17 | yes |
| `/programs/bsc` | 2 | yes |

`/programs/bsc` is indexed on a two-row table. `/programs/ba` was noindexed on a
twenty-seven-row one. The allowlist was built on GSC clicks back when these hubs
were thin and BA had nothing to show, and the comparison table inverted that
without anyone revisiting the decision.

`/programs/ba` is now allowed, on content rather than clicks, which is a
departure from every other line in that list and is commented as such. All ten
hubs are now consistent and the `/programs` index itself still correctly
noindexes.

**How it was verified.** `/programs/ba` returns `index, follow` with a
self-canonical and appears once in the sitemap; the sitemap now carries all ten
hubs and still excludes `/programs`. Full pre-commit suite passes.

---

## 2026-09-29 (second) · The page said "Fake? No." about a university under a reported MoE complaint

**How this was found.** Rishi asked what was outranking the verify pages on
their head queries. `mangalayatan university fake` draws 779 impressions at
position 8.46 with **zero clicks**, the worst case in the cluster. Looking at the
actual SERP answered the ranking question and turned up something worse.

**What is on that SERP.** Three YouTube videos, one of them in Hindi, plus
Quora, Wikipedia, a competitor running the identical play
(`verify.exammint.in`, titled "Yes, Mangalayatan University is Real"), and a
news report: ten private universities named in complaints about improperly
awarded PhD degrees.

**The finding.** In December 2024 the Ministry of Education told the Rajya Sabha
that complaints received through the Central Vigilance Commission alleged ten
private universities had awarded PhD degrees improperly. **Mangalayatan
University is one of the ten.** UGC forwarded the complaints to state
governments. Since then Uttarakhand and Madhya Pradesh cleared Quantum and Sri
Satya Sai, and UGC debarred OPJS, Sunrise and Singhania in Rajasthan from
enrolling PhD scholars. **No adverse finding against Mangalayatan has been
reported.**

Our page title said **"Is Mangalayatan University Fake? No. UGC-DEB Approved
2026"**. The H1 and body were fine, since they claim UGC-DEB entitlement, which
is true and checkable. The title answered a broader question than the evidence
supported, on the one university where that gap mattered, and a reader who
searched that phrase because of the news was told nothing about it.

It also explains the ranking. People search that phrase *because of* the story.
A page answering "No" without engaging it does not match the intent, which is
why Google serves video instead.

**Scope checked, not assumed.** All ten named universities were matched against
the 143 in `lib/data.ts` and the 125 verify slugs. **Only Mangalayatan is
affected.** The apparent second hit, "University of Technology", resolved to
Centurion University of Technology and Management, a different institution, and
was not treated as a match.

**What shipped.** `lib/data/verify-advisories.json` plus
`components/verify/VerifyAdvisory.tsx`, rendering directly under the verdict,
above the programme list, because someone who searched "is X fake" needs it
before anything else.

The wording is the work. It names the forum, the date and the route (MoE reply
to the Rajya Sabha, complaints via CVC), states what has been reported since,
says plainly that **no adverse finding has been reported and no action
announced**, separates the PhD matter from the online UG and PG programmes the
page actually covers, says outright that a complaint is not a finding, and gives
a correction address. It is there to inform someone about to pay fees, not to
accuse an institution.

**The title narrows too, and that was not optional.** An advisory saying "under
enquiry" beneath a title saying "Fake? No." would have made the page contradict
itself. Presence of an advisory now suppresses the flat "No" in both title and
meta description. The other 124 pages are untouched and still carry it, verified
against MATS as a control.

**Why this was not done unilaterally.** Publishing a note about a live
allegation against a named institution is an outward-facing call with Rishi's
name on it. The finding was reported with three options and built only after he
chose this one.

**How it was verified.** Mangalayatan returns 200 with the narrowed title and
the advisory rendered; MATS returns 200 with the original title and no advisory.
Typecheck clean, full pre-commit suite passes.

**Left open.** The ranking problem itself is unsolved. The page will rank better
for engaging the question, but the SERP is majority video and this cluster may
need a different format rather than a better paragraph.

---

## 2026-09-29 · 125 good verification pages that nothing linked to

**What was asked.** Start move 5, the community footprint. The research argued
against it, and this is what was built instead.

**Why not the community push.** Three findings, recorded in the strategy doc.
Reddit's AI access is contractual rather than open: robots.txt has blocked
crawlers wholesale since 2024, Google's access runs on a deal worth about 60
million dollars a year and OpenAI's about 70 million, **both expire next year**,
Reddit has discussed not renewing Google's, and Reddit is suing Perplexity over
scraping. So a Reddit mention reaches ChatGPT and Gemini, never Claude or
Perplexity, and rests on arrangements that may lapse inside the payback period.
Neither platform is readable from here either, so any drafted answers would have
been guesses. And nothing gets posted on Rishi's behalf regardless.

**What the data pointed at instead.** The trust cluster, from the 28-day export
to 12 September: `online degree is valid or not` at **position 1.7 with 0 clicks
from 191 impressions**, `mangalayatan university fake` at 380 impressions and 0
clicks, `is manipal university jaipur fake` at 183 and position 3.27. Being the
top answer and earning no click is the citation economy seen from the
publisher's side.

### The recommendation was half wrong, and checking beat assuming

The plan said to make the "is X fake" answer extractable because the site did not
have it in a liftable shape. **It already did.** `/verify/{slug}` has 125
server-rendered pages whose title answers the question directly ("Is Mangalayatan
University Fake? No. UGC-DEB Approved 2026"), whose H1 and lead sentence answer
it again, with NAAC grade and validity, programme counts, named sources and a
commission disclosure. That work was done on 2026-09-14.

Building the recommendation as written would have duplicated an existing asset.
The gap was somewhere else, and only visible by looking:

| Check | Result |
|---|---|
| Verify pages in the sitemap | 125 of 125 |
| Linked from the `/verify` hub | 123 |
| **Linked from anywhere else on the site** | **only `lib/blog.ts`** |

So 125 strong pages sat with no path into them from the university pages, the
programme hubs, or the comparison table shipped the day before. Meanwhile 38 of
the 121 MBA rows in that table printed "Not verified" for NAAC and pointed
nowhere, which reads as "we did not look" rather than "the cycle lapsed and here
is what we did check".

**What shipped.** Every row of the comparison table now carries a "UGC-DEB
verification" link where a page exists, 88 of 121 on the MBA table, and the
"Not verified" cell is itself that link. Chandigarh University, whose NAAC cycle
lapsed on 2026-09-09, now sends the reader from the empty cell to its
verification page.

**The join is the dangerous part.** `/verify` pages are keyed by Supabase slug
and `lib/data.ts` ids do not agree with those: `upes-online` is
`university-of-petroleum-and-energy-studies-online`, and
`manipal-university-jaipur-online` is `manipal-university-online`. A naive join
would send a reader to **another institution's** verification page, which is far
worse than no link. `scripts/build-verify-slug-map.mjs` resolves it once through
`supabase-uni-map` and commits the result, so the render stays pure and the
mapping is reviewable in a diff. 102 of 143 universities map; the other 41 have
no Supabase record, get no link, and are never guessed.

**Guards.** `check-verify-slug-map` blocks drift from either side, and degrades
sensibly without Supabase credentials by checking the committed file is
internally consistent rather than skipping. Tested by pointing a mapping at a
non-existent page and confirming exit 1. All 88 links on the MBA table were
fetched and returned 200.

**What could not be measured, and should not be claimed.** The 13 fake-or-legit
blogs were redirected to `/verify/` on 2026-09-14, and the freshest GSC export
ends 2026-09-12. **Every number quoted above predates the redirect**, so whether
`/verify` is performing is unknown. Pull GSC before drawing any conclusion about
this cluster.

---

## 2026-09-28 (sixth batch) · /methodology, and a regen chain that no longer reproduces its own artifact

**What was asked.** Move 4 of the AI citation plan: publish a dated methodology
page.

**Why this page and not a paragraph in /about.** The Perplexity test of the same
day cited EdifyEdu exactly once, and the citation was on the verification steps
rather than on any recommendation. The site already wins method citations and
had nowhere stating its method. `/methodology` is that page.

**Every number on it is derived at build time.** A methodology page that goes
stale is worse than none, because it is a claim about accuracy that is itself
inaccurate. The page computes its own figures from `lib/data.ts`,
`data/naac-verified.json` and `getDisplayFee`, and currently renders: 143
universities covered, 38 of the 121 online MBA rows showing "Not verified"
rather than a NAAC grade, 2 universities sitting on a lapsed cycle, and 20 of
121 rows printing "Not published" instead of a fee. Those match the comparison
table exactly, because both read the same functions.

**What it commits to in public.** Where each of the four sources is used and for
what. That UGC-DEB entitlement is per university, per programme, per session.
That a NAAC grade is suppressed once its cycle lapses. That every NIRF rank
names its category, with the clinical-institution trap called out. The three
fee checks that cause a figure to be withheld. That no university pays us and
that table ordering is computed with no manual override. And a corrections
policy that says we record the change with its reason rather than editing
quietly.

Linked from the footer sitewide, from the comparison table's source note, and
from the page itself back into the table so a reader can check the claim against
the rows.

### The regen chain no longer reproduces the committed file

Adding a static page means adding it to `STATIC_URLS` in
`scripts/build-valid-urls.js` and regenerating. Project memory recorded the
four-step chain for that and said the correct output is about 1,780 entries.

**Both halves of that turned out to be stale.** The committed
`lib/data/valid-urls.json` holds **2,844** entries. Running all four steps
produced **1,783**, and more importantly introduced a defect the committed file
does not have: `amity-university-online/bca/computer-applications-data-science`
appeared in the sitemap while being a redirect source, which
`check-spec-redirect-health` correctly rejected.

So the chain and the artifact have diverged, and regenerating wholesale would
have dropped roughly a thousand URLs to ship one page.

**What was done instead.** The `STATIC_URLS` addition stays, so a future full
regen keeps the page. The regenerated artifacts were reverted and `/methodology`
spliced into the committed file with a script. The diff reads
`1 file changed, 1 insertion(+)`.

That is not the hand-editing the "never hand-edit this file" rule exists to
prevent: it is scripted, single-line and reviewable, and it is far safer than a
1,000-URL rewrite performed as a side effect of an unrelated task. Memory has
been corrected so the next session does not repeat the regeneration.

**Left open deliberately.** Why the chain and the artifact diverged is its own
piece of work. Nobody should trust either until that is understood, and it
should not be untangled in passing.

**One thing worth knowing about move 3 that surfaced here.** `app/sitemap.ts`
drops every `/programs/{prog}` hub except `/programs/mba`, because the others
emit noindex. The comparison table renders on all of them, but only the MBA one
is crawlable today. That is fine for users and ready if the others earn
indexing, but for AI citation purposes only `/programs/mba` currently counts.

> **CORRECTION, 2026-09-29.** The paragraph above is wrong. Nine of the ten
> programme hubs were already in `PROGRAMS_INDEX_ALLOWLIST` and already in the
> sitemap emitting `index, follow`. It was written from the code comment at
> `app/sitemap.ts:141`, which still said "only /programs/mba earns its slot"
> long after the allowlist grew past that. The comment was taken at face value
> instead of being checked against the allowlist it describes or against the
> rendered sitemap, either of which would have caught it in seconds. The
> comment has been corrected and now points the reader at the allowlist. See
> the entry below.

**How it was verified.** Page returns 200 with `index, follow`, a self-canonical
and WebPage plus BreadcrumbList schema. Derived sentences confirmed in the
rendered text. Footer link present sitewide, table links present, and the page
appears once in the sitemap. Full pre-commit suite passes.

---

## 2026-09-28 (fifth batch) · The canonical comparison table, and the honesty that is the point of it

**What was asked.** Move 3 of the AI citation plan: publish the comparison data
in a shape a model can lift.

**The gap, measured before building anything.** No page on the site published a
server-rendered comparison table built from the live database:

| Page | Server HTML | `<table>` | Rows |
|---|---|---|---|
| `/universities` | 1.43 MB | **0** | **0** |
| `/programs/mba` | 1.41 MB | 1 | 8 |
| `/best-online-mba-india` | 0.26 MB | 1 | 11 (static, hand-written) |
| `/fees` | 0.54 MB | 1 | 144 (fee-framed) |

`/universities` is the worst of these: 1.4 MB of cards with not one table row,
and the string "NMIMS" appearing twice in the whole document. A model asked to
compare Indian online MBAs gets a div blob. That is why Perplexity built its
table from a competitor.

**What shipped.** `components/ProgrammeComparisonTable.tsx`, a server component
rendering one real `<table>` per programme hub: 121 rows on `/programs/mba`, 74
on MCA, 80 on BBA, 57 on BCA, each with `<th scope="row">`, a screen-reader
caption and an as-of date.

**The honesty rules are the product, not a caveat on it.** Every competitor
table asserts a NAAC grade and invents a fee range. This one:

- prints a NAAC grade only where the Supabase snapshot confirms it **and** the
  cycle is current, which is why 38 of the 121 MBA rows read "Not verified".
  Chandigarh University, whose cycle lapsed on 2026-09-09, is one of them.
- names the category on **every** NIRF rank, because Management and University
  are separate tables. Symbiosis renders as "#11, Management category".
- prints "Not published" rather than guessing a fee, on 20 of 121 MBA rows.

A table that admits what it does not know is the one thing here a competitor
cannot copy, and it is the same claim the site already makes about itself,
finally made checkable.

**Why the fee column is not the spine.** The obvious design was a fee-led table,
and the data will not support one. 106 of 143 universities share a `feeMin`/`feeMax`
pair with another university: **59 of them sit on the identical range 60000 to
200000**, and 18 more are 0 to 0. Those are bulk-generated placeholders. The
programme-level fees are better (101 of 121 MBA entries clear `getDisplayFee`,
which already rejects ranges wider than 3x and figures below a credible floor),
but 50 of those 101 still share a fee string with another university. They are
round numbers that different universities plausibly do charge, so they are
published, marked indicative, and routed to the university's own portal. The
column is a supporting fact, not the axis.

**Reused rather than reinvented.** `getDisplayFee` from `lib/fees.ts` already
encodes the placeholder rules, and `/fees` already documents this cluster in its
header comment. The new table calls that function rather than inventing a second
opinion about which fees are real.

**One wrong turn worth recording.** The table was first inserted after the
`!activeSpec` H2 near the end of `app/programs/[...slug]/page.tsx`, which looked
like the programme hub and is not. That file has three return paths: MBA hubs
return early with `MBAHubClient`, other programme hubs return early with
`ProgramHubClient`, and the code after them serves **specialisation** pages,
where `!activeSpec` is always false. The insert compiled, passed typecheck,
threw no error and rendered nothing. Caught by curling for `<tr>` and finding
zero. It now sits in both hub branches, before their closing fragment.

**Deliberately not on spec hubs.** A spec hub is a narrower cut of the same
rows, and repeating the full table across dozens of them would be duplicate
content on a site that already has gates against exactly that.

**Cost.** `/programs/mba` grew from 1.41 MB to 1.63 MB, since server component
output appears both as HTML and in the RSC flight payload. That doubling is also
why raw string counts in the HTML read double: 78 occurrences of "Not verified"
is 2 x 38 rows plus the one in the explanatory note.

**How it was verified.** Rows counted per hub by curl. Chandigarh confirmed
rendering "Not verified" with its NIRF Management rank intact, Symbiosis
confirmed at "A++ valid to 2029-12-20" and "#11 Management category". The
computed sentence "38 of these 121 universities" confirmed in the rendered
output. Typecheck clean, full pre-commit suite passes.

---

## 2026-09-28 (fourth batch) · The site was telling models seven different university counts

**What was asked.** Start fixing the AI citation plan. This is moves 1 and 2 of
it: correct the facts models read, and ship a real freshness signal.

**Why any of this matters.** A live Perplexity test on 28 September cited
EdifyEdu once, for the verification steps, while a competitor owned the whole
recommendation table. Access was never the problem: the crawlers reach the site
and summarise it accurately. What they were reading was wrong in two ways.

### The count nobody was counting

The brief was "125+ appears in 17 files and the real number is 143". The gate
written to enforce that found something worse. The site was simultaneously
claiming **seven different university counts**:

| Claim | Where | |
|---|---|---|
| 100+ | `components/BlogSidebarForm.tsx` | on every blog post |
| 106+ | `components/Navbar.tsx` | **on every page of the site** |
| 120+ | `app/tools/cgpa-calculator/` (3 places) | the page carrying ~49% of site impressions |
| 122+ | `app/verify/page.tsx` | |
| 125+ | 17 files incl. `app/layout.tsx`, homepage FAQ schema, `llms.txt` | sitewide meta description |
| 127 | `app/contact/page.tsx` | |
| 130+ | `app/contact/layout.tsx` | |

`lib/data.ts` holds 143. Every one of those was an understatement, and a model
crawling the site saw an accuracy-positioned platform unable to agree with
itself about the size of its own database. All now read 143.

The phrasing needed care rather than a blind replace. Several read "NMIMS,
Amity, Symbiosis and 120+ universities", meaning 120 *more* beyond the named
ones, so substituting the total would have overstated it. Those were rewritten
as "across 143" rather than "and 143".

### llms.txt is now generated, not hand-written

Eight of its twenty-two NAAC claims were wrong, stale or unverifiable, and six
of those contradicted `lib/data.ts`. Chandigarh University was still asserted as
NAAC A+ nineteen days after its cycle lapsed on 2026-09-09. LPU, Parul, Manav
Rachna and KL University were each listed a full grade below what both
`lib/data.ts` and Supabase hold.

Hand-maintaining a file whose whole purpose is to be read by language models is
what allowed that, so `scripts/build-llms-txt.mjs` now generates it from
`lib/data.ts` plus a committed snapshot of Supabase-verified grades
(`data/naac-verified.json`, refreshed with `--refresh-naac`).

**The generator's NAAC policy is the point of it.** A grade prints only when
Supabase confirms it and the cycle has not lapsed. A lapsed cycle prints no
grade. A university with no Supabase row prints no grade however confident
`lib/data.ts` is. That silently dropped all eight problem universities from the
graded list, which is the correct outcome: the file now says less and every word
of it is true. It also states that NIRF ranks carry their category, since the
old file printed grades with no such discipline.

**Worth knowing:** the research behind this says llms.txt is largely ignored
(Ahrefs, 137,000 sites, 97% with zero traffic). It was fixed because shipping
wrong data is not acceptable regardless of who reads it, not because the file is
expected to move citations. It should not be expanded further.

### dateModified was a lie on all 208 posts

`app/blog/[slug]/page.tsx` set `dateModified: post.publishedAt`, so every post
signalled "never updated" however often it was revised. 2026 research describes
a roughly three-month citation cliff, which makes this an actively harmful
signal on an archive where most posts date from March to May.

`BlogPost` now carries an optional `updatedAt`, and `dateModified` is
`post.updatedAt || post.publishedAt`. The same fix went into
`app/online-mca/[slug]/page.tsx`.

**Deliberately not set to the build date.** That would claim a modification on
every deploy, which is the dishonest version of this fix. No post was given an
`updatedAt` in this commit, because none was substantively revised: the field is
there for the next real revision. Verified both paths by temporarily setting one
and confirming the schema picked it up, then reverting.

**Two hardcoded dates left alone.** `best-online-mba-india` carries
`dateModified: '2026-04-16'` and does not import `lib/data.ts`, so April is
honest for static content that has not changed; the content being five months
stale is a separate editorial call. `CompareClient` is a client component whose
schema only renders on `/compare?a=X&b=Y`, and `robots.ts` blocks that pattern
from crawling, so it is not worth a hydration-safe build constant.

### Guards

Both gates were tested by deliberately breaking them before being wired in, on
the principle that a check which has never failed cannot be trusted.

- `check-university-count` fails any coverage claim disagreeing with
  `UNIVERSITIES.length`. It skips four shapes that look like coverage claims and
  are not: ranking bands ("NIRF top-50 universities"), proportions ("63 of 128"),
  code comments, and programme counts ("10 UGC DEB approved online MBA
  programs"). `lib/blog.ts` is out of scope on purpose, since post bodies carry
  dated statements that were true when written and rewriting an archive to match
  today's number would falsify the record.
- `check-llms-txt` regenerates and compares, so a hand-edit or a database drift
  fails the commit.

**One wrinkle worth recording.** The sed pass touched three lines that already
contained em dashes, which made them "added lines" to `check-em-dash` and failed
the commit. Editing a line makes you the author of its existing style
violations. The three were rewritten rather than exempted.

---

## 2026-09-28 (third batch) · Hero images for the last 31 posts, and five that lied to screen readers

**What was asked.** Add images relevant to the posts.

**Scope.** 31 of 208 published posts had no `heroImage`: the 16 written today
plus 15 older ones. All 31 now have one, so every published post carries a hero.

**Why this is not just decoration.** `app/blog/[slug]/page.tsx` feeds `heroImage`
into `openGraph.images` and `twitter.images` as well as the page body. A post
without one fell back to the generic site card, so every share of those 31 posts
looked identical on social and in chat previews.

**Why not `scripts/add-pexels-images-to-blogs.js`.** Two reasons, both blocking.
Its block parser matches `slug: '...'` and `"slug": "..."`, and the 16 posts of
today are written `slug: "..."` at four-space indent, so it would have silently
skipped every one of them. Its `decideQuery` keyword mapper is also too coarse
for profession posts: the branch order sends anything containing "mba" to
"indian professional online learning laptop", so the nurse post, the product
manager post and the agribusiness post would all have received the same stock
laptop photo. Queries were written per post instead, and results were read for
relevance rather than taking `photos[0]`.

**Everything is from the Pexels API.** Photographer name, photographer URL, image
URL and base alt text all come from the API response. Nothing about a
photographer was composed by hand. Each chosen URL was checked with a HEAD
request for a 200 and an `image/*` content type before anything was written, and
the script refuses to write if any fail.

**One judgement worth recording: no campus photographs on university reviews.**
Seven of the 15 older posts review a named university. A stock campus building
under "Parul University Online MBA Review" reads as a photograph of Parul's
campus, which would be a quiet fabrication on a site whose whole claim is
independence. Those seven got neutral study, library, graduation and online-class
imagery instead, with alt text that describes the scene and names no institution.

**Stock-library sales copy stripped from alt text.** Pexels alt sometimes ends
with "Ideal for business and HR visuals". That describes a licensing use case,
not the image, and does not belong in an alt attribute.

**Two candidate images rejected on review**, which is why results are read rather
than trusted by rank: a fees post was offered photos of US dollar bills, wrong
currency for an Indian fees comparison, and the workload post was offered a woman
studying with a glass of wine.

**The defect found on the way, which matters more than the additions.** Five MCA
posts shared one identical image (Pexels 574071), none credited, and two carried
alt text describing an image that is not there:

- `online-mca-amity-vs-lpu-2026` said "Two laptops side by side representing the
  comparison between Amity and LPU" over a photo of one pair of hands coding.
- `mca-after-bca-is-it-good-2026` said "BCA graduate weighing options" over the
  same photo.

A sighted reader sees a generic coding photo and moves on. A screen reader user
is told there are two laptops, or a graduate deciding, and there is neither. That
is an accessibility defect rather than a style nit, and
`mca-vs-btech-which-is-better-2026` is the site's second-biggest page by
impressions, so it sat on a page that matters. Four received distinct relevant
images with accurate alt text. `online-mca-india-2026` kept 574071, whose alt
does describe it honestly, and gained the missing credit to Lukas Blazek.

**Duplicate sweep.** After the additions, nine images were used by more than one
published post. One collision was introduced by this work
(`best-online-mba-for-women-india-2026` landed on the photo already used by
`online-mba-for-working-professionals-india`) and was swapped. The remaining
**8 pairs predate this work** and were left alone: a 2x repeat across 208 posts
is a far smaller problem than the 5x it replaced, and changing them is a
judgement call for Rishi rather than a defect fix.

**Not changed, but worth knowing.** `chandigarh-online-bba-review-2026` uses a
local SVG hero and correctly needs no Pexels credit, so it is the only published
post without `heroImageAttribution`. Its alt text carries a rupee figure, which
the blog fee gate cannot see because `scanAllPosts()` reads `post.content` only
(`scripts/lib/blog-fee-scan.mjs:614`). No fee claim appears in any alt text
written here.

**How it was verified.** 208 of 208 published posts now carry a hero, 0 without
alt, 1 without attribution and that one by design. Typecheck clean. Fee gate
unchanged from baseline at 2433, confirming no currency entered the scanned
field. Duplicate-slug, em-dash and quick-facts gates pass. Rendered pages checked
for the `<img>`, the `og:image` and the attribution line, and the agribusiness
hero confirmed visually in the browser.

---

## 2026-09-28 · Quick Facts sidebar rendered nothing on twenty posts

**What was reported.** The Quick Facts box was missing on the twelve posts of
17 September. The diagnosis handed over was right. `app/blog/[slug]/page.tsx:601`
reads `BLOG_QUICK_FACTS[post.slug]` out of `lib/blog-quick-facts.ts`, not the
`quickFacts` field on the post object, so writing `quickFacts` in `lib/blog.ts`
is silently a no-op. `app/online-mca/[slug]/page.tsx:293` does the same.

**The count was not twelve.** 40 posts in `BLOG_POSTS` carry a populated
`quickFacts` field and only 17 had a lookup entry. A first parse said 13 because
it matched only double-quoted `slug:` lines, and 168 of the 205 post objects use
single quotes. Counting both forms gives 32 posts with a field and no entry.

**The second defect, which the handover had backwards.** The eight posts of 28
September were described as the working reference to copy. They are the worst
case on the site. Their lookup entries were added with every label present and
every `value` set to the empty string, 31 blanks across 32 rows.
`BlogSidebarWidgets` renders a row whether or not the value is empty, so those
eight have been live since 28 September showing a Quick Facts card with an empty
right-hand column. The real values sat unused in the `quickFacts` field the
template ignores.

**Why the lookup was filled and the template left alone.** The proposed fix was
`BLOG_QUICK_FACTS[post.slug] ?? post.quickFacts` in both callers. That is the
better architecture and it does remove the duplication, but it cannot ship as a
one-line change, for two reasons.

It would not have fixed the eight. Their lookup entry exists, so `??` keeps
selecting it and keeps rendering blanks. A fallback has to be value-aware to help
there, and filling the values is required work under either design.

It would also publish 17 more posts in one commit. Of the 32 posts with no entry,
17 carry fee, salary or superlative figures in `quickFacts` that have never
rendered and so have never been checked by anything. They include derived
best-value claims ("Best Value = AMU Online (Rs 28K, NIRF #10)"), a NIRF rank
with no category attached, and salary bands ("Entry Salary = Rs 5-10 LPA") with
no approved source behind them. Those break the no-fabricated-stats rule, the
NIRF-category rule and the never-derive-fee-superlatives rule at once. A template
fallback switches all 17 on at the same moment, with no gate in front of them,
because the blog fee scan reads post bodies rather than this field.

**What shipped.** Data only, no template change.

- Filled the 31 empty values on the eight posts of 28 September. Each value came
  from that post's own `quickFacts` field, matched on the label.
- Added the twelve posts of 17 September as new lookup entries, copied from their
  `quickFacts` fields. None of the twelve holds a money figure, so the blog fee
  gate has nothing to catch here.

Twenty posts now render a populated Quick Facts box. The lookup keeps priority
over the field, so this data stays correct and authoritative if the fallback is
added later.

**What is deliberately still broken.** 20 posts keep a `quickFacts` field and no
entry. 17 of them need their figures verified against the portals before they are
allowed to render at all. The other three are clean of money, but one asserts
"Approved Universities: 125+", a UGC-DEB claim no source in this repo supports,
so all three were held back with the rest rather than shipped on a guess.

**Verified.** Dev server on port 50631, curled all twenty pages. All twelve
return the card and their own quick-fact label. All eight formerly blank posts
return their values. Read the rendered card back out of the DOM on
`online-mba-hr-executives-india-2026` and confirmed four populated rows.

**It recurred while this was being written.** `f40abee` landed on main during
this fix with eight more profession posts, and all eight repeated the empty-value
bug exactly: 31 blank values across 32 rows. Its commit message records the
sidebar as verified, which it was, by the same test that cannot see the defect.
Checking that the card renders passes whether or not the card has any content.
Merged, then filled those eight the same way. Twenty-eight posts in total now
render a populated box.

**Guard.** `scripts/check-quick-facts.mjs`, wired into `.husky/pre-commit`. It
fails the commit on any blank label or value in `lib/blog-quick-facts.ts`, which
is the defect that shipped twice in two consecutive commits. It reports posts
carrying an unread `quickFacts` field without failing, because 20 of those are
held back on purpose and a blocking check there would have to be satisfied with
unverified fee figures, which is the opposite of what is wanted. Verified by
injecting a blank value and confirming a non-zero exit.

---

## 2026-09-28 (second batch) · Eight more profession audiences, and a validator that was lying

**What was asked.** Continue the profession-audience work: check what is already
covered and write only what is not.

**How coverage was checked.** A script grepping the title, seoTitle, h1Title,
metaDescription, targetKeyword and tags of all 217 published posts against 30
candidate professions. Grepping the slug alone is what wrongly declared three
universities uncovered in a previous session, so nothing here relies on it.

The audit's useful correction: several professions that *looked* covered were
covered only by **programme-intent** posts. `online-mba-entrepreneurship-india-2026`
describes a specialisation; it is not written to a family business successor.
Same for hospitality, aviation, real estate and supply chain. A programme page
and an audience page are different documents with different readers.

**What shipped.** Eight more career-intent posts: supply chain and logistics
staff, teachers, doctors, retail professionals, family business owners,
hospitality staff, insurance professionals, agribusiness professionals.
Inventory is now **225 entries, 208 published**.

**Why these eight.** Each needed a finding from the specialisation index, not a
template. The index supplied one every time:

- **Teachers: zero of 171 labels serve education.** No education management,
  educational leadership or school administration label exists anywhere in the
  online market. The post leads with that and then says the thing a seller would
  not: for school leadership the recognised route is M.Ed, and an MBA is for
  leaving the classroom rather than rising in it.
- **Supply chain: 19 distinct labels for roughly one subject**, several differing
  only by an ampersand or a plural. The post tells readers to ignore the label
  and names the one distinction that is real (operations is inside your walls,
  supply chain is between them).
- **Family Business: exactly one label**, at Chandigarh University, whose NAAC
  cycle has lapsed. The post then argues *against* the obvious choice, because
  entrepreneurship coursework is built around starting something and a successor
  is inheriting a going concern. Finance usually serves them better.
- **Hospitality: 7 labels, none above two universities**, the thinnest field
  mapped so far. Since you cannot have both the sector label and strong
  accreditation, the post says take the accreditation.
- **Insurance: one insurance-only label.** Framed on the same two-document logic
  as the bank post: IRDAI licensing decides whether you can sell, a degree
  decides which salaried roles read your application.
- **Agribusiness: 6 labels across 7 listings, spelled inconsistently enough that
  one spelling hides the others.** That search trap is the post's most useful line.
- **Retail: exactly one clean label at 11 universities**, which makes it the
  tidiest category in the market and moves the whole decision onto accreditation.
- **Doctors** were written separately from nurses because the questions differ:
  MD versus MBA, and the fact that an MBA confers nothing clinical.

**The validator bug, which matters more than the posts.** A tag-balance check
built with `new RegExp('<' + tag + '(\\s[^>]*)?>')` lost a backslash level when
the script was written through a bash heredoc. The pattern became `(s[^>]*)?`,
which matches no real tag, so the check counted **zero opening tags for every
element** and concluded everything was balanced. It passed a post that had a
stray `</p>`.

Two posts in this batch carried that stray before it was caught by counting tags
by hand. The check was rewritten to scan with `indexOf` and plain character
comparison, with no backslash escapes anywhere in it, because a dynamically
assembled regex in this codebase cannot be trusted to survive the shell.

**A sweep it then found.** With the working check, **7 published posts predating
this work have unbalanced tags**: `online-mba-for-working-professionals-india`,
`nmims-online-mba-review-2026`, `iim-online-mba-india-2026`,
`online-mba-lpu-review-2026`, `mba-course-duration-india-2026`,
`online-bba-programs-india-2026`, `online-bba-fees-india-2026`. Browsers repair
most stray `</p>` tags, but `nmims-online-mba-review-2026` has 15 opening divs
against 19 closing ones, which can close a layout wrapper early. Not fixed here
because it is unrelated to this task, and left for Rishi to schedule.

**Constraints, unchanged and all holding.** Zero rupee figures (fee gate reports
2433 unverified, unchanged from baseline). Every accreditation claim cross-checked
against Supabase through `supabase-uni-map`. Chandigarh University's lapsed NAAC
cycle flagged in all three posts naming it. SRM University Sikkim, O.P. Jindal,
KL University, AMET, Dr. B.R. Ambedkar Open University and D.Y. Patil Navi Mumbai
have no verified record and the tables say so. NIRF ranks always with category,
which two posts make explicit: DPU-COL's strong ranks are Medical and Dental,
JSS Academy's is Pharmacy, and neither has a Management placement.

**Quick facts wired.** All eight added to `lib/blog-quick-facts.ts` and confirmed
rendering. The twelve posts from 17 September are being handled separately.

**How it was verified.** Runtime count (225 entries, 208 published, no duplicate
slugs). All eight return 200 and render callouts, CTA, FAQ schema and the quick
facts sidebar. House style checked by script including the repaired tag balance.
Every internal link target resolved against `BLOG_POSTS`, `UNIVERSITIES` and
`GUIDES`. Full `.husky/pre-commit` suite passed.

---

## 2026-09-28 · Eight profession-audience posts, and the count that was wrong

**What was asked.** Recount the blog inventory properly, check whether the
profession-audience clusters Rishi named (bankers, IT staff, business analysts)
were actually covered, and write the ones that were missing.

**The count.** 217 entries in `BLOG_POSTS`: 200 published, 14 redirected, 3
draft. Counted by importing the array with tsx, not by grepping `slug:`, which
returns 199 because some entries are formatted differently. The 196 figure in
project memory was correct on 15 September and is now stale by the twelve posts
of 17 September plus these eight.

**What was already covered.** Bankers and IT professionals both have four posts
each from the 17 September batch, so the two audiences Rishi named first were
done. Business analysts were not. The site had `mba-data-science-vs-business-analytics-2026`
(a label comparison) and `online-mba-business-data-analytics-india-2026`
(programme intent), but nothing written to the person holding the job. That was
the real gap, and the same held for six other professions.

**What shipped.** Eight career-intent posts, all published 2026-09-28:
business analysts, sales professionals, medical representatives, HR executives,
civil and site engineers, nurses and allied health staff, chartered accountants,
and aspiring product managers.

**Why career-intent and not programme-intent.** Same reasoning as the 17
September batch, which the GSC export supports: `govt-jobs-after-mba-india-2026`
pulls 15,723 impressions at position 6.73 while programme-intent pages sit on
page seven. Every post here is written as a decision document, not a brochure.

**Why these eight and not others.** Each one had to have something true and
non-obvious to say that came out of the data rather than out of a template. The
specialisation index supplied it:

- Only 4 of 171 MBA specialisation labels mention sales, and all four pair it
  with marketing, against 62 universities carrying Marketing. So an area sales
  manager searching for an MBA in sales is going to buy Marketing, and the post
  says so in the first paragraph.
- Exactly 1 label is Product Management (Chandigarh University Online). That
  post argues against its own product, because the honest read is that an MBA is
  a weak instrument for entering product management in India.
- Human Resource Management is carried by 77 universities, the highest count of
  any specialisation we track. When 77 sellers carry one label the label cannot
  differentiate, so the post pushes the decision onto accreditation and the
  elective list.
- Teachers were considered and dropped: no education-management label exists in
  the index, so there was nothing honest to offer.

**Constraints applied, and why each one held.**

1. **Zero rupee figures in all eight.** `scripts/check-blog-fees.mjs` rejects any
   currency figure in a new slug that does not MATCH `getDisplayFee()`, and there
   is no approved source for Indian salary data, so a salary table would be
   fabrication. The gate reports 2433 unverified, unchanged from baseline, which
   is the proof that nothing new was added.
2. **Every accreditation claim cross-checked against Supabase** through
   `scripts/lib/supabase-uni-map.mjs`, because lib/data.ts ids and Supabase slugs
   disagree and a naive join mis-pairs institutions. This changed what the posts
   could say: Chandigarh University's NAAC A+ cycle expired 2026-09-09, so all
   three posts that name it state the cycle has lapsed and route the reader to
   naac.gov.in rather than asserting a grade. BITS Pilani WILP, SGT University,
   SRM University Sikkim and D.Y. Patil Navi Mumbai have no verified record, so
   those rows say so in the table instead of quietly omitting the column.
3. **Every NIRF rank carries its category.** Eleven Management-category ranks
   were verified against the Supabase `accreditations` rows and used; the rest
   say "no NIRF Management placement on record". Two posts make the category
   point explicitly, because JSS Academy (NIRF Pharmacy 4) and DPU-COL (NIRF
   Medical and Dental) are exactly the institutions whose strong clinical ranks
   get read as management endorsements.

**The quick-facts bug found on the way.** `BlogPost` carries a `quickFacts`
field, but `app/blog/[slug]/page.tsx:601` renders `BLOG_QUICK_FACTS[post.slug]`
from `lib/blog-quick-facts.ts` instead. The field on the post object never
reaches the sidebar. Only 9 slugs had entries in that file, so the 12 posts from
17 September and these 8 all carried dead data. Entries for the new eight were
added to `lib/blog-quick-facts.ts` and confirmed rendering. The 12 posts from 17
September are still unwired; that is a separate fix.

**The open disagreement, recorded rather than hidden.** The 17 September plan
gates its own backlog on a GSC read around 15 October, on the reasoning that if
the banking and AI clusters show nothing after four weeks the queries have no
Indian volume and the cluster should be abandoned rather than expanded. Today is
28 September, so that gate has not been reached, and one of these eight
(`online-mba-product-managers-india-2026`) is backlog item 3. Rishi asked for
this batch directly and that is his call to make, but the measurement problem is
real: eight more posts shipped before the read makes the 15 October signal
harder to attribute. Mitigation is that these eight target different professions
from the banking and AI clusters, so they can be read as their own cohort. Pull
GSC for both cohorts separately around 15 to 27 October.

**How it was verified.** Runtime count via tsx, not grep. All eight pages return
200 on the dev server and appear on `/blog`. House-style checks scripted rather
than eyeballed: no em dashes, no banned AI vocabulary, no `Furthermore`/`Moreover`/
`Additionally` openers, no curly quotes, no H1 in body, paragraphs at 4 sentences
or fewer, 8 internal links per post with no duplicate target, no outbound link
outside the four approved sources, no competitor named. Every internal link
target resolved against `BLOG_POSTS`, `UNIVERSITIES` and `GUIDES` before commit.
Full `.husky/pre-commit` suite passed.

**What guards it.** `check-blog-fees` blocks any fee figure in a new slug.
`check-duplicate-slugs` reports 217 posts and 217 distinct slugs. `check-em-dash`
covers the house rule. The accreditation claims have no automated guard on the
blog side, which is why they were cross-checked by hand against Supabase before
writing; `scripts/audit-naac-validity.mjs` is the tool to re-run when a cycle
lapses.

---

## 2026-09-27 · CSP was silently swallowing every Google Ads conversion beacon

**What broke.** The site-wide Content-Security-Policy in `next.config.js` never
listed the Google Ads beacon hosts. Every page load fired the AW-17380291250
tag, the browser refused the request, and the tag reported success to nobody.
Three directives were short:

| directive | what it was dropping |
|---|---|
| `script-src` | `googleads.g.doubleclick.net/pagead/viewthroughconversion/17380291250/` |
| `connect-src` | `www.google.com/ccm/collect`, `www.google.com/rmkt/collect`, `ad.doubleclick.net/ccm/s/collect` |
| `frame-src` | `www.facebook.com`, the Meta pixel iframe |

**Why it shipped to production, not just dev.** `headers()` applies the policy
at the catch-all source `/(.*)`, and the only environment-gated token in it is
`'unsafe-eval'`. Evaluating the config under `NODE_ENV=production` returns the
same script-src, connect-src and frame-src lists it returns in dev. There is no
second policy anywhere: `middleware.ts` sets no CSP, `vercel.json` holds only a
cron entry, and no page emits a meta http-equiv policy. So the live site has
carried this since the v16 deploy, commit 0c3246f on 2026-03-23, which is the
same commit that added the AW tag. The Ads tag has never had a working beacon
path on this domain.

**Why nobody caught it for six months.** A CSP refusal is a browser console
warning. It is not an error the page surfaces, not a failed build, and not
anything the Google Ads UI reports. Ads shows zero conversions, which reads
identically to "the campaign is not converting". The tag also loads fine and
`window.gtag` is a function, so every surface-level check passes.

**NOT VERIFIED: whether the Ads account shows zero.** There is no Google Ads
access from this session, so "conversions recorded nothing" is inference from
the blocked requests, not observation. Confirm in Google Ads under Goals then
Conversions then Conversion actions, and in Tools then Google tag then tag
diagnostics. Two things soften the claim and should be checked, not assumed:

1. There is no `gtag('event','conversion',{send_to:'AW-...'})` anywhere in the
   codebase. The only Ads code is `gtag('config','AW-17380291250')` in
   `app/layout.tsx:206`, so what was blocked is the automatic page_view and
   remarketing collection, not a hand-fired conversion event.
2. The `generate_lead` and `cta_click` events do fire, and they travel to GA4
   over `www.google-analytics.com`, which the policy always allowed. If the Ads
   conversions are GA4 imports rather than Ads-native, they were landing the
   whole time and only remarketing audience building was broken.

**The trap in this fix, and why the console cannot be trusted alone.** The
beacon is a three-hop redirect:

```
googleads.g.doubleclick.net/pagead/viewthroughconversion/17380291250/
  -> 302 www.google.com/pagead/1p-user-list/17380291250/
  -> 302 www.google.co.in/pagead/1p-user-list/...&ipr=y
```

CSP re-checks every redirect target, but reports the ORIGINAL url in the
violation so the policy cannot be used to probe redirect chains. The console
therefore only ever names `googleads.g.doubleclick.net`. Allow-listing just that
host looks like a complete fix and leaves the beacon blocked at hop two.
Allow-listing hops one and two still leaves it blocked at hop three, which is
the country domain every Indian visitor lands on. Both dead ends were hit in
this session before the chain was walked with curl and confirmed with a
`securitypolicyviolation` probe inside the page.

**What was added**, specific origins only, no wildcard and no `unsafe-`
widening:

- `script-src`: `googleads.g.doubleclick.net`, `www.google.com`, `www.google.co.in`
- `connect-src`: `googleads.g.doubleclick.net`, `ad.doubleclick.net`, `www.google.com`
- `frame-src`: `www.facebook.com`

**KNOWN GAP, left open deliberately.** A visitor outside India bounces to their
own Google ccTLD at hop three, `google.ae`, `google.com.sg` and so on, and is
still blocked. Keeping the policy tight was the instruction, so the ccTLD list
was not widened. If overseas traffic is worth measuring, add those specific
ccTLDs. A wildcard like `https://*.google.com` would not match ccTLDs anyway.

**How it was verified.** A `securitypolicyviolation` probe on a clean tab
against the dev server, on `/` and `/review/ignou-online`, with deliberate
controls so the probe is known to discriminate rather than just report silence:

| probe | before | after |
|---|---|---|
| beacon pixel, googleads.g.doubleclick.net | violation, script-src-elem | loaded, no violation |
| /ccm/collect, /rmkt/collect, ad.doubleclick.net | blocked | allowed |
| www.facebook.com iframe | blocked | framed |
| control: cdn.jsdelivr.net script | violation | violation, still blocked |
| control: not-in-policy.example.com fetch | violation | violation, still blocked |
| control: vimeo.com iframe | violation | violation, still blocked |

Clean-tab console on both URLs reports no CSP violations. The production policy
was checked by evaluating `headers()` under `NODE_ENV=production`, not inferred
from the dev header.

**What guards it.** A comment block now sits directly above the CSP in
`next.config.js` naming each ad-tech origin, the redirect chain, and the fact
that the policy ships to production. The thing being documented is the silence:
someone tidying the origin list later will not see anything break.

---

## 2026-09-24 · Shoolini highlights: rankings, USPs and inclusions across all 46 URLs

**What was asked.** Put Shoolini's QS and THE rankings, its four USPs, five free
inclusions and the new MBA immersion onto the Shoolini pages, programmes and
specialisations alike.

**Why this went in lib/data.ts and not the page-content JSONs.** Shoolini has 46
live URLs across 7 programmes, but only 17 page-content JSONs, all of them MBA.
A JSON-based rollout would have reached the MBA pages and silently skipped BBA,
BCA, B.Com, MCA and MSc. The data now sits on the university record as
`highlights`, and one new component renders it on the university page, every
programme hub and every specialisation page, in both the rich and the generic
`UniSpecBody` branches.

**What was cross-checked against Supabase** (per the NAAC/NIRF source-of-truth
rule), joined through `scripts/lib/supabase-uni-map.mjs`, since the lib/data.ts
id `shoolini-university-online` maps to the Supabase slug
`shoolini-university-of-biotechnology-and-management-sciences-online`:

| claim | Supabase | verdict |
|---|---|---|
| NAAC A+ | Cycle 2, CGPA 3.3, valid till 2031-11-21 | current, not lapsed |
| NIRF #69 | category University, 69 of 200 | confirmed |
| QS #452 / No. 1 private | absent, no rankings table | unverifiable here |
| THE #3 India / 401-500 | absent | unverifiable here |

So QS and THE render in their own row that names the ranker and the edition,
and never as an Edify verdict. NAAC and NIRF are deliberately NOT repeated in
the block: they already render in `ApprovalBadges`, and putting a QS placement
beside them would imply the two carry the same evidential weight. Shoolini also
holds NIRF Pharmacy #44, which the site does not currently use anywhere.

**`qsRank` was deliberately left unset.** That field means QS ASIA rank
everywhere else in the codebase (Amity 45, LPU 51, Jain 62) and
`UniversityCard.tsx:117` prints it with no guard. Setting it to 452 would have
rendered "QS #452" beside those as though it were the same metric. The world
rank lives in `highlights.rankings`, where it is labelled.

**Two defects found by verifying rather than assuming.**

1. *MBA fees leaked onto BBA pages.* Pay-After-Placement carries MBA rupee
   figures, Rs 31,600 and Rs 1.3L. It was first written into the university-wide
   `usps`, which renders on the BBA hub where the fee is Rs 96,000. Moved into
   `byProgram.mba`, so it appears on MBA surfaces only. The same key scopes the
   immersion line.
2. *"Online Online MBA".* The three callers disagree on whether `cleanName`
   already carries "Online": the programme and spec bodies strip it, the
   university page passes `u.name` verbatim. `UniHighlights` now normalises it,
   so no caller can reintroduce the double.

**On "India's ONLY".** Rishi was shown that "only" is a falsifiable exclusivity
claim asserted in Edify's voice, and chose to keep it. It already matches the
`tagline` live sitewide, so the two sources now agree rather than contradict.

**Verified.** Dev server across all five page shapes: university page, MBA hub,
MBA spec (rich branch), BBA hub and BBA spec (generic branch). Immersion and
Pay-After-Placement appear on MBA only. Amity renders no block at all, which is
the correct null for the other 142 universities. Grids are 2 column at 1280px
and 1 column at 375px with no overflow at either width. `tsc --noEmit` clean.

**Pre-existing, not introduced here.** Spec pages log a React duplicate-key
warning from `renderParagraphsWithBold` in `UniSpecBody.tsx:74`. It reproduces
on Amity, which has no highlights block, so it is unrelated to this change.

**Still open for Rishi.** Whether the immersion cost sits inside the fee, and
whether Pay-After-Placement extends beyond the MBA. Both are stated as unknown
on the page rather than guessed.

---

## 2026-09-24 · Red Flags removed from the Shoolini MBA hub, and the opt-out that made it possible

**What was asked.** Remove the Red Flags section from
`/universities/shoolini-university-online/mba`. That page only.

**Why it needed a code change and not just a content edit.** The section has two
renderers in `components/UniProgramBody.tsx`. When the page-content JSON carries
`sections.redFlags.flags`, `GeneratedRedFlagsBlock` renders those. When it does
not, the generic per-programme `RedFlagsBlock` renders four hardcoded MBA
warnings instead. So emptying the JSON array does not delete the section, it
swaps the written flags for boilerplate ones. Deleting the key does the same.

Nor could the empty array itself be the signal to hide the section: **73 of the
431 page-content JSONs have `redFlags` present with an empty `flags` array**, and
every one of them is relying on that fallback today. Reading empty as "hide"
would have silently stripped the section from 73 other pages.

**The fix.** `sections.redFlags.hidden?: boolean` in
`lib/data/page-content-schema.ts`, checked first in the render:

```
{s?.redFlags?.hidden ? null : s?.redFlags?.flags?.length ? ... : ...}
```

Set on `shoolini-university-online-mba.json` and nowhere else (1 of 431). The
two existing behaviours are untouched: written flags still render, empty still
falls back.

**The four flags that came off the page** (recoverable from git history): the
mandatory Semester 2 direct-selling module, NIRF #69 sitting outside the top 50,
six-week certificate dispatch, and workshops-only career support.

**What remains.** The `honestVerdict` section on the same page still carries its
"Look elsewhere if" list, which repeats the NIRF #69 and direct-selling points in
editorial form. That was deliberate: the request was for the Red Flags block, and
the verdict is the page's balanced-judgement section, not a warning box. Say so
if the intent was to drop the negatives entirely.

**Verified.** Dev server, three pages: Shoolini now has zero occurrences of "Red
Flag" in the rendered DOM; Amity (JSON flags) still renders its four; Ajeenkya
D.Y. Patil (empty array) still renders the generic block. `tsc --noEmit` clean.
Console errors on all three are the pre-existing Google Ads CSP blocks.

---

## 2026-09-17 · The verify pages were showing "valid till 2026" for cycles that had already ended

**The defect.** Both NAAC renderers on the verify pages built their secondary
line as `valid till ${new Date(valid_till).getFullYear()}`. For Chandigarh
University, whose cycle ended **2026-09-09**, that printed "valid till 2026".
Literally true, and it reads as reassurance. Same for Dayalbagh Educational
Institute, cycle ended 2026-08-09.

This matters more here than anywhere else on the site. The verify pages exist to
answer "is this university legitimate", they rank at position 4 to 6, and they
convert at 1.76%, second only to coupons. Presenting a lapsed accreditation
cycle as current is the one thing that page must not do.

**The fix.** `lib/verify/naac-validity.ts` exposes `naacCycle(validTill, cycle)`
returning a description plus `expired` and `expiringSoon` flags. Three states:

| state | secondary line | status |
|---|---|---|
| current | `Cycle 3 · valid till 2029` | `CGPA 3.56` |
| expiring within 6 months | `Cycle 1 · valid till Feb 2027, due for reassessment` | `CGPA 3.28` |
| lapsed | `Cycle 1 · cycle ended Sep 2026, reassessment due` | `CGPA 3.28, lapsed` |

A lapsed row also drops to the neutral text colour instead of the gold accent,
so it does not read as an active endorsement. Both call sites use it:
`components/verify/ApprovalsCard.tsx` and the `ApprovalsCardInline` copy inside
`app/verify/[slug]/page.tsx`.

**An expired cycle does not mean the grade is gone.** Reassessment is frequently
pending and institutions usually keep the grade in practice. What we cannot do
is assert it as current. That is the same treatment IGNOU's A++ already gets in
the blog copy, and it is the honest position for a page whose entire value is
that its claims are checkable.

**Verified against all three states on a running server**: Chandigarh renders
"CGPA 3.28, lapsed" with "cycle ended Sep 2026, reassessment due", Dayalbagh the
same for Aug 2026, MUJ shows the expiring-soon wording for Feb 2027, and
Symbiosis is untouched at "Cycle 3 · valid till 2029". `tsc` clean.

**Still open.** The grade also renders on university hubs, programme hubs, the
compare tool and the fees table, roughly 25 files, none of which know about
`valid_till` because `lib/data.ts` does not carry it. Only the verify pages read
the Supabase row directly, which is why they could be fixed first and alone.
Extending this needs a `naacValidTill` field on the lib/data.ts records, which is
a data migration and a separate decision. Run
`npx tsx scripts/audit-naac-validity.mjs` for the current list.

---

## 2026-09-17 · lib/data.ts ids and Supabase slugs do not agree, and the mismatch was producing false findings

**How it was found.** Chandigarh's NAAC cycle turned out to have lapsed, so I
swept every university for the same problem. The first sweep returned five grade
mismatches and claimed MUJ, DSU and Amrita had no accreditation records. **All of
that was wrong.** The join was matching on slug, and the two sources do not use
the same slugs.

| lib/data.ts id | Supabase slug |
|---|---|
| `upes-online` | `university-of-petroleum-and-energy-studies-online` |
| `manipal-university-jaipur-online` | `manipal-university-online` (Rajasthan) |
| `dayananda-sagar-university-online` | `dayanand-sagar-university-online` (one letter) |
| `symbiosis-university-online` | `symbiosis-international-online` |
| `nmims-online` | `narsee-monjee-institute-of-management-studies-nmims-online` |

A naive join drops these silently. A fuzzy join is worse: it paired
`dr-br-ambedkar-open-university-online` (Telangana) with
**Dr. Babasaheb Ambedkar Open University** (Gujarat), which is a different
institution, and paired UPES with whatever shared a common word.

**Corrections to earlier entries in this log.** The 2026-09-17 spec-page entry
says MUJ, Dayananda Sagar and BITS Pilani are absent from Supabase. Only **BITS
Pilani** is. MUJ carries NAAC A+ (3.28, valid to 2027-02-14), NIRF Management 81
and University 58, all of which agree with lib/data.ts. DSU carries NAAC A+ (3.31).
Separately, [[project_supabase_accreditation_gap]] recorded Amrita as having no
accreditation rows; it has a full set, including NAAC A++ (3.7, valid to
2028-08-17) and NIRF Management 26. That also resolves the flagged Amrita
conflict between "NIRF #8" and "#26 Management": **both are correct**, they are
the University and Management categories.

**What shipped.** `scripts/lib/supabase-uni-map.mjs` holds a hand-verified
id-to-slug map (41 overrides), a set of 7 universities confirmed genuinely absent
from Supabase, and 3 that are present but carry no NAAC row. `resolveSupabaseSlug()`
returns null rather than guessing. Any future Supabase cross-check must go
through it, because [[feedback_supabase_truth]] makes those cross-checks
mandatory and a wrong join produces a confident wrong answer.

`scripts/audit-naac-validity.mjs` joins through that map and reports grades whose
cycle has lapsed, grades expiring within six months, and disagreements between
lib/data.ts and Supabase.

**What it found, now that the join is trustworthy.**

- **0 grade disagreements.** The five from the first run were all matcher
  artefacts. lib/data.ts agrees with Supabase everywhere both hold a value.
- **2 lapsed cycles the site still presents as current**: Chandigarh University
  A+ (expired 2026-09-09) and Dayalbagh Educational Institute A+ (2026-08-09).
- **4 expiring within six months**: MUJ (2027-02-14), Shiv Nadar (2026-11-26),
  Devi Ahilya Vishwavidyalaya (2026-11-26), Banasthali Vidyapith (2027-03-11).
- **20 universities** either absent from Supabase or holding no NAAC row, which
  is the backfill list. IGNOU, SPPU and Bharathidasan are present with no NAAC
  row, so their grades on site are unverifiable against source of truth.

**Deliberately not done.** The NAAC grade renders at **63 sites** across the
component tree with no shared formatter, so there is no chokepoint to add an
"as at" caveat to. Wiring that is its own piece of work and a display decision,
not something to half-apply. The Chandigarh spec pages already date the claim
from the earlier pass. Dayalbagh and Chandigarh's other surfaces still assert it.

**An expired cycle does not mean the grade is gone.** Reassessment is often
pending. It means we cannot assert it as current, which is the same treatment
IGNOU's A++ already gets.

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

### GSC diagnosis (2026-09-27) — no sitewide drop, but CGPA is masking one

**Why.** Rishi reported a performance drop. Six GSC exports merged into one daily
series say the opposite at 28 days (clicks +34%, CTR +28%) and the reported drop
exists only in the 7-day view, half of it the 11 Sep one-day spike rolling out of
the window.

The finding that matters is underneath: `/tools/cgpa-calculator` gained 1,820 clicks
while the whole site gained 1,228, so every other page lost ~590 net. On a
matched-URL basis university hubs are -38% clicks and -46% impressions, blogs -26%
and -24%. Position is flat and only one URL above 500 impressions vanished, so this
is demand contraction, not ranking loss or anything the August technical work broke.

Two corrections to standing notes. CGPA is now **91.4%** of captured impressions, not
the 51% recorded earlier. And the 15-16 Sep title rescue is no longer unmeasured: the
retitled posts held clicks flat (-1.3%) while 160 untouched posts fell -13.7%, though
the set was selected for low CTR and only 10 of 28 post-window days follow the change.

Full record: `audits/gsc-diagnosis-2026-09-27.md`.

### GSC diagnosis correction (2026-09-27) — /coupons and the homepage are not broken

**Why.** The diagnosis above listed five pages as "genuine ranking losses" from their
page-level average position. That metric is an average across every query a page
appears for, so it moves when the query mix moves, with no ranking change at all.
Rishi asked for /coupons and the homepage to be fixed. Neither is broken.

/coupons fell 12.42 -> 20.25 because Google switched to ranking the specific coupon
page over the generic index. /coupons/manipal-jaipur-online-mba-discount-coupon-2026
went 10 -> 26 clicks at position 3.92, and its two exact queries sit at positions 1.2
and 1.93. The cluster is flat, 44 -> 42 clicks on rising CTR. Rebuilding the index
would mean competing with our own better-ranking page.

The homepage fell 14.49 -> 19.39 while `edifyedu` sits at position 1.0. Brand
impressions fell 15 -> 9, which is search volume, not ranking. `edify` is a generic
English word carrying 344 impressions at position 5.7 and near-zero clicks, and it
alone drags the average down.

Both pages are technically sound: correct titles, descriptions, canonicals, indexable.
No code changed. Of the original five, only two are real: `phd full form` genuinely
fell 4.74 -> 11.46 off page one (untouched since 21 July, so Google reassessing, and a
zero-lead definition query), and /blog/affordable-online-mba-india-2026 lost 504 -> 120
impressions while the three pages it overlaps with all improved position, which points
at self-cannibalisation against /fees rather than an external loss.

`audits/gsc-diagnosis-2026-09-13.md` had already reached this conclusion under "Issue 4
corrected" and written "do not fix this". Flagging the same two pages again from the
same metric is the repeat this entry exists to stop.

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
