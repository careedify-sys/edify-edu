# UGC-DEB reconciliation — August 2026 lists

**Run date:** 2026-08-27 · **Analyst:** Claude (for Rishi Kumar)
**Status:** analysis complete, no live data mutated. Decisions pending on §7.

---

## 1. The two source documents

| File | Shape | Rows | Programme rows |
|---|---|---|---|
| `140_upload_RecognitionDetails_20260820125501.pdf` | S.No · State · Type of HEI · HEI Name · No. of programmes · Programmes | 124 | 864 |
| `UGC_20260818120433_1.pdf` | S.No · State · HEI Name & Type · **Period of recognition** · No. of programmes · Programmes | 18 | 66 |

142 rows, **140 distinct HEIs** (Manav Rachna and Amity UP appear in both).

### Scope caveat — read this before acting on any absence

Neither PDF carries a title, preamble or scope statement. Nothing in either
document says "complete list of entitled institutions". Three observations say
these are **recognition-grant lists, not the cumulative standing register**:

1. **IGNOU is absent from both.** IGNOU is the national open university created
   by an Act of Parliament. Its absence from a complete DEB register is not
   credible, so the register is not what these files are.
2. **Programme counts are far below known entitlements.** University of Mumbai
   shows 1 programme (MA Sociology). IIIT shows 1 (MSc Data Science). Christ
   shows 7. These read as grants made in one cycle, not lifetime totals.
3. The second file is explicitly period-scoped, with a *Period of Recognition*
   column naming the academic sessions each grant covers.

**Therefore: absence from these documents is a verification trigger, not proof
that entitlement was withdrawn.** Nothing in §5 or §6 below should be published
as "lost UGC-DEB approval" without a check at `deb.ugc.ac.in`.

### Defects in the UGC documents themselves

- Duplicate S.No in the main list: **47, 48, 100, 106**. S.No **108 is skipped**.
- Duplicate S.No **12** in the addendum. S.No **5 is skipped**.
- Two rows state a programme count higher than the programmes printed:
  - #2 Koneru Lakshmaiah Education Foundation — states 08, prints 6.
  - #28 Manav Rachna IIRS — states 10, prints 9 (the list jumps from `1)` to `3)`).

---

## 2. Method

`pdftotext -layout` and `pdftotext -table` both interleave the page watermark
("UNIVERSITY GRANTS COMMISSION") into the HEI-name column and are unusable.
`pdftotext -raw` preserves content-stream order, which for these tables is
clean cell-by-cell output.

```
pdftotext -raw <pdf> audits/ugc-deb-2026-08/{main,addendum}.raw.txt
node scripts/ugc-deb/parse-main-list.js          -> main.json      (124 records)
node scripts/ugc-deb/parse-addendum-list.js      -> addendum.json  (18 records)
node_modules/.bin/tsx scripts/reconcile-ugc-deb.ts   -> reconciliation.json + 2 CSVs
node_modules/.bin/tsx scripts/ugc-deb-exposure.ts    -> exposure.csv
```

Every parsed record carries the UGC's own stated programme count, so a parse
loss shows up as a mismatch. After the fixes, the only two mismatches left are
the UGC's own arithmetic errors named above.

Name matching was **not** left to the fuzzy matcher. Token-overlap scoring
produced confident false positives wherever one distinctive word is shared
(Sikkim Manipal → Manipal Academy, IIIT → Bangalore University, University of
Mumbai → D.Y. Patil Navi Mumbai, ARKA JAIN → JAIN). All 128 site records were
adjudicated by hand; the table lives in `scripts/reconcile-ugc-deb.ts`.

---

## 3. Headline numbers

| | |
|---|---|
| Site universities | 128 |
| Matched to a row in the new lists | **122** |
| No row in either document | **6** |
| On the new lists, not on the site | **22** |
| Site programmes with no matching UGC programme row | **21** across 14 universities |
| …of those, on an **indexable** hub page | **14** |
| Duplicate site records (two IDs, one real university) | **4 pairs** |

---

## 4. Site universities with no row in either document

Every one of these currently ships `ugc: true` and `UGC DEB` in `approvals`,
and every hub they publish is indexable.

| ID | Hubs | Indexable | Notes |
|---|---|---|---|
| `ignou-online` | 7 | 7 | Central open university by Act of Parliament. Absence almost certainly means these lists are not the register. **Highest content exposure: 77 blog posts mention IGNOU**, plus a dedicated review post. |
| `shobhit-university-online` | 4 | 4 | Shobhit Institute of Engineering & Technology, Meerut. |
| `bits-pilani-work-integrated-online` | 1 | 1 | WILP runs under a separate UGC framework, not DEB entitlement. Site frames it as an online degree. 15 blog posts. |
| `op-jindal-global-university-online` | 1 | 1 | Named in `ugc-deb-approved-universities-list-2026`. |
| `shiv-nadar-university-online` | 1 | 1 | 1 blog post. |
| `alvas-college-online` | 1 | 1 | An autonomous **college**, not a university. These lists only carry HEIs, so it could never appear. Worth deciding whether it belongs in a UGC-DEB comparison set at all. |

Confirmed absent by direct string search of the raw extracts for SHOBHIT, ALVA,
NADAR, PILANI, JINDAL, INDIRA, IGNOU, MEERUT, SONIPAT — zero hits in both files.

---

## 5. Programme-level gaps on indexable hubs

Site offers the programme; the new lists show no matching programme row for
that university. Full set in `programme-gaps.csv`, exposure ranking in
`exposure.csv`.

| Hub | Gap | Why it indexes |
|---|---|---|
| `/universities/university-of-mumbai-online/mba` | MBA | fee |
| `/universities/university-of-madras-online/mba` | MBA | content + fee |
| `/universities/madurai-kamaraj-university-online/mba` | MBA | fee |
| `/universities/iiit-bangalore-online/mba` | MBA | fee |
| `/universities/dr-babasaheb-ambedkar-open-university-online/mba` | MBA | fee |
| `/universities/christ-university-online/bba` | BBA | fee |
| `/universities/karnataka-state-open-university-online/bba` | BBA | fee |
| `/universities/karnataka-state-open-university-online/bca` | BCA | fee |
| `/universities/gls-university-online/bca` | BCA | content |
| `/universities/parul-university-online/bcom` | B.Com | fee |
| `/universities/manav-rachna-online/bcom` | B.Com | fee |
| `/universities/jamia-hamdard-online/bcom` | B.Com | fee |
| `/universities/mangalayatan-university-online/ba` | BA | fee |
| `/universities/kalinga-institute-industrial-technology-online/ba` | BA | fee |

The remaining 7 gaps sit on hubs already `noindex` under
`shouldIndexProgrammeHub`, so they carry no published claim.

Two worth singling out:

- **University of Mumbai** — the new list grants exactly one programme
  (MA Sociology). The site publishes BBA, BCA, MA, MBA and MCA.
- **IIIT** — `iiit-bangalore-online` carries `name: "INTERNATIONAL INSTITUTE OF
  INFORMATION TECHNOLOGY"` and `state: TELANGANA`, i.e. IIIT **Hyderabad**,
  under a **bangalore** slug. The UGC row (main #101, Telangana) grants MSc Data
  Science only; the site publishes an MBA. Both halves need a decision.

---

## 6. Duplicate site records

Four pairs of site IDs resolve to a single UGC row, i.e. the same real
university is in `lib/data.ts` twice:

| UGC row | Site IDs |
|---|---|
| main #29 Shree Guru Gobind Singh Tricentenary | `sgt-university-online` · `shree-guru-gobind-singh-tricentenary-university-online` |
| main #92 Vellore Institute of Technology | `vit-university-online` · `vit-vellore-online` |
| main #84 Shanmugha Arts, Science, Technology & Research Academy | `sastra-university-online` · `shanmugha-arts-science-technology-research-online` |
| main #62 Kalinga Institute of Industrial Technology | `kiit-university-online` · `kalinga-institute-industrial-technology-online` |

Consolidating these changes live URLs, so it is a separate decision from this
audit. Recorded here so it is not rediscovered a third time.

---

## 7. On the new lists, absent from the site

22 HEIs, i.e. coverage opportunities rather than risks.

**Main list (15):** Mohan Babu University · Sri Venkateswara University ·
Pt. Sundarlal Sharma (Open) University · Central Sanskrit University ·
Sri Siddhartha Academy of Higher Education · St. Aloysius · REVA University ·
University of Calicut · Amity University (Rajasthan) · Central University of
Tamil Nadu · Saveetha Institute of Medical and Technical Sciences · Bennett
University · Choudhary Charan Singh University · Dr. B.R. Ambedkar University ·
Swami Rama Himalayan University

**Addendum (7):** Silver Oak University · BML Munjal University ·
Srinivas University · Sandip University · Ajeenkya D.Y. Patil University ·
Atlas SkillTech University · Dr. B.R. Ambedkar Open University (Telangana)

Highest programme counts, so likely highest search demand: Pt. Sundarlal Sharma
(12), Choudhary Charan Singh (12), REVA (9), University of Calicut (9), Amity
Rajasthan (9), Dr. B.R. Ambedkar University (8).

---

## 8. What was changed, and what was not

**Changed — new files only, no existing data touched:**

- `scripts/ugc-deb/parse-main-list.js`, `scripts/ugc-deb/parse-addendum-list.js`
- `scripts/reconcile-ugc-deb.ts`, `scripts/ugc-deb-exposure.ts`
- `audits/ugc-deb-2026-08/` — raw extracts, parsed JSON, reconciliation, 3 CSVs, this file

**Deliberately not changed:**

- No `ugc` flag flipped and no `UGC DEB` string removed from `approvals` in
  `lib/data.ts`. Per §1, absence from these documents does not establish
  withdrawal, and stripping the claim from IGNOU on this evidence would make the
  site wrong in the other direction.
- No blog copy edited.
- No duplicate records consolidated (§6) — that moves live URLs.

There is no `ugc_deb_status` field in the schema. Entitlement is currently
modelled as `University.ugc: boolean` plus a `'UGC DEB'` string inside
`University.approvals: string[]`. If per-programme entitlement is going to be
tracked, that needs a new shape; the reconciliation JSON already holds the
per-university entitled-programme sets to seed it.

---

## 9. Open decisions

1. Check the six §4 universities at `deb.ugc.ac.in` — IGNOU first, since it
   carries the most published claims.
2. Decide `iiit-bangalore-online`: fix the slug/state mismatch, and whether the
   MBA hub survives.
3. Decide whether the 14 §5 hubs get a verification callout, a `noindex`, or
   stay as-is pending the portal check.
4. Review `blog/ugc-deb-approved-universities-list-2026` — its table leads with
   IGNOU. Every other headline row in that table checks out against the new lists.
5. Decide on §6 consolidation and §7 expansion.
