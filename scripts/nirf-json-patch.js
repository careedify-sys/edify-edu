const fs = require('fs');
const path = require('path');
const dir = 'lib/data/page-content';

// Per-file replacements: [old, new]
const fixes = {
  'assam-don-bosco-university-online-mba.json': [
    ['NIRF #151 · UGC-DEB · 6 specialisa', 'Not in NIRF 2025 top lists · UGC-DEB · 6 specialisa'],
    ['NIRF #151 overall ranking. EdifyEd', 'Assam Don Bosco University is not listed in NIRF 2025 rankings. EdifyEd'],
    ['NIRF #151 overall ranking (nirfind', 'NIRF not listed in 2025 rankings (nirfind'],
    ['NIRF #151, 2 years (4 semesters, m', 'Not listed in NIRF 2025, 2 years (4 semesters, m'],
    ['NIRF #52, Rs 1,08,500, 3 specialis', 'NAAC A, Rs 1,08,500, 3 specialis'],
    ['NIRF #43, Rs 1,20,000, 8 specialis', 'NIRF not listed (DSU 2025), Rs 1,20,000, 8 specialis'],
    ['NIRF top-100 thresholds.', 'NIRF top-100 thresholds.'],
    ['NIRF #151 was questioned', 'The absence of a NIRF top-100 listing was questioned'],
    ['NIRF #151 limits national employer', 'The lack of NIRF top-100 listing limits national employer'],
    ['NIRF #151 places Assam Don Bosco U', 'Assam Don Bosco University is not listed in NIRF 2025 rankings'],
    ['NIRF top-100 filter, verify whethe', 'NIRF top-100 filter, verify whether'],
    ['NIRF #151 meets their minimum', 'a NIRF top-100 listing meets their minimum'],
    ['NIRF rank of Assam Don Bosco Unive', 'NIRF rank of Assam Don Bosco Unive'],
    ['NIRF #151', 'Not listed in NIRF 2025'],
  ],
  'christ-university-online-mba.json': [
    ['NIRF #60, 2 years (4 semesters), R', 'NIRF #57 (Management 2025), 2 years (4 semesters), R'],
    ['NIRF #60, Business Analytics Speci', 'NIRF #57 (Management 2025), Business Analytics Speci'],
    ['NIRF #60 · UGC-DEB · WES Recognise', 'NIRF #57 (Management 2025) · UGC-DEB · WES Recognise'],
    ['NIRF #60 overall ranking. EdifyEdu', 'NIRF #57 (Management 2025) ranking. EdifyEdu'],
    ['NIRF #60 overall ranking (nirfindi', 'NIRF #57 (Management 2025) ranking (nirfindi'],
    ['NIRF #60, Rs 60K-2L indicative fee', 'NIRF #57 (Management 2025), Rs 60K-2L indicative fee'],
    ['NIRF #18, Rs 1.89L fixed fee, 5 sp', 'NIRF #56 (Management 2025), Rs 1.89L fixed fee, 5 sp'],
    ['NIRF #11, Rs 1,60,000 fixed fee, 5', 'NIRF #14 (University 2025), Rs 1,60,000 fixed fee, 5'],
    ['NIRF top-20 is a hiring criterion', 'NIRF top-20 is a hiring criterion'],
    ['NIRF #60 did not fully satisfy', 'NIRF #57 (Management 2025) was accepted'],
    ['NIRF #60 in the University categor', 'NIRF #57 in the Management 2025 category'],
    ['NIRF #60 before choosing', 'NIRF #57 before choosing'],
    ['NIRF rank of Christ (Deemed to be', 'NIRF rank of Christ (Deemed to be'],
    ['NIRF #60', 'NIRF #57 (Management 2025)'],
  ],
  'vit-university-online-mba.json': [
    ['NIRF #11, 2 years (4 semesters), R', 'NIRF #14 (University 2025), 2 years (4 semesters), R'],
    ['NIRF top-20 online MBA degree with', 'NIRF top-20 online MBA degree with'],
    ['NIRF #11, 5 Specialisations', 'NIRF #14 (University 2025), 5 Specialisations'],
    ['NIRF #11 in the University categor', 'NIRF #14 in the University category (2025)'],
    ['NIRF #11 · UGC-DEB · WES Recognise', 'NIRF #14 (University 2025) · UGC-DEB · WES Recognise'],
    ['NIRF #11 overall ranking — one of ', 'NIRF #14 overall University ranking (2025) — one of '],
    ['NIRF #11 overall ranking (nirfindi', 'NIRF #14 (University 2025) ranking (nirfindi'],
    ['NIRF #11, Rs 1,60,000 fixed fee, 5', 'NIRF #14 (University 2025), Rs 1,60,000 fixed fee, 5'],
    ['NIRF rank in this comparison set.', 'NIRF rank in this comparison set.'],
    ['NIRF #18, Rs 1.89L fixed fee, 5 sp', 'NIRF #56 (Management 2025), Rs 1.89L fixed fee, 5 sp'],
    ['NIRF #60, Rs 60K-2L indicative fee', 'NIRF #57 (Management 2025), Rs 60K-2L indicative fee'],
    ['NIRF top-15 is a filter', 'NIRF top-15 is a filter'],
    ['NIRF #11 was the deciding factor', 'NIRF #14 (University 2025) was the deciding factor'],
    ['NIRF top-20 filter and VIT cleared', 'NIRF top-20 filter and VIT cleared'],
    ['NIRF top-20 institution', 'NIRF top-20 University institution'],
    ['NIRF #11 brand premium', 'NIRF #14 brand premium'],
    ['NIRF rank of VIT', 'NIRF rank of VIT'],
    ['NIRF #11', 'NIRF #14 (University 2025)'],
  ],
  'srm-institute-science-technology-online-mba.json': [
    ['NIRF #18, Category 1 University, 2', 'NIRF #56 (Management 2025), Category 1 University, 2'],
    ['NIRF #18, Category 1 University, 5', 'NIRF #56 (Management 2025), Category 1 University, 5'],
    ['NIRF #18 in the University categor', 'NIRF #56 in the Management 2025 category (NIRF #11 University)'],
    ['NIRF #18 · Category 1 University ·', 'NIRF #56 (Management 2025) · Category 1 University ·'],
    ['NIRF #18 overall ranking, and Cate', 'NIRF #56 (Management 2025) ranking, and Category 1'],
    ['NIRF #18 overall ranking (nirfindi', 'NIRF #56 (Management 2025) ranking (nirfindi'],
    ['NIRF #18, Rs 1.89L fixed fee, Cate', 'NIRF #56 (Management 2025), Rs 1.89L fixed fee, Cate'],
    ['NIRF #11, Rs 1.60L fixed fee, 5 sp', 'NIRF #14 (University 2025), Rs 1.60L fixed fee, 5 sp'],
    ['NIRF top-15 is a filter', 'NIRF top-20 is a filter'],
    ['NIRF #4 (central university), Rs 5', 'NIRF #28 (Management 2025) / #4 (University 2025), Rs 5'],
    ['NIRF in University category. Centr', 'NIRF #11 in University category. Centr'],
    ['NIRF #4 central university status', 'NIRF top-5 University central university status'],
    ['NIRF #18 cleared every background', 'NIRF #56 (Management 2025) cleared every background'],
    ['NIRF level. Major Project', 'NIRF category. Major Project'],
    ['NIRF #18 combination justifies', 'NIRF #56 (Management) and Category 1 combination justifies'],
    ['NIRF rank of SRM IST', 'NIRF rank of SRM IST'],
    ['NIRF #18', 'NIRF #56 (Management 2025)'],
  ],
  'jamia-millia-islamia-online-mba.json': [
    ['NIRF #4 (central university), 2 ye', 'NIRF #28 (Management 2025) / #4 (University 2025), 2 ye'],
    ['NIRF #4, Central University, Rs 50', 'NIRF #28 (Management) / #4 (University), Central University, Rs 50'],
    ['one of the most distinguished', 'one of the most distinguished'],
    ['NIRF #4 (Central University) · UGC', 'NIRF #28 (Management 2025) · #4 (University 2025) · UGC'],
    ['NIRF #4 in the University category', 'NIRF #4 in the University 2025 category'],
    ['NIRF #4 overall ranking in the Uni', 'NIRF #28 (Management 2025) / #4 (University 2025) ranking'],
    ['NIRF #4 central university credent', 'NIRF Management top-30 central university credent'],
    ['NIRF #4 ranking significantly enha', 'NIRF top-30 Management ranking and central university status enha'],
    ['NIRF #4 (central university), Rs 5', 'NIRF #28 (Management 2025), Rs 5'],
    ['NIRF #18, Rs 1.89L fixed fee, 5 sp', 'NIRF #56 (Management 2025), Rs 1.89L fixed fee, 5 sp'],
    ['NIRF #11, Rs 1.60L fixed fee, 5 sp', 'NIRF #14 (University 2025), Rs 1.60L fixed fee, 5 sp'],
    ['NIRF top-10 is a requirement and c', 'NIRF top-30 (Management) is a requirement and c'],
    ['NIRF #4 cleared every government e', 'NIRF top-30 Management rank and NIRF #4 University cleared every government e'],
    ['NIRF #4 and NAAC A++ are genuinely', 'NIRF #28 (Management) and #4 (University) and NAAC A++ are genuinely'],
    ['NIRF #4 brand value', 'NIRF top-5 University brand value'],
    ['top-10 online MBA in India. E', 'top-30 Management-ranked online MBA in India. E'],
    ['NIRF #4.', 'NIRF #28 (Management 2025) / #4 (University 2025).'],
    ['NIRF #4 (University 2025)', 'NIRF #4 (University 2025)'],
    ['NIRF #4', 'NIRF #28 (Management 2025) / #4 (University 2025)'],
  ],
  'sastra-university-online-mba.json': [
    ['NIRF #29, 2 years (4 semesters), R', 'NIRF #29 (University 2025), 2 years (4 semesters), R'],
    ['NIRF top-30 South India university', 'NIRF #29 (University 2025) South India university'],
    ['NIRF #29, Phygital Retailing, WES ', 'NIRF #29 (University 2025), Phygital Retailing, WES '],
    ['NIRF #29 · UGC-DEB · WES Recognise', 'NIRF #29 (University 2025) · UGC-DEB · WES Recognise'],
    ['NIRF #29 overall ranking. EdifyEdu', 'NIRF #29 (University 2025) ranking. EdifyEdu'],
    ['NIRF #29 overall ranking (nirfindi', 'NIRF #29 (University 2025) ranking (nirfindi'],
    ['NIRF #29, Rs 60K-2.4L indicative f', 'NIRF #29 (University 2025), Rs 60K-2.4L indicative f'],
    ['NIRF #11, Rs 1.60L fixed fee, 5 sp', 'NIRF #14 (University 2025), Rs 1.60L fixed fee, 5 sp'],
    ['NIRF #60, Rs 60K-2L indicative fee', 'NIRF #57 (Management 2025), Rs 60K-2L indicative fee'],
    ['top-15 is a threshold', 'top-15 is a threshold'],
    ['NIRF #29 are sufficient filters', 'NIRF #29 (University 2025) are sufficient filters'],
    ['NIRF top-20 is an absolute filter', 'NIRF top-20 is an absolute filter'],
    ['NIRF #29 ranking meant', 'NIRF #29 (University 2025) ranking meant'],
    ['NIRF #29 with NAAC A++', 'NIRF #29 (University 2025) with NAAC A++'],
    ['NIRF #29 in the University categor', 'NIRF #29 (University 2025) in the University category'],
    ['NIRF rank.', 'NIRF rank.'],
    ['NIRF #29 before choosing', 'NIRF #29 before choosing'],
  ],
  'alliance-university-online-mba.json': [
    ['NIRF Management #25', 'NIRF #71 (Management 2025)'],
    ['NIRF Management rank #25', 'NIRF #71 (Management 2025)'],
    ['Management rank #25', 'Management #71 (2025)'],
    ['NIRF #19, Rs 1,65,000, 23 speciali', 'NIRF #32 (Management 2025), Rs 1,65,000, 23 speciali'],
    ['NIRF #25', 'NIRF #71 (Management 2025)'],
  ],
  'amrita-vishwa-vidyapeetham-online-mba.json': [
    ['NIRF #7, NAAC A++. 8 specialisatio', 'NIRF #26 (Management 2025) / #8 (University), NAAC A++. 8 specialisatio'],
    ['NIRF #7, NAAC A++, WES-recognised', 'NIRF #26 (Management 2025), NAAC A++, WES-recognised'],
    ['NIRF #7 overall and NAAC A++ accre', 'NIRF #26 (Management 2025) / #8 (University 2025) and NAAC A++ accre'],
    ['NIRF #7 overall and NIRF #26 in Ma', 'NIRF #8 (University 2025) and NIRF #26 (Management 2025)'],
    ['NIRF #7, NAAC A++, Rs 1,76,000, 8', 'NIRF #26 (Management 2025), NAAC A++, Rs 1,76,000, 8'],
    ['NIRF #7 at under Rs 2 lakh', 'NIRF #26 Management and #8 University at under Rs 2 lakh'],
    ['NIRF top-10 at under Rs 2 lakh', 'NIRF top-30 Management at under Rs 2 lakh'],
    ['NIRF top-3', 'NIRF top-10 University'],
    ['NIRF #3, NAAC A++, Rs 2,92,000, 9', 'NIRF #3 (University 2025), NAAC A++, Rs 2,92,000, 9'],
    ['NIRF #19, NAAC A+, Rs 1,65,000, 23', 'NIRF #32 (Management 2025), NAAC A+, Rs 1,65,000, 23'],
    ['NIRF #7', 'NIRF #8 (University 2025)'],
  ],
  'arka-jain-university-online-mba.json': [
    ['NIRF #52 · NAAC A · UGC-DEB', 'NAAC A · UGC-DEB'],
    ['NIRF #52, NAAC A, Rs 1.08L', 'NAAC A, Rs 1.08L (NIRF not listed 2025)'],
    ['NIRF-ranked online MBA with Fintec', 'NAAC A accredited online MBA with Fintec'],
    ['NIRF #43, Rs 1,20,000, 8 specialis', 'DSU (NIRF not listed 2025), Rs 1,20,000, 8 specialis'],
    ['NIRF rank #52 provides', 'NAAC A accreditation provides'],
    ['NIRF-ranked degree', 'UGC-DEB approved degree'],
    ['NIRF top-20 or top-30, verify', 'If NIRF rank is required, verify'],
    ['NIRF #52', 'Not listed in NIRF 2025'],
  ],
  'chitkara-university-online-mba.json': [
    ['NIRF #54 · UGC-DEB', 'NIRF #78 (Management 2025) · UGC-DEB'],
    ['NIRF #54, AI minor', 'NIRF #78 (Management 2025), AI minor'],
    ['NIRF #54, 2 years', 'NIRF #78 (Management 2025), 2 years'],
    ['NIRF #54 overall ranking. EdifyEdu', 'NIRF #78 (Management 2025) ranking. EdifyEdu'],
    ['NIRF #54 overall ranking (nirfindi', 'NIRF #78 (Management 2025) ranking (nirfindi'],
    ['NIRF #54 at a flexible fee', 'NIRF #78 (Management 2025) at a flexible fee'],
    ['NIRF #54 was recognised', 'NIRF #78 (Management 2025) was recognised'],
    ['NIRF #54 is outside top-50', 'NIRF #78 (Management 2025) is outside top-50'],
    ['NIRF #54 places Chitkara', 'NIRF #78 (Management 2025) places Chitkara'],
    ['NIRF #54, Rs 50K-3L (scholarship-d', 'NIRF #78 (Management 2025), Rs 50K-3L (scholarship-d'],
    ['NIRF #54, Rs 50K-3L fee', 'NIRF #78 (Management 2025), Rs 50K-3L fee'],
    ['NIRF #22) or Manipal (NIRF top-50)', 'NIRF #49 Management (Amity) or Manipal (NIRF top-5 University)'],
    ['NIRF #54 in the overall university', 'NIRF #78 in the Management 2025 rankings'],
    ['NIRF #54', 'NIRF #78 (Management 2025)'],
  ],
  'dayananda-sagar-university-online-mba.json': [
    ['NIRF #43 · NAAC A · UGC-DEB', 'NAAC A · UGC-DEB (NIRF not listed 2025)'],
    ['NIRF #43, WES Recognised, 2 years', 'Not listed in NIRF 2025, WES Recognised, 2 years'],
    ['NIRF #43, WES-recognised online MB', 'WES-recognised online MBA (NIRF not listed 2025)'],
    ['NIRF #43, NAAC A, WES Recognised,', 'NAAC A, WES Recognised (NIRF not listed 2025),'],
    ['NIRF #43 overall ranking and Benga', 'WES recognition and NAAC A accreditation and Benga'],
    ['NIRF #43 overall ranking, making i', 'WES and NAAC A accreditation making i'],
    ['NIRF #43 overall ranking (nirfindi', 'Not listed in NIRF 2025 rankings (nirfindi'],
    ['NIRF #43 ranking gives the degree', 'NAAC A and WES recognition give the degree'],
    ['NIRF #43, Rs 1,20,000, 8 specialis', 'Not listed in NIRF 2025, Rs 1,20,000, 8 specialis'],
    ['NIRF #22, Rs 1.15L-2.25L, 12 speci', 'NIRF #49 (Management 2025), Rs 1.15L-2.25L, 12 speci'],
    ['NIRF rank. Choose DSU if NIRF #43', 'DSU is not listed in NIRF 2025 rankings'],
    ['NIRF #43 and WES recognition at Rs', 'NAAC A and WES recognition at Rs'],
    ['NIRF #43 and Rs 1.2 lakh', 'NAAC A and WES and Rs 1.2 lakh'],
    ['NIRF #43 gave the degree good reco', 'NAAC A gave the degree good reco'],
    ['NIRF #43 is hard to beat on value', 'NAAC A and WES recognition is hard to beat on value'],
    ['NIRF #43 are solid credentials', 'NAAC A and WES recognition are solid credentials'],
    ['NIRF #43 and WES recognition for R', 'NAAC A and WES recognition for R'],
    ['NIRF #43 in the overall university', 'DSU is not listed in NIRF 2025'],
    ['NIRF rank and NAAC grade of Dayana', 'NAAC grade of Dayana'],
    ['NIRF #43', 'Not listed in NIRF 2025'],
  ],
  'galgotias-university-online-mba.json': [
    ['NIRF #101, NAAC A+. 7 specialisati', 'NIRF band 101-125 (Management 2025), NAAC A+. 7 specialisati'],
    ['NIRF ranking for Galgotias overall', 'NIRF band for Galgotias overall'],
    ['NIRF #101, NAAC A+, Rs 76,200, 7 s', 'NIRF band 101-125, NAAC A+, Rs 76,200, 7 s'],
    ['NIRF rank of 101+ in management', 'NIRF band 101-125 in management'],
    ['NIRF top-50 filter for postgraduat', 'NIRF top-100 filter for postgraduat'],
    ['NIRF #101', 'NIRF band 101-125 (Management 2025)'],
  ],
};

let totalReplacements = 0;
for (const [filename, replacements] of Object.entries(fixes)) {
  const filepath = path.join(dir, filename);
  if (!fs.existsSync(filepath)) {
    console.log('SKIP (not found): ' + filename);
    continue;
  }
  let content = fs.readFileSync(filepath, 'utf8');
  let count = 0;
  for (const [old, nw] of replacements) {
    if (old === nw) continue;
    let prev;
    do {
      prev = content;
      content = content.replace(old, nw);
      if (content !== prev) count++;
    } while (content !== prev);
  }
  fs.writeFileSync(filepath, content);
  console.log(filename + ': ' + count + ' replacements');
  totalReplacements += count;
}
console.log('\nTotal JSON replacements: ' + totalReplacements);
