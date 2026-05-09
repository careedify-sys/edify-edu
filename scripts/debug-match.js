function nameTokens(s) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9 ]/g, ' ')
    .split(/\s+/)
    .filter(t => t.length >= 4 && !['university', 'institute', 'deemed', 'online', 'higher', 'education', 'research', 'studies', 'academy', 'school', 'college', 'national', 'india'].includes(t))
}
function matchScore(naacName, supaName) {
  const a = new Set(nameTokens(naacName))
  const b = new Set(nameTokens(supaName))
  let intersection = 0, onlyInNaac = 0
  for (const t of a) {
    if (b.has(t)) intersection++; else onlyInNaac++
  }
  return intersection - onlyInNaac * 0.6
}

const supa = 'Jain (Deemed-to-be University)'
console.log('supa tokens:', nameTokens(supa))
const naacOptions = ['ARKA JAIN UNIVERSITY', 'JAIN Deemed-to-be University']
for (const n of naacOptions) {
  console.log(`  vs "${n}"  tokens: ${JSON.stringify(nameTokens(n))}  score: ${matchScore(n, supa)}`)
}
