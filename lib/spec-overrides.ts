// lib/spec-overrides.ts — Per-university specialization content overrides
//
// PURPOSE:
// Without this file, Amity MBA Data Science and Manipal MBA Data Science show
// identical skills, roles, salary, and companies (pulled from the global
// SPEC_CONTENT dictionary). This file lets you override specific fields
// per university without touching the global defaults.
//
// HOW IT WORKS:
// 1. Global SPEC_CONTENT is the base layer (lib/content.ts)
// 2. Global IMPROVED_SPECS applies on top (lib/improved-specs.ts)
// 3. This file applies last — any field here wins for the named university
//
// HOW TO ADD AN OVERRIDE:
// Add a row to UNIVERSITY_SPEC_OVERRIDES below with:
//   universitySlug  — matches /universities/{slug}
//   program         — 'MBA', 'MCA', 'BBA', 'BCA', etc.
//   specialization  — the FULL spec name as it appears in lib/data.ts
//                     (NOT the URL slug — use 'Data Science' not 'data-science')
// Then populate only the fields you want to override.
// Any field left undefined (or not present) falls back to the global value.
//
// CMS SHEET SCHEMA (for future Google Sheets integration):
// Tab: UniversitySpecializations
// Columns (in order):
//   A  university_slug         string     e.g. amity-university-online
//   B  program                 string     e.g. mba
//   C  specialization          string     URL slug e.g. data-science
//   D  roles_override          JSON array or empty
//   E  skills_override         JSON array or empty
//   F  salary_range_override   string     e.g. Rs 10-28L  or empty
//   G  hiring_companies_override JSON array or empty
//   H  curriculum_override     HTML block or empty
//   I  projects_override       JSON array or empty
//   J  certifications_override JSON array or empty
//   K  last_updated            ISO date   e.g. 2026-04-17

export interface UniversitySpecOverride {
  universitySlug: string
  program: string
  specialization: string  // full name as in lib/data.ts specs array
  rolesOverride?: string[] | null
  skillsOverride?: string[] | null
  salaryRangeOverride?: string | null
  hiringCompaniesOverride?: string[] | null
  curriculumOverride?: string | null
  projectsOverride?: string[] | null
  certificationsOverride?: string[] | null
  lastUpdated: string
}

// ── Override data ───────────────────────────────────────────────────────────
// Add rows here. One object per university × program × specialization.
// Leave fields you don't want to override absent (or set to null).
//
// NOTE: Populate these rows sparingly — only for universities with genuinely
// differentiated placement data, curriculum, or hiring partners.
// Generic overrides create maintenance burden without SEO value.

export const UNIVERSITY_SPEC_OVERRIDES: UniversitySpecOverride[] = [

  // ── TEST ROW — Amity × MBA × Data Science ────────────────────────────────
  // Purpose: proves the override system works end-to-end before content population
  // The Rs 10-28L salary reflects Amity's stronger placement data vs the global default.
  // Delete or update this row when real Amity placement data is available.
  {
    universitySlug: 'amity-university-online',
    program: 'MBA',
    specialization: 'Data Science',
    salaryRangeOverride: 'Rs 10-28L per annum',
    lastUpdated: '2026-04-17',
  },

]

// ── Lookup function ─────────────────────────────────────────────────────────

/**
 * Returns the override record for a given university × program × specialization,
 * or null if no override exists.
 *
 * Matching is case-insensitive on both program and specialization to avoid
 * breakage when spec names vary in capitalisation between data sources.
 */
export function getUniversitySpecOverride(
  universitySlug: string,
  program: string,
  specialization: string
): UniversitySpecOverride | null {
  const match = UNIVERSITY_SPEC_OVERRIDES.find(
    o =>
      o.universitySlug === universitySlug &&
      o.program.toLowerCase() === program.toLowerCase() &&
      o.specialization.toLowerCase() === specialization.toLowerCase()
  )
  if (!match) return null

  if (process.env.NODE_ENV === 'development') {
    const fields = Object.entries(match)
      .filter(([k, v]) => k !== 'universitySlug' && k !== 'program' && k !== 'specialization' && k !== 'lastUpdated' && v != null)
      .map(([k]) => k)
    console.info(
      `[EdifyEdu] spec-override applied: ${universitySlug}/${program}/${specialization} — overriding: ${fields.join(', ')}`
    )
  }

  return match
}

/**
 * Merges a UniversitySpecOverride into a specContent object.
 * Only populated (non-null) override fields replace the base values.
 * Returns a new object; does not mutate inputs.
 */
export function applySpecOverride(
  baseContent: Record<string, any>,
  override: UniversitySpecOverride | null
): Record<string, any> {
  if (!override) return baseContent

  const merged = { ...baseContent }

  if (override.rolesOverride?.length)          merged.roles = override.rolesOverride
  if (override.skillsOverride?.length)         merged.skills = override.skillsOverride
  if (override.salaryRangeOverride)            merged.salaryRange = override.salaryRangeOverride
  if (override.hiringCompaniesOverride?.length) merged.topCompanies = override.hiringCompaniesOverride
  if (override.curriculumOverride)             merged.curriculumOverride = override.curriculumOverride
  if (override.projectsOverride?.length)       merged.projectIdeas = override.projectsOverride
  if (override.certificationsOverride?.length) merged.certifications = override.certificationsOverride

  return merged
}
