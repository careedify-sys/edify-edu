// WhatsApp webhook POST handling, kept free of Next.js and Supabase imports so
// it can be tested with a fake store (lib/whatsapp/ingest.test.ts).
//
// Order of work, and why:
//   1. Verify X-Hub-Signature-256 over the raw bytes.
//   2. Store the raw body (wa_ingest_event). This is the durable acceptance:
//      if it fails we answer 500 and Meta retries the delivery.
//   3. Process it (wa_process_event). If this fails the event is already
//      stored, so we still answer 200 and the sweeper retries it.
// Duplicates are stopped by unique keys in Postgres (body hash, wamid,
// wamid+status), so retries and parallel instances are safe.
//
// Logs carry counts and types only: never phone numbers, names, text, media
// ids or the payload.
import { createHash } from 'crypto'
import { isValidMetaSignature } from './signature'

if (typeof window !== 'undefined') {
  throw new Error('lib/whatsapp/ingest.ts must not be imported in the browser')
}

export const MAX_BODY_BYTES = 1024 * 1024

export type ProcessSummary = {
  state: string
  messages?: number
  duplicates?: number
  statuses?: number
  status_duplicates?: number
  other_fields?: number
  messageTypes?: Record<string, number>
  already?: boolean
  sqlstate?: string
}

export interface EventStore {
  /** Store the delivery. Must throw if it could not be stored durably. */
  ingest(sha256: string, raw: string): Promise<{ eventId: number; state: string }>
  /** Project a stored event. May throw; the event stays stored either way. */
  process(eventId: number): Promise<ProcessSummary>
}

export type Logger = Pick<Console, 'info' | 'warn' | 'error'>

export type IngestResult = { status: number; body: string }

export async function handleWebhookPost(opts: {
  raw: Buffer
  declaredLength: number
  signature: string | null
  appSecret: string | undefined
  store: EventStore | null
  log?: Logger
}): Promise<IngestResult> {
  const log = opts.log ?? console
  if (!opts.appSecret) {
    log.error('[whatsapp-webhook] META_APP_SECRET is not set')
    return { status: 500, body: 'Not configured' }
  }
  if (opts.declaredLength > MAX_BODY_BYTES || opts.raw.length > MAX_BODY_BYTES) {
    return { status: 413, body: 'Payload too large' }
  }
  if (!isValidMetaSignature(opts.raw, opts.signature, opts.appSecret)) {
    log.warn('[whatsapp-webhook] invalid or missing signature')
    return { status: 401, body: 'Invalid signature' }
  }

  const text = opts.raw.toString('utf8')
  let payload: { object?: unknown }
  try {
    payload = JSON.parse(text)
  } catch {
    return { status: 400, body: 'Bad JSON' }
  }
  // Signed but not a WhatsApp event (another product on the same app).
  if (!payload || payload.object !== 'whatsapp_business_account') {
    return { status: 200, body: 'EVENT_RECEIVED' }
  }

  if (!opts.store) {
    log.error('[whatsapp-webhook] database not configured')
    return { status: 500, body: 'Not configured' }
  }

  const sha256 = createHash('sha256').update(opts.raw).digest('hex')

  let stored: { eventId: number; state: string }
  try {
    stored = await opts.store.ingest(sha256, text)
  } catch (err) {
    log.error('[whatsapp-webhook] could not store event', errorClass(err))
    return { status: 500, body: 'Storage unavailable' }
  }

  if (stored.state === 'completed') {
    log.info('[whatsapp-webhook] duplicate delivery', JSON.stringify({ event: stored.eventId }))
    return { status: 200, body: 'EVENT_RECEIVED' }
  }

  try {
    const summary = await opts.store.process(stored.eventId)
    log.info('[whatsapp-webhook] received', JSON.stringify({ event: stored.eventId, ...safeSummary(summary) }))
  } catch (err) {
    // Stored but not processed: the sweeper retries it.
    log.warn('[whatsapp-webhook] processing deferred', JSON.stringify({ event: stored.eventId, error: errorClass(err) }))
  }
  return { status: 200, body: 'EVENT_RECEIVED' }
}

/** Only counts, states and type names. */
export function safeSummary(s: ProcessSummary) {
  const types: Record<string, number> = {}
  for (const [k, v] of Object.entries(s.messageTypes ?? {})) {
    if (/^[a-z_]{1,32}$/.test(k) && typeof v === 'number') types[k] = v
  }
  return {
    state: String(s.state).slice(0, 20),
    messages: s.messages ?? 0,
    duplicates: s.duplicates ?? 0,
    statuses: s.statuses ?? 0,
    statusDuplicates: s.status_duplicates ?? 0,
    otherFields: s.other_fields ?? 0,
    messageTypes: types,
    ...(s.sqlstate ? { sqlstate: String(s.sqlstate).slice(0, 5) } : {}),
  }
}

/** An error's class and code, never its message (which can quote data). */
export function errorClass(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as { name?: unknown; code?: unknown }
    const name = typeof e.name === 'string' ? e.name.slice(0, 40) : 'Error'
    const code = typeof e.code === 'string' || typeof e.code === 'number' ? String(e.code).slice(0, 12) : ''
    return code ? `${name}:${code}` : name
  }
  return 'unknown'
}
