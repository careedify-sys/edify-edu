// ── Spec page content types ─────────────────────────────────────────────────

export interface SubjectEntry {
  name: string;
  description: string;
}

/** Used by Batch 16+ JSONs (semesters array format) */
export interface SemesterEntry {
  sem: number;
  subjects: Array<{ name: string; desc?: string; description?: string }>;
}

export interface SpecPageContent {
  uniSlug: string;
  program: string;
  specSlug: string;
  sections: {
    hero?: { eyebrow?: string; headline?: string; sub?: string };
    tldr?: string;
    about?: { body?: string };
    syllabus?: {
      hasData: boolean;
      /** Flat format (legacy/Amity-style) */
      sem1Subjects?: SubjectEntry[];
      sem2Subjects?: SubjectEntry[];
      sem3Subjects?: SubjectEntry[];
      sem4Subjects?: SubjectEntry[];
      /** Semesters array format (Batch 16+ CU/SMU style) */
      semesters?: SemesterEntry[];
      note?: string;
      emptyFallback?: string;
    };
    whoHires?: { body?: string };
    skills?: { body?: string };
    comparisons?: { body?: string };
    fees?: { body?: string };
    certificate?: { body?: string };
    reviews?: {
      intro?: string;
      items?: Array<{
        name: string;
        city: string;
        year: number;
        rating: number;
        liked: string;
        disliked: string;
        body: string;
      }>;
    };
    faqs?: Array<{ question: string; answer: string }>;
    chooseAlternatives?: {
      chooseIf?: string[];
      consider?: string[];
    };
  };
  metadata: {
    wordCount?: number;
    generatedAt: string;
    batchNumber?: number;
    hasSyllabusData?: boolean;
  };
}

// ── Main program page content types ─────────────────────────────────────────

export interface ReviewItem {
  name: string;
  city: string;
  year: number;
  rating: number;
  liked: string;
  disliked: string;
  body: string;
}

export interface RedFlag {
  sentence1: string;
  sentence2: string;
}

export interface PageContent {
  uniSlug: string;
  program: string; // 'mba' | 'mca' | 'bba' | 'bca'
  sections: {
    tldr?: string;
    hero?: { eyebrow?: string; headline?: string; sub?: string; body?: string };
    about?: { heading?: string; body?: string };
    approvals?: { heading?: string; body?: string };
    ugcDeb?: { heading?: string; body?: string };
    whoCanApply?: { heading?: string; body?: string };
    classes?: { heading?: string; body?: string };
    exams?: { heading?: string; body?: string };
    specializationsOverview?: { heading?: string; body?: string };
    syllabusNote?: { heading?: string; body?: string };
    fees?: { heading?: string; body?: string };
    coupon?: { heading?: string; body?: string };
    emi?: { heading?: string; body?: string };
    sampleCert?: { heading?: string; body?: string };
    admission?: { heading?: string; body?: string };
    abcId?: { heading?: string; body?: string };
    placements?: { heading?: string; body?: string };
    topHirers?: { heading?: string; body?: string };
    beyondAdmission?: { heading?: string; body?: string };
    reviews?: {
      heading?: string;
      intro?: string;
      items?: ReviewItem[];
      closer?: string;
      rawBody?: string; // fallback if parsing fails
    };
    redFlags?: {
      heading?: string;
      intro?: string;
      flags?: RedFlag[];
      rawBody?: string; // fallback if parsing fails
    };
    comparisons?: { heading?: string; body?: string };
    honestVerdict?: { heading?: string; body?: string };
    faqs?: Array<{ question: string; answer: string }>;
  };
  metadata: {
    wordCount?: number;
    generatedAt: string;
    batchNumber?: number;
    rubricPassed?: boolean;
    sheetName: string;
  };
}
