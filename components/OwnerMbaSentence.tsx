import Link from 'next/link'
import { MBA_OWNER_LINKS } from '@/lib/mba-owner-links'

// One sentence linking a university's two MBA owner pages with their exact
// anchors: the review post ("X online MBA fees") and the hub ("X online MBA
// admission and specialisations"). Renders nothing for other universities.
// `second` gives a different wording for the second owner on a compare page,
// so two owners in one paragraph do not repeat the same sentence.
export default function OwnerMbaSentence({ id, second = false }: { id: string | null | undefined; second?: boolean }) {
  const o = id ? MBA_OWNER_LINKS[id] : undefined
  if (!o) return null
  const cls = 'text-amber-700 font-semibold underline'
  const reviewLink = <Link href={o.review} className={cls}>{o.shortName} online MBA fees</Link>
  const hubLink = <Link href={o.hub} className={cls}>{o.shortName} online MBA admission and specialisations</Link>
  if (second) {
    return <>For {o.shortName}, the {reviewLink} review and the {hubLink} page cover the same ground.</>
  }
  return <>Our review sets out the {reviewLink} plan by plan, and {hubLink} covers eligibility, intake and the full specialisation list.</>
}
