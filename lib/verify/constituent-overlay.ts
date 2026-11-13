// Credits a NIRF rank or an AACSB accreditation to the constituent school
// that holds it, when the Supabase row does not say so (via_school empty).
// NIRF data mirrors data/nirf-constituent-schools.json (NIRF 2025). AACSB
// holders were confirmed by Rishi on 2026-11-13: SCMHRD for Symbiosis
// International, the School of Business Management (campus) for NMIMS.
import constituent from '@/data/nirf-constituent-schools.json'

type Acc = { body: string; category: string | null; rank: number | null; via_school: string | null; [k: string]: unknown }

const AACSB_HOLDERS: { umbrella: string; school: string }[] = [
  { umbrella: 'Symbiosis International', school: 'SCMHRD (Symbiosis Centre for Management and Human Resource Development)' },
  { umbrella: 'Narsee Monjee', school: 'NMIMS School of Business Management (campus)' },
  { umbrella: 'NMIMS', school: 'NMIMS School of Business Management (campus)' },
]

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim()

export function applyConstituentOverlay<T extends Acc>(universityName: string, accs: T[]): T[] {
  const name = norm(universityName || '')
  if (!name) return accs
  const nirf = (constituent.entries as { umbrella: string; category: string; rank: number; school: string }[])
    .filter(e => name.includes(norm(e.umbrella)))
  const aacsb = AACSB_HOLDERS.find(h => name.includes(norm(h.umbrella)))
  return accs.map(a => {
    if (a.via_school) return a
    if (a.body === 'NIRF') {
      const hit = nirf.find(e => e.category === a.category && e.rank === a.rank)
      if (hit) return { ...a, via_school: hit.school }
    }
    if (a.body === 'AACSB' && aacsb) return { ...a, via_school: aacsb.school }
    return a
  })
}
