import json, re

with open('scripts/parsed_blogs.json', encoding='utf-8') as f:
    data = json.load(f)

posts = data['posts']
images = data['images']
categories = data['categories']

with open('lib/blog.ts', encoding='utf-8') as f:
    blog_ts = f.read()

existing = set(re.findall(r"slug: '([^']+)'", blog_ts))


def escape_ts_string(s):
    """Escape a string for use inside single-quoted TS string."""
    return s.replace('\\', '\\\\').replace("'", "\\'")


def escape_template_literal(s):
    """Escape content for use inside a JS template literal."""
    s = s.replace('\\', '\\\\')
    s = s.replace('`', '\\`')
    s = s.replace('${', '\\${')
    return s


def make_ts_block(slug, post, img, category):
    title = escape_ts_string(post['title'])
    meta = escape_ts_string(post['metaDescription'])
    kw = escape_ts_string(post['targetKeyword'])
    tags_str = ', '.join(f"'{escape_ts_string(t)}'" for t in post['tags'])
    content_escaped = escape_template_literal(post['content'])
    hero_img = img['heroImage']
    hero_attr = escape_ts_string(img['heroImageAttribution'])
    hero_alt = escape_ts_string(img['heroImageAlt'])
    cat = escape_ts_string(category)

    # Build FAQs
    faq_lines = []
    for fq in post['faqs']:
        q = escape_ts_string(fq['q'])
        a = escape_ts_string(fq['a'])
        faq_lines.append(f"      {{ q: '{q}', a: '{a}' }}")
    faqs_str = ',\n'.join(faq_lines)

    block = f"""  {{
    slug: '{slug}',
    title: '{title}',
    metaDescription: '{meta}',
    category: '{cat}',
    tags: [{tags_str}],
    publishedAt: '{post['publishedAt']}',
    readTime: {post['readTime']},
    targetKeyword: '{kw}',
    relatedUniversities: [],
    status: 'published',
    heroImage: '{hero_img}',
    heroImageAttribution: '{hero_attr}',
    heroImageAlt: '{hero_alt}',
    faqs: [
{faqs_str}
    ],
    content: `
{content_escaped}
`,
  }},"""
    return block


# Find insertion point — just before the closing `]` of BLOG_POSTS
# The array ends with:  },\n\n]\n\nexport const BLOG_CATEGORIES
insert_marker = '\n]\n\nexport const BLOG_CATEGORIES'
insert_pos = blog_ts.rfind(insert_marker)
if insert_pos == -1:
    # Try alternate with semicolon
    insert_marker = '\n];\n'
    insert_pos = blog_ts.rfind(insert_marker)
if insert_pos == -1:
    print("ERROR: Could not find BLOG_POSTS closing marker")
    print("Last 200 chars:", repr(blog_ts[-200:]))
    exit(1)
print(f"Insert position: {insert_pos}, context: {repr(blog_ts[insert_pos-30:insert_pos+30])}")

injected = 0
new_blocks = []

for slug, post in posts.items():
    if slug in existing:
        print(f"SKIP {slug}: already exists")
        continue
    img = images.get(slug)
    if not img:
        print(f"WARN {slug}: no image found, using placeholder")
        img = {
            'heroImage': 'https://images.pexels.com/photos/5905709/pexels-photo-5905709.jpeg?auto=compress&cs=tinysrgb&h=650&w=940',
            'heroImageAttribution': 'Photo by <a href="https://www.pexels.com/@rodnae-prod" target="_blank" rel="noopener nofollow">RDNE Stock project</a> on <a href="https://pexels.com" target="_blank" rel="noopener nofollow">Pexels</a>',
            'heroImageAlt': 'Student studying on a laptop',
        }
    cat = categories.get(slug, 'Online MBA Programs')
    block = make_ts_block(slug, post, img, cat)
    new_blocks.append(block)
    injected += 1
    print(f"OK   {slug}")

if new_blocks:
    insertion = '\n\n' + '\n\n'.join(new_blocks)
    blog_ts = blog_ts[:insert_pos] + insertion + blog_ts[insert_pos:]
    with open('lib/blog.ts', 'w', encoding='utf-8') as f:
        f.write(blog_ts)
    print(f"\nInjected {injected} posts into lib/blog.ts")
else:
    print("\nNothing to inject.")
