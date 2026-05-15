#!/usr/bin/env node
/* eslint-disable */
// scripts/add-pexels-images-to-blogs.js
// Adds Pexels hero + 1 inline figure to every PUBLISHED blog in lib/blog.ts
// that does not already have a heroImage. Handles BOTH:
//   • Single-quote TypeScript-literal blocks: slug: '...', content: `...`
//   • JSON-style blocks:                       "slug": "...", "content": "..."
// Also writes a word-count audit CSV.
//
// Resumable: each blog is patched and the file is rewritten between iterations,
// so re-running after a crash skips blogs already imaged.
//
// Run:    node scripts/add-pexels-images-to-blogs.js
// Dry:    DRY=1   node scripts/add-pexels-images-to-blogs.js
// Limit:  LIMIT=3 node scripts/add-pexels-images-to-blogs.js
// Env:    PEXELS_API_KEY (falls back to reading .env.local)

const fs   = require('fs')
const path = require('path')

// ─── Config ──────────────────────────────────────────────────────────────────

const BLOG_PATH  = path.join(__dirname, '..', 'lib', 'blog.ts')
const ENV_PATH   = path.join(__dirname, '..', '.env.local')
const REPORT_DIR = path.join(__dirname, '..', 'reports')
const LOG_PATH   = path.join(REPORT_DIR, 'pexels-image-patch.log')
const SLEEP_MS   = 22000   // ~163 req/hour — under the 200/hr free-tier cap

// ─── Read key ────────────────────────────────────────────────────────────────

let KEY = process.env.PEXELS_API_KEY
if (!KEY) {
  try {
    const env = fs.readFileSync(ENV_PATH, 'utf8')
    const m = env.match(/^PEXELS_API_KEY=(.+)$/m)
    if (m) KEY = m[1].trim()
  } catch {}
}
if (!KEY) { console.error('No PEXELS_API_KEY available.'); process.exit(1) }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms))

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`
  console.log(stamped)
  try { fs.appendFileSync(LOG_PATH, stamped + '\n') } catch {}
}

function escSingleQ(s) {
  // For TS single-quoted literal: backslash + single-quote
  return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'")
}
function escJSON(s) {
  // For JSON string value: produce text containing literal \" and \n etc.
  return String(s || '')
    .replace(/\\/g, '\\\\')
    .replace(/"/g, '\\"')
    .replace(/\n/g, '\\n')
    .replace(/\r/g, '\\r')
    .replace(/\t/g, '\\t')
}
function escHtmlAttr(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function attribution(p) {
  return `Photo by <a href="${p.photographer_url}" target="_blank" rel="noopener nofollow">${p.photographer}</a> on <a href="https://pexels.com" target="_blank" rel="noopener nofollow">Pexels</a>`
}

function decideQuery(blog) {
  const text = `${blog.title} ${blog.targetKeyword} ${blog.category}`.toLowerCase()

  if (text.includes('government') || text.includes('govt'))           return 'indian government office worker'
  if (text.includes('iim'))                                            return 'indian business school student'
  if (text.includes('finance') || text.includes('banking') || text.includes('investment')) return 'indian businessman finance office'
  if (text.includes('hr ') || text.includes('human resource'))         return 'indian office team meeting'
  if (text.includes('marketing'))                                      return 'indian marketing professionals'
  if (text.includes('operation') || text.includes('supply chain'))    return 'indian factory operations'
  if (text.includes('data') || text.includes('analytics'))             return 'indian data analyst office'
  if (text.includes('healthcare') || text.includes('hospital') || text.includes('pharma')) return 'indian healthcare professionals'
  if (text.includes('placement') || text.includes('salary'))           return 'indian corporate professionals office'
  if (text.includes('working professional'))                           return 'indian working professional laptop'
  if (text.includes('compare') || text.includes(' vs '))               return 'indian student decision laptop'
  if (text.includes('eligibility') || text.includes('admission') || text.includes('entrance')) return 'indian college admission'
  if (text.includes('fees') || text.includes('cost') || text.includes('cheapest') || text.includes('affordable') || text.includes('budget')) return 'indian student budget'
  if (text.includes('aviation'))                                       return 'indian aviation professional'
  if (text.includes('event'))                                          return 'indian event management'
  if (text.includes('entrepreneur') || text.includes('startup'))       return 'indian entrepreneur startup'
  if (text.includes('mca'))                                            return 'indian computer programming student'
  if (text.includes('bca'))                                            return 'indian college student laptop'
  if (text.includes('bba'))                                            return 'indian college students campus'
  if (text.includes('cyber'))                                          return 'indian cybersecurity professional'
  if (text.includes('executive'))                                      return 'indian senior executive office'
  if (text.includes('m.com') || text.includes('mcom') || text.includes('commerce')) return 'indian commerce student'
  if (text.includes('arts') || text.includes(' ma '))                  return 'indian arts student library'
  if (text.includes('b.sc') || text.includes('bsc') || text.includes('science'))  return 'indian science student laboratory'
  if (text.includes('online mba') || text.includes('mba'))             return 'indian professional online learning laptop'
  if (text.includes('online'))                                         return 'indian student online learning'
  if (text.includes('university') || text.includes('college'))         return 'indian university campus student'
  if (text.includes('career'))                                         return 'indian young professional office'
  if (text.includes('resume') || text.includes('interview'))           return 'indian job interview office'

  return 'indian student studying laptop'
}

async function searchPexels(query) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=15&orientation=landscape`
  try {
    const res = await fetch(url, { headers: { Authorization: KEY } })
    if (res.status === 429) {
      log(`  ⚠ 429 rate limit — sleeping 5 min then retrying once`)
      await sleep(5 * 60 * 1000)
      const r2 = await fetch(url, { headers: { Authorization: KEY } })
      if (!r2.ok) return []
      const d2 = await r2.json()
      return d2.photos || []
    }
    if (!res.ok) { log(`  ⚠ Pexels ${res.status} for "${query}"`); return [] }
    const data = await res.json()
    return data.photos || []
  } catch (e) { log(`  ⚠ Network error: ${e.message}`); return [] }
}

// ─── Source IO ───────────────────────────────────────────────────────────────

function readSource() {
  const raw = fs.readFileSync(BLOG_PATH, 'utf8')
  const hadCRLF = raw.includes('\r\n')
  return { text: raw.replace(/\r\n/g, '\n'), hadCRLF }
}
function writeSource(text, hadCRLF) {
  fs.writeFileSync(BLOG_PATH, hadCRLF ? text.replace(/\n/g, '\r\n') : text)
}

// ─── Block parsing — both formats ────────────────────────────────────────────

function findAllBlocks(source) {
  // Single-quote blocks:  "^  \{\n    slug: '...'"  (4-space indent for properties)
  // JSON blocks:          "^  \{\n  \"slug\": \"...\""  (2-space indent for properties)
  const out = []

  // 1) Single-quote starts
  const reA = /^  \{\n    slug: '([^']+)',/gm
  let m
  while ((m = reA.exec(source)) !== null) out.push({ index: m.index, slug: m[1], kind: 'single' })

  // 2) JSON starts
  const reB = /^  \{\n  "slug": "([^"]+)",/gm
  while ((m = reB.exec(source)) !== null) out.push({ index: m.index, slug: m[1], kind: 'json' })

  // Sort by file order
  out.sort((a, b) => a.index - b.index)

  // Compute end of each block
  for (let i = 0; i < out.length; i++) {
    const startIdx = out[i].index
    const endIdx = i + 1 < out.length ? out[i + 1].index : (source.indexOf('\n]', startIdx) + 1 || source.length)
    out[i].block = source.slice(startIdx, endIdx)
    out[i].end = endIdx
  }
  return out
}

function parseFields(blockInfo) {
  const { block, kind } = blockInfo
  const f = { slug: blockInfo.slug, kind }
  if (kind === 'single') {
    f.title         = (block.match(/^    title: '((?:[^'\\]|\\.)*)'/m) || [])[1] || ''
    f.category      = (block.match(/^    category: '((?:[^'\\]|\\.)*)'/m) || [])[1] || ''
    f.targetKeyword = (block.match(/^    targetKeyword: '((?:[^'\\]|\\.)*)'/m) || [])[1] || ''
    f.status        = (block.match(/^    status: '(published|draft)'/m) || [])[1] || ''
    f.hasHeroImage  = /^    heroImage: /m.test(block)
    const cm = block.match(/^    content: `([\s\S]*?)`,?\s*\n  \},?/m)
    f.content = cm ? cm[1] : ''
  } else {
    // JSON format. Values are JSON strings. Don't decode for our purposes;
    // we operate on the literal source representation.
    f.title         = (block.match(/^  "title":\s*"((?:[^"\\]|\\.)*)"/m) || [])[1] || ''
    f.category      = (block.match(/^  "category":\s*"((?:[^"\\]|\\.)*)"/m) || [])[1] || ''
    f.targetKeyword = (block.match(/^  "targetKeyword":\s*"((?:[^"\\]|\\.)*)"/m) || [])[1] || ''
    f.status        = (block.match(/^  "status":\s*"(published|draft)"/m) || [])[1] || ''
    f.hasHeroImage  = /^  "heroImage":/m.test(block)
    const cm = block.match(/^  "content":\s*"((?:[^"\\]|\\.)*)"/m)
    f.content = cm ? cm[1] : ''
  }
  // Word count — strip HTML markup (preserve JSON-escaped sequences as spaces)
  const plain = f.content
    .replace(/\\n/g, ' ')
    .replace(/\\"/g, '"')
    .replace(/<[^>]+>/g, ' ')
  f.wordCount = plain.split(/\s+/).filter(Boolean).length
  return f
}

// ─── Patch builders ─────────────────────────────────────────────────────────

function buildHeroLinesSingle(d) {
  return [
    `    heroImage: '${escSingleQ(d.url)}',`,
    `    heroImageAttribution: '${escSingleQ(d.attr)}',`,
    `    heroImageAlt: '${escSingleQ(d.alt)}',`,
  ].join('\n')
}

function buildHeroLinesJSON(d) {
  return [
    `  "heroImage": "${escJSON(d.url)}",`,
    `  "heroImageAttribution": "${escJSON(d.attr)}",`,
    `  "heroImageAlt": "${escJSON(d.alt)}",`,
  ].join('\n')
}

function buildInlineFigureRaw(d) {
  const alt = escHtmlAttr(d.alt)
  return [
    '',
    '<figure style="margin: 28px 0;">',
    `  <img src="${d.url}" alt="${alt}" loading="lazy" style="width: 100%; height: auto; border-radius: 12px; border: 1px solid #E2E8F4;" />`,
    `  <figcaption style="font-size: 12px; color: #64788A; margin-top: 8px; text-align: center;">${d.attr}</figcaption>`,
    '</figure>',
    '',
  ].join('\n')
}

function buildInlineFigureJSON(d) {
  // Same structure as raw, but JSON-escaped so it lives inside a "..." string.
  return escJSON(buildInlineFigureRaw(d))
}

// ─── Patch a block ──────────────────────────────────────────────────────────

function patchBlockSingle(block, heroData, inlineData) {
  let out = block.replace(
    /^(    status: '(?:published|draft)',)\n/m,
    `$1\n${buildHeroLinesSingle(heroData)}\n`
  )
  out = out.replace(/^(    content: `)([\s\S]*?)(`,?\s*\n  \},?)/m, (_, before, content, after) => {
    const h2 = [...content.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>/gi)]
    let at
    if (h2.length >= 2)       at = h2[1].index + h2[1][0].length
    else if (h2.length === 1) at = h2[0].index + h2[0][0].length
    else                      at = content.length
    return before + content.slice(0, at) + buildInlineFigureRaw(inlineData) + content.slice(at) + after
  })
  return out
}

function patchBlockJSON(block, heroData, inlineData) {
  let out = block.replace(
    /^(  "status":\s*"(?:published|draft)",)\n/m,
    `$1\n${buildHeroLinesJSON(heroData)}\n`
  )
  // content value is a JSON string. Find it and inject after the 2nd </h2> (in the escaped string).
  out = out.replace(/^(  "content":\s*")((?:[^"\\]|\\.)*)("(?:,\s*\n  \},?|\s*\n  \},?))/m, (_, before, content, after) => {
    // content here is the raw escaped string (still contains \" and \n as 2-char sequences)
    // Find </h2> occurrences in the literal string.
    const re = /<\/h2>/gi
    const positions = []
    let m
    while ((m = re.exec(content)) !== null) positions.push(m.index + m[0].length)
    let at
    if (positions.length >= 2)      at = positions[1]
    else if (positions.length === 1) at = positions[0]
    else                              at = content.length
    return before + content.slice(0, at) + buildInlineFigureJSON(inlineData) + content.slice(at) + after
  })
  return out
}

// ─── Word-count report ──────────────────────────────────────────────────────

function writeWordCountReport(allBlogs) {
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true })
  const today = new Date().toISOString().slice(0, 10)
  const csvPath  = path.join(REPORT_DIR, `blog-word-count-${today}.csv`)
  const lowPath  = path.join(REPORT_DIR, `blogs-under-2500-words-${today}.md`)

  const rows = ['slug,title,category,status,format,wordCount,hasHero']
  for (const b of allBlogs) {
    const title = b.title.replace(/"/g, '""')
    const cat   = b.category.replace(/"/g, '""')
    rows.push(`"${b.slug}","${title}","${cat}","${b.status}","${b.kind}",${b.wordCount},${b.hasHeroImage}`)
  }
  fs.writeFileSync(csvPath, rows.join('\n'))

  const low = allBlogs.filter(b => b.status === 'published' && b.wordCount < 2500).sort((a, b) => a.wordCount - b.wordCount)
  const md = []
  md.push(`# Published blogs under 2500 words — ${today}`)
  md.push('')
  md.push(`Total published: ${allBlogs.filter(b => b.status === 'published').length}`)
  md.push(`Under 2500 words: **${low.length}**`)
  md.push('')
  md.push('| Words | Format | Slug | Title |')
  md.push('|------:|--------|------|-------|')
  for (const b of low) md.push(`| ${b.wordCount} | ${b.kind} | \`${b.slug}\` | ${b.title} |`)
  fs.writeFileSync(lowPath, md.join('\n'))

  log(`✓ CSV: ${csvPath}`)
  log(`✓ Low-word: ${lowPath}`)
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(LOG_PATH, `Run started ${new Date().toISOString()}\n`)

  let { text: source, hadCRLF } = readSource()
  const blocks = findAllBlocks(source)
  log(`Parsed ${blocks.length} blocks (single + json combined).`)

  const parsed = blocks.map(b => parseFields(b))
  const stats = {
    total:      parsed.length,
    published:  parsed.filter(b => b.status === 'published').length,
    draft:      parsed.filter(b => b.status === 'draft').length,
    withHero:   parsed.filter(b => b.hasHeroImage).length,
    needImage:  parsed.filter(b => b.status === 'published' && !b.hasHeroImage).length,
    single:     parsed.filter(b => b.kind === 'single').length,
    json:       parsed.filter(b => b.kind === 'json').length,
  }
  log(`Stats: ${JSON.stringify(stats)}`)

  writeWordCountReport(parsed)

  if (process.env.DRY === '1') { log('DRY=1 — exit before image fetch.'); return }

  let todo = parsed.filter(b => b.status === 'published' && !b.hasHeroImage)
  if (process.env.LIMIT) todo = todo.slice(0, parseInt(process.env.LIMIT, 10) || 2)
  log(`Will process ${todo.length} blogs (throttle ${SLEEP_MS / 1000}s).`)

  let done = 0, failed = 0
  for (const p of todo) {
    const query = decideQuery(p)
    log(`[${done + failed + 1}/${todo.length}] ${p.slug} [${p.kind}] → "${query}"`)
    const photos = await searchPexels(query)

    if (!photos || photos.length < 2) {
      log(`  ✗ Skipped (${photos?.length || 0} photos)`)
      failed++
    } else {
      const hero   = photos[0]
      const inline = photos[Math.min(5, photos.length - 1)]
      const heroData = {
        url:  hero.src.large,
        attr: attribution(hero),
        alt:  hero.alt || `${p.title} — image relevant to ${query}`,
      }
      const inlineData = {
        url:  inline.src.large,
        attr: attribution(inline),
        alt:  inline.alt || `${p.title} — illustrative image`,
      }

      const fresh = readSource()
      source = fresh.text
      // Find this block again in current source
      const slugMarker = p.kind === 'single' ? `    slug: '${p.slug}',` : `  "slug": "${p.slug}",`
      const slugIdx = source.indexOf(slugMarker)
      if (slugIdx < 0) { log(`  ✗ Slug not found`); failed++ }
      else {
        const before = source.slice(0, slugIdx)
        const blockStart = before.lastIndexOf('  {\n')
        const afterStart = source.slice(blockStart)
        // Block end: next "  {\n" that starts another block, or "\n]"
        const nextSingle = afterStart.slice(1).search(/\n  \{\n    slug: '/)
        const nextJson   = afterStart.slice(1).search(/\n  \{\n  "slug": "/)
        const endArr     = afterStart.indexOf('\n]')
        const candidates = [nextSingle, nextJson, endArr].map(x => x < 0 ? Infinity : x + 1).filter(x => isFinite(x))
        const blockEndRel = candidates.length ? Math.min(...candidates) : afterStart.length
        const currentBlock = afterStart.slice(0, blockEndRel)
        const patched = p.kind === 'single'
          ? patchBlockSingle(currentBlock, heroData, inlineData)
          : patchBlockJSON(currentBlock, heroData, inlineData)
        source = source.slice(0, blockStart) + patched + source.slice(blockStart + currentBlock.length)
        writeSource(source, hadCRLF)
        log(`  ✓ Patched (hero=${hero.id}, inline=${inline.id})`)
        done++
      }
    }

    if ((done + failed) < todo.length) await sleep(SLEEP_MS)
  }

  log('')
  log('──── DONE ────')
  log(`Patched:  ${done}`)
  log(`Failed:   ${failed}`)
  log(`Total:    ${todo.length}`)
}

main().catch(e => { console.error(e); process.exit(1) })
