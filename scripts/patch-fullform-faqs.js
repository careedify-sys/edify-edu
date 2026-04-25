/**
 * patch-fullform-faqs.js
 * Extracts FAQs from HTML and patches the faqs arrays in lib/blog.ts
 */
const fs = require('fs');
const path = require('path');

const BLOG_TS = path.join(__dirname, '..', 'lib', 'blog.ts');
const CONTENT_DIR = path.join(__dirname, '..', 'content', 'blogs');

const slugs = [
  'mba-full-form-course-details-eligibility-fees-2026',
  'bca-full-form-course-details-eligibility-fees-2026',
  'bba-full-form-course-details-eligibility-fees-2026',
  'mca-full-form-course-details-eligibility-fees-2026',
  'bcom-full-form-course-details-eligibility-fees-2026',
  'btech-full-form-course-details-eligibility-fees-2026',
  'bsc-full-form-course-details-eligibility-fees-2026',
  'ma-full-form-course-details-eligibility-fees-2026',
];

function extractFaqs(html) {
  const faqs = [];

  // Pattern 1: Schema.org itemprop
  const p1 = /<h3[^>]*itemprop=['"]name['"][^>]*>([\s\S]*?)<\/h3>[\s\S]*?<div[^>]*itemprop=['"]text['"][^>]*>([\s\S]*?)<\/div>/gi;
  let m;
  while ((m = p1.exec(html)) !== null) {
    faqs.push({
      q: m[1].replace(/<[^>]+>/g, '').replace(/^\d+\.\s*/, '').trim(),
      a: m[2].replace(/<[^>]+>/g, '').trim()
    });
  }
  if (faqs.length > 0) return faqs;

  // Pattern 2: details/summary
  const p2 = /<summary[^>]*><strong>([\s\S]*?)<\/strong><\/summary>\s*<p>([\s\S]*?)<\/p>/gi;
  while ((m = p2.exec(html)) !== null) {
    const q = m[1].replace(/<[^>]+>/g, '').trim();
    const a = m[2].replace(/<[^>]+>/g, '').trim();
    if (q && a) faqs.push({ q, a });
  }
  if (faqs.length > 0) return faqs;

  // Pattern 3: h3 + p inside FAQ section
  const faqMatch = html.match(/Frequently Asked Questions[\s\S]*$/i);
  if (faqMatch) {
    const faqSection = faqMatch[0];
    const p3 = /<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p[^>]*>([\s\S]*?)<\/p>/gi;
    while ((m = p3.exec(faqSection)) !== null) {
      const q = m[1].replace(/<[^>]+>/g, '').replace(/^\d+\.\s*/, '').trim();
      const a = m[2].replace(/<[^>]+>/g, '').trim();
      if (q.includes('?') && a.length > 10) faqs.push({ q, a });
    }
  }

  return faqs;
}

let blogTs = fs.readFileSync(BLOG_TS, 'utf8');
let patched = 0;

for (const slug of slugs) {
  const htmlPath = path.join(CONTENT_DIR, slug, slug + '.html');
  const html = fs.readFileSync(htmlPath, 'utf8');
  const faqs = extractFaqs(html);

  if (faqs.length === 0) {
    console.log(`${slug}: WARNING - no FAQs found`);
    continue;
  }

  // Find the faqs array for this slug in blog.ts and replace it
  const slugIdx = blogTs.indexOf(`slug: '${slug}'`);
  if (slugIdx === -1) {
    console.log(`${slug}: not found in blog.ts`);
    continue;
  }

  // Find the faqs: [] or faqs: [...] after this slug
  const afterSlug = blogTs.slice(slugIdx);
  const faqsMatch = afterSlug.match(/faqs:\s*\[[\s\S]*?\],\s*\n/);
  if (!faqsMatch) {
    console.log(`${slug}: could not find faqs array`);
    continue;
  }

  const faqsStart = slugIdx + faqsMatch.index;
  const faqsEnd = faqsStart + faqsMatch[0].length;

  // Build replacement
  const faqEntries = faqs.map(f => {
    const q = f.q.replace(/'/g, "\\'");
    const a = f.a.replace(/'/g, "\\'");
    return `      { q: '${q}', a: '${a}' }`;
  }).join(',\n');

  const replacement = `faqs: [\n${faqEntries},\n    ],\n`;

  blogTs = blogTs.slice(0, faqsStart) + replacement + blogTs.slice(faqsEnd);
  patched++;
  console.log(`${slug}: patched with ${faqs.length} FAQs`);
}

fs.writeFileSync(BLOG_TS, blogTs, 'utf8');
console.log(`\nDone! Patched ${patched} blog posts with FAQs.`);
