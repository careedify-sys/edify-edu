# Quality Assurance Checklist

**Blog**: {{university_name}} {{programme}} Review
**Generated**: {{timestamp}}
**Slug**: {{slug}}

Every row must PASS. If any row fails, fix before shipping.

## Hard-Gate Checks

| # | Check | Fail Condition | Status |
|---|---|---|---|
| 1 | Hallucinations / unverified confident claims | Any stat, rank, fee without official source | [ ] |
| 2 | Em dash count | More than 0 em dashes (—) in body | [ ] |
| 3 | AI-filler words | Any of: delve, comprehensive, testament, pivotal, landscape, navigate, robust, holistic, seamless, synergy, unlock, showcase, journey, realm | [ ] |
| 4 | AI sentence-starters | Any of: Furthermore, Moreover, Additionally, In conclusion | [ ] |
| 5 | Unverified stats | Any percentage, salary figure, placement number without source | [ ] |
| 6 | Competitor links | Any link to CollegeVidya, Shiksha, Careers360, Jaro, padhaao, admissiondiy, samarthedu, kollegeapply | [ ] |
| 7 | Duplicate internal links | Same Edify URL twice in body | [ ] |
| 8 | Meta description length | <150 or >160 characters | [ ] |
| 9 | Meta title length | >60 characters | [ ] |
| 10 | PAS intro length | <50 or >80 words | [ ] |
| 11 | H1 in body | Any H1 tag inside content HTML | [ ] |
| 12 | Fees flagged indicative | Fee section missing "verify at official portal" directive | [ ] |
| 13 | Active voice | Passive construction in fees, eligibility, or final word | [ ] |
| 14 | Short paragraphs | Any paragraph longer than 4 sentences | [ ] |
| 15 | Author name | Not "Rishi Kumar" | [ ] |
| 16 | FAQs format | Keys other than q/a, or Markdown inside values | [ ] |
| 17 | SVG accessibility | Missing role="img" or aria-label on any figure | [ ] |
| 18 | Unique angles count | Fewer than 3 angles competitors do not cover | [ ] |
| 19 | Internal links count | <5 or >10 | [ ] |
| 20 | External sources count | <3 or >5 primary sources | [ ] |

---

## Evidence Log

Populate this section with the actual findings from the scan:

### Research Phase
- **Top 3 SERP competitors**: {{list}}
- **Word counts**: {{competitor_1}} / {{competitor_2}} / {{competitor_3}}
- **Gaps identified**: {{bullet list of gaps}}

### Fee Verification
- **Portal source**: {{official_portal_url}}
- **Portal fee**: INR {{portal_total}} / INR {{portal_per_sem}} per sem
- **Input override**: INR {{input_total}} / INR {{input_per_sem}} per sem
- **Discrepancy present**: {{yes/no}}
- **Resolution**: {{present both / used portal / used input}}

### Unique Angles Used (must be 3+)
1. {{angle_1}}
2. {{angle_2}}
3. {{angle_3}}
4. {{angle_4}} (optional)
5. {{angle_5}} (optional)

### Internal Links Audit
| URL | Link Text | Position |
|---|---|---|
| {{url_1}} | {{text_1}} | {{section_1}} |
| {{url_2}} | {{text_2}} | {{section_2}} |

(No duplicates. 5-10 total.)

### External Sources Audit
| Source | URL | Type |
|---|---|---|
| {{source_1}} | {{url_1}} | Official portal |
| {{source_2}} | {{url_2}} | UGC-DEB |
| {{source_3}} | {{url_3}} | NAAC |

(3-5 primary only. No competitors.)

---

## Overall Status

**[ ] PASS** — all hard-gate checks passed, ready for CMS upload
**[ ] FAIL** — {{count}} checks failed, do not ship

If FAIL, list each failing row with the exact text that triggered the failure, and what fix was applied.
