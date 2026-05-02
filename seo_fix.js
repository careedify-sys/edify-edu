// seo_fix.js — two jobs:
// 1. Ensure targetKeyword appears in every blog's metaDescription
// 2. Add professional internal links to the 18 newest blog content blocks
const fs = require('fs');

let blog = fs.readFileSync('lib/blog.ts', 'utf8');

// ── JOB 1: META DESCRIPTION KEYWORD INJECTION ──────────────────────────────

// Map: slug → desired meta (keyword-first, ≤160 chars)
// Only override metas where the focus keyword is missing
const metaOverrides = {
  'amity-online-mba-hr-worth-it': 'Amity University online MBA HR review 2026 — fees, HR+Finance dual specialisation, NAAC A+ accreditation, and who this program actually suits.',
  'how-to-choose-online-mba-university-india-2026': 'How to choose online MBA university in India 2026 — 8 criteria that separate genuine programs from expensive certificates.',
  'ignou-online-mba-review-2026': 'Online MBA IGNOU review 2026 — fees, recognition, specialisations, student feedback, and how IGNOU compares to private online MBA options.',
  'muj-online-mba-review-2026': 'MUJ online MBA review 2026 — Rs 1,75,000 fee, 13 specialisations, super and dual specialisation options, and student feedback.',
  'career-after-bcom-jobs-salary-courses-2026': 'Career after B.Com in India 2026 — best courses after B.Com, jobs, salary ranges, and options for commerce graduates.',
  '1-year-mba-india-executive-mba-2026': '1 year MBA in India 2026 — executive MBA programs, fees, top colleges, eligibility, and who should actually choose the accelerated route.',
  'mba-fees-india-complete-guide-2026': 'MBA fees in India 2026 — complete guide from Rs 75,000 online programs to Rs 25 lakh IIM fees. Government, private, and online compared.',
  'career-after-12th-arts-courses-jobs-2026': 'Career after 12th arts in India 2026 — best courses, jobs with high salary, BA/BBA/BCA options, and UGC-approved online degrees.',
  'govt-jobs-after-mba-india-2026': 'Govt jobs after MBA in India 2026 — PSU, UPSC, banking, and government sector roles available to MBA graduates with salary details.',
  'career-after-12th-science-courses-jobs-2026': 'Career after 12th science in India 2026 — PCM, PCB, PCMB course options, salary ranges, and the honest picture of each path.',
  'career-after-12th-commerce-courses-jobs-2026': 'Career after 12th commerce in India 2026 — B.Com, BBA, CA, CS course options, jobs, and salary ranges for commerce students.',
  'mat-exam-2026-eligibility-pattern-dates': 'MAT exam 2026 — eligibility, exam pattern, syllabus, important dates, registration process, and MBA colleges accepting MAT scores.',
  'cmat-exam-2026-guide-eligibility-pattern': 'CMAT exam 2026 — eligibility, exam pattern, syllabus, preparation tips, and top MBA colleges accepting CMAT scores in India.',
  'mba-vs-pgdm-online-india-2026': 'MBA vs PGDM India 2026 — online vs regular, key differences in recognition, fees, salary, and which degree suits your career goals.',
  'online-mba-salary-india-2026': 'Online MBA salary in India 2026 — average packages by specialisation, university, and experience. What you can realistically expect.',
  'distance-mba-kolkata-top-programs-2026': 'Distance MBA in Kolkata 2026 — top UGC-approved programs, fees, colleges, and how to choose the right option for your career.',
  'online-mba-pune-university-2026': 'Online MBA Pune university 2026 — UGC-approved programs, fees, Symbiosis SSODL, Parul, and top options for Pune-based professionals.',
  'distance-mba-kerala-programs-2026': 'Distance MBA in Kerala 2026 — UGC-approved programs, fees, top colleges, and how Kerala professionals can earn a recognised degree.',
  'is-online-degree-valid-india-2026': 'Is online degree valid in India 2026? UGC-DEB approved degrees, government job eligibility, PSU rules, and what the law actually says.',
  'mba-after-engineering-india-2026': 'MBA after engineering in India 2026 — is it worth it, best specialisations for engineers, salary jump, and top colleges to consider.',
  'mba-hr-career-salary-scope-2026': 'MBA HR career salary and scope 2026 — roles, average packages, top companies hiring MBA HR graduates, and how to choose the right college.',
  'distance-mba-mumbai-2026': 'Distance MBA in Mumbai 2026 — UGC-approved programs, fees, top colleges, and how Mumbai professionals can earn a recognised MBA.',
  'distance-mba-bangalore-2026': 'Distance MBA in Bangalore 2026 — UGC-approved programs, fees, top IT sector options, and how Bangalore professionals can upskill.',
  'online-mba-delhi-ncr-2026': 'Online MBA in Delhi NCR 2026 — UGC-approved programs, fees, Amity, Jamia options, and how to choose the right program in the capital.',
  'online-mba-for-freshers-india-2026': 'Online MBA for freshers in India 2026 — is it a good idea, best universities, fees, and honest advice for recent graduates.',
  'mba-or-mca-which-is-better-2026': 'MBA or MCA which is better 2026 — salary, career scope, eligibility, fees, and who should choose each based on their background.',
  'mba-for-commerce-students-india-2026': 'MBA for commerce students in India 2026 — best specialisations after B.Com, fees, top colleges, and career outcomes for commerce graduates.',
  'mba-scope-india-2026': 'MBA scope in India 2026 — career options after MBA, salary ranges, top hiring sectors, and which MBA specialisations have the best future.',
  'mba-vs-bba-which-is-better-2026': 'MBA vs BBA in India 2026 — key differences in duration, fees, salary, eligibility, and which degree is the better career investment.',
  'online-mba-government-employees-india-2026': 'Online MBA for government employees in India 2026 — UGC-approved programs, study-while-working options, fees, and NOC requirements.',
  'mba-operations-management-career-2026': 'MBA in operations management career guide 2026 — salary, roles, top companies hiring, and best colleges for operations specialisation.',
  'mba-international-business-career-2026': 'MBA in international business scope and career 2026 — salary, roles, IB specialisation guide, and top colleges in India.',
  'mba-digital-marketing-career-2026': 'MBA in digital marketing career 2026 — salary, roles, scope, top colleges, and whether this specialisation is worth it in India.',
  'distance-mba-chennai-2026': 'Distance MBA in Chennai 2026 — UGC-approved programs, fees, top colleges, and online options for Tamil Nadu professionals.',
  'distance-mba-hyderabad-2026': 'Distance MBA in Hyderabad 2026 — UGC-approved programs, fees, top colleges, and online options for Telangana and AP professionals.',
  'online-mba-ahmedabad-gujarat-2026': 'Online MBA in Ahmedabad Gujarat 2026 — UGC-approved programs, fees, Parul University options, and top choices for Gujarat professionals.',
  'advantages-online-mba-manipal-university-2026': 'Manipal University online MBA advantages 2026 — fees, specialisations, NAAC accreditation, placement support, and honest review.',
  'top-free-online-mba-courses-2026': 'Top free online MBA courses in India 2026 — IIM certificate programs, NPTEL, Coursera options, and what each is actually worth.',
  'online-executive-mba-india-2026': 'Online executive MBA in India 2026 — top programs, fees, IIM options, eligibility, and who the executive MBA route is actually designed for.',
  'online-executive-mba-iim-2026': 'Online executive MBA from IIM 2026 — fees, eligibility, IIM Calcutta/Kozhikode/Indore online programs, and honest assessment.',
  'difference-online-mba-distance-mba-2026': 'Difference between online MBA and distance MBA in India 2026 — UGC recognition, study mode, exams, fees, and which suits your situation.',
  'is-distance-mba-worth-it-india-2026': 'Is distance MBA worth it in India 2026? UGC recognition, salary impact, employer perception, and when it makes sense to enroll.',
  'distance-mba-colleges-mumbai-2026': 'Distance MBA colleges in Mumbai 2026 — UGC-approved programs, fees, top institutions, and how to shortlist the right college.',
  'du-online-mba-delhi-university-2026': 'Delhi University online MBA 2026 — DU SOL MBA program, fees, eligibility, recognition, and how it compares to other online MBA options.',
  'mba-international-online-global-programs-2026': 'MBA international online programs 2026 — global MBA options for Indian students, fees, recognition, and top universities offering online international MBA.',
  'top-correspondence-mba-colleges-india-2026': 'Top correspondence MBA colleges in India 2026 — UGC-approved, fees, recognition for government jobs, and how to choose the right institution.',
  'online-mba-vs-distance-mba-difference-2026': 'Online MBA vs distance MBA difference 2026 — UGC rules, exam modes, fees, employer value, and which format actually works for working professionals.',
  'dy-patil-online-mba-fee-structure-2026': 'DY Patil online MBA fee structure 2026 — actual costs, specialisations, DPU-COL program details, and whether DY Patil online MBA is worth it.',
  'top-executive-mba-programs-india-2026': 'Top 10 executive MBA programs in India 2026 — IIM, ISB, XLRI options, fees, eligibility, and which programs actually accelerate senior careers.',
  'mba-course-duration-how-many-years-2026': 'MBA course duration in India 2026 — full-time 2 years, executive 1 year, online 2 years. How many years for each MBA type, explained.',
  'jamia-hamdard-mba-2026': 'Jamia Hamdard MBA 2026 — online and full-time MBA fees, specialisations, eligibility, Delhi campus details, and honest review.',
  'is-mba-post-graduation-india-2026': 'Is MBA post graduation in India? Yes — how MBA PG status affects government job eligibility, UPSC, PSU applications, and education loans.',
  'mba-course-time-weekly-hours-2026': 'MBA course time and weekly commitment 2026 — how many hours per week, full-time vs online comparison, and realistic study schedule.',
  'how-many-years-mba-india-2026': 'How many years is MBA in India 2026 — standard 2-year, 1-year executive, 3-year part-time, and 5-year integrated MBA duration explained.',
  'which-mba-is-best-india-2026': 'Which MBA is best in India 2026 — specialisation comparison by salary, scope, and demand. Finance, analytics, marketing, and HR ranked.',
  'mba-graduate-or-postgraduate-india-2026': 'Is MBA graduate or postgraduate in India? MBA is a PG degree — how this matters for jobs, government forms, and further education.',
  'cat-exam-syllabus-2026-complete-guide': 'CAT exam syllabus 2026 — complete VARC, DILR, QA section-wise breakdown, question count, marking scheme, and honest preparation tips.',
  'ias-officer-salary-india-2026-pay-scale-perks': 'IAS officer salary in India 2026 — basic pay Rs 56,100/month, allowances, perks, rank-wise pay scale, and complete take-home picture.',
  'commerce-jobs-list-salary-india-2026': 'Commerce jobs list and salary in India 2026 — CA, CS, MBA Finance, analyst roles with realistic salary ranges and career paths.',
  'bsc-career-options-scope-salary-india-2026': 'B.Sc career options, scope and salary in India 2026 — stream-wise jobs, post-graduation paths, and realistic salary for BSc graduates.',
  'pgdm-vs-mba-difference-which-is-better-india': 'PGDM vs MBA in India 2026 — 10-parameter difference in recognition, fees, salary, flexibility, and which degree suits your career goal.',
  'llm-course-duration-fees-scope-india-2026': 'LLM course duration, fees and scope in India 2026 — 1-year vs 2-year comparison, specialisations, top colleges, and career paths.',
};

// Apply overrides
Object.entries(metaOverrides).forEach(([slug, newMeta]) => {
  const slugIdx = blog.indexOf(`slug: '${slug}'`);
  if (slugIdx === -1) { console.warn('Slug not found:', slug); return; }
  // Find metaDescription after this slug (within next 1200 chars)
  const section = blog.slice(slugIdx, slugIdx + 1200);
  // Regex that properly handles escaped quotes: matches 'content with \'escaped\' quotes'
  // For single-quoted: matches from ' to next unescaped '
  // For backtick-quoted: matches from ` to next unescaped `
  const metaRe = /metaDescription: ('(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/;
  const mm = metaRe.exec(section);
  if (!mm) { console.warn('No meta found for:', slug); return; }
  const oldFull = mm[0]; // e.g. metaDescription: 'old content'
  const quote = oldFull[17]; // char after "metaDescription: " (17 chars)
  const safeMeta = newMeta.replace(/\\/g, '\\\\').replace(new RegExp(quote, 'g'), '\\' + quote);
  const newMetaStr = `metaDescription: ${quote}${safeMeta}${quote}`;
  const absIdx = slugIdx + section.indexOf(oldFull);
  blog = blog.slice(0, absIdx) + newMetaStr + blog.slice(absIdx + oldFull.length);
});

console.log('Meta overrides applied:', Object.keys(metaOverrides).length);

// ── JOB 2: PROFESSIONAL INTERNAL LINKING ───────────────────────────────────
// Map: phrase to find in content → [href, anchor text]
// Rules: natural anchor text, no forced highlighting, max 2-3 per blog
// Only add links if phrase is not already linked

const internalLinks = [

  // phd-full-form blog
  ['phd-full-form-doctorate-meaning-india',
    [
      ['online MBA degree', '/programs/mba', 'online MBA'],
      ['UGC does not recognize online PhD', '/blog/is-online-degree-valid-india-2026', 'UGC online degree rules'],
    ]
  ],

  // 14-principles blog
  ['14-principles-of-management-henri-fayol',
    [
      ['every BBA and', '/programs/bba', 'every BBA'],
      ['Use Fayol as a foundation', '/blog/best-mba-specialization-india-2026', 'management specialisation in MBA'],
    ]
  ],

  // cat-exam-syllabus blog
  ['cat-exam-syllabus-2026-complete-guide',
    [
      ['IIM Kozhikode is expected to conduct it', '/blog/iim-ranking-india-2026-all-iims-list', 'IIM Kozhikode'],
      ['most aspirants need 4 to 6 months', '/blog/mba-entrance-exams-india-2026', 'CAT and other MBA entrance exams'],
    ]
  ],

  // career-objective blog
  ['career-objective-for-fresher-resume-examples',
    [
      ['MBA in Finance from', '/programs/mba', 'MBA in Finance'],
      ['BCA graduate with project experience', '/programs/bca', 'BCA'],
    ]
  ],

  // best-computer-courses blog
  ['best-computer-courses-after-12th-india-2026',
    [
      ['MCA pathway', '/programs/mca', 'MCA'],
      ['After completing BCA', '/blog/mba-after-bca-is-it-good-career-2026', 'MBA or MCA after BCA'],
      ['AWS Cloud Practitioner', '/blog/cyber-security-salary-india-2026-career-guide', 'cloud security careers'],
    ]
  ],

  // courses-after-12th-science blog
  ['courses-after-12th-science-complete-list-2026',
    [
      ['BCA or B.Sc CS', '/programs/bca', 'BCA'],
      ['65% of B.Tech graduates', '/blog/mba-after-engineering-india-2026', 'MBA after engineering'],
    ]
  ],

  // iim-ranking blog
  ['iim-ranking-india-2026-all-iims-list',
    [
      ['entry to IIM', '/blog/cat-exam-syllabus-2026-complete-guide', 'CAT exam syllabus'],
      ['online MBA from IIM', '/blog/online-executive-mba-iim-2026', 'online executive MBA from IIM'],
    ]
  ],

  // toughest-exams blog
  ['toughest-exams-india-world-2026',
    [
      ['UPSC Civil Services', '/blog/ias-officer-salary-india-2026-pay-scale-perks', 'IAS officer salary'],
      ['MBA entrance exams', '/blog/cat-exam-syllabus-2026-complete-guide', 'CAT syllabus'],
    ]
  ],

  // ias-salary blog
  ['ias-officer-salary-india-2026-pay-scale-perks',
    [
      ['UPSC Civil Services', '/blog/toughest-exams-india-world-2026', 'one of India\'s toughest exams'],
      ['MBA graduates', '/blog/mba-scope-india-2026', 'MBA career scope'],
    ]
  ],

  // cyber-security blog
  ['cyber-security-salary-india-2026-career-guide',
    [
      ['AWS', '/blog/best-computer-courses-after-12th-india-2026', 'cloud certifications'],
      ['Data science', '/blog/data-science-salary-india-2026-scope-jobs', 'data science salary'],
    ]
  ],

  // data-science blog
  ['data-science-salary-india-2026-scope-jobs',
    [
      ['MBA in Business Analytics', '/blog/mba-data-science-analytics-career-2026', 'MBA in data science'],
      ['cyber security', '/blog/cyber-security-salary-india-2026-career-guide', 'cyber security careers'],
    ]
  ],

  // investment-banking blog
  ['investment-banking-career-india-salary-qualification',
    [
      ['MBA from IIM', '/blog/iim-ranking-india-2026-all-iims-list', 'IIM'],
      ['CFA', '/blog/commerce-jobs-list-salary-india-2026', 'commerce career paths'],
    ]
  ],

  // arts-stream blog
  ['arts-stream-jobs-career-options-salary-india',
    [
      ['UPSC', '/blog/toughest-exams-india-world-2026', 'one of India\'s toughest exams'],
      ['BA degree', '/blog/career-after-12th-arts-courses-jobs-2026', 'courses after 12th arts'],
    ]
  ],

  // commerce-jobs blog
  ['commerce-jobs-list-salary-india-2026',
    [
      ['MBA in Finance', '/programs/mba', 'MBA in Finance'],
      ['B.Com', '/blog/career-after-bcom-jobs-salary-courses-2026', 'career after B.Com'],
    ]
  ],

  // bsc-career blog
  ['bsc-career-options-scope-salary-india-2026',
    [
      ['data science', '/blog/data-science-salary-india-2026-scope-jobs', 'data science salary'],
      ['after B.Sc', '/blog/mba-after-bsc-is-it-good-2026', 'MBA after B.Sc'],
    ]
  ],

  // pgdm-vs-mba blog
  ['pgdm-vs-mba-difference-which-is-better-india',
    [
      ['IIM', '/blog/iim-ranking-india-2026-all-iims-list', 'IIM'],
      ['online MBA', '/blog/top-online-mba-india-2026', 'top online MBA programs'],
    ]
  ],

  // gd-topics blog
  ['gd-topics-for-mba-2026-with-answers',
    [
      ['IIM', '/blog/iim-ranking-india-2026-all-iims-list', 'IIM admissions'],
      ['MBA entrance', '/blog/mba-entrance-exams-india-2026', 'MBA entrance exams'],
    ]
  ],

  // llm blog
  ['llm-course-duration-fees-scope-india-2026',
    [
      ['corporate lawyer', '/blog/commerce-jobs-list-salary-india-2026', 'commerce and finance careers'],
    ]
  ],
];

// Apply internal links
internalLinks.forEach(([slug, links]) => {
  const slugIdx = blog.indexOf(`slug: '${slug}'`);
  if (slugIdx === -1) return;
  // Find the content field for this post (between this slug and next slug)
  const nextSlugIdx = blog.indexOf("slug: '", slugIdx + 10);
  const postSection = blog.slice(slugIdx, nextSlugIdx === -1 ? blog.length : nextSlugIdx);

  let updatedSection = postSection;
  links.forEach(([phrase, href, anchor]) => {
    // Only add if phrase exists and is not already wrapped in an <a>
    if (!updatedSection.includes(phrase)) return;
    // Check if already linked
    const linkCheck = new RegExp(`<a[^>]*href="${href.replace(/\//g,'\\/')}"`, 'i');
    if (linkCheck.test(updatedSection)) return;
    // Check if phrase is already inside an <a> tag
    const phraseIdx = updatedSection.indexOf(phrase);
    const before100 = updatedSection.slice(Math.max(0, phraseIdx-50), phraseIdx);
    if (before100.includes('<a ')) return; // already inside a link nearby
    // Replace first occurrence with linked anchor text
    updatedSection = updatedSection.replace(
      phrase,
      `<a href="${href}" style="color:inherit;text-decoration:underline;text-underline-offset:2px">${anchor}</a>`
    );
  });

  blog = blog.slice(0, slugIdx) + updatedSection + blog.slice(nextSlugIdx === -1 ? blog.length : nextSlugIdx);
});

fs.writeFileSync('lib/blog.ts', blog);
console.log('Internal links applied.');
