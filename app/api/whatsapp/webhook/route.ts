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
// Phase 4: after a delivery with an inbound message is stored, the rule-based
// auto-replies run (lib/whatsapp/auto-reply.ts). They are OFF unless the owner
// switches on 'automation_enabled', and they send nothing while sending is off.
// With both off this endpoint stays receive-only. Each signed
// delivery is stored in wa_webhook_events before the 200, then projected into
// wa_contacts, wa_conversations, wa_messages and wa_message_statuses. See
// lib/whatsapp/ingest.ts and docs/whatsapp-platform-implementation-plan.md.
// Logs carry counts and types only: never phone numbers, names, message text,
// media ids or the raw payload.
import { safeEqualStrings } from '@/lib/whatsapp/signature'
import { handleWebhookPost } from '@/lib/whatsapp/ingest'
import { supabaseEventStore } from '@/lib/whatsapp/store'
import { Resend } from 'resend'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { supabaseInboxRepo } from '@/lib/whatsapp/inbox-repo'
import { readGraphEnv } from '@/lib/whatsapp/graph'
import { runAutoReplies, supabaseAutoStore, type AutoNotify } from '@/lib/whatsapp/auto-reply'

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

  const buf = Buffer.from(await req.arrayBuffer())
  const raw = buf.toString('utf8')
  const result = await handleWebhookPost({
    raw: buf,
    declaredLength,
    signature: req.headers.get('x-hub-signature-256'),
    appSecret: process.env.META_APP_SECRET,
    store: supabaseEventStore(),
  })
  // Only deliveries that carry a message can need a reply; status updates skip
  // this. Bounded to 6 s so Meta's delivery never waits long, and never fails
  // the 200: the event is already stored.
  if (result.status === 200 && raw.includes('"messages":[')) {
    try {
      const sb = createSupabaseServiceClient()
      const s = await runAutoReplies(supabaseAutoStore(sb), supabaseInboxRepo(sb), readGraphEnv(), fetch, { deadline: Date.now() + 6000, notify: callbackEmail })
      if (s.state === 'ran' && s.seen) console.info('[whatsapp-auto]', JSON.stringify({ seen: s.seen, sent: s.sent, failed: s.failed, skipped: s.skipped }))
    } catch (e) {
      console.warn('[whatsapp-auto] failed', (e as { code?: string })?.code ?? (e as Error)?.name ?? 'error')
    }
  }
  return text(result.body, result.status)
}

// "Call Me": tell the team by email. The number goes to the team inbox only,
// never to logs.
const callbackEmail: AutoNotify = async ({ conversationId, phone }) => {
  const key = process.env.RESEND_API_KEY
  if (!key) return
  await new Resend(key).emails.send({
    from: 'edifyedu.in Leads <leads@edifyedu.in>',
    to: [process.env.LEAD_EMAIL_PRIMARY || 'hello@edifyedu.in'],
    subject: 'WhatsApp callback requested',
    text: `A student replied "Call Me" to a referral campaign.
Number: ${phone ?? 'not shared'}
Thread: https://edifyedu.in/leads/whatsapp?c=${conversationId}`,
  })
}
