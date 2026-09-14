# Placeholder Fee Cluster Audit — 2026-08-21

Read-only enumeration of every (university, programme) pair affected by the
`₹60K – ₹200K` placeholder cluster and its wider family of
unresolvable fees (all rows `check:fees` currently suppresses).

**Filter** — a row qualifies when any of the following holds:
- **A**: `programDetails[P].fees === '₹60K – ₹200K'` (the literal placeholder in the on-page programme block).
- **B**: `programDetails[P].fees` is blank AND the university carries `feeMin=60000, feeMax=200000` (the top-level placeholder that `getReference` short-circuits for MBA only).
- **C**: any other row where `getDisplayFee` currently returns `ok: false` (rule 4a wide-span or 4b divergence). Included so the "resolvable-from-repo" flag catches SSODL-BCA-style easy wins across the whole suppressed set.

This yields the same 125 rows `npm run check:fees` reports as suppressed.

**Totals**: 125 programme rows across 59 universities.
**Resolvable from repo alone (programFees ref present)**: 4 row(s) — see the ⭐ rows below; each may resolve like the SSODL BCA fix did, without needing new portal research.

**getDisplayFee rule distribution across the cluster**:
- rule 4a: 78
- rule 4b: 47

**Live robots meta distribution**:
- noindex, follow: 78
- HTTP 404: 43
- index, follow: 2
- noindex, nofollow: 2

**Sitemap membership**: 2 present / 123 absent (of 125).

> **Design note — `check:fees` vs `shouldIndex` are not the same gate.**
> `shouldIndexProgrammeHub` (lib/seo/should-index.ts:39) uses
> `hasContentJson || feeOk` — either editorial content OR a verified fee is
> enough to index. `check:fees` treats any suppressed fee as a hard
> disqualifier regardless of editorial content. The two subsystems measure
> different things by design; a row that appears as `index, follow` while
> `check:fees` suppresses it is not a defect. The two `index, follow` rows
> in this cluster — `assam-don-bosco-university-online/mba` and
> `mahatma-gandhi-university-online/mba` — are the two best-performing hubs
> in the whole 82 (10 clicks @ pos 7.10 and 3 clicks @ pos 8.88 per GSC), so
> the OR is doing exactly what it should. Do not tighten the gate.

---

## Alagappa University Online
`alagappa-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹0.1L – ₹0.6L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Aligarh Muslim University Online
`aligarh-muslim-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Alliance University Online
`alliance-university-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹0.1L – ₹0.8L` | — | 160000 / 175000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| BBA | `₹0.2L – ₹1.1L` | — | 160000 / 175000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Andhra University Online
`andhra-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MCA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Anna University Online
`anna-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MCA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Assam Don Bosco University Online
`assam-don-bosco-university-online` — 4 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| BCA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |
| MBA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `index, follow` | yes | A: pd.fees=₹60K–₹200K literal |

## Bharathidasan University Online
`bharathidasan-university-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |
| MBA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |

## Bharati Vidyapeeth (Deemed to be University) Online
`bharati-vidyapeeth-university-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹60K – ₹200K` | — | 160000 / 160000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| BCA | `₹60K – ₹200K` | — | 160000 / 160000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |

## Central University of Himachal Pradesh Online
`central-university-himachal-pradesh-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |
| MCA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Chandigarh University Online
`chandigarh-university-online` — 3 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹0.3L – ₹1.9L` | — | 165000 / 220000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 165000 / 220000 | 4b | no | `HTTP 404` | no | C: other suppressed |
| MSc | `₹0.3L – ₹1.5L` | — | 165000 / 220000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Chitkara University Online
`chitkara-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹60K – ₹200K` | — | 200000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |

## Christ (Deemed to be University) Online
`christ-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹50K – ₹160K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Desh Bhagat University Online
`desh-bhagat-university-online` — 3 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| BBA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| MBA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |

## Dr. Babasaheb Ambedkar Open University Online
`dr-babasaheb-ambedkar-open-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Galgotias University Online
`galgotias-university-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| M.Com | `₹60K – ₹200K` | — | 80200 / 86400 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| MA | _(missing)_ | — | 80200 / 86400 | 4b | no | `HTTP 404` | no | C: other suppressed |

## GLA University Online
`gla-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹60K – ₹200K` | — | 140000 / 220000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |

## GLS University Online
`gls-university-online` — 6 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| BBA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| BCA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| M.Com | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |
| MBA | `₹0.5L – ₹3.0L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MCA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Gujarat University Online
`gujarat-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Guru Ghasidas Vishwavidyalaya (GGU) Online
`guru-ghasidas-vishwavidyalaya-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Hindustan Institute of Technology and Science (CODE) Online
`hindustan-institute-technology-online` — 3 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |
| BBA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |
| BCA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Indira Gandhi National Open University (IGNOU) Online
`ignou-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BCA | `₹21,600` | `49,800` ⭐ | 66000 / 66000 | 4b | no | `noindex, follow` | no | C: other suppressed |
| MCA | `₹27,000` | `50,800` ⭐ | 66000 / 66000 | 4b | no | `noindex, follow` | no | C: other suppressed |

## Indian Institute of Foreign Trade (IIFT) Online
`iift-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MBA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |

## Integral University Online
`integral-university-online` — 3 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BCA | `₹0.1L – ₹0.6L` | — | 110000 / 110000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 110000 / 110000 | 4b | no | `HTTP 404` | no | C: other suppressed |
| MCA | _(missing)_ | — | 110000 / 110000 | 4b | no | `HTTP 404` | no | C: other suppressed |

## JAIN (Deemed-to-be University) Online
`jain-university-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹0.3L – ₹2.8L` | — | 160000 / 196000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 160000 / 196000 | 4b | no | `HTTP 404` | no | C: other suppressed |

## Jaypee Institute of Information Technology Online
`jaypee-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹0.2L – ₹1.2L` | — | 175000 / 175000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## JSS Academy of Higher Education & Research (JSS AHER) Online
`jss-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹0.1L – ₹0.9L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Karnataka State Open University (KSOU) Online
`karnataka-state-open-university-online` — 3 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹0.1L – ₹0.7L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |
| MCA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Karunya Institute of Technology and Sciences (KCODE) Online
`karunya-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹0.1L – ₹0.9L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## KIIT Deemed to be University Online
`kiit-university-online` — 3 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |
| M.Com | `₹29K – ₹119K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Kurukshetra University Online
`kurukshetra-university-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹60K – ₹200K` | — | 102000 / 102000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| M.Com | `₹60K – ₹200K` | — | 102000 / 102000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |

## Lovely Professional University Online
`lovely-professional-university-online` — 6 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BA | `₹0.1L – ₹0.9L` | — | 161600 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| BBA | `₹0.2L – ₹1.5L` | — | 161600 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| BCA | `₹0.2L – ₹1.2L` | `1,22,400` ⭐ | 161600 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| M.Com | `₹20K – ₹70K` | — | 161600 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 161600 / 200000 | 4b | no | `HTTP 404` | no | C: other suppressed |
| MSc | `₹14K – ₹56K` | — | 161600 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## MADURAI KAMARAJ UNIVERSITY Online
`madurai-kamaraj-university-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BCA | _(missing)_ | — | 75000 / 180000 | 4b | no | `HTTP 404` | no | C: other suppressed |
| MCA | _(missing)_ | — | 75000 / 180000 | 4b | no | `HTTP 404` | no | C: other suppressed |

## Maharishi Markandeshwar (Deemed to be University) Online
`maharishi-markandeshwar-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹0.2L – ₹1.4L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Mahatma Gandhi University Online
`mahatma-gandhi-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MBA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `index, follow` | yes | A: pd.fees=₹60K–₹200K literal |

## Manav Rachna Online
`manav-rachna-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Mangalayatan University Online
`mangalayatan-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹31K – ₹103K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Manipal Academy of Higher Education (MAHE) Online
`manipal-academy-higher-education-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹0.3L – ₹1.7L` | — | 292000 / 292000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MSc | `₹60K – ₹240K` | — | 292000 / 292000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Manipal University Jaipur (MUJ) Online
`manipal-university-jaipur-online` — 4 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹0.2L – ₹1.0L` | — | 153000 / 180000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| M.Com | `₹30K – ₹120K` | — | 153000 / 180000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 153000 / 180000 | 4b | no | `HTTP 404` | no | C: other suppressed |
| MSc | `₹30K – ₹120K` | — | 153000 / 180000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Manonmaniam Sundaranar University Online
`manonmaniam-sundaranar-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Marwadi University Online
`marwadi-university-online` — 5 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹0.1L – ₹0.6L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| BBA | `₹0.2L – ₹1.2L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| BCA | `₹0.2L – ₹1.2L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |
| MSc | `₹25K – ₹100K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Mizoram University (MZU) Online
`mizoram-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## NMIMS (Narsee Monjee Institute of Management Studies) Online
`nmims-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹60K – ₹200K` | — | 196000 / 220000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| BBA | `₹60K – ₹200K` | — | 196000 / 220000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |

## Noida International University Online
`noida-international-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹0.2L – ₹1.1L` | — | 88500 / 97600 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Parul University Online
`parul-university-online` — 4 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹18K – ₹70K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| BCA | `₹0.1L – ₹0.9L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| M.Com | `₹15K – ₹60K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## P P Savani University Online
`pp-savani-university-online` — 5 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹0.2L – ₹1.2L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| BCA | `₹0.2L – ₹1.5L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| M.Com | `₹25K – ₹100K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |
| MSc | `₹32K – ₹130K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Sathyabama Institute of Science and Technology (Centre Online
`sathyabama-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MSc | _(missing)_ | — | 60000 / 200000 | 4b | no | `noindex, nofollow` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Savitribai Phule Pune University (SPPU) Online
`savitribai-phule-pune-university-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| BCA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |

## SGT University Online
`sgt-university-online` — 5 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| BBA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| BCA | `₹60K – ₹200K` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |
| MBA | `₹0.5L – ₹3.0L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MCA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

## Sharda University Online
`sharda-university-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹0.2L – ₹1.5L` | — | 140000 / 154500 | 4a | no | `noindex, follow` | no | C: other suppressed |
| BCA | `₹0.2L – ₹1.5L` | `1,20,000` ⭐ | 140000 / 154500 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Shoolini University Online
`shoolini-university-online` — 2 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹0.1L – ₹1.2L` | — | 130000 / 158000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 130000 / 158000 | 4b | no | `HTTP 404` | no | C: other suppressed |

## Sikkim Manipal University Online
`sikkim-manipal-university-online` — 4 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| B.Com | `₹0.1L – ₹0.8L` | — | 120000 / 120000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| BA | `₹0.1L – ₹0.8L` | — | 120000 / 120000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| M.Com | `₹18K – ₹75K` | — | 120000 / 120000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 120000 / 120000 | 4b | no | `HTTP 404` | no | C: other suppressed |

## Symbiosis School for Online and Digital Learning (SSODL), Pune Online
`symbiosis-university-online` — 3 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BSc | `₹0.2L – ₹1.5L` | — | 315000 / 370000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| MA | _(missing)_ | — | 315000 / 370000 | 4b | no | `HTTP 404` | no | C: other suppressed |
| MSc | `₹35K – ₹140K` | — | 315000 / 370000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## UNIVERSITY OF MUMBAI Online
`university-of-mumbai-online` — 3 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | _(missing)_ | — | 90000 / 200000 | 4b | no | `HTTP 404` | no | C: other suppressed |
| BCA | _(missing)_ | — | 90000 / 200000 | 4b | no | `HTTP 404` | no | C: other suppressed |
| MCA | _(missing)_ | — | 90000 / 200000 | 4b | no | `HTTP 404` | no | C: other suppressed |

## University of Petroleum & Energy Studies (UPES) Online
`upes-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BCA | `₹60K – ₹200K` | — | 175000 / 220000 | 4a | no | `noindex, follow` | no | A: pd.fees=₹60K–₹200K literal |

## Uttaranchal University Online
`uttaranchal-university-online` — 3 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BA | `₹0.1L – ₹0.7L` | — | 94000 / 98000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| BBA | `₹0.2L – ₹1.0L` | — | 94000 / 98000 | 4a | no | `noindex, follow` | no | C: other suppressed |
| BCA | `₹0.2L – ₹1.0L` | — | 94000 / 98000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Vels Institute of Science, Technology & Advanced Online
`vels-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | `₹0.1L – ₹0.8L` | — | 60000 / 200000 | 4a | no | `noindex, follow` | no | C: other suppressed |

## Vignan's Foundation for Science, Technology & Research Online
`vignan-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| BBA | _(missing)_ | — | 90000 / 90000 | 4b | no | `HTTP 404` | no | C: other suppressed |

## Vellore Institute of Science and Technology (VIT Online
`vit-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MSc | _(missing)_ | — | 160000 / 160000 | 4b | no | `noindex, nofollow` | no | C: other suppressed |

## Vivekananda Global University Online
`vivekananda-global-university-online` — 1 programme(s) in cluster

| Prog | pd.fees | programFees ref | uni feeMin/Max | Rule | ok | Live robots | In sitemap | Match |
|------|---------|-----------------|----------------|------|----|-------------|------------|-------|
| MA | _(missing)_ | — | 60000 / 200000 | 4b | no | `HTTP 404` | no | B: pd.fees blank + uni 60000/200000 placeholder |

---

## Resolvable-from-repo shortlist

Rows where `programFees[prog].fee` already carries a number. Two very different sub-classes:

### Candidate — programFees ref carries a specific number, portal confirmation still needed

`pd.fees` is a wide range the resolver refuses (rule 4a) and `programFees[prog].fee` is a specific figure. The specificity of `programFees` is not by itself verification — SSODL BCA was only safe to apply because Rishi's official portal table confirmed 157,500 independently. These two need the same one-line portal check before the swap.

| University | Prog | programFees ref | Current pd.fees | Current rule |
|------------|------|-----------------|-----------------|--------------|
| lovely-professional-university-online | BCA | `1,22,400` | `₹0.2L – ₹1.2L` | 4a |
| sharda-university-online | BCA | `1,20,000` | `₹0.2L – ₹1.5L` | 4a |

### Portal-check required — pd.fees and programFees disagree (rule 4b divergence)

Both fields carry specific numbers but they diverge > 25%, so the resolver suppresses. Picking one requires the university portal; do not treat these as automatic fixes.

| University | Prog | programFees ref | Current pd.fees | Current rule |
|------------|------|-----------------|-----------------|--------------|
| ignou-online | BCA | `49,800` | `₹21,600` | 4b |
| ignou-online | MCA | `50,800` | `₹27,000` | 4b |

---

## Status: parked pending portal research

Cluster is on hold until Rishi returns official portal numbers. GSC-ranked queue (37 of 82 non-404 rows earn traffic — 96 clicks / 31,617 impr; 45 rows sit under 9 impr/quarter and are deprioritised entirely).

**Portal-check order:**

1. `symbiosis-university-online` — MSc
2. `parul-university-online` — BCA
3. `nmims-online` — B.Com, BBA
4. `manipal-academy-higher-education-online` (MAHE) — B.Com, MSc
5. `manipal-university-jaipur-online` (MUJ) — B.Com, M.Com, MSc
6. `sikkim-manipal-university-online` — B.Com
7. `chandigarh-university-online` — MSc
8. `lovely-professional-university-online` — BCA (has candidate ref `1,22,400`, still needs portal confirm)
9. `sharda-university-online` — BCA (has candidate ref `1,20,000`, still needs portal confirm)
10. `shoolini-university-online` — BBA

The 43 HTTP 404 rows are a separate pass (programme-existence, not fee) and are handled outside this audit.
