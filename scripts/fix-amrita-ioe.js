// One-shot fix: Amrita Vishwa Vidyapeetham does NOT have Institution of
// Eminence status. Removes the IoE flag and the IoE sentence from the
// description/history_summary fields.
//
// Run: node scripts/fix-amrita-ioe.js

// Minimal .env.local loader so we don't need dotenv as a dep
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

const SLUG = 'amrita-vishwa-vidyapeetham-university-online'

async function main() {
  const { data: uni, error: readErr } = await supabase
    .from('universities')
    .select('id, name, slug, is_ioe, description, history_summary, known_for')
    .eq('slug', SLUG)
    .single()

  if (readErr || !uni) {
    console.error('Could not find Amrita record:', readErr?.message)
    process.exit(1)
  }

  console.log('Current state:')
  console.log('  is_ioe:', uni.is_ioe)
  console.log('  description:', uni.description?.slice(0, 200))
  console.log('  history_summary:', uni.history_summary?.slice(0, 300))
  console.log('  known_for:', uni.known_for?.slice(0, 200))

  // Remove the IoE sentence from any text field that contains it.
  // Catches variants: "Granted Institution of Eminence status by the Government of India.",
  // "Institution of Eminence status from the Government of India.", etc.
  const stripIoE = (text) => {
    if (!text) return text
    return text
      // Full sentence variants
      .replace(/Granted\s+Institution\s+of\s+Eminence\s+status[^.]*\.\s*/gi, '')
      .replace(/Institution\s+of\s+Eminence\s+status[^.]*\.\s*/gi, '')
      .replace(/Recognis(?:ed|ed)?\s+as\s+(?:an\s+)?Institution\s+of\s+Eminence[^.]*\.\s*/gi, '')
      .replace(/IoE\s+status[^.]*\.\s*/gi, '')
      // Inline IoE references: ", IoE-recognised", " (IoE)"
      .replace(/,?\s*(?:and\s+)?(?:an?\s+)?IoE[- ]?(?:recognis(?:ed|ed)|tagged|status)?[^,.;]*/gi, '')
      .replace(/\s{2,}/g, ' ')
      .trim()
  }

  const update = {
    is_ioe: false,
    description: stripIoE(uni.description),
    history_summary: stripIoE(uni.history_summary),
    known_for: stripIoE(uni.known_for),
    data_updated_at: new Date().toISOString(),
  }

  const { error: writeErr } = await supabase
    .from('universities')
    .update(update)
    .eq('slug', SLUG)

  if (writeErr) {
    console.error('Update failed:', writeErr.message)
    process.exit(1)
  }

  console.log('\nUpdated. New state:')
  console.log('  is_ioe:', update.is_ioe)
  console.log('  description:', update.description?.slice(0, 200))
  console.log('  history_summary:', update.history_summary?.slice(0, 300))
  console.log('  known_for:', update.known_for?.slice(0, 200))
}

main().catch(e => { console.error(e); process.exit(1) })
