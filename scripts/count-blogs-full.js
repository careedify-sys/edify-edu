#!/usr/bin/env node
const fs = require('fs')
const path = require('path')

const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'blog.ts'), 'utf8').replace(/\r\n/g, '\n')

// Single-quote format: starts with `  {\n    slug: '...'`
const blocksA = src.split(/\n  \{\n    slug: '/).slice(1).map(b => ({
  slug:   (b.match(/^([^']+)'/) || [])[1] || '',
  title:  (b.match(/title: '((?:[^'\\]|\\.)*)'/) || [])[1] || '',
  status: (b.match(/status: '(published|draft)'/) || [])[1] || '?',
  pub:    (b.match(/publishedAt: '([0-9-]+)'/) || [])[1] || '',
  format: 'single',
}))

// JSON format: starts with `  {\n  "slug": "..."`
const blocksB = src.split(/\n  \{\n  "slug": "/).slice(1).map(b => ({
  slug:   (b.match(/^([^"]+)"/) || [])[1] || '',
  title:  (b.match(/"title":\s*"((?:[^"\\]|\\.)*)"/) || [])[1] || '',
  status: (b.match(/"status":\s*"(published|draft)"/) || [])[1] || '?',
  pub:    (b.match(/"publishedAt":\s*"([0-9-]+)"/) || [])[1] || '',
  format: 'json',
}))

const all = [...blocksA, ...blocksB]
console.log('Total blog entries:', all.length)
console.log('Published:', all.filter(b => b.status === 'published').length)
console.log('Drafts:', all.filter(b => b.status === 'draft').length)
console.log(`  • Single-quote format: ${blocksA.length} (${blocksA.filter(b => b.status==='published').length} published)`)
console.log(`  • JSON format:         ${blocksB.length} (${blocksB.filter(b => b.status==='published').length} published)`)
console.log()

const showCat = (label, filterFn) => {
  const arr = all.filter(filterFn).sort((a,b) => (b.pub||'').localeCompare(a.pub||''))
  console.log(`${label}: ${arr.length}`)
  arr.forEach(b => console.log(` - ${b.pub} [${b.status}/${b.format}] ${b.slug}`))
  console.log()
}

showCat('BBA-related',
  b => /\bbba\b/i.test(b.slug) || /\bbba\b/i.test(b.title))
showCat('BCA-related',
  b => /\bbca\b/i.test(b.slug) || /\bbca\b/i.test(b.title))
showCat('Published in May 2026',
  b => b.pub >= '2026-05-01' && b.pub <= '2026-05-31' && b.status === 'published')
showCat('Published in last 2 weeks (2026-05-01..15)',
  b => b.pub >= '2026-05-01' && b.pub <= '2026-05-15' && b.status === 'published')
