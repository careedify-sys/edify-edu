// Meta WhatsApp Cloud API webhook.
//
// GET  /api/whatsapp/webhook  Meta's one-time subscription check
//                             (hub.mode, hub.verify_token, hub.challenge).
// POST /api/whatsapp/webhook  Incoming messages and delivery status updates,
//                             signed with X-Hub-Signature-256.
//
// Env: WHATSAPP_VERIFY_TOKEN, META_APP_SECRET, SUPABASE_SERVICE_ROLE_KEY
// (server-only, never NEXT_PUBLIC_).
//
// This endpoint is RECEIVE-ONLY. It sends no WhatsApp messages. Each signed
// delivery is stored in wa_webhook_events before the 200, then projected into
// wa_contacts, wa_conversations, wa_messages and wa_message_statuses. See
// lib/whatsapp/ingest.ts and docs/whatsapp-platform-implementation-plan.md.
// Logs carry counts and types only: never phone numbers, names, message text,
// media ids or the raw payload.
import { safeEqualStrings } from '@/lib/whatsapp/signature'
import { handleWebhookPost } from '@/lib/whatsapp/ingest'
import { supabaseEventStore } from '@/lib/whatsapp/store'

export const runtime = 'nodejs' // needs node:crypto
export const dynamic = 'force-dynamic'

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
export async function POST(req: Request) {
  const declaredLength = Number(req.headers.get('content-length') ?? '0')
  // Refuse a declared oversize body before reading it.
  if (declaredLength > 1024 * 1024) return text('Payload too large', 413)

  const result = await handleWebhookPost({
    raw: Buffer.from(await req.arrayBuffer()),
    declaredLength,
    signature: req.headers.get('x-hub-signature-256'),
    appSecret: process.env.META_APP_SECRET,
    store: supabaseEventStore(),
  })
  return text(result.body, result.status)
}
