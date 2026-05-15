#!/usr/bin/env node
const fs = require('fs')
const path = require('path')
let src = fs.readFileSync(path.join(__dirname, '..', 'lib', 'blog.ts'), 'utf8')
const lines = src.split(/\r?\n/)
let fixed = 0
const out = lines.map(line => {
  if (!/^\s+(\{\s*q:\s*'|(title|seoTitle|metaDescription|category|targetKeyword|heroImageAttribution|heroImageAlt|tagline|description|highlight):\s*')/.test(line)) return line
  const before = line
  let after = line.replace(/\\\\'/g, "\\'") // Fix double-backslash apostrophe
  after = after.replace(/([a-zA-Z0-9])'([a-zA-Z])/g, "$1\\'$2")
  if (before !== after) fixed++
  return after
})
fs.writeFileSync(path.join(__dirname, '..', 'lib', 'blog.ts'), out.join('\n'))
console.log('Lines fixed:', fixed)
