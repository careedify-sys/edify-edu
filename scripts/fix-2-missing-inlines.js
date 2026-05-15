#!/usr/bin/env node
const fs   = require('fs')
const path = require('path')

let KEY = process.env.PEXELS_API_KEY
if (!KEY) {
  const env = fs.readFileSync(path.join(__dirname, '..', '.env.local'), 'utf8')
  KEY = (env.match(/^PEXELS_API_KEY=(.+)$/m) || [])[1].trim()
}

const BLOG_PATH = path.join(__dirname, '..', 'lib', 'blog.ts')

function escHtmlAttr(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
}
function attribution(p) {
  return `Photo by <a href="${p.photographer_url}" target="_blank" rel="noopener nofollow">${p.photographer}</a> on <a href="https://pexels.com" target="_blank" rel="noopener nofollow">Pexels</a>`
}
function buildInlineFigure(d) {
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

async function main() {
  // Find a fresh photo for MCA blogs not already used in the file
  const raw = fs.readFileSync(BLOG_PATH, 'utf8')
  const hadCRLF = raw.includes('\r\n')
  let src = raw.replace(/\r\n/g, '\n')
  const usedIds = new Set([...src.matchAll(/images\.pexels\.com\/photos\/(\d+)\//g)].map(m => m[1]))
  console.log('Existing used IDs:', usedIds.size)

  // Fetch a pool of computer/MCA photos
  const url = `https://api.pexels.com/v1/search?query=${encodeURIComponent('indian computer programming student')}&per_page=80&page=1&orientation=landscape`
  const res = await fetch(url, { headers: { Authorization: KEY } })
  const data = await res.json()
  const pool = (data.photos || []).filter(p => !usedIds.has(String(p.id)))
  console.log('Fresh pool size:', pool.length)
  if (pool.length < 2) { console.error('Pool too small'); process.exit(1) }

  const targets = ['online-mca-course-india', 'amity-online-mca-fees-review']
  for (let idx = 0; idx < targets.length; idx++) {
    const slug = targets[idx]
    const photo = pool[idx]
    const data = {
      url:  photo.src.large,
      attr: attribution(photo),
      alt:  photo.alt || 'Indian MCA student studying programming',
    }
    const fig = buildInlineFigure(data)

    const i = src.indexOf(`slug: '${slug}'`)
    const end = src.indexOf('\n  {\n', i)
    const block = src.slice(i, end)
    const re = /^(    content: `)([\s\S]*?)(`,?\s*\n  \},?)/m
    const patched = block.replace(re, (_, before, content, after) => {
      const h2 = [...content.matchAll(/<h2[^>]*>[\s\S]*?<\/h2>/gi)]
      const at = h2.length >= 2 ? h2[1].index + h2[1][0].length : (h2.length === 1 ? h2[0].index + h2[0][0].length : content.length)
      return before + content.slice(0, at) + fig + content.slice(at) + after
    })
    if (patched === block) { console.log(`✗ ${slug}: no change`); continue }
    src = src.slice(0, i) + patched + src.slice(end)
    console.log(`✓ ${slug}: injected ${photo.id}`)
  }

  fs.writeFileSync(BLOG_PATH, hadCRLF ? src.replace(/\n/g, '\r\n') : src)
  console.log('Saved.')
}

main().catch(e => { console.error(e); process.exit(1) })
