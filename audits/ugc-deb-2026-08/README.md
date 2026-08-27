# UGC-DEB reconciliation — August 2026 lists

**Run date:** 2026-08-27 · **Analyst:** Claude, for Rishi Kumar
**Status:** analysis complete. No live data mutated. Plan in §8, working lists in §9.

> **Rev 3 (2026-08-27).** Rishi: MAHE, Amrita and VIT are not Institutions of
> Eminence. That claim was mine from background knowledge rather than from these
> documents, and it is withdrawn. IoE membership is not establishable from either
> PDF, so every IoE item below now waits on the MoE source. Shobhit is **on hold**
> at Rishi's instruction. Three working lists added as §9.
>
> **Rev 2 (2026-08-27).** IGNOU does not need DEB approval (IGNOU Act 1985), and
> BITS Pilani, O.P. Jindal and Shiv Nadar are Institutions of Eminence, which may
> launch online programmes without prior DEB approval. Amity Rajasthan's
> programmes are merged into Amity Noida on the site. §3 was rewritten and the
> headline count of "missing" universities fell from six to one.

---

## 1. Both PDFs, fully covered

| File | Shape | Rows | Parsed | Matched to a site record | No site record | Programme rows |
|---|---|---|---|---|---|---|
| `140_upload_RecognitionDetails_20260820125501.pdf` | S.No · State · Type of HEI · HEI Name · Count · Programmes | 124 | 124 | 110 | 14 | 864 |
| `UGC_20260818120433_1.pdf` | S.No · State · HEI Name & Type · **Period of recognition** · Count · Programmes | 18 | 18 | 11 | 7 | 66 |

Every row in both files is accounted for: 142 rows, **140 distinct HEIs**
(Manav Rachna and Amity UP appear in both files, the addendum granting them
further programmes).

From the site side, of 128 records: **111** cite the main list only, **9** cite
the addendum only, **2** cite both, **6** cite neither.

The 9 that exist *only* because the addendum was read — they would have looked
unlisted on the main file alone — are `assam-don-bosco-university-online`,
`ganpat-university-online`, `amet-university-online`, `jaypee-university-online`,
`northcap-university-online`, `jagannath-university-online`,
`teerthanker-mahaveer-university-online`, `subharti-university-online`,
`arka-jain-university-online`.

### Defects in the UGC documents themselves

- Duplicate S.No in the main list: **47, 48, 100, 106**. S.No **108 is skipped**.
- Duplicate S.No **12** in the addendum. S.No **5 is skipped**.
- Two rows state a count higher than the programmes printed: #2 Koneru
  Lakshmaiah states 08 and prints 6; #28 Manav Rachna states 10 and prints 9,
  its numbering jumping straight from `1)` to `3)`.

### What these documents are

Neither PDF carries a title, preamble or scope statement, so their exact scope
cannot be established from the files. What can be said: the addendum is
explicitly **incremental** — it grants named programmes for named sessions to
universities that already appear on the main list. And several main-list rows
sit well below known catalogues (University of Mumbai 1 programme, IIIT 1,
Christ 7), which is consistent with a single mode or cycle rather than a
lifetime cumulative register.

**So absence from these files has four different meanings, and only one of them
is a problem.** Classify before acting: exempt by statute, exempt as an IoE, not
an HEI at all, or genuinely unlisted. Only the last needs a portal check.

---

## 2. Method

`pdftotext -layout` and `-table` both interleave the page watermark
("UNIVERSITY GRANTS COMMISSION") into the HEI-name column and are unusable.
`-raw` preserves content-stream order, which for these tables is clean
cell-by-cell output.

```
pdftotext -raw <pdf> audits/ugc-deb-2026-08/{main,addendum}.raw.txt
node scripts/ugc-deb/parse-main-list.js          -> main.json      (124 records)
node scripts/ugc-deb/parse-addendum-list.js      -> addendum.json  (18 records)
node_modules/.bin/tsx scripts/reconcile-ugc-deb.ts   -> reconciliation.json + 2 CSVs
node_modules/.bin/tsx scripts/ugc-deb-exposure.ts    -> exposure.csv
```

Every parsed record carries the UGC's own stated programme count, so a parse
loss surfaces as a mismatch. After the parser fixes, the only two mismatches
left are the UGC's own arithmetic errors above.

Name matching is **hand-adjudicated, not fuzzy**. Token-overlap scoring produced
confident false positives wherever one distinctive word is shared: Sikkim
Manipal matched Manipal Academy, IIIT matched Bangalore University, University
of Mumbai matched D.Y. Patil Navi Mumbai, ARKA JAIN matched JAIN. The mapping
table is in `scripts/reconcile-ugc-deb.ts`.

---

## 3. The six records with no row — classified

| Record | Class | Reading |
|---|---|---|
| `ignou-online` | **Exempt, statutory** | IGNOU Act 1985 confers its own ODL and online authority. No DEB entitlement required. |
| `bits-pilani-work-integrated-online` | **Exempt, IoE** | Institution of Eminence. May launch online programmes without prior DEB approval. |
| `op-jindal-global-university-online` | **Exempt, IoE** | Institution of Eminence. |
| `shiv-nadar-university-online` | **Exempt, IoE** | Institution of Eminence. |
| `alvas-college-online` | **Not an HEI** | An autonomous **college**. DEB entitlement is granted to HEIs, so it can never appear on these lists in its own right. |
| `shobhit-university-online` | **Genuinely unlisted — ON HOLD** | Shobhit Institute of Engineering & Technology, Meerut. No exemption applies. 4 hubs, all 4 indexable. Rishi has parked this; no action, no portal check, no page change until he says otherwise. |

### The finding this exposes

The exemptions are not the problem. **The labels are.** Three of the four exempt
records state the wrong basis for their recognition:

| Record | `approvals` today | Should say |
|---|---|---|
| `ignou-online` | `UGC DEB`, `NAAC A++`, `AICTE`, `Central University` | Central Open University (IGNOU Act 1985) |
| `bits-pilani-work-integrated-online` | `UGC DEB`, `NAAC A+`, `NIRF #7 (University)`, `AICTE`, `WES Recognised` | Institution of Eminence (MoE) |
| `shiv-nadar-university-online` | `UGC DEB`, `NAAC A`, `NIRF #57 (University)` | Institution of Eminence (MoE) |
| `op-jindal-global-university-online` | `UGC Recognised`, `NAAC A`, `Institution of Eminence (MoE)`, … | **already correct** |

O.P. Jindal is the template. The other three claim an approval that does not
apply to them, which is exactly the kind of statement a competitor gap-analysis
would pick up.

**Which universities hold IoE status cannot be read from these PDFs.** The three
IoEs above are on Rishi's authority, not the documents'. Before any IoE label is
added or removed anywhere, the MoE's own list of Institutions of Eminence has to
be the source. Treat every IoE statement in this file as pending that check.

---

## 4. Programme gaps carrying a published claim

21 site programmes have no matching programme row for that university. 14 sit on
hubs that `shouldIndexProgrammeHub` lets index, so those 14 are published
claims; the other 7 are already `noindex`.

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

Note the mode caveat in §1: a state university's other programmes may sit under
an ODL entitlement not covered by these files. The MBA rows are still the ones
to check first, because an MBA hub is the highest-intent page on the site.

**`iiit-bangalore-online` is a compound defect.** The record carries
`name: "INTERNATIONAL INSTITUTE OF INFORMATION TECHNOLOGY"` with
`state: TELANGANA` — that is IIIT **Hyderabad**, sitting under a **bangalore**
slug. Its UGC row grants MSc Data Science only, and the site publishes an MBA.

---

## 5. Four duplicate university records

Four pairs of site IDs resolve to a single UGC row, so the same real university
is in `lib/data.ts` twice.

| UGC row | Site IDs |
|---|---|
| main #29 · Shree Guru Gobind Singh Tricentenary | `sgt-university-online` · `shree-guru-gobind-singh-tricentenary-university-online` |
| main #92 · Vellore Institute of Technology | `vit-university-online` · `vit-vellore-online` |
| main #84 · Shanmugha Arts, Science, Technology & Research Academy | `sastra-university-online` · `shanmugha-arts-science-technology-research-online` |
| main #62 · Kalinga Institute of Industrial Technology | `kiit-university-online` · `kalinga-institute-industrial-technology-online` |

---

## 6. What to add

### 6a. 21 listed HEIs the site does not cover

Amity Rajasthan (main #74) is **not** in this list — its programmes are merged
into Amity Noida on the site, and the reconciliation now maps both rows to
`amity-university-online`.

**Main list (14):** Pt. Sundarlal Sharma (Open) University · Choudhary Charan
Singh University · REVA University · University of Calicut · Dr. B.R. Ambedkar
University · Central Sanskrit University · Mohan Babu University · Sri
Venkateswara University · Swami Rama Himalayan University · Central University
of Tamil Nadu · St. Aloysius · Bennett University · Sri Siddhartha Academy of
Higher Education · Saveetha Institute of Medical and Technical Sciences

**Addendum (7):** Silver Oak University · Srinivas University · Ajeenkya D.Y.
Patil University · Dr. B.R. Ambedkar Open University (Telangana) · Sandip
University · Atlas SkillTech University · BML Munjal University

Largest programme counts, the closest proxy available for demand: Pt. Sundarlal
Sharma (12), Choudhary Charan Singh (12), REVA (9), University of Calicut (9),
Dr. B.R. Ambedkar University (8).

### 6b. 167 entitled programmes inside universities already covered

The bigger opportunity. 66 universities on the site hold UGC entitlement for
programmes the site does not list, at zero new-university cost.

| University | Entitled, not offered |
|---|---|
| `sastra-university-online` | B.Com, BBA, BCA, M.Com, MA, MCA, MSc |
| `mahatma-gandhi-university-online` | B.Com, BA, BBA, M.Com, MA, MSc |
| `kalasalingam-university-online` | B.Com, BBA, BCA, MA, MCA, MSc |
| `bharathiar-university-online` | B.Com, BA, M.Com, MA, MBA, MCA |
| `jamia-millia-islamia-online` | B.Com, BA, BBA, M.Com, MA |
| `noida-international-university-online` | B.Com, BCA, M.Com, MA, MSc |
| `kiit-university-online` | BBA, BCA, MBA, MCA, MSc |
| `guru-kashi-university-online` | BBA, BCA, M.Com, MA, MBA |
| `jaipur-national-university-online` | B.Com, BCA, MA, MBA, MSc |
| `university-of-madras-online` | B.Com, BA, BBA, M.Com, MA |
| `alagappa-university-online` | BA, BBA, M.Com, MA, MBA |
| `amity-university-online` | BA, M.Com, MA, MSc |

Full list in `university-status.csv`, column `ugc_entitled` against `offered`.

### 6c. The IoE badge — blocked on a source

`bits-pilani-work-integrated-online` and `shiv-nadar-university-online` should
carry an `Institution of Eminence (MoE)` string, since that is the basis on which
they deliver online programmes. `op-jindal-global-university-online` already
does and is the template.

Whether any **other** site record qualifies is an open question that these PDFs
cannot answer. Do not extend the badge past those three without the MoE list.

---

## 7. What was changed, and what was not

**Added — new files only, no existing data touched:**

- `scripts/ugc-deb/parse-main-list.js`, `scripts/ugc-deb/parse-addendum-list.js`
- `scripts/reconcile-ugc-deb.ts`, `scripts/ugc-deb-exposure.ts`
- `audits/ugc-deb-2026-08/` — raw extracts, parsed JSON, reconciliation, 3 CSVs, this file

**Deliberately not changed:** no `ugc` flag flipped, no `approvals` string
edited, no blog copy touched, no duplicates consolidated. All of §8 is proposed,
not applied.

**Schema note.** There is no `ugc_deb_status` field to update. Entitlement is
modelled as `University.ugc: boolean` plus a `'UGC DEB'` string inside
`University.approvals: string[]` — one flag for the whole university, with no
room for the programme-by-programme grants these documents describe, and no way
to express "recognised on a basis other than DEB". `reconciliation.json` already
holds the entitled-programme set per university to seed a better shape.

---

## 8. Plan

### Remove

| # | Action | Scope |
|---|---|---|
| R1 | Drop `UGC DEB` from `approvals`, replace with the correct basis | `ignou-online`, `bits-pilani-work-integrated-online`, `shiv-nadar-university-online` |
| R2 | Drop `UGC DEB` from an autonomous college that cannot hold it | `alvas-college-online` (or retire the record) |
| R3 | Remove the MBA and fix the slug/state mismatch | `iiit-bangalore-online` |
| R4 | Retire one record from each duplicate pair, with redirects | 4 pairs, §5 |
| R5 | Decide per hub: drop the programme, add a verification callout, or `noindex` | 14 hubs, §4 |

### Add

| # | Action | Scope |
|---|---|---|
| A1 | `Institution of Eminence (MoE)` to BITS Pilani and Shiv Nadar only | 2 records, §6c, blocked on V4 |
| A2 | A per-programme entitlement shape, seeded from `reconciliation.json` | schema |
| A3 | New university records | 21 HEIs, §6a |
| A4 | New programme hubs for entitlement already held | up to 167, §6b |
| A5 | An explainer on why IGNOU and IoEs need no DEB entitlement | blog and the four records |

### Verify first

| # | Action |
|---|---|
| V1 | ~~`shobhit-university-online` at `deb.ugc.ac.in`~~ — **ON HOLD** at Rishi's instruction |
| V4 | The MoE Institutions of Eminence list, before any IoE label is added anywhere |
| V2 | The 5 MBA gaps in §4, checking ODL vs Online mode, before touching any hub |
| V3 | `ugc-deb-approved-universities-list-2026` — its table leads with IGNOU, which now needs the exemption framing rather than a DEB claim |

R1 and R2 are label corrections with no URL impact and are safe to apply as soon
as you say go. A1 is also label-only but waits on V4. R3, R4 and R5 move or
remove live URLs. A3 and A4 are growth work, not corrections.

---

## 9. Working lists

Generated by `scripts/ugc-deb-worklists.ts`, regenerate any time.

| File | Contents |
|---|---|
| `worklist-1-missing-universities.md` | The 21 HEIs on the new lists that the site does not carry, ordered by programme count, each with its full granted programme list |
| `worklist-2-duplicates.md` | The 4 duplicate pairs, each with its render surface, sitemap surface, a proposed keep side, a merge note where the retired side carries extra programmes, and the exact redirect map |
| `worklist-3-unapproved-programmes.md` / `.csv` | The 21 programme gaps split into indexable (a live published claim) and not indexable (cleanup), each with what the UGC row grants instead and an empty `decision` column to fill in |

### One thing worth knowing about the redirect maps

A record's **render surface is wider than its sitemap presence**.
`app/universities/[id]/page.tsx` returns every `UNIVERSITIES` entry from
`generateStaticParams`, so a record's root page returns 200 whether or not
`valid-urls.json` lists it, and programme hubs render whenever middleware's
allowlist carries the pair. Reading redirect scope off `valid-urls.json` alone
undercounts it: on that basis all four pairs looked like zero redirects, when
the real figure is **15**.
