// Supabase-backed EventStore for the WhatsApp webhook and sweeper.
// Server-only: uses the service-role client.
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import type { EventStore, ProcessSummary } from './ingest'

if (typeof window !== 'undefined') {
  throw new Error('lib/whatsapp/store.ts must not be imported in the browser')
}

type Sb = ReturnType<typeof createSupabaseServiceClient>

function client(): Sb | null {
  try {
    return createSupabaseServiceClient()
  } catch {
    return null
  }
}

export function supabaseEventStore(sb: Sb | null = client()): EventStore | null {
  if (!sb) return null
  return {
    async ingest(sha256, raw) {
      const { data, error } = await sb.rpc('wa_ingest_event', { p_sha256: sha256, p_raw: raw })
      if (error) throw Object.assign(new Error('ingest failed'), { code: error.code })
      const row = Array.isArray(data) ? data[0] : data
      if (!row || row.event_id == null) throw new Error('ingest returned no row')
      return { eventId: Number(row.event_id), state: String(row.event_state) }
    },
    async process(eventId) {
      // Count the attempt in its own committed request first: a statement
      // timeout during processing rolls back everything in that transaction,
      // so counting inside it would let a poison event retry forever.
      const begin = await sb.rpc('wa_begin_attempt', { p_event_id: eventId })
      if (begin.error) throw Object.assign(new Error('begin failed'), { code: begin.error.code })
      if (begin.data !== true) return { state: 'skipped' }
      const { data, error } = await sb.rpc('wa_process_event', { p_event_id: eventId })
      if (error) throw Object.assign(new Error('process failed'), { code: error.code })
      return (data ?? { state: 'unknown' }) as ProcessSummary
    },
  }
}

export async function retryIds(sb: Sb, limit: number): Promise<number[]> {
  const { data, error } = await sb.rpc('wa_events_to_retry', { p_limit: limit })
  if (error) throw Object.assign(new Error('retry query failed'), { code: error.code })
  return ((data ?? []) as Array<number | string>).map(Number)
}

export async function purgeRawBodies(sb: Sb): Promise<number> {
  const { data, error } = await sb.rpc('wa_purge_raw_bodies')
  if (error) throw Object.assign(new Error('purge failed'), { code: error.code })
  return Number(data ?? 0)
}

export async function exhaustedCount(sb: Sb): Promise<number> {
  const { data, error } = await sb.rpc('wa_exhausted_count')
  if (error) throw Object.assign(new Error('count failed'), { code: error.code })
  return Number(data ?? 0)
}

export { client as whatsappServiceClient }

// Requirement 8: the sweeper records each run so the inbox can show when it
// last ran without anyone opening Vercel logs. Counts only. Best effort: a
// failed write never fails the sweep.
export async function recordSweep(sb: Sb, value: Record<string, unknown>): Promise<void> {
  try {
    await sb.from('wa_settings').upsert({ key: 'last_sweep', value, updated_at: new Date().toISOString() })
  } catch { /* the next run tries again */ }
}
