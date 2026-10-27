// Hand-written SEO overrides for the programme HUB pages (/programs/{slug}).
//
// Extracted from app/programs/[...slug]/page.tsx on 2026-10-02 so that
// scripts/check-hub-blog-title-collision.mts can import the titles rather than
// parse them out of a route file. It had to be importable because this is
// exactly where the defect it guards came from.
//
// The defect: on 2026-07-04 (a43d7e7) /programs/mba and /programs/bba were both
// given a "Best Online X Colleges in India 2026" title. Each one is a near
// duplicate of a blog post that already targets that phrase:
//
//   /programs/mba  "Best Online MBA Colleges in India 2026: Fees Compared"
//   /blog/best-online-mba-colleges-india-2026
//                  "Best Online MBA Colleges in India 2026: Top 15 NIRF Ranked"
//
//   /programs/bba  "Best Online BBA Colleges in India 2026: Fees Compared"
//   /blog/best-online-bba-colleges-india-2026
//                  "Best Online BBA Colleges India 2026: NIRF Rank, Tier Verdict"
//
// Two pages carrying the same title is a duplicate-content signal and reads
// badly in a SERP, which is why the repo already gates it for spec pages
// (scripts/check-duplicate-spec-titles.mts). It also made each hub's title
// contradict its own H1: the hub renders "Online MBA in India 2026: N
// UGC-Approved Universities Compared", a complete filterable database, while
// the title promised a curated best-of list.
//
// NOTE on what this is NOT evidence for. /programs/mba fell from position 6.93
// to 11.90 across the two GSC windows either side of that commit, but every
// other programme hub fell too, and the hubs the override did NOT touch fell
// further on average (21.51 places vs 14.13). The retitle cannot be blamed for
// the drop. The duplicate title and the title/H1 contradiction are the reasons
// to fix it, and they stand on their own.
//
// Titles resolved 2026-10-02 by intent:
//   /programs/{mba,bba}  own "online {program} in India", the head term their
//                        H1 and content already answer
//   /blog/best-online-*  keep "best online X colleges in India", the editorial
//                        ranked list, which holds the better position
//   /best-online-mba-india  already differentiated on NIRF Management (30bcb4c)

export interface ProgramHubSeo {
  title: string
  description: string
}

/**
 * Returns the hand-written SEO override for a programme hub, or null to fall
 * through to the generic template in generateMetadata().
 *
 * Keep every title under 60 characters after interpolation, and keep it aligned
 * with the hub's H1. Never write a "Best ... Colleges" title here: that phrasing
 * belongs to the editorial blog posts and the collision gate will reject it.
 */
export function getProgramHubSeo(
  programSlug: string,
  uniCount: number,
  year: number,
): ProgramHubSeo | null {
  switch (programSlug) {
    // Keyword gap 2026-10-26: "online mba courses" (8,100/mo), "online mba courses
    // in india" (3,600) and "online mba in india" (2,900), all Missing while this
    // hub sat at position 6.93 with a 0.16% CTR. The title now carries "Courses".
    case 'mba':
      return {
        title: `Online MBA Courses in India ${year}: ${uniCount} UGC-DEB Universities`,
        description: `Online MBA courses from ${uniCount} UGC-DEB entitled universities: a 2-year degree for graduates. Compare fee, specialisation, NAAC grade and NIRF rank.`,
      }
    case 'bba':
      return {
        title: `Online BBA in India ${year}: ${uniCount} UGC-DEB Universities Compared`,
        description: `Online BBA: a 3-year undergraduate degree you can join after Class 12. ${uniCount} UGC-DEB approved universities compared on fee, NAAC grade and specialisation. No paid rankings.`,
      }
    // BSc: only two universities list an online BSc, and both are in lab-free
    // subjects. The searcher's real question is which subjects can run online,
    // so the title answers that instead of advertising a count of two.
    case 'bsc':
      return {
        title: `Online BSc in India ${year}: Which Subjects UGC Allows Online`,
        description: `UGC allows an online BSc only where practical work is programming and coding, so lab subjects cannot run online. ${uniCount} UGC-DEB universities offer one, in Data Science and Economics.`,
      }
    // BA / MA / MSc (keyword gap 2026-10-26): the hubs existed but carried the
    // generic "Online BA India 2026: N+ UGC-DEB Colleges" title and ranked for
    // none of "online ba degree" (1,900/mo), "ma degree online" (1,600/mo) or
    // "msc maths online" (880/mo). Subjects named are the most offered in
    // lib/data.ts for each programme.
    case 'ba':
      return {
        title: `Online BA Degree in India ${year}: ${uniCount} UGC-DEB Universities`,
        description: `Online BA: a 3-year degree after Class 12. Compare ${uniCount} UGC-DEB universities in Political Science, English, History, Sociology and Economics.`,
      }
    case 'ma':
      return {
        title: `Online MA Degree in India ${year}: ${uniCount} UGC-DEB Universities`,
        description: `Online MA: a 2-year postgraduate degree. Compare ${uniCount} UGC-DEB universities in Sociology, English, Political Science, Economics and History.`,
      }
    case 'msc':
      return {
        title: `Online MSc in India ${year}: Maths, Data Science and More`,
        description: `An online MSc runs only where practicals are coding, so lab sciences are out. Compare ${uniCount} UGC-DEB universities, mostly in Maths and Data Science.`,
      }
    default:
      return null
  }
}

/** Every programme slug that carries a hand-written override. Used by the gate. */
export const PROGRAM_HUB_SEO_SLUGS: readonly string[] = ['mba', 'bba', 'bsc', 'ba', 'ma', 'msc']
