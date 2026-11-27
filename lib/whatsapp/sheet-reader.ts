// Read the first sheet of an .xlsx file, or a .csv file, into rows of text.
//
// Runs in the browser, so the student file never reaches the server; only the
// chosen phone column is sent on. No dependency: the repo's xlsx 0.18.5 has
// published security advisories for reading untrusted files, so it stays in
// offline scripts. An .xlsx is a zip of XML; this reads just the parts it
// needs, with size limits against zip bombs, and never evaluates formulas or
// follows external links. Cells are returned as their stored values.

export const MAX_FILE_BYTES = 5 * 1024 * 1024
export const MAX_PART_BYTES = 40 * 1024 * 1024
export const MAX_ROWS = 20_000
export const MAX_COLS = 50

export class SheetError extends Error {}

// ── CSV ──────────────────────────────────────────────────────────────────────
export function readCsv(text: string): string[][] {
  const src = text.replace(/^﻿/, '')
  const firstLine = src.slice(0, src.search(/\r?\n|$/))
  const counts = { ',': 0, ';': 0, '\t': 0 } as Record<string, number>
  for (const ch of firstLine) if (ch in counts) counts[ch]++
  const delim = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][1] > 0
    ? Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0] : ','
  const rows: string[][] = []
  let row: string[] = [], cell = '', q = false
  for (let i = 0; i < src.length; i++) {
    const ch = src[i]
    if (q) {
      if (ch === '"') { if (src[i + 1] === '"') { cell += '"'; i++ } else q = false }
      else cell += ch
      continue
    }
    if (ch === '"' && cell === '') q = true
    else if (ch === delim) { pushCell() }
    else if (ch === '\n' || ch === '\r') {
      if (ch === '\r' && src[i + 1] === '\n') i++
      pushCell(); pushRow()
    } else cell += ch
  }
  if (cell !== '' || row.length) { pushCell(); pushRow() }
  return rows

  function pushCell() { if (row.length < MAX_COLS) row.push(cell.trim()); cell = '' }
  function pushRow() {
    if (row.some(c => c !== '')) {
      if (rows.length >= MAX_ROWS) throw new SheetError(`The file has more than ${MAX_ROWS.toLocaleString('en-IN')} rows. Split it into smaller files.`)
      rows.push(row)
    }
    row = []
  }
}

// ── ZIP ──────────────────────────────────────────────────────────────────────
type Entry = { name: string; method: number; csize: number; usize: number; offset: number }

function u16(b: Uint8Array, o: number) { return b[o] | (b[o + 1] << 8) }
function u32(b: Uint8Array, o: number) { return (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0 }

function zipEntries(b: Uint8Array): Map<string, Entry> {
  let eocd = -1
  for (let i = b.length - 22; i >= Math.max(0, b.length - 22 - 0xffff); i--) {
    if (u32(b, i) === 0x06054b50) { eocd = i; break }
  }
  if (eocd < 0) throw new SheetError('This is not a valid .xlsx file.')
  const count = u16(b, eocd + 10)
  let p = u32(b, eocd + 16)
  if (count === 0xffff || p === 0xffffffff) throw new SheetError('This .xlsx file is too large. Save a smaller copy or use CSV.')
  const out = new Map<string, Entry>()
  for (let n = 0; n < count && n < 5000; n++) {
    if (p + 46 > b.length || u32(b, p) !== 0x02014b50) throw new SheetError('This .xlsx file is damaged.')
    const nameLen = u16(b, p + 28), extraLen = u16(b, p + 30), commentLen = u16(b, p + 32)
    const name = new TextDecoder().decode(b.subarray(p + 46, p + 46 + nameLen))
    out.set(name, { name, method: u16(b, p + 10), csize: u32(b, p + 20), usize: u32(b, p + 24), offset: u32(b, p + 42) })
    p += 46 + nameLen + extraLen + commentLen
  }
  return out
}

async function inflate(data: Uint8Array, limit: number): Promise<Uint8Array> {
  const stream = new Blob([data as unknown as ArrayBuffer]).stream().pipeThrough(new DecompressionStream('deflate-raw'))
  const reader = stream.getReader()
  const chunks: Uint8Array[] = []
  let total = 0
  for (;;) {
    const { done, value } = await reader.read()
    if (done) break
    total += value.length
    if (total > limit) { await reader.cancel(); throw new SheetError('This .xlsx file expands to an unsafe size.') }
    chunks.push(value)
  }
  const out = new Uint8Array(total)
  let o = 0
  for (const c of chunks) { out.set(c, o); o += c.length }
  return out
}

async function readPart(b: Uint8Array, entries: Map<string, Entry>, name: string): Promise<string | null> {
  const e = entries.get(name)
  if (!e) return null
  if (e.usize > MAX_PART_BYTES) throw new SheetError('This .xlsx file expands to an unsafe size.')
  const h = e.offset
  if (h + 30 > b.length || u32(b, h) !== 0x04034b50) throw new SheetError('This .xlsx file is damaged.')
  const start = h + 30 + u16(b, h + 26) + u16(b, h + 28)
  const data = b.subarray(start, start + e.csize)
  let raw: Uint8Array
  if (e.method === 0) raw = data
  else if (e.method === 8) raw = await inflate(data, MAX_PART_BYTES)
  else throw new SheetError('This .xlsx file uses an unsupported compression.')
  return new TextDecoder().decode(raw)
}

// ── XML bits ─────────────────────────────────────────────────────────────────
function decodeXml(s: string): string {
  return s.replace(/&(#x[0-9a-f]+|#\d+|amp|lt|gt|quot|apos);/gi, (_, e: string) => {
    const k = e.toLowerCase()
    if (k === 'amp') return '&'; if (k === 'lt') return '<'; if (k === 'gt') return '>'
    if (k === 'quot') return '"'; if (k === 'apos') return "'"
    const code = k.startsWith('#x') ? parseInt(k.slice(2), 16) : parseInt(k.slice(1), 10)
    return Number.isFinite(code) && code > 0 && code <= 0x10ffff ? String.fromCodePoint(code) : ''
  })
}

function textOf(xml: string): string {
  let s = ''
  for (const m of Array.from(xml.matchAll(/<t(?:\s[^>]*)?>([\s\S]*?)<\/t>/g))) s += m[1]
  return decodeXml(s)
}

function colIndex(ref: string): number {
  const letters = /^[A-Z]+/.exec(ref)?.[0] ?? ''
  let n = 0
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n - 1
}

// ── XLSX ─────────────────────────────────────────────────────────────────────
export async function readXlsx(bytes: Uint8Array): Promise<string[][]> {
  if (bytes.length > MAX_FILE_BYTES) throw new SheetError('The file is larger than 5 MB.')
  const entries = zipEntries(bytes)

  // First sheet in workbook order, through its relationship id.
  let sheetPath = 'xl/worksheets/sheet1.xml'
  const wb = await readPart(bytes, entries, 'xl/workbook.xml')
  const rels = await readPart(bytes, entries, 'xl/_rels/workbook.xml.rels')
  const rid = wb ? /<sheet\b[^>]*\br:id="([^"]+)"/.exec(wb)?.[1] : undefined
  if (rid && rels) {
    const rel = Array.from(rels.matchAll(/<Relationship\b([^>]*)\/?>/g)).map(m => m[1]).find(a => a.includes(`Id="${rid}"`))
    const target = rel ? /Target="([^"]+)"/.exec(rel)?.[1] : undefined
    if (target && !/^[a-z]+:/i.test(target)) {
      const t = target.replace(/^\//, '')
      sheetPath = t.startsWith('xl/') ? t : 'xl/' + t.replace(/^\.\//, '')
    }
  }
  const sheet = await readPart(bytes, entries, sheetPath)
  if (!sheet) throw new SheetError('Could not find a sheet in this file.')

  const shared: string[] = []
  const ss = await readPart(bytes, entries, 'xl/sharedStrings.xml')
  if (ss) for (const m of Array.from(ss.matchAll(/<si\b[^>]*>([\s\S]*?)<\/si>/g))) shared.push(textOf(m[1]))

  const rows: string[][] = []
  for (const rm of Array.from(sheet.matchAll(/<row\b[^>]*?(?:\/>|>([\s\S]*?)<\/row>)/g))) {
    const row: string[] = []
    for (const cm of Array.from((rm[1] ?? '').matchAll(/<c\b([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g))) {
      const attrs = cm[1], inner = cm[2] ?? ''
      const ref = /\br="([A-Z]+)\d*"/.exec(attrs)?.[1]
      const col = ref ? colIndex(ref) : row.length
      if (col < 0 || col >= MAX_COLS) continue
      const type = /\bt="([^"]+)"/.exec(attrs)?.[1] ?? 'n'
      const v = /<v>([\s\S]*?)<\/v>/.exec(inner)?.[1]
      let val = ''
      if (type === 's') val = shared[Number(v)] ?? ''
      else if (type === 'inlineStr') val = textOf(inner)
      else if (v !== undefined) val = decodeXml(v)
      while (row.length < col) row.push('')
      row[col] = val.trim()
    }
    if (row.some(c => c !== '')) {
      if (rows.length >= MAX_ROWS) throw new SheetError(`The file has more than ${MAX_ROWS.toLocaleString('en-IN')} rows. Split it into smaller files.`)
      rows.push(row)
    }
  }
  return rows
}

export async function readSheetFile(name: string, bytes: Uint8Array): Promise<string[][]> {
  if (bytes.length > MAX_FILE_BYTES) throw new SheetError('The file is larger than 5 MB.')
  const lower = name.toLowerCase()
  if (lower.endsWith('.xlsx')) return readXlsx(bytes)
  if (lower.endsWith('.csv') || lower.endsWith('.txt')) return readCsv(new TextDecoder().decode(bytes))
  if (lower.endsWith('.xls')) throw new SheetError('Old .xls files are not supported. In Excel use File > Save As > .xlsx or CSV.')
  throw new SheetError('Upload an .xlsx or .csv file.')
}
