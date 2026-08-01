// scripts/import-leads.ts
// One-time import of the old Google Sheet into the Supabase `leads` table.
//
// Usage:
//   npx tsx scripts/import-leads.ts                       # reads scripts/leads-import.csv
//   npx tsx scripts/import-leads.ts path/to/other.csv     # reads a custom path
//   npx tsx scripts/import-leads.ts --dry                 # parse + summarize, no writes
//
// Expected columns (case/spacing insensitive):
//   Timestamp | Name | Phone | Email | Program | University | Source | Call Time | Message | Submitted At
//
// Safe to re-run: unique index on phone digits means already-imported leads
// are recognized (23505) and skipped instead of duplicated.

import fs from 'fs'
import path from 'path'
import { createClient } from '@supabase/supabase-js'

// ── Load .env.local so SUPABASE_* is available without `next` in scope ──
const envPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].trim()
  }
}

const SB_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SB_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
if (!SB_URL || !SB_KEY) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local')
  process.exit(1)
}

const sb = createClient(SB_URL, SB_KEY, { auth: { persistSession: false, autoRefreshToken: false } })

// ── Args ──
const args = process.argv.slice(2)
const dryRun = args.includes('--dry')
const csvArg = args.find(a => !a.startsWith('--'))
const csvPath = path.resolve(process.cwd(), csvArg || 'scripts/leads-import.csv')

// ── Minimal RFC-4180 CSV parser (handles quoted fields with commas/newlines) ──
function parseCsv(text: string): string[][] {
  const rows: string[][] = []
  let row: string[] = []
  let field = ''
  let inQuotes = false
  let i = 0
  while (i < text.length) {
    const c = text[i]
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i += 2; continue }
        inQuotes = false; i++; continue
      }
      field += c; i++; continue
    }
    if (c === '"') { inQuotes = true; i++; continue }
    if (c === ',') { row.push(field); field = ''; i++; continue }
    if (c === '\r') { i++; continue }
    if (c === '\n') { row.push(field); rows.push(row); field = ''; row = []; i++; continue }
    field += c; i++
  }
  if (field.length || row.length) { row.push(field); rows.push(row) }
  return rows
}

// ── Main ──
type Parsed = {
  name: string
  email: string | null
  program: string | null
  university: string | null
  source: string | null
  message: string | null
  preferredTime: string | null
  timestamp: Date
  canonical: string   // "91XXXXXXXXXX"
}

async function main() {
  if (!fs.existsSync(csvPath)) {
    console.error(`CSV not found: ${csvPath}`)
    console.error(`Put the exported Sheet at scripts/leads-import.csv or pass a path as the first arg.`)
    process.exit(1)
  }

  const raw = fs.readFileSync(csvPath, 'utf8').replace(/^﻿/, '') // strip BOM
  const allRows = parseCsv(raw).filter(r => r.some(c => c.trim().length))
  if (allRows.length < 2) {
    console.error('CSV has no data rows.')
    process.exit(1)
  }

  const header = allRows[0].map(h => h.trim().toLowerCase().replace(/[^a-z0-9]/g, ''))
  const dataRows = allRows.slice(1)

  const idx = {
    timestamp:   header.indexOf('timestamp'),
    name:        header.indexOf('name'),
    phone:       header.indexOf('phone'),
    email:       header.indexOf('email'),
    program:     header.indexOf('program'),
    university:  header.indexOf('university'),
    source:      header.indexOf('source'),
    callTime:    header.indexOf('calltime'),
    message:     header.indexOf('message'),
    submittedAt: header.indexOf('submittedat'),
  }

  if (idx.name < 0 || idx.phone < 0) {
    console.error(`Header must include Name and Phone. Got: ${allRows[0].join(' | ')}`)
    process.exit(1)
  }

  const parsed: Parsed[] = []
  const skip = { blank: 0, invalidPhone: 0, junkName: 0 }

  for (const r of dataRows) {
    const get = (i: number) => (i >= 0 && r[i] ? r[i].trim() : '')
    const name = get(idx.name)
    const phoneRaw = get(idx.phone)
    if (!name || !phoneRaw) { skip.blank++; continue }
    const digits = phoneRaw.replace(/\D/g, '')
    const last10 = digits.slice(-10)
    if (!/^[6-9]\d{9}$/.test(last10)) { skip.invalidPhone++; continue }
    // Guard against pasted-paragraph-in-Name-field junk rows. Real names
    // rarely exceed 80 chars; longer entries are almost always someone
    // pasting a message or address into the wrong field.
    if (name.length > 80) { skip.junkName++; continue }

    const tsRaw = get(idx.timestamp) || get(idx.submittedAt)
    const tsDate = tsRaw ? new Date(tsRaw) : new Date()
    const timestamp = isNaN(tsDate.getTime()) ? new Date() : tsDate

    parsed.push({
      name,
      email:         get(idx.email) || null,
      program:       get(idx.program) || null,
      university:    get(idx.university) || null,
      source:        get(idx.source) || null,
      message:       get(idx.message) || null,
      preferredTime: get(idx.callTime) || null,
      timestamp,
      canonical: `91${last10}`,
    })
  }

  // Group by canonical phone.
  const groups = new Map<string, Parsed[]>()
  for (const p of parsed) {
    const arr = groups.get(p.canonical) ?? []
    arr.push(p)
    groups.set(p.canonical, arr)
  }

  console.log(`Parsed ${dataRows.length} rows → ${parsed.length} valid, ${groups.size} unique leads`)
  console.log(`Skipped: blank=${skip.blank}, invalidPhone=${skip.invalidPhone}, junkName=${skip.junkName}`)

  if (dryRun) {
    console.log('Dry run — no writes. Sample first 5 unique leads:')
    let n = 0
    for (const [phone, rows] of Array.from(groups)) {
      if (n++ >= 5) break
      rows.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
      const first = rows[0]
      console.log(`  ${phone}  ${first.name}  (${rows.length} submission${rows.length === 1 ? '' : 's'})`)
    }
    return
  }

  let inserted = 0
  let existed = 0
  let activityInserted = 0
  let activityDeduped = 0
  const failures: string[] = []

  for (const [canonical, rows] of Array.from(groups)) {
    rows.sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime())
    const first = rows[0]
    const last = rows[rows.length - 1]

    // Merge: latest non-empty wins for mutable fields; earliest timestamp is created_at.
    const pickLatest = <K extends keyof Parsed>(k: K) =>
      [...rows].reverse().find(r => r[k])?.[k] ?? null

    const merged = {
      name:              last.name,
      phone:             canonical,
      email:             pickLatest('email'),
      program:           pickLatest('program'),
      university:        pickLatest('university'),
      source:            first.source ?? null,
      message:           pickLatest('message'),
      preferred_time:    pickLatest('preferredTime'),
      stage:             'Fresh' as const,
      created_at:        first.timestamp.toISOString(),
      updated_at:        last.timestamp.toISOString(),
      last_submitted_at: last.timestamp.toISOString(),
      // CSV imports are the historical backlog — always flagged so the
      // CRM's New/Fresh working views can exclude them.
      imported:          true,
    }

    const { data: ins, error: insErr } = await sb
      .from('leads')
      .insert(merged)
      .select('id')
      .single()

    let leadId: string | null = null
    if (insErr) {
      if ((insErr as { code?: string }).code === '23505') {
        // Already imported (phone-digits unique index). Fetch its id so we
        // can still seed any missing activity notes.
        const { data: existing } = await sb
          .from('leads').select('id').eq('phone', canonical).maybeSingle()
        leadId = existing?.id ?? null
        existed++
      } else {
        failures.push(`${canonical}  ${first.name}  → ${insErr.message}`)
        continue
      }
    } else {
      leadId = ins?.id ?? null
      inserted++
    }
    if (!leadId) continue

    // One activity per unique (date, message).
    const seen = new Set<string>()
    const acts: Array<{ lead_id: string; occurred_on: string; type: 'note'; remark: string }> = []
    for (const r of rows) {
      if (!r.message) continue
      const day = r.timestamp.toISOString().slice(0, 10)
      const key = `${day}::${r.message}`
      if (seen.has(key)) { activityDeduped++; continue }
      seen.add(key)
      acts.push({
        lead_id: leadId,
        occurred_on: day,
        type: 'note',
        remark: `Enquiry: ${r.message}`,
      })
    }
    if (acts.length) {
      const { error: aErr } = await sb.from('lead_activity').insert(acts)
      if (aErr) failures.push(`activity ${canonical} → ${aErr.message}`)
      else activityInserted += acts.length
    }
  }

  console.log(`\n── Import summary ──`)
  console.log(`  Rows read (data):     ${dataRows.length}`)
  console.log(`  Rows skipped:         ${skip.blank + skip.invalidPhone + skip.junkName}`)
  console.log(`    blank name/phone:   ${skip.blank}`)
  console.log(`    invalid phone:      ${skip.invalidPhone}`)
  console.log(`    junk name (>100c):  ${skip.junkName}`)
  console.log(`  Unique leads seen:    ${groups.size}`)
  console.log(`  Leads inserted:       ${inserted}`)
  console.log(`  Leads already existed:${existed}`)
  console.log(`  Activity notes added: ${activityInserted}`)
  console.log(`  Activity dedup'd:     ${activityDeduped}`)
  if (failures.length) {
    console.log(`\n  Failures (${failures.length}):`)
    failures.slice(0, 20).forEach(f => console.log(`    - ${f}`))
    if (failures.length > 20) console.log(`    (... ${failures.length - 20} more)`)
  }
}

main().catch(err => { console.error(err); process.exit(1) })
