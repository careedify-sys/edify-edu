// lib/blog.ts — Blog post store for Edify
//
// ╔══════════════════════════════════════════════════════════════════════════╗
// ║  EDITING VIA GOOGLE SHEETS (Edify CMS)                                 ║
// ║                                                                          ║
// ║  Sheet name: "✍️ Blog Posts"                                            ║
// ║  Required columns:                                                       ║
// ║    Slug (URL)        → e.g. online-mba-india-2026  (no spaces, no /)   ║
// ║    Title             → Full post title                                   ║
// ║    Status            → "published" or "draft"                           ║
// ║  Optional columns:                                                       ║
// ║    Meta Description  → 150–160 chars for Google snippet                 ║
// ║    Category          → MBA Guides / University Reviews / Career Advice  ║
// ║    Tags (comma sep)  → online mba, ugc deb, working professionals       ║
// ║    Published Date    → YYYY-MM-DD  e.g. 2026-03-01                      ║
// ║    Read Time (min)   → 5                                                 ║
// ║    Target Keyword    → primary SEO keyword for this post                ║
// ║    FAQs (JSON array) → [{"q":"...","a":"..."},{"q":"...","a":"..."}]    ║
// ║    Content (HTML)    → Full HTML content (wrap in <h2>, <p>, <ul> etc.) ║
// ║    CTA Title         → Override the in-article CTA box title            ║
// ║    CTA Description   → Override the in-article CTA box description      ║
// ║                                                                          ║
// ║  To publish changes:                                                     ║
// ║    1. Edit the Google Sheet                                              ║
// ║    2. Go to edifyedu.in/admin → CMS Sync → click "Sync Now"            ║
// ║    3. Vercel auto-deploys in ~2 min                                     ║
// ╚══════════════════════════════════════════════════════════════════════════╝

export interface BlogPost {
  slug: string
  title: string
  metaDescription: string
  category: string
  tags: string[]
  publishedAt: string
  readTime: number
  content: string // Full HTML content
  faqs: { q: string; a: string }[]
  relatedUniversities: string[] // university ids
  targetKeyword: string
  status: 'published' | 'draft'
  ctaTitle?: string
  ctaDesc?: string
}

export const BLOG_POSTS: BlogPost[] = [
  {
    slug: 'online-mba-working-professionals-india-2026',
    title: 'Online MBA for Working Professionals in India 2026: Is It Worth It?',
    metaDescription: 'Should you do an online MBA while working? Honest breakdown — which universities are actually worth the money, what the ROI looks like, and what nobody tells you about specialisations.',
    category: 'MBA Guides',
    tags: ['online MBA', 'working professionals', 'MBA India', 'UGC approved'],
    publishedAt: '2026-01-15',
    readTime: 8,
    targetKeyword: 'online MBA for working professionals India 2026',
    relatedUniversities: ['nmims', 'manipal-jaipur', 'amity'],
    status: 'published',
    faqs: [
      { q: 'Can I actually study while working full-time?', a: 'Yes — that\'s literally why these programs exist. Most require 10–15 hours a week. Lectures are recorded, so you watch them when you have time. Exams are online and proctored from home. No campus visits needed for most universities.' },
      { q: 'Will my employer take an online MBA seriously?', a: 'Depends on which university. From NMIMS, Manipal (MUJ), Symbiosis, or JAIN — yes, most mid-to-large companies recognise these. From a university you\'ve never heard of — probably not. Stick to NIRF Top-100 universities and you\'ll be fine.' },
      { q: 'Which online MBA gives the best salary jump?', a: 'It\'s not the MBA that gives you the jump — it\'s the promotion or job switch you make after it. That said, NMIMS and Manipal Online have the strongest placement support. LPU Online is the best budget pick. Symbiosis is perfect if you hate exam centres.' },
    ],
    content: `
<h2>Be honest with yourself first</h2>
<p>An online MBA makes sense if you\'re already working and want a promotion, a title change, or a career switch — without quitting your job or your income.</p>
<p>It does <strong>not</strong> make sense if your actual goal is to get into IIM-level campus placements. That requires a full-time program. The online MBA is a different tool for a different job — and it\'s a genuinely good tool when used correctly.</p>
<p>Most people who regret getting an online MBA didn\'t pick the wrong program. They picked the wrong reason. If you\'re clear on why you want it, the rest is just choosing where.</p>

<h2>Top Online MBA Programs Worth Your Money in 2026</h2>
<p>Everything below is UGC DEB approved. I\'ve sorted them by what they\'re actually best for — not by who paid me, because nobody did.</p>

<h3>1. NMIMS Online MBA — Best for Finance & Premium Brand</h3>
<p>NMIMS (Narsee Monjee Institute of Management Studies) carries one of India's strongest B-school brands in the online space. Their online MBA is NAAC A++ accredited and widely recognised in BFSI (banking, financial services, insurance) and IT sectors.</p>
<ul>
  <li><strong>Fees:</strong> ₹1.1L – ₹4.0L depending on specialisation</li>
  <li><strong>Exam mode:</strong> Online proctored</li>
  <li><strong>Best for:</strong> Finance, marketing, working professionals in metros</li>
  <li><strong>NIRF Rank:</strong> #24</li>
</ul>

<h3>2. Manipal University Online MBA — Best for IT & Tech Professionals</h3>
<p>Manipal Online (MUJ) is one of the few online programs with WES recognition — making it valuable if you plan to work or study abroad. The program offers 13 specialisations and strong placement assistance through a dedicated alumni network.</p>
<ul>
  <li><strong>Fees:</strong> ₹1.4L – ₹2.0L</li>
  <li><strong>Exam mode:</strong> Online proctored</li>
  <li><strong>Best for:</strong> IT professionals, tech managers, NRIs</li>
  <li><strong>Special:</strong> WES recognised · AICTE approved</li>
</ul>

<h3>3. LPU Online MBA — Best Budget Option</h3>
<p>LPU (Lovely Professional University) offers one of the most affordable online MBAs in India without sacrificing UGC recognition. NIRF ranked, with 20+ specialisations — it is particularly popular in Tier 2 and 3 cities.</p>
<ul>
  <li><strong>Fees:</strong> ₹75K – ₹1.8L</li>
  <li><strong>Exam mode:</strong> Hybrid (online + exam centre)</li>
  <li><strong>Best for:</strong> Budget-conscious students, first-time managers</li>
</ul>

<h2>Online MBA vs Full-Time MBA: Honest Comparison</h2>
<table>
  <thead><tr><th>Factor</th><th>Online MBA</th><th>Full-Time MBA</th></tr></thead>
  <tbody>
    <tr><td>Cost</td><td>₹75K – ₹4L</td><td>₹8L – ₹25L</td></tr>
    <tr><td>Career break needed?</td><td>No</td><td>Yes (2 years)</td></tr>
    <tr><td>Campus placement</td><td>Limited</td><td>Strong</td></tr>
    <tr><td>Employer recognition</td><td>Good (private sector)</td><td>Excellent</td></tr>
    <tr><td>PSU / Govt jobs</td><td>Usually not valid</td><td>Valid</td></tr>
    <tr><td>Best for</td><td>Promotions, switches</td><td>Fresh grads, consulting</td></tr>
  </tbody>
</table>

<h2>What Specialisation Should You Pick?</h2>
<p>Pick your specialisation based on your current job — not your dream job. Here's why: most online MBA students use the degree to get promoted in their current sector, not to pivot completely.</p>
<ul>
  <li><strong>IT / Software:</strong> Operations, Data Analytics, or IT Management</li>
  <li><strong>Sales / Marketing:</strong> Marketing or Digital Marketing</li>
  <li><strong>Finance / Banking:</strong> Finance or Banking & Insurance</li>
  <li><strong>Manufacturing / Logistics:</strong> Operations & Supply Chain</li>
  <li><strong>HR / Admin:</strong> Human Resource Management</li>
</ul>

<h2>Is an Online MBA Valid for Government Jobs?</h2>
<p>This is the most important question most portals dodge. Here's the honest answer:</p>
<p><strong>For most central government and PSU jobs: No.</strong> Only degrees from IGNOU, state open universities, and select recognised institutions are valid for government promotions and PSU eligibility.</p>
<p><strong>For private sector: Yes, completely.</strong> All UGC DEB approved online MBAs are valid for private employment, bank jobs, and further higher education.</p>
    `,
  },
  {
    slug: 'ugc-deb-approved-online-universities-india',
    title: 'UGC DEB Approved Online Universities in India: Complete 2026 List',
    metaDescription: 'Full list of UGC DEB approved online universities in India. What UGC DEB approval means, why it matters, and which universities actually have it.',
    category: 'Guides',
    tags: ['UGC DEB', 'online university', 'approved universities', 'India'],
    publishedAt: '2026-02-20',
    readTime: 6,
    targetKeyword: 'UGC DEB approved online universities India 2026',
    relatedUniversities: ['nmims', 'lpu', 'chandigarh', 'amity'],
    status: 'published',
    faqs: [
      { q: 'What does UGC DEB approved mean?', a: 'UGC DEB (Distance Education Bureau) approval means the University Grants Commission has officially authorised the university to offer online degree programs. Without this, the degree may not be legally valid.' },
      { q: 'How do I verify if a university is UGC DEB approved?', a: 'Go to ugcdeb.gov.in and check the approved institutions list. All universities on Edify are verified against this list.' },
    ],
    content: `
<h2>What is UGC DEB Approval?</h2>
<p>UGC DEB stands for University Grants Commission — Distance Education Bureau. It is the regulatory body in India that approves universities to offer online and distance education programs.</p>
<p>A UGC DEB approved degree is legally equivalent to a regular on-campus degree for private sector employment and higher education in India.</p>

<h2>Why UGC DEB Approval Matters</h2>
<p>Without UGC DEB approval, your online degree may be considered invalid by:</p>
<ul>
  <li>Employers who verify credentials</li>
  <li>Foreign universities for higher studies</li>
  <li>Professional bodies and licensing boards</li>
</ul>
<p>Always verify UGC DEB status before enrolling. Edify lists only UGC DEB approved institutions.</p>

<h2>How to Verify UGC DEB Status</h2>
<p>Visit <strong>ugcdeb.gov.in</strong> → click "Approved Institutions" → search for your university. If it is not listed, the program is not valid. Takes 2 minutes. Do it before you pay anything.</p>
    `,
  },
  {
    slug: 'nmims-vs-manipal-vs-lpu-online-mba-comparison-2026',
    title: 'NMIMS vs Manipal (MUJ) vs LPU Online MBA: Which One Should You Pick?',
    metaDescription: 'Direct comparison of three top online MBAs in India for 2026. NMIMS, Manipal University Jaipur, and LPU — fees, recognition, exam format, and which is right for your situation.',
    category: 'University Reviews',
    tags: ['NMIMS online MBA', 'Manipal online MBA', 'LPU online MBA', 'online MBA comparison'],
    publishedAt: '2026-02-05',
    readTime: 7,
    targetKeyword: 'NMIMS vs Manipal vs LPU online MBA 2026',
    relatedUniversities: ['nmims', 'manipal-jaipur', 'lpu'],
    status: 'published',
    faqs: [
      { q: 'Which is better — NMIMS or Manipal online MBA?', a: 'NMIMS has a stronger brand in finance and BFSI. Manipal (MUJ) has WES recognition, making it useful if you plan to work or study abroad. Both are NAAC A++ accredited. If you\'re in India with no plans to go abroad, NMIMS has a slight edge for salary outcomes. If international recognition matters, go Manipal.' },
      { q: 'Is LPU online MBA recognised by employers?', a: 'Yes — LPU is NAAC A++ accredited, UGC DEB approved, and NIRF ranked. It\'s particularly popular in North India and Tier-2 cities. The brand isn\'t as premium as NMIMS or Manipal, but the degree is 100% valid and costs significantly less. Good pick if budget matters.' },
      { q: 'Can I switch to a full-time MBA after doing an online MBA?', a: 'Not directly. An online MBA is a final degree, not a stepping stone to an IIM. If you want a full-time MBA later, you\'d need to clear CAT/GMAT again and apply fresh. The online MBA is meant to boost your career while you\'re working — not replace a full-time program.' },
    ],
    content: `
<h2>The short answer before we get into details</h2>
<p>All three are legitimate, UGC DEB approved, and NAAC A++ accredited. The question isn\'t which one is "best" — it\'s which one fits your situation. Here\'s how to think about it:</p>
<ul>
  <li><strong>NMIMS</strong> — best brand for finance and metro jobs</li>
  <li><strong>Manipal MUJ</strong> — best if you have international ambitions (WES recognised)</li>
  <li><strong>LPU</strong> — best if budget is your primary constraint</li>
</ul>
<p>That\'s honestly the summary. But if you want to understand why, read on.</p>

<h2>NMIMS Online MBA</h2>
<p>NMIMS (Narsee Monjee) is the strongest brand in this group for domestic placements, especially in BFSI — that\'s banking, financial services, and insurance. Their online MBA is NAAC A++ accredited, NIRF ranked #24 in management, and runs as proctored online exams so you never need to go to a centre.</p>
<table>
  <thead><tr><th>Factor</th><th>Details</th></tr></thead>
  <tbody>
    <tr><td>Total Fee</td><td>₹1.1L – ₹4.0L (varies by specialisation)</td></tr>
    <tr><td>Exam Mode</td><td>Online proctored from home</td></tr>
    <tr><td>Best For</td><td>Finance, marketing, metro professionals</td></tr>
    <tr><td>NIRF Management</td><td>#24</td></tr>
    <tr><td>WES Recognised</td><td>No</td></tr>
  </tbody>
</table>

<h2>Manipal University Jaipur (MUJ) Online MBA</h2>
<p>MUJ is the online arm of Manipal Education, which has a strong reputation especially in tech and healthcare sectors. The standout feature is WES (World Education Services) recognition — your degree is evaluated internationally, which matters if you\'re planning to immigrate or apply to foreign universities for further study.</p>
<table>
  <thead><tr><th>Factor</th><th>Details</th></tr></thead>
  <tbody>
    <tr><td>Total Fee</td><td>₹1.4L – ₹2.0L</td></tr>
    <tr><td>Exam Mode</td><td>Online proctored</td></tr>
    <tr><td>Best For</td><td>IT professionals, NRIs, anyone going abroad</td></tr>
    <tr><td>NIRF Rank</td><td>#58 (Overall)</td></tr>
    <tr><td>WES Recognised</td><td>Yes ✓</td></tr>
  </tbody>
</table>

<h2>LPU Online MBA</h2>
<p>Lovely Professional University is the most affordable option here without sacrificing accreditation. NAAC A++, NIRF ranked, UGC DEB approved. If you\'re in a Tier-2 or Tier-3 city and your employer doesn\'t particularly care about brand names, LPU gives you a solid degree at roughly half the cost of the others.</p>
<table>
  <thead><tr><th>Factor</th><th>Details</th></tr></thead>
  <tbody>
    <tr><td>Total Fee</td><td>₹75K – ₹1.8L</td></tr>
    <tr><td>Exam Mode</td><td>Hybrid (online + exam centre in some cases)</td></tr>
    <tr><td>Best For</td><td>Budget-conscious students, North India, Tier-2/3 cities</td></tr>
    <tr><td>NIRF Rank</td><td>#31 (Overall)</td></tr>
    <tr><td>WES Recognised</td><td>Yes ✓</td></tr>
  </tbody>
</table>

<h2>The honest recommendation</h2>
<p>If you\'re in a metro, working in finance or marketing, and want the best shot at a salary hike — pick NMIMS. The brand genuinely opens doors in BFSI.</p>
<p>If you\'re in IT, planning to go abroad, or want international recognition — Manipal MUJ is the clear choice. WES recognition is a real differentiator.</p>
<p>If you want a valid degree without spending ₹1.5L+, LPU does the job. Don\'t let anyone tell you it\'s not a real university — it absolutely is, and it\'s cheaper for a reason: lower fees, not lower quality.</p>
<p>What you should avoid: picking based on ads, flashy websites, or commission-hungry education agents. All three of these universities have been genuinely verified by us against UGC DEB, NAAC, and NIRF data.</p>
    `,
  },
  {
    slug: 'how-to-choose-online-mba-specialisation-india-2026',
    title: 'Which Online MBA Specialisation Should You Pick? (India 2026 Guide)',
    metaDescription: 'Finance, Marketing, HR, Data Analytics, Operations — which MBA specialisation is right for you? We break it down by your current job, salary goals, and what employers actually want.',
    category: 'Career Advice',
    tags: ['MBA specialisation', 'MBA finance', 'MBA marketing', 'online MBA India'],
    publishedAt: '2026-03-01',
    readTime: 6,
    targetKeyword: 'online MBA specialisation India 2026',
    relatedUniversities: ['nmims', 'symbiosis', 'chandigarh'],
    status: 'published',
    faqs: [
      { q: 'Is Finance or Marketing better for salary?', a: 'Finance has a higher ceiling — top finance roles can touch ₹25L+. But the average salary difference isn\'t as dramatic as people think. Marketing at a good FMCG or tech company can match finance easily. Pick based on what you\'re actually good at, not salary charts.' },
      { q: 'Is Data Analytics MBA worth it in 2026?', a: 'Yes, but only if you\'re already somewhat technical. Data Analytics MBA is a hybrid — it has management coursework plus SQL, Python basics, and business intelligence tools. If you\'re from IT or have any analytics experience, this adds a lot of value. If you\'re from a pure sales background, Finance or Marketing might be a smoother transition.' },
      { q: 'Does the specialisation matter for government jobs?', a: 'Not really. For most government recruitment, the degree itself (MBA from a UGC DEB approved university) is what matters, not the specialisation. The specialisation matters more for private sector career paths.' },
    ],
    content: `
<h2>Pick your specialisation based on your current job, not your dream job</h2>
<p>This is counterintuitive, but it\'s the right approach. Most people who do an online MBA use it to get promoted in their current sector — not to completely pivot into a new industry. If you try to make too big a jump, the MBA alone won\'t be enough.</p>
<p>There are exceptions. But as a starting rule: match your specialisation to where you already have experience.</p>

<h2>Finance MBA</h2>
<p><strong>Best for:</strong> People in banking, accounting, BFSI, or anyone who regularly works with P&L, budgets, or financial reporting.</p>
<p><strong>What you actually learn:</strong> Financial modelling, corporate finance, investment analysis, working capital management, banking products.</p>
<p><strong>Salary range:</strong> ₹6L–₹25L depending on role and company. Finance at a good bank or NBFC pays well.</p>
<div class="callout-key">Finance is the most common specialisation in India and also the most competitive. The advantage is that the skills are transferable across almost every industry.</div>

<h2>Marketing MBA</h2>
<p><strong>Best for:</strong> Sales professionals, brand managers, anyone in FMCG, e-commerce, or digital marketing.</p>
<p><strong>What you actually learn:</strong> Brand strategy, consumer behaviour, digital marketing, pricing, distribution.</p>
<p><strong>Salary range:</strong> ₹5L–₹20L. D2C companies and tech startups are the highest payers right now.</p>

<h2>Human Resource Management</h2>
<p><strong>Best for:</strong> HR executives, recruiters, people in admin roles who want to move into HR strategy.</p>
<p><strong>What you actually learn:</strong> Talent management, labour law, performance systems, compensation design.</p>
<p><strong>Salary range:</strong> ₹5L–₹15L. HR roles at larger companies pay significantly more than SMEs.</p>

<h2>Data Analytics MBA</h2>
<p><strong>Best for:</strong> IT professionals, analysts, anyone comfortable with spreadsheets and data.</p>
<p><strong>What you actually learn:</strong> Business intelligence, SQL basics, Python for analytics, data-driven decision making.</p>
<p><strong>Salary range:</strong> ₹7L–₹20L. One of the fastest growing specialisations in demand.</p>
<div class="callout-info">Not available at all universities — check before you choose. NMIMS, Manipal MUJ, and Chandigarh University all offer it.</div>

<h2>Operations & Supply Chain</h2>
<p><strong>Best for:</strong> Manufacturing, logistics, procurement, plant operations roles.</p>
<p><strong>What you actually learn:</strong> Lean management, supply chain optimisation, inventory, quality systems.</p>
<p><strong>Salary range:</strong> ₹5L–₹18L. Often underrated — senior operations roles at large manufacturers pay very well.</p>

<h2>The bottom line</h2>
<p>Don\'t pick a specialisation because it sounds impressive. Pick it because it aligns with the job you\'re trying to get or the promotion you\'re trying to earn. Your MBA is a credential that supports your work experience — it doesn\'t replace it.</p>
<p>If you\'re genuinely unsure, Finance is the safest choice. It\'s versatile, widely recognised, and opens the most doors across industries.</p>
    `,
  },
]

export function getBlogPost(slug: string): BlogPost | undefined {
  return BLOG_POSTS.find(p => p.slug === slug)
}
// Alias used by CMS-generated version
export const getPostBySlug = getBlogPost

export function getPublishedPosts(): BlogPost[] {
  return BLOG_POSTS.filter(p => p.status === 'published').sort(
    (a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
  )
}

export function getPostsByCategory(category: string): BlogPost[] {
  return getPublishedPosts().filter(p => p.category === category)
}

export const BLOG_CATEGORIES = [
  'All',
  'MBA Guides',
  'University Reviews',
  'Career Advice',
  'Guides',
  'GEO Targeting',
]
