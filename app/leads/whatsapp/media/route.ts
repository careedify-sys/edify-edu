// Files for WhatsApp: upload, view a stored file, view a received file.
//   POST /leads/whatsapp/media            multipart: purpose, file  (upload)
//   GET  /leads/whatsapp/media?file=<id>  a stored file (header image, brochure)
//   GET  /leads/whatsapp/media?message=<id>[&download=1]  a file a student sent
//
// Signed-in staff only (same session check as the server actions; middleware
// guards /leads too). Files stream with no-store and are never cached or made
// public. A received file is fetched from Meta with the token on the server
// and passed through; it is not stored here. Uploads pass through this
// function, so they are capped at 4 MB (Vercel's request limit is 4.5 MB).
import { NextRequest, NextResponse } from 'next/server'
import { createSupabaseServiceClient } from '@/lib/supabase/service'
import { currentActor } from '@/lib/whatsapp/admin-session'
import { can } from '@/lib/whatsapp/access'
import { supabaseCampaignRepo, type CampaignRepo } from '@/lib/whatsapp/campaign-repo'
import { mockCampaignRepo } from '@/lib/whatsapp/campaign-mock'
import { readGraphEnv } from '@/lib/whatsapp/graph'
import { downloadMedia } from '@/lib/whatsapp/graph-templates'
import { uploadFile } from '@/lib/whatsapp/template-service'
import { MAX_UPLOAD_BYTES } from '@/lib/whatsapp/template-rules'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const NO_STORE = { 'Cache-Control': 'private, no-store, max-age=0', 'X-Robots-Tag': 'noindex, nofollow', 'X-Content-Type-Options': 'nosniff' }
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const g = globalThis as unknown as { __waCampaignMock?: CampaignRepo }
const mock = () => process.env.WA_INBOX_MOCK === '1' && process.env.NODE_ENV !== 'production'
const repo = () => (mock() ? (g.__waCampaignMock ??= mockCampaignRepo()) : supabaseCampaignRepo(createSupabaseServiceClient()))
const err = (error: string, status: number) => NextResponse.json({ ok: false, error }, { status, headers: NO_STORE })

// Only these types are ever shown inline; everything else downloads.
const INLINE = new Set(['image/jpeg', 'image/png', 'image/webp', 'application/pdf'])
// A file opened directly runs with no scripts and no access to the site.
// PDFs are left out: browsers refuse to show a PDF in a sandboxed page.
const sandbox = (mime: string): Record<string, string> => (mime === 'application/pdf' ? {} : { 'Content-Security-Policy': "sandbox; default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'" })
function disposition(name: string, inline: boolean) {
  const safe = name.replace(/[^\w.\- ]+/g, '_').slice(0, 100) || 'file'
  return `${inline ? 'inline' : 'attachment'}; filename="${safe}"`
}

export async function POST(req: NextRequest) {
  const actor = await currentActor()
  if (!actor) return err('Sign in again.', 401)
  const len = Number(req.headers.get('content-length') ?? 0)
  if (len > MAX_UPLOAD_BYTES + 64 * 1024) return err('Files can be at most 4 MB. Compress the file and try again.', 413)
  let form: FormData
  try { form = await req.formData() } catch { return err('Could not read the upload.', 400) }
  const purpose = form.get('purpose') === 'template_header' ? 'template_header' : form.get('purpose') === 'outbound' ? 'outbound' : null
  const file = form.get('file')
  if (!purpose || !(file instanceof Blob)) return err('Choose a file.', 400)
  if (file.size > MAX_UPLOAD_BYTES) return err('Files can be at most 4 MB. Compress the file and try again.', 413)
  try {
    const bytes = new Uint8Array(await file.arrayBuffer())
    const name = typeof (file as File).name === 'string' ? (file as File).name : 'file'
    const r = await uploadFile(repo(), actor, purpose, name, file.type, bytes)
    return NextResponse.json(r, { status: r.ok ? 200 : 400, headers: NO_STORE })
  } catch (e) {
    console.warn('[wa-media] upload failed', (e as { code?: string })?.code ?? 'error')
    return err('The upload failed. Try again.', 500)
  }
}

export async function GET(req: NextRequest) {
  const actor = await currentActor()
  if (!actor || !can(actor, 'view')) return err('Sign in again.', 401)
  const fileId = req.nextUrl.searchParams.get('file')
  const messageId = req.nextUrl.searchParams.get('message')
  const download = req.nextUrl.searchParams.get('download') === '1'
  try {
    if (fileId) {
      if (!UUID.test(fileId)) return err('Unknown file.', 404)
      const r = repo()
      const m = await r.getMedia(fileId)
      const bytes = m ? await r.mediaBytes(fileId) : null
      if (!m || !bytes) return err('Unknown file.', 404)
      return new NextResponse(bytes as unknown as BodyInit, { headers: { ...NO_STORE, ...sandbox(m.mime), 'Content-Type': m.mime, 'Content-Disposition': disposition(m.file_name, !download && INLINE.has(m.mime)) } })
    }
    if (messageId) {
      if (!UUID.test(messageId) || mock()) return err(mock() ? 'Received files cannot be opened in mock mode.' : 'Unknown file.', 404)
      const sb = createSupabaseServiceClient()
      const { data, error } = await sb.from('wa_messages').select('direction,type,payload').eq('id', messageId).maybeSingle()
      if (error || !data || data.direction !== 'inbound') return err('Unknown file.', 404)
      const type = String(data.type)
      const media = (data.payload as Record<string, any> | null)?.[type]
      const mediaId = typeof media?.id === 'string' ? media.id : null
      if (!mediaId || !['image', 'document', 'audio', 'video', 'sticker'].includes(type)) return err('This message has no file.', 404)
      const d = await downloadMedia(readGraphEnv(), mediaId)
      if (!d.ok) return err(d.error, 502)
      const name = typeof media?.filename === 'string' ? media.filename : `${type}-${messageId.slice(0, 8)}`
      return new NextResponse(d.bytes as unknown as BodyInit, { headers: { ...NO_STORE, ...sandbox(d.mime), 'Content-Type': d.mime, 'Content-Disposition': disposition(name, !download && INLINE.has(d.mime)) } })
    }
    return err('Nothing to show.', 400)
  } catch (e) {
    console.warn('[wa-media] get failed', (e as { code?: string })?.code ?? 'error')
    return err('Could not load the file. Try again.', 500)
  }
}
