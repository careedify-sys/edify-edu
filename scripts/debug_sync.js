const XLSX = require('xlsx');
const fs = require('fs');

const EXCEL_PATH = 'c:/Users/91706/Downloads/edify-v16-final-with-cms/edify-next/extracted_rankings/ALL_125_Universities_CLEAN_Enhanced.xlsx';
const DATA_TS = 'c:/Users/91706/Downloads/edify-v16-final-with-cms/edify-next/lib/data.ts';

function normalize(text) {
  return text.toLowerCase()
    .replace(/[^\w]/g, '')
    .trim();
}

const workbook = XLSX.readFile(EXCEL_PATH);
const sheet = workbook.SheetNames.includes('Sheet1') ? workbook.Sheets['Sheet1'] : workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet).slice(1);

const extractedData = rows.map(r => {
  const name = String(r['__EMPTY'] || '').trim();
  if (!name || name === 'University Name') return null;
  return { name, normName: normalize(name) };
}).filter(Boolean);

const content = fs.readFileSync(DATA_TS, 'utf8');
const idRegex = /id:\s*['"]([^'"]+)['"]/g;
let match;
const missed = [];

while ((match = idRegex.exec(content)) !== null) {
  const id = match[1];
  const blockRegex = new RegExp(`id:\\s*['"]${id}['"]([\\s\\S]*?)}`);
  const blockMatch = content.match(blockRegex);
  if (blockMatch) {
    const nameMatch = blockMatch[1].match(/name:\s*['"]([^'"]+)['"]/);
    if (nameMatch) {
      const codeName = nameMatch[1];
      const normCodeName = normalize(codeName);
      const found = extractedData.find(u => 
        u.normName === normCodeName || 
        u.normName.includes(normCodeName) || 
        normCodeName.includes(u.normName)
      );
      if (!found) {
        missed.push({ id, codeName });
      }
    }
  }
}

console.log('Missed Universities:');
console.log(JSON.stringify(missed, null, 2));
console.log(`Total missed: ${missed.length}`);
