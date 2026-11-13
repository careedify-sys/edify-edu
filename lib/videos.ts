// lib/videos.ts
// edifyedu.in's own YouTube reviews, and the pages each one is embedded on.
// Facts below come from the public YouTube watch page of each video
// (title, upload date, duration). Add a video here, then list the pages.

import { getUniversityById } from './data'
import { feeCheckedOn, formatIsoDate, COUNSELLOR_FEE_LINE } from './fee-plans'

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
      'edifyedu.in reviews the Amity University Online MBA: fees, exams, approvals and what real students report. Commission-free, no paid rankings.',
    uploadDate: '2026-11-11T00:17:34-08:00',
    duration: 'PT2M54S',
  },
  'nmims-online-mba-review-2026': {
    youtubeId: 'sNp-Lk88FMQ',
    title: 'NMIMS Online MBA Review 2026: UGC Debar, Fees, Exam Fees & Student Problems',
    description:
      'edifyedu.in reviews the NMIMS Online MBA: the past UGC debarment, fees, exam fees and what real students report. Commission-free, no paid rankings.',
    uploadDate: '2026-11-11T03:52:11-08:00',
    duration: 'PT3M38S',
  },
  'symbiosis-online-mba-review-2026': {
    youtubeId: '1nFgU_narc4',
    title: 'Symbiosis Online MBA Review 2026 (SSODL): Fees, Placements & Student Problems',
    description:
      'edifyedu.in reviews the Symbiosis (SSODL) Online MBA: fees, placements and what real students report. Commission-free, no paid rankings.',
    uploadDate: '2026-11-12T00:01:36-08:00',
    duration: 'PT3M46S',
  },
  'muj-online-mba-review-2026': {
    youtubeId: '3hCv0Xyg_fI',
    title: 'Manipal University Jaipur Online MBA Review 2026: Honest Fees, Exams & Student Problems',
    description:
      'edifyedu.in reviews the Manipal University Jaipur Online MBA: fees, exams and what real students report. Commission-free, no paid rankings.',
    uploadDate: '2026-11-12T00:09:25-08:00',
    duration: 'PT5M28S',
  },
  'smu-online-mba-review-2026': {
    youtubeId: 'YiWCd7R5o88',
    title: 'Sikkim Manipal University Online MBA Review 2026: Fees, Placements & Student Problems',
    description:
      'edifyedu.in reviews the Sikkim Manipal University Online MBA: fees, placements and what real students report. Commission-free, no paid rankings.',
    uploadDate: '2026-11-12T00:12:52-08:00',
    duration: 'PT4M9S',
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
  'nmims-online-mba-review-2026': 'nmims-online-mba-review-2026',
  'nmims-online-bba-review-2026': 'nmims-online-mba-review-2026',
  'nmims-vs-symbiosis-online-mba-2026': 'nmims-online-mba-review-2026',
  'is-nmims-online-fake-or-legit-2026': 'nmims-online-mba-review-2026',
  'nmims-online-admission-guide': 'nmims-online-mba-review-2026',
  'symbiosis-online-mba-review-2026': 'symbiosis-online-mba-review-2026',
  'symbiosis-online-bba-review-2026': 'symbiosis-online-mba-review-2026',
  'muj-online-mba-review-2026': 'muj-online-mba-review-2026',
  'muj-online-bba-review-2026': 'muj-online-mba-review-2026',
  'is-manipal-university-jaipur-fake-or-legit-2026': 'muj-online-mba-review-2026',
  'online-manipal-mba-review-2026': 'muj-online-mba-review-2026',
  'smu-online-mba-review': 'smu-online-mba-review-2026',
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
    caption: 'Our three-minute review of the Amity Online MBA.',
  },
  'nmims-online-mba-review-2026': {
    heading: 'Watch: Our NMIMS Online MBA Video Review',
    caption: 'Our review of the NMIMS Online MBA.',
  },
  'symbiosis-online-mba-review-2026': {
    heading: 'Watch: Our Symbiosis Online MBA Video Review',
    caption: 'Our review of the Symbiosis (SSODL) Online MBA.',
  },
  'muj-online-mba-review-2026': {
    heading: 'Watch: Our Manipal University Jaipur Online MBA Video Review',
    caption: 'Our review of the Manipal University Jaipur Online MBA.',
  },
  'smu-online-mba-review-2026': {
    heading: 'Watch: Our Sikkim Manipal University Online MBA Video Review',
    caption: 'Our review of the Sikkim Manipal University Online MBA.',
  },
}

// University id -> video key. Shown on every page about that university:
// /universities/{id}, all programme hubs and spec pages, its coupon page,
// its /verify page and every /compare pair that includes it.
export const VIDEO_BY_UNIVERSITY: Record<string, string> = {
  'amity-university-online': 'amity-online-mba-review-2026',
  'nmims-online': 'nmims-online-mba-review-2026',
  'symbiosis-university-online': 'symbiosis-online-mba-review-2026',
  'manipal-university-jaipur-online': 'muj-online-mba-review-2026',
  'sikkim-manipal-university-online': 'smu-online-mba-review-2026',
}

// Other ids (e.g. /verify slugs with no site record) that should show a
// university's video. Amity University Rajasthan awards some Amity Online degrees.
export const VIDEO_UNI_ALIASES: Record<string, string> = {
  'amity-university-rajasthan-online': 'amity-university-online',
  'narsee-monjee-institute-of-management-studies-nmims-online': 'nmims-online',
  'symbiosis-international-online': 'symbiosis-university-online',
  'manipal-university-online': 'manipal-university-jaipur-online',
}

// Posts that discuss a university without being about it: the video goes at
// the end of the section where the university is first named in body text.
// Skips posts about another single university (its review, a vs-page that
// excludes this one, a legitimacy check), where the video would be off-topic.
//
// Slug prefixes of posts about one specific university. A mention rule
// skips these, except the prefixes of its own university.
const UNI_PREFIXES = ['imt', 'jamia', 'icfai', 'amity', 'nmims', 'noida-international', 'lpu', 'bits', 'jain', 'du-online', 'xlri', 'mahe', 'upes', 'dy-patil', 'chandigarh', 'symbiosis', 'ignou', 'uu-doon', 'galgotias', 'shoolini', 'jaypee', 'iim', 'srm', 'muj', 'smu', 'online-manipal']
const skipOthers = (...own: string[]) =>
  new RegExp(`review|fake-or-legit|^(${UNI_PREFIXES.filter(p => !own.includes(p)).join('|')})-`)

// Rules are first-match: a post that names two of these universities shows
// the video of the earlier rule (Amity, then NMIMS, Symbiosis, MUJ, SMU).
export const VIDEO_MENTION_RULES: { video: string; text: RegExp; slug: RegExp; skipSlug: RegExp }[] = [
  { video: 'amity-online-mba-review-2026', text: />[^<]*\bAmity\b/, slug: /mba/, skipSlug: skipOthers('amity') },
  { video: 'nmims-online-mba-review-2026', text: />[^<]*\bNMIMS\b/, slug: /mba/, skipSlug: skipOthers('nmims') },
  { video: 'symbiosis-online-mba-review-2026', text: />[^<]*\b(Symbiosis|SSODL)\b/, slug: /mba/, skipSlug: skipOthers('symbiosis') },
  { video: 'muj-online-mba-review-2026', text: />[^<]*\b(Manipal University Jaipur|MUJ)\b/, slug: /mba/, skipSlug: skipOthers('muj') },
  { video: 'smu-online-mba-review-2026', text: />[^<]*\b(Sikkim Manipal|SMU)\b/, slug: /mba/, skipSlug: skipOthers('smu') },
]

// Returns [videoKey, insertAt] for a post with no VIDEO_BY_BLOG entry, or null.
export function videoMentionPlacement(slug: string, html: string): [string, number] | null {
  for (const r of VIDEO_MENTION_RULES) {
    if (!r.slug.test(slug) || r.skipSlug.test(slug)) continue
    const m = r.text.exec(html)
    if (!m) continue
    const next = html.indexOf('<h2', m.index)
    return [r.video, next >= 0 ? next : html.length]
  }
  return null
}

// Caption = the per-video line plus the dated fee line from lib/data.ts
// (the university's fee plan checkedOn). No date is shown when the fee
// source is undated.
export function videoCaption(key: string): string {
  const base = VIDEO_COPY[key]?.caption ?? ''
  const uniId = Object.keys(VIDEO_BY_UNIVERSITY).find(id => VIDEO_BY_UNIVERSITY[id] === key)
  const u = uniId ? getUniversityById(uniId) : undefined
  const checked = u ? feeCheckedOn(u, 'MBA') : null
  return [base, checked ? `Fees checked on ${formatIsoDate(checked)}.` : '', COUNSELLOR_FEE_LINE].filter(Boolean).join(' ')
}

export function videoForUniversity(...ids: (string | null | undefined)[]) {
  for (const raw of ids) {
    const id = raw ? VIDEO_UNI_ALIASES[raw] ?? raw : undefined
    const key = id ? VIDEO_BY_UNIVERSITY[id] : undefined
    if (key && VIDEOS[key] && VIDEO_COPY[key]) return { video: VIDEOS[key], ...VIDEO_COPY[key], caption: videoCaption(key) }
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
