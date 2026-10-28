import type { Metadata } from 'next'
import { getBlogPage } from '@/lib/blog'
import BlogIndexView from '../../BlogIndexView'

// Page 1 lives at /blog, so this route builds 2..totalPages only. dynamicParams
// = false makes /blog/page/1 and anything past the last page a real 404 rather
// than a soft one.
export const dynamicParams = false

export function generateStaticParams() {
  const { totalPages } = getBlogPage(1)
  return Array.from({ length: totalPages - 1 }, (_, i) => ({ n: String(i + 2) }))
}

export function generateMetadata({ params }: { params: { n: string } }): Metadata {
  const page = Number(params.n)
  const { totalPages } = getBlogPage(page)
  // Self-canonical: pointing page N at /blog would tell Google to drop the
  // posts linked only from here.
  const url = `https://edifyedu.in/blog/page/${page}`
  return {
    title: `Online Degree Guides and Reviews, Page ${page} of ${totalPages}`,
    description: `Page ${page} of the Edify blog archive: older guides and university reviews on online MBA, MCA, BBA and BCA in India, checked against UGC-DEB, NAAC and NIRF data.`,
    alternates: { canonical: url },
    openGraph: { url, type: 'website', title: `Edify Blog, Page ${page}` },
  }
}

export default function BlogArchivePage({ params }: { params: { n: string } }) {
  return <BlogIndexView page={Number(params.n)} />
}
