// Server-only helpers for the Meta WhatsApp Cloud API webhook.
// Signature: Meta signs the raw request body with HMAC-SHA256 using the app
// secret and sends it as `X-Hub-Signature-256: sha256=<hex>`.
import { createHmac, timingSafeEqual } from 'crypto'

if (typeof window !== 'undefined') {
  throw new Error('lib/whatsapp/signature.ts must not be imported in the browser')
}

const SIG_PREFIX = 'sha256='
const HEX_SHA256 = /^[0-9a-f]{64}$/i

/**
 * Verify X-Hub-Signature-256 against the exact raw bytes Meta sent.
 * Never pass a re-serialised JSON body here: any whitespace or key-order
 * change breaks the HMAC.
 */
export function isValidMetaSignature(
  rawBody: Buffer,
  signatureHeader: string | null,
  appSecret: string,
): boolean {
  if (!signatureHeader || !appSecret) return false
  if (!signatureHeader.startsWith(SIG_PREFIX)) return false

  const receivedHex = signatureHeader.slice(SIG_PREFIX.length).trim()
  if (!HEX_SHA256.test(receivedHex)) return false

  const expected = createHmac('sha256', appSecret).update(rawBody).digest()
  const received = Buffer.from(receivedHex, 'hex')
  if (received.length !== expected.length) return false
  return timingSafeEqual(received, expected)
}

/** Constant-time string comparison for the GET verify token. */
export function safeEqualStrings(a: string, b: string): boolean {
  const ab = Buffer.from(a, 'utf8')
  const bb = Buffer.from(b, 'utf8')
  // Compare equal-length buffers so the timing does not leak where they differ.
  // A length mismatch still returns false, after doing the same work.
  const len = Math.max(ab.length, bb.length, 1)
  const pa = Buffer.alloc(len)
  const pb = Buffer.alloc(len)
  ab.copy(pa)
  bb.copy(pb)
  return timingSafeEqual(pa, pb) && ab.length === bb.length
}
