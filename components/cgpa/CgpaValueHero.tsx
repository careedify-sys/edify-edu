import { GraduationCap } from 'lucide-react'

interface Props {
  label: string
  percentage: string
}

export default function CgpaValueHero({ label, percentage }: Props) {
  return (
    <section className="text-center">
      <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber/10 text-amber text-xs font-bold mb-4">
        <GraduationCap size={14} />
        UGC Formula 2026 · Verified Answer
      </div>

      <h1 className="font-display text-3xl md:text-4xl font-bold text-navy mb-3 leading-tight">
        {label} CGPA in Percentage = {percentage}% (UGC Formula 2026)
      </h1>

      <p className="text-ink-2 max-w-2xl mx-auto mb-6 text-sm md:text-base">
        Using the UGC standard formula CGPA × 9.5, a {label} CGPA equals {percentage}%.
      </p>

      <div className="max-w-md mx-auto bg-gradient-to-br from-navy to-[#142540] rounded-2xl p-6 md:p-7 text-white shadow-lg">
        <div className="text-xs uppercase tracking-wide text-white/60 mb-3">
          Answer
        </div>
        <div className="font-mono text-2xl md:text-3xl font-bold mb-2">
          {label} × 9.5 = <span className="text-amber-400">{percentage}%</span>
        </div>
        <div className="text-xs text-white/70">
          Source: UGC standard 10-point conversion formula
        </div>
      </div>
    </section>
  )
}
