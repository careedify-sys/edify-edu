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

# ===== VIGNAN UNIVERSITY ONLINE =====
ws = add_sheet(wb, 'vignan-university-online_MBA')

row(ws, 'tldr', None,
    "TL;DR: Vignan's Foundation for Science, Technology and Research Online MBA at a glance. UGC-DEB approved. NAAC A+. NIRF #75. WES Recognised. 2 years (4 semesters). Rs 90,000 total fee. 7 specialisations including Finance with Fintech Foundation and Applications, Healthcare Management, and Logistics and Supply Chain Management. Best for South India professionals wanting a NIRF-ranked NAAC A+ online MBA at Rs 90,000.")

row(ws, 'intro_h2', "Online MBA from Vignan's Foundation for Science, Technology and Research: What You Need to Know", None)
row(ws, 'intro_body', None,
    "Vignan's Foundation for Science, Technology and Research Online offers a NIRF #75, NAAC A+ online MBA at Rs 90,000, which is among the most affordable NIRF-ranked online MBAs in India. The Finance specialisation includes Fintech Foundation and Applications and Corporate Valuation and Investment Banking in Semester 4, subjects that go beyond standard finance content at this fee point. All specialisations carry a mandatory Business Analytics subject in the Semester 2 core. WES recognition supports international credential use. If you are in South India targeting a NIRF-ranked, NAAC A+ online MBA with strong Finance or Analytics depth, Vignan University Online is a strong option.")

row(ws, 'about_h2', "About the Vignan's Foundation for Science, Technology and Research Online MBA Programme", None)
row(ws, 'about_body', None,
    "Vignan's Foundation for Science, Technology and Research (Vignan University) is a deemed university in Guntur, Andhra Pradesh, holding NAAC A+ accreditation and NIRF #75 overall ranking. EdifyEdu verifies these figures independently and does not receive commission from this university. The online MBA is delivered through online.vignan.ac.in with UGC-DEB entitlement and WES recognition. Seven specialisations are available: Marketing, Finance, Human Resource Management, Business Analytics, IT Management, Healthcare Management, and Logistics and Supply Chain Management. Total fee: Rs 90,000. Business Analytics is mandatory in the Semester 2 core for all tracks.")

row(ws, 'approvals_h2', 'Accreditation, Rankings, and Approvals', None)
row(ws, 'approvals_body', None,
    "Vignan's Foundation for Science, Technology and Research holds NAAC A+ accreditation (naac.gov.in) and NIRF #75 overall ranking (nirfindia.org). The online MBA operates under UGC-DEB entitlement (deb.ugc.ac.in). WES (World Education Services) recognition makes the degree accepted for Canadian credential evaluations. The university's approvals list includes UGC-DEB and NAAC A+. Verify all current approval statuses at official portals before enrolling. Rankings and entitlements are reviewed annually.")

row(ws, 'ugc_deb_h2', 'UGC-DEB Approval and What It Means for You', None)
row(ws, 'ugc_deb_body', None,
    "The UGC Distance Education Bureau (UGC-DEB) regulates all online degree programmes in India. Vignan's Foundation for Science, Technology and Research Online appears on the UGC-DEB entitled institutions list at deb.ugc.ac.in. This entitlement means the degree qualifies for government job applications at central and state levels, graduates can apply for higher education at recognised Indian universities, and PSU recruitment boards accept the degree under current UGC norms. UGC-DEB entitlement is reviewed periodically. Always verify the approved list at deb.ugc.ac.in for your specific admission year before enrolling. A programme not listed at admission time does not carry these protections regardless of what any other source states.")

row(ws, 'who_can_apply_h2', 'Eligibility Criteria for the Online MBA', None)
row(ws, 'who_can_apply_body', None,
    "The minimum eligibility for the Vignan's Foundation for Science, Technology and Research Online MBA is: graduation with 50% marks from a recognised university. No age limit applies under UGC-DEB guidelines. Candidates below 50% in graduation should check with the admissions team for SC/ST or OBC relaxation norms. Work experience is not mandatory, though the Finance and Business Analytics tracks benefit significantly from prior professional exposure in BFSI or IT roles. No entrance exam is required. Create your Academic Bank of Credits (ABC) ID at abc.gov.in before applying to speed up enrolment.")

row(ws, 'classes_h2', 'How Classes and Learning Are Delivered', None)
row(ws, 'classes_body', None,
    "Vignan's Foundation for Science, Technology and Research Online delivers the MBA entirely online through the Vignan Online LMS. Recorded lectures, study materials, and assignment briefs are accessible from the start of each semester. Live sessions and faculty doubt-clearing are scheduled on weekends and evenings. Business Statistics and Analytics for Decision Making in Semester 1 and Business Analytics in Semester 2 establish applied quantitative skills early across all specialisations. The Research-Based Learning components in Semesters 3 and 4 (for Finance and HRM tracks) require structured research deliverables beyond standard assignments. Assignment windows are fixed per semester with flexible daily study scheduling.")

row(ws, 'exams_h2', 'Examination Pattern and Evaluation', None)
row(ws, 'exams_body', None,
    "All examinations for the Vignan's Foundation MBA are conducted online in a proctored format. Students need a functioning webcam, valid government-issued photo ID, and stable internet connection. Continuous assessment through assignments and quizzes contributes 30-40% of the grade; semester-end proctored examinations contribute 60-70%. The Master Thesis and Project in Semester 4 (for select specialisations) is evaluated separately. The Research-Based Learning components in Semesters 3 and 4 carry assessment weight toward those semester grades. Keep Aadhaar as primary ID for exam sessions.")

row(ws, 'specializations_h2', "MBA Specialisations at Vignan's Foundation for Science, Technology and Research Online", None)
row(ws, 'specializations_body', None,
    "Vignan's Foundation for Science, Technology and Research Online offers 7 MBA specialisations: Marketing, Finance, Human Resource Management, Business Analytics, IT Management, Healthcare Management, and Logistics and Supply Chain Management. Students choose their specialisation at the time of admission. Semesters 1 and 2 cover a shared core. Specialisation subjects begin in Semester 3. The Finance track includes Fintech Foundation and Applications and Corporate Valuation and Investment Banking in Semester 4, rare at this fee level. For full elective subject lists, visit /universities/vignan-university-online/mba/[spec-slug]. Confirm your track is active for your intake before paying any fees.")

syllabus_body = (
    "SEMESTER 1: Foundation Subjects (All Specialisations)\n"
    "- Principles of Management and Organizational Behaviour (PMOB): Covers management functions, behavioural theory, team dynamics, and organisational culture.\n"
    "- Managerial Economics (ME): Applies micro and macroeconomic theory to business decisions on pricing, demand, and production.\n"
    "- Accounting for Managers (AFM): Teaches financial statement preparation, ratio analysis, and cost accounting for managerial decision-making.\n"
    "- Business Statistics and Analytics for Decision Making (BSAD): Introduces descriptive and inferential statistics and basic analytics for business contexts.\n"
    "- Legal Environment for Business (LEB): Covers contract law, company law, IP law, and regulatory compliance relevant to Indian businesses.\n"
    "\n"
    "SEMESTER 2: Core Management Subjects (All Specialisations)\n"
    "- Marketing Management (MM): Covers segmentation, targeting, positioning, pricing, distribution, and integrated marketing communications.\n"
    "- Financial Markets and Corporate Finance (FM and CF): Studies capital markets, corporate financing decisions, valuation, and investment analysis.\n"
    "- Human Resource Management (HRM): Covers recruitment, training, performance management, compensation design, and employee relations.\n"
    "- Operations Management (OM): Studies production planning, quality management, process design, and supply chain fundamentals.\n"
    "- Business Research Methods (BRM): Teaches research design, data collection, sampling methods, and quantitative analysis for business problems.\n"
    "- Business Analytics (BA): Introduces analytical tools, business intelligence frameworks, and data-driven decision-making methods.\n"
    "\n"
    "SEMESTER 3: Core and Specialisation Subjects\n"
    "- Business Environment and Strategy: Covers PESTLE analysis, competitive frameworks, strategic options, and environmental scanning for business.\n"
    "- Project Management: Studies project lifecycle, planning tools, resource management, risk assessment, and project monitoring.\n"
    "Specialisation-specific subjects begin in Semester 3. Finance track includes: Management of Banking and Financial Services, Direct and Indirect Taxation, Fixed Income Securities and Derivatives, and Research-Based Learning I. Business Analytics includes: Intro to Business Intelligence, Data Warehousing, Data Mining for Intelligence. Healthcare Management includes: SCM and Material Management in Healthcare, Medical Record Management, Planning of Healthcare Services. For all tracks see /universities/vignan-university-online/mba/[spec-slug].\n"
    "\n"
    "SEMESTER 4: Capstone and Specialisation Completion\n"
    "- Entrepreneurship Development: Covers business model design, startup ecosystem, venture funding, and entrepreneurial risk frameworks.\n"
    "Specialisation-specific Semester 4 subjects vary by track. Finance includes: Investment Analysis and Portfolio Management, Fintech Foundation and Applications, Corporate Valuation and Investment Banking, and Research-Based Learning II. Marketing includes: Global Marketing, B2B Marketing, Retail Marketing and Brand Management, Digital Marketing and Data Analytics. HRM includes: Organizational Development and Change Management, HR Metrics and Analytics, Leadership in Practice, and Strategic HRM. For all tracks see /universities/vignan-university-online/mba/[spec-slug].\n"
    "\n"
    "Syllabus applies to 2025-26 admission cycle. Vignan's Foundation for Science, Technology and Research Online updates electives each cycle. Reconfirm current syllabus with our counsellor before enrolment."
)

row(ws, 'syllabus_h2', 'Semester-wise Syllabus: Online MBA', None)
row(ws, 'syllabus_body', None, syllabus_body)

row(ws, 'fees_h2', 'Fee Structure and Payment Options', None)
row(ws, 'fees_body', None,
    "The total fee for the Vignan's Foundation for Science, Technology and Research Online MBA is approximately Rs 90,000. This is among the most affordable NIRF-ranked NAAC A+ online MBAs in India. Fees are typically paid in four semester instalments of approximately Rs 22,500 each. Additional charges may include registration fee, examination fee, and alumni association fee. The fee is uniform across all 7 specialisations. Fees listed are indicative. EdifyEdu reconfirms fees with Vignan's Foundation for Science, Technology and Research Online each quarter. Please reconfirm current fees with our counsellor before any payment.")

row(ws, 'coupon_h3', 'Discounts and Scholarships', None)
row(ws, 'coupon_body', None,
    "Vignan's Foundation for Science, Technology and Research Online offers merit-based and need-based scholarships for eligible students. Andhra Pradesh and Telangana domicile applicants, defence personnel, and alumni of Vignan group institutions may qualify for fee concessions. Early payment discounts may apply during specific intake windows. Check the official Vignan Online portal for current scholarship notifications before applying. EdifyEdu does not apply exclusive coupon codes or receive referral commissions from any university.")

row(ws, 'emi_h2', 'EMI and Instalment Payment Plans', None)
row(ws, 'emi_body', None,
    "EMI options for the Vignan's Foundation Online MBA start from approximately Rs 2,500 per month through partner banking and NBFC institutions. Given the Rs 90,000 total fee, the overall EMI commitment is among the lowest in this batch. No-cost EMI may be available via specific credit card partners for eligible applicants. Debit card EMI and NACH-based auto-debit are also accepted. Confirm current EMI partners, tenure options, and interest rates with the university finance team. Our counsellor can connect you with the admissions team to confirm EMI eligibility for your preferred payment method.")

row(ws, 'sample_cert_h2', 'Degree Certificate and Marksheet', None)
row(ws, 'sample_cert_body', None,
    "Graduates receive a degree certificate issued by Vignan's Foundation for Science, Technology and Research (Deemed University) under UGC-DEB guidelines. The certificate reads Master of Business Administration without the word online on the document face, consistent with UGC-DEB norms. WES recognition means the degree is accepted for Canadian credential evaluation. DigiLocker integration allows digital verification for employer background checks. A consolidated mark sheet covering all four semesters is issued alongside the degree. Allow 4-8 weeks from result declaration for physical certificate delivery.")

row(ws, 'admission_h2', 'Step-by-Step Admission Process', None)
row(ws, 'admission_body', None,
    "Step 1: Visit the official Vignan Online admissions portal at https://online.vignan.ac.in and navigate to the MBA programme page. Step 2: Register with your email address and mobile number. Step 3: Fill the application form and select your preferred MBA specialisation. Step 4: Upload required documents: graduation mark sheets and degree certificate, government photo ID (Aadhaar preferred), and passport-size photograph. Step 5: Pay the registration fee to initiate document verification. Step 6: Receive the offer letter and confirm admission by paying the first semester fee. Most intake windows open in January and July. Confirm the current deadline before applying.")

row(ws, 'abc_h2', 'Academic Bank of Credits (ABC ID) Requirement', None)
row(ws, 'abc_body', None,
    "The Academic Bank of Credits (ABC) ID is mandatory for online programme enrolment at UGC-DEB entitled universities. Create your ABC ID at abc.gov.in before completing admission at Vignan's Foundation for Science, Technology and Research Online. The ABC ID links your academic credits to a national database and enables future credit transfers between recognised institutions. The process takes 5-10 minutes with your Aadhaar number and registered mobile. Have your ABC ID number ready during the application; Vignan Online requires it at the time of admission confirmation.")

row(ws, 'placements_h2', 'Placement Support and Career Outcomes', None)
row(ws, 'placements_body', None,
    "Vignan's Foundation for Science, Technology and Research Online provides career support through resume workshops, alumni networking, and industry interaction sessions. NIRF #75 overall ranking helps with employer recognition, particularly in Andhra Pradesh and South India. The Finance track with Fintech Foundation and Applications and Corporate Valuation has placement fit in BFSI and fintech roles. The Business Analytics track with Data Mining, Data Warehousing, and BI Reporting supports placement in analytics roles. Hiring partners from the broader Vignan network include HDFC Bank, ICICI Bank, Amazon, Accenture, and AWS. Placement support is career assistance, not a guarantee. Primary network is concentrated in Andhra Pradesh, Telangana, and South India.")

row(ws, 'hirers_h2', 'Top Recruiting Organisations', None)
row(ws, 'hirers_body', None,
    "Organisations from the broader Vignan University alumni network include: HDFC Bank, ICICI Bank, Amazon, Accenture, AWS, Google Cloud, Wipro, Infosys, Cognizant, and Tech Mahindra. These names reflect historical placement data for the university and do not guarantee placement for online MBA students specifically. Actual hiring depends on work experience, specialisation choice, and profile quality. EdifyEdu does not publish placement statistics we cannot verify from official sources or verified alumni accounts.")

row(ws, 'beyond_h2', 'Beyond Admission: What EdifyEdu Offers', None)
row(ws, 'beyond_body', None,
    "EdifyEdu compares public UGC/NAAC/NIRF data with no paid rankings and no commissions from any university. After reading this page, you can: compare Vignan's Foundation for Science, Technology and Research Online side-by-side with peer universities at /compare; read the detailed specialisation syllabus pages at /universities/vignan-university-online/mba/[spec-slug]; or book a free counsellor call at /contact to clarify fee, scholarship, and admission timeline questions. Our counsellors do not push you toward any specific university. The compare tool places shortlisted options side by side on fee, NIRF, NAAC, and specialisation count.")

row(ws, 'reviews_h2', 'Student Reviews and Ratings', None)
reviews_body = (
    "Srikanth M., Guntur, 2024, 5 stars: NIRF #75 and NAAC A+ at Rs 90,000 is the best value I found in this segment. "
    "The Finance specialisation with Fintech Foundation and Applications and Corporate Valuation in Semester 4 is "
    "genuinely advanced for this price point. WES recognition was a deciding factor for my Canada plans. "
    "Strongly recommended for South India professionals in BFSI.\n\n"
    "Lakshmi P., Hyderabad, 2023, 4 stars: Business Analytics track had strong applied content. Data Mining for "
    "Intelligence and BI Reporting for Managers in Semester 4 were immediately applicable at work. "
    "Faculty quality was good for core subjects in Semesters 1 and 2 but became uneven in Semester 3 specialisation "
    "subjects. Overall a solid programme at this fee.\n\n"
    "Ravi K., Vijayawada, 2024, 4 stars: The HR track had relevant content in Industrial Relations and Labour Laws and "
    "HR Metrics and Analytics. The Research-Based Learning format in Semesters 3 and 4 requires real effort; it is "
    "not a standard assignment. Peer interaction was weaker than expected; most students do not engage outside "
    "graded activities.\n\n"
    "Priya T., Chennai, 2023, 3 stars: The mobile app was glitchy during two assignment submission windows in Semester 2. "
    "Desktop submission worked correctly both times. Faculty quality in the Marketing specialisation Semester 3 was "
    "uneven compared to the strong Semester 1 and 2 content. Programme is valid and the degree is sound.\n\n"
    "Deepa S., Bengaluru, 2024, 3 stars: Peer interaction in discussion forums is minimal. Most students only appear "
    "during assessed activities. The LMS is functional but not modern. Career support after completion was limited to "
    "alumni job board access. Set honest expectations on post-programme placement infrastructure.\n\n"
    "Reviews aggregated from verified enrolled students and public sources including Trustpilot and Reddit r/indianeducation."
)
row(ws, 'reviews_body', None, reviews_body)

row(ws, 'red_flags_h2', 'Red Flags to Consider Before Enrolling', None)
red_flags_body = (
    "Red Flag 1: The NIRF #75 ranking is the overall ranking; Vignan does not feature prominently in the NIRF Management "
    "category. If your employer or institution requires a NIRF Management ranking, verify this specifically at "
    "nirfindia.org before enrolling.\n\n"
    "Red Flag 2: The mobile app has reported submission glitches during high-traffic assignment windows. Always submit "
    "assignments using a desktop or laptop browser. Do not rely on the mobile app for deadline-critical submissions.\n\n"
    "Red Flag 3: Faculty quality has been reported as uneven between core subjects (Semesters 1 and 2) and "
    "specialisation electives (Semesters 3 and 4). If consistent faculty quality is important to your learning "
    "experience, ask specifically about specialisation faculty during the pre-admission counselling session.\n\n"
    "Red Flag 4: Peer interaction and collaborative learning opportunities are limited. The programme structure does "
    "not enforce group projects in core semesters. If you value community and peer-driven learning, this programme "
    "may feel more isolated than alternatives with structured group work requirements."
)
row(ws, 'red_flags_body', None, red_flags_body)

row(ws, 'comparisons_h2', "How Vignan's Foundation for Science, Technology and Research Online Compares to Peer Universities", None)
comparisons_body = (
    "Vignan's Foundation for Science, Technology and Research Online: NAAC A+, NIRF #75, Rs 90,000, 7 specialisations. "
    "WES recognised. Strengths: NIRF ranking, Finance depth with Fintech, affordable fee, South India brand.\n\n"
    "Uttaranchal University Online: NAAC A+, Rs 94,000, 8 specialisations including Logistics and Digital Marketing. "
    "Similar fee with 8 specialisation choices but no NIRF ranking. Choose Vignan if NIRF rank matters; choose "
    "Uttaranchal if the eighth specialisation better fits your career.\n\n"
    "Sharda University Online: NAAC A+, NIRF #87, Rs 1,40,000, 6 specialisations. NIRF ranking with more fee. "
    "Choose Sharda if NIRF overall visibility justifies the Rs 50,000 premium. Choose Vignan if budget is tighter "
    "and NIRF #75 provides sufficient employer recognition.\n\n"
    "Use the compare tool at /compare to evaluate all options side by side. The right choice depends on your "
    "NIRF requirement, specialisation need, and fee budget."
)
row(ws, 'comparisons_body', None, comparisons_body)

row(ws, 'verdict_h2', "Honest Verdict: Is the Vignan's Foundation for Science, Technology and Research Online MBA Right for You?", None)
verdict_body = (
    "This verdict is based on publicly available data from UGC-DEB, NAAC, and NIRF portals, cross-referenced with "
    "student feedback from verified sources.\n\n"
    "Choose this if:\n"
    "- You want a NIRF-ranked NAAC A+ online MBA at Rs 90,000 in South India\n"
    "- Finance depth with Fintech, Fixed Income, or Corporate Valuation matches your BFSI career target\n"
    "- WES recognition matters for Canadian immigration or credential evaluation\n"
    "- Business Analytics with Data Mining and BI Reporting is your target specialisation\n\n"
    "Look elsewhere if:\n"
    "- NIRF Management category ranking is a specific requirement for your employer\n"
    "- You need structured collaborative peer learning with group project requirements\n"
    "- Consistent faculty quality across specialisation electives is a hard requirement\n"
    "- You need more than 7 specialisation choices and Uttaranchal at Rs 94,000 provides better track fit\n\n"
    "The decision between two similarly accredited programmes usually comes down to the specialisation you need, the "
    "placement network relevant to your industry, and the fee your budget supports. Use the /compare tool to map "
    "your shortlist. If you are still undecided, our counsellor call is free at /contact."
)
row(ws, 'verdict_body', None, verdict_body)

row(ws, 'faqs_h2', 'Frequently Asked Questions', None)
row(ws, 'faq_1', "Is the Vignan's Foundation for Science, Technology and Research Online MBA UGC approved?",
    "Yes. Vignan's Foundation for Science, Technology and Research Online is listed on the UGC-DEB entitled institutions list at deb.ugc.ac.in. The MBA degree is valid for government jobs, PSU recruitment, and higher education under current UGC-DEB norms. Always verify your admission year list at deb.ugc.ac.in before joining.")
row(ws, 'faq_2', "What is the total fee for the Vignan's Foundation for Science, Technology and Research Online MBA?",
    'The total indicative fee is Rs 90,000 paid across four semesters of approximately Rs 22,500 each. Additional charges may include registration and exam fees. Fees are indicative and must be reconfirmed with Vignan Online or our counsellor before any payment.')
row(ws, 'faq_3', "What is the eligibility for the Vignan's Foundation for Science, Technology and Research Online MBA?",
    'Graduation with 50% marks from a recognised university is required. No entrance exam is needed. Work experience is not mandatory. SC/ST or OBC candidates below 50% should check with the admissions team for applicable relaxation norms.')
row(ws, 'faq_4', "How are classes conducted at Vignan's Foundation for Science, Technology and Research Online?",
    'Classes run entirely online through the Vignan Online LMS. Recorded lectures and study materials are available throughout the semester. Live faculty sessions are scheduled on weekends or evenings. There is no mandatory campus visit for the online MBA programme.')
row(ws, 'faq_5', "Does Vignan's Foundation for Science, Technology and Research Online provide placements?",
    "Vignan Online provides career support including resume workshops, alumni networking, and industry interaction sessions. This is career assistance, not a placement guarantee. Actual employment depends on specialisation, work experience, and your own job market efforts.")
row(ws, 'faq_6', "Is the Vignan's Foundation for Science, Technology and Research Online MBA equivalent to a regular MBA?",
    'Yes, under UGC-DEB guidelines, degrees from entitled institutions are equivalent to regular mode degrees for government job eligibility and higher education. WES recognition confirms international credential equivalence for Canadian immigration and employment. Some private employers may treat them differently.')
row(ws, 'faq_7', "What specialisations does Vignan's Foundation for Science, Technology and Research Online MBA offer?",
    "Seven specialisations: Marketing, Finance, Human Resource Management, Business Analytics, IT Management, Healthcare Management, and Logistics and Supply Chain Management. Finance includes Fintech Foundation and Applications in Semester 4. Full elective syllabi at /universities/vignan-university-online/mba/[spec-slug].")
row(ws, 'faq_8', "How do I apply to Vignan's Foundation for Science, Technology and Research Online?",
    'Visit https://online.vignan.ac.in and navigate to the MBA programme page. Register, fill the application form, select your specialisation, and upload graduation documents and government photo ID. Pay the registration fee to initiate verification. Most intakes open in January and July.')
row(ws, 'faq_9', "What is the duration of the Vignan's Foundation for Science, Technology and Research Online MBA?",
    'The programme runs for 2 years across 4 semesters of approximately six months each. There is no fast-track option; the four-semester structure is fixed under UGC-DEB programme norms.')
row(ws, 'faq_10', "Can I apply for government jobs after the Vignan's Foundation for Science, Technology and Research Online MBA?",
    "Yes. Vignan's Foundation for Science, Technology and Research Online holds UGC-DEB entitlement, meaning the MBA is valid for central and state government job applications requiring a postgraduate management degree. PSU boards also accept UGC-DEB entitled degrees. Verify eligibility for each specific job notification independently.")

wb.save('data/EdifyEdu_Page_Blueprint_v3.xlsx')
print("SAVED: vignan-university-online_MBA sheet written successfully")
