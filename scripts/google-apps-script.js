// ═══════════════════════════════════════════════════════════════════════════
// Edify CMS — Google Apps Script Backend v2.0
// Handles: lead capture, full CMS data read, page registry, logo manifest
//
// SETUP (one time):
// 1. Open your Edify CMS Google Sheet
// 2. Extensions → Apps Script → paste this entire file → Save
// 3. Run buildCMSTemplate() once to create all sheet tabs
// 4. Deploy → New Deployment → Web App
//    Execute as: Me | Who has access: Anyone
// 5. Copy the Web App URL → Vercel env: NEXT_PUBLIC_CMS_SHEET_URL
// 6. Run setSecret() and enter your CMS_SHEET_SECRET value
// ═══════════════════════════════════════════════════════════════════════════

const CONFIG = {
  ALERT_EMAIL: 'hello@edifyedu.in',
  MAX_ROWS: 2000,
  SECRET_KEY: 'CMS_SECRET',
}

const TABS = {
  universities: '📊 Universities',
  programs:     '📚 Programs',
  syllabus:     '📖 Syllabus',
  blogs:        '✍️ Blog Posts',
  guides:       '🗺️ Guides',
  logos:        '🖼️ Logos',
  siteConfig:   '🌐 Site Config',
  pageRegistry: '📋 Page Registry',
  leads:        'Edify Leads',
}

// ── Router ──────────────────────────────────────────────────────────────────
function doGet(e) {
  try {
    const action = (e.parameter.action || 'readAll')
    const sheet  = (e.parameter.sheet  || '')
    if (action === 'read')     return respond(handleRead(sheet))
    if (action === 'readAll')  return respond(handleReadAll())
    if (action === 'status')   return respond(handleStatus())
    if (action === 'registry') return respond(handleRegistry())
    return respond({ error: 'Unknown action: ' + action }, 400)
  } catch(err) { return respond({ error: err.message }, 500) }
}

function doPost(e) {
  try {
    const body   = JSON.parse(e.postData.contents)
    const action = body.action || 'lead'
    if (action !== 'lead') {
      const secret = PropertiesService.getScriptProperties().getProperty(CONFIG.SECRET_KEY)
      if (secret && body.secret !== secret) return respond({ error: 'Unauthorized' }, 401)
    }
    if (action === 'lead')              return respond(handleLead(body))
    if (action === 'logPage')           return respond(handleLogPage(body))
    if (action === 'updatePageStatus')  return respond(handleUpdatePageStatus(body))
    return respond({ error: 'Unknown action: ' + action }, 400)
  } catch(err) { return respond({ error: err.message }, 500) }
}

// ── Read handlers ────────────────────────────────────────────────────────────
function handleRead(sheetKey) {
  const tabName = TABS[sheetKey]
  if (!tabName) return { error: 'Unknown sheet: ' + sheetKey }
  const rows = readSheet(tabName)
  return { sheet: sheetKey, count: rows.length, rows: rows, updatedAt: new Date().toISOString() }
}

function handleReadAll() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  const result = { _meta: {
    updatedAt: new Date().toISOString(),
    sheetNames: ss.getSheets().map(function(s) { return s.getName() }),
  }}
  Object.keys(TABS).forEach(function(key) {
    if (key === 'leads') return // never expose leads
    var tabName = TABS[key]
    try {
      var sheet = ss.getSheetByName(tabName)
      if (!sheet) { result[key] = { count: 0, rows: [], missing: true }; return }
      var rows = readSheet(tabName)
      result[key] = { count: rows.length, rows: rows }
    } catch(e) { result[key] = { count: 0, rows: [], error: e.message } }
  })
  return result
}

function handleStatus() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var counts = {}
  Object.keys(TABS).forEach(function(key) {
    try {
      var sheet = ss.getSheetByName(TABS[key])
      counts[key] = sheet ? Math.max(0, sheet.getLastRow() - 1) : 0
    } catch(e) { counts[key] = 0 }
  })
  return { ok: true, counts: counts, spreadsheetTitle: ss.getName(), updatedAt: new Date().toISOString() }
}

function handleRegistry() {
  var rows = readSheet(TABS.pageRegistry)
  rows.sort(function(a, b) {
    return new Date(b['Last Updated'] || 0) - new Date(a['Last Updated'] || 0)
  })
  return { count: rows.length, pages: rows }
}

// ── Write handlers ────────────────────────────────────────────────────────────
function handleLead(data) {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(CONFIG.LEADS_SHEET || TABS.leads)
  if (!sheet) {
    sheet = ss.insertSheet(TABS.leads)
    var hdrs = ['Timestamp','Name','Phone','Email','Program','University','Source','Call Time','Message','Submitted At']
    sheet.appendRow(hdrs)
    formatHeader(sheet, hdrs.length)
  }
  sheet.appendRow([
    new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' }),
    data.name || '', data.phone || '', data.email || '',
    data.program || '', data.university || '', data.source || 'website',
    data.callTime || '', data.message || '', data.submittedAt || '',
  ])
  try {
    MailApp.sendEmail({
      to: CONFIG.ALERT_EMAIL,
      subject: '🎓 New Lead — ' + (data.name || '?') + ' | ' + (data.program || 'General'),
      body: 'Name: ' + data.name + '\nPhone: ' + data.phone + '\nEmail: ' + data.email +
            '\nProgram: ' + (data.program || '—') + '\nUniversity: ' + (data.university || '—') +
            '\nSource: ' + (data.source || 'website') + '\n\nSubmitted: ' + new Date().toLocaleString('en-IN'),
    })
  } catch(e) { /* email failure is non-blocking */ }
  return { success: true }
}

function handleLogPage(data) {
  if (!data.pageId || !data.pageType || !data.pageUrl) return { error: 'pageId, pageType, pageUrl required' }
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(TABS.pageRegistry)
  if (!sheet) {
    sheet = ss.insertSheet(TABS.pageRegistry)
    var hdrs = ['Page ID','Page Type','URL','University / Title','Program','Status','Created At','Last Updated']
    sheet.appendRow(hdrs); formatHeader(sheet, hdrs.length)
  }
  var values = sheet.getDataRange().getValues()
  var headers = values[0]
  var idCol = headers.indexOf('Page ID')
  var rows = values.slice(1)
  var now = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })
  var existing = rows.findIndex(function(r) { return r[idCol] === data.pageId })
  var rowData = [data.pageId, data.pageType, data.pageUrl, data.title || '', data.program || '', data.status || 'active', '', now]
  if (existing >= 0) {
    rowData[6] = rows[existing][6] // preserve original created date
    sheet.getRange(existing + 2, 1, 1, 8).setValues([rowData])
    return { success: true, action: 'updated' }
  }
  rowData[6] = now
  sheet.appendRow(rowData)
  return { success: true, action: 'created' }
}

function handleUpdatePageStatus(data) {
  if (!data.pageId || !data.status) return { error: 'pageId and status required' }
  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(TABS.pageRegistry)
  if (!sheet) return { error: 'Page Registry not found' }
  var values = sheet.getDataRange().getValues()
  var headers = values[0]
  var idCol = headers.indexOf('Page ID')
  var statCol = headers.indexOf('Status')
  var updCol = headers.indexOf('Last Updated')
  for (var i = 1; i < values.length; i++) {
    if (String(values[i][idCol]) === String(data.pageId)) {
      if (statCol >= 0) sheet.getRange(i + 1, statCol + 1).setValue(data.status)
      if (updCol >= 0)  sheet.getRange(i + 1, updCol + 1).setValue(new Date().toLocaleString('en-IN'))
      return { success: true }
    }
  }
  return { error: 'Page not found: ' + data.pageId }
}

// ── Utilities ─────────────────────────────────────────────────────────────────
function readSheet(tabName) {
  var ss = SpreadsheetApp.getActiveSpreadsheet()
  var sheet = ss.getSheetByName(tabName)
  if (!sheet) return []
  var lastRow = Math.min(sheet.getLastRow(), CONFIG.MAX_ROWS)
  if (lastRow < 2) return []
  var values = sheet.getRange(1, 1, lastRow, sheet.getLastColumn()).getValues()
  var headers = values[0].map(function(h) { return String(h).trim() })
  return values.slice(1).filter(function(row) {
    return row.some(function(cell) { return String(cell).trim() !== '' })
  }).map(function(row) {
    var obj = {}
    headers.forEach(function(h, i) { if (h) obj[h] = row[i] !== undefined ? row[i] : '' })
    return obj
  })
}

function formatHeader(sheet, numCols) {
  sheet.getRange(1, 1, 1, numCols)
    .setFontWeight('bold').setBackground('#0B1D35').setFontColor('#ffffff')
  sheet.setFrozenRows(1)
}

function respond(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON)
}

// ── One-time setup ──────────────────────────────────────────────────────────
function buildCMSTemplate() {
  var ss = SpreadsheetApp.getActiveSpreadsheet()

  var UNI_HEADERS = ['ID','University Full Name','Abbreviation','City','State','Region',
    'NIRF Rank','NIRF Management Rank','NAAC Grade','NAAC Score',
    'UGC DEB (TRUE/FALSE)','PSU Eligible (TRUE/FALSE)','Govt Recognised (TRUE/FALSE)',
    'Exam Mode','Eligibility','Eligibility %',
    'Fee Min ₹','Fee Max ₹','EMI From ₹/month',
    'Programs Offered','Approvals (comma sep)',
    'Highlight Badge','Tagline','Short Description',
    'For Who (pipe sep)','Not For (pipe sep)',
    'Brand Color','Status']

  var UNI_SAMPLE = ['amity','Amity University Online','AUO','Noida','Uttar Pradesh','North',
    '51','','A+','','TRUE','TRUE','TRUE','Online','50% in graduation','50',
    '60000','200000','2500','MBA,MCA,BBA,BCA,B.Com','UGC DEB,NAAC A+',
    'NAAC A+ · UGC DEB approved','Learn without limits','Quality education',
    'Working professionals','Those needing campus placements','#1C6BF4','active']

  var PROG_HEADERS = ['University ID','Program','Specialisations (comma sep)',
    'Fee Range','Duration','Avg Salary',
    'Entry Roles (comma sep)','Top Companies (comma sep)',
    'Internship / Project Type','Career Outcome (1 sentence)']

  var PROG_SAMPLE = ['amity','MBA','Finance,Marketing,HR','₹1L–₹2L','2 years','₹6–12 LPA',
    'Business Analyst,Manager','TCS,Infosys','Live projects','Qualify for management roles']

  var SYL_HEADERS = ['University ID','Program','Specialisation (for sem3/4)',
    'Semester 1 Subjects','Semester 2 Subjects','Semester 3 Subjects',
    'Semester 4 Subjects','Semester 5 Subjects','Semester 6 Subjects',
    'Highlight / Key Differentiator']

  var BLOG_HEADERS = ['Slug (URL)','Title','Meta Description','Category',
    'Tags (comma sep)','Published Date','Read Time (min)',
    'Target Keyword','Status','FAQs (JSON array)','Content (HTML)']

  var GUIDE_HEADERS = ['ID (URL slug)','Icon (emoji)','Tag / Category',
    'Title','Short Description','Read Time','Content (HTML)']

  var LOGO_HEADERS = ['University ID','Logo URL','Alt Text','Format','Status']
  var LOGO_NOTE = 'Logo URL: Google Drive → Share → "Anyone with link" → change /view to /uc?id=FILE_ID or use any public URL'

  var CONFIG_HEADERS = ['Key','Value','Description']
  var CONFIG_ROWS = [
    ['site_name','Edify','Brand name'],
    ['tagline','Best Online Degrees India 2026','Homepage tagline'],
    ['admissions_batch','July 2026','Current batch label'],
    ['admissions_deadline','October 15–30, 2026','Admission deadline'],
    ['contact_email','hello@edifyedu.in','Contact email'],
    ['whatsapp_number','917061285806','WhatsApp number'],
    ['hero_headline','Compare 127+ UGC Approved Online Universities','Homepage H1'],
    ['banner_text','Admissions Open — July 2026 batch closing October 15–30','Top banner text'],
  ]

  var REG_HEADERS = ['Page ID','Page Type','URL','University / Title','Program','Status','Created At','Last Updated']

  var LEAD_HEADERS = ['Timestamp','Name','Phone','Email','Program','University','Source','Call Time','Message','Submitted At']

  var sheets = [
    [TABS.universities, UNI_HEADERS, [UNI_SAMPLE]],
    [TABS.programs, PROG_HEADERS, [PROG_SAMPLE]],
    [TABS.syllabus, SYL_HEADERS, []],
    [TABS.blogs, BLOG_HEADERS, []],
    [TABS.guides, GUIDE_HEADERS, []],
    [TABS.logos, LOGO_HEADERS, [], LOGO_NOTE],
    [TABS.siteConfig, CONFIG_HEADERS, CONFIG_ROWS],
    [TABS.pageRegistry, REG_HEADERS, []],
    [TABS.leads, LEAD_HEADERS, []],
  ]

  sheets.forEach(function(item) {
    var name = item[0], headers = item[1], samples = item[2], note = item[3]
    if (ss.getSheetByName(name)) { Logger.log('Exists: ' + name); return }
    var sheet = ss.insertSheet(name)
    sheet.appendRow(headers)
    if (samples && samples.length) samples.forEach(function(s) { sheet.appendRow(s) })
    formatHeader(sheet, headers.length)
    sheet.autoResizeColumns(1, headers.length)
    if (note) sheet.getRange(1, headers.length + 2).setValue('ℹ️ ' + note).setFontColor('#607B96').setFontStyle('italic')
    Logger.log('Created: ' + name)
  })

  SpreadsheetApp.getUi().alert(
    '✅ CMS Template ready!\n\n' +
    '9 sheets created. Next:\n' +
    '1. Fill Universities sheet with your data\n' +
    '2. Deploy as Web App (Execute as: Me, Access: Anyone)\n' +
    '3. Add Web App URL to Vercel: NEXT_PUBLIC_CMS_SHEET_URL\n' +
    '4. Go to /admin/cms and click Sync to Live'
  )
}

function setSecret() {
  var ui = SpreadsheetApp.getUi()
  var result = ui.prompt('Set CMS Secret', 'Enter a secret string (match CMS_SHEET_SECRET in Vercel):', ui.ButtonSet.OK_CANCEL)
  if (result.getSelectedButton() === ui.Button.OK) {
    PropertiesService.getScriptProperties().setProperty(CONFIG.SECRET_KEY, result.getResponseText())
    ui.alert('✅ Secret saved! Use the same value as CMS_SHEET_SECRET in Vercel env vars.')
  }
}

function validateSheets() {
  var unis = readSheet(TABS.universities)
  var errors = []
  unis.forEach(function(u, i) {
    var row = i + 2
    if (!u['ID'])                   errors.push('Row ' + row + ': Missing ID')
    if (!u['University Full Name']) errors.push('Row ' + row + ': Missing name')
    if (!u['Programs Offered'])     errors.push('Row ' + row + ': No programs listed')
    if (!u['NAAC Grade'])           errors.push('Row ' + row + ': Missing NAAC grade')
  })
  var ids = unis.map(function(u) { return u['ID'] }).filter(Boolean)
  var dupes = ids.filter(function(id, i) { return ids.indexOf(id) !== i })
  if (dupes.length) errors.push('Duplicate IDs: ' + dupes.join(', '))

  if (errors.length) {
    SpreadsheetApp.getUi().alert(errors.length + ' errors found:\n\n' + errors.slice(0,10).join('\n'))
  } else {
    SpreadsheetApp.getUi().alert('✅ All checks passed! ' + unis.length + ' universities valid.')
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// ISR REVALIDATION — Trigger on-demand cache updates on your Next.js site
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Trigger ISR revalidation for specific paths
 * Call this after updating content in the sheet
 * 
 * @param {string[]} paths - Array of paths to revalidate, e.g. ['/universities/jain', '/programs/mba']
 * @param {string[]} tags - Optional cache tags to revalidate, e.g. ['universities', 'programs']
 */
function triggerISR(paths, tags) {
  var props = PropertiesService.getScriptProperties()
  var siteUrl = props.getProperty('NEXT_SITE_URL') || 'https://edifyedu.in'
  var secret = props.getProperty('REVALIDATE_SECRET')
  
  if (!secret) {
    Logger.log('⚠️ REVALIDATE_SECRET not set. Run setRevalidateSecret() first.')
    return { error: 'REVALIDATE_SECRET not configured' }
  }
  
  try {
    var response = UrlFetchApp.fetch(siteUrl + '/api/revalidate?secret=' + encodeURIComponent(secret), {
      method: 'POST',
      contentType: 'application/json',
      payload: JSON.stringify({
        paths: paths || [],
        tags: tags || []
      }),
      muteHttpExceptions: true
    })
    
    var result = JSON.parse(response.getContentText())
    Logger.log('ISR Result: ' + JSON.stringify(result))
    return result
  } catch (e) {
    Logger.log('ISR Error: ' + e.message)
    return { error: e.message }
  }
}

/**
 * Revalidate a single university page
 * @param {string} universityId - The university slug, e.g. 'jain'
 */
function revalidateUniversity(universityId) {
  return triggerISR([
    '/universities/' + universityId,
    '/universities',
    '/sitemap.xml'
  ], ['universities'])
}

/**
 * Revalidate all university and program pages (use sparingly)
 */
function revalidateAll() {
  return triggerISR([
    '/universities',
    '/programs',
    '/programs/mba',
    '/programs/mca',
    '/programs/bba',
    '/programs/bca',
    '/',
    '/sitemap.xml'
  ], ['universities', 'programs'])
}

/**
 * Set the revalidation secret (run once, manually)
 */
function setRevalidateSecret() {
  var ui = SpreadsheetApp.getUi()
  var result = ui.prompt(
    'Set Revalidation Secret',
    'Enter the REVALIDATE_SECRET (must match your Vercel env var):',
    ui.ButtonSet.OK_CANCEL
  )
  if (result.getSelectedButton() === ui.Button.OK) {
    PropertiesService.getScriptProperties().setProperty('REVALIDATE_SECRET', result.getResponseText())
    ui.alert('✅ Revalidation secret saved!')
  }
}

/**
 * Set the Next.js site URL (run once, manually)
 */
function setSiteUrl() {
  var ui = SpreadsheetApp.getUi()
  var result = ui.prompt(
    'Set Site URL',
    'Enter your Next.js site URL (default: https://edifyedu.in):',
    ui.ButtonSet.OK_CANCEL
  )
  if (result.getSelectedButton() === ui.Button.OK) {
    var url = result.getResponseText().trim().replace(/\/$/, '') // remove trailing slash
    PropertiesService.getScriptProperties().setProperty('NEXT_SITE_URL', url)
    ui.alert('✅ Site URL saved: ' + url)
  }
}

// ── Custom Menu for easy access ──────────────────────────────────────────────
function onOpen() {
  var ui = SpreadsheetApp.getUi()
  ui.createMenu('🎓 Edify CMS')
    .addItem('✅ Validate Data', 'validateSheets')
    .addItem('🔄 Revalidate All Pages', 'revalidateAll')
    .addSeparator()
    .addItem('🔐 Set CMS Secret', 'setSecret')
    .addItem('🔑 Set Revalidate Secret', 'setRevalidateSecret')
    .addItem('🌐 Set Site URL', 'setSiteUrl')
    .addSeparator()
    .addItem('🛠️ Build CMS Template', 'buildCMSTemplate')
    .addToUi()
}
