#!/usr/bin/env node
// Fix MASTER_SYLLABUS keys in lib/content.ts
// Old format: 'amity||MBA'  →  New format: 'amity-university-online||MBA'

const fs = require('fs');
const path = require('path');

// Map from old truncated key → new full slug
const ID_MAP = {
  'alagappa-universi': 'alagappa-university-online',
  'aligarh-muslim-universi': 'aligarh-muslim-university-online',
  'alliance-universi': 'alliance-university-online',
  'amet-universi': 'amet-university-online',
  'amity': 'amity-university-online',
  'amrita-vishwa-vidyapee': 'amrita-vishwa-vidyapeetham-online',
  'andhra-universi': 'andhra-university-online',
  'anna-universi': 'anna-university-online',
  'arka-jain-universi': 'arka-jain-university-online',
  'assam-down-town-universi': 'assam-don-bosco-university-online',
  'bharathi-universi': 'bharath-university-online',
  'bharathidasan-uni': 'bharathidasan-university-online',
  'bharati-vidyapee-universi': 'bharati-vidyapeeth-university-online',
  'birla-institut-of-technolo': 'bits-pilani-work-integrated-online',
  'bs-abdur-rahman-institut': 'bs-abdur-rahman-university-online',
  'centurio-universi-of-technolo': 'centurion-university-online',
  'chandigarh': 'chandigarh-university-online',
  'charotar-universi-of-science': 'charusat-university-online',
  'chatrapa-shahuji-maharaj-unive': 'chhatrapati-shahu-ji-maharaj-university-online',
  'chitkara-universi': 'chitkara-university-online',
  'christ-deemed-to-be': 'christ-university-online',
  'datta-meghe-institut-of': 'datta-meghe-university-online',
  'dayal-bagh-educatio-institut': 'dayalbagh-educational-institute-online',
  'dayanand-sagar-universi': 'dayananda-sagar-university-online',
  'desh-bhagat-universi': 'desh-bhagat-university-online',
  'dr-babasahe-ambedkar-open': 'dr-babasaheb-ambedkar-open-university-online',
  'dr-dy-patil-vidyapeeth': 'dr-dy-patil-vidyapeeth-online',
  'dr-mgr-educatio-and': 'dr-mgr-educational-research-institute-online',
  'dypatil': 'dy-patil-university-online',
  'galgotia-universi': 'galgotias-university-online',
  'ganpat-universi': 'ganpat-university-online',
  'gla-universi': 'gla-university-online',
  'gls-universi': 'gls-university-online',
  'gujarat-technolo-universi': 'gujarat-technological-university-online',
  'gujarat-universi': 'gujarat-university-online',
  'guru-ghasidas-vishwavi': 'guru-ghasidas-vishwavidyalaya-online',
  'guru-kashi-universi': 'guru-kashi-university-online',
  'guru-nanak-dev-universi': 'guru-nanak-dev-university-online',
  'hindusta-institut-of-technolo': 'hindustan-institute-technology-online',
  'icfai-foundati-for-higher': 'icfai-university-online',
  'iift': 'iift-online',
  'integral-universi': 'integral-university-online',
  'jagan-nath-universi': 'jagannath-university-online',
  'jain': 'jain-university-online',
  'jaipur-national-universi': 'jaipur-national-university-online',
  'jamia-millia-islamia-universi': 'jamia-millia-islamia-online',
  'jaypee-universi': 'jaypee-university-online',
  'jss-academy-of-higher': 'jss-university-online',
  'kalasali-academy-of-research': 'kalasalingam-university-online',
  'karnatak-state-open-universi': 'karnataka-state-open-university-online',
  'karunya-institut-of-technolo': 'karunya-university-online',
  'karunya-kcode-universi': 'karunya-kcode-online',
  'kiit-universi': 'kiit-university-online',
  'koneru-lakshmai-educatio-found': 'kl-university-online',
  'kurukshe-universi': 'kurukshetra-university-online',
  'lpu': 'lovely-professional-university-online',
  'madurai-kamaraj-universi': 'madurai-kamaraj-university-online',
  'maharish-markande-universi': 'maharishi-markandeshwar-university-online',
  'mahatma-gandhi-universi': 'mahatma-gandhi-university-online',
  'mahe-manipal': 'manipal-academy-higher-education-online',
  'manav-rachna-internat-institut': 'manav-rachna-online',
  'mangalay-universi': 'mangalayatan-university-online',
  'manipal-jaipur': 'manipal-university-jaipur-online',
  'manonman-sundaran-universi': 'manonmaniam-sundaranar-university-online',
  'marwadi-universi': 'marwadi-university-online',
  'mats-universi': 'mats-university-online',
  'mizoram-universi': 'mizoram-university-online',
  'nmims': 'nmims-online',
  'noida-internat-universi': 'noida-international-university-online',
  'northcap-universi': 'northcap-university-online',
  'parul-universi': 'parul-university-online',
  'pp-savani-universi': 'pp-savani-university-online',
  'sastra-deemed-universi': 'sastra-university-online',
  'sathyaba-institut-of-science': 'sathyabama-university-online',
  'savitrib-phule-pune-universi': 'savitribai-phule-pune-university-online',
  'sgt-universi': 'sgt-university-online',
  'sharda-universi': 'sharda-university-online',
  'shiv-nadar-institut-of': 'shiv-nadar-university-online',
  'shobhit-universi': 'shobhit-university-online',
  'shoolini': 'shoolini-university-online',
  'sikkim-manipal': 'sikkim-manipal-university-online',
  'sri-ramachandra-universi': 'sri-ramachandra-university-online',
  'srm-institut-of-science': 'srm-institute-science-technology-online',
  'srm-sikkim-universi': 'srm-university-sikkim-online',
  'subharti-universi': 'subharti-university-online',
  'symbiosis': 'symbiosis-university-online',
  'teerthanker-universi': 'teerthanker-mahaveer-university-online',
  'universi-of-himachal-pradesh': 'central-university-himachal-pradesh-online',
  'universi-of-lucknow': 'university-of-lucknow-online',
  'universi-of-madras': 'university-of-madras-online',
  'universi-of-mysore': 'university-of-mysore-online',
  'universi-of-petroleu-and': 'upes-online',
  'uttaranc-universi': 'uttaranchal-university-online',
  'vellore-institut-of-technolo': 'vit-vellore-online',
  'vellore-vit-online': 'vit-university-online',
  'vels-institut-of-science': 'vels-university-online',
  'vignans-foundati-for-science': 'vignan-university-online',
  'visveswa-technolo-universi': 'vtu-online',
  'vivekana-global-universi': 'vivekananda-global-university-online',
  'yenepoya-universi': 'yenepoya-university-online',
};

const filePath = path.join(__dirname, '..', 'lib', 'content.ts');
console.log('Reading file...');
const content = fs.readFileSync(filePath, 'utf8');
console.log(`File size: ${(content.length / 1024).toFixed(1)} KB`);

let updated = content;
let count = 0;

for (const [oldId, newId] of Object.entries(ID_MAP)) {
  // Match: 'oldId||  (with the pipe-pipe after)
  const escaped = oldId.replace(/[-]/g, '\\-').replace(/[.]/g, '\\.');
  const regex = new RegExp(`'${escaped}\\|\\|`, 'g');
  const before = updated;
  updated = updated.replace(regex, `'${newId}||`);
  const replacements = (before.match(regex) || []).length;
  if (replacements > 0) {
    console.log(`  ${oldId} → ${newId} (${replacements} replacements)`);
    count += replacements;
  }
}

console.log(`\nTotal replacements: ${count}`);
console.log('Writing file...');
fs.writeFileSync(filePath, updated, 'utf8');
console.log('Done!');
