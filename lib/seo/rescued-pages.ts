// lib/seo/rescued-pages.ts
// Legacy re-export. The /programs indexing allowlist now lives in
// lib/seo/should-index.ts (PROGRAMS_INDEX_ALLOWLIST). Kept here so existing
// imports and the pre-commit comment referencing RESCUED_PROGRAM_PATHS stay
// wired to a single source of truth.

import { PROGRAMS_INDEX_ALLOWLIST } from './should-index'

// Only three-segment /programs/{prog}/{spec} entries are "force-added" to
// the sitemap; two-segment /programs/{prog} hubs come in via valid-urls.json.
export const RESCUED_PROGRAM_PATHS: readonly string[] = PROGRAMS_INDEX_ALLOWLIST.filter(
  p => p.split('/').length === 4,
)
