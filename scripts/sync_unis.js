const XLSX = require('xlsx');
const fs = require('fs');

const EXCEL_PATH = 'c:/Users/91706/Downloads/edify-v16-final-with-cms/edify-next/extracted_rankings/ALL_125_Universities_CLEAN_Enhanced.xlsx';
const DATA_TS = 'c:/Users/91706/Downloads/edify-v16-final-with-cms/edify-next/lib/data.ts';
const SLIM_TS = 'c:/Users/91706/Downloads/edify-v16-final-with-cms/edify-next/lib/data-slim.ts';

function normalize(text) {
  return text.toLowerCase()
    .replace(/[^\w]/g, '')
    .trim();
}

const workbook = XLSX.readFile(EXCEL_PATH);
const sheet = workbook.Sheets[workbook.SheetNames[0]];
const rows = XLSX.utils.sheet_to_json(sheet).slice(1);

const manualMapping = {
  'amity': 'Amity University Online',
  'jain': 'JAIN (Deemed-to-be University) Online',
  'lpu': 'Lovely Professional University Online',
  'dayanand-sagar-universi': 'Dayananda Sagar University Online',
  'dypatil': 'D.Y. Patil University, Navi Mumbai Online',
  'universi-of-petroleu-and': 'University of Petroleum & Energy Studies (UPES) Online',
  'amrita-vishwa-vidyapee': 'Amrita Vishwa Vidyapeetham Online',
  'shoolini': 'Shoolini University Online',
  'sikkim-manipal': 'Sikkim Manipal University Online',
  'chitkara-universi': 'Chitkara University Online',
  'sharda-universi': 'Sharda University Online',
  'vignans-foundati-for-science': 'Vignans Foundation for Science Technology and Research Online',
  'manonman-sundaran-universi': 'Manonmaniam Sundaranar University Online',
  'chandigarh': 'Chandigarh University Online',
  'integral-universi': 'Integral University Online',
  'manav-rachna-internat-institut': 'Manav Rachna Online',
  'bharathidasan-uni': 'Bharathidasan University Online',
  'aligarh-muslim-universi': 'Aligarh Muslim University Online',
  'gujarat-universi': 'Gujarat University Online',
  'gls-universi': 'GLS University Online',
  'vivekana-global-universi': 'Vivekananda Global University Online',
  'uttaranc-universi': 'Uttaranchal University Online',
  'sgt-universi': 'SGT University Online',
  'universi-of-himachal-pradesh': 'Central University of Himachal Pradesh Online',
  'assam-down-town-universi': 'Assam Don Bosco University Online',
  'universi-of-lucknow': 'University of Lucknow Online',
  'desh-bhagat-universi': 'Desh Bhagat University Online',
  'guru-nanak-dev-universi': 'Guru Nanak Dev University Online',
  'savitrib-phule-pune-universi': 'Savitribai Phule Pune University (SPPU) Online',
  'vellore-vit-online': 'Vellore Institute of Technology Online',
  'anna-universi': 'Anna University Online',
  'northcap-universi': 'The NorthCap University Online',
  'alvas-college': 'Alva',
  'guru-kashi-universi': 'Guru Kashi University Online',
  'srm-institut-of-science': 'SRM Institute of Science and Technology Online',
  'universi-of-madras': 'University of Madras Online',
  'alagappa-universi': 'Alagappa University Online',
  'bharathi-universi': 'Bharathiar University Online',
  'icfai-foundati-for-higher': 'ICFAI Foundation for Higher Education Online',
  'shiv-nadar-institut-of': 'Shiv Nadar University Online',
  'gla-universi': 'GLA University Online',
  'teerthanker-universi': 'Teerthanker Mahaveer University Online',
  'subharti-universi': 'Swami Vivekanand Subharti University Online'
};

const logoMapping = {
  'amity': '/logos/university_logos/amity-online-university-logo_2.svg',
  'jain': '/logos/university_logos/jain_university-logo.svg',
  'lpu': '/logos/university_logos/lpu-logo.svg',
  'chandigarh': '/logos/university_logos/cu-online.svg',
  'mahe-manipal': '/logos/university_logos/mahe-manipal-online-logo.svg',
  'manipal-jaipur': '/logos/university_logos/muj-logo.svg',
  'nmims': '/logos/university_logos/nmims-online-logo.svg',
  'dypatil': '/logos/university_logos/dpu-online.svg',
  'amrita-vishwa-vidyapee': '/logos/university_logos/amrita-online-logo.svg'
};

const extractedData = rows.map(r => {
  const name = String(r['__EMPTY'] || '').trim();
  if (!name || name === 'University Name') return null;
  return {
    name, normName: normalize(name),
    naac: String(r['__EMPTY_3'] || '').replace(/'/g, '').trim(),
    nirf: String(r['__EMPTY_4'] || '').match(/\d+/) ? parseInt(String(r['__EMPTY_4']).match(/\d+/)[0]) : 0,
    wes: (String(r['__EMPTY_6'] || '').toLowerCase()) === 'yes',
    aicte: (String(r['__EMPTY_8'] || '').toLowerCase()) === 'yes'
  };
}).filter(Boolean);

function updateFile(filePath, marker) {
  console.log(`Starting update for ${filePath} with marker ${marker}...`);
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    const startIdx = content.indexOf(marker);
    if (startIdx === -1) {
        console.log(`Could not find marker ${marker} in ${filePath}`);
        return;
    }
    
    const listBodyStart = startIdx + marker.length;
    let endIdx = content.indexOf("\n];", listBodyStart);
    if (endIdx === -1) endIdx = content.indexOf("\n  ]", listBodyStart);
    if (endIdx === -1) {
        // Find the last ] before the next export or end of file
        const nextExport = content.indexOf("export const", listBodyStart);
        endIdx = content.lastIndexOf("]", nextExport === -1 ? content.length : nextExport);
    }
    
    if (endIdx === -1) {
        console.log(`Could not find end of list in ${filePath}`);
        return;
    }

    const listBody = content.substring(listBodyStart, endIdx);
    const segments = listBody.split(/\n\s*\{/);
    console.log(`Processing ${segments.length} segments...`);

    let updatedCount = 0;
    const updatedSegments = segments.map((seg, i) => {
        if (i === 0 && !seg.includes('id:')) return seg;
        let fullSeg = i === 0 ? seg : '  {' + seg;
        
        const idMatch = fullSeg.match(/id:\s*['"]([^'"]+)['"]/);
        if (!idMatch) return fullSeg;
        const id = idMatch[1];

        const nameMatch = fullSeg.match(/name:\s*['"]([^'"]+)['"]/);
        if (!nameMatch) return fullSeg;
        const codeName = nameMatch[1];
        const normCodeName = normalize(codeName);

        let excelUni = null;
        if (manualMapping[id]) {
            excelUni = extractedData.find(u => u.normName === normalize(manualMapping[id]));
        }
        if (!excelUni) {
            excelUni = extractedData.find(u => u.normName === normCodeName || u.normName.includes(normCodeName) || normCodeName.includes(u.normName));
        }

        if (excelUni) {
            updatedCount++;
            let newSeg = fullSeg;
            if (logoMapping[id]) newSeg = newSeg.replace(/logo:\s*['"][^'"]*['"]/, `logo: '${logoMapping[id]}'`);
            if (excelUni.nirf > 0) {
                if (newSeg.includes('nirf:')) newSeg = newSeg.replace(/nirf:\s*\d+/, `nirf: ${excelUni.nirf}`);
                else if (newSeg.includes('id:')) newSeg = newSeg.replace(/id:/, `nirf: ${excelUni.nirf},\n    id:`);
            }
            if (excelUni.naac && excelUni.naac !== '-') newSeg = newSeg.replace(/naac:\s*['"][^'"]*['"]/, `naac: '${excelUni.naac}'`);
            
            let approvals = ['UGC DEB'];
            if (excelUni.naac && excelUni.naac !== '-') approvals.push(`NAAC ${excelUni.naac}`);
            if (excelUni.nirf < 200 && excelUni.nirf > 0) approvals.push(`NIRF #${excelUni.nirf}`);
            if (excelUni.aicte) approvals.push('AICTE');
            if (excelUni.wes) approvals.push('WES Recognised');
            
            newSeg = newSeg.replace(/approvals:\s*\[[^\]]*\]/, `approvals: [${approvals.map(a=>`'${a}'`).join(', ')}]`);
            let highlight = [];
            if (excelUni.nirf < 200 && excelUni.nirf > 0) highlight.push(`NIRF #${excelUni.nirf}`);
            if (excelUni.naac && excelUni.naac !== '-') highlight.push(`NAAC ${excelUni.naac}`);
            if (highlight.length === 0) highlight.push('UGC DEB Approved');
            newSeg = newSeg.replace(/highlight:\s*['"][^'"]*['"]/, `highlight: '${highlight.join(' · ')}'`);

            return i === 0 ? newSeg : newSeg.substring(3);
        }
        return seg;
    });

    const newContent = content.substring(0, listBodyStart) + updatedSegments.join('\n  {') + content.substring(endIdx);
    fs.writeFileSync(filePath, newContent);
    console.log(`Successfully updated ${updatedCount} entries in ${filePath}`);
  } catch (err) {
    console.error(`Error updating ${filePath}:`, err);
  }
}

updateFile(DATA_TS, "export const UNIVERSITIES: University[] = [");
updateFile(SLIM_TS, "export const UNIS_SLIM: UniSlim[] = [");
console.log('Sync finished.');
