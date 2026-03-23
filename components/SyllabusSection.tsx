'use client'

import { useState } from 'react'
import { BookOpen, ChevronDown } from 'lucide-react'
import type { MasterSyllabus, UniversitySyllabus } from '@/lib/content'

interface SyllabusSectionProps {
  syllabus: MasterSyllabus | UniversitySyllabus
  program: string
  universityName: string
  activeSpec?: string | null
}

const SEM_TABS = [
  { key: 'sem1', label: 'Semester 1' },
  { key: 'sem2', label: 'Semester 2' },
  { key: 'sem3', label: 'Semester 3' },
  { key: 'sem4', label: 'Semester 4' },
  { key: 'sem56', label: 'Sem 5–6' },
]

// Learning outcome hints per subject keyword
const OUTCOMES: Record<string, string> = {
  'Management': 'Understand core management functions — planning, organising, leading, controlling',
  'Organizational Behavior': 'Analyse individual and group behaviour to improve workplace effectiveness',
  'Marketing': 'Build strategies to identify, attract, and retain customers profitably',
  'Finance': 'Apply financial tools to evaluate business decisions and manage capital',
  'Human Resource': 'Design HR systems that attract, develop, and retain talent',
  'Economics': 'Apply economic principles to business decision-making and market analysis',
  'Research': 'Design and execute business research to support evidence-based decisions',
  'Strategic': 'Formulate long-term competitive strategies for sustainable business growth',
  'Operations': 'Optimise production, logistics, and service delivery for efficiency',
  'Analytics': 'Use data analysis tools to extract actionable insights from business data',
  'Business Law': 'Navigate legal frameworks and regulatory compliance in business contexts',
  'Ethics': 'Apply ethical reasoning and corporate governance principles to decisions',
  'Entrepreneurship': 'Identify opportunities and launch ventures with lean startup thinking',
  'Digital': 'Leverage digital channels and technology for marketing and operations',
  'Data Science': 'Apply statistical and machine learning techniques to real business problems',
  'Python': 'Build Python scripts for data analysis, automation, and ML applications',
  'Java': 'Develop object-oriented applications and backend systems using Java',
  'Cloud': 'Deploy and manage scalable applications on cloud infrastructure',
  'SQL': 'Query relational databases to extract, transform, and load business data',
  'Project': 'Apply project management frameworks — scope, schedule, budget, risk',
  'International': 'Navigate global trade regulations, currency risks, and cross-cultural management',
  'Supply Chain': 'Design and manage end-to-end supply chain for cost and resilience',
  'Healthcare': 'Apply management principles to hospital operations and healthcare systems',
  'Banking': 'Understand banking operations, financial instruments, and regulatory frameworks',
  'Accounting': 'Prepare and interpret financial statements per Indian and global standards',
}

function getOutcome(subject: string): string {
  for (const [kw, outcome] of Object.entries(OUTCOMES)) {
    if (subject.toLowerCase().includes(kw.toLowerCase())) return outcome
  }
  return 'Build practical knowledge and skills in this subject area'
}

function SubjectList({ text }: { text: string }) {
  const subjects = text.split(/[|;,]/).map(s => s.trim()).filter(s => s.length > 2).slice(0, 10)
  if (!subjects.length) return null
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {subjects.map((subj, i) => (
        <div key={i} style={{ padding: '10px 14px', borderRadius: 10, background: 'var(--surface-2)', border: '1px solid #E2E8F4', display: 'flex', gap: 12, alignItems: 'flex-start', }}>
          <div style={{ width: 24, height: 24, borderRadius: 6, flexShrink: 0, background: 'rgba(200,129,26,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 800, color: 'var(--amber-text)', }}>{i + 1}</div>
          <div className="flex-1 min-w-0">
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--ink)', marginBottom: 2 }}>{subj}</div>
            <div className="text-[11px] text-ink-3 leading-snug">{getOutcome(subj)}</div>
          </div>
        </div>
      ))}
    </div>
  )
}

export default function SyllabusSection({ syllabus, program, universityName, activeSpec }: SyllabusSectionProps) {
  const [activeSem, setActiveSem] = useState('sem1')

  // Always show sem1-4 tabs if sem1 exists; sem5-6 only if data present
  const rootHasSem1 = !!(syllabus.sem1 || syllabus.sem2)
  const specHasSem1 = !!((syllabus as MasterSyllabus).specSyllabus && Object.values((syllabus as MasterSyllabus).specSyllabus!).some((sv: any) => sv.sem1 || sv.sem2))
  const hasSem1 = rootHasSem1 || specHasSem1
  if (!hasSem1) return null

  const availableSems = SEM_TABS.filter(t => {
    if (t.key === 'sem1' || t.key === 'sem2') return hasSem1
    if (t.key === 'sem3' || t.key === 'sem4') {
      // Show if root has data OR any spec has data for this sem
      const rootHas = !!(syllabus[t.key as keyof typeof syllabus] as string | undefined)
      const specHas = !!((syllabus as MasterSyllabus).specSyllabus && Object.values((syllabus as MasterSyllabus).specSyllabus!).some((sv: any) => sv[t.key as 'sem3' | 'sem4']))
      return rootHas || specHas
    }
    return !!(syllabus[t.key as keyof typeof syllabus] as string | undefined)
  })

  // Get content for active semester, considering spec variant for sem1-sem4
  function getSemContent(semKey: string): string {
    // For sem1-sem4, try spec variant first, then fall back to root
    if (['sem1', 'sem2', 'sem3', 'sem4'].includes(semKey)) {
      // Try active spec variant first or fallback to the first available spec
      const targetSpec = activeSpec || (
        (syllabus as MasterSyllabus).specSyllabus ? Object.keys((syllabus as MasterSyllabus).specSyllabus!)[0] : null
      )
      
      if (targetSpec && (syllabus as MasterSyllabus).specSyllabus) {
        const variant = (syllabus as MasterSyllabus).specSyllabus![targetSpec] as Record<string, string>
        if (variant?.[semKey as 'sem1' | 'sem2' | 'sem3' | 'sem4']) {
          return variant[semKey as 'sem1' | 'sem2' | 'sem3' | 'sem4']!
        }
      }
      // Fall back to root if exists
      if ((syllabus as Record<string, any>)[semKey]) {
        return (syllabus as Record<string, any>)[semKey]
      }
      return ''
    }
    
    // For sem56 or others
    return ((syllabus as Record<string, any>)[semKey]) || ''
  }

  const activeSemContent = getSemContent(activeSem)
  const isSpecVariant = activeSpec && (activeSem === 'sem3' || activeSem === 'sem4') &&
    (syllabus as MasterSyllabus).specSyllabus?.[activeSpec]?.[activeSem as 'sem3' | 'sem4']

  return (
    <section className="card-lg">
      {/* Header */}
      <div style={{ padding: '14px 20px', background: 'rgba(11,29,53,0.04)', borderBottom: '1px solid #E2E8F4', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', }}>
        <BookOpen size={14} color="var(--amber)" />
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--ink)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          {program} Syllabus — Semester-wise Breakdown
        </span>
        {activeSpec && (
          <span style={{ marginLeft: 'auto', fontSize: 10, padding: '2px 10px', borderRadius: 'var(--r-lg)', background: 'rgba(200,129,26,0.1)', color: 'var(--amber-text)', fontWeight: 700, }}>
            {activeSpec}
          </span>
        )}
        <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 'var(--r-lg)', background: 'rgba(31,107,82,0.1)', color: 'var(--sage)', fontWeight: 600, marginLeft: activeSpec ? 4 : 'auto', }}>
          UGC Approved Curriculum
        </span>
      </div>

      {/* Highlight banner from Excel */}
      {(syllabus as MasterSyllabus).highlight && (
        <div style={{ padding: '10px 20px', background: 'linear-gradient(135deg, rgba(200,129,26,0.08), rgba(200,129,26,0.04))', borderBottom: '1px solid rgba(200,129,26,0.15)', fontSize: 12, color: 'var(--amber-text)', lineHeight: 1.6, display: 'flex', alignItems: 'flex-start', gap: 8, }}>
          <span style={{ fontSize: 16, flexShrink: 0 }}>✦</span>
          <span style={{ fontWeight: 600 }}>{(syllabus as MasterSyllabus).highlight}</span>
        </div>
      )}

      {/* Semester tab bar */}
      <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid #E2E8F4', overflowX: 'auto', background: '#fff', }}>
        {availableSems.map(sem => (
          <button key={sem.key} onClick={() => setActiveSem(sem.key)} style={{ padding: '11px 20px', fontSize: 12, fontWeight: 700, cursor: 'pointer', border: 'none', background: 'transparent', whiteSpace: 'nowrap', color: activeSem === sem.key ? 'var(--amber-text)' : 'var(--ink-3)', borderBottom: activeSem === sem.key ? '2px solid #C8811A' : '2px solid transparent', transition: 'var(--t-base)', fontFamily: 'inherit', }}>
            {sem.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="p-5">
        {isSpecVariant && (
          <div style={{ padding: '8px 14px', marginBottom: 14, background: 'rgba(200,129,26,0.06)', borderRadius: 'var(--r-xs)', border: '1px solid rgba(200,129,26,0.15)', fontSize: 11, color: 'var(--amber-text)', fontWeight: 600, }}>
            ✦ Showing {activeSem === 'sem3' ? 'Semester 3' : 'Semester 4'} electives for {activeSpec} specialisation
          </div>
        )}
        {activeSemContent
          ? <SubjectList text={activeSemContent} />
          : (activeSem === 'sem3' || activeSem === 'sem4')
            ? (
              <div style={{ padding: '16px', background: 'rgba(200,129,26,0.06)', borderRadius: 10, border: '1px solid rgba(200,129,26,0.2)', textAlign: 'center' }}>
                <div style={{ fontSize: 20, marginBottom: 8 }}>☝️</div>
                <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--amber-text)', marginBottom: 4 }}>
                  Select a specialisation above to see {activeSem === 'sem3' ? 'Semester 3' : 'Semester 4'} subjects
                </div>
                <div style={{ fontSize: 12, color: 'var(--ink-3)' }}>
                  Sem 3 & 4 are specialisation-specific — click any specialisation pill to see its subjects
                </div>
              </div>
            )
            : <p style={{ fontSize: 13, color: 'var(--ink-4)', margin: 0 }}>
                Detailed syllabus for {availableSems.find(s => s.key === activeSem)?.label} not available yet.
              </p>
        }
      </div>

      {/* Research & Capstone */}
      {(syllabus.research || syllabus.capstone) && (
        <div style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 10, }}>
          {syllabus.research && (
            <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid #E2E8F4' }}>
              <div className="text-[10px] font-bold text-ink-3 uppercase mb-1">Research Component</div>
              <div className="text-xs text-ink-2 leading-snug">{syllabus.research}</div>
            </div>
          )}
          {syllabus.capstone && (
            <div style={{ padding: '10px 14px', background: 'var(--surface-2)', borderRadius: 10, border: '1px solid #E2E8F4' }}>
              <div className="text-[10px] font-bold text-ink-3 uppercase mb-1">Capstone / Project</div>
              <div className="text-xs text-ink-2 leading-snug">{syllabus.capstone}</div>
            </div>
          )}
        </div>
      )}

      {/* Edify Recommends */}
      {(syllabus.edifySkills?.length || syllabus.edifyProjects?.length || syllabus.edifyInternships?.length) ? (
        <div style={{ padding: '14px 20px', borderTop: '1px solid #F1F5F9', background: 'rgba(31,107,82,0.03)', }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--sage)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
            ✦ Edify Recommends — do these alongside the program
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14 }}>
            {syllabus.edifySkills && syllabus.edifySkills.length > 0 && (
              <div>
                <div className="text-[11px] font-bold text-navy mb-1.5">Skills to Build</div>
                {syllabus.edifySkills.map((s, i) => (
                  <div key={i} className="text-[11px] text-ink-2 mb-1 flex gap-1.5">
                    <span style={{ color: 'var(--sage)', flexShrink: 0 }}>✓</span>{s}
                  </div>
                ))}
              </div>
            )}
            {syllabus.edifyProjects && syllabus.edifyProjects.length > 0 && (
              <div>
                <div className="text-[11px] font-bold text-navy mb-1.5">Projects to Build</div>
                {syllabus.edifyProjects.map((p, i) => (
                  <div key={i} className="text-[11px] text-ink-2 mb-1 flex gap-1.5">
                    <span className="text-amber shrink-0">→</span>{p}
                  </div>
                ))}
              </div>
            )}
            {syllabus.edifyInternships && syllabus.edifyInternships.length > 0 && (
              <div>
                <div className="text-[11px] font-bold text-navy mb-1.5">Internships to Target</div>
                {syllabus.edifyInternships.map((s, i) => (
                  <div key={i} className="text-[11px] text-ink-2 mb-1 flex gap-1.5">
                    <span style={{ color: 'var(--purple)', flexShrink: 0 }}>→</span>{s}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </section>
  )
}
