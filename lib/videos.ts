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

// Blog slug -> video key. The blog template injects the embed before the
// post's first <h2> and emits VideoObject schema (app/blog/[slug]/page.tsx).
export const VIDEO_BY_BLOG: Record<string, string> = {
  'amity-online-mba-review-2026': 'amity-online-mba-review-2026',
  'amity-online-mba-hr-worth-it': 'amity-online-mba-review-2026',
  'amity-online-mca-fees-review': 'amity-online-mba-review-2026',
  'online-mca-amity-vs-lpu-2026': 'amity-online-mba-review-2026',
  'amity-vs-manipal-online-mba-2026': 'amity-online-mba-review-2026',
  'jain-vs-amity-online-mba-2026': 'amity-online-mba-review-2026',
  'is-amity-university-online-fake-or-legit-2026': 'amity-online-mba-review-2026',
  'amity-online-student-portal-login': 'amity-online-mba-review-2026',
  'amity-online-admission-guide': 'amity-online-mba-review-2026',
}

const escapeHtml = (s: string) =>
  s.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

// Embed block for blog HTML content.
export function videoEmbedHtml(v: SiteVideo, heading: string, caption: string) {
  return `<h2 id="video-review">${escapeHtml(heading)}</h2>
<div style="position:relative;padding-bottom:56.25%;height:0;overflow:hidden;border-radius:12px;margin:0 0 8px"><iframe src="https://www.youtube.com/embed/${v.youtubeId}" title="${escapeHtml(v.title)}" loading="lazy" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" referrerpolicy="strict-origin-when-cross-origin" allowfullscreen style="position:absolute;top:0;left:0;width:100%;height:100%;border:0"></iframe></div>
<p style="font-size:12px;color:#64748b;margin:0 0 28px">${escapeHtml(caption)}</p>
`
}

// Per-video heading and caption, used wherever the video is shown.
export const VIDEO_COPY:Record<string, { heading: string; caption: string }> = {
  'amity-online-mba-review-2026': {
    heading: 'Watch: Our Amity Online MBA Video Review',
    caption: 'Our three-minute review of the Amity Online MBA. Fees shown are indicative, so confirm them on online.amity.edu before you pay.',
  },
}

// University id -> video key. Shown on every page about that university:
// /universities/{id}, all programme hubs and spec pages, its coupon page,
// its /verify page and every /compare pair that includes it.
export const VIDEO_BY_UNIVERSITY: Record<string, string> = {
  'amity-university-online': 'amity-online-mba-review-2026',
}

export function videoForUniversity(...ids: (string | null | undefined)[]) {
  for (const id of ids) {
    const key = id ? VIDEO_BY_UNIVERSITY[id] : undefined
    if (key && VIDEOS[key] && VIDEO_COPY[key]) return { video: VIDEOS[key], ...VIDEO_COPY[key] }
  }
  return null
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
