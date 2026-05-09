// scripts/publish-batch5-blogs.js
// Reads the 3 fact-corrected batch-5 blog HTML files and injects them as
// new entries into lib/blog.ts.

const fs = require('fs')
const path = require('path')

const SRC = 'C:/Users/91706/AppData/Local/Temp/blog-files-fixed'
const BLOG_TS = path.join(__dirname, '..', 'lib', 'blog.ts')

const KEEPERS = [
  {
    slug: 'best-online-mba-colleges-india-2026',
    category: 'Online MBA Programs',
    targetKeyword: 'best online mba colleges in india',
    tags: ['best online mba colleges in india', 'top online mba universities india', 'best online mba programs india', 'online mba colleges 2026', 'nirf online mba ranking', 'naac online mba'],
    relatedUniversities: ['nmims-online', 'symbiosis-university-online', 'amity-university-online', 'manipal-academy-higher-education-online', 'bits-pilani-online'],
  },
  {
    slug: 'is-online-mba-valid-india-2026',
    category: 'Online MBA Programs',
    targetKeyword: 'is online mba valid in india',
    tags: ['is online mba valid in india', 'online mba validity', 'ugc deb mba', 'online mba government jobs', 'online mba acceptance'],
    relatedUniversities: ['nmims-online', 'amity-university-online', 'manipal-university-jaipur-online'],
  },
  {
    slug: 'online-mba-with-placement-india-2026',
    category: 'Online MBA Programs',
    targetKeyword: 'online mba with placement in india',
    tags: ['online mba with placement', 'online mba placement', 'online mba jobs', 'online mba placement support'],
    relatedUniversities: ['nmims-online', 'symbiosis-university-online', 'amity-university-online', 'chandigarh-university-online', 'manipal-university-jaipur-online'],
  },
]

function escapeJs(str) {
  // For use inside a template literal: escape ` and ${
  return str.replace(/`/g, '\\`').replace(/\$\{/g, '\\${')
}

function escapeQuoted(str) {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}

function extractFAQs(html) {
  // Look for FAQPage schema and extract Q+A pairs
  const m = html.match(/"@type":\s*"FAQPage"[\s\S]*?"mainEntity":\s*\[([\s\S]*?)\]\s*\}/)
  if (!m) return []
  const block = m[1]
  const faqs = []
  const qaRe = /"name":\s*"([^"]+)"[\s\S]*?"text":\s*"([^"]+)"/g
  let qm
  while ((qm = qaRe.exec(block)) !== null) {
    faqs.push({ q: qm[1], a: qm[2] })
  }
  return faqs
}

function extractContent(html) {
  // Strip <!doctype>, <html>, <head>, <head>... return body content only
  // Simplest approach: take everything from the first <h1> onwards but remove <script>/<style> blocks
  let body = html
  const headMatch = body.match(/<head[\s\S]*?<\/head>/i)
  if (headMatch) body = body.replace(headMatch[0], '')
  body = body.replace(/<!doctype[^>]*>/gi, '')
  body = body.replace(/<\/?html[^>]*>/gi, '')
  body = body.replace(/<\/?body[^>]*>/gi, '')
  // Strip schema scripts (already extracted)
  body = body.replace(/<script\s+type="application\/ld\+json"[\s\S]*?<\/script>/gi, '')
  // Strip plain styles
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '')
  // Drop everything before first <h1>
  const h1Idx = body.search(/<h1\b/i)
  if (h1Idx > -1) body = body.slice(h1Idx)
  // Drop the H1 itself (existing content templates skip H1 — it's rendered by the page wrapper)
  body = body.replace(/^<h1[^>]*>[^<]+<\/h1>\s*/i, '')
  return body.trim()
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i)
  return m ? m[1] : null
}

function extractMeta(html) {
  const m = html.match(/<meta\s+name="description"\s+content="([^"]+)"/i)
  return m ? m[1] : null
}

function buildEntry(spec, html) {
  const title = extractTitle(html)
  const meta = extractMeta(html)
  const content = extractContent(html)
  const faqs = extractFAQs(html)
  // Estimate read time: ~250 words/minute
  const wordCount = content.replace(/<[^>]*>/g, ' ').split(/\s+/).filter(Boolean).length
  const readTime = Math.max(5, Math.round(wordCount / 250))

  // Convert FAQ array to JS object literals
  const faqsBlock = faqs.length
    ? '[\n      ' + faqs.map(f => `{ q: '${escapeQuoted(f.q)}', a: '${escapeQuoted(f.a)}' }`).join(',\n      ') + '\n    ]'
    : '[]'
  const tagsBlock = '[' + spec.tags.map(t => `'${escapeQuoted(t)}'`).join(', ') + ']'
  const relatedBlock = '[' + spec.relatedUniversities.map(u => `'${u}'`).join(', ') + ']'

  return `  {
    slug: '${spec.slug}',
    title: '${escapeQuoted(title)}',
    metaDescription: '${escapeQuoted(meta)}',
    category: '${spec.category}',
    tags: ${tagsBlock},
    publishedAt: '2026-05-10',
    readTime: ${readTime},
    targetKeyword: '${spec.targetKeyword}',
    relatedUniversities: ${relatedBlock},
    status: 'published',
    faqs: ${faqsBlock},
    content: \`
${escapeJs(content)}
    \`,
  },`
}

// ── Main ──────────────────────────────────────────────────────────────────
const blogTs = fs.readFileSync(BLOG_TS, 'utf8')

// Verify none of the slugs already exist
for (const spec of KEEPERS) {
  if (blogTs.includes(`slug: '${spec.slug}'`) || blogTs.includes(`"slug": "${spec.slug}"`)) {
    console.error(`SLUG EXISTS: ${spec.slug} — aborting`)
    process.exit(1)
  }
}

const entries = []
for (const spec of KEEPERS) {
  const html = fs.readFileSync(path.join(SRC, spec.slug + '.html'), 'utf8')
  const entry = buildEntry(spec, html)
  entries.push(entry)
  console.log(`✓ Built entry for ${spec.slug} (${entry.length} chars)`)
}

const newEntriesBlock = '\n' + entries.join('\n\n') + '\n'

// Find the closing ] of the BLOGS array.
// Strategy: find "export const BLOGS" and locate the matching closing ].
const startMarker = blogTs.search(/export\s+const\s+BLOG_POSTS\b[^=]*=\s*\[/)
if (startMarker === -1) {
  console.error('Could not locate BLOG_POSTS array start')
  process.exit(1)
}
// Find the "[" that comes AFTER the "=" (the data array, not the type annotation)
const eqIdx = blogTs.indexOf('=', startMarker)
const arrStart = blogTs.indexOf('[', eqIdx)
// Walk forward counting brackets to find matching ]
let depth = 0
let arrEnd = -1
for (let i = arrStart; i < blogTs.length; i++) {
  const c = blogTs[i]
  if (c === '[') depth++
  else if (c === ']') {
    depth--
    if (depth === 0) { arrEnd = i; break }
  }
}
if (arrEnd === -1) {
  console.error('Could not locate BLOGS array end')
  process.exit(1)
}

// Insert new entries just before the closing ].
// Walk backwards from arrEnd to find the last } and ensure it has a comma.
// Many existing entries end with `}` without a trailing comma.
let cursor = arrEnd - 1
while (cursor > 0 && /\s/.test(blogTs[cursor])) cursor--
let prefix = blogTs.slice(0, cursor + 1)
let suffix = blogTs.slice(cursor + 1)
if (blogTs[cursor] === '}') {
  // Need to add a comma after this }
  prefix = prefix + ','
}
const updated = prefix + newEntriesBlock + suffix
fs.writeFileSync(BLOG_TS, updated, 'utf8')
console.log(`\nWrote 3 entries to lib/blog.ts. New file size: ${updated.length} bytes (was ${blogTs.length})`)
