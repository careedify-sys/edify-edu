// scripts/build-spec-allowlist.mts
// Emits lib/data/spec-allowlist.json, the edge-runtime allowlist middleware
// section 2f uses to return a real HTTP 404 for
// /universities/{uni}/{prog}/{spec} where the spec does not exist for that
// (uni, prog) pair.
//
// Why this is needed at the edge and not in the route: the spec routes call
// notFound() in both the page component and generateMetadata, yet still serve
// the not-found UI inside a 200. dynamicParams=false is not available here
// either. Measured on 2026-08-29, it would have 404'd 148 spec pages that
// render real content plus 2,991 alias URLs that currently 308 onto their
// canonical slug, because generateStaticParams deliberately excludes both
// (prerendering an alias would turn its redirect into a meta-refresh, see the
// note on getProgramSpecParams in lib/data/programs.ts). So the status has to
// be decided before Next routes the request.
//
// Oracle: resolveSpec() in lib/data/programs.ts. This script CALLS it rather
// than reimplementing it, and scripts/check-spec-allowlist.ts re-runs the
// comparison on pre-commit so the file cannot drift from the resolver.
//
// Encoding: { s: string[], m: { "uniId|progSlug": number[] } }. Slugs are
// dictionary-encoded because the 5,294 accepted triples share only 483
// distinct slugs. 48 KB, versus roughly 240 KB for the naive form.
//
// Run: npx tsx scripts/build-spec-allowlist.mts

import { writeFileSync } from 'fs'
import { buildSpecAllowlist } from './spec-allowlist-source'

const { payload, stats } = buildSpecAllowlist()
const out = 'lib/data/spec-allowlist.json'
writeFileSync(out, JSON.stringify(payload) + '\n', 'utf8')

console.log(`Wrote ${out}`)
console.log(`  distinct spec slugs      : ${payload.s.length}`)
console.log(`  (uni, programme) pairs   : ${Object.keys(payload.m).length}`)
console.log(`  accepted (uni,prog,spec) : ${stats.triples}`)
console.log(`  alias -> canonical pairs : ${stats.aliases}`)
console.log(`  pairs left to next.config: ${stats.loopsAvoided}`)
console.log(`  bytes                    : ${JSON.stringify(payload).length}`)
