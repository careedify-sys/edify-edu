// lib/videos.ts
// EdifyEdu's own YouTube reviews, and the pages each one is embedded on.
// Facts below come from the public YouTube watch page of each video
// (title, upload date, duration). Add a video here, then list the pages.

export interface SiteVideo {
  youtubeId: string
  title: string
  description: string
  uploadDate: string // ISO 8601, from YouTube
  duration: string // ISO 8601 duration
}

export const VIDEOS: Record<string, SiteVideo> = {
  'amity-online-mba-review-2026': {
    youtubeId: 'M-6oy3W34oM',
    title: 'Amity Online MBA Review 2026: Fees, Exams & Real Student Problems',
    description:
      'EdifyEdu reviews the Amity University Online MBA: fees, exams, approvals and what real students report. Commission-free, no paid rankings.',
    uploadDate: '2026-11-11T00:17:34-08:00',
    duration: 'PT2M54S',
  },
}

// Blog slug -> video key
export const VIDEO_BY_BLOG: Record<string, string> = {
  'amity-online-mba-review-2026': 'amity-online-mba-review-2026',
}

// University id -> video key (shown on /universities/{id})
export const VIDEO_BY_UNIVERSITY: Record<string, string> = {
  'amity-university-online': 'amity-online-mba-review-2026',
}

// "{universityId}/{program}" -> video key (shown on programme hubs)
export const VIDEO_BY_PROGRAMME: Record<string, string> = {
  'amity-university-online/MBA': 'amity-online-mba-review-2026',
}

export function videoSchema(v: SiteVideo, pageUrl: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    name: v.title,
    description: v.description,
    thumbnailUrl: [
      `https://i.ytimg.com/vi/${v.youtubeId}/maxresdefault.jpg`,
      `https://i.ytimg.com/vi/${v.youtubeId}/hqdefault.jpg`,
    ],
    uploadDate: v.uploadDate,
    duration: v.duration,
    embedUrl: `https://www.youtube.com/embed/${v.youtubeId}`,
    contentUrl: `https://www.youtube.com/watch?v=${v.youtubeId}`,
    url: pageUrl,
    publisher: { '@id': 'https://edifyedu.in/#organization' },
  }
}
