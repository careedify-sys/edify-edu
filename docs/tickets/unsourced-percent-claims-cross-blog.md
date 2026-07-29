# Ticket: Unsourced percent-claims across ROI, acceptance, and completion sections (cross-blog)

**Status:** Open (P3, needs sourcing or qualitative rewrite)
**Created:** 2026-07-29
**Category:** Content accuracy — unsourced numeric claims

## Problem

During the workload/mechanics pillar push (commits after `3930ef6`), we
stripped every unsourced hours-per-week and live-session-hours claim from
`online-mba-for-working-professionals-india` and
`is-online-mba-worth-it-2026`. In the process we spotted a second class of
unsourced numeric claim in the same posts that is equally load-bearing and
equally undefended: completion-rate percentages, salary-uplift percentages,
and the online-versus-distance acceptance delta.

These claims are quoted as fact, would need a citation to hold up under
review, and are exactly the pattern the locked amount rule and today's fee
cleanups are meant to prevent from drifting further.

Two attributed claims in the same posts are defensible and stay untouched:
the **Naukri 2025 survey of 1,200 HR managers** (employer acceptance table)
and the **UGC "179% jump 2020-2022" enrolment stat**.

## Claims to fix

### `is-online-mba-worth-it-2026`

1. **Completion rates by mode** (in the "Completion Rates: Why Mode of Study
   Matters" section and mirrored in FAQ 23):
   - Online MBA (UGC-DEB approved): 60 to 75 percent complete in 2 years
   - NMIMS CDOE: 50 to 60 percent in 2 years
   - IGNOU distance MBA: 35 to 45 percent in 2 years
   - State distance programmes: 25 to 40 percent in 2 years

2. **Acceptance-delta claim** (in body prose and repeated in FAQ 22):
   > "online MBA acceptance from NAAC A or A+ universities runs 10 to 15
   > percentage points higher across most categories"

3. **Salary-upgrade callout** (in the one-line frame at the top):
   > "30-50 percent salary upgrade within 1-2 years for committed students"

### `online-mba-for-working-professionals-india`

4. **Salary-uplift range** in the verdict paragraph:
   > "20-40 percent salary upgrade"
   (Additional LPA figures throughout the ROI tables are illustrative math
   rather than factual claims; keeping those in scope only if we decide the
   post needs a broader re-audit.)

## Provenance (why this claim has no source)

The completion-rate claim in `is-online-mba-worth-it-2026` (claim 1 above)
was not authored fresh in that post. It was inherited from
`is-distance-mba-worth-it-india-2026` during consolidation 4 on 2026-07-29,
which folded the distance-MBA post's content into the online-MBA post. The
claim carried its lack of sourcing across the merge.

This is a class of failure worth naming: **consolidation merges can carry
unsourced claims from weaker posts into stronger ones**, and the stronger
post inherits the credibility of its new home. A merged claim reads as if
the merged post authored and vetted it, when in fact neither post ever did.

Add to the consolidation checklist for future merges: for every numeric
claim in the source post that is not attributed to a named study or dataset,
either find a source, rewrite qualitatively, or drop before the merge lands.
Do not let the merge itself be the moment an unsourced claim gets promoted.

An earlier iteration of this ticket speculated the same claim may have
propagated to `online-mba-after-career-break-2026`. That was incorrect; the
career-break post's percentages are all attributed (Ashoka 49%, GMAC 90%/57%,
UGC 45/50). No propagation to that post to fix. The two posts listed above
are the current fix scope.

## Fix options

### Option A — source the claims

Find primary-source citations (UGC completion-rate studies, sector-specific
placement reports, published salary surveys). If credible sources exist and
match the claimed ranges within a defensible margin, attribute them inline
in the same way the Naukri 2025 survey is attributed. If they do not exist
or diverge from the quoted ranges, fall back to Option B.

### Option B — qualitative rewrite (same treatment as the hours-per-week strip)

Replace each numeric range with qualitative framing that carries the same
narrative point without a spurious specificity:

- Completion rates → "Online MBA programmes from UGC-DEB approved
  universities have meaningfully higher completion rates than pure distance
  MBA programmes, driven by live-session structure and career-service
  engagement. Ask the specific university for their published completion
  rate before enrolling. A university that will not share it is telling
  you something."
- Acceptance delta → "Online MBA acceptance from NAAC A or A+ universities
  is generally higher than distance MBA acceptance in the same sector.
  See the attributed Naukri 2025 table for the distance-MBA baseline; ask
  employers in your target sector directly for their current position on
  online MBA specifically."
- Salary upgrades → "Working professionals typically use the credential
  for internal promotion or lateral move within the first 12-24 months
  post-completion. The salary outcome depends on your pre-MBA base, sector,
  and how you use the two years alongside the degree. Our online MBA
  salary guide has industry-wise and experience-wise breakdowns from
  attributed sources."

Recommend Option B as the default unless Option A produces a credible
source within a reasonable research window. The mechanics-pillar push
already established the pattern: qualitative framing plus counsellor-and-
alumni-verification instructions carries the reader load without inventing
specificity.

## Why this matters

Today's mechanics pillar explicitly refuses to give a weekly hours figure,
and explains why: unsourced ranges are what generic guides do, and the
honest picture varies more by person than by programme. That refusal is
undermined if adjacent posts on the same site cite equally unsourced
completion and salary percentages as fact. Cross-post consistency is the
whole point.

The Naukri survey citation and UGC enrolment stat show what a defensible
number looks like on this site. The claims above do not meet that bar and
should either meet it or be rewritten.

## Cross-refs

- Commit that established the "no unsourced hours figures" pattern:
  women's-pillar strip (women post FAQ 3 + delivery-format bullet)
- Commit that extended the pattern across working-pro and is-worth-it:
  mechanics-pillar push (this commit)
- Related tickets: `docs/tickets/blog-drift-scanner-v3.md` (drift scanner
  should flag unattributed percentage claims in the same class)
