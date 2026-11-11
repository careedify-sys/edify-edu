// components/YouTubeVideo.tsx
// Responsive YouTube embed plus VideoObject JSON-LD. No hooks, so it works in
// server and client components alike. Data lives in lib/videos.ts.
import { videoSchema, type SiteVideo } from '@/lib/videos'

export default function YouTubeVideo({
  video,
  pageUrl,
  heading,
  withSchema = true,
}: {
  video: SiteVideo
  pageUrl: string
  heading?: string
  withSchema?: boolean
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5">
      {withSchema && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(videoSchema(video, pageUrl)) }}
        />
      )}
      {heading && (
        <h2 className="font-display text-xl font-bold text-navy mb-4">{heading}</h2>
      )}
      <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 12 }}>
        <iframe
          src={`https://www.youtube.com/embed/${video.youtubeId}`}
          title={video.title}
          loading="lazy"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          referrerPolicy="strict-origin-when-cross-origin"
          allowFullScreen
          style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 0 }}
        />
      </div>
      <p className="text-xs text-slate-500 mt-2">{video.title}</p>
    </section>
  )
}
