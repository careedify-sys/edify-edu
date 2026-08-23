// lib/internal-links.ts — Maps university program pages to their associated blogs.
// Drives BlogRelatedLinks (blog → program) and ProgramBlogLinks (program → blog).

export interface BlogEntry {
  slug: string
  label: string
}

export interface ProgramLinks {
  universityName: string
  shortName: string
  programPage: string
  comparePage?: string
  verifyPage?: string
  blogs: BlogEntry[]
}

export const UNIVERSITY_PROGRAM_LINKS: Record<string, Partial<Record<string, ProgramLinks>>> = {
  'amity-university-online': {
    mba: {
      universityName: 'Amity University Online',
      shortName: 'Amity',
      programPage: '/universities/amity-university-online/mba',
      comparePage: '/compare?a=amity-university-online&b=nmims-online',
      verifyPage: '/verify/amity-university-online',
      blogs: [
        { slug: 'amity-online-mba-review-2026', label: 'Amity Online MBA Review 2026: Fees, Specialisations and Honest Verdict' },
        { slug: 'amity-online-mba-hr-worth-it', label: 'Is Amity Online MBA in HR Worth It? Honest Verdict 2026' },
        { slug: 'is-amity-university-online-fake-or-legit-2026', label: 'Is Amity University Online Fake or Legit? 2026' },
      ],
    },
    mca: {
      universityName: 'Amity University Online',
      shortName: 'Amity',
      programPage: '/universities/amity-university-online/mca',
      verifyPage: '/verify/amity-university-online',
      blogs: [
        { slug: 'amity-online-mca-fees-review', label: 'Amity Online MCA: Fees, Specialisations and Honest Review 2026' },
      ],
    },
  },
  'nmims-online': {
    mba: {
      universityName: 'NMIMS Online',
      shortName: 'NMIMS',
      programPage: '/universities/nmims-online/mba',
      comparePage: '/compare?a=nmims-online&b=amity-university-online',
      blogs: [
        { slug: 'nmims-online-mba-review-2026', label: 'NMIMS Online MBA Review 2026: Fees, Accreditation and Placement Data' },
      ],
    },
  },
  'symbiosis-university-online': {
    mba: {
      universityName: 'Symbiosis Online (SSODL)',
      shortName: 'Symbiosis',
      programPage: '/universities/symbiosis-university-online/mba',
      blogs: [
        { slug: 'symbiosis-online-mba-review-2026', label: 'Symbiosis Online MBA Review 2026: SSODL Fees, Scholarship and Honest Verdict' },
      ],
    },
    bba: {
      universityName: 'Symbiosis Online (SSODL)',
      shortName: 'Symbiosis',
      programPage: '/universities/symbiosis-university-online/bba',
      blogs: [
        { slug: 'symbiosis-online-bba-review-2026', label: 'Symbiosis Online BBA Review 2026: Fees, SSODL, Honest Take' },
      ],
    },
  },
  'dr-dy-patil-vidyapeeth-online': {
    mba: {
      universityName: 'Dr. D.Y. Patil Vidyapeeth, Pune Online (DPU-COL)',
      shortName: 'DPU-COL',
      programPage: '/universities/dr-dy-patil-vidyapeeth-online/mba',
      comparePage: '/compare?a=dr-dy-patil-vidyapeeth-online&b=dy-patil-university-online',
      verifyPage: '/verify/dr-dy-patil-vidyapeeth-pune-online',
      blogs: [
        { slug: 'is-dy-patil-online-fake-or-legit-2026', label: 'Is DY Patil Online Fake or Legit? 2026 (DPU-COL vs Navi Mumbai)' },
      ],
    },
  },
  'lovely-professional-university-online': {
    mba: {
      universityName: 'LPU Online',
      shortName: 'LPU',
      programPage: '/universities/lovely-professional-university-online/mba',
      comparePage: '/compare?a=lovely-professional-university-online&b=amity-university-online',
      blogs: [
        { slug: 'online-mba-lpu-review-2026', label: 'LPU Online MBA Review 2026: Fees, Specialisations and Student Feedback' },
        { slug: 'is-lpu-online-fake-or-legit-2026', label: 'Is LPU Online Fake or Legit? 2026' },
      ],
    },
  },
  'manipal-university-jaipur-online': {
    mba: {
      universityName: 'Manipal University Jaipur Online',
      shortName: 'MUJ',
      programPage: '/universities/manipal-university-jaipur-online/mba',
      comparePage: '/compare?a=manipal-university-jaipur-online&b=amity-university-online',
      blogs: [
        { slug: 'is-manipal-university-jaipur-fake-or-legit-2026', label: 'Is Manipal University Jaipur Fake or Legit? 2026 Fact Check' },
        { slug: 'muj-online-mba-review-2026', label: 'MUJ Online MBA Review 2026: Fees, NAAC and Honest Verdict' },
      ],
    },
    bba: {
      universityName: 'Manipal University Jaipur Online',
      shortName: 'MUJ',
      programPage: '/universities/manipal-university-jaipur-online/bba',
      blogs: [
        { slug: 'muj-online-bba-review-2026', label: 'MUJ Online BBA Review 2026: Fees, EMI, Honest Take' },
      ],
    },
  },
  'manipal-academy-higher-education-online': {
    mba: {
      universityName: 'Manipal Academy of Higher Education Online',
      shortName: 'MAHE',
      programPage: '/universities/manipal-academy-higher-education-online/mba',
      blogs: [
        { slug: 'online-manipal-mba-review-2026', label: 'Online Manipal MBA Review 2026: Fees, Accreditation and Placement' },
        { slug: 'mahe-online-mba-review-2026', label: 'MAHE Online MBA Review 2026: Full Programme Details and Honest Verdict' },
      ],
    },
    bba: {
      universityName: 'Manipal Academy of Higher Education Online',
      shortName: 'MAHE',
      programPage: '/universities/manipal-academy-higher-education-online/bba',
      blogs: [
        { slug: 'mahe-online-bba-review-2026', label: 'MAHE Online BBA Review 2026: Fees, Honors Track, Honest Take' },
      ],
    },
  },
  'ignou-online': {
    mba: {
      universityName: 'IGNOU Online',
      shortName: 'IGNOU',
      programPage: '/universities/ignou-online/mba',
      blogs: [
        { slug: 'ignou-online-mba-review-2026', label: 'IGNOU Online MBA Review 2026: Fees, Admission and Honest Verdict' },
      ],
    },
  },
  // Sprint 1 Task 5: added so the Jamia Hamdard MBA hub links back to the review blog.
  'jamia-hamdard-online': {
    mba: {
      universityName: 'JAMIA HAMDARD Online',
      shortName: 'Jamia Hamdard',
      programPage: '/universities/jamia-hamdard-online/mba',
      verifyPage: '/verify/jamia-hamdard-online',
      blogs: [
        { slug: 'jamia-hamdard-mba-2026', label: 'Jamia Hamdard Online MBA Review 2026: Worth It or Skip It?' },
      ],
    },
  },
  'sikkim-manipal-university-online': {
    mba: {
      universityName: 'Sikkim Manipal University Online',
      shortName: 'SMU',
      programPage: '/universities/sikkim-manipal-university-online/mba',
      blogs: [
        { slug: 'smu-online-mba-review', label: 'SMU Online MBA Review 2026: Fees, Dual Specialisation and Verdict' },
      ],
    },
  },
  'chandigarh-university-online': {
    mba: {
      universityName: 'Chandigarh University Online',
      shortName: 'CU Online',
      programPage: '/universities/chandigarh-university-online/mba',
      comparePage: '/compare?a=chandigarh-university-online&b=amity-university-online',
      blogs: [
        { slug: 'chandigarh-university-online-mba-review', label: 'Chandigarh University Online MBA Fees 2026: ₹1.65L Review and Honest Verdict' },
        { slug: 'is-chandigarh-university-online-fake-or-legit-2026', label: 'Is Chandigarh University Online Fake or Legit? 2026' },
      ],
    },
  },
  'jain-university-online': {
    mba: {
      universityName: 'Jain University Online',
      shortName: 'Jain',
      programPage: '/universities/jain-university-online/mba',
      blogs: [
        { slug: 'jain-online-mba-review-2026', label: 'Jain Online MBA Fees 2026: ₹1.96L to ₹2.98L Review and Honest Take' },
      ],
    },
  },
  'galgotias-university-online': {
    mba: {
      universityName: 'Galgotias University Online',
      shortName: 'Galgotias',
      programPage: '/universities/galgotias-university-online/mba',
      blogs: [
        { slug: 'galgotias-online-mba-review', label: 'Galgotias University Online MBA Fees 2026: ₹80,200 Review and Honest Rating' },
      ],
    },
  },
  'dy-patil-university-online': {
    mba: {
      universityName: 'DY Patil University Online',
      shortName: 'DY Patil',
      programPage: '/universities/dy-patil-university-online/mba',
      blogs: [
        { slug: 'dy-patil-online-mba-review', label: 'DY Patil Online MBA Fees 2026: ₹1,89,400 Review and Honest Verdict' },
      ],
    },
  },
  'bits-pilani-work-integrated-online': {
    mba: {
      universityName: 'BITS Pilani WILP Online',
      shortName: 'BITS Pilani WILP',
      programPage: '/universities/bits-pilani-work-integrated-online/mba',
      blogs: [
        { slug: 'bits-pilani-online-mba-review-2026', label: 'BITS Pilani Online MBA Review 2026: WILP Fees & Honest Take' },
      ],
    },
  },
  'shoolini-university-online': {
    mba: {
      universityName: 'Shoolini University Online',
      shortName: 'Shoolini',
      programPage: '/universities/shoolini-university-online/mba',
      blogs: [
        { slug: 'shoolini-online-mba-review', label: 'Shoolini Online MBA Fees 2026: ₹1.18L Review and Honest Rating' },
      ],
    },
  },

  // ── Added 2026-08-23 ──────────────────────────────────────────────────────
  // 22 of 40 review blogs had no entry here, so BlogRelatedLinks never rendered
  // and those blogs passed nothing back to their programme hub. The 9 below are
  // the single-university reviews whose hub is present in valid-urls.json, i.e.
  // resolves and is indexable.
  //
  // Deliberately NOT added:
  //   imt-ghaziabad-online-mba-review-2026, xlri-online-mba-review-2026
  //     no such university in lib/data.ts, so there is no hub to point at.
  //   lpu-online-bba-review-2026, nmims-online-bba-review-2026,
  //   chandigarh-online-bba-review-2026
  //     hub exists but is noindex (fails shouldIndexProgrammeHub: no page
  //     content JSON and no verified fee). Add once the fee data lands.
  //   the four "x-vs-y" comparison posts and the topic posts
  //     no single university owns them.
  'vignan-university-online': {
    mba: {
      universityName: "Vignan's Foundation for Science, Technology & Research Online",
      shortName: 'Vignan',
      programPage: '/universities/vignan-university-online/mba',
      blogs: [
        { slug: 'vignan-online-mba-review', label: 'Vignan Online MBA 2026: Fees, Syllabus, Honest Review' },
      ],
    },
  },
  'dayananda-sagar-university-online': {
    mba: {
      universityName: 'Dayananda Sagar University Online',
      shortName: 'DSU',
      programPage: '/universities/dayananda-sagar-university-online/mba',
      blogs: [
        { slug: 'dsu-online-mba-review', label: 'DSU Online MBA Review 2026: Fees and Honest Rating' },
      ],
    },
  },
  'uttaranchal-university-online': {
    mba: {
      universityName: 'Uttaranchal University Online',
      shortName: 'Uttaranchal',
      programPage: '/universities/uttaranchal-university-online/mba',
      blogs: [
        { slug: 'uu-doon-online-mba-review', label: 'Uttaranchal University Online MBA Review 2026: Fees' },
      ],
    },
  },
  'arka-jain-university-online': {
    mba: {
      universityName: 'ARKA JAIN University Online',
      shortName: 'ARKA JAIN',
      programPage: '/universities/arka-jain-university-online/mba',
      blogs: [
        { slug: 'arka-jain-online-mba-review', label: 'ARKA JAIN Online MBA Review 2026: Fees and GenAI Spec' },
      ],
    },
  },
  'noida-international-university-online': {
    mba: {
      universityName: 'Noida International University Online',
      shortName: 'NIU',
      programPage: '/universities/noida-international-university-online/mba',
      blogs: [
        { slug: 'noida-international-university-online-mba-review', label: 'NIU Online MBA Review 2026: Fees and Honest Rating' },
      ],
    },
  },
  'jaypee-university-online': {
    mba: {
      universityName: 'Jaypee Institute of Information Technology Online',
      shortName: 'Jaypee JIIT',
      programPage: '/universities/jaypee-university-online/mba',
      blogs: [
        { slug: 'jaypee-jiit-online-mba-review', label: 'Jaypee JIIT Online MBA Review 2026: Fees and IT Track' },
      ],
    },
  },
  'deen-dayal-upadhyay-gorakhpur-university-online': {
    mba: {
      universityName: 'DDU Gorakhpur University Online',
      shortName: 'DDU Gorakhpur',
      programPage: '/universities/deen-dayal-upadhyay-gorakhpur-university-online/mba',
      verifyPage: '/verify/deen-dayal-upadhyay-gorakhpur-university-online',
      blogs: [
        { slug: 'ddu-gorakhpur-online-mba-review', label: 'DDU Gorakhpur Online MBA Review 2026: Rs 52,500 From a NAAC A++ University' },
      ],
    },
  },
  'bharati-vidyapeeth-university-online': {
    mba: {
      universityName: 'Bharati Vidyapeeth Online',
      shortName: 'Bharati Vidyapeeth',
      programPage: '/universities/bharati-vidyapeeth-university-online/mba',
      verifyPage: '/verify/bharati-vidyapeeth-online',
      blogs: [
        { slug: 'bharati-vidyapeeth-online-mba-review', label: 'Bharati Vidyapeeth Online MBA Review 2026: Real Fee and the AICTE Advantage' },
      ],
    },
  },
  'parul-university-online': {
    mba: {
      universityName: 'Parul University Online',
      shortName: 'Parul',
      programPage: '/universities/parul-university-online/mba',
      verifyPage: '/verify/parul-university-online',
      blogs: [
        { slug: 'parul-online-mba-review', label: 'Parul University Online MBA Review 2026: Real Fee and the NIRF Category Trap' },
      ],
    },
  },
  'amrita-vishwa-vidyapeetham-online': {
    bba: {
      universityName: 'Amrita Vishwa Vidyapeetham Online',
      shortName: 'Amrita',
      programPage: '/universities/amrita-vishwa-vidyapeetham-online/bba',
      blogs: [
        { slug: 'amrita-online-bba-review-2026', label: 'Amrita Online BBA Review 2026: AHEAD Fees, Honest Take' },
      ],
    },
  },
}

// Reverse map: blog slug → { universityId, program }
export const BLOG_TO_UNIVERSITY: Record<string, { universityId: string; program: string }> =
  Object.entries(UNIVERSITY_PROGRAM_LINKS).reduce(
    (acc, [uniId, programs]) => {
      Object.entries(programs || {}).forEach(([prog, config]) => {
        if (!config) return
        config.blogs.forEach(({ slug }) => {
          acc[slug] = { universityId: uniId, program: prog }
        })
      })
      return acc
    },
    {} as Record<string, { universityId: string; program: string }>
  )

export function getProgramLinks(universityId: string, program: string): ProgramLinks | null {
  return UNIVERSITY_PROGRAM_LINKS[universityId]?.[program] ?? null
}

export function getUniversityFromBlog(
  blogSlug: string
): { universityId: string; program: string; links: ProgramLinks } | null {
  const entry = BLOG_TO_UNIVERSITY[blogSlug]
  if (!entry) return null
  const links = getProgramLinks(entry.universityId, entry.program)
  if (!links) return null
  return { ...entry, links }
}
