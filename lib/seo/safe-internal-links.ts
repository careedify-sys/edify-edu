// lib/seo/safe-internal-links.ts
// Emits internal links that are guaranteed not to 404 and guaranteed not to
// point at a noindex page.
//
// WHY THIS EXISTS (2026-08-23):
// A GSC read found 229 of 242 programme hubs had zero inbound internal links.
// Nothing on the site pointed at them, so Googlebot reached them via sitemap
// only. Adding links by hand is unsafe here because two independent gates can
// make a hub URL unlinkable:
//
//   1. middleware.ts returns a hard 404 for /universities/{uni}/{prog} when
//      {uni} is absent from lib/data/programme-allowlist-{prog}.json.
//   2. scripts/prune-noindex-hub-urls.js strips hubs that fail
//      shouldIndexProgrammeHub() out of valid-urls.json. Those still return
//      200 but carry robots noindex, so a link into them buys nothing.
//
// lib/data/valid-urls.json is the intersection of both gates: a path is in it
// only if it resolves AND is indexable. Gating every emitted href on that set
// means this module cannot produce a broken or wasted link, and it stays
// correct automatically as the prebuild regenerates the file.
//
// Do not replace the valid-urls check with a u.programs lookup. u.programs is
// the input to those gates, not the output, and using it is exactly how the
// phantom-hub defects got shipped before.

import VALID_URLS from '@/lib/data/valid-urls.json'
import MA_ALLOWLIST from '@/lib/data/programme-allowlist-ma.json'
import BCOM_ALLOWLIST from '@/lib/data/programme-allowlist-bcom.json'
import MCOM_ALLOWLIST from '@/lib/data/programme-allowlist-mcom.json'
import MBA_ALLOWLIST from '@/lib/data/programme-allowlist-mba.json'
import BBA_ALLOWLIST from '@/lib/data/programme-allowlist-bba.json'
import BCA_ALLOWLIST from '@/lib/data/programme-allowlist-bca.json'
import MCA_ALLOWLIST from '@/lib/data/programme-allowlist-mca.json'
import BA_ALLOWLIST from '@/lib/data/programme-allowlist-ba.json'
import MSC_ALLOWLIST from '@/lib/data/programme-allowlist-msc.json'
import BSC_ALLOWLIST from '@/lib/data/programme-allowlist-bsc.json'
import SPEC_ALLOWLIST_RAW from '@/lib/data/spec-allowlist.json'
import VERIFY_SLUG_LIST from '@/lib/data/verify-slugs.json'
import VERIFY_OVERRIDE_FILE from '@/lib/data/verify-slug-overrides.json'
import { getUniversityById, type University, type Program } from '@/lib/data'
import { programmeSlug } from '@/lib/seo/resolve-programme'

const VALID = new Set(VALID_URLS as string[])

// Mirrors PROGRAMME_HUB_ALLOWLISTS in middleware.ts. Any hub whose programme
// appears here 404s at the edge when the university is not in the set, so a
// link must never be rendered without checking it.
const HUB_ALLOWLISTS: Record<string, Set<string>> = {
  ma: new Set(MA_ALLOWLIST as string[]),
  bcom: new Set(BCOM_ALLOWLIST as string[]),
  mcom: new Set(MCOM_ALLOWLIST as string[]),
  mba: new Set(MBA_ALLOWLIST as string[]),
  bba: new Set(BBA_ALLOWLIST as string[]),
  bca: new Set(BCA_ALLOWLIST as string[]),
  mca: new Set(MCA_ALLOWLIST as string[]),
  // Added to middleware in slice 6 (2026-08-29) but never mirrored here.
  ba: new Set(BA_ALLOWLIST as string[]),
  msc: new Set(MSC_ALLOWLIST as string[]),
  bsc: new Set(BSC_ALLOWLIST as string[]),
}

/**
 * True when `path` is live AND indexable. Use for SEO link building, where a
 * link into a noindex page buys nothing.
 */
export function isLinkable(path: string): boolean {
  return VALID.has(path)
}

/**
 * True when the hub returns 200, whether or not it is indexable. Use for
 * user-facing navigation, where a working noindex page is still worth linking
 * but a 404 is not.
 *
 * A hub in an allowlist resolves even when pruned from valid-urls by the
 * thin-page gate. A hub on an ungated route (BA, MSc, BSc) is only trusted
 * when valid-urls vouches for it, since those routes notFound() on missing
 * programDetails and no edge allowlist exists to consult.
 */
export function hubResolves(uniId: string, program: Program): boolean {
  const slug = programmeSlug(program)
  const path = `/universities/${uniId}/${slug}`
  if (VALID.has(path)) return true
  const allowlist = HUB_ALLOWLISTS[slug]
  return allowlist ? allowlist.has(uniId) : false
}

/** Programmes of `u` whose hub returns 200. Safe for navigation menus. */
export function getResolvableProgrammes(u: University): Program[] {
  return u.programs.filter(p => hubResolves(u.id, p))
}

// ── /verify/{slug} ──────────────────────────────────────────────────────────
// The verify route keys off Supabase university slugs, not lib/data.ts ids,
// and the two disagree for 63 of 128 universities. Linking to /verify/{u.id}
// therefore 404s for roughly half the catalogue, which is what Search Console
// reported on 2026-08-23.
//
// VERIFY_SLUG_OVERRIDES maps id -> the slug that actually exists, built by
// exact normalised name match against the Supabase universities table. Never
// extend it by fuzzy or token matching: that approach mapped
// jain-university-online onto arka-jain-university-online, a different
// institution.
const VERIFY_SLUGS = new Set(VERIFY_SLUG_LIST as string[])
const VERIFY_OVERRIDES = (VERIFY_OVERRIDE_FILE as { map: Record<string, string> }).map

/**
 * The verify URL for a university, or null when no verify page exists.
 *
 * Returning null is the correct outcome for 24 universities that Supabase has
 * no verify record for. Render the link conditionally rather than falling back
 * to `/verify/${u.id}`, which is the bug this replaces.
 */
export function getVerifyPage(uniId: string): string | null {
  if (VERIFY_SLUGS.has(uniId)) return `/verify/${uniId}`
  const mapped = VERIFY_OVERRIDES[uniId]
  if (mapped && VERIFY_SLUGS.has(mapped)) return `/verify/${mapped}`
  return null
}

// The reverse direction: a /verify/{supabase-slug} page linking back into the
// site. VerifyHero carried its own hand-written SLUG_MAP for this and
// VerifyInterlinks used the Supabase slug as if it were a site id, so
// /verify/vellore-institute-of-technology-online linked
// /universities/vellore-institute-of-technology-online/bcom: an old slug that
// redirects, into a hub the allowlist 404s. Semrush, 27 Oct 2026.
// Only the exact-name-matched overrides file is trusted here. The old SLUG_MAP
// also sent amity-university-rajasthan-online to amity-university-online, a
// different institution.
const VERIFY_SLUG_TO_SITE_ID: Record<string, string> = Object.fromEntries(
  Object.entries(VERIFY_OVERRIDES).map(([id, slug]) => [slug, id]),
)

/** The lib/data.ts university for a verify slug, or null when none is known. */
export function getUniversityForVerifySlug(verifySlug: string): University | null {
  const id = VERIFY_SLUG_TO_SITE_ID[verifySlug] ?? verifySlug
  return getUniversityById(id) ?? null
}

export interface SiblingLink {
  href: string
  program: Program
  label: string
}

/**
 * Sibling programme hubs for one university, minus the one being viewed.
 * Returns only hubs that pass isLinkable(), so the caller never has to think
 * about the allowlist or the thin-page gate.
 */
export function getSiblingProgrammes(
  u: University,
  current: Program,
): SiblingLink[] {
  const out: SiblingLink[] = []
  for (const program of u.programs) {
    if (program === current) continue
    const href = `/universities/${u.id}/${programmeSlug(program)}`
    if (!isLinkable(href)) continue
    out.push({ href, program, label: `Online ${program}` })
  }
  return out
}

/**
 * The university overview page. Linkable in almost every case, but checked
 * anyway so callers can render the block unconditionally.
 */
export function getUniversityOverviewLink(u: University): string | null {
  const href = `/universities/${u.id}`
  return isLinkable(href) ? href : null
}

// ── Sibling specialisations ─────────────────────────────────────────────────
// A crawl of the live site on 2026-09-13 found 1,919 university specialisation
// pages averaging 1.1 inbound contextual links: 404 had none and 953 had
// exactly one, always their programme hub. That is the same starvation the
// SiblingProgrammes block fixed for hubs in August, one level down the tree,
// and it is the largest remaining block of thin-linked pages on the site.
//
// Each spec page now links to its siblings under the same (university,
// programme). The offset is seeded by the current slug rather than taking the
// first N, so inbound links spread across the whole group instead of piling
// onto whichever specialisations sort first. Same reasoning as
// getPeerUniversities in lib/data.ts.
//
// Gated on isLinkable(), so a sibling that is noindex or does not resolve is
// never linked. Measurement and method: audits/internal-link-graph.md

function rotationOffset(seed: string, mod: number): number {
  let h = 0
  for (let i = 0; i < seed.length; i++) h = (Math.imul(h, 31) + seed.charCodeAt(i)) >>> 0
  return mod > 0 ? h % mod : 0
}

export interface SpecLink { href: string; slug: string; name: string }

/**
 * Sibling specialisation pages for one (university, programme), excluding the
 * one being viewed. `candidates` must already be resolver-canonical slugs, so
 * pass the same list the programme hub renders.
 */
export function getSiblingSpecialisations(
  uniId: string,
  programSlug: string,
  currentSlug: string,
  candidates: { slug: string; name: string }[],
  count = 8,
): SpecLink[] {
  const pool = candidates
    .filter(c => c.slug !== currentSlug)
    .map(c => ({ href: `/universities/${uniId}/${programSlug}/${c.slug}`, slug: c.slug, name: c.name }))
    .filter(c => isLinkable(c.href))
  if (pool.length <= count) return pool
  const start = rotationOffset(currentSlug, pool.length)
  const out: SpecLink[] = []
  for (let i = 0; i < count; i++) out.push(pool[(start + i) % pool.length])
  return out
}

// ── Specialisation hrefs ────────────────────────────────────────────────────
// Mirrors section 2 of middleware.ts for /universities/{u}/{p}/{s}: the hub
// allowlist gates the whole subtree, the alias table 308s a slug onto its
// canonical form, and anything outside the accepted set is a hard 404.
// Building a spec href by slugifying a display name skipped all three: the
// Semrush audit of 27 Oct 2026 found 338 links into 308s (human-resource-
// management -> hr-management) and 63 into 404s (a /programs/mba/{spec} hub
// linking universities that call the spec something else).
const SPEC_ALLOWLIST = SPEC_ALLOWLIST_RAW as unknown as { s: string[]; m: Record<string, number[]>; r: Record<string, number[]> }

/**
 * The URL a specialisation link should point at: the canonical slug when
 * `specSlug` is an alias, the path itself when it resolves, or null when it
 * would 404. Never returns a URL that redirects.
 */
export function resolveSpecHref(uniId: string, progSlug: string, specSlug: string): string | null {
  const allowlist = HUB_ALLOWLISTS[progSlug]
  // Middleware leaves programme slugs outside its ten allowlists ungated.
  if (!allowlist) return `/universities/${uniId}/${progSlug}/${specSlug}`
  if (!allowlist.has(uniId)) return null
  const pairKey = `${uniId}|${progSlug}`
  const wanted = specSlug.toLowerCase()
  let slug: string | null = null
  const alias = SPEC_ALLOWLIST.r[pairKey]
  if (alias) for (let i = 0; i < alias.length; i += 2) if (SPEC_ALLOWLIST.s[alias[i]] === wanted) { slug = SPEC_ALLOWLIST.s[alias[i + 1]]; break }
  if (!slug && (SPEC_ALLOWLIST.m[pairKey] ?? []).some(i => SPEC_ALLOWLIST.s[i] === wanted)) slug = wanted
  return slug ? `/universities/${uniId}/${progSlug}/${slug}` : null
}
