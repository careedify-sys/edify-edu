// Parse the UGC-DEB standing recognition list PDF into structured JSON.
//
// Step 1:  pdftotext -raw <list>.pdf audits/ugc-deb-2026-08/main.raw.txt
//          (-raw keeps content-stream order, which is cell-by-cell for this
//           table; -layout and -table both interleave the page watermark into
//           the HEI-name column and are unusable.)
// Step 2:  node scripts/ugc-deb/parse-main-list.js
//
// Writes audits/ugc-deb-2026-08/main.json. Every parsed record carries the
// UGC's own stated programme count so a parse loss shows up as a mismatch.
const fs = require('fs')
const DIR = 'audits/ugc-deb-2026-08/';

const STATES = ['ANDHRA PRADESH','ARUNACHAL PRADESH','ASSAM','BIHAR','CHHATTISGARH','GOA','GUJARAT','HARYANA','HIMACHAL PRADESH','JHARKHAND','KARNATAKA','KERALA','MADHYA PRADESH','MAHARASHTRA','MANIPUR','MEGHALAYA','MIZORAM','NAGALAND','ODISHA','PUNJAB','RAJASTHAN','SIKKIM','TAMIL NADU','TELANGANA','TRIPURA','UTTAR PRADESH','UTTARAKHAND','WEST BENGAL','NEW DELHI','DELHI','JAMMU AND KASHMIR','JAMMU & KASHMIR','LADAKH','PUDUCHERRY','CHANDIGARH'].sort((a, b) => b.length - a.length)

const TYPES = ['DEEMED-TO-BE UNIVERSITY','DEEMED TO BE UNIVERSITY','STATE OPEN UNIVERSITY','STATE PRIVATE UNIVERSITY','CENTRAL OPEN UNIVERSITY','CENTRAL UNIVERSITY','PRIVATE UNIVERSITY','STATE UNIVERSITY','OPEN UNIVERSITY','INSTITUTE OF NATIONAL IMPORTANCE'].sort((a, b) => b.length - a.length)

// The page watermark always renders as this exact 7-line run.
const WATERMARK = ['UN','IVERSITY','GRAN','TS','COM','M','ISSION']

const norm = s => s.replace(/[\u0000-\u001f\u007f\ufffd\u2013\u2014]/g, '-').replace(/-\s+/g, '-').replace(/\s+/g, ' ').trim()
const wordsOf = s => s.replace(/[()]/g, ' ').replace(/-/g, ' ').replace(/\s+/g, ' ').trim().split(' ').filter(Boolean)

function stripLeadingPhrase(text, phrase) {
  const tw = wordsOf(phrase).map(w => w.toUpperCase())
  let rest = text.replace(/^[\s(]*/, '')
  for (const want of tw) {
    const m = rest.match(/^[\s()-]*([A-Za-z.&']+)/)
    if (!m || m[1].toUpperCase() !== want) return null
    rest = rest.slice(m[0].length)
  }
  return rest.replace(/^[\s)-]*/, '')
}

// A state cell is often split across lines ("102. UTTAR" / "PRADESH"), so a
// record start is recognised by the FIRST word of any state name.
const FIRSTWORDS = [...new Set(STATES.map(s => s.split(' ')[0]))].sort((a, b) => b.length - a.length)
const stateRe = new RegExp('^(?:' + FIRSTWORDS.join('|') + ')(?![A-Za-z])', 'i')
const inlineStartRe = new RegExp('\\s(\\d{1,3})[.,]\\s+((?:' + FIRSTWORDS.join('|') + ')(?![A-Za-z]).*)$', 'i')

// Strip the watermark run and the repeated column-header block on every page.
// Header lines are dropped positionally, never by matching their text, because
// "STATE", "OF" and "TYPE" are also legitimate words inside HEI names.
function stripChrome(lines) {
  const out = []
  for (let i = 0; i < lines.length; i++) {
    if (lines[i] === 'UN' && WATERMARK.every((w, k) => lines[i + k] === w)) { i += WATERMARK.length - 1; continue }
    if (/^S\.No\b/.test(lines[i])) {
      let j = i + 1
      while (j < lines.length && j - i <= 12 && lines[j] !== 'NAME OF PROGRAMMES') j++
      if (j < lines.length && lines[j] === 'NAME OF PROGRAMMES') { i = j; continue }
    }
    if (lines[i] === 'UNIVERSITY GRANTS COMMISSION') continue
    out.push(lines[i])
  }
  return out
}

function parse(file, hasPeriodColumn) {
  const lines = stripChrome(
    fs.readFileSync(file, 'utf8').split(/\r?\n/).map(s => s.replace(/\f/g, '').trim()).filter(Boolean)
  )

  const isProgLine = l => /^\d{1,3}\s*\)/.test(l)

  function isStart(l) {
    if (isProgLine(l)) return null
    if (/^\d{1,3}\s+\d{1,3}\s*\)/.test(l)) return null
    const m = l.match(/^(\d{1,3})[.,]?(?:\s+(.*))?$/)
    if (!m) return null
    const rest = (m[2] || '').trim()
    if (rest === '') return { sno: m[1], rest: '' }
    if (stateRe.test(rest)) return { sno: m[1], rest }
    return null
  }

  const recs = []
  let cur = null
  let mode = 'seek'
  const push = () => { if (cur) recs.push(cur) }

  for (const l of lines) {
    if (mode === 'prog' && isProgLine(l)) {
      const im = l.match(inlineStartRe)
      if (im) {
        const head = l.slice(0, im.index).trim()
        if (head) cur.progs.push(head)
        push()
        cur = { sno: im[1], hdr: [im[2]], progs: [], count: null }
        mode = 'hdr'
        continue
      }
    }
    const st = isStart(l)
    if (st) {
      push()
      cur = { sno: st.sno, hdr: st.rest ? [st.rest] : [], progs: [], count: null }
      mode = 'hdr'
      continue
    }
    if (!cur) continue

    if (mode === 'hdr') {
      // "MATS UNIVERSITY 05 1) BACHELOR OF COMMERCE": count and first programme glued on
      const am = l.match(/^(.*?)\b(\d{1,3})\s+(1\s*\).*)$/)
      if (am) {
        if (am[1].trim()) cur.hdr.push(am[1].trim())
        cur.count = parseInt(am[2], 10)
        cur.progs.push(am[3])
        cur.next = 2
        mode = 'prog'
        continue
      }
      // "JAMIA HAMDARD 07": count glued to the end of the HEI-name line
      const bm = l.match(/^(.*[A-Za-z].*?)\s+(\d{1,2})$/)
      if (bm) { cur.hdr.push(bm[1].trim()); cur.count = parseInt(bm[2], 10); mode = 'prog'; continue }
      if (/^\d{1,2}$/.test(l) && cur.hdr.length) { cur.count = parseInt(l, 10); mode = 'prog'; continue }
      cur.hdr.push(l)
      continue
    }
    // An HEI name can spill past a page break and land glued to the front of the
    // next programme ("INSTITUTE 3) MASTER OF SCIENCE"). Split on the expected number.
    if (!isProgLine(l) && cur.next) {
      const sm = l.match(new RegExp('^(.+?)\\s*\\b' + cur.next + '\\s*\\)\\s*(.*)$'))
      if (sm) {
        cur.spill = (cur.spill ? cur.spill + ' ' : '') + sm[1].trim()
        cur.progs.push(cur.next + ') ' + sm[2])
        cur.next++
        continue
      }
    }
    if (isProgLine(l)) cur.next = parseInt(l.match(/^(\d{1,3})/)[1], 10) + 1
    cur.progs.push(l)
  }
  push()

  return recs.map(r => {
    let h = norm(r.hdr.concat(r.spill?[r.spill]:[]).join(' '))
    let state = ''
    for (const s of STATES) {
      if (h.toUpperCase().startsWith(s) && !/[A-Za-z]/.test(h.charAt(s.length))) { state = s; h = h.slice(s.length).trim(); break }
    }
    let type = ''
    for (const t of TYPES) {
      const rest = stripLeadingPhrase(h, t)
      if (rest !== null) { type = t; h = rest; break }
    }
    if (!type) {
      // PDF 1 puts the type in brackets after the HEI name
      for (const t of TYPES) {
        const tw = wordsOf(t).map(w => w.toUpperCase())
        const hw = wordsOf(h)
        for (let i = 0; i + tw.length <= hw.length; i++) {
          if (tw.every((w, k) => hw[i + k].toUpperCase() === w)) {
            type = t
            h = hw.slice(0, i).concat(hw.slice(i + tw.length)).join(' ')
            break
          }
        }
        if (type) break
      }
    }
    let period = ''
    if (hasPeriodColumn) {
      const pm = h.match(/((?:Academic year\s*)?\d{4}\s*-\s*\d{2,4}[,.]?\s*academic.*|Academic year.*|academic year.*)$/i)
      if (pm) { period = norm(pm[1]); h = h.slice(0, pm.index).trim() }
    }

    const progs = []
    let buf = ''
    for (const p of r.progs) {
      if (/^\d{1,3}\s*\)/.test(p)) { if (buf) progs.push(buf); buf = p.replace(/^\d{1,3}\s*\)\s*/, '') }
      else buf += ' ' + p
    }
    if (buf) progs.push(buf)

    return {
      sno: r.sno,
      state,
      type,
      hei: norm(h).replace(/^[(),\s-]+|[(),\s-]+$/g, ''),
      period,
      count: r.count,
      progCount: progs.length,
      programmes: progs.map(norm)
    }
  })
}

const which = process.argv[2]
const out = which === '1' ? parse('ugc1r.txt', true) : parse(DIR + 'main.raw.txt', false)
fs.writeFileSync(which === '1' ? 'ugc1_parsed.json' : DIR + 'main.json', JSON.stringify(out, null, 1))

console.log('records:', out.length)
const bad = out.filter(o => o.count !== o.progCount)
console.log('count mismatches:', bad.length)
bad.forEach(o => console.log('   #' + o.sno, o.hei, '| stated', o.count, 'parsed', o.progCount))
console.log('no state:', out.filter(o => !o.state).map(o => o.sno + ' ' + o.hei).join(' | ') || 'none')
console.log('no type :', out.filter(o => !o.type).map(o => o.sno + ' ' + o.hei).join(' | ') || 'none')
if (process.argv[2] === 'list') out.forEach(o => console.log(String(o.sno).padStart(4), '|', (o.state || '?').padEnd(16), '|', (o.type || '?').padEnd(24), '|', o.hei, '(' + o.progCount + ')'))
