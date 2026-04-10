// lib/content.ts — Edify Content Blueprint
// Blueprint-aligned content for all programs, specializations, and university pages

export interface ProgramContent {
  metaTitle: string; metaDesc: string; heroHeadline: string; heroSubheadline: string
  overview: string; whatYouLearn: string[]; format: string
  skills: { technical: string[]; soft: string[] }
  certifications: string[]; internshipDesc: string
  internshipExamples: string[]; projectExamples: string[]; liveExposure: string[]
  resumeAdditions: string[]; linkedinTips: string[]; profileEdge: string
  careerBeginner: { title: string; desc: string }[]
  careerMid: { title: string; desc: string }[]
  careerSenior: { title: string; desc: string }[]
  topCompanies: string[]; salaryNote: string; salaryGrowth: string
  faqs: { q: string; a: string }[]
  editorialGuide?: string
}

export interface SpecContent {
  metaTitle: string; metaDesc: string; heroHeadline: string; heroSub: string
  overview: string; whyChoose: string[]; skills: string[]; certifications: string[]
  careerBeginner: { title: string; desc: string }[]
  careerMid: { title: string; desc: string }[]
  careerSenior: { title: string; desc: string }[]
  projectIdeas: string[]; resumeTip: string; topCompanies: string[]
  salaryRange: string; salaryGrowth: string; faqs: { q: string; a: string }[]
  editorialGuide?: string
}

export interface UniProgramContent {
  programTagline: string; whyHere: string[]; learningExperience: string
  industryEdge: string; careerOutcomeHighlight: string; profileEdge: string; alumniNote: string
}

export const PROGRAM_CONTENT: Partial<Record<string, ProgramContent>> = {
  'MBA': {
    metaTitle: 'Online MBA in India 2026 — Specialisations, Careers & Salary | Edify',
    metaDesc: 'Explore online MBA programs from NIRF-ranked universities. Finance, Marketing, HR, Data Science specialisations. UGC approved. Fees from ₹40K. Honest comparison, salary data and career outcomes.',
    heroHeadline: 'Online MBA in India — Lead, Manage, Grow.',
    heroSubheadline: 'Earn a UGC-approved MBA from NIRF-ranked universities. Study finance, marketing, HR, operations or data science — without quitting your job.',
    overview: 'An online MBA lets you pick up a postgraduate management degree without quitting your job or relocating. In India, this used to mean distance learning — but UGC DEB-approved online MBA programs now carry the same legal standing as a regular campus degree. You get the credential, the skills, and the network. You keep your income.',
    whatYouLearn: [
      'Business Strategy & Competitive Analysis — Porter\'s Five Forces, SWOT, Blue Ocean',
      'Financial Management — P&L reading, budgeting, working capital, valuation basics',
      'Marketing Management — consumer behaviour, brand strategy, digital marketing fundamentals',
      'Human Resource Management — talent acquisition, performance systems, labour law',
      'Operations & Supply Chain — process optimisation, lean management, logistics',
      'Business Analytics & Decision Making — data-driven decisions, Excel, BI dashboards',
      'Organisational Behaviour — leadership styles, team dynamics, change management',
      'Entrepreneurship & Innovation — business models, funding, startup ecosystems',
    ],
    format: 'Live online classes (3–4 sessions/week, recorded for replay). Weekend batches available. 4 semesters over 24 months. Assessment: 60% internal projects + 40% proctored exams.',
    skills: {
      technical: ['Financial Modelling (Excel)', 'Power BI / Tableau for data analysis', 'Business case writing', 'Project planning and execution', 'CRM and ERP tools basics'],
      soft: ['Strategic thinking and problem framing', 'Stakeholder communication', 'Team leadership and conflict resolution', 'Data-driven decision making', 'Cross-functional collaboration'],
    },
    certifications: [
      'Google Analytics Certification — prep module in Semester 1',
      'SHRM Essentials of HR — HR specialisation track',
      'Six Sigma Yellow Belt — Operations specialisation',
      'HubSpot Marketing Certification — Marketing track',
      'University Completion Certificate — UGC DEB approved, valid for private sector and banking',
    ],
    internshipDesc: 'Most MBA programs include a 6–8 week industry internship in Semester 3. Virtual and hybrid formats available for working professionals. Stipends: ₹10,000–₹25,000/month.',
    internshipExamples: [
      'Business Development Intern — FMCG or e-commerce firm, virtual, ₹12,000–₹20,000/month',
      'Finance Analyst Intern — BFSI company or CA firm, ₹10,000–₹18,000/month',
      'HR Operations Intern — IT services firm, virtual, ₹8,000–₹15,000/month',
      'Marketing Intern — D2C brand or digital agency, ₹10,000–₹20,000/month',
    ],
    projectExamples: [
      'Market Entry Strategy — build a go-to-market plan for a new product in an emerging market',
      'Financial Restructuring Report — analyse a listed company and propose capital structure improvements',
      'HR Policy Design — create a performance management framework for a 200-person company',
      'Supply Chain Audit — map inefficiencies in a manufacturing firm and calculate potential savings',
    ],
    liveExposure: [
      'Monthly guest lectures by CXOs from BFSI, IT, FMCG, and consulting sectors',
      'Annual B-school case competition — teams solve live business challenges',
      'Peer learning cohorts of 10–15 students across diverse industries',
      'Alumni mentorship connects you with MBA graduates in your target sector',
    ],
    resumeAdditions: [
      'MBA, [University Name], [Year] — NIRF #X, NAAC A+ | UGC DEB Approved',
      'Specialisation: [e.g., Finance] — include relevant coursework modules',
      'Project: [Capstone project title and measurable outcome]',
      'Certifications: Google Analytics / HubSpot / SHRM — include issuer and year',
      'Tools: Excel, Power BI, Tableau, SQL basics, CRM platforms',
    ],
    linkedinTips: [
      'Headline: "MBA Candidate | [Specialisation] | [University] | Targeting [Role]"',
      'Education section: add program, university, graduation year, and 3 relevant modules',
      'Projects: document capstone with measurable outcome (e.g., "Identified ₹12L cost savings")',
      'Skills: strategy, financial analysis, marketing — collect endorsements from classmates',
      'Ask a professor or internship supervisor for a LinkedIn recommendation',
    ],
    profileEdge: 'An MBA from a NIRF-ranked university signals commitment to professional growth. Pair it with a strong project portfolio, one or two partner certifications, and a clear career narrative on LinkedIn to stand out in competitive applicant pools.',
    careerBeginner: [
      { title: 'Management Trainee', desc: 'Rotational role across departments — common entry at large corporates (Unilever, TCS, HDFC)' },
      { title: 'Business Analyst', desc: 'Bridges business problems and data insights; high demand in IT, BFSI, and consulting' },
      { title: 'Sales / BDM Executive', desc: 'Target-driven role at FMCG, SaaS, or fintech; strong earning potential with incentives' },
      { title: 'HR Generalist', desc: 'Handles recruitment, onboarding, and employee relations at SMEs or large corporates' },
    ],
    careerMid: [
      { title: 'Product Manager', desc: 'Owns product roadmap and P&L; high-demand at tech and e-commerce companies' },
      { title: 'Finance Manager', desc: 'Manages budgeting, reporting, and financial strategy for a business unit' },
      { title: 'Marketing Manager', desc: 'Leads brand, campaign, and digital strategy; oversees a team of 3–8 people' },
      { title: 'Operations Manager', desc: 'Drives process efficiency, vendor management, and supply chain across a unit' },
    ],
    careerSenior: [
      { title: 'General Manager / VP', desc: 'P&L responsibility for a business unit; typically 10–15 years post-MBA' },
      { title: 'Chief Financial Officer (CFO)', desc: 'Leads financial strategy, investor relations, and capital allocation' },
      { title: 'Chief Marketing Officer (CMO)', desc: 'Sets brand strategy and growth agenda; reports directly to CEO' },
      { title: 'Management Consultant (Partner)', desc: 'Senior advisory role at Big 4 or strategy firms; significant equity and travel' },
    ],
    topCompanies: ['HDFC Bank', 'Infosys', 'TCS', 'Wipro', 'Deloitte', 'KPMG', 'EY', 'HUL', 'ITC', 'Amazon', 'Flipkart', 'Axis Bank', 'ICICI Bank', 'Accenture', 'Mu Sigma', 'Bajaj Finance'],
    salaryNote: 'MBA salaries range from ₹4L for freshers to ₹35L+ at senior levels. Specialisation, university brand, and work experience are the biggest salary drivers.',
    salaryGrowth: 'Career switchers entering management from technical roles typically see 30–55% salary hikes within 18 months. Professionals already in management average a 20–30% hike post-MBA. Source: AmbitionBox 2024, Glassdoor India 2024.',
    faqs: [
      { q: 'Is an online MBA as good as a regular MBA?', a: 'From a UGC DEB-approved university, the degree is legally identical. For private sector roles, employers increasingly do not distinguish between online and regular MBA from the same university.' },
      { q: 'Can I do an online MBA while working full-time?', a: 'Yes — it is specifically designed for working professionals. Classes run on weekday evenings (7–9 PM) and Saturday mornings. All sessions are recorded. Most students manage 12–15 hours/week including class and study.' },
      { q: 'Which specialisation has the best salary?', a: 'Finance and Data Science consistently have the highest average starting salaries (₹8–15L range). Marketing and Operations are close behind. HR tends to have lower starting salaries but strong CHRO-track long-term growth.' },
      { q: 'How do I choose between specialisations?', a: 'Match your specialisation to your current experience or target industry. IT professionals: Operations or Data Science. Sales professionals: Marketing or General Management. Talk to an Edify counsellor for a personalised shortlist.' },
    ],
    editorialGuide: `
# Choosing an Online MBA in India 2026: The Ultimate Professional's Guide

Choosing an **online MBA in India 2026** is not just about getting a degree; it's about strategic career acceleration. With over 100 UGC-approved universities offering online management programs, the decision-making process has become more complex than ever. This guide will help you navigate the landscape of **best online mba india** options, focusing on ROI, accreditation, and career outcomes.

## Why 2026 is the Year of the Online MBA
The Indian corporate sector has undergone a massive transformation. Digital-first businesses, FinTech, and D2C brands are the largest employers in 2026, and they value one thing above all: the ability to manage and scale in a digital environment. An online MBA is uniquely structured to allow you to apply management frameworks to your current job in real-time. Whether you are an engineer looking to move into product management or a sales professional eye-ing a leadership role, 2026 is the year to formalize your skills.

## The 3 Pillars of a Great Online MBA
1. **UGC DEB Approval:** Never settle for a "Distance" degree without verifying it against the latest UGC DEB list. In 2026, the parity between online and regular degrees is absolute—but only if the university has the correct license. Every university on Edify is 100% verified for **UGC DEB approved online degree** status.
2. **NIRF Ranking:** Don't trust private "Best University" awards that are often bought. Only look at the National Institutional Ranking Framework (NIRF) from the Ministry of Education. We recommend focusing on NIRF Top-100 universities for the best long-term credibility.
3. **NAAC Accreditation:** An 'A++' or 'A+' grade from NAAC is a signal of high institutional quality. In 2026, most top-tier online MBA providers in India hold at least an 'A+' grade.

## Comparing the Top 5 Online MBA Universities in 2026
*   **Amity University Online:** Known for its global recognition and robust LMS. Ideal for those targeting MNC roles.
*   **Manipal University (MAHE):** Consistently a top NIRF-ranked institution with strong corporate ties and premium alumni networks.
*   **LPU Online:** Outstanding for those seeking a balance of affordable fees and strong placement support.
*   **Chandigarh University:** Very popular for its high-tech learning interface and industry-aligned specialisations like Data Science.
*   **Jain University Online:** A powerhouse for FinTech and new-age management roles.

## ROI Analysis: Fees vs. Salary Hike
An online MBA in India 2026 costs between **₹1.5 Lakh to ₹4 Lakh** for the full two-year program. In contrast, a top regular MBA costs ₹15 Lakh+.
*   **Starting Salary:** Post-MBA professionals typically see an immediate salary bump of 30-50%.
*   **Long-term Growth:** The "Management Ceiling" is real. Professionals without a postgraduate degree often get stuck at mid-management levels. An MBA is the key that unlocks senior leadership roles.

## Specialisations for 2026: Finance, Marketing & Data Science
While General Management is a safe bet, specialisations like **MBA in Data Science**, **MBA in Marketing**, and **MBA in Finance** are seeing 40% higher demand in 2026. If you are in tech, a Data Science specialisation is virtually mandatory for moving into leadership. If you are in sales, Marketing is your natural path.

## Online Degree Valid for Government Jobs?
Yes, but with caveats. As of 2026, **UGC DEB approved online degrees** are legally equivalent to regular degrees for all government jobs. However, certain PSU-based technical roles still prefer regular mode. For 90% of banking, civil services, and corporate roles, the online MBA is a perfect choice.

## Conclusion: How to Choose?
Don't choose based on a Facebook ad. Use Edify's independent data to compare fees, faculty, and real NIRF rankings. Our mission is to ensure that your **online mba india 2026** journey is a profitable investment, not just an expense.
    `,
  },

  'MCA': {
    metaTitle: 'Online MCA in India 2026 — IT Careers, Skills & Salary | Edify',
    metaDesc: 'Earn an online MCA from NIRF-ranked universities. Master software development, data science, cloud computing or cybersecurity. UGC approved. Fees from ₹35K. Launch or advance your IT career.',
    heroHeadline: 'Online MCA — Your Gateway to India\'s IT Industry.',
    heroSubheadline: 'Earn a UGC-approved Master of Computer Applications from top universities. Software, cloud, AI, cybersecurity — choose your specialisation. No engineering degree required.',
    overview: 'A Master of Computer Applications (MCA) is a two-year postgraduate degree training you in software development, system design, database management, and emerging technologies. It is the most direct path for BCA, BSc, BCom or BA graduates to enter India\'s IT sector — and for working IT professionals to formalise and advance their skills.',
    whatYouLearn: [
      'Programming Fundamentals — C, C++, Java, Python at advanced level',
      'Data Structures & Algorithms — the backbone of any software engineering interview',
      'Database Management Systems — SQL, MySQL, MongoDB, query optimisation',
      'Web & Mobile Development — HTML/CSS, JavaScript, React, Android/iOS basics',
      'Cloud Computing — AWS/Azure/GCP fundamentals, serverless architecture',
      'Software Engineering — SDLC, Agile, version control with Git',
      'Computer Networks & Cybersecurity — TCP/IP, firewalls, VAPT basics',
      'AI & Machine Learning — Python ML libraries, model building introduction',
    ],
    format: 'Live online classes (3 sessions/week) + virtual lab sessions. Coding assignments graded weekly. 4 semesters over 24 months. Assessment: 60% practicals + projects, 40% theory exams.',
    skills: {
      technical: ['Full-stack development (MERN/MEAN stack)', 'Python for data analysis and scripting', 'SQL and NoSQL database management', 'Cloud platform basics (AWS/Azure)', 'Version control with Git and GitHub', 'API development and REST architecture'],
      soft: ['Systematic problem-solving and debugging', 'Technical documentation writing', 'Agile/Scrum team participation', 'Code review and peer collaboration', 'Client requirement analysis'],
    },
    certifications: [
      'AWS Cloud Practitioner — exam voucher at select universities',
      'Google IT Support Certificate — embedded Semester 1',
      'Cisco Introduction to Cybersecurity — security module',
      'Oracle SQL Fundamentals — database module',
      'University MCA Completion Certificate — UGC DEB approved',
    ],
    internshipDesc: 'MCA programs typically include a compulsory 8–12 week software development internship in Semester 3–4. Most are remote or hybrid — accessible to students across Tier 2 and 3 cities.',
    internshipExamples: [
      'Software Developer Intern — IT services firm (Infosys, Wipro, HCL), remote, ₹10,000–₹18,000/month',
      'Data Analyst Intern — fintech or e-commerce startup, ₹12,000–₹20,000/month',
      'Cloud/DevOps Intern — SaaS company, virtual, ₹12,000–₹22,000/month',
      'QA/Testing Intern — product company, ₹8,000–₹15,000/month',
    ],
    projectExamples: [
      'E-commerce Web App — full-stack MERN app with cart, payment gateway, and admin dashboard',
      'ML Recommendation System — collaborative filtering using Python and scikit-learn',
      'Inventory Management System — desktop app with SQL database and reporting module',
      'Network Security Audit — simulated VAPT on test environment with vulnerability report',
    ],
    liveExposure: [
      'Weekly coding challenges on HackerRank or LeetCode — tracked and graded',
      'Monthly tech talks by engineers from top IT companies',
      'Hackathons — 24-hour coding competitions with internship referrals for winners',
      'GitHub portfolio workshops — build a project showcase employers actually look at',
    ],
    resumeAdditions: [
      'MCA, [University Name], [Year] — NIRF #X, NAAC A+ | UGC DEB Approved',
      'Technical Skills: Python, Java, SQL, React, Node.js, AWS — specify cloud platform',
      'GitHub: [your GitHub URL] — list 3–5 pinned repositories with description',
      'Project: [App Name] — built with [tech stack], features [X, Y, Z], live at [URL]',
      'Certification: AWS Cloud Practitioner / Google IT Support — [Year]',
    ],
    linkedinTips: [
      'Headline: "MCA Candidate | Full Stack Developer | Python · SQL · React | [University]"',
      'GitHub link in Contact Info — your most powerful MCA credential',
      'Projects: add each major project with tech stack, problem solved, and link',
      'Skills: Python, SQL, JavaScript, Cloud Computing — get 10+ endorsements',
    ],
    profileEdge: 'An MCA with a visible GitHub profile and 2–3 deployed personal projects will consistently outperform candidates with stronger marks but no portfolio. Start building projects from Day 1 — not after graduation.',
    careerBeginner: [
      { title: 'Junior Software Developer', desc: 'Builds and tests features in web or mobile apps; most common IT entry role' },
      { title: 'Junior Data Analyst', desc: 'Cleans, queries, and visualises data; high demand at analytics-driven companies' },
      { title: 'QA Engineer (Tester)', desc: 'Writes and executes test cases; strong foundation for moving to dev or DevOps' },
      { title: 'IT Support Specialist', desc: 'Manages IT infrastructure; common in banking and large corporates' },
    ],
    careerMid: [
      { title: 'Software Engineer / Senior Developer', desc: 'Owns feature development and code reviews; leads a sub-team of 2–4 engineers' },
      { title: 'Data Scientist', desc: 'Builds ML models; typically requires 2+ years of analyst experience' },
      { title: 'Cloud/DevOps Engineer', desc: 'Manages CI/CD pipelines, cloud infrastructure, and deployment automation' },
      { title: 'Cybersecurity Analyst', desc: 'Protects systems from threats; one of India\'s most undersupplied IT roles' },
    ],
    careerSenior: [
      { title: 'Engineering Manager / Tech Lead', desc: 'Owns technical delivery for a product area; manages 5–15 engineers' },
      { title: 'Solutions Architect', desc: 'Designs system architecture for clients or internal platforms; high-paying consulting role' },
      { title: 'Chief Technology Officer (CTO)', desc: 'Sets the technical vision and roadmap for the entire organisation' },
    ],
    topCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Cognizant', 'Tech Mahindra', 'Amazon', 'Microsoft', 'Google India', 'IBM India', 'Capgemini', 'Accenture', 'Zomato', 'Paytm', 'PhonePe'],
    salaryNote: 'MCA salaries range from ₹3.5L for freshers to ₹25L+ for senior engineers. Cloud, AI/ML, and cybersecurity roles command the highest premiums.',
    salaryGrowth: 'MCA graduates with project portfolios and cloud certifications earn ₹6–10L at their first job — 40% above BCA-only peers. Mid-career MCA in cloud or data roles average ₹14–22L. Source: NASSCOM 2024, AmbitionBox 2024.',
    faqs: [
      { q: 'Who is eligible for online MCA?', a: 'BCA, BSc (IT/CS/Maths), BCom, BA, or any graduate with Mathematics in Class 12. Minimum 45–50% marks in graduation. No prior coding experience required — Semester 1 covers fundamentals.' },
      { q: 'Can a non-IT graduate do an MCA?', a: 'Yes, if you have Mathematics in Class 12. Many universities accept BCom, BA (with Maths), and non-IT BSc graduates. Semester 1 is designed as a bridge covering programming basics.' },
      { q: 'How is MCA different from MTech or MSc CS?', a: 'MCA is application-focused (software development, databases, networks). MTech is research and engineering-oriented. MSc CS is theoretically deeper. For IT industry careers, MCA is the most directly useful.' },
    ],
    editorialGuide: `
# Online MCA India 2026 — Your Career Guide for IT Mastery

The **online MCA in India 2026** has emerged as the most efficient bridge for non-engineering graduates to enter the high-stakes IT industry. Whether you are a BCA, B.Sc., or B.Com graduate, an MCA from a **UGC DEB approved online university** offers a path to becoming a Senior Software Developer, Data Scientist, or Cloud Architect without a four-year B.Tech.

## Why MCA is the Right Move in 2026
India's IT services export and the massive growth of home-grown SaaS companies have created an insatiable demand for software talent. An online MCA allows you to master **Programming (Java/Python)**, **Database Management (SQL/NoSQL)**, and **Cloud Computing (AWS/Azure)** over four semesters. In 2026, companies like TCS, Infosys, and HCL increasingly treat a verified online MCA with the same respect as a regular degree.

## The Core Skill-Stack for 2026
*   **Full-Stack Development:** MERN and MEAN stacks remain the most employable skills.
*   **Artificial Intelligence:** Every top **online mca india 2026** program now includes a deep-dive into AI and Machine Learning.
*   **Cloud Architecture:** As businesses migrate to the cloud, MCA graduates with AWS or Google Cloud certifications are earning 30-40% higher salaries.

## Best Online Universities for MCA in 2026
Look for universities with strong Lab-based learning. Since MCA is a technical degree, the "virtual lab" experience is crucial. Universities like **Manipal (MAHE)**, **Amity**, and **Chandigarh University** are leading the way with industry-aligned curriculum and strong placement track records for MCA graduates.

## ROI: Salaries and Growth
An online MCA cost averages between **₹70,000 to ₹1.8 Lakh** for the full two-year course. 
*   **Entry Level:** Fresh MCA graduates typically start at ₹4 Lakh - ₹7 Lakh.
*   **Mid-Career:** After 5 years, with the right certifications, salaries often touch ₹15 Lakh+.
Compared to the cost of the degree, the return on investment for an online MCA is arguably the highest in the education sector today.

## Is Online MCA valid for IT Placements?
Absolutely. As long as the university is **UGC DEB approved**, your degree is a valid credential. At Edify, we help you filter universities that offer dedicated placement assistance and virtual hiring fairs, Ensuring that your **best online mca india** search leads to a real job offer.
    `,
  },

  'BBA': {
    metaTitle: 'Online BBA in India 2026 — Admissions, Careers & Salary | Edify',
    metaDesc: 'Start your management journey with an online BBA from UGC-approved universities. Learn finance, marketing, HR and business fundamentals. 3-year degree. Fees from ₹28K. Build a business career from day one.',
    heroHeadline: 'Online BBA — Start Your Business Career Now.',
    heroSubheadline: 'Earn a UGC-approved Bachelor of Business Administration. Learn management, marketing, finance and leadership — while building real industry skills from Year 1.',
    overview: 'A Bachelor of Business Administration (BBA) is a 3-year undergraduate degree that gives you a structured foundation in business management, marketing, finance, and organisational behaviour. The online BBA is ideal for students who want to combine study with work, internships, or entrepreneurship — and for working professionals who want a formal degree to back their experience.',
    whatYouLearn: [
      'Principles of Management — planning, organising, leading, controlling',
      'Financial Accounting — P&L, balance sheet, ratio analysis, GST basics',
      'Marketing Management — 4Ps, consumer behaviour, brand building, digital channels',
      'Human Resource Management — recruitment, appraisal, motivation theories',
      'Business Mathematics & Statistics — practical quantitative skills for business',
      'Organisational Behaviour — team dynamics, leadership, corporate culture',
      'Business Communication — professional writing, presentation, negotiation',
      'Entrepreneurship — business plan development, funding basics, startup ecosystem',
    ],
    format: 'Online classes 3–4 times/week. Weekend batches available. 6 semesters over 3 years. Assignment-based assessment. Most universities require one exam centre visit per semester.',
    skills: {
      technical: ['Business analysis using Excel and basic statistics', 'Digital marketing basics (SEO, social media)', 'Accounting software familiarity (Tally basics)', 'Business presentation and report writing', 'CRM tools basics'],
      soft: ['Professional communication in English', 'Team management and coordination', 'Problem identification and structured thinking', 'Customer service and relationship management', 'Time management and self-discipline'],
    },
    certifications: [
      'NISM Series Certification (Securities Markets) — finance track',
      'Google Digital Marketing Certificate — marketing track',
      'Tally ERP Certification — accounting module',
      'University BBA Completion Certificate — UGC DEB approved',
    ],
    internshipDesc: 'A 4–6 week summer internship is part of most BBA programs in Year 2. Formats range from local SME placements to virtual internships at larger organisations.',
    internshipExamples: [
      'Marketing Intern — local SME or digital agency, ₹5,000–₹12,000/month',
      'Accounts Intern — CA firm or small company, ₹5,000–₹10,000/month',
      'HR Intern — corporate or recruitment firm, ₹6,000–₹12,000/month',
    ],
    projectExamples: [
      'Business Plan — create a viable startup plan with financials for a local market gap',
      'Market Research Report — survey 50+ consumers and analyse buying behaviour',
      'Financial Analysis — study 2 years of a listed company and write an investment note',
    ],
    liveExposure: [
      'Industry guest lectures from entrepreneurs, sales managers, and business owners',
      'Case study discussions on real Indian businesses (Jio, Zomato, Nykaa)',
      'Peer projects simulating business decisions in team settings',
    ],
    resumeAdditions: [
      'BBA, [University Name], [Year] — UGC DEB Approved',
      'Internship: [Company], [Role], [Duration] — 1-line achievement',
      'Project: Business Plan for [Product/Service] — presented to faculty jury',
      'Skills: MS Office, Excel, Tally, Google Analytics, basic financial analysis',
    ],
    linkedinTips: [
      'Headline: "BBA Student | Marketing & Finance | [University] | Seeking Internship"',
      'Post about your business learnings — 1 post/week builds your professional presence',
      'Connect with alumni from your university in your target sector',
    ],
    profileEdge: 'BBA is most powerful as a stepping stone. Build on it with an MBA, a professional certification, or 2–3 years of strong work experience. BBA graduates combining degree with digital marketing or accounting certification get 40% more interview calls.',
    careerBeginner: [
      { title: 'Sales Executive / BDE', desc: 'Revenue-generating role at FMCG, banking, insurance, or SaaS companies' },
      { title: 'Marketing Executive', desc: 'Supports digital, events, or brand campaigns at SMEs and startups' },
      { title: 'HR Assistant / Recruiter', desc: 'Entry into HR at corporate or staffing firms; high volume of openings' },
      { title: 'Accounts Executive', desc: 'Bookkeeping, GST filing, invoice management at SMEs and CA firms' },
    ],
    careerMid: [
      { title: 'Marketing Manager', desc: 'Leads campaigns and team; typically after 3–4 years plus an MBA' },
      { title: 'Business Development Manager', desc: 'Owns revenue targets and client acquisition; high-paying in B2B SaaS' },
      { title: 'Operations Supervisor', desc: 'Manages logistics, retail operations, or service delivery teams' },
    ],
    careerSenior: [
      { title: 'Business Owner / Entrepreneur', desc: 'Many BBA graduates launch their own ventures — the degree builds the foundational toolkit' },
      { title: 'Senior Manager / Director', desc: 'After BBA + MBA or 8+ years of experience in a specialised function' },
    ],
    topCompanies: ['HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Reliance Retail', 'Tata Group', 'Amazon India', 'Flipkart', 'Bajaj Finance', 'HUL'],
    salaryNote: 'BBA freshers typically earn ₹2.5L–₹5L per annum. Sales roles can touch ₹6–8L with incentives. Management trainee roles at large corporates are the highest-paying BBA entry positions.',
    salaryGrowth: 'BBA + MBA is one of India\'s most common career acceleration paths — graduates typically see 2–3x salary growth within 5 years of starting BBA. Source: AmbitionBox 2024.',
    faqs: [
      { q: 'Is online BBA valid in India?', a: 'Yes — from a UGC DEB-approved university, an online BBA has the same legal standing as a regular BBA. Valid for private sector employment, MBA admissions, and competitive exam eligibility.' },
      { q: 'Can I do online BBA after Class 12?', a: 'Yes. Any stream with minimum 45–50% marks in 10+2. Mathematics is not required unless the university specifically asks for it.' },
      { q: 'What is better — BBA or B.Com?', a: 'BBA is stronger for management and business skills. B.Com is stronger in accounting, commerce, and finance theory. BBA for management roles; B.Com for CA/CMA/accounting careers. Both qualify for MBA.' },
    ],
    editorialGuide: `
# Online BBA India 2026 — Start Your Business Leadership Journey

An **online BBA in India 2026** is the most flexible way to build a foundation in management while starting your career or focusing on a venture of your own. Unlike a regular degree, the online mode allows you to gain real-world experience through internships or jobs while you study.

## Is Online BBA Worth It in 2026?
The answer is a loud yes. As of 2026, the Indian job market highly values candidates who possess both a formal degree and practical work experience. A **UGC DEB approved online degree** in business administration signals to employers that you are self-disciplined, tech-savvy, and ready for the modern workplace.

## Core Specialisations for Online BBA in 2026
*   **Marketing & Digital Business:** Ideal for those looking to join the booming D2C and e-commerce sector.
*   **Finance & Banking:** Prepares you for entry-level roles in India's massive BFSI sector.
*   **Human Resource Management:** Focuses on the "People" side of business, which is critical in the remote-work era of 2026.

## Top Universities for Online BBA in 2026
*   **Amity Online:** Premium branding and excellent networking opportunities.
*   **LPU Online:** Known for its industry-curated curriculum and affordability.
*   **Manipal University Jaipur:** Offers a high-quality academic experience with NIRF-ranked credentials.

## Career Paths and Salary Expectation
BBA graduates in 2026 are entering roles like Business Development Executive, Marketing Associate, and Management Trainee. Average starting salaries for **online bba india 2026** graduates range from ₹3 Lakh to ₹5 Lakh, but the real value is the 2-Year headstart you get over your campus-bound peers.
    `,
  },

  'BCA': {
    metaTitle: 'Online BCA in India 2026 — IT Skills, Careers & Salary | Edify',
    metaDesc: 'Earn an online BCA from UGC-approved universities. Learn programming, web development, databases and networking. 3-year degree. Fees from ₹28K. Launch your IT career or prepare for MCA.',
    heroHeadline: 'Online BCA — Build Your IT Career from Scratch.',
    heroSubheadline: 'Learn programming, web development, databases, and networking through a UGC-approved BCA degree. No prior coding experience needed to apply.',
    overview: 'A Bachelor of Computer Applications (BCA) is a 3-year undergraduate IT degree open to students from any Class 12 stream. The online BCA gives you the flexibility to learn and build projects at your own schedule while earning a degree that IT companies recognise for entry-level developer, analyst, and support roles.',
    whatYouLearn: [
      'Programming in C, C++, and Java — industry-standard for placement tests',
      'Web Development — HTML, CSS, JavaScript, and PHP basics',
      'Database Management — SQL, MySQL, data modelling',
      'Data Structures & Algorithms — essential for software job interviews',
      'Computer Networks — protocols, IP addressing, network security fundamentals',
      'Operating Systems — Linux basics, process management, memory concepts',
      'Software Engineering — SDLC, project management, testing methodologies',
      'Python Programming — scripting, automation, data analysis introduction',
    ],
    format: 'Online classes 3–4 times/week + virtual lab sessions. Programming assignments submitted weekly. 6 semesters over 3 years. Assessment: coding practicals 50% + semester exams 50%.',
    skills: {
      technical: ['Programming in C/C++, Java, Python', 'SQL queries and database design', 'Web development basics (HTML/CSS/JS)', 'Version control with Git', 'Linux command line basics'],
      soft: ['Logical and structured thinking', 'Debugging and problem-solving', 'Technical documentation writing', 'Team-based project delivery', 'Deadline management'],
    },
    certifications: [
      'NPTEL Programming in Java/Python — free certification from IITs',
      'Oracle SQL Certified Associate — database module preparation',
      'Google IT Support Certificate — foundation IT skills',
      'HackerRank Problem Solving Certificate — valued for placement interviews',
    ],
    internshipDesc: 'A 4–6 week internship in a software company, IT support team, or web development agency is standard in Year 2 or 3. Remote internships are widely available.',
    internshipExamples: [
      'Junior Web Developer Intern — local IT agency or startup, ₹5,000–₹12,000/month',
      'IT Support Intern — corporate or banking firm, ₹6,000–₹10,000/month',
      'Database Trainee Intern — ERP or software company, ₹5,000–₹10,000/month',
    ],
    projectExamples: [
      'Student Management System — Java + MySQL desktop application with CRUD operations',
      'Portfolio Website — responsive HTML/CSS/JS site deployed on GitHub Pages',
      'Library Management App — database-backed with user login and report generation',
    ],
    liveExposure: [
      'Coding challenges on HackerRank and LeetCode — competitive edge in placement tests',
      'Industry guest sessions by software engineers and developers',
      'Open-source contribution guidance — add real GitHub commits to your profile',
    ],
    resumeAdditions: [
      'BCA, [University Name], [Year] — UGC DEB Approved',
      'GitHub: [URL] — include 2–3 pinned projects with descriptions',
      'Technical Skills: C, Java, Python, SQL, HTML/CSS, Git',
      'Project: [App Name] — brief description, tech stack, and GitHub link',
    ],
    linkedinTips: [
      'Headline: "BCA Graduate | Java · Python · SQL | Seeking Developer/IT Role"',
      'GitHub is your most important credential — link it prominently',
      'HackerRank: earn 4+ stars in Java or Python and list it on resume',
    ],
    profileEdge: 'BCA is the foundation. Your GitHub portfolio and competitive coding profile get you the interview — your degree gets you through the eligibility filter. Start building projects from Year 1, not after exams.',
    careerBeginner: [
      { title: 'Junior Software Developer', desc: 'Entry-level dev role at IT services, startups, or web agencies' },
      { title: 'QA/Test Engineer', desc: 'Tests software features; excellent entry point with clear promotion path' },
      { title: 'IT Support Specialist', desc: 'Manages systems and troubleshooting; common in banking and large organisations' },
      { title: 'Web Developer (Freelance)', desc: 'Many BCA graduates start freelancing while studying — high ROI on time' },
    ],
    careerMid: [
      { title: 'Software Engineer', desc: 'After 3–4 years of experience or BCA + MCA combined path' },
      { title: 'System Administrator', desc: 'Manages server infrastructure, cloud accounts, and IT systems' },
      { title: 'Full-Stack Developer', desc: 'Builds and maintains web products for companies or freelance clients' },
    ],
    careerSenior: [
      { title: 'Senior Developer / Tech Lead', desc: 'After BCA + MCA + 5–7 years of experience' },
      { title: 'Freelance Developer (Independent)', desc: 'Many BCA graduates build independent client practices at ₹1,500–₹4,000/hour' },
    ],
    topCompanies: ['TCS', 'Infosys', 'Wipro', 'HCL', 'Cognizant', 'NIIT Technologies', 'Mphasis', 'Tech Mahindra', 'Hexaware', 'Persistent Systems'],
    salaryNote: 'BCA freshers typically earn ₹2.5L–₹5L. Developer roles at product companies pay ₹4–8L at entry. Cloud and full-stack skills can push BCA salary to ₹8–12L within 3 years.',
    salaryGrowth: 'BCA + MCA is the most common path to ₹15L+ IT salaries within 7 years of starting college. Source: NASSCOM 2024, AmbitionBox 2024.',
    faqs: [
      { q: 'Can I do BCA without Maths in Class 12?', a: 'Yes — many UGC-approved universities accept BCA without Maths in Class 12. Some require basic Maths at Class 10. Check each university eligibility criteria.' },
      { q: 'Is online BCA recognised by IT companies?', a: 'Yes, from UGC-approved universities. TCS, Infosys, Wipro accept online BCA graduates. What matters most is your coding ability — build a GitHub portfolio.' },
      { q: 'Should I do MCA after BCA?', a: 'If you want senior IT roles (engineer, architect, data scientist), yes — MCA adds significant salary and career ceiling. Experience + certifications can work for junior roles, but MCA is recommended for career growth.' },
    ],
    editorialGuide: `
# Online BCA India 2026 — Build Your Foundation for a Tech Career

The **online BCA in India 2026** has become the go-to undergraduate degree for students from any stream (Arts, Commerce, or Science) looking to enter the IT industry. In 2026, you don't need to be an engineer to build software; you need a solid foundation in logic, data, and web technologies.

## Why 2026 is Different for BCA Students
With the rise of low-code/no-code platforms and AI-assisted coding, the focus of a **best online bca india** program has shifted. It's no longer just about memorizing syntax; it's about system design, problem-solving, and understanding how data flows in a modern app.

## Key Skills You'll Master
1. **Python & JavaScript:** The languages of the modern web and AI.
2. **Cloud Fundamentals:** Learning how to deploy apps on AWS or Azure.
3. **Database Systems:** Mastering both SQL (traditional) and NoSQL (modern) data storage.

## Leading Universities for Online BCA in 2026
*   **Chandigarh University:** Top-tier infrastructure and placement support.
*   **Amity University Online:** Global curriculum and industry certifications included.
*   **LPU Online:** Affordable, accessible, and highly practical.

## Placement Opportunities
BCA graduates in 2026 are highly sought after by IT giants like TCS and Wipro for their 'Ignite' and 'Launchpad' programs. An **online bca india 2026** ensures you are eligible for these entry-level software roles while giving you the freedom to build your own portfolio on GitHub.
    `,
  },

  'BA': {
    metaTitle: 'Online BA in India 2026 — Subjects, Careers & UPSC Guide | Edify',
    metaDesc: 'Earn an online BA from UGC-approved universities. Study English, Psychology, Political Science, History, Journalism. 3-year degree. Fees from ₹18K. UPSC-eligible. Government-job valid options available.',
    heroHeadline: 'Online BA — Knowledge That Opens Every Door.',
    heroSubheadline: 'UGC-approved Bachelor of Arts in English, Psychology, Political Science, History, Sociology and more — with full flexibility for UPSC preparation.',
    overview: 'A Bachelor of Arts (BA) is a 3-year undergraduate degree in humanities, social sciences, and liberal arts — one of the most flexible degrees in India. It qualifies you for UPSC civil services, teaching, journalism, public administration, law, MBA, and countless other career paths. The online BA gives you flexibility to study while pursuing work or competitive exam coaching.',
    whatYouLearn: [
      'Core subjects based on specialisation: English Literature, Political Science, History, Sociology, Psychology, Economics, Public Administration, or Journalism',
      'Academic writing and critical analysis — essay construction, argument building',
      'Research methodology — survey design, qualitative and quantitative research basics',
      'Indian political system and governance — essential for UPSC and government sector',
      'Communication and media literacy — especially in Journalism track',
      'Social science perspectives — understanding society, culture, behaviour, and institutions',
    ],
    format: 'Online lectures + reading materials. 6 semesters over 3 years. Assignment-based assessment with semester exams at authorised centres.',
    skills: {
      technical: ['Academic and professional writing in English', 'Research and data gathering', 'Report and essay structuring', 'Basic digital literacy and online research', 'Presentation and public speaking'],
      soft: ['Critical and analytical thinking', 'Cultural awareness and empathy', 'Communication across contexts (written and spoken)', 'Self-directed learning discipline', 'Adaptability across career paths'],
    },
    certifications: [
      'IGNOU Certificate in Journalism — for Journalism/Mass Communication specialisation',
      'Spoken English and Communication (British Council / Coursera)',
      'Digital Literacy Certificate — for government job applications',
      'Certificate in Guidance & Counselling (IGNOU) — Psychology track',
    ],
    internshipDesc: 'BA programs often include project work or fieldwork. Journalism, Psychology, and Social Work specialisations may have structured practicum or field visit components.',
    internshipExamples: [
      'Editorial Intern — local newspaper, digital publication, or NGO communication team',
      'Research Intern — think tank, government affairs firm, or university research department',
      'Counselling Shadow Intern — NGO or community psychology organisation (Psychology track)',
    ],
    projectExamples: [
      'Dissertation — 5,000-word research paper in your specialisation area',
      'Survey Study — conduct primary research with 50+ respondents and analyse findings',
      'Media Report — produce a 3-part written series (Journalism specialisation)',
    ],
    liveExposure: [
      'Guest lectures from civil servants, journalists, academics, and NGO leaders',
      'Debate and group discussion practice — valuable for UPSC and job interviews',
      'Current affairs workshops — especially relevant for competitive exam aspirants',
    ],
    resumeAdditions: [
      'BA in [Specialisation], [University Name], [Year] — UGC DEB Approved',
      'Dissertation/Project: [Topic] — 1-line research finding or insight',
      'Relevant coursework: [subjects most relevant to target role]',
      'Certifications: [IELTS/communication/journalism cert if applicable]',
    ],
    linkedinTips: [
      'Headline: "BA Graduate | [Specialisation] | UPSC Aspirant / Writer / [Target Role]"',
      'Clearly state your next goal on LinkedIn — UPSC, journalism, MBA, teaching',
      'Connect with journalists, civil servants, and academics in your specialisation',
    ],
    profileEdge: 'BA is India\'s most versatile undergraduate degree. Its power lies in what you pair it with: UPSC preparation, an MA, MBA, law degree, or teaching qualification. Your specialisation and what you build alongside your BA define your career ceiling.',
    careerBeginner: [
      { title: 'Content Writer / Copywriter', desc: 'High demand across digital marketing, journalism, and corporate communications' },
      { title: 'Social Media Executive', desc: 'Manages brand presence on social platforms; entry-level digital marketing' },
      { title: 'Government Job (after exam)', desc: 'BA qualifies for SSC, State PCS, banking, and railway exams' },
      { title: 'Research Assistant', desc: 'Supports academic or policy research at universities, NGOs, or think tanks' },
    ],
    careerMid: [
      { title: 'Civil Servant (IAS/IPS/IFS)', desc: 'Most prestigious BA career path; requires clearing UPSC Civil Services' },
      { title: 'Journalist / Editor', desc: 'Content creation, editorial leadership at print, broadcast, or digital media' },
      { title: 'HR Manager', desc: 'BA + MBA or work experience leads to strong HR careers in corporate India' },
      { title: 'School Teacher / Lecturer', desc: 'After BA + B.Ed or MA; government school teaching offers stability and pension' },
    ],
    careerSenior: [
      { title: 'IAS / District Collector', desc: 'Senior government administration; BA is the qualifying degree for UPSC' },
      { title: 'Senior Journalist / Editor-in-Chief', desc: 'Editorial leadership at national publications or digital media' },
      { title: 'Policy Analyst / Consultant', desc: 'Government affairs, think tank, or international organisations (UN, World Bank)' },
    ],
    topCompanies: ['Government of India (UPSC)', 'State PSCs', 'Jagran Group', 'Times of India', 'NDTV', 'The Hindu', 'TCS BPS', 'Wipro BPS', 'KPMG (research roles)', 'Leading NGOs'],
    salaryNote: 'BA salaries vary widely: content writing ₹2.5–4L, government banking ₹3–5L, IAS career offers security and allowances. Journalism ₹2L at local print to ₹8L+ at national digital outlets.',
    salaryGrowth: 'BA graduates pursuing UPSC, MA, MBA, law, or teaching qualifications see the highest career growth. BA + MA in Economics or Political Science opens public policy, research, and academic careers with strong long-term earnings.',
    faqs: [
      { q: 'Is online BA valid for UPSC Civil Services?', a: 'Yes — a BA from a UGC-recognised university (online or regular) is valid for UPSC eligibility. IGNOU online BA is gold standard for government recognition. Private university online BA is valid for most state government exams.' },
      { q: 'What subjects can I study in online BA?', a: 'Common specialisations: English, Hindi, Political Science, History, Sociology, Psychology, Economics, Geography, Philosophy, Public Administration, Journalism & Mass Communication. Available subjects vary by university.' },
      { q: 'Can I do online BA while preparing for UPSC?', a: 'Yes — and many UPSC toppers use this combination. Online MA in Political Science, History or Public Administration aligns directly with UPSC GS papers. The flexibility gives you more UPSC preparation time.' },
    ],
  },

  'B.Com': {
    metaTitle: 'Online B.Com in India 2026 — Accounting, Finance & Career Guide | Edify',
    metaDesc: 'Earn an online B.Com from UGC-approved universities. Learn accounting, taxation, financial management and business law. 3-year degree. Fees from ₹20K. CA/CMA pathway. Government-job eligible options.',
    heroHeadline: 'Online B.Com — Your Commerce and Finance Foundation.',
    heroSubheadline: 'Build expertise in accounting, taxation, financial management, and commerce — the foundation for CA, CMA, MBA, banking and finance careers.',
    overview: 'A Bachelor of Commerce (B.Com) is a 3-year undergraduate degree in accounting, taxation, finance, business law, and commercial economics. It is the most common path for commerce students in India — and a direct prerequisite for CA, CMA, CS, and commerce-focused MBA programs. The online B.Com is ideal for working professionals, school graduates, and career changers.',
    whatYouLearn: [
      'Financial Accounting — journal entries, ledgers, trial balance, final accounts',
      'Cost & Management Accounting — costing methods, budgeting, variance analysis',
      'Direct & Indirect Taxation — Income Tax fundamentals, GST, TDS, filing basics',
      'Business Law & Corporate Law — contracts, company law, SEBI, labour law',
      'Financial Management — capital structure, investment analysis, NPV/IRR',
      'Business Statistics & Economics — data analysis for commerce decision-making',
      'Auditing & Assurance — internal and statutory audit processes',
      'E-Commerce & Business Digitisation — online retail, digital payments',
    ],
    format: 'Online lectures with downloadable notes. 6 semesters over 3 years. Semester exams at authorised exam centres. CA Foundation studies can be pursued alongside B.Com.',
    skills: {
      technical: ['Financial accounting using Tally ERP', 'GST and income tax filing (ITR, GSTR)', 'Excel for financial modelling and MIS reports', 'Cost analysis and budget preparation', 'Statutory compliance and secretarial basics'],
      soft: ['Numerical accuracy and attention to detail', 'Regulatory compliance mindset', 'Business communication in financial contexts', 'Deadline management for tax and audit', 'Ethical reasoning in financial reporting'],
    },
    certifications: [
      'Tally ERP / TallyPrime Certification — most valued by SME and CA firm employers',
      'GST Practitioner Certificate — GSTN recognised, high demand',
      'NISM Series VIII: Equity Derivatives — capital markets specialisation',
      'ICAI CA Foundation — can be pursued alongside B.Com',
    ],
    internshipDesc: 'B.Com students commonly intern at CA firms, tax consultancies, SME accounts departments, or BFSI institutions. These internships are often the pathway to permanent employment.',
    internshipExamples: [
      'Accounts Intern — CA firm or tax consultancy, ₹5,000–₹12,000/month; often converts to full-time',
      'Finance Intern — NBFC, bank, or corporate treasury team, ₹6,000–₹14,000/month',
      'Audit Trainee — Big 4 or mid-size audit firm',
    ],
    projectExamples: [
      'Financial Statement Analysis — analyse 3 years of a BSE-listed company, write investment thesis',
      'GST Compliance Report — document end-to-end GST compliance for a hypothetical SME',
      'Budget Preparation — create annual budget for a 50-person company with variance analysis',
    ],
    liveExposure: [
      'Guest lectures from Chartered Accountants, CFOs, and tax professionals',
      'Income tax return filing workshops (practical hands-on)',
      'Tally and accounting software lab sessions',
    ],
    resumeAdditions: [
      'B.Com, [University Name], [Year] — UGC DEB Approved',
      'Software: Tally ERP/Prime, Excel (VLOOKUP, Pivot Tables, MIS), Zoho Books',
      'Certifications: GST Practitioner / NISM / Tally — include issuer and date',
      'Internship: [CA Firm / Company], [Role], [Duration] — brief achievement',
    ],
    linkedinTips: [
      'Headline: "B.Com Graduate | Accounts & Taxation | Tally · GST · Excel | CA Aspirant"',
      'List Tally and GST certifications prominently — most job-relevant B.Com skills',
      'CA aspirants: mention Foundation clearance date or attempt status',
    ],
    profileEdge: 'B.Com is most valuable combined with: CA qualification (highest earning path), Tally + GST certifications (immediate job-readiness), or MBA Finance. A B.Com graduate with Tally, GST, and Excel skills can land an accounts job within weeks of graduation.',
    careerBeginner: [
      { title: 'Junior Accountant / Accounts Executive', desc: 'Most common B.Com entry role; found at every SME, CA firm, and corporate' },
      { title: 'Tax Assistant', desc: 'GST and income tax compliance at CA firms; often converts to full-time quickly' },
      { title: 'Banking Officer (after IBPS/SBI)', desc: 'B.Com is the minimum qualification for bank clerical and PO exams' },
      { title: 'Finance Intern → Analyst', desc: 'Corporate treasury, NBFC, or BFSI entry; stepping stone to MBA Finance' },
    ],
    careerMid: [
      { title: 'Senior Accountant / Finance Manager', desc: 'After 3–5 years managing accounts, audit, and compliance' },
      { title: 'CA (Chartered Accountant)', desc: 'After clearing ICAI exams (3–5 years); highest-paying B.Com career path' },
      { title: 'GST/Tax Consultant', desc: 'Independent practice or at a firm; high demand across all business sectors' },
    ],
    careerSenior: [
      { title: 'Chief Financial Officer (CFO)', desc: 'B.Com + CA/MBA + 15–20 years of finance experience is the classic CFO track' },
      { title: 'Partner at CA Firm', desc: 'After CA qualification and 8–10 years of practice' },
      { title: 'Finance Director / VP Finance', desc: 'Leads financial strategy at large corporations; salary ₹25–50L+' },
    ],
    topCompanies: ['Deloitte', 'KPMG', 'EY', 'PwC', 'BDO India', 'Grant Thornton', 'HDFC Bank', 'ICICI Bank', 'Axis Bank', 'Bajaj Finance', 'Infosys BPO', 'Genpact', 'WNS Global'],
    salaryNote: 'B.Com starting salaries are ₹2L–₹4L. CA qualification takes this to ₹8–15L; Big 4 CAs earn ₹12–20L+ on qualification. MBA Finance from NIRF Top 50 yields ₹8–18L starting.',
    salaryGrowth: 'B.Com + CA is India\'s highest ROI finance qualification path. B.Com + MBA Finance at NIRF Top 50 yields ₹8–18L starting. B.Com alone with Tally/GST fetches ₹3–6L, growing to ₹8–12L with experience. Source: ICAI 2024, AmbitionBox 2024.',
    faqs: [
      { q: 'Can I pursue CA while doing online B.Com?', a: 'Yes — one of the most popular combinations. Appear for CA Foundation and Intermediate exams while completing B.Com. Online study saves time for ICAI exam preparation.' },
      { q: 'Is online B.Com valid for banking exams?', a: 'Yes. IBPS, SBI, RRB, and insurance company recruitment accept B.Com from UGC-recognised universities. Online B.Com from UGC DEB-approved universities qualifies.' },
    ],
    editorialGuide: `
# Online B.Com India 2026 — The Foundation for Finance Experts

A **Bachelor of Commerce (B.Com)** is the bedrock of India's corporate world. In 2026, an **online b.com india 2026** is the ideal choice for students pursuing CA/CS or those working in small businesses who need a formal degree to climb the ladder in accounting and taxation.

## Why Choose Online B.Com in 2026?
The 2026 business environment is heavily focused on GST compliance, digital accounting, and financial planning. An online B.Com from a **UGC DEB approved online university** provides you with these "Job-Ready" skills without the need to travel to a physical campus.

## ROI and Career Growth
Online B.Com is one of the most affordable degrees in India, with fees starting as low as ₹20,000 for the full 3-year term. For CA aspirants, the online mode is a lifesaver, providing the mandatory graduation certificate while allowing 100% focus on articleship and coaching.

## Key Universities
Universities like **IGNOU (Online)**, **Amity**, and **Manipal** offer structured B.Com programs that are highly respected in the banking and finance sectors.
    `,
  },

  'M.Com': {
    metaTitle: 'Online M.Com in India 2026 — Finance Careers, Skills & Salary | Edify',
    metaDesc: 'Earn an online M.Com from UGC-approved universities. Specialise in accounting, taxation, financial management or banking. 2-year degree. Fees from ₹25K. UGC NET eligible. Advance your finance career.',
    heroHeadline: 'Online M.Com — Master Commerce. Advance Your Finance Career.',
    heroSubheadline: 'Deepen your expertise in taxation, accounting, financial management and business economics with a UGC-approved Master of Commerce degree.',
    overview: 'A Master of Commerce (M.Com) is a 2-year postgraduate degree that deepens expertise in accounting, financial management, taxation, auditing, and business economics. It is the natural next step after B.Com for commerce professionals targeting lecturer/professor roles, senior accounting positions, or government finance services.',
    whatYouLearn: [
      'Advanced Financial Accounting — complex accounts, consolidated statements, Ind AS',
      'Advanced Taxation — corporate tax planning, international taxation, transfer pricing',
      'Financial Management & Markets — capital markets, derivatives, portfolio theory',
      'Research Methodology — dissertation-grade quantitative and qualitative research',
      'Management Accounting & Control — costing, variance analysis, balanced scorecard',
      'Corporate Governance & Ethics — board governance, CSR, accounting ethics',
      'E-Business & Digital Finance — fintech landscape, digital payments, blockchain basics',
      'Banking & Financial Institutions — RBI framework, banking regulation, NBFC operations',
    ],
    format: 'Online lectures + research modules. 4 semesters over 2 years. Dissertation in Semester 4 for UGC NET aspirants. Assessment: 70% exams + 30% assignments.',
    skills: {
      technical: ['Advanced Tally ERP and accounting software', 'Corporate tax compliance and ITR filing', 'Financial statement analysis (Ind AS/IFRS)', 'Statistical tools for commerce research (SPSS/Excel)', 'Capital market analysis and portfolio evaluation'],
      soft: ['Advanced research and academic writing', 'Strategic financial analysis and advisory', 'Regulatory compliance and corporate governance', 'Mentoring and team leadership in finance', 'Ethical decision-making in finance'],
    },
    certifications: [
      'UGC NET/SET Eligibility — M.Com qualifies you to sit for UGC NET (Assistant Professor)',
      'NISM Series V-A: Mutual Fund Distributor — capital markets specialisation',
      'ICAI CMA Inter — cost management advanced track',
    ],
    internshipDesc: 'M.Com programs may include a summer internship or dissertation project. Corporate internships at CA firms, banks, or finance departments are common in Semester 2.',
    internshipExamples: [
      'Senior Accounts Intern — CA firm or corporate finance team, ₹12,000–₹20,000/month',
      'Research Intern — bank economic research division or academic institution',
      'Tax Planning Intern — Big 4 or tax advisory firm, ₹10,000–₹18,000/month',
    ],
    projectExamples: [
      'Dissertation: GST Impact on SME Profitability — original research with data collection',
      'Portfolio Analysis — build and evaluate a 10-stock equity portfolio over 6 months',
      'Corporate Tax Planning Case Study — prepare tax-efficient restructuring for a company',
    ],
    liveExposure: [
      'Research writing workshops — essential for UGC NET aspirants',
      'Guest lectures from senior CAs, CFOs, and RBI-regulated finance professionals',
      'Capital market simulations for banking and investment track',
    ],
    resumeAdditions: [
      'M.Com, [University Name], [Year] — NIRF #X, NAAC A+ | UGC DEB Approved',
      'Dissertation: [Topic and key finding in one line]',
      'UGC NET Qualified: [Subject and year, if cleared]',
      'Skills: Ind AS, Advanced Tally, Corporate Taxation, Financial Modelling, SPSS',
    ],
    linkedinTips: [
      'Headline: "M.Com Graduate | Finance & Taxation | UGC NET Aspirant | [University]"',
      'If UGC NET qualified — mention it boldly; opens lecturer and research positions',
      'Connect with UGC NET study groups and commerce alumni networks',
    ],
    profileEdge: 'M.Com is the most direct qualification for: university lecturers (UGC NET), government finance officer exams, senior accounting roles, and advanced commerce knowledge without the CA route.',
    careerBeginner: [
      { title: 'Accounts Manager', desc: 'Leads accounting function at SMEs; step up from B.Com + experience' },
      { title: 'Tax Consultant', desc: 'Advisory on corporate and personal taxation; independent practice possible' },
      { title: 'Junior Lecturer / Tutor', desc: 'Teaching at private college after M.Com (UGC NET for government colleges)' },
    ],
    careerMid: [
      { title: 'Finance Manager / Controller', desc: 'Manages financial reporting, compliance, and audit for a business unit' },
      { title: 'Assistant Professor (after UGC NET)', desc: 'Government college teaching — one of India\'s highest job-security careers' },
      { title: 'Senior Tax Analyst', desc: 'Corporate tax planning, transfer pricing, international tax at large firms' },
    ],
    careerSenior: [
      { title: 'CFO / Finance Director', desc: 'Senior financial leadership; M.Com + CA or MBA Finance is the classic track' },
      { title: 'Associate Professor / HOD', desc: 'Academic leadership; requires PhD after M.Com' },
    ],
    topCompanies: ['KPMG', 'Deloitte', 'EY', 'PwC', 'HDFC Bank', 'SBI', 'LIC', 'Government Finance Ministry', 'SEBI', 'NABARD', 'Universities (after UGC NET)'],
    salaryNote: 'M.Com salaries: ₹3L (junior lecturer) to ₹12L+ (corporate finance manager). UGC NET-qualified assistant professors earn ₹5.5L–₹8L starting (7th Pay Commission).',
    salaryGrowth: 'M.Com UGC NET leads to permanent government positions with pension. Corporate finance with M.Com + CMA/CA leads to CFO track. Source: UGC Pay Commission reports, AmbitionBox 2024.',
    faqs: [
      { q: 'Does M.Com qualify me for UGC NET?', a: 'Yes — M.Com (55% marks) qualifies you for UGC NET in Commerce (Paper 2 subject code: Commerce). Clearing NET is required for government college teaching posts.' },
      { q: 'Is M.Com better than MBA for a finance career?', a: 'For academic/research careers and government services: M.Com. For corporate management and higher private sector salary growth: MBA Finance. MBA Finance from a good university gives a bigger salary uplift for corporate jobs.' },
    ],
    editorialGuide: `
# Online M.Com India 2026 — Mastering Advanced Finance and Accountancy

The **online M.Com in India 2026** is the definitive postgraduate choice for commerce professionals aiming for senior finance roles or academic positions. For those looking to clear the **UGC NET** or become a specialized Tax Consultant, an M.Com from a **NIRF ranked university** is a mandatory credential.

## Specialisations for 2026
In 2026, M.Com is no longer just "Higher Accounting." You can specialize in **Finance**, **Taxation**, or **Banking & Insurance**. These roles are critical for mid-to-large-scale businesses navigating India's complex regulatory landscape.

## Top Career Outcomes
*   Certified Tax Consultant
*   Senior Financial Analyst
*   Professor/Lecturer (after clearing UGC NET)
*   Government Finance Officer
    `,
  },

  'MA': {
    metaTitle: 'Online MA in India 2026 — Subjects, Careers & UGC NET Guide | Edify',
    metaDesc: 'Earn an online MA from UGC-approved universities. Study English, Psychology, Political Science, History, Sociology or Journalism. 2-year PG degree. Fees from ₹18K. UGC NET eligible. UPSC career path.',
    heroHeadline: 'Online MA — Deepen Your Expertise. Open Doors to Teaching, Research & Public Service.',
    heroSubheadline: 'UGC-approved Master of Arts in English, Psychology, Political Science, History, Sociology, Public Administration and more. Study fully online at your own pace.',
    overview: 'A Master of Arts (MA) is a 2-year postgraduate degree in humanities, social sciences, and liberal arts. It deepens subject expertise and qualifies you for UGC NET (government college teaching), PhD programs, government administrative services, and specialised roles in journalism, counselling, policy, and research.',
    whatYouLearn: [
      'Advanced subject knowledge in your specialisation (English Literature, Psychology, Political Theory, etc.)',
      'Research methodology — primary research, survey design, qualitative/quantitative analysis',
      'Dissertation — original research contribution at postgraduate level',
      'Academic writing and peer review skills',
      'Critical theory and philosophical foundations of your discipline',
      'Contemporary Indian and global context for your field',
    ],
    format: 'Online lectures, reading materials, discussion forums. 4 semesters over 2 years. Dissertation in final semester. Exams at authorised centres.',
    skills: {
      technical: ['Advanced research and academic writing', 'Qualitative research (interviews, content analysis)', 'Quantitative analysis (SPSS, survey data)', 'Policy brief and report writing (Public Administration track)', 'Subject-specific research tools'],
      soft: ['Deep critical and analytical thinking', 'Cross-cultural communication', 'Intellectual humility and evidence-based reasoning', 'Public speaking and academic debate', 'Empathy and ethical reasoning (Psychology/Social Work)'],
    },
    certifications: [
      'UGC NET/SET Qualification — enables teaching in government colleges',
      'Certificate in Guidance & Counselling (IGNOU) — Psychology specialisation',
      'IELTS/TOEFL — English MA students targeting international opportunities',
      'Certificate in Media Writing — Journalism/Mass Communication track',
    ],
    internshipDesc: 'MA programs may include fieldwork, dissertation research supervision, or practicum experiences. Psychology students may complete clinical observation hours.',
    internshipExamples: [
      'Research Intern — NGO, think tank, or university research department',
      'Journalism Intern — newspaper, digital publication, or broadcast media',
      'Counselling Observer — NGO, community mental health centre (Psychology)',
    ],
    projectExamples: [
      'MA Dissertation — 8,000–12,000 word original research paper in your specialisation',
      'Policy Analysis Paper — evaluate a current government policy using political science frameworks',
      'Psychological Case Study — structured analysis following ethical guidelines (Psychology track)',
    ],
    liveExposure: [
      'Guest lectures from professors, researchers, bureaucrats, and journalists',
      'UGC NET preparation strategy webinars',
      'Academic writing and dissertation guidance workshops',
    ],
    resumeAdditions: [
      'MA in [Specialisation], [University Name], [Year] — NIRF #X, NAAC A+ | UGC DEB Approved',
      'Dissertation: "[Title]" — 1-line summary of research finding or contribution',
      'UGC NET Qualified: [Subject and year] — include if cleared',
      'Research Skills: qualitative interviews, SPSS, content analysis, policy research',
    ],
    linkedinTips: [
      'Headline: "MA in [Specialisation] | UGC NET Aspirant / Researcher / [Target Role]"',
      'Post about your research topic and dissertation — academics and research firms notice',
      'Join LinkedIn groups for your specialisation (Political Science, Literature, Psychology)',
    ],
    profileEdge: 'MA career power depends on what you do next: UGC NET opens government teaching; PhD qualifies for professor track; IAS coaching combined with MA in Political Science/History is a classic combination.',
    careerBeginner: [
      { title: 'Content Writer / Digital Journalist', desc: 'Strong demand for MA English and Journalism graduates at digital media companies' },
      { title: 'Research Assistant', desc: 'NGOs, think tanks, CSIR, universities; competitive but intellectually rewarding' },
      { title: 'Government Job (after SSC/state exams)', desc: 'MA qualifies for Group B and A government positions' },
      { title: 'Junior Counsellor (Psychology)', desc: 'After MA Psychology + RCI registration; NGO and school counselling roles' },
    ],
    careerMid: [
      { title: 'Assistant Professor (after UGC NET)', desc: 'Government college teaching — one of India\'s most stable, pension-backed careers' },
      { title: 'IAS / IPS / IFS Officer (after UPSC)', desc: 'MA in Political Science, History or Public Administration is ideal for civil services' },
      { title: 'Senior Journalist / Editor', desc: 'After MA Mass Communication + 4–5 years of newsroom experience' },
    ],
    careerSenior: [
      { title: 'Associate / Full Professor', desc: 'After PhD + publications; requires 8–15 years of academic work' },
      { title: 'Secretary / Joint Secretary (IAS)', desc: 'Senior civil service; one of India\'s highest-prestige careers' },
      { title: 'Policy Director / NGO Head', desc: 'Leadership in development organisations or government advisory bodies' },
    ],
    topCompanies: ['Government of India (UPSC)', 'State PSCs', 'Kendriya Vidyalaya Sangathan', 'NCERT', 'Times of India', 'The Hindu', 'NDTV', 'BBC India', 'TISS', 'UN agencies', 'Leading NGOs'],
    salaryNote: 'MA salaries: government teaching ₹5.5–8L starting; IAS track ₹7.5L + perks; journalism ₹3–10L by outlet; psychology counselling ₹3–6L. Academic career peaks at ₹12–20L for full professors.',
    salaryGrowth: 'MA is India\'s most stable long-term career qualification when combined with NET/SET or civil services. Government pay + pension + job security creates lifetime earning certainty most private-sector roles cannot match.',
    faqs: [
      { q: 'Is online MA recognised for UGC NET?', a: 'Yes — a postgraduate degree (55% marks) from a UGC-recognised university qualifies for UGC NET. Online MA from UGC DEB-approved universities is fully valid.' },
      { q: 'What subjects can I study in online MA?', a: 'Common online MA subjects: English, Hindi, Political Science, History, Sociology, Psychology, Public Administration, Economics, Geography, Philosophy, Journalism & Mass Communication. Available subjects vary by university.' },
    ],
  },
}

export const SPEC_CONTENT: Record<string, SpecContent> = {
  'finance': {
    metaTitle: 'Online MBA Finance — Careers, Skills & Salary India 2026 | Edify',
    metaDesc: 'MBA Finance online. Master financial modelling, investment analysis, corporate finance and banking. Salary ₹6L–₹25L. HDFC, Goldman Sachs, Deloitte hiring. UGC approved.',
    heroHeadline: 'MBA Finance Online — Build a Career at the Intersection of Money and Strategy.',
    heroSub: 'Master financial analysis, investment, corporate finance, and banking from India\'s top NIRF-ranked universities.',
    overview: 'Finance is consistently India\'s highest-paying MBA specialisation. It prepares you for roles across banking, investment, corporate treasury, fintech, and financial advisory — sectors that employ over 35% of all MBA graduates in India.',
    whyChoose: ['Highest average starting salary among all MBA specialisations','BFSI sector: India\'s largest MBA employer at 35%+ share','Fintech: India\'s fastest-growing finance sub-sector — 10× job growth since 2018','Finance skills transfer across industries','Clear career ladder: Analyst → Manager → CFO'],
    skills: ['Financial Modelling & DCF Valuation','Corporate Finance & Capital Budgeting','Investment Analysis & Portfolio Management','Risk Management & Derivatives','Banking Operations & Credit Analysis','Financial Reporting (Ind AS / IFRS)','Bloomberg Terminal basics','Excel + Power BI for finance dashboards'],
    certifications: ['CFA (Chartered Financial Analyst) — exam prep in Semester 3','FRM (Financial Risk Manager) — niche but premium','NISM Series VIII (Equity Derivatives) — for capital market roles','Bloomberg Market Concepts — free, valuable for finance resume'],
    careerBeginner: [{title:'Financial Analyst',desc:'Analyses P&L, prepares management reports, models investment scenarios'},{title:'Credit Analyst',desc:'Evaluates borrower creditworthiness at banks and NBFCs'},{title:'Jr. Investment Banking Analyst',desc:'Supports deal execution, pitchbooks, and financial modelling'}],
    careerMid: [{title:'Finance Manager / Controller',desc:'Owns budgeting, reporting, and financial compliance for a business unit'},{title:'Portfolio Manager',desc:'Manages equity or debt funds at AMC; typically 5+ years experience'},{title:'Treasury Manager',desc:'Manages cash, FX exposure, and short-term investments for large corporates'}],
    careerSenior: [{title:'Chief Financial Officer (CFO)',desc:'Leads financial strategy, capital allocation, and investor relations'},{title:'MD, Investment Banking',desc:'Senior client-facing role; typical comp ₹1–3Cr+ at bulge bracket banks'},{title:'Fund Manager / CFA Charterholder',desc:'Manages large asset pools; CFA + track record is the qualification'}],
    projectIdeas: ['Build a DCF valuation model for a BSE Mid-cap using public filings','Create a credit risk scorecard for SME loan applications','Analyse 5 years of a listed bank\'s NPA trends and forecast trajectory'],
    resumeTip: 'Quantify everything: "Reduced cost by 12%" beats "improved cost efficiency." List CFA exam status, Bloomberg/Refinitiv exposure, and any financial modelling projects with dataset scale.',
    topCompanies: ['HDFC Bank','ICICI Bank','Axis Bank','Goldman Sachs India','JP Morgan India','Kotak Mahindra','Bajaj Finance','Deloitte','KPMG','EY','PwC','SEBI','NABARD','Zerodha'],
    salaryRange: '₹6L – ₹25L per annum',
    salaryGrowth: 'Finance MBA in BFSI: 18–25% YoY growth in first 5 years. CFA Level 1 adds ~₹1.5–3L to starting offer. Investment banking and PE reach ₹40–80L+ at 8–10 years.',
    faqs: [{q:'Should I pursue CFA alongside MBA Finance?',a:'If targeting investment banking, portfolio management, or equity research — yes. Begin CFA Level 1 in Semester 2. Many students clear Level 1 before graduation.'}],
    editorialGuide: `
# Online MBA Finance India 2026 — Your Path to Financial Leadership

An **online MBA in Finance** remains the most popular and highest-paying management specialisation in India. In 2026, the intersection of traditional banking and aggressive FinTech growth has created a unique "Super-Cycle" of hiring for finance professionals.

## Why 2026 is High-Growth for Finance
India's financial sector is digitizing at a breakneck pace. From UPI-based lending to AI-driven wealth management, companies need leaders who understand both the "Money" and the "Tech." An **online mba finance india 2026** equips you with advanced financial modelling, risk management, and strategic investment skills.

## Career Outcomes: The Finance Ladder
*   **Investment Banking & PE:** Bulge-bracket banks continue to hire MBA Finance graduates for analyst and associate roles.
*   **Corporate Treasury:** Managing the massive cash reserves of India's conglomerates (Reliance, Tata, Adani).
*   **FinTech Growth:** Product and strategy roles at unicorns like Zerodha, Groww, and PhonePe.

## ROI and Salary Benchmarks
Online MBA Finance professionals in 2026 are seeing starting packages of ₹8 Lakh to ₹15 Lakh, with senior roles easily crossing ₹40 Lakh. The degree pays for itself within 12-18 months of graduation.
    `,
  },
  'marketing': {
    metaTitle: 'Online MBA Marketing — Careers, Skills & Salary India 2026 | Edify',
    metaDesc: 'MBA Marketing online. Brand strategy, digital marketing, consumer behaviour, product management. Salary ₹5L–₹20L. HUL, Amazon, Nestlé hiring. UGC approved.',
    heroHeadline: 'MBA Marketing Online — Build Brands, Drive Growth, Lead Markets.',
    heroSub: 'From brand strategy to digital performance marketing — learn what top companies actually pay for.',
    overview: 'Marketing is India\'s most dynamic MBA specialisation. It covers traditional brand management and consumer research alongside digital channels, performance marketing, and data-driven growth strategies. FMCG, e-commerce, and D2C brands are the largest hirers.',
    whyChoose: ['Widest industry applicability — every company markets something','Digital marketing has created 3× more jobs in the last 5 years','Brand management at FMCG: among India\'s most competitive and prestigious roles','Performance marketers earn premiums for measurable, quantifiable results','Marketing → Product Management is India\'s fastest-growing career transition'],
    skills: ['Brand Strategy & Architecture','Consumer Behaviour & Market Research','Digital Marketing — SEO, SEM, Meta, Google Ads','Content Marketing & Storytelling','Product Marketing & GTM Strategy','Pricing Strategy & Revenue Management','CRM & Marketing Automation (Salesforce, HubSpot)','Marketing Analytics — attribution, cohorts, LTV'],
    certifications: ['Google Ads Certification — free, included in digital module','Meta Blueprint Certification — social media advertising','HubSpot Inbound Marketing Certificate','Google Analytics 4 Certification — essential for performance marketing roles'],
    careerBeginner: [{title:'Marketing Executive',desc:'Coordinates campaigns, assists brand managers, manages social media'},{title:'Digital Marketing Analyst',desc:'Manages PPC, tracks analytics, optimises paid channels'},{title:'Product Marketing Associate',desc:'Writes positioning docs, manages launch collateral, supports GTM plans'}],
    careerMid: [{title:'Brand Manager',desc:'Owns P&L for a brand category; classic FMCG role with high status and salary'},{title:'Product Manager',desc:'After 2–3 years in marketing; owns roadmap and growth metrics for a product'},{title:'Performance Marketing Manager',desc:'Drives user acquisition through paid channels and retention loops'}],
    careerSenior: [{title:'Chief Marketing Officer (CMO)',desc:'Sets brand vision and marketing strategy at C-suite level'},{title:'VP Marketing / Marketing Director',desc:'Owns marketing function with a team of 10–50+ people'},{title:'Chief Growth Officer',desc:'Emerging senior role at tech and D2C companies; focuses on revenue growth levers'}],
    projectIdeas: ['Design a full GTM plan for launching a D2C brand on Instagram and Amazon','Build a digital attribution model comparing ROI across Meta, Google, and influencer spend','Create a brand refresh strategy for a traditional FMCG brand entering the Gen Z market'],
    resumeTip: 'Show campaign results with numbers: "Grew Instagram following from 2K to 18K in 3 months", "Reduced CAC by 22% through A/B testing". Certifications are table stakes — make project results the centrepiece.',
    topCompanies: ['HUL','P&G','Nestlé India','ITC','Marico','Amazon India','Flipkart','Myntra','Swiggy','Zomato','Asian Paints','Godrej Consumer','Dentsu','Wavemaker','GroupM'],
    salaryRange: '₹5L – ₹20L per annum',
    salaryGrowth: 'Digital marketing roles: 28% YoY salary growth. Brand managers at FMCG MNCs earn ₹10–18L at 3–4 years. CMOs at mid-size D2C brands earn ₹25–50L+.',
    faqs: [{q:'Is marketing a good MBA specialisation in 2026?',a:'Yes — especially digital, performance, and product marketing. The shift to data-driven marketing has made quantitative marketing skills highly valuable alongside traditional brand skills.'}],
    editorialGuide: `
# Online MBA Marketing India 2026 — Leading the Digital Consumer Revolution

The **online MBA in Marketing** has evolved into a high-stakes, data-driven discipline in 2026. With over 800 million Indians online, brands are no longer just fighting for shelf space; they are fighting for digital "Mindshare."

## The 2026 Marketing Landscape
Modern marketing is split between **Brand Building** (emotional storytelling) and **Performance Marketing** (data-driven acquisition). An **online mba marketing india 2026** covers both. You will learn how to manage multi-million dollar ad budgets while maintaining a consistent brand voice across social, search, and e-commerce platforms.

## Key Career Paths
*   **Brand Manager (FMCG):** The classic path—managing icons like Amul, Maggi, or boAt.
*   **Product Manager (Tech):** Bridging the gap between what users want and what engineers build.
*   **Growth Lead (Startup):** Using A/B testing and analytics to drive viral user growth.

## Top Universities for Marketing
Universities with strong industry connections and updated "Digital-First" curriculums are the best fit. **LPU Online**, **Amity**, and **Graphic Era** are notable for their marketing placement records in 2026.
    `,
  },
  'data science': {
    metaTitle: 'Online Data Science Specialisation — Careers, Skills & Salary 2026 | Edify',
    metaDesc: 'Study Data Science online. Python, machine learning, AI, SQL and analytics. Salary ₹7L–₹30L+. Google, Amazon, Flipkart, Mu Sigma hiring. UGC approved programs.',
    heroHeadline: 'Data Science — India\'s Highest-Growth Tech Career.',
    heroSub: 'Master Python, machine learning, AI, SQL, and data visualisation — the skill stack reshaping every industry in India.',
    overview: 'Data Science is the most in-demand specialisation across both MBA and MCA programs. Roles grew 45% YoY in India. It combines statistical analysis, machine learning, programming, and business intelligence to drive data-driven decisions across every sector.',
    whyChoose: ['45% YoY job growth — highest of any technology specialisation in India','Roles exist in every sector: BFSI, healthcare, e-commerce, manufacturing, government','Highest salary premium over general graduates — typically 2–3× non-specialised peers','AI/ML expertise now mandatory at product companies and increasingly at IT firms','Short learning feedback loop — build real projects and prove skills quickly'],
    skills: ['Python — pandas, NumPy, scikit-learn, TensorFlow','Machine Learning — supervised/unsupervised, model evaluation, hyperparameter tuning','SQL & NoSQL — complex queries, indexing, MongoDB','Data Visualization — Tableau, Power BI, matplotlib, seaborn','Statistical Analysis — hypothesis testing, regression, A/B testing','Big Data Tools — Spark, Hadoop, cloud data pipelines','NLP — text analysis, sentiment, transformer models','MLOps — model deployment, monitoring, CI/CD for ML'],
    certifications: ['Google Data Analytics Professional Certificate — embedded Semester 1','Microsoft Azure AI Fundamentals (AI-900)','Tableau Desktop Specialist — visualisation certification','Kaggle Competition Certificates — real-world ML skill proof'],
    careerBeginner: [{title:'Data Analyst',desc:'Cleans data, builds dashboards, reports insights to business teams'},{title:'Junior Data Scientist',desc:'Applies ML models to structured business problems with guidance'},{title:'BI Analyst',desc:'Manages Power BI/Tableau dashboards and KPI reporting'}],
    careerMid: [{title:'Data Scientist',desc:'Leads end-to-end ML projects from problem framing to deployment'},{title:'ML Engineer',desc:'Builds, deploys, and monitors models in production systems'},{title:'Analytics Manager',desc:'Leads a team of analysts; defines KPI frameworks and data strategy'}],
    careerSenior: [{title:'Principal Data Scientist',desc:'Sets technical direction for large ML programmes and manages data science team'},{title:'Head of Data / CDO',desc:'Owns organisational data strategy and governance at executive level'},{title:'AI Product Manager',desc:'Bridges data science and product development; manages AI-powered products'}],
    projectIdeas: ['Customer churn prediction using XGBoost on telecom data (Kaggle dataset)','Real-time sentiment analysis dashboard for brand social media mentions','Hospital readmission risk model using public clinical datasets (MIMIC)'],
    resumeTip: 'Data Science resumes are evaluated against GitHub and Kaggle. For every project: state the business problem, dataset size, model chosen, and metric achieved (e.g., "89% accuracy using XGBoost on 500K-row dataset").',
    topCompanies: ['Google India','Amazon India','Microsoft India','Flipkart','Paytm','Swiggy','Zomato','PhonePe','Mu Sigma','Fractal Analytics','Tiger Analytics','HDFC Bank','TCS Digital'],
    salaryRange: '₹5L – ₹30L per annum',
    salaryGrowth: 'Entry-level data analysts earn ₹4–7L; experienced data scientists ₹15–25L; Principal/Lead ₹30–50L. Strong ML portfolio + cloud certification can push first-job salary to ₹8–12L.',
    faqs: [{q:'Is Kaggle important for a data science career?',a:'Very. Kaggle is where employers validate skills beyond certificates. Even one well-documented Kaggle notebook can generate interview invitations.'}],
    editorialGuide: `
# Online MBA Data Science India 2026 — The New Gold Standard

**Data Science** is the most sought-after niche within management education in 2026. As businesses transition to AI-first models, they need "Translators"—leaders who can take raw data and turn it into strategic business decisions.

## Why Online MBA Data Science?
Unlike a pure technical degree, an **online mba data science india 2026** focuses on the *application* of data. You won't just learn how to write Python code; you'll learn how that code can optimize a supply chain, reduce customer churn, or increase a bank's profit margin.

## ROI and Market Demand
The salary premium for Data Science MBAs is the highest of any specialisation in 2026. Starting salaries for **online data science specialisation** graduates are often 20-30% higher than general management peers.

## Leading Choices for 2026
**Chandigarh University** and **Manipal** offer some of the most robust data science tracks, often in partnership with industry leaders like Google or IBM, Ensuring that your portfolio is ready for day one.
    `,
  },
  'human resource management': {
    metaTitle: 'Online MBA HR Management — Careers, Skills & Salary 2026 | Edify',
    metaDesc: 'MBA HR Management online. Master talent acquisition, HR analytics, performance management and labour law. Salary ₹4.5L–₹18L. Infosys, Deloitte, Aon hiring. UGC approved.',
    heroHeadline: 'MBA HR Online — Lead People. Drive Culture. Shape Organisations.',
    heroSub: 'Develop talent management, HR analytics, and organisational development skills valued by India\'s top companies.',
    overview: 'Human Resource Management has evolved from administrative support to a strategic business partner. An MBA in HR equips you to attract, develop, and retain talent — and increasingly to use HR analytics and technology to drive business outcomes.',
    whyChoose: ['Every organisation needs HR — uniquely stable across economic cycles','HR Analytics and HR Technology are the highest-paying HR sub-functions','CHRO is now a C-suite role at most Fortune 500 companies in India','Consulting HR roles at Big 4 offer premium salaries and diverse exposure','Remote work culture has permanently elevated HR\'s strategic importance'],
    skills: ['Talent Acquisition & Employer Branding','Performance Management Systems (OKR, KPI, 360°)','HR Analytics — workforce planning, attrition prediction, HRIS data','Learning & Development — training needs analysis, program design','Compensation & Benefits — benchmarking, pay bands, incentive design','Labour Law & Compliance — POSH, CLRA, ESI, PF','HR Technology — SAP SuccessFactors, Darwinbox, Workday basics','Change Management & Organisation Design'],
    certifications: ['SHRM-CP — globally recognised HR certification','HRCI PHR (Professional in Human Resources) — valued at MNCs','People Analytics Course (AIHR/Coursera) — fastest-growing HR sub-skill','POSH Certification — mandatory compliance cert valued by all corporates'],
    careerBeginner: [{title:'HR Generalist',desc:'Handles recruitment, onboarding, employee queries, and basic compliance'},{title:'Talent Acquisition Executive',desc:'Manages hiring across job portals, LinkedIn, and campus placements'},{title:'HR Operations Analyst',desc:'Manages HRIS data, payroll processing, and compliance documentation'}],
    careerMid: [{title:'HR Business Partner (HRBP)',desc:'Embedded HR partner for a business unit; strategic advisor to department heads'},{title:'Talent Acquisition Manager',desc:'Leads recruiting strategy; owns employer brand and hiring metrics'},{title:'HR Analytics Manager',desc:'Builds workforce dashboards, attrition models, and data-driven HR recommendations'}],
    careerSenior: [{title:'HR Director / VP HR',desc:'Leads HR function for a large business unit or geography'},{title:'Chief Human Resources Officer (CHRO)',desc:'C-suite HR leader responsible for people strategy and talent at organisation level'},{title:'HR Consulting Partner',desc:'Senior advisor on HR transformation and org design at consulting firms'}],
    projectIdeas: ['Build an attrition prediction model using HRIS data in Python (logistic regression baseline)','Design a competency framework and 360° feedback tool for a 100-person tech company','Create a compensation benchmarking report for 5 tech roles using AmbitionBox/Glassdoor data'],
    resumeTip: 'Quantify HR impact: "Reduced time-to-hire by 30%", "Improved employee NPS from 42 to 67". SHRM-CP or a People Analytics certification makes you stand out in a crowded HR job market.',
    topCompanies: ['Infosys','TCS','Wipro','Deloitte','Aon','Mercer','ManpowerGroup','Randstad','Korn Ferry','HDFC Bank','Amazon India','Google India','IBM India','Accenture'],
    salaryRange: '₹4.5L – ₹18L per annum',
    salaryGrowth: 'HR Analytics and HR Technology roles pay 30–40% above traditional HR. CHRO roles at Indian conglomerates earn ₹50–100L+. Big 4 HR consulting entry is ₹7–10L for MBA HR graduates.',
    faqs: [{q:'What skills matter most for HR roles at top companies?',a:'HR Analytics, Talent Acquisition, HR Business Partnering, and L&D — in order of market demand. Traditional admin HR skills are commoditised; differentiate with analytics and tech.'}],
    editorialGuide: `
# Online MBA HR Management India 2026 — Shaping the Future of Work

The **online MBA in HR Management** has become a strategic "C-Suite" path in 2026. In an era of hybrid work and global talent wars, the role of HR has shifted from administrative to mission-critical.

## Strategic HR in 2026
Companies in 2026 are looking for **HR Analytics** and **Organizational Design** experts. An **online mba hr management india 2026** teaches you how to use data to improve employee retention, drive culture in a remote environment, and manage global compliance.

## Career Trajectory
*   **HR Business Partner (HRBP):** A high-value role acting as a strategic advisor to department heads.
*   **Talent Acquisition Lead:** Finding the "Needles in the Haystack" in India's competitive tech market.
*   **CHRO Path:** The Chief Human Resources Officer is now a direct peer to the CEO and CFO.
    `,
  },
  'digital marketing': {
    metaTitle: 'Online MBA Digital Marketing — Careers, Skills & Salary 2026 | Edify',
    metaDesc: 'MBA Digital Marketing online. SEO, performance marketing, social media, Google Ads and analytics. Salary ₹4L–₹18L. D2C and e-commerce brands hiring fast. UGC approved.',
    heroHeadline: 'MBA Digital Marketing Online — Grow Brands in the Digital Age.',
    heroSub: 'Master SEO, performance marketing, social media, content strategy and analytics — skills every brand and startup recruits for.',
    overview: 'Digital Marketing is now a standalone specialisation — India\'s D2C revolution and ₹60,000 Cr+ digital ad spend market have created explosive demand for performance marketers, SEO specialists, and growth hackers.',
    whyChoose: ['India\'s digital ad spend crossed ₹60,000 Cr in 2024 — one of world\'s fastest-growing markets','2,000+ Indian D2C brands actively need digital marketing talent','Measurable skills — ROAS, CAC, and LTV make your value easy to prove','Freelance and agency paths offer high income with flexibility','AI tools are amplifying marketer output, not replacing it'],
    skills: ['SEO (On-page, Off-page, Technical)','SEM / PPC — Google Ads, Shopping, YouTube','Social Media Marketing — Meta, Instagram, LinkedIn ad platforms','Content Marketing & SEO Writing','Email Marketing — segmentation, drip campaigns, deliverability','Marketing Analytics — GA4, Meta Pixel, attribution models','Influencer & Affiliate Marketing','Conversion Rate Optimisation (CRO) — A/B testing, landing page design'],
    certifications: ['Google Ads Search Certification — free, high employer recognition','Meta Blueprint (Facebook/Instagram Ads) — free, essential for social roles','Google Analytics 4 (GA4) Certification — every digital marketing role requires this','SEMrush SEO Toolkit Certification — for SEO specialist roles','HubSpot Content Marketing Certification'],
    careerBeginner: [{title:'Digital Marketing Executive',desc:'Manages social media, email campaigns, and basic PPC for a brand or agency'},{title:'SEO Analyst',desc:'Optimises web content for search rankings; strong demand at agencies and e-commerce'},{title:'Content Writer / SEO Writer',desc:'Writes blog and web content optimised for search; high volume of openings'}],
    careerMid: [{title:'Digital Marketing Manager',desc:'Leads multi-channel campaigns with P&L responsibility for digital spend'},{title:'Performance Marketing Lead',desc:'Manages paid acquisition (Google/Meta) with focus on ROI and CAC optimisation'},{title:'Growth Hacker',desc:'Experiments rapidly across acquisition and retention channels; startup-native role'}],
    careerSenior: [{title:'Head of Digital Marketing',desc:'Owns digital P&L; leads team across SEO, performance, content, and social'},{title:'CMO (Digital-native)',desc:'Digital-native CMOs are the norm at Indian startups and D2C brands'},{title:'Digital Marketing Consultant',desc:'Independent advisory; top consultants earn ₹50,000–₹3L per project'}],
    projectIdeas: ['Run a real SEO campaign for a personal blog — track rankings in Google Search Console','Build a Facebook and Google Ads campaign with ₹5,000 test budget and document results','Create a 90-day content strategy and editorial calendar for a hypothetical D2C brand'],
    resumeTip: 'Win with proof: "Grew organic traffic 310% in 6 months", "Achieved ₹3.2 ROAS on Meta campaigns". List every free certification (Google Ads, Meta Blueprint, GA4). Include links to live campaigns you\'ve worked on.',
    topCompanies: ['Amazon India','Flipkart','Swiggy','Zomato','Myntra','Nykaa','boAt','Lenskart','Dentsu India','Wavemaker','GroupM','iProspect','WATConsult'],
    salaryRange: '₹4L – ₹18L per annum',
    salaryGrowth: 'Performance marketing specialists with 2–3 years earn ₹8–14L. Agency heads and digital marketing directors at D2C brands earn ₹18–30L. Freelance performance marketers with strong ROAS bill ₹80,000–₹3L/month.',
    faqs: [{q:'Can I freelance after an MBA in Digital Marketing?',a:'Absolutely — this is one of the few MBA specialisations with strong freelance potential. Build your portfolio, get certified, and start with small clients. Many digital marketers earn ₹1–3L/month freelancing alongside jobs.'}],
  },
  'operations & supply chain': {
    metaTitle: 'Online MBA Operations & Supply Chain — Careers & Salary 2026 | Edify',
    metaDesc: 'MBA Operations online. Supply chain management, logistics, lean operations and ERP systems. Salary ₹6L–₹20L. TCS, Amazon, L&T hiring. UGC approved.',
    heroHeadline: 'MBA Operations & Supply Chain — Run the Machines That Run the World.',
    heroSub: 'Master supply chain, logistics, lean management, and ERP systems — the skills that keep global businesses moving.',
    overview: 'Operations and Supply Chain Management is the backbone of every manufacturing, retail, e-commerce, and logistics company. Post-pandemic supply chain disruptions have made this specialisation more valuable than ever.',
    whyChoose: ['E-commerce boom in India has created massive demand for supply chain professionals','Manufacturing: PLI schemes driving expansion and Operations Manager hiring','Lean Six Sigma + MBA Operations is one of India\'s most bankable combinations','ERP implementation projects pay premium consulting rates','Broadest sector applicability of any MBA — every sector has an operations function'],
    skills: ['Supply Chain Design & Optimisation — network modelling, inventory policy','Logistics & Warehouse Management — last-mile, 3PL, WMS systems','Lean Manufacturing & Six Sigma — DMAIC, VSM, kaizen events','ERP Systems — SAP MM/PP/SD, Oracle SCM basics','Demand Forecasting & S&OP','Procurement & Vendor Management — strategic sourcing, TCO analysis','Project Management — PMP-aligned, Gantt, critical path, earned value','Supply Chain Analytics — Power BI, Excel solver, Python for inventory models'],
    certifications: ['APICS CSCP (Certified Supply Chain Professional) — global gold standard','Six Sigma Green Belt (IASSC or ASQ) — significant salary premium','SAP SCM Certification — premium for ERP implementation roles','Google Project Management Certificate — PM foundation'],
    careerBeginner: [{title:'Supply Chain Analyst',desc:'Tracks inventory, monitors KPIs, supports supply chain planning'},{title:'Logistics Coordinator',desc:'Manages freight bookings, tracks shipments, resolves delivery exceptions'},{title:'Operations Trainee',desc:'Rotates through plant, warehouse, or service delivery operations'}],
    careerMid: [{title:'Supply Chain Manager',desc:'Owns end-to-end supply chain for a product category or region'},{title:'Operations Manager',desc:'Manages factory floor, warehouse, or service delivery team'},{title:'Procurement/Sourcing Manager',desc:'Leads strategic sourcing, supplier development, and cost-out programmes'}],
    careerSenior: [{title:'Director of Supply Chain',desc:'Leads supply chain function for a large business unit; P&L responsibility'},{title:'VP Operations / COO',desc:'Oversees all operations; COO is a most common end-goal for Operations MBAs'},{title:'Supply Chain Consultant (Partner)',desc:'Senior advisory at McKinsey, BCG, or Big 4 supply chain practices'}],
    projectIdeas: ['Design optimal inventory policy for a multi-SKU retailer using EOQ and safety stock models','Map a manufacturing value stream and identify top 3 waste reduction opportunities (VSM)','Build a Power BI dashboard for real-time supply chain KPIs'],
    resumeTip: 'Quantify in cost, time, and efficiency: "Reduced inventory carrying cost by ₹18L", "Cut order-to-delivery from 7 to 4 days". APICS CSCP or Six Sigma Belt makes you stand out from most MBA Operations candidates.',
    topCompanies: ['Amazon India','Flipkart','TCS','Infosys','Mahindra Logistics','Blue Dart','Delhivery','L&T','Tata Steel','Maruti Suzuki','Asian Paints','ITC','BCG Supply Chain','McKinsey Ops'],
    salaryRange: '₹6L – ₹20L per annum',
    salaryGrowth: 'APICS CSCP holders earn 25–35% above uncertified peers. COO roles at mid-size manufacturing pay ₹30–60L. E-commerce supply chain at Amazon/Flipkart pays ₹12–20L at 5–6 years.',
    faqs: [{q:'Is MBA Operations a good specialisation for engineers?',a:'Excellent. Engineers with MBA Operations are among the most sought-after at manufacturing companies, e-commerce logistics, and operations consulting. Technical + management combination is highly valued.'}],
  },
  'business analytics': {
    metaTitle: 'Online MBA Business Analytics — Careers & Salary 2026 | Edify',
    metaDesc: 'MBA Business Analytics online. Power BI, Python, SQL and business intelligence. Salary ₹7L–₹25L. Mu Sigma, TCS, HDFC, Amazon hiring. UGC approved.',
    heroHeadline: 'MBA Business Analytics — Turn Data Into Business Decisions.',
    heroSub: 'Combine management skills with data analytics — the most in-demand combination at India\'s leading companies.',
    overview: 'Business Analytics bridges data science and management decision-making. It is ideal for managers who want to be data-literate, and analysts who want business context. India\'s analytics services market grows at 28% CAGR.',
    whyChoose: ['Every business function now needs analytics: marketing, finance, HR, operations, strategy','Analytics Manager roles pay 30–40% more than equivalent non-analytical management roles','India\'s analytics services market growing at 28% CAGR — massive hiring demand','Business Analytics is the natural bridge between technical and managerial careers','Can be combined with any domain: healthcare, retail, fintech analytics'],
    skills: ['Advanced Excel & Power BI — dashboards, DAX, data models','SQL — joins, window functions, CTEs, query optimisation','Python for Business Analytics — pandas, visualisation, basic ML','Statistical Analysis — regression, ANOVA, hypothesis testing, forecasting','Business Intelligence — Tableau, Looker, QlikSense','Data Storytelling — presenting insights to non-technical stakeholders','A/B Testing & Experimentation Design','Predictive Modelling — customer segmentation, churn, propensity scores'],
    certifications: ['Microsoft Power BI Data Analyst Associate (PL-300) — strong employer recognition','Google Data Analytics Professional Certificate','IBM Data Analyst Professional Certificate','Tableau Certified Associate'],
    careerBeginner: [{title:'Business Analyst',desc:'Analyses business data, prepares reports, identifies trends for decision-making'},{title:'Data Analyst',desc:'Queries databases, builds dashboards, and answers business questions with data'},{title:'MIS Executive / Reporting Analyst',desc:'Maintains management information systems and business reporting'}],
    careerMid: [{title:'Analytics Manager',desc:'Leads a team of analysts; owns analytics roadmap for a business function'},{title:'Senior Business Analyst',desc:'Provides strategic analytical support at director level; owns key business models'},{title:'Product Analyst',desc:'Analyses product usage data, runs A/B tests, informs product decisions'}],
    careerSenior: [{title:'Head of Analytics / Analytics Director',desc:'Leads the analytics function; translates data strategy to business outcomes'},{title:'Chief Analytics Officer',desc:'C-suite analytics leader; emerging role at data-mature organisations'},{title:'Analytics Consulting Manager',desc:'Leads analytics engagements at Mu Sigma, Fractal, Tiger Analytics, or Big 4'}],
    projectIdeas: ['Build a retail sales forecasting model using time series analysis in Python','Create a customer segmentation using K-means clustering for an e-commerce dataset','Design a Power BI dashboard for a hypothetical CMO showing campaign ROI, CAC, and LTV'],
    resumeTip: 'Frame every project as: "Business problem → Data approach → Insight → Recommendation". Power BI certification + a visible Power BI portfolio dramatically improves interview conversion rates.',
    topCompanies: ['Mu Sigma','Fractal Analytics','Tiger Analytics','EXL Service','WNS Analytics','HDFC Bank','ICICI Bank','Amazon India','Flipkart Analytics','Deloitte Analytics','KPMG Analytics','Infosys','TCS'],
    salaryRange: '₹5L – ₹22L per annum',
    salaryGrowth: 'Analytics roles at consulting firms start at ₹7–10L for MBA graduates. Senior analytics managers with 5+ years earn ₹15–22L. Analytics consulting partners earn ₹30–50L+.',
    faqs: [{q:'What is the difference between MBA Business Analytics and MBA Data Science?',a:'Business Analytics focuses on using data to answer specific business questions — more applied and managerial. Data Science goes deeper into algorithms and statistical modelling. Both use Python, SQL, and visualisation tools; Data Science requires more math and programming depth.'}],
  },
  'international business': {
    metaTitle: 'Online MBA International Business — Careers & Salary 2026 | Edify',
    metaDesc: 'MBA International Business online. Global trade, forex management, international marketing and cross-cultural management. Salary ₹6L–₹22L. EXIM, MNCs, consulting hiring. UGC approved.',
    heroHeadline: 'MBA International Business — Think Global. Work Global.',
    heroSub: 'Master global trade, international marketing, forex management, and cross-cultural business — skills multinationals and export companies actively recruit for.',
    overview: 'International Business prepares MBA students to work with multinational companies, export-import businesses, global trade consulting, or diplomatic trade bodies. India\'s merchandise exports crossed $776B in FY24 — creating growing demand for professionals with international business expertise.',
    whyChoose: ['India\'s merchandise exports crossed $776B in FY24 — EXIM sector growing fast','Indian IT and consulting firms expanding globally need IB-trained managers','Forex and international trade knowledge is rare and premium-priced','MNC corporate rotations and global assignments are common career benefits','Government trade body careers (FICCI, CII, APEDA) require IB background'],
    skills: ['International Trade & EXIM — INCOTERMS, letter of credit, customs','Foreign Exchange Management — hedging, forex risk, RBI FEMA compliance','International Marketing — market entry, global brand adaptation','Global Supply Chain — cross-border logistics, trade compliance','Cross-Cultural Management — Hofstede framework, global team leadership','Trade Finance & Banking — LC, buyer\'s credit, ECB, ECGC','WTO & Trade Policy — trade agreements, tariff structures','International Financial Reporting (IFRS)'],
    certifications: ['IIFT Short Courses — premier IB training in India','EXIM Bank Certificate Programs — trade finance and export management','FEMA Compliance Certificate — regulatory knowledge for BFSI international roles','Certified Global Business Professional (CGBP) — NASBITE USA, recognised for international trade'],
    careerBeginner: [{title:'EXIM Executive',desc:'Manages export-import documentation, customs clearance, and trade compliance'},{title:'International Sales Coordinator',desc:'Supports global account management and cross-border sales at exporters or MNCs'},{title:'Trade Finance Analyst',desc:'Processes LCs, bank guarantees, and trade financing at international banks'}],
    careerMid: [{title:'International Business Manager',desc:'Develops and manages relationships with international distributors and clients'},{title:'Global Account Manager',desc:'Owns revenue from key international accounts at IT, consulting, or manufacturing firms'},{title:'Export / Regional Manager',desc:'Responsible for export targets for a geography or product category'}],
    careerSenior: [{title:'Head of International Business',desc:'Leads international division; manages global P&L and strategy'},{title:'VP Global / Chief International Officer',desc:'C-suite international strategy role at large Indian conglomerates expanding globally'},{title:'Trade Policy Consultant',desc:'Advisory role with FICCI, CII, APEDA, or government export bodies'}],
    projectIdeas: ['Conduct a market entry feasibility study for a hypothetical Indian brand entering UAE','Analyse the impact of US-China trade tariffs on Indian electronics exports','Prepare a complete EXIM documentation file for a hypothetical export transaction'],
    resumeTip: 'Highlight any international exposure (foreign client work, EXIM documentation). IIFT or EXIM Bank certifications are strong differentiators. Foreign language skills (French, German, Arabic, Mandarin) are rare and highly valued — list them prominently.',
    topCompanies: ['Tata International','Mahindra Exports','TCS (global accounts)','Wipro Global','HDFC Bank (international)','SBI (international division)','EXIM Bank India','FICCI','CII','Ministry of Commerce','Deloitte (international trade)','DHL','Maersk India'],
    salaryRange: '₹6L – ₹22L per annum',
    salaryGrowth: 'International Business roles at MNCs start at ₹7–10L for MBA graduates. Global account managers with 5+ years earn ₹15–22L + travel allowances. Expatriate postings at Indian MNCs can take total compensation to ₹25–40L equivalent.',
    faqs: [{q:'Is MBA International Business a good choice in India?',a:'Yes, for specific paths: export-import companies, international banking, MNC roles with global responsibilities, or government/diplomatic trade careers. Less useful for domestic-focused careers.'}],
  },
  'healthcare management': {
    metaTitle: 'Online MBA Healthcare Management — Careers & Salary 2026 | Edify',
    metaDesc: 'MBA Healthcare Management online. Hospital administration, pharma management and health policy. Salary ₹5L–₹16L. Apollo, Fortis, Cipla, Sun Pharma hiring. UGC approved.',
    heroHeadline: 'MBA Healthcare Management — Lead India\'s Fastest-Growing Sector.',
    heroSub: 'Manage hospitals, pharma companies, health insurance firms, or public health programmes with business + healthcare expertise.',
    overview: 'Healthcare Management is one of India\'s fastest-growing MBA specialisations. India\'s healthcare industry is projected to reach $638B by 2026 — creating consistent demand for managers who understand both clinical operations and business principles.',
    whyChoose: ['India\'s healthcare sector: one of the world\'s fastest growing at 22% CAGR','Hospital chains expanding into Tier 2 cities — strong hiring of healthcare managers','Health insurance: one of India\'s fastest-growing BFSI sub-sectors','Pharma sector: MNC and Indian pharma need MBA talent for sales and operations','Government health schemes (Ayushman Bharat) creating public health management roles'],
    skills: ['Hospital Operations Management — OPD/IPD workflow, bed management, NABH accreditation','Healthcare Finance — medical billing, insurance reimbursement, DRG coding','Pharmaceutical Management — drug regulatory affairs, pharma marketing','Health Insurance & TPA Management — claims processing, provider network','Patient Experience & Quality — NABH standards, patient safety','Health Informatics — EMR/EHR systems, telemedicine platforms','Public Health Policy — PM-JAY, National Health Mission framework','Healthcare Supply Chain — medical device procurement, pharmaceutical logistics'],
    certifications: ['NABH Internal Auditor — hospital quality accreditation','CPHQ (Certified Professional in Healthcare Quality)','Medical Billing & Coding Certificate — ICD-10, CPT coding for health insurance','Lean Healthcare Green Belt — operational efficiency in clinical settings'],
    careerBeginner: [{title:'Hospital Administrator (Junior)',desc:'Manages ward operations, patient flow, and administrative coordination at hospitals'},{title:'Pharma Sales Executive',desc:'Promotes drugs to doctors and hospitals; high volume of openings across India'},{title:'Health Insurance Executive',desc:'Processes claims, manages provider relationships at insurance companies and TPAs'}],
    careerMid: [{title:'Hospital Operations Manager',desc:'Manages a clinical department or hospital unit\'s operations and staff'},{title:'Medical Services Manager',desc:'Oversees quality, patient safety, and NABH/JCI accreditation compliance'},{title:'Pharma Product Manager',desc:'Owns commercial strategy for a drug brand or therapeutic area'}],
    careerSenior: [{title:'Hospital CEO / COO',desc:'Leads the full business operations of a hospital; typically 10–15 years experience'},{title:'VP Medical Affairs (Pharma)',desc:'Senior leadership in regulatory, clinical, or commercial pharma functions'},{title:'Public Health Director',desc:'Leadership in government health programmes or international health organisations'}],
    projectIdeas: ['Design an OPD workflow optimisation plan for a 200-bed hospital using process mapping','Analyse Ayushman Bharat scheme data and write a policy note on implementation challenges','Create a medical equipment procurement plan for a new 50-bed district hospital'],
    resumeTip: 'Highlight any clinical shadowing, hospital internship, or pharma sales experience. NABH Internal Auditor certification is a strong differentiator. For pharma roles, list therapeutic areas you have knowledge of.',
    topCompanies: ['Apollo Hospitals','Fortis Healthcare','Manipal Hospitals','Medanta','Max Healthcare','Cipla','Sun Pharma','Dr. Reddy\'s','Lupin','Star Health Insurance','HDFC ERGO Health','Care Health Insurance','Ministry of Health (MOHFW)'],
    salaryRange: '₹5L – ₹16L per annum',
    salaryGrowth: 'Healthcare management roles start at ₹5–7L; senior managers earn ₹12–20L. Pharma product managers at MNCs earn ₹12–22L at 5 years. Hospital CEOs at private chains earn ₹25–50L+.',
    faqs: [{q:'Do I need a medical background for MBA Healthcare Management?',a:'No — MBA Healthcare Management is for people without clinical backgrounds who want to manage healthcare organisations. Business administration skills are the primary focus.'}],
  },
  'cloud computing': {
    metaTitle: 'Online MCA Cloud Computing — Careers, Skills & Salary 2026 | Edify',
    metaDesc: 'MCA Cloud Computing online. Master AWS, Azure, GCP, DevOps and cloud architecture. Salary ₹6L–₹22L. TCS, Infosys, Amazon, Microsoft hiring. UGC approved.',
    heroHeadline: 'MCA Cloud Computing — Build the Infrastructure the World Runs On.',
    heroSub: 'Master AWS, Azure, GCP, DevOps and cloud architecture — the fastest-growing IT specialisation in India.',
    overview: 'Cloud Computing is India\'s most in-demand IT specialisation. With India\'s deficit of 150,000+ cloud professionals and ongoing enterprise migration to cloud platforms, demand for cloud engineers and architects has significantly outpaced supply.',
    whyChoose: ['India has a deficit of 150,000+ cloud professionals — massive undersupply','AWS, Azure, and GCP certifications command 25–40% salary premiums','Cloud migration projects at banks, government, and enterprises: sustained hiring','Entry-level cloud engineers earn ₹5–9L — among the highest MCA starting salaries','Cloud skills are globally portable — strongest international career mobility in IT'],
    skills: ['AWS Core Services — EC2, S3, RDS, Lambda, IAM, VPC','Microsoft Azure Fundamentals and Solutions Architecture','Google Cloud Platform — Compute Engine, BigQuery, Cloud Run','Linux System Administration — bash scripting, system management','Containerisation — Docker, Kubernetes (K8s) orchestration','DevOps & CI/CD — Jenkins, GitHub Actions, Terraform, Ansible','Cloud Security — identity management, encryption, compliance frameworks','Infrastructure as Code (IaC) — Terraform, AWS CloudFormation'],
    certifications: ['AWS Solutions Architect Associate (SAA-C03) — most employer-recognised cloud cert in India','Microsoft Azure Administrator (AZ-104) — strong for Azure-centric environments','Google Associate Cloud Engineer — valued at Google Cloud partners','Certified Kubernetes Administrator (CKA) — premium for DevOps roles'],
    careerBeginner: [{title:'Cloud Support Engineer',desc:'Manages cloud infrastructure, resolves support tickets, monitors systems'},{title:'Junior Cloud Engineer',desc:'Provisions and configures cloud resources; works on migration projects'},{title:'DevOps Trainee',desc:'Supports CI/CD pipeline management and infrastructure automation'}],
    careerMid: [{title:'Cloud Engineer / Architect',desc:'Designs and builds scalable, secure cloud architectures for clients'},{title:'DevOps Engineer',desc:'Automates infrastructure, manages CI/CD, and owns deployment reliability'},{title:'Site Reliability Engineer (SRE)',desc:'Ensures production systems reliability; high demand at product companies'}],
    careerSenior: [{title:'Solutions Architect (AWS/Azure Partner)',desc:'Designs large-scale cloud solutions for enterprise clients; senior consulting role'},{title:'Cloud Centre of Excellence Lead',desc:'Sets cloud strategy and standards for large organisations'},{title:'VP Engineering / CTO',desc:'Cloud expertise is the dominant technical leadership track at tech companies'}],
    projectIdeas: ['Deploy a 3-tier web app on AWS (EC2 + RDS + S3 + CloudFront) with auto-scaling','Build a Kubernetes cluster on GCP and deploy a containerised Python microservice','Create an IaC template using Terraform to provision a complete VPC environment'],
    resumeTip: 'AWS SAA certification is the minimum standard. Include links to your GitHub with Terraform scripts or CloudFormation templates. Any AWS/Azure free tier projects should be documented — even personal side projects.',
    topCompanies: ['Amazon Web Services India','Microsoft Azure India','Google Cloud India','TCS','Infosys','HCL Cloud','Wipro Cloud','Accenture Cloud First','IBM Cloud','Capgemini','Rackspace India','Persistent Systems'],
    salaryRange: '₹5L – ₹22L per annum',
    salaryGrowth: 'AWS Certified Solutions Architects earn 30–40% above uncertified MCA graduates at entry. Mid-level DevOps/SRE roles at product companies pay ₹14–22L. Senior Cloud Architects at large enterprises earn ₹25–40L+.',
    faqs: [{q:'Which cloud certification should I start with?',a:'AWS Solutions Architect Associate (SAA-C03) is the most widely recognised and employer-valued starting certification in India. Complete it during Semester 2 or 3. Follow with AZ-104 or CKA depending on your target role.'}],
  },
  'cybersecurity': {
    metaTitle: 'Online MCA Cybersecurity — Careers, Skills & Salary 2026 | Edify',
    metaDesc: 'MCA Cybersecurity online. Ethical hacking, VAPT, network security and compliance. Salary ₹5L–₹20L. Growing fast. UGC approved programs.',
    heroHeadline: 'MCA Cybersecurity — Defend the Digital World.',
    heroSub: 'India faces 14 million+ cyber attacks annually. Learn ethical hacking, VAPT, network security, and incident response.',
    overview: 'Cybersecurity is India\'s most undersupplied IT specialisation. With cyber attacks growing 60% YoY and new digital infrastructure being built across government and private sectors, demand vastly outstrips available talent.',
    whyChoose: ['India faces the highest volume of cyber attacks in Asia-Pacific — massive and urgent demand','CERT-In compliance requirements making cybersecurity mandatory for all large organisations','Government IT security (NIC, DRDO, defence): a premium hiring domain','Banking sector: RBI cybersecurity guidelines require dedicated security teams','Ethical hacker (Bug Bounty) income can start before graduation on HackerOne, Bugcrowd'],
    skills: ['Network Security — firewalls, IDS/IPS, VPNs, packet analysis (Wireshark)','Ethical Hacking & Penetration Testing — Kali Linux, Metasploit, Burp Suite','VAPT — Vulnerability Assessment and Penetration Testing (web, network, mobile)','Security Operations Centre (SOC) — SIEM tools, alert triage, incident response','Cryptography — symmetric/asymmetric encryption, PKI, digital signatures','Cloud Security — AWS/Azure security services, IAM, CSPM','Compliance & Governance — ISO 27001, NIST, GDPR, CERT-In guidelines','Digital Forensics & Incident Response (DFIR)'],
    certifications: ['CEH (Certified Ethical Hacker) — most recognised in Indian job market','CompTIA Security+ — entry-level, globally recognised','OSCP (Offensive Security Certified Professional) — hardest and most respected hacking cert','Certified SOC Analyst (CSA) — for blue team/defensive security roles'],
    careerBeginner: [{title:'Junior SOC Analyst (L1)',desc:'Monitors security alerts, triages incidents, escalates threats'},{title:'Network Security Engineer',desc:'Configures firewalls, manages network access controls, monitors traffic'},{title:'VAPT Analyst',desc:'Conducts vulnerability scans and penetration tests on systems'}],
    careerMid: [{title:'Penetration Tester / Ethical Hacker',desc:'Simulates attacks on client systems to identify vulnerabilities — high demand role'},{title:'SOC Manager',desc:'Leads security operations team; manages incident response playbooks'},{title:'Cloud Security Engineer',desc:'Secures cloud infrastructure; manages IAM, encryption, and CSPM tools'}],
    careerSenior: [{title:'Chief Information Security Officer (CISO)',desc:'Board-level security leader; sets enterprise security strategy and governs risk'},{title:'Red Team Lead / Security Architect',desc:'Designs security architecture and leads advanced attack simulation programs'},{title:'Cybersecurity Consultant (Partner)',desc:'Senior advisory to CISOs at large organisations; Big 4 or boutique security firms'}],
    projectIdeas: ['Set up a vulnerable lab (Metasploitable, DVWA) and document your VAPT process end-to-end','Conduct a simulated phishing campaign against a test organisation and write an incident response report','Build a basic SIEM dashboard using open-source tools (ELK Stack) and test alert rules'],
    resumeTip: 'Show certifications (CEH minimum) and hands-on labs. TryHackMe and HackTheBox profiles with top-ranking badges are highly valued — include URLs. OSCP is a career-defining certification that opens almost every senior door.',
    topCompanies: ['Wipro CyberDefense','TCS Cyber Security','HCL Security','IBM Security India','Palo Alto Networks India','Check Point India','Deloitte Cyber','PwC Cyber','KPMG Cyber','Infosys Cyber Next','BFSI banks (HDFC, ICICI, SBI)'],
    salaryRange: '₹5L – ₹20L per annum',
    salaryGrowth: 'CEH-certified freshers earn ₹5–8L — 40% above uncertified MCA peers. VAPT specialists with 3 years experience earn ₹12–18L. CISO roles at Indian banks and large corporates pay ₹40–80L+. OSCP holders are offered roles within 30 days of certification on average.',
    faqs: [{q:'Is cybersecurity a good MCA specialisation?',a:'Excellent — India\'s most undersupplied IT skill. Every sector needs it. Strong starting salaries, fast growth, and globally portable skills. The caveat: it requires genuine dedication to ethical hacking labs and certifications beyond coursework.'}],
  },
  'artificial intelligence': {
    metaTitle: 'Online MCA Artificial Intelligence — Careers, Skills & Salary 2026 | Edify',
    metaDesc: 'MCA Artificial Intelligence online. Machine learning, deep learning, NLP and AI applications. Salary ₹7L–₹30L. Google, Microsoft, Amazon, TCS hiring. UGC approved.',
    heroHeadline: 'MCA Artificial Intelligence — Build the Technology That\'s Changing Everything.',
    heroSub: 'Deep learning, NLP, computer vision, and AI systems — the skills that will define the next decade of technology.',
    overview: 'Artificial Intelligence is the highest-growth, highest-salary IT specialisation in 2024–25. India is the second-largest AI talent pool in the world, and demand continues to significantly outpace supply. AI job postings in India grew 60% YoY in 2024.',
    whyChoose: ['AI job postings in India grew 60% YoY in 2024 — fastest of any IT specialisation','Generative AI has created entirely new job categories (LLM Engineer, AI Product Manager)','Healthcare, BFSI, e-commerce, and manufacturing are all actively building AI teams','India government\'s ₹10,000 Cr AI Mission is creating public sector AI roles','AI skills are globally portable — strongest international career mobility of any IT track'],
    skills: ['Python for AI/ML — NumPy, pandas, scikit-learn, matplotlib','Machine Learning — supervised/unsupervised, ensemble methods, model evaluation','Deep Learning — TensorFlow, Keras, PyTorch, CNN, RNN, Transformers','Natural Language Processing — BERT, GPT architecture, text classification, RAG','Computer Vision — image classification, object detection (YOLO), OpenCV','Reinforcement Learning — Q-learning, policy gradient basics','MLOps — model deployment, Docker, FastAPI, monitoring pipelines','Generative AI — LLM fine-tuning, prompt engineering, LangChain'],
    certifications: ['TensorFlow Developer Certificate (Google) — highly valued for deep learning roles','AWS Machine Learning Specialty — cloud AI/ML certification','Microsoft Azure AI Engineer Associate (AI-102) — enterprise AI development','Deep Learning Specialisation (Andrew Ng / Coursera) — gold standard learning path'],
    careerBeginner: [{title:'Junior ML Engineer',desc:'Implements and tests ML models; works under senior data scientists'},{title:'AI/ML Analyst',desc:'Applies existing models to business problems; builds pipelines and evaluations'},{title:'NLP Engineer (Junior)',desc:'Builds text classification, extraction, or chatbot systems using pretrained models'}],
    careerMid: [{title:'Machine Learning Engineer',desc:'Builds, deploys, and maintains ML systems in production; MLOps expertise required'},{title:'Computer Vision Engineer',desc:'Builds visual AI systems — defect detection, face recognition, autonomous systems'},{title:'Generative AI Engineer',desc:'Emerging role; builds LLM-powered applications, fine-tunes foundation models'}],
    careerSenior: [{title:'Principal AI/ML Engineer',desc:'Sets technical direction for AI products; leads a team of ML engineers'},{title:'AI Research Scientist',desc:'Publishes original research; typically requires PhD or exceptional project portfolio'},{title:'Head of AI / Chief AI Officer',desc:'Leads AI strategy and capability building at the organisational level'}],
    projectIdeas: ['Fine-tune a BERT model for sentiment analysis on product reviews and deploy via FastAPI','Build a real-time object detection system using YOLOv8 for a retail shelf monitoring use case','Create a RAG chatbot over PDF documents using LangChain + GPT'],
    resumeTip: 'AI resumes are evaluated almost entirely on projects. A Kaggle competition medal (even bronze) in a relevant domain can get you interviews a degree alone cannot. TensorFlow Developer Certificate + strong portfolio is the most effective combination for entry-level AI roles.',
    topCompanies: ['Google India','Microsoft India','Amazon India (AI/ML teams)','TCS AI.Cloud','Infosys AI','Wipro HOLMES','IBM Research India','Bosch AI','Samsung R&D India','Fractal Analytics','Quantiphi','Mad Street Den'],
    salaryRange: '₹6L – ₹30L per annum',
    salaryGrowth: 'Entry-level AI/ML engineers at product companies earn ₹7–14L. Mid-level ML engineers with TF Certification earn ₹15–25L. Senior AI engineers at FAANG India earn ₹40–80L+. Generative AI expertise adds a 30–50% premium to current market rates.',
    faqs: [{q:'Do I need a PhD for an AI career?',a:'Not for most roles. Research scientist positions at Google, DeepMind, or academic labs require or strongly prefer a PhD. ML Engineer, AI Engineer, and data scientist roles — the vast majority of AI jobs — are accessible with a strong MCA + certifications + project portfolio.'}],
  },
  'general management': {
    metaTitle: 'Online MBA General Management — Careers & Salary 2026 | Edify',
    metaDesc: 'MBA General Management online. Broad business skills across finance, marketing, HR and strategy. Salary ₹5L–₹18L. Flexible career paths. UGC approved universities.',
    heroHeadline: 'MBA General Management Online — The All-Round Business Leader.',
    heroSub: 'Build a broad base of management skills — finance, marketing, HR, strategy, and operations — for flexible career paths across every industry.',
    overview: 'MBA General Management is the most versatile specialisation — ideal for professionals who want broad business leadership skills rather than deep functional expertise. It is best suited for entrepreneurs, career changers, and those targeting general management roles where breadth matters more than depth.',
    whyChoose: ['Maximum flexibility — qualifies for roles across all business functions','Ideal for entrepreneurs and business owners building end-to-end business skills','Best choice if you are undecided on a functional specialisation','Strong for family business and SME management tracks','Covers every domain — finance, marketing, HR, operations, strategy'],
    skills: ['Business Strategy & Competitive Analysis','Financial Analysis and P&L Management','Marketing & Brand Fundamentals','Team Leadership and HR Basics','Operations Management and Process Improvement','Business Communication and Stakeholder Management','Project Management','Entrepreneurship and Innovation'],
    certifications: ['Google Project Management Certificate — practical PM skills','Lean Six Sigma White Belt — operations basics','Google Digital Marketing Certificate — digital essentials','University MBA Completion Certificate — UGC DEB approved'],
    careerBeginner: [{title:'Management Trainee',desc:'Rotational role across departments at large corporates; broad exposure'},{title:'Operations Executive',desc:'Manages day-to-day business operations at SMEs or mid-size companies'},{title:'Business Development Executive',desc:'Target-driven revenue generation role at any sector'}],
    careerMid: [{title:'General Manager',desc:'Owns P&L for a business unit; broad decision-making authority'},{title:'Business Head (SME)',desc:'Leads all functions of a small or medium enterprise; suits family business professionals'},{title:'Entrepreneur / Business Owner',desc:'Launches and runs a business with MBA-backed foundational knowledge'}],
    careerSenior: [{title:'CEO / Managing Director',desc:'Overall organisational leadership; long-term vision and strategy'},{title:'Country Manager / VP',desc:'Leads a geography or large business division for a corporate'},{title:'Independent Business Consultant',desc:'Advisory practice for SMEs and startups based on breadth of business knowledge'}],
    projectIdeas: ['Write a complete business plan for a micro-business in your local market','Conduct a full business audit (finance, marketing, HR, ops) for a hypothetical SME','Design a 12-month growth strategy for a fictional 50-person company'],
    resumeTip: 'General Management resumes need a clear narrative: "MBA General Management + 5 years of [domain] experience → targeting General Manager / Business Head roles at [type of company]". Without a specific domain, your experience becomes your differentiator.',
    topCompanies: ['Any company across any industry — General Management is sector-agnostic','Most relevant at: family businesses, SMEs, startups, and corporates with rotational MT programmes','Deloitte','EY','Accenture','HDFC Bank','TCS','ITC','Amazon India'],
    salaryRange: '₹5L – ₹18L per annum',
    salaryGrowth: 'General Management MBAs who combine broad knowledge with deep domain experience grow fastest. Business Heads at SMEs can earn ₹15–30L within 8–10 years. Entrepreneurship outcomes vary widely based on business performance.',
    faqs: [{q:'Is MBA General Management a good choice?',a:'Yes, if you want flexibility or are pursuing entrepreneurship, family business, or a rotational career path. If you have a clear target function (finance, marketing, tech), a functional specialisation will give you a stronger early career advantage.'}],
  },
  'entrepreneurship': {
    metaTitle: 'Online MBA Entrepreneurship — Careers & Startup Skills 2026 | Edify',
    metaDesc: 'MBA Entrepreneurship online. Business model design, startup funding, venture capital, innovation management. Build and launch your own business with structured skills.',
    heroHeadline: 'MBA Entrepreneurship Online — Build What Doesn\'t Exist Yet.',
    heroSub: 'From idea to launch to scale — master the business models, funding, and management skills that turn entrepreneurs into business builders.',
    overview: 'MBA Entrepreneurship is designed for those who want to start their own business, lead innovation at a company, or work in the startup ecosystem as an investor, accelerator professional, or venture builder.',
    whyChoose: ['India has the 3rd largest startup ecosystem in the world — 112,000+ DPIIT-recognised startups','Structured entrepreneurship curriculum reduces the costly trial-and-error learning curve','VC and angel investor network exposure through university connections','Corporate entrepreneurship (intrapreneurship) roles at large companies pay premium salaries','Family business professionals formalise and professionalize existing business skills'],
    skills: ['Business Model Design — BMC, value proposition canvas, lean startup methodology','Startup Funding — bootstrapping, angel investment, VC rounds, SAFE notes, term sheets','Product Development & MVP — agile product development, customer discovery, pivot strategy','Financial Modelling for Startups — unit economics, runway, CAC, LTV, burn rate','Marketing for Startups — growth hacking, zero-budget marketing, viral loops','Operations at Scale — hiring, culture, process design for fast-growing companies','Legal & Compliance for Startups — company registration, IP protection, ESOP design'],
    certifications: ['NSRCEL (IIM Bangalore) Startup Programmes — India\'s premier startup foundation','TiE Membership — India\'s largest entrepreneur network access','Google for Startups course completion badges','DPIIT Startup India registration benefits — eligibility coaching'],
    careerBeginner: [{title:'Business Founder / Co-founder',desc:'Launch your own venture — the primary goal of this specialisation'},{title:'Startup Business Analyst',desc:'Works inside an early-stage startup; gets equity + experience'},{title:'Accelerator / Incubator Associate',desc:'Supports portfolio startups at IIM incubators, T-Hub, or NASSCOM 10K Startups'}],
    careerMid: [{title:'Serial Entrepreneur',desc:'Multiple venture launches; uses early exits to fund next ventures'},{title:'Intrapreneur / Innovation Lead',desc:'Leads new business initiatives within a large corporation'},{title:'Venture Capital Analyst',desc:'Evaluates startups for investment; requires strong business analysis skills'}],
    careerSenior: [{title:'Venture Capital Partner',desc:'Invests in startups from a fund; typically requires one successful exit or strong track record'},{title:'CEO / Founder at Scale',desc:'Leads a startup past Series A to growth stage; revenue > ₹10Cr'},{title:'Startup Ecosystem Leader',desc:'Leads an accelerator, incubator, or government innovation programme'}],
    projectIdeas: ['Build a complete pitch deck for a startup idea — financials, TAM, and team slide included','Conduct 20 customer discovery interviews and write a validated problem-solution hypothesis','Model the unit economics for a hypothetical D2C brand at 1K, 10K, and 100K orders/month'],
    resumeTip: 'Entrepreneurship MBAs need to show execution, not just ideas. Even a failed startup attempt with a clear learning narrative is more valuable than a theoretical business plan. Document any revenue earned, customers served, or team led.',
    topCompanies: ['Your own startup','T-Hub Hyderabad','NASSCOM 10K Startups','IIM Ahmedabad CIIE','IIM Bangalore NSRCEL','Sequoia Capital India','Nexus Venture Partners','Y Combinator (alumni network access)','Accenture Ventures','Reliance Jio Platforms (corporate VC)'],
    salaryRange: 'Variable — founder income from ₹0 (pre-revenue) to ₹50L+ (funded startup); Intrapreneur/VC roles: ₹8L–₹25L',
    salaryGrowth: 'Entrepreneurship MBA ROI is highly variable. The highest outcomes: successful exits, equity stakes in funded companies, or intrapreneur roles at large tech companies. The realistic median: 5+ years to match a traditional MBA salary, but with equity upside.',
    faqs: [{q:'Is MBA Entrepreneurship worth it if I already have a business idea?',a:'Yes — it gives you the structured toolkit (financial modelling, legal basics, fundraising, hiring) that prevents the most common and costly startup mistakes. The network access to mentors and investors is often the highest-value component.'}],
  },
  'logistics & supply chain': {
    metaTitle: 'Online MBA Logistics & Supply Chain — Careers & Salary 2026 | Edify',
    metaDesc: 'MBA Logistics & Supply Chain online. Manage freight, warehousing, customs and last-mile delivery. Salary ₹5L–₹18L. Delhivery, Amazon, Blue Dart, L&T hiring. UGC approved.',
    heroHeadline: 'MBA Logistics & Supply Chain Online — Move the World Forward.',
    heroSub: 'Master freight management, warehouse operations, customs compliance, and supply chain strategy for India\'s booming logistics sector.',
    overview: 'India\'s logistics sector reached $250B in 2024 and is growing at 10–12% CAGR driven by e-commerce, infrastructure development, and the PM Gati Shakti National Master Plan. MBA in Logistics & Supply Chain prepares you to manage complex movement of goods across transport modes, geographies, and supply chain networks.',
    whyChoose: ['India\'s logistics sector: $250B and growing at 10–12% CAGR','PM Gati Shakti infrastructure push creating sustained logistics employment','E-commerce last-mile delivery is India\'s highest-volume logistics sub-sector','Port, rail, and cold chain logistics are chronically understaffed with trained managers','Pan-India and international logistics exposure — natural career for those who like travel and complexity'],
    skills: ['Freight Management — air, sea, road, and multimodal logistics planning','Warehouse Management — WMS systems, slotting, pick-pack-ship operations','Customs & Compliance — EXIM documentation, HS codes, customs valuation','Last-Mile Delivery Management — delivery density, exception handling, reverse logistics','Supply Chain Planning — demand forecasting, inventory optimisation, S&OP','Cold Chain Management — temperature-controlled logistics for pharma and food','3PL / 4PL Management — outsourcing, SLA management, vendor performance','Logistics Analytics — route optimisation, freight cost benchmarking, dashboards'],
    certifications: ['IATA Dangerous Goods Regulations (DGR) — aviation logistics, high demand','CSCMP (Council of Supply Chain Management Professionals) certification','FIATA Diploma in Freight Forwarding — international logistics standard','Customs Broker License (after experience)'],
    careerBeginner: [{title:'Logistics Coordinator',desc:'Manages freight bookings, shipment tracking, and documentation for import/export'},{title:'Warehouse Associate / Supervisor',desc:'Manages inbound, outbound, and inventory at distribution centres'},{title:'Freight Operations Executive',desc:'Coordinates with carriers, tracks shipments, resolves delivery exceptions'}],
    careerMid: [{title:'Supply Chain Manager',desc:'Owns end-to-end supply chain for a product category or region'},{title:'Logistics Manager',desc:'Manages a fleet, warehouse network, or 3PL relationships for a company'},{title:'Customs / EXIM Manager',desc:'Manages regulatory compliance, customs clearance, and trade documentation'}],
    careerSenior: [{title:'VP Logistics / Head of Supply Chain',desc:'Leads the logistics and supply chain function; P&L responsibility'},{title:'Country Head (3PL Company)',desc:'Runs the India operations for a global freight or logistics company'},{title:'Logistics Consultant',desc:'Advisory practice for companies optimising their supply chain networks'}],
    projectIdeas: ['Design a last-mile delivery network for a hypothetical D2C brand in 5 metro cities','Benchmark logistics costs across 3 shipping partners for an FMCG export scenario','Create a warehouse slotting plan for a 10,000 sq ft distribution centre using ABC analysis'],
    resumeTip: 'Logistics resumes value certifications (IATA DGR especially) and direct experience with WMS, TMS, or ERP logistics modules. Quantify freight savings: "Negotiated shipping rates reducing logistics cost by 14%".',
    topCompanies: ['Delhivery','Blue Dart','DTDC','Amazon Logistics India','Flipkart Ekart','Mahindra Logistics','DP World India','Maersk India','DB Schenker India','L&T Integrated Engineering Services','TVS Supply Chain','Gati'],
    salaryRange: '₹5L – ₹18L per annum',
    salaryGrowth: 'Logistics sector growing fast but starting salaries are moderate (₹4–7L). Senior logistics managers and SCM directors earn ₹15–25L. International freight forwarding roles with FIATA Diploma earn premium salaries at global 3PLs.',
    faqs: [{q:'Is logistics a good MBA specialisation for India?',a:'Growing but specialised. Strongest for those who want to work in FMCG supply chain, e-commerce operations, government logistics (railways, ports), or global freight forwarding. Starting salaries are below MBA Finance/Marketing but job security and growth are strong in India\'s infrastructure expansion.'}],
  },
}

// ─── HELPER FUNCTIONS ─────────────────────────────────────────
const SPEC_ALIASES: Record<string, string> = {
  'marketing management': 'marketing',
  'marketing & sales management': 'marketing',
  'sales & marketing': 'marketing',
  'finance management': 'finance',
  'financial management': 'finance',
  'finance & accounting management': 'finance',
  'banking & finance': 'finance',
  'operations management': 'operations & supply chain',
  'operations & supply chain management': 'operations & supply chain',
  'logistics & supply chain management': 'operations & supply chain',
  'production & operations management': 'operations & supply chain',
  'supply chain': 'operations & supply chain',
  'data science & business analytics': 'data science',
  'data science and analytics': 'data science',
  'analytics and data science': 'data science',
  'data science & analytics': 'data science',
  'business intelligence & analytics': 'business analytics',
  'digital marketing management': 'digital marketing',
  'digital marketing & e-commerce': 'digital marketing',
  'digital marketing & sales': 'digital marketing',
  'international business management': 'international business',
  'international trade & business': 'international business',
  'human resources analytics': 'human resource management',
  'hr management': 'human resource management',
  'human resource management & finance': 'human resource management',
}

export function getSpecContent(spec: string): SpecContent | null {
  const key = spec.toLowerCase().replace(/[^a-z0-9 &]/g, '').trim()
  return SPEC_CONTENT[key]
    || SPEC_CONTENT[key.replace(/ & /g, ' ')]
    || SPEC_CONTENT[SPEC_ALIASES[key] || '']
    || null
}
export function getProgramContent(program: string): ProgramContent | null {
  return PROGRAM_CONTENT[program] || null
}
// Fallback spec content for specs without dedicated pages
export function getSpecFallback(spec: string, program: string): SpecContent {
  return {
    metaTitle: `Online ${program} in ${spec} — Careers, Skills & Salary | Edify`,
    metaDesc: `Study ${program} with ${spec} specialisation online from UGC-approved NIRF-ranked universities. Career paths, salary data, certifications, and honest university comparison on Edify.`,
    heroHeadline: `${program} in ${spec} — Build Expertise. Advance Your Career.`,
    heroSub: `Earn a UGC-approved ${program} with ${spec} specialisation from India\'s top NIRF-ranked universities.`,
    overview: `An online ${program} with ${spec} specialisation gives you both the broad management/technical foundation of the degree and deep expertise in ${spec} — one of the growing areas in India\'s job market.`,
    whyChoose: [`${spec} is a growing specialisation with strong industry demand`,`Combines ${program} credentials with focused ${spec} domain knowledge`,`UGC DEB-approved degree valid for private sector employment`,`Flexible online delivery suitable for working professionals`],
    skills: [`Core ${spec} domain knowledge`,`${program}-level analytical and management skills`,`Industry tools specific to ${spec} sector`,`Business communication and presentation skills`],
    certifications: [`University ${program} Completion Certificate — UGC DEB approved`,`Sector-specific certifications relevant to ${spec}`],
    careerBeginner: [{title:`${spec} Executive / Associate`,desc:`Entry-level role applying ${spec} knowledge in corporate or government settings`},{title:'Management Trainee',desc:'Rotational entry role at large companies with exposure to multiple functions'}],
    careerMid: [{title:`${spec} Manager`,desc:`Mid-level management role leading a team or function within ${spec} domain`},{title:'Senior Analyst / Specialist',desc:`Applies deep ${spec} expertise to solve business problems and advise leadership`}],
    careerSenior: [{title:`Head of ${spec} / Director`,desc:`Senior leadership responsible for ${spec} strategy and function at organisational level`},{title:'General Manager / VP',desc:`Broad P&L responsibility with ${spec} as primary domain expertise`}],
    projectIdeas: [`Industry analysis project: map the ${spec} sector landscape in India`,`Case study: solve a real business problem in a ${spec}-focused company`,`Research report: career and salary benchmarking in the ${spec} industry`],
    resumeTip: `For ${spec} roles: highlight any domain experience, certifications, and projects that demonstrate your ${spec} knowledge beyond just the degree. Practical exposure matters.`,
    topCompanies: [`Top ${spec} employers in India — varies by sector and geography`],
    salaryRange: '₹4L – ₹15L per annum (experience-dependent)',
    salaryGrowth: `${spec} salary growth depends on domain demand and individual specialisation within the field. Source: AmbitionBox 2024.`,
    faqs: [{q:`Is ${program} with ${spec} specialisation a good choice?`,a:`It depends on your career goals. ${spec} is a recognised specialisation that adds domain depth to your ${program} credential. Research the specific employers and roles in the ${spec} sector before committing.`}],
  }
}

// ── Edify Recommends: Skills & Internships per SPECIALISATION ──────────────
// These are shown on university pages when a specialisation is selected.
// Each entry is researched and specific — not generic filler.
// Source: industry role requirements, placement data, job description analysis.

export interface SpecRecommendation {
  skills: string[]       // Tools/certifications to learn during the program
  internships: string[]  // Specific internship roles to target
}

export const SPEC_RECOMMENDATIONS: Record<string, SpecRecommendation> = {
  // ── MBA: Finance ──────────────────────────────────────────────────────────
  'Finance': {
    skills: ['Advanced Excel (financial modelling, VLOOKUP)', 'Python basics (pandas, yfinance)', 'NISM/NCFM certifications', 'Financial statement analysis', 'Bloomberg terminal basics (free demo)'],
    internships: ['Financial Analyst Intern', 'Investment Research Intern', 'Credit Analyst Intern', 'Equity Research Intern'],
  },
  'Financial Management': {
    skills: ['Advanced Excel (financial modelling)', 'Python basics for finance (pandas)', 'NISM/NCFM certifications', 'Financial statement analysis', 'Tally ERP for accounting'],
    internships: ['Finance Analyst Intern', 'Accounts & Finance Intern', 'Treasury Intern', 'Tax Audit Intern'],
  },
  'Banking & Finance': {
    skills: ['NISM Series certifications (Series-V, Series-VIII)', 'Advanced Excel', 'Credit analysis basics', 'Banking operations knowledge', 'Python basics for finance'],
    internships: ['Banking Operations Intern', 'Credit Analyst Intern', 'Investment Banking Intern', 'Fintech Operations Intern'],
  },
  'Banking & Insurance': {
    skills: ['NISM Series certifications', 'Excel for financial data', 'Insurance products knowledge', 'Banking operations basics', 'MS Office advanced'],
    internships: ['Banking Operations Intern', 'Insurance Advisor Intern', 'Fintech Intern', 'Loan Processing Intern'],
  },
  // ── MBA: Marketing ────────────────────────────────────────────────────────
  'Marketing': {
    skills: ['Google Analytics 4 (free cert)', 'Meta Blueprint certification', 'HubSpot Inbound Marketing cert', 'Canva (design basics)', 'SEO fundamentals'],
    internships: ['Digital Marketing Intern', 'Brand Management Intern', 'SEO/SEM Intern', 'Social Media Marketing Intern'],
  },
  'Marketing Management': {
    skills: ['Google Analytics 4 (free cert)', 'Meta Blueprint certification', 'HubSpot Inbound Marketing cert', 'Canva (design basics)', 'SEO fundamentals'],
    internships: ['Digital Marketing Intern', 'Brand Management Intern', 'Market Research Intern', 'Content Marketing Intern'],
  },
  'Digital Marketing': {
    skills: ['Google Ads certification', 'Meta Blueprint certification', 'Google Analytics 4', 'Ahrefs or SEMrush basics', 'Email marketing (Mailchimp)'],
    internships: ['Performance Marketing Intern', 'SEO Analyst Intern', 'Paid Ads Intern', 'Growth Hacking Intern'],
  },
  'Digital Marketing Management': {
    skills: ['Google Ads certification', 'Meta Blueprint certification', 'Google Analytics 4', 'Ahrefs or SEMrush basics', 'Email marketing (Mailchimp)'],
    internships: ['Performance Marketing Intern', 'SEO Analyst Intern', 'Paid Ads Intern', 'Content & Growth Intern'],
  },
  // ── MBA: HR ───────────────────────────────────────────────────────────────
  'Human Resource Management': {
    skills: ['Excel for HR analytics (pivot tables)', 'LinkedIn Recruiter basics', 'Darwinbox or Keka HRMS (free trial)', 'Labour law basics', 'Psychometric assessment tools awareness'],
    internships: ['HR Executive Intern', 'Talent Acquisition Intern', 'HR Operations Intern', 'Learning & Development Intern'],
  },
  'Strategic Human Resource Management': {
    skills: ['Excel for HR analytics', 'LinkedIn Recruiter basics', 'Darwinbox or Keka HRMS (free trial)', 'People analytics basics', 'Labour law basics'],
    internships: ['HR Business Partner Intern', 'Talent Acquisition Intern', 'HR Analytics Intern', 'OD Intern'],
  },
  // ── MBA: Operations ───────────────────────────────────────────────────────
  'Operations Management': {
    skills: ['Six Sigma Yellow Belt (free study material)', 'Lean manufacturing basics', 'SAP ERP basics (free trial)', 'Excel for operations data', 'Supply chain fundamentals'],
    internships: ['Operations Analyst Intern', 'Supply Chain Intern', 'Process Improvement Intern', 'Production Planning Intern'],
  },
  'Supply Chain Management': {
    skills: ['SAP SCM basics', 'Six Sigma Yellow Belt', 'Excel for logistics data', 'Freight and EXIM documentation basics', 'Oracle SCM Cloud basics'],
    internships: ['Supply Chain Analyst Intern', 'Logistics Coordinator Intern', 'Procurement Intern', 'Warehouse Operations Intern'],
  },
  'Logistics & Supply Chain Management': {
    skills: ['SAP SCM basics', 'Six Sigma Yellow Belt', 'Excel for logistics data', 'EXIM documentation', 'Oracle SCM Cloud basics'],
    internships: ['Logistics Coordinator Intern', 'Supply Chain Analyst Intern', 'Procurement Intern', 'Freight Operations Intern'],
  },
  // ── MBA: Analytics & Data ─────────────────────────────────────────────────
  'Business Analytics': {
    skills: ['Python (pandas, numpy — free on Kaggle)', 'Tableau Public (free)', 'SQL basics (MySQL/PostgreSQL)', 'Excel advanced (macros, pivot)', 'Google Data Studio'],
    internships: ['Business Analyst Intern', 'Data Analyst Intern', 'MIS Intern', 'Analytics Consultant Intern'],
  },
  'Data Science': {
    skills: ['Python (scikit-learn, pandas)', 'SQL', 'Tableau or Power BI', 'Machine learning basics (Kaggle courses)', 'Statistics fundamentals'],
    internships: ['Data Analyst Intern', 'ML Engineer Intern', 'BI Analyst Intern', 'Data Science Intern'],
  },
  'Data Science & Analytics': {
    skills: ['Python (pandas, scikit-learn)', 'SQL', 'Tableau or Power BI', 'Machine learning basics', 'Statistics fundamentals'],
    internships: ['Data Analyst Intern', 'ML Engineer Intern', 'BI Analyst Intern', 'Data Science Intern'],
  },
  // ── MBA: AI/Tech ──────────────────────────────────────────────────────────
  'Artificial Intelligence': {
    skills: ['Python (TensorFlow or PyTorch basics)', 'SQL basics', 'Machine learning fundamentals (fast.ai free course)', 'Prompt engineering basics', 'Data wrangling with pandas'],
    internships: ['AI Research Intern', 'ML Engineer Intern', 'Data Scientist Intern', 'NLP Engineer Intern'],
  },
  'IT Management': {
    skills: ['Python or SQL basics', 'AWS Cloud Practitioner (free prep)', 'JIRA/Agile basics', 'Cybersecurity awareness (CISCO free course)', 'Power BI basics'],
    internships: ['IT Project Management Intern', 'Business Analyst Intern', 'Product Management Intern', 'IT Consultant Intern'],
  },
  // ── MBA: International Business ───────────────────────────────────────────
  'International Business': {
    skills: ['EXIM procedures & documentation', 'Foreign exchange basics', 'Incoterms knowledge (ICC free guide)', 'Trade finance basics', 'Excel for international trade data'],
    internships: ['Export-Import Intern', 'International Trade Finance Intern', 'Global Business Development Intern', 'Trade Compliance Intern'],
  },
  // ── MBA: Healthcare ───────────────────────────────────────────────────────
  'Healthcare Management': {
    skills: ['Hospital management software basics (HIS)', 'NABH Quality Standards awareness', 'Excel for patient/ops data', 'Healthcare analytics basics', 'Medical coding basics (ICD-10)'],
    internships: ['Hospital Operations Intern', 'Healthcare Analytics Intern', 'Medical Administration Intern', 'Public Health Intern'],
  },
  'Hospital & Healthcare Management': {
    skills: ['Hospital management software (HIS) basics', 'NABH Quality Standards', 'Healthcare analytics basics', 'Excel for patient data', 'Medical coding awareness'],
    internships: ['Hospital Operations Intern', 'Healthcare Management Intern', 'Pharmacy Administration Intern', 'Clinical Research Intern'],
  },
  // ── MBA: Project Management ───────────────────────────────────────────────
  'Project Management': {
    skills: ['PMP basics (PMI free study material)', 'Agile/Scrum methodology (Scrum.org free)', 'MS Project or Asana (free trial)', 'JIRA basics', 'Risk management fundamentals'],
    internships: ['Project Coordinator Intern', 'Agile Scrum Intern', 'PMO Intern', 'Business Analyst Intern'],
  },
  // ── MBA: Entrepreneurship ─────────────────────────────────────────────────
  'Entrepreneurship': {
    skills: ['Lean startup methodology (free book)', 'No-code tools (Webflow, Notion, Bubble)', 'Unit economics basics', 'Pitch deck design (Canva)', 'Google Analytics basics'],
    internships: ['Startup Intern (any early-stage)', 'Business Development Intern', 'Product Development Intern', 'Growth Intern'],
  },
  // ── MCA ───────────────────────────────────────────────────────────────────
  'Cloud Computing': {
    skills: ['AWS Cloud Practitioner (free prep)', 'Linux command line basics', 'Python for cloud scripting', 'Docker basics (free labs on Play with Docker)', 'Azure or GCP free tier hands-on'],
    internships: ['Cloud Engineer Intern', 'DevOps Intern', 'AWS Solutions Architect Intern', 'Cloud Support Intern'],
  },
  'Cyber Security': {
    skills: ['Linux & networking basics (TryHackMe free rooms)', 'CEH basics (free material)', 'Python for security scripting', 'OWASP Top 10 awareness', 'Wireshark basics'],
    internships: ['SOC Analyst Intern', 'Penetration Testing Intern', 'Network Security Intern', 'Cybersecurity Analyst Intern'],
  },
  'DevOps': {
    skills: ['Linux & shell scripting', 'Docker & Kubernetes basics (free labs)', 'CI/CD pipelines (Jenkins/GitHub Actions)', 'AWS/Azure fundamentals', 'Git & GitHub (mandatory)'],
    internships: ['DevOps Engineer Intern', 'Site Reliability Intern', 'Cloud Ops Intern', 'Build & Release Intern'],
  },
  'Blockchain Technology & Management': {
    skills: ['Solidity basics (CryptoZombies free course)', 'Ethereum & Web3.js basics', 'Smart contract concepts', 'Cryptography fundamentals', 'Hardhat or Truffle framework'],
    internships: ['Blockchain Developer Intern', 'Smart Contract Auditor Intern', 'Web3 Developer Intern', 'DeFi Analyst Intern'],
  },
  'Full Stack Development': {
    skills: ['HTML, CSS, JavaScript (mandatory)', 'React or Vue.js basics', 'Node.js & Express basics', 'SQL & MongoDB', 'Git & GitHub (mandatory)'],
    internships: ['Full Stack Developer Intern', 'Frontend Developer Intern', 'Backend Developer Intern', 'React Developer Intern'],
  },
  'Computer Science & IT': {
    skills: ['Python or Java (pick one, go deep)', 'Data Structures & Algorithms (LeetCode easy/medium)', 'SQL & DBMS basics', 'Git & GitHub', 'Linux command line basics'],
    internships: ['Software Developer Intern', 'Web Developer Intern', 'Java/Python Developer Intern', 'QA Testing Intern'],
  },

  // ── BCA ───────────────────────────────────────────────────────────────────
  'Web Development': {
    skills: ['HTML, CSS, JavaScript (mandatory)', 'React basics (free courses on Scrimba)', 'PHP or Node.js basics', 'MySQL basics', 'Git & GitHub'],
    internships: ['Web Developer Intern', 'Frontend Developer Intern', 'WordPress Developer Intern', 'UI Development Intern'],
  },
  'IoT (Internet of Things)': {
    skills: ['Arduino or Raspberry Pi basics (free tutorials)', 'Python for IoT scripting', 'MQTT protocol basics', 'Basic electronics & circuit reading', 'AWS IoT or Azure IoT basics'],
    internships: ['IoT Developer Intern', 'Embedded Systems Intern', 'Hardware-Software Integration Intern', 'Smart Systems Intern'],
  },
  'Cloud Technology & Information Security': {
    skills: ['AWS Cloud Practitioner (free prep)', 'Linux basics', 'Python basics', 'Network security fundamentals', 'Docker basics'],
    internships: ['Cloud Support Intern', 'Security Analyst Intern', 'DevOps Intern', 'IT Support Intern'],
  },
  // ── B.Com ─────────────────────────────────────────────────────────────────
  'Commerce / Accountancy / Finance': {
    skills: ['Tally Prime / Tally ERP (mandatory)', 'Advanced Excel (VLOOKUP, pivot)', 'GST & TDS filing basics', 'Income tax e-filing (ITR-1, ITR-2)', 'Zoho Books or QuickBooks basics'],
    internships: ['Accounts Intern', 'Tax Filing Intern', 'Audit Intern', 'Finance Assistant Intern'],
  },
  'Accounting & Finance': {
    skills: ['Tally Prime (mandatory)', 'Advanced Excel', 'GST & TDS filing', 'Income tax e-filing', 'Basic financial reporting (IND AS awareness)'],
    internships: ['Accounts Intern', 'Tax Filing Intern', 'Audit Intern', 'Finance Assistant Intern'],
  },
  // ── M.Com ─────────────────────────────────────────────────────────────────
  'Professional Accounting & Finance (CPA US)': {
    skills: ['CPA exam preparation (FAR, AUD, REG, BEC sections)', 'Advanced Excel (financial modelling)', 'US GAAP basics', 'QuickBooks advanced', 'Bloomberg basics'],
    internships: ['Big 4 Audit Intern', 'Tax Consulting Intern', 'Financial Reporting Intern', 'CPA Firm Intern'],
  },
  'International Finance & Accounting (ACCA)': {
    skills: ['ACCA exam preparation (F1–P3 papers)', 'IFRS & IND AS basics', 'Advanced Excel (financial modelling)', 'Bloomberg or Reuters basics', 'SAP FI module basics'],
    internships: ['Big 4 Audit Intern', 'IFRS Reporting Intern', 'Finance Analyst Intern', 'International Tax Intern'],
  },
  // ── MA ────────────────────────────────────────────────────────────────────
  'English': {
    skills: ['Academic writing & research methodology', 'Content writing & editing', 'SEO basics for content writers', 'MS Office advanced (Word styles, referencing)', 'Grammarly & Hemingway Editor'],
    internships: ['Content Writer Intern', 'Copy Editor Intern', 'Research Assistant Intern', 'Proofreader Intern'],
  },
  'Economics': {
    skills: ['Excel for economic data analysis (regression, charts)', 'R basics for statistics (free on Coursera)', 'EViews or STATA basics', 'Data visualisation basics', 'Research methodology & academic writing'],
    internships: ['Economic Research Intern', 'Policy Research Intern', 'Data Analyst Intern', 'Think Tank Intern'],
  },
  'Public Policy': {
    skills: ['Policy analysis frameworks (free MOOC)', 'Excel & basic data analysis', 'Report writing & presentation', 'Research methodology', 'GIS basics (optional, QGIS is free)'],
    internships: ['Policy Research Intern', 'Government / NGO Intern', 'Think Tank Intern', 'Data Research Intern'],
  },
  // ── General fallback for common combos ───────────────────────────────────
  'General': {
    skills: ['Advanced Excel (VLOOKUP, pivot tables, basic macros)', 'LinkedIn profile optimisation', 'Business communication & email writing', 'MS Office suite proficiency'],
    internships: ['Management Trainee Intern', 'Business Analyst Intern', 'Operations Intern', 'Research Intern'],
  },
  'General Management': {
    skills: ['Advanced Excel (VLOOKUP, pivot tables)', 'LinkedIn profile optimisation', 'Business communication', 'Project management basics (Trello/Asana free)', 'Data interpretation basics'],
    internships: ['Management Trainee Intern', 'Business Analyst Intern', 'Strategy Intern', 'Operations Intern'],
  },
}

export function getSpecRecommendation(spec: string): SpecRecommendation | null {
  if (!spec) return null
  // Exact match first
  if (SPEC_RECOMMENDATIONS[spec]) return SPEC_RECOMMENDATIONS[spec]
  // Partial match — spec name contains a key
  const specLower = spec.toLowerCase()
  for (const [key, val] of Object.entries(SPEC_RECOMMENDATIONS)) {
    if (specLower.includes(key.toLowerCase()) || key.toLowerCase().includes(specLower)) {
      return val
    }
  }
  return null
}


// ── University Syllabus Data ────────────────────────────────────────────────
// Source: University Program Matrix Excel — semester-wise subjects per degree
// Key format: "university_id||degree" e.g. "jain||MBA"

export interface UniversitySyllabus {
  sem1?: string
  sem2?: string
  sem3?: string
  sem4?: string
  sem5?: string
  sem6?: string
  sem56?: string
  research?: string
  capstone?: string
  edifySkills?: string[]
  edifyProjects?: string[]
  edifyInternships?: string[]
  highlight?: string
  programOverview?: string
}

export const UNIVERSITY_SYLLABUS: Record<string, UniversitySyllabus> = {
  'amet-university-online||B.Com': {
    sem1: 'Financial Accounting, Micro Economics, Business',
    sem2: 'Corporate Accounting, Macro Economics, Business',
    sem3: 'Advanced Corporate Accounting, Cost Accounting,',
    sem4: 'Management Accounting, Auditing, Income Tax Law and',
    sem56: 'Financial Management, Human Resource Management,',
    research: 'Research Methodology (Semester 6).',
    capstone: 'Industry Internship Project (Semester 6).',
    edifySkills: ['Banking operations basics', 'Insurance products knowledge', 'KYC/AML compliance awareness', 'Excel for financial data', 'NISM certifications', 'Customer service skills', 'Fintech basics', 'IRDAI framework awareness'],
    edifyProjects: ['Compare 5 term insurance plans and present a recommendation report', 'Create a bank account opening checklist and KYC document list', 'Analyse a bank\'s NPA data and present findings', 'Build a mutual fund SIP calculator in Excel', 'Design a simple insurance needs analysis questionnaire', 'Research and compare 3 NBFCs and their products'],
    edifyInternships: ['Banking Operations Intern', 'Insurance Advisor Intern', 'Fintech Intern', 'Customer Service Intern', 'Apply via: Internshala', 'LinkedIn']
  },
  'arka-jain-university-online||MBA': {
    sem1: 'Business Economics | Managerial Effectiveness & Ethics | Accounting and Finance | Organizational Behavior & Human Resources Management | Quantitative Techniques for Business Decisions',
    sem2: 'Entrepreneurship | Marketing Management | Banking, Financial Services and Insurance | Corporate Law | Business Analytics',
    sem3: 'Business Research Methods | Operations Management | Finance Spec: Direct and Indirect Taxes | Investment Analysis & Portfolio Management | Fintech – Foundations & Applications | Marketing Spec: Consumer Behavior | Integrated Marketing Communications | Sales and Distribution Manag',
    sem4: 'Business Environment & Strategy | Finance Spec: Fixed Income Securities & Derivatives | Valuation and Investment Banking | International Finance | Marketing Spec: B2B Marketing | Retail Marketing & Service Management | Digital Marketing & Brand Management | HR Spec: International',
    sem56: 'N/A (2-year PG)',
    research: 'Business Research Methods (Sem 3)',
    capstone: 'Master Thesis / Project (Sem 4)',
    edifySkills: ['Google Ads certification', 'Meta Blueprint certification', 'SEO tools', 'Email marketing – Mailchimp basics', 'WordPress basics', 'Canva & Adobe Express', 'Google Analytics 4', 'Content writing & copywriting'],
    edifyProjects: ['Run a live Google Search Ad campaign with ₹500 budget', 'Build a complete SEO strategy for a local business website', 'Create a 30-day Instagram content calendar with copy + visuals', 'Write 5 email marketing sequences for a hypothetical brand', 'Build a WordPress landing page with CTA and lead form', 'Measure ROI of a hypothetical social media campaign'],
    edifyInternships: ['Digital Marketing Intern', 'SEO Intern', 'Social Media Intern', 'Content Creator Intern', 'Google Ads Intern', 'Email Marketing Intern']
  },
  'alagappa-university-online||B.Com': {
    sem1: 'Financial Accounting - I, Business Management,',
    sem2: 'Financial Accounting - II, Marketing Management,',
    sem3: 'Corporate Accounting - I, Business Law, Business',
    sem4: 'Corporate Accounting - II, Cost Accounting, Banking',
    edifySkills: ['Tally ERP 9 / Tally Prime', 'Advanced Excel', 'GST returns filing basics', 'Income Tax basics', 'MS Word & PowerPoint', 'Business communication & email writing', 'Banking & finance basics', 'QuickBooks or Zoho Books basics'],
    edifyProjects: ['Prepare a set of books of accounts for a small business in Tally', 'File a mock GST return using practice data', 'Analyse a company\'s annual report', 'Build a personal budget tracker and investment planner in Excel', 'Prepare a cost-benefit analysis for a hypothetical business decision', 'Create a comparison of 2 mutual funds using NAV data'],
    edifyInternships: ['Accounts Intern', 'Tax Filing Intern', 'Audit Intern', 'Finance Assistant Intern', 'Banking Operations Intern', 'Apply via: Internshala']
  },
  'aligarh-muslim-university-online||B.A': {
    sem1: 'Microeconomics-I, Indian Economy-I, English',
    sem2: 'Microeconomics-II, Indian Economy-II, English',
    sem3: 'Macroeconomics-I, Statistical Methods for',
    sem4: 'Macroeconomics-II, Mathematical Economics, English',
    sem56: 'See above',
    research: 'Statistical Methods for Economics (Semester 3)',
    capstone: 'Not Mentioned',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'alliance-university-online||B.Com': {
    sem1: 'Foundation of Business English, Principles and',
    sem2: 'English for Business Communication, Hindi / Kannada',
    sem3: 'International Business, Economic Analysis for',
    sem4: 'Marketing Management, Decision Analysis, Human',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'amity-university-online||B.Com': {
    sem1: 'Financial Accounting | Business Mathematics | Business Communication | Micro Economics | IT Fundamentals | Environmental Studies | Detailed sem-wise subjects available in Google Drive syllabus folder (amityonline.com – JS-rendered; Drive folder shared by user). Website pages conf',
    sem2: 'Cost Accounting | Business Law | Business Statistics | Macro Economics | Taxation Basics | Detailed sem-wise subjects available in Google Drive syllabus folder (amityonline.com – JS-rendered; Drive folder shared by user). Website pages confirm program structure but subjects are i',
    sem3: 'Corporate Accounting | Income Tax | Management Accounting | Financial Management | Auditing | Detailed sem-wise subjects available in Google Drive syllabus folder (amityonline.com – JS-rendered; Drive folder shared by user). Website pages confirm program structure but subjects ar',
    sem4: 'Advanced Accounting | Indirect Taxation (GST) | Company Law | Research Methodology | Detailed sem-wise subjects available in Google Drive syllabus folder (amityonline.com – JS-rendered; Drive folder shared by user). Website pages confirm program structure but subjects are in down',
    sem56: 'Sem 5: Financial Reporting | Investment Analysis | E-Commerce | Project | Sem 6: Strategic Management | Business Ethics | Entrepreneurship | Detailed sem-wise subjects available in Google Drive syllab',
    research: 'Research Methodology (Sem 4); Project (Sem 5)',
    capstone: 'Project in Semester 5',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'amrita-vishwa-vidyapeetham-online||B.Com': {
    sem1: 'Communicative English, Financial Accounting,',
    sem2: 'Professional Communication, Management Accounting,',
    sem3: 'Corporate Accounting, Business Law, Banking and',
    sem4: 'Auditing, Cost Accounting, Financial Management,',
    sem56: 'See above',
    research: 'Business Statistics, Quantitative Techniques',
    capstone: 'Project Work (Semester 6)',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'andhra-university-online||M.A': {
    sem1: '• General Sociology | • Classical Sociological Thought | • Sociology of India | • Research Methodology',
    sem2: '• Modern Sociological Theories | • Social Movements in India | • Rural Sociology | • Sociology of Development',
    sem3: '• Urban Sociology | • Sociology of Health | • Gender and Society | • Social Problems in India',
    sem4: '• Industrial Sociology | • Sociology of Education | • Environmental Sociology | • Dissertation / Project Work',
    sem56: 'N/A (2-year PG)',
    research: 'Research Methodology (Sem 1) | Dissertation / Project Work (Sem 4)',
    capstone: 'Dissertation / Project Work – Semester 4',
    edifySkills: ['Qualitative research methods', 'Survey design', 'Data analysis', 'Field research & ethnography basics', 'Academic writing', 'Social work case study writing', 'Interview & focus group facilitation', 'SPSS basics for social science'],
    edifyProjects: ['Conduct a field study on a social issue in your local community', 'Write a sociological analysis of a social media phenomenon', 'Design and administer a 20-person survey on gender equality awareness', 'Research and present a case study on social mobility in urban India', 'Write a 2,000-word paper on caste discrimination in education', 'Analyse census data trends using Excel'],
    edifyInternships: ['Social Research Intern', 'NGO Field Work Intern', 'Community Development Intern', 'CSR Research Intern', 'Government Social Welfare Intern', 'Apply via: LinkedIn']
  },
  'anna-university-online||MBA': {
    sem1: 'Management Concepts, Statistics for Management,',
    sem2: 'Marketing Management, Human Resource Management,',
    sem3: 'Strategic Management, International Business',
    sem4: 'Professional Elective VI, Project Work',
    research: 'Business Research Methods (Semester 2)',
    capstone: 'Project Work (Semester 4)',
    edifySkills: ['Business communication & presentation skills', 'Advanced Excel', 'PowerPoint for executive presentations', 'Basic data analysis', 'LinkedIn profile optimisation', 'Fundamentals of finance, marketing, and operations', 'Problem-solving frameworks', 'Google Workspace productivity tools'],
    edifyProjects: ['Write a comprehensive business strategy report for any Indian company', 'Build a cross-functional business improvement proposal', 'Create a SWOT + Porter\'s Five Forces analysis for an industry', 'Design a business dashboard covering key metrics across departments', 'Prepare a stakeholder communication plan for a company initiative', 'Conduct a market feasibility study for a new product'],
    edifyInternships: ['Management Trainee Intern', 'Business Development Intern', 'Strategy Intern', 'Consulting Intern', 'Operations/HR/Finance rotation Intern', 'Apply via: LinkedIn']
  },
  'assam-don-bosco-university-online||BBA': {
    sem1: 'Management Concepts & Practices | Fundamentals of Financial Accounting | Business Economics | Communicative English | Entrepreneurship Principles & Practices | Understanding India | Environmental Studies',
    sem2: 'Ethics, Values & CSR | Marketing Research | Indian Economy | Basics of Quantitative Techniques | Organizational Behaviour | Computer Fundamentals | Service-Learning Project',
    sem3: 'Principles of Marketing | Fundamentals of HRM | Introduction to Financial Management | Emotional Intelligence | Managerial Communication | Minor Internship',
    sem4: 'Personal Financial Planning | Consumer Behaviour | Business Mathematics & Statistics for Decision Making | Elective I | English',
    sem56: 'Sem 5: Business Decision Analysis | Corporate Governance & Professional Ethics | Production & Operations Management | Elective II | Internship | Sem 6: Business Policy & Strategic Management | Financi',
    research: 'Marketing Research | Business Mathematics & Statistics for Decision Making',
    capstone: 'Service-Learning Project | Minor Internship | Internship | Minor Project-1',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'bs-abdur-rahman-university-online||MBA': {
    sem1: 'Management Concepts, Managerial Economics,',
    sem2: 'Strategic Management, Human Resources Management,',
    sem3: 'Specialisation Elective I, Specialisation Elective',
    sem4: 'Project Management, Project Work (Dissertation),',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'bharath-university-online||BBA': {
    sem1: 'Language - I, English - I, Principles of',
    sem2: 'Language - II, English - II, Organizational',
    sem3: 'Financial Accounting, Production and Operations',
    sem4: 'Human Resource Management, Business Law, Cost &',
    research: 'Research Methods for Management (Semester 5)',
    capstone: 'Project Work and Viva-Voce (Semester 6)',
    edifySkills: ['MS Office', 'Business communication & professional email writing', 'LinkedIn profile creation', 'Basic data analysis in Excel', 'Presentation design', 'Time management & productivity tools', 'Digital literacy', 'Basic financial literacy'],
    edifyProjects: ['Create a business plan for a small startup idea', 'Build a simple sales tracker in Excel', 'Prepare a SWOT analysis for a company you admire', 'Design a professional LinkedIn profile and connect with 50 industry professional', 'Present a 5-minute business pitch for a hypothetical product', 'Write a market research report on an industry'],
    edifyInternships: ['Business Development Intern', 'Operations Intern', 'Sales Intern', 'Customer Service Intern', 'Admin Intern', 'Management Trainee Intern']
  },
  'bharathidasan-university-online||B.A': {
    research: 'Not Mentioned.',
    capstone: 'Project Work included in final year.',
    edifySkills: ['Academic writing & research skills', 'Content writing & copywriting', 'SEO content writing basics', 'Editing & proofreading', 'Digital publishing platforms', 'Scriptwriting basics', 'IELTS/TOEFL preparation', 'Translation tools'],
    edifyProjects: ['Write 5 long-form articles on literary or contemporary topics', 'Create a literary analysis research paper', 'Start a blog or Substack newsletter on literature/culture', 'Write a short screenplay or stage play', 'Translate a short story from regional language to English', 'Build a portfolio of 10 content writing samples for different industries'],
    edifyInternships: ['Content Writer Intern', 'Editorial Intern', 'Copywriting Intern', 'Academic Writing Intern', 'Translation Intern', 'Publishing Intern']
  },
  'bharati-vidyapeeth-university-online||BBA': {
    sem1: 'Core management foundation subjects (Sem 1–4)',
    sem2: 'Marketing | Finance | HR | Analytics foundation subjects (Sem 1–4)',
    sem3: 'Specialisation introduction (Sem 3–4) | Consumer Behaviour | Services Marketing | Sales & Distribution | HR Planning | Labour Laws | Investment Analysis',
    sem4: 'Deepened specialisation subjects | Business Law | Financial Management | Production & Operations | Research Methods',
    sem56: 'Semester 5: Strategic Management | Summer Internship Report | MOOCs IV & V | Semester 6: Project Management | Major Project Report | Open Electives',
    research: 'Business Research Methods | Marketing Research',
    capstone: 'Summer Internship Report (Sem 5) | Major Project Report (Sem 6) | MOOCs IV–V',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'bits-pilani-work-integrated-online||MBA': {
    sem1: 'Management Principles & Practices, Organizational',
    sem2: 'Marketing Management, Human Resource Management,',
    sem3: 'Business Ethics and Corporate Governance,',
    sem4: 'International Business, Management Information',
    research: 'Business Research Methods, Research Project /',
    edifySkills: ['Google Analytics', 'HubSpot Inbound Marketing', 'Meta Blueprint – Facebook/Instagram Ads', 'Canva for content creation', 'CRM tools', 'Excel for market analysis', 'PowerPoint/Slides for brand decks', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Build a digital marketing campaign for a local SME', 'Create a brand audit report for a FMCG brand', 'Design a social media content calendar for 30 days', 'Conduct a competitor analysis using free tools', 'Write a go-to-market strategy for a hypothetical product launch', 'Run a Google Ads simulation using Google Skillshop'],
    edifyInternships: ['Digital Marketing Intern', 'SEO Analyst Intern', 'Brand Management Intern', 'Market Research Intern', 'Social Media Manager Intern', 'Content Marketing Intern']
  },
  'charusat-university-online||BBA': {
    sem1: 'Communicative English, Principles and Practices of',
    sem2: 'Fundamentals of Economics, Quantitative Techniques,',
    sem3: 'Financial Management, Human Resource Management,',
    sem4: 'Human Values and Professional Ethics, Fundamentals',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'central-university-himachal-pradesh-online||M.A': {
    sem1: 'Microeconomic Theory, Mathematics for Economists,',
    sem2: 'Macroeconomic Theory, Development Economics,',
    sem3: 'Public Economics, Research Methodology for Social',
    sem4: 'Agricultural Economics, Econometrics with',
    research: 'Statistical Methods, Research Methodology for',
    edifySkills: ['Econometrics basics', 'Excel for economic data analysis', 'Data visualisation', 'Research paper writing', 'CMIE Prowess database', 'RBI/MOSPI data interpretation', 'Python basics for economics', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse GDP data of India vs BRICS countries over 10 years', 'Build a price elasticity model for a product', 'Research and present monetary policy impact on inflation in India', 'Conduct a cost-benefit analysis for a government infrastructure project', 'Write a research paper on unemployment trends in India', 'Build an interactive economic data dashboard in Tableau'],
    edifyInternships: ['Economic Research Intern', 'Policy Analysis Intern', 'Data Analyst Intern', 'Think Tank Intern', 'Government Research Intern', 'Apply via: LinkedIn']
  },
  'centurion-university-online||MBA': {
    sem1: 'Quantitative Techniques, Micro Economics,',
    sem2: 'Economic Environment of Business, Indian Society',
    sem3: 'Project Management, Introduction to PLM5 (Platforms',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'chandigarh-university-online||BBA': {
    sem1: 'Microeconomics, Management Principles & Organizational Behaviour, Communication Skills, Introduction to Business Analytics & Computer Programming, Basic to Advanced Excel, Statistical Methods, Data Visualization, Machine Learning for Business, Business Intelligence',
    sem2: 'Basic to Advanced Excel, Statistical Methods, Data Visualization, Machine Learning for Business, Business Intelligence',
    sem56: 'Business Analytics specialization with data-focused electives; offered in collaboration with KPMG',
    research: 'Research Methodology & Dissertation included in final semester; empirical projects throughout',
    capstone: 'Business Analytics Capstone Project (Sem 5-6); Data Analytics lab projects; KPMG-guided case studies',
    edifySkills: ['MS Office', 'Business communication & professional email writing', 'LinkedIn profile creation', 'Basic data analysis in Excel', 'Presentation design', 'Time management & productivity tools', 'Digital literacy', 'Basic financial literacy'],
    edifyProjects: ['Create a business plan for a small startup idea', 'Build a simple sales tracker in Excel', 'Prepare a SWOT analysis for a company you admire', 'Design a professional LinkedIn profile and connect with 50 industry professional', 'Present a 5-minute business pitch for a hypothetical product', 'Write a market research report on an industry'],
    edifyInternships: ['Business Development Intern', 'Operations Intern', 'Sales Intern', 'Customer Service Intern', 'Admin Intern', 'Management Trainee Intern']
  },
  'chhatrapati-shahu-ji-maharaj-university-online||B.Com': {
    sem1: '⚠️ Syllabus not available',
    sem2: '⚠️',
    sem3: '⚠️',
    sem4: '⚠️',
    sem56: '⚠️',
    edifySkills: ['Tally ERP 9 / Tally Prime', 'Advanced Excel', 'GST returns filing basics', 'Income Tax basics', 'MS Word & PowerPoint', 'Business communication & email writing', 'Banking & finance basics', 'QuickBooks or Zoho Books basics'],
    edifyProjects: ['Prepare a set of books of accounts for a small business in Tally', 'File a mock GST return using practice data', 'Analyse a company\'s annual report', 'Build a personal budget tracker and investment planner in Excel', 'Prepare a cost-benefit analysis for a hypothetical business decision', 'Create a comparison of 2 mutual funds using NAV data'],
    edifyInternships: ['Accounts Intern', 'Tax Filing Intern', 'Audit Intern', 'Finance Assistant Intern', 'Banking Operations Intern', 'Apply via: Internshala']
  },
  'chitkara-university-online||B.Com': {
    sem1: 'Financial Accounting | Business Laws | Microeconomics | Cost Accounting | Banking & Insurance | Business Statistics',
    sem2: 'Corporate Accounting | Business Communication | Macroeconomics | Auditing Basics | IT for Commerce | Soft Skills',
    sem3: 'Corporate Accounting | Income Tax Law | Strategic Management | Investment Banking | Financial Institutions & Markets | Forensic Accounting',
    sem4: 'Advanced Corporate Accounting | Indirect Taxes (GST) | Company Law | Financial Services | Portfolio Management | Business Ethics',
    sem56: 'Sem 5: Taxation-II | Auditing & Assurance | Wealth Management | GST & Indirect Taxes | Security Analysis | Sem 6: Advanced Auditing | International Finance | Capstone Project',
    research: 'Business Statistics (Sem 1); Capstone (Sem 6)',
    capstone: 'Capstone Project – Sem 6',
    edifySkills: ['Banking operations basics', 'Insurance products knowledge', 'KYC/AML compliance awareness', 'Excel for financial data', 'NISM certifications', 'Customer service skills', 'Fintech basics', 'IRDAI framework awareness'],
    edifyProjects: ['Compare 5 term insurance plans and present a recommendation report', 'Create a bank account opening checklist and KYC document list', 'Analyse a bank\'s NPA data and present findings', 'Build a mutual fund SIP calculator in Excel', 'Design a simple insurance needs analysis questionnaire', 'Research and compare 3 NBFCs and their products'],
    edifyInternships: ['Banking Operations Intern', 'Insurance Advisor Intern', 'Fintech Intern', 'Customer Service Intern', 'Apply via: Internshala', 'LinkedIn']
  },
  'christ-university-online||B.Com': {
    sem1: 'Fundamentals of Accounting, Financial Accounting',
    sem2: 'Auditing, Financial Management, Corporate Law.',
    sem3: 'Management Accounting, Financial Markets and',
    sem4: 'Income Tax, Corporate Law (Advanced), Indirect',
    research: 'Business Mathematics and Statistics, Financial',
    capstone: 'Internship and Final Corporate Project.',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'dy-patil-university-online||BBA': {
    sem1: 'Principles of Management, Business Communication, Financial Accounting, Business Economics, Quantitative Methods, IT for Business',
    sem2: 'Marketing Management, HRM Fundamentals, Cost Accounting, Business Law, Organizational Behaviour, Business Statistics',
    sem3: 'Aviation Industry Overview, Airport Operations Management, Airline Management, Aviation Safety & Regulations',
    sem4: 'Cargo & Freight Management, Aviation Finance, Customer Service in Aviation, IATA Regulations',
    sem56: 'Airport Retail & Commercial, Aviation Law, Global Aviation Trends, Project | Dissertation',
    research: 'Research Methods (Sem 5) | Project/Dissertation (Sem 6)',
    capstone: 'Project Work / Dissertation (Sem 6)',
    edifySkills: ['MS Office', 'Business communication & professional email writing', 'LinkedIn profile creation', 'Basic data analysis in Excel', 'Presentation design', 'Time management & productivity tools', 'Digital literacy', 'Basic financial literacy'],
    edifyProjects: ['Create a business plan for a small startup idea', 'Build a simple sales tracker in Excel', 'Prepare a SWOT analysis for a company you admire', 'Design a professional LinkedIn profile and connect with 50 industry professional', 'Present a 5-minute business pitch for a hypothetical product', 'Write a market research report on an industry'],
    edifyInternships: ['Business Development Intern', 'Operations Intern', 'Sales Intern', 'Customer Service Intern', 'Admin Intern', 'Management Trainee Intern']
  },
  'datta-meghe-university-online||MBA': {
    sem1: 'Managerial Economics, Financial Accounting &',
    sem2: 'Operation Management, Financial Management, Human',
    sem3: 'Corporate Strategy, Entrepreneurship Management,',
    sem4: 'Project II - Industry Project, DSE - V, DSE - VI',
    research: 'Business Research Methodology',
    capstone: 'Project - I, Project II - Industry Project',
    edifySkills: ['Google Analytics', 'HubSpot Inbound Marketing', 'Meta Blueprint – Facebook/Instagram Ads', 'Canva for content creation', 'CRM tools', 'Excel for market analysis', 'PowerPoint/Slides for brand decks', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Build a digital marketing campaign for a local SME', 'Create a brand audit report for a FMCG brand', 'Design a social media content calendar for 30 days', 'Conduct a competitor analysis using free tools', 'Write a go-to-market strategy for a hypothetical product launch', 'Run a Google Ads simulation using Google Skillshop'],
    edifyInternships: ['Digital Marketing Intern', 'SEO Analyst Intern', 'Brand Management Intern', 'Market Research Intern', 'Social Media Manager Intern', 'Content Marketing Intern']
  },
  'dayalbagh-educational-institute-online||B.A': {
    sem1: '⚠️ Syllabus not available',
    sem2: '⚠️',
    sem3: '⚠️',
    sem4: '⚠️',
    sem56: '⚠️',
    edifySkills: ['Content writing & blog writing', 'Social media management', 'MS Office', 'Communication & public speaking', 'Digital literacy', 'Research skills', 'LinkedIn profile creation', 'Basic data literacy'],
    edifyProjects: ['Start a blog on a topic you\'re passionate about', 'Create a comprehensive report on a social issue in your community', 'Build a curated social media account around a topic', 'Conduct a 10-person interview survey and write a findings report', 'Create a Wikipedia-style article on a regional topic', 'Build a professional LinkedIn presence with 200+ connections'],
    edifyInternships: ['Content Writer Intern', 'Social Media Intern', 'Research Assistant Intern', 'NGO Field Intern', 'Communications Intern', 'PR Intern']
  },
  'dayananda-sagar-university-online||B.Com': {
    sem1: 'Business Accounting, Managerial Economics,',
    sem2: 'Financial Accounting, Business Laws, Business',
    sem3: 'Corporate Accounting, Advanced Financial',
    sem4: 'Income Tax, Auditing, Cost Accounting, Data',
    research: 'Business Mathematics, Business Statistics,',
    capstone: 'Internship (Semester 5), Capstone Project',
    edifySkills: ['Tally ERP 9 / Tally Prime', 'Advanced Excel', 'GST returns filing basics', 'Income Tax basics', 'MS Word & PowerPoint', 'Business communication & email writing', 'Banking & finance basics', 'QuickBooks or Zoho Books basics'],
    edifyProjects: ['Prepare a set of books of accounts for a small business in Tally', 'File a mock GST return using practice data', 'Analyse a company\'s annual report', 'Build a personal budget tracker and investment planner in Excel', 'Prepare a cost-benefit analysis for a hypothetical business decision', 'Create a comparison of 2 mutual funds using NAV data'],
    edifyInternships: ['Accounts Intern', 'Tax Filing Intern', 'Audit Intern', 'Finance Assistant Intern', 'Banking Operations Intern', 'Apply via: Internshala']
  },
  'desh-bhagat-university-online||B.Com': {
    sem1: 'Introduction to Business, Principles of Economics,',
    sem2: 'Corporate Accounting, Business Environment,',
    sem3: 'Cost Accounting, Human Resource Management,',
    sem4: 'Management Accounting, Income Tax Law and Practice,',
    sem56: 'See above',
    research: 'Research Methodology (Sem 5)',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'dr-babasaheb-ambedkar-open-university-online||B.Com': {
    sem1: 'Business Organization, Financial Accounting,',
    sem2: 'Corporate Accounting, Business Law, Company Law,',
    sem3: 'Cost Accounting, Income Tax, Business Mathematics,',
    sem4: 'Auditing, Management Accounting, Financial',
    research: 'Business Statistics.',
    capstone: 'Project Work.',
    edifySkills: ['Banking operations basics', 'Insurance products knowledge', 'KYC/AML compliance awareness', 'Excel for financial data', 'NISM certifications', 'Customer service skills', 'Fintech basics', 'IRDAI framework awareness'],
    edifyProjects: ['Compare 5 term insurance plans and present a recommendation report', 'Create a bank account opening checklist and KYC document list', 'Analyse a bank\'s NPA data and present findings', 'Build a mutual fund SIP calculator in Excel', 'Design a simple insurance needs analysis questionnaire', 'Research and compare 3 NBFCs and their products'],
    edifyInternships: ['Banking Operations Intern', 'Insurance Advisor Intern', 'Fintech Intern', 'Customer Service Intern', 'Apply via: Internshala', 'LinkedIn']
  },
  'dr-babasaheb-ambedkar-open-university-online||M.A': {
    sem1: 'Microeconomics -- I, Macroeconomics -- I,',
    sem2: 'Microeconomics- II, Macroeconomics- II,',
    sem3: 'International Economics, Quantitative Methods in',
    sem4: 'Indian Economy, Theories of Economic Growth and',
    research: 'Research Methodology (MAECON315).',
    capstone: 'Optional Project in Semester 4 (MAECON421).',
    edifySkills: ['Econometrics basics', 'Excel for economic data analysis', 'Data visualisation', 'Research paper writing', 'CMIE Prowess database', 'RBI/MOSPI data interpretation', 'Python basics for economics', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse GDP data of India vs BRICS countries over 10 years', 'Build a price elasticity model for a product', 'Research and present monetary policy impact on inflation in India', 'Conduct a cost-benefit analysis for a government infrastructure project', 'Write a research paper on unemployment trends in India', 'Build an interactive economic data dashboard in Tableau'],
    edifyInternships: ['Economic Research Intern', 'Policy Analysis Intern', 'Data Analyst Intern', 'Think Tank Intern', 'Government Research Intern', 'Apply via: LinkedIn']
  },
  'dr-dy-patil-vidyapeeth-online||MBA': {
    sem1: 'Principles & Practices of Management | Organizational Behaviour | Management Accounting | Managerial Economics | Business Communication | Research Methodology',
    sem2: 'Human Resource Management | Marketing Management | Financial Management | Operations Management | Management Information System | Strategic Management & Business Policy',
    sem3: 'Artificial Intelligence for Business, Machine Learning Fundamentals, Data Science for Managers, AI Strategy & Ethics',
    sem4: 'Deep Learning Applications, NLP for Business, AI in Industry (Healthcare/Finance/Manufacturing), AI Project Management, Capstone',
    research: 'Business Research Methods (Sem 2) | Dissertation/Project in Sem 4 | Industry case studies throughout',
    capstone: 'AI & ML Capstone / Industry Project (Sem 4)',
    edifySkills: ['Python', 'Power BI or Tableau', 'Machine Learning basics', 'Excel advanced', 'Statistics fundamentals', 'Google Analytics', 'Jupyter Notebooks', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Build a customer churn prediction model using Python', 'Create an interactive sales dashboard in Tableau/Power BI', 'Perform exploratory data analysis on a real public dataset', 'Build a recommendation system for an e-commerce store', 'Predict stock prices using Python', 'Create a regression model for house price prediction'],
    edifyInternships: ['Data Analyst Intern', 'Business Analyst Intern', 'BI Analyst Intern', 'ML Engineer Intern', 'Analytics Intern', 'Apply via: LinkedIn']
  },
  'dr-mgr-educational-research-institute-online||MBA': {
    sem1: 'Principles of Management | Managerial Economics | Statistical Methods | Basic Accounting | Business Communication',
    sem2: 'Management Accounting | Optimization Techniques | Marketing Management | Human Resource Management | Computer Applications for Business',
    sem3: 'Research Methodology | Strategic Management | International Business Management | Entrepreneurship Development | Specialisation Electives I–III',
    sem4: 'Business Ethics | Professional Skill Development | Project Work (8 weeks mandatory)',
    sem56: 'N/A (2-year PG)',
    research: 'Research Methodology (Sem 3)',
    capstone: '8-week Project Work (Sem 4)',
    edifySkills: ['Advanced Excel', 'Python basics for finance', 'Bloomberg terminal basics', 'Financial statement analysis', 'NISM/NCFM certifications', 'Tally ERP', 'Power BI for dashboards', 'NSE Academy certifications'],
    edifyProjects: ['Build a 3-statement financial model in Excel', 'Create a stock valuation report using DCF analysis', 'Analyse real annual reports of Reliance / TCS / HDFC Bank', 'Build a personal investment portfolio tracker in Excel', 'Research and present a mutual fund comparison for a hypothetical investor', 'Model a startup funding scenario using Excel'],
    edifyInternships: ['Financial Analyst Intern', 'Investment Research Intern', 'Credit Analyst Intern', 'Risk Analyst Intern', 'Accounts & Finance Intern', 'Equity Research Intern']
  },
  'gla-university-online||MBA': {
    edifySkills: ['NISM Series certifications', 'Credit analysis basics', 'BFSI domain knowledge', 'Financial modelling', 'Python for finance basics', 'RBI regulations overview', 'Fintech fundamentals', 'Bloomberg concepts'],
    edifyProjects: ['Analyse the credit risk of a hypothetical SME loan application', 'Build a loan EMI calculator and amortisation schedule in Excel', 'Research and compare 5 Indian banking stocks using ratio analysis', 'Create a fintech startup pitch deck', 'Model a bank\'s NPA recovery strategy', 'Design a KYC/AML compliance checklist'],
    edifyInternships: ['Banking Operations Intern', 'Credit Analyst Intern', 'Investment Banking Intern', 'Fintech Intern', 'Relationship Manager Intern', 'Apply via: LinkedIn']
  },
  'gls-university-online||B.Com': {
    sem1: 'Fundamentals of Accounting - I, Language',
    sem2: 'Fundamentals of Accounting - II, Computer',
    sem3: 'Cost Accounting - I, Direct and Indirect Taxation -',
    sem4: 'Cost Accounting - II, Direct and Indirect',
    sem56: 'Detailed focus on financial reporting and',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'galgotias-university-online||BBA': {
    sem1: 'Financial Accounting | Principles of Management | Business Environment | Marketing Theory & Practices | Business Statistics | Communicative English | Office Automation Tool',
    sem2: 'Organisational Behaviour | Management & Cost Accounting | Production & Operations Management | IT Tools for Decision Making | Design Thinking | Business Economics | Business Communication 1',
    sem3: 'Financial Management | Business Communication 2 | HRM | Introduction to Business Analytics | Supply Chain Management | E-Business | Environmental Studies',
    sem4: 'Sem 4 Core: Research Methodology | CRM | Business Law | Indian Management Thought | Workshop/Seminar | Spec Sem 4: Investment Analysis & Portfolio Management | Income Tax | Financial Services',
    sem56: 'Sem 5 Core: International Business | Business Ethics & Governance | Summer Internship | Stock Market Analysis | Spec Sem 5: Financial Derivatives | Personal Finance | Merger & Acquisition | Sem 6 Core',
    research: 'Research Methodology (Sem 4); Summer Internship (Sem 5); Industrial Research Project (Sem 6)',
    capstone: 'Industrial Research Project – Sem 6',
    edifySkills: ['Excel basics', 'Tally ERP', 'GST basics', 'Income tax basics', 'Stock market basics', 'Financial statement reading', 'NISM free study materials', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Prepare a personal financial plan', 'Analyse a company\'s annual report', 'Track and chart stock prices of 5 companies over 3 months', 'Prepare a mock GST return using practice data', 'Create a budget plan for a college-level event', 'Build a simple loan repayment calculator in Excel'],
    edifyInternships: ['Accounts Intern', 'Finance Assistant Intern', 'Tax Filing Intern', 'Banking Operations Intern', 'Insurance Intern', 'Apply via: Internshala']
  },
  'ganpat-university-online||BBA': {
    sem1: 'Fundamentals of Management, Foundation of',
    sem2: 'Marketing Management, Financial Statement Analysis,',
    sem3: 'Financial Management, Human Resource Management,',
    sem4: 'E-Commerce, Business Research Methods, Project --',
    sem56: 'International Business Strategy, Multinational',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'gujarat-technological-university-online||MBA': {
    sem1: 'Information Technology for Business, Principles of',
    sem2: 'Financial Management, Human Resource Management,',
    sem3: 'Strategic Management, Global Business Strategy,',
    sem4: 'International Financial Management, International',
    research: 'Business Statistics, Research Methodology',
    capstone: 'Summer Training Project, Dissertation',
    edifySkills: ['EXIM procedures & documentation', 'Foreign exchange basics', 'International trade finance', 'Incoterms 2020', 'WTO agreements overview', 'Cross-cultural communication', 'Tally for international accounting', 'SAP international trade module basics'],
    edifyProjects: ['Research export opportunities for an Indian SME to enter one foreign market', 'Create an import-export documentation package for a hypothetical trade', 'Analyse India\'s FTA with a specific country and its business implications', 'Design a market entry strategy for an Indian brand entering UAE/Singapore', 'Compare Incoterms for 3 different trade scenarios', 'Build an international pricing strategy for a product'],
    edifyInternships: ['Export-Import Intern', 'International Business Development Intern', 'Trade Finance Intern', 'Global Sourcing Intern', 'Apply via: LinkedIn', 'EEPC India']
  },
  'gujarat-university-online||B.A': {
    sem1: 'Prose, Poetry, Indian Writing in English, Reading',
    sem2: 'The English Novel: Background, History and',
    sem3: 'Poetry and Poetic Forms, Comparative Literature,',
    sem4: 'Indian Literature in English Translation, World',
    research: 'Not Mentioned',
    capstone: 'Not Mentioned',
    edifySkills: ['Academic writing & research skills', 'Content writing & copywriting', 'SEO content writing basics', 'Editing & proofreading', 'Digital publishing platforms', 'Scriptwriting basics', 'IELTS/TOEFL preparation', 'Translation tools'],
    edifyProjects: ['Write 5 long-form articles on literary or contemporary topics', 'Create a literary analysis research paper', 'Start a blog or Substack newsletter on literature/culture', 'Write a short screenplay or stage play', 'Translate a short story from regional language to English', 'Build a portfolio of 10 content writing samples for different industries'],
    edifyInternships: ['Content Writer Intern', 'Editorial Intern', 'Copywriting Intern', 'Academic Writing Intern', 'Translation Intern', 'Publishing Intern']
  },
  'guru-ghasidas-vishwavidyalaya-online||B.Com': {
    sem1: 'Financial Accounting, Business Laws, Financial',
    sem2: 'Corporate Accounting, Business Organization and',
    sem3: 'Financial Management, Income-tax Law and Practice,',
    sem4: 'Cost Accounting, Business Mathematics, Human',
    research: 'Business Research Methods',
    capstone: 'Summer Internship (Sem 4), Dissertation / Project',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'guru-kashi-university-online||MCA': {
    edifySkills: ['Core programming', 'Data Structures & Algorithms', 'DBMS & SQL', 'Web technologies basics', 'Git/GitHub', 'Linux command line', 'Object-oriented programming concepts', 'Problem solving'],
    edifyProjects: ['Build a library/inventory management system', 'Create a student grade management system in Java/Python', 'Build a simple REST API for a todo app', 'Design and implement a relational database for a hospital', 'Create a basic Android app', 'Build a simple chatbot using Python'],
    edifyInternships: ['Software Developer Intern', 'Web Developer Intern', 'Java/Python Developer Intern', 'Database Analyst Intern', 'IT Support Intern', 'Apply via: LinkedIn'],
    highlight: 'Industry-relevant curriculum; Focus on software development and application design; Coverage of AI, Machine Learning, Cloud Computing and Cybersecurity; Strong foundation in programming and database management; Practical and research-based learning; ',
    programOverview: 'The online MCA at Guru Kashi University is a UGC DEB approved two-year postgraduate program. The Government of India has formally recognised that online degrees from UGC DEB approved universities carry the same academic and legal standing as regular campus degrees, making this MCA fully valid for private employment, government roles, and higher studies.\n\nIndustry-relevant curriculum. Focus on software development and application design. Coverage of AI, Machine Learning, Cloud Computing and Cybersecurity. Strong foundation in programming and database management.',
  },
  'guru-nanak-dev-university-online||M.Com': {
    sem1: 'Core M.Com subjects',
    sem2: 'Core M.Com subjects',
    sem3: 'Advanced Commerce subjects',
    sem4: 'Electives + Project',
    sem56: 'N/A (2-year PG)',
    edifySkills: ['Advanced Excel', 'Tally ERP advanced', 'GST & Direct Tax', 'IFRS / Ind AS fundamentals', 'Research methodology', 'CMA/CA Foundation parallel study option', 'Power BI for financial dashboards', 'SAP FICO basics'],
    edifyProjects: ['Build a comprehensive financial model for a listed company', 'Research and write a 3,000-word paper on GST compliance challenges', 'Create an investment portfolio analysis comparing equity vs debt returns', 'Conduct statistical analysis of a financial dataset using Excel', 'Prepare a consolidated financial statement for a hypothetical group company', 'Analyse Ind AS vs IFRS differences with case examples'],
    edifyInternships: ['Senior Finance Intern', 'Tax Research Intern', 'Audit Intern', 'Financial Analyst Intern', 'Accounts Manager Intern', 'Apply via: LinkedIn']
  },
  'hindustan-institute-technology-online||MBA': {
    sem1: 'Management Concepts and Corporate Governance,',
    sem2: 'Marketing Management, Human Resources Management,',
    sem3: 'Strategic Management, Project Management,',
    sem4: 'Financial Derivatives, Strategic Financial',
    research: 'Business Research Methods (Semester 2)',
    capstone: 'Internship (Semester 3), Project Work (Semester 4)',
    edifySkills: ['Advanced Excel', 'Python basics for finance', 'Bloomberg terminal basics', 'Financial statement analysis', 'NISM/NCFM certifications', 'Tally ERP', 'Power BI for dashboards', 'NSE Academy certifications'],
    edifyProjects: ['Build a 3-statement financial model in Excel', 'Create a stock valuation report using DCF analysis', 'Analyse real annual reports of Reliance / TCS / HDFC Bank', 'Build a personal investment portfolio tracker in Excel', 'Research and present a mutual fund comparison for a hypothetical investor', 'Model a startup funding scenario using Excel'],
    edifyInternships: ['Financial Analyst Intern', 'Investment Research Intern', 'Credit Analyst Intern', 'Risk Analyst Intern', 'Accounts & Finance Intern', 'Equity Research Intern']
  },
  'hindustan-institute-technology-online||B.Com': {
    sem1: 'Financial Accounting - I, Business Economics,',
    sem2: 'Financial Accounting - II, Marketing Management,',
    sem3: 'Corporate Accounting - I, Business Law, Banking',
    sem4: 'Corporate Accounting - II, Company Law, Indirect',
    sem56: 'See above',
    research: 'Business Statistics, Business Research',
    capstone: 'Project Work (Semester 6)',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'icfai-university-online||MBA': {
    sem1: 'Management and Organization Behavior, Business',
    sem2: 'Economics for Business, Operations Management,',
    sem3: 'Business Policy and Strategy, Financial Management,',
    sem4: 'Management Control Systems, Business Ethics and',
    research: 'Business Analytics (Semester 1), Research',
    capstone: 'Entrepreneurship Practicum OR Research Project',
    edifySkills: ['Google Analytics', 'HubSpot Inbound Marketing', 'Meta Blueprint – Facebook/Instagram Ads', 'Canva for content creation', 'CRM tools', 'Excel for market analysis', 'PowerPoint/Slides for brand decks', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Build a digital marketing campaign for a local SME', 'Create a brand audit report for a FMCG brand', 'Design a social media content calendar for 30 days', 'Conduct a competitor analysis using free tools', 'Write a go-to-market strategy for a hypothetical product launch', 'Run a Google Ads simulation using Google Skillshop'],
    edifyInternships: ['Digital Marketing Intern', 'SEO Analyst Intern', 'Brand Management Intern', 'Market Research Intern', 'Social Media Manager Intern', 'Content Marketing Intern']
  },
  'iift-online||MBA': {
    sem1: 'Microeconomics, Financial Accounting, Quantitative',
    sem2: 'Macroeconomics, Corporate Finance, Human Resource',
    sem3: 'International Marketing Management, International',
    sem4: 'International Financial Management, International',
    sem56: 'Electives include: Digital Strategy,',
    research: 'Business Research Methods, Econometrics, and',
    edifySkills: ['Google Analytics', 'HubSpot Inbound Marketing', 'Meta Blueprint – Facebook/Instagram Ads', 'Canva for content creation', 'CRM tools', 'Excel for market analysis', 'PowerPoint/Slides for brand decks', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Build a digital marketing campaign for a local SME', 'Create a brand audit report for a FMCG brand', 'Design a social media content calendar for 30 days', 'Conduct a competitor analysis using free tools', 'Write a go-to-market strategy for a hypothetical product launch', 'Run a Google Ads simulation using Google Skillshop'],
    edifyInternships: ['Digital Marketing Intern', 'SEO Analyst Intern', 'Brand Management Intern', 'Market Research Intern', 'Social Media Manager Intern', 'Content Marketing Intern']
  },
  'integral-university-online||B.A': {
    sem1: 'Foundation English-I, Ethics and Culture,',
    sem2: 'Foundation English-II, Human Values, Environmental',
    sem3: 'History of Literature/Subject Theory-I, Language',
    sem4: 'History of Literature/Subject Theory-II, Language',
    sem56: 'See above',
    capstone: 'Project/Dissertation (Semester 6)',
    edifySkills: ['Political data analysis', 'Policy writing skills', 'Research methodology', 'Academic writing', 'Media literacy', 'Public speaking & debate', 'Current affairs analysis', 'UPSC-relevant preparation overlap'],
    edifyProjects: ['Write a policy brief on a current governance issue in India', 'Analyse election data from ECI website and present findings', 'Conduct a comparative study of 2 state governments\' performance', 'Research and write a paper on federalism challenges in India', 'Design a public opinion survey on a social issue', 'Analyse parliamentary debates/bills from PRS India portal'],
    edifyInternships: ['Policy Research Intern', 'Political Analyst Intern', 'NGO Intern', 'Legislative Research Intern', 'Think Tank Intern', 'Apply via: LinkedIn']
  },
  'jain-university-online||BBA': {
    sem1: 'English | HRM & Organizational Behaviour | Financial Accounting | Modern Business Environment | Generative AI for Online Learners | Financial Literacy & Planning',
    sem2: 'Business Foundations with Excel | Financial Markets & Instruments | Business Management | Business Economics | Communicative English | Quantitative Techniques for Business',
    sem3: 'Python Foundations | Marketing Management | Business Ethics & Negotiation Skills | Data Visualization | Research Methodology | Environmental Science',
    sem4: 'Entrepreneurship | Operations Management | Predictive Analytics using Machine Learning | Text Mining | Digital Business Management | International Business',
    sem56: 'Sem 5: Indian Constitution | Cost & Management Accounting | Data Mining | Time Series Forecasting | Digital Marketing & E-Commerce | Artificial Intelligence | Sem 6: Strategic Management | Business Ta',
    research: 'Research Methodology (Sem 3); Research Project (Sem 6)',
    capstone: 'Research Project – Sem 6',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'jss-university-online||BBA': {
    sem1: 'Part I English I, Part II English I, Financial',
    sem2: 'Part I English II, Part II English II, Financial',
    sem3: 'Part I English III, Part II English III, Management',
    sem4: 'Principles of Management, Business Data Processing,',
    edifySkills: ['MS Office', 'Business communication & professional email writing', 'LinkedIn profile creation', 'Basic data analysis in Excel', 'Presentation design', 'Time management & productivity tools', 'Digital literacy', 'Basic financial literacy'],
    edifyProjects: ['Create a business plan for a small startup idea', 'Build a simple sales tracker in Excel', 'Prepare a SWOT analysis for a company you admire', 'Design a professional LinkedIn profile and connect with 50 industry professional', 'Present a 5-minute business pitch for a hypothetical product', 'Write a market research report on an industry'],
    edifyInternships: ['Business Development Intern', 'Operations Intern', 'Sales Intern', 'Customer Service Intern', 'Admin Intern', 'Management Trainee Intern']
  },
  'jagannath-university-online||MBA': {
    sem1: 'Management Concepts & Organizational Behaviour | Managerial Economics | Quantitative Techniques | Financial Reporting, Statements & Analysis | Business Environment | Business Communication',
    sem2: 'Marketing Management | Human Resource Management | Financial Management | Production & Operations Management | Business Research | Management Information System',
    sem3: 'Strategic Management & Governance | Minor Project | Major Elective I | Major Elective II | Major Elective III | Minor Elective I | Minor Elective II',
    sem4: 'Project Management | Major Project | Comprehensive Viva | Major Elective IV | Major Elective V | Minor Elective III',
    research: 'Business Research (Sem 2) | Minor Project (Sem 3)',
    capstone: 'Major Project + Comprehensive Viva (Sem 4)',
    edifySkills: ['Google Analytics', 'HubSpot Inbound Marketing', 'Meta Blueprint – Facebook/Instagram Ads', 'Canva for content creation', 'CRM tools', 'Excel for market analysis', 'PowerPoint/Slides for brand decks', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Build a digital marketing campaign for a local SME', 'Create a brand audit report for a FMCG brand', 'Design a social media content calendar for 30 days', 'Conduct a competitor analysis using free tools', 'Write a go-to-market strategy for a hypothetical product launch', 'Run a Google Ads simulation using Google Skillshop'],
    edifyInternships: ['Digital Marketing Intern', 'SEO Analyst Intern', 'Brand Management Intern', 'Market Research Intern', 'Social Media Manager Intern', 'Content Marketing Intern']
  },
  'jaipur-national-university-online||BBA': {
    sem1: 'Financial Accounting, Managerial Economics,',
    sem2: 'Principles and Practices of Management, Marketing',
    sem3: 'HR Management, Financial Management, Business Law,',
    sem4: 'International Business, Consumer Behavior, Business',
    sem56: 'See above',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'jamia-millia-islamia-online||MBA': {
    sem1: 'Management Concepts and Practices, Quantitative',
    sem2: 'Organizational Behaviour, Marketing Management,',
    sem3: 'Business Law, Entrepreneurship Development,',
    sem4: 'Strategic Management, Corporate Governance and',
    research: 'Research Methodology, Dissertation',
    capstone: 'Summer Training Project, Dissertation',
    edifySkills: ['Advanced Excel', 'Python basics for finance', 'Bloomberg terminal basics', 'Financial statement analysis', 'NISM/NCFM certifications', 'Tally ERP', 'Power BI for dashboards', 'NSE Academy certifications'],
    edifyProjects: ['Build a 3-statement financial model in Excel', 'Create a stock valuation report using DCF analysis', 'Analyse real annual reports of Reliance / TCS / HDFC Bank', 'Build a personal investment portfolio tracker in Excel', 'Research and present a mutual fund comparison for a hypothetical investor', 'Model a startup funding scenario using Excel'],
    edifyInternships: ['Financial Analyst Intern', 'Investment Research Intern', 'Credit Analyst Intern', 'Risk Analyst Intern', 'Accounts & Finance Intern', 'Equity Research Intern']
  },
  'jaypee-university-online||BBA': {
    sem1: 'Management Concepts and Practices | Micro Economics | Financial Accounting | Business Communication | Business Mathematics',
    sem2: 'Organizational Behaviour | Macro Economics | Managerial Accounting | Business Statistics | Marketing Management',
    sem3: 'Human Resource Management | Production and Operations Management | Business Law | Cost Accounting | Computer Applications in Business',
    sem4: 'Financial Management | Management Accounting | Research Methodology | Entrepreneurship Development | Management Information System',
    sem56: 'Semester 5: Strategic Management | Consumer Behaviour | Logistics and Supply Chain Management | Services Marketing | Training and Development | Semester 6: Advertising and Sales Promotion | Retail Man',
    research: 'Research Methodology (Sem 4)',
    capstone: 'Project Work (Sem 6)',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'kiit-university-online||B.Com': {
    sem1: 'Environmental Studies | Financial Accounting | Business Law | Business Statistics | Computer Application & Data Management | Accounting for Everyone',
    sem2: 'Professional Communication | Cost & Management Accounting | Corporate Law | Business Economics | Entrepreneurship Development & Startup Strategies | Entrepreneurship for 21st Century',
    sem3: 'Corporate Accounting | Direct-tax Law & Practice | Financial Management | Management Principles & Application | E-Commerce | Digital Commerce',
    sem4: 'Business Mathematics | GST Laws & Practice | Human Resource Management | Principles of Marketing | Business Research Methodology | Principles & Practice of HRM',
    sem56: 'Sem 5: Auditing & Assurance | Corporate Governance & Professional Ethics | Project | Financial Markets, Institutions & Services | Financial Statement Analysis & Reporting | Economics of Education & He',
    research: 'Business Research Methodology | Dissertation',
    capstone: 'Project (Sem 5) | Dissertation (Sem 6)',
    edifySkills: ['EXIM procedures & DGFT portal', 'International trade finance', 'Incoterms 2020', 'SAP TM basics', 'Foreign exchange and hedging basics', 'WTO and trade agreements overview', 'International taxation basics', 'Cross-cultural communication'],
    edifyProjects: ['Research India\'s export potential in a specific product category', 'Create an EXIM documentation package for a shipment', 'Analyse currency risk and hedging strategy for an import transaction', 'Study a real Indian export company and present its global strategy', 'Research the impact of a specific FTA on Indian exporters', 'Design a foreign market entry plan for an Indian SME'],
    edifyInternships: ['Export-Import Intern', 'International Trade Finance Intern', 'Global Business Development Intern', 'Apply via: LinkedIn', 'Export promotion councils', 'Trading houses']
  },
  'kalasalingam-university-online||MBA': {
    sem1: 'Management Principles, Organizational Behavior,',
    sem2: 'Financial Management, Marketing Management, HR',
    sem3: 'Strategic Management, Business Law, Specialisation',
    sem4: 'Business Ethics & Corporate Governance,',
    research: 'Business Research Methods (Semester 2)',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'karnataka-state-open-university-online||B.A': {
    sem1: 'Language 1 & 2, Indian Constitution and',
    sem2: 'Language 1 & 2, Fundamentals of Computer',
    sem3: 'Optional 1, Optional 2, Optional 3 (selected',
    sem4: 'Optional 1, Optional 2, Optional 3 (selected',
    research: 'Basic Research Skills I & II',
    capstone: 'Field project or practicals (for subjects like',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'karunya-university-online||B.Com': {
    sem1: 'English for Communication, Financial Accounting -',
    sem2: 'Professional English, Financial Accounting - II,',
    sem3: 'Business Law, Advanced Accounting, Income Tax,',
    sem4: 'Corporate Accounting-I, Principles of Auditing,',
    sem56: 'See above',
    research: 'Business Research Methods (Semester 3)',
    capstone: 'Not Mentioned',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'karunya-university-online||MBA': {
    sem1: 'Accounting for Managers, Marketing for Business,',
    sem2: 'Business Research Methods, Quantitative Techniques',
    sem3: 'Legal Aspects of Business, Corporate Strategy,',
    sem4: 'Innovation and Entrepreneurship, Ethics and',
    research: 'Business Research Methods, Predictive Analytics',
    capstone: 'Summer Internship (Semester 3), Major Project',
    edifySkills: ['Python', 'Power BI or Tableau', 'Machine Learning basics', 'Excel advanced', 'Statistics fundamentals', 'Google Analytics', 'Jupyter Notebooks', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Build a customer churn prediction model using Python', 'Create an interactive sales dashboard in Tableau/Power BI', 'Perform exploratory data analysis on a real public dataset', 'Build a recommendation system for an e-commerce store', 'Predict stock prices using Python', 'Create a regression model for house price prediction'],
    edifyInternships: ['Data Analyst Intern', 'Business Analyst Intern', 'BI Analyst Intern', 'ML Engineer Intern', 'Analytics Intern', 'Apply via: LinkedIn']
  },
  'kl-university-online||BBA': {
    sem1: 'Integrated Professional English | Business Mathematics | Business Environment | Business Economics | Perspectives of Management | IT for Business Managers | Ecology & Environment',
    sem2: 'English Proficiency | Introduction to Financial Accounting | Business Statistics | Organizational Behaviour | Management Information Systems | Foreign Language | Design Thinking and Innovation I',
    sem3: 'Business Communication Skills III | Management Accountancy | Marketing Management | Human Resource Management | Business Research Methods | Macro Economics | Design Thinking and Innovation II',
    sem4: 'Cost Accountancy | Production and Operations Management | Business Law | Financial Management | Business Model Generation | Campus to Corporate',
    sem56: 'Semester 5: Business Analytics | Soft Skills | Fundamentals of Digital Marketing | Research Paper Writing | Elective 1 | Elective 2 | Semester 6: Entrepreneurship | Strategic Management | Enterprise R',
    research: 'Business Research Methods (Sem 3) | Research Paper Writing (Sem 5)',
    capstone: 'Research Paper Writing (Sem 5) + Major Project (Sem 6)',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'kurukshetra-university-online||B.Com': {
    sem1: 'Financial Accounting | Business Laws | Business Management | Language Communication',
    sem2: 'Computerized Accounting System | Company Law | Business Statistics | Environmental Studies | Human Value and Ethics',
    sem3: 'Corporate Accounting | Income Tax Law | Principles of Marketing | Personality Development',
    sem4: 'Cost Accounting | GST & Customs Law | Human Resource Management | Community Development',
    sem56: 'Semester 5: Fundamentals of Insurance | Personal Finance | Secretarial Practice | Retailing | Semester 6: Indian Financial System | Indian Economy | Personal Selling',
    research: 'Business Statistics (Sem 2)',
    capstone: 'Community Development (Sem 4)',
    edifySkills: ['Banking operations basics', 'Insurance products knowledge', 'KYC/AML compliance awareness', 'Excel for financial data', 'NISM certifications', 'Customer service skills', 'Fintech basics', 'IRDAI framework awareness'],
    edifyProjects: ['Compare 5 term insurance plans and present a recommendation report', 'Create a bank account opening checklist and KYC document list', 'Analyse a bank\'s NPA data and present findings', 'Build a mutual fund SIP calculator in Excel', 'Design a simple insurance needs analysis questionnaire', 'Research and compare 3 NBFCs and their products'],
    edifyInternships: ['Banking Operations Intern', 'Insurance Advisor Intern', 'Fintech Intern', 'Customer Service Intern', 'Apply via: Internshala', 'LinkedIn']
  },
  'lovely-professional-university-online||B.A': {
    sem1: 'English Communication, Political Science, Sociology, History, Economics, Environmental Studies, Ability Enhancement compulsory courses, Interdisciplinary electives',
    sem2: 'Economics, Environmental Studies, Ability Enhancement compulsory courses, Interdisciplinary electives',
    sem56: 'No formal specializations — broad humanities & social sciences',
    research: 'Research Methodology & Dissertation included in final semester; empirical projects throughout',
    capstone: 'Term Paper / Dissertation (Sem 6)',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'mats-university-online||B.Com': {
    sem1: '⚠️ Semester subjects not available — verify from matsuniversity.ac.in',
    sem2: '⚠️ Verify from matsuniversity.ac.in',
    sem3: '⚠️ Verify from matsuniversity.ac.in',
    sem4: '⚠️ Verify from matsuniversity.ac.in',
    sem56: '⚠️ Verify from matsuniversity.ac.in',
    edifySkills: ['Tally ERP 9 / Tally Prime', 'Advanced Excel', 'GST returns filing basics', 'Income Tax basics', 'MS Word & PowerPoint', 'Business communication & email writing', 'Banking & finance basics', 'QuickBooks or Zoho Books basics'],
    edifyProjects: ['Prepare a set of books of accounts for a small business in Tally', 'File a mock GST return using practice data', 'Analyse a company\'s annual report', 'Build a personal budget tracker and investment planner in Excel', 'Prepare a cost-benefit analysis for a hypothetical business decision', 'Create a comparison of 2 mutual funds using NAV data'],
    edifyInternships: ['Accounts Intern', 'Tax Filing Intern', 'Audit Intern', 'Finance Assistant Intern', 'Banking Operations Intern', 'Apply via: Internshala']
  },
  'madurai-kamaraj-university-online||B.Com': {
    sem1: 'Financial Accounting | Business Law | Cost Accounting | Business Communication',
    sem2: 'Auditing | Corporate Accounting | Taxation basics | Business Statistics',
    sem3: 'Advanced Accounting | Income Tax | Financial Management',
    sem4: 'GST | Corporate Finance | Business Law advanced',
    sem56: 'Sem 5-6: Advanced Commerce subjects | Project',
    research: 'Business Statistics | Research Project',
    capstone: 'Project (Year 3)',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'maharishi-markandeshwar-university-online||B.Com': {
    sem1: 'Financial Accounting, Principles of Management,',
    sem2: 'Business Statistics, Business Laws, Business Ethics',
    sem3: 'Corporate Accounting, Fundamentals of Investment,',
    sem4: 'Financial Management, Cost Accounting, Auditing and',
    research: 'Research Methodology (Honours track / Semester',
    edifySkills: ['Banking operations basics', 'Insurance products knowledge', 'KYC/AML compliance awareness', 'Excel for financial data', 'NISM certifications', 'Customer service skills', 'Fintech basics', 'IRDAI framework awareness'],
    edifyProjects: ['Compare 5 term insurance plans and present a recommendation report', 'Create a bank account opening checklist and KYC document list', 'Analyse a bank\'s NPA data and present findings', 'Build a mutual fund SIP calculator in Excel', 'Design a simple insurance needs analysis questionnaire', 'Research and compare 3 NBFCs and their products'],
    edifyInternships: ['Banking Operations Intern', 'Insurance Advisor Intern', 'Fintech Intern', 'Customer Service Intern', 'Apply via: Internshala', 'LinkedIn']
  },
  'mahatma-gandhi-university-online||MBA': {
    sem1: 'Management Process and Applications, Managerial',
    sem2: 'Organizational Behaviour, Marketing Management,',
    sem3: 'Strategic Management, Management Information',
    sem4: 'Entrepreneurship and Small Business Management,',
    research: 'Research Methodology, Statistics for Management',
    capstone: 'Summer Internship, Project Report',
    edifySkills: ['Python', 'Power BI or Tableau', 'Machine Learning basics', 'Excel advanced', 'Statistics fundamentals', 'Google Analytics', 'Jupyter Notebooks', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Build a customer churn prediction model using Python', 'Create an interactive sales dashboard in Tableau/Power BI', 'Perform exploratory data analysis on a real public dataset', 'Build a recommendation system for an e-commerce store', 'Predict stock prices using Python', 'Create a regression model for house price prediction'],
    edifyInternships: ['Data Analyst Intern', 'Business Analyst Intern', 'BI Analyst Intern', 'ML Engineer Intern', 'Analytics Intern', 'Apply via: LinkedIn']
  },
  'manav-rachna-online||B.A': {
    sem1: '(Economics) Microeconomics, Mathematics for',
    sem2: '(Economics) Macroeconomics, Statistics for',
    sem3: '(Economics) Intermediate Micro, Development',
    sem4: '(Economics) Intermediate Macro, Econometrics;',
    research: 'Statistics for Economics, Research Methodology.',
    capstone: 'Dissertation (Semester 6).',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'mangalayatan-university-online||B.A': {
    sem1: '• Communication Skills | • Creative Writing | • Sociology | • Ethics | • Personality Development | • Environmental Studies | • Research Project',
    sem2: 'Discipline-based major subjects | Minor subjects | Communication Skills',
    sem3: 'Humanities + Sociology + Ethics subjects | Research Project',
    sem4: 'Advanced major subjects | Research Project',
    sem56: 'Sem 5-6: Advanced major subjects | Research Project',
    research: 'Research Project (integrated throughout)',
    capstone: 'Research Project – Sem 5 or 6',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'manipal-academy-higher-education-online||B.Com': {
    sem1: 'Financial Accounting | Business Mathematics | Business Communication | Principles of Management | Micro Economics | Legal Framework of Business',
    sem2: 'Advanced Financial Accounting | Cost Accounting | Business Law | Taxation (Direct) | Macro Economics | Statistics',
    sem3: 'Advanced Cost Accounting | GST & Indirect Taxation | Auditing & Assurance | Management Accounting | Corporate Finance | Elective',
    sem4: 'Corporate Accounting | Investment Analysis | Strategic Management | Financial Reporting & Analysis | International Accounting Standards | Elective',
    sem56: 'Sem 5-6: Advanced Finance/Accounting Electives | ACCA Exemption modules preparation | Industry project | Coursera certification',
    research: 'Business Research Methods (included in core curriculum) | Dissertation Research for PG programs',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'manipal-university-jaipur-online||B.Com': {
    sem1: 'Financial Accounting, Business Economics, Business Mathematics & Statistics, Business Communication, Principles of Management',
    sem2: 'Corporate Accounting, Business Law, Cost Accounting, Taxation Basics, HRM',
    sem3: 'Advanced Accounting, Income Tax Law & Practice, Financial Management, Auditing',
    sem4: 'GST & Indirect Taxes, Corporate Law, Business Research Methods, Electives',
    sem56: 'Advanced Taxation, Portfolio Management, Internship/Project, Dissertation',
    research: 'Research Methodology included in final semester; project/dissertation component',
    capstone: 'Project Work / Dissertation (Sem 6)',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'manonmaniam-sundaranar-university-online||B.A': {
    sem1: 'Language - I, English - I, British Literature-I',
    sem2: 'Language - II, English - II, British Literature-II',
    sem3: 'British Literature-III (Victorian to Modern),',
    sem4: 'American Literature, Women\'s Writing in English,',
    sem56: 'See above',
    research: 'Introduction to Linguistics',
    capstone: 'Project Work (Semester 6)',
    edifySkills: ['Academic writing & research skills', 'Content writing & copywriting', 'SEO content writing basics', 'Editing & proofreading', 'Digital publishing platforms', 'Scriptwriting basics', 'IELTS/TOEFL preparation', 'Translation tools'],
    edifyProjects: ['Write 5 long-form articles on literary or contemporary topics', 'Create a literary analysis research paper', 'Start a blog or Substack newsletter on literature/culture', 'Write a short screenplay or stage play', 'Translate a short story from regional language to English', 'Build a portfolio of 10 content writing samples for different industries'],
    edifyInternships: ['Content Writer Intern', 'Editorial Intern', 'Copywriting Intern', 'Academic Writing Intern', 'Translation Intern', 'Publishing Intern']
  },
  'marwadi-university-online||B.Com': {
    sem1: 'Not Mentioned (Verbatim subjects missing from',
    sem2: 'Not Mentioned (Verbatim subjects missing from',
    sem3: 'Not Mentioned (Verbatim subjects missing from',
    sem4: 'Not Mentioned (Verbatim subjects missing from',
    research: 'Not Mentioned',
    capstone: 'Final Year Project (Standard requirement)',
    edifySkills: ['Banking operations basics', 'Insurance products knowledge', 'KYC/AML compliance awareness', 'Excel for financial data', 'NISM certifications', 'Customer service skills', 'Fintech basics', 'IRDAI framework awareness'],
    edifyProjects: ['Compare 5 term insurance plans and present a recommendation report', 'Create a bank account opening checklist and KYC document list', 'Analyse a bank\'s NPA data and present findings', 'Build a mutual fund SIP calculator in Excel', 'Design a simple insurance needs analysis questionnaire', 'Research and compare 3 NBFCs and their products'],
    edifyInternships: ['Banking Operations Intern', 'Insurance Advisor Intern', 'Fintech Intern', 'Customer Service Intern', 'Apply via: Internshala', 'LinkedIn']
  },
  'mizoram-university-online||M.A': {
    sem1: 'Sociological, Psychological, and Philosophical',
    sem2: 'Higher Education, Psychological Tests and',
    sem3: 'Research Methodology and Statistics in Education,',
    sem4: 'Comparative Education OR Education for Exceptional',
    research: 'Research Methodology and Statistics in',
    capstone: 'Field Project/Internship (Sem 1-4),',
    edifySkills: ['Curriculum design basics', 'Learning Management Systems', 'Ed-tech tools', 'Educational psychology application', 'Content creation for online learning', 'Microsoft Teams/Zoom for virtual teaching', 'Research methodology', 'Assessment design'],
    edifyProjects: ['Design a complete 4-week online course curriculum for any subject', 'Create 5 assessment rubrics using Bloom\'s Taxonomy', 'Build a Google Classroom demo for a subject', 'Record and edit a 10-minute educational video', 'Write a research proposal on a current educational challenge in India', 'Design an inclusive classroom plan for differently-abled students'],
    edifyInternships: ['Teaching Intern', 'Ed-Tech Content Intern', 'Curriculum Design Intern', 'Educational Research Intern', 'School Administration Intern', 'Apply via: Internshala']
  },
  'nmims-online||B.Com': {
    sem1: 'Financial Accounting | Business Mathematics | Business Communication | Micro Economics | IT Fundamentals | Environmental Studies',
    sem2: 'Cost Accounting | Business Law | Business Statistics | Macro Economics | Taxation Basics (Income Tax)',
    sem3: 'Business & Allied Law | Banking & Insurance | Financial Management | Advanced Financial Accounting | Audit-I | International Business & Export Import Management',
    sem4: 'Corporate & IT Law | Environment & Disaster Management | Fundamentals of Taxation | Research Methodology | Audit-II | Management Accounting',
    sem56: 'Sem 5: Financial Institutions & Markets | Financial Statement Analysis | Indian Accounting Standards | Investment Products & Analysis | Entrepreneurship Management | Project | Sem 6: Business Ethics &',
    research: 'Research Methodology (Sem 4); Project (Sem 5)',
    capstone: 'Project in Semester 5',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'noida-international-university-online||BBA': {
    sem1: 'Principles of Management | Basic Accounting | Business Economics | Business Communication | Business Mathematics | Information Technology',
    sem2: 'Organizational Behaviour | Marketing Management | Financial Accounting | Business Statistics | Managerial Economics | Computer Applications',
    sem3: 'HRM | Operations Management | Business Law | Cost Accounting | Management Information Systems',
    sem4: 'Financial Management | Research Methodology | Entrepreneurship Development | Strategic Management',
    sem56: 'Semester 5: Consumer Behaviour | Business Ethics | International Business | Elective I | Elective II | Semester 6: Project Work | Comprehensive Viva | Elective III',
    research: 'Research Methodology (Sem 4)',
    capstone: 'Project Work + Comprehensive Viva (Sem 6)',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'pp-savani-university-online||BBA': {
    sem1: 'Not Mentioned',
    sem2: 'Not Mentioned',
    sem3: 'Not Mentioned',
    sem4: 'Not Mentioned',
    research: 'Not Mentioned',
    capstone: 'Not Mentioned',
    edifySkills: ['MS Office', 'Business communication & professional email writing', 'LinkedIn profile creation', 'Basic data analysis in Excel', 'Presentation design', 'Time management & productivity tools', 'Digital literacy', 'Basic financial literacy'],
    edifyProjects: ['Create a business plan for a small startup idea', 'Build a simple sales tracker in Excel', 'Prepare a SWOT analysis for a company you admire', 'Design a professional LinkedIn profile and connect with 50 industry professional', 'Present a 5-minute business pitch for a hypothetical product', 'Write a market research report on an industry'],
    edifyInternships: ['Business Development Intern', 'Operations Intern', 'Sales Intern', 'Customer Service Intern', 'Admin Intern', 'Management Trainee Intern']
  },
  'parul-university-online||B.A': {
    sem1: 'Subject structure as per source: | • Major subjects (discipline based) | • Minor subjects | • Research Methodology | • Communication Skills | • Internship | • Project |  | (Sem-wise distribution available at paruluniversity.online — source document provides structure not semester',
    sem2: 'Major subjects (discipline based) | Minor subjects',
    sem3: 'Major subjects (discipline based) | Research Methodology | Minor subjects',
    sem4: 'Major subjects (discipline based) | Minor subjects | Research Methodology',
    sem56: 'Semester 5: Advanced Major subjects | Minor subjects |  | Semester 6: Internship | Project',
    research: 'Research Methodology | Project (Sem 6)',
    capstone: 'Project – Semester 6 + Internship',
    edifySkills: ['Academic writing & research skills', 'Content writing & copywriting', 'SEO content writing basics', 'Editing & proofreading', 'Digital publishing platforms', 'Scriptwriting basics', 'IELTS/TOEFL preparation', 'Translation tools'],
    edifyProjects: ['Write 5 long-form articles on literary or contemporary topics', 'Create a literary analysis research paper', 'Start a blog or Substack newsletter on literature/culture', 'Write a short screenplay or stage play', 'Translate a short story from regional language to English', 'Build a portfolio of 10 content writing samples for different industries'],
    edifyInternships: ['Content Writer Intern', 'Editorial Intern', 'Copywriting Intern', 'Academic Writing Intern', 'Translation Intern', 'Publishing Intern']
  },
  'sastra-university-online||MBA': {
    sem1: 'Foundations of Management & Organisational Behaviour | Economics for Decision Making | Accounting for Managers | Business Research Methods',
    sem2: 'Contemporary Marketing Management | People Management | Financial Management | Operations & Supply Chain Management | Master Class I',
    sem3: 'Strategic Management | Business Analytics and Data Visualisation | Investment Analysis & Portfolio Management | Financial Markets & Mutual Funds | Project Management',
    sem4: 'Corporate Laws and Governance | Behavioural Finance | Managing Banks and Financial Institutions | Personal Finance and Wealth Management | Master Class II | Project Work',
    sem56: 'N/A (2-year PG)',
    research: 'Business Research Methods (Sem 1) | Business Analytics & Data Visualisation (Sem 3)',
    capstone: 'Project Work 8 credits (Sem 4)',
    edifySkills: ['Advanced Excel', 'Python basics for finance', 'Bloomberg terminal basics', 'Financial statement analysis', 'NISM/NCFM certifications', 'Tally ERP', 'Power BI for dashboards', 'NSE Academy certifications'],
    edifyProjects: ['Build a 3-statement financial model in Excel', 'Create a stock valuation report using DCF analysis', 'Analyse real annual reports of Reliance / TCS / HDFC Bank', 'Build a personal investment portfolio tracker in Excel', 'Research and present a mutual fund comparison for a hypothetical investor', 'Model a startup funding scenario using Excel'],
    edifyInternships: ['Financial Analyst Intern', 'Investment Research Intern', 'Credit Analyst Intern', 'Risk Analyst Intern', 'Accounts & Finance Intern', 'Equity Research Intern']
  },
  'sgt-university-online||B.Com': {
    sem1: 'Management Concepts & Organizational Behaviour,',
    sem2: 'Human Resource Management, Principles of Marketing,',
    sem3: 'Business Economics, Corporate Accounting, Business',
    sem4: 'Cost Accounting, Taxation Laws, Financial Markets &',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'srm-institute-science-technology-online||MBA': {
    sem1: 'Management Principles and Practices, Organizational',
    sem2: 'Financial Management, Marketing Management, Human',
    sem3: 'Strategic Management, Business Law, Elective I,',
    sem4: 'Business Ethics and Corporate Governance, Elective',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'srm-university-sikkim-online||BBA': {
    sem1: 'Professional Communication, Principles of',
    sem2: 'Management and Cost Accounting, Organizational',
    sem3: 'Operations Research in Business, Financial',
    sem4: 'Strategic Management, Basics of Consumer',
    sem56: 'Semester 5: Introduction to Research Methods | Project Management | Total Quality Management | Financial Institutions and Markets (or Elective) | Brand Management (or Elective) | Semester 6: Ethics an',
    research: 'Introduction to Research Methods (Semester 5)',
    capstone: 'Project (Semester 6)',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'sathyabama-university-online||BBA': {
    sem1: 'Principles of Management, Business',
    sem2: 'Financial Accounting-II, Marketing Management,',
    sem3: 'Corporate Accounting-I, Business Law, Banking',
    sem4: 'Corporate Accounting-II, Company Law, Indirect'
  },
  'savitribai-phule-pune-university-online||BBA': {
    sem1: '• Principles of Management | • Business Communication | • Business Economics (Micro) | • Business Mathematics | • Business Demography | • Compulsory English',
    sem2: '• Business Organization and System | • Principles of Marketing | • Principles of Finance | • Basics of Cost Accounting | • Business Statistics | • Compulsory English',
    sem3: '• Personality Development | • Business Ethics | • Human Resource Management | • Management Accounting | • Specialization Subject – I | • Specialization Subject – II',
    sem4: '• Business Exposure (Field Study) | • Supply Chain Management | • Entrepreneurship Development | • Business Law | • Specialization Subject – III | • Specialization Subject – IV',
    sem56: 'Semester 5: | • Research Methodology | • Strategic Management | • Management Information System | • Elective – I | • Elective – II | • Project Report |  | Semester 6: | • Business Policy | • Internati',
    research: 'Research Methodology (Sem 5) | Project Report (Sem 5) | Viva-Voce (Sem 6)',
    capstone: 'Project Report (Sem 5) + Viva-Voce (Sem 6)',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'sharda-university-online||B.A': {
    sem1: 'Introduction to Political Theory, Constitutional',
    sem2: 'Political Theory-Concepts and Debates, Political',
    sem3: 'Introduction to Comparative Government and',
    sem4: 'Political Processes and Institutions in Comparative',
    sem56: 'See above',
    research: 'Integrated in Public Policy and Project modules.',
    edifySkills: ['Political data analysis', 'Policy writing skills', 'Research methodology', 'Academic writing', 'Media literacy', 'Public speaking & debate', 'Current affairs analysis', 'UPSC-relevant preparation overlap'],
    edifyProjects: ['Write a policy brief on a current governance issue in India', 'Analyse election data from ECI website and present findings', 'Conduct a comparative study of 2 state governments\' performance', 'Research and write a paper on federalism challenges in India', 'Design a public opinion survey on a social issue', 'Analyse parliamentary debates/bills from PRS India portal'],
    edifyInternships: ['Policy Research Intern', 'Political Analyst Intern', 'NGO Intern', 'Legislative Research Intern', 'Think Tank Intern', 'Apply via: LinkedIn']
  },
  'shiv-nadar-university-online||MBA': {
    sem1: 'Managerial Economics, Financial Accounting &',
    sem2: 'Financial Management, Human Resources Management,',
    sem3: 'Strategic Management, Professional Ethics, Elective',
    sem4: 'Elective 5, Elective 6, Elective 7, Elective 8,',
    edifySkills: ['Google Ads certification', 'Meta Blueprint certification', 'SEO tools', 'Email marketing – Mailchimp basics', 'WordPress basics', 'Canva & Adobe Express', 'Google Analytics 4', 'Content writing & copywriting'],
    edifyProjects: ['Run a live Google Search Ad campaign with ₹500 budget', 'Build a complete SEO strategy for a local business website', 'Create a 30-day Instagram content calendar with copy + visuals', 'Write 5 email marketing sequences for a hypothetical brand', 'Build a WordPress landing page with CTA and lead form', 'Measure ROI of a hypothetical social media campaign'],
    edifyInternships: ['Digital Marketing Intern', 'SEO Intern', 'Social Media Intern', 'Content Creator Intern', 'Google Ads Intern', 'Email Marketing Intern']
  },
  'shobhit-university-online||BBA': {
    sem1: 'Principles of Management, Business Economics,',
    sem2: 'Organizational Behavior, Marketing Management,',
    sem3: 'Human Resource Management, Cost Accounting,',
    sem4: 'Financial Management, Research Methodology,',
    sem56: 'Strategic Management, Sales & Distribution',
    research: 'Research Methodology (Semester 4).',
    capstone: 'Industry Project (Semester 6).',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'shoolini-university-online||B.Com': {
    sem1: 'Financial Accounting, Business Mathematics, Business Economics, Functional English-1, Principles of Management | Open Elective',
    sem2: 'Cost Accounting, Business Statistics, Corporate Law, Organizational Behaviour, Functional English-2 | Open Elective',
    sem3: 'Financial Management, Taxation (Direct Tax), Auditing, Accounting for Managers | Subject Area electives',
    sem4: 'Indirect Tax (GST), Corporate Accounting, Finance electives, Strategic Management | Subject Area electives',
    sem56: 'Advanced Accounting, Investment Analysis, International Finance, Project | Capstone / Dissertation',
    research: 'Research Methods | Capstone Project (Sem 6)',
    capstone: 'Capstone Project / Dissertation (Sem 6)',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'sikkim-manipal-university-online||B.A': {
    sem1: 'English Communication, Political Science, Sociology, History, Foundation of Social Science',
    sem2: 'Economics, Psychology, Geography, Environmental Studies, Interdisciplinary Elective',
    sem3: 'Indian Political System, Sociological Theory, Economic Development, Elective I',
    sem4: 'Public Administration, Cultural Studies, Research Methodology, Elective II',
    sem56: 'Advanced Electives, Dissertation / Project',
    research: 'Research Methodology and Dissertation component included',
    capstone: 'Project / Dissertation (Sem 6)',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'sri-ramachandra-university-online||B.Sc': {
    sem1: 'Foundation of Data Science, Mathematical',
    sem2: 'Data Structures and Algorithms, Database Management',
    sem3: 'Machine Learning Foundations, Optimization',
    sem4: 'Deep Learning, Natural Language Processing,',
    sem56: 'See above',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'subharti-university-online||MBA': {
    sem1: 'Principles & Practice of Management, Managerial',
    sem2: 'Management Accounting, Marketing Management,',
    sem3: 'Business Policy & Strategic Management, Business',
    sem4: 'Total Quality Management, Entrepreneurship',
    edifySkills: ['Google Analytics', 'HubSpot Inbound Marketing', 'Meta Blueprint – Facebook/Instagram Ads', 'Canva for content creation', 'CRM tools', 'Excel for market analysis', 'PowerPoint/Slides for brand decks', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Build a digital marketing campaign for a local SME', 'Create a brand audit report for a FMCG brand', 'Design a social media content calendar for 30 days', 'Conduct a competitor analysis using free tools', 'Write a go-to-market strategy for a hypothetical product launch', 'Run a Google Ads simulation using Google Skillshop'],
    edifyInternships: ['Digital Marketing Intern', 'SEO Analyst Intern', 'Brand Management Intern', 'Market Research Intern', 'Social Media Manager Intern', 'Content Marketing Intern']
  },
  'symbiosis-university-online||B.Sc': {
    sem1: 'Microeconomics, Macroeconomics, Mathematical Economics, Statistics for Economists, Development Economics, Public Finance, International Trade, Econometrics, Indian Economy, Business Economics, Research Methodology',
    sem2: 'Public Finance, International Trade, Econometrics, Indian Economy, Business Economics, Research Methodology',
    sem56: 'Economics honours; interdisciplinary electives from business/social sciences',
    research: 'Research Methodology & Dissertation included in final semester; empirical projects throughout',
    capstone: 'Research Dissertation (Sem 6); empirical projects and data analysis exercises',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'teerthanker-mahaveer-university-online||MBA': {
    edifySkills: ['Google Analytics', 'HubSpot Inbound Marketing', 'Meta Blueprint – Facebook/Instagram Ads', 'Canva for content creation', 'CRM tools', 'Excel for market analysis', 'PowerPoint/Slides for brand decks', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Build a digital marketing campaign for a local SME', 'Create a brand audit report for a FMCG brand', 'Design a social media content calendar for 30 days', 'Conduct a competitor analysis using free tools', 'Write a go-to-market strategy for a hypothetical product launch', 'Run a Google Ads simulation using Google Skillshop'],
    edifyInternships: ['Digital Marketing Intern', 'SEO Analyst Intern', 'Brand Management Intern', 'Market Research Intern', 'Social Media Manager Intern', 'Content Marketing Intern']
  },
  'northcap-university-online||B.Com': {
    sem1: 'Statistics & Research Methodology-I, Principles of',
    sem2: 'Statistics & Research Methodology-II, Financial',
    sem3: 'Income Tax, Marketing Management, Fundamentals of',
    sem4: 'Human Values & Professional Ethics, Computer',
    edifySkills: ['Tally ERP 9 / Tally Prime', 'Advanced Excel', 'GST returns filing basics', 'Income Tax basics', 'MS Word & PowerPoint', 'Business communication & email writing', 'Banking & finance basics', 'QuickBooks or Zoho Books basics'],
    edifyProjects: ['Prepare a set of books of accounts for a small business in Tally', 'File a mock GST return using practice data', 'Analyse a company\'s annual report', 'Build a personal budget tracker and investment planner in Excel', 'Prepare a cost-benefit analysis for a hypothetical business decision', 'Create a comparison of 2 mutual funds using NAV data'],
    edifyInternships: ['Accounts Intern', 'Tax Filing Intern', 'Audit Intern', 'Finance Assistant Intern', 'Banking Operations Intern', 'Apply via: Internshala']
  },
  'upes-online||BBA': {
    sem1: 'Principles of Management | Business Mathematics | Financial Accounting | Business Communication | Introduction to Digital Business',
    sem2: 'Business Economics | Business Law | Digital Marketing Fundamentals | Statistics for Business | E-Commerce Basics',
    sem3: 'Digital Business Strategy | E-Commerce Management | Social Media Marketing | FinTech & Digital Payments | UX & Design Thinking',
    sem4: 'Data Analytics for Business | AI & Automation | Cybersecurity Fundamentals | Platform Business Models | Elective I',
    sem56: 'Sem 5: Digital Transformation | Startup Ecosystem | Digital Content Strategy | Elective II | Project I | Sem 6: Entrepreneurship | Innovation Management | Capstone Project',
    research: 'Data Analytics (Sem 4); Capstone (Sem 6)',
    capstone: 'Capstone Project – Sem 6',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'university-of-lucknow-online||B.Com': {
    sem1: 'Financial Accounting | Commerce core (Sem 1)',
    sem2: 'Commerce core (Sem 2)',
    sem3: 'Commerce advanced (Sem 3)',
    sem4: 'Commerce advanced (Sem 4)',
    sem56: 'Senior commerce subjects (Sem 5-6)',
    edifySkills: ['Tally ERP / Tally Prime', 'Advanced Excel', 'GST & TDS filing', 'Financial statement analysis', 'Direct Tax basics', 'Bank reconciliation', 'NISM study materials', 'ClearTax platform'],
    edifyProjects: ['Prepare a complete P&L and Balance Sheet for a mock company in Tally', 'Build a receivables ageing report in Excel', 'Prepare a bank reconciliation statement', 'Create a 5-year financial projection for a startup', 'Design a GST compliance calendar', 'Analyse and present ratio analysis of a listed company'],
    edifyInternships: ['Accounts Executive Intern', 'Taxation Intern', 'Audit Intern', 'Finance Intern', 'Apply via: Internshala', 'CA firms']
  },
  'university-of-madras-online||MBA': {
    sem1: 'Management Principles and Business Ethics,',
    sem2: 'Marketing Management, Human Resource Management,',
    sem3: 'Strategic Management, Management Information',
    sem4: 'Business Law, Project Work, Elective 4, Elective 5',
    research: 'Business Research Methods (Semester 2)',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'university-of-mysore-online||B.Com': {
    sem1: 'Business Organization and Management, Financial',
    sem2: 'Corporate Accounting - I, Business Law, Banking and',
    sem3: 'Financial Accounting - II, Cost Accounting, Income',
    sem4: 'Corporate Accounting - II, Income Tax - II,',
    research: 'Business Mathematics, Business Statistics.',
    capstone: 'Summer Project (Semester 5), Major Project (Semester',
    edifySkills: ['Banking operations basics', 'Insurance products knowledge', 'KYC/AML compliance awareness', 'Excel for financial data', 'NISM certifications', 'Customer service skills', 'Fintech basics', 'IRDAI framework awareness'],
    edifyProjects: ['Compare 5 term insurance plans and present a recommendation report', 'Create a bank account opening checklist and KYC document list', 'Analyse a bank\'s NPA data and present findings', 'Build a mutual fund SIP calculator in Excel', 'Design a simple insurance needs analysis questionnaire', 'Research and compare 3 NBFCs and their products'],
    edifyInternships: ['Banking Operations Intern', 'Insurance Advisor Intern', 'Fintech Intern', 'Customer Service Intern', 'Apply via: Internshala', 'LinkedIn']
  },
  'uttaranchal-university-online||B.A': {
    sem1: '• Introduction to Sociology | • Managerial Economics | • Basic Psychology | • English I | • Environmental Science | • Writing Skills',
    sem2: '• English II | • Social Stratification | • Macro Economics | • Cognitive Psychology | • Communicative English | • Business Statistics',
    sem3: '• Environmental Waste and Disaster Management | • Social Institutions in Sociology | • Physiological Process & Behaviour | • Marketing Management | • Constitution of India | • Basic Research Skills I',
    sem4: '• International Economics | • Parliament of India | • Social Movement and Social Change in India | • Fundamentals of Human Behaviour | • Contemporary Politics and Issues of Globalization | • Basic Research Skills II',
    sem56: 'SEMESTER 5: | • Money Banking and Financial Institutions | • Social Problems in India | • Development Economics Skills | • Industrial Psychology | • Rural Sociology | • Social Psychology | • Sociology',
    research: 'Basic Research Skills I (Sem 3) | Basic Research Skills II (Sem 4) | Project (Sem 6)',
    capstone: 'Project – Semester 6',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'vit-vellore-online||MBA': {
    sem1: 'Management Theory and Practice, Organizational',
    sem2: 'Marketing Management, Human Resource Management,',
    sem3: 'Business Analytics, Business Law and Ethics, Indian',
    sem4: 'Applied Fintech for Business, Wealth Tech and',
    research: 'Statistics for Managers, Research Methodology',
    capstone: 'Major Project (Semester 4)',
    edifySkills: ['Advanced Excel', 'Python basics for finance', 'Bloomberg terminal basics', 'Financial statement analysis', 'NISM/NCFM certifications', 'Tally ERP', 'Power BI for dashboards', 'NSE Academy certifications'],
    edifyProjects: ['Build a 3-statement financial model in Excel', 'Create a stock valuation report using DCF analysis', 'Analyse real annual reports of Reliance / TCS / HDFC Bank', 'Build a personal investment portfolio tracker in Excel', 'Research and present a mutual fund comparison for a hypothetical investor', 'Model a startup funding scenario using Excel'],
    edifyInternships: ['Financial Analyst Intern', 'Investment Research Intern', 'Credit Analyst Intern', 'Risk Analyst Intern', 'Accounts & Finance Intern', 'Equity Research Intern']
  },
  'vit-university-online||M.Sc': {
    sem1: 'Statistical Methods for Data Science, Programming',
    sem2: 'Machine Learning, Optimization Techniques, Big Data',
    sem3: 'Business Analytics, Business Law and Ethics,',
    sem4: 'Elective 2, Elective 3, Elective 4, Major Project',
    research: 'Research Methodology (Semester 2)',
    capstone: 'Mini Project (Semester 3), Major Project (Semester',
    edifySkills: ['Python', 'R programming', 'Machine Learning & Deep Learning', 'Tableau or Power BI', 'Big Data', 'Statistical modelling', 'Git/GitHub', 'Kaggle competitions'],
    edifyProjects: ['Complete 3 end-to-end Kaggle competitions', 'Build a real-time stock price prediction model', 'Create a NLP model for document classification', 'Build an anomaly detection system for financial fraud', 'Deploy an ML model as a REST API', 'Create a big data pipeline using PySpark'],
    edifyInternships: ['Data Scientist Intern', 'ML Research Intern', 'AI Intern', 'Analytics Engineer Intern', 'BI Developer Intern', 'Apply via: LinkedIn']
  },
  'vels-university-online||BBA': {
    sem1: 'Principles of Management | Business Communication | Financial Accounting | Micro Economics | Business Mathematics',
    sem2: 'Organizational Behaviour | Marketing Management | Macro Economics | Business Statistics | Environmental Science',
    sem3: 'Human Resource Management | Production & Operations Management | Business Law | Cost Accounting | Computer Applications in Business',
    sem4: 'Financial Management | Management Accounting | Research Methodology | Entrepreneurship Development | Management Information System',
    sem56: 'Sem 5: Strategic Management | Consumer Behaviour | Logistics & SCM | Services Marketing | Training & Development | Sem 6: Advertising & Sales Promotion | Retail Management | Digital Marketing | Busine',
    research: 'Research Methodology (Sem 4)',
    capstone: 'Project Work (Sem 6)',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'vtu-online||BBA': {
    sem1: 'Business Accounting, Managerial Economics,',
    sem2: 'Introduction to Digital Marketing, Business',
    sem3: 'Research Methodology, Web Design and Development,',
    sem4: 'Search Engine Optimization (SEO), Content Strategy,',
    research: 'Business Statistics, Research Methodology, Data',
    edifySkills: ['Digital marketing basics', 'Canva for content creation', 'Social media management', 'Google Analytics basics', 'Excel for sales data analysis', 'CRM basics', 'Content writing', 'Email marketing basics'],
    edifyProjects: ['Create a social media marketing plan for a local restaurant/business', 'Design 10 Instagram posts for a brand using Canva', 'Write 5 blog posts for a hypothetical company website', 'Conduct a mini market survey and present insights', 'Run a free Google keyword research for a local business', 'Build a basic email newsletter template in Mailchimp'],
    edifyInternships: ['Social Media Intern', 'Digital Marketing Intern', 'Content Writing Intern', 'Marketing Assistant Intern', 'Field Sales Intern', 'Apply via: Internshala']
  },
  'vivekananda-global-university-online||B.A': {
    sem1: 'English-I, Elective I, Elective II, Elective III',
    sem2: 'English-II, Elective I, Elective II, Elective III',
    sem3: 'Communication Skills, Elective I, Elective II,',
    sem4: 'Foundation of Mathematics, Elective I, Elective II,',
    sem56: 'See above',
    research: 'Not Mentioned',
    edifySkills: ['Excel for economic data analysis', 'R or Python basics for statistics', 'Econometrics fundamentals', 'RBI/MOSPI data interpretation', 'Academic research writing', 'Data visualisation basics', 'UPSC relevant overlap', 'TIP: Learn at least 2–3 of these tools during your program. Free certifications'],
    edifyProjects: ['Analyse India\'s trade data from DGCI&S database', 'Build a price index tracker for essential commodities', 'Write a research paper on a microeconomics or macroeconomics topic', 'Create a data visualisation report using public economic data', 'Model a simple supply-demand scenario with elasticity calculations', 'TIP: Complete at least 2 projects and upload them to GitHub or Behance. Real pro'],
    edifyInternships: ['Economic Research Intern', 'Data Analyst Intern', 'Policy Research Intern', 'Finance Intern', 'Apply via: LinkedIn', 'NCAER']
  },
  'yenepoya-university-online||B.Com': {
    sem1: '• Financial Accounting I | • Business Management | • Business Economics | • English Communication | • Environmental Studies',
    sem2: '• Financial Accounting II | • Business Laws | • Banking and Insurance | • Modern Indian Language | • Principles of Marketing',
    sem3: '• Corporate Accounting I | • Business Statistics | • Income Tax I | • Financial Management | • E-Commerce',
    sem4: '• Corporate Accounting II | • Cost Accounting I | • Income Tax II | • Business Mathematics | • Management Accounting',
    sem56: 'Semester 5: | • Auditing | • Corporate Laws | • Investment Management | • Cost Accounting II | • Financial Markets and Services |  | Semester 6: | • International Finance | • GST and Customs Law | • F',
    research: 'Business Statistics (Sem 3) | Project Work (Sem 6)',
    capstone: 'Project Work – Semester 6',
    edifySkills: ['Banking operations basics', 'Insurance products knowledge', 'KYC/AML compliance awareness', 'Excel for financial data', 'NISM certifications', 'Customer service skills', 'Fintech basics', 'IRDAI framework awareness'],
    edifyProjects: ['Compare 5 term insurance plans and present a recommendation report', 'Create a bank account opening checklist and KYC document list', 'Analyse a bank\'s NPA data and present findings', 'Build a mutual fund SIP calculator in Excel', 'Design a simple insurance needs analysis questionnaire', 'Research and compare 3 NBFCs and their products'],
    edifyInternships: ['Banking Operations Intern', 'Insurance Advisor Intern', 'Fintech Intern', 'Customer Service Intern', 'Apply via: Internshala', 'LinkedIn']
  }
}

export function getUniversitySyllabus(uniId: string, degree: string): UniversitySyllabus | null {
  return UNIVERSITY_SYLLABUS[`${uniId}||${degree}`] || null
}

// ── Master Syllabus from Excel (Semester-wise + Spec variants) ──────────────
export interface SpecSyllabusVariant {
  sem3?: string
  sem4?: string
}

export interface MasterSyllabus extends UniversitySyllabus {
  highlight?: string
  programOverview?: string
  specSyllabus?: Record<string, SpecSyllabusVariant>
}

export const MASTER_SYLLABUS: Record<string, MasterSyllabus> = {
  'amet-university-online||MBA': {
  },
  'arka-jain-university-online||MBA': {
    sem1: 'Human Resource Management | Business Economics | Sustainability and Ethics | Financial Reporting and Corporate Finance | Organizational Behavior and Human Resources Management | Quantitative Techniques for Business Decisions | Generative AI for Online Learners',
    sem2: 'Entrepreneurship | Marketing Management | Operations Research | Business Law and Corporate Governance | Business Analytics and Artificial Intelligence',
    specSyllabus: {
      'Finance': {
        sem3: 'Business Research Methods | Operations Management | Direct and Indirect Taxes | Investment Analysis and Portfolio Management | Banking and Insurance | Fintech – Foundations and Applications | Open Elective Course',
        sem4: 'Strategic Management | Indian Financial System and Financial Markets | Wealth Management | International Finance and Investment Banking | Risk Management and Behavioural Finance | Master Thesis / Project',
      },
      'Human Resource Management': {
        sem3: 'Business Research Methods | Operations Management | Talent Acquisition and Management | Learning and Development | Industrial Relations and Labor Laws | Employee Management and Negotiation Skills | Open Elective Course',
        sem4: 'Strategic Management | International Human Resource Management | Performance Management Systems | Organization Development and Change Management | Employee Compensation and Benefits Management | Master Thesis / Project',
      },
      'Marketing': {
        sem3: 'Business Research Methods | Operations Management | Consumer Behavior and Insights | Integrated Marketing Communications | Omni Channel Marketing | Market Research Tools | Open Elective Course',
        sem4: 'Strategic Management | B2B Marketing | Retail Marketing and Service Management | Digital Marketing and Brand Management | Global Marketing | Master Thesis / Project',
      },
    },
  },
  'alliance-university-online||MBA': {
    sem1: 'Intelligent Economics for Managers | Accounting for Managerial Decisions | Marketing | Theory and Practice | Operations Management | Organizational Behaviour',
    sem2: 'Business Statistics | Applied Business Research Methods | Macroeconomic Environment and Policy | Corporate Finance using AI | Human Resource Management',
    specSyllabus: {
      'Finance': {
        sem3: 'Design Thinking | Security Analysis and Portfolio Management | Multinational Financial Management | AI enabled Fraud detection and Risk Management | Modern Financial Ecosystem | Financial Architecture for New ventures',
        sem4: 'Strategic Management in Digital Era | Dissertation and viva | Revenue Intelligence for fixed income | Mergers | Acquisition and corporate restructuring | Financial analysis and Modelling | AI and Human Biases in Finance',
      },
      'Human Resource Management': {
        sem3: 'Design Thinking | HR Analytics using AI | Strategic Workforce Management | Technology Enabled Learning | Rewards and Performance Analytics | Diversity | Equity and Inclusion metrics',
        sem4: 'Strategic Management in Digital Era | Dissertation and viva | Revenue Intelligence for fixed income | Mergers | Acquisition and corporate restructuring | Financial analysis and Modelling | AI and Human Biases in Finance',
      },
      'Marketing': {
        sem3: 'Design Thinking | Services Marketing and Customer Experience Management | Consumer Behaviour and Neuro Marketing | Digital Marketing and Digital Ecosystem | Marketing Research for start ups | Strategic Sales and Channel Management',
        sem4: 'Strategic Management in Digital Era | Dissertation and viva | Digital Growth Strategy | Future-Ready Retail with AI Tools | Advertising and Integrated Brand Promotion | Brand Equity Intelligence',
      },
      'Operations': {
        sem3: 'Design Thinking | Project Management | Agile Supply Chain Management | Competition in Business Ecosystem | Greener Value chain in Operation Management | Digital transformation for Operations',
        sem4: 'Strategic Management in Digital Era | Dissertation and viva | AI Powered Lean Six Sigma | Business block chain | Strategic Sustainable Operation | Business intelligence for Managers',
      },
      'Business Analytics & AI': {
        sem3: 'Design Thinking | Managerial Decision Analytics | Marketing Analytics and Consumer Intelligence | HR Analytics and Workforce Insights | Financial Data Analytics | Applied Business Intelligence',
        sem4: 'Strategic Management in Digital Era | Dissertation and viva | Predictive Business Modelling | AI for Strategic Decision-Making | Data Visualization for Business | Capstone: Data-Driven Business Transformation',
      },
    },
  },
  'amity-university-online||MBA': {
    sem1: 'Accounting for Managers | Managerial Economics | Marketing Management | Statistics for Management | Professional communication',
    sem2: 'Business Research Methods | Financial Management | Human Resource Management | Legal Aspects of Business | Conflict Resolution and Management',
    specSyllabus: {
      'Business Analytics': {
        sem3: 'Analyzing and Visualizing Data with Power BI | Forecasting Techniques | Introduction to Business Analytics | Minor Project | Professional Ethics | Strategic Management | Supervised Learning Techniques',
        sem4: 'Big Data Analytics | Digital Marketing | Major Project | Management in Action - Social Economic and Ethical Issues | Optimization and Dimension Reduction Techniques',
      },
      'Data Science': {
        sem3: 'Analytics for decision making | Data Engineering | Data Visualization and EDA | Introduction to Data Science | Minor Project | Professional Ethics | Strategic Management',
        sem4: 'Advance Deep Learning | Digital Marketing | Major Project | Management in Action - Social Economic and Ethical Issues | Supervised and Unsupervised Machine Learning',
      },
      'Digital Entrepreneurship': {
        sem3: 'Developing Entrepreneurial Skills | Entrepreneurship - Basics | Idea scouting and its development | Minor Project | Planning and launching of the product | Professional Ethics | Strategic Management',
        sem4: 'Digital Marketing | Financial Aspects in Entrepreneurship | Major Project | Management in Action - Social Economic and Ethical Issues | Successful Marketing',
      },
      'Digital Marketing Management': {
        sem3: 'Digital Customer Analytics | Digital journey with Brand Management | Minor Project | Performance Marketing | Professional Ethics | Social Media and Technology Marketing | Strategic Management',
        sem4: 'Digital Commerce - Reinventing Business Models | Digital Marketing | Major Project | Management in Action - Social Economic and Ethical Issues | Marketing Analytics - Data Tools and Techniques',
      },
      'General Management': {
        sem3: 'Strategic Management | Management of Financial Services | Strategic Human Resource Management | Product and Brand Management | Operations Planning | Scheduling and Control | Professional Ethics | Minor Project',
        sem4: 'Big Data Analytics | Digital Commerce - Reinventing Business Models | Digital Marketing | Management in Action - Social Economic and Ethical Issues | Major Project',
      },
      'Hospital & Healthcare Management': {
        sem3: 'Professional Ethics | Strategic Management | Minor Project | Decision Leadership and Emergency Care Settings | Complex Case Management in Internal Medicine (IM) | Patient Care Management in Critical care context | Strategic Healthcare Leadership',
        sem4: 'Major Project | Management in Action Social Economic and Ethical Issues | Digital Marketing | AI tools and applications | Driving Innovation and Technology in Healthcare | Advanced Hospital Operations and Strategic Management',
      },
      'Human Resource Analytics': {
        sem3: 'Employee Data Visualization | Employee Data | Data Sources and Metrics | Introduction to Human Resource Management | Introduction to Human Resource Technology and Analytics | Minor Project | Professional Ethics | Strategic Management',
        sem4: 'Advanced HR Analytics | Digital Marketing | Industrial Relations and Employee Relations | Major Project | Management in Action - Social Economic and Ethical Issues',
      },
    },
  },
  'amrita-vishwa-vidyapeetham-online||MBA': {
    sem1: 'Fundamentals of Management & Organizational Behaviour | Human Resources and Organizational Development | Marketing and Consumer Behaviour | Elective 1: Foundations of Computer Systems | Soft Skills and Employability Skills',
    sem2: 'Business Finance | Operations and Supply Chain Management | Data-Driven Decision Making | Business Ethics and Strategic Management | Elective 2: Introduction to Machine Learning',
    specSyllabus: {
      'Artificial Intelligence': {
        sem3: 'International Business | Business Analytics and Business Modelling | Elective 3: Artificial Intelligence and its Applications | Elective 4: Data Visualization | Education for Life',
        sem4: 'Environment Sustainability and Governance | Project | Elective 5: Advanced Machine Learning | Elective 6: Natural Language Processing | Elective 7: Deep Learning',
      },
      'Business Analytics': {
        sem3: 'International Business | Business Analytics and Business modelling | Elective 3: Advanced machine learning | Elective 4: Deep Learning Fundamentals | Education for life',
        sem4: 'Environment Sustainability and Governance | Project | Elective 5: Data Visualization and Communications | Elective 6: Data Analytics over Cloud | Elective 7: Generative AI',
      },
      'Environmental, Social, and Governance (ESG)': {
        sem3: 'International Business | Business Analytics and Business Modelling | Elective 3: ESG in Business Sustainability | Elective 4: ESG in Investment | Education for Life',
        sem4: 'Environment Sustainability and Governance | Project | Elective 5: ESG in Key Industries | Elective 6: ESG Analytics | Elective 7: ESG Risk Management & Complianc',
      },
      'Finance': {
        sem3: 'International Business | Business Analytics and Business modelling | Elective 3: Fintech Foundations (Theory) | Elective 4: Financial Modelling | Education for life',
        sem4: 'Environment Sustainability and Governance | Project | Strategic Financial Management | Insurance & Risk Management | Treasury & Bank Managemen',
      },
      'Fintech': {
        sem3: 'International Business | Business Analytics and Business modelling | Elective 3: Robotic Process Automation | Elective 4: Financial Analytics using Python & SQL | Education for life',
        sem4: 'Environment Sustainability and Governance | Project | Elective 5: Artificial Intelligence and Analytics | Elective 6: Blockchain and Applications | Elective 7: Generative AI | Prompt Engineering & AI Tools',
      },
      'International Finance and Accounting (ACCA)': {
        sem3: 'International Business | Business Analytics and Business Modelling | Taxation (UK) | Auditing and Assurance | Education for Life',
        sem4: 'Environment Sustainability and Governance | Project | Financial Management | Corporate and Business Law | Strategic Business Reporting',
      },
      'Marketing': {
        sem3: 'International Business | Business Analytics and Business Modelling | Elective 3: Digital Marketing | Elective 4: Retail Marketing | Education for Life',
        sem4: 'Environment Sustainability and Governance | Project | Elective 5: Data-Driven Marketing | Elective 6: Marketing Research | Elective 7: Customer Relationship Management (CRM)',
      },
      'Operations Management': {
        sem3: 'International Business | Business Analytics and Business Modelling | Elective 3: Business Forecasting | Elective 4: Enterprise Resource Planning (ERP) | Education for Life',
        sem4: 'Environment Sustainability and Governance | Project | Elective 5: Operations Research | Elective 6: Advanced Supply Chain Management | Elective 7: Total Quality Management (TQM)',
      },
    },
  },
  'assam-don-bosco-university-online||MBA': {
    sem1: 'Principles of Management | Managerial Economics | Management Communication | Marketing Management | Business Ethics and CSR | Financial Accounting',
    sem2: 'Financial Management | Quantitative Methods | Entrepreneurship Development | Market Research | Human Resource Management | Organizational Behaviour',
    specSyllabus: {
      'Finance Management': {
        sem3: 'Minor Project | Startup Management | Operations Management | Asset Valuation | Personal Finance and Planning | Corporate Tax Planning | Project Appraisal and Finance',
        sem4: 'Business Policy and Strategic Management | Research Project/Dissertation | Computer Applications in Business | Fixed Income Securities and Derivatives | Micro Finance | Banking and Other Financial Services | Multinational Financial Management',
      },
      'Human Resource Management': {
        sem3: 'Minor Project | Startup Management | Operations Management | Applied Psychology in Personnel Administration | Compensation Management | Training and Development | Team Dynamics and Leadership | Transformational Leadership',
        sem4: 'Business Policy and Strategic Management | Research Project/Dissertation | Computer Applications in Business | Organizational Staffing and HR Analytics | Performance Management | Organizational Change and Development | Strategic Human Resource Management | Cross Cultural Management',
      },
      'Marketing Management': {
        sem3: 'Minor Project | Startup Management | Operations Management | Sales and Distribution Management | Marketing Communication | Service Marketing | Internet Marketing | International Marketing',
        sem4: 'Business Policy and Strategic Management | Research Project/Dissertation | Computer Applications in Business | Consumer Behaviour | Retail Management | Tourism and Hospitality Management | Product and Brand Management | Customer Relationship Management',
      },
    },
  },
  'bharati-vidyapeeth-university-online||MBA': {
  },
  'bits-pilani-work-integrated-online||MBA': {
  },
  'chandigarh-university-online||MBA': {
    sem1: 'Business | Society and Law | Financial Reporting and Analysis | Leadership & Organization Behavior | Managerial Economics | Marketing Management',
    sem2: 'People Management | Consumer Behaviour | Business Research Methods | Financial Management | Operations and Quality Management',
    highlight: 'Triple Global Certification: Harvard Business Publishing (Strategy & Leadership), PwC India (Industry Readiness), and PMI (Project Management); Access to 30,000+ Case Studies;',
    specSyllabus: {
      'Airlines & Airport Management': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Airline and Airport Operations | Strategic Airport Planning and Marketing | Aircraft Maintenance Management | Aviation Safety and Security',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Aviation Legal Environment | Aviation Resource Management',
      },
      'Banking & Insurance': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Merchant Banking & Financial Services | Legal Aspect of Banking | Treasury & Risk Management | Corporate Insurance Management',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Mutual funds and portfolio management | Banking & Insurance Management',
      },
      'Brand Management': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Brand Strategy & Positioning | Research for Customer Insights | Luxury & Retail Brand Management | Digital & Social Media Branding',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | New Product Development | Innovation in Product Branding',
      },
      'Data Science & Artificial Intelligence': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Machine Learning using Python | BIG Data Visualization Basics | SQL For Data Science | Excel for Data Science',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Advanced Business Analytics Using R & Python | Advanced Excel for Data Science',
      },
      'Digital Marketing': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Search Engine Optimization | Content Marketing | Social Media Marketing | Digital Entrepreneurship',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Affiliate Marketing and Google AdSense | Performance Marketing',
      },
      'Disaster Management': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Disasters | Hazards and Extreme Events | Disasters | Vulnerability and Risk | Policy | Institutions | Governance and Disaster Management | Disasters and Development',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Disaster Risk Reduction and Development Planning | Introduction to Public Health and Mental Health in Disasters',
      },
      'Entrepreneurship': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Entrepreneurial Strategies-I | Social Entrepreneurship | Entrepreneurial Strategies-II | Family Business Management',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Innovation and Creativity in Business | Small Business Management',
      },
      'Event Management': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Event Planning | Culture and Entertainment | Event Risk Management | Event Marketing Campaign',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Principles of Event Management | Budgeting and Costing of Events',
      },
      'FinTech': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Data Visualisation For Managers | Block Chain Management | Machine Learning in Fintech | Artificial Intelligence in Fintech',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Entrepreneurship in FinTech | Fintech: Innovation and Transformation in Financial Services',
      },
      'Finance': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Banking and Financial Services Management | Project Finance and Financial Modeling | Tax Planning and Management | International Finance',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Investment Management | Mergers and Acquisitions',
      },
      'General Management': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Corporate Strategy and Policy | Cross-Cultural Management | Corporate Social Responsibility and Sustainability | Corporate Mergers and Acquisitions',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Entrepreneurship and Innovation | Business Analytics for Managers',
      },
      'Hospital Management': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Hospital Planning & Services | Benchmarking in Health Care | E-Skills in Health Care | Human Resource Management in Health Care',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Ethical & Legal Aspects of Health Care | Health Care Marketing',
      },
      'Human Resource Management': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Human Resource Analytics | Organisation Change & Development | Cross Cultural Management | Compensation Management',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Performance Management: Systems and strategies | Methodology of Training and Development',
      },
      'Information Technology': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Business Intelligence | System Analysis and Design | Managing IT-Enabled Services | Knowledge Management',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Business Process Re-Engineering | Database Management',
      },
      'International Business': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Export Import Documentation | International Economics | International Trade | Financing of International Trade',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | International Human Resource Management | International Advertising and Brand Management',
      },
      'International Relations': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Global Business & Trade | International Economics & Finance | Geopolitics & Diplomatic Strategies | International Marketing & Cultural Intelligence',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Global Human Resource & Leadership | Sustainable Development & Global CSR',
      },
      'Logistics & Supply Chain Management': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Logistic management | Quality management and quality techniques | Logistics and supply chain management | Quantitative techniques for management',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Retail store and visual merchandising | Operations management',
      },
      'Marketing': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Marketing Analytics | Advertising and Brand Management | Marketing of Services | Service Marketing and CRM',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Integrated Marketing Communication | Industrial Marketing',
      },
      'Media Management': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Introduction to Mass Media | Industry & Management | Corporate Communication and Reputation Management | Social Media Management | Advertising | PR and Event Management',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Strategic Brand Management and Communications | Digital Advertising and PR Strategies',
      },
      'Operations Management': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Production Planning and Control | Quantitative Techniques & Methods | Operations Management and Strategy | Logistics & Supply Chain Management',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Material Management | Operations Research',
      },
      'Retail Management': {
        sem3: 'Retail Marketing | Buying Merchandising | Retail Sales Techniques and Promotion | International Retailing',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Retail Operations Management | Retail Management Perspective',
      },
      'Travel & Tourism Management': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Tourism Economics | Tourism Marketing | Geography and International Tourism | Tourism Concept and Impact',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Tourism Policy | Planning and Development | Travel Agency Management',
      },
      'Business Analytics': {
        sem3: 'Strategy | Business and Globalization | Digital Marketing | Decision Science | Advanced R Programming | Database Management | Big Data Analytics and Tools | Business Forecasting & Time Series',
        sem4: 'Project Management | Values and Ethics | Academic Research Writing | Machine Learning | Data Warehousing & Visualization',
      },
    },
  },
  'chitkara-university-online||MBA': {
  },
  'dayananda-sagar-university-online||MBA': {
  },
  'dr-dy-patil-vidyapeeth-online||MBA': {
    sem1: 'Principles & Practices of Management | Organisational Behaviour | Management Accounting | Managerial Economics | Business Communication | Research Methodology | Environment Awareness and Disaster Management.',
    sem2: 'Human Resource Management | Marketing Management | Financial Management | Operations Management | Management Information System | Strategic Management & Business Policy | Entrepreneurship Development.',
    highlight: 'Access to edX certifications from top global universities (Harvard, MIT) and WES recognition for international careers.',
    specSyllabus: {
      'AI & ML': {
        sem3: 'Fundamentals of AI | Machine Learning Algorithms | Deep Learning | Natural Language Processing',
        sem4: 'AI Strategy & Governance | Cognitive Computing | Project Work',
      },
      'Agri Business': {
        sem3: 'Agricultural Economics | Rural Marketing | Agri-Supply Chain Mgmt | Farm Management',
        sem4: 'Agri-Finance & Insurance | Food Processing Mgmt | Project Work',
      },
      'Blockchain': {
        sem3: 'Blockchain Fundamentals | Smart Contracts & Ethereum | Hyperledger & Corda | Cryptography',
        sem4: 'Blockchain Applications | Regulatory Framework | Project Work',
      },
      'Business Analytics': {
        sem3: 'Data Visualization | Statistical Modeling | Python for Analytics | Predictive Analytics',
        sem4: 'Optimization Techniques | Big Data Analytics | Project Work',
      },
      'Digital Marketing Management': {
        sem3: 'SEO & SEM | Social Media Marketing | Content & Email Marketing | Mobile Marketing',
        sem4: 'Digital Marketing Analytics | Strategic Digital Marketing | Project Work',
      },
      'FinTech Management': {
        sem3: 'Financial Services & Technology | Blockchain for Finance | Machine Learning in FinTech | AI in FinTech',
        sem4: 'FinTech Regulations & Ethics | Digital Banking & Payments | Project Work',
      },
      'Finance Management': {
        sem3: 'Capital Market | Financial Institutions & Services | Management of Financial Services | Advanced Financial Managemen',
        sem4: 'International Finance | Strategic Financial Management | Project Work',
      },
      'Hospital Administration & Healthcare Management': {
        sem3: 'Hospital Planning & Designing | Hospital Operations Management | Healthcare Analytics | Quality Mgmt in Healthcare',
        sem4: 'Community Health & Epidemiology | Medico-Legal Aspects | Project Work',
      },
      'Human Resource Management': {
        sem3: 'Manpower Planning | Compensation Management | Performance & Potential Management | Labour Laws | Training & Development | Organisational Design | Development & Change | Elective: Digital Marketing or Business English',
        sem4: 'Strategic HR | HR Audit | Elective: Soft Skills or Business Ethics & Corporate Governance | Project Work Report',
      },
      'IT Management': {
        sem3: 'IT Strategy & Management | Database Management Systems | Software Engineering | Enterprise Resource Planning',
        sem4: 'Information Security & Audit | Emerging Trends in IT | Project Work',
      },
      'International Business Management': {
        sem3: 'International Marketing | International Finance | Global Logistics & SCM | Export-Import Procedures',
        sem4: 'International Business Law | Global Strategic Management | Project Work',
      },
      'Logistics & Supply Chain Management': {
        sem3: 'Material Management | Warehouse Management | Global Logistics | Transportation & Distribution',
        sem4: 'SCM Strategy & Design | Green Supply Chain | Project Work',
      },
      'Marketing Management': {
        sem3: 'Consumer Behavior | Marketing Research | Sales & Distribution Management | Product and Brand Management | Retail Management | Marketing of Services | Elective: Digital Marketing or Business English',
        sem4: 'International Marketing | Integrated Marketing Communication | Elective: Soft Skills or Business Ethics & Corporate Governance | Project Work Report',
      },
      'Operations Management': {
        sem3: 'Production Planning & Control | Inventory Management | Logistics & SCM | Total Quality Management',
        sem4: 'Service Operations Management | World Class Manufacturing | Project Work',
      },
      'Project Mgmt': {
        sem3: 'Project Formulation & Appraisal | Project Planning & Scheduling | Project Execution & Control | Project Risk Management',
        sem4: 'Project Quality Management | Agile Project Management | Project Work',
      },
    },
  },
  'dr-mgr-educational-research-institute-online||MBA': {
    sem1: 'Principles of Mgmt & Behavioral Science | Managerial Economics | Basic Accounting | Business Legislation | Business Statistics | E-Commerce | Labs: Computer App | Business Comm.',
    sem2: 'Marketing Mgmt | HRM | Research Methodology | Talent Mgmt | Strategic HRM | Industrial Relations | Labs: Tally | Business Etiquette.',
    specSyllabus: {
      'Finance Management': {
        sem3: 'Strategic Mgmt | Entrepreneurship Development | Management Accounting | Security Analysis & Portfolio Mgmt | Merchant Banking & Financial Services | Banking & Insurance Mgmt | Labs: Spreadsheet | Production/Ops | Skill Development | Summer Project.',
        sem4: 'Digital Marketing | International Business Mgmt | Contemporary Seminar | Field Work & Project Work (8 Weeks)',
      },
      'Hospital & Healthcare Management': {
        sem3: 'Strategic Management | Entrepreneurship Development | Management Accounting | Healthcare Law and Ethics | Public Health System & Outreach | Labs: Spreadsheet | Production/Ops | Skill Development | Summer Project',
        sem4: 'Digital Marketing | International Business Mgmt | Contemporary Seminar | Risk Mgmt and Health Insurance | Field Work & Project Work.',
      },
      'Human Resource Management': {
        sem3: 'Strategic Mgmt | Entrepreneurship Development | Management Accounting | Training & Development | Stress Management | Labs: Spreadsheet | Production/Ops | Skill Development | Summer Project.',
        sem4: 'Digital Marketing | Intl. Business Mgmt | Contemporary Seminar | Field Work & Project Work (8 Weeks).',
      },
      'Information Systems': {
        sem3: 'Strategic Management | Entrepreneurship Development | Management Accounting | Systems Analysis and Design | Software Quality and Project Management | Labs: Spreadsheet | Production/Ops | Skill Development | Summer Project.',
        sem4: 'Digital Marketing | International Business Mgmt | Contemporary Seminar | Artificial Intelligence | Field Work & Project Work.',
      },
      'Marketing Management': {
        sem3: 'Strategic Management | Entrepreneurship Development | Management Accounting | Advertising and Sales Promotion | Services Marketing | Spreadsheet for Managers (Pr) | Production and Operations Research Lab (Pr) | Managerial Skill Development (Pr) | Summer Project – Internship and Viva Voce (Pr)',
        sem4: 'Digital Marketing | International Business Management | Contemporary Seminar | Rural Marketing | Field Work and Project Work',
      },
      'Operations Management': {
        sem3: 'Strategic Management | Entrepreneurship Development | Management Accounting | Purchase and Inventory Management | Lean and Six Sigma Management | Total Quality Management | Spreadsheet for Managers (Pr) | Production and Operations Research Lab (Pr) | Managerial Skill Development (Pr) | Summer Projec',
        sem4: 'Digital Marketing | International Business Management | Contemporary Seminar | Field Work and Project Work',
      },
    },
  },
  'galgotias-university-online||MBA': {
    sem1: 'Marketing Management | Accounting for Managers | Business Statistics | Legal Aspects | Managerial Economics.',
    sem2: 'Business Analytics | Corporate Finance | HRM | Research Method | Operations & SCM | Digital Marketing | Entrepreneurship',
    specSyllabus: {
      'Business Analytics': {
        sem3: 'Business Communication | Strategic Management | Master Thesis (Initial Phase) | AI for Business | Analytics using Python | Marketing Analytics.',
        sem4: 'Business Ethics and CSR | Master Thesis (Final Phase) | Data Visualization | Decision Modelling with Spreadsheets.',
      },
      'Finance Management': {
        sem3: 'Business Communication | Strategic Management | Master Thesis (Initial Phase) | Financial Markets and Services | Investment Analysis | Financial Risk Management.',
        sem4: 'Business Ethics and CSR | Master Thesis (Final Phase) | Managing Banks and Institutions | International Finance.',
      },
      'HR Management': {
        sem3: 'Business Communication | Strategic Management | Master Thesis (Initial Phase) | Competency Mapping | Compensation and Reward Management | Learning and Development',
        sem4: 'Business Ethics and CSR | Master Thesis (Final Phase) | Leadership and Team Building | Talent Management.',
      },
      'Healthcare Management': {
        sem3: 'Business Communication | Strategic Management | Master Thesis (Initial Phase) | Quality Mgmt in Healthcare | Hospital Operations | Medical Terminology.',
        sem4: 'Business Ethics and CSR | Master Thesis (Final Phase) | Patient Care Services | Hospital Hazard & Waste Mgmt.',
      },
      'International Business Management': {
        sem3: 'Business Communication | Strategic Management | Master Thesis (Initial Phase) | Global Outsourcing | Managing Global Business | International Business.',
        sem4: 'Business Ethics and CSR | Master Thesis (Final Phase) | International Finance | Cross Cultural Management.',
      },
      'Marketing Management': {
        sem3: 'Business Communication | Strategic Management | Master Thesis (Initial Phase) | Product and Brand Management | Services Marketing | Digital and Social Media Marketing.',
        sem4: 'Business Ethics and CSR | Master Thesis (Final Phase) | Sales and Distribution Management | International Marketing.',
      },
      'Operations Management': {
        sem3: 'Business Communication | Strategic Management | Master Thesis (Initial Phase) | Sourcing & Materials Mgmt | SCM & Logistics Mgmt | Total Quality Management.',
        sem4: 'Business Ethics and CSR | Master Thesis (Final Phase) | Project Management | Management of Service Operations.',
      },
    },
  },
  'icfai-university-online||MBA': {
  },
  'iift-online||MBA': {
  },
  'integral-university-online||MBA': {
  },
  'jain-university-online||MBA': {
    sem1: 'Business Economics | Sustainability & Ethics | Financial Reporting & Corporate Finance | OB & HRM | Quantitative Techniques-I.',
    sem2: 'Entrepreneurship | Marketing Management | Quantitative Techniques-II | Python for Data Science | Business Analytics & AI.',
    specSyllabus: {
      'Artificial Intelligence': {
        sem3: 'Business Research Methods | Operations Management | Data Visualisation | SQL for Data Science | Statistical Methods for Decision Making',
        sem4: 'Strategic Management | Predictive Analytics for Machine Learning | Text Mining | Web and Social Media Analytics | Master Thesis / Project.',
      },
      'Banking and Finance': {
        sem3: 'Business Research Methods | Operations Management | Banking Domain - Retail and Corporate Business | KYC in Banking | Customer Service and Banking Codes & Standards | Open Elective',
        sem4: 'Management of Financial Services | Financial Management and Valuation | Financial Analysis and Audit Reports | Digital Banking - Fraud & Risk Management | Cross Functional Elective | Master Thesis / Project.',
      },
      'Business Intelligence and Analytics': {
        sem3: 'Business Research Methods | Operations Management | Analytics Language for Managers | DBMS for Managers | Mathematical Foundation for ML | Elective: BI Reporting for Managers.',
        sem4: 'Strategic Management | Introduction to Business Intelligence | Data Warehousing | Data Mining for Intelligence | Elective: Web Data Extraction & Analytics | Master Thesis / Project.',
      },
      'Data Science and Analytics': {
        sem3: 'Business Research Methods | Operations Management | Data Visualisation | SQL for Data Science | Statistical Methods for Decision Making',
        sem4: 'Strategic Management | Predictive Analytics for Machine Learning | Text Mining | Web and Social Media Analytics | Master Thesis / Project.',
      },
      'Digital Marketing and E-Commerce': {
        sem3: 'Business Research Methods | Operations Management | Data Visualisation | Outbound Marketing – Digital Ads & Social Media Marketing | Brand Management for E-Commerce',
        sem4: 'Strategic Management | Marketing Analytics | Digital Product Management | Growth Marketing | Master Thesis / Project.',
      },
      'Entrepreneurship and Venture Creation': {
        sem3: 'Business Research Methods | Operations Management | Launching & Managing an Enterprise | Consumer Behavior & Insights | Social & Corporate Entrepreneurship | Opportunity Sensing & Design Thinking.',
        sem4: 'Strategic Management | Entrepreneurship Finance | Managing Innovation & Technology | Managing Family Business | Project Formulation & Feasibility Analysis | Master Thesis / Project.',
      },
      'Finance': {
        sem3: 'Business Research Methods | Operations Management | Direct and Indirect Taxes | Investment Analysis & Portfolio Management | Banking and Insurance | Fintech.',
        sem4: 'Strategic Management | Indian Financial System & Financial Markets | Wealth Management | International Finance & Investment Banking | Risk Management.',
      },
      'Finance & Business Analytics': {
        sem3: 'Business Research Methods | Operations Management | Investment Analysis & Portfolio Mgmt | Tableau & Power BI | R for Finance | Fintech',
        sem4: 'Strategic Management | SPSS for Data Analytics | Advanced Spreadsheet Modelling | Indian Financial System | Risk Mgmt & Behavioural Finance.',
      },
      'Finance & Marketing': {
        sem3: 'Business Research Methods | Operations Management | Direct and Indirect Taxes | Investment Analysis & Portfolio Mgmt | Consumer Behavior and Insights | Market Research Tools',
        sem4: 'Strategic Management | Indian Financial System | Risk Mgmt & Behavioural Finance | Retail Marketing & Service Mgmt | Digital Marketing & Brand Mgmt.',
      },
      'General Management': {
        sem3: 'Business Research Methods | Operations Management | Talent Acquisition & Mgmt | Consumer Behavior & Insights | Investment Analysis & Portfolio Mgmt | Market Research Tools.',
        sem4: 'Strategic Management | Retail Marketing & Service Mgmt | Organization Development & Change Mgmt | Indian Financial System | Performance Mgmt Systems | Master Thesis / Project.',
      },
      'Human Resource Management': {
        sem3: 'Business Research Methods | Operations Management | Talent Acquisition & Management | Learning & Development | Industrial Relations & Labor Laws | Employee Management & Negotiation Skills.',
        sem4: 'Strategic Management | International HRM | Performance Management Systems | Organization Development & Change Management | Employee Compensation & Benefits.',
      },
      'Human Resource Management & Finance': {
        sem3: 'Business Research Methods | Operations Management | Direct and Indirect Taxes | Investment Analysis & Portfolio Mgmt | Talent Acquisition & Mgmt | Employee Management & Negotiation Skills.',
        sem4: 'Strategic Management | Performance Management Systems | Org Development & Change Mgmt | Indian Financial System | Risk Mgmt & Behavioural Finance.',
      },
      'Information Technology Management': {
        sem3: 'Business Research Methods | Operations Management | Enterprise Resource Planning (ERP) | Database Management System (DBMS) | IT Strategy and Governance | Software Engineering.',
        sem4: 'Strategic Management | Technology Management | IT Project Management | IT Privacy and Security | Digital Transformation and Innovation.',
      },
      'Marketing': {
        sem3: 'Business Research Methods | Operations Management | Consumer Behavior and Insights | Integrated Marketing Communications | Omni Channel Marketing | Market Research Tools.',
        sem4: 'Strategic Management | B2B Marketing | Retail Marketing and Service Management | Digital Marketing and Brand Management | Global Marketing.',
      },
      'Marketing & Human Resource Management': {
        sem3: 'Business Research Methods | Operations Management | Talent Acquisition & Mgmt | Industrial Relations & Labor Laws | Consumer Behavior & Insights | Market Research Tools.',
        sem4: 'Strategic Management | Retail Marketing & Service Mgmt | Digital Marketing & Brand Mgmt | Performance Management Systems | Org Development & Change Mgmt.',
      },
      'Project Management': {
        sem3: 'Business Research Methods | Operations Management | Sub-Systems of Project Management | Project Selection & Portfolio Mgmt | Project Finance & Investment Analysis | Project Planning & Scheduling Tools.',
        sem4: 'trategic Management | Project Monitoring & Information Systems | Project Risk Management | Project Team Building & Evaluation | Total Quality Management.',
      },
      'Supply Chain, Production and Operations Management': {
        sem3: 'Business Research Methods | Operations Management | Logistics and Supply Chain Management | Materials and Inventory Management | Agile Manufacturing & Lean Management | Export & Import Documentation.',
        sem4: 'Strategic Management | Information System for Logistics & SCM | Negotiation Skills for SCM Operations | Sustainable Supply Chain Management | Total Quality Management.',
      },
    },
  },
  'jaypee-university-online||MBA': {
    sem1: 'Economics | Financial Accounting | Marketing Mgmt | Business Stats (Excel) | Operations Mgmt | Corporate Finance | Digital Transformation.',
    sem2: 'Legal Aspects | HRM | Innovation & Entrepreneurship | Management Accounting | Business Research | Business Analytics | Digital Marketing | Capstone Project.',
    specSyllabus: {
      'Finance': {
        sem3: 'Artificial Intelligence in Business | Internship/OJT | Corporate Skill Development-2 | Security Analysis and Portfolio Management | Financial Statement Analysis and Business Valuation | Project Appraisal and Finance | Options | Future and Risk Management | Fixed Income Securities | Behavioral Financ',
        sem4: 'Strategic Management | Major Project | Working Capital Management | Introduction to Financial Analytics.',
      },
      'Human Resource': {
        sem3: 'Artificial Intelligence in Business | Internship/OJT | Corporate Skill Development-2 | Managing Employee Relations & Employment Laws | Workplace Diversity | Equity & Inclusion | Performance & Compensation Management | Learning and Development | Organizational Development and Change | Leadership Skil',
        sem4: 'Strategic Management | Major Project | Competency Management and Assessment Centre | Talent Management.',
      },
      'IT & Business Analytics': {
        sem3: 'Artificial Intelligence in Business | Internship/OJT | Corporate Skill Development-2 | IT Security and Cyber Law | BPR | Business Process Management & ERP | E-Commerce and Electronic Governance | Data Management And Analysis | Predictive Analytics | Blockchain.',
        sem4: 'Strategic Management | Major Project | Big Data & Data Visualisation | Advanced Tools for Data Science.',
      },
      'Marketing': {
        sem3: 'Artificial Intelligence in Business | Internship/OJT | Corporate Skill Development-2 | Product and Brand Management | Integrated Marketing Communication | Sales and Distribution Management | Consumer Behavior | Services Marketing | Digital Marketing.',
        sem4: 'Strategic Management | Major Project | Omnichannel Marketing | AI/ML-powered marketing.',
      },
    },
  },
  'kurukshetra-university-online||MBA': {
    sem1: 'Management Process & OB | Business Statistics | Managerial Economics | Financial Accounting | Business Communication | Indian Economy & Business Environment',
    sem2: 'Marketing Management | Financial Management | HRM | Business Research Methods | Operations Management | Computer Applications in Management.',
    specSyllabus: {
      'Business Analytics': {
        sem3: 'Strategic Management | Optimization Models for Business Decisions | Summer Training / Project Work | Business Analysis using Excel | Econometrics for Business Forecasting | Business Data Mining | Decision Modeling and Data Analysis | Data Analytics using R | Social Media Analytics.',
        sem4: 'Entrepreneurship Development | Business Ethics and Corporate Governance | Comprehensive Viva-Voce | Financial Modelling | Predictive Analysis for Business Decision | Time Series Data Analysis | Applied Multivariate Analysis.',
      },
      'Finance': {
        sem3: 'Strategic Management | Optimization Models for Business Decisions | Summer Training / Project Work | Quantitative Analysis for Financial Decision Making | Foreign Exchange Management | Derivatives Trading in India | Banking and Financial Services | Corporate Restructuring & Control | Security Analys',
        sem4: 'Entrepreneurship Development | Business Ethics and Corporate Governance | Comprehensive Viva-Voc | Financial Engineering | Project Planning and Management | Behavioural Finance | Private Equity and Wealth Management.',
      },
      'Human Resource': {
        sem3: 'Strategic Management | Optimization Models for Business Decisions | Summer Training / Project Work | HRD: Systems & Strategies | Indian Labour Legislation | Management of Industrial Relations | Human Resource Metrics and Analytics | Compensation and Reward Management | Talent Acquisition and Perform',
        sem4: 'Entrepreneurship Development | Business Ethics and Corporate Governance | Comprehensive Viva-Voce | Strategic Human Resource Management | Global Human Resource Management | HR Analytics | Counseling Skills for Managers.',
      },
      'IT Management': {
        sem3: 'Strategic Management | Optimization Models for Business Decisions | Summer Training / Project Work | Business Intelligence and Analytics | Enterprise Resource Planning | Relational Database Management System | E-Customer Relationship Management | System Analysis and Design | Knowledge Management Sys',
        sem4: 'Entrepreneurship Development | Business Ethics and Corporate Governance | Comprehensive Viva-Voce | Information Security and Cyber Laws | E-Commerce | Digital Transformation and Innovation.',
      },
      'Marketing': {
        sem3: 'Strategic Management | Optimization Models for Business Decisions | Summer Training / Project Work | Advertising Management | Marketing Research and Analytics | Sales and Logistics Management | Consumer Behaviour | Strategic Brand Management | Digital and Social Media Marketing.',
        sem4: 'Entrepreneurship Development | Business Ethics and Corporate Governance | Comprehensive Viva-Voce | International Marketing | Business Marketing | Service Marketing | Strategic Marketing | Rural and Agribusiness Marketing.',
      },
    },
  },
  'lovely-professional-university-online||MBA': {
    sem1: 'Managerial Economics | Financial Reporting | Statements and Analysis | Marketing Management | OB & HRM | Quantitative Techniques',
    sem2: 'Corporate Strategy and Entrepreneurship | Corporate Finance | Business Research Methods | Operations Management | Information Systems for Business',
    specSyllabus: {
      'Business Analytics': {
        sem3: 'Strategic Management | Business Ethics & Corp Governance | Seminar on Summer Training | Spreadsheet Modelling | Predictive Analytics | Web & Social Media Analytics.',
        sem4: 'Entrepreneurship Development | Comprehensive Viva-Voce | Financial Analytics | Marketing Analytics | HR Analytics.',
      },
      'Data Science': {
        sem3: 'Strategic Management | Business Ethics | Summer Training | Probability & Statistics | Data Science Toolbox | Advanced Data Visualization.',
        sem4: 'Entrepreneurship Development | Comprehensive Viva | Machine Learning | Big Data Technologies | Statistics for Decision Making.',
      },
      'Finance': {
        sem3: 'Strategic Management | Business Ethics & Corporate Governance | Summer Training / Project | International Financial Management | Security Analysis & Portfolio Management',
        sem4: 'Entrepreneurship Development | Comprehensive Viva-Voce | International Banking & Forex Management | Management of Financial Services.',
      },
      'Hospital & Healthcare Management': {
        sem3: 'Healthcare Delivery Systems and Public Health Administration (EHLT501) | Medical Terminology and Medical Records (EHLT502) | Hospital and Healthcare Information Management (EHLT605) | Corporate Strategy and Entrepreneurship (EMGN571) | Seminar on Summer Training (EMGN583) | Generic Elective I (GE-I)',
        sem4: 'Quality Assurance in Healthcare (EHLT607) | Healthcare Insurance and Managed Care (EHLT615) | Disaster Management in Healthcare (EHLT616) | Capstone Project (EMGN696) | Generic Elective II (GE-II).',
      },
      'Human Resource Management': {
        sem3: 'Training and Development (EHRM511) | Industrial Relation and Labour Laws (EHRM516) | Human Resource Metrics and Analytics (EHRM508) | Corporate Strategy and Entrepreneurship (EMGN571) | Seminar on Summer Training (EMGN583) | Generic Elective I (GE-I).',
        sem4: 'Talent Acquisition & Workforce Planning (EHRM627) | Performance Management Systems (EHRM515) | Compensation Management (EHRM519) | Capstone Project (EMGN696) | Generic Elective II (GE-II).',
      },
      'Information Technology': {
        sem3: 'Database Management Systems (ECAP517) | Managing Information Systems (ECAP399) | Data Analytics with Python (ECAP518) | Corporate Strategy and Entrepreneurship (EMGN571) | Seminar on Summer Training (EMGN583) | Generic Elective I (GE-I).',
        sem4: 'Advance Data Visualization (ECAP782) | Information Security and Privacy (ECAP519) | Planning Enterprise Resources (ECAP520) | Capstone Project (EMGN696) | Generic Elective II (GE-II).',
      },
      'International Business': {
        sem3: 'Export and Import Management (EMGN802) | International Trade Logistics (EOPR512) | International Economics (EECO522) | Corporate Strategy and Entrepreneurship (EMGN571) | Seminar on Summer Training (EMGN583) | Generic Elective I (GE-I).',
        sem4: 'WTO & International Trade (EMGN635) | India Foreign Trade Policy (EMGN697) | International Trade Laws (EMGN589) | Capstone Project (EMGN696) | Generic Elective II (GE-II).',
      },
      'Logistics & Supply Chain Management': {
        sem3: 'Corporate Strategy and Entrepreneurship | Seminar on Summer Training | Generic Elective - I | Logistics and Supply Chain Management | Total Quality Management | Project Management.',
        sem4: 'Strategic Supply Chain Management (EOPR523) | Logistics Management (EOPR524) | Global Supply Chain (EOPR536) | Capstone Project (EMGN696) | Generic Elective II (GE-II).',
      },
      'Marketing': {
        sem3: 'Strategic Management | Business Ethics & Corp Governance | Summer Training | Consumer Behaviour | Digital and Social Media Marketing.',
        sem4: 'Entrepreneurship Development | Comprehensive Viva-Voce | Customer Relationship Management | Sales and Distribution Management.',
      },
      'Operations Management': {
        sem3: 'Strategic Management | Business Ethics & Corp Governance | Summer Training | Logistics & SCM | Total Quality Management | Project Management',
        sem4: 'Entrepreneurship Development | Comprehensive Viva-Voce | Strategic SCM | Inventory Management | Global SCM.',
      },
    },
  },
  'nmims-online||MBA': {
    sem1: 'Business Communication | Financial Accounting | Micro & Macro Economics | Organisational Behaviour | Marketing Management | Quantitative Methods–I',
    sem2: 'Cost & Management Accounting | Human Resource Management | Strategic Management | Business Analytics | Legal Aspect of Business | Operations Management.',
    specSyllabus: {
      'Business Management': {
        sem3: 'Corporate Finance | Research Methodology | Project Pre-work | Information Systems for Management | Consumer Behaviour | Organisational Theory | Structure and Design | Supply Chain Management',
        sem4: 'Cybersecurity | Data Privacy | Security & Governance | Tech Risk & Compliance | Agile Concepts | Digital Product Design | Business Process Transformation | AI Concepts.',
      },
      'Financial Management': {
        sem3: 'Corporate Finance | Research Methodology | Project Pre-work | Capital Market & Portfolio Mgmt | Business Valuation | Financial Derivatives | Strategic Cost Mgmt.',
        sem4: 'Indian Ethos & Ethics | Corporate Sustainability | International Business | Project | Corporate Tax Planning | Investment Banking | International Finance.',
      },
      'Human Resource Management': {
        sem3: 'Corporate Finance | Research Methodology | Project Pre-work | Compensation & Benefits | Industrial Relations & Labour Laws | Manpower Planning | Recruitment & Selection | Organisational Development & Change.',
        sem4: 'Indian Ethos & Ethics | Corporate Sustainability | International Business | Project | Performance Management System | Learning & Development | Emotional Intelligence.',
      },
      'Marketing Management': {
        sem3: 'Corporate Finance | Research Methodology | Project Pre-work | Brand Management | Consumer Behaviour | Integrated Marketing Communications | Sales Management.',
        sem4: 'Indian Ethos & Ethics | Corporate Sustainability | International Business | Project | International Marketing | Services Marketing | Digital Marketing.',
      },
      'Operations and Data Sciences Management': {
        sem3: 'Corporate Finance | Project Management | Project Pre-work | Research Methodology | Strategic Applications of IoT and Big Data | Strategic Sourcing and E-procurement | Supply Chain Management.',
        sem4: 'Corporate Sustainability | EDA and Data Visualization | Indian Ethos & Ethics | International Business | Operations Analytics | Project | Total Quality Management.',
      },
    },
  },
  'noida-international-university-online||MBA': {
    sem1: 'Management Concepts & Organizational Behavior | Managerial Economics | Accounting for Managers | Business Communication | Business Statistics | Marketing Management | Computer Application For Business.',
    sem2: 'Financial Management | International Business Environment | Human Resource Management | Production & Operation Management | Business Research Method | Management Information System | Business Ethics & CSR | SPSS Training.',
    specSyllabus: {
      'Agri Business': {
        sem3: 'Strategic Management | Legal Aspects | Agricultural Marketing Mgmt | Agribusiness Cooperatives | Food Retail Mgmt | Quality Mgmt in Agribusiness | Merger Acquisition Corporate Restructuring & Valuation.',
        sem4: 'Entrepreneurship Development | Digital Marketing & E-Commerce | Agribusiness Environment & Policy | Fertilizer Tech & Mgmt | Seed Production Tech & Mgmt | Microfinance for Agribusiness.',
      },
      'Business Analytics': {
        sem3: 'Strategic Management | Legal Aspects | AI & Machine Learning | Supply Chain Analytics | Marketing Analytics | Machine Learning using "PYTHON"',
        sem4: 'Entrepreneurship Development | Digital Marketing & E-Commerce | HR Analytics | Blockchain Technologies | Database Management System | Financial and Credit Risk Analytics.',
      },
      'Finance': {
        sem3: 'Strategic Management | Legal Aspects | Cost & Management Accounting | Risk Management & Insurance | Project Planning | Financial Markets & Institutions | Fundamentals of Fintech.',
        sem4: 'Entrepreneurship Development | Digital Marketing & E-Commerce | Security Analysis & Portfolio Management | Mergers & Acquisitions | Corporate Taxation | Blockchain | Financial Planning & Tax Management.',
      },
      'Hospital & Health Care Management': {
        sem3: 'Strategic Management | Legal Aspects of Business | Materials Mgmt in Healthcare | Hospital & Health Info Mgmt | Marketing of Healthcare Services | Epidemiology | Legal Aspects of Healthcare | Mgmt of Hospital Services | Hospital Planning',
        sem4: 'Entrepreneurship Development | Digital Marketing | Healthcare Policies | Community Health & Risk Mgmt | BMW Mgmt | Health Insurance & Medical Tourism | Operations Mgmt in Hospitals | Healthcare Consultancy | Quality Mgmt & Accreditation | Disaster Mgmt.',
      },
      'Human Resource Management': {
        sem3: 'Strategic Management | Legal Aspects | Training and Development | Organization Design & Structure | Industrial Relations & Labour Laws | Talent Management | Performance & Reward Management',
        sem4: 'Entrepreneurship Development | Digital Marketing & E-Commerce | HR Analytics | Strategic HRM | Cross Cultural & Global Mgmt | Negotiation & Persuasion | Leadership | Power & Politics.',
      },
      'Information Technology': {
        sem3: 'Strategic Management | Legal Aspects | Managing E-Business | Business Process Re-Engineering | Database Management Systems | AI & ML for Business | Cloud Computing for Business.',
        sem4: 'Entrepreneurship Development | Digital Marketing & E-Commerce | Data Analytics for Business Decisions | Managing IT-Enabled Services | Network Operations & Security | Business Data Warehousing & Data Mining | Knowledge Management.',
      },
      'International Business': {
        sem3: 'Strategic Management | Legal Aspects of Business | International Marketing Mgmt | International Regulatory Env | International Business Laws | International Logistics',
        sem4: 'Entrepreneurship Development | Digital Marketing & E-Commerce | Export Import Documentation | Trading Blocks & Foreign Trade Frame Work | Inter-Cultural Mgmt | International Financial Mgmt | International Financial System.',
      },
      'Marketing Management': {
        sem3: 'Strategic Management | Legal Aspects of Business | Consumer Behaviour | Retail Management | Product and Brand Management | Integrated Marketing Communications | Marketing Research.',
        sem4: 'Entrepreneurship Development | Digital Marketing & E-Commerce | Sales and Distribution Management | Services Marketing | Marketing Analytics | International Marketing | Customer Relationship Management.',
      },
      'Production & Operations Management': {
        sem3: 'Strategic Management | Legal Aspects of Business | Supply Chain & Logistics Mgmt | Project Mgmt | Production Planning & Control | Total Quality Mgmt | Technology | Innovation & New Product',
        sem4: 'Entrepreneurship Development | Digital Marketing & E-Commerce | Service Operations Mgmt | Lean Manufacturing & Six Sigma | Operations Strategy | Supply Chain Analytics | Quant Analysis of Risk.',
      },
      'Retail Management': {
        sem3: 'Strategic Management | Legal Aspects of Business | Retail Sales Techniques & Promotion | International Retailing | E-Tailing | Retail Planning & Operations Management | Retail Supply Chain & Logistics Management.',
        sem4: 'Entrepreneurship Development | Digital Marketing & E-Commerce | Visual Merchandising & Space Planning | Franchising in Retailing | Luxury Retailing | Retailing of Insurance & Financial Services | Rural Retailing.',
      },
    },
  },
  'sharda-university-online||MBA': {
    sem1: 'Management Processes & Organizational Behaviour | Financial Accounting | Reporting and Analysis | Economic Analysis for Business Decision | Quantitative Techniques for Business Decision | Managerial Communication | Governance | Ethics & Sustainability.',
    sem2: 'Marketing Management | Human Resource Management | Business Research Methods | Corporate Finance & Financial Markets | Technology and Analytics for Business | Legal Aspects in Business.',
    specSyllabus: {
      'Data Science and Analytics': {
        sem3: 'Entrepreneurship & Startup Ideation | Production & Ops Management | Python for Data Science | SQL for Data Science | Statistical Methods for Decision Making | Cross Functional Elective.',
        sem4: 'Strategic Management | Data Visualization | Predictive Analytics using Machine Learning | Web and Social Media Analytics | Research Project.',
      },
      'Finance': {
        sem3: 'Entrepreneurship & Startup Ideation | Production & Ops Management | Direct and Indirect Taxes | Financial Derivatives & Risk Management | Fundamentals of Fintech | Cross Functional Elective.',
        sem4: 'Strategic Management | Mergers Acquisitions and Corporate Restructuring | Security Analysis & Portfolio Management | International Financial Management | Research Project',
      },
      'Healthcare and Hospital Administration': {
        sem3: 'Entrepreneurship & Startup Ideation | Production & Ops Management | Quality Management in Healthcare | Hospital Planning and Designing | Material & Equipment Management | Cross Functional Elective.',
        sem4: 'Strategic Management | Healthcare Project Management | Hospital Management Information Systems | Medical Records Management | Research Project.',
      },
      'Human Resource Management': {
        sem3: 'Entrepreneurship & Startup Ideation | Production & Ops Management | Talent Acquisition and Retention | International HRM | Performance and Compensation Management | Cross Functional Elective.',
        sem4: 'Strategic Management | HR Analytics | Industrial Relations and Labour Legislation | Organizational Change and Development | Research Project',
      },
      'Marketing': {
        sem3: 'Entrepreneurship & Startup Ideation | Production & Ops Management | Consumer Behavior | Sales & Distribution Management | International Marketing | Cross Functional Elective.',
        sem4: 'Strategic Management | Service Marketing and CRM | Digital Marketing and Marketing Analytics | Advertising and Brand Management | Research Project.',
      },
      'Strategic Human Resource Management': {
        sem3: 'Advanced HR Systems | Production & Ops Management | Performance & Compensation Management | Talent Acquisition & Retention | HR Accounting & HRIS System | Live Industry Project.',
        sem4: 'Strategic HR Leadership | Strategic Management | Strategic HR Planning & Analytics | International HRM | Leadership and Change Management | Capstone Project.',
      },
    },
  },
  'shoolini-university-online||MBA': {
    sem1: 'Marketing Management | Organizational Behaviour | Financial Accounting | Entrepreneurship | Creativity Decoded | Digital and Technological Solutions | Functional English',
    sem2: 'Human Resource Management | Financial Management | Career and Life Skills | Managerial Economics | Statistics for Management | Functional English - 2 | Presentation & Charts | Fundamentals of Direct Selling',
    specSyllabus: {
      'Agri Business Management': {
        sem3: 'Legal Aspects of Business | Introductory Agriculture & Principles of Agronomy | Agri-Supply Chain Management | Storytelling with Data | Acing Interviews through AI | Intro to Editing.',
        sem4: 'Future Leader\'s Program | Sales Management | Agricultural Marketing & Sales Management | Agricultural Development & Policies | Capstone Project | Critical Thinking.',
      },
      'Banking & Insurance': {
        sem3: 'Legal Aspects of Business | Banking: Types & Services | Insurance: Products & Purposes | Storytelling with Data | Acing Interviews through AI | Intro to Editing.',
        sem4: 'Future Leader\'s Program | Digital Banking & Fintech Innovations | Investment Mgmt & Financial Planning | Capstone Project | Critical Thinking.',
      },
      'Biotechnology Management': {
        sem3: 'Legal Aspects of Business | Introductory Biotech & Microbiology | Industrial & Micro Biotechnology | Storytelling with Data | Acing Interviews through AI | Intro to Editing.',
        sem4: 'Future Leader\'s Program | Sales Management | Regulatory Affairs in Biotech | Entrepreneurship in Life Sciences | Capstone Project.',
      },
      'Data Science & Business Analytics': {
        sem3: 'Legal Aspects | AI for Business | Python for Business | IMC | Content Marketing | Storytelling with Data | Intro to Editing.',
        sem4: 'Future Leader\'s Program | Sales Mgmt | Data Visualization | Digital Marketing for Practitioners | Data Ethics & Privacy | Social Media Strategy | Capstone Project.',
      },
      'Digital Marketing': {
        sem3: 'Legal Aspects of Business | Digital Marketing for Practitioners | IMC | Content Marketing | Storytelling with Data | Acing Interviews through AI | Intro to Editing.',
        sem4: 'Future Leader\'s Program | Sales Management | CRM | Social Media Marketing & Strategy | Brand Management | Capstone Project | Critical Thinking.',
      },
      'Financial Management': {
        sem3: 'Legal Aspects of Business | Micro Finance for Managers | Financial Statements Analysis | Storytelling with Data | Acing Interviews through AI | Intro to Editing',
        sem4: 'Future Leader\'s Program | Sales Management | Portfolio & Wealth Management | Financial Derivatives | Investment Mgmt & Financial Planning | Capstone Project.',
      },
      'Food Technology Management': {
        sem3: 'Legal Aspects of Business | Food Regulations & Policy | Food Science & Technology | Storytelling with Data | Acing Interviews through AI | Intro to Editing',
        sem4: 'Future Leader\'s Program | Sales Management | Food Safety & Quality Mgmt | Food Product Development & Innovation | Entrepreneurship in Life Sciences | Capstone Project.',
      },
      'Human Resource Management': {
        sem3: 'Legal Aspects of Business | Organizational Development & Change Mgmt | Compensation Mgmt | Storytelling with Data | Acing Interviews through AI | Intro to Editing.',
        sem4: 'Future Leader\'s Program | Sales Management | Training & Development | Industrial Relations & Labor Codes | Capstone Project/Internship | Critical Thinking & Problem Solving.',
      },
      'IT Management': {
        sem3: 'Legal Aspects of Business | Database Management System | Python for Business | Storytelling with Data | Acing Interviews through AI | Intro to Editing.',
        sem4: 'Future Leader\'s Program | Data Visualization | Cyber Security | Data Ethics & Privacy | Capstone Project | Critical Thinking & Problem Solving.',
      },
      'Marketing Management': {
        sem3: 'Legal Aspects of Business | Service Marketing | Digital Marketing for Practitioners | Integrated Marketing Communications | Storytelling with Data | Acing Interviews through AI | Introduction to Editing',
        sem4: 'Future Leader\'s Program | Sales Management | CRM | Brand Management | Supply Chain Management | Capstone Project/ Internship | Critical Thinking & Problem Solving.',
      },
      'Operation & Supply Chain Management': {
        sem3: 'Legal Aspects of Business | Supply Chain Management | Logistics & Distribution Strategy | Warehouse Management | Storytelling with Data | Acing Interviews through AI | Intro to Editing.',
        sem4: 'Future Leader\'s Program | Project Management | Lean Operations | Capstone Project | Critical Thinking & Problem Solving.',
      },
      'Pharma & Health Care Management': {
        sem3: 'Legal Aspects of Business | Healthcare Management | Health Economics | Pharma Marketing & Sales | Storytelling with Data | Acing Interviews through AI | Intro to Editing.',
        sem4: 'Future Leader\'s Program | Sales Management | Regulatory Environment in Pharma | Healthcare Ops Management | Entrepreneurship in Life Sciences | Capstone Project.',
      },
      'Real Estate Management': {
        sem3: 'Legal Aspects of Business | Retail Business Models | Service Marketing | Storytelling with Data | Acing Interviews through AI | Introduction to Editing.',
        sem4: 'Future Leader\'s Program | Supply Chain Management | Customer Relationship Management (CRM) | Capstone Project/ Internship | Critical Thinking & Problem Solving.',
      },
      'Retail Management': {
        sem3: 'Legal Aspects of Business | Retail Business Models | Service Marketing | Storytelling with Data | Acing Interviews through AI | Intro to Editing.',
        sem4: 'Future Leader\'s Program | Supply Chain Management | CRM | Capstone Project | Critical Thinking & Problem Solving.',
      },
      'Tourism Management': {
        sem3: 'Legal Aspects of Business | Tourism Products of India | Tourism Marketing | Storytelling with Data | Acing Interviews through AI | Intro to Editing',
        sem4: 'Future Leader\'s Program | Sales Management | Tourism Entrepreneurship | Social Media & Digital Marketing | Capstone Project | Critical Thinking.',
      },
    },
  },
  'symbiosis-university-online||MBA': {
    sem1: 'Business Statistics | Marketing Management | Financial Accounting | Operations Management | Legal Aspects of Business | Human Resource Management | Research Methodology | Microeconomics | Technology in Business | Data Driven Decision Making.',
    sem2: 'Organizational Behaviour | Operations Research | Macroeconomics | Financial Management | R Programming | Project Management | Management Information Systems | Business Communication | Consumer Behaviour and Insights | Digital Marketing | Design Thinking | Innovation Management.',
    specSyllabus: {
      'Agri Operations Management': {
        sem3: 'Project I (4 Credits) | Corporate Governance and Ethics | Crisis Management in Business | Strategic Management | AI and ML for Business Management | Agri Economics | Agri Supply Chain Management | Introduction to Micro Finance | Rural Marketing.',
        sem4: 'Project II (10 Credits) | Entrepreneurship | Global Business Environment | Conflict and Negotiation | Doing Business in India | Business Transformation and Organizational Turnaround | Sales Force and Channel Management | Agriculture Finance | Agri Commodity Markets | Agri Retail Management',
      },
      'Business Analytics': {
        sem3: 'Project I (4 Credits) | Corporate Governance and Ethics | Crisis Management in Business | Strategic Management | AI and ML for Business Management | HR Analytics | Spreadsheet Modelling | Visual Analytics | Social Media Analytics.',
        sem4: 'Project II (10 Credits) | Entrepreneurship | Global Business Environment | Conflict and Negotiation | Doing Business in India | Business Transformation and Organizational Turnaround | Marketing and Sales Analytics | Financial Analytics | Healthcare Analytics | Business Forecasting.',
      },
      'Finance': {
        sem3: 'Project I (4 Credits) | Corporate Governance and Ethics | Crisis Management in Business | Strategic Management | AI and ML for Business Management | Derivative Markets | Mergers and Acquisitions | Corporate Valuation | Security Analysis and Portfolio Management.',
        sem4: 'Project II (10 Credits) | Entrepreneurship | Global Business Environment | Conflict and Negotiation | Doing Business in India | Business Transformation and Organizational Turnaround | Investment Banking | Financial Engineering and Analytics | International Finance | Behavioral Finance.',
      },
      'Hospital and Health Care Management': {
        sem3: 'Project I (4 Credits) | Corporate Governance and Ethics | Crisis Management in Business | Strategic Management | AI and ML for Business Management | Fundamentals of Hospital Planning | Management of Hospital Clinical Services | Management of Hospital Supportive Services | Organisation and Admin of S',
        sem4: 'Project II (10 Credits) | Entrepreneurship | Global Business Environment | Conflict and Negotiation | Doing Business in India | Business Transformation and Organizational Turnaround | MIS for Hospitals | Quality and Accreditation in Healthcare Sector | IT Applications for Healthcare | Community Heal',
      },
      'Human Resource': {
        sem3: 'Project I (4 Credits) | Corporate Governance and Ethics | Crisis Management in Business | Strategic Management | AI and ML for Business Management | Talent Management | Compensation and Reward Management | Learning and Development | HR Analytics.',
        sem4: 'Project II (10 Credits) | Entrepreneurship | Global Business Environment | Conflict and Negotiation | Doing Business in India | Business Transformation and Organizational Turnaround | Organizational Development and Change | Management of Diverse Work Force | Leadership and Capacity Building | Indust',
      },
      'International Business': {
        sem3: 'Project I (4 Credits) | Corporate Governance and Ethics | Crisis Management in Business | Strategic Management | AI and ML for Business Management | Export Import Management | International Marketing | International Finance | Trade Finance and FOREX Management.',
        sem4: 'Project II (10 Credits) | Entrepreneurship | Global Business Environment | Conflict and Negotiation | Doing Business in India | Business Transformation and Organizational Turnaround | International Logistics | Management of International Operations | International Human Resource Management | Perform',
      },
      'Logistics and Supply Chain Management': {
        sem3: 'Project I (4 Credits) | Corporate Governance and Ethics | Crisis Management in Business | Strategic Management | AI and ML for Business Management | Supply Chain Management | Warehouse Management | Supply Chain Strategy | Technology in Supply Chain.',
        sem4: 'Project II (10 Credits) | Entrepreneurship | Global Business Environment | Conflict and Negotiation | Doing Business in India | Business Transformation and Organizational Turnaround | International Logistics | Lean Six Sigma | Supply Chain Modeling and Design | Sustainable Supply Chain.',
      },
      'Marketing': {
        sem3: 'Project I (4 Credits) | Corporate Governance and Ethics | Crisis Management in Business | Strategic Management | AI and ML for Business Management | Brand Management | Integrated Marketing Communication | Services Marketing | Retail Management.',
        sem4: 'Project II (10 Credits) | Entrepreneurship | Global Business Environment | Conflict and Negotiation | Doing Business in India | Business Transformation and Organizational Turnaround | Marketing Analytics | Sales Force and Channel Management | Customer Relationship Management | Product Management.',
      },
      'Operations': {
        sem3: 'Project I (4 Credits) | Corporate Governance and Ethics | Crisis Management in Business | Strategic Management | AI and ML for Business Management | Procurement and Materials Management | Service Operations Management | Total Quality Management | Operations Planning and Scheduling.',
        sem4: 'Project II (10 Credits) | Entrepreneurship | Global Business Environment | Conflict and Negotiation | Doing Business in India | Business Transformation and Organizational Turnaround | Outsourcing and IT Delivery Models | International Logistics | Digital Manufacturing and Analytics | Lean Six Sigma',
      },
    },
  },
  'upes-online||MBA': {
    sem1: 'Managerial Economics | Accounting for Managers | Marketing Management | Quantitative Techniques | Operations Management.',
    sem2: 'OB & HRM | Project Management | Financial Management | Research Methodology | Business Analytics for Managers.',
    highlight: 'Professional Waiver: 5% marks relaxation (45% vs 50% min) for 2+ years work experience. Merit Scholarship: Up to 20% off 1st-year tuition for >80% in graduation or NMAT score >200.',
    specSyllabus: {
      'Business Analytics': {
        sem3: 'Data Environment & Management | Programming for Business Analytics (Python) | AI for Managers | Social and Web Analytics | Business Optimization.',
        sem4: 'Strategic Management | Big Data Analytics | Natural Language Processing (NLP) | Data Visualization | Dissertation.',
      },
      'Digital Business': {
        sem3: 'Introduction to Digital Business and Social Media Tools | Digital Business Models and Design Principles | Digital Brand Management | Digital Payments and E-Commerce | Customer Relationship Management.',
        sem4: 'Strategic Management | Digital and Business Laws | Digital Marketing | Innovation & Entrepreneurship | Dissertation.',
      },
      'Financial Management': {
        sem3: 'Financial Institutions and Markets | Financial Econometrics | Corporate Valuation | Behavioural Finance | International Finance and Risk Management.',
        sem4: 'Strategic Management | Investment Analysis and Portfolio Management | Financial Technology (Fintech) | Innovation & Entrepreneurship | Dissertation.',
      },
      'Human Resource Management': {
        sem3: 'Industrial Relations & Labour Legislation | Cross Cultural and Global HRM | Performance Management | Training and Development | Organisational Change & Intervention Strategies.',
        sem4: 'Strategic Management | Digital HR | Compensation Management | Innovation & Entrepreneurship | Dissertation.',
      },
      'Infrastructure Management': {
        sem3: 'nfrastructure Development | Non-Conventional Methods of Infrastructure Creation | Transportation Economics & Management | Understanding Urban Infrastructure | IT Applications in Infrastructure Management.',
        sem4: 'Strategic Management | Innovation & Entrepreneurship | Infrastructure Insurance | Law & Contracts | Rural & Social Infrastructure | Dissertation.',
      },
      'International Business': {
        sem3: 'International Business | Foreign Exchange Management and Trade Finance | International Marketing Management | Foreign Trade Policy | Procedure and Documentation | International Logistics & Supply Chain Management.',
        sem4: 'Strategic Management | International Business Law | Corporate Restructuring | Innovation & Entrepreneurship | Dissertation.',
      },
      'Logistics & Supply Chain Management': {
        sem3: 'International Logistics & SCM | Introduction to Logistics & SCM | International Finance and Risk Management | Procurement & Supplier Relationship Management | Lean Supply Chain Management.',
        sem4: 'Strategic Management | Supply Chain Modelling & Simulation | Logistics Planning & Strategy | Innovation & Entrepreneurship | Dissertation.',
      },
      'Marketing Management': {
        sem3: 'Consumer Behaviour in Digital World | Sales and Channel Management | Digital Brand Management | Customer Relationship Management | Services Marketing.',
        sem4: 'Strategic Management | Digital Marketing | Integrated Marketing Communication | Innovation & Entrepreneurship | Dissertation.',
      },
      'Oil and Gas Management': {
        sem3: 'CRM | Strategic Management | Oil & Gas Storage & Transportation | Understanding Natural Gas Business | Fundamentals of Refining & Petrochemicals | Petroleum Exploration Economics.',
        sem4: 'International Business | Innovation & Entrepreneurship | Petro Retailing Business | New & Alternative Energy Resources | Dissertation.',
      },
      'Operations Management': {
        sem3: 'Production Planning & Inventory Control | Product Lifecycle Management | Lean Manufacturing | Intro to Logistics & SCM | Service Operations',
        sem4: 'Strategic Management | Technology Management | Total Quality Management | Innovation & Entrepreneurship | Dissertation.',
      },
      'Power Management': {
        sem3: 'Power Sector Economics & Planning | Financing Energy Sector Projects | Power Pricing & Power Purchase Agreements | Power Trading | Power Station Management',
        sem4: 'Strategic Management | Energy Law & Policy | Health | Safety & Environment for Power Industry | Renewable Energy Development and Management | Dissertation',
      },
    },
  },
  'uttaranchal-university-online||MBA': {
    sem1: 'Principles and Practices of Management | Accounting for Managerial Decisions | Economics for Managers | Business Environment | E-Commerce.',
    sem2: 'Emerging Business Law | Business Research Methods | Marketing Management | Business Analytics | Operations Management.',
    specSyllabus: {
      'Business Analytics': {
        sem3: 'Strategic Management | Supply Chain Management | Financial Statement Analysis | Big Data Analytics in Business | R Programming for Business.',
        sem4: 'Entrepreneurship Development | Corporate Governance | Project Work | Marketing & Social Media Analytics | Python Programming & Data Visualization.',
      },
      'Digital Marketing': {
        sem3: 'Strategic Management | Supply Chain Management | Financial Statement Analysis | Fundamentals of Digital Marketing | Digital Business Design',
        sem4: 'Entrepreneurship Development | Corporate Governance | Project Work | Digital Technologies and Analytics | Digital Strategies for Business.',
      },
      'Financial Management': {
        sem3: 'Strategic Management | Supply Chain Management | Financial Statement Analysis | Corporate Financial Management | Security Analysis | Portfolio and Risk Management',
        sem4: 'Entrepreneurship Development | Corporate Governance | Project Work | Wealth Management & Investment Environment | Risk Management.',
      },
      'HR Management': {
        sem3: 'Strategic Management | Supply Chain Management | Financial Statement Analysis | Training & Development Practices | Performance & Compensation Management.',
        sem4: 'Entrepreneurship Development | Corporate Governance | Project Work | Industrial Relations & Labor Laws | HRM Planning | Bargaining and Negotiation Process.',
      },
      'Information Technology': {
        sem3: 'Strategic Management | Supply Chain Management | Financial Statement Analysis | Fundamentals of Information Technology | Business Intelligence and Analytics.',
        sem4: 'Entrepreneurship Development | Corporate Governance | Project Work | Enterprise Resource Planning | Web Designing and Content Management.',
      },
      'International Business': {
        sem3: 'Strategic Management | Supply Chain Management | Financial Statement Analysis | Global Business Environment & Ethics | Import Export Procedures and Documentation.',
        sem4: 'Entrepreneurship Development | Corporate Governance | Project Work | Cross Cultural Business Challenges | Global Financial Markets and Instruments.',
      },
      'Logistics & Supply Chain Management': {
        sem3: 'Strategic Management | Supply Chain Management | Financial Statement Analysis | International Logistics | Supply Chain Modelling Design & Simulation',
        sem4: 'Entrepreneurship Development | Corporate Governance | Project Work | Supply Chain Analytics | Sustainability in Logistics & Supply Chain.',
      },
      'Marketing Management': {
        sem3: 'Strategic Management | Supply Chain Management | Financial Statement Analysis | Sales and Distribution Management | Integrated Marketing Communication & Brand Management.',
        sem4: 'Entrepreneurship Development | Corporate Governance | Project Work | Consumer Buying Behavior | Marketing Research',
      },
    },
  },
  'vignan-university-online||MBA': {
    sem1: 'Principles of Management and Organizational Behaviour (PMOB) | Managerial Economics (ME) | Accounting for Managers (AFM) | Business Statistics and Analytics for Decision Making (BSAD) | Legal Environment for Business (LEB).',
    sem2: 'Marketing Management (MM) | Financial Markets & Corporate Finance (FM & CF) | Human Resource Management (HRM) | Operations Management (OM) | Business Research Methods (BRM) | Business Analytics (BA).',
    specSyllabus: {
      'Business Analytics': {
        sem3: 'Business Environment & Strategy | Project Management | Intro to Business Intelligence | Data Warehousing | Data Mining for Intelligence | Open Elective.',
        sem4: 'Analytics in Management | Web Data Extraction & Analytics | Anomaly Detection Techniques | BI Reporting for Managers | Cross-Functional Elective | Master Thesis/Project',
      },
      'Finance': {
        sem3: 'Business Environment & Strategy | Management of Banking & Financial Services | Direct & Indirect Taxation | Fixed Income Securities & Derivatives | Research-Based Learning-I',
        sem4: 'Entrepreneurship Development | Investment Analysis & Portfolio Management | Fintech Foundation & Applications | Corporate Valuation & Investment Banking | Research-Based Learning-II.',
      },
      'Healthcare Management': {
        sem3: 'Business Environment & Strategy | Project Management | SCM & Material Management in Healthcare | Medical Record Management | Planning of Healthcare Services | Open Elective.',
        sem4: 'Healthcare Information Technology | Healthcare Insurance | Healthcare Laws | Medical Tourism | Cross-Functional Elective | Master Thesis/Project',
      },
      'Human Resource Management': {
        sem3: 'Business Environment & Strategy | Talent Acquisition & Management | Industrial Relations & Labour Laws | Performance Management | Research-Based Learning-I.',
        sem4: 'Entrepreneurship Development | Organizational Development & Change Management | HR Metrics & Analytics | Leadership in Practice | Strategic HRM | Research-Based Learning-II.',
      },
      'IT Management': {
        sem3: 'Business Environment & Strategy | Enterprise Resource Planning (ERP) | Software Engineering | Database Management System | Research-Based Learning-I | Open Elective.',
        sem4: 'Entrepreneurship Development | Technology Management | IT Project Management | IT Privacy & Security | Research-Based Learning-II.',
      },
      'Logistics & Supply Chain Management': {
        sem3: 'Business Environment & Strategy | Elective I | Elective II | Elective III | Research-Based Learning-I.',
        sem4: 'Entrepreneurship Development | Elective I | Elective II | Elective III | Research-Based Learning-II.',
      },
      'Marketing': {
        sem3: 'Business Environment & Strategy | Project Management | Agricultural & Rural Marketing | Integrated Marketing Communications | Services Marketing & CRM | Open Elective.',
        sem4: 'Global Marketing | B2B Marketing | Retail Marketing & Brand Management | Digital Marketing & Data Analytics | Cross-Functional Elective | Master Thesis/Project.',
      },
    },
  },
  'manipal-university-jaipur-online||MBA': {
    sem1: 'Entrepreneurial Practice | Business Communication | Managerial Economics | Financial Accounting | Data Visualisation (Excel/Tableau) | Organizational Behaviour | Marketing Management.',
    sem2: 'Business Research Methods (R/Python) | Advanced Financial Management | Operations Management | Human Resource Management | Strategic Management | Legal Aspects of Business.',
    highlight: 'Powered by Coursera integration',
    specSyllabus: {
      'Finance': {
        sem3: 'Strategic Management | Term Paper | Security Analysis and Portfolio Management | Mergers and Acquisitions | Taxation Management | Internal Audit and Control.',
        sem4: 'International Business Management | Project | International Financial Management | Treasury Management | Investment Banking and Financial Services | Insurance and Risk Management.',
      },
      'Marketing': {
        sem3: 'Strategic Mgmt | Term Paper | Sales and Distribution Management | Consumer Behaviour | Retail Marketing | Marketing Research.',
        sem4: 'Intl. Biz Mgmt | Project | Services Marketing and CRM | Advertising Management and Sales Promotion | e-Marketing | International Marketing.',
      },
      'Human Resource Management': {
        sem3: 'Strategic Mgmt | Term Paper | Manpower Planning and Sourcing | Management and Organizational Development | Employee Relations Management | HR Audit.',
        sem4: 'Intl. Biz Mgmt | Project | Compensation and Benefits | Performance Management and Appraisal | Talent Management and Employee Retention | Change Management.',
      },
      'Analytics and Data Science': {
        sem3: 'Strategic Mgmt | Term Paper | Programming in Data Science | Exploratory Data Analysis | Introduction to Machine Learning | Visualization.',
        sem4: 'Intl. Biz Mgmt | Project | Advanced Machine Learning | Unstructured Data Analysis | Business Analytics | Data Scraping.',
      },
      'Digital Marketing': {
        sem3: 'Strategic Mgmt | Term Paper | Search Engine Optimization | Social Media Marketing | Content Marketing | Digital Design',
        sem4: 'ntl. Biz Mgmt | Project | Web Analytics | Search Engine Marketing | E-mail Marketing | Digital Marketing Strategy.',
      },
      'Operations Management': {
        sem3: 'Strategic Mgmt | Term Paper | Production and Operations Management | Enterprise Resource Planning | Logistics and Supply Chain Management | Operations Research.',
        sem4: 'Intl. Biz Mgmt | Project | Enterprise Resource Planning (ERP) | Services Operations Management | Total Quality Management | Production | Planning and Control.',
      },
      'International Business': {
        sem3: 'Strategic Mgmt | Term Paper | International Financial Management | International Marketing | Management of Multinational Corporations | Export-Import Management.',
        sem4: 'Intl. Biz Mgmt | Project | Foreign Trade of India | Global Logistics and Distribution Management | International Business Environment and International Law | Export-Import Finance.',
      },
      'Project Management': {
        sem3: 'Strategic Mgmt | Term Paper | Introduction to Project Management | Project Planning and Scheduling | Project Finance and Budgeting | Managing Human Resources in Projects.',
        sem4: 'Intl. Biz Mgmt | Project | Quantitative Methods in Project Management | Project Risk Management | Project Quality Management | Contracts Management in Projects.',
      },
      'Supply Chain Management': {
        sem3: 'Strategic Mgmt | Term Paper | Supply Chain Management | Outsourcing | Food Supply Chain Management | Inventory Management.',
        sem4: 'Intl. Biz Mgmt | Project | Global Logistics and Supply Chain Management | Category Management in Purchasing | Purchasing and Contracting for Projects | Supply Chain Cost Management.',
      },
      'Information System Management': {
        sem3: 'Strategic Management | Term Paper | Database Management Systems | Software Project Management | Enterprise Resource Planning (ERP) | Business Intelligence and Analytics.',
        sem4: 'International Business Management | Project | IT Infrastructure Management | Information Security and Audit | E-Commerce | Web Designing and Content Management.',
      },
      'IT & FinTech': {
        sem3: 'Strategic Mgmt | Term Paper | IT Infrastructure Mgmt | Software Project Mgmt | Blockchain for Business | Fintech Foundation.',
        sem4: 'Intl. Biz Mgmt | Project | Cyber Security & Laws | Digital Payments | AI & ML in Finance | Tech-driven Financial Innovation.',
      },
      'BFSI (Banking, Financial Services and Insurance)': {
        sem3: 'Strategic Mgmt | Term Paper | Commercial Banking | Insurance & Risk Mgmt | Investment Banking | Wealth Management',
        sem4: 'Intl. Biz Mgmt | Project | Financial Services & Markets | International Financial Management | Treasury Management | Fintech in BFSI.',
      },
      'Retail Management': {
        sem3: 'Strategic Mgmt | Term Paper | Retail Marketing | Store Operations & Mgmt | Category Mgmt in Retail | Consumer Buying Behaviour.',
        sem4: 'Intl. Biz Mgmt | Project | Retail Supply Chain Mgmt | E-Retailing | Visual Merchandising | Mall Management.',
      },
    },
  },
  'manipal-academy-higher-education-online||MBA': {
    sem1: 'Managing People & Organizations | Financial Reporting & Statement Analysis | Managerial Economics | Business Communication | Business Statistics.',
    sem2: 'Financial Management | Marketing Management | Strategic Management | IT for Business | Business Leadership | Research Methodology.',
    highlight: 'MAHE MBA Stats: Total Fee: ₹2.92L. Sem Fee: ₹73K. Rank: #3 in India. Accreditations: NAAC A++, UGC, AICTE. USPs: IoE Status, Coursera Access, 1:1 Industry Mentorship, Mandatory 1-yr Work Exp, Minor/Ca',
    specSyllabus: {
      'Healthcare Management': {
        sem3: 'Management Accounting | Legal Aspects of Business | Minor Project | Health Informatics | Health Education and Communication | Health Insurance',
        sem4: 'Entrepreneurship and Innovation | Sustainability | Capstone Project | Healthcare Operations Management | Hospital Planning and Infrastructure Management | Quality Management in Healthcare',
      },
      'Pharmaceutical Management': {
        sem3: 'Management Accounting | Legal Aspects of Business | Minor Project | Pharmaceutical Marketing | Pharmaceutical Sales and CRM | Intellectual Property Rights.',
        sem4: 'Entrepreneurship and Innovation | Sustainability | Capstone Project | Pharma Logistics Management | Pharmaceutical Production Management | Pharmaceutical Regulatory Environment.',
      },
      'Business Analytics': {
        sem3: 'Management Accounting | Legal Aspects of Business | Minor Project | Data Visualization | Programming with R and Python | Database Management.',
        sem4: 'Entrepreneurship and Innovation | Sustainability | Capstone Project | Financial Analytics | Marketing Analytics | HR Analytics.',
      },
      'Data Science': {
        sem3: 'Management Accounting | Legal Aspects of Business | Minor Project | Programming with R and Python | Data Visualization | Database Management.',
        sem4: 'Entrepreneurship and Innovation | Sustainability | Capstone Project | Probability and Statistical Inference | Applied Multivariate Data Analysis | Machine Learning Methods.',
      },
      'Finance': {
        sem3: 'Management Accounting | Legal Aspects of Business | Minor Project | Security Analysis and Portfolio Management | Financial Analytics | Financial Derivatives.',
        sem4: 'Entrepreneurship and Innovation | Sustainability | Capstone Project | Fintech: Emerging Technologies in Finance | Fixed Income Securities | Corporate Valuation.',
      },
      'Marketing': {
        sem3: 'Management Accounting | Legal Aspects of Business | Minor Project | Consumer Behavior | Digital Marketing | Services Marketing & Customer Relationship Management.',
        sem4: 'Entrepreneurship and Innovation | Sustainability | Capstone Project | Sales & Distribution Management | Marketing Analytics | Integrated Marketing Communication.',
      },
      'Operations Management': {
        sem3: 'Management Accounting | Legal Aspects of Business | Minor Project + Electives (Enterprise Resource Planning | Total Quality Management | Supply Chain Management).',
        sem4: 'Entrepreneurship and Innovation | Sustainability | Capstone Project + Electives (Project Management | Services Operations Management | Operations Research)',
      },
      'Human Resource Management': {
        sem3: 'Management Accounting | Legal Aspects of Business | Minor Project + Electives (Compensation and Benefits | Performance Management and Appraisal | International HRM)',
        sem4: 'Entrepreneurship and Innovation | Sustainability | Capstone Project + Electives (Training and Development | Talent Management and Employee Retention | HR Analytics)',
      },
      'Logistics & Supply Chain Management': {
        sem3: 'Management Accounting | Legal Aspects of Business | Minor Project + Electives (Supply Chain Management | Fundamentals of Logistics Management | Operations Management).',
        sem4: 'Entrepreneurship and Innovation | Sustainability | Capstone Project + Electives (Quality Management in Logistics & Supply Chain | Procurement and Purchasing | Logistics and Distribution Management)',
      },
    },
  },
  'sikkim-manipal-university-online||MBA': {
    sem1: 'Principles of Mgmt & OB | Marketing Mgmt | Accounting for Managers | Business Economics | Business Communication | Legal Aspects of Business | Computer Application in Mgmt.',
    sem2: 'Quantitative Methods in Mgmt | HRM | Financial Mgmt | Production & Operations Mgmt | Research Methodology & Statistical Techniques | Global Economic Environment & Policy | MIS.',
    specSyllabus: {
      'Marketing': {
        sem3: 'Project Management | Business Strategy | Consumer Behavior and Advertisement and Brand Management | Retail and Distribution Management and Supply Chain Management + (2 Subjects from Specialization II).',
        sem4: 'Banking and Insurance Management | Project Work | Market Research | Service Marketing & Global Marketing + (2 Subjects from Specialization II).',
      },
      'Finance': {
        sem3: 'Project Management | Business Strategy | Security Analysis and Portfolio Management & Derivative Market | Taxation + (2 Subjects from Specialization I)',
        sem4: 'Banking and Insurance Management | Project Work | Multinational Finance & Risk Exposure Management | Marketing of Financial Services & Mergers and Acquisitions + (2 Subjects from Specialization I).',
      },
      'Human Resources': {
        sem3: 'Project Management | Business Strategy | Industrial Relation | Competency Mapping & Performance Management + (2 Subjects from Specialization I).',
        sem4: 'Banking and Insurance Management | Project Work | Organization Development & Human Resource Development | Compensation Management & International Human Resource Management + (2 Subjects from Specialization I).',
      },
      'Systems (IT Management)': {
        sem3: 'Project Management | Business Strategy | Object Oriented Programming System & Open Source System | Database Management Systems + (2 Subjects from Specialization I).',
        sem4: 'Banking and Insurance Management | Project Work | E-Commerce | Technology Management and Strategy + (2 Subjects from Specialization I).',
      },
      'Operations & Supply Chain Management': {
        sem3: 'Project Management | Business Strategy | Operation and Logistics Management | Supply Chain Management + (2 Subjects from Specialization I).',
        sem4: 'Banking and Insurance Management | Project Work | Materials and Store Management | Quality Management and Global Supply Chain Management + (2 Subjects from Specialization I).',
      },
      'Healthcare': {
        sem3: 'Project Management | Business Strategy | Health Education & Communication | Healthcare and Hospital Core Services + (2 Subjects from Specialization I)',
        sem4: 'Banking and Insurance Management | Project Work | Quality Management in Healthcare | Legal Aspects in Healthcare Administration + (2 Subjects from Specialization I).',
      },
    },
  },
  'charusat-university-online||MCA': {
    sem1: 'Cloud Computing | Web Development using Open Source Technologies | Enterprise Computing using Java EE | Programming with .NET Architecture | Database Technologies | Academic Speaking and Presentation Skills',
    sem2: 'Programming in Python | Advanced Web Designing | Advanced Mobile Programming | Software Engineering with Agile and DevOps | Academic Writing',
    sem3: 'Data Analytics | Software Quality Assurance | Green Computing | Minor Project Work',
    sem4: 'Dissertation / Project Work | Industrial Training',
    highlight: 'UGC-Entitled Online Degree; NAAC A+ Accredited University; Flexible Learning for Working Professionals; Industry-Relevant Curriculum (Software, DBMS, Cybersecurity); Choice-Based Credit System; LMS with High-Quality Digital Content; Live + Recorded C',
    programOverview: 'The online MCA at Charotar University of Science & Technology is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-Entitled Online Degree. NAAC A+ Accredited University. Flexible Learning for Working Professionals. Industry-Relevant Curriculum (Software, DBMS, Cybersecurity). Choice-Based Credit System.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'dr-babasaheb-ambedkar-open-university-online||MCA': {
    sem1: 'Data Structure and Algorithms | Relational Database Management System | Web Development Technologies | Operating Systems | Software Engineering and Software Project Management | Programming Skills - I.',
    sem2: 'Object Oriented Concepts and Programming | Web Application Development using PHP | Web Development Technologies with ASP.Net | Computer Networking | Electives-I (Select one: Cloud Infrastructure and Services / Data Analytics using &quot | R&quot | / Applications and Network Security) | Programming S',
    sem3: 'Object Oriented Unified Modeling | Problem Solving using Python | Cross Platform Mobile Application Development | Internet Programming with Java | Electives-II (Select one: Principles of Cyber Security / Artificial Intelligence and Machine Learning / Components and Applications of Internet of Things',
    sem4: 'Internship cum Industrial Project.',
  
    highlight: 'Highly Affordable Fee Structure; Pay-As-You-Go Model (Per Year / Per Semester); Separate Low-Cost Fees for Indian (SAARC) Students; Transparent Fee Breakdown (Registration, Exam, Project); Minimal Additional Charges; Suitable for Budget-Conscious Lea',
    programOverview: 'The online MCA at Dr. Babasaheb Ambedkar Open University is a UGC DEB approved two-year postgraduate program. The Government of India has formally recognised that online degrees from UGC DEB approved universities carry the same academic and legal standing as regular campus degrees, making this MCA fully valid for private employment, government roles, and higher studies.\n\nHighly Affordable Fee Structure. Pay-As-You-Go Model (Per Year / Per Semester). Separate Low-Cost Fees for Indian (SAARC) Students. Transparent Fee Breakdown (Registration, Exam, Project).',
  },
  'maharishi-markandeshwar-university-online||MCA': {
    sem1: 'Data Structure Using C++ | Advanced Database Management System | Operating System | Software Engineering | Business Intelligence and Its Applications | Data Structure Using C++ Lab | Advanced Database Management System Lab | Bridge Course',
    sem2: 'Object Oriented Programming Using Java | Web Technologies | Python Programming | Mobile Programming | Mini Project – 1 | Electives (Node/Angular/React JS)',
    sem3: 'Software Engineering (Advanced) | Cryptography &amp | Network Security | Artificial Intelligence | Mobile Application Development | NoSQL Database | Mini Project – 2',
    sem4: 'Industry Defined Project (Internship) / Major Project',
  
    highlight: 'UGC-Approved Deemed-to-be University; NAAC A++ Accredited Institution; Industry-Aligned Curriculum (Programming, AI, Data Science, Cybersecurity); Strong Focus on Practical Learning & IT Skills; Flexible Online Learning for Working Professionals; Liv',
    programOverview: 'The online MCA at Maharishi Markandeshwar is a UGC DEB approved two-year postgraduate program. The Government of India has formally recognised that online degrees from UGC DEB approved universities carry the same academic and legal standing as regular campus degrees, making this MCA fully valid for private employment, government roles, and higher studies.\n\nUGC-Approved Deemed-to-be University. NAAC A++ Accredited Institution. Industry-Aligned Curriculum (Programming, AI, Data Science, Cybersecurity). Strong Focus on Practical Learning & IT Skills.',
  },
  'university-of-mysore-online||MCA': {
    sem1: 'Advanced Data Structures and Indexing | Object Oriented Programming with C++ | Advanced Database Management System | Java Programming | Linux Programming | E-commerce and E-governance',
    sem2: 'Data Communication and Networks | Artificial Intelligence | .Net with C# | Cloud Computing | Data Mining and Data Warehousing | Cryptography and Network Security',
    sem3: 'Advanced Software Engineering | Python Programming | Machine Learning | Digital Image Processing | Internet of Things',
    sem4: 'Project Work | Communication Skills and Professional Management',
    highlight: 'UGC-Entitled & NAAC Accredited Government University; Degree Equivalent to Regular MCA (Valid for Jobs & Higher Studies); One of India’s Oldest Universities (Established 1916); Affordable Fee Structure; Industry-Relevant Curriculum with Core IT Subje',
    programOverview: 'The online MCA at University of Mysore is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-Entitled & NAAC Accredited Government University. Degree Equivalent to Regular MCA (Valid for Jobs & Higher Studies). One of India’s Oldest Universities (Established 1916). Affordable Fee Structure. Industry-Relevant Curriculum with Core IT Subjects.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'vit-university-online||MCA': {
    sem1: 'Database Management Systems | Computer Architecture and Organization | Mathematical Foundations of Computer Applications | Data Structures and Algorithms | Software Engineering | Database Management Systems Lab | Data Structures and Algorithms Lab',
    sem2: 'Object Oriented Programming | Operating Systems | Computer Networks | Design and Analysis of Algorithms | Elective I | Object Oriented Programming Lab | Operating Systems Lab',
    sem3: 'Data Warehousing and Data Mining | Web Technologies | Elective II | Elective III | Elective IV | Web Technologies Lab | Mini Project',
    sem4: 'Elective V | Elective VI | Major Project',
  },
  'anna-university-online||MCA': {
    sem1: 'Mathematical Foundations of Computer Science | Advanced Data Structures and Algorithms | Advanced Database Management Systems | Advanced Software Engineering | Python Programming | Advanced Database Management Systems Laboratory | Data Structures and Algorithms Laboratory',
    sem2: 'Object Oriented Programming | Computer Networks | Operating Systems | Data Science | Web Application Development | Object Oriented Programming Laboratory | Web Application Development Laboratory',
    sem3: 'Data Mining and Data Warehousing | Cloud Computing Technologies | Mobile Application Development | Professional Elective I | Professional Elective II | Software Development Laboratory | Mini Project',
    sem4: 'Professional Elective III | Professional Elective IV | Project Work',
  },
  'shobhit-university-online||MCA': {
    sem1: 'Mathematical Foundation for Computer Science | Computer Organization &amp | Architecture | Data Structures and Algorithms | Database Management Systems | Object Oriented Programming using Java | Java Lab.',
    sem2: 'Design and Analysis of Algorithms | Computer Networks | Operating Systems | Software Engineering | Python Programming | Python Lab.',
    sem3: 'Machine Learning | Cloud Computing | Big Data Analytics | Cryptography and Network Security | Professional Ethics | Mini Project.',
    sem4: 'Major Project.',
  
    highlight: 'UGC-DEB approved and NAAC accredited degree; 2-year online MCA program with flexible learning; Specializations in AI & Machine Learning, Data Science, Cloud Computing, Cyber Security and Full Stack Development; Industry-aligned curriculum designed wi',
    programOverview: 'The online MCA at Shobhit Institute of Engineering & Technology is a UGC DEB approved two-year postgraduate program. The Government of India has formally recognised that online degrees from UGC DEB approved universities carry the same academic and legal standing as regular campus degrees, making this MCA fully valid for private employment, government roles, and higher studies.\n\nUGC-DEB approved and NAAC accredited degree. 2-year online MCA program with flexible learning. Specializations in AI & Machine Learning, Data Science, Cloud Computing, Cyber Security and Full Stack Development. Industry-aligned curriculum designed with latest technologies.\n\nThere are 5 specialisations, including Cloud Computing, AI & Machine Learning, Full Stack Development and more.',
  },
  'andhra-university-online||MCA': {
    sem1: 'IT & Programming with C | Computer Organization',
    sem2: 'Data Structures | Microprocessors | Operating Systems | DBMS',
    sem3: 'Software Engineering | Computer Networks | Web Technologies | Python',
    sem4: 'Seminar on Recent Trends in IT | Major Internship Project',
  },
  'mangalayatan-university-online||MCA': {
    sem1: 'Data Communication & Computer Networks | Computer Organization & Architecture | Professional Communication | Discrete Mathematics | Accountancy and Financial Management | Programming with C | Programming with C Lab',
    sem2: 'Web Programming | Advance Cyber Security | Management Information System | Design & Analysis of Algorithm | Data Structure using C++ | DAA and Web Programming Lab | Data Structure using C++ Lab',
    sem3: 'Artificial Intelligence and Machine Learning | Data Science using R Programming | OOP’s Technologies and Java Programming | Advanced DBMS | Soft Computing Techniques | Java Programming Lab | Data Science using R Programming Lab',
    sem4: 'Big Data Analytics | Mobile Computing | Natural Language Processing | Python Programming | Quantum Computing | Python Programming Lab | Project',
    highlight: 'UGC-approved and NAAC A+ accredited university; Flexible online learning with self-paced and recorded lectures; Industry-relevant curriculum focused on programming and IT skills; Strong foundation in software development, databases and networking; Ac',
    programOverview: 'The online MCA at Mangalayatan University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-approved and NAAC A+ accredited university. Flexible online learning with self-paced and recorded lectures. Industry-relevant curriculum focused on programming and IT skills. Strong foundation in software development, databases and networking. Access to LMS with study materials, PPTs and recorded sessions.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'bharati-vidyapeeth-university-online||MCA': {
    sem1: 'Applied Database Management Systems | Computer Networks | Java Programming | Computational Statistics | Management Concepts and Applications | Lab on Applied Database Management Systems | Lab on Java Programming | MOOCs-I | Open Course (Universal Human Values / Cyber Security / Soft Skills)',
    sem2: 'Object Oriented Software Engineering | Cloud Computing Concepts | Data Structures using Python | Data Warehousing and Data Mining | Web Supporting Technologies | Lab on Data Structures using Python | Minor Project – 1 | MOOCs-II | Open Course (Foreign Language / Digital Technology / Human Psychology at Workplace)',
    sem3: 'Software Design Patterns | Artificial Intelligence | Information Security | Electives (Virtualization / AWS / Statistical Programming in R / Introduction to Data Science / Linux Programming & Administration / Perl / Ruby / JavaScript / Android / C# / ASP.NET MVC / HTML5 / AJAX / Recommender Systems / Knowledge Management / IoT / Big Data / Hadoop / Cyber Security / Data Management) | Lab on Software Testing | Minor Project – 2 | MOOCs-III | Open Course (Social Change in Technology / Water Management / Economics for IT Industry)',
    sem4: 'Seminar on Recent Trends in IT | Advanced Electives (Cloud / Data Science / Linux / Open Source / Mobile / .NET / Net-Centric / Information Systems / IoT / Big Data / Cyber Security / Data Management) | Major Internship Project',
    highlight: 'UGC-Entitled & AICTE Approved Online MCA Program; NAAC A+ Accredited Deemed University with 60+ Years Legacy; Industry-Oriented Curriculum (Software Development, DBMS, Networks, Cybersecurity); Dual Elective System with Multiple Specialization Option',
    programOverview: 'The online MCA at Bharati Vidyapeeth is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-Entitled & AICTE Approved Online MCA Program. NAAC A+ Accredited Deemed University with 60+ Years Legacy. Industry-Oriented Curriculum (Software Development, DBMS, Networks, Cybersecurity). Dual Elective System with Multiple Specialization Options. Strong Focus on Practical Learning & Hands-On Assignments.\n\nThere are 12 specialisation options, including Cloud Computing, Data Science, Linux, and 9 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.',
  },
  'kl-university-online||MCA': {
    sem1: 'Professional Communication Skills | Computer Networks and Communications | Data Structures and Algorithms | Operating Systems Concepts | Database Systems',
    sem2: 'Object-Oriented Programming | Data Analytics | Comprehensive Software Engineering | Applied Machine Learning | Pattern Recognition',
    specSyllabus: {
      'Artificial Intelligence': {
        sem3: 'Internship | Web Technologies | Essentials of Research Design | Computer Vision | Applied Deep Learning | Applications of Natural Language Processing | Term Paper',
        sem4: 'OE 1 | OE 2 | Project',
      },
      'Data Science': {
        sem3: 'Internship | Web Technologies | Essentials of Research Design | Data Visualization Techniques | Statistics for Data Science | Graph and Web Analytics | Term Paper',
        sem4: 'OE 1 | OE 2 | Project',
      },
      'Cloud Technology': {
        sem3: 'Internship | Web Technologies | Essentials of Research Design | Cloud Architectures | Cloud and Serverless Computing | Cloud Web Services | Term Paper',
        sem4: 'OE 1 | OE 2 | Project',
      },
      'Cybersecurity': {
        sem3: 'Internship | Web Technologies | Essentials of Research Design | Malware Analysis | Security Governance and Management | Cloud Security | Term Paper',
        sem4: 'OE 1 | OE 2 | Project',
      },
    },
    highlight: 'UGC Entitled; NAAC A++ Accredited University; Affordable Fee Structure (~₹65,500 Total); Flexible Learning for Working Professionals; Live + Recorded Classes (LMS Access); 650+ Hours of Learning Content; Industry-Oriented Curriculum (Programming, Cyb',
    programOverview: 'The online MCA at Koneru Lakshmaiah Education Foundation is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC Entitled. NAAC A++ Accredited University. Affordable Fee Structure (~₹65,500 Total). Flexible Learning for Working Professionals. Live + Recorded Classes (LMS Access).\n\nThere are 4 specialisation options, including Artificial Intelligence, Data Science, Cloud Technology, and 1 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.\n\nThe full program fee is around Rs. 66,000, payable in semester-wise installments. EMI plans are available for those who prefer to spread payments across months.',
  },
  'assam-don-bosco-university-online||BBA': {
    sem1: 'Management Concepts and Practices | Fundamentals of Financial Accounting | Business Economics | Communicative English | Entrepreneurship Principles and Practices | Understanding India | Environmental Studies',
    sem2: 'Ethics | Values and Corporate Social Responsibility | Marketing',
    sem3: 'Principles of Marketing | Fundamentals of Human Resource Management | Introduction to Financial Management | Emotional Intelligence | Managerial Communication | Minor Internship',
    sem4: 'Personal Financial Planning | Consumer Behaviour | Business Mathematics and Statistics for Decision Making | Elective I | English',
    sem5: 'Business Decision Analysis | Corporate Governance and Professional Ethics | Production and Operations Management | Elective II | Internship',
    sem6: 'Business Policy and Strategic Management | Financial Markets and Institutions | Corporate and Business Law | Minor Project-1 | Elective III',
  },
  'assam-don-bosco-university-online||BCA': {
    sem1: 'Programming in C Language | Computer Programming in C Language (Theory/Lab) | Cyber Law and Ethics | Computer Fundamentals | Fundamentals of Business &amp | Economics | Environmental Studies | Service Learning | Business Communication',
    sem2: 'Data Structures Using C (Theory/Lab) | E-commerce Technologies | Hardware and Server Maintenance | Communicative English I | Indian Economy | Digital and Technological Solutions | Understanding India | Service-Learning Practice',
    sem3: 'Introduction to Java Programming (Theory/Lab) | Digital Logic Design (Theory/Lab) | Enterprise Resource Planning | Multimedia and Graphics | Service-Learning Practice | Emotional Intelligence',
    sem4: 'Operating System (Theory/Lab) | Computer Organization and Architecture (Theory/Lab) | Relational Database Management Systems (Theory/Lab) | Basics of Web Designing (Theory/Lab) | Communicative English II',
    sem5: 'Computer Network Fundamentals (Theory/Lab) | Android Application Development Fundamentals | Minor Project | Software Engineering (Theory/Lab) | Internship',
    sem6: 'Cloud Computing | Network Security | Web Technologies (Theory/Lab) | Business Statistics | Basics of Python (Theory/Lab)',
  },
  'guru-ghasidas-vishwavidyalaya-online||B.Com': {
    sem1: 'Financial Accounting | Business Laws | Financial Literacy | Rural Development | Creativity and Entrepreneurship | Spiritual Management | E-Commerce | Stock Market Operations',
    sem2: 'Corporate Accounting | Business Organization and Management | Business Environment | Basics of Management | Business Communication | Tribal Economics | New Venture Planning and Development | Personal Tax Planning and Tax Management',
    sem3: 'Financial Management | Income-tax Law and Practice | Principles of Marketing | Investing in Stock Markets | Advanced Financial Accounting | Indian Economy | Fundamentals of Banking',
    sem4: 'Cost Accounting | Business Mathematics | Human Resource Management | Risk Management | Working Capital Management | Fundamentals of Insurance | Financial Statement Analysis | Summer Internship',
    sem5: 'Business Economics | Business Statistics | Management Accounting | Financial Markets and Institutions | Advertising and Personal Selling | Business',
    sem6: 'Goods &amp | Services Tax (GST) and Customs Law | Auditing | Personal Finance &amp | Planning | Seminar | Dissertation / Project',
  },
  'gujarat-university-online||B.Com': {
  },
  'gujarat-university-online||BA': {
    sem1: 'Prose | Poetry | Indian Writing in English | Reading and Writing Skills.',
    sem2: 'The English Novel: Background | History and Development | Writing for Media | Linguistics and Phonetics.',
    sem3: 'Poetry and Poetic Forms | Comparative Literature | Shakespearean Drama.',
    sem4: 'Indian Literature in English Translation | World Literature | English Grammar and Usage | Literary Criticism – 2.',
    sem5: 'English Language and Literature | British Literature: Renaissance to Romanticism | Literature and Society | English Language Teaching (ELT) | Literary Criticism.',
    sem6: 'British Literature: Victorian Age to Modern | Postcolonial Literature | 20th Century British and American Literature | Modern Literary Theory | Critical Theories: Classical to Contemporary.',
  },
  'charusat-university-online||BCA': {
    sem1: 'Information Technology Trends | Foundation of Programming | Digital Computer Fundamentals | Fundamentals of Web Designing | Communicative English.',
    sem2: 'Fundamentals of E-Commerce | Advanced Web Designing | Fundamentals of Object Oriented Programming | Database Fundamentals | Seminar.',
    sem3: 'Computer Oriented Management Systems | System Analysis and Design | Fundamentals of Data Structures and Algorithms | Fundamentals of Operating Systems | Environmental Sciences | Case Study.',
    sem4: 'Software Engineering | Advanced Database System | Open Source Technology | Computer Networks | Human Values and Professional Ethics | Domain Specific Elective - I.',
    sem5: 'Object Oriented Programming using JAVA | Fundamentals of Visual Programming | Introduction to Multi-Paradigms Programming language | Communication and',
    sem6: 'Basics of Mobile Applications | Software Testing | Project Work | Contributory Personality Development.',
  },
  'dr-babasaheb-ambedkar-open-university-online||BCA': {
    sem1: 'Fundamental of Programming using C language | Fundamental of Computer &amp | Information Technology | Introduction to Internet Technologies and HTML | Financial Accounting and Management | Communication Skills-I | Environmental Studies-I.',
    sem2: 'Operating System and Software Installation | Data Structure Using C | Database Management System (DBMS) | Digital Electronics and Computer Organization | Communication Skills-II | Environmental Studies-II.',
    sem3: 'Object Oriented Concepts &amp | Programming - I | Introduction to Computer Network | Relational Database Management System (RDBMS) | Cyber Security | Digital Marketing and SEO | Personality Development-I.',
    sem4: 'Object Oriented Concepts &amp | Programming-II (Advance Java) | System Analysis and Design | Web Technology using FOSS (LAMP/WAMP) | System Programming and Introduction to Microprocessor | Basics of French Language | Personality Development-II.',
    sem5: 'Software Engineering | Client/Server Architecture and Interface (C#) | Introduction to Python Programming | Business Application and Introduction to ERP | Mobile Operating Systems.',
    sem6: 'Object Oriented Analysis and Design | Internet Programming (ASP.NET Using C#) | Mobile Application Development | E-Commerce | Data Warehousing and Data Mining | Software Testing | Minor Project Cum Internship.',
  },
  'dr-babasaheb-ambedkar-open-university-online||B.Com': {
    sem1: 'Business Organization | Financial Accounting | Business Economics | Principles of Management | Communication Skills.',
    sem2: 'Corporate Accounting | Business Law | Company Law | Banking and Finance | Environmental Studies.',
    sem3: 'Cost Accounting | Income Tax | Business Mathematics | Human Resource Management | Marketing Management.',
    sem4: 'Auditing | Management Accounting | Financial Management | E-Commerce | Entrepreneurship.',
    sem5: 'Advanced Financial Accounting | Business Statistics | International Business | Corporate Governance | Specialized Elective.',
    sem6: 'Project Work | Goods and Services Tax (GST) | Business Ethics | specialized elective based on track.',
  },
  'marwadi-university-online||B.Com': {
    sem1: 'Not Mentioned (Verbatim subjects missing from specific link)',
    sem2: 'Not Mentioned (Verbatim subjects missing from specific link)',
    sem3: 'Not Mentioned (Verbatim subjects missing from specific link)',
    sem4: 'Not Mentioned (Verbatim subjects missing from specific link)',
    sem5: 'Not Mentioned (Verbatim subjects missing from specific link)',
    sem6: 'Not Mentioned (Verbatim subjects missing from specific link)',
  },
  'pp-savani-university-online||BBA': {
  },
  'maharishi-markandeshwar-university-online||BCA': {
    sem1: 'Not Mentioned (Verbatim subjects unavailable in link | includes Foundation and Computer Fundamentals)',
    sem2: 'Object Oriented Programming Using C++ | Data Structure | System Analysis and Design | Hindi | Environment Education | C++ Lab | Data Structure Lab | Seminar-I',
    sem3: 'Not Mentioned (Standard BCA core subjects)',
    sem4: 'Not Mentioned (Standard BCA core subjects)',
    sem5: 'Not Mentioned (Standard BCA core subjects)',
    sem6: 'Major Project / Industrial Training',
  },
  'sgt-university-online||B.Com': {
    sem1: 'Management Concepts &amp | Organizational Behaviour | Financial Accounting | Artificial Intelligence For Everyone | Business Environment | Foundational Course: Communicative English | Design Thinking &amp | Innovation | Environmental Science.',
    sem2: 'Human Resource Management | Principles of Marketing | Business Statistics | Business Laws | Advanced Course: Communicative English | Basics of Entrepreneurship Skills | Human Values &amp | Ethics.',
    sem3: 'Business Economics | Corporate Accounting | Business',
    sem4: 'Cost Accounting | Taxation Laws | Financial Markets &amp | Services | Data Analysis Using Excel | Campus to Corporate: Professional Communication and Workplace Skills | Corporate Governance and CSR.',
    sem5: 'Financial Management | Management Accounting | Security Analysis &amp | Portfolio Management | Goods and Service Tax (GST) &amp | Customs Law | Business Analytics | Internship - II.',
    sem6: 'Financial Analysis and Reporting | Financial Derivatives | Financial Analytics | Auditing.',
  },
  'university-of-mysore-online||BBA': {
    sem1: 'Principles of Management | Business Economics | Financial Accounting | English | Environmental Studies.',
    sem2: 'Organizational Behaviour | Marketing Management | Human Resource Management | Business Mathematics | Constitution of India.',
    sem3: 'Financial Management | Cost Accounting | Business Law',
    sem4: 'Strategic Management | Entrepreneurship Development | Business Statistics | International Business | Elective 1.',
    sem5: 'Operations Management | Business Ethics | Elective 2 | Elective 3 | Summer Training / Project.',
    sem6: 'Management Accounting | E-Business | Elective 4 | Elective 5 | Major Project.',
  },
  'university-of-mysore-online||BCA': {
    sem1: 'Computer Fundamentals | Programming in C | Mathematics - I | English | Web Designing.',
    sem2: 'Data Structures | Object Oriented Programming with C++ | Mathematics - II | Database Management Systems | Environmental Studies.',
    sem3: 'Java Programming | Operating Systems | Computer Networks | Software Engineering | Python Programming.',
    sem4: 'PHP and MySQL | Advanced Java | Android Application Development | Elective 1 | Mini Project.',
    sem5: 'Cloud Computing | Information Security | Elective 2 | Elective 3 | Summer Internship.',
    sem6: 'Artificial Intelligence | Machine Learning | Elective 4 | Major Project.',
  },
  'university-of-mysore-online||B.Com': {
    sem1: 'Business Organization and Management | Financial Accounting - I | Business Economics | English | Environmental Studies.',
    sem2: 'Corporate Accounting - I | Business Law | Banking and Finance | Business Mathematics | Constitution of India.',
    sem3: 'Financial Accounting - II | Cost Accounting | Income Tax - I | Marketing Management | Management Information Systems.',
    sem4: 'Corporate Accounting - II | Income Tax - II | Business Statistics | Auditing | Elective 1.',
    sem5: 'Management Accounting | Financial Management | Elective 2 | Elective 3 | Summer Project.',
    sem6: 'Principles of Marketing | Entrepreneurship | Elective 4 | Elective 5 | Major Project.',
  },
  'karnataka-state-open-university-online||B.Com': {
    sem1: 'Language 1 &amp | Indian Constitution | Human Rights and Environmental Studies | Commercial Communication–I | Financial Accounting | Business Organization &amp | Management | Micro Economics',
    sem2: 'Language 1 &amp | Fundamentals of Computer Applications | Commercial Communication–II | Macro Economics | Cost Accounting | Company Accounting',
    sem3: 'Language 1 &amp | Income Tax &amp | GST | Company Law | Business Management–II | Accounting &amp | Finance–II',
    sem4: 'Auditing | Business Law | Statistic | Business Management–III | Accounting &amp | Finance–III',
    sem5: 'Advanced Accountancy | Management of Financial Services',
    sem6: 'Major Project / Elective specialization',
  },
  'christ-university-online||B.Com': {
    sem1: 'Fundamentals of Accounting | Financial Accounting and Reporting | Business Mathematics and Statistics.',
    sem2: 'Auditing | Financial Management | Corporate Law.',
    sem3: 'Management Accounting | Financial Markets and Services | Organizational Behaviour.',
    sem4: 'Income Tax | Corporate Law (Advanced) | Indirect Taxation.',
    sem5: 'Human Resource Management | Financial Market and Institutions | Cost Accounting | Entrepreneurship.',
    sem6: 'Financial Statement Analysis | Project Management | Advanced Accounting.',
  },
  'dayananda-sagar-university-online||BCA': {
  },
  'dayananda-sagar-university-online||B.Com': {
    sem1: 'Business Accounting | Managerial Economics | Management and Behavioural Practices | Corporate Governance and Business Ethics | Mastering English Communication.',
    sem2: 'Financial Accounting | Business Laws | Business Mathematics | Marketing Management | Basics of Excel.',
    sem3: 'Corporate Accounting | Advanced Financial Accounting | Business Statistics | Advanced Excel | Introduction to FinTech.',
    sem4: 'Income Tax | Auditing | Cost Accounting | Digital Banking and Financial Services | Blockchain in Finance.',
    sem5: 'Management Accounting | Financial Management | Preparedness for Interview | Discipline Electives | Internship.',
    sem6: 'Strategic Management | Entrepreneurship and Ethics | FinTech Analytics',
  },
  'bharath-university-online||BBA': {
    sem1: 'Language - I | English - I | Principles of Management | Basis of Business Statistics | Environmental Studies',
    sem2: 'Language - II | English - II | Organizational Behavior | Economics for Executives | Value Education - Human Rights',
    sem3: 'Financial Accounting | Production and Operations Management | Marketing Management | PC Software (MS Office) - Theory | PC Software (MS Office) - Practical',
    sem4: 'Human Resource Management | Business Law | Cost &amp | Management Accounting | Introduction to Business Analysis | Naan Mudhalvan - Skill Course',
    sem5: 'Financial Management | Quantitative Techniques for Management',
    sem6: 'Strategic Management | Business Ethics and Global Business | Elective - III: Consumer Behaviour | Elective - IV: Supply Chain Management | Project Work and Viva-Voce',
  },
  'hindustan-institute-technology-online||BCA': {
    sem1: 'Computer Fundamentals and Organization | Programming in C | Mathematical Foundations | English Communication | C Programming Lab',
    sem2: 'Data Structures and Algorithms | Operating Systems | Database Management Systems | Discrete Mathematics | Data Structures Lab | DBMS Lab',
    sem3: 'Object Oriented Programming using Java | Computer Networks | Software Engineering | Probability and Statistics | Java Programming Lab',
    sem4: 'Python Programming | Web Technologies | Computer Architecture | Financial Management | Python Programming Lab | Web Technology Lab',
    sem5: 'Mobile Application Development | Cloud Computing | Open Source Technologies | Elective - I | Mobile App Development Lab',
    sem6: 'Big Data Analytics | Artificial Intelligence | Elective - II | Project Work',
  },
  'hindustan-institute-technology-online||B.Com': {
    sem1: 'Financial Accounting - I | Business Economics | Business Management | English - I | Tamil - I / Hindi - I',
    sem2: 'Financial Accounting - II | Marketing Management | Business Mathematics | English - II | Tamil - II / Hindi - II',
    sem3: 'Corporate Accounting - I | Business Law | Banking Theory Law and Practice | Business Statistics | Environmental Science',
    sem4: 'Corporate Accounting - II | Company Law | Indirect Taxes | Cost Accounting | General Proficiency',
    sem5: 'Management Accounting | Income Tax Law and Practice | Auditing | Financial Management | Entrepreneurship Development',
    sem6: 'Practical Auditing | Financial Markets and Services | E-Commerce | Human Resource Management | Project Work',
  },
  'karunya-kcode-online||B.Com': {
    sem1: 'English for Communication | Financial Accounting - I | Business Organization | Business Economics | Principles of Marketing',
    sem2: 'Professional English | Financial Accounting - II | Banking Theory Law and Practice | Company Law and Secretarial Practice | Business Statistics With R',
    sem3: 'Business Law | Advanced Accounting | Income Tax | Business',
    sem4: 'Corporate Accounting-I | Principles of Auditing | Cost Accounting -I | Indirect Taxes | Management Accounting',
    sem5: 'Corporate Accounting-II | Cost Accounting-II | Financial Management | Indian Financial System | International Business',
    sem6: 'Fundamentals of Advertising | New Venture Creation | Portfolio Management | Value Education',
  },
  'aligarh-muslim-university-online||BA': {
    sem1: 'English Language I | Ethics and Culture/Sunni Theology/Shia Theology | Compulsory Urdu/Elementary Urdu | Introduction to English Literature-I | Indian Writing in English-I',
    sem2: 'English Language II | Ethics and Culture/Sunni Theology/Shia Theology | Compulsory Urdu/Elementary Urdu | Introduction to English Literature-II | Indian Writing in English-II',
    sem3: 'English Language III | Environmental Studies | Compulsory Urdu/Elementary Urdu | British Literature-I | American Literature-I',
    sem4: 'English Language IV | Environmental Studies | Compulsory Urdu/Elementary Urdu | British Literature-II | American Literature-II',
    sem5: 'British Literature-III | Women’s Writing in English | Literary Criticism-I | Post-Colonial Literature-I',
    sem6: 'British Literature-IV | Contemporary Literature | Literary Criticism-II | Post-Colonial Literature-II',
  },
  'sharda-university-online||BCA': {
    sem1: 'Programming for Problem Solving using C | Computer Fundamentals and Organization | Mathematical Foundations | English Communication | C Programming Lab',
    sem2: 'Object Oriented Programming using C++ | Data Structures and Algorithms | Database Management Systems | Discrete Mathematics | C++ Lab | DBMS Lab',
    sem3: 'Programming in Java | Computer Networks | Software Engineering | Probability and Statistics | Java Programming Lab | Web Technology Lab',
    sem4: 'Python Programming | Operating Systems | Computer Architecture | Web Technologies | Python Lab | OS Lab',
    sem5: 'Mobile Application Development | Cloud Computing | Elective-I | Elective-II | Mobile App Development Lab | Mini Project',
    sem6: 'Artificial Intelligence | Cyber Security | Elective-III | Major Project',
  },
  'integral-university-online||BCA': {
    sem1: 'Computer Fundamentals | Programming in C | Mathematical Foundation-I | Professional Communication | C Programming Lab',
    sem2: 'Data Structures using C | Operating System | Discrete Mathematics | Database Management Systems | Data Structure Lab | DBMS Lab',
    sem3: 'Object Oriented Programming using Java | Computer Networks | Software Engineering | Numerical and Statistical Techniques | Java Lab',
    sem4: 'Python Programming | Web Technologies | Computer Organization and Architecture | Financial Management | Python Lab | Web Technology Lab',
    sem5: 'Mobile Application Development | Cloud Computing | Artificial Intelligence | Elective-I | Mobile App Lab | Mini Project',
    sem6: 'Cyber Security | Big Data Analytics | Elective-II | Major Project Key Differentiator: Strong focus on &quot | Numerical and Statistical Techniques&quot | alongside modern Python and Cloud modules.',
  },
  'integral-university-online||B.Com': {
    sem1: 'Financial Accounting | Business Organization | Business Communication | Micro Economics | Business Mathematics',
    sem2: 'Advanced Accounting | Marketing Management | Macro Economics | Business Statistics | Environmental Studies',
    sem3: 'Corporate Accounting | Business Law | Banking Theory | Cost Accounting | Computer Applications',
    sem4: 'Income Tax Law | Company Law | Indirect Taxes | Management Accounting | Entrepreneurship',
    sem5: 'Auditing | Financial Management | Indian Financial System | Elective-I | Elective-II',
    sem6: 'Practical Auditing | Financial Markets | E-Commerce | Project Work Key Differentiator: Includes &quot | Practical Auditing&quot | and &quot | E-Commerce&quot | as core modules in the final year.',
  },
  'shobhit-university-online||BBA': {
    sem1: 'Principles of Management | Business Economics | Financial Accounting | Business Communication | Business Mathematics.',
    sem2: 'Organizational Behavior | Marketing Management | Business Statistics | Environmental Studies | Macro Economics.',
    sem3: 'Human Resource Management | Cost Accounting | Business Law | IT in Management | Production &amp | Operations Management.',
    sem4: 'Financial Management',
    sem5: 'Strategic Management | Sales &amp | Distribution Management | Logistics &amp | SCM | Digital Marketing | Training &amp | Development.',
    sem6: 'Business Ethics | Retail Management | Advertising &amp | Sales Promotion | Industry Project.',
  },
  'shobhit-university-online||BCA': {
    sem1: 'Computer Fundamentals | Programming in C | Mathematical Foundation-I | Communication Skills | C Programming Lab.',
    sem2: 'Data Structures using C | Operating System | Discrete Mathematics | Database Management Systems | Data Structures Lab.',
    sem3: 'Object Oriented Programming using Java | Computer Networks | Software Engineering | Numerical and Statistical Techniques | Java Lab.',
    sem4: 'Python Programming | Web Technologies | Computer Organization and Architecture | Python Lab.',
    sem5: 'Mobile Application Development | Cloud Computing | Artificial Intelligence | Mobile App Lab | Mini Project.',
    sem6: 'Cyber Security | Big Data Analytics | Major Project.',
  },
  'mangalayatan-university-online||BBA': {
    sem1: 'Fundamentals of Management | Business Math | Managerial Economics | Financial Accounting | Environmental Studies | English',
    sem2: 'Macro Economics | Business Statistics | Business Ethics & CSR | Communication Lab',
    sem3: 'Management Accounting | Principles of Marketing | Business Laws | IT Tools for Business',
    sem4: 'Digital Marketing | Income Tax | Personal Selling | Entrepreneurship Development',
    sem5: 'Business Policy & Strategy | Financial Management | Operations Management | Summer Training Report',
    sem6: 'Management Information System | Industrial Project',
  },
  'mangalayatan-university-online||BCA': {
    sem1: 'Computer Fundamentals | Programming in C | Math | Web Designing | Communication Skills',
    sem2: 'Data Structures | OOP with C++ | Math-2 | DBMS',
    sem3: 'Java Programming | Computer Networks | Software Engineering | Python',
    sem4: 'PHP & MySQL | Advanced Java | Android App Development | Mini Project-1',
    sem5: 'Cloud Computing | Information Security | Summer Internship',
    sem6: 'Machine Learning | Major Project',
  },
  'yenepoya-university-online||B.Com': {
    sem1: 'Financial Accounting | Business Economics | Business Management | Business Law',
    sem2: 'Corporate Accounting | Marketing Management | Business Statistics',
    sem3: 'Cost Accounting | Income Tax | Banking & Finance',
    sem4: 'Management Accounting | Auditing | E-Commerce',
    sem5: 'Financial Management | Advanced Accounting',
    sem6: 'GST | Project Work',
  },
  'bharati-vidyapeeth-university-online||BBA': {
    sem1: 'Management Fundamentals | Business Mathematics | Managerial Economics | Financial Accounting',
    sem2: 'Macro Economics | Business Statistics | Business Ethics & CSR',
    sem3: 'Management Accounting | Principles of Marketing | Business Laws | IT Tools for Business',
    sem4: 'Digital Marketing | Income Tax | Personal Selling | Entrepreneurship Development',
    sem5: 'Strategic Management | Financial Management | Operations Management | Summer Internship | Specialisation Electives I & II',
    sem6: 'MIS | Specialisation Electives III & IV | Industrial Project',
  },
  'bharati-vidyapeeth-university-online||BCA': {
    sem1: 'IT Trends | Foundation of Programming | Digital Computer Fundamentals | Web Designing Fundamentals | Communication Skills',
    sem2: 'E-Commerce Fundamentals | Advanced Web Designing | OOP | Database Fundamentals',
    sem3: 'Computer Oriented Management Systems | System Analysis & Design | Data Structures & Algorithms',
    sem4: 'Software Engineering | Advanced DBMS | Open Source Technology | Computer Networks | Elective-I',
    sem5: 'OOP using JAVA | Fundamentals of Visual Programming | Multi-Paradigms Programming | Elective-II',
    sem6: 'Basics of Mobile Applications | Software Testing | Project Work',
  },
  'kl-university-online||BBA': {
    sem1: 'Integrated Professional English | Business Mathematics | Business Environment | Business Economics | Perspectives of Management | IT for Business Managers | Ecology & Environment',
    sem2: 'English Proficiency | Introduction to Financial Accounting | Business Statistics | MIS | Foreign Language | Design Thinking & Innovation-I',
    sem3: 'Business Communication Skills | Management Accountancy | Marketing Management | HRM | Business Research Methods | Macro Economics | Design Thinking & Innovation-II',
    sem4: 'Cost Accountancy | Production & Operations Management | Business Law | Financial Management | Business Model Generation | Campus to Corporate',
    sem5: 'Business Analytics | Soft Skills | Fundamentals of Digital Marketing | Research Paper Writing | Elective 1',
    sem6: 'Entrepreneurship | Strategic Management | Enterprise Resource Planning | Elective 3',
  },
  'kl-university-online||BCA': {
    sem1: 'Integrated Professional English | Mathematics for Computer Science | Problem Solving through Programming | Computer Organization & Architecture | Ecology & Environment | Essentials of IT',
    sem2: 'English Proficiency | Data Structures | OOP through Java | Mobile App Development | Web & Social Media Technologies',
    sem3: 'Software Engineering | DBMS | Computer Networks | Web Development using Python | Design Thinking & Innovation | Internship-1 | Professional Elective 1',
    sem4: 'Essential Skills for Employability | Java Full Stack Development | OOAD | Professional Elective 2 | Term Paper',
    sem5: 'Foreign Language | Corporate Readiness Skills | Internship-2 | Professional Elective 3',
    sem6: 'Major Project | Professional Elective 4 | MOOCS Certifications',
  },
  'assam-don-bosco-university-online||MA': {
    sem1: 'State and its Elements | Introduction to the Public Administration | Comparative and Development Administration | Public Policy | Engaged Policy and Governance Elective Group I | Policy Formulation-Structures and processes Elective Group II',
    sem2: 'Administrative Theory and Principles | Indian Administration | Public Personnel Administration',
    sem3: 'Budget and Financial Administration in India | Social Welfare Administration | Environmental Governance | Citizens and Administration | Policy Analysis ELECTIVE GROUP I | Dissertation-Phase I | Data Management and Visualization | Innovation in Governance | Service Learning-(Community Engagement)',
    sem4: 'Decentralization and Local Governance | E-Governance | Policy Implementation (PP) ELECTIVE GROUP I | Tribal Development Policy In North East India | Dissertations-Phase II | Service-Learning Project',
  },
  'guru-ghasidas-vishwavidyalaya-online||M.Com': {
    sem1: 'Organizational Behaviour | Statistical Analysis | Managerial Economics | Corporate Financial Accounting | Accounting for Managerial Decisions',
    sem2: 'Computer Applications in Business | Corporate Legal Framework | Financial Management | Marketing Management',
    sem3: 'Management of Financial Services | Strategic Management | Advanced Corporate Accounting | Discipline Specific Elective (e.g. | Financial Markets | International Marketing)',
    sem4: 'Corporate Governance and Business Ethics | Dissertation | Discipline Specific Elective (e.g. | Security Analysis | Portfolio Management)',
  },
  'guru-ghasidas-vishwavidyalaya-online||MA': {
    sem1: 'Poetry I (Renaissance to Romantic) | Drama I (Shakespeare to Sheridan) | Prose | History of English Literature',
    sem2: 'Poetry II (Victorian to Modern) | Drama II (Ibsen to Beckett) | Fiction I (18th-19th Century) | Literary Criticism and Theory I',
    sem3: 'Fiction II (Modern) | Literary Criticism and Theory II | Indian Writing in English | Elective (Linguistics and Stylistics | New Literatures in English)',
    sem4: 'American Literature',
  },
  'gujarat-university-online||M.Com': {
  },
  'dr-babasaheb-ambedkar-open-university-online||MA': {
    sem1: 'Microeconomics – I | Macroeconomics – I | Quantitative Methods in Economics – I | Environmental Economics – I | Industrial Economics- I.',
    sem2: 'Microeconomics- II | Macroeconomics- II | Environmental Economics – II | Industrial Economics- II | Cooperation.',
    sem3: 'International Economics | Quantitative Methods in Economics- II | Economics of Demography | Public Economics',
    sem4: 'Indian Economy | Theories of Economic Growth and Development | Indian Economic Thinkers | Financial Institutions and Market | Modern Economic Philosophy OR Project.',
  },
  'pp-savani-university-online||M.Com': {
  },
  'manav-rachna-online||M.Com': {
    sem1: 'Economics for Managerial Decisions – I | Quantitative Techniques | Accounting Theory and Practices | Marketing Management | Organisation Theory and Behaviour.',
    sem2: 'Cost and Management Accounting | Human Resource Management | Financial Management and Policy | Economics for Managerial Decisions – II | E-Commerce.',
    sem3: 'Business Policy and Strategic Management | Corporate Accounting Practices | Advanced Business',
    sem4: 'International Accounting | Financial Analytics | Marketing Analytics | Direct Taxation | Indirect Taxation | Investment Analysis and Portfolio Management | Project Management.',
  },
  'central-university-himachal-pradesh-online||MA': {
    sem1: 'Microeconomic Theory | Mathematics for Economists | Contemporary issues in Indian Economy-I | Statistical Methods | Basics of Macro Economics | Indian Knowledge System | Foundation of Indian Culture.',
    sem2: 'Macroeconomic Theory | Development Economics | International Economics | Introductory Econometrics | Indian Economic Thought (IKS) | Contemporary Issues in Indian Economy-II | Cultural Heritage of Bharat.',
    sem3: 'Public Economics',
    sem4: 'Agricultural Economics | Econometrics with Statistical Software - II | Academic Writing for Economics (Theory) | Academic Writing for Economics (VivaVoce) | Dissertation (M.A.) | Viva-Voce.',
  },
  'university-of-mysore-online||M.Com': {
    sem1: 'Business Policy and Environment | Statistical Analysis | Marketing Management | Financial Management | Accounting Theory | Business Communication.',
    sem2: 'Managerial Economics',
    sem3: 'Strategic Management | Advanced Cost and Management Accounting | Elective 1 | Elective 2 | Elective 3.',
    sem4: 'International Business | Corporate Governance and Business Ethics | Elective 4 | Elective 5 | Dissertation / Project.',
  },
  'sathyabama-university-online||MSc': {
    sem1: 'Financial Accounting-I | Business Economics | Business Management | English-I | Tamil-I/Hindi-I.',
    sem2: 'Financial Accounting-II | Marketing Management | Business Mathematics | English-II | Tamil-II/Hindi-II.',
    sem3: 'Corporate Accounting-I | Business Law | Banking Theory Law &amp | Practice | Business Statistics | Environmental Science.',
    sem4: 'Corporate Accounting-II | Company Law | Indirect Taxes | Cost Accounting | General Proficiency.',
  },
  'manonmaniam-sundaranar-university-online||MA': {
    sem1: 'Micro Economic Analysis I | Macro Economic Analysis I | Mathematical Economics | Indian Economy',
    sem2: 'Micro Economic Analysis II | Macro Economic Analysis II | Statistical Methods for Economics',
    sem3: 'Public Economics | International Economics | Environmental Economics | Development Economics',
    sem4: 'Monetary Economics | Industrial Economics | Agricultural Economics | Dissertation/Project',
  },
  'sharda-university-online||M.Com': {
    sem1: 'Managerial Economics | Financial Accounting | Organizational Behaviour | Business Statistics | IT for Managers',
    sem2: 'Financial Management',
    sem3: 'Blockchain Technology in Finance | Algorithmic Trading | Cybersecurity in Banking | Insurtech &amp | Wealthtech | Elective I',
    sem4: 'Regtech &amp | Compliance | Fintech Strategy &amp | Innovation | Master Project/Dissertation',
  },
  'andhra-university-online||MA': {
    sem1: 'Foundations of Sociology | Sociological Theories-I',
    sem2: 'Research Methods in Social Sciences | Indian Social Structure',
    sem3: 'Political Sociology | Economic Sociology',
    sem4: 'Contemporary Sociological Theories | Project',
  },
  'mangalayatan-university-online||MSc': {
    sem1: 'Advanced Abstract Algebra | Topology | Integral Transforms | Special Functions | MATLAB | Differential Geometry',
    sem2: 'Measure Theory & Integration | PDEs | Discrete Mathematics | Analytical Mechanics',
    sem3: 'Functional Analysis | Mathematical Statistics | Optimisation Techniques | Fluid Mechanics | Python',
    sem4: 'Integral Equation | Operation Research | Integral Transforms | MATLAB | Graph Theory',
  },
  'mangalayatan-university-online||M.Com': {
    sem1: 'Principles of Management | Financial Accounting | Marketing Management | Cost Accounting/Indian Financial System | Management of Self & Career',
    sem2: 'Financial Management | Indian Economic Policy | Business Environment | Management Accounting/Security Analysis | Operations of Stock Exchanges',
    sem3: 'Tax Planning & Management | Research Methodology | Accounting & Control System/Portfolio Management',
    sem4: 'Strategic Management | International Business | Corporate Governance & Business Ethics | Dissertation',
  },
  'mangalayatan-university-online||MA': {
    sem1: 'Poetry-I (Renaissance to Romantic) | Drama-I (Shakespeare to Restoration) | Prose | History of English Literature 1500-1660',
    sem2: 'Poetry-II (Victorian to Modern) | Drama-II | Fiction-I (18th-19th Century) | Literary Criticism & Theory I',
    sem3: 'Fiction-II (Modern) | Literary Criticism & Theory II | Indian Writing in English | Electives',
    sem4: 'American Literature | Research Methodology | Dissertation | Electives',
  },
  'amity-university-online||MCA': {
    sem1: 'Professional Communication | Core Java | Advanced Database Management Systems | Advanced Software Engineering Principles | Graph Theory and Combinatorics',
    sem2: 'Research Methodology | Data Structures and Algorithm Design | Cognitive Analytics and Social Skills for Professional | Network Security and Cryptography',
    specSyllabus: {
      'general': {
        sem3: 'Unix/Linux Programming | Seminar (Evaluation) | Cloud Infrastructure and Services | Quantitative Aptitude | Professional Ethics',
        sem4: 'Augmented Reality and Virtual Reality | Blockchain Technology and Management Business Management | Blockchain Technology and Management Technical Development | Elective Courses General | Machine Learning | Machine Learning and Artificial Intelligence',
      },
      'Artificial Intelligence and Machine Learning': {
        sem3: 'Cloud Infrastructure and Services | Deep Learning & Neural Network | Professional Ethics | Quantitative Aptitude | Seminar (Evaluation) | Social Media & Text Analytics | Unix/Linux Programming',
        sem4: 'Major Project',
      },
      'Financial Technology and AI': {
        sem3: 'Cloud Infrastructure and Services | Unix/Linux Programming | Seminar (Evaluation) | Quantitative Aptitude | Professional Ethics | Cybersecurity, Cloud Computing and Big Data in FinTech | WealthTech, RegTech and FinTech Innovation',
        sem4: 'Major Project',
      },
      'Cyber Security': {
        sem3: 'Cloud Infrastructure and Services | UNIX/Linux Programming | Professional Ethics | Quantitative Aptitude | Seminar (Evaluation) | Application Security, Data Security, Malware Analysis | SIEM and Security Operation, UEBA',
        sem4: 'Major Project',
      },
      'Software Engineering': {
        sem3: 'Cloud Infrastructure and Services | UNIX/Linux Programming | Professional Ethics | Quantitative Aptitude | Seminar (Evaluation) | Getting Cloud Ready for Development | Microservices Master',
        sem4: 'Major Project',
      },
      'Blockchain Technology': {
        sem3: 'Architecting Blockchain Solutions | Building Ethereum Applications | Professional Ethics | Programming Fundamentals Golang and Solidity | Quantitative Aptitude | Seminar (Evaluation) | Technicalities and Implementation of Blockchain | Unix/Linux Programming',
        sem4: 'Major Project',
      },
    },
    highlight: 'UGC-entitled and NAAC A+ accredited degree; Globally recognized online program; Industry-aligned curriculum with focus on AI, ML, Data Science and Cybersecurity; Collaborations with industry leaders like HCLTech, Paytm, TCS iON and KPMG; Specializati',
    programOverview: 'The online MCA at Amity University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-entitled and NAAC A+ accredited degree. Globally recognized online program. Industry-aligned curriculum with focus on AI, ML, Data Science and Cybersecurity. Collaborations with industry leaders like HCLTech, Paytm, TCS iON and KPMG. Specialization programs co-developed with companies like Paytm (FinTech & AI).\n\nThere are 5 specialisation options, including Artificial Intelligence and Machine Learning, Financial Technology and AI, Cyber Security, and 2 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.',
  },
  'amrita-vishwa-vidyapeetham-online||MCA': {
    sem1: 'Foundations of Computer Systems | Mathematical Foundations for Computer Applications | Object Oriented Programming using Java | Stream Core 1 | Stream Core 2',
    sem2: 'Data Structures and Algorithms | Soft Skills | Stream Core Mathematics | Stream Core 3 | Stream Core 4 | Professional Elective 1',
    specSyllabus: {
      'Artificial Intelligence and Machine Learning': {
        sem3: 'Software Project Management | Research Methodology | Complex Network Analysis | Reinforcement Learning | MCA AI & ML Elective II | MCA AI & ML Elective III | Case Study',
        sem4: 'Capstone Project | MCA AI & ML Elective IV | MCA AI & ML Elective V | Elective Data Engineering for AI | Elective No SQL Databases | Elective Applications of Machine Learning | Elective Computational Statistics | Elective IoT for AI | Elective Computer Vision | Elective Business Analytics and Visualization | Elective Generative AI and LLM',
      },
      'Cybersecurity': {
        sem3: 'Software Project Management | Research Methodology | Blockchain and Decentralized Applications | Cyber Forensics | MCA Cyber Security Elective II | MCA Cyber Security Elective III | Case Study',
        sem4: 'Capstone Project | MCA Cyber Security Elective IV | MCA Cyber Security Elective II | Cybersecurity Governance Risk and Compliance | Essentials of Cyber Security | Cyber Security Law | System Security | Web Application Security | Cloud and Infrastructure Security | Vulnerability Assessment and Penetration Testing | Zero Trust Architecture',
      },
      'General': {
        sem3: 'Software Project Management | Research Methodology | Stream Core 5 | Stream Core 6 | Professional Elective 2 | Professional Elective 3 | Case Study',
        sem4: 'Capstone Project | Professional Elective 4 | Professional Elective 5 | Stream Core Mathematics Probability and Statistics | Stream Core Mathematics Computational Linear Algebra | Stream Core Mathematics Mathematical Foundations for Cryptography | Programming Essentials in Python | Advanced Computer Networks | Software Engineering and Design Patterns | Advanced DBMS | Software Testing | Full Stack Development',
      },
    },
    highlight: 'UGC-entitled and AICTE-approved degree; NAAC A++ accredited top-ranked university (NIRF Rank 8); Globally recognized degree with WES recognition (USA & Canada); Specializations in Artificial Intelligence, Cybersecurity and General track; Industry-ali',
    programOverview: 'The online MCA at Amrita Vishwa Vidyapeetham is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-entitled and AICTE-approved degree. NAAC A++ accredited top-ranked university (NIRF Rank 8). Globally recognized degree with WES recognition (USA & Canada). Specializations in Artificial Intelligence, Cybersecurity and General track. Industry-aligned curriculum with focus on emerging technologies.\n\nStudents pick a specialisation from tracks like Artificial Intelligence and Machine Learning and Cybersecurity. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },
  'assam-don-bosco-university-online||MCA': {
    sem1: 'Mathematical Foundation for Computer Science | Theory of Computation | Operating Systems | Data Structures and Algorithms | Programming Through Java | Operating Systems Lab | Data Structures and Algorithms Lab | Programming Through Java Lab',
    sem2: 'Software Engineering | Data Communication and Computer Networks | Advanced Database Management Systems | Internet Technology and Applications | Sensor Networks and Internet of Things | Data Communication and Computer Networks Lab | Internet Technology and Applications Lab | Advanced Database Management Systems Lab | Service Learning/Community Engagement',
    sem3: 'Cyber Law and IT Security | Machine Learning | Enterprise Resource Planning | Research Methodology and IPR | Machine Learning Lab | Elective I Artificial Intelligence | Elective I Data Science | Elective II Artificial Intelligence | Elective II Data Science',
    sem4: 'Major Project | Elective III Artificial Intelligence | Elective III Data Science',
    highlight: 'UGC & AICTE Approved Degree; NAAC A+ Accredited University; Specializations in AI & Machine Learning and Data Science; Industry-Aligned Curriculum; Strong Focus on Programming & IT Skills; Practical Learning with Projects & Labs; Flexible Fully Onlin',
    programOverview: 'The online MCA at Assam Don Bosco University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC & AICTE Approved Degree. NAAC A+ Accredited University. Specializations in AI & Machine Learning and Data Science. Industry-Aligned Curriculum. Strong Focus on Programming & IT Skills.\n\nStudents pick a specialisation from tracks like Artificial Intelligence & Machine Learning and Data Science. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },
  'bs-abdur-rahman-university-online||MCA': {
    sem1: 'Mathematical Foundation for Computer Applications | Computer Organization and Operating System | Database Management Systems | Computer Networks | Data Structures and Algorithms using C/C++ | Object Oriented Software Engineering | Data Structures and Algorithms Laboratory using C/C++ | Programming in C and C++ Laboratory | DBMS Laboratory',
    sem2: 'Programming in Java | Resource Management Techniques | Cloud Computing | Mobile Application Development | Introduction to Data Science | Elective I | Communication Skills Laboratory | Advanced Technology Laboratory (Cloud/Mobile/Data Science) | Programming in Java Laboratory',
    sem3: 'Python Programming | Block Chain Technologies | Big Data Analytics | Machine Learning Techniques | Advanced Web Development and Services | Elective II | Customer Relationship Management | Python Programming Laboratory | Mini Project',
    sem4: 'Project',
    highlight: 'Industry-focused curriculum with emphasis on programming and emerging technologies; Strong foundation in computer applications and software development; Access to virtual labs, live classes and MOOCs; Courses delivered with support from IIT professor',
    programOverview: 'The online MCA at B.S. Abdur Rahman Institute of Science and Technology is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nIndustry-focused curriculum with emphasis on programming and emerging technologies. Strong foundation in computer applications and software development. Access to virtual labs, live classes and MOOCs. Courses delivered with support from IIT professors under QEEE program. Exposure to real-world projects and practical learning.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'centurion-university-online||MCA': {
    sem1: 'Software Engineering | Programming in C | Data Analysis and Visualization using Python | Relational and Distributed Databases | Customer Experience Design and Programming | Job Readiness',
    sem2: 'Machine Learning using Python | Cloud Practitioner (AWS) | Cloud Fundamentals (Azure) | Java Programming | Data Structures with Competitive Coding | Information Security (CISCO) | System Administrator (RedHat)',
    sem3: 'Design and Analysis of Algorithms | Machine Learning for Predictive Analytics | Deep Learning for Image Analytics | Data Analytics using Tableau',
    sem4: 'Project | Android Development with Kotlin',
    highlight: 'Strong foundation in programming; Database management; Networking; Web development; Artificial Intelligence; Cloud computing; Data analytics; Cybersecurity; Industry-oriented curriculum; Real-time projects; Practical exposure; Personalized learning p',
    programOverview: 'The online MCA at Centurion University of Technology and Management is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nStrong foundation in programming. Database management. Web development. Artificial Intelligence. Cloud computing.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'chandigarh-university-online||MCA': {
    sem1: 'Advanced Database Management System | Advanced Computer Networks | Web Programming | Python Programming | Network Security and Cryptography',
    sem2: 'Advanced Internet Programming | Design and Analysis of Algorithms | Software Testing | Web Application Development | Cyber Security',
    specSyllabus: {
      'Cloud Computing': {
        sem3: 'Introduction to Cloud Computing | Introduction to Amazon Web Services | Introduction to Microsoft Azure services | Cloud Programming | Cloud Virtualization',
        sem4: 'Introduction to Google Cloud services | Introduction to IBM Cloud Services | Major Project',
      },
      'Full Stack Development': {
        sem3: 'HTML, CSS and Javascript | User Interface, Experience, Design | DevOps -1 (GIT, Jenkins, Docker) | Software Architecture | Prototyping',
        sem4: 'Web Services- Rest API, ReactJS, NodeJS Development | DevOps-2 (Ansible, Puppet, Nagios) | Major Project',
      },
      'Data Analytics': {
        sem3: 'Data Analytics Using Python | SQL for Data Analytics | Web Analytics | Digital Media Analytics | IOT and Data Analytics',
        sem4: 'Data Analytics using R | Data Analytics for decision making | Major project',
      },
      'Artificial Intelligence and Machine Learning': {
        sem3: 'Machine Learning in Python | Statistics and Python in Machine Learning | Business Application of Machine Learning | Deep Learning and NLP | Web, Social Analytics and Visualization',
        sem4: 'Big data hadoop | IOT cloud and watson analytics | Major project',
      },
    },
    highlight: 'Industry-aligned curriculum; Focus on cloud computing and emerging technologies; Training in programming languages like Python, Java, PHP; Web development skills including HTML, CSS, JavaScript; Exposure to data analytics and modern IT tools; Flexibl',
    programOverview: 'The online MCA at Chandigarh University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nIndustry-aligned curriculum. Focus on cloud computing and emerging technologies. Training in programming languages like Python, Java, PHP. Web development skills including HTML, CSS, JavaScript. Exposure to data analytics and modern IT tools.\n\nThere are 4 specialisation options, including Cloud Computing, Full Stack Development, Data Analytics, and 1 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.',
  },
  'christ-university-online||MCA': {
    sem1: 'Mathematics for Computer Science | Computer Organization and Architecture | Problem Solving Techniques using C | Advanced Operating System | Advanced Database Management Systems',
    sem2: 'Data Communication and Computer Networks | Java Programming | Data Structures and Algorithms | Python Programming (Swayam Course) | Full Stack Development | Artificial Intelligence and Machine Learning',
    sem3: 'Cloud Computing | Software Engineering | Research Methodology | Elective 1 (AI for Healthcare / AI for Security / Quantum Computing) | Elective 2 (Applied Statistics using R / Digital Forensics / Game Programming) | Elective 3 (Business Intelligence / Network Security and Cryptography / Robotics Process Automation)',
    sem4: 'Internet of Things | Software Project Management | Elective 1 (Natural Language Processing / Blockchain Technology / Augmented and Virtual Reality) | Elective 2 (Neural Networks and Deep Learning / Cyber Security and Incident Response Management / Industrial IoT) | Elective 3 (Big Data Analytics / Predictive Analytics / Generative AI) | Elective 4 (Accounting and Finance Management / Econometrics / Computational Social Science / Cognitive Psychology) | Major Project',
    highlight: 'AICTE-Approved Online MCA Program; NAAC A+ Accredited Deemed-to-be University; Strong Focus on Industry-Aligned Curriculum (AI, Cloud, Web, Mobile Development); Hands-On Learning with Real-World Projects & System Design; Covers Core + Emerging Techno',
    programOverview: 'The online MCA at Christ is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nAICTE-Approved Online MCA Program. NAAC A+ Accredited Deemed-to-be University. Strong Focus on Industry-Aligned Curriculum (AI, Cloud, Web, Mobile Development). Hands-On Learning with Real-World Projects & System Design. Covers Core + Emerging Technologies (ML, Data, Cloud).\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'datta-meghe-university-online||MCA': {
    sem1: 'Mathematical Logic, Combination & Graph Theory | Advanced Software Engineering | UI Frameworks | Front End Development & Programming | GEC (Database Design Development) | SEC (Front End Development & Programming Lab) | SEC (Database Design Development Lab) | AECC (Business Communication)',
    sem2: 'Applied Machine Learning | Statistical Data Analytics with R | DSE (Reinforcement Learning / Develop Enterprise Application) | DSE (Deep Learning / Application Integration) | GEC (Software Testing and Quality Assurance) | SEC (Machine Learning Lab) | SEC (R Programming Lab) | AECC (Research Methodology with Writing Research Paper)',
    sem3: 'AI Implementation Capstone',
    sem4: 'In-Plant Project Work and Seminar / Company Internship',
    highlight: 'UGC-Approved Deemed-to-be University with NAAC Accreditation; 2-Year Online MCA with Flexible Learning Model; Industry-Relevant Curriculum Focused on Software Development & IT Applications; Strong Emphasis on Practical Learning & Real-World Projects;',
    programOverview: 'The online MCA at Datta Meghe Institute of Higher Education and Research is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-Approved Deemed-to-be University with NAAC Accreditation. 2-Year Online MCA with Flexible Learning Model. Industry-Relevant Curriculum Focused on Software Development & IT Applications. Strong Emphasis on Practical Learning & Real-World Projects. Capstone Project & Final Internship for Hands-On Experience.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'dayananda-sagar-university-online||MCA': {
    sem1: 'Advanced Data Structures and Algorithms | Advanced Python Programming | Advanced Operating Systems | Relational Database Management Systems | Mathematical Methods | Advanced Data Structures and Algorithms Lab | Advanced Python Programming Lab | RDBMS Lab',
    sem2: 'Machine Learning with Python | Advanced Java Programming | Design and Analysis of Algorithms | Full Stack Development | Computer Communication Network | Advanced Java Programming Lab | Machine Learning with Python Lab | Full Stack Development Lab | Elective-I (Cloud Computing Technologies / Big Data Analytics / Data Science / Quantum Algorithms / Blockchain Technologies)',
    sem3: 'Cyber Security | Embedded Systems and Internet of Things | Elective-II (Cloud Security & Infrastructure / Data Analytics & Visualization / Artificial Intelligence / Quantum Information / Research Methodology & IPR) | Elective-III (IoT / Data Mining / Deep Learning / Quantum Error Correction / Mobile Application Development Techniques) | Elective-IV (IoT / Data Mining / Deep Learning / Quantum Error Correction / Mobile Application Development Techniques) | Design and Analysis of Algorithms Lab | Mini Project',
    sem4: 'General Elective (Business Data Analytics / Industrial Safety / Operations Research) | Project',
    highlight: 'Industry-Aligned Curriculum with Specializations in AI, Data Science, Cloud, Blockchain & Quantum Computing; Strong Focus on Practical Learning with Cloud Labs & Capstone Projects; Live + Self-Paced Learning (Recorded Lectures + Webinars); Hands-On E',
    programOverview: 'The online MCA at Dayananda Sagar University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nIndustry-Aligned Curriculum with Specializations in AI, Data Science, Cloud, Blockchain & Quantum Computing. Strong Focus on Practical Learning with Cloud Labs & Capstone Projects. Live + Self-Paced Learning (Recorded Lectures + Webinars). Hands-On Experience with Real-World Projects & Coding. Emphasis on Emerging Technologies (AI, ML, IoT, Cybersecurity).\n\nThere are 15 specialisation options, including Cloud Computing Technologies, Data Science, Blockchain Technologies, and 12 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.',
  },
  'desh-bhagat-university-online||MCA': {
    sem1: 'Emerging Technologies | Emerging Technologies Lab | Relational Database Management System | Relational Database Management System Lab | Computer Oriented Numerical and Statistical Methods | Software Engineering | Capstone Project',
    sem2: 'C# Programming | C# Programming Lab | Design and Analysis Of Algorithm | Design and Analysis Of Algorithm Lab | Artificial Intelligence | Digital Marketing | Capstone Project | Data Warehousing and Data Mining',
    sem3: 'Java Programming | Java Programming Lab | Python | Python Lab | Big Data Analytics | Cloud Computing | Cloud Computing Lab | Capstone Project | Internet of Things | Machine Learning',
    sem4: 'Industrial Training',
    highlight: 'UGC-approved and NAAC A+ accredited degree; Fully online and flexible learning; Study anytime anywhere; Industry-aligned curriculum; Specializations in AI, Data Science and Cyber Security; Strong foundation in programming and software development; Co',
    programOverview: 'The online MCA at Desh Bhagat University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-approved and NAAC A+ accredited degree. Fully online and flexible learning. Study anytime anywhere. Industry-aligned curriculum. Specializations in AI, Data Science and Cyber Security.\n\nStudents pick a specialisation from tracks like Cyber Security and AI and Data Science. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },
  'dr-dy-patil-vidyapeeth-online||MCA': {
    sem1: 'Computer Organisation and Architecture | Data Structure Using C | Object Oriented Programming Using C++ | Discrete Mathematics and Combinatorics | Lab - OOPS Using C++ | Business Communication',
    sem2: 'Database Management System | Full Stack Web Development | Software Engineering | Data Communication and Computer Networks | Lab - DBMS | Lab - Full Stack Web Development',
    sem3: 'Core & Advanced Java | Python Programming | Advanced Cloud Computing | Basics of Artificial Intelligence & Machine Learning | Lab - Java & Python Programming | Environment Awareness and Disaster Management',
    sem4: 'Business Analytics | Basics of Blockchain Technology | Cyber Laws & Hacking | Research Project',
    highlight: 'UGC & AICTE Approved Online Degree with NAAC A++ Accreditation; Top Ranked University with 40+ Years of Academic Excellence; Industry-Aligned Curriculum with AI, Cloud, Blockchain & Emerging Tech; 25+ AI Tools Integrated into Learning; 100% Placement',
    programOverview: 'The online MCA at Dr. D.Y. Patil Vidyapeeth (Pune) is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC & AICTE Approved Online Degree with NAAC A++ Accreditation. Top Ranked University with 40+ Years of Academic Excellence. Industry-Aligned Curriculum with AI, Cloud, Blockchain & Emerging Tech. 25+ AI Tools Integrated into Learning. 100% Placement Assistance with 300+ Hiring Partners.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'gla-university-online||MCA': {
    sem1: 'Fundamentals of Computer Science | Software Engineering and Testing | Problem Solving Using Python | Web Technology | Database Management System | Professional Communication I | Problem Solving Using Python Lab | Web Technology Lab | Database Management System Lab | Soft Skills I',
    sem2: 'Problem Solving Using Java | Applied Data Structure and Applications | Machine Learning | Computer Networks | Professional Communication II | Ethics & Values | Problem Solving Using Java Lab | Applied Data Structure and Applications Lab using C/C++ | Mini Project | Soft Skills II',
    sem3: 'Cloud Computing | .Net Framework using C# | Mobile Application Development I | Digital and Social Media Marketing | Full Stack I | Soft Skills III | Environmental Studies | Project I | Cloud Computing Lab | Mobile Application Development I Lab | Digital and Social Media Marketing Lab | Full Stack I Lab | .Net Framework Lab',
    sem4: 'DevOps | Mobile Application Development II | Full Stack Development II | Search Engine Optimization | Soft Skills IV | Project II | DevOps Lab | Mobile Application Development II Lab | Full Stack Development II Lab | Search Engine Optimization Lab',
    highlight: 'UGC-entitled and NAAC A+ accredited program; Industry-aligned curriculum with focus on emerging technologies like Cloud Computing and Machine Learning; Strong emphasis on practical learning with virtual labs and hands-on projects; Certified MOOC-base',
    programOverview: 'The online MCA at G.L.A. University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-entitled and NAAC A+ accredited program. Industry-aligned curriculum with focus on emerging technologies like Cloud Computing and Machine Learning. Strong emphasis on practical learning with virtual labs and hands-on projects. Certified MOOC-based content integrated into curriculum. Continuous assessment through assignments, MCQs, viva and capstone projects.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'galgotias-university-online||MCA': {
    sem1: 'Problem Solving and Computer Programming | Computational Mathematics and Statistics | Database Management System | Digital Computer Organization | English Proficiency and Aptitude Building | Quantitative Aptitude and Reasoning',
    sem2: 'Object Oriented Programming with Java | Machine Learning with Python | Data Structures | Verbal and Quantitative Reasoning | Data Communication & Networking | Operating Systems | Training I | Elective I Internet of Things | Elective I Data Science with R',
    sem3: 'Object Oriented Programming with Java | Machine Learning with Python | Data Structures | Verbal and Quantitative Reasoning | Data Communication & Networking | Operating Systems | Training I | Elective I Internet of Things | Elective I Data Science with R',
    sem4: 'Major Project',
    highlight: 'UGC-DEB and AICTE approved online degree; NAAC A+ accredited university; 2-year postgraduate MCA program; Flexible online learning with live and recorded classes; Industry-aligned curriculum with focus on real-world applications; Strong foundation in',
    programOverview: 'The online MCA at Galgotias University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-DEB and AICTE approved online degree. NAAC A+ accredited university. 2-year postgraduate MCA program. Flexible online learning with live and recorded classes. Industry-aligned curriculum with focus on real-world applications.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'guru-nanak-dev-university-online||MCA': {
    sem1: 'Design And Analysis Of Algorithms | System Software | System Simulation | Design of Programming Languages | Programming Lab-I | Secure Software Development',
    sem2: 'Open Source Software | Distributed Systems | Web Technologies | Microprocessor & It\'s Applications | Programming Lab-II | Information Systems and Security',
    sem3: 'Advanced Software Engineering | Soft Computing | Data Warehousing and Data Mining | Advanced Computer Architecture | Cloud Native Application development | Programming Lab-III',
    sem4: 'Major Project/Industrial Training/Dissertation',
    highlight: 'UGC-approved online degree; Flexible self-paced learning; Learn anytime anywhere; Industry-relevant curriculum; Hands-on projects and practical assignments; Expert faculty guidance; Strong focus on programming and software development; Coverage of da',
    programOverview: 'The online MCA at Guru Nanak Dev University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-approved online degree. Flexible self-paced learning. Learn anytime anywhere. Industry-relevant curriculum. Hands-on projects and practical assignments.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'hindustan-institute-technology-online||MCA': {
    sem1: 'Advanced Data Structures & Algorithms using Python | Statistics for Computer Science | Database Technology | Object Oriented Programming Using JAVA | Computer Networks | Practical Software Design Project | Software Design Project',
    sem2: 'Web Design and Development | Data Warehousing and Data Mining | Machine Learning | Software Engineering | Practical Software Design Project | Web Programming Lab | Elective I Web Analytics | Elective I Big Data Analytics',
    sem3: 'Software Testing and Quality Assurance | DevOps | MOOC | Presentation Skills and Academic Writing | Project Phase I | Elective II R Programming | Elective II Big Data Analytics | Elective III Semantic Web | Elective III Data Visualization Techniques and Tools',
    sem4: 'Personality Development | Project Work Phase II | Elective IV Data Classification Methods and Evaluation | Elective IV Principles of Deep Learning',
    highlight: 'UGC-entitled and AICTE-approved degree; 2-year postgraduate MCA program; Industry-integrated curriculum with focus on modern software development; Strong foundation in programming, databases and computer networks; Emphasis on emerging technologies li',
    programOverview: 'The online MCA at Hindustan Institute of Technology and Science (HITS) is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-entitled and AICTE-approved degree. 2-year postgraduate MCA program. Industry-integrated curriculum with focus on modern software development. Strong foundation in programming, databases and computer networks. Emphasis on emerging technologies like Big Data, Cloud Computing and Python.\n\nStudents pick a specialisation from tracks like Computer Science and IT, Cyber Security & Cloud Computing, and Data Science. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },
  'jain-university-online||MCA': {
    sem1: 'Mathematical Foundations for Computer Science | Computing Concepts and Problem Solving using C | Operating Systems | Data Structures | Problem Solving using C Lab | Data Structures Lab | Generative AI Applications in Modern Computing',
    sem2: 'Advanced Database Systems | Java Programming | Web Technologies | Cloud Computing Foundations | Advanced Database Systems Lab | Java Programming Lab | Environmental, Social, and Governance (ESG) in IT',
    specSyllabus: {
      'DevOps': {
        sem3: 'Artificial Intelligence and Machine Learning | Python Programming | Infrastructure as Code & Automation | AI & Machine Learning Lab | Python Programming Lab | Open Elective',
        sem4: 'Site Reliability Engineering | DevSecOps | Microservices & Containerization | DevOps in AI & Big Data | Project',
      },
      'Natural Language Processing & Large Language Models Development': {
        sem3: 'Artificial Intelligence and Machine Learning | Python Programming | Transformer Models & Attention Mechanisms | AI & Machine Learning Lab | Python Programming Lab | Open Elective',
        sem4: 'Large-Scale AI Model Deployment | Multimodal AI | Reinforcement Learning | Fine-Tuning & Optimization | Project',
      },
      'Data Analytics': {
        sem3: 'Artificial Intelligence and Machine Learning | Python Programming | Computer Vision | AI & Machine Learning Lab | Python Programming Lab | Open Elective',
        sem4: 'Natural Language Processing | Predictive Analytics using Machine Learning | Deep Learning | Big Data Hadoop | Project',
      },
      'Cyber Security': {
        sem3: 'Artificial Intelligence and Machine Learning | Python Programming | Cyber Threat Intelligence | AI & Machine Learning Lab | Python Programming Lab | Open Elective',
        sem4: 'Ethical Hacking | Defensive Cyber Security Technologies | Vulnerability Analysis | Penetration Testing | Project',
      },
      'Full Stack Development': {
        sem3: 'Application Development using Python | Web Technologies | React JS | Advanced Database Systems | Mobile Application Development | Applied Learning | Application Development using Python Lab | Web Technologies Lab',
        sem4: 'Software Engineering & Testing | Web APIs | Network Security & Cryptography | DevOps | Mastering Professional and Academic Writing | Capstone Project',
      },
      'Cloud Computing': {
        sem3: 'Application Development using Python | Web Technologies | Cloud Managed Services | Containers and Microservices | Big Data Management and Analytics | Applied Learning | Application Development using Python Lab | Web Technologies Lab',
        sem4: 'CI/CD and DevOps | Cloud Security and Migration | Microsoft Azure Essentials | Google Cloud Platform Essentials | Mastering Professional and Academic Writing | Capstone Project',
      },
      'Data Science': {
        sem3: 'Data Visualization | Web Technologies | Predictive Analytics using Machine Learning | Statistical Methods in Decision Making | Advanced Database Systems | Applied Learning | Predictive Analytics using Machine Learning Lab | Web Technologies Lab',
        sem4: 'Data Mining | Time Series Analysis | Natural Language Processing and GenAI | Applied Analytics - Marketing, Web, Social Media | Mastering Professional and Academic Writing | Capstone Project',
      },
      'Artificial Intelligence': {
        sem3: 'Predictive Analytics using Machine Learning | Web Technologies | Advanced Database Systems | Recommendation Systems | Advanced Machine Learning | Applied Learning | Predictive Analytics using Machine Learning Lab | Web Technologies Lab',
        sem4: 'Model Deployment and AI in Practice | Neural Networks and Deep Learning | Computer Vision | Natural Language Processing and GenAI | Mastering Professional and Academic Writing | Capstone Project',
      },
      'Computer Science and Information Technology': {
        sem3: 'Artificial Intelligence and Machine Learning | Python Programming | Software Testing | AI & Machine Learning Lab | Python Programming Lab | Open Elective',
        sem4: 'IT Project Management | Big Data Analytics | Low-Code/No-Code Application Development | Data Visualization | Project',
      },
    },
    highlight: 'Dual Qualification with Global Certifications (BCS, IoA UK); 2000+ Hiring Partners with Strong Placement Ecosystem; 65% Avg Salary Hike & 78% Career Success Rate; Technology-Driven Learning (AI Tools, Simulation-Based Learning); 70+ Electives & Multi',
    programOverview: 'The online MCA at Jain is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nDual Qualification with Global Certifications (BCS, IoA UK). 2000+ Hiring Partners with Strong Placement Ecosystem. 65% Avg Salary Hike & 78% Career Success Rate. Technology-Driven Learning (AI Tools, Simulation-Based Learning). 70+ Electives & Multiple Specializations (AI, Data Science, Cloud, Cybersecurity).\n\nThere are 9 specialisation options, including DevOps, Natural Language Processing & Large Language Models Development, Data Analytics, and 6 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.',
  },
  'jaipur-national-university-online||MCA': {
    sem1: 'Object Oriented Programming with C++ | Database Management System | Computer Graphics | Information and Network Security | Management Process and Organizational Behavior with Environmental Ethics | Advance Data Structure and Algorithm Analysis | Understanding Prescription, Doses and Dose Forms | Dining Etiquettes | Basics of Photography | Crime and Society | Industrial Mathematics | Object Oriented Programming with C++ and Java Lab | Database Management System Lab | Computer Graphics Lab | Advance Data Structure and Algorithm Analysis Lab',
    sem2: 'Theory of Computation | Software Engineering | Web Technology | Computer Based Optimization Techniques | Microprocessor & Assembly Language Programming | E-Commerce and Digital Marketing | Introduction to Epidemiology | Basics of Baking | Videography | Sociology of Health | Nanotechnology | Software Engineering Lab | Web Technology Lab | Microprocessor Lab | Seminar',
    sem3: 'Compiler Design | Advanced Database Concepts | Internet of Things | Android Programming | .NET Framework and ASP.NET | Introduction to Artificial Intelligence and Machine Learning | Big Data Analytics | Mobile Computing | Cloud Computing | Human Computer Interaction | Public Health Pharmacy | Rajasthan and Punjabi Cuisine | Script Writing for Film | Sociology of Media | Research Methodology | Advanced Database Concepts Lab | Internet of Things Lab | Android Programming Lab | .NET Lab | Artificial Intelligence Lab using Python | Communication & Soft Skills | Summer Training Presentation',
    sem4: 'Industrial Training | Research Paper Publication | Calculus of Variation and Special Functions | Differential Equations | Real Analysis | C Programming | C Programming Lab',
    highlight: 'UGC-approved online degree program; Flexible online learning with semester system; Industry-relevant curriculum with practical exposure; Focus on programming, AI, ML and cybersecurity; Strong foundation in computer science and software development; H',
    programOverview: 'The online MCA at Jaipur National University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-approved online degree program. Flexible online learning with semester system. Industry-relevant curriculum with practical exposure. Focus on programming, AI, ML and cybersecurity. Strong foundation in computer science and software development.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'kurukshetra-university-online||MCA': {
    sem1: 'Operating System & Linux | Data Structures | Client Side Web Technology | Programming in Java | Computer Fundamentals and Problem Solving Through C | Seminar | Practical 1 | Practical 2 | Practical 3',
    sem2: 'Database Management Systems | Server Side Web Technology | Artificial Intelligence | Mathematical Foundations for Computer Science | Computer Network | Internship | Constitutional, Human and Moral Values, and IPR | Practical 4 | Practical 5 | Practical 6',
    sem3: 'Machine Learning in Python | Design and Analysis of Algorithms | Ethical Hacking | Data Analytics using Excel | Big Data & Pattern Recognition | Practical 7 | Practical 8',
    sem4: 'Blockchain Technology | Principles of Programming Languages | Object Oriented Design and UML | Cyber Security Fundamentals | Dissertation / Project',
    highlight: 'UGC-Entitled & NAAC A++ Accredited University; AICTE Approved Online MCA; Strong Government University Legacy (Established 1956); Industry-Relevant Curriculum (AI, Data, Programming); Live + Recorded Interactive Classes; Flexible Self-Paced Learning ',
    programOverview: 'The online MCA at Kurukshetra University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-Entitled & NAAC A++ Accredited University. AICTE Approved Online MCA. Strong Government University Legacy (Established 1956). Industry-Relevant Curriculum (AI, Data, Programming). Live + Recorded Interactive Classes.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'lovely-professional-university-online||MCA': {
    sem1: 'Software Engineering Practices | Object Oriented Programming using C++ | Data Warehousing and Data Mining | Linux and Shell Scripting | Data Communication and Networking | Skill Enhancement Course I | Fundamentals of Computer and C Programming | Elementary Mathematics',
    sem2: 'Programming in Java | Advanced Data Structures | Introduction to Big Data | Cloud Computing | Mathematical Foundation for Computer Science | Web Technologies | Skill Enhancement Course II',
    specSyllabus: {
      'AR/ VR (Game Development)': {
        sem3: 'Programming in Python | Skill Enhancement Course III | Game Development using Unity Engine | Unreal Programming using C++ | Generic Elective I | Generic Elective II | Seminar on Summer Training | One course from GE Basket 1',
        sem4: 'Skill Enhancement Course IV | Game AI & Reinforcement Learning | Virtual Reality and Augmented Reality in Game Development | Generic Elective III | Generic Elective IV | Project Work',
      },
      'Machine Learning & AI': {
        sem3: 'Programming in Python | Skill Enhancement Course III | Fundamentals of Machine Learning | Natural Language Processing | Generic Elective I | Generic Elective II | Seminar on Summer Training | One course from GE Basket 1',
        sem4: 'Skill Enhancement Course IV | Deep Learning | Advance Data Visualization | Generic Elective III | Generic Elective IV | Project Work',
      },
      'Data Science': {
        sem3: 'Programming in Python | Skill Enhancement Course III | Probability and Statistics | Data Science Tool Box | Generic Elective I | Generic Elective II | Seminar on Summer Training | One course from GE Basket 1',
        sem4: 'Skill Enhancement Course IV | Advance Data Visualization | Machine Learning | Generic Elective III | Generic Elective IV | Project Work',
      },
      'Cybersecurity': {
        sem3: 'Programming in Python | Skill Enhancement Course III | Network Administration | Cyber Forensic | Generic Elective I | Generic Elective II | Seminar on Summer Training | One course from GE Basket 1',
        sem4: 'Skill Enhancement Course IV | Securing Networks and its Infrastructure | Vulnerability Assessment and Penetration Testing | Generic Elective III | Generic Elective IV | Project Work',
      },
      'Full Stack Web Development': {
        sem3: 'Programming in Python | Skill Enhancement Course III | Front End Web Developer | Web Development using ReactJS | Generic Elective I | Generic Elective II | Seminar on Summer Training | One course from GE Basket 1',
        sem4: 'Skill Enhancement Course IV | Advanced Web Development | Web Development in Python using Django | Generic Elective III | Generic Elective IV | Project Work',
      },
    },
    highlight: 'Industry-oriented curriculum designed by experts; Highly qualified faculty; Advanced LMS with interactive features; Mobile learning support; Master classes by industry experts; Guest lectures for real-world insights; Placement assistance and career s',
    programOverview: 'The online MCA at Lovely Professional University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nIndustry-oriented curriculum designed by experts. Highly qualified faculty. Advanced LMS with interactive features. Mobile learning support. Master classes by industry experts.\n\nThere are 5 specialisation options, including AR/ VR (Game Development), Machine Learning & AI, Data Science, and 2 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.',
  },
  'manav-rachna-online||MCA': {
    sem1: 'Research Innovation Catalyst-I | Linear Algebra & Statistical Techniques | Data Structures | Object Oriented Programming in Java | Python Programming | Data Structures Lab | Object Oriented Programming in Java Lab | Python Programming Lab | Placement Competency Enhancement-I | Fundamentals of Computer Programming | Elements of Mathematics',
    sem2: 'Research Innovation Catalyst-II | Data Communications | Analysis & Design of Algorithm | Introduction to Artificial Intelligence | Vocational Training / Project | R Programming Lab | Android Application Development Lab | Placement Competency Enhancement-II',
    sem3: 'Research Innovation Catalyst-III | Data Mining and Warehousing | Software Engineering & Testing | Operations Research | Big Data Analytics',
    sem4: 'Introduction to .NET | Advanced Java | Introduction to .NET Lab | Advanced Java Lab',
    highlight: 'UGC & AICTE Approved Online MCA; NAAC A++ Accredited University; Multiple Specializations (AI & Data Science, Cybersecurity, Cloud, Full Stack); Industry Collaboration with Microsoft; Flexible Learning (Live Weekend Classes + 24x7 LMS); Strong Focus ',
    programOverview: 'The online MCA at Manav Rachna International Institute of Research and Studies is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC & AICTE Approved Online MCA. NAAC A++ Accredited University. Multiple Specializations (AI & Data Science, Cybersecurity, Cloud, Full Stack). Industry Collaboration with Microsoft. Flexible Learning (Live Weekend Classes + 24x7 LMS).\n\nThere are 4 specialisation options, including Cyber Security and Block Chain, Artificial Intelligence and Data Science, Cloud Computing and Internet of Things, and 1 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.',
  },
  'manipal-academy-higher-education-online||MCA': {
    sem1: 'Mathematics for Computing | Business Communication | Problem Solving using C | Operating Systems | Software Engineering',
    sem2: 'Database Management with Structured Query Language | Data Analytics and Visualization with Python | Object Oriented Programming with Java | Data Structures and Algorithms',
    specSyllabus: {
      'Artificial Intelligence & Machine Learning': {
        sem3: 'Computer Networks | Web Technologies | Machine Learning Methods | Big Data Analytics | Research Methodology',
        sem4: 'Project | AI & ML | Cloud Computing | Cybersecurity | Full Stack Development | Electives/Specializations (Deep Learning Principles and Applications, Artificial Intelligence, Big Data Analytics, Computer Vision)',
      },
      'Cloud Computing': {
        sem3: 'Computer Networks | Web Technologies | Machine Learning Methods | Big Data Analytics | Research Methodology',
        sem4: 'Project | AI & ML | Cloud Computing | Cybersecurity | Full Stack Development | Electives/Specializations (Cloud Architecture and Management, Cloud DevOps, Cloud Application and Database with Java, Cloud Security Essentials)',
      },
      'Cybersecurity': {
        sem3: 'Computer Networks | Web Technologies | Machine Learning Methods | Big Data Analytics | Research Methodology',
        sem4: 'Project | AI & ML | Cloud Computing | Cybersecurity | Full Stack Development | Electives/Specializations (Basics in Information Security, Forensic Investigation, Cyber Crime Intervention, Cloud Security Essentials)',
      },
      'Full Stack Development': {
        sem3: 'Computer Networks | Web Technologies | Machine Learning Methods | Big Data Analytics | Research Methodology',
        sem4: 'Project | AI & ML | Cloud Computing | Cybersecurity | Full Stack Development | Electives/Specializations (Back-end Web Development, Front-end Web Development, Human-Computer Interaction, Cloud Security Essentials)',
      },
    },
    highlight: 'Institution of Eminence & NAAC A++ Accredited University; NIRF Top-Ranked University in India; Designed Specifically for Working Professionals; Specializations in AI & ML, Cybersecurity, Cloud Computing, Full Stack; Advanced LMS with Live + Recorded ',
    programOverview: 'The online MCA at Manipal Academy of Higher Education is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nInstitution of Eminence & NAAC A++ Accredited University. NIRF Top-Ranked University in India. Designed Specifically for Working Professionals. Specializations in AI & ML, Cybersecurity, Cloud Computing, Full Stack. Advanced LMS with Live + Recorded Classes & Discussion Forums.\n\nThere are 4 specialisation options, including Artificial Intelligence & Machine Learning, Cloud Computing, Cybersecurity, and 1 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.',
  },
  'manipal-university-jaipur-online||MCA': {
    sem1: 'Fundamentals of Computers and IT | Fundamentals of Mathematics | Discrete Mathematics and Graph Theory | Python Programming | Programming and Problem Solving in C | Relational Database Management System | Data Visualisation | Relational Database Management Systems Lab | Programming and Problem Solving in C Lab | Python Programming Lab',
    sem2: 'Computer Networks and Protocols | Object Oriented Programming using Java | Operating System | Data Structure and Algorithms | Computer Architecture | Object Oriented Programming using Java Lab | Data Structure and Algorithms Lab | Elective (Artificial Intelligence)',
    specSyllabus: {
      'AI & Data Science': {
        sem3: 'Unix and Shell Programming | Web Technology | Software Engineering and Project Management | Unix and Shell Programming Lab | Web Technology Lab | Elective (Categorical Data Analysis and Generalized Linear Models / Deep Learning and Text Mining)',
        sem4: 'Mobile Application Development | Project Work | Elective (Applied Data Analytics)',
      },
      'Comprehensive Emerging Technologies': {
        sem3: 'Unix and Shell Programming | Web Technology | Software Engineering and Project Management | Unix and Shell Programming Lab | Web Technology Lab | Elective (Data Mining Techniques / Blockchain Technologies)',
        sem4: 'Mobile Application Development | Project Work | Elective (Big Data Analytics and Business Intelligence)',
      },
      'Artificial Intelligence & Machine Learning': {
        sem3: 'Unix and Shell Programming | Web Technology | Software Engineering and Project Management | Unix and Shell Programming Lab | Web Technology Lab | Elective (Introduction to Machine Learning / Fundamentals of Unsupervised Learning)',
        sem4: 'Mobile Application Development | Project Work | Elective (AI in Project Management)',
      },
      'Cloud Computing': {
        sem3: 'Unix and Shell Programming | Web Technology | Software Engineering and Project Management | Unix and Shell Programming Lab | Web Technology Lab | Elective (Cloud Architecture and Services / Google Cloud Essentials)',
        sem4: 'Mobile Application Development | Project Work | Elective (Cloud Application Development)',
      },
      'Cybersecurity': {
        sem3: 'Unix and Shell Programming | Web Technology | Software Engineering and Project Management | Unix and Shell Programming Lab | Web Technology Lab | Elective (Cyber Law and Ethics / Ethical Hacking)',
        sem4: 'Mobile Application Development | Project Work | Elective (Cryptography and Network Security)',
      },
    },
    highlight: 'NAAC A+ Accredited University with Strong NIRF Ranking; Industry-Aligned Curriculum with Practical Labs & Projects; Specializations in AI, Data Science, Cloud & Cybersecurity; Access to Coursera Certifications (₹3,999) & Microsoft Skill Badge; Advanc',
    programOverview: 'The online MCA at Manipal University Jaipur is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nNAAC A+ Accredited University with Strong NIRF Ranking. Industry-Aligned Curriculum with Practical Labs & Projects. Specializations in AI, Data Science, Cloud & Cybersecurity. Access to Coursera Certifications (₹3,999) & Microsoft Skill Badge. Advanced Virtual Programming Lab & Digital Library.\n\nThere are 5 specialisation options, including AI & Data Science, Comprehensive Emerging Technologies, Artificial Intelligence & Machine Learning, and 2 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.',
  },
  'marwadi-university-online||MCA': {
    sem1: 'Problem Solving using Python | Techniques Object Oriented | Practicals based on Python | Computer Networks Virtualization | Analysis and Design using UML | MOOC - Web Technologies (HTML, CSS, PHP)',
    sem2: 'Artificial Intelligence | Data Science | Practicals based on Data Science using Python | Blockchain Technology | Elective - Unstructured Database Big Data Technologies | MOOC - Web Development using Python Framework',
    sem3: 'Software Engineering | Cryptography | Artificial Intelligence | Mini Project 2 | Elective (Big Data Tools / Machine Vision / Machine Learning / ASP.Net Programming) | MOOC (Cloud Computing) | Corporate Etiquettes',
    sem4: 'Final Project / Dissertation',
    highlight: 'UGC-Entitled & AICTE-Approved Degree; NAAC A+ Accredited University; Flexible Learning for Working Professionals; Live Weekend Classes; Unlimited Access to Recorded Lectures & Study Materials; Learn at Your Own Pace with Structured Milestones; Indust',
    programOverview: 'The online MCA at Marwadi University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-Entitled & AICTE-Approved Degree. NAAC A+ Accredited University. Flexible Learning for Working Professionals. Live Weekend Classes. Unlimited Access to Recorded Lectures & Study Materials.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'mody-university-online||MCA': {
    sem1: 'Object Oriented Programming Using C++ | Computer Architecture | Discrete Mathematics | Enterprise Resource Planning | Database Management System | C++ Programming Practicals | DBMS Practical',
    sem2: 'Operating System | Java Programming | Software Engineering | Data Warehousing and Mining | Advance Data Structure | Java Programming Practicals | Advance Data Structure Practical',
    specSyllabus: {
      'Artificial Intelligence and Machine Learning': {
        sem3: 'Visualization with R Programming | Data Communication and Network | Python Programming | Research Methodology | R Programming Practical | Python Programming Practicals | Elective (AI & ML) Artificial Intelligence and Machine Learning',
        sem4: 'Data Science and Analytics | Mobile Application Design and Development | Project | Mobile Application Design and Development Practicals | Elective (AI & ML) Natural Language Processing',
      },
      'Cloud Computing': {
        sem3: 'Visualization with R Programming | Data Communication and Network | Python Programming | Research Methodology | R Programming Practical | Python Programming Practicals | Elective (Cloud Computing) Cloud Computing',
        sem4: 'Data Science and Analytics | Mobile Application Design and Development | Project | Mobile Application Design and Development Practicals | Elective (Cloud Computing) Cloud Security Management',
      },
      'Internet of Things (IoT)': {
        sem3: 'Visualization with R Programming | Data Communication and Network | Python Programming | Research Methodology | R Programming Practical | Python Programming Practicals | Elective (IoT) Wireless Sensor Networks & IoT Standards',
        sem4: 'Data Science and Analytics | Mobile Application Design and Development | Project | Mobile Application Design and Development Practicals | Elective (IoT) Descriptive Analytics for IoT',
      },
      'Web Technology': {
        sem3: 'Visualization with R Programming | Data Communication and Network | Python Programming | Research Methodology | R Programming Practical | Python Programming Practicals | Elective (Web Technology) Web Development (C#)',
        sem4: 'Data Science and Analytics | Mobile Application Design and Development | Project | Mobile Application Design and Development Practicals | Elective (Web Technology) Full Stack Development',
      },
    },
    highlight: 'Industry-aligned curriculum focused on emerging technologies; Strong foundation in programming with C++, Java and Python; Coverage of Data Science, Artificial Intelligence, Machine Learning and Cybersecurity; Focus on software development and IT mana',
    programOverview: 'The online MCA at Mody University of Science and Technology is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nIndustry-aligned curriculum focused on emerging technologies. Strong foundation in programming with C++, Java and Python. Coverage of Data Science, Artificial Intelligence, Machine Learning and Cybersecurity. Focus on software development and IT management. Hands-on learning through virtual labs and real-world projects.\n\nThere are 4 specialisation options, including Artificial Intelligence and Machine Learning, Cloud Computing, Internet of Things (IoT), and 1 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.',
  },
  'noida-international-university-online||MCA': {
    sem1: 'Fundamental of Computers & Emerging Technologies | Problem Solving using C | Principles of Management & Communication | Discrete Mathematics | Computer Organization & Architecture | Problem Solving using C Lab | Computer Organization & Architecture Lab | Professional Communication Lab',
    sem2: 'Web Technologies | Object Oriented Programming Using Java | Data Structures and Algorithms | Data Base Management System | Web Technologies Lab | Object Oriented Programming Using Java Lab | Data Structures and Algorithms Lab | DBMS Lab | Fundamental of AI and Problem Solving',
    sem3: 'Unix & Shell Programming | Computer Network & Protocols | Software Engineering & Project Management | Unix & Shell Programming Lab | Software Engineering Lab | Introduction to Machine Learning | Fundamentals of Unsupervised Learning',
    sem4: 'Banking and Insurance Management | Project Work | Artificial Intelligence in Project Management',
    highlight: 'UGC-entitled and NAAC A+ accredited degree; 100% online learning with live and recorded lectures; Industry-aligned curriculum covering programming, AI, data science and cybersecurity; Strong focus on software development, cloud computing and database',
    programOverview: 'The online MCA at Noida International University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-entitled and NAAC A+ accredited degree. 100% online learning with live and recorded lectures. Industry-aligned curriculum covering programming, AI, data science and cybersecurity. Strong focus on software development, cloud computing and database management. Hands-on learning through projects and virtual labs.\n\nThe program offers a specialisation in AI & Data Science. Semesters one and two build a shared foundation in programming, databases, and networks, then semester three and four focus on advanced domain subjects and a capstone project.',
  },
  'srm-institute-science-technology-online||MCA': {
    sem1: 'Programming using Java | Operating System | Database Technology | Advanced Web Application Development | Cyber Security | Software Engineering | IT Infrastructure Management | Career Advancement I | Mathematical Foundation',
    sem2: 'Python Programming | Computer Networks | Optimization Techniques | Android Applications Development | Software Testing | Data Analysis Using R | Career Advancement II',
    specSyllabus: {
      'General': {
        sem3: 'Object Oriented Analysis and Design | Artificial Intelligence and Machine Learning | Cloud Computing | Internet of Things (IoT) | Internship | Mini Project Work | Software Project Management | Data Warehouse and Data Mining | Organizational Behavior and Professional Ethics | Career Advancement III',
        sem4: 'Project Work',
      },
      'Generative AI': {
        sem3: 'Object Oriented Analysis and Design | Internship | Mini Project Work | Career Advancement III | Large Language Models in Generative AI | Building Conversational AI for Human Resources | Advanced Techniques in Generative AI | AI Data Analytics and Predictive Modeling',
        sem4: 'Project Work',
      },
    },
    highlight: 'UGC-entitled online degree program; 2-year MCA with flexible online learning; Industry-aligned curriculum covering latest technologies; Specializations in Data Science & Machine Learning, Cyber Security & Cyber Forensics and AI & Generative AI; Stron',
    programOverview: 'The online MCA at S.R.M. Institute of Sciences and Technology is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-entitled online degree program. 2-year MCA with flexible online learning. Industry-aligned curriculum covering latest technologies. Specializations in Data Science & Machine Learning, Cyber Security & Cyber Forensics and AI & Generative AI. Strong foundation in programming, data structures and software development.\n\nThe program offers a specialisation in Generative AI. Semesters one and two build a shared foundation in programming, databases, and networks, then semester three and four focus on advanced domain subjects and a capstone project.',
  },
  'savitribai-phule-pune-university-online||MCA': {
    sem1: 'Programming from First Principles | Processor Architecture and Design | Computational Mathematics | Persistent Data Management | Elective (Foundations of Artificial Intelligence) | Research Methodology',
    sem2: 'Data Organization for Program Construction | Software Subsystem for Hardware Virtualization | Computational Thinking | Foundations of Software Development | Elective 1 | Elective 2 | Foundations of Data Analytics',
    sem3: 'Communication Protocols | Software Component Engineering | Elective 1 | Elective 2 | Elective 3 | Research Project',
    sem4: 'Internship | Online Elective 1 (MOOC 1) | Online Elective 2 (MOOC 2)',
    highlight: 'UGC-Recognized Government University with Strong Academic Legacy; NAAC A+ Accredited University; 2-Year Online MCA Program (4 Semesters); Industry-Oriented Curriculum Covering Software Development, Data & Systems; Flexible Online Learning via Centre ',
    programOverview: 'The online MCA at Savitribai Phule Pune University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-Recognized Government University with Strong Academic Legacy. NAAC A+ Accredited University. 2-Year Online MCA Program (4 Semesters). Industry-Oriented Curriculum Covering Software Development, Data & Systems. Flexible Online Learning via Centre for Distance & Online Education.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'shanmugha-arts-science-technology-research-online||MCA': {
    sem1: 'Statistical Methods | Data Structures (Semi Theory & Semi Practical) | Problem Solving & Programming in C | Database Management Systems | Soft Skills I',
    sem2: 'Design & Analysis of Algorithms (Semi Theory & Semi Practical) | Operating System Concepts & Principles (Semi Theory & Semi Practical) | Java Programming | Computer Networks (Semi Theory & Semi Practical) | Soft Skills II',
    specSyllabus: {
      'Full Stack Development': {
        sem3: 'Software Engineering (Semi Theory & Semi Practical) | Python Programming with Web Frameworks | Web Technology (Semi Theory & Semi Practical) | Low Code Programming with Oracle | Software Design & Testing',
        sem4: 'Natural Language Processing | Cloud Computing | Design Thinking | Full Stack Web Application Development | Project & Viva Voce',
      },
      'Artificial Intelligence & Data Science': {
        sem3: 'Software Engineering (Semi Theory & Semi Practical) | Python Programming with Web Frameworks | Web Technology (Semi Theory & Semi Practical) | Fundamentals of AI & Data Science | Machine Learning Techniques',
        sem4: 'Natural Language Processing | Cloud Computing | Predictive Analytics & Data Visualization | Data Analytics for Health Care Applications | Project & Viva Voce',
      },
      'Cyber Security': {
        sem3: 'Software Engineering (Semi Theory & Semi Practical) | Python Programming with Web Frameworks | Web Technology (Semi Theory & Semi Practical) | Cryptography & Network Security | Cyber Security & Ethical Hacking',
        sem4: 'Natural Language Processing | Cloud Computing | Machine Learning for Cyber Security | Enterprise Block Chain Framework | Project & Viva Voce',
      },
    },
    highlight: 'Recognized online MCA from a top-ranked NAAC A++ university; Industry-aligned curriculum with focus on AI, Data Science and Cybersecurity; Hands-on project-based learning with real-world applications; Strong foundation in programming, algorithms and ',
    programOverview: 'The online MCA at Shanmugha Arts, Science, Technology & Research Academy is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nRecognized online MCA from a top-ranked NAAC A++ university. Industry-aligned curriculum with focus on AI, Data Science and Cybersecurity. Hands-on project-based learning with real-world applications. Strong foundation in programming, algorithms and software engineering. Exposure to emerging technologies like cloud computing, NLP and machine learning.\n\nStudents pick a specialisation from tracks like Full Stack Development, Artificial Intelligence & Data Science, and Cyber Security. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },
  'sharda-university-online||MCA': {
    sem1: 'Mathematical Foundation for Computer Application | C Programming and File Handling | Operating System and Unix Shell Programming | Computer Architecture and Organization | Data Communication and Computer Networks | Introduction to Computers & Technology',
    sem2: 'Data Structures with C | Database Management System | Software Engineering | Java Programming | Logic Building and Soft Skills',
    specSyllabus: {
      'Data Science': {
        sem3: 'Application Development Using Python | Design and Analysis of Algorithms | Statistical Methods in Decision Making | Data Visualization | Introduction to Data Science',
        sem4: 'IT Project Management | Artificial Intelligence and Machine Learning | SQL for Data Science | Time Series Analytics | Project',
      },
      'Computer Science and Information Technology': {
        sem3: 'Application Development Using Python | Design and Analysis of Algorithms | Cryptography and Network Security | Cloud Infrastructure and Service | Object Oriented Modelling and Design Pattern',
        sem4: 'IT Project Management | C# with ASP.NET | Introduction to R Programming | Internet of Thing | Project',
      },
      'Augmented Reality and Virtual Reality with Artificial Intelligence': {
        sem3: 'IT Project Management | C# with ASP.NET | Introduction to R Programming | Internet of Thing | Project',
        sem4: 'Strategic & Industry Projects | IT Project Management | Applied Generative AI and Model Safety | Time Series Analysis | Neural Networks and Deep Learning | Capstone Industry Project (with Leverage Online)',
      },
    },
    highlight: 'UGC-recognized and globally accepted online degree; Flexible online learning with self-paced and live sessions; Industry-aligned curriculum focused on real-world IT skills; Strong foundation in programming, databases, networking and software engineer',
    programOverview: 'The online MCA at Sharda University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-recognized and globally accepted online degree. Flexible online learning with self-paced and live sessions. Industry-aligned curriculum focused on real-world IT skills. Strong foundation in programming, databases, networking and software engineering. Exposure to emerging technologies like AI, Data Science, Cloud Computing and Cybersecurity.\n\nStudents pick a specialisation from tracks like Data Science, Computer Science and Information Technology, and Augmented Reality and Virtual Reality with Artificial Intelligence. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },
  'shoolini-university-online||MCA': {
    sem1: 'Functional English-1 | Problem Solving with C | Computational Mathematics | Applied Database Management System | Open Elective | Saying it with Presentations | Principles of Management',
    sem2: 'Web Technology | Functional English-2 | Data Structure and Algorithm (C) | Python Application Programming | Open Elective | Digital Marketing for Practitioners | Entrepreneurship',
    specSyllabus: {
      'AI Specialization': {
        sem3: 'Java Programming | Object-Oriented Programming with C++ | Operating System Concepts | Open Elective | Artificial Intelligence | Generative AI-1',
        sem4: 'Project Work | Computer Networking | Open Elective | Machine Learning in Python | Generative AI-2',
      },
      'Data Science': {
        sem3: 'Java Programming | Object-Oriented Programming with C++ | Operating System Concepts | Open Elective | Data Analytics using Python | Data Science',
        sem4: 'Project Work | Computer Networking | Open Elective | Digital Media Analytics | IoT and Data Science',
      },
      'Full Stack': {
        sem3: 'Java Programming | Object-Oriented Programming with C++ | Operating System Concepts | Open Elective | UX/UI | DevOps',
        sem4: 'Project Work | Computer Networking | Open Elective | Software Architecture | Prototyping',
      },
    },
    highlight: 'UGC-Entitled Online Degree; India’s Top-Ranked Private University (QS & THE Rankings); Specializations in AI & ML, Data Science & Full Stack; Mentorship by Top Industry Experts (McKinsey, HSBC, IITs, IIMs); Pay-After-Placement Option Available; 250+ ',
    programOverview: 'The online MCA at Shoolini University of Biotechnology and Management Sciences is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-Entitled Online Degree. India’s Top-Ranked Private University (QS & THE Rankings). Specializations in AI & ML, Data Science & Full Stack. Mentorship by Top Industry Experts (McKinsey, HSBC, IITs, IIMs). Pay-After-Placement Option Available.\n\nStudents pick a specialisation from tracks like AI Specialization, Data Science, and Full Stack. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },
  'shree-guru-gobind-singh-tricentenary-university-online||MCA': {
    sem1: 'Operating System | Python Programming | Advanced Database Management System | Fundamentals of Artificial Intelligence and Machine Learning | Mathematical & Statistical Foundations | Operating System Lab | Python Programming Lab | Advanced Database Management System Lab | Fundamentals of Artificial Intelligence and Machine Learning Lab | Professional Communication | Bridge Course (Only for Non-Computer Background) | Programming in C',
    sem2: 'Cloud Computing | Advanced Data Structures | Object-Oriented Programming with Java | Software Engineering & Project Management | Data Warehousing & Data Mining | Critical Reasoning & Systems Thinking | Applied AI',
    specSyllabus: {
      'Artificial Intelligence & Machine Learning': {
        sem3: 'Full Stack Development | Design & Analysis of Algorithms | Distributed Systems | Generative AI Fundamentals | Fundamentals of Deep Learning | Internship',
        sem4: 'Mobile App Development | Research Methodology & Academic Writing | Capstone Project | Ethical AI & Responsible Computing | Natural Language Processing | Project',
      },
      'Data Science': {
        sem3: 'Full Stack Development | Design & Analysis of Algorithms | Distributed Systems | Generative AI | Data Exploration & Preparation | Internship',
        sem4: 'Mobile App Development | Research Methodology & Academic Writing | Capstone Project | Data Visualization | Big Data | Project',
      },
      'Cyber Security': {
        sem3: 'Full Stack Development | Design & Analysis of Algorithms | Distributed Systems | Generative AI | Cryptography & Network Security | Internship',
        sem4: 'Mobile App Development | Research Methodology & Academic Writing | Capstone Project | Cyber Forensics | Vulnerability Assessment & Penetration Testing | Project',
      },
      'Blockchain Technology': {
        sem3: 'Full Stack Development | Design & Analysis of Algorithms | Distributed Systems | Generative AI | Web Development for Blockchain Application | Internship',
        sem4: 'Mobile App Development | Research Methodology & Academic Writing | Capstone Project | Smart Contract and Solidity Programming | Cyber Security with Blockchain | Project',
      },
    },
    highlight: 'UGC-Entitled & NAAC A+ Accredited University; Industry-Aligned Curriculum (AI, Data Science, Cloud, Cybersecurity); Strong Focus on Programming & Software Development Skills; Fully Online Flexible Learning (Anytime, Anywhere); Affordable Fee Structur',
    programOverview: 'The online MCA at Shree Guru Gobind Singh Tricentenary University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-Entitled & NAAC A+ Accredited University. Industry-Aligned Curriculum (AI, Data Science, Cloud, Cybersecurity). Strong Focus on Programming & Software Development Skills. Fully Online Flexible Learning (Anytime, Anywhere). Affordable Fee Structure (₹24,500 per Semester).\n\nThere are 4 specialisation options, including Artificial Intelligence & Machine Learning, Data Science, Cyber Security, and 1 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.',
  },
  'shri-ramasamy-memorial-university-online||MCA': {
    sem1: 'Basic Mathematics | Fundamentals of Computer | Programming in Java | Operating System | Database Technology | Computer Networks | Programming in Java Practical | Operating System and Database Technology Practical',
    sem2: 'Python Programming | Advanced Data Structure and Algorithms | Advanced Web Application Development | Optimization Techniques | Advanced Data Structure and Algorithms Practical | Advanced Web Application Development Practical',
    specSyllabus: {
      'Data Science and Machine Learning': {
        sem3: 'Artificial Intelligence and Machine Learning | IT Infrastructure Management | Android Applications Development | Internet of Things (IoT) | Mini Project | Specialization Data Science and Machine Learning | Data Analysis using R | Machine Learning for Data Science',
        sem4: 'MEAN Stack Web Development | Software Engineering and Project Management | Project Work | Specialization Data Science and Machine Learning | Big Data Analytics | Data Visualization',
      },
      'Cyber Security & Cyber Forensics': {
        sem3: 'Artificial Intelligence and Machine Learning | IT Infrastructure Management | Android Applications Development | Internet of Things (IoT) | Mini Project | Specialization Cyber Security and Cyber Forensics | Cyber Security | Vulnerability Assessment and Penetration Testing',
        sem4: 'MEAN Stack Web Development | Software Engineering and Project Management | Project Work | Specialization Cyber Security and Cyber Forensics | Principles of Digital Forensics | Security and Privacy in Blockchain Systems',
      },
      'Artificial Intelligence & Gen AI': {
        sem3: 'Artificial Intelligence and Machine Learning | IT Infrastructure Management | Android Applications Development | Internet of Things (IoT) | Mini Project | Specialization AI & Gen AI | Introduction to Generative AI | Natural Language Processing',
        sem4: 'MEAN Stack Web Development | Software Engineering and Project Management | Project Work | Specialization AI & Gen AI | Large Language Models and Applications | GenAI Application Development',
      },
    },
    highlight: 'UGC-entitled online degree; Industry-relevant curriculum with focus on emerging technologies; Strong foundation in programming and software development; Access to Coursera for global certifications; Exposure to AI, Machine Learning, Data Science and ',
    programOverview: 'The online MCA at Shri Ramasamy Memorial University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-entitled online degree. Industry-relevant curriculum with focus on emerging technologies. Strong foundation in programming and software development. Access to Coursera for global certifications. Exposure to AI, Machine Learning, Data Science and Cloud Computing.\n\nStudents pick a specialisation from tracks like Data Science and Machine Learning, Cyber Security & Cyber Forensics, and Artificial Intelligence & Gen AI. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },
  'sikkim-manipal-university-online||MCA': {
    sem1: 'Computational Mathematics | Java Programming | Operating Systems | Database Management System | Database Management System Lab | Java Programming Lab | Fundamentals of Computers & IT | Fundamental of Mathematics',
    sem2: 'Python Programming | Software Engineering and Unified Modelling Language | Computer Organization and Architecture | Data Structure and Algorithm | Data Structure and Algorithm Lab | Python Programming Lab',
    sem3: '.NET Framework | Computer Network | IT Laws and Practices | .NET Framework Lab | Computer Network Lab | Elective (Data Warehousing and Data Mining / Cloud Computing)',
    sem4: 'Mobile Application Development | Angular JS, React JS, and VUE JS | Project | Elective (Machine Learning / Distributed System and Grid Computing)',
    highlight: 'UGC-Entitled & NAAC A+ Accredited University; Affordable Online MCA Program (₹27,500 per Semester); AI-Enabled Learning Management System; Industry-Aligned Curriculum (AI, Programming, Deep Learning); Live + Recorded Classes with Discussion Forums; O',
    programOverview: 'The online MCA at Sikkim Manipal University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-Entitled & NAAC A+ Accredited University. Affordable Online MCA Program (₹27,500 per Semester). AI-Enabled Learning Management System. Industry-Aligned Curriculum (AI, Programming, Deep Learning). Live + Recorded Classes with Discussion Forums.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'upes-online||MCA': {
    sem1: 'Advance Python Programming | Data Base Management Systems | Discrete Mathematics | Object Oriented Programming using C++ | Advance Data Structures | AI for everyone',
    sem2: 'Web Technologies | Operating Systems | Design and Analysis of Algorithm | Java Programming | Applied Machine Learning | Computer Graphics',
    specSyllabus: {
      'Artificial Intelligence and Machine Learning': {
        sem3: 'Object-Oriented Analysis and Design Using UML | Computer Networks | Advanced Java Programming | Software Engineering and Project Management | AR/VR Development | Deep Learning',
        sem4: 'Project Dissertation | Android Application Development | Pattern and Visual Recognition | Computational Linguistics and Natural Language Processing',
      },
      'Cyber Security and Forensics': {
        sem3: 'Object-Oriented Analysis and Design Using UML | Computer Networks | Advanced Java Programming | Software Engineering and Project Management | AR/VR Development | Digital Forensics I',
        sem4: 'Project Dissertation | Android Application Development | Digital Forensics II | Ethical Hacking & Penetration Testing',
      },
      'Data Science': {
        sem3: 'Object-Oriented Analysis and Design Using UML | Computer Networks | Advanced Java Programming | Software Engineering and Project Management | AR/VR Development | Machine Learning and Deep Learning',
        sem4: 'Project Dissertation | Android Application Development | Cloud Computing for Data Science | Use of Cloud Platforms for Data Processing Analysis and Storage | Generative Artificial Intelligence',
      },
    },
    highlight: '2-year online MCA program with specialization in AI & Machine Learning; Strong focus on deep learning, NLP, computer vision and AI model deployment; Industry-aligned curriculum designed with academicians and industry experts; Hands-on learning throug',
    programOverview: 'The online MCA at University of Petroleum and Energy is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\n2-year online MCA program with specialization in AI & Machine Learning. Strong focus on deep learning, NLP, computer vision and AI model deployment. Industry-aligned curriculum designed with academicians and industry experts. Hands-on learning through real-world projects and case studies. Mandatory internship for practical industry exposure.\n\nStudents pick a specialisation from tracks like Artificial Intelligence and Machine Learning, Cyber Security and Forensics, and Data Science. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },
  'uttaranchal-university-online||MCA': {
    sem1: 'OOPS using C++ | Operating System | Computer Organization and Architecture | Discrete Mathematics | Financial Accounting',
    sem2: 'Python Programming | Data Structure | Software Engineering | Data Communication and Networking | Theory of Computation',
    sem3: 'Database Management System | Web Technology | Information Security | Artificial Intelligence | Soft Computing',
    sem4: 'Capstone Project',
    highlight: 'UGC-entitled and NAAC A+ accredited degree; 2-year MCA program with flexible online learning; Live and recorded classes with 8–10 hours weekly commitment; Industry-oriented curriculum focused on programming, software development and IT skills; Strong',
    programOverview: 'The online MCA at Uttaranchal University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-entitled and NAAC A+ accredited degree. 2-year MCA program with flexible online learning. Live and recorded classes with 8,10 hours weekly commitment. Industry-oriented curriculum focused on programming, software development and IT skills. Strong foundation in database management, networking and information security.\n\nThe four semesters build on each other in a logical sequence. Year one covers programming fundamentals, data structures, operating systems, and database systems. Year two brings in more advanced subjects, professional electives, and a final project or internship that puts classroom learning to practical use.',
  },
  'vit-vellore-online||MCA': {
    sem1: 'Discrete Mathematical Structures | Python Programming | Data Structure and Algorithms | Operating Systems | Database Systems',
    sem2: 'Statistics for Data Science | Software Engineering | Computer Networks | Programming in Java | Elective I Artificial Intelligence',
    sem3: 'Elective II | Elective III | Elective IV | Elective V | Elective VI',
    sem4: 'Elective VII | Seminar | Project Work',
    highlight: 'UGC-entitled and AICTE-approved MCA degree; Degree equivalent to on-campus program; 2-year online program with flexible learning; Live online classes by VIT faculty and industry experts; Recorded lectures for self-paced learning; Industry-aligned cur',
    programOverview: 'The online MCA at Vellore Institute of Technology is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-entitled and AICTE-approved MCA degree. Degree equivalent to on-campus program. 2-year online program with flexible learning. Live online classes by VIT faculty and industry experts. Recorded lectures for self-paced learning.\n\nThere are 11 specialisation options, including Artificial Intelligence, Machine Learning, Cyber Security, and 8 more. All students start with the same core subjects in semesters one and two, then move into their chosen specialisation from semester three, finishing with advanced electives and a project.',
  },
  'vignan-university-online||MCA': {
    sem1: 'Probability and Statistics | C & Data Structures | Operating System | Computer Architecture and Organization | Web Technologies',
    sem2: 'Design and Analysis of Algorithms | Database Management System | Software Engineering | Java Programming | Python Programming',
    specSyllabus: {
      'Computer Science and IT': {
        sem3: 'Computer Networks | Big Data Analytics | Data Visualization | Machine Learning | Cloud Computing',
        sem4: 'Cryptography and Network Security | Blockchain Technology | Cyber Security | Project',
      },
      'Data Science': {
        sem3: 'Computer Networks | Big Data Analytics | Data Visualization | Machine Learning | SQL for Data Science',
        sem4: 'Cryptography and Network Security | Reinforcement Learning | Natural Language Processing | Project',
      },
    },
    highlight: 'Strong Foundation in Computer Science & IT; In-depth Programming & Software Skills; Practical & Lab-Based Learning; Industry-Relevant Curriculum; Focus on Core IT Skill Development; Project-Based Learning Approach; Advanced Certifications (Cloud Comp',
    programOverview: 'The online MCA at Vignan\'s is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nStrong Foundation in Computer Science & IT. In-depth Programming & Software Skills. Practical & Lab-Based Learning. Industry-Relevant Curriculum. Focus on Core IT Skill Development.\n\nStudents pick a specialisation from tracks like Computer Science and IT and Data Science. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },
  'vtu-online||MCA': {
    sem1: 'Mathematical Foundation for Computer Application | Operating System | Database Management System | Programming Using C | C Programming Lab | Database Management Lab',
    sem2: 'Data Structure and Algorithms | Object Oriented Programming Using Python | Software Engineering | Computer Networks | Data Structure Lab | Python Lab',
    specSyllabus: {
      'General': {
        sem3: 'Web Programming | Object Oriented Programming Using Java | Analysis & Design of Algorithm | Elective-I | Data Analytics Using Python | Introduction to Data Mining | Cryptography and Network Security | Web Programming Lab | Programming using Java Lab',
        sem4: 'Elective-II | Cloud Computing | Big Data Analytics | Cyber Security Governance, Risk & Compliance | Elective-III | Artificial Intelligence | Blockchain Technology | Machine Learning | Major Project',
      },
      'Artificial Intelligence & Data Science': {
        sem3: 'Artificial Intelligence | Data Analytics Using Python | Elective-I | Big Data Analytics | Data Mining | Linear Algebra and Applications | Elective-II | Data Visualization | Agile Technologies | Natural Language Processing | Artificial Intelligence Lab | Data Analytics Lab',
        sem4: 'Deep Learning | Elective-III | Data and Web Mining | Predictive Analysis | Artificial Intelligence in Cyber Security | Major Project',
      },
      'Cyber Security & Cloud Computing': {
        sem3: 'Ethical Hacking | Cloud Web Services | Elective-I | Principles of Virtualization | Storage and Data Centre | Cloud Computing | Elective-II | Blockchain Technology | AI in Cyber Security | Cyber Security Governance, Risk & Compliance | Ethical Hacking Lab | Cloud Web Services Lab',
        sem4: 'Digital Forensics | Elective-III | Cyber Security and Cyber Law | Cryptography and Network Security | Python Scripting for Security | Major Project',
      },
    },
    highlight: 'UGC-Approved & Government University (Karnataka); Industry-Focused Curriculum (AI, Cloud, Cybersecurity, Data Science); Strong Focus on Practical Learning & Real-World Projects; Flexible Online Learning (Live + Recorded Classes); Designed for Working',
    programOverview: 'The online MCA at Visveswaraya Technological University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-Approved & Government University (Karnataka). Industry-Focused Curriculum (AI, Cloud, Cybersecurity, Data Science). Strong Focus on Practical Learning & Real-World Projects. Flexible Online Learning (Live + Recorded Classes). Designed for Working Professionals.\n\nStudents pick a specialisation from tracks like Artificial Intelligence & Data Science and Cyber Security & Cloud Computing. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },
  'vivekananda-global-university-online||MCA': {
    sem1: 'Mathematical Foundation for Computer Application | Fundamentals of Computer and Programming in C | Operating Systems | Database Management System | Software Engineering and Project Management | Virtualization and Cloud Technology | Web Technology Lab | Trans-Disciplinary Project',
    sem2: 'Object-Oriented Programming using Java | Data Structures and Algorithms Using C | Computer Networks | Machine Learning with Python | Linux and Shell Programming | Trans-Disciplinary Project | Artificial Intelligence | Introduction to Data Science | Cloud Architectural Patterns | Data Visualization',
    sem3: 'Design & Analysis of Algorithm | Deep Learning | Natural Processing Language | Artificial Intelligence and Intelligent Agents | Seminar | Summer Internship | Transdisciplinary Project | Artificial Intelligence | Elective II (AI) Big Data Analytics | Elective II (AI) Knowledge Engineering & Expert Systems | Elective II (AI) Pattern Recognition | Elective II (AI) Blockchain | Elective II (CTIS) Storage and Data Center | Elective II (CTIS) Cloud Web Services | Elective II (CTIS) Cryptography and Network Security | Elective II (CTIS) Cyber Forensics | Elective II (CTIS) Ethical Hacking | Elective II (CTIS) Blockchain | Elective II (CTIS) Security Architecture',
    sem4: 'Project Phase II | Industry Internship | Research Project | Industrial Project | Academic/Research Lab Project | Research Publications | Trans-Disciplinary Project',
    highlight: 'UGC-approved and NAAC A+ accredited degree; 100% online flexible learning; Study anytime from anywhere; Industry-aligned curriculum; Focus on AI, Machine Learning, Cloud Computing and Cybersecurity; Hands-on learning with AI, ML and Blockchain labs; ',
    programOverview: 'The online MCA at Vivekananda Global University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-approved and NAAC A+ accredited degree. 100% online flexible learning. Study anytime from anywhere. Industry-aligned curriculum. Focus on AI, Machine Learning, Cloud Computing and Cybersecurity.\n\nStudents pick a specialisation from tracks like Artificial Intelligence and Cloud Technology & Information Security. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },
  'yenepoya-university-online||MCA': {
    sem1: 'Fundamentals of C Programming | Probability and Statistics | Generative AI for App Development | Database Management Systems | HTML, CSS, and JavaScript',
    sem2: 'Operating Systems | Python Programming | Data Structures and Algorithms | Cloud Computing Foundations | UI Development Using React',
    sem3: 'Software Testing and Quality Assurance | Web Application Development and Deployment | Machine Learning for Developers | Java Programming | Advanced Database Management Systems',
    sem4: 'Project',
    highlight: 'UGC-Entitled & Recognized Degree; Flexible 100% Online Learning (Study Anytime, Anywhere); Designed for Working Professionals; Industry-Aligned Curriculum (Programming, Data, Cloud, AI); Live + Recorded Classes via LMS; Practical & Project-Based Lear',
    programOverview: 'The online MCA at Yenepoya University is a two-year, four-semester postgraduate program approved by UGC DEB. It covers software development, data structures, networking, database management, and emerging technologies like cloud computing and artificial intelligence. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, so the MCA you earn here is fully valid for private employment, government roles, and further education.\n\nUGC-Entitled & Recognized Degree. Flexible 100% Online Learning (Study Anytime, Anywhere). Designed for Working Professionals. Industry-Aligned Curriculum (Programming, Data, Cloud, AI). Live + Recorded Classes via LMS.\n\nStudents pick a specialisation from tracks like Computer Science and Information Technology and Cloud Computing and Cyber Security. The first two semesters are common for all students, covering foundational computer science subjects. From semester three onwards, coursework becomes specific to the chosen track, with project work and electives rounding out the final semester.',
  },

  'chhatrapati-shahu-ji-maharaj-university-online||MCA': {
    programOverview: 'The online MCA at Chatrapati Shahuji Maharaj University is a UGC DEB approved two-year postgraduate program. The Government of India has formally recognised that online degrees from UGC DEB approved universities carry the same academic and legal standing as regular campus degrees, making this MCA fully valid for private employment, government roles, and higher studies.',
  },

  'ganpat-university-online||MCA': {
    highlight: 'UGC-Entitled Online Degree; Industry-Aligned Curriculum (Java, Python, .NET); Strong Focus on Software Development & Emerging Technologies; Covers Data Science, Cloud Computing & Networking; Flexible 100% Online Learning (Live + Recorded Sessions); A',
    programOverview: 'The online MCA at Ganpat university is a UGC DEB approved two-year postgraduate program. The Government of India has formally recognised that online degrees from UGC DEB approved universities carry the same academic and legal standing as regular campus degrees, making this MCA fully valid for private employment, government roles, and higher studies.\n\nUGC-Entitled Online Degree. Industry-Aligned Curriculum (Java, Python, .NET). Strong Focus on Software Development & Emerging Technologies. Covers Data Science, Cloud Computing & Networking.',
  },

  'graphic-era-university-online||MCA': {
    highlight: 'UGC-approved online MCA program; 2-year flexible duration (extendable up to 5 years); Industry-relevant curriculum focused on programming, software development and IT applications; Strong foundation in computer science and application development; Em',
    programOverview: 'The online MCA at Graphic Era University is a UGC DEB approved two-year postgraduate program. The Government of India has formally recognised that online degrees from UGC DEB approved universities carry the same academic and legal standing as regular campus degrees, making this MCA fully valid for private employment, government roles, and higher studies.\n\nUGC-approved online MCA program. 2-year flexible duration (extendable up to 5 years). Industry-relevant curriculum focused on programming, software development and IT applications. Strong foundation in computer science and application development.',
  },

  'guru-ghasidas-vishwavidyalaya-online||MCA': {
    highlight: 'UGC-DEB Entitled Central University; NAAC A++ Accredited; UGC Category-1 University with Graded Autonomy; Strong National & Global Rankings (QS, THE, India Today); Flexible Online Learning (Anytime, Anywhere); Expert Faculty & Academic Excellence; In',
    programOverview: 'The online MCA at Guru Ghasidas Vishwavidyalaya is a UGC DEB approved two-year postgraduate program. The Government of India has formally recognised that online degrees from UGC DEB approved universities carry the same academic and legal standing as regular campus degrees, making this MCA fully valid for private employment, government roles, and higher studies.\n\nUGC-DEB Entitled Central University. NAAC A++ Accredited. UGC Category-1 University with Graded Autonomy. Strong National & Global Rankings (QS, THE, India Today).',
  },

  'jamia-hamdard-online||MCA': {
    highlight: 'UGC-Approved & NAAC A++ Accredited University; Industry-Aligned Curriculum with Emerging Technologies (AI, Cloud, Cybersecurity); Strong Focus on Programming, Systems & Data Analytics; Flexible Online Learning (Live + Recorded Classes); LMS Access wi',
    programOverview: 'The online MCA at Jamia Hamdard is a UGC DEB approved two-year postgraduate program. The Government of India has formally recognised that online degrees from UGC DEB approved universities carry the same academic and legal standing as regular campus degrees, making this MCA fully valid for private employment, government roles, and higher studies.\n\nUGC-Approved & NAAC A++ Accredited University. Industry-Aligned Curriculum with Emerging Technologies (AI, Cloud, Cybersecurity). Strong Focus on Programming, Systems & Data Analytics. Flexible Online Learning (Live + Recorded Classes).',
  },

  'mats-university-online||MCA': {
    highlight: 'Comprehensive IT Curriculum (Programming, AI, Cloud, Data Analytics); Strong Focus on Advanced Technologies (Machine Learning, Cybersecurity, Mobile App Development); Project-Based Learning Approach; Industry Internship & Research Opportunities; Mult',
    programOverview: 'The online MCA at MATS University is a UGC DEB approved two-year postgraduate program. The Government of India has formally recognised that online degrees from UGC DEB approved universities carry the same academic and legal standing as regular campus degrees, making this MCA fully valid for private employment, government roles, and higher studies.\n\nComprehensive IT Curriculum (Programming, AI, Cloud, Data Analytics). Strong Focus on Advanced Technologies (Machine Learning, Cybersecurity, Mobile App Development). Project-Based Learning Approach. Industry Internship & Research Opportunities.',
  },

  'parul-university-online||MCA': {
    highlight: 'NAAC A++ Accredited University; UGC-Entitled Online Degree; Flexible 100% Online Learning; Industry-Aligned Curriculum (AI, ML, Blockchain); Multiple Specializations (Cybersecurity, AI/ML, Full Stack); Designed for Working Professionals; LMS with 24x',
    programOverview: 'The online MCA at Parul University is a UGC DEB approved two-year postgraduate program. The Government of India has formally recognised that online degrees from UGC DEB approved universities carry the same academic and legal standing as regular campus degrees, making this MCA fully valid for private employment, government roles, and higher studies.\n\nNAAC A++ Accredited University. UGC-Entitled Online Degree. Flexible 100% Online Learning. Industry-Aligned Curriculum (AI, ML, Blockchain).\n\nSpecialisation options include Cybersecurity & Forensic, Full Stack Web Development, Artificial Intelligence / Machine Learning.',
  },
  'assam-down-town-university-online||MCA': {
    highlight: 'UGC-DEB Approved & NAAC A+ Accredited; Industry-Oriented Curriculum; Strong Focus on Programming & IT Skills; Hands-On Learning with Projects & Case Studies; Live + Recorded Classes via LMS; 24x7 Learning Support',
    programOverview: 'The online MCA at Assam Down Town University is a UGC DEB approved two-year postgraduate program built around software development, data structures, programming fundamentals, and specialised tracks in AI and Data Science. The Government of India has formally recognised that online degrees from UGC DEB approved universities hold the same academic and legal standing as regular campus degrees, making this MCA fully valid for private employment, government roles, and further education.\n\nUGC-DEB Approved and NAAC A+ Accredited. The curriculum is industry-oriented with a strong focus on programming and IT skills. Learning happens through live and recorded classes on a dedicated LMS with 24x7 access, and the program includes hands-on projects and case studies to give students practical exposure alongside theory.\n\nStudents pick a specialisation from Artificial Intelligence & Machine Learning or Data Science. Both tracks share a common foundation in semesters one and two, then branch into advanced domain subjects in semesters three and four. The total program fee is Rs. 90,000 payable at Rs. 22,500 per semester, with EMI options available.',
  },

}

export function getMasterSyllabus(uniId: string, degree: string): MasterSyllabus | null {
  return MASTER_SYLLABUS[`${uniId}||${degree}`] || null
}


export const UNIVERSITY_LOGOS: Record<string, string> = {
  'amity': '/logos/university_logos/amity-online-university-logo_2.svg',
  'amity_university': '/logos/university_logos/amity-online-university-logo_2.svg',
  'jain': '/logos/university_logos/jain_university-logo.svg',
  'lpu': '/logos/university_logos/lpu-logo.svg',
  'chandigarh': '/logos/university_logos/cu-online.svg',
  'mahe-manipal': '/logos/university_logos/mahe-manipal-online-logo.svg',
  'manipal-jaipur': '/logos/university_logos/muj-logo.svg',
  'nmims': '/logos/university_logos/nmims-online-logo.svg',
  'dypatil': '/logos/university_logos/dpu-online.svg',
  'alliance-universi': '/logos/university_logos/alliance-university-logo.svg',
  'amrita-vishwa-vidyapee': '/logos/university_logos/amrita-online-logo.svg',
  'chitkara-universi': '/logos/university_logos/chitkara-university-online.svg',
  'sikkim-manipal': '/logos/university_logos/sikkim-manipal-university-logo.svg',
  'shoolini': '/logos/university_logos/shoolini-university-online-logo.svg',
  'kurukshetra-universi': '/logos/university_logos/kurukshetra-university-logo.svg',
  'jamia-hamdard': '/logos/university_logos/jamia-hamdard-online-logo.svg',
  'uttaranchal-universi': '/logos/university_logos/uttaranchal-online-university-logo_1.svg',
  'vivekana-global-universi': '/logos/university_logos/vivekananda-global-university-logo.svg',
  'manav-rachna-internat-institut': '/logos/university_logos/manav-rachna-university-logo.svg',
  'alagappa-universi': '/logos/university_logos/bvdu-logo.svg', // Placeholder fix
  'vignans-foundati-for-science': '/logos/university_logos/kl-university-online-logo.svg'
}

export function getUniversityLogo(uniId: string): string | null {
  return UNIVERSITY_LOGOS[uniId] || null
}
