# -*- coding: utf-8 -*-
"""Full 5-part SEO audit for edifyedu.in blog corpus (150 posts)."""

import re, csv, sys, os, math
from datetime import date, datetime
from html.parser import HTMLParser
import openpyxl

# ── Paths ────────────────────────────────────────────────────────────────────
BLOG_TS       = 'lib/blog.ts'
GSC_FILE      = 'edifyedu-gsc-diagnostic-2026-05-24.xlsx'
OUT_DIR       = 'scripts/seo-audit'
TODAY         = date.today()

COMPETITOR_DOMAINS = [
    'collegevidya', 'shiksha.com', 'careers360', 'jaroeducation',
    'padhaao', 'admissiondiy', 'samarthedu', 'kollegeapply',
    'pwmedharthi', 'distanceeducationschool', 'distanceeducation360',
    'mbadistanceeducation', 'onlineuniversities', 'collegedekho',
]

APPROVED_DOMAINS = [
    'onlinemanipal.com', 'online.amity.edu', 'deb.ugc.ac.in',
    'naac.gov.in', 'nirfindia.org', 'ugc.gov.in', 'pexels.com',
    'formspree.io',
]

def log(msg):
    sys.stdout.buffer.write((msg + '\n').encode('utf-8', errors='replace'))

os.makedirs(OUT_DIR, exist_ok=True)

# ────────────────────────────────────────────────────────────────────────────
# STEP 0: Parse lib/blog.ts
# ────────────────────────────────────────────────────────────────────────────
log('Parsing lib/blog.ts...')
with open(BLOG_TS, encoding='utf-8') as f:
    raw = f.read()

def extract_field(block, key_pattern):
    m = re.search(key_pattern, block, re.DOTALL)
    return m.group(1).strip() if m else ''

def get_all_posts():
    posts = []
    slug_pattern = re.compile(r"slug: '([^']+)'")
    slugs = slug_pattern.findall(raw)
    for i, slug in enumerate(slugs):
        start = raw.find(f"slug: '{slug}'")
        if start == -1:
            continue
        next_start = raw.find("slug: '", start + 50)
        block = raw[start:next_start] if next_start != -1 else raw[start:]

        # title - single or double quote
        title_m = re.search(r'title:\s*["\'](.+?)["\'],', block)
        title = title_m.group(1) if title_m else ''

        # metaDescription
        meta_m = re.search(r'metaDescription:\s*["\'](.+?)["\'],', block)
        meta = meta_m.group(1) if meta_m else ''

        # targetKeyword
        kw_m = re.search(r"targetKeyword:\s*'([^']*)'", block)
        kw = kw_m.group(1) if kw_m else ''

        # publishedAt
        pub_m = re.search(r"publishedAt:\s*'([^']+)'", block)
        published = pub_m.group(1) if pub_m else ''

        # status
        status_m = re.search(r"status:\s*'([^']+)'", block)
        status = status_m.group(1) if status_m else 'published'

        # heroImage
        hero_m = re.search(r"heroImage:\s*'([^']*)'", block)
        hero = hero_m.group(1) if hero_m else ''

        # faqs count
        faq_count = block.count("{ q: '")

        # content
        cs = block.find('content: `')
        content = ''
        if cs != -1:
            pos = cs + 10
            while True:
                idx = block.find('`', pos)
                if idx == -1:
                    break
                if block[idx:idx+3] in ('`,\n', '`;\n') or block[idx:idx+4] == '`,\r\n':
                    content = block[cs+10:idx]
                    break
                pos = idx + 1

        posts.append({
            'slug': slug,
            'title': title,
            'meta': meta,
            'kw': kw,
            'published': published,
            'status': status,
            'hero': hero,
            'faq_count': faq_count,
            'content': content,
        })
    return posts

posts = get_all_posts()
published_posts = [p for p in posts if p['status'] == 'published']
log(f'  Total posts: {len(posts)} | Published: {len(published_posts)}')

# ────────────────────────────────────────────────────────────────────────────
# STEP 1: Parse GSC data
# ────────────────────────────────────────────────────────────────────────────
log('Reading GSC export...')
wb = openpyxl.load_workbook(GSC_FILE, read_only=True, data_only=True)

gsc_pages = {}  # url -> {impressions, clicks, ctr, position}
ws_stuck = wb['StuckPages']
for row in ws_stuck.iter_rows(min_row=5, values_only=True):
    if not row[0] or not str(row[0]).startswith('http'):
        continue
    url = str(row[0]).rstrip('/')
    try:
        gsc_pages[url] = {
            'impressions': int(row[1] or 0),
            'clicks':      int(row[2] or 0),
            'ctr':         float(row[3] or 0),
            'position':    float(row[4] or 99),
        }
    except:
        pass

log(f'  GSC pages loaded: {len(gsc_pages)}')

def slug_to_url(slug):
    return f'https://edifyedu.in/blog/{slug}'

# Map GSC data to blog posts
for p in published_posts:
    url = slug_to_url(p['slug'])
    gsc = gsc_pages.get(url, {})
    p['gsc_impressions'] = gsc.get('impressions', 0)
    p['gsc_clicks']      = gsc.get('clicks', 0)
    p['gsc_ctr']         = gsc.get('ctr', 0)
    p['gsc_position']    = gsc.get('position', 99)
    p['in_gsc']          = url in gsc_pages

# ────────────────────────────────────────────────────────────────────────────
# STEP 2: HTML content analysis helpers
# ────────────────────────────────────────────────────────────────────────────

class ContentAnalyser(HTMLParser):
    def __init__(self):
        super().__init__()
        self.h1s = []
        self.h2s = []
        self.h3s = []
        self.h4s = []
        self.internal_links = []
        self.external_links = []
        self.competitor_links = []
        self.text_parts = []
        self._cur_tag = None
        self._cur_text = ''
        self._heading_stack = []

    def handle_starttag(self, tag, attrs):
        self._cur_tag = tag
        self._cur_text = ''
        if tag == 'a':
            href = dict(attrs).get('href', '')
            if href:
                if href.startswith('/'):
                    self.internal_links.append(href)
                elif href.startswith('http') and 'edifyedu.in' not in href:
                    self.external_links.append(href)
                    if any(c in href for c in COMPETITOR_DOMAINS):
                        self.competitor_links.append(href)

    def handle_endtag(self, tag):
        text = self._cur_text.strip()
        if tag == 'h1' and text:
            self.h1s.append(text)
        elif tag == 'h2' and text:
            self.h2s.append(text)
        elif tag == 'h3' and text:
            self.h3s.append(text)
        elif tag == 'h4' and text:
            self.h4s.append(text)
        self._cur_text = ''

    def handle_data(self, data):
        self._cur_text += data
        if data.strip():
            self.text_parts.append(data.strip())

def analyse_content(html):
    parser = ContentAnalyser()
    try:
        parser.feed(html)
    except Exception:
        pass
    full_text = ' '.join(parser.text_parts)
    word_count = len(full_text.split())
    em_dashes = '—' in html or ' -- ' in html
    has_contact_cta = '/contact' in html and ('counsellor' in html.lower() or 'talk' in html.lower() or 'cta' in html.lower())
    return {
        'word_count': word_count,
        'h1s': parser.h1s,
        'h2s': parser.h2s,
        'h3s': parser.h3s,
        'h4s': parser.h4s,
        'internal_links': parser.internal_links,
        'external_links': parser.external_links,
        'competitor_links': parser.competitor_links,
        'em_dashes': em_dashes,
        'has_contact_cta': has_contact_cta,
        'has_hero': bool(html.strip()),
    }

# ────────────────────────────────────────────────────────────────────────────
# PART 1: CTR REWRITE TARGETS
# ────────────────────────────────────────────────────────────────────────────
log('\nPart 1: CTR rewrite targets...')

def expected_ctr(pos):
    if pos <= 1:   return 0.28
    if pos <= 2:   return 0.15
    if pos <= 3:   return 0.11
    if pos <= 5:   return 0.07
    if pos <= 8:   return 0.035
    if pos <= 10:  return 0.02
    return 0.01

def title_issues(title):
    issues = []
    l = len(title)
    if l < 45:
        issues.append(f'too short ({l} chars)')
    if l > 65:
        issues.append(f'too long ({l} chars)')
    if '—' in title or ' -- ' in title:
        issues.append('em dash present')
    if not re.search(r'202[0-9]', title):
        issues.append('no year')
    return '; '.join(issues) if issues else 'ok'

def meta_issues(meta):
    issues = []
    l = len(meta)
    if l < 120:
        issues.append(f'too short ({l} chars)')
    if l > 170:
        issues.append(f'too long ({l} chars)')
    if '—' in meta or ' -- ' in meta:
        issues.append('em dash present')
    return '; '.join(issues) if issues else 'ok'

def priority_score(imp, pos, ctr):
    exp = expected_ctr(pos)
    potential_gain = imp * (exp - ctr/100)
    return round(potential_gain)

def ctr_priority(imp, pos, ctr):
    gain = priority_score(imp, pos, ctr)
    if gain > 200: return 1
    if gain > 100: return 2
    if gain > 50:  return 3
    if gain > 20:  return 4
    return 5

# Filter blog posts that meet CTR rewrite criteria
ctr_targets = []
for p in published_posts:
    imp  = p['gsc_impressions']
    clk  = p['gsc_clicks']
    ctr  = p['gsc_ctr']
    pos  = p['gsc_position']
    if not p['in_gsc']:
        continue
    qualifies = (
        (pos < 10 and imp > 200 and ctr < 1.0) or
        (11 <= pos <= 20 and imp > 100) or
        (pos < 5 and ctr < 2.0) or
        (clk == 0 and imp >= 200)
    )
    if qualifies:
        ca = analyse_content(p['content'])
        h1_body = ca['h1s'][0] if ca['h1s'] else ''
        h2_first = ca['h2s'][0] if ca['h2s'] else ''
        gain = priority_score(imp, pos, ctr)
        ctr_targets.append({
            'slug': p['slug'],
            'position': pos,
            'ctr': ctr,
            'impressions': imp,
            'top_query': p['kw'] or p['slug'].replace('-', ' '),
            'current_title': p['title'],
            'title_length': len(p['title']),
            'title_issues': title_issues(p['title']),
            'current_meta': p['meta'],
            'meta_length': len(p['meta']),
            'meta_issues': meta_issues(p['meta']),
            'h1_body': h1_body,
            'h2_first': h2_first,
            'potential_gain': gain,
            'priority': ctr_priority(imp, pos, ctr),
        })

ctr_targets.sort(key=lambda x: -x['potential_gain'])

# Generate recommended titles/metas for top targets
def make_rec_title(slug, kw, pos, imp):
    """Generate a recommended title based on slug/keyword — conservative, fact-based."""
    kw_clean = kw.replace(' india', ' India').replace('online mba', 'Online MBA').replace('online bba', 'Online BBA').replace('mba', 'MBA').replace('bba', 'BBA').replace('mca', 'MCA')
    kw_title = ' '.join(w.capitalize() if w.lower() not in ('in','of','for','and','vs','a','an','the','with','at','by') else w for w in kw_clean.split())
    # Slug-specific overrides
    overrides = {
        'amity-online-mba-review-2026': 'Amity Online MBA Review 2026: Fees, NIRF Rank and Honest Verdict',
        'smu-online-mba-review': 'SMU Online MBA Review 2026: Fees, Accreditation and Career Outcomes',
        'smu-online-mba-review-2026': 'SMU Online MBA Review 2026: Is it Worth ₹1.26L? Honest Rating',
        'career-after-bcom-jobs-salary-courses-2026': 'Career After B.Com 2026: Top Jobs, Salary and Best Courses',
        'mba-or-mca-which-is-better-2026': 'MBA or MCA: Which is Better in 2026? Salary, Scope and Verdict',
        'toughest-exams-india-world-2026': 'Toughest Exams in India and World 2026: Ranked by Difficulty',
        'online-mba-business-data-analytics-india-2026': 'Online MBA Business Analytics India 2026: 10+ Universities Compared',
        'career-after-12th-commerce-courses-jobs-2026': 'Career After 12th Commerce 2026: Best Courses, Jobs and Salary',
        'career-after-12th-science-courses-jobs-2026': 'Career After 12th Science 2026: Best Courses, Jobs and Salary',
        'mba-hr-management-online-india-2026': 'Online MBA HR Management India 2026: Fees, Colleges and Career',
        'ignou-online-mba-review-2026': 'IGNOU Online MBA Review 2026: Fees, Accreditation and Honest Rating',
        'top-executive-mba-programs-india-2026': 'Top Executive MBA Programs India 2026: Fees, Colleges Compared',
        'online-bba-in-india-2026': 'Online BBA in India 2026: Top Colleges, Fees and Career Guide',
        'imt-ghaziabad-online-mba-review-2026': 'IMT Ghaziabad Online MBA Review 2026: Fees, Accreditation, Rating',
        'online-mba-pune-university-2026': 'Online MBA Pune University 2026: SPPU, MAHE, Symbiosis Compared',
        'best-mba-specialization-india-2026': 'Best MBA Specialisation in India 2026: Salary, Jobs by Spec',
        'mba-after-bsc-is-it-good-2026': 'MBA After B.Sc: Is it Worth it in 2026? Salary and Career Facts',
        'best-college-executive-mba-india-2026': 'Best Executive MBA Colleges India 2026: Fees and Rankings',
        'online-mba-vs-distance-mba-difference-2026': 'Online MBA vs Distance MBA 2026: Key Differences Explained',
        'jain-online-mba-review-2026': 'JAIN Online MBA Review 2026: Fees, NIRF Rank and Honest Verdict',
        'mba-pharmaceutical-management-online-india-2026': 'Online MBA Pharma Management India 2026: Fees and Career Scope',
        'galgotias-online-mba-review': 'Galgotias Online MBA Review 2026: Fees, Accreditation and Rating',
        'amity-university-mba-distance-2026': 'Amity Distance MBA 2026: Fees, Validity and Honest Comparison',
        'noida-international-university-online-mba-review': 'NIU Online MBA Review 2026: Fees, Accreditation and Career Scope',
        'online-bba-programs-india-2026': 'Best Online BBA Programs India 2026: Tier 1 vs Tier 2 vs Tier 3',
        'data-science-salary-india-2026-scope-jobs': 'Data Science Salary India 2026: Entry to Senior Level Benchmarks',
        'mba-course-duration-how-many-years-2026': 'MBA Course Duration 2026: How Many Years is an Online MBA?',
        'mba-course-duration-india-2026': 'MBA Duration India 2026: Online vs Regular vs Distance Compared',
        'distance-mba-kolkata-top-programs-2026': 'Distance MBA Kolkata 2026: Top Programs, Fees and Colleges',
        'online-bba-degree-india-validity-2026': 'Online BBA Degree India 2026: Is it Valid for Jobs and Govt Exams?',
        '1-year-mba-india-executive-mba-2026': '1-Year MBA India 2026: Executive Programs, Fees and Eligibility',
    }
    if slug in overrides:
        return overrides[slug]
    # Generic fallback — trim to 60 chars
    title = f'{kw_title} 2026: Fees, Colleges and Career Guide'
    return title[:65]

def make_rec_meta(slug, kw, title):
    overrides = {
        'amity-online-mba-review-2026': 'Amity Online MBA review 2026: NAAC A+, ₹1.75L total fee, 28+ specialisations. Honest verdict on placement, accreditation and who should apply.',
        'smu-online-mba-review': 'SMU (Sikkim Manipal University) online MBA review 2026: ₹1.26L fee, NAAC A+, UGC-DEB approved. Honest rating on accreditation and career outcomes.',
        'smu-online-mba-review-2026': 'SMU online MBA 2026: ₹1.26L total fee, NAAC A+, WES recognised. Honest review of curriculum, placements and whether it is worth the investment.',
        'career-after-bcom-jobs-salary-courses-2026': 'Career after B.Com 2026: top jobs (CA, MBA, banking), salary ₹3L to ₹18L, best courses and which stream leads to the fastest career growth.',
        'mba-or-mca-which-is-better-2026': 'MBA or MCA in 2026: salary comparison, career scope, eligibility differences and an honest verdict on which degree suits your profile.',
        'toughest-exams-india-world-2026': 'Toughest exams in India and world 2026: UPSC, JEE Advanced, CA Final, GATE ranked by pass rate, preparation time and career value.',
        'online-mba-business-data-analytics-india-2026': 'Online MBA Business Analytics India 2026: 10+ UGC-DEB approved universities compared on fees, curriculum, tools taught and career outcomes.',
        'career-after-12th-commerce-courses-jobs-2026': 'Career after 12th Commerce 2026: best courses (B.Com, BBA, CA), top jobs, salary from ₹3L to ₹15L and honest guidance on which path to pick.',
        'mba-hr-management-online-india-2026': 'Online MBA HR Management India 2026: fees ₹65K to ₹3.7L, UGC-DEB approved universities compared. Career scope and salary data for HR professionals.',
        'ignou-online-mba-review-2026': 'IGNOU online MBA review 2026: ₹36,500 total fee, UGC-DEB approved. Honest verdict on curriculum quality, accreditation and who it is best suited for.',
        'best-mba-specialization-india-2026': 'Best MBA specialisation India 2026: Finance, Analytics, HR, Marketing compared by salary, job demand and career growth. Honest guide to picking the right spec.',
        'online-bba-in-india-2026': 'Online BBA in India 2026: top colleges (NMIMS, MAHE, Symbiosis), fees ₹1.2L to ₹2.4L, career scope and complete UGC-DEB approved programme guide.',
        'mba-after-bsc-is-it-good-2026': 'MBA after B.Sc: is it worth it in 2026? Salary data, career paths for science graduates, top online MBA options and an honest verdict.',
        'online-mba-vs-distance-mba-difference-2026': 'Online MBA vs Distance MBA 2026: key differences in mode, UGC recognition, career outcomes and which suits working professionals better.',
        'mba-pharmaceutical-management-online-india-2026': 'Online MBA Pharmaceutical Management India 2026: fees, UGC-DEB approved universities, career scope in pharma, health and NBFC sectors.',
    }
    if slug in overrides:
        return overrides[slug]
    kw_clean = kw or slug.replace('-', ' ')
    return f'{kw_clean.capitalize()} 2026: UGC-DEB approved universities compared on fees, curriculum and career outcomes. Verified data, no paid rankings.'[:160]

# Add recommendations
for t in ctr_targets:
    t['rec_title'] = make_rec_title(t['slug'], t['top_query'], t['position'], t['impressions'])
    t['rec_meta']  = make_rec_meta(t['slug'], t['top_query'], t['current_title'])

# Write CSV 01
out1 = os.path.join(OUT_DIR, '01-CTR-REWRITE-TARGETS.csv')
with open(out1, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(['slug','current_position','current_ctr','impressions','top_query',
                'current_title','current_title_length','title_issues',
                'current_meta_desc','meta_desc_length','meta_issues',
                'recommended_new_title','recommended_new_meta_desc','priority'])
    for t in ctr_targets:
        w.writerow([
            t['slug'], round(t['position'],1), t['ctr'], t['impressions'], t['top_query'],
            t['current_title'], t['title_length'], t['title_issues'],
            t['current_meta'], t['meta_length'], t['meta_issues'],
            t['rec_title'], t['rec_meta'], t['priority'],
        ])
log(f'  Written: {out1} ({len(ctr_targets)} targets)')

# ────────────────────────────────────────────────────────────────────────────
# PART 2: INVISIBLE BLOGS DIAGNOSIS
# ────────────────────────────────────────────────────────────────────────────
log('\nPart 2: Invisible blogs diagnosis...')

# All published slugs
published_slugs = set(p['slug'] for p in published_posts)
# Slugs visible in GSC
visible_slugs = set()
for p in published_posts:
    if p['in_gsc']:
        visible_slugs.add(p['slug'])

invisible = [p for p in published_posts if not p['in_gsc']]
log(f'  Published: {len(published_posts)} | Visible in GSC: {len(visible_slugs)} | Invisible: {len(invisible)}')

# Count inbound links for each post
def count_inbound(slug, all_posts):
    url_pattern = f'/blog/{slug}'
    count = 0
    for p in all_posts:
        if p['slug'] != slug and url_pattern in p['content']:
            count += 1
    return count

# Parse publish date
def days_since(date_str):
    try:
        pub = datetime.strptime(date_str, '%Y-%m-%d').date()
        return (TODAY - pub).days
    except:
        return 999

inbound_cache = {}
log('  Computing inbound link counts (this takes a moment)...')
for p in invisible:
    inbound_cache[p['slug']] = count_inbound(p['slug'], published_posts)

def categorise_invisible(p):
    days = days_since(p['published'])
    inbound = inbound_cache.get(p['slug'], 0)
    # Category A: < 60 days (recently imported)
    if days < 60:
        return 'A', 'Recently imported. Submit URL to GSC/Bing for crawl. Add 2+ inbound links.'
    # Category B: old but no inbound links
    if inbound == 0:
        return 'B', 'Zero inbound links. Inject 3+ links from related published posts.'
    # Category C: has links but not ranking
    return 'C', f'Has {inbound} inbound link(s) but not ranking. Check content depth and keyword focus.'

diag_rows = []
for p in invisible:
    cat, action = categorise_invisible(p)
    days = days_since(p['published'])
    inbound = inbound_cache.get(p['slug'], 0)
    in_sitemap = True  # all published posts are auto-included via getPublishedPosts()
    priority = 1 if cat == 'B' and days > 90 else (2 if cat == 'A' else 3)
    diag_rows.append({
        'slug': p['slug'],
        'in_sitemap': 'yes',
        'published_date': p['published'],
        'days_since_publish': days,
        'inbound_link_count': inbound,
        'category': cat,
        'recommended_action': action,
        'priority': priority,
    })

diag_rows.sort(key=lambda x: x['priority'])

out2 = os.path.join(OUT_DIR, '02-INVISIBLE-BLOGS-DIAGNOSIS.csv')
with open(out2, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(['slug','in_sitemap','published_date','days_since_publish',
                'inbound_link_count','category','recommended_action','priority'])
    for r in diag_rows:
        w.writerow([r['slug'],r['in_sitemap'],r['published_date'],r['days_since_publish'],
                    r['inbound_link_count'],r['category'],r['recommended_action'],r['priority']])
log(f'  Written: {out2} ({len(diag_rows)} invisible blogs)')

# Summary by category
cat_counts = {}
for r in diag_rows:
    cat_counts[r['category']] = cat_counts.get(r['category'], 0) + 1
missing_inbound = sum(1 for r in diag_rows if r['inbound_link_count'] == 0)

# ────────────────────────────────────────────────────────────────────────────
# PART 3: ON-PAGE STRUCTURE AUDIT
# ────────────────────────────────────────────────────────────────────────────
log('\nPart 3: On-page structure audit...')

def check_hierarchy(h2s, h3s, h4s):
    """Simple check: if H4 exists but no H3, that is a skip."""
    if h4s and not h3s:
        return False
    return True

structure_rows = []
issues_summary = {
    'missing_faq_schema': 0,
    'broken_h_hierarchy': 0,
    'under_800_words': 0,
    'em_dashes': 0,
    'competitor_links': 0,
    'no_h2': 0,
    'no_internal_links': 0,
    'no_hero': 0,
}

for p in published_posts:
    ca = analyse_content(p['content'])
    h1_in_body = len(ca['h1s']) > 0
    h2_count = len(ca['h2s'])
    h3_count = len(ca['h3s'])
    h_valid = check_hierarchy(ca['h2s'], ca['h3s'], ca['h4s'])
    kw_lower = p['kw'].lower() if p['kw'] else ''

    # Keyword checks
    h1_text = ' '.join(ca['h1s']).lower()
    h2_text = ' '.join(ca['h2s']).lower()
    kw_in_h1 = kw_lower and any(kw_lower[:15] in h1_text for _ in [1]) if kw_lower else False
    kw_in_h2 = kw_lower and any(kw_lower[:15] in h for h in ca['h2s'] if h) if kw_lower else False

    # Schema
    faq_schema = p['faq_count'] > 0
    article_schema = True  # rendered by page.tsx always
    schema_complete = bool(p['hero'] and p['published'] and p['title'])

    total_issues = 0
    if h1_in_body: total_issues += 1
    if not h_valid: total_issues += 1
    if ca['word_count'] < 800: total_issues += 1
    if ca['em_dashes']: total_issues += 1
    if ca['competitor_links']: total_issues += 1
    if h2_count < 3: total_issues += 1
    if len(ca['internal_links']) < 3: total_issues += 1
    if not faq_schema: total_issues += 1

    # Priority: 1 = critical (em dash or competitor link), 2 = structural, 3 = minor
    priority = 3
    if ca['em_dashes'] or ca['competitor_links']:
        priority = 1
    elif ca['word_count'] < 800 or not h_valid or h2_count < 2:
        priority = 2

    if not faq_schema: issues_summary['missing_faq_schema'] += 1
    if not h_valid: issues_summary['broken_h_hierarchy'] += 1
    if ca['word_count'] < 800: issues_summary['under_800_words'] += 1
    if ca['em_dashes']: issues_summary['em_dashes'] += 1
    if ca['competitor_links']: issues_summary['competitor_links'] += 1
    if h2_count == 0: issues_summary['no_h2'] += 1
    if len(ca['internal_links']) < 3: issues_summary['no_internal_links'] += 1
    if not p['hero']: issues_summary['no_hero'] += 1

    structure_rows.append({
        'slug': p['slug'],
        'word_count': ca['word_count'],
        'h1_in_body': 'yes' if h1_in_body else 'no',
        'h2_count': h2_count,
        'h3_count': h3_count,
        'h_hierarchy_valid': 'yes' if h_valid else 'no',
        'focus_keyword_in_h1': 'yes' if kw_in_h1 else 'no',
        'focus_keyword_in_h2_variant': 'yes' if kw_in_h2 else 'n/a' if not kw_lower else 'no',
        'article_schema': 'yes',
        'faqpage_schema': 'yes' if faq_schema else 'no',
        'schema_complete': 'yes' if schema_complete else 'partial',
        'image_count': 1 if p['hero'] else 0,
        'internal_link_count': len(ca['internal_links']),
        'external_competitor_links': len(ca['competitor_links']),
        'em_dashes_present': 'yes' if ca['em_dashes'] else 'no',
        'contact_cta_present': 'yes' if ca['has_contact_cta'] else 'no',
        'total_issues': total_issues,
        'priority': priority,
    })

structure_rows.sort(key=lambda x: (x['priority'], -x['total_issues']))

out3 = os.path.join(OUT_DIR, '03-ON-PAGE-STRUCTURE-AUDIT.csv')
with open(out3, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(['slug','word_count','h1_in_body','h2_count','h3_count','h_hierarchy_valid',
                'focus_keyword_in_h1','focus_keyword_in_h2_variant',
                'article_schema','faqpage_schema','schema_complete',
                'image_count','internal_link_count','external_competitor_links',
                'em_dashes_present','contact_cta_present','total_issues','priority'])
    for r in structure_rows:
        w.writerow([r['slug'],r['word_count'],r['h1_in_body'],r['h2_count'],r['h3_count'],
                    r['h_hierarchy_valid'],r['focus_keyword_in_h1'],r['focus_keyword_in_h2_variant'],
                    r['article_schema'],r['faqpage_schema'],r['schema_complete'],
                    r['image_count'],r['internal_link_count'],r['external_competitor_links'],
                    r['em_dashes_present'],r['contact_cta_present'],r['total_issues'],r['priority']])
log(f'  Written: {out3} ({len(structure_rows)} posts)')

# ────────────────────────────────────────────────────────────────────────────
# PART 4: META CONSISTENCY AUDIT
# ────────────────────────────────────────────────────────────────────────────
log('\nPart 4: Meta consistency audit...')

seen_titles = {}
seen_metas = {}
for p in published_posts:
    t = p['title']
    m = p['meta']
    if t:
        seen_titles[t] = seen_titles.get(t, 0) + 1
    if m:
        seen_metas[m] = seen_metas.get(m, 0) + 1

meta_rows = []
meta_summary = {
    'dup_titles': 0,
    'dup_metas': 0,
    'title_too_short': 0,
    'title_too_long': 0,
    'meta_too_short': 0,
    'meta_too_long': 0,
    'title_no_kw': 0,
    'meta_no_kw': 0,
}

for p in published_posts:
    t = p['title']
    m = p['meta']
    kw = p['kw'].lower() if p['kw'] else ''
    tl = len(t)
    ml = len(m)
    t_dup = seen_titles.get(t, 0) > 1
    m_dup = seen_metas.get(m, 0) > 1

    t_kw = bool(kw and (kw[:12] in t.lower() or p['slug'].split('-')[0] in t.lower()))
    m_kw = bool(kw and (kw[:12] in m.lower() or p['slug'].split('-')[0] in m.lower()))

    total_issues = sum([
        tl < 45, tl > 65, ml < 120, ml > 170,
        t_dup, m_dup, not t_kw, not m_kw,
        '—' in t, '—' in m,
    ])

    if t_dup: meta_summary['dup_titles'] += 1
    if m_dup: meta_summary['dup_metas'] += 1
    if tl < 45: meta_summary['title_too_short'] += 1
    if tl > 65: meta_summary['title_too_long'] += 1
    if ml < 120: meta_summary['meta_too_short'] += 1
    if ml > 170: meta_summary['meta_too_long'] += 1
    if not t_kw: meta_summary['title_no_kw'] += 1
    if not m_kw: meta_summary['meta_no_kw'] += 1

    meta_rows.append({
        'slug': p['slug'],
        'title': t,
        'title_length': tl,
        'title_keyword_present': 'yes' if t_kw else 'no',
        'title_unique': 'no' if t_dup else 'yes',
        'meta_desc': m[:100] + '...' if len(m) > 100 else m,
        'meta_desc_length': ml,
        'meta_keyword_present': 'yes' if m_kw else 'no',
        'meta_unique': 'no' if m_dup else 'yes',
        'canonical_url': f'https://edifyedu.in/blog/{p["slug"]}',
        'total_issues': total_issues,
    })

meta_rows.sort(key=lambda x: -x['total_issues'])

out4 = os.path.join(OUT_DIR, '04-META-CONSISTENCY-AUDIT.csv')
with open(out4, 'w', newline='', encoding='utf-8-sig') as f:
    w = csv.writer(f)
    w.writerow(['slug','title','title_length','title_keyword_present','title_unique',
                'meta_desc','meta_desc_length','meta_keyword_present','meta_unique',
                'canonical_url','total_issues'])
    for r in meta_rows:
        w.writerow([r['slug'],r['title'],r['title_length'],r['title_keyword_present'],
                    r['title_unique'],r['meta_desc'],r['meta_desc_length'],
                    r['meta_keyword_present'],r['meta_unique'],r['canonical_url'],r['total_issues']])
log(f'  Written: {out4} ({len(meta_rows)} posts)')

# ────────────────────────────────────────────────────────────────────────────
# PART 5: MASTER PRIORITY LIST
# ────────────────────────────────────────────────────────────────────────────
log('\nPart 5: Generating master priority list...')

# Top 20 CTR rewrites
top20_ctr = ctr_targets[:20]

# Top 30 invisible blogs by priority
top30_invisible = diag_rows[:30]

# Critical structural issues
em_dash_posts = [r for r in structure_rows if r['em_dashes_present'] == 'yes']
competitor_posts = [r for r in structure_rows if r['external_competitor_links'] > 0]
broken_h = [r for r in structure_rows if r['h_hierarchy_valid'] == 'no']
missing_faq = [r for r in structure_rows if r['faqpage_schema'] == 'no'][:20]

# Quick wins
quick_ctr = [t for t in top20_ctr if t['priority'] <= 2][:5]
quick_invisible = [r for r in diag_rows if r['category'] == 'B' and r['inbound_link_count'] == 0][:5]
quick_schema = [r for r in structure_rows if r['faqpage_schema'] == 'no' and r['word_count'] > 1000][:5]

# Compute total expected click gain
total_click_gain = sum(
    round(t['impressions'] * (expected_ctr(t['position']) - t['ctr']/100))
    for t in top20_ctr
)

def lines(*args):
    return '\n'.join(str(a) for a in args)

master_lines = []
master_lines.append('# Master SEO Priority List')
master_lines.append(f'*Generated: {TODAY} | Corpus: {len(published_posts)} published posts*')
master_lines.append('')
master_lines.append('---')
master_lines.append('')
master_lines.append('## Top 20 CTR Rewrites (Week 1 Sprint)')
master_lines.append('')
master_lines.append(f'Expected total click gain if all 20 ship: **+{total_click_gain:,} clicks/month** (conservative; uses industry CTR benchmarks).')
master_lines.append('')
master_lines.append('| # | Slug | Pos | CTR | Imp | Est. Click Gain | Priority |')
master_lines.append('|---|---|---|---|---|---|---|')
for i, t in enumerate(top20_ctr, 1):
    gain = t['potential_gain']
    master_lines.append(f'| {i} | `{t["slug"]}` | {round(t["position"],1)} | {t["ctr"]}% | {t["impressions"]} | +{gain}/mo | P{t["priority"]} |')

master_lines.append('')
master_lines.append('### Title and Meta Rewrites')
master_lines.append('')
for i, t in enumerate(top20_ctr, 1):
    master_lines.append(f'**{i}. `{t["slug"]}`**')
    master_lines.append(f'- Current title ({t["title_length"]}c): {t["current_title"]}')
    master_lines.append(f'- Recommended ({len(t["rec_title"])}c): {t["rec_title"]}')
    cur_meta_short = t["current_meta"][:100] + "..." if len(t["current_meta"]) > 100 else t["current_meta"]
    master_lines.append(f'- Current meta ({t["meta_length"]}c): {cur_meta_short}')
    master_lines.append(f'- Recommended ({len(t["rec_meta"])}c): {t["rec_meta"]}')
    master_lines.append('')

master_lines.append('---')
master_lines.append('')
master_lines.append('## Top 30 Blogs to Fix Indexation (Week 2 Sprint)')
master_lines.append('')
master_lines.append(f'Total invisible blogs: {len(diag_rows)} | In GSC: {len(visible_slugs)} | Never crawled: {cat_counts.get("A",0)} | Orphaned: {cat_counts.get("B",0)} | Stuck: {cat_counts.get("C",0)}')
master_lines.append('')

cat_groups = {'A': [], 'B': [], 'C': []}
for r in top30_invisible:
    cat_groups.get(r['category'], cat_groups['C']).append(r)

master_lines.append('### Category A - Recently Imported (need submission + inbound links)')
master_lines.append('')
for r in cat_groups['A']:
    master_lines.append(f'- `{r["slug"]}` (published {r["published_date"]}, {r["days_since_publish"]}d ago, {r["inbound_link_count"]} inbound links)')
    master_lines.append(f'  - Action: {r["recommended_action"]}')

master_lines.append('')
master_lines.append('### Category B - Orphaned (have content but zero inbound links)')
master_lines.append('')
for r in cat_groups['B']:
    master_lines.append(f'- `{r["slug"]}` ({r["days_since_publish"]}d since publish)')
    master_lines.append(f'  - Action: {r["recommended_action"]}')

master_lines.append('')
master_lines.append('### Category C - Has links but not ranking (content improvement needed)')
master_lines.append('')
for r in cat_groups['C']:
    master_lines.append(f'- `{r["slug"]}` ({r["inbound_link_count"]} inbound, {r["days_since_publish"]}d old)')
    master_lines.append(f'  - Action: {r["recommended_action"]}')

master_lines.append('')
master_lines.append('---')
master_lines.append('')
master_lines.append('## Critical Structural Fixes (Week 3 Sprint)')
master_lines.append('')
master_lines.append(f'### Em Dashes Present (LOCKED RULE VIOLATION - {len(em_dash_posts)} blogs)')
master_lines.append('Remove all em dashes (U+2014) from content. Replace with period, comma, or rewrite.')
master_lines.append('')
for r in em_dash_posts:
    master_lines.append(f'- `{r["slug"]}`')

master_lines.append('')
master_lines.append(f'### Competitor External Links ({len(competitor_posts)} blogs)')
master_lines.append('Remove all outbound links to competitor domains listed in CLAUDE.md.')
master_lines.append('')
for r in competitor_posts:
    master_lines.append(f'- `{r["slug"]}`')

master_lines.append('')
master_lines.append(f'### Broken H Hierarchy ({len(broken_h)} blogs)')
for r in broken_h:
    master_lines.append(f'- `{r["slug"]}` (H2={r["h2_count"]}, H3={r["h3_count"]})')

master_lines.append('')
master_lines.append(f'### Missing FAQPage Schema ({len(missing_faq)} of first 20 shown)')
master_lines.append('These posts have no FAQs. Add 5-7 FAQs to unlock FAQPage rich results.')
master_lines.append('')
for r in missing_faq:
    master_lines.append(f'- `{r["slug"]}` ({r["word_count"]} words)')

master_lines.append('')
master_lines.append('---')
master_lines.append('')
master_lines.append('## Quick Wins Cheatsheet (1 day each)')
master_lines.append('')
master_lines.append('### 5 Cheapest CTR Rewrites (highest click gain, simplest change)')
for t in quick_ctr:
    master_lines.append(f'- `{t["slug"]}` — change title to: {t["rec_title"]}')

master_lines.append('')
master_lines.append('### 5 Easiest Link Injections (orphaned blogs, one link each unblocks indexation)')
for r in quick_invisible:
    master_lines.append(f'- `{r["slug"]}` — add 1 inbound link from any related published blog')

master_lines.append('')
master_lines.append('### 5 Schema Quick Fixes (add FAQ block to unlock rich results)')
for r in quick_schema:
    master_lines.append(f'- `{r["slug"]}` ({r["word_count"]} words, no FAQs currently)')

master_lines.append('')
master_lines.append('---')
master_lines.append('')
master_lines.append('## Summary Statistics')
master_lines.append('')
master_lines.append(f'- Total blogs audited: {len(published_posts)}')
master_lines.append(f'- CTR rewrite targets: {len(ctr_targets)}')
master_lines.append(f'- Invisible blogs: {len(diag_rows)} ({len(diag_rows)/len(published_posts)*100:.0f}%)')
master_lines.append(f'  - Category A (just imported): {cat_counts.get("A",0)}')
master_lines.append(f'  - Category B (orphaned): {cat_counts.get("B",0)}')
master_lines.append(f'  - Category C (stuck): {cat_counts.get("C",0)}')
master_lines.append(f'- Em dash violations: {issues_summary["em_dashes"]}')
master_lines.append(f'- Competitor link violations: {issues_summary["competitor_links"]}')
master_lines.append(f'- Missing FAQPage schema: {issues_summary["missing_faq_schema"]}')
master_lines.append(f'- Broken H hierarchy: {issues_summary["broken_h_hierarchy"]}')
master_lines.append(f'- Under 800 words: {issues_summary["under_800_words"]}')
master_lines.append(f'- Low internal links (<3): {issues_summary["no_internal_links"]}')
master_lines.append(f'- Duplicate titles: {meta_summary["dup_titles"]//2}')
master_lines.append(f'- Duplicate meta descriptions: {meta_summary["dup_metas"]//2}')
master_lines.append(f'- Title too long (>65c): {meta_summary["title_too_long"]}')
master_lines.append(f'- Meta too short (<120c): {meta_summary["meta_too_short"]}')
master_lines.append(f'')
master_lines.append(f'**Estimated total monthly click gain (Week 1 sprint, top 20 rewrites): +{total_click_gain:,} clicks/month**')
master_lines.append('')
master_lines.append('---')
master_lines.append('')
master_lines.append('*Audit only. No content changes made. Execute rewrites in a separate sprint after review.*')

out5 = os.path.join(OUT_DIR, '05-MASTER-PRIORITY-LIST.md')
with open(out5, 'w', encoding='utf-8') as f:
    f.write('\n'.join(master_lines))
log(f'  Written: {out5}')

# ────────────────────────────────────────────────────────────────────────────
# FINAL SUMMARY
# ────────────────────────────────────────────────────────────────────────────
log('\n' + '='*60)
log('AUDIT COMPLETE')
log('='*60)
log(f'Total blogs audited:       {len(published_posts)}')
log(f'CTR rewrite targets:       {len(ctr_targets)}')
log(f'Invisible blogs:           {len(diag_rows)} ({cat_counts.get("A",0)}A / {cat_counts.get("B",0)}B / {cat_counts.get("C",0)}C)')
total_issues_all = (len(ctr_targets) + len(em_dash_posts) + len(competitor_posts) +
                    issues_summary['broken_h_hierarchy'] + issues_summary['missing_faq_schema'] +
                    meta_summary['dup_titles']//2 + meta_summary['title_too_long'])
log(f'Total issues found:        {total_issues_all}')
log('')
log('TOP 3 HIGHEST-LEVERAGE FIXES:')
log(f'  1. Rewrite title+meta for `{top20_ctr[0]["slug"]}` (pos {round(top20_ctr[0]["position"],1)}, {top20_ctr[0]["impressions"]} imp, {top20_ctr[0]["ctr"]}% CTR) -> +{top20_ctr[0]["potential_gain"]} clicks/mo')
if len(top20_ctr) > 1:
    log(f'  2. Rewrite title+meta for `{top20_ctr[1]["slug"]}` (pos {round(top20_ctr[1]["position"],1)}, {top20_ctr[1]["impressions"]} imp, {top20_ctr[1]["ctr"]}% CTR) -> +{top20_ctr[1]["potential_gain"]} clicks/mo')
if len(top20_ctr) > 2:
    log(f'  3. Rewrite title+meta for `{top20_ctr[2]["slug"]}` (pos {round(top20_ctr[2]["position"],1)}, {top20_ctr[2]["impressions"]} imp, {top20_ctr[2]["ctr"]}% CTR) -> +{top20_ctr[2]["potential_gain"]} clicks/mo')
log('')
log(f'Estimated monthly click gain (Week 1 sprint, top 20 rewrites): +{total_click_gain:,} clicks/month')
log('')
log('Output files:')
for fn in ['01-CTR-REWRITE-TARGETS.csv','02-INVISIBLE-BLOGS-DIAGNOSIS.csv',
           '03-ON-PAGE-STRUCTURE-AUDIT.csv','04-META-CONSISTENCY-AUDIT.csv',
           '05-MASTER-PRIORITY-LIST.md']:
    log(f'  scripts/seo-audit/{fn}')
