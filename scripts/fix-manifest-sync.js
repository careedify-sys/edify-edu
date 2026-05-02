/**
 * fix-manifest-sync.js
 * Finds all specs in data.ts that are missing from programs-manifest.json
 * and adds them. Does NOT modify data.ts or any other file.
 */
const fs = require('fs');
const path = require('path');

const MANIFEST_PATH = path.join(__dirname, '..', 'lib', 'data', 'programs-manifest.json');
const DATA_PATH = path.join(__dirname, '..', 'lib', 'data.ts');

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const PROG_MAP = {
  'MBA': 'mba', 'MCA': 'mca', 'BBA': 'bba', 'BCA': 'bca',
  'B.Com': 'bcom', 'M.Com': 'mcom', 'MA': 'ma', 'BA': 'ba',
  'MSc': 'msc', 'BSc': 'bsc',
};

// 1. Read manifest
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const manifestKeys = new Set();
for (const row of manifest) {
  if (row.spec_slug) {
    manifestKeys.add(row.university_slug + '|' + row.program + '|' + row.spec_slug);
  }
}
console.log('Current manifest entries: ' + manifest.length);

// 2. Read data.ts and extract every uni's specs
const dataTs = fs.readFileSync(DATA_PATH, 'utf8');
const idRegex = /id: '([^']+)'/g;
let m;
const allIds = [];
while ((m = idRegex.exec(dataTs)) !== null) {
  allIds.push({ id: m[1], index: m.index });
}

const toAdd = [];
let totalDataSpecs = 0;

for (let i = 0; i < allIds.length; i++) {
  const uniId = allIds[i].id;
  const start = allIds[i].index;
  const end = i + 1 < allIds.length ? allIds[i + 1].index : dataTs.length;
  const block = dataTs.slice(start, Math.min(end, start + 10000));

  for (const [progName, progSlug] of Object.entries(PROG_MAP)) {
    // Find specs array for this program
    const escaped = progName.replace(/\./g, '\\.');
    const progIdx = block.indexOf("'" + progName + "'");
    if (progIdx === -1) continue;

    const afterProg = block.slice(progIdx);
    const specsMatch = afterProg.match(/specs:\s*\[([^\]]*)\]/);
    if (!specsMatch) continue;

    // Extract spec strings
    const specStrings = [];
    const sRe = /'([^']+)'/g;
    let sm;
    while ((sm = sRe.exec(specsMatch[1])) !== null) {
      const afterS = specsMatch[1].slice(sm.index + sm[0].length).trimStart();
      if (!afterS.startsWith(':')) specStrings.push(sm[1]);
    }

    for (const specName of specStrings) {
      const ss = slugify(specName);
      if (!ss || ss === 'general') continue;
      totalDataSpecs++;

      const key = uniId + '|' + progSlug + '|' + ss;
      if (!manifestKeys.has(key)) {
        toAdd.push({
          university_slug: uniId,
          program: progSlug,
          spec_slug: ss,
          spec_name: specName,
        });
        manifestKeys.add(key);
      }
    }
  }
}

console.log('Total specs in data.ts: ' + totalDataSpecs);
console.log('Missing from manifest: ' + toAdd.length);

if (toAdd.length > 0) {
  const updated = [...manifest, ...toAdd];
  fs.writeFileSync(MANIFEST_PATH, JSON.stringify(updated, null, 2), 'utf8');
  console.log('\nAdded ' + toAdd.length + ' entries. New manifest total: ' + updated.length);

  // Show by university
  const byUni = {};
  toAdd.forEach(e => {
    byUni[e.university_slug] = (byUni[e.university_slug] || 0) + 1;
  });
  console.log('\nBy university:');
  Object.entries(byUni).sort((a, b) => b[1] - a[1]).forEach(([uni, count]) => {
    console.log('  ' + uni + ': +' + count);
  });
} else {
  console.log('\nAll specs already in manifest. Nothing to add.');
}
