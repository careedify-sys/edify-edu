// Rishi Kumar's first-hand content for NMIMS Online (NMIMS CDOE), reviewed
// 13 November 2026. Copy is his, verbatim. See ./types.ts for the rules.
// {{mbaSpecCount}} is the length of the MBA specialisation list in lib/data.ts.
import type { FirstHandUniversity } from './types'

const DEBARMENT_TEXT =
  'Yes, UGC did debar NMIMS. Under an April 2023 notice, NMIMS could not admit students to online or distance programmes for three sessions: January to February 2023, July to August 2023 and January to February 2024. NMIMS is back on UGC-DEB\'s list (Notice 1, January 2026) for the online MBA, MBA (Working Executive), BBA and B.Com. If you join now, the debarment does not apply to you. [Read the full timeline](/blog/is-nmims-online-fake-or-legit-2026).'

const EXAMS =
  'Before each exam, you must complete at least 75% of that subject\'s track on the student portal, by going through the content, the recorded sessions or the live lectures. Only then is your admit card generated. After that, NMIMS gives you about a month to choose your exam date, and you pick the slot that suits you. It is one of the most flexible exam systems I have seen.'

const I_HAVE_SEEN =
  'Placement and career services cost extra. They are not part of the programme fee, and most students only find this out after joining.'

export const NMIMS_FIRST_HAND: FirstHandUniversity = {
  universityId: 'nmims-online',
  author: 'Rishi Kumar',
  reviewedOn: '2026-11-13',
  subject: 'NMIMS Online',
  shortName: 'NMIMS',
  parentName: 'SVKM\'s NMIMS',

  whatItIs:
    'NMIMS Online is the online arm of SVKM\'s NMIMS, the Mumbai university. Its official name is NMIMS CDOE, the Centre for Distance and Online Education. NMIMS has run distance education since 1994. Its distance school later became NMIMS Global Access, which was renamed NMIMS CDOE in 2023. Today NMIMS offers its MBA online and does not run a separate distance MBA. NMIMS itself is one of India\'s best-known business school names, which is the main reason students pick it.',

  approvalsIntro:
    'NMIMS\'s online degrees carry the parent university\'s name and approvals. Here is exactly what it holds, and who holds it:',

  approvals: [
    { kind: 'ugc-deb' },
    {
      kind: 'text',
      body: 'University status',
      holds: 'Deemed-to-be university under Section 3 of the UGC Act, 1956, since 13 January 2003. Set up by Shri Vile Parle Kelavani Mandal (SVKM), a charitable trust.',
      source: 'NMIMS self-study report for NAAC (2024)',
    },
    { kind: 'naac' },
    { kind: 'nirf', body: 'NIRF 2025, SVKM\'s NMIMS' },
    {
      kind: 'text',
      body: 'AACSB',
      holds: 'Held by NMIMS\'s School of Business Management, the campus business school. It does not cover the online programmes.',
    },
    {
      kind: 'text',
      body: '2023 UGC debarment',
      holds: 'UGC debarred NMIMS from offering online and distance programmes for three sessions: January to February 2023, July to August 2023 and January to February 2024 (April 2023 public notice). NMIMS is back on UGC-DEB\'s list in Notice 1, January 2026.',
      link: '/blog/is-nmims-online-fake-or-legit-2026',
      linkLabel: 'Full timeline',
    },
  ],

  batches:
    'Even within one intake, say January, NMIMS starts separate batches: a weekend batch, a weekday batch and an alternate-days batch, where lectures fall on alternate days. If you work on weekdays, pick the weekend batch. If you work on weekends, pick the weekday batch. That flexibility makes a real difference for working people.',

  exams: EXAMS,

  studentTools: [
    { name: 'Printed books', text: 'NMIMS sends printed study material to your home address.' },
    { name: 'Student portal', text: 'easy to use, with the e-library and everything else you need for the MBA in one place.' },
    { name: 'Support', text: 'a support portal where you can raise a ticket or ask for a callback.' },
    { name: 'Campus immersion', text: 'NMIMS says online MBA students get a 2-day visit to the NMIMS CDOE campus in Mumbai.' },
    { name: 'Career services', text: 'coaching, CV help and practice interviews. In my experience you pay extra for these; they are not part of the programme fee.' },
  ],

  worksWell: [
    { name: 'Faculty.', text: 'Online students are not taught by the same faculty as campus students, so the quality is never identical. But among online MBAs in the same price range, such as Amity, Manipal and LPU, NMIMS\'s teaching is clearly better.' },
    { name: 'The peer group.', text: 'After Symbiosis and BITS Pilani, NMIMS has the strongest peer group I have seen in an online MBA.' },
    { name: 'Support.', text: 'It is better than any other university\'s support I have dealt with.' },
    { name: 'Flexible batches and exam slots.', text: '' },
  ],

  complaintsHeading: 'What to be ready for',
  complaints: [
    { name: 'Networking stays on the portal.', text: 'With only {{mbaSpecCount}} specialisations, your batch has a lot in common, but there are no WhatsApp groups. Everything goes through the NMIMS portal.' },
    { name: 'Document verification takes time.', text: 'Students tell me approval can be slow, so submit early.' },
  ],

  whoShouldChoose: [
    'Working professionals who want a reputed business school name. Compared with Amity, NMIMS carries more weight as a brand.',
    'Professionals in and around Maharashtra in particular. NMIMS is a national brand, but its hold is strongest in Maharashtra.',
    'Anyone whose work hours need a flexible batch: weekday, weekend or alternate days.',
  ],

  whoShouldNot: [
    'Anyone who needs a specialisation outside NMIMS\'s {{mbaSpecCount}}. If your field is not on the list, look elsewhere.',
    'Anyone who cannot keep up with the content. You must complete 75% of every subject\'s track before you can sit its exam.',
    'Anyone who does not want to answer questions about the 2023 debarment. People will ask, so know the answer.',
  ],

  admissionSteps: [
    'Register on NMIMS CDOE\'s site and pay the admission processing fee of {{admissionProcessing}}.',
    'Pay the initial amount of {{initial}}. This is part of your programme fee, not an extra charge. It blocks your seat.',
    'Pay the rest of your first instalment. If you pay by semester, that is {{semester1Balance}} for semester 1.',
    'Submit your documents (list below), self-attested.',
    'Complete a video-call verification with NMIMS.',
    'Get your student portal access and start classes.',
  ],

  documents: [
    'Your UGC-DEB ID (see "Your UGC-DEB ID" below)',
    'Your ABC ID',
    'Aadhaar card',
    'A recent passport-size photograph. Not an old one.',
    'Your signature',
    'Class 10 marksheet',
    'Class 12 marksheet',
    'All semester marksheets from your graduation',
    'Your graduation degree',
  ],
  documentsNote: 'Every document must be self-attested.',

  specialisationAdvice:
    'NMIMS offers {{mbaSpecCount}} specialisations. Business Analytics is the newest. I don\'t think any of them is overhyped: between them, they cover every major area of business. Operations is the one NMIMS is best known for, even in its campus programmes.',

  placements: {
    universitySays:
      'Access to 500+ hiring partners, and career services with coaching, CV help and practice interviews. NMIMS also says 82,000+ CDOE alumni work at 8,000+ companies.',
    universitySaysCheckedOn: '2026-11-13',
    iHaveSeen: I_HAVE_SEEN,
    universityPageFaq: I_HAVE_SEEN,
  },

  noticeBox: {
    heading: 'About the 2023 UGC debarment',
    text: DEBARMENT_TEXT,
    related: 'Two related answers: [Is NMIMS government or private?](/blog/is-nmims-government-or-private) and [What is NMIMS CDOE?](/blog/what-is-nmims-cdoe)',
  },

  redFlags: [
    { title: '75% of every subject before each exam.', text: 'If you fall behind on the content, your admit card is not generated.' },
    { title: 'Career services cost extra.', text: 'Budget for them if you want them.' },
    { title: 'The 2023 debarment will come up.', text: 'It is over, but be ready to explain it to an employer.' },
    { title: 'Networking happens only on the portal.', text: 'There are no WhatsApp groups, so you have to make the effort there.' },
    { title: 'Document verification can be slow.', text: 'Submit your self-attested documents early.' },
  ],

  verdict: {
    oneLine: 'Yes, it is worth it at NMIMS\'s fee.',
    detail: 'For the price, you get a strong brand, better faculty than most online MBAs in the same range, and a strong peer group. The one condition: be comfortable answering questions about the 2023 debarment.',
    worthItIf: ['You are a working professional who wants a reputed business school name, your field is one of the {{mbaSpecCount}} specialisations, and you can complete 75% of the content in every subject.'],
    notWorthItIf: ['You need a specialisation NMIMS does not offer, you cannot commit time every week, or you do not want to explain the 2023 debarment to anyone who asks.'],
  },

  counsellorsWontTell:
    'NMIMS\'s own admission counsellors won\'t tell you about the rule that you must complete 75% of every subject before its exam. They won\'t tell you that placement and career services cost extra; you find that out later in the programme. And they won\'t really discuss the debarment. They will say it happened and move the conversation somewhere else.',

  reviewLine: 'For the full fee breakdown, read our [NMIMS online MBA review](/blog/nmims-online-mba-review-2026).',

  faqsUniversityPage: [
    {
      q: 'Is NMIMS a government or private university?',
      a: 'Private. NMIMS is a deemed-to-be university set up by SVKM, a charitable trust in Mumbai, and it has held deemed status under Section 3 of the UGC Act since 2003. [Full answer](/blog/is-nmims-government-or-private).',
    },
    {
      q: 'What is NMIMS CDOE?',
      a: 'NMIMS\'s Centre for Distance and Online Education, the arm that runs its online MBA, MBA (Working Executive), BBA and B.Com. [Full answer](/blog/what-is-nmims-cdoe).',
    },
    { q: 'How are NMIMS online exams conducted?', a: EXAMS },
    {
      q: 'How is NMIMS Online\'s student support?',
      a: 'Good. You can raise a ticket or ask for a callback on the support portal. In my experience it is better than any other university\'s.',
    },
  ],

  faqsMbaHub: [
    {
      q: 'Do I need a UGC-DEB ID to join?',
      a: 'Yes. Every Indian student joining an online or distance programme needs one before admission. It is free and takes a few minutes. [How to get your DEB ID](#deb-id).',
    },
  ],
}
