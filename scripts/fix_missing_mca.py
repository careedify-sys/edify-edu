import sys, re
sys.stdout.reconfigure(encoding='utf-8')

# University ID → MCA programDetails data
MCA_DATA = {
    'bs-abdur-rahman-university-online': {
        'specs': [],
        'fees': '₹1.21L total (₹30K/sem)',
        'feeMin': 121000, 'feeMax': 121000,
        'duration': '2 Yrs',
    },
    'centurion-university-online': {
        'specs': [],
        'fees': '₹1.20L total (₹30K/sem)',
        'feeMin': 120000, 'feeMax': 120000,
        'duration': '2 Yrs',
    },
    'datta-meghe-university-online': {
        'specs': [],
        'fees': '₹1.40L total (₹70K/year)',
        'feeMin': 140000, 'feeMax': 140000,
        'duration': '2 Yrs',
    },
    'desh-bhagat-university-online': {
        'specs': ['Cyber Security', 'AI and Data Science'],
        'fees': '₹88K total (₹22K/sem)',
        'feeMin': 88000, 'feeMax': 88000,
        'duration': '2 Yrs',
    },
    'dr-dy-patil-vidyapeeth-online': {
        'specs': [],
        'fees': 'Contact for fee details',
        'feeMin': 0, 'feeMax': 0,
        'duration': '2 Yrs',
    },
    'hindustan-institute-technology-online': {
        'specs': ['Computer Science and IT', 'Cyber Security & Cloud Computing', 'Data Science'],
        'fees': '₹90K total (₹22.5K/sem)',
        'feeMin': 90000, 'feeMax': 90000,
        'duration': '2 Yrs',
    },
    'jaipur-national-university-online': {
        'specs': [],
        'fees': '₹1.06L total (₹26.6K/sem)',
        'feeMin': 106400, 'feeMax': 106400,
        'duration': '2 Yrs',
    },
    'noida-international-university-online': {
        'specs': ['AI & Data Science'],
        'fees': '₹1.18L total (₹59K/year)',
        'feeMin': 118000, 'feeMax': 118000,
        'duration': '2 Yrs',
    },
    'savitribai-phule-pune-university-online': {
        'specs': [],
        'fees': '₹1.58L total (₹39.72K/sem)',
        'feeMin': 158880, 'feeMax': 158880,
        'duration': '2 Yrs',
    },
    'vivekananda-global-university-online': {
        'specs': ['Artificial Intelligence', 'Cloud Technology & Information Security'],
        'fees': '₹1.50L total (₹37.5K/sem)',
        'feeMin': 150000, 'feeMax': 150000,
        'duration': '2 Yrs',
    },
    'yenepoya-university-online': {
        'specs': ['Computer Science and Information Technology', 'Cloud Computing and Cyber Security'],
        'fees': '₹50K total (₹25K/year)',
        'feeMin': 50000, 'feeMax': 50000,
        'duration': '2 Yrs',
    },
}

with open('lib/data.ts', 'r', encoding='utf-8') as f:
    content = f.read()

updated = 0

for uid, mca in MCA_DATA.items():
    # Find university block by id
    id_pat = re.search(rf"id: '{re.escape(uid)}'", content)
    if not id_pat:
        print(f"NOT FOUND: {uid}")
        continue

    start = id_pat.start()
    # Find the opening brace before id: (it's the object opening)
    obj_start = content.rfind('{', 0, start)

    # Find closing brace of this university object by counting braces
    depth = 0
    pos = obj_start
    while pos < len(content):
        if content[pos] == '{': depth += 1
        elif content[pos] == '}':
            depth -= 1
            if depth == 0: break
        pos += 1
    obj_end = pos  # position of closing }

    block = content[obj_start:obj_end+1]

    # 1. Add 'MCA' to programs array if not already present
    if "'MCA'" not in block.split('programs:')[1].split(']')[0] if 'programs:' in block else True:
        # Find programs: [...] and add MCA
        prog_match = re.search(r"(programs:\s*\[)([^\]]*?)(\])", block)
        if prog_match:
            existing = prog_match.group(2).strip()
            if "'MCA'" not in existing:
                new_prog = prog_match.group(1) + existing + (", " if existing else "") + "'MCA'" + prog_match.group(3)
                block = block[:prog_match.start()] + new_prog + block[prog_match.end():]
                print(f"Added MCA to programs: {uid}")

    # 2. Add MCA to programDetails if not present
    pd_match = re.search(r"(programDetails:\s*\{)", block)
    if pd_match and "'MCA'" not in block[pd_match.end():]:
        specs_ts = str(mca['specs']).replace('"', "'")
        # Build MCA entry
        specs_arr = "[" + ", ".join(f"'{s}'" for s in mca['specs']) + "]" if mca['specs'] else "['General']"
        roles = ['Software Developer', 'Systems Analyst', 'Data Analyst', 'Application Developer', 'IT Consultant']
        roles_arr = "[" + ", ".join(f"'{r}'" for r in roles) + "]"
        companies_arr = "['TCS', 'Infosys', 'Wipro', 'HCL', 'Tech Mahindra', 'Cognizant', 'Accenture', 'IBM', 'Amazon', 'Capgemini']"

        mca_entry = f"""
      'MCA': {{
        specs: {specs_arr},
        fees: '{mca['fees']}',
        duration: '{mca['duration']}',
        roles: {roles_arr},
        avgSalary: '₹4L \u2013 ₹12L per annum',
        topCompanies: {companies_arr},
        internshipType: 'Industry project and virtual internship',
        careerOutcome: 'UGC DEB approved online MCA — recognised for IT careers and higher education across India.',
      }},"""

        # Insert after programDetails: {
        insert_pos = pd_match.end()
        block = block[:insert_pos] + mca_entry + block[insert_pos:]
        print(f"Added MCA programDetails: {uid}")
        updated += 1

    content = content[:obj_start] + block + content[obj_end+1:]

with open('lib/data.ts', 'w', encoding='utf-8') as f:
    f.write(content)

print(f"\nDone. Updated {updated} universities.")
