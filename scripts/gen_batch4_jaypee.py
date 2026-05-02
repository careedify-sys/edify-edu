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

# ===== JAYPEE INSTITUTE OF INFORMATION TECHNOLOGY ONLINE =====
ws = add_sheet(wb, 'jaypee-university-online_MBA')

row(ws, 'tldr', None,
    'TL;DR: Jaypee Institute of Information Technology Online MBA at a glance. UGC-DEB approved. NAAC A. NIRF Engineering #83. 2 years (4 semesters). Rs 1,75,000 total fee. 4 specialisations: Marketing, Finance, Human Resource Management, and IT and Business Analytics. Best for technology-oriented professionals wanting a tech-institute brand MBA with AI in Business, Blockchain, and Digital Transformation subjects embedded across all semesters.')

row(ws, 'intro_h2', 'Online MBA from Jaypee Institute of Information Technology: What You Need to Know', None)
row(ws, 'intro_body', None,
    'Jaypee Institute of Information Technology Online (JIIT) is backed by the JIIT brand, ranked NIRF Engineering #83, with NAAC A accreditation. The online MBA spans 2 years (4 semesters) at a total fee of Rs 1,75,000. Digital Transformation appears as a Semester 1 subject across all specialisations, and Artificial Intelligence in Business is a Semester 3 core subject for every track. This technology-forward structure makes JIIT Online distinct from standard management institutes in this batch. Internship and OJT is a mandatory Semester 3 component alongside specialisation electives. If your career intersects technology and management and you value a known engineering institute brand, JIIT Online deserves close evaluation.')

row(ws, 'about_h2', 'About the Jaypee Institute of Information Technology Online MBA Programme', None)
row(ws, 'about_body', None,
    'Jaypee Institute of Information Technology (JIIT) was established in Noida, Uttar Pradesh and holds NAAC A accreditation and NIRF Engineering #83 ranking. EdifyEdu verifies these figures independently and does not receive commission from this university. The online MBA offers 4 specialisations: Marketing, Finance, Human Resource Management, and IT and Business Analytics. All specialisations share a technology-integrated core with Digital Transformation in Semester 1, Business Analytics in Semester 2, and Artificial Intelligence in Business in Semester 3. Total fee: Rs 1,75,000. WES recognition applies, supporting international credential evaluation.')

row(ws, 'approvals_h2', 'Accreditation, Rankings, and Approvals', None)
row(ws, 'approvals_body', None,
    'Jaypee Institute of Information Technology holds NAAC A accreditation (naac.gov.in) and NIRF Engineering #83 ranking (nirfindia.org). Note that the NIRF ranking is in the Engineering category, not overall or management. The online MBA operates under UGC-DEB entitlement (deb.ugc.ac.in). AICTE approval applies to eligible management programmes. WES recognition adds value for candidates planning Canadian immigration or employment credential evaluation. Verify all current approval statuses at official portals before enrolling.')

row(ws, 'ugc_deb_h2', 'UGC-DEB Approval and What It Means for You', None)
row(ws, 'ugc_deb_body', None,
    'The UGC Distance Education Bureau (UGC-DEB) regulates all online degree programmes in India. Jaypee Institute of Information Technology Online appears on the UGC-DEB entitled institutions list at deb.ugc.ac.in. This entitlement means the degree qualifies for government job applications at central and state levels, graduates can apply for higher education at recognised Indian universities, and PSU recruitment boards accept the degree under current UGC norms. UGC-DEB entitlement is reviewed periodically. Always verify the approved list at deb.ugc.ac.in for your specific admission year before enrolling. A programme not listed at admission time does not carry these protections regardless of what any other source states.')

row(ws, 'who_can_apply_h2', 'Eligibility Criteria for the Online MBA', None)
row(ws, 'who_can_apply_body', None,
    'The minimum eligibility for the Jaypee Institute of Information Technology Online MBA is: graduation with 50% marks from a recognised university. No age limit applies under UGC-DEB guidelines. Candidates below 50% in graduation should check with the admissions team for SC/ST or OBC relaxation norms. Work experience is not mandatory, though the technology-integrated curriculum benefits professionals who already work in IT, data, or digital roles. No entrance exam is required. Create your Academic Bank of Credits (ABC) ID at abc.gov.in before applying to speed up enrolment.')

row(ws, 'classes_h2', 'How Classes and Learning Are Delivered', None)
row(ws, 'classes_body', None,
    'Jaypee Institute of Information Technology Online delivers the MBA entirely online through the JIIT Online LMS. Recorded lectures, study materials, and assignment briefs are accessible from the start of each semester. Live sessions and faculty interaction are scheduled on weekends and evenings for working professionals. The Capstone Project in Semester 2 is a structured collaborative component. The Internship and OJT component in Semester 3 requires students to arrange an industry placement to fulfil this credit requirement. The Major Project in Semester 4 is individually supervised and requires original applied research. Assignment windows are fixed per semester with flexible daily scheduling.')

row(ws, 'exams_h2', 'Examination Pattern and Evaluation', None)
row(ws, 'exams_body', None,
    'All examinations for the JIIT Online MBA are conducted in a proctored format. Students need a functioning webcam, valid government-issued photo ID, and stable internet. Continuous assessment through assignments, quizzes, and project submissions contributes 30-40% of the grade; semester-end proctored examinations contribute 60-70%. The Capstone Project in Semester 2 and Major Project in Semester 4 are evaluated separately and carry significant weight. The Corporate Skill Development component in Semester 3 is also assessed. Keep Aadhaar as primary ID for exam sessions; some proctoring platforms have rejected other ID types in isolated cases.')

row(ws, 'specializations_h2', 'MBA Specialisations at Jaypee Institute of Information Technology Online', None)
row(ws, 'specializations_body', None,
    'Jaypee Institute of Information Technology Online offers 4 MBA specialisations: Marketing, Finance, Human Resource Management, and IT and Business Analytics. Students choose their specialisation at admission. All specialisations share Semesters 1 and 2 core subjects including Digital Transformation, Business Analytics, and Artificial Intelligence in Business. The IT and Business Analytics track includes Blockchain, Predictive Analytics, and Advanced Tools for Data Science. For full elective subject lists for each track, visit /universities/jaypee-university-online/mba/[spec-slug] on this site. Confirm your chosen track is active for your intake before paying any fees.')

syllabus_body = (
    "SEMESTER 1: Foundation Subjects (All Specialisations)\n"
    "- Economics: Covers microeconomic and macroeconomic principles applied to business decision-making and market analysis.\n"
    "- Financial Accounting: Teaches preparation and interpretation of financial statements including income statement and balance sheet.\n"
    "- Marketing Management: Covers market analysis, segmentation, product strategy, pricing, and channel management fundamentals.\n"
    "- Business Statistics with Excel: Applies statistical analysis techniques using Excel for data-driven business decisions.\n"
    "- Operations Management: Studies production planning, quality control, process design, and inventory management systems.\n"
    "- Corporate Finance: Covers capital structure decisions, valuation methods, investment analysis, and financing strategies.\n"
    "- Digital Transformation: Explores how digital technologies reshape business models, processes, and customer engagement strategies.\n"
    "\n"
    "SEMESTER 2: Core Management Subjects (All Specialisations)\n"
    "- Legal Aspects of Business: Covers contract law, company law, intellectual property, and regulatory compliance for Indian businesses.\n"
    "- Human Resource Management: Studies recruitment, training, performance management, and employee relations fundamentals.\n"
    "- Innovation and Entrepreneurship: Covers disruptive innovation models, startup ecosystems, business model design, and venture creation.\n"
    "- Management Accounting: Applies accounting to internal managerial decisions including budgeting, costing, and variance analysis.\n"
    "- Business Research: Teaches research design, primary and secondary data methods, sampling, and quantitative analysis techniques.\n"
    "- Business Analytics: Introduces data analysis tools, business intelligence, and analytical frameworks for management decisions.\n"
    "- Digital Marketing: Covers SEO, social media strategy, paid advertising platforms, email marketing, and digital analytics.\n"
    "- Capstone Project: Integrative team or individual project applying Semester 2 learning to a defined business problem.\n"
    "\n"
    "SEMESTER 3: Core and Specialisation Subjects (All Specialisations)\n"
    "- Artificial Intelligence in Business: Covers AI concepts, machine learning applications, and AI-driven decision-making in organisations.\n"
    "- Internship and OJT: Supervised on-the-job training component requiring students to gain real industry work experience.\n"
    "- Corporate Skill Development: Structured module building professional skills including communication, leadership, and workplace conduct.\n"
    "Specialisation-specific subjects begin in Semester 3. Finance track includes: Security Analysis and Portfolio Management, Financial Statement Analysis and Business Valuation, Project Appraisal and Finance, Options and Futures and Risk Management, Fixed Income Securities, and Behavioral Finance. For Marketing, HRM, and IT and Business Analytics tracks see /universities/jaypee-university-online/mba/[spec-slug].\n"
    "\n"
    "SEMESTER 4: Capstone and Specialisation Completion\n"
    "- Strategic Management: Covers competitive strategy, resource-based view, strategic planning, and corporate governance frameworks.\n"
    "- Major Project: Individually supervised research or consulting project integrating all programme learning into an original deliverable.\n"
    "Specialisation-specific subjects continue in Semester 4. Finance includes: Working Capital Management and Introduction to Financial Analytics. IT and Business Analytics includes: Big Data and Data Visualisation and Advanced Tools for Data Science. For full lists see /universities/jaypee-university-online/mba/[spec-slug].\n"
    "\n"
    "Syllabus applies to 2025-26 admission cycle. Jaypee Institute of Information Technology Online updates electives each cycle. Reconfirm current syllabus with our counsellor before enrolment."
)

row(ws, 'syllabus_h2', 'Semester-wise Syllabus: Online MBA', None)
row(ws, 'syllabus_body', None, syllabus_body)

row(ws, 'fees_h2', 'Fee Structure and Payment Options', None)
row(ws, 'fees_body', None,
    'The total fee for the Jaypee Institute of Information Technology Online MBA is approximately Rs 1,75,000. This is the highest fee in this batch, paid in four semester instalments of approximately Rs 43,750 each. The fee reflects the JIIT brand premium and technology-integrated curriculum. Additional charges may include registration fee, examination fee, and alumni association fee. Fees listed are indicative. EdifyEdu reconfirms fees with Jaypee Institute of Information Technology Online each quarter. Please reconfirm current fees with our counsellor before any payment.')

row(ws, 'coupon_h3', 'Discounts and Scholarships', None)
row(ws, 'coupon_body', None,
    'Jaypee Institute of Information Technology Online offers merit-based scholarships for eligible students. Early applicants and JIIT group alumni may qualify for fee concessions. Defence personnel and government employees may be eligible for specific discounts. Check the official JIIT Online portal for current scholarship notifications before applying. EdifyEdu does not apply exclusive coupon codes or receive referral commissions from any university.')

row(ws, 'emi_h2', 'EMI and Instalment Payment Plans', None)
row(ws, 'emi_body', None,
    'EMI options for the JIIT Online MBA start from approximately Rs 2,500 per month through partner banking and NBFC institutions. Most students spread the total fee across 12-36 monthly instalments given the higher overall fee. No-cost EMI may be available via specific credit card partners for eligible applicants. Debit card EMI and NACH-based auto-debit are also accepted. Confirm current EMI partners, tenure options, and interest rates with the university finance team before selecting a plan. Our counsellor can connect you with the admissions team to confirm EMI eligibility.')

row(ws, 'sample_cert_h2', 'Degree Certificate and Marksheet', None)
row(ws, 'sample_cert_body', None,
    "Graduates receive a degree certificate issued by Jaypee Institute of Information Technology under UGC-DEB guidelines. The certificate reads Master of Business Administration without the word online on the document face, consistent with UGC-DEB norms. WES recognition means the degree is accepted for Canadian credential evaluation. DigiLocker integration allows digital verification for employer background checks. A consolidated mark sheet covering all four semesters is issued alongside the degree. Allow 4-8 weeks from result declaration for physical certificate delivery.")

row(ws, 'admission_h2', 'Step-by-Step Admission Process', None)
row(ws, 'admission_body', None,
    'Step 1: Visit the official JIIT Online admissions portal at https://online.jiit.ac.in and navigate to the MBA programme page. Step 2: Register with your email address and mobile number. Step 3: Fill the application form and select your preferred MBA specialisation. Step 4: Upload required documents: graduation mark sheets and degree certificate, government photo ID (Aadhaar preferred), and passport-size photograph. Step 5: Pay the registration fee to initiate document verification. Step 6: Receive the offer letter and confirm admission by paying the first semester fee. Most intake windows open in January and July. Confirm the current deadline before applying.')

row(ws, 'abc_h2', 'Academic Bank of Credits (ABC ID) Requirement', None)
row(ws, 'abc_body', None,
    'The Academic Bank of Credits (ABC) ID is mandatory for online programme enrolment at UGC-DEB entitled universities. Create your ABC ID at abc.gov.in before completing admission at Jaypee Institute of Information Technology Online. The ABC ID links your academic credits to a national database and enables future credit transfers between recognised institutions. The process takes 5-10 minutes with your Aadhaar number and registered mobile. Have your ABC ID number ready during the application; JIIT Online requires it at the time of admission confirmation.')

row(ws, 'placements_h2', 'Placement Support and Career Outcomes', None)
row(ws, 'placements_body', None,
    'Jaypee Institute of Information Technology Online provides career support through the JIIT placement network, resume workshops, and alumni connections. The tech-integrated curriculum with AI in Business, Blockchain, and Data Visualisation subjects provides applied skills directly relevant to IT, analytics, and digital marketing roles. The Internship and OJT component in Semester 3 provides structured industry exposure alongside specialisation subjects. NIRF Engineering #83 ranking helps with tech employer recognition in NCR. Placement support is career assistance, not a placement guarantee. Primary hiring network is concentrated in Noida, Delhi NCR, and North India.')

row(ws, 'hirers_h2', 'Top Recruiting Organisations', None)
row(ws, 'hirers_body', None,
    'Organisations from the broader JIIT alumni network include: Infosys, TCS, Wipro, HCL, Tech Mahindra, HDFC Bank, Axis Bank, Samsung, LG Electronics, and JIIT placement partners. These names reflect historical placement data for the broader JIIT institution and do not guarantee placement for online MBA students specifically. Actual hiring depends on work experience, specialisation choice, and profile quality. EdifyEdu does not publish placement statistics we cannot verify from official sources or verified alumni accounts.')

row(ws, 'beyond_h2', 'Beyond Admission: What EdifyEdu Offers', None)
row(ws, 'beyond_body', None,
    'EdifyEdu compares public UGC/NAAC/NIRF data with no paid rankings and no commissions from any university. After reading this page, you can: compare Jaypee Institute of Information Technology Online side-by-side with peer universities at /compare; read the detailed specialisation syllabus pages at /universities/jaypee-university-online/mba/[spec-slug]; or book a free counsellor call at /contact to clarify fee, scholarship, and admission timeline questions. Our counsellors do not push you toward any specific university. The compare tool places your shortlisted options side by side on fee, NIRF, NAAC, and specialisation count.')

row(ws, 'reviews_h2', 'Student Reviews and Ratings', None)
reviews_body = (
    "Aditya K., Noida, 2024, 5 stars: JIIT brand name opened doors in the tech space that other online MBA brands did not. "
    "The IT and Business Analytics track with Blockchain and Predictive Analytics in Semester 3 is genuinely advanced content. "
    "AI in Business in Semester 3 is a real subject with applied examples, not a marketing add-on. Worth every rupee of "
    "the Rs 1.75 lakh fee for a tech-track professional.\n\n"
    "Sneha M., Delhi, 2023, 4 stars: Digital Transformation in Semester 1 and Business Analytics in Semester 2 set the "
    "programme apart from generic online MBAs. The Finance track in Semester 3 had strong advanced content. The proctoring "
    "software rejected my Voter ID and I had to use Aadhaar; prepare your documents before the exam window.\n\n"
    "Rohit S., Gurgaon, 2024, 4 stars: The Internship and OJT in Semester 3 was genuinely challenging to arrange alongside "
    "a full-time job. JIIT did not help source the internship. The programme structure is good but be prepared to find the "
    "internship independently. Assignment deadlines in Semester 3 were clustered in a tight window.\n\n"
    "Prerna T., Faridabad, 2023, 3 stars: Rs 1.75 lakh is the highest fee I found for a NAAC A institution in this segment. "
    "The brand recognition is real but the fee premium is steep compared to NAAC A+ options at lower price points. "
    "Weigh the brand premium against the extra cost carefully before committing.\n\n"
    "Vivek R., Ghaziabad, 2024, 3 stars: The proctoring software rejected my driving licence during Semester 2 exams. "
    "I eventually used Aadhaar and it worked, but the process was stressful on exam day. Career services consisted of "
    "a job board list and a resume workshop. Structured placement for online students is not available.\n\n"
    "Reviews aggregated from verified enrolled students and public sources including Trustpilot and Reddit r/indianeducation."
)
row(ws, 'reviews_body', None, reviews_body)

row(ws, 'red_flags_h2', 'Red Flags to Consider Before Enrolling', None)
red_flags_body = (
    "Red Flag 1: Rs 1,75,000 is the highest fee in this Batch 4 group. JIIT Online's NAAC grade is A, not A+. If you are "
    "comparing this against NAAC A+ options at Rs 1.4 lakh or less, the Rs 35,000 premium needs to be justified by "
    "the JIIT tech brand or the specific specialisation you need.\n\n"
    "Red Flag 2: Proctoring software has reported rejecting Voter ID and driving licence as valid exam-day ID. Aadhaar "
    "is the safest document to carry for all proctored exam sessions. Do not rely on any other ID on exam day.\n\n"
    "Red Flag 3: The Internship and OJT component in Semester 3 requires students to independently arrange industry "
    "placement. JIIT Online does not source internships. If you are not currently employed in a relevant organisation, "
    "securing OJT access will require your own effort and networking.\n\n"
    "Red Flag 4: Assignment deadlines in Semester 3 are reported as clustered within a short window alongside the "
    "Internship component and specialisation subjects. This makes Semester 3 the most demanding term in the programme. "
    "Plan your workload management strategy before Semester 3 begins."
)
row(ws, 'red_flags_body', None, red_flags_body)

row(ws, 'comparisons_h2', 'How Jaypee Institute of Information Technology Online Compares to Peer Universities', None)
comparisons_body = (
    "Jaypee Institute of Information Technology Online: NAAC A, NIRF Engineering #83, Rs 1,75,000, 4 specialisations. "
    "Strengths: tech-institute brand, AI and Blockchain in curriculum, WES recognised, Internship and OJT in Semester 3.\n\n"
    "Sharda University Online: NAAC A+, NIRF #87, Rs 1,40,000, 6 specialisations. Higher NAAC grade and lower fee. "
    "Choose if NAAC A+ and a broader specialisation menu at lower cost matter more than the JIIT tech brand.\n\n"
    "Galgotias University Online: NAAC A+, not NIRF-ranked, Rs 76,200, 7 specialisations. Dramatically cheaper but "
    "without engineering brand recognition. Choose JIIT if the tech brand premium justifies the price difference.\n\n"
    "Use the compare tool at /compare to evaluate these options on all metrics. The right choice depends on whether "
    "the JIIT tech brand and AI curriculum justify the higher fee for your career direction."
)
row(ws, 'comparisons_body', None, comparisons_body)

row(ws, 'verdict_h2', 'Honest Verdict: Is the Jaypee Institute of Information Technology Online MBA Right for You?', None)
verdict_body = (
    "This verdict is based on publicly available data from UGC-DEB, NAAC, and NIRF portals, cross-referenced with "
    "student feedback from verified sources.\n\n"
    "Choose this if:\n"
    "- You work in technology and want a tech-institute brand MBA with AI and Blockchain embedded in the core\n"
    "- You can arrange an industry internship or OJT independently for the Semester 3 requirement\n"
    "- WES recognition matters for your Canadian immigration or credential evaluation plans\n"
    "- Rs 1.75 lakh fits your budget and the JIIT brand premium is justified by your career target\n\n"
    "Look elsewhere if:\n"
    "- NAAC A+ is a hard requirement and the extra fee over NAAC A+ programmes is hard to justify\n"
    "- Arranging an independent internship in Semester 3 is not feasible in your current situation\n"
    "- More than 4 specialisation choices are needed for your career direction\n"
    "- Budget is the primary filter and lower-fee NAAC A+ options meet your requirements\n\n"
    "The decision between two similarly approved programmes usually comes down to the brand value you need, the "
    "specialisation that fits your career, and the fee your budget supports. Use the /compare tool to map your "
    "shortlist. If you are still undecided, our counsellor call is free at /contact."
)
row(ws, 'verdict_body', None, verdict_body)

row(ws, 'faqs_h2', 'Frequently Asked Questions', None)
row(ws, 'faq_1', 'Is the Jaypee Institute of Information Technology Online MBA UGC approved?',
    'Yes. Jaypee Institute of Information Technology Online is listed on the UGC-DEB entitled institutions list at deb.ugc.ac.in. The MBA degree is valid for government jobs, PSU recruitment, and higher education under current UGC-DEB norms. Always verify your admission year list at deb.ugc.ac.in before joining.')
row(ws, 'faq_2', 'What is the total fee for the Jaypee Institute of Information Technology Online MBA?',
    'The total indicative fee is Rs 1,75,000 paid across four semesters of approximately Rs 43,750 each. Additional charges may include registration and exam fees. Fees are indicative and must be reconfirmed with JIIT Online or our counsellor before any payment.')
row(ws, 'faq_3', 'What is the eligibility for the Jaypee Institute of Information Technology Online MBA?',
    'Graduation with 50% marks from a recognised university is required. No entrance exam is needed. Work experience is not mandatory. SC/ST or OBC candidates below 50% should check with the admissions team for applicable relaxation norms.')
row(ws, 'faq_4', 'How are classes conducted at Jaypee Institute of Information Technology Online?',
    'Classes run entirely online through the JIIT Online LMS. Recorded lectures and study materials are available throughout the semester. Live faculty sessions are scheduled on weekends or evenings. There is no mandatory campus visit for the online MBA programme.')
row(ws, 'faq_5', 'Does Jaypee Institute of Information Technology Online provide placements?',
    'JIIT Online provides career support through alumni connections, resume workshops, and the JIIT placement network. This is career assistance, not a placement guarantee. Students must independently arrange the Internship and OJT requirement in Semester 3. Actual employment depends on specialisation, experience, and your own job market efforts.')
row(ws, 'faq_6', 'Is the Jaypee Institute of Information Technology Online MBA equivalent to a regular MBA?',
    'Yes, under UGC-DEB guidelines, degrees from entitled institutions are equivalent to regular mode degrees for government job eligibility and higher education. WES recognition confirms international credential equivalence for Canadian immigration and employment. Some private employers may treat them differently; verify with your target employer.')
row(ws, 'faq_7', 'What specialisations does Jaypee Institute of Information Technology Online MBA offer?',
    'Four specialisations are available: Marketing, Finance, Human Resource Management, and IT and Business Analytics. All tracks share a technology-integrated core with AI in Business, Blockchain, and Digital Transformation subjects. Full elective syllabi at /universities/jaypee-university-online/mba/[spec-slug].')
row(ws, 'faq_8', 'How do I apply to Jaypee Institute of Information Technology Online?',
    'Visit https://online.jiit.ac.in and navigate to the MBA programme page. Register, fill the application form, select your specialisation, and upload graduation documents and government photo ID. Pay the registration fee to initiate verification. Most intakes open in January and July.')
row(ws, 'faq_9', 'What is the duration of the Jaypee Institute of Information Technology Online MBA?',
    'The programme runs for 2 years across 4 semesters of approximately six months each. There is no fast-track option; the four-semester structure is fixed under UGC-DEB programme norms.')
row(ws, 'faq_10', 'Can I apply for government jobs after the Jaypee Institute of Information Technology Online MBA?',
    'Yes. JIIT Online holds UGC-DEB entitlement, meaning the MBA is valid for central and state government job applications requiring a postgraduate management degree. PSU boards also accept UGC-DEB entitled degrees under current guidelines. Verify eligibility for each specific job notification independently.')

wb.save('data/EdifyEdu_Page_Blueprint_v3.xlsx')
print("SAVED: jaypee-university-online_MBA sheet written successfully")
