// app/compare/[pair]/pairs.ts — Static comparison page configs

export type PairConfig = {
  uniA: string
  uniB: string
  program: 'MBA' | 'MCA' | 'BBA' | 'BCA'
  defaultSpec: string
  faqs: { q: string; a: string }[]
  verdictA: string[]
  verdictB: string[]
}

export const PAIRS: Record<string, PairConfig> = {
  /* ─── PROVEN DEMAND (6) ─── */
  'nmims-vs-symbiosis': {
    uniA: 'nmims-online',
    uniB: 'symbiosis-university-online',
    program: 'MBA',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is NMIMS or Symbiosis better for online MBA?', a: 'Both are premium. NMIMS has NIRF #17 Management and Mumbai recruiter network. Symbiosis (SSODL) has NAAC A++ (highest grade) and Pune academic heritage. Choose based on geography and budget.' },
      { q: 'What is the fee difference?', a: 'NMIMS costs Rs 1,96,000 to Rs 2,20,000. Symbiosis costs Rs 3,15,000 (Rs 3,70,000 without work-experience scholarship). Symbiosis is significantly more expensive.' },
      { q: 'Which has better NAAC grade?', a: 'Symbiosis holds NAAC A++ (highest possible). NMIMS holds NAAC A++. Both have the highest NAAC grade.' },
      { q: 'Does Symbiosis offer more subjects per semester?', a: 'Yes. Symbiosis is known for 10-12 subjects per semester (higher academic load). NMIMS has a standard 6-8 subject format. Symbiosis demands more study time.' },
      { q: 'Which is better for Pune-based careers?', a: 'Symbiosis carries stronger weight in Pune and Maharashtra. NMIMS carries stronger weight in Mumbai specifically. For broader Maharashtra, both work well.' },
    ],
    verdictA: ['Mumbai BFSI is your target (NMIMS has specific Mumbai connections)', 'Budget matters: save Rs 95,000-1,50,000 vs Symbiosis', 'You prefer standard academic load (6-8 subjects/sem)'],
    verdictB: ['You want the highest possible NAAC grade (A++) on your degree', 'Pune-region employers are your target', 'You can afford Rs 3.15L and want maximum academic depth per semester'],
  },
  'amity-vs-manipal-jaipur': {
    uniA: 'amity-university-online',
    uniB: 'manipal-university-jaipur-online',
    program: 'MBA',
    defaultSpec: 'marketing',
    faqs: [
      { q: 'Is Amity or MUJ better for online MBA?', a: 'Both are NAAC A+ and UGC-DEB approved. Amity has 19 specialisations and QS ranking. MUJ has Coursera Plus bundled and Manipal group brand. Choose based on spec variety vs platform perks.' },
      { q: 'What is the fee difference between Amity and MUJ?', a: 'Amity costs Rs 2,07,000 (one-time) to Rs 2,25,000 (standard). MUJ costs Rs 1,80,000 (or Rs 1,53,000 with 15% upfront discount). MUJ is more affordable.' },
      { q: 'Does MUJ include Coursera Plus?', a: 'Yes. MUJ bundles free Coursera Plus access throughout the programme. Amity does not include Coursera but offers broader specialisation options.' },
      { q: 'Which university has better NIRF rank?', a: 'Amity holds NIRF #22 University. MUJ holds NIRF rank in the University category as well. Both are comparable in NIRF positioning.' },
      { q: 'Can I get scholarships at both universities?', a: 'MUJ offers 5 scholarship categories including Defence, Divyaang, and Merit. Amity offers Defence, Divyaang, Alumni, Merit, and Sports scholarships. Both have multiple discount options.' },
    ],
    verdictA: ['You want 19 specialisation options', 'QS Asia-Pacific ranking matters for international portability', 'Your target is NCR-region employers'],
    verdictB: ['Coursera Plus free access adds genuine value to your learning', 'You want the Manipal group brand at a lower fee', 'You qualify for MUJs 15% upfront discount (saves Rs 27,000)'],
  },
  'amity-vs-nmims': {
    uniA: 'amity-university-online',
    uniB: 'nmims-online',
    program: 'MBA',
    defaultSpec: 'marketing',
    faqs: [
      { q: 'Is Amity or NMIMS better ranked in NIRF 2025?', a: 'NMIMS holds NIRF #17 Management rank. Amity holds NIRF #22 University rank. Both are strong. NMIMS is better positioned in the Management category specifically.' },
      { q: 'What is the fee difference between Amity and NMIMS online MBA?', a: 'Amity standard MBA costs Rs 2,25,000 (semester-wise, Rs 56,300/sem) or Rs 2,07,000 (one-time payment). NMIMS costs Rs 2,20,000 (semester-wise, Rs 55,000/sem) or Rs 1,96,000 (one-time). On a like-for-like semester basis, both are nearly identical. One-time payment saves Rs 18,000 at Amity and Rs 24,000 at NMIMS.' },
      { q: 'Does Amity offer specialisations that NMIMS does not?', a: 'Yes. Amity offers 19 specialisations including Healthcare, Hospitality, Insurance, and Retail. NMIMS offers 5-6 focused tracks. Amity has broader choice; NMIMS has deeper focus.' },
      { q: 'Which has better placements: Amity or NMIMS?', a: 'NMIMS has stronger Mumbai-centric BFSI recruiter connections. Amity has a larger pan-India alumni network. For Mumbai finance roles, NMIMS. For NCR and broad management, Amity.' },
      { q: 'Is Amity MBA valued more than NMIMS by employers?', a: 'Both are well-recognised. NMIMS carries stronger weight specifically in Mumbai financial services. Amity has broader geographic recognition due to 500+ hiring partners across India.' },
    ],
    verdictA: ['You want 19 specialisation options including niche tracks like Healthcare, Insurance, or Retail', 'Your target market is NCR or pan-India (not Mumbai-specific)', 'You value QS Asia-Pacific ranking and WASC/WES international accreditation'],
    verdictB: ['Your career target is Mumbai-centric BFSI or financial services', 'You prefer a focused 5-spec programme with deeper curriculum per track', 'NIRF Management rank (#17) matters more to your employer than University rank'],
  },
  'sikkim-manipal-vs-amity': {
    uniA: 'sikkim-manipal-university-online',
    uniB: 'amity-university-online',
    program: 'MBA',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is SMU or Amity better for online MBA?', a: 'Amity has 19 specs and NIRF #22 University. SMU has 5 specs at Rs 1,20,000 (nearly half of Amity). SMU is budget-friendly with Manipal brand. Amity is premium with broader choice.' },
      { q: 'What is the fee difference?', a: 'SMU costs Rs 1,20,000 flat. Amity costs Rs 2,07,000 (one-time). SMU saves Rs 1,05,000. Significant difference.' },
      { q: 'Does SMU have the same brand as MUJ?', a: 'No. SMU (Sikkim Manipal University) is a separate institution from MUJ (Manipal University Jaipur). Both are in the Manipal group but independently governed and accredited.' },
      { q: 'Does SMU offer Northeast scholarship?', a: 'Yes. SMU offers 30% scholarship for Northeast India and Sikkim residents. This is unique and brings effective fee to Rs 84,000.' },
      { q: 'Which has better placement support?', a: 'Amity has a larger placement network with 500+ hiring partners. SMU has placement support but on a smaller scale. For working professionals, self-directed career management is typical for both.' },
    ],
    verdictA: ['Budget is your top priority (Rs 1,20,000 vs Rs 2,25,000)', 'You are from Northeast India (30% scholarship available)', 'Manipal group brand at the lowest price matters'],
    verdictB: ['You want 19 specialisation options', 'NIRF #22 University rank and QS ranking matter', 'Your employer values broader brand recognition over budget positioning'],
  },
  'amrita-vs-nmims': {
    uniA: 'amrita-vishwa-vidyapeetham-online',
    uniB: 'nmims-online',
    program: 'MBA',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is Amrita or NMIMS better for online MBA?', a: 'Amrita has NIRF #8 University and NAAC A++. NMIMS has NIRF #17 Management and Mumbai BFSI network. Amrita is stronger on university rank. NMIMS is stronger on management-specific positioning.' },
      { q: 'What is the fee difference?', a: 'Amrita costs Rs 1,76,000-2,60,000 depending on specialisation. NMIMS costs Rs 1,96,000 to Rs 2,20,000. Fees overlap in the mid-range but Amrita AI spec (Rs 2,44,000) and IFA (Rs 2,60,000) are premium.' },
      { q: 'Does Amrita include WES recognition?', a: 'Yes. Amrita degrees are WES recognised for USA and Canada credential evaluation. NMIMS also has WES recognition. Both are portable internationally.' },
      { q: 'Which has per-spec fee tiers?', a: 'Amrita has 6 different fee tiers based on specialisation. NMIMS has a more uniform fee structure. Amrita General Management at Rs 1,76,000 is the most affordable entry point.' },
      { q: 'Which has more scholarships?', a: 'Amrita offers 8 scholarship categories (Defence 20%, SAARC 40%, Female 15%, Doctors 15%, etc.). NMIMS offers Armed Forces 20% scholarship. Amrita has broader scholarship access.' },
    ],
    verdictA: ['NIRF #8 University rank is a stronger credential signal for you', 'You qualify for Amritas 8 scholarship categories', 'You want per-spec fee flexibility (General Management from Rs 1,76,000)'],
    verdictB: ['Mumbai BFSI is your career target', 'NIRF #17 Management rank matters more than University rank', 'You want a simpler, uniform fee structure'],
  },
  'manipal-jaipur-vs-nmims': {
    uniA: 'manipal-university-jaipur-online',
    uniB: 'nmims-online',
    program: 'MBA',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is MUJ or NMIMS better for online MBA Finance?', a: 'NMIMS has NIRF #17 Management rank and stronger Mumbai BFSI recruiter connections. MUJ is more affordable and includes Coursera Plus. For pure finance careers in Mumbai, NMIMS. For value, MUJ.' },
      { q: 'What is the fee difference?', a: 'MUJ costs Rs 1,80,000 (Rs 1,53,000 with upfront discount). NMIMS costs Rs 1,96,000 to Rs 2,20,000. MUJ saves Rs 16,000-67,000 depending on payment track.' },
      { q: 'Which has more specialisations?', a: 'MUJ offers 13 specialisations. NMIMS offers 5-6. MUJ has broader choice; NMIMS is more focused.' },
      { q: 'Does NMIMS have better brand recognition?', a: 'NMIMS has stronger recognition specifically in Mumbai financial services. MUJ benefits from the Manipal group brand which is stronger in South India and healthcare sectors.' },
      { q: 'Are both UGC-DEB approved?', a: 'Yes. Both are UGC-DEB approved, NAAC accredited, and legally equivalent. Government and private sector employers accept both.' },
    ],
    verdictA: ['Budget is your priority (save Rs 16K-67K vs NMIMS)', 'Coursera Plus bundled free adds value', 'You want broader spec variety (13 vs 5-6)'],
    verdictB: ['Mumbai BFSI is your target market', 'NIRF Management #17 rank matters for your employer', 'You prefer deeper curriculum focus over broad choice'],
  },

  /* ─── EXISTING (kept) ─── */
  'manipal-jaipur-vs-manipal-mahe': {
    uniA: 'manipal-university-jaipur-online',
    uniB: 'manipal-academy-higher-education-online',
    program: 'MBA',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is MUJ or MAHE better for online MBA?', a: 'MAHE is the flagship Manipal entity (NIRF #3 University, NAAC A++). MUJ is the Jaipur campus (NAAC A+). Both run on the same platform. MAHE costs Rs 1,12,000 more but carries stronger brand weight.' },
      { q: 'Are MUJ and MAHE the same university?', a: 'No. MUJ (Manipal University Jaipur) and MAHE (Manipal Academy of Higher Education, Manipal Karnataka) are separate universities under the same Manipal group. Independently accredited and ranked.' },
      { q: 'What is the fee difference?', a: 'MUJ costs Rs 1,80,000. MAHE costs Rs 2,92,000. MAHE is Rs 1,12,000 more expensive. Both include Coursera Plus.' },
      { q: 'Do both include Coursera Plus?', a: 'Yes. Both MUJ and MAHE bundle free Coursera Plus access. The platform and LMS experience is similar.' },
      { q: 'Is MAHE worth the extra Rs 1.12L?', a: 'MAHE carries NIRF #3 University rank and Institution of Eminence potential. For employers who specifically value the MAHE flagship brand, the premium may be justified. For employers who treat both as Manipal degrees, MUJ is better value.' },
    ],
    verdictA: ['Budget matters: save Rs 1,12,000 vs MAHE', 'Your employer treats both as Manipal group degrees', 'You want Coursera Plus at the lowest Manipal fee'],
    verdictB: ['NIRF #3 University rank is a genuine career differentiator for you', 'Your target employers specifically value the MAHE flagship brand', 'You qualify for MAHE scholarships (Defence 20%, Female 15%, etc.)'],
  },
  'amity-vs-symbiosis': {
    uniA: 'amity-university-online',
    uniB: 'symbiosis-university-online',
    program: 'MBA',
    defaultSpec: 'marketing',
    faqs: [
      { q: 'Is Amity or Symbiosis better for online MBA?', a: 'Symbiosis has NAAC A++ and deeper academic rigour. Amity has 19 specialisations and QS ranking. Symbiosis costs Rs 1,45,000 more at sticker (Rs 90,000 more after Symbiosis 2+ years experience concession). Choose based on budget and spec variety needs.' },
      { q: 'What is the fee difference?', a: 'Amity costs Rs 2,07,000 (one-time) to Rs 2,25,000 (standard). Symbiosis costs Rs 3,70,000 sticker (Rs 3,15,000 after the 2+ years experience concession). Difference: Rs 1,45,000 at sticker, or Rs 90,000 after the concession.' },
      { q: 'Which has more specialisations?', a: 'Amity offers 19 specialisations. Symbiosis offers 9. Amity has broader choice including niche tracks.' },
      { q: 'Is Symbiosis worth the premium?', a: 'If NAAC A++ and Pune academic heritage matter for your career, yes. If you want broader spec choice at lower fee, Amity wins on value.' },
      { q: 'Do both offer scholarships?', a: 'Amity offers Defence, Divyaang, Alumni, Merit, and Sports scholarships. Symbiosis offers a work-experience scholarship (Rs 55,000 off for 2+ years experience).' },
    ],
    verdictA: ['You want 19 specialisation options vs 9', 'Budget matters: save Rs 90,000', 'QS Asia-Pacific ranking adds international portability'],
    verdictB: ['NAAC A++ is your primary credential priority', 'Pune academic brand carries weight for your employer', 'You want deeper academic load (10-12 subjects per semester)'],
  },

  /* ─── MBA HIGH-INTENT (8) ─── */
  'amity-vs-lpu': {
    uniA: 'amity-university-online',
    uniB: 'lovely-professional-university-online',
    program: 'MBA',
    defaultSpec: 'marketing',
    faqs: [
      { q: 'Is Amity or LPU better for online MBA?', a: 'Amity has NIRF #22 University and QS Asia-Pacific ranking. LPU has NAAC A++ and NIRF #31 University. Both are UGC-DEB approved. Amity offers 19 specialisations; LPU offers 12 with a dual-specialisation option.' },
      { q: 'What is the fee difference between Amity and LPU?', a: 'Amity costs Rs 2,07,000 (one-time) to Rs 2,25,000. LPU costs Rs 1,61,600 to Rs 2,00,000. LPU is Rs 25,000-45,000 cheaper depending on payment mode.' },
      { q: 'Does LPU offer dual specialisation?', a: 'Yes. LPU is one of the few online MBA programmes that lets you pick two specialisations (e.g. Marketing + Digital Marketing). Amity offers single specialisation per enrollment.' },
      { q: 'Which has a higher NAAC grade?', a: 'LPU has NAAC A++ (highest grade). Amity has NAAC A+. LPU scores higher on NAAC accreditation.' },
    ],
    verdictA: ['You want 19 specialisation options including niche tracks', 'QS Asia-Pacific ranking matters for international recognition', 'Your target is NCR employers or you value WASC/WES portability'],
    verdictB: ['You want dual specialisation (two specs in one MBA)', 'NAAC A++ is a priority credential', 'Budget matters and you want to save Rs 25,000-45,000'],
  },
  'lpu-vs-manipal-jaipur': {
    uniA: 'lovely-professional-university-online',
    uniB: 'manipal-university-jaipur-online',
    program: 'MBA',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is LPU or MUJ better for online MBA?', a: 'LPU has NAAC A++ and dual-specialisation option. MUJ has Coursera Plus bundled and the Manipal group brand. LPU is slightly cheaper. Both are UGC-DEB approved and AICTE recognised.' },
      { q: 'What is the fee difference?', a: 'LPU costs Rs 1,61,600 to Rs 2,00,000. MUJ costs Rs 1,53,000 (upfront) to Rs 1,80,000. MUJ upfront is cheaper by Rs 8,600; LPU standard is cheaper by Rs 19,600.' },
      { q: 'Does MUJ include Coursera Plus with online MBA?', a: 'Yes. MUJ bundles free Coursera Plus access. LPU does not include Coursera. This is a genuine learning add-on at MUJ.' },
      { q: 'Which has more specialisations?', a: 'MUJ offers 13 specialisations. LPU offers 12 specialisations but allows dual-spec combinations. For unique spec count, MUJ leads slightly. For combination flexibility, LPU leads.' },
    ],
    verdictA: ['You want dual specialisation (two specs in one MBA)', 'NAAC A++ grade matters to your employer', 'AICTE approval is important for your sector'],
    verdictB: ['Coursera Plus adds genuine value to your learning plan', 'You want the Manipal group brand on your degree', 'You qualify for MUJs 15% upfront discount'],
  },
  'chandigarh-vs-lpu': {
    uniA: 'chandigarh-university-online',
    uniB: 'lovely-professional-university-online',
    program: 'MBA',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is Chandigarh University or LPU better for online MBA?', a: 'Both are Punjab-based with NAAC A+ (CU) and A++ (LPU). CU has NIRF #19 University and PwC triple certification. LPU has NIRF #31 and dual-specialisation. CU wins on rank; LPU wins on accreditation grade.' },
      { q: 'What is the fee difference?', a: 'CU costs Rs 1,65,000 to Rs 2,20,000. LPU costs Rs 1,61,600 to Rs 2,00,000. Both are in the same range. CU can be cheaper at base level or costlier at premium track.' },
      { q: 'Does Chandigarh University offer PwC certification?', a: 'Yes. CU Online MBA includes triple industry certification from PwC India, PMI, and IBM. Two subjects are co-taught by PwC. This is unique among online MBA programmes in India.' },
      { q: 'Which has more specialisations?', a: 'CU offers 26 specialisations (highest count in this tier). LPU offers 12 with dual-spec option. CU wins on variety; LPU wins on combination flexibility.' },
    ],
    verdictA: ['PwC/PMI/IBM triple certification adds value for your resume', 'You want 26 specialisation options (highest in this tier)', 'NIRF #19 University rank matters for your employer'],
    verdictB: ['NAAC A++ is a priority credential', 'You want dual specialisation (two specs in one MBA)', 'AICTE approval and WES recognition matter for your career goals'],
  },
  'amity-vs-chandigarh': {
    uniA: 'amity-university-online',
    uniB: 'chandigarh-university-online',
    program: 'MBA',
    defaultSpec: 'marketing',
    faqs: [
      { q: 'Is Amity or Chandigarh University better for online MBA?', a: 'Amity has NIRF #22 University and QS ranking. CU has NIRF #19 University and PwC triple certification. Both are NAAC A+ and UGC-DEB approved. CU is slightly cheaper.' },
      { q: 'What is the fee difference?', a: 'Amity costs Rs 2,07,000 to Rs 2,25,000. CU costs Rs 1,65,000 to Rs 2,20,000. CU saves Rs 5,000-42,000 depending on payment mode.' },
      { q: 'Which has PwC industry certification?', a: 'Only Chandigarh University. CU includes PwC India, PMI, and IBM certifications with its online MBA. Amity does not bundle industry certifications but has WASC (USA) accreditation.' },
      { q: 'Which has more specialisations?', a: 'CU offers 26 specialisations. Amity offers 19. CU has more variety including niche options like Disaster Management and Airlines Management.' },
    ],
    verdictA: ['QS Asia-Pacific ranking matters for international portability', 'WASC (USA) accreditation is important for global career plans', 'Your target is NCR-region employers with Amity brand recognition'],
    verdictB: ['PwC/PMI/IBM triple certification is a resume differentiator', 'You want 26 specialisation options', 'NIRF #19 University rank edges Amitys #22'],
  },
  'manipal-jaipur-vs-chandigarh': {
    uniA: 'manipal-university-jaipur-online',
    uniB: 'chandigarh-university-online',
    program: 'MBA',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is MUJ or Chandigarh University better for online MBA?', a: 'MUJ has Coursera Plus bundled and the Manipal group brand. CU has PwC triple certification and NIRF #19 University. Both are NAAC A+ and UGC-DEB approved.' },
      { q: 'What is the fee difference?', a: 'MUJ costs Rs 1,53,000 (upfront) to Rs 1,80,000. CU costs Rs 1,65,000 to Rs 2,20,000. MUJ upfront is cheaper. At standard track, MUJ is Rs 15,000-40,000 less expensive.' },
      { q: 'Which includes Coursera Plus?', a: 'Only MUJ. MUJ bundles free Coursera Plus access. CU includes PwC/PMI/IBM certifications instead. Different value add-ons for different learning styles.' },
      { q: 'Which has better NIRF rank?', a: 'CU has NIRF #19 University (stronger). MUJ has NIRF #58 University. CU ranks significantly higher in NIRF.' },
    ],
    verdictA: ['Coursera Plus free access adds value to your learning', 'Budget matters and you want the lowest Manipal fee', 'You value the Manipal group brand for recruiter recognition'],
    verdictB: ['PwC/PMI/IBM triple certification matters for your resume', 'NIRF #19 University rank is a strong credential signal', 'You want 26 specialisation options vs 13'],
  },
  'jain-vs-lpu': {
    uniA: 'jain-university-online',
    uniB: 'lovely-professional-university-online',
    program: 'MBA',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is JAIN or LPU better for online MBA?', a: 'Both have NAAC A++. JAIN has 19 specialisations including AI-focused dual specs. LPU has 12 specs with a dual-specialisation format. JAIN is Bangalore-based; LPU is Punjab-based. Fee range overlaps significantly.' },
      { q: 'What is the fee difference?', a: 'JAIN costs Rs 1,60,000 to Rs 1,96,000. LPU costs Rs 1,61,600 to Rs 2,00,000. Nearly identical fee range. Choose on programme features, not price.' },
      { q: 'Does JAIN offer AI-specific MBA specialisations?', a: 'Yes. JAIN offers AI for Finance, AI for Marketing, AI for HR, and AI for International Finance. LPU offers Data Science and Business Analytics but not AI-specific dual-domain specs.' },
      { q: 'Which is better for Bangalore-based careers?', a: 'JAIN carries stronger recognition in Bangalore and Karnataka. LPU has broader pan-India recognition. For South India tech and startup roles, JAIN. For North India corporate roles, LPU.' },
    ],
    verdictA: ['You want AI-specific MBA specialisations (AI for Finance, Marketing, HR)', 'Your career target is Bangalore or South India', 'You want 19 specialisations including dual-domain AI specs'],
    verdictB: ['You want dual specialisation in a single MBA enrolment', 'Your career target is North India or pan-India', 'AICTE approval is important for your sector'],
  },
  'amity-vs-jain': {
    uniA: 'amity-university-online',
    uniB: 'jain-university-online',
    program: 'MBA',
    defaultSpec: 'marketing',
    faqs: [
      { q: 'Is Amity or JAIN better for online MBA?', a: 'Amity has NIRF #22 University and QS ranking. JAIN has NAAC A++ and NIRF #62 University. Amity costs more but has international accreditation (WASC). JAIN is more affordable.' },
      { q: 'What is the fee difference?', a: 'Amity costs Rs 2,07,000 to Rs 2,25,000. JAIN costs Rs 1,60,000 to Rs 1,96,000. JAIN saves Rs 11,000-65,000 depending on spec and payment mode.' },
      { q: 'Which has more specialisations?', a: 'Both offer 19 specialisations. JAIN includes unique AI-focused dual-domain specs. Amity includes niche tracks like Insurance and Hospitality. Different strengths in variety.' },
      { q: 'Which has higher NAAC grade?', a: 'JAIN has NAAC A++ (highest). Amity has NAAC A+. JAIN scores higher on NAAC accreditation.' },
    ],
    verdictA: ['QS Asia-Pacific ranking matters for international recognition', 'WASC (USA) accreditation is important for global career plans', 'Your target is NCR employers or you value Amitys 500+ hiring partners'],
    verdictB: ['NAAC A++ is a priority credential', 'AI-focused MBA specs (AI for Finance, Marketing, HR) match your goals', 'Budget matters and you want to save Rs 11,000-65,000'],
  },
  'symbiosis-vs-nmims-bba': {
    uniA: 'symbiosis-university-online',
    uniB: 'nmims-online',
    program: 'BBA',
    defaultSpec: 'general',
    faqs: [
      { q: 'Is Symbiosis or NMIMS better for online BBA?', a: 'Symbiosis SSODL BBA costs Rs 1,65,000 total (+ Rs 1,000 registration, separate). NMIMS BBA fees should be confirmed with a counsellor. Both are NAAC A++ and UGC-DEB approved. Symbiosis has stronger Pune academic heritage; NMIMS has Mumbai brand value.' },
      { q: 'What is the Symbiosis SSODL BBA fee?', a: 'Symbiosis SSODL BBA total fee is Rs 1,65,000 across 3 years (6 semesters), plus Rs 1,000 one-time registration billed separately. Fees are indicative and change by intake. Confirm the current fee with our counsellor before enrolling.' },
      { q: 'Does NMIMS offer online BBA?', a: 'Yes. NMIMS offers online BBA. Confirm current fees with our counsellor or the NMIMS online portal directly.' },
      { q: 'Which has a higher NIRF Management rank?', a: 'NMIMS holds NIRF #11 Management and Symbiosis also holds NIRF #11 Management. Both are equally ranked in the Management category.' },
    ],
    verdictA: ['You want the Symbiosis/Pune academic brand at Rs 1,65,000', 'Your career target is Pune or Maharashtra', 'NAAC A++ and deep academic rigour matter most'],
    verdictB: ['Your career target is Mumbai or the BFSI sector', 'You prefer the NMIMS brand for Mumbai financial services', 'Confirm current NMIMS BBA fees with our counsellor before deciding'],
  },

  /* ─── CROSS-PROGRAM (6) ─── */
  'amity-vs-lpu-mca': {
    uniA: 'amity-university-online',
    uniB: 'lovely-professional-university-online',
    program: 'MCA',
    defaultSpec: 'general',
    faqs: [
      { q: 'Is Amity or LPU better for online MCA?', a: 'Amity MCA costs Rs 1,99,000 with 6 specialisations (AI/ML, FinTech, Cyber Security, Software Engg, Blockchain). LPU MCA costs Rs 1,08,000 with 6 specs (AR/VR, ML, Data Science, Cybersecurity, Full Stack, Cloud). LPU is nearly half the cost.' },
      { q: 'What is the fee difference for MCA?', a: 'Amity MCA costs Rs 1,99,000. LPU MCA costs Rs 1,08,000. LPU saves Rs 91,000. Significant difference for the same 2-year UGC-DEB approved MCA.' },
      { q: 'Which has better NAAC grade?', a: 'LPU has NAAC A++ (highest). Amity has NAAC A+. LPU scores higher on NAAC accreditation.' },
      { q: 'Does Amity MCA offer FinTech specialisation?', a: 'Yes. Amity is one of the few online MCA programmes with a Financial Technology and AI specialisation. LPU does not offer FinTech but has AR/VR (Game Development) which is also unique.' },
    ],
    verdictA: ['You want FinTech or Blockchain specialisation in MCA', 'QS ranking and WASC (USA) accreditation matter for your career', 'Your target is NCR-based IT employers'],
    verdictB: ['Budget is your priority (save Rs 91,000 vs Amity)', 'NAAC A++ is a priority credential for IT sector jobs', 'You want AR/VR or Full Stack Web Development specialisation'],
  },
  'manipal-jaipur-vs-chandigarh-mca': {
    uniA: 'manipal-university-jaipur-online',
    uniB: 'chandigarh-university-online',
    program: 'MCA',
    defaultSpec: 'general',
    faqs: [
      { q: 'Is MUJ or Chandigarh University better for online MCA?', a: 'MUJ MCA costs Rs 1,58,000 with 5 specs (AI/Data Science, Emerging Tech, AI/ML, Cloud, Cybersecurity). CU MCA costs Rs 1,55,000 with 4 specs (Cloud, Full Stack, Data Analytics, AI/ML). Fees are nearly identical.' },
      { q: 'What is the fee difference for MCA?', a: 'MUJ MCA costs Rs 1,58,000. CU MCA costs Rs 1,55,000. Only Rs 3,000 difference. Choose on programme features, not price.' },
      { q: 'Does MUJ include Coursera Plus with MCA?', a: 'Yes. MUJ bundles free Coursera Plus access for MCA students as well. CU does not include Coursera but has industry tie-ups with IBM and PwC.' },
      { q: 'Which has better NIRF rank?', a: 'CU has NIRF #19 University. MUJ has NIRF #58 University. CU ranks significantly higher. Both are NAAC A+ and UGC-DEB approved.' },
    ],
    verdictA: ['Coursera Plus free access adds value to MCA learning', 'Manipal group brand matters for IT recruiter recognition', 'You want Cybersecurity or Emerging Technologies specialisation'],
    verdictB: ['NIRF #19 University rank is a strong credential for IT jobs', 'You want Full Stack Development or Data Analytics specialisation', 'Industry certifications (IBM) matter for your resume'],
  },
  'amity-vs-lpu-bba': {
    uniA: 'amity-university-online',
    uniB: 'lovely-professional-university-online',
    program: 'BBA',
    defaultSpec: 'general',
    faqs: [
      { q: 'Is Amity or LPU better for online BBA?', a: 'Amity BBA costs Rs 1,99,000 with 3 specialisations. LPU BBA offers 14 specialisations at a competitive fee. LPU has NAAC A++ (vs Amitys A+). Both are UGC-DEB approved.' },
      { q: 'What is the fee difference for BBA?', a: 'Amity BBA costs Rs 1,99,000. LPU BBA fees vary by specialisation. Confirm current LPU BBA fees with our counsellor for an exact comparison.' },
      { q: 'Which has more BBA specialisations?', a: 'LPU offers 14 BBA specialisations (Entrepreneurship, FinTech, AI, Healthcare, and more). Amity offers 3 (General, Travel & Tourism, Data Analytics). LPU has far broader choice.' },
      { q: 'Which has a higher NAAC grade?', a: 'LPU has NAAC A++ (highest possible). Amity has NAAC A+. LPU scores higher on NAAC accreditation.' },
    ],
    verdictA: ['QS Asia-Pacific ranking matters for international recognition', 'WASC (USA) accreditation is important for your global career plans', 'Your target is NCR employers with Amity brand recognition'],
    verdictB: ['You want 14 BBA specialisation options (vs 3 at Amity)', 'NAAC A++ is your priority credential', 'You want niche specs like FinTech, AI, or Healthcare Management'],
  },
  'sharda-vs-galgotias-bba': {
    uniA: 'sharda-university-online',
    uniB: 'galgotias-university-online',
    program: 'BBA',
    defaultSpec: 'general',
    faqs: [
      { q: 'Is Sharda or Galgotias better for online BBA?', a: 'Both are Greater Noida-based, NAAC A+ and UGC-DEB approved. Galgotias BBA costs Rs 77,000 (significantly cheaper). Sharda has NIRF #87 University rank. Both are budget-friendly options for online BBA.' },
      { q: 'What is the fee difference for BBA?', a: 'Galgotias BBA costs Rs 77,000. Sharda BBA fees should be confirmed with our counsellor. Galgotias is one of the most affordable NAAC A+ online BBA programmes in India.' },
      { q: 'Which has more BBA specialisations?', a: 'Galgotias offers 4 BBA specs (Marketing, Finance, HRM, Operations). Sharda offers General Management. Galgotias has broader specialisation choice.' },
      { q: 'Are both valid for government jobs?', a: 'Yes. Both are UGC-DEB approved and NAAC accredited. Both degrees are valid for government jobs, PSU recruitment, and higher education (MBA, M.Com, etc.).' },
    ],
    verdictA: ['You want NIRF-ranked university (Sharda #87) on your degree', 'You prefer a private university with established campus brand', 'Sharda placements network matters for your Greater Noida target market'],
    verdictB: ['Budget is your top priority (Rs 77,000 is among the lowest BBA fees in India)', 'You want Marketing, Finance, or HRM specialisation in BBA', 'You value 830+ recruiter partnerships that Galgotias reports'],
  },
  'amity-vs-lpu-bca': {
    uniA: 'amity-university-online',
    uniB: 'lovely-professional-university-online',
    program: 'BCA',
    defaultSpec: 'general',
    faqs: [
      { q: 'Is Amity or LPU better for online BCA?', a: 'Amity BCA costs Rs 1,75,000 with 3 specialisations (General, Data Science, FinTech & AI). LPU BCA costs Rs 1,22,400 with 3 specs (Cyber Security, Data Science, Full Stack). LPU is Rs 52,600 cheaper.' },
      { q: 'What is the fee difference for BCA?', a: 'Amity BCA costs Rs 1,75,000. LPU BCA costs Rs 1,22,400. LPU saves Rs 52,600 for the same 3-year UGC-DEB approved BCA programme.' },
      { q: 'Which has better NAAC grade?', a: 'LPU has NAAC A++ (highest). Amity has NAAC A+. LPU scores higher on NAAC accreditation.' },
      { q: 'Does Amity BCA offer FinTech specialisation?', a: 'Yes. Amity is one of the few online BCA programmes offering Financial Technology and AI as a specialisation. LPU does not offer FinTech in BCA but has Cyber Security and Full Stack Web Development.' },
    ],
    verdictA: ['You want FinTech and AI specialisation in BCA', 'QS ranking and WASC (USA) accreditation matter for global IT careers', 'Your target is NCR-based IT employers'],
    verdictB: ['Budget matters (save Rs 52,600 vs Amity)', 'NAAC A++ is a priority credential for IT sector jobs', 'You want Cyber Security or Full Stack Web Development specialisation'],
  },
  'ignou-vs-lpu': {
    uniA: 'ignou-online',
    uniB: 'lovely-professional-university-online',
    program: 'MBA',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is IGNOU or LPU better for online MBA?', a: 'IGNOU is a Central Government university with Rs 66,000 total fee. LPU is a private university with NAAC A++ at Rs 1,61,600 to Rs 2,00,000. IGNOU is by far the most affordable option. LPU offers more specialisations and modern programme delivery.' },
      { q: 'What is the fee difference?', a: 'IGNOU MBA costs Rs 66,000 total. LPU costs Rs 1,61,600 to Rs 2,00,000. IGNOU saves Rs 95,600-1,34,000. Massive difference.' },
      { q: 'Is IGNOU MBA valid for government jobs?', a: 'Yes. IGNOU is a Central Government institution. Its MBA is valid for all government jobs, PSU recruitment, and higher education. LPU MBA is also valid but IGNOU carries specific advantage for government sector applications.' },
      { q: 'Which has more specialisations?', a: 'LPU offers 12 MBA specialisations with dual-spec option. IGNOU offers 5 (Financial, Marketing, HR, Operations, Services Management). LPU has broader choice.' },
    ],
    verdictA: ['Budget is your absolute priority (Rs 66,000 total is unmatched)', 'Government job or PSU recruitment is your target', 'You want a Central Government university brand on your degree'],
    verdictB: ['You want 12 specialisation options with dual-spec flexibility', 'NAAC A++ and modern LMS platform matter to you', 'Private sector career with recruiter-partner network is your goal'],
  },
} as const

export type PairSlug = keyof typeof PAIRS
export const PAIR_SLUGS = Object.keys(PAIRS) as PairSlug[]
