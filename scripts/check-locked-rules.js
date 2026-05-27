#!/usr/bin/env node
/**
 * check-locked-rules.js
 *
 * Guards against LOCKED RULE violations in lib/blog.ts:
 *   1. Em dash (U+2014) in any blog content, title, or meta
 *   2. Outbound links to competitor domains
 *
 * Usage:
 *   node scripts/check-locked-rules.js          # checks lib/blog.ts
 *   node scripts/check-locked-rules.js [file]   # checks a specific file
 *
 * Exit code 0 = clean. Exit code 1 = violations found.
 *
 * Pre-commit hook setup (one-time):
 *   cp scripts/check-locked-rules.js .git/hooks/pre-commit
 *   chmod +x .git/hooks/pre-commit   # (Linux/Mac only)
 *
 * Or add to package.json scripts:
 *   "lint:locked": "node scripts/check-locked-rules.js"
 */

const fs = require('fs');
const path = require('path');

const FILE = process.argv[2] || path.join(__dirname, '..', 'lib', 'blog.ts');

const COMPETITOR_DOMAINS = [
  'collegevidya.com',
  'shiksha.com',
  'careers360.com',
  'jaroeducation.com',
  'padhaao.com',
  'admissiondiy.com',
  'samarthedu.com',
  'kollegeapply.com',
  'pwmedharthi.com',
  'distanceeducationschool.com',
  'distanceeducation360.com',
  'mbadistanceeducation.com',
  'onlineuniversities.in',
  'collegedekho.com',
];

let violations = [];

if (!fs.existsSync(FILE)) {
  console.error('File not found:', FILE);
  process.exit(1);
}

const content = fs.readFileSync(FILE, 'utf8');
const lines = content.split('\n');

// Helper: find nearest slug above a line index
function nearestSlug(lineIdx) {
  for (let j = lineIdx; j >= 0; j--) {
    const m = lines[j].match(/slug:\s*['`]([^'`]+)['`]/);
    if (m) return m[1];
  }
  return '(unknown slug)';
}

// ── Check 1: Em dash (U+2014) ──────────────────────────────────────────────
lines.forEach((line, i) => {
  if (line.includes('—')) {
    const slug = nearestSlug(i);
    violations.push({
      type: 'EM_DASH',
      line: i + 1,
      slug,
      excerpt: line.trim().slice(0, 100),
    });
  }
});

// ── Check 2: Competitor domain outbound links ───────────────────────────────
const hrefRegex = /href=["']([^"']+)["']/gi;
lines.forEach((line, i) => {
  let match;
  while ((match = hrefRegex.exec(line)) !== null) {
    const url = match[1].toLowerCase();
    for (const domain of COMPETITOR_DOMAINS) {
      if (url.includes(domain)) {
        const slug = nearestSlug(i);
        violations.push({
          type: 'COMPETITOR_LINK',
          line: i + 1,
          slug,
          domain,
          excerpt: line.trim().slice(0, 120),
        });
      }
    }
  }
});

// ── Report ──────────────────────────────────────────────────────────────────
if (violations.length === 0) {
  console.log('check-locked-rules: PASS — no em dashes or competitor links found.');
  process.exit(0);
}

console.error('\n❌ LOCKED RULE VIOLATIONS DETECTED — commit blocked\n');

const emDashes = violations.filter(v => v.type === 'EM_DASH');
const compLinks = violations.filter(v => v.type === 'COMPETITOR_LINK');

if (emDashes.length > 0) {
  console.error(`Em dash (U+2014) violations: ${emDashes.length}`);
  const bySlug = {};
  emDashes.forEach(v => {
    bySlug[v.slug] = bySlug[v.slug] || [];
    bySlug[v.slug].push(v.line);
  });
  Object.entries(bySlug).forEach(([slug, lines]) => {
    console.error(`  [${slug}] line(s): ${lines.join(', ')}`);
    console.error('  Fix: replace — with comma (mid-sentence), period+new sentence (hard break), or parentheses (parenthetical).');
  });
}

if (compLinks.length > 0) {
  console.error(`\nCompetitor domain link violations: ${compLinks.length}`);
  compLinks.forEach(v => {
    console.error(`  [${v.slug}] line ${v.line}: ${v.domain}`);
    console.error(`  Fix: replace with internal edifyedu.in link (e.g., /universities/... or /contact).`);
  });
}

console.error('\nResolve all violations above before committing.\n');
process.exit(1);
