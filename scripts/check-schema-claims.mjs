#!/usr/bin/env node
// scripts/check-schema-claims.mjs
//
// Schema claims gate (backlog C3, audit S1 and S2, 2026-11-16).
//
// Two defects shipped on every university profile until 16 Nov 2026:
//
//  1. A schema.org Review authored by NAAC, with a ratingValue Edify computed
//     itself (a band midpoint, or "3.0" when the grade was blank, which also
//     rendered "accredited by NAAC with Grade ."). NAAC never issued that
//     rating, and accreditation is not a review.
//  2. Edify's own telephone number on the CollegeOrUniversity node, which
//     invites search engines to merge Edify's contact details into the
//     university entity.
//
// This is a heuristic scan of source under app/ and components/:
//
//  A. Any `ratingValue`, `reviewRating` or `'@type': 'Review'` with a NAAC
//     reference (NAAC, naac.gov.in, "National Assessment and Accreditation")
//     within WINDOW characters on either side fails.
//  B. Any `telephone` key whose enclosing object, or any ancestor object, has a
//     direct `@type` of CollegeOrUniversity or EducationalOrganization fails.
//     Edify's own Organization (app/layout.tsx) and its ContactPoint are typed
//     Organization/ContactPoint, so they do not trip it.
//
// Brace matching is naive (no string or comment awareness). That is fine for
// the current tree; if it ever misfires, fix the scan, never add an allowlist
// that hides a university node.
//
// Usage: node scripts/check-schema-claims.mjs
// Exit 0 clean, 1 on any finding.

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DIRS = ['app', 'components']
const EXTS = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs'])
const WINDOW = 800

const REVIEW_RE = /\bratingValue\b|\breviewRating\b|['"]@type['"]\s*:\s*['"]Review['"]/g
const NAAC_RE = /NAAC|naac\.gov\.in|National Assessment and Accreditation/i
const TELEPHONE_RE = /['"]?\btelephone\b['"]?\s*:/g
const UNI_TYPE_RE = /['"]@type['"]\s*:\s*(\[[^\]]*\]|['"][^'"]*['"])/
const UNI_NAME_RE = /CollegeOrUniversity|EducationalOrganization/

function walk(dir, out) {
  let entries
  try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return out }
  for (const e of entries) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue
    const p = path.join(dir, e.name)
    if (e.isDirectory()) walk(p, out)
    else if (EXTS.has(path.extname(e.name))) out.push(p)
  }
  return out
}

function lineOf(src, idx) {
  let n = 1
  for (let i = 0; i < idx; i++) if (src.charCodeAt(i) === 10) n++
  return n
}

// Index of the '{' that opens the object enclosing position idx, or -1.
function enclosingOpen(src, idx) {
  let depth = 0
  for (let i = idx - 1; i >= 0; i--) {
    const c = src[i]
    if (c === '}') depth++
    else if (c === '{') {
      if (depth === 0) return i
      depth--
    }
  }
  return -1
}

function matchingClose(src, open) {
  let depth = 0
  for (let i = open; i < src.length; i++) {
    const c = src[i]
    if (c === '{') depth++
    else if (c === '}') {
      depth--
      if (depth === 0) return i
    }
  }
  return src.length - 1
}

// The object's text with nested {...} bodies removed, so only its own keys remain.
function directLevel(src, open) {
  const close = matchingClose(src, open)
  let depth = 0
  let out = ''
  for (let i = open; i <= close; i++) {
    const c = src[i]
    if (c === '{') { depth++; if (depth === 1) out += c; continue }
    if (c === '}') { if (depth === 1) out += c; depth--; continue }
    if (depth === 1) out += c
  }
  return out
}

function isUniversityObject(src, open) {
  const m = directLevel(src, open).match(UNI_TYPE_RE)
  return !!(m && UNI_NAME_RE.test(m[1]))
}

const findings = []
const files = DIRS.flatMap((d) => walk(path.join(ROOT, d), []))

for (const file of files) {
  const src = fs.readFileSync(file, 'utf8')
  const rel = path.relative(ROOT, file).split(path.sep).join('/')

  REVIEW_RE.lastIndex = 0
  let m
  while ((m = REVIEW_RE.exec(src))) {
    const win = src.slice(Math.max(0, m.index - WINDOW), m.index + WINDOW)
    if (NAAC_RE.test(win)) {
      findings.push(`${rel}:${lineOf(src, m.index)}  "${m[0]}" near a NAAC reference (NAAC is not a reviewer; do not emit a NAAC Review or rating)`)
    }
  }

  if (!UNI_NAME_RE.test(src)) continue
  TELEPHONE_RE.lastIndex = 0
  while ((m = TELEPHONE_RE.exec(src))) {
    let open = enclosingOpen(src, m.index)
    while (open >= 0) {
      if (isUniversityObject(src, open)) {
        findings.push(`${rel}:${lineOf(src, m.index)}  telephone inside a CollegeOrUniversity/EducationalOrganization schema node (the only number we hold is Edify's own)`)
        break
      }
      open = enclosingOpen(src, open)
    }
  }
}

if (findings.length) {
  console.error(`check-schema-claims: ${findings.length} finding(s)`)
  for (const f of findings) console.error('  ' + f)
  console.error('See audits/seo-aeo-geo-audit-2026-11-16.md S1/S2.')
  process.exit(1)
}
console.log(`check-schema-claims: OK (${files.length} files scanned, no NAAC review/rating, no telephone on a university node).`)
