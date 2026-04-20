/**
 * lib/syllabus.ts
 * Unified syllabus lookup — manifest-first, MASTER_SYLLABUS fallback.
 *
 * Primary source: lib/data/syllabus-manifest.json (built from xlsx, 61 unis, 369 specs)
 * Fallback:       MASTER_SYLLABUS in lib/content.ts (244 legacy entries)
 */

import syllabusManifest from './data/syllabus-manifest.json'
import { getMasterSyllabus, getUniversitySyllabus } from './content'

export interface SyllabusData {
  sem1?: string
  sem2?: string
  sem3?: string
  sem4?: string
  sem56?: string
  coreSpec?: string
  research?: string
  capstone?: string
}

// Convert manifest [{sem, subjects}] → SyllabusData with ' | ' joining
function semestersToData(semesters: Array<{ sem: number; subjects: string[] }>): SyllabusData {
  const result: SyllabusData = {}
  semesters.forEach(s => {
    if (s.sem >= 1 && s.sem <= 4) {
      const key = `sem${s.sem}` as keyof SyllabusData
      ;(result as Record<string, string>)[key] = s.subjects.join(' | ')
    } else if (s.sem === 5 || s.sem === 6) {
      result.sem56 = result.sem56
        ? result.sem56 + ' | ' + s.subjects.join(' | ')
        : s.subjects.join(' | ')
    }
  })
  return result
}

// Normalize a string to match manifest keys: lowercase, non-alnum → hyphen
function slugify(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
}

// Try to find a manifest key that's close enough to the incoming specSlug.
// Exact match first; then check if either string contains the other.
function findSpecKey(progData: Record<string, any>, specSlug: string): string | null {
  if (specSlug in progData) return specSlug
  // Try partial containment
  const keys = Object.keys(progData).filter(k => k !== '_core')
  const partial = keys.find(k => k.includes(specSlug) || specSlug.includes(k))
  return partial || null
}

/**
 * getSyllabus(uniId, program, spec?)
 *
 * @param uniId   - university slug, e.g. 'amity-university-online'
 * @param program - 'MBA' | 'MCA' | 'BBA' | 'BCA' | …  (or lowercase — handled internally)
 * @param spec    - specialisation display name OR slug (optional)
 * @returns SyllabusData or null if no data available
 */
export function getSyllabus(
  uniId: string,
  program: string,
  spec?: string
): SyllabusData | null {
  const manifest = syllabusManifest as Record<string, Record<string, any>>
  const uniData  = manifest[uniId]
  const progKey  = program.toLowerCase()
  const progData = uniData?.[progKey]

  if (progData) {
    if (spec) {
      // Try slug of the incoming spec (could be display name or already a slug)
      const specSlug = slugify(spec)
      const matchedKey = findSpecKey(progData, specSlug)
      if (matchedKey) {
        const specData = progData[matchedKey]
        if (specData?.semesters?.length) {
          return semestersToData(specData.semesters)
        }
      }
      // Spec not found in manifest — fall back to _core for this spec page
    }

    // No spec, or spec not found → use _core
    if (progData._core?.semesters?.length) {
      return semestersToData(progData._core.semesters)
    }

    // _core missing — use first spec's sem1/sem2 as approximate core for program page
    if (!spec) {
      const firstKey = Object.keys(progData).find(k => k !== '_core')
      if (firstKey) {
        const sems = progData[firstKey].semesters?.filter((s: any) => s.sem <= 2) || []
        if (sems.length) return semestersToData(sems)
      }
    }
  }

  // ── Fallback to legacy MASTER_SYLLABUS (content.ts) ─────────────────────────
  // Keys are like 'amity-university-online||MBA'
  const programUpper = program.toUpperCase()
  const master = getMasterSyllabus(uniId, programUpper)
  if (master) {
    const { sem1, sem2, sem3, sem4, sem56, research, capstone } = master as any
    const base: SyllabusData = {}
    if (sem1)     base.sem1     = sem1
    if (sem2)     base.sem2     = sem2
    if (sem3)     base.sem3     = sem3
    if (sem4)     base.sem4     = sem4
    if (sem56)    base.sem56    = sem56
    if (research) base.research = research
    if (capstone) base.capstone = capstone

    if (spec && master.specSyllabus) {
      const specSlug    = slugify(spec)
      const specVariant = master.specSyllabus[spec] || master.specSyllabus[specSlug]
      if (specVariant) return { ...base, ...specVariant }
    }
    if (Object.values(base).some(Boolean)) return base
  }

  // B.Com / B.A / M.A etc. from UNIVERSITY_SYLLABUS
  const uni = getUniversitySyllabus(uniId, programUpper)
  if (uni) {
    const { sem1, sem2, sem3, sem4, sem56, research, capstone } = uni as any
    const base: SyllabusData = {}
    if (sem1)     base.sem1     = sem1
    if (sem2)     base.sem2     = sem2
    if (sem3)     base.sem3     = sem3
    if (sem4)     base.sem4     = sem4
    if (sem56)    base.sem56    = sem56
    if (research) base.research = research
    if (capstone) base.capstone = capstone
    if (Object.values(base).some(Boolean)) return base
  }

  return null
}

/** Convenience check — true if getSyllabus would return non-null data */
export function hasSyllabusData(uniId: string, program: string, spec?: string): boolean {
  return getSyllabus(uniId, program, spec) !== null
}
