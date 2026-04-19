'use strict'
// scripts/audit-site.js
// Read-only SEO audit for edifyedu.in.
// Discovers URLs from sitemap, fetches each page, extracts signals, flags issues.
// Output: audit-report.csv and audit-summary.md in the project root.
// Usage: node scripts/audit-site.js  (or: npm run audit)

const cheerio = require('cheerio')
const fastcsv = require('fast-csv')
const { createWriteStream } = require('fs')
const { writeFile } = require('fs/promises')

const SITE = 'https://edifyedu.in'
const CONCURRENCY = 8
const BATCH_DELAY_MS = 200
const PROGRESS_EVERY = 25
const FETCH_TIMEOUT_MS = 20000
const SITEMAP_TIMEOUT_MS = 15000

// Issue flag names, in display order
const FLAG_KEYS = [
  'TITLE_SAYS_NOT_FOUND',
  'TITLE_MISSING',
  'H1_MISSING',
  'H1_DUPLICATE',
  'H1_TRUNCATED',
  'WRONG_PROGRAM_IN_H1',
  'THIN_CONTENT',
  'NO_FAQ_SCHEMA',
  'NO_COURSE_SCHEMA',
  'NO_BREADCRUMB_SCHEMA',
  'NO_REVIEWS_SCHEMA',
  'CROSS_PROGRAM_LEAKAGE',
  'NIRF_ZERO',
  'NO_CANONICAL',
]

// WRONG_PROGRAM_IN_H1 checks.
// Each entry: [urlSegment, regex that must NOT appear in H1 when segment is present in URL path]
const WRONG_PROGRAM_CHECKS = [
  ['ba',   /\bMBA\b/i],
  ['bca',  /\bMBA\b/i],
  ['bcom', /\bMBA\b/i],
  ['bba',  /\bMBA\b/i],
  ['ma',   /\bMBA\b/i],
  ['mcom', /\bMBA\b/i],
  ['mca',  /\bMBA\b/i],
  ['mba',  /\b(BBA|BCA)\b/i],
]

// Classify a URL into a recognisable path pattern for the summary
function classifyPattern(url) {
  try {
    const segs = new URL(url).pathname.split('/').filter(Boolean)
    if (segs[0] === 'universities') {
      if (segs.length === 1) return 'universities'
      if (segs.length === 2) return 'universities/[uni]'
      if (segs.length === 3) return 'universities/[uni]/[program]'
      return 'universities/[uni]/[program]/[spec]'
    }
    if (segs[0] === 'programs') {
      if (segs.length === 1) return 'programs'
      if (segs.length === 2) return 'programs/[program]'
      return 'programs/[program]/[spec]'
    }
    if (segs[0] === 'blog') return 'blog'
    if (segs[0] === 'guides') return 'guides'
    if (segs.length === 0) return 'home'
    return 'other'
  } catch {
    return 'unknown'
  }
}

// Simple fetch wrapper that strips query strings and normalises the hostname
function canonUrl(raw, base) {
  try {
    const u = new URL(raw, base)
    if (u.hostname !== 'edifyedu.in' && u.hostname !== 'www.edifyedu.in') return null
    u.search = ''
    u.hash = ''
    return u.href
  } catch {
    return null
  }
}

// ── URL discovery ─────────────────────────────────────────────────────────────

async function discoverUrls() {
  console.log('[Discovery] Trying sitemap.xml ...')
  try {
    const res = await fetch(`${SITE}/sitemap.xml`, {
      signal: AbortSignal.timeout(SITEMAP_TIMEOUT_MS),
      headers: { 'User-Agent': 'EdifyAuditBot/1.0' },
    })
    if (res.ok) {
      const xml = await res.text()
      const matches = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)]
      const urls = matches
        .map(m => canonUrl(m[1].trim(), SITE))
        .filter(Boolean)
      const unique = [...new Set(urls)]
      if (unique.length > 0) {
        console.log(`[Discovery] Sitemap: ${unique.length} unique URLs`)
        return unique
      }
      console.log('[Discovery] Sitemap returned 0 URLs, falling back to crawl')
    } else {
      console.log(`[Discovery] Sitemap status ${res.status}, falling back to crawl`)
    }
  } catch (e) {
    console.log(`[Discovery] Sitemap failed: ${e.message}, falling back to crawl`)
  }

  // Fallback: crawl /universities and /programs one level deep
  console.log('[Discovery] Crawling /universities and /programs ...')
  const seen = new Set()
  const startUrls = [`${SITE}/universities`, `${SITE}/programs`]

  for (const start of startUrls) {
    try {
      const res = await fetch(start, {
        signal: AbortSignal.timeout(SITEMAP_TIMEOUT_MS),
        headers: { 'User-Agent': 'EdifyAuditBot/1.0' },
      })
      if (!res.ok) { console.log(`[Discovery] ${start} returned ${res.status}`); continue }
      const html = await res.text()
      const $ = cheerio.load(html)
      $('a[href]').each((_, el) => {
        const clean = canonUrl($(el).attr('href') || '', start)
        if (clean && !seen.has(clean)) seen.add(clean)
      })
    } catch (e) {
      console.log(`[Discovery] Crawl failed for ${start}: ${e.message}`)
    }
  }

  const urls = [...seen]
  console.log(`[Discovery] Crawl: ${urls.length} unique URLs`)
  return urls
}

// ── Page auditor ──────────────────────────────────────────────────────────────

async function auditUrl(url) {
  let status = 0
  let html = ''

  try {
    const res = await fetch(url, {
      signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      headers: { 'User-Agent': 'EdifyAuditBot/1.0' },
      redirect: 'follow',
    })
    status = res.status
    html = await res.text()
  } catch (e) {
    return buildErrorRow(url, e.message)
  }

  const $ = cheerio.load(html)

  // -- Word count: remove nav, header, footer, script, style first
  const $body = cheerio.load(html)
  $body('nav, header, footer, script, style, noscript, [aria-hidden="true"]').remove()
  const bodyText = $body('body').text().replace(/\s+/g, ' ').trim()
  const wordCount = bodyText ? bodyText.split(' ').filter(w => w.length > 0).length : 0

  // -- Basic meta
  const title = $('title').first().text().trim()
  const metaDescription = $('meta[name="description"]').attr('content')?.trim() ?? ''
  const canonical = $('link[rel="canonical"]').attr('href')?.trim() ?? ''

  // -- Headings
  const h1Els = $('h1')
  const h1Count = h1Els.length
  const h1Texts = h1Els.map((_, el) => $(el).text().trim().replace(/\|/g, ' ')).get().join('|')
  const firstH1 = h1Els.first().text().trim()
  const h2Count = $('h2').length
  const h3Count = $('h3').length

  // -- Schema.org: collect all @type values
  const schemaTypeSet = new Set()
  $('script[type="application/ld+json"]').each((_, el) => {
    let data
    try { data = JSON.parse($(el).html() ?? '{}') } catch { return }
    const nodes = Array.isArray(data) ? data : [data]
    for (const node of nodes) {
      extractTypes(node, schemaTypeSet)
      // Handle @graph
      if (node['@graph'] && Array.isArray(node['@graph'])) {
        for (const child of node['@graph']) extractTypes(child, schemaTypeSet)
      }
    }
  })
  const schemaTypes = [...schemaTypeSet].join('|')

  // -- OG tags
  const ogTitle = !!$('meta[property="og:title"]').attr('content')
  const ogDescription = !!$('meta[property="og:description"]').attr('content')
  const ogImage = !!$('meta[property="og:image"]').attr('content')

  // -- Presence heuristics (case-insensitive search on raw HTML)
  const raw = html.toLowerCase()
  const hasFeeTable    = raw.includes('total fees') || raw.includes('fee structure') || raw.includes('total fee')
  const hasFaq         = raw.includes('frequently asked') || raw.includes('faqs') || (raw.includes('faq') && raw.includes('</h'))
  const hasSampleDegree = raw.includes('sample-degree') || raw.includes('sample degree') || raw.includes('sample certificate')
  const hasReviews     = raw.includes('student review') || raw.includes('alumni review') || raw.includes('testimonial') || raw.includes('class="reviews')
  const hasJumpnav     = raw.includes('quick facts') || raw.includes('table of contents') || raw.includes('jump to') || raw.includes('on this page')
  const hasCta         = raw.includes('speak with an advisor') || raw.includes('speak to an advisor') || raw.includes('get counselling') || raw.includes('enquire now') || raw.includes('apply now')

  // -- Issue flags
  const TITLE_SAYS_NOT_FOUND = title.toLowerCase().includes('not found')
  const TITLE_MISSING        = !title || title.length === 0
  const H1_MISSING           = h1Count === 0
  const H1_DUPLICATE         = h1Count > 1

  // H1 truncation heuristics: ends with a space + single uppercase letter, or comma, or > 100 chars
  const H1_TRUNCATED = !H1_MISSING && (
    /\s[A-Z]$/.test(firstH1) ||
    firstH1.endsWith(',') ||
    firstH1.length > 100
  )

  // Cross-program H1 check: if URL segment matches a known slug, H1 must not contain a wrong program name
  let WRONG_PROGRAM_IN_H1 = false
  try {
    const pathSegs = new URL(url).pathname.split('/').filter(Boolean)
    outer: for (const [slug, wrongRegex] of WRONG_PROGRAM_CHECKS) {
      if (pathSegs.includes(slug) && wrongRegex.test(firstH1)) {
        WRONG_PROGRAM_IN_H1 = true
        break outer
      }
    }
  } catch { /* ignore */ }

  const THIN_CONTENT          = wordCount < 300
  const NO_FAQ_SCHEMA         = !schemaTypeSet.has('FAQPage')
  const NO_COURSE_SCHEMA      = !schemaTypeSet.has('Course') && !schemaTypeSet.has('EducationalOccupationalProgram')
  const NO_BREADCRUMB_SCHEMA  = !schemaTypeSet.has('BreadcrumbList')
  const NO_REVIEWS_SCHEMA     = !schemaTypeSet.has('Review') && !schemaTypeSet.has('AggregateRating')

  // Cross-program leakage: UG program URL but body has "MBA" more than 5 times
  let CROSS_PROGRAM_LEAKAGE = false
  try {
    const lastSeg = new URL(url).pathname.split('/').filter(Boolean).pop() ?? ''
    if (['ba', 'bca', 'bcom', 'bba'].includes(lastSeg.toLowerCase())) {
      const mbaCount = (html.match(/\bMBA\b/gi) ?? []).length
      if (mbaCount > 5) CROSS_PROGRAM_LEAKAGE = true
    }
  } catch { /* ignore */ }

  const NIRF_ZERO    = /NIRF Rank #?0\b|NIRF Rank: ?#?0\b|NIRF #?0\b/i.test(html)
  const NO_CANONICAL = !canonical || canonical.length === 0

  return {
    url, status, title, metaDescription, canonical,
    h1Count, h1Texts, h2Count, h3Count, schemaTypes,
    wordCount,
    hasFeeTable, hasFaq, hasSampleDegree, hasReviews, hasJumpnav, hasCta,
    ogTitle, ogDescription, ogImage,
    TITLE_SAYS_NOT_FOUND, TITLE_MISSING, H1_MISSING, H1_DUPLICATE,
    H1_TRUNCATED, WRONG_PROGRAM_IN_H1, THIN_CONTENT, NO_FAQ_SCHEMA,
    NO_COURSE_SCHEMA, NO_BREADCRUMB_SCHEMA, NO_REVIEWS_SCHEMA,
    CROSS_PROGRAM_LEAKAGE, NIRF_ZERO, NO_CANONICAL,
    error: '',
  }
}

function extractTypes(node, set) {
  if (!node || typeof node !== 'object') return
  const raw = node['@type']
  if (!raw) return
  const types = Array.isArray(raw) ? raw : [raw]
  types.forEach(t => typeof t === 'string' && set.add(t))
}

function buildErrorRow(url, errorMsg) {
  const base = {
    url, status: 0, title: '', metaDescription: '', canonical: '',
    h1Count: 0, h1Texts: '', h2Count: 0, h3Count: 0, schemaTypes: '',
    wordCount: 0,
    hasFeeTable: false, hasFaq: false, hasSampleDegree: false,
    hasReviews: false, hasJumpnav: false, hasCta: false,
    ogTitle: false, ogDescription: false, ogImage: false,
    THIN_CONTENT: true, NO_FAQ_SCHEMA: true, NO_COURSE_SCHEMA: true,
    NO_BREADCRUMB_SCHEMA: true, NO_REVIEWS_SCHEMA: true, NO_CANONICAL: true,
    TITLE_SAYS_NOT_FOUND: false, TITLE_MISSING: true, H1_MISSING: true,
    H1_DUPLICATE: false, H1_TRUNCATED: false, WRONG_PROGRAM_IN_H1: false,
    CROSS_PROGRAM_LEAKAGE: false, NIRF_ZERO: false,
    error: errorMsg,
  }
  return base
}

// ── Concurrency limiter (inline, no extra dep needed) ─────────────────────────

function createLimiter(concurrency) {
  let active = 0
  const queue = []

  function tick() {
    while (active < concurrency && queue.length > 0) {
      const { fn, resolve, reject } = queue.shift()
      active++
      fn().then(r => { active--; resolve(r); tick() })
         .catch(e => { active--; reject(e); tick() })
    }
  }

  return (fn) => new Promise((resolve, reject) => {
    queue.push({ fn, resolve, reject })
    tick()
  })
}

// ── CSV writer ────────────────────────────────────────────────────────────────

function writeCsv(results) {
  return new Promise((resolve, reject) => {
    const ws = createWriteStream('audit-report.csv')
    const stream = fastcsv.format({ headers: true, quoteColumns: true })
    stream.pipe(ws)
    ws.on('finish', resolve)
    ws.on('error', reject)
    stream.on('error', reject)
    for (const row of results) {
      // Ensure booleans are true/false strings for readability in spreadsheets
      const r = { ...row }
      for (const k of Object.keys(r)) {
        if (typeof r[k] === 'boolean') r[k] = r[k] ? 'TRUE' : 'FALSE'
      }
      stream.write(r)
    }
    stream.end()
  })
}

// ── Markdown summary writer ───────────────────────────────────────────────────

async function writeSummary(results) {
  const total = results.length
  const httpErrors = results.filter(r => r.status === 0 || r.status >= 400).length

  // Count by path pattern
  const patternMap = {}
  for (const r of results) {
    const p = classifyPattern(r.url)
    patternMap[p] = (patternMap[p] ?? 0) + 1
  }

  // Flag counts
  const flagCounts = {}
  for (const k of FLAG_KEYS) {
    flagCounts[k] = results.filter(r => r[k] === true || r[k] === 'TRUE').length
  }
  const sortedFlags = Object.entries(flagCounts).sort((a, b) => b[1] - a[1])

  // Top 20 most-flagged URLs
  const urlFlagCounts = results
    .map(r => ({ url: r.url, flags: FLAG_KEYS.filter(k => r[k] === true || r[k] === 'TRUE') }))
    .sort((a, b) => b.flags.length - a.flags.length)
    .slice(0, 20)

  // Top 10 thinnest URLs (word count < 100)
  const thinUrls = results
    .filter(r => Number(r.wordCount) < 100)
    .sort((a, b) => Number(a.wordCount) - Number(b.wordCount))
    .slice(0, 10)

  // All schema types seen across the site
  const allSchemaTypes = new Set()
  for (const r of results) {
    if (r.schemaTypes) r.schemaTypes.split('|').filter(Boolean).forEach(t => allSchemaTypes.add(t))
  }

  const lines = [
    '# EdifyEdu SEO Audit Summary',
    '',
    `- Total URLs audited: ${total}`,
    `- HTTP errors (status 0 or >= 400): ${httpErrors}`,
    '',
    '## URLs by Path Pattern',
    '',
    ...Object.entries(patternMap)
      .sort((a, b) => b[1] - a[1])
      .map(([pat, n]) => `- ${pat}: ${n}`),
    '',
    '## Issue Counts (sorted by frequency)',
    '',
    ...sortedFlags.map(([flag, n]) => `- ${flag}: ${n}`),
    '',
    '## Top 20 URLs With the Most Issues',
    '',
    ...urlFlagCounts.flatMap(({ url, flags }) => [
      `**${url}**`,
      flags.length > 0 ? flags.map(f => `  - ${f}`).join('\n') : '  - (no flags)',
      '',
    ]),
    '## Top 10 URLs With Word Count Under 100 (likely blank or error pages)',
    '',
    ...( thinUrls.length > 0
      ? thinUrls.map(r => `- ${r.url} (${r.wordCount} words)`)
      : ['- None found']),
    '',
    '## All Schema @type Values Seen Across the Site',
    '',
    ...[...allSchemaTypes].sort().map(t => `- ${t}`),
  ]

  await writeFile('audit-summary.md', lines.join('\n'), 'utf8')
}

// ── Main ──────────────────────────────────────────────────────────────────────

async function main() {
  // Parse --limit N flag
  const limitFlagIdx = process.argv.indexOf('--limit')
  const urlLimit = limitFlagIdx !== -1 ? parseInt(process.argv[limitFlagIdx + 1], 10) : Infinity

  let urls = await discoverUrls()
  if (urls.length === 0) {
    console.error('[Audit] No URLs discovered. Exiting.')
    process.exit(1)
  }

  if (Number.isFinite(urlLimit) && urlLimit > 0) {
    urls = urls.slice(0, urlLimit)
    console.log(`[Audit] --limit applied: auditing first ${urlLimit} URLs`)
  }

  console.log(`\n[Audit] Auditing ${urls.length} URLs (concurrency: ${CONCURRENCY}, delay: ${BATCH_DELAY_MS}ms between batches)\n`)

  const limit = createLimiter(CONCURRENCY)
  const results = []
  let errorCount = 0
  let processed = 0

  // Process in batches of CONCURRENCY; delay between batches to be polite
  for (let i = 0; i < urls.length; i += CONCURRENCY) {
    const batch = urls.slice(i, i + CONCURRENCY)
    const batchResults = await Promise.all(batch.map(url => limit(() => auditUrl(url))))

    for (const r of batchResults) {
      results.push(r)
      processed++
      if (r.status === 0 || r.status >= 400) errorCount++
    }

    if (processed % PROGRESS_EVERY === 0 || processed === urls.length) {
      process.stdout.write(`\r[Progress] ${processed}/${urls.length} | HTTP errors: ${errorCount}`)
    }

    if (i + CONCURRENCY < urls.length) {
      await new Promise(r => setTimeout(r, BATCH_DELAY_MS))
    }
  }

  console.log('\n')

  console.log('[Audit] Writing audit-report.csv ...')
  await writeCsv(results)

  console.log('[Audit] Writing audit-summary.md ...')
  await writeSummary(results)

  console.log(`\n[Audit] Done.`)
  console.log(`  Rows in CSV:   ${results.length}`)
  console.log(`  HTTP errors:   ${errorCount}`)
  console.log(`  Output files:  audit-report.csv, audit-summary.md`)
}

main().catch(err => {
  console.error('\n[Audit] Fatal error:', err)
  process.exit(1)
})
