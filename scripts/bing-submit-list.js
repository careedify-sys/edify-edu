// Generates list of NEW URLs to submit to Bing
const submitted = new Set([
  '/blog/is-online-mba-worth-it-2026','/compare','/universities/andhra-university-online',
  '/blog/mba-marketing-career-salary-jobs-2026','/universities/nmims-online/mba',
  '/blog/smu-online-mba-review','/universities/gujarat-university-online',
  '/universities/amity-university-online/mba/human-resource-management',
  '/universities/amity-university-online/bca','/programs/ma','/',
  '/universities/nmims-online/mba/marketing','/universities/jaypee-university-online',
  '/universities/vtu-online','/blog/online-mba-for-working-professionals-india',
  '/universities/mangalayatan-university-online','/blog/1-year-mba-india-executive-mba-2026',
  '/blog/online-mba-courses-chennai-2026','/blog/symbiosis-online-mba-review-2026',
  '/universities/amity-university-online','/universities/amity-university-online/mba/finance-accounting-management',
  '/blog/online-mba-pune-university-2026','/blog/ugc-deb-approved-universities-list-2026',
  '/guides','/blog/cheapest-online-mba-india-2026',
  '/universities/manipal-academy-higher-education-online','/universities/marwadi-university-online',
  '/universities/sikkim-manipal-university-online/mba','/blog/online-mba-without-entrance-exam-india-2026',
  '/universities','/blog/online-mba-fee-comparison-india-2026',
  '/universities/shree-guru-gobind-singh-tricentenary-university-online',
  '/blog/govt-jobs-after-mba-india-2026','/universities/dy-patil-university-online/mba',
  '/blog/mba-data-science-analytics-career-2026','/universities/amity-university-online/bba',
  '/universities/jain-university-online/mba','/blog/online-mba-delhi-ncr-2026',
  '/programs/bcom','/blog/mba-fees-india-complete-guide-2026',
  '/blog/jobs-after-mca-salary-career-2026','/blog/amity-online-mba-review-2026',
  '/blog/pgdm-vs-mba-difference-which-is-better-india','/blog/mba-finance-career-salary-scope-2026',
  '/universities/lovely-professional-university-online/mca','/blog/online-mba-salary-india-2026',
  '/blog/distance-mba-bangalore-2026','/programs/mcom','/blog',
  '/universities/amity-university-online/mba/international-business','/blog/nmims-online-mba-review-2026',
  '/universities/amity-university-online/mca','/universities/lovely-professional-university-online/mba',
  '/universities/lovely-professional-university-online/bca','/universities/manipal-university-jaipur-online/mba',
  '/universities/manipal-university-jaipur-online','/blog/online-mba-lpu-review-2026',
  '/universities/amity-university-online/mba/marketing-sales-management',
  '/blog/amity-university-mba-distance-2026','/blog/mba-hr-career-salary-scope-2026',
  '/blog/iim-online-mba-india-2026','/blog/is-manipal-university-jaipur-fake-or-legit-2026',
  '/universities/chandigarh-university-online','/universities/sikkim-manipal-university-online',
  '/blog/is-online-degree-valid-india-2026','/universities/nmims-online/mba/human-resource-management',
  '/programs/bca','/blog/iim-ranking-india-2026-all-iims-list',
  '/blog/how-to-choose-online-mba-university-india-2026',
  '/universities/amity-university-online/mba/business-analytics',
  '/blog/cat-exam-syllabus-2026-complete-guide',
  '/universities/amity-university-online/mba/hospital-healthcare-management',
  '/universities/nmims-online/mba/finance','/universities/amity-university-online/mba/data-science',
  '/universities/symbiosis-university-online/mba','/blog/top-online-mba-india-2026',
  '/universities/amrita-vishwa-vidyapeetham-online','/universities/lovely-professional-university-online/bba',
  '/blog/affordable-online-mba-india-2026','/universities/nmims-online/mba/operations',
  '/universities/manipal-academy-higher-education-online/mba','/universities/symbiosis-university-online',
  '/programs/ba','/tools','/blog/career-after-mba-jobs-salary-scope-2026',
  '/blog/mba-after-bsc-is-it-good-2026','/universities/nmims-online','/blog/distance-mba-mumbai-2026',
  '/universities/dy-patil-university-online','/blog/best-mba-specialization-india-2026',
  '/blog/online-mba-government-employees-india-2026','/universities/amity-university-online/mba',
  '/blog/distance-mba-meaning-what-is-it-2026','/universities/sastra-university-online',
  '/blog/mba-or-mca-which-is-better-2026','/blog/career-after-bcom-jobs-salary-courses-2026',
  '/blog/mba-after-engineering-india-2026','/universities/jain-university-online',
  '/universities/chandigarh-university-online/mba','/universities/lovely-professional-university-online',
  '/programs/mca','/programs/bba','/programs/mba','/coupons',
]);

const newUrls = [];

// 1. NEW BLOGS (8 full-form + other missing)
const newBlogs = [
  'mba-full-form-course-details-eligibility-fees-2026',
  'bca-full-form-course-details-eligibility-fees-2026',
  'bba-full-form-course-details-eligibility-fees-2026',
  'mca-full-form-course-details-eligibility-fees-2026',
  'bcom-full-form-course-details-eligibility-fees-2026',
  'btech-full-form-course-details-eligibility-fees-2026',
  'bsc-full-form-course-details-eligibility-fees-2026',
  'ma-full-form-course-details-eligibility-fees-2026',
  'career-after-12th-arts-courses-jobs-2026',
  'career-after-12th-science-courses-jobs-2026',
  'career-after-12th-commerce-courses-jobs-2026',
  'online-mba-eligibility-criteria-india-2026',
  'online-mba-admission-process-india-2026',
  'distance-mba-hyderabad-2026',
  'distance-mba-kolkata-top-programs-2026',
  'online-mba-ahmedabad-gujarat-2026',
  'career-after-bca-jobs-salary-scope-2026',
  'phd-full-form-doctorate-meaning-india',
];
newBlogs.forEach(s => { if (!submitted.has('/blog/' + s)) newUrls.push('/blog/' + s); });

// 2. TOOLS & GUIDES (not submitted)
['/tools/cgpa-calculator','/tools/emi-calculator','/tools/percentage-to-gpa',
 '/best-online-mba-india','/about','/contact','/online-mca',
 '/guides/is-online-degree-valid-india','/guides/online-mba-vs-distance-mba',
 '/guides/how-to-check-ugc-deb-approval','/guides/naac-nirf-rankings-explained',
 '/guides/online-mba-eligibility-india','/guides/online-mba-for-government-jobs',
 '/programs/msc','/programs/bsc',
].forEach(u => { if (!submitted.has(u)) newUrls.push(u); });

// 3. TOP UNIVERSITIES not yet submitted
['gla-university-online','bits-pilani-online','shoolini-university-online',
 'chitkara-university-online','upes-online','vit-university-online',
 'dr-dy-patil-vidyapeeth-online','sharda-university-online',
 'dayananda-sagar-university-online','anna-university-online',
 'arka-jain-university-online','icfai-university-online',
 'ignou-online','galgotias-university-online',
].forEach(uni => {
  if (!submitted.has('/universities/' + uni)) newUrls.push('/universities/' + uni);
  if (!submitted.has('/universities/' + uni + '/mba')) newUrls.push('/universities/' + uni + '/mba');
});

// 4. COUPON PAGES
['amity-university-online','nmims-online','manipal-academy-of-higher-education-online',
 'manipal-university-jaipur-online','symbiosis-university-online',
 'sikkim-manipal-university-online','chandigarh-university-online',
 'jain-university-online','lovely-professional-university-online',
].forEach(c => { if (!submitted.has('/coupons/' + c)) newUrls.push('/coupons/' + c); });

// Output
console.log('========================================');
console.log('NEW URLs TO SUBMIT TO BING (' + newUrls.length + ')');
console.log('========================================\n');

console.log('--- 8 NEW FULL-FORM BLOGS (HIGHEST PRIORITY) ---');
newUrls.filter(u => u.includes('full-form')).forEach(u => console.log('https://edifyedu.in' + u));

console.log('\n--- OTHER NEW BLOGS ---');
newUrls.filter(u => u.startsWith('/blog/') && !u.includes('full-form')).forEach(u => console.log('https://edifyedu.in' + u));

console.log('\n--- TOOLS & GUIDES ---');
newUrls.filter(u => u.startsWith('/tools') || u.startsWith('/guides') || u === '/best-online-mba-india' || u === '/about' || u === '/contact' || u === '/online-mca' || u.startsWith('/programs/msc') || u.startsWith('/programs/bsc')).forEach(u => console.log('https://edifyedu.in' + u));

console.log('\n--- UNIVERSITIES ---');
newUrls.filter(u => u.startsWith('/universities/')).forEach(u => console.log('https://edifyedu.in' + u));

console.log('\n--- COUPONS ---');
newUrls.filter(u => u.startsWith('/coupons/')).forEach(u => console.log('https://edifyedu.in' + u));
