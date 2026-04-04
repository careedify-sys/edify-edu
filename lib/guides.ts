// lib/guides.ts — Guide content for /guides pages

export interface Guide {
  id: string
  icon: string
  tag: string
  title: string
  seoTitle: string
  desc: string
  metaDescription: string
  readTime: string
  targetKeyword: string
  content: string
}

export const GUIDES: Guide[] = [
  {
    id: 'is-online-degree-valid-india',
    icon: '✅',
    tag: 'Validity & Recognition',
    title: 'Is an Online Degree Valid in India? (2026)',
    seoTitle: 'Is an Online Degree Valid in India? 2026 Guide',
    desc: 'UGC DEB approved online degrees are legally equivalent to regular degrees. Here\'s exactly what that means and how to verify.',
    metaDescription: 'Yes — UGC DEB approved online degrees are legally valid in India for jobs, higher studies, and government exams. Here\'s what to check before you enrol.',
    readTime: '5 min read',
    targetKeyword: 'is online degree valid india',
    content: `
<h2>Short Answer: Yes, But Only from UGC DEB Approved Universities</h2>
<p>An online degree is fully valid in India — for private jobs, government jobs, higher studies, and even civil services — provided the university is approved by the <strong>UGC Distance Education Bureau (UGC DEB)</strong>. If it isn't, the degree has no legal standing.</p>
<p>This distinction matters because dozens of universities offer online programs without UGC DEB approval. Their degrees are not recognised.</p>

<h2>What Makes an Online Degree Legally Valid?</h2>
<p>Three things must be true:</p>
<ul>
<li><strong>The university must be UGC DEB approved</strong> — listed on the official UGC DEB portal for the specific program you're enrolling in</li>
<li><strong>The program must be on the approved list</strong> — a university can be approved for MBA but not MCA; check the program, not just the university</li>
<li><strong>You must have enrolled in the correct academic year</strong> — approvals are granted year by year; confirm your batch is covered</li>
</ul>

<h2>Is It Equivalent to a Regular Degree?</h2>
<p>Yes. The UGC circular dated April 2020 explicitly states that online degrees from approved universities are <em>at par</em> with conventional degrees for all purposes — employment, promotion, higher studies, and eligibility for competitive exams including UPSC, state PSCs, and bank exams.</p>
<p>The degree certificate itself does not say "online." It reads the same as a regular degree from that university.</p>

<h2>How to Verify a University is UGC DEB Approved</h2>
<ol>
<li>Go to <strong>deb.ugc.ac.in</strong></li>
<li>Click "Approved Universities for Online Programs"</li>
<li>Search for the university name and check that your specific program is listed</li>
<li>Confirm the approval covers the current academic year</li>
</ol>
<p>You can also check on Edify — every university listed on this site has been verified against the UGC DEB database.</p>

<h2>Common Concerns Answered</h2>
<p><strong>Will my employer accept it?</strong> Yes. Large private sector employers (Infosys, TCS, Deloitte, HDFC) have been accepting UGC DEB approved online degrees for years. If an HR asks, you can cite the UGC circular directly.</p>
<p><strong>Can I do a PhD after an online MBA?</strong> Yes. UGC rules allow you to pursue a PhD after an online postgraduate degree from an approved university.</p>
<p><strong>Is distance education the same as online education?</strong> No. Distance education (ODL) and online education are two separate modes regulated differently. Both can be valid, but the approvals are issued separately. Check which mode your program falls under.</p>
    `,
  },
  {
    id: 'online-mba-for-government-jobs',
    icon: '🏛️',
    tag: 'Government Jobs',
    title: 'Is Online MBA Valid for Government Jobs in India? (2026)',
    seoTitle: 'Online MBA Valid for Government Jobs India 2026',
    desc: 'Can you use an online MBA to apply for government jobs or promotions? The exact rules, which exams qualify, and what to watch out for.',
    metaDescription: 'An online MBA from a UGC DEB approved university is valid for government jobs, UPSC, and bank exams in India. Here\'s what the rules actually say.',
    readTime: '5 min read',
    targetKeyword: 'online mba valid for government jobs india',
    content: `
<h2>Yes — With One Condition</h2>
<p>An online MBA is valid for government jobs in India if the university is <strong>UGC DEB approved</strong>. The UGC's 2020 circular made this unambiguous: online degrees from approved universities are treated as equivalent to regular degrees for all employment purposes, including government recruitment.</p>
<p>If your university is on the UGC DEB approved list, you can use your online MBA to apply for government positions, appear in competitive exams, and claim promotion benefits — exactly like a regular MBA holder.</p>

<h2>Which Government Exams Accept Online MBA Degrees?</h2>
<ul>
<li><strong>UPSC Civil Services</strong> — accepts any degree (including online) from a recognised university. MBA is not required for IAS, but it counts as a postgraduate qualification where needed.</li>
<li><strong>Bank PO / Bank SO (IBPS, SBI)</strong> — most bank specialist officer posts require a relevant degree. Online MBA from approved universities qualifies.</li>
<li><strong>State PSC exams</strong> — most accept UGC-recognised degrees. Check the specific notification for your state.</li>
<li><strong>PSU recruitment (ONGC, BHEL, NTPC)</strong> — PSUs are increasingly accepting online degrees. Check the recruitment notification for the specific PSU.</li>
<li><strong>Defence civilian roles</strong> — generally follow UGC guidelines; online degrees from approved universities are accepted.</li>
</ul>

<h2>Promotions and Pay Upgrades in Government Jobs</h2>
<p>If you're already in a government job and want to use an online MBA for promotion or pay grade revision, the process depends on your department's rules. Most central government departments now accept UGC DEB approved online degrees for career progression — but your department's DPC (Departmental Promotion Committee) has final say.</p>
<p>Get written confirmation from your HR/admin department before enrolling if your goal is specifically a promotion.</p>

<h2>One Thing to Watch Out For</h2>
<p>Some older government job notifications (especially at state level) may have language like "full-time regular degree" or "campus-based program." These are typically outdated — the UGC's stance supersedes them. However, if you encounter this language, verify with the recruiting body before applying.</p>
<p>The safest universities for government job aspirants are those with both UGC DEB approval and a high NAAC grade (A++ or A+): Amity, NMIMS, Symbiosis, MAHE Manipal, LPU, Chandigarh University.</p>

<h2>Bottom Line</h2>
<p>If the university is UGC DEB approved and NAAC accredited, your online MBA carries the same weight as a regular MBA for government employment in India. The law supports this clearly. No employer — public or private — can legally reject a degree solely because it was earned online.</p>
    `,
  },
  {
    id: 'online-mba-vs-distance-mba',
    icon: '⚖️',
    tag: 'Program Comparison',
    title: 'Online MBA vs Distance MBA: Key Differences in 2026',
    seoTitle: 'Online MBA vs Distance MBA India 2026 — Key Differences',
    desc: 'Both are UGC recognised but they are not the same. Here\'s what\'s different in terms of classes, exams, flexibility, and employer perception.',
    metaDescription: 'Online MBA and distance MBA are regulated differently in India. Here\'s what\'s actually different — live classes, exams, fees, and which employers prefer.',
    readTime: '6 min read',
    targetKeyword: 'online mba vs distance mba india',
    content: `
<h2>They Are Legally Different Modes Under UGC</h2>
<p>UGC recognises two separate modes of non-campus study: <strong>Online Education</strong> and <strong>Open & Distance Learning (ODL)</strong>. An "online MBA" operates under the Online mode; a "distance MBA" operates under ODL. Both can be valid — but they are regulated separately, approved separately, and delivered differently.</p>

<h2>Key Differences at a Glance</h2>
<table style="width:100%;border-collapse:collapse;font-size:13px">
<thead><tr style="background:#f5f5f5"><th style="padding:8px;text-align:left;border:1px solid #e0e0e0">Feature</th><th style="padding:8px;text-align:left;border:1px solid #e0e0e0">Online MBA</th><th style="padding:8px;text-align:left;border:1px solid #e0e0e0">Distance MBA</th></tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e0e0e0">Live classes</td><td style="padding:8px;border:1px solid #e0e0e0">Yes — weekend Zoom/Teams sessions</td><td style="padding:8px;border:1px solid #e0e0e0">Rarely — mostly self-study from printed/digital material</td></tr>
<tr style="background:#fafafa"><td style="padding:8px;border:1px solid #e0e0e0">Faculty interaction</td><td style="padding:8px;border:1px solid #e0e0e0">Regular, via LMS and live sessions</td><td style="padding:8px;border:1px solid #e0e0e0">Minimal — contact programs 1–2x per semester</td></tr>
<tr><td style="padding:8px;border:1px solid #e0e0e0">Exam mode</td><td style="padding:8px;border:1px solid #e0e0e0">Online proctored or exam centres</td><td style="padding:8px;border:1px solid #e0e0e0">Physical exam centres only</td></tr>
<tr style="background:#fafafa"><td style="padding:8px;border:1px solid #e0e0e0">Fees</td><td style="padding:8px;border:1px solid #e0e0e0">₹1L–₹3L total</td><td style="padding:8px;border:1px solid #e0e0e0">₹30K–₹1L total (often cheaper)</td></tr>
<tr><td style="padding:8px;border:1px solid #e0e0e0">UGC regulation</td><td style="padding:8px;border:1px solid #e0e0e0">UGC DEB Online mode</td><td style="padding:8px;border:1px solid #e0e0e0">UGC DEB ODL mode</td></tr>
<tr style="background:#fafafa"><td style="padding:8px;border:1px solid #e0e0e0">Employer perception</td><td style="padding:8px;border:1px solid #e0e0e0">Generally better — seen as more rigorous</td><td style="padding:8px;border:1px solid #e0e0e0">Accepted but older stigma persists in some sectors</td></tr>
<tr><td style="padding:8px;border:1px solid #e0e0e0">IGNOU, NMIMS DDE</td><td style="padding:8px;border:1px solid #e0e0e0">Not offered in distance mode</td><td style="padding:8px;border:1px solid #e0e0e0">Yes — these are classic distance programs</td></tr>
</tbody>
</table>

<h2>Which One is Better?</h2>
<p><strong>Online MBA is better if:</strong> you want structured learning with faculty access, you're targeting mid/senior corporate roles, or you want a more recent brand-name university on your CV (Amity, NMIMS, Symbiosis, MAHE).</p>
<p><strong>Distance MBA is better if:</strong> budget is the primary constraint, you're completing a degree mainly for government job eligibility, or you're self-motivated and don't need live classes (IGNOU MBA is ₹31,500 total and fully valid).</p>

<h2>Does the Degree Certificate Look Different?</h2>
<p>No. Both modes issue the same degree certificate — it doesn't say "online" or "distance" on it. The mode of study is not printed on the degree.</p>

<h2>Can You Switch Between Modes?</h2>
<p>No. You enrol in one mode and complete it. If you start a distance MBA and want to switch to an online MBA from another university, you'd have to re-enrol (credit transfer between institutions and modes is not standard in India yet).</p>
    `,
  },
  {
    id: 'how-to-check-ugc-deb-approval',
    icon: '🔍',
    tag: 'Accreditation',
    title: 'How to Check if a University is UGC DEB Approved (2026)',
    seoTitle: 'How to Check UGC DEB Approval for Online Universities 2026',
    desc: 'Step-by-step: how to verify any online university on the official UGC DEB portal before paying fees. Takes 2 minutes.',
    metaDescription: 'Verify any online university\'s UGC DEB approval in 2 minutes using the official portal. Step-by-step guide with screenshots guide for 2026 admissions.',
    readTime: '4 min read',
    targetKeyword: 'how to check ugc deb approval university',
    content: `
<h2>Why This Check Matters</h2>
<p>There are universities in India that actively advertise online MBAs without holding UGC DEB approval. Their degrees are not recognised for jobs, higher studies, or government exams. Verifying before you pay fees takes two minutes and can save you two years and ₹1–3 lakh.</p>

<h2>Method 1: UGC DEB Official Portal (Most Reliable)</h2>
<ol>
<li>Open <strong>deb.ugc.ac.in</strong> in your browser</li>
<li>Click on <strong>"Approved Universities"</strong> or look for the "List of Approved HEIs" link</li>
<li>You'll see a list of universities approved for online or ODL programs</li>
<li>Search for the university name</li>
<li>Check that:
  <ul>
  <li>The university is listed</li>
  <li>Your specific program (MBA, MCA, BBA, etc.) is approved</li>
  <li>The approval covers the current academic year (2025–26 or 2026–27)</li>
  </ul>
</li>
</ol>
<p>If the university is not on this list, its online programs are not recognised by UGC regardless of what their marketing material says.</p>

<h2>Method 2: Check on Edify</h2>
<p>Every university listed on Edify has been verified against the UGC DEB database. If a university is on our <a href="/universities">universities page</a>, it is UGC DEB approved. We check this before listing any institution.</p>

<h2>What to Look for Beyond UGC DEB</h2>
<p>UGC DEB approval is the minimum. After confirming it, check:</p>
<ul>
<li><strong>NAAC accreditation grade</strong> — A++ or A+ indicates quality assurance. B++ is acceptable. Below B++ is a red flag for online programs.</li>
<li><strong>NIRF ranking</strong> — India's official university ranking system. Listed in the top 200 is a positive signal; not listed is neutral (many good universities aren't ranked).</li>
<li><strong>Year of UGC DEB approval</strong> — universities approved before 2020 have a longer track record in online education.</li>
</ul>

<h2>Red Flags to Watch For</h2>
<ul>
<li>University claims "UGC recognised" but not "UGC DEB approved" — these are different. All universities are UGC recognised; only some are approved for online programs.</li>
<li>No mention of UGC DEB on the university's website — reputable institutions prominently display their approvals.</li>
<li>Fee structure is extremely low (under ₹20,000 total) with no recognisable brand — check carefully.</li>
<li>Admissions with no eligibility check — a legitimate online MBA requires at least a bachelor's degree verification.</li>
</ul>

<h2>If You're Already Enrolled and Unsure</h2>
<p>Run the UGC DEB check now. If your university is not listed, contact the university directly and ask for their UGC DEB approval letter with the approval number. A legitimate university will provide this immediately. If they cannot, consult UGC directly at ugc.ac.in.</p>
    `,
  },
  {
    id: 'naac-nirf-rankings-explained',
    icon: '📊',
    tag: 'Rankings',
    title: 'NAAC and NIRF Rankings Explained for Online MBA Students',
    seoTitle: 'NAAC and NIRF Rankings Explained — Online MBA India 2026',
    desc: 'What NAAC grades and NIRF rankings actually mean, how they\'re calculated, and how much weight to give them when choosing an online MBA.',
    metaDescription: 'NAAC grades and NIRF rankings explained for online MBA aspirants in India. What A++ means, how NIRF works, and how much they should influence your decision.',
    readTime: '5 min read',
    targetKeyword: 'naac nirf ranking explained online mba india',
    content: `
<h2>NAAC and NIRF Are Different Things</h2>
<p>Students often confuse them. Here's the distinction:</p>
<ul>
<li><strong>NAAC</strong> (National Assessment and Accreditation Council) — assesses and accredits universities and colleges. Gives a letter grade: A++, A+, A, B++, B+, B, C, D. It's a quality certification, not a ranking.</li>
<li><strong>NIRF</strong> (National Institutional Ranking Framework) — ranks universities and institutions on a 1–200 scale across categories (overall, management, engineering, etc.). Run by the Ministry of Education. Updated annually.</li>
</ul>

<h2>What NAAC Grades Mean</h2>
<table style="width:100%;border-collapse:collapse;font-size:13px">
<thead><tr style="background:#f5f5f5"><th style="padding:8px;text-align:left;border:1px solid #e0e0e0">Grade</th><th style="padding:8px;text-align:left;border:1px solid #e0e0e0">CGPA Range</th><th style="padding:8px;text-align:left;border:1px solid #e0e0e0">What It Signals</th></tr></thead>
<tbody>
<tr><td style="padding:8px;border:1px solid #e0e0e0">A++</td><td style="padding:8px;border:1px solid #e0e0e0">3.76–4.0</td><td style="padding:8px;border:1px solid #e0e0e0">Excellent. Top tier in India. Very few universities hold this.</td></tr>
<tr style="background:#fafafa"><td style="padding:8px;border:1px solid #e0e0e0">A+</td><td style="padding:8px;border:1px solid #e0e0e0">3.51–3.75</td><td style="padding:8px;border:1px solid #e0e0e0">Very good. Strong infrastructure and academic quality.</td></tr>
<tr><td style="padding:8px;border:1px solid #e0e0e0">A</td><td style="padding:8px;border:1px solid #e0e0e0">3.26–3.50</td><td style="padding:8px;border:1px solid #e0e0e0">Good. Meets quality benchmarks. Acceptable for most employers.</td></tr>
<tr style="background:#fafafa"><td style="padding:8px;border:1px solid #e0e0e0">B++</td><td style="padding:8px;border:1px solid #e0e0e0">3.01–3.25</td><td style="padding:8px;border:1px solid #e0e0e0">Above average. Some gaps but generally sound.</td></tr>
<tr><td style="padding:8px;border:1px solid #e0e0e0">B+ or below</td><td style="padding:8px;border:1px solid #e0e0e0">Below 3.01</td><td style="padding:8px;border:1px solid #e0e0e0">Caution. Research more before enrolling.</td></tr>
</tbody>
</table>
<p>NAAC accreditation is valid for 5 years. Always check when it was last issued — a 2019 A+ grade may not reflect current quality.</p>

<h2>What NIRF Rankings Mean</h2>
<p>NIRF ranks institutions on five parameters: Teaching, Learning & Resources (30%), Research & Professional Practice (30%), Graduation Outcomes (20%), Outreach & Inclusivity (10%), Perception (10%).</p>
<p>For <em>online programs specifically</em>, NIRF rankings are a partial signal. NIRF measures the overall institution — a university ranked #15 overall (like Amity) runs a better campus program than the rankings reflect for the online division. The online division quality is not ranked separately.</p>
<p>That said, NIRF top-50 universities generally have better online infrastructure, faculty, and placement support than unranked ones.</p>

<h2>How Much Weight Should You Give These?</h2>
<p>For an online MBA decision:</p>
<ul>
<li><strong>NAAC grade matters more</strong> — it directly reflects academic quality and is checked by most employers and PhD programs</li>
<li><strong>NIRF rank is a tiebreaker</strong> — if two universities have the same NAAC grade and similar fees, pick the higher NIRF ranked one</li>
<li><strong>Neither replaces UGC DEB approval</strong> — a NAAC A+ university without UGC DEB approval for online programs has an invalid online degree</li>
</ul>

<h2>Best Combination to Look For</h2>
<p>For online MBA in 2026, target: <strong>UGC DEB approved + NAAC A or above + NIRF top 100</strong>. Universities that meet all three: Amity, NMIMS, Symbiosis, MAHE Manipal, LPU, Chandigarh University, Jain University.</p>
    `,
  },
  {
    id: 'online-mba-eligibility-india',
    icon: '📋',
    tag: 'Admissions',
    title: 'Online MBA Eligibility: Who Can Apply in 2026',
    seoTitle: 'Online MBA Eligibility Criteria India 2026 — Who Can Apply',
    desc: 'Minimum qualifications, age limits, work experience requirements, and which degrees qualify for online MBA admission in India.',
    metaDescription: 'Online MBA eligibility in India 2026: minimum graduation requirements, work experience rules, age limits, and which streams can apply. Complete guide.',
    readTime: '4 min read',
    targetKeyword: 'online mba eligibility india 2026',
    content: `
<h2>Basic Eligibility for Online MBA in India</h2>
<p>The minimum eligibility for an online MBA is the same as for a regular MBA:</p>
<ul>
<li><strong>Bachelor's degree</strong> in any discipline from a recognised university</li>
<li><strong>Minimum 50% aggregate</strong> in graduation (45% for reserved categories in most universities)</li>
<li>Some universities accept 45% for all categories — check the specific university</li>
</ul>
<p>No entrance exam is typically required for online MBA programs, unlike IIM or top B-school campus MBAs. Most universities conduct a simple online admission form + document verification.</p>

<h2>Which Graduation Streams Can Apply?</h2>
<p>Any stream qualifies — BA, B.Com, B.Sc, B.Tech, BBA, BCA, B.Arch, B.Pharmacy, MBBS, LLB. There is no stream restriction for online MBA in India. Arts graduates can apply alongside engineering graduates.</p>

<h2>Work Experience: Required or Not?</h2>
<p>Most online MBA programs do <strong>not</strong> require work experience for admission. You can enrol straight after graduation.</p>
<p>A few premium programs do require it:</p>
<ul>
<li>NMIMS Global Online MBA — recommends 2+ years experience (not mandatory)</li>
<li>Some executive MBA tracks from Symbiosis and XLRI — require 3–5 years</li>
<li>Standard online MBA programs (Amity, LPU, Chandigarh, Jain, MAHE) — no work experience required</li>
</ul>
<p>That said, having 1–3 years of work experience before starting an online MBA makes the content significantly more actionable and helps with internal projects and case studies.</p>

<h2>Age Limit</h2>
<p>There is no upper age limit for online MBA admission in India. Students in their 40s and 50s regularly enrol, especially for career change or promotion purposes. Some universities have a minimum age of 21 (i.e., you must have completed graduation).</p>

<h2>Documents Required for Admission</h2>
<ul>
<li>10th and 12th mark sheets</li>
<li>Graduation degree certificate and mark sheets (all semesters)</li>
<li>Government ID proof (Aadhaar, PAN, passport)</li>
<li>Passport-size photograph</li>
<li>Work experience letter (if applicable)</li>
<li>Migration certificate (if graduation was from a different state university)</li>
</ul>

<h2>Can Final-Year Students Apply?</h2>
<p>Yes. Most online MBA universities accept applications from students in their final year of graduation. Admission is conditional — you complete admission formalities now, and submit final graduation documents within 3–6 months after your results are declared. Confirm this policy with the specific university before applying.</p>

<h2>Special Cases</h2>
<p><strong>Diploma holders:</strong> Generally not eligible unless the diploma is a 3-year lateral entry degree-level program. A standard ITI or polytechnic diploma does not qualify.</p>
<p><strong>Distance graduation:</strong> A graduation degree from UGC recognised distance/ODL university is valid for online MBA admission.</p>
<p><strong>Foreign degrees:</strong> Recognised by AIU (Association of Indian Universities) — get an AIU equivalency certificate before applying.</p>
    `,
  },
]

export function getGuideById(id: string): Guide | null {
  return GUIDES.find(g => g.id === id) || null
}
