// Static CGPA to percentage table for the 6.0 to 10.0 range.
// Values are pre-computed at module load and rendered as a plain HTML table
// so it works inside an RSC route without a client component.

interface Row {
  cgpa: string
  pct: string
  grade: string
  classification: string
}

function classify(pct: number) {
  if (pct >= 90) return { grade: 'O', label: 'Outstanding' }
  if (pct >= 75) return { grade: 'A+', label: 'First Class with Distinction' }
  if (pct >= 60) return { grade: 'A', label: 'First Class' }
  if (pct >= 50) return { grade: 'B', label: 'Second Class' }
  if (pct >= 40) return { grade: 'C', label: 'Pass Class' }
  return { grade: 'F', label: 'Fail' }
}

const ROWS: Row[] = Array.from({ length: 41 }, (_, i) => {
  const cgpa = parseFloat((6.0 + i * 0.1).toFixed(1))
  const pct = parseFloat((cgpa * 9.5).toFixed(2))
  const c = classify(pct)
  return {
    cgpa: cgpa.toFixed(1),
    pct: pct.toFixed(2),
    grade: c.grade,
    classification: c.label,
  }
})

interface Props {
  /** Optional CGPA value to highlight in the table */
  highlight?: number
}

export default function CgpaGradeTable({ highlight }: Props) {
  const highlightStr = typeof highlight === 'number' ? highlight.toFixed(1) : null

  return (
    <div className="bg-white rounded-2xl border border-border overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-navy text-white text-xs uppercase">
              <th className="px-4 py-3 text-left">CGPA</th>
              <th className="px-4 py-3 text-left">Percentage</th>
              <th className="px-4 py-3 text-left">Grade</th>
              <th className="px-4 py-3 text-left">Classification</th>
            </tr>
          </thead>
          <tbody>
            {ROWS.map((row, i) => {
              const isHighlight = highlightStr === row.cgpa
              const base = i % 2 === 0 ? 'bg-white' : 'bg-surface-2'
              const cls = isHighlight
                ? 'bg-amber/10 border-l-4 border-amber'
                : base
              return (
                <tr key={row.cgpa} className={cls}>
                  <td className="px-4 py-2 font-bold text-navy">
                    {row.cgpa}
                    {isHighlight && (
                      <span className="ml-2 text-[10px] font-bold uppercase tracking-wide text-amber">
                        Your score
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-2 font-semibold text-amber">{row.pct}%</td>
                  <td className="px-4 py-2 text-ink-2">{row.grade}</td>
                  <td className="px-4 py-2 text-xs text-ink-3">{row.classification}</td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </div>
  )
}
