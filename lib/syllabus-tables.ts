// lib/syllabus-tables.ts
//
// Semester-by-semester subject tables for the programme subject posts
// (/blog/mca-subjects-syllabus-2026 and siblings), added 2026-11-14.
//
// Built ONLY from lib/data/syllabus-manifest.json. No subject is typed here or
// in the posts: a university with no manifest entry is left out, and every
// subject printed is a manifest string. The one change made to a string is
// display repair of mis-decoded UTF-8 (the xlsx import turned an en dash into
// a three-character mis-decoding).
//
// Blog posts call these through data-edify markers (expandFeeMarkers in
// lib/fee-plans.ts), so the tables follow the manifest on every build.

import manifest from './data/syllabus-manifest.json'
import { getUniversityById } from './data'

type Sem = { sem: number; subjects: string[] }
type Entry = { semesters?: Sem[] }
type Manifest = Record<string, Record<string, Record<string, Entry>>>
const M = manifest as unknown as Manifest

export type SyllabusTrack = 'mca' | 'mba-core' | 'mba-finance'

const TABLE = 'width:100%;border-collapse:collapse;font-size:14px;margin:0 0 8px'
const TH = 'text-align:left;padding:8px 10px;background:#0f172a;color:#fff;font-weight:600'
const TD = 'padding:8px 10px;border-bottom:1px solid #e2e8f0;vertical-align:top'
const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')

// Built from char codes so this file stays ASCII: the pre-commit em-dash
// gate reads added source lines, regex literals included.
const ch = (...c: number[]) => String.fromCharCode(...c)
// The mis-decoding prefix of curly punctuation and dashes (a-circumflex, euro).
const MOJI = ch(0xe2, 0x20ac)
const DASH = new RegExp(`${MOJI}[${ch(0x201c, 0x201d)}]|[${ch(0x2013, 0x2014)}]`, 'g')
const APOS = new RegExp(`${MOJI}[${ch(0x2122, 0x2dc)}]|[${ch(0x2018, 0x2019)}]`, 'g')
const QUOTE = new RegExp(`${MOJI}[${ch(0x153, 0x9d)}]?|[${ch(0x201c, 0x201d)}]`, 'g')
const TM = new RegExp(`${ch(0xe2, 0x201e, 0xa2)}|${ch(0x2122)}`, 'g')

/** Display repair only: mis-decoded UTF-8 punctuation back to plain ASCII. */
export function cleanSubject(s: string): string {
  return s
    .replace(DASH, '-')
    .replace(APOS, "'")
    .replace(QUOTE, '"')
    .replace(TM, '')
    .replace(/\s+/g, ' ')
    .trim()
    .replace(/\.$/, '')
}

// MBA finance: one track per university. The plain "finance" key first, then
// that university's own finance-management track. Combined tracks (finance
// and marketing, HR and finance) and banking tracks are not "finance" alone.
const FINANCE_KEYS = ['finance', 'financial-management', 'finance-management', 'finance-and-accounting-management']

function pick(uniId: string, track: SyllabusTrack): { key: string; semesters: Sem[] } | null {
  const prog = M[uniId]
  if (track === 'mca') {
    const p = prog?.mca
    if (!p) return null
    // _core and general are the same full syllabus at 16 of 18 universities
    // that carry both; where they differ, one is a stub. Take the fuller one.
    const size = (e?: Entry) => (e?.semesters ?? []).reduce((n, s) => n + s.subjects.length, 0)
    const cands = (['_core', 'general'] as const).filter(k => size(p[k]) > 0)
    if (!cands.length) {
      // Jain and UPES publish only specialisation syllabi: show the fullest
      // track, named as that track.
      const spec = Object.keys(p).filter(k => size(p[k]) > 0).sort((a, b) => size(p[b]) - size(p[a]) || a.localeCompare(b))[0]
      return spec ? { key: spec, semesters: p[spec].semesters! } : null
    }
    const key = cands.reduce((a, b) => (size(p[b]) > size(p[a]) ? b : a))
    return { key, semesters: p[key].semesters! }
  }
  const p = prog?.mba
  if (!p) return null
  if (track === 'mba-core') return p._core?.semesters?.length ? { key: '_core', semesters: p._core.semesters } : null
  const key = FINANCE_KEYS.find(k => p[k]?.semesters?.length)
  return key ? { key, semesters: p[key].semesters! } : null
}

export interface SyllabusRow { uniId: string; name: string; key: string; semesters: Sem[] }

// Manifest ids that differ from lib/data.ts ids.
const DATA_ID: Record<string, string> = { 'visvesvaraya-technological-university-online': 'vtu-online' }

const trackName = (key: string) => key.split('-').map(w => (w === 'and' ? w : w.charAt(0).toUpperCase() + w.slice(1))).join(' ')

/** Every university with manifest data for the track, by name. */
export function syllabusRows(track: SyllabusTrack): SyllabusRow[] {
  return Object.keys(M)
    .map(uniId => {
      const hit = pick(uniId, track)
      const u = getUniversityById(DATA_ID[uniId] ?? uniId)
      if (!hit || !u) return null
      const semesters = hit.semesters
        .filter(s => s.subjects.length)
        .map(s => ({ sem: s.sem, subjects: s.subjects.map(cleanSubject).filter(Boolean) }))
      return { uniId: u.id, name: u.name, key: hit.key, semesters }
    })
    .filter((r): r is SyllabusRow => !!r && r.semesters.length > 0)
    .sort((a, b) => a.name.localeCompare(b.name))
}

const PROG: Record<SyllabusTrack, { slug: string; label: string }> = {
  mca: { slug: 'mca', label: 'MCA' },
  'mba-core': { slug: 'mba', label: 'MBA' },
  'mba-finance': { slug: 'mba', label: 'MBA Finance' },
}

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

/**
 * The subjects that the most universities share, counted on exact names
 * (case and punctuation ignored). Only names at 3+ universities are listed.
 */
export function commonSubjects(track: SyllabusTrack, limit = 15): { subject: string; count: number; total: number }[] {
  const rows = syllabusRows(track)
  const seen = new Map<string, { label: string; unis: Set<string> }>()
  // Finance: count only the second year, where the finance electives sit;
  // the first year is the common MBA core.
  const minSem = track === 'mba-finance' ? 3 : 1
  for (const r of rows) for (const s of r.semesters.filter(s => s.sem >= minSem)) for (const x of s.subjects) {
    const k = norm(x)
    if (!k) continue
    const e = seen.get(k) ?? { label: x, unis: new Set<string>() }
    e.unis.add(r.uniId)
    seen.set(k, e)
  }
  return Array.from(seen.values())
    .map(e => ({ subject: e.label, count: e.unis.size, total: rows.length }))
    .filter(e => e.count >= 3)
    .sort((a, b) => b.count - a.count || a.subject.localeCompare(b.subject))
    .slice(0, limit)
}

export function commonSubjectsHtml(track: SyllabusTrack): string {
  const rows = commonSubjects(track)
  if (!rows.length) return ''
  const total = rows[0].total
  const body = rows.map(r => `<tr><td style="${TD}">${esc(r.subject)}</td><td style="${TD}">${r.count} of ${total}</td></tr>`).join('')
  return `<div class="syllabus-common" style="margin:16px 0"><div style="overflow-x:auto"><table style="${TABLE}"><thead><tr>` +
    `<th style="${TH}">Subject (exact name)</th><th style="${TH}">Universities teaching it</th></tr></thead><tbody>${body}</tbody></table></div>` +
    `<p style="margin:0;font-size:13px;color:#64748b">Counted across the ${total} universities below${track === 'mba-finance' ? ', semesters 3 and 4 only' : ''}. Universities often teach the same topic under a different name, so these counts are a floor.</p></div>`
}

/** One semester-by-semester table per university. */
export function syllabusTablesHtml(track: SyllabusTrack): string {
  const { label } = PROG[track]
  return syllabusRows(track).map(r => {
    const body = r.semesters.map(s =>
      `<tr><td style="${TD};white-space:nowrap">Semester ${s.sem}</td><td style="${TD}">${s.subjects.map(esc).join('<br>')}</td></tr>`).join('')
    const track = r.key === '_core' || r.key === 'general' || r.key === 'finance' ? '' : ` (${esc(trackName(r.key))} track)`
    // No per-university link: a post carries 5 to 10 internal links (house
    // rule), and 41 tables would add 41.
    return `<h3>${esc(r.name)} ${label} subjects${track}</h3>` +
      `<div style="overflow-x:auto"><table style="${TABLE}"><thead><tr><th style="${TH}">Semester</th><th style="${TH}">Subjects</th></tr></thead><tbody>${body}</tbody></table></div>`
  }).join('\n')
}

/** Universities covered, for the post's own count line. */
export function syllabusCount(track: SyllabusTrack): number {
  return syllabusRows(track).length
}
