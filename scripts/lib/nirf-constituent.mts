// Finds a constituent school's NIRF rank credited to its umbrella's online
// university. Used by scripts/check-nirf-category.mts.
//
// SSODL's pages said "NIRF Management rank 11" for months. That rank belongs to
// SIBM Pune, a constituent school of Symbiosis International; SSODL holds none.
// MAHE's said "NIRF Management #39", which is TAPMI's. Every AI answer that
// quoted us repeated it.
//
// Rule: in one sentence, a rank from data/nirf-constituent-schools.json next to
// its category, plus a token naming the umbrella, with no token naming the
// school, is a misattribution. Naming the school ("SIBM Pune holds NIRF
// Management #11, not SSODL") passes.

import { readFileSync } from 'node:fs'

interface Entry { umbrella: string; category: string; rank: number; school: string; umbrellaTokens: string[]; schoolTokens: string[] }

const ENTRIES: Entry[] = JSON.parse(readFileSync('data/nirf-constituent-schools.json', 'utf8')).entries

const CAT_ALIASES: Record<string, string> = {
  Management: 'Management|Mgmt|Mgt',
  Engineering: 'Engineering|Engg',
}

function rankRe(e: Entry): RegExp {
  const cat = CAT_ALIASES[e.category] ?? e.category
  const n = String(e.rank)
  // "Management #11", "Management rank 11", "Mgmt: #11", "#11 (Management)",
  // "rank 11 in the NIRF Management category", "NIRF #11 Management".
  return new RegExp(
    `(?:\\b(?:${cat})\\b[^.#\\d]{0,40}(?:#|\\brank(?:ed)?\\s*(?:of\\s*)?#?|\\bno\\.?\\s*)\\s*${n}(?!\\d))` +
    `|(?:(?:#|\\brank(?:ed)?\\s*(?:of\\s*)?#?)\\s*${n}(?!\\d)[^.\\d]{0,40}\\b(?:${cat})\\b)`,
    'i',
  )
}

const RE = ENTRIES.map(e => ({ e, re: rankRe(e) }))

// Sentence-ish units: prose sentences, table cells, list items, JSON strings.
function units(text: string): string[] {
  return text.split(/(?<=[.!?])\s+|\\n|\n|<\/(?:p|li|td|th|tr|h[1-6]|div)>|",\s*"/i)
}

const has = (s: string, tokens: string[]) => tokens.some(t => s.toLowerCase().includes(t.toLowerCase()))

/**
 * contextUniId: the lib/data.ts id a whole file or post is about (a
 * page-content JSON, a review post). Its prose says "the university holds ...
 * rank 11" without repeating the name, so inside that context every sentence
 * counts as naming the umbrella.
 */
export function findConstituentMisattribution(text: string, contextUniId?: string): string[] {
  const hits: string[] = []
  for (const u of units(text)) {
    for (const { e, re } of RE) {
      if (!re.test(u)) continue
      const inContext = !!contextUniId && (e as Entry & { uniIds?: string[] }).uniIds?.includes(contextUniId)
      if (!inContext && !has(u, e.umbrellaTokens)) continue
      if (has(u, e.schoolTokens)) continue
      hits.push(`${e.category} #${e.rank} belongs to ${e.school}: "${u.trim().slice(0, 160)}"`)
    }
  }
  return hits
}

export function selfTest(): boolean {
  const bad = [
    'Symbiosis SSODL holds NAAC A++ and NIRF Management rank 11.',
    'SSODL | NIRF #11 (Management) | A++',
    'The university holds NAAC A++ and sits at rank 11 in the NIRF Management category under the Symbiosis name.',
    'MAHE holds NIRF University #3 and NIRF Management #39.',
  ]
  const good = [
    'NIRF Management #11 is SIBM Pune\'s rank, a constituent school, not SSODL\'s.',
    'Symbiosis International holds NIRF 2025 University #24.',
    'NMIMS holds NIRF Management #24.',
    'MAHE: NIRF Management #39 is held by TAPMI, a constituent school.',
  ]
  const b = bad.filter(s => findConstituentMisattribution(s).length).length
  const g = good.filter(s => findConstituentMisattribution(s).length).length
  // The exact page-content form: no name in the sentence, file is about SSODL.
  const ctx = findConstituentMisattribution('The university holds NAAC A++ and sits at rank 11 in the NIRF Management category.', 'symbiosis-university-online').length
  const noCtx = findConstituentMisattribution('The university holds NAAC A++ and sits at rank 11 in the NIRF Management category.', 'amity-university-online').length
  return b === bad.length && g === 0 && ctx === 1 && noCtx === 0
}
