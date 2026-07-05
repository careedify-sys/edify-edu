#!/usr/bin/env node

/**
 * Test every lead-capture form's exact payload against /api/enquiry.
 *
 * Usage:
 *   node scripts/test-lead-forms.mjs
 *   node scripts/test-lead-forms.mjs --base-url https://edifyedu.in
 */

const BASE_URL = process.argv.includes('--base-url')
  ? process.argv[process.argv.indexOf('--base-url') + 1]
  : 'http://localhost:3000'

const TEST_NAME  = 'TEST LEAD - DELETE'
const TEST_PHONE = '9000000001'
const TEST_EMAIL = 'test-delete@example.com'

const forms = [
  {
    name: 'UniversityEndCta',
    file: 'components/blog-cta/UniversityEndCta.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      program: 'MBA',
      preferredUniversity: 'Amity University',
      sourcePage: 'amity_end_close',
      source: 'amity_end_close',
    },
  },
  {
    name: 'EnquiryModal',
    file: 'components/EnquiryModal.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      email: TEST_EMAIL,
      program: 'MBA',
      preferredUniversity: 'Amity University',
      sourcePage: '/blog/amity-online-mba-review',
      source: 'enquiry_modal',
      couponCode: 'AMITY25',
    },
  },
  {
    name: 'BlogSidebarForm',
    file: 'components/BlogSidebarForm.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      program: 'Online MBA',
      sourcePage: '/blog/test-post',
      source: 'blog_sidebar_form',
      preferredUniversity: 'Blog: Test Post',
    },
  },
  {
    name: 'BlogSidebarWidgets (alumni)',
    file: 'components/BlogSidebarWidgets.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      sourcePage: '/blog/test-post',
      source: 'blog_sidebar_alumni',
      preferredUniversity: 'Talk to Alumni: Test Post',
    },
  },
  {
    name: 'BlogSidebarWidgets (details)',
    file: 'components/BlogSidebarWidgets.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      program: 'Marketing',
      sourcePage: '/blog/test-post',
      source: 'blog_sidebar_details',
      preferredUniversity: 'Program Details: Test Post',
    },
  },
  {
    name: 'BlogContentWithCTAs (InlineLeadForm)',
    file: 'components/BlogContentWithCTAs.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      program: 'Not specified',
      sourcePage: '/blog/test-post',
      source: 'blog_inline_form',
    },
  },
  {
    name: 'BlogLeadForm',
    file: 'components/BlogLeadForm.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      program: 'Online MBA',
      sourcePage: '/blog/test-post',
      source: 'blog_lead_form',
      bestTimeToCall: 'morning',
    },
  },
  {
    name: 'BlogLeadForm (with coupon)',
    file: 'components/BlogLeadForm.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      program: 'Online MBA',
      sourcePage: '/blog/test-post',
      source: 'blog_lead_form',
      couponCode: 'TEST25',
    },
  },
  {
    name: 'VerifyLeadForm',
    file: 'components/verify/VerifyLeadForm.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      preferredUniversity: 'Amity University',
      sourcePage: '/verify/amity-online',
      source: 'verify_page_form',
    },
  },
  {
    name: 'GatedContent',
    file: 'components/GatedContent.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      email: TEST_EMAIL,
      university: 'Amity University',
      program: 'MBA',
      source: 'gated_scholarship',
    },
  },
  {
    name: 'InlineCTAScript',
    file: 'components/InlineCTAScript.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      email: '',
      sourcePage: '/blog/test-post',
      source: 'blog_inline',
      preferredUniversity: 'Inline Blog CTA: test',
    },
  },
  {
    name: 'RequestSampleModal',
    file: 'components/RequestSampleModal.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      email: TEST_EMAIL,
      universityId: 'amity-online',
      preferredUniversity: 'Amity University',
      program: 'MBA',
      notes: 'Sample degree request for Amity University',
      source: 'sample_cert_request',
    },
  },
  {
    name: 'RequestSyllabusModal',
    file: 'components/RequestSyllabusModal.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      email: TEST_EMAIL,
      universityId: 'amity-online',
      preferredUniversity: 'Amity University',
      program: 'MBA',
      notes: 'Syllabus request for Amity University MBA',
      source: 'syllabus_request',
    },
  },
  {
    name: 'MobileLeadNudge',
    file: 'components/MobileLeadNudge.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      program: 'MBA',
      preferredUniversity: 'Amity University',
      sourcePage: '/universities/amity-online/mba',
      source: 'mobile_nudge',
    },
  },
  {
    name: 'StickyLeadCard',
    file: 'components/StickyLeadCard.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      email: TEST_EMAIL,
      state: 'Delhi',
      program: 'MBA',
      preferredUniversity: 'Amity University',
      universityId: 'amity-online',
      notes: 'Test note',
      source: 'sticky_card',
    },
  },
  {
    name: 'CouponCard',
    file: 'components/CouponCard.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      email: TEST_EMAIL,
      state: 'Delhi',
      program: 'MBA',
      preferredUniversity: 'Amity University',
      universityId: 'amity-online',
      source: 'coupon_unlock',
    },
  },
  {
    name: 'ContactPage',
    file: 'app/contact/page.tsx',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
      email: TEST_EMAIL,
      sourcePage: '/contact',
      source: 'contact_page',
      preferredUniversity: 'Contact Form: Test message from automated script',
    },
  },
  {
    name: 'Minimal (name + phone only)',
    file: '(consolidated form test)',
    payload: {
      name: TEST_NAME,
      phone: TEST_PHONE,
    },
  },
]

const sleep = ms => new Promise(r => setTimeout(r, ms))

async function testForm({ name, file, payload }, attempt = 1) {
  const url = `${BASE_URL}/api/enquiry`
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    })
    const body = await res.text()
    let parsed
    try { parsed = JSON.parse(body) } catch { parsed = body }

    if (res.status === 429 && attempt <= 3) {
      process.stdout.write(`  ⏳ ${name} rate-limited, waiting 12s (attempt ${attempt})...\r`)
      await sleep(12_000)
      return testForm({ name, file, payload }, attempt + 1)
    }

    const pass = res.status === 200 && parsed?.success === true
    return { name, file, status: res.status, body: parsed, pass }
  } catch (err) {
    return { name, file, status: 'ERR', body: err.message, pass: false }
  }
}

async function main() {
  console.log(`\nTesting ${forms.length} form payloads against ${BASE_URL}/api/enquiry\n`)
  console.log('─'.repeat(100))
  console.log(
    'Form'.padEnd(35),
    'Status'.padEnd(8),
    'Result'.padEnd(8),
    'Response'
  )
  console.log('─'.repeat(100))

  let passed = 0
  let failed = 0

  for (const form of forms) {
    const result = await testForm(form)
    const statusStr = String(result.status).padEnd(8)
    const passStr = result.pass ? 'PASS' : 'FAIL'
    const bodyStr = typeof result.body === 'object' ? JSON.stringify(result.body) : result.body
    console.log(
      result.name.padEnd(35),
      statusStr,
      (result.pass ? '\x1b[32m' : '\x1b[31m') + passStr.padEnd(8) + '\x1b[0m',
      bodyStr
    )
    if (result.pass) passed++
    else failed++
  }

  console.log('─'.repeat(100))
  console.log(`\n${passed} passed, ${failed} failed out of ${forms.length} forms\n`)

  if (failed > 0) process.exit(1)
}

main()
