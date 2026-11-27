import type { Metadata } from 'next'
import '../whatsapp.css'
import ListsClient from './ListsClient'
import { waLists } from '../campaign-actions'
import { waMode } from '../mode'

export const dynamic = 'force-dynamic'
export const revalidate = 0
export const metadata: Metadata = { title: 'Lists · WhatsApp · edifyedu.in', robots: { index: false, follow: false } }

export default async function ListsPage({ searchParams }: { searchParams: { list?: string } }) {
  const r = await waLists()
  const want = typeof searchParams?.list === 'string' ? searchParams.list : null
  const lists = r.ok ? r.lists : []
  return <ListsClient mode={waMode()} initialLists={lists} initialSelected={lists.some(l => l.id === want) ? want : null} error={r.ok ? null : r.error} />
}
