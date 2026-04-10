import sys, openpyxl, re
from collections import defaultdict
sys.stdout.reconfigure(encoding='utf-8')

wb = openpyxl.load_workbook('C:/Users/91706/Downloads/mca.xlsx')
ws = wb.active

ID_MAP = {
    'Amity University': 'amity-university-online',
    'Amrita Vishwa Vidyapeetham': 'amrita-vishwa-vidyapeetham-online',
    'Assam Don Bosco University': 'assam-don-bosco-university-online',
    'Assam Down Town University': 'assam-down-town-university-online',
    'B.S. Abdur Rahman Institute of Science and Technology': 'bs-abdur-rahman-university-online',
    'Bharati Vidyapeeth': 'bharati-vidyapeeth-university-online',
    'Centurion University of Technology and Management': 'centurion-university-online',
    'Chandigarh University': 'chandigarh-university-online',
    'Charotar University of Science & Technology': 'charusat-university-online',
    'Chatrapati Shahuji Maharaj University': 'chhatrapati-shahu-ji-maharaj-university-online',
    'Christ (Deemed to be University)': 'christ-university-online',
    'Datta Meghe Institute of Higher Education and Research': 'datta-meghe-university-online',
    'Dayananda Sagar University': 'dayananda-sagar-university-online',
    'Desh Bhagat University': 'desh-bhagat-university-online',
    'Dr. Babasaheb Ambedkar Open University': 'dr-babasaheb-ambedkar-open-university-online',
    'Dr. D.Y. Patil Vidyapeeth (Pune)': 'dr-dy-patil-vidyapeeth-online',
    'G.L.A. University': 'gla-university-online',
    'Galgotias University': 'galgotias-university-online',
    'Ganpat university': 'ganpat-university-online',
    'Graphic Era University': 'graphic-era-university-online',
    'Guru Ghasidas Vishwavidyalaya': 'guru-ghasidas-vishwavidyalaya-online',
    'Guru Kashi University': 'guru-kashi-university-online',
    'Guru Nanak Dev University': 'guru-nanak-dev-university-online',
    'Hindustan Institute of Technology and Science (HITS)': 'hindustan-institute-technology-online',
    'Jain (Deemed-to-be University)': 'jain-university-online',
    'Jaipur National University': 'jaipur-national-university-online',
    'Jamia Hamdard': 'jamia-hamdard-online',
    'Koneru Lakshmaiah Education Foundation': 'kl-university-online',
    'Kurukshetra University': 'kurukshetra-university-online',
    'Lovely Professional University': 'lovely-professional-university-online',
    'MATS University': 'mats-university-online',
    'Maharishi Markandeshwar': 'maharishi-markandeshwar-university-online',
    'Manav Rachna International Institute of Research and Studies': 'manav-rachna-online',
    'Mangalayatan University': 'mangalayatan-university-online',
    'Manipal Academy of Higher Education': 'manipal-academy-higher-education-online',
    'Manipal University Jaipur': 'manipal-university-jaipur-online',
    'Marwadi University': 'marwadi-university-online',
    'Mody University of Science and Technology': 'mody-university-online',
    'Noida International University': 'noida-international-university-online',
    'Parul University': 'parul-university-online',
    'S.R.M. Institute of Sciences and Technology': 'srm-institute-science-technology-online',
    'Savitribai Phule Pune University': 'savitribai-phule-pune-university-online',
    'Shanmugha Arts, Science, Technology & Research Academy': 'shanmugha-arts-science-technology-research-online',
    'Sharda University': 'sharda-university-online',
    'Shobhit Institute of Engineering & Technology': 'shobhit-university-online',
    'Shoolini University of Biotechnology and Management Sciences': 'shoolini-university-online',
    'Shree Guru Gobind Singh Tricentenary University': 'shree-guru-gobind-singh-tricentenary-university-online',
    'Shri Ramasamy Memorial University': 'shri-ramasamy-memorial-university-online',
    'Sikkim Manipal University': 'sikkim-manipal-university-online',
    'University of Mysore': 'university-of-mysore-online',
    'University of Petroleum and Energy': 'upes-online',
    'Uttaranchal University': 'uttaranchal-university-online',
    'Vellore Institute of Technology': 'vit-vellore-online',
    "Vignan's Foundation for Science, Technology and Research": 'vignan-university-online',
    'Visveswaraya Technological University': 'vtu-online',
    'Vivekananda Global University': 'vivekananda-global-university-online',
    'Yenepoya University': 'yenepoya-university-online',
}

uni_data = defaultdict(list)
for row in ws.iter_rows(min_row=2, values_only=True):
    if row[0]:
        uni_data[row[0].strip()].append({
            'spec': (row[2] or 'General').strip(),
            'fees': str(row[8]).strip() if row[8] else '',
            'highlight': str(row[9]).strip() if row[9] else '',
        })

def esc(t):
    return t.replace('\\', '\\\\').replace("'", "\\'")

def make_meta(uni_name, rows):
    uid = ID_MAP.get(uni_name)
    if not uid:
        return None

    hl = next((r['highlight'] for r in rows if r['highlight']), '')
    fees_str = next((r['fees'] for r in rows if r['fees']), '')
    specs = list(dict.fromkeys(
        r['spec'] for r in rows if r['spec'].lower() not in ('none','general','')
    ))

    uni_short = uni_name
    for s in [' (Deemed to be University)', ' (Deemed-to-be University)', ' Institute of Sciences and Technology',
              ' Foundation for Science, Technology and Research']:
        uni_short = uni_short.replace(s, '')

    # Extract total fee
    fee_display = ''
    m = re.search(r'Total.*?(?:Fee|Course Fee)[:\s]*(?:Rs\.?|₹)\s*([\d,]+)', fees_str, re.IGNORECASE)
    if m:
        try:
            amt = int(m.group(1).replace(',',''))
            if amt > 10000:
                fee_display = f'Rs. {amt//1000}K total'
        except: pass

    # Extract key highlights (first 2)
    pts = [p.strip() for p in re.split(r';|\n', hl) if p.strip() and len(p.strip()) > 5][:2]

    # Build meta description (150-160 chars target)
    spec_part = ''
    if specs:
        if len(specs) <= 2:
            spec_part = ', '.join(specs)
        else:
            spec_part = f"{specs[0]}, {specs[1]} +{len(specs)-2} more"

    parts = [f"Online MCA from {uni_short}"]
    if spec_part:
        parts.append(f"specialisations in {spec_part}")
    if fee_display:
        parts.append(fee_display)
    if pts:
        parts.append(pts[0].rstrip('.'))
    parts.append("UGC DEB approved. Admission open 2026")

    meta_desc = '. '.join(parts) + '.'
    meta_desc = re.sub(r'\.\.+', '.', meta_desc)
    if len(meta_desc) > 160:
        meta_desc = meta_desc[:157] + '...'

    # Keywords
    year = 2026
    kw_specs = [f"online MCA {s.lower()}" for s in specs[:3]]
    keywords = [
        f"{uni_short} online MCA",
        f"{uni_short} MCA fees",
        f"{uni_short} MCA syllabus",
        f"{uni_short} MCA admission {year}",
        f"{uni_short} MCA specialisations",
    ] + kw_specs + [
        f"online MCA {uni_short.lower()}",
        f"{uni_short} MCA UGC approved",
    ]

    return uid, esc(meta_desc), esc(', '.join(keywords))

# Read content.ts
with open('lib/content.ts', 'r', encoding='utf-8') as f:
    content = f.read()

updated = 0
for uni_name in sorted(uni_data.keys()):
    result = make_meta(uni_name, uni_data[uni_name])
    if not result:
        continue
    uid, meta_desc, keywords = result
    key_pat = re.escape(f"'{uid}||MCA'")
    entry_match = re.search(key_pat + r":\s*\{", content)
    if not entry_match:
        continue

    start = entry_match.start()
    depth = 0
    pos = entry_match.end() - 1
    while pos < len(content):
        if content[pos] == '{': depth += 1
        elif content[pos] == '}':
            depth -= 1
            if depth == 0: break
        pos += 1
    end = pos + 2
    block = content[start:end]

    if 'metaDesc' not in block:
        insert = f"\n    metaDesc: '{meta_desc}',\n    metaKeywords: '{keywords}',"
        new_block = block[:-2] + insert + '\n  },'
        content = content[:start] + new_block + content[end:]
        updated += 1

with open('lib/content.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"Added metaDesc + metaKeywords to {updated} MCA entries")
