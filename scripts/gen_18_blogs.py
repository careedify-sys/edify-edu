import sys, re, json
sys.stdout.reconfigure(encoding='utf-8')
from docx import Document

doc = Document('C:/Users/91706/Downloads/18_Humanized_SEO_Blogs_India_2026.docx')
paras = [p for p in doc.paragraphs if p.text.strip()]

# ── Internal link map ──────────────────────────────────────────────────────────
# Pattern → replacement HTML (only first occurrence per blog)
INTERNAL_LINKS = [
    # Programs
    (r'\bonline MCA\b', '<a href="/programs/mca">online MCA</a>'),
    (r'\bMCA programs?\b', '<a href="/programs/mca">MCA program</a>'),
    (r'\bonline MBA\b', '<a href="/programs/mba">online MBA</a>'),
    (r'\bMBA programs?\b', '<a href="/programs/mba">MBA program</a>'),
    (r'\bonline BBA\b', '<a href="/programs/bba">online BBA</a>'),
    (r'\bonline BCA\b', '<a href="/programs/bca">online BCA</a>'),
    (r'\bonline B\.Com\b', '<a href="/programs/bcom">online B.Com</a>'),
    (r'\bonline M\.Com\b', '<a href="/programs/mcom">online M.Com</a>'),
    # PGDM vs MBA
    (r'\bPGDM vs MBA\b', '<a href="/blog/pgdm-vs-mba-difference-which-is-better-india">PGDM vs MBA</a>'),
    # Compare
    (r'\bcompare universities\b', '<a href="/compare">compare universities</a>'),
    (r'\bUGC DEB approved universities\b', '<a href="/universities">UGC DEB approved universities</a>'),
    # Guides
    (r'\bIIM ranking\b', '<a href="/blog/iim-ranking-india-2026-all-iims-list">IIM ranking</a>'),
    (r'\bdata science salary\b', '<a href="/blog/data-science-salary-india-2026-scope-jobs">data science salary</a>'),
    (r'\bcyber security salary\b', '<a href="/blog/cyber-security-salary-india-2026-career-guide">cyber security salary</a>'),
    (r'\bCAT exam\b', '<a href="/blog/cat-exam-syllabus-2026-complete-guide">CAT exam</a>'),
    (r'\bGD topics\b', '<a href="/blog/gd-topics-for-mba-2026-with-answers">GD topics</a>'),
]

# ── CTA blocks by blog topic ──────────────────────────────────────────────────
def get_cta(slug, title):
    if 'mca' in slug or 'computer' in slug or 'data-science' in slug or 'cyber' in slug:
        return ('Explore Online MCA Programs in 2026',
                'Compare 50+ UGC DEB approved universities offering online MCA — fees, syllabus, specialisations, and career outcomes in one place.',
                '/programs/mca', 'Compare MCA Universities →')
    if 'mba' in slug or 'iim' in slug or 'pgdm' in slug or 'management' in slug or 'gd-topic' in slug or 'investment' in slug:
        return ('Find the Best Online MBA for You',
                'Compare top online MBA universities in India — fees, accreditation, placements, and specialisations side by side.',
                '/programs/mba', 'Compare MBA Universities →')
    if 'bba' in slug or 'bsc' in slug or 'arts' in slug or 'commerce' in slug or '12th' in slug:
        return ('Not Sure Which Program to Pick?',
                'Explore all UGC DEB approved online degrees — MBA, MCA, BBA, BCA, B.Com — and find the right fit for your goals and budget.',
                '/universities', 'Explore All Programs →')
    if 'llm' in slug or 'ias' in slug or 'phd' in slug:
        return ('Explore UGC Approved Online Programs',
                'If you are looking to upgrade your qualifications alongside your career, explore accredited online degrees that carry full government recognition.',
                '/universities', 'Browse Online Degrees →')
    # default
    return ('Ready to Upgrade Your Qualifications?',
            'Compare 50+ UGC DEB approved universities offering online MBA, MCA, BBA, BCA, B.Com — all in one place.',
            '/universities', 'Compare Universities →')

# ── Paragraph → HTML ──────────────────────────────────────────────────────────
def para_to_html(p):
    style = p.style.name if p.style else 'Normal'
    text = p.text.strip()
    if not text:
        return ''
    if style == 'Heading 1':
        return f'<h2>{text}</h2>'
    if style == 'Heading 2':
        return f'<h2>{text}</h2>'
    if style == 'Heading 3':
        return f'<h3>{text}</h3>'
    if style == 'List Paragraph':
        return f'<li>{text}</li>'
    return f'<p>{text}</p>'

def apply_links(html_content, used_patterns):
    """Apply each internal link pattern only ONCE across the entire blog."""
    for pattern, replacement in INTERNAL_LINKS:
        if pattern not in used_patterns:
            new_content, count = re.subn(pattern, replacement, html_content, count=1, flags=re.IGNORECASE)
            if count > 0:
                used_patterns.add(pattern)
                html_content = new_content
    return html_content

def wrap_lists(html):
    """Wrap consecutive <li> tags in <ul>."""
    result = []
    in_list = False
    for line in html.split('\n'):
        stripped = line.strip()
        if stripped.startswith('<li>'):
            if not in_list:
                result.append('<ul>')
                in_list = True
            result.append(stripped)
        else:
            if in_list:
                result.append('</ul>')
                in_list = False
            if stripped:
                result.append(stripped)
    if in_list:
        result.append('</ul>')
    return '\n'.join(result)

def build_cta_html(cta_title, cta_desc, cta_url, cta_btn):
    return f'''<div class="cta-block">
<h3>{cta_title}</h3>
<p>{cta_desc}</p>
<a href="{cta_url}" style="display:inline-block;background:#f59e0b;color:#000;padding:10px 22px;border-radius:8px;font-weight:700;text-decoration:none;margin-top:8px">{cta_btn}</a>
</div>'''

def extract_faqs(paras_slice):
    faqs = []
    i = 0
    while i < len(paras_slice):
        text = paras_slice[i].text.strip()
        if text.startswith('Q:'):
            q = text[2:].strip()
            a = paras_slice[i+1].text.strip() if i+1 < len(paras_slice) else ''
            faqs.append({'q': q, 'a': a})
            i += 2
        else:
            i += 1
    return faqs

# ── Blog metadata ─────────────────────────────────────────────────────────────
BLOG_META = {
    'phd-full-form-doctorate-meaning-india': {
        'category': 'Career Guides',
        'tags': ['phd full form', 'phd india', 'doctorate degree india', 'phd vs doctorate', 'phd duration india', 'online phd india', 'phd after mba'],
        'readTime': 9,
        'targetKeyword': 'phd full form',
        'metaDescription': 'PhD full form is Doctor of Philosophy. Learn what a PhD really means in India — duration, costs, validity, career scope, and who should actually enroll.',
        'relatedUniversities': [],
    },
    '14-principles-of-management-henri-fayol': {
        'category': 'MBA & Management',
        'tags': ['14 principles of management', 'henri fayol principles', 'fayol management theory', 'principles of management mba', 'henri fayol 14 principles', 'management principles bba'],
        'readTime': 8,
        'targetKeyword': '14 principles of management',
        'metaDescription': 'Henri Fayol\'s 14 principles of management explained with real examples — the ones most tested in MBA exams and most misunderstood in practice.',
        'relatedUniversities': [],
    },
    'cat-exam-syllabus-2026-complete-guide': {
        'category': 'Exam Guides',
        'tags': ['cat exam syllabus 2026', 'cat syllabus', 'cat 2026 preparation', 'cat exam pattern', 'varc cat syllabus', 'dilr cat syllabus', 'qa cat syllabus'],
        'readTime': 10,
        'targetKeyword': 'cat exam syllabus 2026',
        'metaDescription': 'CAT 2026 complete syllabus breakdown — VARC, DILR, QA section-wise topics, question count, marking scheme, and honest prep tips that actually work.',
        'relatedUniversities': [],
    },
    'career-objective-for-fresher-resume-examples': {
        'category': 'Career Guides',
        'tags': ['career objective for fresher', 'resume objective fresher', 'career objective resume india', 'fresher resume objective examples', 'career objective for mba fresher', 'resume objective samples'],
        'readTime': 8,
        'targetKeyword': 'career objective for fresher',
        'metaDescription': '15+ career objective examples for freshers in India — for MBA, engineering, commerce, arts graduates. Learn what to write and what to avoid.',
        'relatedUniversities': [],
    },
    'best-computer-courses-after-12th-india-2026': {
        'category': 'Career Guides',
        'tags': ['computer courses after 12th', 'best computer courses after 12th', 'it courses after 12th', 'bca after 12th', 'programming courses after 12th india', 'computer science courses india'],
        'readTime': 9,
        'targetKeyword': 'best computer courses after 12th',
        'metaDescription': 'Best computer courses after 12th in India 2026 — matched to your actual career goal, not just the popular list. BCA, MCA pathway, certifications and more.',
        'relatedUniversities': [],
    },
    'courses-after-12th-science-complete-list-2026': {
        'category': 'Career Guides',
        'tags': ['courses after 12th science', 'career after 12th pcm', 'career after 12th pcb', 'courses after 12th india', 'science stream career options', 'what to do after 12th science'],
        'readTime': 10,
        'targetKeyword': 'courses after 12th science',
        'metaDescription': 'Complete guide to courses after 12th Science in India 2026 — PCM, PCB, PCMB options, admission routes, fees, and career outcomes explained honestly.',
        'relatedUniversities': [],
    },
    'iim-ranking-india-2026-all-iims-list': {
        'category': 'MBA & Management',
        'tags': ['iim ranking 2026', 'iim ranking india', 'best iim india', 'all iim in india', 'iim fees', 'iim placement 2026', 'iim cutoff', 'top iim india'],
        'readTime': 11,
        'targetKeyword': 'iim ranking india 2026',
        'metaDescription': 'IIM ranking India 2026 — all 21 IIMs ranked with fees, average placements, CAT cutoffs, and the honest truth about which IIM is right for you.',
        'relatedUniversities': [],
    },
    'toughest-exams-india-world-2026': {
        'category': 'Exam Guides',
        'tags': ['toughest exams in india', 'hardest exams india', 'toughest exam in the world', 'upsc difficulty', 'jee difficulty level', 'cat pass rate india', 'tough competitive exams india'],
        'readTime': 10,
        'targetKeyword': 'toughest exams in india',
        'metaDescription': 'The toughest exams in India and the world in 2026 — real pass rates, preparation timelines, and what makes each exam genuinely hard.',
        'relatedUniversities': [],
    },
    'ias-officer-salary-india-2026-pay-scale-perks': {
        'category': 'Career Guides',
        'tags': ['ias officer salary india 2026', 'ias salary per month', 'ias pay scale', 'ias allowances', 'upsc ias salary', 'ias officer income india', 'civil services salary'],
        'readTime': 8,
        'targetKeyword': 'ias officer salary india 2026',
        'metaDescription': 'IAS officer salary in India 2026 — basic pay, allowances, perks, and the complete 7th Pay Commission picture. No inflated numbers.',
        'relatedUniversities': [],
    },
    'cyber-security-salary-india-2026-career-guide': {
        'category': 'Career Guides',
        'tags': ['cyber security salary india 2026', 'cybersecurity jobs india', 'cyber security career india', 'ethical hacker salary india', 'soc analyst salary', 'information security salary india'],
        'readTime': 9,
        'targetKeyword': 'cyber security salary india 2026',
        'metaDescription': 'Cyber security salary in India 2026 — role-by-role breakdown from SOC analyst to CISO, what skills actually move the needle, and honest career advice.',
        'relatedUniversities': [],
    },
    'data-science-salary-india-2026-scope-jobs': {
        'category': 'Career Guides',
        'tags': ['data science salary india 2026', 'data scientist salary india', 'data analyst salary india', 'ml engineer salary india', 'data science jobs india', 'data science career scope'],
        'readTime': 9,
        'targetKeyword': 'data science salary india 2026',
        'metaDescription': 'Data science salary in India 2026 — analyst vs scientist vs ML engineer breakdown, skills that matter, and where the market is actually heading.',
        'relatedUniversities': [],
    },
    'investment-banking-career-india-salary-qualification': {
        'category': 'Career Guides',
        'tags': ['investment banking career india', 'investment banker salary india 2026', 'how to get into investment banking india', 'investment banking qualifications india', 'ib analyst salary india'],
        'readTime': 9,
        'targetKeyword': 'investment banking career india',
        'metaDescription': 'Investment banking career in India 2026 — salary at each level, qualifications that actually matter, how to break in without a tier-1 MBA, and honest job market data.',
        'relatedUniversities': [],
    },
    'arts-stream-jobs-career-options-salary-india': {
        'category': 'Career Guides',
        'tags': ['arts stream jobs india', 'career after arts 12th', 'humanities career options india', 'arts stream salary india', 'ba career scope india', 'non engineering career india'],
        'readTime': 9,
        'targetKeyword': 'arts stream jobs india',
        'metaDescription': 'Arts stream career options in India 2026 — jobs most students are not considering, real salary ranges, and how to build a strong career from a humanities background.',
        'relatedUniversities': [],
    },
    'commerce-jobs-list-salary-india-2026': {
        'category': 'Career Guides',
        'tags': ['commerce jobs india 2026', 'career after bcom india', 'commerce stream jobs list', 'ca salary india', 'mba after commerce', 'finance career india', 'bcom career options'],
        'readTime': 9,
        'targetKeyword': 'commerce jobs india 2026',
        'metaDescription': 'Complete guide to commerce jobs and salaries in India 2026 — from CA to financial analyst to investment banker, with honest salary data and qualification requirements.',
        'relatedUniversities': [],
    },
    'bsc-career-options-scope-salary-india-2026': {
        'category': 'Career Guides',
        'tags': ['bsc career options india', 'career after bsc india', 'bsc scope india 2026', 'bsc salary india', 'after bsc what to do', 'bsc job opportunities india'],
        'readTime': 9,
        'targetKeyword': 'bsc career options india',
        'metaDescription': 'B.Sc career options, scope and salary in India 2026 — the honest guide to what you can do after BSc in science, IT, agriculture, and applied sciences.',
        'relatedUniversities': [],
    },
    'pgdm-vs-mba-difference-which-is-better-india': {
        'category': 'MBA & Management',
        'tags': ['pgdm vs mba', 'pgdm vs mba india', 'difference between pgdm and mba', 'pgdm or mba which is better', 'pgdm vs mba salary', 'pgdm validity india', 'mba vs pgdm recognition'],
        'readTime': 10,
        'targetKeyword': 'pgdm vs mba india',
        'metaDescription': 'PGDM vs MBA in India 2026 — the real differences in recognition, salary, fees, and which one actually helps your career. No marketing spin.',
        'relatedUniversities': [],
    },
    'gd-topics-for-mba-2026-with-answers': {
        'category': 'MBA & Management',
        'tags': ['gd topics for mba 2026', 'group discussion topics mba', 'gd topics with answers', 'mba gd preparation', 'best gd topics 2026', 'group discussion topics india 2026'],
        'readTime': 12,
        'targetKeyword': 'gd topics for mba 2026',
        'metaDescription': '20+ GD topics for MBA admissions 2026 with key points, balanced arguments, and tips on how to stand out in a group discussion without being loud.',
        'relatedUniversities': [],
    },
    'llm-course-duration-fees-scope-india-2026': {
        'category': 'Career Guides',
        'tags': ['llm course india 2026', 'llm duration india', 'llm fees india', 'llm after llb india', 'master of laws india', 'llm scope india', 'llm career options india'],
        'readTime': 9,
        'targetKeyword': 'llm course india 2026',
        'metaDescription': 'LLM course in India 2026 — duration, fees, top universities, specialisations, career options, and whether it\'s worth doing after your LLB.',
        'relatedUniversities': [],
    },
}

# ── Blog titles ───────────────────────────────────────────────────────────────
BLOG_TITLES = {
    'phd-full-form-doctorate-meaning-india': 'PhD Full Form: What It Actually Means — and What Nobody Tells You Before You Enroll',
    '14-principles-of-management-henri-fayol': "Henri Fayol's 14 Principles of Management — What They Are and Why They Still Matter",
    'cat-exam-syllabus-2026-complete-guide': 'CAT Exam Syllabus 2026 — The Honest, Section-by-Section Breakdown',
    'career-objective-for-fresher-resume-examples': 'Career Objective for Fresher Resume — 15+ Examples That Actually Work',
    'best-computer-courses-after-12th-india-2026': 'Best Computer Courses After 12th in India 2026 — Matched to Your Career Goal',
    'courses-after-12th-science-complete-list-2026': 'Courses After 12th Science 2026 — PCM, PCB, and PCMB Complete Guide',
    'iim-ranking-india-2026-all-iims-list': 'IIM Ranking India 2026 — All 21 IIMs, Fees, Placements, and Cutoffs',
    'toughest-exams-india-world-2026': 'Toughest Exams in India and the World 2026 — Real Pass Rates',
    'ias-officer-salary-india-2026-pay-scale-perks': 'IAS Officer Salary India 2026 — Pay Scale, Allowances, Full Picture',
    'cyber-security-salary-india-2026-career-guide': 'Cyber Security Salary India 2026 — What Each Role Actually Pays',
    'data-science-salary-india-2026-scope-jobs': 'Data Science Salary India 2026 — Analyst vs Scientist vs ML Engineer',
    'investment-banking-career-india-salary-qualification': 'Investment Banking Career India 2026 — Salary, Qualifications, How to Break In',
    'arts-stream-jobs-career-options-salary-india': 'Arts Stream Jobs India 2026 — Careers Most Students Are Not Considering',
    'commerce-jobs-list-salary-india-2026': 'Commerce Jobs List and Salary India 2026 — Complete Career Guide',
    'bsc-career-options-scope-salary-india-2026': 'B.Sc Career Options, Scope and Salary India 2026',
    'pgdm-vs-mba-difference-which-is-better-india': 'PGDM vs MBA India 2026 — The Real Difference',
    'gd-topics-for-mba-2026-with-answers': 'GD Topics for MBA 2026 — 20+ Topics With Key Points',
    'llm-course-duration-fees-scope-india-2026': 'LLM Course Duration, Fees and Scope India 2026',
}

PUBLISH_DATES = [
    '2026-04-08', '2026-04-08', '2026-04-09', '2026-04-09',
    '2026-04-09', '2026-04-09', '2026-04-10', '2026-04-10',
    '2026-04-10', '2026-04-10', '2026-04-10', '2026-04-10',
    '2026-04-10', '2026-04-10', '2026-04-10', '2026-04-10',
    '2026-04-10', '2026-04-10',
]

# ── Find blog boundaries ──────────────────────────────────────────────────────
blog_starts = []
for i, p in enumerate(paras):
    t = p.text.strip()
    if t.startswith('BLOG ') and '|' in t:
        slug = t.split('|')[1].strip()
        blog_starts.append((i, slug))

# ── Process each blog ─────────────────────────────────────────────────────────
results = []
for b_idx, (start_idx, slug) in enumerate(blog_starts):
    end_idx = blog_starts[b_idx+1][0] if b_idx+1 < len(blog_starts) else len(paras)
    blog_paras = paras[start_idx+1:end_idx]  # skip the BLOG N | slug line

    meta = BLOG_META.get(slug, {})
    cta_title, cta_desc, cta_url, cta_btn = get_cta(slug, slug)

    # Extract FAQs (after "Frequently asked questions" or "Sources")
    faq_start = None
    sources_start = None
    for i, p in enumerate(blog_paras):
        t = p.text.lower().strip()
        if 'frequently asked' in t or t.startswith('q:'):
            if faq_start is None:
                faq_start = i
        if 'sources researched' in t or t == 'sources':
            sources_start = i
            break

    content_paras = blog_paras
    faq_paras = []
    if faq_start:
        content_paras = blog_paras[:faq_start]
        faq_end = sources_start if sources_start else len(blog_paras)
        faq_paras = blog_paras[faq_start:faq_end]
    elif sources_start:
        content_paras = blog_paras[:sources_start]

    # Build content HTML
    html_lines = []
    for p in content_paras:
        style = p.style.name if p.style else 'Normal'
        text = p.text.strip()
        if not text:
            continue
        if style == 'Heading 1' or style == 'Heading 2':
            html_lines.append(f'<h2>{text}</h2>')
        elif style == 'Heading 3':
            html_lines.append(f'<h3>{text}</h3>')
        elif style == 'List Paragraph':
            html_lines.append(f'<li>{text}</li>')
        else:
            html_lines.append(f'<p>{text}</p>')

    html_content = '\n'.join(html_lines)
    html_content = wrap_lists(html_content)

    # Insert mid-article CTA after ~40% of content
    lines = html_content.split('\n')
    mid = len(lines) // 2
    # Find next </h2> or </p> after mid
    insert_at = mid
    for i in range(mid, min(mid + 20, len(lines))):
        if lines[i].endswith('</p>') or lines[i].endswith('</ul>'):
            insert_at = i + 1
            break
    mid_cta = build_cta_html(cta_title, cta_desc, cta_url, cta_btn)
    lines.insert(insert_at, mid_cta)
    html_content = '\n'.join(lines)

    # End CTA
    html_content += f'\n{build_cta_html(cta_title, cta_desc, cta_url, cta_btn)}'

    # Apply internal links (only first occurrence each)
    used = set()
    html_content = apply_links(html_content, used)

    # Extract FAQs
    faqs = extract_faqs(faq_paras)

    title = BLOG_TITLES.get(slug, blog_paras[0].text.strip() if blog_paras else slug)
    publish_date = PUBLISH_DATES[b_idx] if b_idx < len(PUBLISH_DATES) else '2026-04-10'

    results.append({
        'slug': slug,
        'title': title,
        'metaDescription': meta.get('metaDescription', ''),
        'category': meta.get('category', 'Career Guides'),
        'tags': meta.get('tags', []),
        'publishedAt': publish_date,
        'readTime': meta.get('readTime', 9),
        'content': html_content,
        'faqs': faqs,
        'relatedUniversities': meta.get('relatedUniversities', []),
        'targetKeyword': meta.get('targetKeyword', ''),
        'status': 'published',
        'ctaTitle': cta_title,
        'ctaDesc': cta_desc,
    })
    print(f'Processed: {slug} ({len(html_content)} chars, {len(faqs)} FAQs)')

# ── Output TypeScript ─────────────────────────────────────────────────────────
def ts_str(s):
    return '`' + s.replace('\\', '\\\\').replace('`', '\\`').replace('${', '\\${') + '`'

def ts_arr(lst):
    return '[' + ', '.join(f"'{x.replace(chr(39), chr(92)+chr(39))}'" for x in lst) + ']'

output_lines = []
for r in results:
    faqs_ts = ',\n    '.join(
        '{' + f" q: {ts_str(f['q'])}, a: {ts_str(f['a'])} " + '}'
        for f in r['faqs']
    )
    tags_ts = ts_arr(r['tags'])
    related_ts = ts_arr(r['relatedUniversities'])
    content_ts = ts_str(r['content'])
    title_ts = ts_str(r['title'])
    meta_ts = ts_str(r['metaDescription'])
    cta_title_ts = ts_str(r['ctaTitle'])
    cta_desc_ts = ts_str(r['ctaDesc'])
    kw_ts = ts_str(r['targetKeyword'])
    slug_ts = f"'{r['slug']}'"
    cat_ts = f"'{r['category']}'"
    date_ts = f"'{r['publishedAt']}'"

    block = f"""  {{
    slug: {slug_ts},
    title: {title_ts},
    metaDescription: {meta_ts},
    category: {cat_ts},
    tags: {tags_ts},
    publishedAt: {date_ts},
    readTime: {r['readTime']},
    targetKeyword: {kw_ts},
    relatedUniversities: {related_ts},
    status: 'published',
    ctaTitle: {cta_title_ts},
    ctaDesc: {cta_desc_ts},
    faqs: [{faqs_ts}],
    content: {content_ts},
  }},"""
    output_lines.append(block)

ts_output = '\n'.join(output_lines)
with open('scripts/_18blogs_output.ts', 'w', encoding='utf-8') as f:
    f.write(ts_output)

print(f'\nWrote scripts/_18blogs_output.ts ({len(ts_output)} chars)')
print(f'Total blogs: {len(results)}')
