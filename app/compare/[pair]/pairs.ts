// app/compare/[pair]/pairs.ts — Static comparison page configs
// TODO: MCA pairs

export const PAIRS = {
  'amity-vs-nmims': {
    uniA: 'amity-university-online',
    uniB: 'nmims-online',
    defaultSpec: 'marketing',
    faqs: [
      { q: 'Is Amity or NMIMS better ranked in NIRF 2025?', a: 'NMIMS holds NIRF #24 Management rank. Amity holds NIRF #22 University rank. Both are strong. NMIMS is better positioned in the Management category specifically.' },
      { q: 'What is the fee difference between Amity and NMIMS online MBA?', a: 'Amity online MBA costs Rs 2,25,000 (standard) to Rs 3,29,000 (Healthcare/ACCA tracks). NMIMS costs Rs 1,96,000. NMIMS is cheaper for the standard track.' },
      { q: 'Does Amity offer specialisations that NMIMS does not?', a: 'Yes. Amity offers 18 specialisations including Healthcare, Hospitality, Insurance, and Retail. NMIMS offers 5-6 focused tracks. Amity has broader choice; NMIMS has deeper focus.' },
      { q: 'Which has better placements: Amity or NMIMS?', a: 'NMIMS has stronger Mumbai-centric BFSI recruiter connections. Amity has a larger pan-India alumni network. For Mumbai finance roles, NMIMS. For NCR and broad management, Amity.' },
      { q: 'Is Amity MBA valued more than NMIMS by employers?', a: 'Both are well-recognised. NMIMS carries stronger weight specifically in Mumbai financial services. Amity has broader geographic recognition due to 500+ hiring partners across India.' },
    ],
    verdictA: ['You want 18+ specialisation options including niche tracks like Healthcare, Insurance, or Retail', 'Your target market is NCR or pan-India (not Mumbai-specific)', 'You value QS Asia-Pacific ranking and WASC/WES international accreditation'],
    verdictB: ['Your career target is Mumbai-centric BFSI or financial services', 'You prefer a focused 5-spec programme with deeper curriculum per track', 'NIRF Management rank (#24) matters more to your employer than University rank'],
  },
  'amity-vs-manipal-jaipur': {
    uniA: 'amity-university-online',
    uniB: 'manipal-university-jaipur-online',
    defaultSpec: 'marketing',
    faqs: [
      { q: 'Is Amity or MUJ better for online MBA?', a: 'Both are NAAC A+ and UGC-DEB approved. Amity has 18 specialisations and QS ranking. MUJ has Coursera Plus bundled and Manipal group brand. Choose based on spec variety vs platform perks.' },
      { q: 'What is the fee difference between Amity and MUJ?', a: 'Amity costs approximately Rs 2,25,000. MUJ costs Rs 1,80,000 (or Rs 1,53,000 with 15% upfront discount). MUJ is more affordable.' },
      { q: 'Does MUJ include Coursera Plus?', a: 'Yes. MUJ bundles free Coursera Plus access throughout the programme. Amity does not include Coursera but offers broader specialisation options.' },
      { q: 'Which university has better NIRF rank?', a: 'Amity holds NIRF #22 University. MUJ holds NIRF rank in the University category as well. Both are comparable in NIRF positioning.' },
      { q: 'Can I get scholarships at both universities?', a: 'MUJ offers 5 scholarship categories including Defence, Divyaang, and Merit. Amity offers Defence, Divyaang, Alumni, Merit, and Sports scholarships. Both have multiple discount options.' },
    ],
    verdictA: ['You want 18+ specialisation options', 'QS Asia-Pacific ranking matters for international portability', 'Your target is NCR-region employers'],
    verdictB: ['Coursera Plus free access adds genuine value to your learning', 'You want the Manipal group brand at a lower fee', 'You qualify for MUJs 15% upfront discount (saves Rs 27,000)'],
  },
  'manipal-jaipur-vs-nmims': {
    uniA: 'manipal-university-jaipur-online',
    uniB: 'nmims-online',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is MUJ or NMIMS better for online MBA Finance?', a: 'NMIMS has NIRF #24 Management rank and stronger Mumbai BFSI recruiter connections. MUJ is more affordable and includes Coursera Plus. For pure finance careers in Mumbai, NMIMS. For value, MUJ.' },
      { q: 'What is the fee difference?', a: 'MUJ costs Rs 1,80,000 (Rs 1,53,000 with upfront discount). NMIMS costs Rs 1,96,000-2,20,000. MUJ saves Rs 16,000-67,000 depending on payment track.' },
      { q: 'Which has more specialisations?', a: 'MUJ offers 13 specialisations. NMIMS offers 5-6. MUJ has broader choice; NMIMS is more focused.' },
      { q: 'Does NMIMS have better brand recognition?', a: 'NMIMS has stronger recognition specifically in Mumbai financial services. MUJ benefits from the Manipal group brand which is stronger in South India and healthcare sectors.' },
      { q: 'Are both UGC-DEB approved?', a: 'Yes. Both are UGC-DEB approved, NAAC accredited, and legally equivalent. Government and private sector employers accept both.' },
    ],
    verdictA: ['Budget is your priority (save Rs 16K-67K vs NMIMS)', 'Coursera Plus bundled free adds value', 'You want broader spec variety (13 vs 5-6)'],
    verdictB: ['Mumbai BFSI is your target market', 'NIRF Management #24 rank matters for your employer', 'You prefer deeper curriculum focus over broad choice'],
  },
  'manipal-jaipur-vs-manipal-mahe': {
    uniA: 'manipal-university-jaipur-online',
    uniB: 'manipal-academy-higher-education-online',
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
  'nmims-vs-symbiosis': {
    uniA: 'nmims-online',
    uniB: 'symbiosis-university-online',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is NMIMS or Symbiosis better for online MBA?', a: 'Both are premium. NMIMS has NIRF #24 Management and Mumbai recruiter network. Symbiosis (SSODL) has NAAC A++ (highest grade) and Pune academic heritage. Choose based on geography and budget.' },
      { q: 'What is the fee difference?', a: 'NMIMS costs Rs 1,96,000-2,20,000. Symbiosis costs Rs 3,15,000 (Rs 3,70,000 without work-experience scholarship). Symbiosis is significantly more expensive.' },
      { q: 'Which has better NAAC grade?', a: 'Symbiosis holds NAAC A++ (highest possible). NMIMS holds NAAC A++. Both have the highest NAAC grade.' },
      { q: 'Does Symbiosis offer more subjects per semester?', a: 'Yes. Symbiosis is known for 10-12 subjects per semester (higher academic load). NMIMS has a standard 6-8 subject format. Symbiosis demands more study time.' },
      { q: 'Which is better for Pune-based careers?', a: 'Symbiosis carries stronger weight in Pune and Maharashtra. NMIMS carries stronger weight in Mumbai specifically. For broader Maharashtra, both work well.' },
    ],
    verdictA: ['Mumbai BFSI is your target (NMIMS has specific Mumbai connections)', 'Budget matters: save Rs 95,000-1,50,000 vs Symbiosis', 'You prefer standard academic load (6-8 subjects/sem)'],
    verdictB: ['You want the highest possible NAAC grade (A++) on your degree', 'Pune-region employers are your target', 'You can afford Rs 3.15L and want maximum academic depth per semester'],
  },
  'amity-vs-symbiosis': {
    uniA: 'amity-university-online',
    uniB: 'symbiosis-university-online',
    defaultSpec: 'marketing',
    faqs: [
      { q: 'Is Amity or Symbiosis better for online MBA?', a: 'Symbiosis has NAAC A++ and deeper academic rigour. Amity has 18 specialisations and QS ranking. Symbiosis costs Rs 90,000 more. Choose based on budget and spec variety needs.' },
      { q: 'What is the fee difference?', a: 'Amity costs Rs 2,25,000. Symbiosis costs Rs 3,15,000. Symbiosis is Rs 90,000 more expensive.' },
      { q: 'Which has more specialisations?', a: 'Amity offers 18 specialisations. Symbiosis offers 9. Amity has broader choice including niche tracks.' },
      { q: 'Is Symbiosis worth the premium?', a: 'If NAAC A++ and Pune academic heritage matter for your career, yes. If you want broader spec choice at lower fee, Amity wins on value.' },
      { q: 'Do both offer scholarships?', a: 'Amity offers Defence, Divyaang, Alumni, Merit, and Sports scholarships. Symbiosis offers a work-experience scholarship (Rs 55,000 off for 2+ years experience).' },
    ],
    verdictA: ['You want 18 specialisation options vs 9', 'Budget matters: save Rs 90,000', 'QS Asia-Pacific ranking adds international portability'],
    verdictB: ['NAAC A++ is your primary credential priority', 'Pune academic brand carries weight for your employer', 'You want deeper academic load (10-12 subjects per semester)'],
  },
  'sikkim-manipal-vs-amity': {
    uniA: 'sikkim-manipal-university-online',
    uniB: 'amity-university-online',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is SMU or Amity better for online MBA?', a: 'Amity has 18 specs and NIRF #22 University. SMU has 5 specs at Rs 1,20,000 (nearly half of Amity). SMU is budget-friendly with Manipal brand. Amity is premium with broader choice.' },
      { q: 'What is the fee difference?', a: 'SMU costs Rs 1,20,000 flat. Amity costs Rs 2,25,000. SMU saves Rs 1,05,000. Significant difference.' },
      { q: 'Does SMU have the same brand as MUJ?', a: 'No. SMU (Sikkim Manipal University) is a separate institution from MUJ (Manipal University Jaipur). Both are in the Manipal group but independently governed and accredited.' },
      { q: 'Does SMU offer Northeast scholarship?', a: 'Yes. SMU offers 30% scholarship for Northeast India and Sikkim residents. This is unique and brings effective fee to Rs 84,000.' },
      { q: 'Which has better placement support?', a: 'Amity has a larger placement network with 500+ hiring partners. SMU has placement support but on a smaller scale. For working professionals, self-directed career management is typical for both.' },
    ],
    verdictA: ['Budget is your top priority (Rs 1,20,000 vs Rs 2,25,000)', 'You are from Northeast India (30% scholarship available)', 'Manipal group brand at the lowest price matters'],
    verdictB: ['You want 18 specialisation options', 'NIRF #22 University rank and QS ranking matter', 'Your employer values broader brand recognition over budget positioning'],
  },
  'amrita-vs-nmims': {
    uniA: 'amrita-vishwa-vidyapeetham-online',
    uniB: 'nmims-online',
    defaultSpec: 'finance',
    faqs: [
      { q: 'Is Amrita or NMIMS better for online MBA?', a: 'Amrita has NIRF #8 University and NAAC A++. NMIMS has NIRF #24 Management and Mumbai BFSI network. Amrita is stronger on university rank. NMIMS is stronger on management-specific positioning.' },
      { q: 'What is the fee difference?', a: 'Amrita costs Rs 1,76,000-2,60,000 depending on specialisation. NMIMS costs Rs 1,96,000-2,20,000. Fees overlap in the mid-range but Amrita AI spec (Rs 2,44,000) and IFA (Rs 2,60,000) are premium.' },
      { q: 'Does Amrita include WES recognition?', a: 'Yes. Amrita degrees are WES recognised for USA and Canada credential evaluation. NMIMS also has WES recognition. Both are portable internationally.' },
      { q: 'Which has per-spec fee tiers?', a: 'Amrita has 6 different fee tiers based on specialisation. NMIMS has a more uniform fee structure. Amrita General Management at Rs 1,76,000 is the most affordable entry point.' },
      { q: 'Which has more scholarships?', a: 'Amrita offers 8 scholarship categories (Defence 20%, SAARC 40%, Female 15%, Doctors 15%, etc.). NMIMS offers Armed Forces 20% scholarship. Amrita has broader scholarship access.' },
    ],
    verdictA: ['NIRF #8 University rank is a stronger credential signal for you', 'You qualify for Amritas 8 scholarship categories', 'You want per-spec fee flexibility (General Management from Rs 1,76,000)'],
    verdictB: ['Mumbai BFSI is your career target', 'NIRF #24 Management rank matters more than University rank', 'You want a simpler, uniform fee structure'],
  },
} as const

export type PairSlug = keyof typeof PAIRS
export const PAIR_SLUGS = Object.keys(PAIRS) as PairSlug[]
