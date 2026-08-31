// lib/seo/mode-unverified.ts
//
// Universities whose UGC-DEB entitlement is sourced only from the August 2026
// recognition PDFs. Those PDFs list programmes but carry NO mode column, so
// they cannot tell Online mode from ODL. The DEB portal register at
// deb.ugc.ac.in/Home/HEI_Prog_List is the only source that states the mode.
//
// When the portal does not list the university and the university's own site
// advertises no online delivery, the record is unsafe to index and unsafe to
// describe as online. Every page under that slug goes noindex, follow, drops
// out of the sitemap, loses its Course JSON-LD, and renders a status note
// instead of programme marketing copy.
//
// This module deliberately has NO imports. lib/seo/should-index.ts pulls in the
// fee resolver and the page-content loader, which are server-only; client
// components such as UniHero need the gate too, so the set lives here on its
// own and should-index re-exports it.
//
// reva-university-online (2026-08-31): REVA contacted EdifyEdu to say it runs
// no MBA in online mode. The DEB portal does not list REVA, and reva.edu.in
// advertises on-campus programmes only. The record was added from main-list
// PDF row #48 in commit a4ed233 three days earlier.
//
// To clear a university from this list, you need a written entitlement that
// states Online mode, or a DEB portal row showing it. A programme name in a
// PDF is not enough. That is what put REVA here.

export const MODE_UNVERIFIED_UNIS: ReadonlySet<string> = new Set([
  'reva-university-online',
])

/** False when the university's delivery mode is unverified. */
export function shouldIndexUniversity(uniId: string): boolean {
  return !MODE_UNVERIFIED_UNIS.has(uniId)
}

/**
 * "Online " for a normal university, "" for a mode-unverified one. Use inside
 * the title and schema template literals that hardcode "Online {program}":
 * `${titleName} ${onlinePrefix(u.id)}MBA ${year}`.
 */
export function onlinePrefix(uniId: string): string {
  return shouldIndexUniversity(uniId) ? 'Online ' : ''
}

/**
 * Meta description for a mode-unverified university. Every route in
 * app/universities builds a description that opens "Online {program} from
 * {university}" and closes "UGC-DEB approved", so each one needs the same
 * replacement rather than a per-template edit.
 */
export function unverifiedDescription(uniName: string, program?: string): string {
  const what = program ? `an online ${program}` : 'online programmes'
  return `EdifyEdu cannot confirm that ${uniName} offers ${what}. The UGC DEB programme register does not list it, and the university advertises on-campus programmes only. Check deb.ugc.ac.in and contact the university directly.`
}
