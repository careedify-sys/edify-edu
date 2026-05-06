// Re-generate lib/canonical-slugs.json from lib/data.ts.
// Run this whenever a university is added/renamed in lib/data.ts.
// Hooked into npm run build:urls so it stays in sync automatically.
const fs = require('fs')
const path = require('path')

const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'data.ts'), 'utf8')
const ids = [...src.matchAll(/^\s+id:\s+'([a-z0-9-]+)',\s*$/gm)].map(m => m[1])
fs.writeFileSync(
  path.join(__dirname, '..', 'lib', 'canonical-slugs.json'),
  JSON.stringify(ids.sort(), null, 2)
)
console.log('Wrote lib/canonical-slugs.json with', ids.length, 'university slugs.')
