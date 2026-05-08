// Audit-and-fix Institution of Eminence (IoE) status across all universities
// in Supabase. Source of truth is the official MoE IoE list (12 institutions
// as of August 2022). Everyone else gets is_ioe=false and any "Institution of
// Eminence" sentence stripped from their description / history_summary /
// known_for fields.
//
// Run: node scripts/audit-fix-ioe.js

const fs = require('fs')
const path = require('path')
const envPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split(/\r?\n/)) {
    const m = line.match(/^([A-Z0-9_]+)=(.*)$/)
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2].replace(/^["']|["']$/g, '')
  }
}
const { createClient } = require('@supabase/supabase-js')

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
)

// Official IoE list per MoE notifications (Aug 2022). The match check uses
// keyword tokens so we catch slug variants like "manipal-academy-higher-
// education-online" or "bits-pilani-online".
const OFFICIAL_IOE_TOKENS = [
  ['indian-institute-of-science', 'iisc'],
  ['iit-delhi'],
  ['iit-bombay'],
  ['iit-madras'],
  ['iit-kharagpur'],
  ['university-of-delhi', 'delhi-university'],
  ['university-of-hyderabad', 'hyderabad-university'],
  ['banaras-hindu-university', 'bhu'],
  ['bits-pilani', 'birla-institute-of-technology-and-science-pilani'],
  ['manipal-academy', 'mahe-manipal'],
  ['op-jindal', 'o-p-jindal', 'jindal-global'],
  ['shiv-nadar'],
]

function isOfficialIoE(slug) {
  const s = slug.toLowerCase()
  return OFFICIAL_IOE_TOKENS.some(group => group.some(token => s.includes(token)))
}

function stripIoE(text) {
  if (!text) return text
  return text
    .replace(/Granted\s+Institution\s+of\s+Eminence\s+status[^.]*\.\s*/gi, '')
    .replace(/Institution\s+of\s+Eminence\s+status[^.]*\.\s*/gi, '')
    .replace(/Recognis(?:ed|ed)?\s+as\s+(?:an\s+)?Institution\s+of\s+Eminence[^.]*\.\s*/gi, '')
    .replace(/Declared\s+(?:as\s+)?Institution\s+of\s+Eminence[^.]*\.\s*/gi, '')
    .replace(/IoE\s+status[^.]*\.\s*/gi, '')
    .replace(/,?\s*(?:and\s+)?(?:an?\s+)?IoE[- ]?(?:recognis(?:ed|ed)|tagged|status)?[^,.;]*/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

async function main() {
  const { data: rows, error } = await supabase
    .from('universities')
    .select('id, slug, name, is_ioe, description, history_summary, known_for')

  if (error) {
    console.error('Read failed:', error.message)
    process.exit(1)
  }

  let officialMatched = 0
  let falsePositiveCount = 0
  const falsePositives = []
  const updates = []

  for (const u of rows) {
    const isIoE = isOfficialIoE(u.slug)

    if (isIoE) {
      officialMatched++
      // Make sure these are flagged true
      if (!u.is_ioe) {
        updates.push({ id: u.id, slug: u.slug, set: { is_ioe: true } })
      }
      continue
    }

    // Not on the official list — must NOT have IoE flag/text
    const blob = `${u.description || ''} ${u.history_summary || ''} ${u.known_for || ''}`
    const hasIoEMention = /Institution\s+of\s+Eminence|IoE/i.test(blob)

    if (u.is_ioe || hasIoEMention) {
      falsePositiveCount++
      falsePositives.push({
        slug: u.slug,
        flag: u.is_ioe,
        mentioned_in_text: hasIoEMention,
      })
      const set = {
        is_ioe: false,
        data_updated_at: new Date().toISOString(),
      }
      if (hasIoEMention) {
        set.description = stripIoE(u.description)
        set.history_summary = stripIoE(u.history_summary)
        set.known_for = stripIoE(u.known_for)
      }
      updates.push({ id: u.id, slug: u.slug, set })
    }
  }

  console.log(`Total universities: ${rows.length}`)
  console.log(`Match official IoE list: ${officialMatched} (expected ~4 online IoEs: BITS, MAHE, OPJGU, Shiv Nadar)`)
  console.log(`False positives (IoE flag/mention but not on official list): ${falsePositiveCount}`)
  if (falsePositives.length) {
    console.log('\nFalse positives to fix:')
    falsePositives.forEach(fp => console.log(`  - ${fp.slug}  flag=${fp.flag}  text=${fp.mentioned_in_text}`))
  }

  if (!updates.length) {
    console.log('\nNothing to update.')
    return
  }

  console.log(`\nApplying ${updates.length} updates...`)
  for (const u of updates) {
    const { error: writeErr } = await supabase
      .from('universities')
      .update(u.set)
      .eq('id', u.id)
    if (writeErr) {
      console.error(`  FAILED ${u.slug}: ${writeErr.message}`)
    } else {
      console.log(`  OK ${u.slug}`)
    }
  }
  console.log('\nDone.')
}

main().catch(e => { console.error(e); process.exit(1) })
