import os, re, json, html, subprocess, time
from pathlib import Path

PEXELS_KEY = "oDd11OlNiP5Bn6wJYNnTAVF5p6D8qlBXlRfD3Br4H0vrCjPZSiluklYv"
EXTRACT_DIR = Path('scripts/zip-blogs')

def pexels_search(query):
    from urllib.parse import quote
    url = f"https://api.pexels.com/v1/search?query={quote(query)}&per_page=3&orientation=landscape"
    r = subprocess.run(['curl','-s','-H',f'Authorization: {PEXELS_KEY}',url],
                       capture_output=True, text=True, timeout=15)
    return json.loads(r.stdout)

PEXELS_QUERIES = {
    'amrita-online-bba-review-2026':              ('university students campus India', 'Students at a modern university campus in India'),
    'best-online-bba-colleges-india-2026':        ('business administration students India', 'Students studying business administration in India'),
    'lpu-online-bba-review-2026':                 ('large university campus students', 'Students walking on a large modern university campus'),
    'mahe-online-bba-review-2026':                ('manipal university students learning', 'Students studying at Manipal university'),
    'nmims-online-bba-review-2026':               ('business school students premium', 'Business students at a premium management school'),
    'online-bba-fees-india-2026':                 ('student tuition fee planning laptop', 'Student planning education fees on a laptop'),
    'online-bba-india-2026':                      ('online learning business student', 'Young student taking an online business course'),
    'online-mba-fintech-india-2026':              ('fintech mobile payment digital banking', 'Professional using digital fintech and payment platform'),
    'online-mba-hospitality-management-india-2026': ('hotel hospitality manager professional', 'Hotel manager at a luxury hospitality property'),
    'online-mba-logistics-management-india-2026':   ('logistics warehouse supply chain', 'Logistics manager working in a modern warehouse'),
    'online-mba-real-estate-management-india-2026': ('real estate property manager', 'Real estate professional reviewing property documents'),
    'symbiosis-online-bba-review-2026':           ('symbiosis university campus pune', 'Students at a modern university campus'),
}

CATEGORIES = {
    'amrita-online-bba-review-2026': 'Online BBA Programs',
    'best-online-bba-colleges-india-2026': 'Online BBA Programs',
    'lpu-online-bba-review-2026': 'Online BBA Programs',
    'mahe-online-bba-review-2026': 'Online BBA Programs',
    'nmims-online-bba-review-2026': 'Online BBA Programs',
    'online-bba-fees-india-2026': 'Online BBA Programs',
    'online-bba-india-2026': 'Online BBA Programs',
    'online-mba-fintech-india-2026': 'Online MBA Programs',
    'online-mba-hospitality-management-india-2026': 'Online MBA Programs',
    'online-mba-logistics-management-india-2026': 'Online MBA Programs',
    'online-mba-real-estate-management-india-2026': 'Online MBA Programs',
    'symbiosis-online-bba-review-2026': 'Online BBA Programs',
}

def parse_html(filepath):
    with open(filepath, encoding='utf-8') as f:
        raw = f.read()

    slug_m = re.search(r'https://edifyedu\.in/blog/([^"]+)"', raw)
    slug = slug_m.group(1) if slug_m else filepath.stem

    title_m = re.search(r'<title>([^<]+)</title>', raw)
    title = html.unescape(title_m.group(1)) if title_m else ''

    desc_m = re.search(r'<meta name="description" content="([^"]+)"', raw)
    meta_desc = html.unescape(desc_m.group(1)) if desc_m else ''

    kw_m = re.search(r'<meta name="keywords" content="([^"]+)"', raw)
    raw_kw = kw_m.group(1) if kw_m else ''
    tags = [k.strip() for k in raw_kw.split(',') if k.strip()][:8]
    target_kw = tags[0] if tags else slug.replace('-', ' ')

    pub_m = re.search(r'article:published_time" content="([^"]+)"', raw)
    published_at = pub_m.group(1)[:10] if pub_m else '2026-05-08'

    faqs = []
    faq_m = re.search(r'"@type":"FAQPage","mainEntity":\[(.*?)\]\}', raw, re.DOTALL)
    if faq_m:
        try:
            faq_json = json.loads('[' + faq_m.group(1) + ']')
            for item in faq_json:
                q = item.get('name', '')
                a = item.get('acceptedAnswer', {}).get('text', '')
                if q and a:
                    faqs.append({'q': q, 'a': a})
        except Exception as e:
            print(f"  FAQ parse error for {slug}: {e}")

    body_m = re.search(r'<body>(.*?)</body>', raw, re.DOTALL)
    if body_m:
        body = body_m.group(1).strip()
        body = re.sub(r'<h1[^>]*>.*?</h1>', '', body, flags=re.DOTALL).strip()
        body = re.sub(r'<style[^>]*>.*?</style>', '', body, flags=re.DOTALL).strip()
        body = re.sub(r'\n{3,}', '\n\n', body).strip()
    else:
        body = ''

    plain = re.sub(r'<[^>]+>', ' ', body)
    word_count = len(plain.split())
    read_time = max(5, round(word_count / 200))

    return {
        'slug': slug,
        'title': title,
        'metaDescription': meta_desc,
        'tags': tags,
        'targetKeyword': target_kw,
        'publishedAt': published_at,
        'readTime': read_time,
        'content': body,
        'faqs': faqs,
    }

posts = {}
for f in sorted(EXTRACT_DIR.glob('*.html')):
    data = parse_html(f)
    posts[data['slug']] = data
    print(f"Parsed: {data['slug']}  ({data['readTime']}min, {len(data['faqs'])} FAQs)")

print("\nFetching Pexels images...")
images = {}
for slug, (query, alt_hint) in PEXELS_QUERIES.items():
    try:
        data = pexels_search(query)
        photos = data.get('photos', [])
        if photos:
            p = photos[0]
            pid = p['id']
            img_url = f"https://images.pexels.com/photos/{pid}/pexels-photo-{pid}.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
            photographer = p['photographer']
            handle = p['photographer_url'].rstrip('/').split('/')[-1]
            attribution = f'Photo by <a href="https://www.pexels.com/@{handle}" target="_blank" rel="noopener nofollow">{photographer}</a> on <a href="https://pexels.com" target="_blank" rel="noopener nofollow">Pexels</a>'
            alt = p.get('alt', alt_hint) or alt_hint
            images[slug] = {
                'heroImage': img_url,
                'heroImageAttribution': attribution,
                'heroImageAlt': alt,
            }
            print(f"  OK  {slug[:52]} photo#{pid}")
        else:
            print(f"  ERR {slug}: no results")
        time.sleep(0.3)
    except Exception as e:
        print(f"  ERR {slug}: {e}")

output = {
    'posts': posts,
    'images': images,
    'categories': CATEGORIES,
}
with open('scripts/parsed_blogs.json', 'w', encoding='utf-8') as f:
    json.dump(output, f, ensure_ascii=False, indent=2)

print(f"\nDone: {len(posts)} posts parsed, {len(images)} images fetched")
