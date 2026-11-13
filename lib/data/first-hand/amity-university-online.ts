// Rishi Kumar's first-hand content for Amity University Online, reviewed
// 13 November 2026. Copy is his, verbatim. See ./types.ts for the rules.
import type { FirstHandUniversity } from './types'

export const AMITY_FIRST_HAND: FirstHandUniversity = {
  universityId: 'amity-university-online',
  author: 'Rishi Kumar',
  reviewedOn: '2026-11-13',
  subject: 'Amity Online',
  shortName: 'Amity',
  parentName: 'Amity University Uttar Pradesh, Noida',

  whatItIs:
    'Amity University Online is the online arm of Amity University. You attend classes, study and take exams online, and you apply through Amity\'s own site, amityonline.com. Search results also show look-alike sites with similar names, so apply only through amityonline.com or through a counsellor you trust. In UGC-DEB\'s 2025-26 list, Amity\'s online programmes are listed under Amity University, Uttar Pradesh, the Noida university.',

  approvalsIntro:
    'If recognition in India and abroad is what you care about most, this is where Amity is strongest. Amity says it is the only university in India with WASC accreditation from the USA, and it also holds QAA accreditation from the UK. Both are held by the parent university, Amity University Uttar Pradesh. Here is exactly what it holds:',

  approvals: [
    { kind: 'ugc-deb' },
    { kind: 'naac' },
    { kind: 'nirf', body: 'NIRF 2025, Amity University Uttar Pradesh, Noida' },
    {
      kind: 'text',
      body: 'WSCUC (WASC Senior College and University Commission, USA)',
      holds: 'Accredited since 2016. Most recent commission action: 24 February 2023. Held by Amity University Uttar Pradesh.',
      source: 'WSCUC institution record, checked 13 Nov 2026',
    },
    {
      kind: 'text',
      body: 'QAA (UK), International Quality Review',
      holds: 'Reaccredited in 2023 after a review held from 25 April to 5 May 2023. QAA says this accreditation runs five years, subject to a mid-cycle review. Held by Amity University Uttar Pradesh.',
      source: 'QAA, 1 Sep 2023 announcement, checked 13 Nov 2026',
    },
    {
      kind: 'text',
      body: 'WES (Canada and USA)',
      holds: 'Amity says its degrees are recognised by World Education Services.',
      source: 'Amity\'s site, checked 13 Nov 2026',
    },
    {
      kind: 'text',
      body: 'QS',
      holds: 'Amity says its online MBA is the only Indian online MBA in QS\'s Asia Pacific Top 10 (2024).',
      source: 'Amity\'s site, checked 13 Nov 2026',
    },
  ],

  exams:
    'Exams are online and slot-based. Amity releases a date sheet, and you pick the date and the time slot that suit you: morning, afternoon or evening. That makes it easier to fit exams around a job.',

  studentToolsIntro: 'Here is what Amity offers its online students, as Amity describes it:',
  studentTools: [
    { name: 'Amigo app', text: 'Amity\'s learning app for live classes, recorded lectures, study material and deadlines, on your phone or laptop.' },
    { name: 'Prof. Ami', text: 'an AI tutor that Amity says is available 24/7 for study doubts.' },
    { name: 'beSocial', text: 'Amity\'s app for meeting other Amity Online students, joining clubs and taking part in online events.' },
    { name: 'Career discovery platform', text: 'Amity\'s AI-powered tool for resumes, mock interviews and job listings.' },
    { name: 'On-campus events', text: 'Amity says online students can join events such as orientation and Sangathan, its annual sports festival.' },
    { name: 'Printed books', text: 'Amity sends printed study material to your postal address.' },
    { name: 'Internships', text: 'Amity\'s site says it offers internship opportunities.' },
  ],

  worksWell: [
    { name: 'The brand.', text: 'People in India and abroad know the Amity name.' },
    { name: 'The flexible exam slots.', text: '' },
    { name: 'Its size.', text: 'Amity says it has more than 2,50,000 learners.' },
  ],

  complaintsHeading: 'What students complain about',
  complaints: [
    { name: 'Support.', text: 'This is the complaint I hear most. Around exams, when many students log in at the same time, things stop working, and when students call the support number, often nobody answers. Many of them end up calling us for help instead.' },
    { name: 'Lecture quality.', text: 'Several students have told me the lectures were not as good as what they were told at admission.' },
    { name: 'Class timings.', text: 'Some classes are scheduled on weekends, which does not suit everyone.' },
  ],

  whoShouldChoose: [
    'Working professionals who want a well-known degree that is recognised in India and abroad. If your goal is a promotion, a move to a better role, or a degree that holds up overseas, Amity\'s brand and international accreditations help.',
  ],

  whoShouldNot: [
    'Freshers doing an MBA for placements. Online programmes are built for working professionals who want a promotion or a job switch, not for placements. Unless something stops you from doing a regular MBA, do not pick an online one as a fresher.',
    'Anyone expecting what a regular MBA gives you. You get less exposure and less learning than in a full-time MBA. Nobody will chase you or teach you the way a campus does. What you get out of it depends on how much you put in.',
  ],

  admissionSteps: [
    'Enter your name, phone number and email on Amity\'s application page. This creates your application form.',
    'Fill in your basic details on the form.',
    'Pay the registration amount of {{registration}}. It is not an extra charge: it is adjusted in your programme fee.',
    'Upload your documents (list below).',
    'Pay the programme fee, one-time, yearly or by semester. Pay only through Amity\'s own payment link. Amity says payments made any other way are not valid.',
  ],

  documents: [
    'Class 10 marksheet',
    'Class 12 marksheet',
    'All semester marksheets from your graduation',
    'Your graduation degree. If you do not have it yet, a provisional degree certificate works.',
    'Aadhaar card',
    'Passport-size photograph',
    'Your signature on plain white paper',
    'Your postal address, because Amity sends printed books',
  ],
  documentsNote: 'DigiLocker copies are accepted.',

  specialisationAdvice:
    'No specialisation suits everyone. Pick the one that matches the industry you want to move into. If you are unsure, be careful with HR. I\'d call it the most overhyped specialisation right now: an HR degree on its own rarely gets anyone a job without strong skills, and AI is already causing problems in that area. Beyond HR, I don\'t think any specialisation is overhyped.',

  placements: {
    universitySays:
      '100% placement assistance, 450+ hiring partners (some Amity pages say 500+), and an AI-powered career discovery platform for resumes, mock interviews and job listings.',
    universitySaysCheckedOn: '2026-11-13',
    iHaveSeen:
      'Job openings do get shared with students. But I have not seen a single student I enrolled at Amity Online get placed through Amity\'s placement support. Online programmes are not built for placements, whatever any university or counsellor tells you. Use this MBA to grow in your current career, and run your own job search.',
    universityPageFaq:
      'Amity advertises 100% placement assistance and 450+ hiring partners. In my experience, job openings get shared, but I have not seen a student I enrolled get placed through it. [See the placements section on the MBA page.](/universities/amity-university-online/mba#placement)',
  },

  redFlags: [
    { title: 'Support is weakest when you need it most.', text: 'Around exams, many students log in at once, things stop working, and the support number often goes unanswered.' },
    { title: 'Lectures may not match what you were promised.', text: 'Several of my students said lecture quality was below what they were told at admission.' },
    { title: 'Placement support rarely leads to jobs.', text: 'I have not seen a student I enrolled get placed through it.' },
    { title: 'You pay extra for the brand.', text: 'Compare the teaching and support you will get against other universities before you pay.' },
  ],

  verdict: {
    oneLine: 'At Amity\'s MBA fee, you can get better value at other universities.',
    detail: 'You are mainly paying for the brand and the international accreditations. On teaching quality, support and return on your money, other universities give you more for the same fee.',
    worthItIf: ['You are a working professional who needs a well-known degree recognised in India and abroad, and you can drive your own learning.'],
    notWorthItIf: ['You want placements, you are a fresher, or you need strong teaching and support to get through the programme.'],
  },

  counsellorsWontTell:
    'Amity\'s admission counsellors won\'t talk about placements, lecture quality or support. They will push you to enrol fast, usually with a scholarship offer. Most people already know the Amity brand. What they don\'t hear before joining is how placements, classes and support actually work.',

  reviewLine: 'For the full fee breakdown and student reviews, read our [Amity online MBA review](/blog/amity-online-mba-review-2026).',

  faqsUniversityPage: [
    {
      q: 'How is student support at Amity Online?',
      a: 'Weak, in my experience. Around exams, when many students log in at once, things stop working, and calls to the support number often go unanswered. Many students I enrolled ended up calling us for help instead.',
    },
    {
      q: 'How are Amity Online exams conducted?',
      a: 'Online and slot-based. Amity releases a date sheet, and you choose the date and the slot, morning, afternoon or evening, that fits your schedule.',
    },
    {
      q: 'Is amityonline.com the official Amity Online site?',
      a: 'Yes. Apply only through amityonline.com or a counsellor you trust. Look-alike sites with similar names show up in search results.',
    },
  ],

  faqsMbaHub: [
    {
      q: 'Will the Amity online MBA get me a job?',
      a: 'Amity advertises 100% placement assistance and 450+ hiring partners, and job openings do get shared. But I have not seen a single student I enrolled at Amity Online get placed through it. Use this MBA to grow in your current career and run your own job search.',
    },
  ],
}
