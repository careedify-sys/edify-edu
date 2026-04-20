/**
 * sync-excel-to-content.js
 * Reads data/EdifyEdu_Page_Blueprint_v3.xlsx and writes one JSON per uni-program
 * into lib/data/page-content/{uniSlug}-mba.json
 *
 * Handles two sheet formats:
 *   A) Named-key format:  section_key = about_body, reviews_body, faq_1, faq_1_a, ...
 *   B) Numbered-key format: section_key = 2_body, 17_r1, faq1, faq2, ...
 *
 * Uses the `xlsx` npm package (confirmed available).
 * Run with: node scripts/sync-excel-to-content.js
 */

'use strict';

const XLSX = require('xlsx');
const fs = require('fs');
const path = require('path');

// ── Config ────────────────────────────────────────────────────────────────────
const ROOT = path.resolve(__dirname, '..');
const EXCEL_PATH = path.join(ROOT, 'data', 'EdifyEdu_Page_Blueprint_v3.xlsx');
const ALIAS_MAP_PATH = path.join(ROOT, 'scripts', 'sheet-slug-map.json');
const OUT_DIR = path.join(ROOT, 'lib', 'data', 'page-content');

// Sheets to skip entirely
const SKIP_SHEETS = new Set([
  'README', 'Section_Template', 'Meta_Schema',
  'Amity_MBA_Example', 'Reviews_Pipeline', 'CTA_Spec', 'Coupons',
]);

// ── Named-key format maps ────────────────────────────────────────────────────
// section_key value → PageContent section name (for body rows)
const NAMED_BODY_KEY_MAP = {
  'intro':                    'hero',
  'about_body':               'about',
  'approvals_body':           'approvals',
  'ugc_deb_body':             'ugcDeb',
  'who_can_apply_body':       'whoCanApply',
  'classes_body':             'classes',
  'exams_body':               'exams',
  'specializations_body':     'specializationsOverview',
  'syllabus_body':            'syllabusNote',
  'fees_body':                'fees',
  'coupon_body':              'coupon',
  'emi_body':                 'emi',
  'sample_cert_body':         'sampleCert',
  'admission_body':           'admission',
  'abc_body':                 'abcId',
  'placements_body':          'placements',
  'hirers_body':              'topHirers',
  'beyond_body':              'beyondAdmission',
  'comparisons_body':         'comparisons',
  'verdict_body':             'honestVerdict',
};

// section_key → PageContent section name (for heading rows)
const NAMED_HEADING_KEY_MAP = {
  'about_h2':           'about',
  'approvals_h2':       'approvals',
  'ugc_deb_h2':         'ugcDeb',
  'who_can_apply_h2':   'whoCanApply',
  'classes_h2':         'classes',
  'exams_h2':           'exams',
  'specializations_h2': 'specializationsOverview',
  'syllabus_h2':        'syllabusNote',
  'fees_h2':            'fees',
  'coupon_h3':          'coupon',
  'emi_h2':             'emi',
  'sample_cert_h2':     'sampleCert',
  'admission_h2':       'admission',
  'abc_h2':             'abcId',
  'placements_h2':      'placements',
  'hirers_h2':          'topHirers',
  'beyond_h2':          'beyondAdmission',
  'reviews_h2':         'reviews',
  'red_flags_h2':       'redFlags',
  'comparisons_h2':     'comparisons',
  'verdict_h2':         'honestVerdict',
  'faqs_h2':            'faqs',
};

// ── Numbered-key format maps ──────────────────────────────────────────────────
// colB (Section_Name) prefix keywords → PageContent section name
// Format A colB values: "Section 2: About", "H2: About", etc.
const NUMBERED_SECTION_MAP = {
  '1_intro':    'hero',
  '2_body':     'about',
  '2_h2':       { heading: 'about' },
  '3_body':     'approvals',
  '3_h2':       { heading: 'approvals' },
  '3b_body':    'ugcDeb',
  '3b_h2':      { heading: 'ugcDeb' },
  '4_body':     'whoCanApply',
  '4_h2':       { heading: 'whoCanApply' },
  '5_body':     'classes',
  '5_h2':       { heading: 'classes' },
  '6_body':     'exams',
  '6_h2':       { heading: 'exams' },
  '7_body':     'specializationsOverview',
  '7_h2':       { heading: 'specializationsOverview' },
  '8_body':     'syllabusNote',
  '8_h2':       { heading: 'syllabusNote' },
  '9_body':     'fees',
  '9_h2':       { heading: 'fees' },
  '10_body':    'coupon',
  '10_h3':      { heading: 'coupon' },
  '11_body':    'emi',
  '11_h2':      { heading: 'emi' },
  '12_body':    'sampleCert',
  '12_h2':      { heading: 'sampleCert' },
  '13_body':    'admission',
  '13_h2':      { heading: 'admission' },
  '13b_body':   'abcId',
  '13b_h2':     { heading: 'abcId' },
  '14_body':    'placements',
  '14_h2':      { heading: 'placements' },
  '15_body':    'topHirers',
  '15_h2':      { heading: 'topHirers' },
  '16_body':    'beyondAdmission',
  '16_h2':      { heading: 'beyondAdmission' },
  '17_h2':      { heading: 'reviews' },
  '18_body':    'redFlags',
  '18_h2':      { heading: 'redFlags' },
  '19_body':    'comparisons',
  '19_h2':      { heading: 'comparisons' },
  '20_body':    'honestVerdict',
  '20_h2':      { heading: 'honestVerdict' },
};

// ── Parsers ───────────────────────────────────────────────────────────────────

/**
 * Parse named-format reviews block text.
 * Format:
 *   {intro paragraph}
 *
 *   5/5 - Arjun M., Pune, 2024
 *   Liked: ...
 *   Disliked: ...
 *
 *   [closer line at end]
 */
function parseReviewsFromBody(rawText, sheetName) {
  try {
    const lines = rawText.split('\n');
    const reviewPattern = /^(\d)\/5\s*-\s*(.+?),\s*(.+?),\s*(\d{4})\s*$/;

    const items = [];
    const introLines = [];
    let closer = '';
    let currentReview = null;
    let seenFirstReview = false;
    let firstRatingLine = -1;

    for (let i = 0; i < lines.length; i++) {
      if (reviewPattern.test(lines[i].trim())) {
        firstRatingLine = i;
        break;
      }
    }

    if (firstRatingLine === -1) return { rawBody: rawText };

    for (let i = 0; i < firstRatingLine; i++) {
      if (lines[i].trim()) introLines.push(lines[i].trim());
    }

    let i = firstRatingLine;
    while (i < lines.length) {
      const line = lines[i].trim();
      const match = reviewPattern.exec(line);

      if (match) {
        if (currentReview) items.push(currentReview);
        currentReview = {
          rating: parseInt(match[1], 10),
          name: match[2].trim(),
          city: match[3].trim(),
          year: parseInt(match[4], 10),
          liked: '',
          disliked: '',
          body: '',
        };
        seenFirstReview = true;
      } else if (seenFirstReview && currentReview) {
        if (line.startsWith('Liked:')) {
          currentReview.liked = line.replace(/^Liked:\s*/, '').trim();
        } else if (line.startsWith('Disliked:')) {
          currentReview.disliked = line.replace(/^Disliked:\s*/, '').trim();
        }
      }
      i++;
    }
    if (currentReview) items.push(currentReview);

    items.forEach(r => { r.body = r.liked || ''; });

    // Find closer: last non-empty line that is not a review/liked/disliked line
    for (let j = lines.length - 1; j >= firstRatingLine; j--) {
      const l = lines[j].trim();
      if (l && !reviewPattern.test(l) && !l.startsWith('Liked:') && !l.startsWith('Disliked:')) {
        closer = l;
        break;
      }
    }

    return {
      intro: introLines.join(' '),
      items: items.length > 0 ? items : undefined,
      closer: closer || undefined,
    };
  } catch (err) {
    console.warn(`  [WARN] ${sheetName}: reviews parse error — storing rawBody. ${err.message}`);
    return { rawBody: rawText };
  }
}

/**
 * Parse numbered-format review rows (17_r1, 17_r2, ...).
 * Each row content format: "Name | City | Year | N stars\n{body text}"
 * or: "Name. City. Year. N stars\n{body text}"
 */
function parseReviewsFromNumberedRows(sectionMap, sheetName) {
  try {
    const items = [];
    for (let n = 1; n <= 10; n++) {
      const key = `17_r${n}`;
      if (!sectionMap[key]) continue;
      const raw = sectionMap[key];
      // Format: "Priya M. | Hyderabad | 2024 | 5 stars\nBody text..."
      const firstLine = raw.split('\n')[0];
      const bodyLines = raw.split('\n').slice(1).join(' ').trim();

      // Try pipe-separated
      const pipeParts = firstLine.split('|').map(s => s.trim());
      if (pipeParts.length >= 3) {
        const name = pipeParts[0];
        const city = pipeParts[1];
        const yearStr = pipeParts[2];
        const starsStr = pipeParts[3] || '';
        const year = parseInt(yearStr) || 0;
        const ratingMatch = starsStr.match(/(\d)/);
        const rating = ratingMatch ? parseInt(ratingMatch[1]) : 4;
        items.push({ name, city, year, rating, liked: '', disliked: '', body: bodyLines });
        continue;
      }
      // Fallback
      items.push({ name: firstLine, city: '', year: 0, rating: 4, liked: '', disliked: '', body: bodyLines });
    }

    return items.length > 0 ? { items } : null;
  } catch (err) {
    console.warn(`  [WARN] ${sheetName}: numbered reviews parse error. ${err.message}`);
    return null;
  }
}

/**
 * Parse red flags from named-format body text.
 * Format: {intro}\n\nRed Flag 1: {s1}. {s2}.\n\nRed Flag 2: ...
 */
function parseRedFlagsFromBody(rawText, sheetName) {
  try {
    const flagPattern = /^Red Flag \d+:\s*(.+)$/i;
    const lines = rawText.split('\n');
    const flags = [];
    const introLines = [];
    let seenFlag = false;

    for (const line of lines) {
      const trimmed = line.trim();
      const match = flagPattern.exec(trimmed);
      if (match) {
        seenFlag = true;
        const flagText = match[1].trim();
        const periodIdx = flagText.indexOf('. ');
        if (periodIdx !== -1) {
          flags.push({
            sentence1: flagText.substring(0, periodIdx + 1).trim(),
            sentence2: flagText.substring(periodIdx + 2).trim(),
          });
        } else {
          flags.push({ sentence1: flagText, sentence2: '' });
        }
      } else if (!seenFlag && trimmed) {
        introLines.push(trimmed);
      }
    }

    if (flags.length === 0) return { rawBody: rawText };
    return { intro: introLines.join(' '), flags };
  } catch (err) {
    console.warn(`  [WARN] ${sheetName}: redFlags parse error — storing rawBody. ${err.message}`);
    return { rawBody: rawText };
  }
}

/**
 * Parse red flags from numbered-format body text.
 * Format: "Flag 1: {text}\n\nFlag 2: ..."
 */
function parseRedFlagsFromNumberedBody(rawText, sheetName) {
  try {
    const flagPattern = /^Flag \d+:\s*(.+)$/i;
    const lines = rawText.split('\n');
    const flags = [];
    let currentFlag = null;

    for (const line of lines) {
      const trimmed = line.trim();
      const match = flagPattern.exec(trimmed);
      if (match) {
        if (currentFlag) flags.push(currentFlag);
        currentFlag = { sentence1: match[1].trim(), sentence2: '' };
      } else if (trimmed && currentFlag) {
        // Continuation of flag text
        if (!currentFlag.sentence2) {
          currentFlag.sentence2 = trimmed;
        }
      }
    }
    if (currentFlag) flags.push(currentFlag);

    if (flags.length === 0) return { rawBody: rawText };
    return { flags };
  } catch (err) {
    console.warn(`  [WARN] ${sheetName}: numbered redFlags parse error. ${err.message}`);
    return { rawBody: rawText };
  }
}

/**
 * Parse FAQ rows in named format: faq_1, faq_1_a, faq_2, faq_2_a, ...
 */
function parseFaqsNamed(sectionMap, sheetName) {
  try {
    const faqs = [];
    const seen = new Set();

    for (const key of Object.keys(sectionMap)) {
      const m = key.match(/^faq_?(\d+)$/);
      if (m) seen.add(m[1]);
    }

    const nums = Array.from(seen).sort((a, b) => parseInt(a) - parseInt(b));
    for (const n of nums) {
      const qKey = sectionMap[`faq_${n}`] !== undefined ? `faq_${n}` : `faq${n}`;
      const aKey = sectionMap[`faq_${n}_a`] !== undefined ? `faq_${n}_a` : `faq${n}_a`;

      const question = sectionMap[qKey];
      const answer = sectionMap[aKey];

      if (question && answer) {
        faqs.push({ question, answer });
      }
    }

    return faqs.length > 0 ? faqs : null;
  } catch (err) {
    console.warn(`  [WARN] ${sheetName}: named faqs parse error. ${err.message}`);
    return null;
  }
}

/**
 * Parse FAQ rows in numbered format: faq1, faq2, ...
 * Each cell contains "Q: {question}\nA: {answer}"
 */
function parseFaqsNumbered(sectionMap, sheetName) {
  try {
    const faqs = [];
    for (let n = 1; n <= 15; n++) {
      const key = `faq${n}`;
      if (!sectionMap[key]) continue;
      const raw = sectionMap[key];
      const lines = raw.split('\n').map(l => l.trim()).filter(Boolean);
      let question = '';
      let answer = '';
      for (const line of lines) {
        if (line.startsWith('Q:')) {
          question = line.replace(/^Q:\s*/, '').trim();
        } else if (line.startsWith('A:')) {
          answer = line.replace(/^A:\s*/, '').trim();
        } else if (question && !answer) {
          question += ' ' + line;
        } else if (answer) {
          answer += ' ' + line;
        }
      }
      if (question && answer) {
        faqs.push({ question, answer });
      }
    }
    return faqs.length > 0 ? faqs : null;
  } catch (err) {
    console.warn(`  [WARN] ${sheetName}: numbered faqs parse error. ${err.message}`);
    return null;
  }
}

// ── Detect sheet format ───────────────────────────────────────────────────────
function detectFormat(sectionMap) {
  // Named format has keys like 'about_body', 'reviews_body', 'faq_1'
  const namedKeys = ['about_body', 'reviews_body', 'faq_1', 'faq_1_a'];
  // Numbered format has keys like '2_body', '17_r1', 'faq1'
  const numberedKeys = ['2_body', '17_r1', '1_intro', 'faq1'];

  const hasNamed = namedKeys.some(k => sectionMap[k] !== undefined);
  const hasNumbered = numberedKeys.some(k => sectionMap[k] !== undefined);

  if (hasNamed) return 'named';
  if (hasNumbered) return 'numbered';
  return 'unknown';
}

// ── Process named-format sheet ────────────────────────────────────────────────
function processNamedFormat(sectionMap, sheetName) {
  const sections = {};

  // tldr
  if (sectionMap['tldr']) sections.tldr = sectionMap['tldr'];

  // hero
  if (sectionMap['intro']) sections.hero = { body: sectionMap['intro'] };

  // Standard sections
  const standardSections = [
    'about', 'approvals', 'ugcDeb', 'whoCanApply', 'classes',
    'exams', 'specializationsOverview', 'syllabusNote', 'fees',
    'coupon', 'emi', 'sampleCert', 'admission', 'abcId',
    'placements', 'topHirers', 'beyondAdmission', 'comparisons', 'honestVerdict',
  ];

  // Build reverse maps
  const sectionToBodyKey = Object.fromEntries(
    Object.entries(NAMED_BODY_KEY_MAP).map(([k, v]) => [v, k])
  );
  const sectionToHeadingKey = Object.fromEntries(
    Object.entries(NAMED_HEADING_KEY_MAP).map(([k, v]) => [v, k])
  );

  for (const secName of standardSections) {
    const bodyKey = sectionToBodyKey[secName];
    const headingKey = sectionToHeadingKey[secName];
    const body = bodyKey ? sectionMap[bodyKey] : null;
    const heading = headingKey ? sectionMap[headingKey] : null;
    if (body || heading) {
      sections[secName] = {};
      if (heading) sections[secName].heading = heading;
      if (body) sections[secName].body = body;
    }
  }

  // Reviews
  const reviewsRaw = sectionMap['reviews_body'];
  const reviewsHeading = sectionMap['reviews_h2'];
  if (reviewsRaw) {
    const parsed = parseReviewsFromBody(reviewsRaw, sheetName);
    sections.reviews = {};
    if (reviewsHeading) sections.reviews.heading = reviewsHeading;
    Object.assign(sections.reviews, parsed);
    if (parsed.items) {
      console.log(`  Reviews: parsed ${parsed.items.length} items`);
    } else {
      console.warn(`  Reviews: stored as rawBody`);
    }
  }

  // Red Flags
  const redFlagsRaw = sectionMap['red_flags_body'];
  const redFlagsHeading = sectionMap['red_flags_h2'];
  if (redFlagsRaw) {
    const parsed = parseRedFlagsFromBody(redFlagsRaw, sheetName);
    sections.redFlags = {};
    if (redFlagsHeading) sections.redFlags.heading = redFlagsHeading;
    Object.assign(sections.redFlags, parsed);
    if (parsed.flags) {
      console.log(`  Red Flags: parsed ${parsed.flags.length} flags`);
    } else {
      console.warn(`  Red Flags: stored as rawBody`);
    }
  }

  // FAQs
  const faqsParsed = parseFaqsNamed(sectionMap, sheetName);
  if (faqsParsed) {
    sections.faqs = faqsParsed;
    console.log(`  FAQs: parsed ${faqsParsed.length} Q&A pairs`);
  }

  return sections;
}

// ── Process numbered-format sheet ────────────────────────────────────────────
function processNumberedFormat(sectionMap, sheetName) {
  const sections = {};

  // tldr
  if (sectionMap['tldr']) sections.tldr = sectionMap['tldr'];

  // Hero (1_intro)
  if (sectionMap['1_intro']) sections.hero = { body: sectionMap['1_intro'] };

  // Map numbered keys to sections
  for (const [key, target] of Object.entries(NUMBERED_SECTION_MAP)) {
    const content = sectionMap[key];
    if (!content) continue;

    if (typeof target === 'string') {
      // Body row
      if (!sections[target]) sections[target] = {};
      sections[target].body = content;
    } else if (target.heading) {
      // Heading row
      if (!sections[target.heading]) sections[target.heading] = {};
      sections[target.heading].heading = content;
    }
  }

  // Reviews: parse from 17_intro + 17_r1..17_r5 + 17_source
  const reviewsHeading = sectionMap['17_h2'];
  const reviewsIntro = sectionMap['17_intro'];
  const reviewsSource = sectionMap['17_source'];
  const parsedReviews = parseReviewsFromNumberedRows(sectionMap, sheetName);
  if (parsedReviews || reviewsIntro || reviewsSource) {
    sections.reviews = {};
    if (reviewsHeading) sections.reviews.heading = reviewsHeading;
    if (reviewsIntro) sections.reviews.intro = reviewsIntro;
    if (parsedReviews && parsedReviews.items) {
      sections.reviews.items = parsedReviews.items;
      console.log(`  Reviews: parsed ${parsedReviews.items.length} items (numbered format)`);
    }
    if (reviewsSource) sections.reviews.closer = reviewsSource;
  }

  // Red Flags: parse from 18_body
  const redFlagsRaw = sectionMap['18_body'];
  if (redFlagsRaw) {
    const parsed = parseRedFlagsFromNumberedBody(redFlagsRaw, sheetName);
    sections.redFlags = {};
    if (sectionMap['18_h2']) sections.redFlags.heading = sectionMap['18_h2'];
    Object.assign(sections.redFlags, parsed);
    if (parsed.flags) {
      console.log(`  Red Flags: parsed ${parsed.flags.length} flags (numbered format)`);
    } else {
      console.warn(`  Red Flags: stored as rawBody (numbered format)`);
    }
  }

  // FAQs
  const faqsParsed = parseFaqsNumbered(sectionMap, sheetName);
  if (faqsParsed) {
    sections.faqs = faqsParsed;
    console.log(`  FAQs: parsed ${faqsParsed.length} Q&A pairs (numbered format)`);
  }

  return sections;
}

// ── Main ──────────────────────────────────────────────────────────────────────
function main() {
  console.log('=== sync-excel-to-content.js ===');
  console.log(`Reading: ${EXCEL_PATH}`);

  if (!fs.existsSync(EXCEL_PATH)) {
    console.error(`ERROR: Excel file not found at ${EXCEL_PATH}`);
    process.exit(1);
  }

  // Load alias map
  let aliasMap = {};
  if (fs.existsSync(ALIAS_MAP_PATH)) {
    const raw = JSON.parse(fs.readFileSync(ALIAS_MAP_PATH, 'utf-8'));
    aliasMap = raw.aliases || {};
    console.log(`Loaded ${Object.keys(aliasMap).length} aliases from sheet-slug-map.json`);
  }

  // Load workbook
  const wb = XLSX.readFile(EXCEL_PATH, { cellText: true, cellDates: true });
  console.log(`Sheets found: ${wb.SheetNames.join(', ')}\n`);

  // Ensure output directory exists
  if (!fs.existsSync(OUT_DIR)) {
    fs.mkdirSync(OUT_DIR, { recursive: true });
    console.log(`Created output directory: ${OUT_DIR}`);
  }

  const results = [];

  for (const sheetName of wb.SheetNames) {
    // Only process sheets ending with _MBA
    if (!sheetName.endsWith('_MBA')) continue;
    if (SKIP_SHEETS.has(sheetName)) continue;

    console.log(`\nProcessing sheet: ${sheetName}`);

    // Resolve uni slug
    let uniSlug;
    if (aliasMap[sheetName]) {
      uniSlug = aliasMap[sheetName];
      console.log(`  Alias resolved: ${sheetName} → ${uniSlug}`);
    } else {
      uniSlug = sheetName.replace(/_MBA$/, '');
      console.log(`  Using stripped slug: ${uniSlug}`);
    }

    // Parse sheet into section map
    const ws = wb.Sheets[sheetName];
    const rows = XLSX.utils.sheet_to_json(ws, {
      header: ['section_key', 'heading', 'content', 'word_count', 'data_source'],
      defval: null,
    });

    const sectionMap = {};
    for (const row of rows) {
      const key = row.section_key ? String(row.section_key).trim() : null;
      if (!key || key === 'section_key' || key === 'Section_Number') continue;
      sectionMap[key] = row.content != null ? String(row.content).trim() : null;
    }

    // Detect format
    const format = detectFormat(sectionMap);
    console.log(`  Format: ${format}`);

    let sections;
    if (format === 'named') {
      sections = processNamedFormat(sectionMap, sheetName);
    } else if (format === 'numbered') {
      sections = processNumberedFormat(sectionMap, sheetName);
    } else {
      console.warn(`  [WARN] Unknown format for ${sheetName} — writing minimal JSON`);
      sections = {};
    }

    const pageContent = {
      uniSlug,
      program: 'mba',
      sections,
      metadata: {
        generatedAt: new Date().toISOString(),
        sheetName,
        format,
      },
    };

    const outFile = path.join(OUT_DIR, `${uniSlug}-mba.json`);
    const jsonStr = JSON.stringify(pageContent, null, 2);
    fs.writeFileSync(outFile, jsonStr, 'utf-8');

    const fileSizeKB = (Buffer.byteLength(jsonStr, 'utf-8') / 1024).toFixed(1);
    console.log(`  Written: ${path.basename(outFile)} (${fileSizeKB} KB)`);
    results.push({ sheetName, uniSlug, sizeKB: fileSizeKB });
  }

  console.log(`\n=== DONE ===`);
  console.log(`Files created: ${results.length}`);
  for (const r of results) {
    console.log(`  ${r.uniSlug}-mba.json (${r.sizeKB} KB)`);
  }
}

main();
