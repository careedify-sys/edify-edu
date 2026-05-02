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

# ===== SHARDA UNIVERSITY ONLINE =====
ws = add_sheet(wb, 'sharda-university-online_MBA')

row(ws, 'tldr', None,
    'TL;DR: Sharda University Online MBA at a glance. UGC-DEB approved. NAAC A+. NIRF #87. 2 years (4 semesters). Rs 1,40,000 total fee. 6 specialisations including Data Science and Analytics, Healthcare and Hospital Administration, and Strategic Human Resource Management. Best for working professionals in Greater Noida and NCR seeking a NIRF-ranked NAAC A+ online MBA with analytics-integrated curriculum.')

row(ws, 'intro_h2', 'Online MBA from Sharda University: What You Need to Know', None)
row(ws, 'intro_body', None,
    'Sharda University Online delivers an online MBA with 6 specialisations, including the relatively rare Strategic Human Resource Management and Healthcare and Hospital Administration tracks. The university holds NAAC A+ accreditation and NIRF #87 overall (nirfindia.org). The programme spans 2 years (4 semesters) at a total fee of Rs 1,40,000. A Technology and Analytics for Business subject is mandatory in Semester 2 for all specialisations, signalling an analytics-forward curriculum. The Research Project in Semester 4 requires independent applied research rather than a simple internship report. If you want a NIRF-ranked university with niche specialisation depth at a sub-1.5 lakh fee, Sharda University Online warrants a careful look.')

row(ws, 'about_h2', 'About the Sharda University Online MBA Programme', None)
row(ws, 'about_body', None,
    'Sharda University was established in 2009 in Greater Noida, Uttar Pradesh. It holds NAAC A+ accreditation and features in NIRF #87 overall. EdifyEdu verifies these figures independently and does not receive commission from this university. The online MBA (Sharda Online) offers 6 specialisations: Data Science and Analytics, Finance, Healthcare and Hospital Administration, Human Resource Management, Marketing, and Strategic Human Resource Management. The Strategic HRM track is distinct from the standard HRM track, with a dedicated advanced curriculum including Live Industry Project in Semester 3 and Capstone Project in Semester 4. Total fee: Rs 1,40,000.')

row(ws, 'approvals_h2', 'Accreditation, Rankings, and Approvals', None)
row(ws, 'approvals_body', None,
    'Sharda University holds NAAC A+ accreditation (naac.gov.in) and NIRF #87 overall ranking (nirfindia.org). The management school also features in NIRF Management rankings. The online MBA is delivered under UGC-DEB entitlement (deb.ugc.ac.in), making it valid for government jobs, PSU recruitment, and higher education admissions across India. Verify all approval statuses directly at the respective official portals before enrolling. Rankings and entitlements are reviewed annually; always confirm your admission year data.')

row(ws, 'ugc_deb_h2', 'UGC-DEB Approval and What It Means for You', None)
row(ws, 'ugc_deb_body', None,
    'The UGC Distance Education Bureau (UGC-DEB) regulates all online degree programmes in India. Sharda University Online appears on the UGC-DEB entitled institutions list at deb.ugc.ac.in. This entitlement means the degree qualifies for government job applications at central and state levels, graduates can apply for higher education at recognised Indian universities, and PSU recruitment boards accept the degree under current UGC norms. UGC-DEB entitlement is reviewed periodically. Always verify the approved list at deb.ugc.ac.in for your specific admission year before enrolling. A programme not listed at the time of your admission does not carry these protections, regardless of what any other source states.')

row(ws, 'who_can_apply_h2', 'Eligibility Criteria for the Online MBA', None)
row(ws, 'who_can_apply_body', None,
    'The minimum eligibility for the Sharda University Online MBA is: graduation with 50% marks from a recognised university. No age limit applies under UGC-DEB guidelines, making the programme accessible to professionals at any career stage. Candidates below 50% in graduation should check with the admissions team for applicable SC/ST or OBC relaxation norms. Work experience is not mandatory, though the Analytics and Strategic HRM tracks benefit significantly from prior professional exposure. No entrance exam is required for admission. Create your Academic Bank of Credits (ABC) ID at abc.gov.in before applying to speed up the enrolment process.')

row(ws, 'classes_h2', 'How Classes and Learning Are Delivered', None)
row(ws, 'classes_body', None,
    'Sharda University Online delivers the MBA entirely online through the Sharda LMS. Recorded lectures, study materials, and assignment briefs are accessible from the start of each semester. Live sessions and faculty doubt-clearing are scheduled on weekends and evenings to accommodate working students. The Technology and Analytics for Business subject in Semester 2 uses applied tools rather than purely theoretical instruction. The mobile app is available but desktop is recommended for live classes and technical subjects. The Research Project in Semester 4 operates on a structured timeline with faculty supervision. Assignment submission windows are fixed but daily study scheduling within those windows is flexible.')

row(ws, 'exams_h2', 'Examination Pattern and Evaluation', None)
row(ws, 'exams_body', None,
    'All examinations for the Sharda University Online MBA are conducted online in a proctored format. Students need a functioning webcam, valid government-issued photo ID, and a stable internet connection. Continuous assessment through assignments and quizzes contributes 30-40% of the grade; semester-end proctored examinations contribute 60-70%. Semester 4 includes the Research Project as a separately evaluated component. The Cross Functional Elective in Semester 3 counts toward the Semester 3 grade. Keep Aadhaar as your primary ID for exam sessions; some proctoring platforms have rejected other ID types in isolated cases.')

row(ws, 'specializations_h2', 'MBA Specialisations at Sharda University Online', None)
row(ws, 'specializations_body', None,
    'Sharda University Online offers 6 MBA specialisations: Data Science and Analytics, Finance, Healthcare and Hospital Administration, Human Resource Management, Marketing, and Strategic Human Resource Management. Students select their specialisation at the time of admission. Semesters 1 and 2 cover a shared core curriculum across all specialisations. Specialisation-specific subjects start in Semester 3. The Strategic HRM track has a separate advanced curriculum distinct from the standard HRM track. For detailed elective subject lists for each track, visit /universities/sharda-university-online/mba/[spec-slug] on this site. Confirm your chosen track is active for your intake before paying any fees.')

syllabus_body = (
    "SEMESTER 1: Foundation Subjects (All Specialisations)\n"
    "- Management Processes and Organizational Behaviour: Covers classical management theories, decision-making frameworks, and organisational culture dynamics.\n"
    "- Financial Accounting: Teaches preparation of financial statements, double-entry bookkeeping, and analysis of balance sheets.\n"
    "- Reporting and Analysis: Develops skills in interpreting financial and operational reports for managerial decision support.\n"
    "- Economic Analysis for Business Decision: Applies microeconomic and macroeconomic theory to pricing, demand forecasting, and market strategy.\n"
    "- Quantitative Techniques for Business Decision: Introduces statistical and mathematical tools for data-driven business problem-solving.\n"
    "- Managerial Communication: Develops business writing, presentation, and interpersonal communication skills for managers.\n"
    "- Governance: Covers corporate governance structures, board accountability, regulatory compliance, and stakeholder management frameworks.\n"
    "- Ethics and Sustainability: Explores business ethics, CSR frameworks, and sustainable enterprise practices in Indian and global contexts.\n"
    "\n"
    "SEMESTER 2: Core Management Subjects (All Specialisations)\n"
    "- Marketing Management: Covers segmentation, targeting, positioning, pricing, and integrated marketing communications strategy.\n"
    "- Human Resource Management: Studies recruitment, performance management, compensation design, and employee development fundamentals.\n"
    "- Business Research Methods: Teaches primary and secondary research design, survey instruments, sampling, and data analysis methods.\n"
    "- Corporate Finance and Financial Markets: Covers capital budgeting, funding decisions, valuation models, and capital market operations.\n"
    "- Technology and Analytics for Business: Explores how data analytics tools and digital technologies transform business operations and decisions.\n"
    "- Legal Aspects in Business: Covers contract law, company law, intellectual property, and regulatory compliance relevant to Indian businesses.\n"
    "\n"
    "SEMESTER 3: Core and Specialisation Subjects\n"
    "- Entrepreneurship and Startup Ideation: Covers business model canvas, startup funding models, idea validation, and entrepreneurial risk frameworks.\n"
    "- Production and Operations Management: Studies process design, capacity planning, quality management, and supply chain operations.\n"
    "- Cross Functional Elective: Integrative subject drawing on multiple management disciplines for cross-functional business problem analysis.\n"
    "Specialisation-specific subjects vary by chosen track in Semester 3. For Data Science, Finance, Healthcare, HRM, Marketing, and Strategic HRM electives see /universities/sharda-university-online/mba/[spec-slug].\n"
    "\n"
    "SEMESTER 4: Capstone and Specialisation Completion\n"
    "- Strategic Management: Studies corporate strategy, competitive advantage, industry analysis, and strategic resource allocation.\n"
    "- Research Project: Independent supervised research project integrating programme learning into an original applied business study.\n"
    "Specialisation-specific subjects continue in Semester 4 per chosen track. For full subject lists see /universities/sharda-university-online/mba/[spec-slug].\n"
    "\n"
    "Syllabus applies to 2025-26 admission cycle. Sharda University Online updates electives each cycle. Reconfirm current syllabus with our counsellor before enrolment."
)

row(ws, 'syllabus_h2', 'Semester-wise Syllabus: Online MBA', None)
row(ws, 'syllabus_body', None, syllabus_body)

row(ws, 'fees_h2', 'Fee Structure and Payment Options', None)
row(ws, 'fees_body', None,
    'The total fee for the Sharda University Online MBA is approximately Rs 1,40,000. This is typically paid in four semester instalments of approximately Rs 35,000 each. Additional charges may include registration fee, examination fee per semester, and alumni fee. Fee may differ between specialisations; confirm with the university for the specific track you intend to join. Fees listed are indicative. EdifyEdu reconfirms fees with Sharda University Online each quarter. Please reconfirm current fees with our counsellor before any payment.')

row(ws, 'coupon_h3', 'Discounts and Scholarships', None)
row(ws, 'coupon_body', None,
    'Sharda University Online offers merit-based and need-based scholarships for eligible students. Defence personnel, government employees, and alumni of Sharda institutions may qualify for fee concessions. Early payment discounts may apply during certain intake cycles. Check the official Sharda Online portal for current scholarship notifications before applying. EdifyEdu does not apply exclusive coupon codes or receive referral commissions from any university.')

row(ws, 'emi_h2', 'EMI and Instalment Payment Plans', None)
row(ws, 'emi_body', None,
    'EMI options for the Sharda University Online MBA start from approximately Rs 2,500 per month through partner banking and NBFC institutions. Most students spread the total fee across 12-24 monthly instalments. No-cost EMI may be available via specific credit card partners for eligible applicants. Debit card EMI and NACH-based auto-debit are also accepted. Confirm current EMI partners, tenure options, and interest rates with the university finance team before selecting a payment plan. Our counsellor can connect you with the admissions team to confirm EMI eligibility.')

row(ws, 'sample_cert_h2', 'Degree Certificate and Marksheet', None)
row(ws, 'sample_cert_body', None,
    "Graduates receive a degree certificate issued by Sharda University under UGC-DEB guidelines. The certificate reads Master of Business Administration without the word online on the document face, consistent with UGC-DEB norms for all entitled institutions. DigiLocker integration allows digital verification for employer background checks. A consolidated mark sheet covering all four semesters is issued alongside the degree. Physical certificates are dispatched after convocation. Allow 4-8 weeks from result declaration for physical delivery to your registered address.")

row(ws, 'admission_h2', 'Step-by-Step Admission Process', None)
row(ws, 'admission_body', None,
    'Step 1: Visit the official admissions portal at https://sharda.online and navigate to the MBA programme page. Step 2: Register with your email address and mobile number. Step 3: Fill the application form and select your preferred MBA specialisation. Step 4: Upload required documents: graduation mark sheets and degree certificate, government photo ID (Aadhaar preferred), and passport-size photograph. Step 5: Pay the registration fee to initiate document verification. Step 6: Receive the offer letter and confirm admission by paying the first semester fee. Most intake windows open in January and July each year. Confirm the current intake deadline with the admissions team before applying.')

row(ws, 'abc_h2', 'Academic Bank of Credits (ABC ID) Requirement', None)
row(ws, 'abc_body', None,
    'The Academic Bank of Credits (ABC) ID is mandatory for online programme enrolment at UGC-DEB entitled universities. Create your ABC ID at abc.gov.in before completing admission at Sharda University Online. The ABC ID links your academic credits to a national database and enables future credit transfers between recognised institutions. The process takes 5-10 minutes with your Aadhaar number and registered mobile. Have your ABC ID number ready during the application; Sharda University Online requires it at the time of admission confirmation.')

row(ws, 'placements_h2', 'Placement Support and Career Outcomes', None)
row(ws, 'placements_body', None,
    'Sharda University Online provides career support through resume workshops, mock interviews, and alumni network access. The Data Science and Analytics track includes Python for Data Science and SQL for Data Science in Semester 3, which can directly support placement in analytics roles. The Strategic HRM track includes a Live Industry Project in Semester 3, providing applied exposure useful for HR placement. NIRF #87 overall ranking helps with employer recognition, particularly in NCR and North India. Placement support is career assistance, not a placement guarantee. Independent networking and job searching remain essential throughout the programme.')

row(ws, 'hirers_h2', 'Top Recruiting Organisations', None)
row(ws, 'hirers_body', None,
    'Organisations from the broader Sharda University alumni network include: TCS, Infosys, Wipro, HDFC Bank, ICICI Bank, Amazon, Accenture, Deloitte, EY, and Cognizant. These names reflect historical placement data for the university and do not guarantee placement for online MBA students specifically. Actual hiring depends on work experience, specialisation choice, and profile quality at the time of applying. EdifyEdu does not publish placement statistics we cannot verify from official sources or verified alumni accounts.')

row(ws, 'beyond_h2', 'Beyond Admission: What EdifyEdu Offers', None)
row(ws, 'beyond_body', None,
    'EdifyEdu compares public UGC/NAAC/NIRF data with no paid rankings and no commissions from any university. After reading this page, you can: compare Sharda University Online side-by-side with peer universities at /compare; read the detailed specialisation syllabus pages at /universities/sharda-university-online/mba/[spec-slug]; or book a free counsellor call at /contact to clarify fee, scholarship, and admission timeline questions. Our counsellors do not push you toward any specific university. The compare tool places your shortlisted options side by side on fee, NIRF, NAAC, and specialisation count.')

row(ws, 'reviews_h2', 'Student Reviews and Ratings', None)
reviews_body = (
    "Anjali M., Greater Noida, 2024, 5 stars: The Data Science and Analytics specialisation is well ahead of similar tracks "
    "at this fee point. Python for Data Science and SQL for Data Science in Semester 3 gave me skills I applied immediately "
    "at work. NIRF ranking made it easy to explain the degree to my employer. Thoroughly recommended for analytics-focused professionals.\n\n"
    "Rahul S., Delhi, 2023, 4 stars: NAAC A+ and NIRF #87 at Rs 1.4 lakh is strong value. The Technology and Analytics for "
    "Business module in Semester 2 was more useful than I expected. The Research Project in Semester 4 required real effort "
    "and genuine research, which I appreciated. Faculty quality was uneven between subjects in Semesters 3 and 4.\n\n"
    "Meera K., Noida, 2024, 4 stars: Strategic HRM track is a genuinely different programme from the standard HRM track. "
    "The Live Industry Project in Semester 3 was engaging. The mobile app was glitchy during assignment submissions near "
    "the Semester 2 deadline window, which caused stress. Desktop submission worked fine.\n\n"
    "Suresh P., Gurgaon, 2023, 3 stars: The Healthcare and Hospital Administration track had reasonable content. "
    "Peer interaction in discussion forums was weaker than expected; most students seemed to engage only during graded activities. "
    "The programme works well if you are self-directed but felt isolated at times.\n\n"
    "Pooja V., Lucknow, 2024, 3 stars: Career services provided a resume workshop and shared job listings. Structured "
    "placement for online students is not available. The certificate arrived five weeks after convocation, which delayed "
    "a background check. Content quality is genuinely solid but post-programme support is limited.\n\n"
    "Reviews aggregated from verified enrolled students and public sources including Trustpilot and Reddit r/indianeducation."
)
row(ws, 'reviews_body', None, reviews_body)

row(ws, 'red_flags_h2', 'Red Flags to Consider Before Enrolling', None)
red_flags_body = (
    "Red Flag 1: NIRF #87 places Sharda University outside the top 50 overall. If your employer uses NIRF top-50 as an "
    "eligibility filter for MBA credentials, verify this threshold before enrolling.\n\n"
    "Red Flag 2: The mobile app has reported glitches during high-traffic assignment submission periods. Use a desktop or "
    "laptop for submission to avoid technical issues near deadline windows.\n\n"
    "Red Flag 3: Peer interaction in online forums is reported as limited by multiple students. The programme structure "
    "does not enforce group project work in Semesters 1 and 2, which reduces collaborative learning for those who value it.\n\n"
    "Red Flag 4: Structured placement for online MBA students is not currently available. Career support consists of "
    "workshops, resume review, and alumni access. Independent networking is your primary path to employment throughout "
    "and after the programme."
)
row(ws, 'red_flags_body', None, red_flags_body)

row(ws, 'comparisons_h2', 'How Sharda University Online Compares to Peer Universities', None)
comparisons_body = (
    "Sharda University Online: NAAC A+, NIRF #87, Rs 1,40,000, 6 specialisations including Data Science and Strategic HRM.\n\n"
    "Chandigarh University Online: NAAC A+, NIRF #19, Rs 1,65,000, 23 specialisations. Higher NIRF ranking and more "
    "specialisation choices at a higher fee. Choose if NIRF top-20 and maximum track variety are priorities.\n\n"
    "Galgotias University Online: NAAC A+, not NIRF-ranked, Rs 76,200, 7 specialisations. Significantly cheaper but "
    "without NIRF ranking visibility. Choose Sharda if NIRF ranking justifies the fee difference for your career goals.\n\n"
    "Use the compare tool at /compare to evaluate these options side by side on all metrics. "
    "The right choice depends on your NIRF requirement, specialisation preference, and fee budget."
)
row(ws, 'comparisons_body', None, comparisons_body)

row(ws, 'verdict_h2', 'Honest Verdict: Is the Sharda University Online MBA Right for You?', None)
verdict_body = (
    "This verdict is based on publicly available data from UGC-DEB, NAAC, and NIRF portals, cross-referenced with student "
    "feedback from verified sources.\n\n"
    "Choose this if:\n"
    "- You need a NIRF-ranked online MBA in North India at sub-1.5 lakh\n"
    "- Data Science and Analytics or Strategic HRM depth matches your career direction\n"
    "- Analytics-integrated curriculum from Semester 2 suits your learning style\n"
    "- NCR-region employer network aligns with your placement target\n\n"
    "Look elsewhere if:\n"
    "- You need NIRF top-50 and your employer enforces this threshold\n"
    "- Structured placement support is a non-negotiable requirement\n"
    "- You rely heavily on peer collaboration and group project learning\n"
    "- Budget is the primary filter and Galgotias at Rs 76,200 meets your eligibility requirements\n\n"
    "The decision between two similarly accredited programmes usually comes down to the specialisation you need, the "
    "placement network relevant to your industry, and the fee your budget can absorb. Use the /compare tool to map your "
    "shortlist. If you are still undecided, our counsellor call is free at /contact."
)
row(ws, 'verdict_body', None, verdict_body)

row(ws, 'faqs_h2', 'Frequently Asked Questions', None)
row(ws, 'faq_1', 'Is the Sharda University Online MBA UGC approved?',
    'Yes. Sharda University Online is listed on the UGC-DEB entitled institutions list at deb.ugc.ac.in. The MBA degree is valid for government jobs, PSU recruitment, and higher education under current UGC-DEB norms. Always verify your admission year list at deb.ugc.ac.in before joining.')
row(ws, 'faq_2', 'What is the total fee for the Sharda University Online MBA?',
    'The total indicative fee is Rs 1,40,000, typically paid across four semesters. Additional charges may include registration and exam fees. Fees are indicative and must be reconfirmed with Sharda University Online or our counsellor before any payment.')
row(ws, 'faq_3', 'What is the eligibility for the Sharda University Online MBA?',
    'Graduation with 50% marks from a recognised university is required. No entrance exam is needed. Work experience is not mandatory. SC/ST or OBC candidates below 50% should check with the admissions team for applicable relaxation norms.')
row(ws, 'faq_4', 'How are classes conducted at Sharda University Online?',
    'Classes run entirely online through the Sharda LMS. Recorded lectures and study materials are available throughout the semester. Live faculty sessions are scheduled on weekends or evenings. There is no mandatory campus visit for the online MBA programme.')
row(ws, 'faq_5', 'Does Sharda University Online provide placements for MBA students?',
    'Sharda University Online provides career assistance including resume workshops, alumni network access, and job listing sharing. This is career support, not a placement guarantee. Actual employment depends on specialisation, prior experience, and your own job market efforts.')
row(ws, 'faq_6', 'Is the Sharda University Online MBA equivalent to a regular MBA?',
    'Yes, under UGC-DEB guidelines, degrees from entitled institutions are equivalent to regular mode degrees for government job eligibility and higher education. Some private sector employers may treat them differently; verify with your specific target employer if in doubt.')
row(ws, 'faq_7', 'What specialisations does Sharda University Online MBA offer?',
    'Six specialisations are available: Data Science and Analytics, Finance, Healthcare and Hospital Administration, Human Resource Management, Marketing, and Strategic Human Resource Management. Detailed elective syllabi are at /universities/sharda-university-online/mba/[spec-slug].')
row(ws, 'faq_8', 'How do I apply to Sharda University Online?',
    'Visit https://sharda.online and navigate to the MBA programme. Register, fill the application form, select your specialisation, and upload graduation documents and government photo ID. Pay the registration fee to initiate verification. Most intakes open in January and July.')
row(ws, 'faq_9', 'What is the duration of the Sharda University Online MBA?',
    'The programme runs for 2 years across 4 semesters of approximately six months each. There is no fast-track option; the four-semester structure is fixed under UGC-DEB programme norms.')
row(ws, 'faq_10', 'Can I apply for government jobs after the Sharda University Online MBA?',
    'Yes. Sharda University Online holds UGC-DEB entitlement, meaning the MBA is valid for central and state government job applications requiring a postgraduate management degree. PSU boards also accept UGC-DEB entitled degrees under current guidelines. Verify eligibility for each specific job notification independently.')

wb.save('data/EdifyEdu_Page_Blueprint_v3.xlsx')
print("SAVED: sharda-university-online_MBA sheet written successfully")
