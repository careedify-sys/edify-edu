// lib/page-keywords.ts
// Static keyword overrides for high-value pages.
//
// University/program pages generate base keywords dynamically from lib/data.ts.
// Entries here inject ADDITIONAL keywords into JSON-LD schema blocks only
// (not visible to users; consumed by Google's structured data parser).
//
// Key patterns:
//   Blog posts          → keyed by post.slug
//   Program pages       → keyed by `${u.id}-${programSlug}`  e.g. "amity-university-online-mba"
//   University profile  → keyed by u.id (only needed for overrides at the university level)
//
// Usage in pages:
//   import { pageKeywords } from '@/lib/page-keywords'
//   const kw = pageKeywords[`${u.id}-${programSlug}`]?.join(', ') || ''
//   if (kw) schema.keywords = kw
//
// Cap: 15–20 keywords per entry. No placeholders; only verified program names.

export const pageKeywords: Record<string, string[]> = {

  // ── Blog posts (7) ──────────────────────────────────────────────────────────
  'best-online-mba-india': [
    'best online MBA India 2026',
    'UGC approved online MBA',
    'online MBA ranking India',
    'distance MBA India fees',
    'top online MBA universities India',
  ],
  'online-mba-vs-regular-mba': [
    'online MBA vs regular MBA India',
    'distance MBA recognition India',
    'UGC DEB online MBA validity',
    'online degree vs campus degree India',
  ],
  'ugc-deb-approved-universities': [
    'UGC DEB approved universities list 2026',
    'UGC approved online degree India',
    'DEB approved distance education university',
    'online university UGC recognition',
  ],
  'naac-accredited-online-universities': [
    'NAAC accredited online universities India',
    'NAAC A++ online university',
    'NAAC grade online MBA',
    'best NAAC rated online university India',
  ],
  'online-mba-fees-india': [
    'online MBA fees India 2026',
    'cheapest online MBA India UGC approved',
    'online MBA cost comparison India',
    'affordable online MBA fees',
  ],
  'is-online-mba-valid-india': [
    'is online MBA valid in India',
    'online MBA UGC DEB recognised',
    'online MBA government jobs India',
    'online degree validity India 2026',
  ],
  'online-mba-for-working-professionals': [
    'online MBA for working professionals India',
    'part time MBA online India',
    'executive online MBA India',
    'online MBA while working',
  ],

  // ── Amity University Online ──────────────────────────────────────────────────
  'amity-university-online-mba': [
    'Amity online MBA fees 2026',
    'Amity University online MBA syllabus',
    'Amity online MBA placements',
    'Amity distance MBA India review',
    'AUUP online MBA admission 2026',
    'Amity online MBA NAAC A+',
    'Amity University online MBA UGC approved',
  ],
  'amity-university-online-mca': [
    'Amity online MCA fees 2026',
    'Amity University online MCA syllabus',
    'Amity online MCA placements',
    'AUUP online MCA admission 2026',
    'Amity online MCA UGC DEB approved',
    'Amity distance MCA India',
  ],
  'amity-university-online-bba': [
    'Amity online BBA fees 2026',
    'Amity University online BBA syllabus',
    'Amity online BBA placements',
    'AUUP online BBA admission 2026',
    'Amity distance BBA India',
    'Amity online BBA UGC approved',
  ],
  'amity-university-online-bca': [
    'Amity online BCA fees 2026',
    'Amity University online BCA syllabus',
    'Amity online BCA placements',
    'AUUP online BCA admission 2026',
    'Amity distance BCA India',
    'Amity online BCA UGC approved',
  ],

  // ── NMIMS Online ────────────────────────────────────────────────────────────
  'nmims-online-mba': [
    'NMIMS online MBA fees 2026',
    'NMIMS Global Access MBA syllabus',
    'NMIMS distance MBA India review',
    'NMIMS online MBA admission 2026',
    'NMIMS online MBA NAAC A++',
    'NMIMS MBA UGC DEB approved',
    'NGASCE online MBA fees',
  ],
  'nmims-online-mca': [
    'NMIMS online MCA fees 2026',
    'NMIMS distance MCA syllabus',
    'NMIMS online MCA admission 2026',
    'NMIMS MCA UGC DEB approved',
    'NGASCE online MCA India',
  ],
  'nmims-online-bba': [
    'NMIMS online BBA fees 2026',
    'NMIMS distance BBA syllabus',
    'NMIMS online BBA admission 2026',
    'NMIMS BBA UGC DEB approved',
    'NGASCE online BBA India',
  ],
  'nmims-online-bca': [
    'NMIMS online BCA fees 2026',
    'NMIMS distance BCA syllabus',
    'NMIMS online BCA admission 2026',
    'NMIMS BCA UGC DEB approved',
    'NGASCE online BCA India',
  ],

  // ── Manipal University Jaipur Online ────────────────────────────────────────
  'manipal-university-jaipur-online-mba': [
    'Manipal University Jaipur online MBA fees 2026',
    'MUJ online MBA syllabus',
    'MUJ online MBA placements',
    'Manipal online MBA admission 2026',
    'MUJ MBA NAAC A+',
    'Manipal Jaipur distance MBA India',
  ],
  'manipal-university-jaipur-online-mca': [
    'Manipal University Jaipur online MCA fees 2026',
    'MUJ online MCA syllabus',
    'MUJ online MCA placements',
    'Manipal online MCA admission 2026',
    'Manipal Jaipur distance MCA India',
  ],
  'manipal-university-jaipur-online-bba': [
    'Manipal University Jaipur online BBA fees 2026',
    'MUJ online BBA syllabus',
    'MUJ online BBA admission 2026',
    'Manipal Jaipur distance BBA India',
    'MUJ BBA UGC DEB approved',
  ],
  'manipal-university-jaipur-online-bca': [
    'Manipal University Jaipur online BCA fees 2026',
    'MUJ online BCA syllabus',
    'MUJ online BCA admission 2026',
    'Manipal Jaipur distance BCA India',
    'MUJ BCA UGC DEB approved',
  ],

  // ── Lovely Professional University Online ───────────────────────────────────
  'lovely-professional-university-online-mba': [
    'LPU online MBA fees 2026',
    'Lovely Professional University online MBA syllabus',
    'LPU distance MBA India review',
    'LPU online MBA admission 2026',
    'LPU MBA NAAC A+',
    'Lovely Professional University MBA UGC DEB approved',
  ],
  'lovely-professional-university-online-mca': [
    'LPU online MCA fees 2026',
    'Lovely Professional University online MCA syllabus',
    'LPU distance MCA India',
    'LPU online MCA admission 2026',
    'LPU MCA UGC DEB approved',
  ],
  'lovely-professional-university-online-bba': [
    'LPU online BBA fees 2026',
    'Lovely Professional University online BBA syllabus',
    'LPU distance BBA India',
    'LPU online BBA admission 2026',
    'LPU BBA UGC DEB approved',
  ],
  'lovely-professional-university-online-bca': [
    'LPU online BCA fees 2026',
    'Lovely Professional University online BCA syllabus',
    'LPU distance BCA India',
    'LPU online BCA admission 2026',
    'LPU BCA UGC DEB approved',
  ],

  // ── Chandigarh University Online ────────────────────────────────────────────
  'chandigarh-university-online-mba': [
    'Chandigarh University online MBA fees 2026',
    'CU online MBA syllabus',
    'Chandigarh University distance MBA review',
    'CU online MBA admission 2026',
    'Chandigarh University MBA NAAC A+',
    'CU online MBA UGC DEB approved',
  ],
  'chandigarh-university-online-mca': [
    'Chandigarh University online MCA fees 2026',
    'CU online MCA syllabus',
    'Chandigarh University distance MCA India',
    'CU online MCA admission 2026',
    'Chandigarh University MCA UGC DEB approved',
  ],
  'chandigarh-university-online-bba': [
    'Chandigarh University online BBA fees 2026',
    'CU online BBA syllabus',
    'Chandigarh University distance BBA India',
    'CU online BBA admission 2026',
    'Chandigarh University BBA UGC approved',
  ],
  'chandigarh-university-online-bca': [
    'Chandigarh University online BCA fees 2026',
    'CU online BCA syllabus',
    'Chandigarh University distance BCA India',
    'CU online BCA admission 2026',
    'Chandigarh University BCA UGC approved',
  ],

  // ── Jain University Online ──────────────────────────────────────────────────
  'jain-university-online-mba': [
    'Jain University online MBA fees 2026',
    'Jain online MBA syllabus',
    'Jain distance MBA India review',
    'Jain University online MBA admission 2026',
    'Jain online MBA NAAC A+',
    'Jain University MBA UGC DEB approved',
  ],
  'jain-university-online-mca': [
    'Jain University online MCA fees 2026',
    'Jain online MCA syllabus',
    'Jain distance MCA India',
    'Jain University online MCA admission 2026',
    'Jain MCA UGC DEB approved',
  ],
  'jain-university-online-bba': [
    'Jain University online BBA fees 2026',
    'Jain online BBA syllabus',
    'Jain distance BBA India',
    'Jain University online BBA admission 2026',
    'Jain BBA UGC DEB approved',
  ],
  'jain-university-online-bca': [
    'Jain University online BCA fees 2026',
    'Jain online BCA syllabus',
    'Jain distance BCA India',
    'Jain University online BCA admission 2026',
    'Jain BCA UGC DEB approved',
  ],

  // ── Symbiosis Online ────────────────────────────────────────────────────────
  'symbiosis-university-online-mba': [
    'Symbiosis online MBA fees 2026',
    'SCDL online MBA syllabus',
    'Symbiosis distance MBA India review',
    'Symbiosis online MBA admission 2026',
    'Symbiosis online MBA NAAC A',
    'SCDL MBA UGC DEB approved',
    'Symbiosis Centre Distance Learning MBA',
  ],
  'symbiosis-university-online-mca': [
    'Symbiosis online MCA fees 2026',
    'SCDL online MCA syllabus',
    'Symbiosis distance MCA India',
    'Symbiosis online MCA admission 2026',
    'SCDL MCA UGC DEB approved',
  ],
  'symbiosis-university-online-bba': [
    'Symbiosis online BBA fees 2026',
    'SCDL online BBA syllabus',
    'Symbiosis distance BBA India',
    'Symbiosis online BBA admission 2026',
    'SCDL BBA UGC DEB approved',
  ],
  'symbiosis-university-online-bca': [
    'Symbiosis online BCA fees 2026',
    'SCDL online BCA syllabus',
    'Symbiosis distance BCA India',
    'Symbiosis online BCA admission 2026',
    'SCDL BCA UGC DEB approved',
  ],

  // ── DY Patil University Online ──────────────────────────────────────────────
  'dy-patil-university-online-mba': [
    'DY Patil online MBA fees 2026',
    'DYPU online MBA syllabus',
    'DY Patil distance MBA India review',
    'DY Patil online MBA admission 2026',
    'DYPU MBA UGC DEB approved',
    'DY Patil University online MBA Navi Mumbai',
  ],
  'dy-patil-university-online-mca': [
    'DY Patil online MCA fees 2026',
    'DYPU online MCA syllabus',
    'DY Patil distance MCA India',
    'DY Patil online MCA admission 2026',
    'DYPU MCA UGC DEB approved',
  ],
  'dy-patil-university-online-bba': [
    'DY Patil online BBA fees 2026',
    'DYPU online BBA syllabus',
    'DY Patil distance BBA India',
    'DY Patil online BBA admission 2026',
    'DYPU BBA UGC DEB approved',
  ],
  'dy-patil-university-online-bca': [
    'DY Patil online BCA fees 2026',
    'DYPU online BCA syllabus',
    'DY Patil distance BCA India',
    'DY Patil online BCA admission 2026',
    'DYPU BCA UGC DEB approved',
  ],

  // ── IGNOU Online ────────────────────────────────────────────────────────────
  'ignou-online-mba': [
    'IGNOU online MBA fees 2026',
    'IGNOU MBA syllabus',
    'IGNOU distance MBA India review',
    'IGNOU MBA admission 2026',
    'IGNOU MBA UGC approved',
    'Indira Gandhi National Open University MBA',
    'IGNOU MBA government recognised',
  ],
  'ignou-online-mca': [
    'IGNOU online MCA fees 2026',
    'IGNOU MCA syllabus',
    'IGNOU distance MCA India',
    'IGNOU MCA admission 2026',
    'IGNOU MCA UGC approved',
    'Indira Gandhi National Open University MCA',
  ],
  'ignou-online-bba': [
    'IGNOU online BBA fees 2026',
    'IGNOU BBA syllabus',
    'IGNOU distance BBA India',
    'IGNOU BBA admission 2026',
    'IGNOU BBA UGC approved',
  ],
  'ignou-online-bca': [
    'IGNOU online BCA fees 2026',
    'IGNOU BCA syllabus',
    'IGNOU distance BCA India',
    'IGNOU BCA admission 2026',
    'IGNOU BCA UGC approved',
    'Indira Gandhi National Open University BCA',
  ],
}
