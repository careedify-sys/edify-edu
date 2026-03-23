/**
 * ════════════════════════════════════════════════════════
 *  EDIFY LEADS — Google Apps Script Web App
 *  Deploy this as: Execute as ME, Access: Anyone
 *  Paste into: script.google.com → New Project
 * ════════════════════════════════════════════════════════
 *
 *  SETUP STEPS:
 *  1. Open Google Sheets → Extensions → Apps Script
 *  2. Paste this entire file
 *  3. Run setup() once to create the "Edify Leads" sheet
 *  4. Deploy → New Deployment → Web App
 *     - Execute as: Me
 *     - Who has access: Anyone
 *  5. Copy the Web App URL
 *  6. Set NEXT_PUBLIC_LEADS_WEBHOOK_URL=<that URL> in .env.local
 *     and in your Vercel project settings
 *
 *  SHEET COLUMNS (auto-created):
 *  Timestamp | Name | Phone | Email | Interested In | University | Source Page | Status
 */

const SHEET_NAME = 'Edify Leads'

// ─── One-time setup ────────────────────────────────────
function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
  }
  // Clear and set headers
  sheet.clearContents()
  const headers = ['Timestamp', 'Name', 'Phone', 'Email', 'Interested In', 'University', 'Source Page', 'Status']
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  // Format header row
  const headerRange = sheet.getRange(1, 1, 1, headers.length)
  headerRange.setBackground('#0f2137')
  headerRange.setFontColor('#ffffff')
  headerRange.setFontWeight('bold')
  headerRange.setFontSize(11)
  // Set column widths
  sheet.setColumnWidth(1, 160) // Timestamp
  sheet.setColumnWidth(2, 150) // Name
  sheet.setColumnWidth(3, 120) // Phone
  sheet.setColumnWidth(4, 180) // Email
  sheet.setColumnWidth(5, 130) // Interested In
  sheet.setColumnWidth(6, 180) // University
  sheet.setColumnWidth(7, 150) // Source Page
  sheet.setColumnWidth(8, 100) // Status
  // Freeze header row
  sheet.setFrozenRows(1)
  Logger.log('✅ Edify Leads sheet created successfully!')
}

// ─── Handle POST (new lead submission) ─────────────────
function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.tryLock(10000)

  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    let sheet = ss.getSheetByName(SHEET_NAME)
    if (!sheet) {
      setup()
      sheet = ss.getSheetByName(SHEET_NAME)
    }

    let data = {}
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents)
    }

    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata',
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    })

    const row = [
      timestamp,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.program || data.interestedIn || '',
      data.university || data.preferredUniversity || '',
      data.sourcePage || data.source || '',
      'New', // default status
    ]

    sheet.appendRow(row)

    // Highlight new row in light yellow
    const lastRow = sheet.getLastRow()
    sheet.getRange(lastRow, 1, 1, 8).setBackground('#fffde7')

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Lead saved' }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
  } finally {
    lock.releaseLock()
  }
}

// ─── Handle GET (fetch leads, update status) ───────────
function doGet(e) {
  const action = e && e.parameter && e.parameter.action

  if (action === 'getLeads') {
    return getLeads()
  }
  if (action === 'updateStatus') {
    const row = parseInt(e.parameter.row)
    const status = e.parameter.status
    return updateStatus(row, status)
  }
  if (action === 'test') {
    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: 'Edify Leads webhook is working!' }))
      .setMimeType(ContentService.MimeType.JSON)
  }

  return ContentService
    .createTextOutput(JSON.stringify({ success: true, message: 'Edify Leads API is live' }))
    .setMimeType(ContentService.MimeType.JSON)
}

function getLeads() {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const sheet = ss.getSheetByName(SHEET_NAME)
    if (!sheet) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Sheet not found. Run setup() first.' }))
        .setMimeType(ContentService.MimeType.JSON)
    }

    const data = sheet.getDataRange().getValues()
    if (data.length <= 1) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: true, leads: [] }))
        .setMimeType(ContentService.MimeType.JSON)
    }

    const headers = data[0]
    const leads = []

    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      const lead = { _row: i + 1 } // 1-indexed row number for updates
      headers.forEach((header, j) => {
        lead[header] = row[j] || ''
      })
      leads.push(lead)
    }

    // Return most recent first
    leads.reverse()

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, leads, total: leads.length }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

function updateStatus(row, status) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const sheet = ss.getSheetByName(SHEET_NAME)
    if (!sheet || !row || !status) {
      return ContentService
        .createTextOutput(JSON.stringify({ success: false, error: 'Missing row or status' }))
        .setMimeType(ContentService.MimeType.JSON)
    }

    // Status column is column 8
    sheet.getRange(row, 8).setValue(status)

    // Color-code by status
    const bg = status === 'New' ? '#fffde7' : status === 'Called' ? '#e8f5e9' : '#e3f2fd'
    sheet.getRange(row, 1, 1, 8).setBackground(bg)

    return ContentService
      .createTextOutput(JSON.stringify({ success: true, message: `Status updated to ${status}` }))
      .setMimeType(ContentService.MimeType.JSON)

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON)
  }
}

// ─── Optional: email notification on new lead ──────────
function sendEmailNotification(name, phone, program, university) {
  const email = 'hello@edifyedu.in' // Change to your email
  if (!email || email === 'hello@edifyedu.in') return // Comment out this line after setting your email

  try {
    MailApp.sendEmail({
      to: email,
      subject: `🎓 New Lead: ${name} — ${program}`,
      body: `New counselling enquiry received!\n\nName: ${name}\nPhone: +91 ${phone}\nProgram: ${program}\nUniversity: ${university || 'Not specified'}\n\nLog in to admin panel to view and update status.\nhttps://edifyedu.in/admin`,
    })
  } catch (err) {
    Logger.log('Email notification failed: ' + err.toString())
  }
}
