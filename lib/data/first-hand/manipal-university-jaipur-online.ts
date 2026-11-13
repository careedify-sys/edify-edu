// Rishi Kumar's first-hand content for Manipal University Jaipur (MUJ) Online,
// reviewed 13 November 2026. Copy is his, verbatim. See ./types.ts for the rules.
// Amounts, counts, NAAC and NIRF are {{tokens}} filled from lib/data.ts.
import type { FirstHandUniversity } from './types'

const STUDYING =
  'There is no attendance requirement at MUJ. If the classes don\'t do much for you, put that time into Coursera certificates instead. Coursera access is an optional add-on at {{courseraPrice}} for a year, and you can learn far more there than from a basic degree programme.'

const I_HAVE_SEEN =
  'Everyone talks about placements and average packages. In my experience, placements through the programme don\'t really happen, and the opportunities that do get shared are not strong. Online programmes are not built for placements.'

export const MUJ_FIRST_HAND: FirstHandUniversity = {
  universityId: 'manipal-university-jaipur-online',
  author: 'Rishi Kumar',
  reviewedOn: '2026-11-13',
  subject: 'MUJ Online',
  shortName: 'MUJ',
  parentName: 'Manipal University Jaipur',

  whatItIs:
    'Manipal University Jaipur (MUJ) is a private university in Rajasthan and part of the Manipal group of universities. It started online programmes in 2021. You apply through Online Manipal, the platform that also sells the online degrees of two other Manipal universities: MAHE and Sikkim Manipal University (SMU). These are three separate universities with different fees, so check which one your degree comes from before you pay. In Rajasthan especially, MUJ is a well-known name.',

  approvalsIntro: 'Here is what MUJ holds:',

  approvals: [
    { kind: 'ugc-deb' },
    { kind: 'naac', extra: 'MUJ says it was the first university in Rajasthan to get NAAC A+.', hideDeclared: true },
    { kind: 'nirf', body: 'NIRF 2025, Manipal University Jaipur' },
    {
      kind: 'text',
      body: 'University status',
      holds: 'Private state university in Rajasthan, part of the Manipal group. Online programmes since 2021.',
      source: 'Online Manipal, checked 13 Nov 2026',
    },
  ],
  approvalsFooter: 'For how we checked these approvals, read [is Manipal University Jaipur fake or legit?](/blog/is-manipal-university-jaipur-fake-or-legit-2026)',

  studyingAt: {
    text: STUDYING,
    more: 'MUJ runs campus immersion programmes on its Jaipur campus. Online Manipal lists 6-day programmes there, such as Power BI and Bloomberg Terminal training. In my experience, they are open to a limited number of students and cost extra, and what you mainly get is time with your peers.',
  },

  worksWell: [
    { text: 'Value for money at its fee.' },
    { text: 'Super or dual specialisation, from {{mbaSpecCount}} options.' },
    { text: 'No-cost EMI and scholarships.' },
    { text: 'No attendance requirement, so you can study at your own pace.' },
  ],

  complaints: [
    { name: 'The peer group.', text: 'Students tell me the batch is not as strong as they were told before joining, and batches are large.' },
    { name: 'Placements.', text: 'Covered on the MBA page.' },
    { name: 'Paid extras.', text: 'Coursera access and campus immersions both cost extra.' },
  ],

  whoShouldChoose: [
    'Working professionals who need an MBA at MUJ\'s fee, {{mbaFee}}, and want a known university name. At this price, MUJ is a very good option.',
    'Anyone who wants a dual specialisation. MUJ offers {{mbaSpecCount}} specialisations, and you can take one in depth (a super specialisation) or combine two (a dual specialisation).',
    'Anyone who needs to spread the cost. MUJ offers no-cost EMI and scholarships (below).',
  ],

  whoShouldNot: [
    'Anyone expecting B-school quality teaching. At this fee, the programme is good value, but the education is not what you would get at a B-school.',
    'Anyone who cares most about the peer group. Batches are large. Other universities\' batches are large too, but if you want a stronger peer group, I would not send you to MUJ.',
    'Anyone joining for placements.',
  ],

  admissionSteps: [
    'Apply on Online Manipal and pay the application fee of {{applicationFee}}.',
    'Submit your documents, by upload or through DigiLocker.',
    'Submit your UGC-DEB ID.',
    'Choose how to pay: the full fee, yearly, by semester, or no-cost EMI.',
  ],

  documents: [
    'Aadhaar card (mandatory for Indian citizens)',
    'Proof of address',
    'Class 10 and Class 12 marksheets',
    'Graduation marksheets',
    'Graduation degree certificate, if you have it',
    'Scholarship documents, if you are claiming a scholarship',
    'Your UGC-DEB ID',
  ],
  documentsNote: 'Document list as published by Online Manipal, checked 13 Nov 2026.',

  specialisationAdvice:
    'No specialisation is overhyped; the {{mbaSpecCount}} cover almost every area of business. Use the dual specialisation to make your degree stronger. HR on its own is weak, but HR plus Business Analytics is far more valuable.',

  placements: {
    saysName: 'Online Manipal',
    universitySays:
      'Placement assistance, upskilling and certification modules, industry interaction sessions, self-paced learning, an employability skill assessment and an AI-powered placement portal. Online Manipal says placement assistance is free and that it does not guarantee placements.',
    universitySaysCheckedOn: '2026-11-13',
    iHaveSeen: I_HAVE_SEEN,
    universityPageFaq: I_HAVE_SEEN,
  },

  redFlags: [
    { title: 'Placements rarely happen.', text: 'Opportunities get shared, but in my experience they do not lead to real placements.' },
    { title: 'The peer group is weaker than promised.', text: 'Batches are large, and students tell me the batch quality is below what they were told.' },
    { title: 'Extras cost extra.', text: 'Coursera access and campus immersions are paid add-ons.' },
    { title: 'Three Manipal universities, one platform.', text: 'MAHE, MUJ and SMU are separate universities. Check which one your degree comes from.' },
  ],

  verdict: {
    oneLine: 'At its fee, MUJ\'s online MBA is good value.',
    detail: 'Do not expect B-school teaching or a strong peer group. Use the dual specialisation well, and if the classes don\'t do much for you, put the time into certifications.',
    worthItIf: ['You are a working professional who wants a known university name on this budget, and you will make use of the dual specialisation and your own learning.'],
    notWorthItIf: ['You want B-school quality teaching, a strong peer group, or placements.'],
  },

  counsellorsWontTell:
    'Online Manipal\'s admission counsellors won\'t tell you the reality of placements. They won\'t make it clear that three separate Manipal universities sell online degrees on the same platform, MAHE, MUJ and SMU, so check which one your degree comes from. And they won\'t talk honestly about faculty quality.',

  reviewLine: 'For the full fee breakdown and student reviews, read our [MUJ online MBA review](/blog/muj-online-mba-review-2026).',

  faqsUniversityPage: [
    {
      q: 'Is Manipal University Jaipur a credible brand?',
      a: 'Yes. MUJ is part of the Manipal group of universities, holds NAAC {{naac}}, and NIRF 2025 ranks Manipal University Jaipur #{{nirfUniversity}} in the University category. In Rajasthan especially, it is a well-known name.',
    },
    { q: 'Is there an attendance requirement in MUJ\'s online programmes?', a: `No. ${STUDYING}` },
    {
      q: 'Is Coursera included in the MUJ online MBA fee?',
      a: 'No. It is an optional add-on at {{courseraPrice}} for one year, which you can buy after your admission is confirmed.',
    },
  ],

  faqsMbaHub: [
    {
      q: 'Which Manipal university is this MBA from?',
      a: 'Manipal University Jaipur (MUJ). Online Manipal also sells online MBAs from MAHE and Sikkim Manipal University. They are separate universities with different fees. [Compare MUJ and SMU](/compare/manipal-jaipur-vs-sikkim-manipal) or read our [Online Manipal MBA review](/blog/online-manipal-mba-review-2026).',
    },
    { q: 'Is there an attendance requirement?', a: `No. ${STUDYING}` },
  ],
}
