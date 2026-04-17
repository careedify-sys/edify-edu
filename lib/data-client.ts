// lib/data-client.ts — Lightweight client-safe utilities
// ⚠️  DO NOT import UNIVERSITIES or any large arrays here.
//     This file ships to every browser. Keep it tiny.

export type Program =
  | 'MBA' | 'MCA' | 'BBA' | 'BCA'
  | 'B.Com' | 'M.Com' | 'BA' | 'B.A' | 'MA' | 'M.A'
  | 'MSc' | 'M.Sc' | 'BSc' | 'B.Sc' | 'MBA (WX)'

export const PROGRAM_META: Record<string, { label: string; desc: string; icon?: string; duration?: string; level?: string }> = {
  'MBA':      { label: 'Online MBA',    desc: 'Master of Business Administration', icon: '💼' },
  'MCA':      { label: 'Online MCA',    desc: 'Master of Computer Applications',   icon: '💻' },
  'BBA':      { label: 'Online BBA',    desc: 'Bachelor of Business Administration', icon: '📊' },
  'BCA':      { label: 'Online BCA',    desc: 'Bachelor of Computer Applications', icon: '🖥️' },
  'B.Com':    { label: 'Online B.Com',  desc: 'Bachelor of Commerce',              icon: '📒' },
  'M.Com':    { label: 'Online M.Com',  desc: 'Master of Commerce',                icon: '📈' },
  'BA':       { label: 'Online BA',     desc: 'Bachelor of Arts',                  icon: '🎓' },
  'MA':       { label: 'Online MA',     desc: 'Master of Arts',                    icon: '📚' },
  'MSc':      { label: 'Online M.Sc',   desc: 'Master of Science',                 icon: '🔬' },
  'BSc':      { label: 'Online B.Sc',   desc: 'Bachelor of Science',               icon: '⚗️' },
  'MBA (WX)': { label: 'Executive MBA', desc: 'Executive MBA (Work Integrated)',    icon: '🏛️' },
}

export const PROG_SLUG_MAP: Record<string, Program> = {
  'mba':    'MBA',   'mca':  'MCA',   'bba':   'BBA',   'bca': 'BCA',
  'bcom':   'B.Com', 'mcom': 'M.Com', 'ba':    'BA',    'ma':  'MA',
  'msc':    'MSc',   'bsc':  'BSc',   'mba-wx':'MBA (WX)',
}

/** Format a fee number for display. Pure function — zero dependencies. */
export function formatFee(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`
  if (n >= 1000)   return `₹${Math.round(n / 1000)}K`
  return `₹${n}`
}

/** Convert a program name to its URL slug */
export function progToSlug(p: Program): string {
  return p.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
}

/** Convert a URL slug back to a Program */
export function slugToProg(slug: string): Program | null {
  return PROG_SLUG_MAP[slug.toLowerCase()] ?? null
}
