// Checks an uploaded file before it is stored or sent to Meta. Server-only.
// The browser's declared type is not trusted: the first bytes must match it.
import { createHash } from 'node:crypto'
import { HEADER_LIMITS, MAX_UPLOAD_BYTES, OUTBOUND_MIMES } from './template-rules'

if (typeof window !== 'undefined') {
  throw new Error('lib/whatsapp/media-check.ts must not be imported in the browser')
}

type Family = 'png' | 'jpeg' | 'pdf' | 'zip' | 'ole' | 'text' | 'unknown'

export function sniff(b: Uint8Array): Family {
  const h = (i: number) => b[i] ?? -1
  if (h(0) === 0x89 && h(1) === 0x50 && h(2) === 0x4e && h(3) === 0x47) return 'png'
  if (h(0) === 0xff && h(1) === 0xd8 && h(2) === 0xff) return 'jpeg'
  if (h(0) === 0x25 && h(1) === 0x50 && h(2) === 0x44 && h(3) === 0x46) return 'pdf'
  if (h(0) === 0x50 && h(1) === 0x4b && h(2) === 0x03 && h(3) === 0x04) return 'zip'
  if (h(0) === 0xd0 && h(1) === 0xcf && h(2) === 0x11 && h(3) === 0xe0) return 'ole'
  const head = b.subarray(0, Math.min(b.length, 4096))
  if (head.length && !head.includes(0)) {
    try { new TextDecoder('utf-8', { fatal: true }).decode(head); return 'text' } catch { /* not text */ }
  }
  return 'unknown'
}

const FAMILY_OF: Record<string, Family> = {
  'image/png': 'png', 'image/jpeg': 'jpeg', 'application/pdf': 'pdf', 'text/plain': 'text',
  'application/msword': 'ole', 'application/vnd.ms-excel': 'ole', 'application/vnd.ms-powerpoint': 'ole',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': 'zip',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': 'zip',
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': 'zip',
}

export type CheckedFile = { kind: 'image' | 'document'; mime: string; fileName: string; size: number; sha256: string }

export function checkUpload(purpose: 'template_header' | 'outbound', name: string, mime: string, bytes: Uint8Array): { ok: true; file: CheckedFile } | { ok: false; error: string } {
  const fileName = name.replace(/[\\/\x00-\x1f]/g, '').trim().slice(0, 120) || 'file'
  if (!bytes.byteLength) return { ok: false, error: 'The file is empty.' }
  if (bytes.byteLength > MAX_UPLOAD_BYTES) return { ok: false, error: 'Files can be at most 4 MB. Compress the image or PDF and try again.' }
  let kind: 'image' | 'document'
  if (purpose === 'template_header') {
    if ((HEADER_LIMITS.image.mimes as readonly string[]).includes(mime)) kind = 'image'
    else if ((HEADER_LIMITS.document.mimes as readonly string[]).includes(mime)) kind = 'document'
    else return { ok: false, error: `Template headers take an image (${HEADER_LIMITS.image.label}) or a ${HEADER_LIMITS.document.label}.` }
  } else {
    const k = OUTBOUND_MIMES[mime]
    if (!k) return { ok: false, error: 'This file type cannot be sent on WhatsApp. Use JPEG, PNG, PDF, Word, Excel, PowerPoint or a text file.' }
    kind = k
  }
  if (sniff(bytes) !== FAMILY_OF[mime]) return { ok: false, error: 'The file content does not match its type. Save it again as a real JPEG, PNG or PDF.' }
  return { ok: true, file: { kind, mime, fileName, size: bytes.byteLength, sha256: createHash('sha256').update(bytes).digest('hex') } }
}
