const fs = require('fs');
const path = require('path');

const dataTs = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8');
const FP = path.join(__dirname, '..', 'lib', 'data', 'valid-urls.json');
const MANIFEST_PATH = path.join(__dirname, '..', 'lib', 'data', 'programs-manifest.json');

function slugify(s) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

const progMap = {
  'MBA': 'mba', 'MCA': 'mca', 'BBA': 'bba', 'BCA': 'bca',
  'B.Com': 'bcom', 'M.Com': 'mcom', 'MA': 'ma', 'BA': 'ba',
  'MSc': 'msc', 'BSc': 'bsc'
};

const ids = [
  'srm-institute-science-technology-online',
  'srm-university-sikkim-online',
  'yenepoya-university-online'
];

const newUrls = [];
const newManifestEntries = [];

for (const id of ids) {
  const idIdx = dataTs.indexOf("id: '" + id + "'");
  if (idIdx === -1) { console.log('NOT FOUND: ' + id); continue; }

  // Get block for this uni
  const nextIdMatch = dataTs.indexOf("\n  {", idIdx + 10);
  const block = dataTs.slice(idIdx, nextIdMatch > -1 ? nextIdMatch : idIdx + 5000);

  newUrls.push('/universities/' + id);

  // Get programs
  const pm = block.match(/programs:\s*\[([^\]]+)\]/);
  if (!pm) { console.log('NO PROGRAMS: ' + id); continue; }

  const programs = [];
  const pRe = /'([^']+)'/g;
  let pM;
  while ((pM = pRe.exec(pm[1])) !== null) programs.push(pM[1]);

  for (const prog of programs) {
    const slug = progMap[prog];
    if (!slug) continue;

    newUrls.push('/universities/' + id + '/' + slug);

    // Find specs for this program
    const escaped = prog.replace(/\./g, '\\.');
    const specPattern = "'" + escaped + "'";
    const progIdx = block.indexOf(specPattern);
    if (progIdx === -1) continue;

    const afterProg = block.slice(progIdx);
    const specsMatch = afterProg.match(/specs:\s*\[([^\]]*)\]/);
    if (!specsMatch) continue;

    const specStrings = [];
    const sRe = /'([^']+)'/g;
    let sM;
    while ((sM = sRe.exec(specsMatch[1])) !== null) {
      const afterS = specsMatch[1].slice(sM.index + sM[0].length).trimStart();
      if (!afterS.startsWith(':')) specStrings.push(sM[1]);
    }

    for (const specName of specStrings) {
      const ss = slugify(specName);
      if (ss && ss !== 'general') {
        newUrls.push('/universities/' + id + '/' + slug + '/' + ss);
        newManifestEntries.push({
          university_slug: id,
          program: slug,
          spec_slug: ss,
          spec_name: specName
        });
      }
    }
  }
}

// Add to valid-urls.json
const urls = JSON.parse(fs.readFileSync(FP, 'utf8'));
const existing = new Set(urls);
let addedUrls = 0;
for (const u of newUrls) {
  if (!existing.has(u)) {
    urls.push(u);
    addedUrls++;
  }
}
fs.writeFileSync(FP, JSON.stringify(urls, null, 2), 'utf8');
console.log('Added ' + addedUrls + ' URLs to valid-urls.json. Total: ' + urls.length);

// Add to manifest
const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
const manifestKeys = new Set(manifest.map(r => r.university_slug + '|' + r.program + '|' + (r.spec_slug || '')));
let addedManifest = 0;
for (const entry of newManifestEntries) {
  const key = entry.university_slug + '|' + entry.program + '|' + entry.spec_slug;
  if (!manifestKeys.has(key)) {
    manifest.push(entry);
    manifestKeys.add(key);
    addedManifest++;
  }
}
fs.writeFileSync(MANIFEST_PATH, JSON.stringify(manifest, null, 2), 'utf8');
console.log('Added ' + addedManifest + ' entries to manifest. Total: ' + manifest.length);

// Print summary
newUrls.forEach(u => console.log('  ' + u));
