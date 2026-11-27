// Unit tests for lib/whatsapp/phones.ts and sheet-reader.ts.
// Run: npx tsx lib/whatsapp/phones.test.mts   (no network, no database)
// Workbooks are WRITTEN with the repo's xlsx package (writing is not what its
// advisories cover); reading always goes through our own reader.
import assert from 'node:assert/strict'
import { createRequire } from 'node:module'
import { normaliseIndianMobile, splitPasted, summarise, detectPhoneColumn, csvCell, toCsv } from './phones'
import { readCsv, readXlsx, readSheetFile, SheetError, MAX_PART_BYTES } from './sheet-reader'

const require = createRequire(import.meta.url)
const XLSX = require('xlsx')

let passed = 0
async function test(name: string, fn: () => Promise<void> | void) {
  try { await fn(); passed++; console.log('ok  ', name) }
  catch (e) { console.error('FAIL', name); throw e }
}
const ok = (raw: string) => { const r = normaliseIndianMobile(raw); assert.equal(r.kind, 'valid', `${raw} -> ${JSON.stringify(r)}`); return (r as any).e164 }
const bad = (raw: string, reason: string) => { const r = normaliseIndianMobile(raw); assert.notEqual(r.kind, 'valid', raw); assert.equal((r as any).reason, reason, `${raw} -> ${JSON.stringify(r)}`) }

await test('Indian formats normalise to +91', () => {
  for (const raw of ['9876543210', '+919876543210', '919876543210', '09876543210', '0091 98765 43210',
    '+91 98765 43210', '+91-98765-43210', '(+91) 98765-43210', '98765.43210', "'9876543210", '"9876543210"',
    '9876543210.0', ' 9876543210 ', '98765 43210']) {
    assert.equal(ok(raw), '+919876543210', raw)
  }
  assert.equal(ok('6000000001'), '+916000000001')
})

await test('invalid numbers are reported with a reason, never guessed', () => {
  bad('987654321', 'too_short')
  bad('98765432101', 'too_long')
  bad('5876543210', 'not_mobile')
  bad('+919576543', 'too_short')
  bad('+14155550123', 'not_indian')
  bad('+447700900123', 'not_indian')
  bad('91 5876543210', 'not_mobile')
  bad('98765abc10', 'letters')
  bad('9876543210.5', 'decimal')
  bad('', 'too_short')
})

await test('Excel scientific notation: exact values expand, shortened ones are flagged', () => {
  bad('9.19877E+11', 'scientific_notation')       // Excel's default display, 6 digits
  bad('9.87654E+09', 'scientific_notation')
  bad('9.87654321E+09', 'scientific_notation')    // could be ...3210 to ...3214
  assert.equal(ok('9.19876543210E+11'), '+919876543210')
  assert.equal(ok('9.876543211E9'), '+919876543211')
  bad('9.5E0', 'scientific_notation')
})

await test('placeholders and multi-number cells are flagged, not guessed', () => {
  bad('9999999999', 'repeated_digits')
  bad('9876543210 / 9123456789', 'several_numbers')
  bad('9876543210 or 9123456789', 'several_numbers')
})

await test('pasted text: every separator Rishi listed', () => {
  const t = splitPasted('9876543210\n9123456789,9234567890;9345678901\t9456789012|9567890123\r\n+91 98765 43211\n9876543212 9876543213')
  assert.deepEqual(t.map(x => x.raw), ['9876543210', '9123456789', '9234567890', '9345678901', '9456789012', '9567890123',
    '+91 98765 43211', '9876543212', '9876543213'])
  assert.ok(t.every(x => !x.spaced))
})

await test('pasted text: spaces that could be one number or two are flagged', () => {
  const t = splitPasted('98765 43210 91234')
  assert.equal(t.length, 1); assert.equal(t[0].spaced, true)
  const s = summarise(t)
  assert.equal(s.ambiguous[0].reason, 'spaced_digits'); assert.equal(s.valid, 0)
})

await test('pasted Excel cells (tabs between columns, headings) keep only digits-bearing values', () => {
  const s = summarise(splitPasted('Name\tPhone\nAsha\t9876543210\nRavi\t+91 91234 56789\n'))
  assert.equal(s.ignored, 4)            // Name, Phone, Asha, Ravi
  assert.deepEqual(s.numbers, ['+919876543210', '+919123456789'])
})

await test('summary counts duplicates across formats, invalid and ambiguous separately', () => {
  const s = summarise(['9876543210', '+919876543210', '09876543210', '12345', '9.19877E+11', '9123456789', 'Mobile'])
  assert.equal(s.total, 6); assert.equal(s.ignored, 1)
  assert.equal(s.valid, 2); assert.equal(s.duplicates, 2)
  assert.equal(s.invalid.length, 1); assert.equal(s.ambiguous.length, 1)
  assert.equal(s.total, s.valid + s.duplicates + s.invalid.length + s.ambiguous.length)
})

await test('phone column detection: with heading, without heading, and none', () => {
  const withHead = [['Sr', 'Name', 'Mobile No'], ['1', 'A', '9876543210'], ['2', 'B', '9123456789'], ['3', 'C', '']]
  assert.deepEqual([detectPhoneColumn(withHead).column, detectPhoneColumn(withHead).hasHeader], [2, true])
  const noHead = [['9876543210'], ['9123456789'], ['91234 56780']]
  assert.deepEqual([detectPhoneColumn(noHead).column, detectPhoneColumn(noHead).hasHeader], [0, false])
  const none = [['a', 'b'], ['x', '12']]
  assert.equal(detectPhoneColumn(none).column, null)
})

await test('CSV export guards formulas and keeps numbers readable', () => {
  assert.equal(csvCell('=HYPERLINK("http://x","y")'), `"'=HYPERLINK(""http://x"",""y"")"`)
  assert.equal(csvCell('@SUM(A1)'), "'@SUM(A1)")
  assert.equal(csvCell('-2+3'), "'-2+3")
  assert.equal(csvCell('+919876543210'), "'+919876543210")
  assert.equal(csvCell('plain, text'), '"plain, text"')
  assert.equal(toCsv(['a'], [['=1']]), "a\r\n'=1\r\n")
})

await test('CSV reader: delimiters, quotes, BOM, blank rows', () => {
  assert.deepEqual(readCsv('﻿phone,name\r\n"9876543210","A, B"\r\n\r\n9123456789,C\n'),
    [['phone', 'name'], ['9876543210', 'A, B'], ['9123456789', 'C']])
  assert.deepEqual(readCsv('phone;name\n9876543210;A'), [['phone', 'name'], ['9876543210', 'A']])
  assert.deepEqual(readCsv('9876543210\n9123456789'), [['9876543210'], ['9123456789']])
})

function workbook(rows: unknown[][], opts: { cellTypes?: 'n' | 's' } = {}): Uint8Array {
  const ws = XLSX.utils.aoa_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, 'Students')
  XLSX.utils.book_append_sheet(wb, XLSX.utils.aoa_to_sheet([['ignore me']]), 'Other')
  return new Uint8Array(XLSX.write(wb, { type: 'buffer', bookType: 'xlsx', bookSST: opts.cellTypes === 's' }))
}

await test('XLSX: numeric cells keep every digit; first sheet only', async () => {
  const rows = await readXlsx(workbook([['Mobile'], [9876543210], [919123456789], ['+91 98765 43211']]))
  assert.deepEqual(rows, [['Mobile'], ['9876543210'], ['919123456789'], ['+91 98765 43211']])
})

await test('XLSX: shared strings, no heading, gaps between columns', async () => {
  const rows = await readXlsx(workbook([['A & B', null, '9876543210'], ['<x>', null, '9123456789']], { cellTypes: 's' }))
  assert.deepEqual(rows, [['A & B', '', '9876543210'], ['<x>', '', '9123456789']])
  const g = detectPhoneColumn(rows)
  assert.deepEqual([g.column, g.hasHeader], [2, false])
})

await test('XLSX end to end: 1,000 numbers with duplicates and junk', async () => {
  const data: unknown[][] = [['Phone']]
  for (let i = 0; i < 1000; i++) data.push([9000000000 + i])
  data.push([9000000000], ['bad'], ['9.19877E+11'])
  const rows = await readSheetFile('students.xlsx', workbook(data))
  const g = detectPhoneColumn(rows)
  assert.equal(g.column, 0)
  const s = summarise(rows.slice(1).map(r => r[0]))
  assert.equal(s.valid, 1000); assert.equal(s.duplicates, 1); assert.equal(s.ambiguous.length, 1)
})

await test('files: wrong types and broken zips are refused with a plain message', async () => {
  await assert.rejects(readSheetFile('a.xls', new Uint8Array(10)), /Old \.xls/)
  await assert.rejects(readSheetFile('a.pdf', new Uint8Array(10)), /\.xlsx or \.csv/)
  await assert.rejects(readXlsx(new TextEncoder().encode('not a zip at all, just text padding padding')), SheetError)
  await assert.rejects(readSheetFile('a.xlsx', new Uint8Array(6 * 1024 * 1024)), /larger than 5 MB/)
})

// Minimal zip writer for the bomb test: one deflated entry whose header lies
// about its size, which is what a zip bomb does.
async function deflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const buf = await new Response(new Blob([data]).stream().pipeThrough(new CompressionStream('deflate-raw'))).arrayBuffer()
  return new Uint8Array(buf)
}
function zip(name: string, comp: Uint8Array, claimedSize: number): Uint8Array {
  const n = new TextEncoder().encode(name)
  const local = new Uint8Array(30 + n.length), cen = new Uint8Array(46 + n.length), end = new Uint8Array(22)
  const dv = (b: Uint8Array) => new DataView(b.buffer)
  const l = dv(local); l.setUint32(0, 0x04034b50, true); l.setUint16(8, 8, true); l.setUint32(18, comp.length, true); l.setUint32(22, claimedSize, true); l.setUint16(26, n.length, true); local.set(n, 30)
  const c = dv(cen); c.setUint32(0, 0x02014b50, true); c.setUint16(10, 8, true); c.setUint32(20, comp.length, true); c.setUint32(24, claimedSize, true); c.setUint16(28, n.length, true); c.setUint32(42, 0, true); cen.set(n, 46)
  const e = dv(end); e.setUint32(0, 0x06054b50, true); e.setUint16(8, 1, true); e.setUint16(10, 1, true); e.setUint32(12, cen.length, true); e.setUint32(16, local.length + comp.length, true)
  const out = new Uint8Array(local.length + comp.length + cen.length + end.length)
  out.set(local, 0); out.set(comp, local.length); out.set(cen, local.length + comp.length); out.set(end, local.length + comp.length + cen.length)
  return out
}

await test('zip bomb: a sheet that lies about its size is stopped while inflating', async () => {
  const comp = await deflateRaw(new Uint8Array(MAX_PART_BYTES + 1024 * 1024))
  assert.ok(comp.length < 200 * 1024, 'the bomb is small on disk')
  const bomb = zip('xl/worksheets/sheet1.xml', comp, 1000)
  await assert.rejects(readXlsx(bomb), /unsafe size/)
  // Detector proof: the same writer with an honest small sheet is read fine.
  const good = new TextEncoder().encode('<worksheet><sheetData><row r="1"><c r="A1" t="inlineStr"><is><t>9876543210</t></is></c></row></sheetData></worksheet>')
  assert.deepEqual(await readXlsx(zip('xl/worksheets/sheet1.xml', await deflateRaw(good), good.length)), [['9876543210']])
})

console.log(`\n${passed} phone/sheet tests passed`)
