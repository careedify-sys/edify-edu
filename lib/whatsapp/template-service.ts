// Templates with image or PDF headers, edit and delete (Phase 4). Server-only
// and framework-free, like campaign-service.ts. Nothing here sends a message.
import { can, type Action, type Actor } from './access'
import type { CampaignRepo, MediaRow, TemplateRow } from './campaign-repo'
import type { GraphEnv } from './graph'
import {
  createTemplate, deleteTemplate, draftComponents, editTemplate, templateStatus, uploadHeaderSample, uploadMedia,
  validateDraft, type TemplateDraft,
} from './graph-templates'
import { checkUpload } from './media-check'

type Result<T = {}> = ({ ok: true } & T) | { ok: false; error: string }
const bad = (error: string): { ok: false; error: string } => ({ ok: false, error })
const gate = (actor: Actor | null, a: Action) => (can(actor, a) ? null : bad('You do not have permission for this'))
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
const EDITABLE = new Set(['APPROVED', 'REJECTED', 'PAUSED'])

// ── Files ───────────────────────────────────────────────────────────────────
// Template header files need template_submit (owner); files for the inbox
// need send.
export async function uploadFile(repo: CampaignRepo, actor: Actor | null, purpose: 'template_header' | 'outbound',
  name: string, mime: string, bytes: Uint8Array): Promise<Result<{ id: string; kind: 'image' | 'document'; fileName: string }>> {
  const g = gate(actor, purpose === 'template_header' ? 'template_submit' : 'send'); if (g) return g
  const c = checkUpload(purpose, name, mime, bytes)
  if (!c.ok) return c
  const { id } = await repo.saveMedia({ purpose, kind: c.file.kind, file_name: c.file.fileName, mime: c.file.mime, size_bytes: c.file.size, sha256: c.file.sha256, created_by: actor!.id }, bytes)
  await repo.audit(actor!.id, 'media_upload', id, { purpose, kind: c.file.kind, size: c.file.size })
  return { ok: true, id, kind: c.file.kind, fileName: c.file.fileName }
}

export async function listFiles(repo: CampaignRepo, actor: Actor | null, purpose: 'template_header' | 'outbound') {
  const g = gate(actor, 'campaign_view'); if (g) return g
  const rows = await repo.mediaFiles(purpose)
  return { ok: true as const, files: rows.map(r => ({ id: r.id, kind: r.kind, file_name: r.file_name, size_bytes: r.size_bytes, created_at: r.created_at })) }
}

// A Meta media id for a stored file, uploading it when there is none or it
// expires within 2 days (Meta keeps uploads 30 days; 29 is recorded).
export async function ensureMetaMediaId(repo: CampaignRepo, env: GraphEnv, f: typeof fetch, fileId: string, now = Date.now()):
  Promise<{ ok: true; mediaId: string; file: MediaRow } | { ok: false; error: string }> {
  const m = await repo.getMedia(fileId)
  if (!m) return bad('The file is missing.')
  if (m.meta_media_id && m.meta_media_expires && Date.parse(m.meta_media_expires) > now + 2 * 86_400_000) return { ok: true, mediaId: m.meta_media_id, file: m }
  const bytes = await repo.mediaBytes(fileId)
  if (!bytes) return bad('The stored file could not be read.')
  const up = await uploadMedia(env, bytes, m.mime, m.file_name, f)
  if (!up.ok) return bad(`Meta did not accept the file: ${up.error}`)
  await repo.setMediaMetaId(fileId, up.id, new Date(now + 29 * 86_400_000).toISOString())
  return { ok: true, mediaId: up.id, file: m }
}

// ── Drafts ──────────────────────────────────────────────────────────────────
export type DraftInput = TemplateDraft & { headerFileId?: string | null }

function cleanDraft(d: DraftInput): TemplateDraft {
  return {
    name: String(d?.name ?? '').trim(), language: String(d?.language ?? ''), category: d?.category,
    header: typeof d?.header === 'string' ? d.header : undefined, body: String(d?.body ?? ''), footer: typeof d?.footer === 'string' ? d.footer : undefined,
    buttons: Array.isArray(d?.buttons) ? d.buttons.slice(0, 11).map(b => b?.type === 'URL'
      ? { type: 'URL' as const, text: String(b.text ?? ''), url: String((b as { url?: string }).url ?? '') }
      : { type: 'QUICK_REPLY' as const, text: String(b?.text ?? '') }) : [],
  }
}

// Uploads the header file to Meta for the example handle. Returns the draft
// with headerMedia set, or an error.
async function withHeader(repo: CampaignRepo, env: GraphEnv, f: typeof fetch, draft: TemplateDraft, fileId: string | null | undefined):
  Promise<{ ok: true; draft: TemplateDraft; fileId: string | null } | { ok: false; error: string }> {
  if (!fileId) return { ok: true, draft, fileId: null }
  if (!UUID.test(fileId)) return bad('Unknown header file.')
  const m = await repo.getMedia(fileId)
  if (!m || m.purpose !== 'template_header') return bad('Unknown header file.')
  const bytes = await repo.mediaBytes(fileId)
  if (!bytes) return bad('The header file could not be read. Upload it again.')
  const h = await uploadHeaderSample(env, bytes, m.mime, m.file_name, f)
  if (!h.ok) return bad(`Meta did not accept the header file: ${h.error}`)
  return { ok: true, draft: { ...draft, header: undefined, headerMedia: { kind: m.kind, handle: h.handle } }, fileId }
}

export async function submitTemplate(repo: CampaignRepo, actor: Actor | null, env: GraphEnv, f: typeof fetch, d: DraftInput): Promise<Result<{ status: string; category: string }>> {
  const g = gate(actor, 'template_submit'); if (g) return g
  let draft = cleanDraft(d)
  // Validate the text first so a bad draft never uploads a file.
  const pre = validateDraft(d?.headerFileId ? { ...draft, header: undefined } : draft)
  if (pre) return bad(pre)
  const wh = await withHeader(repo, env, f, draft, d?.headerFileId)
  if (!wh.ok) return wh
  draft = wh.draft
  const invalid = validateDraft(draft)
  if (invalid) return bad(invalid)
  const r = await createTemplate(env, draft, f)
  if (!r.ok) return bad(`Meta did not accept it: ${r.error}`)
  // Meta may move a template to another category; store what Meta says.
  await repo.saveTemplate({ meta_id: r.meta_id, name: draft.name, language: draft.language, category: r.category, status: r.status, components: draftComponents(draft), reason: null, quality: null, submitted_by: actor!.id, header_file_id: wh.fileId })
  await repo.audit(actor!.id, 'template_submit', r.meta_id, { name: draft.name, category: r.category, header: draft.headerMedia?.kind ?? (draft.header ? 'text' : null) })
  return { ok: true, status: r.status, category: r.category }
}

// Edit keeps the name, language and category. Meta limits edits of an
// approved template to one a day and ten in 30 days, and reviews it again.
export async function editTemplateDraft(repo: CampaignRepo, actor: Actor | null, env: GraphEnv, f: typeof fetch, templateId: string, d: DraftInput): Promise<Result<{ status: string }>> {
  const g = gate(actor, 'template_submit'); if (g) return g
  const t = UUID.test(templateId) ? await repo.getTemplate(templateId) : null
  if (!t || !t.meta_id) return bad('Unknown template.')
  if (!EDITABLE.has(t.status)) return bad(`Meta only allows editing approved, rejected or paused templates. This one is ${t.status.toLowerCase()}.`)
  if (await repo.activeCampaignsUsing(t.id)) return bad('A campaign that is not finished uses this template. Finish or cancel it first, so students do not get a changed message mid-campaign.')
  let draft = cleanDraft({ ...d, name: t.name, language: t.language, category: t.category as TemplateDraft['category'] })
  const pre = validateDraft(d?.headerFileId ? { ...draft, header: undefined } : draft)
  if (pre) return bad(pre)
  const wh = await withHeader(repo, env, f, draft, d?.headerFileId)
  if (!wh.ok) return wh
  draft = wh.draft
  const invalid = validateDraft(draft)
  if (invalid) return bad(invalid)
  const components = draftComponents(draft)
  const r = await editTemplate(env, t.meta_id, components, f)
  if (!r.ok) return bad(`Meta did not accept the edit: ${r.error}`)
  const live = await templateStatus(env, t.meta_id, f)
  const status = live?.status ?? 'PENDING'
  await repo.updateTemplate(t.id, { components, status, reason: null, header_file_id: wh.fileId })
  await repo.audit(actor!.id, 'template_edit', t.meta_id, { name: t.name, status })
  return { ok: true, status }
}

export async function removeTemplate(repo: CampaignRepo, actor: Actor | null, env: GraphEnv, f: typeof fetch, templateId: string, confirmName: string): Promise<Result> {
  const g = gate(actor, 'template_submit'); if (g) return g
  const t = UUID.test(templateId) ? await repo.getTemplate(templateId) : null
  if (!t || !t.meta_id) return bad('Unknown template.')
  if (String(confirmName ?? '').trim() !== t.name) return bad(`Type the template name (${t.name}) to confirm.`)
  if (t.status === 'DELETED' || t.status === 'PENDING_DELETION') return bad('This template is already deleted.')
  if (await repo.activeCampaignsUsing(t.id)) return bad('A campaign that is not finished uses this template. Finish or cancel it first.')
  const r = await deleteTemplate(env, t.name, t.meta_id, f)
  if (!r.ok) return bad(`Meta did not delete it: ${r.error}`)
  await repo.updateTemplate(t.id, { status: 'DELETED' })
  await repo.audit(actor!.id, 'template_delete', t.meta_id, { name: t.name })
  return { ok: true }
}

// A template made in WhatsApp Manager with an image or PDF header needs the
// same kind of file here before a campaign can send it.
export async function attachHeaderFile(repo: CampaignRepo, actor: Actor | null, templateId: string, fileId: string | null): Promise<Result> {
  const g = gate(actor, 'template_submit'); if (g) return g
  const t = UUID.test(templateId) ? await repo.getTemplate(templateId) : null
  if (!t) return bad('Unknown template.')
  const fmt = headerFormat(t)
  if (fmt !== 'IMAGE' && fmt !== 'DOCUMENT') return bad('This template has no image or PDF header.')
  if (fileId !== null) {
    const m = UUID.test(String(fileId)) ? await repo.getMedia(fileId) : null
    if (!m || m.purpose !== 'template_header') return bad('Unknown file.')
    if ((fmt === 'IMAGE') !== (m.kind === 'image')) return bad(fmt === 'IMAGE' ? 'This template needs an image.' : 'This template needs a PDF.')
  }
  if (await repo.activeCampaignsUsing(t.id)) return bad('A campaign that is not finished uses this template. Finish or cancel it first.')
  await repo.updateTemplate(t.id, { header_file_id: fileId })
  await repo.audit(actor!.id, 'template_header_file', t.meta_id, { attached: fileId !== null })
  return { ok: true }
}

export function headerFormat(t: Pick<TemplateRow, 'components'>): string | null {
  const h = (Array.isArray(t.components) ? t.components : []).find((c: any) => String(c?.type).toUpperCase() === 'HEADER') as any
  return h ? String(h.format ?? 'TEXT').toUpperCase() : null
}
