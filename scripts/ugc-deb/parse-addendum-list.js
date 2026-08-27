// Parse the UGC-DEB period-wise addendum list PDF into structured JSON.
//
// Step 1:  pdftotext -raw <addendum>.pdf audits/ugc-deb-2026-08/addendum.raw.txt
// Step 2:  node scripts/ugc-deb/parse-addendum-list.js
//
// Writes audits/ugc-deb-2026-08/addendum.json.
// Parser for UGC_20260818120433_1.pdf, the addendum list.
// Shape differs from the main list: each HEI carries one or more
// (period of recognition -> programme count -> programmes) blocks.
const fs = require('fs')
const DIR = 'audits/ugc-deb-2026-08/'

const STATES = ['ANDHRA PRADESH','ASSAM','BIHAR','CHHATTISGARH','GOA','GUJARAT','HARYANA','HIMACHAL PRADESH','JHARKHAND','KARNATAKA','KERALA','MADHYA PRADESH','MAHARASHTRA','MANIPUR','MEGHALAYA','MIZORAM','NAGALAND','ODISHA','PUNJAB','RAJASTHAN','SIKKIM','TAMIL NADU','TELANGANA','TRIPURA','UTTAR PRADESH','UTTARAKHAND','WEST BENGAL','NEW DELHI','DELHI','JAMMU & KASHMIR','PUDUCHERRY','CHANDIGARH'].sort((a, b) => b.length - a.length)
const FIRSTWORDS = [...new Set(STATES.map(s => s.split(' ')[0])), 'MAHARASHTR'].sort((a, b) => b.length - a.length)
const WATERMARK = ['UN','IVERSITY','GRAN','TS','COM','M','ISSION']

const norm = s => s.replace(/[\u0000-\u001f\u007f\ufffd\u2013\u2014]/g, '-').replace(/\s+/g, ' ').trim()

let lines = fs.readFileSync(DIR + 'addendum.raw.txt', 'utf8').split(/\r?\n/).map(s => s.replace(/\f/g, '').trim()).filter(Boolean)

// drop watermark runs and the repeated header block
{
  const out = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === 'UN' && WATERMARK.every((w, k) => lines[i + k] === w)) { i += WATERMARK.length - 1; continue }
    if (/^S\.No\b/.test(lines[i])) {
      let j = i + 1
      while (j < lines.length && j - i <= 12 && lines[j] !== 'NAME OF PROGRAMMES') j++
      if (j < lines.length && lines[j] === 'NAME OF PROGRAMMES') { i = j; continue }
    }
    lines.push
    out.push(lines[i])
  }
  lines = out
}

const startRe = new RegExp('^(\\d{1,3})[.,]?\\s+((?:' + FIRSTWORDS.join('|') + ')(?![A-Za-z]).*)$', 'i')
const bareSnoRe = /^(\d{1,3})[.,]?$/
// "2025-26, academic" / "2026 -27 academic" / "academic year 2026-27" / "Academic year"
const periodRe = /^(?:Academic\s+year|academic\s+year|\d{4}\s*-\s*\d{2,4}\s*,?\s*(?:academic)?)/i
const isProg = l => /^\d{1,3}\s*[).]/.test(l)

const recs = []
let cur = null, blk = null, mode = 'seek'

function closeBlk() { if (cur && blk) { cur.blocks.push(blk); blk = null } }
function closeRec() { closeBlk(); if (cur) recs.push(cur); cur = null }

for (let i = 0; i < lines.length; i++) {
  const l = lines[i]

  const sm = l.match(startRe)
  if (sm) {
    closeRec()
    cur = { sno: sm[1], head: [sm[2]], blocks: [] }
    mode = 'head'
    continue
  }
  if (!cur) continue

  // a period line opens a new recognition block for the current HEI
  if (!isProg(l) && periodRe.test(l) && mode !== 'period') {
    closeBlk()
    blk = { period: [l], count: null, progs: [] }
    mode = 'period'
    continue
  }

  if (mode === 'head') { cur.head.push(l); continue }

  if (mode === 'period') {
    const am = l.match(/^(.*?)\b(\d{1,3})\s+(1\s*[).].*)$/)
    if (am) {
      if (am[1].trim()) blk.period.push(am[1].trim())
      blk.count = parseInt(am[2], 10)
      blk.progs.push(am[3])
      mode = 'prog'
      continue
    }
    if (/^\d{1,2}$/.test(l)) { blk.count = parseInt(l, 10); mode = 'prog'; continue }
    blk.period.push(l)
    continue
  }

  blk.progs.push(l)
}
closeRec()

function stateStart(l) { return new RegExp('^(?:' + FIRSTWORDS.join('|') + ')(?![A-Za-z])', 'i').test(l) }

const TYPE_RE = /\((PRIVATE UNIVERSITY|DEEMED[- ]TO[- ]BE[- ]?UNIVERSITY|DEEMED TO BE UNIVERSITY|STATE UNIVERSITY|CENTRAL UNIVERSITY|OPEN UNIVERSITY|STATE OPEN UNIVERSITY)\)?/i

const out = recs.map(r => {
  let h = norm(r.head.join(' '))
  let state = ''
  for (const s of STATES) if (h.toUpperCase().startsWith(s)) { state = s; h = h.slice(s.length).trim(); break }
  if (!state) { // state split across lines, e.g. "MAHARASHTR" + "A"
    const m = h.match(/^([A-Z]+)\s+([A-Z])\b/)
    if (m) { const j = (m[1] + m[2]); const hit = STATES.find(s => s.replace(/\s/g, '') === j); if (hit) { state = hit; h = h.slice(m[0].length).trim() } }
  }
  let type = ''
  const tm = h.match(TYPE_RE)
  if (tm) { type = norm(tm[1]).toUpperCase(); h = (h.slice(0, tm.index) + ' ' + h.slice(tm.index + tm[0].length)).trim() }
  h = h.replace(/\(\s*$/, '').replace(/^\s*\)/, '').trim()

  const blocks = r.blocks.map(b => {
    const progs = []
    let buf = ''
    for (const p of b.progs) {
      if (/^\d{1,3}\s*[).]/.test(p)) { if (buf) progs.push(buf); buf = p.replace(/^\d{1,3}\s*[).]\s*/, '') }
      else buf += ' ' + p
    }
    if (buf) progs.push(buf)
    return { period: norm(b.period.join(' ')), count: b.count, progCount: progs.length, programmes: progs.map(norm) }
  })
  return { sno: r.sno, state, type, hei: norm(h).replace(/[(),\s]+$/, ''), blocks }
})

fs.writeFileSync(DIR + 'addendum.json', JSON.stringify(out, null, 1))
console.log('records:', out.length)
out.forEach(o => {
  console.log('#' + o.sno, '|', o.state, '|', o.type || '?', '|', o.hei)
  o.blocks.forEach(b => console.log('      [' + b.count + '/' + b.progCount + ']', b.period.slice(0, 70), '::', b.programmes.join(' ; ')))
})
