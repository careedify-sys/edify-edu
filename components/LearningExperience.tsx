import { Video, Users, MonitorPlay, FileText, ShieldCheck } from 'lucide-react'

interface Props {
  program?: string
  universityName?: string
  specialization?: string
}

export default function LearningExperience({ program, universityName, specialization }: Props) {
  const isMBA = program && program.toLowerCase() === 'mba'
  const progLabel = program ? `Online ${program}` : 'Online Degree'
  const h2 = universityName
    ? `How ${universityName} Delivers ${progLabel} — Classes & Schedule`
    : `Online ${progLabel} Learning Format — Classes & Schedule`

  return (
    <section className="card-lg p-6">
      <div className="mb-6">
        <h2 className="font-display text-xl font-bold text-navy">
          {h2}
        </h2>
        <p className="text-sm text-ink-2 mt-2">
          Experience a world-class blended learning approach optimally designed for working professionals to balance work and study.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        {/* 1. Pre-recorded Lectures */}
        <div className="p-4 rounded-xl bg-surface-2 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-blue-100 text-blue-700 rounded-lg">
              <Video size={18} />
            </div>
            <h3 className="font-bold text-navy text-sm">Pre-Recorded Lectures</h3>
          </div>
          <p className="text-xs text-ink-2 mb-2 leading-relaxed">
            Available 24/7 on the LMS. High-production quality lectures taught by expert university faculty.
          </p>
          <ul className="text-xs text-ink-3 space-y-1 ml-1" style={{ listStyle: 'none' }}>
            <li><span className="text-blue-500 mr-1">•</span>Downloadable for offline viewing</li>
            <li><span className="text-blue-500 mr-1">•</span>Re-watch anytime at your own pace</li>
          </ul>
        </div>

        {/* 2. Live Interactive Sessions */}
        <div className="p-4 rounded-xl bg-surface-2 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-green-100 text-green-700 rounded-lg">
              <Users size={18} />
            </div>
            <h3 className="font-bold text-navy text-sm">Live Interactive Sessions</h3>
          </div>
          <p className="text-xs text-ink-2 mb-2 leading-relaxed">
            Scheduled on weekends or evenings after business hours to accommodate your full-time schedule.
          </p>
          <ul className="text-xs text-ink-3 space-y-1 ml-1" style={{ listStyle: 'none' }}>
            <li><span className="text-green-500 mr-1">•</span>Real-time doubt clearance & Q&A</li>
            <li><span className="text-green-500 mr-1">•</span>Recordings provided if you miss class</li>
          </ul>
        </div>

        {/* 3. LMS Portal */}
        <div className="p-4 rounded-xl bg-surface-2 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-amber-light text-amber-text rounded-lg border border-[#c8811a40]">
              <MonitorPlay size={18} />
            </div>
            <h3 className="font-bold text-navy text-sm">Advanced LMS Portal</h3>
          </div>
          <p className="text-xs text-ink-2 mb-2 leading-relaxed">
            Your personal digital campus containing all syllabus tracking, materials, and student discussion forums.
          </p>
          <ul className="text-xs text-ink-3 space-y-1 ml-1" style={{ listStyle: 'none' }}>
            <li><span className="text-amber mr-1">•</span>E-books, PDFs, and Case Studies</li>
            <li><span className="text-amber mr-1">•</span>Dedicated Mobile App & Web Access</li>
          </ul>
        </div>

        {/* 4. Assignments & Case Studies */}
        <div className="p-4 rounded-xl bg-surface-2 border border-border">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 bg-purple-100 text-purple-700 rounded-lg">
              <FileText size={18} />
            </div>
            <h3 className="font-bold text-navy text-sm">Continuous Assessment</h3>
          </div>
          <p className="text-xs text-ink-2 mb-2 leading-relaxed">
            Practical evaluation through weekly assignments, essays, presentations, and group projects.
          </p>
          <ul className="text-xs text-ink-3 space-y-1 ml-1" style={{ listStyle: 'none' }}>
            <li><span className="text-purple-500 mr-1">•</span>Real-world {isMBA ? 'business case studies' : 'industry analysis'}</li>
            <li><span className="text-purple-500 mr-1">•</span>Constructive professor feedback</li>
          </ul>
        </div>

        {/* 5. Online Proctored Exams */}
        <div className="md:col-span-2 p-4 rounded-xl bg-surface-2 border border-border flex flex-col md:flex-row gap-4 items-start md:items-center">
          <div className="flex items-center gap-3 shrink-0">
            <div className="p-2 bg-red-100 text-red-700 rounded-lg">
              <ShieldCheck size={18} />
            </div>
            <h3 className="font-bold text-navy text-sm">Online Proctored Exams</h3>
          </div>
          <p className="text-xs text-ink-2 leading-relaxed">
            Secure, AI-proctored end-term examinations that you can legally take from the absolute comfort of your home. Validated securely using webcam tracking, strict single-screen rules, and randomized question rendering to ensure universal academic integrity.
          </p>
        </div>
      </div>
    </section>
  )
}
