// Campus cover photos shown at the top of /universities/[id].
//
// Two origins in university-covers.json:
// - 'wikimedia': free licence (CC BY, CC BY-SA, CC0, public domain). CC BY and
//   CC BY-SA photos must keep their author, licence link and "cropped".
// - 'official': taken from the university's own website, credited to it.
//   Added on Rishi's instruction (27 Nov 2026); no written permission is on
//   file. Remove an entry if a university objects.
// Each entry was checked to show the named university, not a similarly named
// one. Banners, AI images and tiny files were left out. VIT was removed on
// 27 Nov 2026 (photo shows nothing useful).
// Only CC BY / CC BY-SA photos get a visible credit; see UniversityCover.tsx.
import COVERS from '@/lib/data/university-covers.json'

export interface UniversityCover {
  src: string
  srcSmall: string
  width: number
  height: number
  /** Author name for CC BY / CC BY-SA. Empty for CC0 and public domain. */
  credit: string
  licence: string
  licenceUrl: string
  /** Wikimedia Commons file page. */
  sourceUrl: string
  /** Which campus or constituent the photo shows, when not the main campus. */
  note: string
  origin: 'wikimedia' | 'official'
  /** Original image URL, for official-site photos. */
  imageUrl?: string
}

export function getUniversityCover(id: string): UniversityCover | null {
  return (COVERS as Record<string, UniversityCover>)[id] ?? null
}
