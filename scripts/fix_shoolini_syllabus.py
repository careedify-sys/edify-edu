import json, os

BASE = "C:/Users/91706/Downloads/edify-v16-final-with-cms/edify-next/lib/data/page-content"

COMMON_DESC = {
    "Legal Aspects of Business": "Business contracts, corporate governance, consumer protection obligations, and regulatory compliance frameworks for managers.",
    "Storytelling with Data": "Visual communication of data findings, chart selection, and translating analytics into business narratives for non-technical audiences.",
    "Acing Interviews through AI": "AI-assisted mock interview practice, personal brand communication, and job-search strategy frameworks for management graduates.",
    "Intro to Editing": "Professional editing skills for business documents, reports, presentations, and digital content.",
    "Introduction to Editing": "Professional editing skills for business documents, reports, presentations, and digital content.",
    "Future Leader's Program": "Executive presence building, stakeholder influence, high-performance team leadership, and personal effectiveness frameworks for emerging managers.",
    "Sales Management": "Sales force structure, territory planning, pipeline management, forecasting, and sales performance incentive design.",
    "Capstone Project": "Applied industry project integrating specialisation knowledge with structured problem-solving for a real-world business challenge.",
    "Capstone Project/ Internship": "Applied industry project or internship integrating specialisation knowledge with structured business problem-solving.",
    "Capstone Project/Internship": "Applied industry project or internship integrating specialisation knowledge with structured business problem-solving.",
    "Critical Thinking & Problem Solving": "Structured analytical frameworks for managerial decision-making, root-cause analysis, and complex business problem resolution.",
    "Critical Thinking and Problem Solving": "Structured analytical frameworks for managerial decision-making, root-cause analysis, and complex business problem resolution.",
    "Critical Thinking": "Structured analytical frameworks for managerial decision-making and systematic resolution of business problems.",
    "CRM": "CRM platform usage, customer lifecycle management, retention strategy design, and churn prediction basics.",
    "Supply Chain Management": "Supply chain network design, demand forecasting, procurement strategy, and vendor evaluation frameworks.",
}

SPEC_DATA = {
    "agri-business-management": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Agri Business Management specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Introductory Agriculture and Principles of Agronomy", "Crop production fundamentals, soil science basics, agronomy systems, and seasonal farming cycle management."),
            ("Agri-Supply Chain Management", "Farm-to-market supply chain design, cold chain logistics, procurement hub operations, and FPO supply chain integration."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Sales Management", COMMON_DESC["Sales Management"]),
            ("Agricultural Marketing and Sales Management", "Commodity market mechanics, agri-input distribution channel design, contract farming agreements, and e-NAM platform operations."),
            ("Agricultural Development and Policies", "Government agri schemes (PM-KISAN, PMFBY), FPO formation policy, NABARD refinance framework, and rural development programme administration."),
            ("Capstone Project", COMMON_DESC["Capstone Project"]),
            ("Critical Thinking", COMMON_DESC["Critical Thinking"]),
        ],
    },
    "banking-insurance": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Banking and Insurance specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Banking: Types and Services", "Commercial and retail banking product structures, NPA management, credit appraisal basics, and RBI regulatory compliance overview."),
            ("Insurance: Products and Purposes", "Life, general, and health insurance product structures, premium calculation basics, claims management, and IRDAI regulatory framework."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Digital Banking and Fintech Innovations", "UPI and payment stack architecture, digital lending platforms, neo-banking models, and NBFC-fintech integration frameworks."),
            ("Investment Management and Financial Planning", "Portfolio construction, mutual fund distribution basics, goal-based financial planning, and wealth management frameworks for banking professionals."),
            ("Capstone Project", COMMON_DESC["Capstone Project"]),
            ("Critical Thinking", COMMON_DESC["Critical Thinking"]),
        ],
    },
    "biotechnology-management": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Biotechnology Management specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Introductory Biotech and Microbiology", "Cell biology fundamentals, microbial applications in industry, biotech product categories, and life sciences sector overview."),
            ("Industrial and Micro Biotechnology", "Fermentation process management, enzyme technology, biosimilar manufacturing basics, and industrial biotech application areas."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Sales Management", COMMON_DESC["Sales Management"]),
            ("Regulatory Affairs in Biotech", "CDSCO biologics approval pathway, Schedule M GMP for biologics, biosimilar dossier requirements, and DBT GMO approval process."),
            ("Entrepreneurship in Life Sciences", "Biotech startup formation, BIRAC grant application process, IP licensing strategy, and life sciences venture funding frameworks."),
            ("Capstone Project", COMMON_DESC["Capstone Project"]),
        ],
    },
    "data-science-business-analytics": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Data Science and Business Analytics specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("AI for Business", "Machine learning application frameworks, AI strategy for organisations, responsible AI governance, and business use-case identification for AI."),
            ("Python for Business", "Python programming for data analysis, pandas and numpy basics, and business data manipulation and reporting scripts."),
            ("Integrated Marketing Communications", "Cross-channel brand messaging strategy, media planning basics, and campaign brief writing for digital and traditional channels."),
            ("Content Marketing", "Content strategy, editorial calendar planning, SEO-driven content creation, and content performance measurement."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Sales Management", COMMON_DESC["Sales Management"]),
            ("Data Visualization", "Power BI and Tableau dashboard design, KPI metric definition, visual data storytelling, and executive reporting frameworks."),
            ("Digital Marketing for Practitioners", "Performance marketing channels (SEA, paid social, programmatic), campaign setup, attribution modelling, and budget optimisation."),
            ("Data Ethics and Privacy", "Ethical data use frameworks, privacy by design principles, AI bias management, and responsible analytics governance."),
            ("Social Media Strategy", "Platform algorithm mechanics, organic and paid social strategy, community management, and social media performance analytics."),
            ("Capstone Project", COMMON_DESC["Capstone Project"]),
        ],
    },
    "digital-marketing": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Digital Marketing specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Digital Marketing for Practitioners", "Performance marketing channels (SEA, paid social, programmatic), campaign setup, attribution modelling, and budget optimisation."),
            ("Integrated Marketing Communications", "Cross-channel brand messaging strategy, media planning, campaign brief writing, and communications performance measurement."),
            ("Content Marketing", "Content strategy, editorial calendar planning, SEO-driven content creation, and content performance measurement."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Sales Management", COMMON_DESC["Sales Management"]),
            ("CRM", COMMON_DESC["CRM"]),
            ("Social Media Marketing and Strategy", "Platform algorithm fundamentals, organic and paid social strategy, influencer partnership frameworks, and social media analytics."),
            ("Brand Management", "Brand equity building, brand positioning strategy, brand extension decisions, and brand health tracking methods."),
            ("Capstone Project", COMMON_DESC["Capstone Project"]),
            ("Critical Thinking", COMMON_DESC["Critical Thinking"]),
        ],
    },
    "finance": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Finance specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Micro Finance for Managers", "Microfinance institution models, SHG-bank linkage programme, rural credit delivery mechanisms, and MFI regulatory framework."),
            ("Financial Statements Analysis", "Ratio analysis, DuPont decomposition, cash flow statement interpretation, and financial health benchmarking techniques."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Sales Management", COMMON_DESC["Sales Management"]),
            ("Portfolio and Wealth Management", "Asset allocation strategy, portfolio rebalancing, risk-adjusted return metrics, and HNI client advisory frameworks."),
            ("Financial Derivatives", "Options and futures basics, hedging strategies for currency and interest rate risk, and derivative instrument selection."),
            ("Investment Management and Financial Planning", "Goal-based financial planning, mutual fund selection, systematic investment planning, and retirement corpus calculation."),
            ("Capstone Project", COMMON_DESC["Capstone Project"]),
        ],
    },
    "food-technology-management": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Food Technology Management specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Food Regulations and Policy", "FSSAI licensing and labelling standards, FSSR 2011 compliance, PLI scheme for food processors, and APEDA export registration basics."),
            ("Food Science and Technology", "Food preservation techniques, processing unit operations, packaging technology, and shelf-life extension methods."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Sales Management", COMMON_DESC["Sales Management"]),
            ("Food Safety and Quality Management", "HACCP plan design, ISO 22000:2018 implementation basics, food safety audit readiness, and recall procedure management."),
            ("Food Product Development and Innovation", "Stage-gate NPD process, consumer research to prototype, shelf-life study design, and food product launch timeline management."),
            ("Entrepreneurship in Life Sciences", "Food startup formation, FSSAI incubation support, food processing MSME financing, and food brand go-to-market strategy."),
            ("Capstone Project", COMMON_DESC["Capstone Project"]),
        ],
    },
    "human-resource-management": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Human Resource Management specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Organizational Development and Change Management", "OD intervention models, change management frameworks, culture transformation strategy, and employee resistance management."),
            ("Compensation Management", "Pay structure design, variable pay mechanics, salary benchmarking, total rewards strategy, and pay equity compliance."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Sales Management", COMMON_DESC["Sales Management"]),
            ("Training and Development", "L&D needs analysis, training programme design, e-learning platform management, and ROI of training measurement frameworks."),
            ("Industrial Relations and Labor Codes", "Four labour codes overview, trade union management, grievance handling procedures, and collective bargaining process."),
            ("Capstone Project/Internship", COMMON_DESC["Capstone Project/Internship"]),
            ("Critical Thinking and Problem Solving", COMMON_DESC["Critical Thinking and Problem Solving"]),
        ],
    },
    "it-management": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the IT Management specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Database Management System", "Relational database design, SQL basics for managers, data warehouse overview, and enterprise data governance frameworks."),
            ("Python for Business", "Python scripting for data analysis, automation basics, and business reporting workflows using Python."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Data Visualization", "Power BI and Tableau dashboard design, KPI metric selection, and visual data storytelling for executive and business audiences."),
            ("Cyber Security", "Information security management, ISO 27001 basics, incident response process, and GDPR and IT Act compliance for IT managers."),
            ("Data Ethics and Privacy", "Ethical data use frameworks, privacy by design principles, AI bias management, and responsible analytics governance."),
            ("Capstone Project", COMMON_DESC["Capstone Project"]),
            ("Critical Thinking and Problem Solving", COMMON_DESC["Critical Thinking and Problem Solving"]),
        ],
    },
    "marketing-management": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Marketing Management specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Service Marketing", "Service quality gap model, SERVQUAL framework, service recovery strategy, and customer experience design for service businesses."),
            ("Digital Marketing for Practitioners", "Performance marketing channels (SEA, paid social, programmatic), campaign setup, attribution modelling, and budget optimisation."),
            ("Integrated Marketing Communications", "Cross-channel brand messaging strategy, media planning, campaign brief writing, and marketing communications measurement."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Introduction to Editing", COMMON_DESC["Introduction to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Sales Management", COMMON_DESC["Sales Management"]),
            ("CRM", COMMON_DESC["CRM"]),
            ("Brand Management", "Brand equity building, brand positioning strategy, brand extension decisions, and brand health tracking methods."),
            ("Supply Chain Management", COMMON_DESC["Supply Chain Management"]),
            ("Capstone Project/Internship", COMMON_DESC["Capstone Project/Internship"]),
            ("Critical Thinking and Problem Solving", COMMON_DESC["Critical Thinking and Problem Solving"]),
        ],
    },
    "operation-supply-chain-management": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Operation and Supply Chain Management specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Supply Chain Management", COMMON_DESC["Supply Chain Management"]),
            ("Logistics and Distribution Strategy", "Distribution network design, last-mile logistics optimisation, freight cost management, and 3PL vendor management."),
            ("Warehouse Management", "Warehouse layout design, inventory control systems, pick-and-pack operations, and warehouse performance KPI frameworks."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Project Management", "Project lifecycle management, WBS design, agile sprint planning, risk identification, and project health reporting frameworks."),
            ("Lean Operations", "Lean manufacturing principles, waste elimination methodology, value stream mapping, and continuous improvement (Kaizen) frameworks."),
            ("Capstone Project", COMMON_DESC["Capstone Project"]),
            ("Critical Thinking and Problem Solving", COMMON_DESC["Critical Thinking and Problem Solving"]),
        ],
    },
    "pharma-health-care-management": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Pharma and Healthcare Management specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Healthcare Management", "Hospital operations design, OPD and IPD flow management, NABH accreditation documentation, and healthcare quality frameworks."),
            ("Health Economics", "Healthcare financing models, health insurance basics, PMJAY scheme operations, and cost-effectiveness analysis for healthcare."),
            ("Pharma Marketing and Sales", "Prescription drug marketing, MR territory management, KOL engagement strategy, pharmacy channel management, and OTC brand basics."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Sales Management", COMMON_DESC["Sales Management"]),
            ("Regulatory Environment in Pharma", "CDSCO drug approval pathway, Schedule M GMP compliance, New Drugs and Clinical Trials Rules 2019, and pharmacovigilance reporting."),
            ("Healthcare Operations Management", "Healthcare supply chain management, hospital procurement, medical device logistics, and healthcare information system basics."),
            ("Entrepreneurship in Life Sciences", "Pharma and healthcare startup formation, BIRAC grant application, DBT scheme navigation, and health-tech venture funding frameworks."),
            ("Capstone Project", COMMON_DESC["Capstone Project"]),
        ],
    },
    "real-estate-management": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Real Estate Management specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Retail Business Models", "Retail format structures, store operations management, retail supply chain basics, and omnichannel retail strategy."),
            ("Service Marketing", "Service quality gap model, SERVQUAL framework, service recovery strategy, and customer experience design."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Introduction to Editing", COMMON_DESC["Introduction to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Supply Chain Management", COMMON_DESC["Supply Chain Management"]),
            ("Customer Relationship Management", "CRM platform usage, customer lifecycle management, retention strategy design, and real estate sales pipeline management."),
            ("Capstone Project/Internship", COMMON_DESC["Capstone Project/Internship"]),
            ("Critical Thinking and Problem Solving", COMMON_DESC["Critical Thinking and Problem Solving"]),
        ],
    },
    "retail-management": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Retail Management specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Retail Business Models", "Retail format structures (hypermarket, specialty, D2C, e-commerce), store operations, retail supply chain, and omnichannel strategy."),
            ("Service Marketing", "Service quality gap model, SERVQUAL framework, service recovery strategy, and customer experience design for retail."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Supply Chain Management", COMMON_DESC["Supply Chain Management"]),
            ("CRM", COMMON_DESC["CRM"]),
            ("Capstone Project", COMMON_DESC["Capstone Project"]),
            ("Critical Thinking and Problem Solving", COMMON_DESC["Critical Thinking and Problem Solving"]),
        ],
    },
    "tourism-management": {
        "note": "Sem 1-2 subjects are shared across all Shoolini MBA specialisations. Sem 3-4 below are specific to the Tourism Management specialisation.",
        "sem3": [
            ("Legal Aspects of Business", COMMON_DESC["Legal Aspects of Business"]),
            ("Tourism Products of India", "India's major tourism circuits, heritage and cultural products, MICE tourism, and state tourism promotion scheme overview."),
            ("Tourism Marketing", "Destination marketing frameworks, visitor experience design, Incredible India branding, and tourism distribution channel management."),
            ("Storytelling with Data", COMMON_DESC["Storytelling with Data"]),
            ("Acing Interviews through AI", COMMON_DESC["Acing Interviews through AI"]),
            ("Intro to Editing", COMMON_DESC["Intro to Editing"]),
        ],
        "sem4": [
            ("Future Leader's Program", COMMON_DESC["Future Leader's Program"]),
            ("Sales Management", COMMON_DESC["Sales Management"]),
            ("Tourism Entrepreneurship", "Tourism startup formation, homestay business models, ecotourism venture design, and tourism MSME financing frameworks."),
            ("Social Media and Digital Marketing", "Social media strategy for tourism brands, OTA platform management, digital content for destination promotion, and travel influencer partnerships."),
            ("Capstone Project", COMMON_DESC["Capstone Project"]),
            ("Critical Thinking", COMMON_DESC["Critical Thinking"]),
        ],
    },
}

updated = []
errors = []

for slug, data in SPEC_DATA.items():
    filepath = os.path.join(BASE, f"shoolini-university-online-mba-{slug}.json")
    if not os.path.exists(filepath):
        errors.append(f"FILE NOT FOUND: {filepath}")
        continue
    with open(filepath, 'r', encoding='utf-8') as f:
        j = json.load(f)

    j["sections"]["syllabus"] = {
        "hasData": True,
        "note": data["note"],
        "semesters": [
            {"sem": 3, "subjects": [{"name": n, "desc": d} for n, d in data["sem3"]]},
            {"sem": 4, "subjects": [{"name": n, "desc": d} for n, d in data["sem4"]]},
        ]
    }

    with open(filepath, 'w', encoding='utf-8') as f:
        json.dump(j, f, indent=2, ensure_ascii=False)
    updated.append(slug)

print(f"Updated {len(updated)} files:")
for s in updated:
    print(f"  OK: {s}")
if errors:
    print("ERRORS:")
    for e in errors:
        print(f"  {e}")
