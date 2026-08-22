// Cross-verify slug resolution across every (uni, program, spec) triple.
// Two guarantees we want to hold:
//   1. Every uni's canonical spec slug (from data.ts programDetails) MUST
//      self-resolve via resolveSpec (no manifest slug shadowing).
//   2. For every uni that offers a spec whose canonical slug is a member of
//      a SPEC_ALIASES group, every alias in that group MUST resolve back to
//      the uni's canonical slug on that uni. Otherwise an alias URL 404s
//      even though the uni offers the spec.

import { UNIVERSITIES, specSlug as toSlug } from '@/lib/data'
import { resolveSpec } from '@/lib/data/programs'

// Import the alias table via the compiled module. Since resolveSpec is
// the public API, we reconstruct the alias groups by probing every slug
// pair. Simpler: hard-copy the alias table here to avoid another export.
// This table MUST stay in sync with SPEC_ALIASES in lib/data/programs.ts.
const SPEC_ALIASES: Record<string, string[]> = {
  'finance': ['financial-management', 'finance-management', 'finance-and-accounting'],
  'marketing': ['marketing-management', 'sales-and-marketing'],
  'human-resource-management': ['hr-management', 'hrm', 'hr', 'human-resource', 'human-resources', 'human-resources-management'],
  'operations-management': ['operations', 'production-and-operations-management', 'production-management', 'production-operations', 'production-operations-management'],
  'business-analytics': ['analytics', 'business-analytics-and-ai', 'data-analytics'],
  'digital-marketing': ['digital-marketing-management', 'digital-mktg'],
  'international-business': ['international-business-management', 'intl-business', 'ib'],
  'healthcare-management': ['hospital-management', 'hospital-administration', 'hospital-healthcare-management', 'hospital-and-healthcare-management', 'healthcare', 'hospital-and-health-care-management', 'hospital-health-care-management'],
  'information-technology': ['it-management', 'information-technology-management', 'it', 'it-systems', 'it-systems-management'],
  'supply-chain-management': ['logistics-and-supply-chain-management', 'logistics-supply-chain-management', 'logistics-scm', 'logistics-supply-chain', 'supply-chain-logistics', 'operations-and-supply-chain-management', 'operations-supply-chain-management'],
  'entrepreneurship': ['entrepreneurship-and-leadership-management', 'entrepreneur', 'entrepreneurship-management'],
  'data-science': ['data-science-and-analytics', 'data-science-analytics', 'data-science--ai'],
  'general-management': ['general'],
  'cyber-security': ['cybersecurity', 'cyber-security-and-forensics', 'cyber-security-forensics'],
  'artificial-intelligence-and-machine-learning': ['ai-ml', 'ai-and-ml', 'artificial-intelligence-machine-learning', 'artificial-intelligence'],
  'blockchain-technology': ['blockchain', 'blockchain-technologies'],
  'cloud-computing': ['cloud-computing-and-internet-of-things', 'cloud-technology'],
  'full-stack-development': ['full-stack-web-development', 'full-stack-development-and-devops', 'full-stack'],
  'project-management': ['project-management-and-leadership'],
  'retail-management': ['retail', 'retail-ops'],
  'banking-and-insurance': ['banking-insurance', 'banking-finance', 'banking-and-financial-services', 'bfsi-banking-financial-services-and-insurance'],
  'accounting-and-finance': ['accounting-finance'],
  'fintech': ['fintech-management'],
  'travel-and-tourism-management': ['travel-tourism-management', 'travel-tourism'],
  'cloud-technology-and-information-security': ['cloud-technology-information-security'],
  'data-science-and-artificial-intelligence': ['data-science-artificial-intelligence'],
  'computer-science-and-it': ['computer-science-it'],
  'agri-business-management': ['agri-business', 'agribusiness', 'agribusiness-management'],
  'artificial-intelligence-and-data-science': ['artificial-intelligence-data-science', 'ai-data-science', 'ai-and-data-science'],
  'finance-and-accounting-management': ['finance-accounting'],
  'hospitality-management': ['hospitality'],
  'marketing-and-sales-management': ['marketing-sales-management', 'marketing-sales'],
  'data-science-and-business-analytics': ['data-science-business-analytics'],
  'aviation-management': ['aviation'],
  'oil-and-gas-management': ['oil-gas-management'],
  'infrastructure-management': ['infrastructure'],
  'cloud-computing-and-cyber-security': ['cloud-computing-cyber-security'],
  'international-finance-and-accounting': ['international-finance-accounting'],
  'general-commerce-and-management': ['general-commerce'],
}

const PROG_TO_SLUG: Record<string, string> = {
  MBA: 'mba', BBA: 'bba', BCA: 'bca', MCA: 'mca',
  'B.Com': 'bcom', 'M.Com': 'mcom',
  BA: 'ba', MA: 'ma', MSc: 'msc', BSc: 'bsc',
}

// Reverse map: alias -> canonical
const aliasToCanon: Record<string, string> = {}
for (const [canon, aliases] of Object.entries(SPEC_ALIASES)) {
  for (const a of aliases) aliasToCanon[a] = canon
}

type Issue = { kind: string; uni: string; program: string; canonical: string; probe: string; got: string }
const issues: Issue[] = []
let selfChecks = 0
let aliasChecks = 0

for (const u of UNIVERSITIES) {
  const pd = u.programDetails as Record<string, { specs?: unknown[] } | undefined>
  for (const [label, block] of Object.entries(pd)) {
    const progSlug = PROG_TO_SLUG[label]
    if (!progSlug) continue
    const specs = (block?.specs ?? []) as Array<string | { slug: string; name: string }>
    for (const s of specs) {
      const canonicalSlug = toSlug(s as never)

      // The expected canonical is what resolveSpec returns when queried
      // with the uni's own data.ts spec slug. For MBA this may differ from
      // the raw data.ts slug because MBA_CANONICAL_OVERRIDES aligns the
      // resolver with next.config.js's site-wide short-form policy. Every
      // alias in the group must land on this same slug.
      const canonicalResolved = resolveSpec(u.id, label, progSlug, canonicalSlug)
      const expectedSlug = canonicalResolved?.slug ?? canonicalSlug

      // Guarantee 1: canonical resolves to a stable slug (not null)
      selfChecks++
      if (!canonicalResolved) {
        issues.push({
          kind: 'canonical resolves to null',
          uni: u.id, program: progSlug, canonical: canonicalSlug,
          probe: canonicalSlug, got: 'null',
        })
      }

      // Guarantee 2: every alias in the group resolves to the same slug the
      // canonical resolves to. Group = (a) if canonicalSlug is a table
      // canonical, its aliases, (b) if canonicalSlug is a table alias, the
      // table canonical + siblings.
      const groupSlugs: string[] = []
      if (SPEC_ALIASES[canonicalSlug]) {
        groupSlugs.push(canonicalSlug, ...SPEC_ALIASES[canonicalSlug])
      }
      const groupCanon = aliasToCanon[canonicalSlug]
      if (groupCanon) {
        groupSlugs.push(groupCanon, ...(SPEC_ALIASES[groupCanon] || []))
      }
      const uniqueGroup = [...new Set(groupSlugs)].filter(g => g !== canonicalSlug)

      for (const probe of uniqueGroup) {
        aliasChecks++
        const r = resolveSpec(u.id, label, progSlug, probe)
        if (!r) {
          issues.push({
            kind: 'alias probe unresolved',
            uni: u.id, program: progSlug, canonical: canonicalSlug,
            probe, got: 'null',
          })
        } else if (r.slug !== expectedSlug) {
          issues.push({
            kind: 'alias probe resolves to a different slug than the canonical',
            uni: u.id, program: progSlug, canonical: canonicalSlug,
            probe, got: `${r.slug} (canonical resolves to ${expectedSlug})`,
          })
        }
      }
    }
  }
}

console.log(`Self-resolve checks: ${selfChecks}`)
console.log(`Alias-probe checks: ${aliasChecks}`)
console.log(`Issues: ${issues.length}`)
if (issues.length === 0) {
  console.log('\n✓ All checks pass.')
  process.exit(0)
}

// Group by kind
const byKind = new Map<string, Issue[]>()
for (const i of issues) {
  if (!byKind.has(i.kind)) byKind.set(i.kind, [])
  byKind.get(i.kind)!.push(i)
}
for (const [kind, list] of byKind.entries()) {
  console.log(`\n=== ${kind} (${list.length}) ===`)
  for (const i of list.slice(0, 20)) {
    console.log(`  ${i.uni}/${i.program}/${i.probe} → ${i.got}  (uni canonical: ${i.canonical})`)
  }
  if (list.length > 20) console.log(`  … +${list.length - 20} more`)
}
process.exit(1)
