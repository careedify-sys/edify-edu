#!/usr/bin/env node
/* eslint-disable */
// scripts/refresh-pexels-images.js
//
// Refresh hero + inline Pexels images for EVERY published blog with maximum
// uniqueness. One Pexels API call per unique query (80 photos per call), then
// distribute photos to blogs round-robin, marking each ID used exactly once.
//
// Result: every blog gets a unique hero + a unique inline image (provided
// pools are large enough). Fall back to broader query if a pool is exhausted.
//
// Run:    node scripts/refresh-pexels-images.js
// Dry:    DRY=1 node scripts/refresh-pexels-images.js

const fs   = require('fs')
const path = require('path')

const BLOG_PATH  = path.join(__dirname, '..', 'lib', 'blog.ts')
const ENV_PATH   = path.join(__dirname, '..', '.env.local')
const REPORT_DIR = path.join(__dirname, '..', 'reports')
const LOG_PATH   = path.join(REPORT_DIR, 'pexels-refresh.log')
const PER_PAGE   = 80    // Pexels max
const POOL_PAGES = 1     // 1 page × 80 photos = 80 per query — enough for our max (64 needed)
const FETCH_SLEEP = 1500 // 1.5s between API calls — comfortably under 200/hr

let KEY = process.env.PEXELS_API_KEY
if (!KEY) {
  try {
    const env = fs.readFileSync(ENV_PATH, 'utf8')
    const m = env.match(/^PEXELS_API_KEY=(.+)$/m)
    if (m) KEY = m[1].trim()
  } catch {}
}
if (!KEY) { console.error('No PEXELS_API_KEY'); process.exit(1) }

// ─── Helpers ─────────────────────────────────────────────────────────────────

const sleep = ms => new Promise(r => setTimeout(r, ms))

function log(line) {
  const stamped = `[${new Date().toISOString()}] ${line}`
  console.log(stamped)
  try { fs.appendFileSync(LOG_PATH, stamped + '\n') } catch {}
}

function escSingleQ(s) { return String(s || '').replace(/\\/g, '\\\\').replace(/'/g, "\\'") }
function escJSON(s)    { return String(s || '').replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\r/g, '\\r').replace(/\t/g, '\\t') }
function escHtmlAttr(s){ return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;') }

function attribution(p) {
  return `Photo by <a href="${p.photographer_url}" target="_blank" rel="noopener nofollow">${p.photographer}</a> on <a href="https://pexels.com" target="_blank" rel="noopener nofollow">Pexels</a>`
}

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

const FALLBACK_QUERY = 'indian student studying'

async function searchPexelsPage(query, page = 1) {
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${PER_PAGE}&page=${page}&orientation=landscape`
  try {
    const res = await fetch(url, { headers: { Authorization: KEY } })
    if (res.status === 429) {
      log(`  ⚠ 429, sleep 5min`)
      await sleep(5 * 60 * 1000)
      const r2 = await fetch(url, { headers: { Authorization: KEY } })
      if (!r2.ok) return []
      return (await r2.json()).photos || []
    }
    if (!res.ok) { log(`  ⚠ ${res.status} for "${query}" p${page}`); return [] }
    return (await res.json()).photos || []
  } catch (e) { log(`  ⚠ net err: ${e.message}`); return [] }
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

// ─── Block parsing ──────────────────────────────────────────────────────────

function findAllBlocks(source) {
  const out = []
  const reA = /^  \{\n    slug: '([^']+)',/gm
  const reB = /^  \{\n  "slug": "([^"]+)",/gm
  let m
  while ((m = reA.exec(source)) !== null) out.push({ index: m.index, slug: m[1], kind: 'single' })
  while ((m = reB.exec(source)) !== null) out.push({ index: m.index, slug: m[1], kind: 'json' })
  out.sort((a, b) => a.index - b.index)
  for (let i = 0; i < out.length; i++) {
    const startIdx = out[i].index
    const endIdx = i + 1 < out.length ? out[i + 1].index : (source.indexOf('\n]', startIdx) + 1 || source.length)
    out[i].block = source.slice(startIdx, endIdx)
    out[i].end = endIdx
  }
  return out
}

function parseFields(b) {
  const { block, kind } = b
  const f = { slug: b.slug, kind }
  if (kind === 'single') {
    f.title         = (block.match(/^    title: '((?:[^'\\]|\\.)*)'/m) || [])[1] || ''
    f.category      = (block.match(/^    category: '((?:[^'\\]|\\.)*)'/m) || [])[1] || ''
    f.targetKeyword = (block.match(/^    targetKeyword: '((?:[^'\\]|\\.)*)'/m) || [])[1] || ''
    f.status        = (block.match(/^    status: '(published|draft)'/m) || [])[1] || ''
  } else {
    f.title         = (block.match(/^  "title":\s*"((?:[^"\\]|\\.)*)"/m) || [])[1] || ''
    f.category      = (block.match(/^  "category":\s*"((?:[^"\\]|\\.)*)"/m) || [])[1] || ''
    f.targetKeyword = (block.match(/^  "targetKeyword":\s*"((?:[^"\\]|\\.)*)"/m) || [])[1] || ''
    f.status        = (block.match(/^  "status":\s*"(published|draft)"/m) || [])[1] || ''
  }
  return f
}

// ─── Patch helpers — REPLACE existing or INSERT new ─────────────────────────

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
function buildInlineFigureJSON(d) { return escJSON(buildInlineFigureRaw(d)) }

// Replace existing heroImage block (3 consecutive lines) OR insert after status
function setHeroSingle(block, heroLines) {
  const heroRe = /^    heroImage: '[^']*',\n    heroImageAttribution: '[^']*',\n    heroImageAlt: '[^']*',\n/m
  if (heroRe.test(block)) {
    return block.replace(heroRe, heroLines + '\n')
  }
  return block.replace(
    /^(    status: '(?:published|draft)'(?:\s+as\s+const)?,)\n/m,
    `$1\n${heroLines}\n`
  )
}
function setHeroJSON(block, heroLines) {
  const heroRe = /^  "heroImage":\s*"[^"]*",\n  "heroImageAttribution":\s*"(?:[^"\\]|\\.)*",\n  "heroImageAlt":\s*"(?:[^"\\]|\\.)*",\n/m
  if (heroRe.test(block)) {
    return block.replace(heroRe, heroLines + '\n')
  }
  return block.replace(
    /^(  "status":\s*"(?:published|draft)",)\n/m,
    `$1\n${heroLines}\n`
  )
}

// Replace existing pexels figure block OR insert after 2nd </h2>
function setInlineSingle(block, inlineHtml) {
  return block.replace(/^(    content: `)([\s\S]*?)(`,?\s*\n  \},?)/m, (_, before, content, after) => {
    // Existing inline figure pattern
    const figRe = /\n<figure style="margin: 28px 0;">[\s\S]*?images\.pexels\.com[\s\S]*?<\/figure>\n/
    let newContent
    if (figRe.test(content)) {
      newContent = content.replace(figRe, inlineHtml)
    } else {
      const h2 = [...content.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>/gi)]
      let at
      if (h2.length >= 2)       at = h2[1].index + h2[1][0].length
      else if (h2.length === 1) at = h2[0].index + h2[0][0].length
      else                      at = content.length
      newContent = content.slice(0, at) + inlineHtml + content.slice(at)
    }
    return before + newContent + after
  })
}
function setInlineJSON(block, inlineHtmlEscaped) {
  return block.replace(/^(  "content":\s*")((?:[^"\\]|\\.)*)("(?:,\s*\n  \},?|\s*\n  \},?))/m, (_, before, content, after) => {
    // Existing inline figure in JSON-encoded string: matches the escaped \"
    const figRe = /\\n<figure style=\\"margin: 28px 0;\\">[\s\S]*?images\.pexels\.com[\s\S]*?<\/figure>\\n/
    let newContent
    if (figRe.test(content)) {
      newContent = content.replace(figRe, inlineHtmlEscaped)
    } else {
      const re = /<\/h2>/gi
      const positions = []
      let m
      while ((m = re.exec(content)) !== null) positions.push(m.index + m[0].length)
      let at
      if (positions.length >= 2)      at = positions[1]
      else if (positions.length === 1) at = positions[0]
      else                              at = content.length
      newContent = content.slice(0, at) + inlineHtmlEscaped + content.slice(at)
    }
    return before + newContent + after
  })
}

// ─── Main ────────────────────────────────────────────────────────────────────

async function main() {
  if (!fs.existsSync(REPORT_DIR)) fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(LOG_PATH, `Refresh started ${new Date().toISOString()}\n`)

  let { text: source, hadCRLF } = readSource()
  const blocks = findAllBlocks(source)
  const parsed = blocks.map(parseFields)
  const published = parsed.filter(b => b.status === 'published')

  log(`Found ${blocks.length} blogs total, ${published.length} published.`)

  // 1) Group blogs by query
  const blogsByQuery = {}
  for (const b of published) {
    const q = decideQuery(b)
    if (!blogsByQuery[q]) blogsByQuery[q] = []
    blogsByQuery[q].push(b)
  }
  const queries = Object.keys(blogsByQuery)
  log(`${queries.length} unique queries.`)

  if (process.env.DRY === '1') {
    queries.forEach(q => log(`  ${blogsByQuery[q].length} blogs → "${q}"`))
    log('DRY=1 — exit before fetch')
    return
  }

  // 2) Fetch pools per query
  log('Fetching pools…')
  const pools = {}      // { query: [photo, ...] }
  for (const q of queries) {
    const photos = await searchPexelsPage(q, 1)
    pools[q] = photos
    log(`  pool "${q}": ${photos.length} photos`)
    await sleep(FETCH_SLEEP)
  }
  // Fetch fallback pool too
  if (!pools[FALLBACK_QUERY] || pools[FALLBACK_QUERY].length < 50) {
    const photos = await searchPexelsPage(FALLBACK_QUERY, 1)
    pools[FALLBACK_QUERY] = photos
    log(`  pool "${FALLBACK_QUERY}" (fallback): ${photos.length} photos`)
    await sleep(FETCH_SLEEP)
  }

  // 3) Distribute photos: usedIds tracks every photo ID we've assigned
  const usedIds = new Set()
  function takeUnused(query) {
    const pool = pools[query] || []
    for (const p of pool) {
      if (!usedIds.has(p.id)) { usedIds.add(p.id); return p }
    }
    // Pool exhausted — try fallback
    const fb = pools[FALLBACK_QUERY] || []
    for (const p of fb) {
      if (!usedIds.has(p.id)) { usedIds.add(p.id); return p }
    }
    // Last resort: reuse first photo of primary query
    return pool[0] || fb[0] || null
  }

  // 4) Patch each blog
  let done = 0, failed = 0
  for (const p of published) {
    const q = decideQuery(p)
    const heroPhoto   = takeUnused(q)
    const inlinePhoto = takeUnused(q)
    if (!heroPhoto || !inlinePhoto) { log(`  ✗ ${p.slug}: no photos`); failed++; continue }

    const heroData = {
      url:  heroPhoto.src.large,
      attr: attribution(heroPhoto),
      alt:  heroPhoto.alt || `${p.title} — image relevant to ${q}`,
    }
    const inlineData = {
      url:  inlinePhoto.src.large,
      attr: attribution(inlinePhoto),
      alt:  inlinePhoto.alt || `${p.title} — illustrative image`,
    }

    // Re-read & locate block in CURRENT source
    const fresh = readSource()
    source = fresh.text
    const slugMarker = p.kind === 'single' ? `    slug: '${p.slug}',` : `  "slug": "${p.slug}",`
    const slugIdx = source.indexOf(slugMarker)
    if (slugIdx < 0) { log(`  ✗ ${p.slug}: not found`); failed++; continue }
    const beforeIdx = source.slice(0, slugIdx)
    const blockStart = beforeIdx.lastIndexOf('  {\n')
    const afterStart = source.slice(blockStart)
    const nextSingle = afterStart.slice(1).search(/\n  \{\n    slug: '/)
    const nextJson   = afterStart.slice(1).search(/\n  \{\n  "slug": "/)
    const endArr     = afterStart.indexOf('\n]')
    const candidates = [nextSingle, nextJson, endArr].map(x => x < 0 ? Infinity : x + 1).filter(x => isFinite(x))
    const blockEndRel = candidates.length ? Math.min(...candidates) : afterStart.length
    const currentBlock = afterStart.slice(0, blockEndRel)

    let patched = currentBlock
    if (p.kind === 'single') {
      patched = setHeroSingle(patched, buildHeroLinesSingle(heroData))
      patched = setInlineSingle(patched, buildInlineFigureRaw(inlineData))
    } else {
      patched = setHeroJSON(patched, buildHeroLinesJSON(heroData))
      patched = setInlineJSON(patched, buildInlineFigureJSON(inlineData))
    }

    source = source.slice(0, blockStart) + patched + source.slice(blockStart + currentBlock.length)
    writeSource(source, hadCRLF)
    done++
    if (done % 10 === 0 || done === 1) log(`  [${done}/${published.length}] ${p.slug} ✓ (hero=${heroPhoto.id}, inline=${inlinePhoto.id})`)
  }

  log('')
  log('──── DONE ────')
  log(`Patched: ${done}`)
  log(`Failed:  ${failed}`)
  log(`Unique photo IDs used: ${usedIds.size}`)
}

main().catch(e => { console.error(e); process.exit(1) })
