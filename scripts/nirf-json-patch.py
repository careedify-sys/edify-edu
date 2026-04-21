"""
Phase 4.8 — NIRF 2025 JSON Content Patch
Patches all lib/data/page-content/*-mba.json files with correct 2025 NIRF data.
Run from project root: python scripts/nirf-json-patch.py
"""
import os, sys

DIR = 'lib/data/page-content'

def patch_file(filename, replacements):
    filepath = os.path.join(DIR, filename)
    if not os.path.exists(filepath):
        print(f'  SKIP (not found): {filename}', file=sys.stderr)
        return 0
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()
    count = 0
    for old, new in replacements:
        if old == new:
            continue
        while old in content:
            content = content.replace(old, new, 1)
            count += 1
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f'  {filename}: {count} replacements')
    return count

total = 0

# ── assam-don-bosco-university-online-mba.json
total += patch_file('assam-don-bosco-university-online-mba.json', [
    ('NIRF #151 \u00b7 UGC-DEB \u00b7 6 specialisa', 'Not in NIRF 2025 top lists \u00b7 UGC-DEB \u00b7 6 specialisa'),
    ('NIRF #151 overall ranking. EdifyEd', 'Assam Don Bosco University is not listed in NIRF 2025 rankings. EdifyEd'),
    ('NIRF #151 overall ranking (nirfind', 'NIRF not listed in 2025 rankings (nirfind'),
    ('NIRF #151, 2 years (4 semesters, m', 'Not listed in NIRF 2025, 2 years (4 semesters, m'),
    ('NIRF #52, Rs 1,08,500, 3 specialis', 'NAAC A, Rs 1,08,500, 3 specialis'),
    ('NIRF #43, Rs 1,20,000, 8 specialis', 'NIRF not listed (DSU 2025), Rs 1,20,000, 8 specialis'),
    ('NIRF #151 was questioned', 'The absence of a NIRF top-100 listing was questioned'),
    ('NIRF #151 limits national employer', 'The lack of NIRF top-100 listing limits national employer'),
    ('NIRF #151 places Assam Don Bosco U', 'Assam Don Bosco University is not listed in NIRF 2025 rankings'),
    ('NIRF #151 meets their minimum', 'a NIRF top-100 listing meets their minimum'),
    ('NIRF #151', 'Not listed in NIRF 2025'),
])

# ── christ-university-online-mba.json
total += patch_file('christ-university-online-mba.json', [
    ('NIRF #60, 2 years (4 semesters), R', 'NIRF #57 (Management 2025), 2 years (4 semesters), R'),
    ('NIRF #60, Business Analytics Speci', 'NIRF #57 (Management 2025), Business Analytics Speci'),
    ('NIRF #60 \u00b7 UGC-DEB \u00b7 WES Recognise', 'NIRF #57 (Management 2025) \u00b7 UGC-DEB \u00b7 WES Recognise'),
    ('NIRF #60 overall ranking. EdifyEdu', 'NIRF #57 (Management 2025) ranking. EdifyEdu'),
    ('NIRF #60 overall ranking (nirfindi', 'NIRF #57 (Management 2025) ranking (nirfindi'),
    ('NIRF #60, Rs 60K-2L indicative fee', 'NIRF #57 (Management 2025), Rs 60K-2L indicative fee'),
    ('NIRF #18, Rs 1.89L fixed fee, 5 sp', 'NIRF #56 (Management 2025), Rs 1.89L fixed fee, 5 sp'),
    ('NIRF #11, Rs 1,60,000 fixed fee, 5', 'NIRF #14 (University 2025), Rs 1,60,000 fixed fee, 5'),
    ('NIRF #60 did not fully satisfy', 'NIRF #57 (Management 2025) was accepted'),
    ('NIRF #60 in the University categor', 'NIRF #57 in the Management 2025 category'),
    ('NIRF #60 before choosing', 'NIRF #57 before choosing'),
    ('NIRF #60', 'NIRF #57 (Management 2025)'),
])

# ── vit-university-online-mba.json
total += patch_file('vit-university-online-mba.json', [
    ('NIRF #11, 2 years (4 semesters), R', 'NIRF #14 (University 2025), 2 years (4 semesters), R'),
    ('NIRF #11, 5 Specialisations', 'NIRF #14 (University 2025), 5 Specialisations'),
    ('NIRF #11 in the University categor', 'NIRF #14 in the University category (2025)'),
    ('NIRF #11 \u00b7 UGC-DEB \u00b7 WES Recognise', 'NIRF #14 (University 2025) \u00b7 UGC-DEB \u00b7 WES Recognise'),
    ('NIRF #11 overall ranking \u2014 one of ', 'NIRF #14 overall University ranking (2025) \u2014 one of '),
    ('NIRF #11 overall ranking (nirfindi', 'NIRF #14 (University 2025) ranking (nirfindi'),
    ('NIRF #11, Rs 1,60,000 fixed fee, 5', 'NIRF #14 (University 2025), Rs 1,60,000 fixed fee, 5'),
    ('NIRF #18, Rs 1.89L fixed fee, 5 sp', 'NIRF #56 (Management 2025), Rs 1.89L fixed fee, 5 sp'),
    ('NIRF #60, Rs 60K-2L indicative fee', 'NIRF #57 (Management 2025), Rs 60K-2L indicative fee'),
    ('NIRF #11', 'NIRF #14 (University 2025)'),
])

# ── srm-institute-science-technology-online-mba.json
total += patch_file('srm-institute-science-technology-online-mba.json', [
    ('NIRF #18, 2 years (4 semesters), R', 'NIRF #56 (Management 2025), 2 years (4 semesters), R'),
    ('NIRF #18, 5 specialisations', 'NIRF #56 (Management 2025), 5 specialisations'),
    ('NIRF #18 \u00b7 UGC-DEB \u00b7 Category 1', 'NIRF #56 (Management 2025) \u00b7 UGC-DEB \u00b7 Category 1'),
    ('NIRF #18 (Management 2025)', 'NIRF #56 (Management 2025)'),
    ('NIRF #18 ranking. EdifyEdu', 'NIRF #56 (Management 2025) ranking. EdifyEdu'),
    ('NIRF #18, Rs 1.50L\u20131.89L indicativ', 'NIRF #56 (Management 2025), Rs 1.50L\u20131.89L indicativ'),
    ('NIRF #11, Rs 1,60,000 fixed fee, 5', 'NIRF #14 (University 2025), Rs 1,60,000 fixed fee, 5'),
    ('NIRF #60, Rs 60K-2L indicative fee', 'NIRF #57 (Management 2025), Rs 60K-2L indicative fee'),
    ('NIRF #18', 'NIRF #56 (Management 2025)'),
])

# ── jamia-millia-islamia-online-mba.json
total += patch_file('jamia-millia-islamia-online-mba.json', [
    ('NIRF #4 (University 2025) / #28 (Management 2025)', 'NIRF #28 (Management 2025) / #4 (University 2025)'),
    ('NIRF #4, 2 years (4 semesters), Rs', 'NIRF #28 (Management 2025) / #4 (University 2025), 2 years (4 semesters), Rs'),
    ('NIRF #4 \u00b7 UGC-DEB', 'NIRF #28 (Management 2025) / #4 (University 2025) \u00b7 UGC-DEB'),
    ('NIRF #4, Rs 50,000 indicative fee', 'NIRF #28 (Management 2025) / #4 (University 2025), Rs 50,000 indicative fee'),
    ('NIRF #4 in the University category', 'NIRF #4 (University 2025), #28 (Management 2025)'),
    ('NIRF #4', 'NIRF #4 (University 2025)'),
])

# ── sastra-university-online-mba.json
total += patch_file('sastra-university-online-mba.json', [
    ('NIRF #42, 2 years (4 semesters)', 'NIRF #29 (University 2025), 2 years (4 semesters)'),
    ('NIRF #42 \u00b7 UGC-DEB', 'NIRF #29 (University 2025) \u00b7 UGC-DEB'),
    ('NIRF #42, Rs 60K\u20132.4L', 'NIRF #29 (University 2025), Rs 60K\u20132.4L'),
    ('NIRF #42 overall ranking', 'NIRF #29 (University 2025) ranking'),
    ('NIRF #42', 'NIRF #29 (University 2025)'),
])

# ── Live uni JSONs that exist ──────────────────────────────────────────────

# alliance-university-online-mba.json
total += patch_file('alliance-university-online-mba.json', [
    ('NIRF #25', 'NIRF #71 (Management 2025)'),
    ('NIRF #101+', 'NIRF #71 (Management 2025)'),
])

# amrita-vishwa-vidyapeetham-online-mba.json
total += patch_file('amrita-vishwa-vidyapeetham-online-mba.json', [
    ('NIRF #7 \u00b7', 'NIRF #8 (University 2025) \u00b7'),
    ('NIRF #7,', 'NIRF #8 (University 2025),'),
    ("NIRF #7'", "NIRF #8 (University 2025)'"),
    ('NIRF #7 ', 'NIRF #8 (University 2025) '),
    ('NIRF #26 (Management 2025)', 'NIRF #26 (Management 2025)'),
])

# arka-jain-university-online-mba.json
total += patch_file('arka-jain-university-online-mba.json', [
    ('NIRF #52', 'NAAC A accredited (not listed in NIRF 2025)'),
])

# chitkara-university-online-mba.json
total += patch_file('chitkara-university-online-mba.json', [
    ('NIRF #54', 'NIRF #78 (Management 2025)'),
])

# dayananda-sagar-university-online-mba.json
total += patch_file('dayananda-sagar-university-online-mba.json', [
    ('NIRF #43 are solid credentials', 'NAAC A and WES recognition are solid credentials'),
    ('NIRF #43 and WES recognition for R', 'NAAC A and WES recognition for R'),
    ('NIRF #43 in the overall university', 'DSU is not listed in NIRF 2025'),
    ('NIRF #43', 'Not listed in NIRF 2025'),
])

# galgotias-university-online-mba.json
total += patch_file('galgotias-university-online-mba.json', [
    ('NIRF #101, NAAC A+. 7 specialisati', 'NIRF band 101-125 (Management 2025), NAAC A+. 7 specialisati'),
    ('NIRF ranking for Galgotias overall', 'NIRF band for Galgotias overall'),
    ('NIRF #101, NAAC A+, Rs 76,200, 7 s', 'NIRF band 101-125, NAAC A+, Rs 76,200, 7 s'),
    ('NIRF rank of 101+ in management', 'NIRF band 101-125 in management'),
    ('NIRF top-50 filter for postgraduat', 'NIRF top-100 filter for postgraduat'),
    ('NIRF #101', 'NIRF band 101-125 (Management 2025)'),
])

print(f'\nTotal JSON replacements: {total}')
