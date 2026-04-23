import type { University } from '@/lib/data'

interface Props {
  u: University
}

export default function RankingBadge({ u }: Props) {
  const badges: { label: string; color: string }[] = []

  // QS badge
  if ((u as any).qsRank && (u as any).qsRank < 100) {
    badges.push({ label: `QS Asia #${(u as any).qsRank}`, color: 'bg-amber-100 text-amber-800 border-amber-300' })
  }

  // NIRF Management (preferred over University for MBA)
  if ((u as any).nirfMgt && (u as any).nirfMgt < 200) {
    badges.push({ label: `NIRF #${(u as any).nirfMgt} Management`, color: 'bg-blue-50 text-blue-700 border-blue-200' })
  } else if (u.nirf > 0 && u.nirf < 200) {
    badges.push({ label: `NIRF #${u.nirf} University`, color: 'bg-blue-50 text-blue-700 border-blue-200' })
  }

  // NAAC
  if (u.naac) {
    const naacColor = u.naac === 'A++' ? 'bg-green-50 text-green-700 border-green-200'
      : u.naac === 'A+' ? 'bg-green-50 text-green-600 border-green-200'
      : 'bg-slate-50 text-slate-600 border-slate-200'
    badges.push({ label: `NAAC ${u.naac}`, color: naacColor })
  }

  // IoE
  if (u.approvals?.some(a => a.toLowerCase().includes('institution of eminence') || a.toLowerCase().includes('ioe'))) {
    badges.push({ label: 'Institution of Eminence', color: 'bg-purple-50 text-purple-700 border-purple-200' })
  }

  // WES
  if (u.approvals?.some(a => a.toLowerCase().includes('wes'))) {
    badges.push({ label: 'WES Recognised', color: 'bg-indigo-50 text-indigo-600 border-indigo-200' })
  }

  if (badges.length === 0) return null

  return (
    <div className="flex flex-wrap gap-1.5 mt-3">
      {badges.map((badge, i) => (
        <span
          key={i}
          className={`inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.color}`}
        >
          {badge.label}
        </span>
      ))}
    </div>
  )
}
