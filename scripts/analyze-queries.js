#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'blog.ts'), 'utf8').replace(/\r\n/g, '\n')

function decideQuery(blog) {
  const text = `${blog.title} ${blog.targetKeyword} ${blog.category}`.toLowerCase()
  if (text.includes('government') || text.includes('govt')) return 'indian government office worker'
  if (text.includes('iim')) return 'indian business school student'
  if (text.includes('finance') || text.includes('banking') || text.includes('investment')) return 'indian businessman finance office'
  if (text.includes('hr ') || text.includes('human resource')) return 'indian office team meeting'
  if (text.includes('marketing')) return 'indian marketing professionals'
  if (text.includes('operation') || text.includes('supply chain')) return 'indian factory operations'
  if (text.includes('data') || text.includes('analytics')) return 'indian data analyst office'
  if (text.includes('healthcare') || text.includes('hospital') || text.includes('pharma')) return 'indian healthcare professionals'
  if (text.includes('placement') || text.includes('salary')) return 'indian corporate professionals office'
  if (text.includes('working professional')) return 'indian working professional laptop'
  if (text.includes('compare') || text.includes(' vs ')) return 'indian student decision laptop'
  if (text.includes('eligibility') || text.includes('admission') || text.includes('entrance')) return 'indian college admission'
  if (text.includes('fees') || text.includes('cost') || text.includes('cheapest') || text.includes('affordable') || text.includes('budget')) return 'indian student budget'
  if (text.includes('aviation')) return 'indian aviation professional'
  if (text.includes('event')) return 'indian event management'
  if (text.includes('entrepreneur') || text.includes('startup')) return 'indian entrepreneur startup'
  if (text.includes('mca')) return 'indian computer programming student'
  if (text.includes('bca')) return 'indian college student laptop'
  if (text.includes('bba')) return 'indian college students campus'
  if (text.includes('cyber')) return 'indian cybersecurity professional'
  if (text.includes('executive')) return 'indian senior executive office'
  if (text.includes('m.com') || text.includes('mcom') || text.includes('commerce')) return 'indian commerce student'
  if (text.includes('arts') || text.includes(' ma ')) return 'indian arts student library'
  if (text.includes('b.sc') || text.includes('bsc') || text.includes('science')) return 'indian science student laboratory'
  if (text.includes('online mba') || text.includes('mba')) return 'indian professional online learning laptop'
  if (text.includes('online')) return 'indian student online learning'
  if (text.includes('university') || text.includes('college')) return 'indian university campus student'
  if (text.includes('career')) return 'indian young professional office'
  if (text.includes('resume') || text.includes('interview')) return 'indian job interview office'
  return 'indian student studying laptop'
}

const blocksA = src.split(/\n  \{\n    slug: '/).slice(1).map(b => ({
  slug: (b.match(/^([^']+)'/) || [])[1] || '',
  title: (b.match(/title: '((?:[^'\\]|\\.)*)'/) || [])[1] || '',
  category: (b.match(/category: '((?:[^'\\]|\\.)*)'/) || [])[1] || '',
  targetKeyword: (b.match(/targetKeyword: '((?:[^'\\]|\\.)*)'/) || [])[1] || '',
  status: (b.match(/status: '(published|draft)'/) || [])[1] || '',
}))
const blocksB = src.split(/\n  \{\n  "slug": "/).slice(1).map(b => ({
  slug: (b.match(/^([^"]+)"/) || [])[1] || '',
  title: (b.match(/"title":\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || '',
  category: (b.match(/"category":\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || '',
  targetKeyword: (b.match(/"targetKeyword":\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || '',
  status: (b.match(/"status":\s*"(published|draft)"/) || [])[1] || '',
}))

const all = [...blocksA, ...blocksB].filter(b => b.status === 'published')
const qcounts = {}
all.forEach(b => { const q = decideQuery(b); qcounts[q] = (qcounts[q] || 0) + 1 })
const sorted = Object.entries(qcounts).sort((a, b) => b[1] - a[1])

console.log('Total published blogs:', all.length)
console.log('Unique queries used:', sorted.length)
console.log()
sorted.forEach(([q, n]) => console.log(`  ${String(n).padStart(3)}  →  ${q}`))
console.log()
console.log('Total photos needed (2 per blog):', all.length * 2)
console.log('Photos per query needed (worst case):', sorted[0][1] * 2)
