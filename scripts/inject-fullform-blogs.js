/**
 * inject-fullform-blogs.js
 * Adds the 8 "full form" blog posts into lib/blog.ts
 * Run: node scripts/inject-fullform-blogs.js
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

// Read blog.ts
let blogTs = fs.readFileSync(BLOG_TS, 'utf8');

// Check for duplicates
const alreadyPresent = slugs.filter(s => blogTs.includes(`slug: '${s}'`));
if (alreadyPresent.length > 0) {
  console.log('Already in blog.ts, skipping:', alreadyPresent.join(', '));
}

const toInsert = slugs.filter(s => !blogTs.includes(`slug: '${s}'`));
if (toInsert.length === 0) {
  console.log('All blogs already present. Nothing to do.');
  process.exit(0);
}

// Build entries
const entries = [];
for (const slug of toInsert) {
  const dir = path.join(CONTENT_DIR, slug);
  const meta = JSON.parse(fs.readFileSync(path.join(dir, slug + '.meta.json'), 'utf8'));
  const html = fs.readFileSync(path.join(dir, slug + '.html'), 'utf8');

  // Extract FAQs from schema markup
  const faqRegex = /<h3[^>]*itemprop="name"[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<div[^>]*itemprop="text"[^>]*>([\s\S]*?)<\/div>/gi;
  const faqs = [];
  let m;
  while ((m = faqRegex.exec(html)) !== null) {
    const q = m[1].replace(/<[^>]+>/g, '').replace(/^\d+\.\s*/, '').trim();
    const a = m[2].replace(/<[^>]+>/g, '').trim();
    if (q && a) faqs.push({ q, a });
  }

  // If no schema FAQs found, try simpler pattern
  if (faqs.length === 0) {
    const simpleFaqRegex = /<h3[^>]*>([\s\S]*?)<\/h3>[\s\S]*?<p>([\s\S]*?)<\/p>/gi;
    // Only look in FAQ section
    const faqSectionMatch = html.match(/Frequently Asked Questions[\s\S]*?<h2>Sources/i);
    if (faqSectionMatch) {
      const faqSection = faqSectionMatch[0];
      let fm;
      while ((fm = simpleFaqRegex.exec(faqSection)) !== null) {
        const q = fm[1].replace(/<[^>]+>/g, '').replace(/^\d+\.\s*/, '').trim();
        const a = fm[2].replace(/<[^>]+>/g, '').trim();
        if (q && a && q.includes('?')) faqs.push({ q, a });
      }
    }
  }

  // Escape for template literal
  const escapedHtml = html
    .replace(/\\/g, '\\\\')
    .replace(/`/g, '\\`')
    .replace(/\$\{/g, '\\${');

  const faqsStr = JSON.stringify(faqs, null, 6)
    .replace(/"/g, "'")
    .replace(/\n/g, '\n    ');

  const tagsStr = JSON.stringify(meta.tags).replace(/"/g, "'");

  const entry = `  {
    slug: '${meta.slug}',
    title: '${meta.title.replace(/'/g, "\\'")}',
    seoTitle: '${(meta.seoTitle || meta.title).replace(/'/g, "\\'")}',
    metaDescription: '${meta.metaDescription.replace(/'/g, "\\'")}',
    category: '${meta.category}',
    tags: ${tagsStr},
    publishedAt: '${meta.publishedAt}',
    readTime: ${meta.readTime},
    targetKeyword: '${meta.targetKeyword}',
    author: '${meta.author || 'Rishi Kumar'}',
    relatedUniversities: [],
    status: '${meta.status || 'published'}' as const,
    faqs: ${faqsStr},
    content: \`${escapedHtml}\`,
  }`;

  entries.push(entry);
  console.log(`Prepared: ${slug} (${faqs.length} FAQs, ${html.length} chars)`);
}

// Find the closing of BLOG_POSTS array: the line with just "]"
// We need to insert before the last "]" of the array
// Find the last "]" before "export const BLOG_CATEGORIES"
const catIdx = blogTs.indexOf('export const BLOG_CATEGORIES');
if (catIdx === -1) {
  console.error('Could not find BLOG_CATEGORIES export.');
  process.exit(1);
}

// Find the "]" that closes BLOG_POSTS array, searching backwards from catIdx
const beforeCat = blogTs.slice(0, catIdx);
const lastBracket = beforeCat.lastIndexOf(']');
if (lastBracket === -1) {
  console.error('Could not find closing bracket of BLOG_POSTS.');
  process.exit(1);
}

const newEntries = ',\n' + entries.join(',\n');
blogTs = blogTs.slice(0, lastBracket) + newEntries + '\n' + blogTs.slice(lastBracket);

fs.writeFileSync(BLOG_TS, blogTs, 'utf8');
console.log(`\nDone! Inserted ${entries.length} blog posts into lib/blog.ts`);
