import type { University } from '@/lib/data'

// examMode 'Exam Centre': end-semester exams are sat in person at the
// university's designated centres. The generic templates said "from home, no
// exam centre visit" for every university, which was false for BITS WILP
// (batch 3.4, 2026-11-16). Every template that mentions travel or campus
// visits must branch on this.
export const isExamCentre = (u: Pick<University, 'examMode'>) => u.examMode === 'Exam Centre'

export const EXAM_CENTRE_LINE = 'End-semester exams are taken in person at designated exam centres.'
