// Per-specialization SEO overrides for /programs/mba/[spec] hub pages.
// Keyed by spec slug. When present, these values replace the generic template
// in generateMetadata() and the H1/intro in MBASpecHubClient.

export interface MBASpecSeoOverride {
  title: string
  description: string
  h1: string
  intro: string
}

export const MBA_SPEC_SEO_OVERRIDES: Record<string, MBASpecSeoOverride> = {
  'finance': {
    title: 'Online MBA in Finance 2026: Top Universities, Fees, Syllabus | edifyedu.in',
    description: 'Compare online MBA in Finance from Amity, NMIMS, Symbiosis, LPU, MAHE. Fees from ₹80K to ₹3.7L. UGC-DEB approved. Honest comparison with zero commissions.',
    h1: 'Online MBA in Finance 2026: Universities, Fees, and Career Scope',
    intro: 'An online MBA in Finance is one of the most searched specializations in India, and for good reason. It opens doors to roles in banking, wealth management, corporate finance, and fintech. This page compares every UGC-DEB approved university offering an online MBA Finance programme, with verified fees, accreditation status, and honest placement insights. No commissions, no paid rankings.',
  },
  'marketing': {
    title: 'Online MBA in Marketing 2026: Top Universities, Fees, Syllabus | edifyedu.in',
    description: 'Online MBA Marketing from Amity, NMIMS, Symbiosis, Jain, LPU. Fees comparison, syllabus, career scope. UGC-DEB approved programmes only. Zero-commission guide.',
    h1: 'Online MBA in Marketing 2026: Universities, Fees, and Career Guide',
    intro: 'An online MBA in Marketing prepares you for brand management, digital strategy, sales leadership, and market research roles. This page lists every UGC-DEB approved online MBA Marketing programme in India with real fee comparisons, accreditation checks, and placement data. edifyedu.in earns zero commissions from any university listed here.',
  },
  'human-resource-management': {
    title: 'Online MBA in HR 2026: Top Universities, Fees, Human Resource Management | edifyedu.in',
    description: 'Online MBA in Human Resource Management from top Indian universities. Fees, syllabus, and career scope. Compare Amity, LPU, Symbiosis, NMIMS HR programmes.',
    h1: 'Online MBA in HR (Human Resource Management) 2026: Fees and Universities',
    intro: 'An online MBA in Human Resource Management is ideal for professionals in talent acquisition, L&D, compensation, and people operations. This page covers every UGC-DEB approved online MBA HR programme in India with fee breakdowns and honest reviews. edifyedu.in is commission-free and ranks no university based on payments.',
  },
  'healthcare-management': {
    title: 'Online MBA in Healthcare Management 2026: Fees, Top Universities | edifyedu.in',
    description: 'Online MBA in Healthcare and Hospital Management. Compare Amity, Symbiosis, MAHE, Manipal, LPU. Fees from ₹80K. UGC-DEB approved. Independent comparison.',
    h1: 'Online MBA in Healthcare Management 2026: Fees, Universities, and Career Scope',
    intro: 'An online MBA in Healthcare Management or Hospital Administration is one of the fastest-growing specializations in India. From hospital chains to health-tech startups, this degree opens diverse career paths. Compare all UGC-DEB approved programmes here with verified fees and accreditation data. edifyedu.in earns zero commissions.',
  },
  'business-analytics': {
    title: 'Online MBA in Business Analytics 2026: Top Universities, Fees | edifyedu.in',
    description: 'Online MBA in Business Analytics and Data Analytics. Amity, NMIMS, Symbiosis, Jain, MAHE compared. Fees, syllabus, tools covered. UGC-DEB approved only.',
    h1: 'Online MBA in Business Analytics 2026: Universities, Fees, and Tools Covered',
    intro: 'An online MBA in Business Analytics or Data Analytics trains you in data-driven decision making, predictive modelling, and business intelligence. This page compares every UGC-DEB approved online MBA Analytics programme in India. All fees verified, no rankings influenced by commissions.',
  },
  'operations-management': {
    title: 'Online MBA in Operations Management 2026: Universities, Fees | edifyedu.in',
    description: 'Online MBA in Operations and Supply Chain Management. Compare fees across Amity, LPU, Symbiosis, NMIMS. UGC-DEB approved. Honest zero-commission guide.',
    h1: 'Online MBA in Operations Management 2026: Fees, Universities, and Career Guide',
    intro: 'An online MBA in Operations Management covers supply chain optimization, procurement, quality management, and logistics. This page lists all UGC-DEB approved programmes with real fee data and honest comparisons. edifyedu.in is fully independent.',
  },
  'it-management': {
    title: 'Online MBA in IT Management 2026: Universities, Fees, Career Scope | edifyedu.in',
    description: 'Online MBA in Information Technology Management. Compare Amity, NMIMS, Jain, LPU IT programmes. Fees, syllabus, career paths. UGC-DEB approved.',
    h1: 'Online MBA in IT Management 2026: Fees, Universities, and Career Paths',
    intro: 'An online MBA in IT Management bridges technology and business leadership. It prepares you for roles like IT Director, CTO track, tech consulting, and digital transformation. Compare all UGC-DEB approved online MBA IT programmes here with verified fees.',
  },
  'digital-marketing': {
    title: 'Online MBA in Digital Marketing 2026: Top Universities, Fees | edifyedu.in',
    description: 'Online MBA in Digital Marketing from Amity, Jain, LPU, Chandigarh. Fees, syllabus, and career scope. UGC-DEB approved programmes. Zero-commission comparison.',
    h1: 'Online MBA in Digital Marketing 2026: Universities, Fees, and Syllabus',
    intro: 'An online MBA in Digital Marketing combines core MBA fundamentals with SEO, performance marketing, social media strategy, and marketing analytics. This page compares every UGC-DEB approved programme in India with honest fee data. edifyedu.in earns nothing from any university listed.',
  },
  'project-management': {
    title: 'Online MBA in Project Management 2026: Universities, Fees | edifyedu.in',
    description: 'Online MBA in Project Management. Compare Amity, NMIMS, Jain, LPU programmes. Fees, PMP alignment, career scope. UGC-DEB approved. Independent guide.',
    h1: 'Online MBA in Project Management 2026: Fees, Universities, and Career Scope',
    intro: 'An online MBA in Project Management is designed for professionals in PMO, consulting, IT delivery, and infrastructure. This page covers all UGC-DEB approved programmes with fee comparisons and honest reviews.',
  },
  'international-business': {
    title: 'Online MBA in International Business 2026: Universities, Fees | edifyedu.in',
    description: 'Online MBA in International Business from Amity, Symbiosis, NMIMS, Jain. Fees, trade law syllabus, export career scope. UGC-DEB approved.',
    h1: 'Online MBA in International Business 2026: Fees, Universities, and Trade Career Guide',
    intro: 'An online MBA in International Business prepares you for roles in export management, global supply chain, trade compliance, and cross-border strategy. Compare all UGC-DEB approved programmes with verified fees here.',
  },
  'supply-chain-management': {
    title: 'Online MBA in Supply Chain Management 2026: Universities, Fees | edifyedu.in',
    description: 'Online MBA in Supply Chain and Logistics Management. Compare Amity, Symbiosis, LPU, NMIMS. Fees, career scope. UGC-DEB approved programmes only.',
    h1: 'Online MBA in Supply Chain Management 2026: Fees, Universities, and Logistics Career Guide',
    intro: 'An online MBA in Supply Chain Management covers procurement, logistics, inventory optimization, and vendor management. This page compares every UGC-DEB approved programme in India with real fee data.',
  },
  'entrepreneurship': {
    title: 'Online MBA in Entrepreneurship 2026: Universities, Fees | edifyedu.in',
    description: 'Online MBA in Entrepreneurship from Amity, Jain, LPU, Symbiosis. Fees, startup syllabus, venture building. UGC-DEB approved. Commission-free guide.',
    h1: 'Online MBA in Entrepreneurship 2026: Universities, Fees, and Startup Career Guide',
    intro: 'An online MBA in Entrepreneurship is built for aspiring founders, family business successors, and intrapreneurs. This page compares UGC-DEB approved programmes with honest fee data and curriculum breakdowns.',
  },
  'data-science': {
    title: 'Online MBA in Data Science 2026: Universities, Fees, AI and ML | edifyedu.in',
    description: 'Online MBA in Data Science and AI. Compare Amity, NMIMS, Jain, MAHE programmes. Python, ML, analytics syllabus. UGC-DEB approved. Honest comparison.',
    h1: 'Online MBA in Data Science 2026: Universities, Fees, and AI Career Guide',
    intro: 'An online MBA in Data Science blends management fundamentals with machine learning, AI, and advanced analytics. This page lists every UGC-DEB approved programme in India with verified fees and syllabus details.',
  },
  'artificial-intelligence': {
    title: 'Online MBA in Artificial Intelligence 2026: Universities, Fees | edifyedu.in',
    description: 'Online MBA in AI and Machine Learning. Top universities, fees, syllabus. Compare Amity, Jain, MAHE AI programmes. UGC-DEB approved. Zero-commission guide.',
    h1: 'Online MBA in Artificial Intelligence 2026: Fees, Universities, and Career Scope',
    intro: 'An online MBA in Artificial Intelligence prepares you for AI product management, ML strategy, and tech leadership. Compare all UGC-DEB approved programmes with verified fees here.',
  },
  'fintech': {
    title: 'Online MBA in FinTech 2026: Universities, Fees, Career Scope | edifyedu.in',
    description: 'Online MBA in FinTech and Financial Technology. Compare Amity, Jain, NMIMS programmes. Blockchain, digital payments syllabus. UGC-DEB approved.',
    h1: 'Online MBA in FinTech 2026: Universities, Fees, and Digital Finance Career Guide',
    intro: 'An online MBA in FinTech covers digital banking, blockchain, payments infrastructure, and regulatory technology. Compare UGC-DEB approved programmes with honest fee data here.',
  },
  'banking-finance': {
    title: 'Online MBA in Banking and Finance 2026: Universities, Fees | edifyedu.in',
    description: 'Online MBA in Banking and Finance Management. Compare Amity, NMIMS, Symbiosis, Jain. Fees, BFSI career scope. UGC-DEB approved programmes.',
    h1: 'Online MBA in Banking and Finance 2026: Fees, Universities, and BFSI Career Guide',
    intro: 'An online MBA in Banking and Finance is tailored for BFSI professionals aiming for leadership in retail banking, corporate lending, insurance, and investment management. Compare all UGC-DEB approved programmes here.',
  },
  'media-management': {
    title: 'Online MBA in Media Management 2026: Universities, Fees | edifyedu.in',
    description: 'Online MBA in Media and Communication Management. Compare Amity, Symbiosis, Jain programmes. Fees, content industry career scope. UGC-DEB approved.',
    h1: 'Online MBA in Media Management 2026: Universities, Fees, and Career Guide',
    intro: 'An online MBA in Media Management prepares you for leadership roles in content strategy, broadcast management, OTT platforms, and digital media operations. Compare UGC-DEB approved programmes with honest fee data.',
  },
  'pharmaceutical-management': {
    title: 'Online MBA in Pharmaceutical Management 2026: Universities, Fees | edifyedu.in',
    description: 'Online MBA in Pharma Management. Compare Amity, Symbiosis, NMIMS programmes. Fees, drug regulatory affairs, pharma career scope. UGC-DEB approved.',
    h1: 'Online MBA in Pharmaceutical Management 2026: Fees, Universities, and Pharma Career Guide',
    intro: 'An online MBA in Pharmaceutical Management is designed for professionals in drug development, regulatory affairs, pharma marketing, and clinical operations. Compare UGC-DEB approved programmes here.',
  },
}
