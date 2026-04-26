/**
 * sync-manifest-specs.js
 * Adds all missing spec entries from data.ts to programs-manifest.json
 * MUST use Node.js fs.writeFileSync (Python writes silently fail)
 */
const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'lib', 'data', 'programs-manifest.json');
const DATA_PATH = path.join(__dirname, '..', 'lib', 'data.ts');

// Slugify function matching data.ts line 88
function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

// Program name mapping (manifest uses lowercase)
const PROGRAM_MAP = {
  'MBA': 'mba', 'MCA': 'mca', 'BBA': 'bba', 'BCA': 'bca',
  'B.Com': 'bcom', 'M.Com': 'mcom', 'MA': 'ma', 'BA': 'ba',
  'MSc': 'msc', 'BSc': 'bsc',
};

// 1. Read existing manifest
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
console.log(`Existing manifest entries: ${manifest.length}`);

// Build a set of existing (uni_slug|program|spec_slug)
const existingKeys = new Set();
for (const row of manifest) {
  if (row.spec_slug) {
    existingKeys.add(`${row.university_slug}|${row.program}|${row.spec_slug}`);
  }
}

// 2. Parse data.ts to extract all university specs
const dataTs = fs.readFileSync(DATA_PATH, 'utf8');

// Extract UNIVERSITIES array content
const uniMatch = dataTs.match(/export const UNIVERSITIES:\s*University\[\]\s*=\s*\[/);
if (!uniMatch) {
  console.error('Could not find UNIVERSITIES array');
  process.exit(1);
}

// Parse each university block to get id and programDetails
const uniRegex = /id:\s*'([^']+)'/g;
const allIds = [];
let m;
while ((m = uniRegex.exec(dataTs)) !== null) {
  allIds.push({ id: m[1], index: m.index });
}

let added = 0;
const newEntries = [];

for (let i = 0; i < allIds.length; i++) {
  const uniId = allIds[i].id;
  const start = allIds[i].index;
  const end = i + 1 < allIds.length ? allIds[i + 1].index : dataTs.length;
  const block = dataTs.slice(start, end);

  // Find programDetails
  const pdMatch = block.match(/programDetails:\s*\{/);
  if (!pdMatch) continue;

  const pdStart = pdMatch.index + pdMatch[0].length;
  const pdBlock = block.slice(pdStart);

  // Find each program and its specs
  for (const [progName, progSlug] of Object.entries(PROGRAM_MAP)) {
    // Match patterns like 'MBA': { specs: [...]
    const escaped = progName.replace('.', '\\.');
    const progRegex = new RegExp(`'${escaped}'\\s*:\\s*\\{[^}]*specs:\\s*\\[([^\\]]*?)\\]`, 's');
    const progMatch = pdBlock.match(progRegex);
    if (!progMatch) continue;

    const specsRaw = progMatch[1];
    // Extract spec strings - handle both simple strings and object specs
    const specStrings = [];

    // Match quoted strings
    const strRegex = /'([^']+)'/g;
    let sm;
    while ((sm = strRegex.exec(specsRaw)) !== null) {
      // Skip if it looks like a key (followed by colon)
      const afterMatch = specsRaw.slice(sm.index + sm[0].length).trimStart();
      if (afterMatch.startsWith(':')) continue;
      specStrings.push(sm[1]);
    }

    for (const specName of specStrings) {
      const specSlugVal = slugify(specName);
      if (!specSlugVal || specSlugVal === 'general') continue;

      const key = `${uniId}|${progSlug}|${specSlugVal}`;
      if (!existingKeys.has(key)) {
        newEntries.push({
          university_slug: uniId,
          program: progSlug,
          spec_slug: specSlugVal,
          spec_name: specName,
        });
        existingKeys.add(key);
        added++;
      }
    }
  }
}

// 3. Append new entries to manifest
const updatedManifest = [...manifest, ...newEntries];
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updatedManifest, null, 2), 'utf8');

console.log(`Added ${added} new spec entries`);
console.log(`New manifest total: ${updatedManifest.length}`);

// Print sample of what was added
console.log('\nSample additions:');
newEntries.slice(0, 15).forEach(e => {
  console.log(`  ${e.university_slug} | ${e.program} | ${e.spec_slug}`);
});
if (newEntries.length > 15) {
  console.log(`  ... and ${newEntries.length - 15} more`);
}
