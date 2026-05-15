#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'blog.ts'), 'utf8').replace(/\r\n/g, '\n')

function wc(html) {
  if (!html) return 0
  return html.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/gi, ' ').replace(/\s+/g, ' ').trim().split(/\s+/).filter(Boolean).length
}

const slugs = [
  'affordable-online-mba-india-2026',
  'career-after-bcom-jobs-salary-courses-2026',
  'career-after-12th-science-courses-jobs-2026',
  'vignan-online-mba-review',
  'is-manipal-university-jaipur-fake-or-legit-2026',
  'career-after-mba-jobs-salary-scope-2026',
  'dsu-online-mba-review',
  'is-mba-post-graduation-india-2026',
  'noida-international-university-online-mba-review',
  'mba-operations-management-career-2026',
  'nmims-online-mba-review-2026',
  'distance-mba-chennai-2026',
]

for (const slug of slugs) {
  const slugIdx = src.indexOf(`slug: '${slug}'`)
  if (slugIdx === -1) { console.log(slug + ': NOT FOUND'); continue }
  const contentStart = src.indexOf('content: `', slugIdx)
  if (contentStart === -1) { console.log(slug + ': NO CONTENT'); continue }
  const cStart = contentStart + 'content: `'.length
  let i = cStart
  while (i < src.length) {
    if (src[i] === '`' && src[i-1] !== '\\') {
      const next = src.substring(i+1, i+30)
      if (/^,\s*\n\s*\}/.test(next)) break
    }
    i++
  }
  const content = src.substring(cStart, i)
  console.log(slug + ': ' + wc(content) + ' words')
}
