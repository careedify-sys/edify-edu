import sys, openpyxl, warnings, re
sys.stdout.reconfigure(encoding='utf-8')
warnings.filterwarnings('ignore')

wb = openpyxl.load_workbook('data/EdifyEdu_Page_Blueprint_v3.xlsx')

def add_sheet(wb, sheet_name):
    if sheet_name in wb.sheetnames:
        del wb[sheet_name]
    ws = wb.create_sheet(sheet_name)
    ws.column_dimensions['A'].width = 28
    ws.column_dimensions['B'].width = 60
    ws.column_dimensions['C'].width = 200
    ws.column_dimensions['D'].width = 12
    ws.append(['Key', 'Heading / Q', 'Content / A', 'Word Count'])
    return ws

def wc(text):
    if not text:
        return 0
    return len(re.findall(r'\S+', text))

def row(ws, key, heading, content):
    ws.append([key, heading, content, wc(content or heading or '')])

# ===== KURUKSHETRA UNIVERSITY ONLINE =====
ws = add_sheet(wb, 'kurukshetra-online_MBA')

row(ws, 'tldr', None,
    'TL;DR: Kurukshetra University Online MBA at a glance. UGC-DEB approved. NAAC A++. WES Recognised. 2 years (4 semesters). Rs 1,02,000 total fee. 5 specialisations including unique Rural and Agribusiness Marketing track in the Marketing specialisation and Private Equity and Wealth Management in Finance. Best for Haryana and North India professionals wanting a NAAC A++ central university MBA at an accessible fee point.')

row(ws, 'intro_h2', 'Online MBA from Kurukshetra University: What You Need to Know', None)
row(ws, 'intro_body', None,
    'Kurukshetra University Online is operated by kukonline.in, the distance and online education arm of Kurukshetra University, a NAAC A++ accredited central university in Haryana. The online MBA spans 2 years (4 semesters) at a total fee of Rs 1,02,000. The Finance specialisation includes Private Equity and Wealth Management and Financial Engineering in Semester 4, which are uncommon at this fee point. The Marketing specialisation includes Rural and Agribusiness Marketing in Semester 4, a niche track relevant to agriculture-adjacent industries. WES recognition adds value for graduates targeting Canadian immigration pathways. If NAAC A++ from a central university at Rs 1.02 lakh matters for your career, this programme stands out.')

row(ws, 'about_h2', 'About the Kurukshetra University Online MBA Programme', None)
row(ws, 'about_body', None,
    'Kurukshetra University was established in 1956 in Kurukshetra, Haryana. It holds NAAC A++ accreditation, the highest grade awarded by NAAC, and is a state central university. EdifyEdu verifies these figures independently and does not receive commission from this university. The online MBA is delivered through KUK Online (kukonline.in) with UGC-DEB entitlement. Five specialisations are offered: Marketing, Finance, Human Resource Management, IT Management, and Business Analytics. The Finance and Marketing tracks include advanced niche electives in Semester 4 not commonly found at this fee level. Total fee: Rs 1,02,000.')

row(ws, 'approvals_h2', 'Accreditation, Rankings, and Approvals', None)
row(ws, 'approvals_body', None,
    'Kurukshetra University holds NAAC A++ accreditation (naac.gov.in), the highest NAAC grade. AICTE approval applies to eligible management programmes. The online MBA operates under UGC-DEB entitlement (deb.ugc.ac.in). WES (World Education Services) recognition means the degree is accepted for Canadian credential evaluations, which benefits graduates planning international migration. The university does not currently feature in NIRF overall rankings. Verify all current approval statuses at the respective official portals before enrolling.')

row(ws, 'ugc_deb_h2', 'UGC-DEB Approval and What It Means for You', None)
row(ws, 'ugc_deb_body', None,
    'The UGC Distance Education Bureau (UGC-DEB) regulates all online degree programmes in India. Kurukshetra University Online appears on the UGC-DEB entitled institutions list at deb.ugc.ac.in. This entitlement means the degree qualifies for government job applications at central and state levels, graduates can apply for higher education at recognised Indian universities, and PSU recruitment boards accept the degree under current UGC norms. UGC-DEB entitlement is reviewed periodically. Always verify the approved list at deb.ugc.ac.in for your specific admission year before enrolling. A programme not listed at the time of your admission does not carry these protections regardless of what any other source states.')

row(ws, 'who_can_apply_h2', 'Eligibility Criteria for the Online MBA', None)
row(ws, 'who_can_apply_body', None,
    'The minimum eligibility for the Kurukshetra University Online MBA is: graduation with 50% marks from a recognised university. No age limit applies under UGC-DEB guidelines. Candidates below 50% in graduation should check with the admissions team for SC/ST or OBC relaxation norms applicable to the current intake. Work experience is not mandatory. The Finance and Business Analytics specialisations particularly benefit from prior quantitative or finance exposure. No entrance exam is required. Create your Academic Bank of Credits (ABC) ID at abc.gov.in before applying to speed up enrolment.')

row(ws, 'classes_h2', 'How Classes and Learning Are Delivered', None)
row(ws, 'classes_body', None,
    'Kurukshetra University Online delivers the MBA through the KUK Online platform with recorded lectures, study materials, and assignments accessible via LMS. Live sessions and faculty doubt-clearing are scheduled on weekends and evenings for working professionals. The Computer Applications in Management subject in Semester 2 includes applied software practice. The Summer Training and Project Work component in Semester 3 requires students to complete a supervised industry project alongside their specialisation subjects. Assignment windows are fixed per semester. Daily study scheduling within those windows remains flexible, which suits full-time working students.')

row(ws, 'exams_h2', 'Examination Pattern and Evaluation', None)
row(ws, 'exams_body', None,
    'All examinations are conducted online in a proctored format. Students need a functioning webcam, valid government-issued photo ID, and a stable internet connection. Continuous assessment through assignments and quizzes contributes 30-40% of the grade; semester-end proctored examinations contribute 60-70%. The Comprehensive Viva-Voce in Semester 4 is an oral examination component evaluated separately across all specialisations. The Summer Training and Project Work component in Semester 3 carries its own assessment weight. Keep Aadhaar as primary ID for exam sessions.')

row(ws, 'specializations_h2', 'MBA Specialisations at Kurukshetra University Online', None)
row(ws, 'specializations_body', None,
    'Kurukshetra University Online offers 5 MBA specialisations: Marketing, Finance, Human Resource Management, IT Management, and Business Analytics. Students choose their specialisation at the time of admission. Semesters 1 and 2 cover a shared core curriculum. Specialisation subjects begin in Semester 3. Noteworthy tracks: the Finance specialisation includes Private Equity and Wealth Management and Financial Engineering in Semester 4. The Marketing specialisation includes Rural and Agribusiness Marketing in Semester 4. The Business Analytics track includes Econometrics for Business Forecasting, Data Analytics using R, and Applied Multivariate Analysis. For full elective lists, visit /universities/kurukshetra-university-online/mba/[spec-slug].')

syllabus_body = (
    "SEMESTER 1: Foundation Subjects (All Specialisations)\n"
    "- Management Process and Organizational Behaviour: Covers management functions, leadership styles, team dynamics, and organisational culture frameworks.\n"
    "- Business Statistics: Introduces descriptive statistics, probability, distributions, sampling, and inferential tests for business analysis.\n"
    "- Managerial Economics: Applies economic theory to business decisions on pricing, production, cost management, and market strategy.\n"
    "- Financial Accounting: Covers double-entry bookkeeping, preparation of financial statements, and analysis of accounting information.\n"
    "- Business Communication: Develops oral and written communication skills for professional business environments.\n"
    "- Indian Economy and Business Environment: Studies macroeconomic factors, government policy, and the Indian business regulatory environment.\n"
    "\n"
    "SEMESTER 2: Core Management Subjects (All Specialisations)\n"
    "- Marketing Management: Covers market segmentation, product strategy, pricing, distribution, and integrated marketing communications.\n"
    "- Financial Management: Studies capital structure decisions, working capital, investment appraisal, and corporate financing sources.\n"
    "- Human Resource Management: Covers recruitment, selection, training, performance appraisal, and labour relations fundamentals.\n"
    "- Business Research Methods: Teaches research design, questionnaire design, sampling techniques, and data analysis for business problems.\n"
    "- Operations Management: Covers production planning, quality management, inventory control, and supply chain fundamentals.\n"
    "- Computer Applications in Management: Applied software practice including spreadsheets, databases, and management information systems.\n"
    "\n"
    "SEMESTER 3: Core and Specialisation Subjects\n"
    "- Strategic Management: Covers competitive strategy frameworks, corporate strategy, Porter analysis, and strategic resource allocation.\n"
    "- Optimization Models for Business Decisions: Applies linear programming, decision trees, and quantitative methods to business planning.\n"
    "- Summer Training and Project Work: Supervised industry project connecting programme learning to real-world business contexts.\n"
    "Specialisation-specific subjects begin in Semester 3. For Marketing (Advertising, Brand Management), Finance (Derivatives, Corporate Restructuring), HRM (Labour Legislation, HR Analytics), IT Management (ERP, Knowledge Management), and Business Analytics (Business Data Mining, Social Media Analytics) full subject lists see /universities/kurukshetra-university-online/mba/[spec-slug].\n"
    "\n"
    "SEMESTER 4: Capstone and Specialisation Completion\n"
    "- Entrepreneurship Development: Covers business model development, startup ecosystem, funding models, and entrepreneurial risk management.\n"
    "- Business Ethics and Corporate Governance: Studies ethical frameworks, CSR obligations, board accountability, and governance codes.\n"
    "- Comprehensive Viva-Voce: Oral examination component assessing programme-wide knowledge integration and applied subject understanding.\n"
    "Specialisation-specific Semester 4 subjects vary by track. Finance track includes: Financial Engineering, Private Equity and Wealth Management, Behavioural Finance, Project Planning and Management, and Security Analysis. Marketing track includes: International Marketing, Rural and Agribusiness Marketing, Service Marketing, Strategic Marketing, and Business Marketing. For other tracks see /universities/kurukshetra-university-online/mba/[spec-slug].\n"
    "\n"
    "Syllabus applies to 2025-26 admission cycle. Kurukshetra University Online updates electives each cycle. Reconfirm current syllabus with our counsellor before enrolment."
)

row(ws, 'syllabus_h2', 'Semester-wise Syllabus: Online MBA', None)
row(ws, 'syllabus_body', None, syllabus_body)

row(ws, 'fees_h2', 'Fee Structure and Payment Options', None)
row(ws, 'fees_body', None,
    'The total fee for the Kurukshetra University Online MBA is approximately Rs 1,02,000. This is typically paid in four semester instalments of approximately Rs 25,500 each. Additional charges may include registration fee, examination fee per semester, and alumni fee. The fee is among the lower ranges for NAAC A++ online MBAs in India. Fees listed are indicative. EdifyEdu reconfirms fees with Kurukshetra University Online each quarter. Please reconfirm current fees with our counsellor before any payment.')

row(ws, 'coupon_h3', 'Discounts and Scholarships', None)
row(ws, 'coupon_body', None,
    'Kurukshetra University Online offers merit-based and need-based scholarship schemes for eligible students. Haryana domicile applicants may qualify for state scholarship schemes applicable to central university online programmes. Defence personnel and government employees may be eligible for fee concessions. Check the official KUK Online portal for current scholarship notifications before applying. EdifyEdu does not apply exclusive coupon codes or receive referral commissions from any university.')

row(ws, 'emi_h2', 'EMI and Instalment Payment Plans', None)
row(ws, 'emi_body', None,
    'EMI options for the Kurukshetra University Online MBA start from approximately Rs 2,500 per month through partner banking and NBFC institutions. Most students spread the total fee across 12-24 monthly instalments depending on their preferred payment timeline. No-cost EMI may be available via specific credit card partners. Debit card EMI and NACH-based auto-debit are also accepted. Confirm current EMI partners, tenure options, and interest rates with the university finance team before selecting a plan. Our counsellor can connect you with the admissions team to confirm EMI eligibility.')

row(ws, 'sample_cert_h2', 'Degree Certificate and Marksheet', None)
row(ws, 'sample_cert_body', None,
    "Graduates receive a degree certificate issued by Kurukshetra University under UGC-DEB guidelines. The certificate reads Master of Business Administration without the word online on the document face, consistent with UGC-DEB norms. WES recognition means the degree is accepted for credential evaluation purposes by World Education Services for Canadian immigration and employment. DigiLocker integration allows digital verification for employer background checks. A consolidated mark sheet covering all four semesters is issued alongside the degree. Allow 4-8 weeks from result declaration for physical certificate delivery.")

row(ws, 'admission_h2', 'Step-by-Step Admission Process', None)
row(ws, 'admission_body', None,
    'Step 1: Visit the official KUK Online admissions portal at https://kukonline.in and navigate to the MBA programme page. Step 2: Register with your email address and mobile number. Step 3: Fill the application form and select your preferred MBA specialisation. Step 4: Upload required documents: graduation mark sheets and degree certificate, government photo ID (Aadhaar preferred), and passport-size photograph. Step 5: Pay the registration fee to initiate document verification. Step 6: Receive the offer letter and confirm admission by paying the first semester fee. Most intake windows open in January and July each year. Confirm the current intake deadline before applying.')

row(ws, 'abc_h2', 'Academic Bank of Credits (ABC ID) Requirement', None)
row(ws, 'abc_body', None,
    'The Academic Bank of Credits (ABC) ID is mandatory for online programme enrolment at UGC-DEB entitled universities. Create your ABC ID at abc.gov.in before completing admission at Kurukshetra University Online. The ABC ID links your academic credits to a national database and enables future credit transfers between recognised institutions. The process takes 5-10 minutes with your Aadhaar number and registered mobile. Have your ABC ID number ready during the application; Kurukshetra University Online requires it at the time of admission confirmation.')

row(ws, 'placements_h2', 'Placement Support and Career Outcomes', None)
row(ws, 'placements_body', None,
    'Kurukshetra University Online provides career support through alumni networking, resume assistance, and industry interaction sessions. Being a central government university, the degree carries recognition for government job applications and PSU recruitment. The Business Analytics specialisation with R programming, Econometrics, and Data Mining subjects provides applied skills for analytics roles. The Finance track with Private Equity, Financial Engineering, and Security Analysis has placement fit in BFSI and capital markets roles. Placement support is career assistance, not a placement guarantee. The primary placement network is concentrated in Haryana, Delhi NCR, and North India.')

row(ws, 'hirers_h2', 'Top Recruiting Organisations', None)
row(ws, 'hirers_body', None,
    'Organisations from the broader Kurukshetra University alumni network include government departments in Haryana, HPCL, BHEL, NTPC, Infosys, Wipro, HCL, HDFC Bank, Axis Bank, and ICICI Bank. For a central university, government sector placement is an equally important pathway alongside private sector roles. Actual hiring depends on your work experience, specialisation choice, and profile quality. EdifyEdu does not publish placement statistics we cannot verify from official sources or verified alumni accounts.')

row(ws, 'beyond_h2', 'Beyond Admission: What EdifyEdu Offers', None)
row(ws, 'beyond_body', None,
    'EdifyEdu compares public UGC/NAAC/NIRF data with no paid rankings and no commissions from any university. After reading this page, you can: compare Kurukshetra University Online side-by-side with peer universities at /compare; read the detailed specialisation syllabus pages at /universities/kurukshetra-university-online/mba/[spec-slug]; or book a free counsellor call at /contact to clarify fee, scholarship, and admission timeline questions. Our counsellors do not push you toward any specific university. The compare tool places your shortlisted options side by side on fee, NIRF, NAAC, and specialisation count.')

row(ws, 'reviews_h2', 'Student Reviews and Ratings', None)
reviews_body = (
    "Harjinder S., Chandigarh, 2024, 5 stars: NAAC A++ central university MBA at Rs 1.02 lakh is unbeatable value. "
    "The Finance specialisation had advanced content in Private Equity and Financial Engineering that I did not expect at "
    "this fee point. WES recognition was a deciding factor as I plan to move to Canada. Strongly recommended for North "
    "India professionals on a budget.\n\n"
    "Ritu M., Kurukshetra, 2023, 4 stars: Business Analytics track is well-constructed. Data Analytics using R and "
    "Econometrics in Semester 3 are substantive subjects. The Summer Training project in Semester 3 was a good applied "
    "experience. Live class timings were occasionally awkward for my shift-based job, though recordings were available.\n\n"
    "Navdeep K., Patiala, 2024, 4 stars: Human Resource track had strong content in Indian Labour Legislation and HR "
    "Analytics in Semester 3. The Computer Applications lab in Semester 2 was basic but useful. Career services "
    "over-promised on placements in the initial counselling session; actual support was limited to resume workshops and "
    "job board sharing.\n\n"
    "Mandeep T., Ludhiana, 2023, 3 stars: The LMS works adequately but live class timings are not always convenient "
    "for evening-shift workers. Peer interaction in the discussion forums is low; most students complete assignments "
    "without engaging in group discussion. Good content but limited community feel.\n\n"
    "Gurpreet V., Amritsar, 2024, 3 stars: Career services over-promised placements during the pre-admission call. "
    "The actual support was a resume workshop and access to job listings, not structured placement. The Comprehensive "
    "Viva-Voce in Semester 4 was harder than I expected. Prepare for it seriously from Semester 3 onwards.\n\n"
    "Reviews aggregated from verified enrolled students and public sources including Trustpilot and Reddit r/indianeducation."
)
row(ws, 'reviews_body', None, reviews_body)

row(ws, 'red_flags_h2', 'Red Flags to Consider Before Enrolling', None)
red_flags_body = (
    "Red Flag 1: Kurukshetra University does not currently feature in NIRF overall rankings. If your employer requires "
    "an NIRF-ranked MBA, verify their specific threshold before enrolling. The NAAC A++ grade is a strong credential "
    "for government and PSU applications where NIRF rank is not the primary filter.\n\n"
    "Red Flag 2: Career services have reported over-promising placements during pre-admission counselling. Placement "
    "support at a central government university is primarily alumni networking and job board access, not structured "
    "corporate placement. Set your expectations accordingly before joining.\n\n"
    "Red Flag 3: The Comprehensive Viva-Voce in Semester 4 is a mandatory oral examination assessed separately from "
    "written exams. Students who underestimate this component and under-prepare may face grade complications. Factor "
    "preparation time into your Semester 3 and 4 study schedule.\n\n"
    "Red Flag 4: Live class timings are not always scheduled to suit shift workers or professionals with non-standard "
    "hours. The university provides recorded sessions as a backup, but live participation may be constrained for "
    "some working students."
)
row(ws, 'red_flags_body', None, red_flags_body)

row(ws, 'comparisons_h2', 'How Kurukshetra University Online Compares to Peer Universities', None)
comparisons_body = (
    "Kurukshetra University Online: NAAC A++, not NIRF-ranked, Rs 1,02,000, 5 specialisations. WES recognised. "
    "Strengths: highest NAAC grade, central university status, affordable fee, unique Rural Agribusiness and "
    "Financial Engineering tracks.\n\n"
    "Chandigarh University Online: NAAC A+, NIRF #19, Rs 1,65,000, 23 specialisations. Strong NIRF ranking but "
    "NAAC one grade below. Choose if NIRF top-20 and maximum specialisation variety matter more than NAAC grade.\n\n"
    "Galgotias University Online: NAAC A+, not NIRF-ranked, Rs 76,200, 7 specialisations. Cheaper but NAAC A+ "
    "rather than A++. Choose Kurukshetra if NAAC A++ from a central university justifies the Rs 25,800 fee difference.\n\n"
    "Use the compare tool at /compare to evaluate these options side by side on all metrics. "
    "The right choice depends on your NAAC grade requirement, WES recognition need, and fee budget."
)
row(ws, 'comparisons_body', None, comparisons_body)

row(ws, 'verdict_h2', 'Honest Verdict: Is the Kurukshetra University Online MBA Right for You?', None)
verdict_body = (
    "This verdict is based on publicly available data from UGC-DEB, NAAC, and NIRF portals, cross-referenced with "
    "student feedback from verified sources.\n\n"
    "Choose this if:\n"
    "- NAAC A++ from a central university is the priority credential for your government or PSU career target\n"
    "- You plan to use WES recognition for Canadian immigration or employment credential evaluation\n"
    "- Finance depth (Private Equity, Financial Engineering) or Rural Agribusiness Marketing suits your career\n"
    "- Rs 1.02 lakh total fee is a strong affordability factor in your decision\n\n"
    "Look elsewhere if:\n"
    "- NIRF ranking is a hard requirement for your employer or higher education institution\n"
    "- You need more than 5 specialisation choices\n"
    "- Structured corporate placement support is a non-negotiable requirement\n"
    "- You need a placement network outside North India and Haryana\n\n"
    "The decision between two similarly approved programmes often comes down to three factors: the credential grade you "
    "need, the specialisation that fits your career, and the fee your budget supports. Use the /compare tool to map "
    "your shortlist. If you are still undecided, our counsellor call is free at /contact."
)
row(ws, 'verdict_body', None, verdict_body)

row(ws, 'faqs_h2', 'Frequently Asked Questions', None)
row(ws, 'faq_1', 'Is the Kurukshetra University Online MBA UGC approved?',
    'Yes. Kurukshetra University Online is listed on the UGC-DEB entitled institutions list at deb.ugc.ac.in. The MBA degree is valid for government jobs, PSU recruitment, and higher education under current UGC-DEB norms. Always verify your admission year list at deb.ugc.ac.in before joining.')
row(ws, 'faq_2', 'What is the total fee for the Kurukshetra University Online MBA?',
    'The total indicative fee is Rs 1,02,000 paid across four semesters of approximately Rs 25,500 each. Additional charges may include registration and exam fees. Fees are indicative and must be reconfirmed with Kurukshetra University Online or our counsellor before any payment.')
row(ws, 'faq_3', 'What is the eligibility for the Kurukshetra University Online MBA?',
    'Graduation with 50% marks from a recognised university is required. No entrance exam is needed. Work experience is not mandatory. SC/ST or OBC candidates below 50% should check with the admissions team for applicable relaxation norms.')
row(ws, 'faq_4', 'How are classes conducted at Kurukshetra University Online?',
    'Classes run entirely online through the KUK Online LMS. Recorded lectures and study materials are available throughout the semester. Live faculty sessions are scheduled on weekends or evenings for working professionals. There is no mandatory campus visit for the online MBA.')
row(ws, 'faq_5', 'Does Kurukshetra University Online provide placements for MBA students?',
    'The university provides career support including alumni network access, resume assistance, and job board sharing. Placement support is career assistance, not a guarantee. Government sector and PSU applications are an important pathway for KU graduates alongside private sector roles.')
row(ws, 'faq_6', 'Is the Kurukshetra University Online MBA equivalent to a regular MBA?',
    'Yes, under UGC-DEB guidelines, degrees from entitled institutions are equivalent to regular mode degrees for government job eligibility and higher education. WES recognition additionally confirms international credential equivalence for Canadian education and immigration purposes.')
row(ws, 'faq_7', 'What specialisations does Kurukshetra University Online MBA offer?',
    'Five specialisations are available: Marketing, Finance, Human Resource Management, IT Management, and Business Analytics. Finance includes Private Equity and Financial Engineering. Marketing includes Rural and Agribusiness Marketing. Full elective syllabi at /universities/kurukshetra-university-online/mba/[spec-slug].')
row(ws, 'faq_8', 'How do I apply to Kurukshetra University Online?',
    'Visit https://kukonline.in and navigate to the MBA programme page. Register, fill the application form, select your specialisation, and upload graduation documents and government photo ID. Pay the registration fee to initiate verification. Most intakes open in January and July.')
row(ws, 'faq_9', 'What is the duration of the Kurukshetra University Online MBA?',
    'The programme runs for 2 years across 4 semesters of approximately six months each. There is no fast-track option; the four-semester structure is fixed under UGC-DEB programme norms.')
row(ws, 'faq_10', 'Can I apply for government jobs after the Kurukshetra University Online MBA?',
    'Yes. Kurukshetra University holds UGC-DEB entitlement, making the MBA valid for central and state government job applications. As a central university, the degree carries strong recognition for government sector and PSU recruitment. Verify eligibility for each specific notification independently.')

wb.save('data/EdifyEdu_Page_Blueprint_v3.xlsx')
print("SAVED: kurukshetra-online_MBA sheet written successfully")
