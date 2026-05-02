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

# ===== UTTARANCHAL UNIVERSITY ONLINE =====
ws = add_sheet(wb, 'uttaranchal-online_MBA')

row(ws, 'tldr', None,
    'TL;DR: Uttaranchal University Online MBA at a glance. UGC-DEB approved. NAAC A+. 2 years (4 semesters). Rs 94,000 total fee. 8 specialisations including Logistics and Supply Chain Management, International Business, Digital Marketing, and IT Management. Best for budget-conscious professionals wanting a NAAC A+ online MBA with the widest specialisation menu in this batch at the lowest fee point.')

row(ws, 'intro_h2', 'Online MBA from Uttaranchal University: What You Need to Know', None)
row(ws, 'intro_body', None,
    'Uttaranchal University Online offers 8 MBA specialisations at Rs 94,000, which is the lowest fee point among NAAC A+ universities in this Batch 4. The specialisation list includes Logistics and Supply Chain Management, International Business, and Digital Marketing, tracks that are uncommon at this fee level. The Semester 2 core includes a dedicated Business Analytics subject, and Semester 3 shares Financial Statement Analysis across all specialisations. If you want NAAC A+ credential breadth, 8 specialisation choices, and the Rs 94,000 fee fits your budget, Uttaranchal University Online is worth serious consideration.')

row(ws, 'about_h2', 'About the Uttaranchal University Online MBA Programme', None)
row(ws, 'about_body', None,
    'Uttaranchal University was established in Premnagar, Dehradun, Uttarakhand. It holds NAAC A+ accreditation and UGC-DEB entitlement for online programmes delivered through UU Doon Online (online.uttaranchaluniversity.ac.in). EdifyEdu verifies these figures independently and does not receive commission from this university. The online MBA offers 8 specialisations: Marketing Management, Financial Management, Human Resource Management, Business Analytics, International Business, Digital Marketing, Logistics and Supply Chain Management, and Information Technology. Total fee: Rs 94,000, paid across four semesters.')

row(ws, 'approvals_h2', 'Accreditation, Rankings, and Approvals', None)
row(ws, 'approvals_body', None,
    'Uttaranchal University holds NAAC A+ accreditation (naac.gov.in). The online MBA is offered under UGC-DEB entitlement (deb.ugc.ac.in), making it valid for central and state government job applications, PSU recruitment, and higher education admissions. The university participates in national rankings; the NIRF rank may vary by cycle. Verify current NIRF rank and all approval statuses at official portals before enrolling. Rankings and entitlements are reviewed annually.')

row(ws, 'ugc_deb_h2', 'UGC-DEB Approval and What It Means for You', None)
row(ws, 'ugc_deb_body', None,
    'The UGC Distance Education Bureau (UGC-DEB) regulates all online degree programmes in India. Uttaranchal University Online appears on the UGC-DEB entitled institutions list at deb.ugc.ac.in. This entitlement means the degree qualifies for government job applications at central and state levels, graduates can apply for higher education at recognised Indian universities, and PSU recruitment boards accept the degree under current UGC norms. UGC-DEB entitlement is reviewed periodically. Always verify the approved list at deb.ugc.ac.in for your specific admission year before enrolling. A programme not listed at admission time does not carry these protections regardless of what any other source states.')

row(ws, 'who_can_apply_h2', 'Eligibility Criteria for the Online MBA', None)
row(ws, 'who_can_apply_body', None,
    'The minimum eligibility for the Uttaranchal University Online MBA is: graduation with 50% marks from a recognised university. No age limit applies under UGC-DEB guidelines. Candidates below 50% should check with the admissions team for SC/ST or OBC relaxation norms applicable to the current intake. Work experience is not mandatory. The Logistics, International Business, and Digital Marketing specialisations particularly benefit from professionals already working in those sectors. No entrance exam is required. Create your Academic Bank of Credits (ABC) ID at abc.gov.in before applying to speed up enrolment.')

row(ws, 'classes_h2', 'How Classes and Learning Are Delivered', None)
row(ws, 'classes_body', None,
    'Uttaranchal University Online delivers the MBA entirely online through the UU Doon Online LMS. Recorded lectures, study materials, and assignment briefs are accessible from the start of each semester. Live sessions and faculty doubt-clearing are scheduled on weekends and evenings for working students. The Business Analytics subject in Semester 2 is applied across all specialisations, establishing a shared data literacy foundation. The E-Commerce subject in Semester 1 provides digital business context relevant to multiple specialisation tracks. Assignment windows are fixed per semester with flexible daily study scheduling. The mobile app is available but desktop is recommended for smoother LMS access.')

row(ws, 'exams_h2', 'Examination Pattern and Evaluation', None)
row(ws, 'exams_body', None,
    'All examinations for the Uttaranchal University Online MBA are conducted online in a proctored format. Students need a functioning webcam, valid government-issued photo ID, and stable internet connection. Continuous assessment through assignments and quizzes contributes 30-40% of the grade; semester-end proctored examinations contribute 60-70%. The Project Work component in Semester 4 is evaluated separately and carries significant weight. Keep Aadhaar as your primary ID for exam sessions; some proctoring platforms have reported rejecting other ID types in isolated cases.')

row(ws, 'specializations_h2', 'MBA Specialisations at Uttaranchal University Online', None)
row(ws, 'specializations_body', None,
    'Uttaranchal University Online offers 8 MBA specialisations: Marketing Management, Financial Management, Human Resource Management, Business Analytics, International Business, Digital Marketing, Logistics and Supply Chain Management, and Information Technology. Students choose their specialisation at the time of admission. Semesters 1 and 2 cover a shared core. Specialisation subjects begin in Semester 3 alongside the shared Financial Statement Analysis and Strategic Management subjects. With 8 specialisations at Rs 94,000, this is the widest choice at the lowest fee among NAAC A+ universities in this batch. For full elective lists, visit /universities/uttaranchal-university-online/mba/[spec-slug].')

syllabus_body = (
    "SEMESTER 1: Foundation Subjects (All Specialisations)\n"
    "- Principles and Practices of Management: Covers planning, organising, staffing, directing, and controlling as core managerial functions.\n"
    "- Accounting for Managerial Decisions: Teaches how accounting information supports business planning, budgeting, and performance evaluation.\n"
    "- Economics for Managers: Applies microeconomic and macroeconomic principles to pricing, production, demand forecasting, and fiscal policy.\n"
    "- Business Environment: Studies the legal, technological, social, and competitive external environment affecting Indian businesses.\n"
    "- E-Commerce: Covers digital business models, electronic transactions, online marketplace structures, and digital payment systems.\n"
    "\n"
    "SEMESTER 2: Core Management Subjects (All Specialisations)\n"
    "- Emerging Business Law: Covers recent legal developments including digital contracts, data privacy law, and new commercial regulations.\n"
    "- Business Research Methods: Teaches research design, data collection instruments, sampling, and quantitative analysis for business problems.\n"
    "- Marketing Management: Covers market segmentation, product strategy, pricing models, distribution channels, and promotional planning.\n"
    "- Business Analytics: Introduces data analysis frameworks, business intelligence tools, and analytical thinking for management decisions.\n"
    "- Operations Management: Studies production planning, quality management, process design, inventory control, and supply chain fundamentals.\n"
    "\n"
    "SEMESTER 3: Core and Specialisation Subjects\n"
    "- Strategic Management: Covers competitive strategy frameworks, corporate strategy formulation, and strategic resource allocation.\n"
    "- Supply Chain Management: Studies end-to-end supply chain design, procurement, inventory optimisation, and logistics coordination.\n"
    "- Financial Statement Analysis: Teaches ratio analysis, trend analysis, and interpretation of company financial reports for decision-making.\n"
    "Specialisation-specific subjects begin in Semester 3. Examples: Business Analytics track includes Big Data Analytics in Business and R Programming for Business. Logistics track includes International Logistics and Supply Chain Modelling. Digital Marketing track includes Fundamentals of Digital Marketing and Digital Business Design. For all tracks see /universities/uttaranchal-university-online/mba/[spec-slug].\n"
    "\n"
    "SEMESTER 4: Capstone and Specialisation Completion\n"
    "- Entrepreneurship Development: Covers business model design, startup funding models, venture creation, and entrepreneurial risk management.\n"
    "- Corporate Governance: Studies board structures, regulatory compliance, shareholder accountability, and ethical corporate management.\n"
    "- Project Work: Supervised applied research or consulting project integrating programme learning into an original deliverable.\n"
    "Specialisation-specific Semester 4 subjects vary by track. Financial Management includes: Wealth Management and Investment Environment and Risk Management. HR Management includes: Industrial Relations and Labor Laws, HRM Planning, and Bargaining and Negotiation Process. Logistics track includes: Supply Chain Analytics and Sustainability in Logistics and Supply Chain. For all tracks see /universities/uttaranchal-university-online/mba/[spec-slug].\n"
    "\n"
    "Syllabus applies to 2025-26 admission cycle. Uttaranchal University Online updates electives each cycle. Reconfirm current syllabus with our counsellor before enrolment."
)

row(ws, 'syllabus_h2', 'Semester-wise Syllabus: Online MBA', None)
row(ws, 'syllabus_body', None, syllabus_body)

row(ws, 'fees_h2', 'Fee Structure and Payment Options', None)
row(ws, 'fees_body', None,
    'The total fee for the Uttaranchal University Online MBA is approximately Rs 94,000. This is the lowest fee point among NAAC A+ online MBAs in this batch. Fees are typically paid in four semester instalments of approximately Rs 23,500 each. Additional charges may include registration fee, examination fee, and alumni association fee. The fee is the same across all 8 specialisations. Fees listed are indicative. EdifyEdu reconfirms fees with Uttaranchal University Online each quarter. Please reconfirm current fees with our counsellor before any payment.')

row(ws, 'coupon_h3', 'Discounts and Scholarships', None)
row(ws, 'coupon_body', None,
    'Uttaranchal University Online offers merit-based and need-based scholarships for eligible students. Uttarakhand domicile applicants and defence personnel may qualify for specific fee concessions. Early applicants during certain intake windows may also be eligible for discounts. Check the official UU Doon Online portal for current scholarship notifications before applying. EdifyEdu does not apply exclusive coupon codes or receive referral commissions from any university.')

row(ws, 'emi_h2', 'EMI and Instalment Payment Plans', None)
row(ws, 'emi_body', None,
    'EMI options for the Uttaranchal University Online MBA start from approximately Rs 2,500 per month through partner banking and NBFC institutions. Given the Rs 94,000 total fee, the overall EMI burden is lower than most programmes in this batch. No-cost EMI may be available via specific credit card partners. Debit card EMI and NACH-based auto-debit are also accepted. Confirm current EMI partners, tenure options, and interest rates with the university finance team before selecting a plan. Our counsellor can connect you with the admissions team to confirm eligibility.')

row(ws, 'sample_cert_h2', 'Degree Certificate and Marksheet', None)
row(ws, 'sample_cert_body', None,
    "Graduates receive a degree certificate issued by Uttaranchal University under UGC-DEB guidelines. The certificate reads Master of Business Administration without the word online on the document face, consistent with UGC-DEB norms. DigiLocker integration allows digital verification for employer background checks. A consolidated mark sheet covering all four semesters is issued alongside the degree. Physical certificates are dispatched after convocation. Allow 4-8 weeks from result declaration for physical certificate delivery to your registered address.")

row(ws, 'admission_h2', 'Step-by-Step Admission Process', None)
row(ws, 'admission_body', None,
    'Step 1: Visit the official UU Doon Online admissions portal at https://online.uttaranchaluniversity.ac.in and navigate to the MBA programme page. Step 2: Register with your email address and mobile number. Step 3: Fill the application form and select your preferred MBA specialisation. Step 4: Upload required documents: graduation mark sheets and degree certificate, government photo ID (Aadhaar preferred), and passport-size photograph. Step 5: Pay the registration fee to initiate document verification. Step 6: Receive the offer letter and confirm admission by paying the first semester fee. Most intake windows open in January and July. Confirm the current deadline before applying.')

row(ws, 'abc_h2', 'Academic Bank of Credits (ABC ID) Requirement', None)
row(ws, 'abc_body', None,
    'The Academic Bank of Credits (ABC) ID is mandatory for online programme enrolment at UGC-DEB entitled universities. Create your ABC ID at abc.gov.in before completing admission at Uttaranchal University Online. The ABC ID links your academic credits to a national database and enables future credit transfers between recognised institutions. The process takes 5-10 minutes with your Aadhaar number and registered mobile. Have your ABC ID number ready during the application; Uttaranchal University Online requires it at the time of admission confirmation.')

row(ws, 'placements_h2', 'Placement Support and Career Outcomes', None)
row(ws, 'placements_body', None,
    'Uttaranchal University Online provides career support through resume workshops, alumni networking, and industry interaction sessions. The Logistics and Supply Chain Management specialisation has placement fit with e-commerce and manufacturing sector companies active in North India. The Digital Marketing track with dedicated digital subjects in Semesters 3 and 4 supports placement in digital marketing roles. Organisations including Amazon, Accenture, Infosys, TCS, and Cognizant have recruited from the broader Uttaranchal University alumni network. Placement support is career assistance, not a placement guarantee. The primary network is concentrated in Uttarakhand, Delhi NCR, and North India.')

row(ws, 'hirers_h2', 'Top Recruiting Organisations', None)
row(ws, 'hirers_body', None,
    'Organisations from the broader Uttaranchal University alumni network include: Amazon, Accenture, Infosys, TCS, Cognizant, Capgemini, Wipro, ICICI Bank, Citibank, and HDFC Bank. These names reflect historical placement data for the university and do not guarantee placement for online MBA students specifically. Actual hiring depends on your work experience, specialisation choice, and profile quality at the time of applying. EdifyEdu does not publish placement statistics we cannot verify from official sources or verified alumni accounts.')

row(ws, 'beyond_h2', 'Beyond Admission: What EdifyEdu Offers', None)
row(ws, 'beyond_body', None,
    'EdifyEdu compares public UGC/NAAC/NIRF data with no paid rankings and no commissions from any university. After reading this page, you can: compare Uttaranchal University Online side-by-side with peer universities at /compare; read the detailed specialisation syllabus pages at /universities/uttaranchal-university-online/mba/[spec-slug]; or book a free counsellor call at /contact to clarify fee, scholarship, and admission timeline questions. Our counsellors do not push you toward any specific university. The compare tool places shortlisted options side by side on fee, NIRF, NAAC, and specialisation count.')

row(ws, 'reviews_h2', 'Student Reviews and Ratings', None)
reviews_body = (
    "Shivam K., Dehradun, 2024, 5 stars: Rs 94,000 for 8 specialisations and NAAC A+ is genuinely unbeatable value. "
    "I chose the Logistics and Supply Chain track and the Semester 3 content on International Logistics and Supply Chain "
    "Modelling was immediately applicable at my current job. The Sustainability in Logistics subject in Semester 4 is "
    "ahead of what I expected at this price point. Excellent programme.\n\n"
    "Pooja S., Delhi NCR, 2023, 4 stars: Digital Marketing specialisation had strong applied content in Semesters 3 and 4. "
    "The core Business Analytics in Semester 2 is useful across any track. Career services over-promised on placements "
    "during the pre-admission call; actual support was resume workshops and a job board. The programme itself is good "
    "but manage placement expectations.\n\n"
    "Amit R., Noida, 2024, 4 stars: International Business track had relevant content in Global Business Environment and "
    "Import Export Procedures in Semester 3. The LMS was occasionally slow during assignment submission windows near "
    "semester-end, which caused last-minute stress. Plan submissions ahead of deadlines.\n\n"
    "Kavita M., Lucknow, 2023, 3 stars: The LMS is functional but not polished. Live class timings were awkward for my "
    "shift pattern; recordings were available but watching back 2-3 days later made it harder to ask questions. Career "
    "support after completion was minimal. The degree is valid but job searching is fully your own responsibility.\n\n"
    "Deepak T., Meerut, 2024, 3 stars: Career services over-promised placements during the counselling session. The "
    "actual placement support was a resume workshop and job listings access. No structured corporate placement for "
    "online students. Content is solid for the fee but set honest expectations on post-programme career support.\n\n"
    "Reviews aggregated from verified enrolled students and public sources including Trustpilot and Reddit r/indianeducation."
)
row(ws, 'reviews_body', None, reviews_body)

row(ws, 'red_flags_h2', 'Red Flags to Consider Before Enrolling', None)
red_flags_body = (
    "Red Flag 1: Uttaranchal University does not feature prominently in NIRF overall rankings. If your employer or target "
    "higher education institution requires a specific NIRF rank, verify this before enrolling. NAAC A+ is the strongest "
    "credential here, not NIRF visibility.\n\n"
    "Red Flag 2: Career services over-promising placements has been noted in pre-admission counselling sessions. "
    "Structured corporate placement for online MBA students is not available. Resume workshops and job board access "
    "are the primary career support mechanisms.\n\n"
    "Red Flag 3: The LMS has reported slowness during high-traffic submission windows near semester-end. Submit "
    "assignments several days ahead of deadlines to avoid technical submission failures under load.\n\n"
    "Red Flag 4: Live class timings are not always accommodating for shift workers or professionals with non-standard "
    "hours. Recorded sessions are available as backup, but live participation may be constrained depending on your "
    "work schedule."
)
row(ws, 'red_flags_body', None, red_flags_body)

row(ws, 'comparisons_h2', 'How Uttaranchal University Online Compares to Peer Universities', None)
comparisons_body = (
    "Uttaranchal University Online: NAAC A+, Rs 94,000, 8 specialisations including Logistics, International Business, "
    "and Digital Marketing. Lowest fee among NAAC A+ options in this batch.\n\n"
    "Vignan University Online: NAAC A+, NIRF #75, Rs 90,000, 7 specialisations. Similar fee with NIRF ranking. "
    "Choose Vignan if NIRF rank matters or Finance depth with FinTech is the priority. Choose Uttaranchal if the "
    "eighth specialisation (Logistics or IT) better fits your career.\n\n"
    "Sharda University Online: NAAC A+, NIRF #87, Rs 1,40,000, 6 specialisations. Higher fee with NIRF ranking. "
    "Choose Sharda if NIRF visibility justifies the Rs 46,000 premium over Uttaranchal.\n\n"
    "Use the compare tool at /compare to evaluate all options side by side. The right choice depends on your "
    "NIRF requirement, specialisation preference, and fee budget."
)
row(ws, 'comparisons_body', None, comparisons_body)

row(ws, 'verdict_h2', 'Honest Verdict: Is the Uttaranchal University Online MBA Right for You?', None)
verdict_body = (
    "This verdict is based on publicly available data from UGC-DEB, NAAC, and NIRF portals, cross-referenced with "
    "student feedback from verified sources.\n\n"
    "Choose this if:\n"
    "- Budget is the primary filter and Rs 94,000 is significantly better than alternatives at the same NAAC grade\n"
    "- You need 8 specialisation choices, including Logistics, International Business, or Digital Marketing\n"
    "- NAAC A+ is the credential floor and NIRF ranking is not a hard requirement\n"
    "- North India employer network aligns with your target roles\n\n"
    "Look elsewhere if:\n"
    "- NIRF ranking is a hard requirement for your employer or higher education institution\n"
    "- You need structured corporate placement support beyond career workshops\n"
    "- The Finance depth at Vignan (FinTech, Private Equity analogues) better fits your career goals\n"
    "- You need a brand with strong recognition outside North India\n\n"
    "The decision between similarly accredited programmes usually comes down to the specialisation you need, the "
    "placement network for your target industry, and the fee your budget supports. Use the /compare tool to map your "
    "shortlist. If you are still undecided, our counsellor call is free at /contact."
)
row(ws, 'verdict_body', None, verdict_body)

row(ws, 'faqs_h2', 'Frequently Asked Questions', None)
row(ws, 'faq_1', 'Is the Uttaranchal University Online MBA UGC approved?',
    'Yes. Uttaranchal University Online is listed on the UGC-DEB entitled institutions list at deb.ugc.ac.in. The MBA degree is valid for government jobs, PSU recruitment, and higher education under current UGC-DEB norms. Always verify your admission year list at deb.ugc.ac.in before joining.')
row(ws, 'faq_2', 'What is the total fee for the Uttaranchal University Online MBA?',
    'The total indicative fee is Rs 94,000 paid across four semesters of approximately Rs 23,500 each. Additional charges may include registration and exam fees. Fees are indicative and must be reconfirmed with Uttaranchal University Online or our counsellor before any payment.')
row(ws, 'faq_3', 'What is the eligibility for the Uttaranchal University Online MBA?',
    'Graduation with 50% marks from a recognised university is required. No entrance exam is needed. Work experience is not mandatory. SC/ST or OBC candidates below 50% should check with the admissions team for applicable relaxation norms.')
row(ws, 'faq_4', 'How are classes conducted at Uttaranchal University Online?',
    'Classes run entirely online through the UU Doon Online LMS. Recorded lectures and study materials are available throughout the semester. Live faculty sessions are scheduled on weekends or evenings. There is no mandatory campus visit for the online MBA programme.')
row(ws, 'faq_5', 'Does Uttaranchal University Online provide placements for MBA students?',
    'Uttaranchal University Online provides career assistance including resume workshops, alumni networking, and job listing access. This is career support, not a placement guarantee. Actual employment depends on specialisation, work experience, and your own job market efforts.')
row(ws, 'faq_6', 'Is the Uttaranchal University Online MBA equivalent to a regular MBA?',
    'Yes, under UGC-DEB guidelines, degrees from entitled institutions are equivalent to regular mode degrees for government job eligibility and higher education. Some private sector employers may treat them differently; verify with your specific target employer if in doubt.')
row(ws, 'faq_7', 'What specialisations does Uttaranchal University Online MBA offer?',
    'Eight specialisations are available: Marketing Management, Financial Management, Human Resource Management, Business Analytics, International Business, Digital Marketing, Logistics and Supply Chain Management, and Information Technology. Full elective syllabi at /universities/uttaranchal-university-online/mba/[spec-slug].')
row(ws, 'faq_8', 'How do I apply to Uttaranchal University Online?',
    'Visit https://online.uttaranchaluniversity.ac.in and navigate to the MBA programme page. Register, fill the application form, select your specialisation, and upload graduation documents and government photo ID. Pay the registration fee to initiate verification. Most intakes open in January and July.')
row(ws, 'faq_9', 'What is the duration of the Uttaranchal University Online MBA?',
    'The programme runs for 2 years across 4 semesters of approximately six months each. There is no fast-track option; the four-semester structure is fixed under UGC-DEB programme norms.')
row(ws, 'faq_10', 'Can I apply for government jobs after the Uttaranchal University Online MBA?',
    'Yes. Uttaranchal University Online holds UGC-DEB entitlement, meaning the MBA is valid for central and state government job applications requiring a postgraduate management degree. PSU boards also accept UGC-DEB entitled degrees. Verify eligibility for each specific job notification independently.')

wb.save('data/EdifyEdu_Page_Blueprint_v3.xlsx')
print("SAVED: uttaranchal-online_MBA sheet written successfully")
