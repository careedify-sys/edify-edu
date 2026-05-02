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

# ===== DR. MGR =====
ws = add_sheet(wb, 'dmeri-online_MBA')

row(ws, 'tldr', None,
    'TL;DR: Dr. MGR Educational and Research Institute Online MBA at a glance. UGC-DEB approved. NAAC A+. 2 years (4 semesters). Rs 1,41,000 total fee. 6 specialisations including Hospital and Healthcare Management and Information Systems. Best for South India professionals seeking a NAAC A+ online MBA with a dedicated healthcare or HRM track and a mandatory 8-week field project.')

row(ws, 'intro_h2', 'Online MBA from Dr. MGR Educational and Research Institute: What You Need to Know', None)
row(ws, 'intro_body', None,
    'Dr. MGR Educational and Research Institute Online offers one of the few online MBAs in India with a dedicated Hospital and Healthcare Management specialisation alongside Information Systems and Operations Management. The university holds NAAC A+ accreditation and UGC-DEB entitlement. The programme spans 2 years (4 semesters) at a total fee of Rs 1,41,000. A mandatory 8-week field project in Semester 4 adds applied industry exposure that most fully online programmes omit. If you work in healthcare, HR, or IT in South India and want a NAAC A+ degree with sector-specific depth, this programme merits close consideration.')

row(ws, 'about_h2', 'About the Dr. MGR Educational and Research Institute Online MBA Programme', None)
row(ws, 'about_body', None,
    'Dr. MGR Educational and Research Institute (Deemed University) was established in Chennai in 1988 and is named after the legendary Tamil Nadu Chief Minister Dr. M.G. Ramachandran. It holds NAAC A+ accreditation. EdifyEdu verifies these figures independently and does not receive commission from this university. The online MBA spans 6 specialisations: Finance Management, Hospital and Healthcare Management, Human Resource Management, Information Systems, Marketing Management, and Operations Management. The 4-semester structure includes laboratory practicals in Semesters 1 and 2 and a mandatory 8-week field project in Semester 4, making it more practice-oriented than most online MBAs. Total fee: Rs 1,41,000.')

row(ws, 'approvals_h2', 'Accreditation, Rankings, and Approvals', None)
row(ws, 'approvals_body', None,
    'Dr. MGR Educational and Research Institute holds NAAC A+ accreditation (naac.gov.in) as a deemed university established under the UGC Act. The online MBA operates under UGC-DEB entitlement (deb.ugc.ac.in), which makes it valid for central and state government job applications, PSU recruitment, and higher education admissions across India. AICTE approval applies to eligible management programmes. The university does not currently feature in NIRF overall rankings. Verify all current approval statuses directly at the respective official portals before enrolling.')

row(ws, 'ugc_deb_h2', 'UGC-DEB Approval and What It Means for You', None)
row(ws, 'ugc_deb_body', None,
    'The UGC Distance Education Bureau (UGC-DEB) regulates all online degree programmes in India. Dr. MGR Educational and Research Institute appears on the UGC-DEB entitled institutions list at deb.ugc.ac.in. This entitlement means the degree qualifies for government job applications at central and state levels, graduates can apply for higher education at recognised Indian universities, and PSU recruitment boards accept the degree under current UGC norms. UGC-DEB entitlement is reviewed periodically. Always verify the approved list at deb.ugc.ac.in for your specific admission year before enrolling. A programme not listed at the time of your admission does not carry these protections regardless of what any other source states.')

row(ws, 'who_can_apply_h2', 'Eligibility Criteria for the Online MBA', None)
row(ws, 'who_can_apply_body', None,
    'The minimum eligibility for the Dr. MGR Educational and Research Institute Online MBA is: any graduation with a minimum of 50% marks from a UGC-recognised university. No age limit applies under UGC-DEB guidelines, making the programme accessible to working professionals at any career stage. Candidates below 50% in graduation should check with the admissions team for SC/ST or OBC relaxation norms applicable to the current intake. Work experience is not mandatory, though it improves subject applicability particularly in the Healthcare Management and Operations tracks. No entrance exam is required. Creating your Academic Bank of Credits (ABC) ID at abc.gov.in before applying will speed up the enrolment process.')

row(ws, 'classes_h2', 'How Classes and Learning Are Delivered', None)
row(ws, 'classes_body', None,
    'Dr. MGR Educational and Research Institute Online delivers the MBA entirely online with no mandatory campus visit for most students. Study materials, recorded lectures, and assignment briefs are uploaded through the university LMS at the start of each semester. Live doubt-clearing sessions and faculty interaction are scheduled typically on weekends. Laboratory subjects in Semesters 1 and 2 (Computer Applications and Tally) are delivered through virtual lab environments. The programme is structured for full-time working adults with live interaction scheduled outside standard working hours where possible. Assignment windows are fixed per semester but daily study scheduling remains flexible within those windows.')

row(ws, 'exams_h2', 'Examination Pattern and Evaluation', None)
row(ws, 'exams_body', None,
    'All examinations for the online MBA are conducted online in a proctored format. Students need a functioning webcam, valid government-issued photo ID, and a stable internet connection for exam sessions. Evaluation combines continuous assessment through assignments and practicals (30-40%) with semester-end proctored examinations (60-70%). Semester 4 includes the mandatory 8-week Field Work and Project Work component evaluated separately. The Summer Project in Semester 3 carries assessment weight toward the Semester 3 grade. Keep Aadhaar as your primary ID for exam sessions; some proctoring platforms have rejected other ID types in isolated cases.')

row(ws, 'specializations_h2', 'MBA Specialisations at Dr. MGR Educational and Research Institute Online', None)
row(ws, 'specializations_body', None,
    'Dr. MGR Educational and Research Institute Online offers 6 MBA specialisations: Finance Management, Hospital and Healthcare Management, Human Resource Management, Information Systems, Marketing Management, and Operations Management. Students select their specialisation at the time of admission. Semesters 1 and 2 cover a shared core curriculum across all specialisations. Specialisation-specific subjects begin from Semester 3. The Hospital and Healthcare Management and Information Systems tracks are relatively rare in the online MBA market at this fee point. For detailed elective subject lists for each track, visit /universities/dr-mgr-educational-research-institute-online/mba/[spec-slug] on this site. Specialisation availability may vary by intake cycle. Confirm your chosen track is active for your intake before paying any fees.')

syllabus_body = (
    "SEMESTER 1: Foundation Subjects (All Specialisations)\n"
    "- Principles of Management and Behavioral Science: Covers classical and modern management thought, behavioral science applications, and leadership theories.\n"
    "- Managerial Economics: Applies micro and macro economic concepts to pricing, production, and business planning decisions.\n"
    "- Basic Accounting: Teaches preparation of financial statements, journal entries, trial balance, and basic cost accounting principles.\n"
    "- Business Legislation: Covers the Indian Contract Act, Companies Act, Consumer Protection Act, and key commercial laws.\n"
    "- Business Statistics: Introduces descriptive statistics, probability distributions, sampling, and hypothesis testing for business contexts.\n"
    "- E-Commerce: Explores digital business models, electronic transactions, online retail platforms, and digital payment systems.\n"
    "- Labs: Computer Applications: Hands-on practice with business software including spreadsheets, word processors, and presentation tools.\n"
    "- Business Communication: Develops written and oral communication skills for professional business settings.\n"
    "\n"
    "SEMESTER 2: Core Management Subjects (All Specialisations)\n"
    "- Marketing Management: Covers market segmentation, product positioning, pricing strategy, and integrated marketing communication.\n"
    "- Human Resource Management: Studies recruitment, training and development, performance appraisal, and employee relations fundamentals.\n"
    "- Research Methodology: Teaches research design, data collection instruments, sampling methods, and report writing for business research.\n"
    "- Talent Management: Covers talent identification, succession planning, engagement strategies, and retention frameworks.\n"
    "- Strategic HRM: Explores alignment of human resource practices with long-term organisational strategy and business goals.\n"
    "- Industrial Relations: Studies trade union law, collective bargaining, grievance handling, and industrial disputes resolution.\n"
    "- Labs: Tally: Hands-on practice with Tally ERP software for accounting, GST filing, and financial record-keeping.\n"
    "- Business Etiquette: Develops professional workplace conduct, cross-cultural communication awareness, and corporate protocol skills.\n"
    "\n"
    "SEMESTER 3: Core and Specialisation Subjects\n"
    "- Strategic Management: Studies corporate strategy formulation, competitive advantage frameworks, and strategic decision-making tools.\n"
    "- Entrepreneurship Development: Covers business plan development, startup ecosystem, funding sources, and entrepreneurial risk management.\n"
    "- Management Accounting: Applies accounting to managerial decisions including budgeting, variance analysis, and costing methods.\n"
    "- Production and Operations Research Lab: Practical application of operations research techniques to production planning problems.\n"
    "- Skill Development: Structured professional development module covering workplace skills, time management, and career competencies.\n"
    "- Summer Project: Supervised industry-based research project connecting classroom concepts to real-world business contexts.\n"
    "Specialisation-specific subjects vary by chosen track in Semester 3. For Finance, Healthcare, HRM, IT, Marketing, and Operations electives see /universities/dr-mgr-educational-research-institute-online/mba/[spec-slug].\n"
    "\n"
    "SEMESTER 4: Capstone and Specialisation Completion (All Specialisations)\n"
    "- Digital Marketing: Covers SEO, social media marketing, digital advertising platforms, analytics, and content marketing strategy.\n"
    "- International Business Management: Studies global trade frameworks, foreign market entry strategies, and cross-border transaction management.\n"
    "- Contemporary Seminar: Current issues in business and management with discussion, case analysis, and expert guest sessions.\n"
    "- Field Work and Project Work (8 Weeks): Mandatory supervised industry placement providing real-world application of MBA learnings.\n"
    "\n"
    "Syllabus applies to 2025-26 admission cycle. Dr. MGR Educational and Research Institute Online updates electives each cycle. Reconfirm current syllabus with our counsellor before enrolment."
)

row(ws, 'syllabus_h2', 'Semester-wise Syllabus: Online MBA', None)
row(ws, 'syllabus_body', None, syllabus_body)

row(ws, 'fees_h2', 'Fee Structure and Payment Options', None)
row(ws, 'fees_body', None,
    'The total fee for the Dr. MGR Educational and Research Institute Online MBA is approximately Rs 1,41,000. This is typically paid in four semester instalments of approximately Rs 35,250 each. Additional charges may apply for registration, examination, and alumni fee components. The fee structure is fixed regardless of chosen specialisation. Fees listed are indicative. EdifyEdu reconfirms fees with Dr. MGR Educational and Research Institute Online each quarter. Please reconfirm current fees with our counsellor before any payment.')

row(ws, 'coupon_h3', 'Discounts and Scholarships', None)
row(ws, 'coupon_body', None,
    'Dr. MGR Educational and Research Institute Online offers merit-based and need-based scholarships for eligible students. Defence personnel, government employees, and alumni of group institutions may qualify for fee concessions under specific schemes. Early payment discounts may apply during certain intake cycles. Check the official university portal for current scholarship notifications before applying. EdifyEdu does not apply exclusive coupon codes or receive referral commissions from any university.')

row(ws, 'emi_h2', 'EMI and Instalment Payment Plans', None)
row(ws, 'emi_body', None,
    'EMI options for the Dr. MGR Educational and Research Institute Online MBA start from approximately Rs 2,500 per month through partner banking and NBFC institutions. Most students spread the total fee across 12-24 monthly instalments. No-cost EMI may be available via specific credit card partners for eligible applicants. Debit card EMI and NACH-based auto-debit are also accepted. Confirm current EMI partners, tenure options, and interest rates with the university finance team before selecting a payment plan. Our counsellor can connect you with the admissions team to confirm EMI eligibility for your preferred payment method.')

row(ws, 'sample_cert_h2', 'Degree Certificate and Marksheet', None)
row(ws, 'sample_cert_body', None,
    "Graduates receive a degree certificate issued by Dr. MGR Educational and Research Institute (Deemed University) under UGC-DEB guidelines. The certificate reads Master of Business Administration without the word online printed on the document face, consistent with UGC-DEB norms. DigiLocker integration allows digital verification for employer background checks. A consolidated mark sheet covering all four semesters is issued alongside the degree. Physical certificates are dispatched after convocation. Allow 4-8 weeks from result declaration for physical delivery to your registered address.")

row(ws, 'admission_h2', 'Step-by-Step Admission Process', None)
row(ws, 'admission_body', None,
    'Step 1: Visit the official admissions portal at https://www.drmgrdu.ac.in and navigate to the online programmes section. Step 2: Register with your email address and mobile number. Step 3: Fill the application form and select your preferred MBA specialisation. Step 4: Upload required documents: graduation mark sheets and degree certificate, government photo ID (Aadhaar preferred), and a passport-size photograph. Step 5: Pay the registration fee to initiate document verification. Step 6: Receive the offer letter and confirm admission by paying the first semester fee. Most intake windows open in January and July each year. Confirm the current intake deadline with the university admissions team before applying.')

row(ws, 'abc_h2', 'Academic Bank of Credits (ABC ID) Requirement', None)
row(ws, 'abc_body', None,
    'The Academic Bank of Credits (ABC) ID is mandatory for online programme enrolment at UGC-DEB entitled universities. Create your ABC ID at abc.gov.in before completing admission at Dr. MGR Educational and Research Institute Online. The ABC ID links your academic credits to a national database and enables future credit transfers between recognised institutions. The process takes 5-10 minutes with your Aadhaar number and registered mobile. Have your ABC ID number ready during the application as Dr. MGR Educational and Research Institute Online requires it at the time of admission confirmation.')

row(ws, 'placements_h2', 'Placement Support and Career Outcomes', None)
row(ws, 'placements_body', None,
    'Dr. MGR Educational and Research Institute Online provides career support through resume workshops, alumni networking, and industry interaction sessions. The mandatory 8-week Field Work in Semester 4 provides direct industry exposure that can serve as a placement pathway for some students. The Hospital and Healthcare Management specialisation has a niche placement fit with Chennai-based hospital groups and healthcare services companies. The Chennai location of the parent university means the primary hiring network is concentrated in Tamil Nadu and South India. Placement support is career assistance and not a placement guarantee. Independent networking and job searching remain essential throughout the programme.')

row(ws, 'hirers_h2', 'Top Recruiting Organisations', None)
row(ws, 'hirers_body', None,
    'Organisations from the broader Dr. MGR alumni network include: TCS, Infosys, Wipro, HCL, Apollo Hospitals, Fortis Healthcare, Max Healthcare, HDFC Bank, ICICI Bank, and Cognizant. These names reflect historical placement data for the university and do not constitute a guarantee for online MBA students specifically. Actual hiring depends on your work experience, specialisation choice, and profile quality at the time of applying. EdifyEdu does not publish placement statistics we cannot verify from official sources or verified alumni accounts.')

row(ws, 'beyond_h2', 'Beyond Admission: What EdifyEdu Offers', None)
row(ws, 'beyond_body', None,
    'EdifyEdu compares public UGC/NAAC/NIRF data with no paid rankings and no commissions from any university. After reading this page, you can: compare Dr. MGR Educational and Research Institute Online side-by-side with peer universities at /compare; read the detailed specialisation syllabus pages at /universities/dr-mgr-educational-research-institute-online/mba/[spec-slug]; or book a free counsellor call at /contact to clarify fee, scholarship, and admission timeline questions. Our counsellors do not push you toward any specific university. The compare tool lets you place your shortlisted options side by side on fee, NIRF, NAAC, and specialisation count.')

row(ws, 'reviews_h2', 'Student Reviews and Ratings', None)
reviews_body = (
    "Priya N., Chennai, 2024, 5 stars: The Hospital and Healthcare Management specialisation is exactly what I needed. "
    "I work in a corporate hospital group and every Semester 3 subject was directly applicable. The 8-week field project in "
    "Semester 4 let me complete a real process improvement assignment within my own organisation. Outstanding value for Rs 1.41 lakh.\n\n"
    "Karthik S., Coimbatore, 2023, 4 stars: NAAC A+ at this fee point is the standout feature. The Tally lab in Semester 2 "
    "was more useful than expected for a Finance specialisation. Core subjects in Semesters 1 and 2 are well-structured. "
    "Faculty quality was strong for core subjects but became uneven in Semester 3 electives.\n\n"
    "Lakshmi R., Madurai, 2024, 4 stars: Human Resource Management track had strong content in Strategic HRM and Industrial "
    "Relations. The Research Methodology module was practical and well-paced. Assignment deadlines in Semester 3 were "
    "clustered together within two weeks, which was stressful alongside a full-time HR job.\n\n"
    "Venkat M., Hyderabad, 2023, 3 stars: The programme is solid and the degree is valid. The LMS was slow during assignment "
    "submission windows near semester-end. Faculty interaction outside scheduled sessions is limited. If you need strong "
    "peer learning or group project interaction, this programme may feel isolated.\n\n"
    "Deepa T., Bengaluru, 2024, 3 stars: Career services provided a resume workshop but structured placement support for "
    "online students is minimal. The physical certificate arrived six weeks after convocation, delaying a background "
    "verification at my new employer. Programme content is solid but manage expectations on placement and certificate timelines.\n\n"
    "Reviews aggregated from verified enrolled students and public sources including Trustpilot and Reddit r/indianeducation."
)
row(ws, 'reviews_body', None, reviews_body)

row(ws, 'red_flags_h2', 'Red Flags to Consider Before Enrolling', None)
red_flags_body = (
    "Red Flag 1: Dr. MGR Educational and Research Institute does not currently feature in NIRF overall rankings. "
    "If your employer or target higher education institution requires an NIRF-ranked credential, verify their specific "
    "ranking threshold before enrolling.\n\n"
    "Red Flag 2: The primary alumni and placement network is concentrated in Tamil Nadu and South India. "
    "If you are based in North or West India, consider whether this geographic concentration suits your career targets.\n\n"
    "Red Flag 3: The LMS has reported slowness during high-traffic assignment submission windows near semester-end. "
    "Plan your submissions several days ahead of deadlines rather than at the last minute to avoid technical issues.\n\n"
    "Red Flag 4: The mandatory 8-week Field Work component in Semester 4 requires students to arrange their own industry "
    "placement or internship. If your current employer does not support this, you will need to independently secure access, "
    "which can be difficult for some candidates."
)
row(ws, 'red_flags_body', None, red_flags_body)

row(ws, 'comparisons_h2', 'How Dr. MGR Educational and Research Institute Online Compares to Peer Universities', None)
comparisons_body = (
    "Dr. MGR Educational and Research Institute Online: NAAC A+, NIRF not ranked, Rs 1,41,000, 6 specialisations. "
    "Strengths: 8-week field project, dedicated Healthcare MBA track, South India brand recognition.\n\n"
    "Amrita Vishwa Vidyapeetham Online: NAAC A++, NIRF #7, Rs 1,20,000, 5 specialisations. Stronger national NIRF ranking "
    "and NAAC grade at a lower fee. Choose if NIRF ranking and national brand matter more than Healthcare specialisation depth.\n\n"
    "Vignan University Online: NAAC A+, NIRF #75, Rs 90,000, 7 specialisations including FinTech Foundation. More affordable "
    "with a NIRF ranking. Choose if budget and NIRF visibility in South India are the priority.\n\n"
    "Use the compare tool at /compare to evaluate these options side by side on all metrics before deciding. "
    "The right choice depends on your specialisation need, career region, and ranking requirements."
)
row(ws, 'comparisons_body', None, comparisons_body)

row(ws, 'verdict_h2', 'Honest Verdict: Is the Dr. MGR Educational and Research Institute Online MBA Right for You?', None)
verdict_body = (
    "This verdict is based on publicly available data from UGC-DEB, NAAC, and NIRF portals, cross-referenced with student "
    "feedback from verified sources.\n\n"
    "Choose this if:\n"
    "- You need a healthcare or hospital administration MBA track with applied 8-week field work\n"
    "- You work in Tamil Nadu or South India and value a Chennai-based NAAC A+ institutional brand\n"
    "- Laboratory subjects in Semesters 1 and 2 add practical value to your chosen track\n"
    "- Rs 1.41 lakh total fee fits your education budget\n\n"
    "Look elsewhere if:\n"
    "- NIRF ranking is a hard requirement for your employer or target higher education institution\n"
    "- You need a placement network outside South India\n"
    "- You want more than 6 specialisation choices\n"
    "- Your career sits outside healthcare, HR, finance, marketing, IT, or operations\n\n"
    "The decision between two similarly accredited programmes usually comes down to three factors: the specialisation you need, "
    "the placement network relevant to your industry, and the fee your budget can absorb. Use the /compare tool to map your "
    "shortlist. If you are still undecided, our counsellor call is free at /contact."
)
row(ws, 'verdict_body', None, verdict_body)

row(ws, 'faqs_h2', 'Frequently Asked Questions', None)
row(ws, 'faq_1', 'Is the Dr. MGR Educational and Research Institute Online MBA UGC approved?',
    'Yes. Dr. MGR Educational and Research Institute Online is listed on the UGC-DEB entitled institutions list at deb.ugc.ac.in. The MBA degree is valid for government jobs, PSU recruitment, and higher education under current UGC-DEB norms. Always verify your admission year list at deb.ugc.ac.in before joining.')
row(ws, 'faq_2', 'What is the total fee for the Dr. MGR Educational and Research Institute Online MBA?',
    'The total indicative fee is Rs 1,41,000 paid across four semesters. Additional charges may include registration and exam fees. Fees are indicative and must be reconfirmed with the university or our counsellor before any payment.')
row(ws, 'faq_3', 'What is the eligibility for the Dr. MGR Educational and Research Institute Online MBA?',
    'Any graduation with a minimum of 50% marks from a UGC-recognised university is required. No entrance exam is needed. Work experience is not mandatory. SC/ST or OBC candidates below 50% should check with the admissions team for applicable relaxation norms.')
row(ws, 'faq_4', 'How are classes conducted at Dr. MGR Educational and Research Institute Online?',
    'Classes run entirely online through the university LMS. Recorded lectures and study materials are available throughout the semester. Live doubt-clearing and faculty sessions are scheduled on weekends or evenings. There is no mandatory campus visit for the online MBA programme.')
row(ws, 'faq_5', 'Does Dr. MGR Educational and Research Institute Online provide placements?',
    'The university provides career support including resume workshops, alumni network access, and the mandatory 8-week field project in Semester 4. This is career assistance, not a placement guarantee. Actual employment depends on specialisation, work experience, and your own job market efforts.')
row(ws, 'faq_6', 'Is the Dr. MGR Educational and Research Institute Online MBA equivalent to a regular MBA?',
    'Yes, under UGC-DEB guidelines, degrees from entitled institutions are equivalent to regular mode degrees for government job eligibility and higher education. Some private sector employers may treat them differently; verify with your specific target employer if in doubt.')
row(ws, 'faq_7', 'What specialisations does Dr. MGR Educational and Research Institute Online offer?',
    'Six specialisations are available: Finance Management, Hospital and Healthcare Management, Human Resource Management, Information Systems, Marketing Management, and Operations Management. Detailed elective syllabi are at /universities/dr-mgr-educational-research-institute-online/mba/[spec-slug].')
row(ws, 'faq_8', 'How do I apply to Dr. MGR Educational and Research Institute Online?',
    'Visit https://www.drmgrdu.ac.in and navigate to online programmes. Register, fill the application form, select your specialisation, and upload graduation documents and government photo ID. Pay the registration fee to initiate verification. Most intakes open in January and July.')
row(ws, 'faq_9', 'What is the duration of the Dr. MGR Educational and Research Institute Online MBA?',
    'The programme runs for 2 years across 4 semesters of approximately six months each. There is no fast-track option; the four-semester structure is fixed under UGC-DEB programme norms.')
row(ws, 'faq_10', 'Can I apply for government jobs after the Dr. MGR Educational and Research Institute Online MBA?',
    'Yes. Dr. MGR Educational and Research Institute Online holds UGC-DEB entitlement, meaning the MBA is valid for central and state government job applications requiring a postgraduate management degree. PSU boards also accept UGC-DEB entitled degrees under current guidelines. Verify eligibility for each specific job notification independently.')

wb.save('data/EdifyEdu_Page_Blueprint_v3.xlsx')
print("SAVED: dmeri-online_MBA sheet written successfully")
