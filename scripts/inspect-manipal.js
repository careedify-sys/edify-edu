#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
const src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'blog.ts'), 'utf8').replace(/\r\n/g, '\n')

const slug = 'is-manipal-university-jaipur-fake-or-legit-2026'
const slugIdx = src.indexOf(`slug: '${slug}'`)
const contentStart = src.indexOf('content: `', slugIdx)
const cStart = contentStart + 'content: `'.length
let i = cStart
while (i < src.length) {
  if (src[i] === '`' && src[i-1] !== '\\') {
    const next = src.substring(i+1, i+30)
    if (/^,\s*\n\s*\}/.test(next)) break
  }
  i++
}
console.log('END (last 400 chars of content):')
console.log(src.substring(i-400, i))
