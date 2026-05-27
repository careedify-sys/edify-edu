/**
 * fix-blog-ts.js
 * Applies SEO sprint fixes to lib/blog.ts:
 *   1. Top 5 CTR title + meta rewrites
 *   2. Em dash removal (all 63 blogs, 513 instances)
 *   3. Competitor link removal (online-manipal + muj)
 *   4. NMIMS H hierarchy fix (add H3s under H2s)
 *
 * Usage: node scripts/fix-blog-ts.js [step]
 *   step 1 = CTR rewrites (top 5)
 *   step 2 = em dash removal
 *   step 3 = competitor links
 *   step 4 = NMIMS H hierarchy
 *   step all = all steps (default)
 */

const fs = require('fs');
const path = require('path');

const BLOG_FILE = path.join(__dirname, '..', 'lib', 'blog.ts');

function load() {
  return fs.readFileSync(BLOG_FILE, 'utf8');
}

function save(content) {
  fs.writeFileSync(BLOG_FILE, content, 'utf8');
}

// ────────────────────────────────────────────
// STEP 1: Top 5 CTR rewrites
// ────────────────────────────────────────────
function step1_ctrRewrites(content) {
  const rewrites = [
    {
      slug: 'is-manipal-university-jaipur-fake-or-legit-2026',
      oldTitle: "Is Manipal University Jaipur Fake or Legit? (2026 Proof)",
      newTitle: "Is Manipal University Jaipur Fake or Legit? 2026",
      oldSeoTitle: "Is Manipal University Jaipur Fake? 2026 UGC Verified Check",
      newSeoTitle: "Is Manipal University Jaipur Fake or Legit? 2026 Verdict",
      oldMeta: "Manipal University Jaipur (MUJ) is NOT fake. UGC-recognised since 2011, NAAC A+, NIRF Management rank 81. See accreditations, degree validity, and red flags.",
      newMeta: "Manipal University Jaipur is NOT fake. UGC-recognised since 2011, NAAC A+ accredited, NIRF Management rank 81. Degree validity confirmed, red flags checked.",
    },
    {
      slug: 'amity-online-mba-review-2026',
      oldTitle: "Amity Online MBA Review 2026: Fees and Honest Verdict",
      newTitle: "Amity Online MBA Review 2026: Fees, NAAC A+ and Verdict",
      oldSeoTitle: "Amity Online MBA Fees 2026: ₹2,07,000 + Review",
      newSeoTitle: "Amity Online MBA Review 2026: Fees, NAAC A+ and Verdict",
      oldMeta: "Amity Online MBA fees 2026: ₹2,07,000 one-time (saving ₹18,000 off list price). NAAC A+, NIRF Mgmt 49. 19 specialisations, EMI from ₹8,906/month.",
      newMeta: "Amity Online MBA 2026: ₹2.07L one-time fee, NAAC A+, NIRF Mgmt rank 49, 19 specialisations. Honest verdict on placement support and who should apply.",
    },
    {
      slug: 'smu-online-mba-review',
      oldTitle: "SMU Online MBA Review 2026: Fees and Honest Rating",
      newTitle: "SMU Online MBA Review 2026: Fees, NAAC A+ and Verdict",
      oldSeoTitle: "Sikkim Manipal Online MBA Fees 2026: ₹1,20,000 Review",
      newSeoTitle: "SMU Online MBA Review 2026: Fees, NAAC A+ and Verdict",
      oldMeta: "Sikkim Manipal University (SMU) Online MBA fees 2026: ₹1,20,000 total. NAAC A+ (3.28), UGC-DEB approved, dual specialisation. See eligibility and admission.",
      newMeta: "SMU Online MBA 2026: ₹1.20L total fee, NAAC A+ (3.28), dual specialisation, UGC-DEB approved. Honest rating on accreditation, career outcomes and who this suits.",
    },
    {
      slug: 'toughest-exams-india-world-2026',
      // Title uses backtick template literal - handle carefully
      oldTitleBT: "Toughest Exams in India and the World 2026: Real Pass Rates",
      newTitleBT: "Toughest Exams India and World 2026: Pass Rates Ranked",
      oldMeta: "The toughest exams in India and the world in 2026: real pass rates, preparation timelines, and what makes each exam genuinely hard.",
      newMeta: "Toughest exams in India and world 2026: UPSC, JEE Advanced, CA Final and GATE ranked by pass rate, prep time and career value. Which exam demands the most?",
    },
    {
      slug: 'career-after-bcom-jobs-salary-courses-2026',
      oldTitle: "Career After B.Com 2026: Top Jobs, Courses and Salary",
      newTitle: "Career After B.Com 2026: Top Jobs, Salary and Best Courses",
      oldMeta: "Career after B.Com in India 2026 - top 10 courses with fees, government jobs list, entry to senior salary data, and honest CA vs MBA comparison for commerce graduates.",
      newMeta: "Career after B.Com 2026: top jobs (CA, MBA, banking), salary ₹3L to ₹18L, best courses and which stream builds the fastest career growth for commerce graduates.",
    },
  ];

  let changed = 0;
  for (const r of rewrites) {
    // Update title (single-quoted)
    if (r.oldTitle) {
      const search = `title: '${r.oldTitle}'`;
      const replace = `title: '${r.newTitle}'`;
      if (content.includes(search)) {
        content = content.replace(search, replace);
        console.log(`  [CTR] title updated: ${r.slug}`);
        changed++;
      }
    }
    // Update title (backtick template literal)
    if (r.oldTitleBT) {
      const search = 'title: `' + r.oldTitleBT + '`';
      const replace = 'title: `' + r.newTitleBT + '`';
      if (content.includes(search)) {
        content = content.replace(search, replace);
        console.log(`  [CTR] title (bt) updated: ${r.slug}`);
        changed++;
      }
    }
    // Update seoTitle
    if (r.oldSeoTitle) {
      const search = `seoTitle: '${r.oldSeoTitle}'`;
      const replace = `seoTitle: '${r.newSeoTitle}'`;
      if (content.includes(search)) {
        content = content.replace(search, replace);
        console.log(`  [CTR] seoTitle updated: ${r.slug}`);
        changed++;
      }
    }
    // Update metaDescription (single-quoted)
    if (r.oldMeta) {
      const search = `metaDescription: '${r.oldMeta}'`;
      const replace = `metaDescription: '${r.newMeta}'`;
      if (content.includes(search)) {
        content = content.replace(search, replace);
        console.log(`  [CTR] meta (sq) updated: ${r.slug}`);
        changed++;
      }
      // Also try backtick version
      const searchBT = 'metaDescription: `' + r.oldMeta + '`';
      const replaceBT = 'metaDescription: `' + r.newMeta + '`';
      if (content.includes(searchBT)) {
        content = content.replace(searchBT, replaceBT);
        console.log(`  [CTR] meta (bt) updated: ${r.slug}`);
        changed++;
      }
    }
  }
  console.log(`Step 1 done: ${changed} field(s) updated.`);
  return content;
}

// ────────────────────────────────────────────
// STEP 2: Em dash removal across all content
// ────────────────────────────────────────────
function step2_emDashes(content) {
  // The 63 slugs with em dashes (from audit)
  const emDashSlugs = [
    'amity-online-mba-hr-worth-it','ias-officer-salary-india-2026-pay-scale-perks',
    'llm-course-duration-fees-scope-india-2026','mba-hr-management-online-india-2026',
    'mba-pharmaceutical-management-online-india-2026','online-mba-business-data-analytics-india-2026',
    'online-mba-hospital-healthcare-management-india-2026','online-mba-supply-chain-management-india-2026',
    'nmims-online-mba-review-2026','phd-full-form-doctorate-meaning-india',
    'cat-exam-syllabus-2026-complete-guide','career-objective-for-fresher-resume-examples',
    'courses-after-12th-science-complete-list-2026','toughest-exams-india-world-2026',
    'cyber-security-salary-india-2026-career-guide','arts-stream-jobs-career-options-salary-india',
    'gd-topics-for-mba-2026-with-answers','online-mca-course-india',
    'amity-online-mca-fees-review','vignan-online-mba-review',
    'dsu-online-mba-review','is-online-mba-worth-it-2026',
    'how-to-choose-online-mba-university-india-2026','affordable-online-mba-india-2026',
    'online-mba-for-working-professionals-india','iim-online-mba-india-2026',
    'best-mba-specialization-india-2026','mat-exam-2026-eligibility-pattern-dates',
    'mba-entrance-exams-india-2026','ugc-deb-approved-universities-list-2026',
    'mba-vs-pgdm-online-india-2026','online-mba-lpu-review-2026',
    'distance-mba-kolkata-top-programs-2026','online-mba-pune-university-2026',
    'is-online-degree-valid-india-2026','mba-after-engineering-india-2026',
    'mba-finance-career-salary-scope-2026','mba-hr-career-salary-scope-2026',
    'mba-data-science-analytics-career-2026','mba-operations-management-career-2026',
    'du-online-mba-delhi-university-2026','mba-international-online-global-programs-2026',
    'distance-mba-meaning-what-is-it-2026','online-mba-courses-chennai-2026',
    'online-mba-fee-comparison-india-2026','is-mba-post-graduation-india-2026',
    'amity-online-mba-review-2026','smu-online-mba-review',
    'uu-doon-online-mba-review','galgotias-online-mba-review',
    'arka-jain-online-mba-review','noida-international-university-online-mba-review',
    'shoolini-online-mba-review','dy-patil-online-mba-review',
    'chandigarh-university-online-mba-review','jaypee-jiit-online-mba-review',
    'mba-full-form-course-details-eligibility-fees-2026','best-online-bba-colleges-india-2026',
    'online-bba-fees-india-2026','online-bba-india-2026',
    'online-mba-fintech-india-2026','online-mba-hospitality-management-india-2026',
    'online-mba-logistics-management-india-2026',
  ];

  // Process each slug's content section
  // Strategy: find each blog entry by slug, process its content template literal
  let totalReplaced = 0;
  let blogsFixed = 0;

  for (const slug of emDashSlugs) {
    const slugSearch = `slug: '${slug}'`;
    const slugPos = content.indexOf(slugSearch);
    if (slugPos === -1) continue;

    // Find next slug to bound this entry
    const nextSlugPos = content.indexOf(`slug: '`, slugPos + slugSearch.length);
    const entryEnd = nextSlugPos === -1 ? content.length : nextSlugPos;
    const entry = content.slice(slugPos, entryEnd);

    // Count em dashes in this entry
    const before = (entry.match(/—/g) || []).length;
    if (before === 0) continue;

    // Apply replacements to this entry:
    // Rule 1: Parenthetical double em dash: X — Y — Z → X (Y) Z
    // We apply this first to handle the more complex case
    let fixed = entry.replace(/([^<>\n—]{3,50}) — ([^<>\n—]{3,80}) — /g, (m, a, b) => {
      return a + ' (' + b.trim() + ') ';
    });

    // Rule 2: Remaining single em dash with spaces → comma
    fixed = fixed.replace(/ — /g, ', ');

    // Rule 3: Em dash at end of line (before newline/tag) → period
    fixed = fixed.replace(/—(\n|<)/g, '.$1');

    // Rule 4: Em dash glued to word (no spaces) → comma with space
    fixed = fixed.replace(/—/g, ', ');

    const after = (fixed.match(/—/g) || []).length;
    const replaced = before - after;

    if (replaced > 0) {
      content = content.slice(0, slugPos) + fixed + content.slice(entryEnd);
      totalReplaced += replaced;
      blogsFixed++;
    }
  }

  console.log(`Step 2 done: ${totalReplaced} em dashes removed from ${blogsFixed} blogs.`);
  return content;
}

// ────────────────────────────────────────────
// STEP 3: Competitor link removal
// ────────────────────────────────────────────
function step3_competitorLinks(content) {
  let changed = 0;

  // --- online-manipal-mba-review-2026 ---
  // Fix 1: Voice card CollegeVidya link → remove outbound link, keep review text
  const oldVoiceLink = `<span class="voice-src"><a href="https://collegevidya.com/university/mahe-manipal-online/reviews/" target="_blank">CollegeVidya, MAHE Review</a></span>`;
  const newVoiceLink = `<span class="voice-src">Online student review, MAHE</span>`;
  if (content.includes(oldVoiceLink)) {
    content = content.replace(oldVoiceLink, newVoiceLink);
    console.log('  [Comp] Removed CollegeVidya voice card link (online-manipal)');
    changed++;
  }

  // Fix 2: Pull quote text mention of CollegeVidya → reword
  const oldPull = `Across reviews on Quora, official testimonials, and CollegeVidya: the LMS quality, faculty access, and flexibility are consistently praised.`;
  const newPull = `Across reviews on Quora, official testimonials, and independent forums: the LMS quality, faculty access, and flexibility are consistently praised.`;
  if (content.includes(oldPull)) {
    content = content.replace(oldPull, newPull);
    console.log('  [Comp] Removed CollegeVidya pull quote mention (online-manipal)');
    changed++;
  }

  // Fix 3: References section CollegeVidya link → internal link
  const oldRef = `<li><a href="https://collegevidya.com/university/mahe-manipal-online/reviews/" target="_blank">CollegeVidya: MAHE Reviews</a> <span class="src-badge">Reviews</span></li>`;
  const newRef = `<li><a href="/universities/manipal-academy-higher-education-online/mba" class="ilink">MAHE Online MBA: EdifyEdu Comparison</a> <span class="src-badge">Internal</span></li>`;
  if (content.includes(oldRef)) {
    content = content.replace(oldRef, newRef);
    console.log('  [Comp] Replaced CollegeVidya ref link with internal link (online-manipal)');
    changed++;
  }

  // --- muj-online-mba-review-2026 ---
  // Fix 1: H2 heading that names Shiksha
  const oldH2 = `<h2>What Students on Quora and Shiksha Say</h2>`;
  const newH2 = `<h2>What Students Say</h2>`;
  if (content.includes(oldH2)) {
    content = content.replace(oldH2, newH2);
    console.log('  [Comp] Removed Shiksha from H2 heading (muj)');
    changed++;
  }

  // Fix 2: Shiksha outbound link → internal link
  // The line: <li><a href="https://www.shiksha.com/university/manipal-university-jaipur-38039/reviews" target="_blank">Shiksha &mdash;
  // Find and replace this anchor
  const shikshaLinkRegex = /<a href="https:\/\/www\.shiksha\.com\/university\/manipal-university-jaipur-38039\/reviews"[^>]*>Shiksha[^<]*<\/a>/;
  if (shikshaLinkRegex.test(content)) {
    content = content.replace(shikshaLinkRegex, '<a href="/universities/manipal-university-jaipur-online/mba" class="ilink">MUJ Online MBA: EdifyEdu Data</a>');
    console.log('  [Comp] Replaced Shiksha link with internal link (muj)');
    changed++;
  }

  console.log(`Step 3 done: ${changed} competitor reference(s) fixed.`);
  return content;
}

// ────────────────────────────────────────────
// STEP 4: NMIMS H hierarchy fix (add H3s)
// ────────────────────────────────────────────
function step4_nmims(content) {
  let changed = 0;

  // H2: "Curriculum and Learning Experience" — add H3s for sub-sections
  const oldCurriculum = `<h2>Curriculum and Learning Experience</h2>

<p>The programme runs across 4 semesters with 96 total credits. Here is how the two years break down.</p>

<p><strong>Semesters 1 and 2 (Core):</strong>`;
  const newCurriculum = `<h2>Curriculum and Learning Experience</h2>

<p>The programme runs across 4 semesters with 96 total credits. Here is how the two years break down.</p>

<h3>Semesters 1 and 2: Core Modules</h3>

<p><strong>Semesters 1 and 2 (Core):</strong>`;
  if (content.includes(oldCurriculum)) {
    content = content.replace(oldCurriculum, newCurriculum);
    changed++;
  }

  const oldSpec = `<p><strong>Semesters 3 and 4 (Specialisation):</strong>`;
  const newSpec = `<h3>Semesters 3 and 4: Specialisation Track</h3>

<p><strong>Semesters 3 and 4 (Specialisation):</strong>`;
  if (content.includes(oldSpec)) {
    content = content.replace(oldSpec, newSpec);
    changed++;
  }

  const oldLMS = `<p>Live sessions happen on weekends.`;
  const newLMS = `<h3>Learning Platform and Exam Format</h3>

<p>Live sessions happen on weekends.`;
  // Only replace within NMIMS entry (find the slug boundary)
  const nmPos = content.indexOf("slug: 'nmims-online-mba-review-2026'");
  const nmEnd = content.indexOf("slug: '", nmPos + 50);
  if (nmPos > -1) {
    const before = content.slice(0, nmPos);
    const nmEntry = content.slice(nmPos, nmEnd > -1 ? nmEnd : undefined);
    if (nmEntry.includes(oldLMS)) {
      const fixedEntry = nmEntry.replace(oldLMS, newLMS);
      content = before + fixedEntry + (nmEnd > -1 ? content.slice(nmEnd) : '');
      changed++;
    }
  }

  // H2: "Placements, Career Support and NMIMS Alumni Network" — add H3s
  const oldPlacement = `<p>Let us be direct about this. NMIMS provides career support`;
  const newPlacement = `<h3>Career Support: What You Actually Get</h3>

<p>Let us be direct about this. NMIMS provides career support`;
  if (content.includes(oldPlacement)) {
    content = content.replace(oldPlacement, newPlacement);
    changed++;
  }

  const oldAlumni = `<p>The NMIMS alumni network is large`;
  const newAlumni = `<h3>NMIMS Alumni Network</h3>

<p>The NMIMS alumni network is large`;
  if (content.includes(oldAlumni)) {
    content = content.replace(oldAlumni, newAlumni);
    changed++;
  }

  // H2: "Admission Process, Eligibility and 2026 Timelines" — add H3s
  const oldElig = `<p><strong>Eligibility:</strong> Bachelor's degree from a recognised university`;
  const newElig = `<h3>Eligibility Criteria</h3>

<p><strong>Eligibility:</strong> Bachelor's degree from a recognised university`;
  if (content.includes(oldElig)) {
    content = content.replace(oldElig, newElig);
    changed++;
  }

  const oldApply = `<p><strong>How to apply:</strong></p>`;
  const newApply = `<h3>How to Apply</h3>

<p><strong>How to apply:</strong></p>`;
  if (content.includes(oldApply)) {
    content = content.replace(oldApply, newApply);
    changed++;
  }

  const oldIntake = `<p><strong>Two intake windows:</strong>`;
  const newIntake = `<h3>Intake Windows and 2026 Timelines</h3>

<p><strong>Two intake windows:</strong>`;
  if (content.includes(oldIntake)) {
    content = content.replace(oldIntake, newIntake);
    changed++;
  }

  console.log(`Step 4 done: ${changed} H3 insertion(s) in NMIMS.`);
  return content;
}

// ────────────────────────────────────────────
// MAIN
// ────────────────────────────────────────────
const step = process.argv[2] || 'all';

let content = load();
const beforeEmDash = (content.match(/—/g) || []).length;

if (step === '1' || step === 'all') {
  console.log('\n--- Step 1: CTR rewrites ---');
  content = step1_ctrRewrites(content);
}
if (step === '2' || step === 'all') {
  console.log('\n--- Step 2: Em dash removal ---');
  content = step2_emDashes(content);
}
if (step === '3' || step === 'all') {
  console.log('\n--- Step 3: Competitor links ---');
  content = step3_competitorLinks(content);
}
if (step === '4' || step === 'all') {
  console.log('\n--- Step 4: NMIMS H hierarchy ---');
  content = step4_nmims(content);
}

save(content);

const afterEmDash = (content.match(/—/g) || []).length;
console.log(`\nEm dash count: ${beforeEmDash} → ${afterEmDash} (removed ${beforeEmDash - afterEmDash})`);
console.log('Done. lib/blog.ts updated.');
