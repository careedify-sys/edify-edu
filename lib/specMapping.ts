// lib/specMapping.ts — Canonical spec name mapping + domain content
// Used by /programs/mba hub + /programs/mba/{spec} dedicated pages

import { DollarSign, Users, Megaphone, Globe, BarChart3, Database, Brain, Settings, Truck, Heart, Globe2, Cpu, TrendingUp, Wheat, ShoppingBag, Rocket, BookOpen, Shield, Briefcase, type LucideIcon } from 'lucide-react'

export interface CanonicalSpec {
  slug: string
  canonicalName: string
  variants: string[]
  careerTag: string
  icon: LucideIcon
  relatedSpecs: string[]
  domainDescription: string
  typicalRoles: { entry: string[]; mid: string[]; industries: string[] }
  watchOut: string
}

export const CANONICAL_SPECS: CanonicalSpec[] = [
  {
    slug: 'finance',
    canonicalName: 'Online MBA Finance',
    variants: ['finance', 'financial-management', 'finance-management', 'finance-and-accounting-management', 'global-finance-market'],
    careerTag: 'Banking - Investment - Corporate Finance',
    icon: DollarSign,
    relatedSpecs: ['fintech', 'international-finance-accounting', 'banking-insurance'],
    domainDescription: 'Online MBA Finance equips professionals to manage financial decisions in corporations, advisory firms, and financial institutions. Core areas include corporate finance, capital markets, investment analysis, risk management, and financial modelling. Typical curriculum covers financial statement analysis, working capital management, security analysis and portfolio management, mergers and acquisitions, international finance, and financial derivatives. This specialisation suits working professionals in banking, accounting, consulting, or corporate finance looking to move into senior finance roles.',
    typicalRoles: {
      entry: ['Financial Analyst', 'Credit Analyst', 'Investment Associate', 'Corporate Banking Trainee'],
      mid: ['Finance Manager', 'Portfolio Manager', 'Corporate Finance Lead', 'Treasury Head', 'CFO track'],
      industries: ['Banking', 'Investment Advisory', 'Corporate Finance', 'Insurance', 'Consulting', 'Asset Management'],
    },
    watchOut: 'Most universities offer this. Compare scholarships, EMI, and LMS quality for real differentiation.',
  },
  {
    slug: 'human-resource-management',
    canonicalName: 'Online MBA Human Resources',
    variants: ['human-resource-management', 'hr-management', 'human-resource', 'human-resources', 'strategic-human-resource-management'],
    careerTag: 'HR Strategy - Talent Management - OD',
    icon: Users,
    relatedSpecs: ['operations-management'],
    domainDescription: 'Online MBA in Human Resources prepares professionals for strategic people management roles. Core areas include talent acquisition, performance management, compensation design, industrial relations, labour law, and organisational development. HR analytics and HRIS systems are increasingly part of modern curricula. This specialisation suits HR executives, recruiters, L&D professionals, and anyone moving into HRBP or CHRO-track roles.',
    typicalRoles: {
      entry: ['HR Executive', 'Recruitment Executive', 'Compensation Analyst', 'L&D Coordinator'],
      mid: ['HR Manager', 'HRBP', 'Talent Acquisition Head', 'Compensation Manager', 'CHRO track'],
      industries: ['IT Services', 'Manufacturing', 'Banking', 'FMCG', 'Consulting', 'Healthcare'],
    },
    watchOut: 'Most universities offer this. Compare scholarships, EMI, and LMS quality for real differentiation.',
  },
  {
    slug: 'marketing',
    canonicalName: 'Online MBA Marketing',
    variants: ['marketing', 'marketing-management', 'marketing-sales-management'],
    careerTag: 'Brand - Digital - Sales',
    icon: Megaphone,
    relatedSpecs: ['digital-marketing', 'retail-management'],
    domainDescription: 'Online MBA Marketing covers brand management, consumer behaviour, sales and distribution, services marketing, and integrated marketing communication. Modern programmes add digital marketing, marketing analytics, and CRM. This specialisation suits professionals in FMCG, retail, e-commerce, and advertising who want to move into brand manager, marketing head, or CMO roles.',
    typicalRoles: {
      entry: ['Marketing Executive', 'Brand Executive', 'Sales Executive', 'Market Research Analyst'],
      mid: ['Brand Manager', 'Marketing Manager', 'Regional Sales Manager', 'CMO track'],
      industries: ['FMCG', 'E-commerce', 'Retail', 'Banking', 'Telecom', 'Media'],
    },
    watchOut: 'Most universities offer this. Compare scholarships, EMI, and LMS quality for real differentiation.',
  },
  {
    slug: 'business-analytics',
    canonicalName: 'Online MBA Business Analytics',
    variants: ['business-analytics', 'business-analytics-ai', 'analytics-and-data-science', 'business-intelligence-and-analytics'],
    careerTag: 'Analytics - BI - Data-Driven Decisions',
    icon: BarChart3,
    relatedSpecs: ['data-science', 'it-management'],
    domainDescription: 'Online MBA Business Analytics combines management fundamentals with data analysis skills. Core areas include data visualisation, statistical modelling, Python/R programming, predictive analytics, and business intelligence. This specialisation suits professionals who want to lead analytics teams and translate data into business decisions rather than build ML models.',
    typicalRoles: {
      entry: ['Business Analyst', 'Data Analyst', 'BI Analyst', 'MIS Executive'],
      mid: ['Analytics Manager', 'BI Manager', 'Data Strategy Manager', 'Head of Analytics'],
      industries: ['IT Services', 'Banking', 'E-commerce', 'Retail', 'Telecom', 'Consulting'],
    },
    watchOut: 'Curriculum depth differs across unis. Compare Sem 3-4 subjects before deciding.',
  },
  {
    slug: 'operations-management',
    canonicalName: 'Online MBA Operations Management',
    variants: ['operations-management', 'operations', 'production-and-operations-management', 'production-operations', 'production-operations-management'],
    careerTag: 'Manufacturing - Quality - Process',
    icon: Settings,
    relatedSpecs: ['logistics-supply-chain-management', 'project-management'],
    domainDescription: 'Online MBA Operations Management covers production planning, inventory management, quality management, lean manufacturing, and service operations. Programmes often include TQM, Six Sigma, and World Class Manufacturing modules. This specialisation suits professionals in manufacturing, e-commerce fulfilment, and service delivery targeting plant manager, operations head, or COO roles.',
    typicalRoles: {
      entry: ['Operations Executive', 'Production Supervisor', 'Quality Analyst', 'Process Improvement Analyst'],
      mid: ['Operations Manager', 'Plant Manager', 'Quality Manager', 'VP Operations', 'COO track'],
      industries: ['Manufacturing', 'E-commerce', 'FMCG', 'Pharma', 'IT Services'],
    },
    watchOut: 'Most universities offer this. Compare scholarships, EMI, and LMS quality for real differentiation.',
  },
  {
    slug: 'digital-marketing',
    canonicalName: 'Online MBA Digital Marketing',
    variants: ['digital-marketing', 'digital-marketing-management', 'digital-marketing-and-e-commerce'],
    careerTag: 'SEO - Social Media - Performance Marketing',
    icon: Globe,
    relatedSpecs: ['marketing', 'business-analytics'],
    domainDescription: 'Online MBA Digital Marketing focuses on SEO/SEM, social media strategy, content marketing, performance marketing, and marketing analytics. This specialisation suits professionals targeting digital marketing manager, growth marketing lead, or head of digital roles in agencies, e-commerce, D2C brands, and tech companies.',
    typicalRoles: {
      entry: ['Digital Marketing Executive', 'SEO Analyst', 'Social Media Executive', 'Content Marketing Associate'],
      mid: ['Digital Marketing Manager', 'Growth Manager', 'Performance Marketing Lead', 'Head of Digital'],
      industries: ['E-commerce', 'Digital Agencies', 'D2C Brands', 'EdTech', 'FinTech'],
    },
    watchOut: 'Curriculum depth differs across unis. Compare Sem 3-4 subjects before deciding.',
  },
  {
    slug: 'international-business',
    canonicalName: 'Online MBA International Business',
    variants: ['international-business', 'international-business-management'],
    careerTag: 'Trade - Export-Import - MNC Strategy',
    icon: Globe2,
    relatedSpecs: ['finance', 'logistics-supply-chain-management'],
    domainDescription: 'Online MBA International Business covers international marketing, trade finance, export-import procedures, global logistics, international business law, and cross-cultural management. This specialisation suits professionals in trading companies, export houses, MNC operations, and international logistics.',
    typicalRoles: {
      entry: ['International Trade Analyst', 'Export Executive', 'Trade Finance Analyst'],
      mid: ['Export Manager', 'Country Manager', 'International Business Manager', 'VP International'],
      industries: ['Trading Companies', 'MNCs', 'Logistics', 'Banking (Trade Finance)', 'Government Trade Bodies'],
    },
    watchOut: 'Recruiter network is narrower. Check each uni\'s sector tie-ups.',
  },
  {
    slug: 'it-management',
    canonicalName: 'Online MBA IT Management',
    variants: ['it-management', 'information-technology', 'information-technology-management', 'it-business-analytics', 'it-systems-management', 'information-system-management', 'information-systems'],
    careerTag: 'IT Governance - ERP - Digital Transformation',
    icon: Cpu,
    relatedSpecs: ['business-analytics', 'data-science'],
    domainDescription: 'Online MBA IT Management bridges technology and business leadership. Core areas include IT strategy, ERP, database management, IT security, and digital transformation. This specialisation suits IT professionals targeting CIO-track, IT governance, or enterprise IT leadership roles.',
    typicalRoles: {
      entry: ['IT Analyst', 'ERP Consultant', 'IT Project Coordinator', 'BI Analyst'],
      mid: ['IT Manager', 'ERP Programme Manager', 'CISO', 'CIO track'],
      industries: ['IT Services', 'Banking IT', 'Manufacturing IT', 'Consulting', 'Government IT'],
    },
    watchOut: 'Curriculum depth differs across unis. Compare Sem 3-4 subjects before deciding.',
  },
  {
    slug: 'healthcare-management',
    canonicalName: 'Online MBA Healthcare Management',
    variants: ['healthcare-management', 'healthcare-and-hospital-administration', 'hospital-administration-healthcare-management', 'hospital-and-health-care-management', 'hospital-health-care-management', 'hospital-health-systems-management', 'hospital-healthcare-management', 'hospital-management', 'healthcare', 'pharma-health-care-management'],
    careerTag: 'Hospital Admin - Health Systems - Quality',
    icon: Heart,
    relatedSpecs: ['operations-management'],
    domainDescription: 'Online MBA Healthcare Management covers hospital operations, health informatics, quality management (NABH), healthcare finance, medical records management, and public health. This specialisation suits professionals in hospitals, healthcare chains, pharma companies, and health insurance targeting administrator, quality manager, or hospital CEO roles.',
    typicalRoles: {
      entry: ['Hospital Administrator (Junior)', 'Healthcare Operations Executive', 'Quality Coordinator'],
      mid: ['Hospital Administrator', 'Operations Manager', 'Quality Manager (NABH)', 'CEO (Hospital)'],
      industries: ['Hospitals', 'Healthcare Chains', 'Pharma', 'Health Insurance', 'Government Health'],
    },
    watchOut: 'Recruiter network is narrower. Check each uni\'s healthcare sector tie-ups.',
  },
  {
    slug: 'logistics-supply-chain-management',
    canonicalName: 'Online MBA Logistics and Supply Chain',
    variants: ['logistics-supply-chain-management', 'logistics-and-supply-chain-management', 'supply-chain-management', 'supply-chain-operations-management', 'operation-supply-chain-management', 'operations-supply-chain-management'],
    careerTag: 'SCM - Warehousing - Distribution',
    icon: Truck,
    relatedSpecs: ['operations-management', 'international-business'],
    domainDescription: 'Online MBA Logistics and Supply Chain covers procurement, warehouse management, transportation, global logistics, supply chain analytics, and green supply chain. This specialisation suits professionals in e-commerce fulfilment, 3PL, FMCG distribution, and manufacturing supply chain.',
    typicalRoles: {
      entry: ['Supply Chain Coordinator', 'Logistics Executive', 'Procurement Officer'],
      mid: ['Supply Chain Manager', 'Logistics Manager', 'VP Supply Chain', 'CSCO track'],
      industries: ['E-commerce', '3PL', 'FMCG', 'Auto', 'Pharma', 'Government Logistics'],
    },
    watchOut: 'Recruiter network is narrower. Check each uni\'s sector tie-ups.',
  },
  {
    slug: 'data-science',
    canonicalName: 'Online MBA Data Science',
    variants: ['data-science', 'data-science-and-analytics', 'data-science-and-artificial-intelligence', 'data-science-artificial-intelligence', 'data-science-business-analytics'],
    careerTag: 'ML - Predictive Analytics - Big Data',
    icon: Database,
    relatedSpecs: ['business-analytics', 'ai-machine-learning'],
    domainDescription: 'Online MBA Data Science combines management skills with ML, statistical modelling, and big data technologies. Core areas include Python/R programming, predictive analytics, deep learning basics, and data visualisation. This specialisation suits professionals targeting data science team lead, analytics director, or CDO roles.',
    typicalRoles: {
      entry: ['Data Analyst', 'ML Associate', 'Data Science Associate'],
      mid: ['Data Science Manager', 'ML Engineering Manager', 'Head of Analytics', 'CDO track'],
      industries: ['IT Services', 'Banking', 'E-commerce', 'FinTech', 'HealthTech'],
    },
    watchOut: 'Curriculum depth differs across unis. Compare Sem 3-4 subjects before deciding.',
  },
  {
    slug: 'fintech',
    canonicalName: 'Online MBA FinTech',
    variants: ['fintech', 'fintech-management', 'financial-management-fintech-focus', 'digital-finance'],
    careerTag: 'Digital Banking - Payments - Blockchain',
    icon: TrendingUp,
    relatedSpecs: ['finance', 'data-science'],
    domainDescription: 'Online MBA FinTech covers digital payments, blockchain in finance, AI-driven credit scoring, regtech, digital banking, and robo-advisory platforms. This specialisation suits professionals targeting fintech product management, digital banking strategy, or payments product design roles.',
    typicalRoles: {
      entry: ['FinTech Product Analyst', 'Digital Banking Associate', 'Payments Analyst'],
      mid: ['FinTech Product Manager', 'Digital Banking Manager', 'Head of Payments', 'CPO (FinTech)'],
      industries: ['Payments', 'Neobanks', 'Digital Lending', 'InsurTech', 'Banks (Digital)'],
    },
    watchOut: 'Curriculum depth differs across unis. Compare Sem 3-4 subjects before deciding.',
  },
  {
    slug: 'project-management',
    canonicalName: 'Online MBA Project Management',
    variants: ['project-management'],
    careerTag: 'PMI - Agile - Delivery',
    icon: Briefcase,
    relatedSpecs: ['operations-management', 'it-management'],
    domainDescription: 'Online MBA Project Management covers project planning, scheduling, risk management, quality management, agile methodologies, and PMI/PMBOK-aligned frameworks. This specialisation suits professionals targeting PMP certification, IT delivery management, or construction project management roles.',
    typicalRoles: {
      entry: ['Project Coordinator', 'PMO Analyst', 'Junior Project Manager'],
      mid: ['Project Manager', 'Delivery Manager', 'Programme Manager', 'VP Delivery'],
      industries: ['IT Services', 'Construction', 'Consulting', 'Infrastructure', 'Defence'],
    },
    watchOut: 'Recruiter network is narrower. Check each uni\'s sector tie-ups.',
  },
  {
    slug: 'retail-management',
    canonicalName: 'Online MBA Retail Management',
    variants: ['retail-management', 'retail'],
    careerTag: 'Retail Ops - Category - Merchandising',
    icon: ShoppingBag,
    relatedSpecs: ['marketing', 'logistics-supply-chain-management'],
    domainDescription: 'Online MBA Retail Management covers retail formats, store operations, category management, visual merchandising, omnichannel retail, and retail supply chain. This specialisation suits professionals in retail chains, FMCG distribution, and e-commerce retail operations.',
    typicalRoles: {
      entry: ['Retail Operations Executive', 'Category Analyst', 'Store Manager Trainee'],
      mid: ['Category Manager', 'Retail Area Manager', 'Head of Retail Operations'],
      industries: ['Retail Chains', 'FMCG', 'E-commerce', 'Luxury Retail', 'Quick Commerce'],
    },
    watchOut: 'Recruiter network is narrower. Check each uni\'s sector tie-ups.',
  },
  {
    slug: 'entrepreneurship',
    canonicalName: 'Online MBA Entrepreneurship',
    variants: ['entrepreneurship', 'entrepreneurship-management', 'digital-entrepreneurship', 'entrepreneurship-and-leadership-management'],
    careerTag: 'Startup - Venture Creation - Innovation',
    icon: Rocket,
    relatedSpecs: ['marketing', 'finance'],
    domainDescription: 'Online MBA Entrepreneurship covers startup ideation, business model design, venture financing, lean methodology, and family business management. This specialisation suits aspiring founders, family business successors, and intrapreneurs building new business units.',
    typicalRoles: {
      entry: ['Startup Founder', 'Business Development Executive', 'Innovation Analyst'],
      mid: ['Founder/CEO', 'VP Business Development', 'Head of Innovation', 'Venture Partner'],
      industries: ['Startups', 'VC/PE', 'Corporate Innovation', 'Family Business', 'Consulting'],
    },
    watchOut: 'Recruiter network is narrower. Self-employment is the primary outcome.',
  },
]

export function uniHasSpec(specSlugs: string[], chipSlug: string): boolean {
  if (chipSlug === 'All') return true
  const canonical = CANONICAL_SPECS.find(s => s.slug === chipSlug)
  if (!canonical) return specSlugs.includes(chipSlug)
  return specSlugs.some(s => canonical.variants.includes(s))
}

export function getCanonicalSpec(slug: string): CanonicalSpec | undefined {
  return CANONICAL_SPECS.find(s => s.slug === slug || s.variants.includes(slug))
}

export function getAllCanonicalSlugs(): string[] {
  return CANONICAL_SPECS.map(s => s.slug)
}
