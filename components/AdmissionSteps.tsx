import { MessageSquare, FileCheck, CreditCard, BookOpen } from 'lucide-react'

const STEPS = [
  { icon: MessageSquare, label: 'Enquire', desc: 'Fill the counsellor form or call us', color: '#3b82f6' },
  { icon: FileCheck, label: 'Verify Docs', desc: 'Marksheets, ID proof — 2 minutes online', color: '#8b5cf6' },
  { icon: CreditCard, label: 'Pay Fees', desc: 'Semester-wise, EMI or one-shot payment', color: '#f59e0b' },
  { icon: BookOpen, label: 'Attend Class', desc: 'LMS access, live sessions start within 7 days', color: '#10b981' },
]

export default function AdmissionSteps() {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <h2 className="text-lg font-bold text-navy mb-5" style={{ color: '#0B1533' }}>Admission Process</h2>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {STEPS.map((s, i) => (
          <div key={s.label} className="flex flex-col items-center text-center gap-2">
            <div className="relative">
              <div
                className="w-12 h-12 rounded-full flex items-center justify-center"
                style={{ background: `${s.color}18` }}
              >
                <s.icon size={20} style={{ color: s.color }} />
              </div>
              <span
                className="absolute -top-1 -right-1 w-5 h-5 rounded-full text-[10px] font-black flex items-center justify-center text-white"
                style={{ background: s.color }}
              >
                {i + 1}
              </span>
            </div>
            <div className="text-sm font-bold text-slate-800">{s.label}</div>
            <div className="text-xs text-slate-500 leading-snug">{s.desc}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-4 text-center">
        No entrance exam required for most programs. Eligibility: any Bachelor&apos;s degree (50% aggregate for most; some accept 45%).
      </p>
    </section>
  )
}
