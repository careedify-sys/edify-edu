// lib/answers/provenance.ts
// Reader for data/answer-provenance.json. provenance(id) throws on an unknown
// id, so an answer that names a source that does not exist fails the build
// instead of shipping an unsourced claim.
import data from '../../data/answer-provenance.json'

export interface ProvenanceRow {
  id: string
  kind: 'statement' | 'absence'
  page: string
  section: string
  claim: string
  source_url: string
  fetched_at: string
  snippet_max_25_words: string
}

const ROWS = new Map((data.rows as ProvenanceRow[]).map(r => [r.id, r]))

export function provenance(id: string): ProvenanceRow {
  const r = ROWS.get(id)
  if (!r) throw new Error(`answer-provenance: unknown row "${id}"`)
  return r
}
export function allProvenance(): ProvenanceRow[] { return Array.from(ROWS.values()) }
