// Meta WhatsApp Cloud API webhook.
//
// GET  /api/whatsapp/webhook  Meta's one-time subscription check
//                             (hub.mode, hub.verify_token, hub.challenge).
// POST /api/whatsapp/webhook  Incoming messages and delivery status updates,
//                             signed with X-Hub-Signature-256.
//
// Env: WHATSAPP_VERIFY_TOKEN, META_APP_SECRET (server-only, never NEXT_PUBLIC_).
//
// This endpoint is RECEIVE-ONLY. It sends no WhatsApp messages. Logs carry
// event counts and types only: never phone numbers, names, message text,
// media ids or the raw payload.
import { isValidMetaSignature, safeEqualStrings } from '@/lib/whatsapp/signature'
import { markIfNew } from '@/lib/whatsapp/dedupe'

export const runtime = 'nodejs' // needs node:crypto
export const dynamic = 'force-dynamic'

const MAX_BODY_BYTES = 1024 * 1024 // Meta payloads are a few KB; refuse anything huge.
const CHALLENGE_RE = /^[A-Za-z0-9_-]{1,256}$/

function text(body: string, status: number) {
  return new Response(body, {
    status,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  })
}

// ── GET: subscription verification ─────────────────────────────────────────
export async function GET(req: Request) {
  const verifyToken = process.env.WHATSAPP_VERIFY_TOKEN
  if (!verifyToken) {
    console.error('[whatsapp-webhook] WHATSAPP_VERIFY_TOKEN is not set')
    return text('Not configured', 500)
  }

  const params = new URL(req.url).searchParams
  const mode = params.get('hub.mode')
  const token = params.get('hub.verify_token') ?? ''
  const challenge = params.get('hub.challenge') ?? ''

  if (mode === 'subscribe' && safeEqualStrings(token, verifyToken) && CHALLENGE_RE.test(challenge)) {
    console.info('[whatsapp-webhook] subscription verified')
    return text(challenge, 200)
  }

  console.warn('[whatsapp-webhook] verification rejected')
  return text('Forbidden', 403)
}

// ── POST: events ───────────────────────────────────────────────────────────
type WaMessage = { id?: unknown; type?: unknown }
type WaStatus = { id?: unknown; status?: unknown }
type WaChange = { field?: unknown; value?: { messages?: unknown; statuses?: unknown } }
type WaPayload = { object?: unknown; entry?: unknown }

export async function POST(req: Request) {
  const appSecret = process.env.META_APP_SECRET
  if (!appSecret) {
    console.error('[whatsapp-webhook] META_APP_SECRET is not set')
    return text('Not configured', 500)
  }

  const declared = Number(req.headers.get('content-length') ?? '0')
  if (declared > MAX_BODY_BYTES) return text('Payload too large', 413)

  // Read the RAW bytes: the HMAC is over exactly what Meta sent.
  const raw = Buffer.from(await req.arrayBuffer())
  if (raw.length > MAX_BODY_BYTES) return text('Payload too large', 413)

  if (!isValidMetaSignature(raw, req.headers.get('x-hub-signature-256'), appSecret)) {
    console.warn('[whatsapp-webhook] invalid or missing signature')
    return text('Invalid signature', 401)
  }

  let payload: WaPayload
  try {
    payload = JSON.parse(raw.toString('utf8'))
  } catch {
    return text('Bad JSON', 400)
  }

  // Signed but not a WhatsApp event (e.g. another product on the same app): acknowledge and ignore.
  if (payload?.object !== 'whatsapp_business_account' || !Array.isArray(payload.entry)) {
    return text('EVENT_RECEIVED', 200)
  }

  const counts = { messages: 0, statuses: 0, duplicates: 0 }
  const messageTypes: Record<string, number> = {}
  const statusTypes: Record<string, number> = {}

  for (const entry of payload.entry as Array<{ changes?: unknown }>) {
    const changes = Array.isArray(entry?.changes) ? (entry.changes as WaChange[]) : []
    for (const change of changes) {
      if (change?.field !== 'messages' || !change.value) continue

      const messages = Array.isArray(change.value.messages) ? (change.value.messages as WaMessage[]) : []
      for (const m of messages) {
        if (typeof m?.id !== 'string') continue
        if (!markIfNew(`msg:${m.id}`)) { counts.duplicates++; continue }
        counts.messages++
        const t = typeof m.type === 'string' ? m.type : 'unknown'
        messageTypes[t] = (messageTypes[t] ?? 0) + 1
        handleIncomingMessage(m)
      }

      const statuses = Array.isArray(change.value.statuses) ? (change.value.statuses as WaStatus[]) : []
      for (const s of statuses) {
        if (typeof s?.id !== 'string') continue
        const st = typeof s.status === 'string' ? s.status : 'unknown'
        if (!markIfNew(`status:${s.id}:${st}`)) { counts.duplicates++; continue }
        counts.statuses++
        statusTypes[st] = (statusTypes[st] ?? 0) + 1
        handleStatusUpdate(s)
      }
    }
  }

  console.info('[whatsapp-webhook] received', JSON.stringify({ ...counts, messageTypes, statusTypes }))

  // Always 200 for a valid, signed delivery so Meta does not retry it.
  return text('EVENT_RECEIVED', 200)
}

// ── Handlers (no side effects yet) ─────────────────────────────────────────
// Intentionally empty. When adding behaviour here:
//  1. move dedupe to a persistent store first (see lib/whatsapp/dedupe.ts);
//  2. keep work fast or queue it, since Meta expects a quick 200;
//  3. do not log the message object, it holds the sender's phone and text;
//  4. do not send replies without an explicit decision to enable sending.
function handleIncomingMessage(_message: WaMessage): void {}
function handleStatusUpdate(_status: WaStatus): void {}
