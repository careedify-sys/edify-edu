/**
 * Phase 7.1 — Amity Spec Pages Restructure
 * Applies to all 18 amity-university-online-mba-{spec}.json files:
 *   1. Restructure whoHires.body → labelled mobile-first format
 *   2. Restructure skills.body → Technical / Applied / Soft bullets
 *   3. Restructure comparisons.body → bold **vs X:** labels, no inline URLs
 *   4. Fix fees.body → correct per-spec amounts, no registration fee
 *   5. Fix tldr → correct fee amount (₹2,25,000 or ₹3,29,000)
 */

const fs = require('fs');
const path = require('path');

const DIR = path.join(process.cwd(), 'lib', 'data', 'page-content');

// ── Fee templates ──────────────────────────────────────────────────────────────
function standardFees(specName) {
  return `The total program fee for the Amity University Online MBA in ${specName} is ₹2,25,000 across 4 semesters. Per-semester fee is ₹56,300. Amity does not charge a separate registration fee.\n\nFor working professionals, Amity offers a 24-month zero-cost EMI plan at approximately ₹8,906 per month through its NBFC lending partners.\n\nEdifyEdu reconfirms fees with Amity University Online each quarter. Please reconfirm current fees with our counsellor before any payment. Fees listed are indicative.`;
}
function healthcareFees(specName) {
  return `The total program fee for the Amity University Online MBA in ${specName} is ₹3,29,000 across 4 semesters. Per-semester fee is ₹82,300. Amity does not charge a separate registration fee.\n\nFor working professionals, Amity offers a 24-month zero-cost EMI plan at approximately ₹13,023 per month through its NBFC lending partners.\n\nEdifyEdu reconfirms fees with Amity University Online each quarter. Please reconfirm current fees with our counsellor before any payment. Fees listed are indicative.`;
}

// ── Comparisons transformer ────────────────────────────────────────────────────
// Strips "(url)" and adds **bold** labels. Works on all Amity spec comparison sections.
function restructureComparisons(body) {
  // "Amity vs Foo Bar MBA (/universities/foo/mba): text" → "**vs Foo Bar MBA:** text"
  return body.replace(/Amity vs ([^\n(]+?) \(\/[^)]+\): /g, '**vs $1:** ');
}

// ── Per-spec structured content ───────────────────────────────────────────────
const SPECS = {

  'amity-university-online-mba-business-analytics': {
    specName: 'Business Analytics',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Business Analytics MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Technology, BFSI, E-commerce, Management consulting, FMCG, Manufacturing

**Entry-level roles:** Business Analyst, Data Analyst, Reporting Analyst, MIS Executive

**Mid-level roles (3-5 years experience):** Analytics Manager, Business Intelligence Lead, Senior Data Analyst, Insights Manager

**Senior roles (7+ years):** Head of Analytics, VP Business Intelligence, Chief Analytics Officer

**Top hiring organisations:** Mu Sigma, Fractal Analytics, Flipkart, Amazon India, TCS Analytics, Tiger Analytics`,

    skills: `The Business Analytics specialisation builds skills that technology and BFSI employers test in analytics management roles:

**Technical skills:**
- Power BI: dashboards, data models, and DAX measures for operational and management reporting
- Supervised Learning: regression and classification algorithms applied to churn prediction and credit risk
- Business Forecasting: time-series demand forecasting models for inventory and revenue planning
- Data Visualisation: chart selection, visual hierarchy, and storytelling from complex business datasets

**Applied skills:**
- Business Reporting: translating analytics outputs into actionable management recommendations
- Optimisation: linear programming and solver-based resource allocation for operational decisions

**Soft skills:** Presenting dashboard findings to CFOs and department heads, bridging data science and business language, managing analyst team delivery against business timelines.`,
  },

  'amity-university-online-mba-data-science': {
    specName: 'Data Science',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Data Science MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Technology, Fintech, BFSI, Management consulting, Research organisations

**Entry-level roles:** Junior Data Scientist, ML Engineer (management track), Data Science Analyst, NLP Analyst

**Mid-level roles (3-5 years experience):** Senior Data Scientist, ML Product Manager, Data Science Manager, Head of Data

**Senior roles (7+ years):** Chief Data Officer, VP Data Science, Principal Data Scientist

**Top hiring organisations:** Amazon AI, Flipkart, Fractal Analytics, HDFC Bank AI Division, Razorpay, Tiger Analytics`,

    skills: `The Data Science specialisation builds the most technically demanding skill set in the Amity MBA portfolio, tested in data science leadership roles:

**Technical skills:**
- Data Engineering: ETL pipeline design and data warehouse architecture for analytics use
- EDA: statistical summarisation, outlier detection, and visual storytelling from raw datasets
- Supervised ML: classification algorithms for churn prediction, credit risk, and fraud detection
- Deep Learning: CNN and RNN architectures for image, text, and sequence data problems

**Applied skills:**
- Unsupervised ML: K-means clustering and PCA for customer segmentation and anomaly detection
- Responsible AI: algorithmic bias testing and data governance frameworks for production models

**Soft skills:** Communicating model outputs to non-technical stakeholders, translating business problems into data science problem statements, managing data science team delivery cycles.`,
  },

  'amity-university-online-mba-digital-entrepreneurship': {
    specName: 'Digital Entrepreneurship',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Digital Entrepreneurship MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Startups, E-commerce, EdTech, Corporate innovation, Venture-backed consumer internet

**Entry-level roles:** Growth Manager (startup), Product Launch Manager, New Ventures Analyst, Business Development Associate

**Mid-level roles (3-5 years experience):** Head of New Ventures, Growth Lead, Business Development Head, Startup Operations Manager

**Senior roles (7+ years):** CEO (early-stage company), COO (growth-stage venture), Managing Director (SME)

**Top hiring organisations:** Y Combinator India portfolio, Sequoia India portfolio, HUL Launchpad, Tata Innoverse, NASSCOM startup ecosystem members`,

    skills: `The Digital Entrepreneurship specialisation builds skills that founders and venture-builders apply at every stage of the startup lifecycle:

**Technical skills:**
- Idea Validation: customer discovery, market sizing, and competitive analysis frameworks for opportunity evaluation
- Product Launch Planning: go-to-market strategy, channel selection, and early customer acquisition sequencing
- Startup Finance: unit economics, burn rate management, and cap table fundamentals for investor conversations

**Applied skills:**
- Digital Customer Acquisition: SEO, paid media, and content-led growth strategies on startup budgets
- Strategic Positioning: competitive moat identification and pivot decision criteria for early-stage companies

**Soft skills:** Investor pitch storytelling, managing early teams through uncertainty, communicating venture strategy to advisors and board members.`,
  },

  'amity-university-online-mba-digital-marketing-management': {
    specName: 'Digital Marketing Management',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Digital Marketing Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** E-commerce, FMCG digital, Digital agencies, D2C brands, Technology platforms, Fintech

**Entry-level roles:** Digital Marketing Manager (junior), Growth Marketing Analyst, Performance Marketing Specialist, Social Media Manager

**Mid-level roles (3-5 years experience):** Digital Marketing Manager, Head of Performance Marketing, Growth Lead, Digital Brand Manager

**Senior roles (7+ years):** CMO, VP Digital Marketing, Chief Growth Officer

**Top hiring organisations:** Amazon India, Flipkart, Swiggy, HUL Digital, iProspect, GroupM, Mamaearth, BOAT`,

    skills: `The Digital Marketing Management specialisation builds skills that e-commerce and FMCG digital employers test in marketing manager roles:

**Technical skills:**
- Performance Marketing: Google Ads, Meta Ads Manager, bidding strategy, ROAS optimisation, and audience targeting
- Digital Customer Analytics: GA4 event tracking, cohort analysis, and customer lifetime value modelling
- Marketing Analytics: marketing mix modelling, attribution model comparison, and campaign dashboard reporting
- Brand Management in Digital Channels: brand guidelines, cross-touchpoint consistency, and programmatic brand safety

**Applied skills:**
- Social Media Strategy: content calendar management, community building, and influencer programme management
- Digital Commerce: D2C model economics, marketplace strategy, and subscription model design principles

**Soft skills:** Writing creative briefs for agencies, presenting campaign ROI to senior leadership, managing media agency and vendor relationships.`,
  },

  'amity-university-online-mba-entrepreneurship-and-leadership-management': {
    specName: 'Entrepreneurship and Leadership Management',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Entrepreneurship and Leadership Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Growth-stage startups, Corporate innovation, PE-backed portfolio companies, Family businesses, Conglomerates

**Entry-level roles:** Innovation Analyst, Management Trainee (startup), Business Development Associate, Strategy Analyst

**Mid-level roles (3-5 years experience):** Head of Business Unit, VP Growth, Corporate Entrepreneur, Business Development Head

**Senior roles (7+ years):** CEO (SME), COO (growth-stage company), Managing Director (family business), Country Manager

**Top hiring organisations:** Tata Group intrapreneurship programmes, Mahindra Group, Sequoia India portfolio startups, PE-backed manufacturing companies, FMCG venture arms`,

    skills: `The Entrepreneurship and Leadership Management specialisation builds skills that founders and senior leaders apply in growth-stage organisations:

**Technical skills:**
- Entrepreneurial Judgment: evaluating market opportunities and making resource allocation decisions under uncertainty
- Strategic Positioning: identifying competitive differentiation and building sustainable moats for growth-stage companies
- Financial Discipline: gross margin management, working capital control, and financial signals of venture health

**Applied skills:**
- Leadership in Ambiguity: building and motivating teams during early-scale growth without rigid corporate processes
- Stakeholder Management: managing investor, board, and employee relationships simultaneously as a founder-leader

**Soft skills:** Founder-level communication, persuasive investor and board presentations, navigating the transition from individual contributor to team leader.`,
  },

  'amity-university-online-mba-finance-and-accounting-management': {
    specName: 'Finance and Accounting Management',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Finance and Accounting Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** BFSI, Manufacturing, IT services, Management consulting, FMCG, Conglomerates

**Entry-level roles:** Financial Analyst, Management Accountant, FP&A Analyst, Accounts Manager

**Mid-level roles (3-5 years experience):** Finance Manager, Financial Controller, CFO (small company), Treasury Manager

**Senior roles (7+ years):** CFO (mid-size company), Group Finance Head, Director of Finance, VP Finance

**Top hiring organisations:** Deloitte, EY, KPMG, HDFC Bank, TCS Finance, Tata Group Finance, Reliance Industries Finance`,

    skills: `The Finance and Accounting Management specialisation builds skills that BFSI and corporate finance employers test in finance leadership roles:

**Technical skills:**
- Corporate Finance: capital budgeting, WACC calculation, dividend policy, and optimal capital structure decisions
- Indian Taxation: income tax, GST, transfer pricing, and TDS compliance for Indian corporate entities
- Financial Reporting: Ind AS statement preparation, variance analysis, and audit-ready accounting processes
- Cost Management: ABC costing, marginal costing, and overhead analysis for manufacturing and services

**Applied skills:**
- Financial Modelling: budgeting, scenario planning, and multi-year forecasting for business decision support
- Mergers and Acquisitions: business valuation fundamentals and due diligence process management

**Soft skills:** Presenting financial results to boards and audit committees, managing external auditors, communicating financial risk to non-finance leadership.`,
  },

  'amity-university-online-mba-general-management': {
    specName: 'General Management',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `General Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Manufacturing, Services, Technology, BFSI, Government-adjacent organisations, Conglomerates

**Entry-level roles:** Management Trainee, Operations Executive, Business Development Executive, Project Coordinator

**Mid-level roles (3-5 years experience):** Business Manager, Operations Manager, Strategy Manager, General Manager (mid-size company)

**Senior roles (7+ years):** Country Manager, Business Unit Head, CEO (SME), Director of Operations

**Top hiring organisations:** Tata Group management trainee programmes, Mahindra Group, Government PSU management boards, mid-size manufacturing companies`,

    skills: `The General Management specialisation builds cross-functional skills tested at senior management interview and assessment stages:

**Technical skills:**
- Strategic Management: competitor analysis, strategic options evaluation, and strategy implementation planning
- Operations Planning: production planning, capacity management, and aggregate demand forecasting for operational efficiency
- Financial Services Management: understanding banking, insurance, and NBFC operations for cross-functional managers

**Applied skills:**
- Brand and Product Management: product lifecycle management, brand equity measurement, and portfolio decisions
- Digital Commerce and Big Data Literacy: understanding data-driven decisions and digital business models at strategic level

**Soft skills:** Leading cross-functional business reviews, presenting strategy to board, managing multi-department teams spanning finance, HR, and marketing.`,
  },

  'amity-university-online-mba-global-finance-market': {
    specName: 'Global Finance Market',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Global Finance Market MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** International banking, Treasury management, Capital markets, Asset management, MNC finance divisions

**Entry-level roles:** Treasury Analyst, FX Operations Analyst, Capital Markets Associate, International Finance Analyst

**Mid-level roles (3-5 years experience):** Treasury Manager, FX Head, Capital Markets Manager, Portfolio Manager (associate)

**Senior roles (7+ years):** Group Treasurer (MNC), Head of Global Markets, Fund Manager (cross-border), VP International Finance

**Top hiring organisations:** Kotak Mahindra Bank Treasury, HDFC Bank Global Markets, Citi India, JP Morgan India, Standard Chartered India, TCS Treasury`,

    skills: `The Global Finance Market specialisation builds skills that international banking and treasury employers test in cross-border finance roles:

**Technical skills:**
- FX Management: currency risk identification, hedging with forwards, options, and swaps for corporate treasury
- International Capital Markets: equity and debt capital raising, ADR and GDR structures, and cross-border M&A financing
- Financial Derivatives: derivative pricing concepts and corporate hedging strategy for bank treasury and risk desks
- Cross-Border Investment Management: international portfolio construction and currency-adjusted return measurement

**Applied skills:**
- FEMA and RBI Compliance: international transaction regulatory frameworks for Indian treasury professionals
- Global Banking Operations: correspondent banking, trade finance instruments, and SWIFT payment systems

**Soft skills:** Presenting currency risk positions to CFOs, managing global bank counterparty relationships, navigating multi-jurisdiction regulatory requirements.`,
  },

  'amity-university-online-mba-hospital-healthcare-management': {
    specName: 'Hospital and Healthcare Management',
    tldrFee: '₹3,29,000',
    feeType: 'healthcare',
    whoHires: `Hospital and Healthcare Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Hospital chains, Health insurance, Healthcare consulting, Pharmaceutical, Medical devices, Government health departments

**Entry-level roles:** Hospital Administrator, Healthcare Operations Coordinator, Medical Administration Executive, Clinical Quality Analyst

**Mid-level roles (3-5 years experience):** Senior Hospital Administrator, Operations Manager (hospital chain), Healthcare Consultant, Health Insurance Product Manager

**Senior roles (7+ years):** CEO (hospital or healthcare system), Chief Operating Officer (hospital group), Director of Healthcare Strategy

**Top hiring organisations:** Apollo Hospitals, Fortis Healthcare, Manipal Hospitals, Narayana Health, Max Healthcare, Star Health Insurance`,

    skills: `The Hospital and Healthcare Management specialisation builds skills that hospital chains and healthcare consulting employers test in operations and leadership roles:

**Technical skills:**
- Hospital Operations: bed management, OT scheduling, departmental resource planning, and operational efficiency metrics
- Emergency and Critical Care Management: decision frameworks for high-pressure clinical scenarios and ICU team leadership
- AI and Health Technology: evaluating AI diagnostic tools, EMR implementation, and telemedicine operations management
- Patient Care Management: multidisciplinary care coordination, clinical pathway management, and quality of care metrics

**Applied skills:**
- Strategic Healthcare Leadership: change management in healthcare organisations and workforce planning for clinical teams
- Health Economics: understanding healthcare financing, insurance payment structures, and hospital cost management

**Soft skills:** Navigating clinical hierarchy, communicating operational data to medical directors, managing regulatory compliance in NABH and JCI accreditation contexts.`,
  },

  'amity-university-online-mba-hospitality-management': {
    specName: 'Hospitality Management',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Hospitality Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Hotels and resorts, Food service chains, Travel and tourism, Airlines, Events management

**Entry-level roles:** Front Office Manager, Food and Beverage Manager, Revenue Analyst, Hospitality Operations Coordinator

**Mid-level roles (3-5 years experience):** Hotel General Manager (small property), Revenue Manager, Area Food and Beverage Manager, Hospitality Operations Manager

**Senior roles (7+ years):** VP Operations (hotel chain), Director of Revenue Management, General Manager (large hotel), Head of Hospitality

**Top hiring organisations:** Taj Hotels (Indian Hotels Company), Marriott India, ITC Hotels, OYO, Lemon Tree Hotels, Cox and Kings India`,

    skills: `The Hospitality Management specialisation builds skills tested at hotel operations and revenue management leadership levels:

**Technical skills:**
- Revenue Management: RevPAR optimisation, dynamic pricing, yield management systems, and OTA channel management
- Hotel Operations Management: front office, housekeeping, F&B coordination, and multi-department P&L responsibility
- Food Service Operations: restaurant management, HACCP compliance, cost control, and kitchen operations management
- Tourism and Travel Management: destination management, tour operations, and travel technology platform oversight

**Applied skills:**
- Guest Experience Management: service design, complaint resolution systems, and loyalty programme management
- Hospitality Marketing: OTA strategy, social media reputation management, and direct booking conversion optimisation

**Soft skills:** Managing multi-cultural guest interactions, leading large hospitality teams across shifts, presenting hotel performance metrics (ADR, RevPAR, occupancy) to ownership groups.`,
  },

  'amity-university-online-mba-human-resource-analytics': {
    specName: 'Human Resource Analytics',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Human Resource Analytics MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Technology, BFSI, HR technology, Management consulting, Manufacturing, E-commerce

**Entry-level roles:** People Analytics Analyst, HR Data Analyst, Workforce Intelligence Analyst, HRIS Administrator (management track)

**Mid-level roles (3-5 years experience):** HR Analytics Manager, HRBP (analytics focus), Workforce Planning Manager, HR Technology Manager

**Senior roles (7+ years):** Head of People Analytics, Chief People Officer (data-driven), HR Transformation Director

**Top hiring organisations:** TCS People Analytics, HDFC Bank HR Analytics, Darwinbox, Keka HR, Workday India partners, Deloitte HR Transformation practice`,

    skills: `The HR Analytics specialisation builds the most data-oriented skill set in the Amity HR portfolio, tested in People Analytics and HRIS management roles:

**Technical skills:**
- Employee Data Visualisation: HR dashboards in Power BI showing attrition, headcount, hiring funnel, and engagement metrics
- HR Data Sources: connecting HRIS, ATS, LMS, and payroll data into a unified workforce data model
- Advanced HR Analytics: predictive attrition modelling, talent pipeline forecasting, and HR ROI measurement
- HR Technology Systems: evaluating HRIS vendor landscape, platform selection, and implementation project management

**Applied skills:**
- Employer Branding: digital tools for talent attraction, EVP building, and data-driven social recruiting
- Industrial Relations: grievance processes, disciplinary frameworks, and collective bargaining in Indian contexts

**Soft skills:** Presenting people analytics to the C-suite, translating data insights into actionable HR recommendations, managing HR data governance frameworks.`,
  },

  'amity-university-online-mba-human-resource-management': {
    specName: 'Human Resource Management',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Human Resource Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Manufacturing, BFSI, IT services, FMCG, Management consulting and staffing, Professional services

**Entry-level roles:** HR Generalist, Recruitment Manager, HR Operations Manager, Compensation Analyst

**Mid-level roles (3-5 years experience):** HR Business Partner, HR Manager, Talent Acquisition Manager, L&D Manager, Industrial Relations Manager

**Senior roles (7+ years):** HR Head, CHRO, VP Human Resources, Head of Talent Management

**Top hiring organisations:** TCS, Infosys, HDFC Bank, HUL, Aditya Birla Group, L&T, Aon Hewitt, Mercer India`,

    skills: `The Human Resource Management specialisation builds skills tested at HRBP and HR head level by large corporate and BFSI employers:

**Technical skills:**
- Compensation Design: salary grading, variable pay programme design, and benefits benchmarking against market data
- Industrial Relations: union management, standing orders, disciplinary inquiry, and collective bargaining in Indian contexts
- Recruitment and Selection: structured interview design, assessment centre management, and hiring decision quality improvement

**Applied skills:**
- Organisational Development: change management models, culture assessment tools, and OD intervention design
- Manpower Planning: workforce demand forecasting, succession pipeline management, and skill gap closure strategy

**Soft skills:** Managing unionised shop-floor workforces, presenting HR metrics to board and CHRO, navigating industrial disputes without production disruption.`,
  },

  'amity-university-online-mba-information-technology-management': {
    specName: 'Information Technology Management',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Information Technology Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** IT services, Product technology, BFSI technology, E-commerce, Management consulting

**Entry-level roles:** IT Project Manager (junior), Business Analyst (IT), IT Operations Analyst, Systems Administrator (management track)

**Mid-level roles (3-5 years experience):** IT Manager, Project Manager, Head of IT Operations, IT Business Partner, Technology Product Manager

**Senior roles (7+ years):** CTO, CIO, VP Technology, Head of Digital, IT Director

**Top hiring organisations:** TCS, Infosys, Wipro, Accenture, IBM India, Deloitte Technology, HDFC Bank IT Division, Amazon Tech India`,

    skills: `The Information Technology Management specialisation builds skills that IT services and product technology employers test in management and leadership roles:

**Technical skills:**
- IT Project Management: scope definition, WBS, critical path, resource levelling, and risk management for IT projects
- Cloud and Infrastructure Management: cloud architecture evaluation, vendor selection, and cloud cost optimisation
- Enterprise Systems Management: ERP, CRM, HRMS selection, implementation oversight, and vendor SLA governance

**Applied skills:**
- IT Governance and Security: IT policy design, access control, and cybersecurity risk management for IT managers
- Agile Delivery Management: Scrum and Kanban frameworks for IT development and operations delivery teams

**Soft skills:** Building business cases for technology investment, presenting IT risk to the board, managing vendor relationships and service escalations.`,
  },

  'amity-university-online-mba-insurance-management': {
    specName: 'Insurance Management',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Insurance Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Life insurance, General insurance, Health insurance, Insurance broking, Bancassurance, Third Party Administrators

**Entry-level roles:** Branch Operations Manager, Agency Development Manager, Insurance Product Analyst, Underwriting Assistant Manager

**Mid-level roles (3-5 years experience):** Branch Manager, Agency Manager, Underwriting Manager, Claims Manager, Regional Operations Manager

**Senior roles (7+ years):** Zonal Manager, VP Operations (insurance), Head of Underwriting, General Manager (insurer)

**Top hiring organisations:** LIC, SBI Life, HDFC Life, Max Life, New India Assurance, Star Health Insurance, HDFC ERGO, PolicyBazaar`,

    skills: `The Insurance Management specialisation builds skills that life, general, and health insurance employers test in branch management and product leadership roles:

**Technical skills:**
- Underwriting Management: risk assessment, underwriting guidelines, rating factors, and portfolio management for insurance products
- Claims Management: claims processing, fraud detection protocols, investigation workflows, and settlement negotiation
- Insurance Product Management: IRDAI product filing process, product design principles, and competitive positioning

**Applied skills:**
- Agency and Distribution Management: building and managing agency networks, bancassurance partnerships, and digital distribution
- Regulatory Compliance: IRDAI guidelines, Insurance Act provisions, and operational compliance management

**Soft skills:** Managing large agency networks, presenting claims ratio data to management committees, navigating IRDAI inspection and audit processes.`,
  },

  'amity-university-online-mba-international-business-management': {
    specName: 'International Business Management',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `International Business Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Export-oriented manufacturing, MNCs, International trade and logistics, Management consulting, Technology services

**Entry-level roles:** International Business Analyst, Export Manager (junior), Global Sourcing Analyst, Trade Finance Analyst

**Mid-level roles (3-5 years experience):** International Business Manager, Country Manager, Export Head, Global Procurement Manager

**Senior roles (7+ years):** VP International Business, Director of Global Operations, Managing Director (international arm), Chief Business Officer

**Top hiring organisations:** Tata International, Mahindra Agri, TCS international delivery, Infosys BPM, Deloitte Global Business Services, EXIM Bank India`,

    skills: `The International Business Management specialisation builds skills that MNCs and export-oriented organisations test in cross-border business management roles:

**Technical skills:**
- International Trade: export-import regulations, Incoterms, trade documentation, and trade finance instruments (LC, BG)
- Foreign Exchange Management: currency risk identification, hedging instruments, and cross-border payment systems
- Global Supply Chain: international vendor development, cross-border logistics management, and bonded warehouse operations

**Applied skills:**
- Market Entry Strategy: mode selection, JV vs wholly-owned subsidiary analysis, and entry cost evaluation for new markets
- Cross-Cultural Management: managing diverse global teams, international client relationships, and multi-country operations

**Soft skills:** Negotiating with international buyers and distributors, presenting global market entry proposals to leadership, managing multi-jurisdiction regulatory and compliance requirements.`,
  },

  'amity-university-online-mba-marketing-sales-management': {
    specName: 'Marketing and Sales Management',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Marketing and Sales Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** FMCG, B2B services, Consumer durables, Digital agencies, Retail trade

**Entry-level roles:** Brand Executive (management track), Sales Executive, Marketing Manager (junior), Trade Marketing Analyst

**Mid-level roles (3-5 years experience):** Brand Manager, Area Sales Manager, Marketing Manager, Key Account Manager, Trade Marketing Manager

**Senior roles (7+ years):** Marketing Director, National Sales Head, VP Sales and Marketing, CMO

**Top hiring organisations:** HUL, P&G India, Nestle India, Marico, ITC FMCG, Maruti Suzuki, Samsung India, Godrej Consumer Products`,

    skills: `The Marketing and Sales Management specialisation builds skills that FMCG and consumer brand employers test at brand manager and sales head level:

**Technical skills:**
- Brand Management: brand equity measurement, positioning development, brand extension analysis, and brand health tracking
- Sales Management: territory design, target-setting systems, distributor management, and sales incentive structure design
- Consumer Marketing: STP strategy, marketing mix design, and campaign measurement frameworks across channels
- Integrated Marketing Communications: ATL and BTL channel planning, unified messaging, and media mix optimisation

**Applied skills:**
- Digital Marketing: SEO fundamentals, paid social, email marketing, and conversion funnel management
- Retail and Trade Marketing: in-store execution management, shopper marketing strategy, and retail channel optimisation

**Soft skills:** Writing creative briefs for agencies, presenting brand health data to senior management, defending marketing investment in P&L reviews.`,
  },

  'amity-university-online-mba-production-and-operations-management': {
    specName: 'Production and Operations Management',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Production and Operations Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Manufacturing, Logistics, Process industries, EPC contractors, Pharmaceutical

**Entry-level roles:** Production Supervisor (management track), Operations Analyst, Plant Administration Executive, Manufacturing Planning Analyst

**Mid-level roles (3-5 years experience):** Plant Manager, Production Manager, Supply Chain Manager, Quality Head, Operations Head

**Senior roles (7+ years):** VP Operations, Director of Manufacturing, COO (mid-size manufacturer), Plant Director

**Top hiring organisations:** Tata Motors, Mahindra, Bajaj Auto, Bharat Forge, L&T, Asian Paints, Nestle India, Sun Pharmaceutical`,

    skills: `The Production and Operations Management specialisation builds skills that manufacturing and industrial employers test at plant manager and operations director level:

**Technical skills:**
- Production Planning: MRP and MPS systems, aggregate production planning, capacity management, and scheduling
- Quality Management: ISO 9001, Six Sigma DMAIC methodology, SPC charts, and quality audit management
- Supply Chain Management: vendor development, raw material procurement strategy, logistics optimisation, and inventory management

**Applied skills:**
- Lean Manufacturing: waste reduction, value stream mapping, Kaizen events, and OEE improvement programmes
- Operations Strategy: make-or-buy decisions, facility planning, technology investment, and capacity expansion strategy

**Soft skills:** Managing unionised shop-floor workforces, presenting OEE and quality data to plant boards, navigating multi-shift operations management.`,
  },

  'amity-university-online-mba-retail-management': {
    specName: 'Retail Management',
    tldrFee: '₹2,25,000',
    feeType: 'standard',
    whoHires: `Retail Management MBA graduates from Amity University Online are hired across these industries and roles:

**Industries:** Organised retail, E-commerce, FMCG modern trade, D2C brands, Quick commerce

**Entry-level roles:** Store Manager, Area Sales Manager (retail), Category Analyst, Retail Operations Coordinator

**Mid-level roles (3-5 years experience):** Category Manager, Regional Store Operations Manager, Buying and Merchandising Manager, Retail Marketing Manager

**Senior roles (7+ years):** VP Retail Operations, Category Director, Head of Trade Marketing, Country Head of Retail

**Top hiring organisations:** Reliance Retail, D-Mart, Tata Trent (Westside and Zudio), Shoppers Stop, Amazon India retail ops, Myntra, Blinkit`,

    skills: `The Retail Management specialisation builds skills tested at category management, store operations, and retail leadership levels:

**Technical skills:**
- Retail Operations Management: store staffing, visual merchandising, planogram execution, shrinkage control, and store P&L management
- Category Management: assortment planning, space management, OTB management, and promotional planning for retail formats
- Supply Chain for Retail: inventory management, replenishment systems, DC operations, and out-of-stock reduction

**Applied skills:**
- Merchandising and Buying: vendor development, purchase planning, and range architecture for apparel and hardline categories
- Consumer Behaviour in Retail: shopper decision-making, impulse trigger management, and loyalty programme design

**Soft skills:** Managing large retail floor teams, negotiating with FMCG brand trade marketing teams, presenting category performance data to buying committees.`,
  },

};

// ── Main execution ─────────────────────────────────────────────────────────────
let updated = 0;
let errors = [];

Object.entries(SPECS).forEach(([slug, meta]) => {
  const filepath = path.join(DIR, `${slug}.json`);

  if (!fs.existsSync(filepath)) {
    errors.push(`MISSING: ${slug}.json`);
    return;
  }

  const data = JSON.parse(fs.readFileSync(filepath, 'utf8'));

  // 1. whoHires
  data.sections.whoHires.body = meta.whoHires;

  // 2. skills
  data.sections.skills.body = meta.skills;

  // 3. comparisons — strip URLs, add bold labels
  data.sections.comparisons.body = restructureComparisons(data.sections.comparisons.body);

  // 4. fees
  data.sections.fees.body = meta.feeType === 'healthcare'
    ? healthcareFees(meta.specName)
    : standardFees(meta.specName);

  // 5. tldr — replace any Rs X,XX,XXX fee amount
  data.sections.tldr = data.sections.tldr
    .replace(/Rs\s*1[,.]99[,.]000/g, meta.tldrFee)
    .replace(/₹1,99,000/g, meta.tldrFee);

  // 6. metadata note
  data.metadata.phase71Updated = '2026-04-21';

  fs.writeFileSync(filepath, JSON.stringify(data, null, 2));
  console.log(`[OK] ${slug}`);
  updated++;
});

console.log(`\nDone. Updated: ${updated}/18`);
if (errors.length) {
  console.error('Errors:', errors);
  process.exit(1);
}
