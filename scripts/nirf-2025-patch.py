"""
Phase 4.8 — NIRF 2025 Data Integrity Patch
Patches lib/data.ts: nirf, nirfMgt, rankingBadge, approvals fields.
Run from project root: python scripts/nirf-2025-patch.py
"""
import re, sys

with open('lib/data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

# ── helper: replace within the block that starts with id: 'slug'
def in_block(text, slug, old, new):
    slug_marker = f"id: '{slug}'"
    pos = text.find(slug_marker)
    if pos == -1:
        print(f'  WARN: slug not found: {slug}', file=sys.stderr)
        return text
    nxt = text.find("\n  {\n    id:", pos + len(slug_marker))
    if nxt == -1:
        nxt = len(text)
    block = text[pos:nxt]
    new_block = block.replace(old, new, 1)
    if new_block == block:
        new_block = re.sub(re.escape(old), new, block, count=1)
    if new_block == block:
        print(f'  WARN: pattern not found in {slug}: {repr(old[:60])}', file=sys.stderr)
    return text[:pos] + new_block + text[nxt:]

def in_block_re(text, slug, pattern, replacement, flags=0):
    slug_marker = f"id: '{slug}'"
    pos = text.find(slug_marker)
    if pos == -1:
        print(f'  WARN slug not found: {slug}', file=sys.stderr)
        return text
    nxt = text.find("\n  {\n    id:", pos + len(slug_marker))
    if nxt == -1:
        nxt = len(text)
    block = text[pos:nxt]
    new_block = re.sub(pattern, replacement, block, count=1, flags=flags)
    if new_block == block:
        print(f'  WARN: re pattern not found in {slug}: {pattern[:60]}', file=sys.stderr)
    return text[:pos] + new_block + text[nxt:]

changes = 0

# ── 1. ignou-online: nirf 0 → 999
content = in_block(content, 'ignou-online', 'nirf: 0,', 'nirf: 999,')
changes += 1

# ── 2. manipal-university-jaipur-online
content = in_block(content, 'manipal-university-jaipur-online',
    "rankingBadge: 'NIRF #38 (University 2024)'",
    "rankingBadge: 'NIRF #81 (Management 2025)'")
content = in_block(content, 'manipal-university-jaipur-online',
    "'NIRF #58'", "'NIRF #81'")
changes += 1

# ── 3. lovely-professional-university-online
content = in_block(content, 'lovely-professional-university-online',
    "rankingBadge: 'NIRF #37 (University 2024)'",
    "rankingBadge: 'NIRF #44 (Management 2025)'")
changes += 1

# ── 4. jain-university-online
content = in_block(content, 'jain-university-online',
    "rankingBadge: 'NIRF #72 (University 2024)'",
    "rankingBadge: 'NIRF #73 (Management 2025)'")
content = in_block(content, 'jain-university-online',
    "'NIRF #62'", "'NIRF #73'")
changes += 1

# ── 5. dr-dy-patil-vidyapeeth-online: badge was NAAC A++ accredited → NIRF #41
content = in_block(content, 'dr-dy-patil-vidyapeeth-online',
    "rankingBadge: 'NAAC A++ accredited'",
    "rankingBadge: 'NIRF #41 (University 2025)'")
content = in_block(content, 'dr-dy-patil-vidyapeeth-online',
    "'NIRF #47'", "'NIRF #41'")
changes += 1

# ── 6. nmims-online
content = in_block(content, 'nmims-online',
    "rankingBadge: 'NIRF #14 (Management 2024)'",
    "rankingBadge: 'NIRF #24 (Management 2025)'")
changes += 1

# ── 7. amity-university-online
content = in_block(content, 'amity-university-online',
    "rankingBadge: 'NIRF #54 (University 2024)'",
    "rankingBadge: 'NIRF #49 (Management 2025)'")
changes += 1

# ── 8. symbiosis-university-online
content = in_block(content, 'symbiosis-university-online',
    "rankingBadge: 'NIRF #9 (Management 2024)'",
    "rankingBadge: 'NIRF #24 (University 2025)'")
content = in_block(content, 'symbiosis-university-online',
    "'NIRF #11'", "'NIRF #24'")
changes += 1

# ── 9. upes-online
content = in_block(content, 'upes-online',
    "rankingBadge: 'NIRF #57 (University 2024)'",
    "rankingBadge: 'NIRF #36 (Management 2025)'")
content = in_block(content, 'upes-online',
    "'NIRF #45'", "'NIRF #36'")
changes += 1

# ── 10. noida-international-university-online: nirf 0 → 999
content = in_block(content, 'noida-international-university-online',
    'nirf: 0,', 'nirf: 999,')
changes += 1

# ── 11. chandigarh-university-online: badge stale year
content = in_block(content, 'chandigarh-university-online',
    "rankingBadge: 'NIRF #26 (University 2024)'",
    "rankingBadge: 'NIRF #32 (Management 2025)'")
changes += 1

# ── 12. manipal-academy-higher-education-online
content = in_block(content, 'manipal-academy-higher-education-online',
    "rankingBadge: 'NIRF #5 (University 2024)'",
    "rankingBadge: 'NIRF #3 (University 2025)'")
content = in_block(content, 'manipal-academy-higher-education-online',
    "'NIRF #14'", "'NIRF #3'")
changes += 1

# ── 13. amrita-vishwa-vidyapeetham-online: badge was University #8, now Management #26
content = in_block(content, 'amrita-vishwa-vidyapeetham-online',
    "rankingBadge: 'NIRF #8 (University 2024)'",
    "rankingBadge: 'NIRF #26 (Management 2025)'")
content = in_block(content, 'amrita-vishwa-vidyapeetham-online',
    "'NIRF #7'", "'NIRF #8'")
changes += 1

# ── 14. galgotias-university-online: in band only → 999, remove badge
content = in_block(content, 'galgotias-university-online',
    'nirf: 101,', 'nirf: 999,')
content = in_block_re(content, 'galgotias-university-online',
    r'nirfMgt: \d+,', 'nirfMgt: 999,')
content = in_block(content, 'galgotias-university-online',
    "rankingBadge: 'NIRF #101+ (University 2024)'",
    "rankingBadge: 'NIRF 101-125 (Management 2025 band — no individual rank)'")
content = in_block(content, 'galgotias-university-online',
    "'NIRF #36'", "'NIRF 101-125 (Management band)'")
changes += 1

# ── 15. sikkim-manipal-university-online: already 999, no badge — no change needed
# In band 151-200 University 2025 — no specific rank available
changes += 0

# ── 16. shoolini-university-online: add rankingBadge (none existed)
# Insert rankingBadge after enrollments or color line
content = in_block_re(content, 'shoolini-university-online',
    r'(  enrollments: 500,\n  \},)',
    "  rankingBadge: 'NIRF #69 (University 2025)',\n  enrollments: 500,\n  },")
changes += 1

# ── 17. dr-mgr-educational-research-institute-online: nirf 0 → 999
content = in_block(content, 'dr-mgr-educational-research-institute-online',
    'nirf: 0,', 'nirf: 999,')
changes += 1

# ── 18. sharda-university-online: add badge, fix nirfMgt band
content = in_block_re(content, 'sharda-university-online',
    r'nirfMgt: \d+,', 'nirfMgt: 999,')
content = in_block_re(content, 'sharda-university-online',
    r'(  enrollments: 500,\n  \},)',
    "  rankingBadge: 'NIRF #87 (University 2025)',\n  enrollments: 500,\n  },")
changes += 1

# ── 19. kurukshetra-university-online: nirf 0 → 999, remove badge
content = in_block(content, 'kurukshetra-university-online',
    'nirf: 0,', 'nirf: 999,')
content = in_block(content, 'kurukshetra-university-online',
    "rankingBadge: 'NIRF #101 (University 2024)'",
    "rankingBadge: 'NIRF 101-150 (University 2025 band — no individual rank)'")
changes += 1

# ── 20. jaypee-university-online: nirf 0 → 999
content = in_block(content, 'jaypee-university-online',
    'nirf: 0,', 'nirf: 999,')
changes += 1

# ── 21. uttaranchal-university-online: already 999, no badge — no change
changes += 0

# ── 22. vignan-university-online: nirf 75 → 70, add badge
content = in_block(content, 'vignan-university-online',
    'nirf: 75,', 'nirf: 70,')
content = in_block_re(content, 'vignan-university-online',
    r'(  enrollments: 500,\n  \},)',
    "  rankingBadge: 'NIRF #70 (University 2025)',\n  enrollments: 500,\n  },")
changes += 1

# ── 23. arka-jain-university-online: nirf 52 → 999, remove NIRF from approvals
content = in_block(content, 'arka-jain-university-online',
    'nirf: 52,', 'nirf: 999,')
content = in_block(content, 'arka-jain-university-online',
    "'NIRF #52'", "'NIRF not listed 2025'")
changes += 1

# ── 24. alliance-university-online: nirf 0 → 71, badge, approvals
content = in_block(content, 'alliance-university-online',
    'nirf: 0,', 'nirf: 71,')
content = in_block(content, 'alliance-university-online',
    "rankingBadge: 'NIRF #101+ (University 2024)'",
    "rankingBadge: 'NIRF #71 (Management 2025)'")
content = in_block(content, 'alliance-university-online',
    "'NIRF #25'", "'NIRF #71'")
changes += 1

# ── 25. bharati-vidyapeeth-university-online: badge stale
content = in_block(content, 'bharati-vidyapeeth-university-online',
    "rankingBadge: 'NIRF #81 (University 2024)'",
    "rankingBadge: 'NIRF #59 (University 2025)'")
changes += 1

# ── 26. chitkara-university-online: add badge, fix approvals
content = in_block(content, 'chitkara-university-online',
    "'NIRF #54'", "'NIRF #78'")
content = in_block_re(content, 'chitkara-university-online',
    r'(  enrollments: 500,\n  \},)',
    "  rankingBadge: 'NIRF #78 (Management 2025)',\n  enrollments: 500,\n  },")
changes += 1

# ── 27. dayananda-sagar-university-online: nirf 43 → 999, remove badge
content = in_block(content, 'dayananda-sagar-university-online',
    'nirf: 43,', 'nirf: 999,')
content = in_block(content, 'dayananda-sagar-university-online',
    "rankingBadge: 'NIRF #101+ (University 2024)'",
    "rankingBadge: 'Not listed in NIRF 2025 rankings'")
content = in_block(content, 'dayananda-sagar-university-online',
    "'NIRF #43'", "'NIRF not listed 2025'")
changes += 1

# ── 28. dy-patil-university-online: already 999 — no change
changes += 0

# ── 29. assam-don-bosco-university-online: nirf 151 → 999, remove NIRF from approvals
content = in_block(content, 'assam-don-bosco-university-online',
    'nirf: 151,', 'nirf: 999,')
content = in_block(content, 'assam-don-bosco-university-online',
    "'NIRF #151'", "'NIRF not listed 2025'")
changes += 1

# ── 30. christ-university-online: badge update, approvals
content = in_block(content, 'christ-university-online',
    "rankingBadge: 'NIRF #63 (University 2024)'",
    "rankingBadge: 'NIRF #57 (Management 2025)'")
content = in_block(content, 'christ-university-online',
    "'NIRF #60'", "'NIRF #57'")
changes += 1

# ── 31. vit-university-online: badge update, approvals
content = in_block(content, 'vit-university-online',
    "rankingBadge: 'NIRF #11 (University 2024)'",
    "rankingBadge: 'NIRF #14 (University 2025)'")
content = in_block(content, 'vit-university-online',
    "'NIRF #11'", "'NIRF #14'")
changes += 1

# ── 32. srm-institute-science-technology-online: add nirfMgt:56, badge update, approvals
content = in_block(content, 'srm-institute-science-technology-online',
    "rankingBadge: 'NIRF #17 (University 2024)'",
    "rankingBadge: 'NIRF #56 (Management 2025)'")
content = in_block(content, 'srm-institute-science-technology-online',
    "'NIRF #18'", "'NIRF #56'")
# Add nirfMgt: 56 after nirf: 11
content = in_block(content, 'srm-institute-science-technology-online',
    'nirf: 11,\n    naac:', 'nirf: 11,\n    nirfMgt: 56,\n    naac:')
changes += 1

# ── 33. jamia-millia-islamia-online: fix badge (was VIT's #11 copy-paste)
content = in_block(content, 'jamia-millia-islamia-online',
    "rankingBadge: 'NIRF #11 (University 2024)'",
    "rankingBadge: 'NIRF #28 (Management 2025)'")
changes += 1

# ── 34. sastra-university-online: badge stale year
content = in_block(content, 'sastra-university-online',
    "rankingBadge: 'NIRF #42 (University 2024)'",
    "rankingBadge: 'NIRF #29 (University 2025)'")
changes += 1

with open('lib/data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f'data.ts: {changes} uni records patched.')
print('Verify with: grep -n "rankingBadge" lib/data.ts | head -40')
