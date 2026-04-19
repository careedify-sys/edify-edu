// SectionCoreSubjects.tsx — universal core-subject chips for program pages (MBA/BBA/BCA/MCA)
// Shows 5-6 always-present subjects, not the semester-wise elective syllabus.

interface Props {
  program: string
  cleanName: string
}

const CORE_SUBJECTS: Record<string, string[]> = {
  MBA: [
    'Management Accounting',
    'Business Statistics',
    'Marketing Management',
    'Organisational Behaviour',
    'Strategic Management',
    'Business Law',
  ],
  MCA: [
    'Data Structures & Algorithms',
    'Database Management Systems',
    'Operating Systems',
    'Computer Networks',
    'Software Engineering',
    'Web Technologies',
  ],
  BBA: [
    'Principles of Management',
    'Business Economics',
    'Financial Accounting',
    'Marketing Fundamentals',
    'Human Resource Management',
    'Business Communication',
  ],
  BCA: [
    'Programming in C/C++',
    'Data Structures',
    'Web Design & Development',
    'Database Systems',
    'Computer Organisation',
    'Software Development Life Cycle',
  ],
}

const SUBJECT_ICONS: Record<string, string> = {
  MBA: '📊',
  MCA: '💻',
  BBA: '📋',
  BCA: '🖥️',
}

export default function SectionCoreSubjects({ program, cleanName }: Props) {
  const subjects = CORE_SUBJECTS[program] || CORE_SUBJECTS['MBA']
  const icon = SUBJECT_ICONS[program] || '📚'

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6">
      <div className="flex items-center gap-2 mb-1">
        <span className="text-lg">{icon}</span>
        <h2 className="text-lg font-bold" style={{ color: '#0B1533' }}>
          Core Subjects in {cleanName} Online {program}
        </h2>
      </div>
      <p className="text-sm text-slate-500 mb-4">
        These subjects are common across all specialisations. Elective subjects vary by specialisation chosen.
      </p>
      <div className="flex flex-wrap gap-2">
        {subjects.map(subject => (
          <span
            key={subject}
            className="px-3 py-1.5 rounded-full text-sm font-medium border"
            style={{
              background: '#F0F9FF',
              color: '#0369A1',
              borderColor: '#BAE6FD',
            }}
          >
            {subject}
          </span>
        ))}
      </div>
      <p className="text-xs text-slate-400 mt-4">
        Syllabus may vary slightly by semester. Refer to the official {cleanName} website for the current curriculum.
      </p>
    </section>
  )
}
