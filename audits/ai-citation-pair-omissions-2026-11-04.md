# Comparison pairs: what the new sections left out (2026-11-04)

Generated from `npx tsx scripts/check-pair-answers.mts --verbose`. "old" = hand-written pair in pairs.ts, "new" = derived pair added in this sprint. Each indented line is an existing FAQ or verdict sentence that states a fact differently from lib/data.ts; the new sections leave that fact type out. Any NIRF mention in an old pair drops NIRF from the new sections.

```
old  nmims-vs-symbiosis: which-is-better, side-by-side, syllabus-compared; +3 FAQ; omitted nirf/fee
     nmims-online nirf: NMIMS has NIRF #17 Management and Mumbai recruiter network
     nmims-online fee: You can afford Rs 3,15,000 and want maximum academic depth per semester
     symbiosis-university-online fee: Budget matters: save Rs 95,000-1,50,000 vs Symbiosis
old  amity-vs-manipal-jaipur: which-manipal, which-is-better, side-by-side, syllabus-compared; +4 FAQ; omitted fee/nirf
     amity-university-online fee: You qualify for MUJs 15% upfront discount (saves Rs 27,600)
     manipal-university-jaipur-online fee: You qualify for MUJs 15% upfront discount (saves Rs 27,600)
     both nirf: Which university has better NIRF rank?
old  amity-vs-nmims: which-is-better, side-by-side, syllabus-compared; +2 FAQ; omitted nirf
     amity-university-online nirf: NIRF Management rank (#17) matters more to your employer than University rank
     nmims-online nirf: NMIMS holds NIRF #17 Management rank
old  sikkim-manipal-vs-amity: which-manipal, which-is-better, side-by-side, syllabus-compared; +3 FAQ; omitted fee/nirf
     sikkim-manipal-university-online fee: This is unique and brings effective fee to Rs 84,000.
     sikkim-manipal-university-online nirf: NIRF #22 University rank and QS ranking matter
     amity-university-online fee: This is unique and brings effective fee to Rs 84,000.
old  amrita-vs-nmims: which-is-better, side-by-side, syllabus-compared; +4 FAQ; omitted nirf/fee
     amrita-vishwa-vidyapeetham-online nirf: NIRF #17 Management rank matters more than University rank
     nmims-online nirf: NIRF #8 University rank is a stronger credential signal for you
     nmims-online fee: You want per-spec fee flexibility (General Management from Rs 1,76,000)
old  manipal-jaipur-vs-nmims: which-manipal, which-is-better, side-by-side, syllabus-compared; +3 FAQ; omitted nirf
     manipal-university-jaipur-online nirf: NIRF Management #17 rank matters for your employer
     nmims-online nirf: NMIMS has NIRF #17 Management rank and stronger Mumbai BFSI recruiter connections
old  manipal-jaipur-vs-manipal-mahe: which-manipal, which-is-better, side-by-side, syllabus-compared; +4 FAQ; omitted nirf/fee
     manipal-university-jaipur-online nirf: NIRF #3 University rank is a genuine career differentiator for you
     manipal-academy-higher-education-online fee: MAHE costs Rs 1,08,000 more but carries stronger brand weight.
old  amity-vs-symbiosis: which-is-better, side-by-side, syllabus-compared; +3 FAQ; omitted fee/naac
     amity-university-online fee: Budget matters: save Rs 90,000
     amity-university-online naac: NAAC A++ is your primary credential priority
     symbiosis-university-online fee: Symbiosis costs Rs 1,45,000 more at sticker (Rs 90,000 more after Symbiosis 2+ years experience concession)
old  amity-vs-lpu: which-is-better, side-by-side, syllabus-compared; +3 FAQ; omitted naac/nirf
     amity-university-online naac: NAAC A++ is a priority credential
     both nirf: Amity has NIRF #22 University and QS Asia-Pacific ranking. LPU has NAAC A++ and NIRF #31 University. Both are UGC-DEB approved. Amity offers 19 specialisations;
old  lpu-vs-manipal-jaipur: which-manipal, which-is-better, side-by-side, syllabus-compared; +3 FAQ; omitted naac
     manipal-university-jaipur-online naac: NAAC A++ grade matters to your employer
old  chandigarh-vs-lpu: which-is-better, side-by-side, syllabus-compared; +3 FAQ; omitted naac/nirf/specCount
     chandigarh-university-online naac: NAAC A++ is a priority credential
     lovely-professional-university-online naac: Both are Punjab-based with NAAC A+ (CU) and A++ (LPU)
     lovely-professional-university-online nirf: CU has NIRF #19 University and PwC triple certification
     lovely-professional-university-online specCount: CU offers 26 specialisations (highest count in this tier)
old  amity-vs-chandigarh: which-is-better, side-by-side, syllabus-compared; +3 FAQ; omitted nirf/specCount
     amity-university-online nirf: CU has NIRF #19 University and PwC triple certification
     amity-university-online specCount: CU offers 26 specialisations
old  manipal-jaipur-vs-chandigarh: which-manipal, which-is-better, side-by-side, syllabus-compared; +4 FAQ; omitted nirf
     manipal-university-jaipur-online nirf: CU has PwC triple certification and NIRF #19 University
old  jain-vs-lpu: which-is-better, side-by-side, syllabus-compared; +2 FAQ; omitted specCount
     lovely-professional-university-online specCount: You want 19 specialisations including dual-domain AI specs
old  amity-vs-jain: which-is-better, side-by-side, syllabus-compared; +3 FAQ; omitted naac/nirf
     amity-university-online naac: NAAC A++ is a priority credential
     both nirf: Amity has NIRF #22 University and QS ranking. JAIN has NAAC A++ and NIRF #62 University. Amity costs more but has international accreditation (WASC). JAIN is mo
old  ignou-vs-lpu: which-is-better, side-by-side, syllabus-compared; +3 FAQ
new  amity-vs-dy-patil: which-dy-patil, which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  amity-vs-srm: which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  ignou-vs-amity: which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  symbiosis-vs-manipal: which-manipal, which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  dy-patil-vs-manipal: which-manipal, which-dy-patil, which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  jain-vs-manipal: which-manipal, which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  srm-vs-manipal: which-manipal, which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  nmims-vs-dy-patil: which-dy-patil, which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  nmims-vs-jain: which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  nmims-vs-mahe: which-manipal, which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  bits-pilani-vs-nmims: which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  vit-vs-srm: which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  jain-vs-amrita: which-is-better, side-by-side, syllabus-compared; +6 FAQ
new  dy-patil-vs-symbiosis: which-dy-patil, which-is-better, side-by-side, syllabus-compared; +6 FAQ
check-pair-answers: OK (30 MBA pairs)
```
