// House style caps paragraphs at 2-4 sentences, but 248 blog posts, ~430 spec
// content files and every FAQ answer were written before that rule held. The
// Oct 2026 site audit flagged hundreds of pages for "paragraphs are too long".
// Splitting at render time fixes all of them without touching lib/blog.ts or
// lib/data/page-content/*.json, so no wording, fee or rank changes. A paragraph
// is split only at a sentence end outside any tag (and outside **bold**), and
// one long sentence is never broken.

const MAX_WORDS = 55

// A period after these does not end a sentence.
const ABBREV = /(?:^|[\s(])(?:e\.g|i\.e|vs|Rs|No|Dr|St|Ltd|Pvt|approx|etc|Mr|Ms|Mrs|Inc|Co|Sr|Jr|Prof|Govt|Dept|Sem|Yr|Hons)\.$/i

const wordCount = (s: string) => s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length

// Cut points in `s`: indexes just after a sentence end at tag depth 0, where
// the next character starts a new sentence.
function sentenceCuts(s: string, markdownBold: boolean): number[] {
  const cuts: number[] = []
  let depth = 0
  let bold = false
  for (let i = 0; i < s.length; i++) {
    const c = s[i]
    if (c === '<') {
      const end = s.indexOf('>', i)
      if (end === -1) break
      const tag = s.slice(i, end + 1)
      if (/^<\//.test(tag)) depth = Math.max(0, depth - 1)
      else if (!/\/>$/.test(tag) && !/^<(br|img|hr|wbr)\b/i.test(tag)) depth++
      i = end
      continue
    }
    if (markdownBold && c === '*' && s[i + 1] === '*') { bold = !bold; i++; continue }
    if (depth > 0 || bold || !/[.!?]/.test(c)) continue
    let j = i + 1
    while (j < s.length && /["'”’)]/.test(s[j])) j++
    if (!/\s/.test(s[j] ?? '')) continue
    let k = j
    while (k < s.length && /\s/.test(s[k])) k++
    if (k >= s.length || !/[A-Z0-9₹<"“*]/.test(s[k])) continue
    if (c === '.' && ABBREV.test(s.slice(Math.max(0, i - 8), i + 1))) continue
    cuts.push(k)
  }
  return cuts
}

function chunk(s: string, markdownBold: boolean): string[] {
  if (wordCount(s) <= MAX_WORDS) return [s]
  const cuts = sentenceCuts(s, markdownBold)
  if (!cuts.length) return [s]
  const sentences: string[] = []
  let start = 0
  for (const c of [...cuts, s.length]) { sentences.push(s.slice(start, c).trim()); start = c }
  // Balanced chunks: enough of them to stay near 45 words and at most 4
  // sentences each, so the last one is not a stray short line.
  const n = Math.min(sentences.length, Math.max(Math.ceil(wordCount(s) / 45), Math.ceil(sentences.length / 4)))
  const target = wordCount(s) / n
  const out: string[] = []
  let cur: string[] = []
  for (const sen of sentences) {
    cur.push(sen)
    if (out.length < n - 1 && (wordCount(cur.join(' ')) >= target || cur.length === 4)) { out.push(cur.join(' ')); cur = [] }
  }
  if (cur.length) out.push(cur.join(' '))
  return out
}

/** Plain text (FAQ answers, content JSON paragraphs, which may carry **bold**). */
// Some FAQ rows carry no answer (a: undefined); render nothing rather than throw.
// An unguarded .trim() here failed the 28 Oct production build on MBA hubs.
export function splitParagraph(text: string | null | undefined): string[] {
  if (!text?.trim()) return []
  return chunk(text.trim(), true)
}

/** Blog HTML: every long <p> becomes several <p> with the same attributes. */
export function splitLongParagraphsHtml(html: string): string {
  return html.replace(/<p(\s[^>]*)?>([\s\S]*?)<\/p>/g, (whole, attrs = '', inner: string) => {
    if (/<(p|div|ul|ol|table|h\d)\b/i.test(inner)) return whole
    const parts = chunk(inner.trim(), false)
    return parts.length === 1 ? whole : parts.map(p => `<p${attrs}>${p}</p>`).join('\n')
  })
}
