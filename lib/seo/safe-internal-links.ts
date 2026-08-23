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
import VERIFY_SLUG_LIST from '@/lib/data/verify-slugs.json'
import VERIFY_OVERRIDE_FILE from '@/lib/data/verify-slug-overrides.json'
import type { University, Program } from '@/lib/data'
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
