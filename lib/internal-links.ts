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
      ],
    },
  },
  'nmims-online': {
    mba: {
      universityName: 'NMIMS Online',
      shortName: 'NMIMS',
      programPage: '/universities/nmims-online/mba',
      comparePage: '/compare?a=nmims-online&b=amity-university-online',
      verifyPage: '/verify/nmims-online',
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
      verifyPage: '/verify/symbiosis-university-online',
      blogs: [
        { slug: 'symbiosis-online-mba-review-2026', label: 'Symbiosis Online MBA Review 2026: SSODL Fees, Scholarship and Honest Verdict' },
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
      ],
    },
  },
  'manipal-university-jaipur-online': {
    mba: {
      universityName: 'Manipal University Jaipur Online',
      shortName: 'MUJ',
      programPage: '/universities/manipal-university-jaipur-online/mba',
      comparePage: '/compare?a=manipal-university-jaipur-online&b=amity-university-online',
      verifyPage: '/verify/manipal-university-jaipur-online',
      blogs: [
        { slug: 'is-manipal-university-jaipur-fake-or-legit-2026', label: 'Is Manipal University Jaipur Fake or Legit? 2026 Fact Check' },
        { slug: 'muj-online-mba-review-2026', label: 'MUJ Online MBA Review 2026: Fees, NAAC and Honest Verdict' },
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
  },
  'ignou-online': {
    mba: {
      universityName: 'IGNOU Online',
      shortName: 'IGNOU',
      programPage: '/universities/ignou-online/mba',
      verifyPage: '/verify/ignou-online',
      blogs: [
        { slug: 'ignou-online-mba-review-2026', label: 'IGNOU Online MBA Review 2026: Fees, Admission and Honest Verdict' },
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
      blogs: [],
    },
  },
  'jain-university-online': {
    mba: {
      universityName: 'Jain University Online',
      shortName: 'Jain',
      programPage: '/universities/jain-university-online/mba',
      blogs: [],
    },
  },
  'galgotias-university-online': {
    mba: {
      universityName: 'Galgotias University Online',
      shortName: 'Galgotias',
      programPage: '/universities/galgotias-university-online/mba',
      blogs: [],
    },
  },
  'dy-patil-university-online': {
    mba: {
      universityName: 'DY Patil University Online',
      shortName: 'DY Patil',
      programPage: '/universities/dy-patil-university-online/mba',
      blogs: [],
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
