# EDIFY — Owner's Complete Guide
*Written for non-technical owners. No coding knowledge required for most tasks.*

---

## HONEST PICTURE: WHAT IS SET UP vs WHAT IS MISSING

### Already working (no action needed):
- ✅ Website builds and runs
- ✅ Enquiry forms (modal, popups, blog forms) all work
- ✅ WhatsApp lead fallback — even without Google Sheets, enquiries go to WhatsApp
- ✅ Admin panel at /admin (login: 050994)
- ✅ Admin panel has: leads tab, blog import, excel import, university editor
- ✅ Email alerts via Web3Forms (your key is already set)
- ✅ Lock/unlock logic for university program pages
- ✅ SEO on all pages, sitemap, robots.txt

### Missing (needs your action):
- ❌ Google Sheets lead capture — URL not set yet (leads still go to WhatsApp, but no sheet)
- ❌ GA4 analytics — placeholder ID, not tracking
- ❌ GitHub token — CMS sync to live site not connected
- ❌ Blog posts — only 4 sample blogs exist, need real content

---

## STEP 1: CAPTURE LEADS IN GOOGLE SHEETS

### What is currently happening:
Every time someone fills a form on your website (the "Speak with an Advisor" popup or any enquiry form), the lead goes to:
1. Your email via Web3Forms (already working — you get emails)
2. WhatsApp — pre-filled message sent to +91 70612 85806
3. Google Sheets — NOT CONNECTED YET

### How to connect Google Sheets (takes 10 minutes):

**Step A — Create your Google Sheet:**
1. Go to sheets.google.com
2. Click the "+" to create a new blank spreadsheet
3. Name it: `Edify Leads`
4. That's it — leave it blank, the script will set it up

**Step B — Add the script:**
1. In your Google Sheet, click the top menu: `Extensions` → `Apps Script`
2. A new tab opens with a code editor
3. Delete everything that's already there
4. Copy ALL the text below and paste it:

```javascript
const SHEET_NAME = 'Edify Leads'

function setup() {
  const ss = SpreadsheetApp.getActiveSpreadsheet()
  let sheet = ss.getSheetByName(SHEET_NAME)
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME)
  }
  sheet.clearContents()
  const headers = ['Timestamp', 'Name', 'Phone', 'Email', 'Interested In', 'University', 'Source Page', 'Status']
  sheet.getRange(1, 1, 1, headers.length).setValues([headers])
  const headerRange = sheet.getRange(1, 1, 1, headers.length)
  headerRange.setBackground('#0f2137')
  headerRange.setFontColor('#ffffff')
  headerRange.setFontWeight('bold')
  headerRange.setFontSize(11)
  sheet.setColumnWidth(1, 160)
  sheet.setColumnWidth(2, 150)
  sheet.setColumnWidth(3, 120)
  sheet.setColumnWidth(4, 180)
  sheet.setColumnWidth(5, 130)
  sheet.setColumnWidth(6, 180)
  sheet.setColumnWidth(7, 150)
  sheet.setColumnWidth(8, 100)
  sheet.setFrozenRows(1)
  Logger.log('Edify Leads sheet created!')
}

function doPost(e) {
  const lock = LockService.getScriptLock()
  lock.tryLock(10000)
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    let sheet = ss.getSheetByName(SHEET_NAME)
    if (!sheet) { setup(); sheet = ss.getSheetByName(SHEET_NAME) }
    let data = {}
    if (e && e.postData && e.postData.contents) {
      data = JSON.parse(e.postData.contents)
    }
    const timestamp = new Date().toLocaleString('en-IN', {
      timeZone: 'Asia/Kolkata', day: '2-digit', month: '2-digit',
      year: 'numeric', hour: '2-digit', minute: '2-digit',
    })
    const row = [
      timestamp,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.program || data.interestedIn || '',
      data.university || data.preferredUniversity || '',
      data.sourcePage || data.source || '',
      'New',
    ]
    sheet.appendRow(row)
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

function doGet(e) {
  const action = e && e.parameter && e.parameter.action
  if (action === 'getLeads') return getLeads()
  if (action === 'updateStatus') return updateStatus(parseInt(e.parameter.row), e.parameter.status)
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
    if (!sheet) return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Sheet not found' })).setMimeType(ContentService.MimeType.JSON)
    const data = sheet.getDataRange().getValues()
    if (data.length <= 1) return ContentService.createTextOutput(JSON.stringify({ success: true, leads: [] })).setMimeType(ContentService.MimeType.JSON)
    const headers = data[0]
    const leads = []
    for (let i = 1; i < data.length; i++) {
      const row = data[i]
      const lead = { _row: i + 1 }
      headers.forEach((header, j) => { lead[header] = row[j] || '' })
      leads.push(lead)
    }
    leads.reverse()
    return ContentService.createTextOutput(JSON.stringify({ success: true, leads, total: leads.length })).setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON)
  }
}

function updateStatus(row, status) {
  try {
    const ss = SpreadsheetApp.getActiveSpreadsheet()
    const sheet = ss.getSheetByName(SHEET_NAME)
    if (!sheet || !row || !status) return ContentService.createTextOutput(JSON.stringify({ success: false, error: 'Missing row or status' })).setMimeType(ContentService.MimeType.JSON)
    sheet.getRange(row, 8).setValue(status)
    const bg = status === 'New' ? '#fffde7' : status === 'Called' ? '#e8f5e9' : '#e3f2fd'
    sheet.getRange(row, 1, 1, 8).setBackground(bg)
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON)
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: err.toString() })).setMimeType(ContentService.MimeType.JSON)
  }
}
```

5. Click the floppy disk icon (Save) or press Ctrl+S
6. Name the project: `Edify Leads`

**Step C — Run setup once:**
1. In the Apps Script editor, find the dropdown that says "Select function"
2. Choose `setup` from the dropdown
3. Click the Run (▶) button
4. Google will ask for permissions — click "Review Permissions" → choose your Google account → click "Allow"
5. You'll see "Edify Leads sheet created!" in the logs at the bottom

**Step D — Deploy as Web App:**
1. Click the blue `Deploy` button (top right)
2. Click `New Deployment`
3. Click the gear icon next to "Type" → select `Web App`
4. Set these EXACTLY:
   - Description: `Edify Leads v1`
   - Execute as: `Me`
   - Who has access: `Anyone`
5. Click `Deploy`
6. Google will ask for permissions again — Allow
7. You'll see a URL like: `https://script.google.com/macros/s/AKfy.../exec`
8. **Copy that entire URL — you'll need it next**

**Step E — Add the URL to your website:**
1. Open the file: `edify-next/.env.local` in any text editor (Notepad works)
2. Find this line:
   ```
   NEXT_PUBLIC_LEADS_WEBHOOK_URL=your-google-apps-script-leads-url-here
   ```
3. Replace `your-google-apps-script-leads-url-here` with the URL you copied
4. Save the file

**Step F — Also add to Vercel (for live site):**
1. Go to vercel.com → your project → Settings → Environment Variables
2. Add:
   - Name: `NEXT_PUBLIC_LEADS_WEBHOOK_URL`
   - Value: your Google Apps Script URL
3. Click Save
4. Redeploy (Vercel → Deployments → ... → Redeploy)

**Step G — Test it:**
1. Go to your live website
2. Fill the enquiry form with test data
3. Check your Google Sheet — the lead should appear within seconds
4. New leads appear highlighted in yellow

### How leads look in Google Sheets:
| Timestamp | Name | Phone | Email | Interested In | University | Source Page | Status |
|-----------|------|-------|-------|---------------|------------|-------------|--------|
| 23/03/2026 14:30 | Rahul Sharma | 9876543210 | rahul@... | MBA | Amity | /programs/mba | New |

### Lead status management:
- Change "Status" column to: `New`, `Called`, `Converted`, or `Not Interested`
- Colours update automatically (yellow=new, green=called, blue=other)

---

## STEP 2: UPDATE UNIVERSITY DATA

### The easiest way (no coding): Use /admin/excel-import

Your admin panel has a tool to import university data from an Excel file.

**How it works:**
1. Go to: yoursite.com/admin → login with `050994`
2. Click the `Excel Import` tab
3. Prepare an Excel file with these columns:
   - University Name, Abbreviation, Tagline
   - NAAC Grade (A++, A+, A, B++, B+, B, C)
   - NIRF Rank (number, e.g. 45)
   - Location City, Location State
   - Min Fee (in rupees, e.g. 85000)
   - Max Fee (in rupees, e.g. 250000)
   - EMI From (monthly EMI, e.g. 3500)
   - Programs (comma separated: MBA, MCA, BBA, BCA)
   - PSU Eligible (Yes/No)
4. Upload the Excel file
5. The tool generates TypeScript code
6. Copy that code into `lib/data.ts`

### The even easier way: Edit directly in the file

Open `lib/data.ts` in any text editor. Find the university you want to update. Each university looks like this:

```
{
  id: 'amity',
  name: 'Amity University Online',
  naac: 'A+',
  nirf: 9,
  feeMin: 85000,
  feeMax: 150000,
  emiFrom: 3500,
  ...
}
```

Just change the number next to `feeMin:` or `feeMax:` and save.

### Update fees for one university:
1. Open: `lib/data.ts`
2. Press Ctrl+F and search for the university name
3. Find `feeMin:` and `feeMax:` — change the numbers
4. Save → redeploy

### Files that contain university data:
| File | What's inside |
|------|--------------|
| `lib/data.ts` | All 125+ universities — fees, NAAC, NIRF, programs, specialisations |
| `lib/content.ts` | Syllabus (sem1-sem4), program descriptions, spec content |
| `lib/mba-data.ts` | MBA job roles, top hiring companies, salary data |
| `lib/programs-data.ts` | Program overview content, career paths |

---

## STEP 3: UPDATE SYLLABUS DATA

Syllabus data is in `lib/content.ts` in a section called `MASTER_SYLLABUS`.

Each university+program combination has a syllabus entry like:
```
'amity||MBA': {
  sem1: ['Management Principles', 'Financial Accounting', ...],
  sem2: ['Marketing Management', 'Business Statistics', ...],
  sem3: ['Strategic Management', 'Electives', ...],
  sem4: ['Project Report', 'Specialisation Subjects', ...],
}
```

To update: find the university entry, change the subjects in the arrays, save, redeploy.

---

## STEP 4: ADD A NEW BLOG POST

### Option A — Use the Admin Panel (recommended):
1. Go to: yoursite.com/admin → `Blog Import` tab
2. Prepare an Excel file with these columns:
   - `slug` — URL-friendly name (e.g. `best-online-mba-india-2026`)
   - `title` — Full title
   - `metaDescription` — 155 character description for Google
   - `category` — e.g. `MBA Guide`
   - `tags` — comma separated: `online mba, india, 2026`
   - `publishedAt` — date e.g. `2026-03-23`
   - `readTime` — e.g. `8 min read`
   - `targetKeyword` — main SEO keyword
   - `status` — `published`
   - `content` — full HTML content of the article
3. Upload → Preview → Copy the generated code
4. Paste into `lib/blog.ts` in the `BLOG_POSTS` array

### Option B — Edit lib/blog.ts directly:
Copy an existing blog post, change all the fields, save, redeploy.

### SEO fields every blog MUST have:
- `title` — Include your main keyword. Keep under 65 characters.
- `metaDescription` — Summarise in 150-155 characters. Include keyword.
- `targetKeyword` — The main phrase you want to rank for
- `tags` — 3-5 relevant tags
- `slug` — Use hyphens, include keyword (e.g. `online-mba-india-2026`)
- `publishedAt` — Use today's date in format `2026-03-23`

### Write blogs from Google Sheets:
This feature is not yet connected. Currently blogs must be written in Excel and imported via admin. A full Google Sheets → blog pipeline would require additional setup.

---

## STEP 5: ADD A NEW UNIVERSITY

### Step-by-step (takes about 15 minutes):

**In lib/data.ts — add the university:**
```
{
  id: 'new-university-id',           // lowercase, hyphens only, unique
  name: 'New University Online',
  abbr: 'NUO',
  tagline: 'Short description',
  logo: '/logos/new-uni.webp',        // put logo in /public/logos/
  color: '#003399',                   // brand colour (hex)
  city: 'Mumbai',
  state: 'Maharashtra',
  region: 'West',
  naac: 'A',
  nirf: 999,                          // use 999 if not ranked
  estYear: 1995,
  psuEligible: false,
  examMode: 'Online',
  feeMin: 80000,
  feeMax: 150000,
  emiFrom: 3500,
  programs: ['MBA', 'MCA'],
  programDetails: {
    'MBA': {
      fees: '₹80,000 – ₹1,50,000',
      duration: '2 Years',
      avgSalary: '₹6–10 LPA',
      specs: ['Finance', 'Marketing', 'HR'],
      roles: ['Business Manager', 'Operations Lead'],
      topCompanies: ['TCS', 'Infosys', 'Wipro'],
    }
  },
  tags: ['UGC DEB', 'NAAC A'],
},
```

**Optional — add syllabus in lib/content.ts:**
```
'new-university-id||MBA': {
  sem1: ['Management Principles', 'Financial Accounting', 'Business Communication'],
  sem2: ['Marketing Management', 'Organizational Behaviour', 'Business Statistics'],
  sem3: ['Strategic Management', 'Entrepreneurship', 'Electives'],
  sem4: ['Project Report', 'Specialisation Subjects', 'Viva'],
},
```

Save both files → redeploy → the new university appears automatically.

---

## STEP 6: UPDATE SPECIALISATIONS

Specialisations for each university are in `lib/data.ts` inside the university's `programDetails`:

```
specs: ['Finance', 'Marketing', 'HR', 'Operations', 'Data Science'],
```

Just add or remove items from the list. Save → redeploy.

---

## STEP 7: WHAT THE ADMIN PANEL CAN DO RIGHT NOW

Go to: yoursite.com/admin (password: `050994`)

| Tab | What it does | Works? |
|-----|-------------|--------|
| Dashboard | Overview stats | ✅ Yes |
| Universities | Edit university settings via UI | ✅ Yes (saves locally) |
| Blog | Write/edit blog posts | ✅ Yes |
| SEO | Check page SEO scores | ✅ Yes |
| Leads | View leads from Google Sheets | ✅ Yes (once webhook is set) |
| Settings | Set webhook URL, phone, email | ✅ Yes |
| Excel Import (`/admin/excel-import`) | Import universities from Excel | ✅ Yes (generates code) |
| Blog Import (`/admin/blog-import`) | Import blogs from Excel | ✅ Yes (generates code) |
| CMS Sync (`/admin/cms`) | Push data to live site via GitHub | ⚠️ Needs GitHub token |

### To view leads in admin:
1. First complete Step 1 (connect Google Sheets)
2. Go to /admin → Settings → paste your Google Apps Script URL under "Leads Webhook"
3. Click Save
4. Go to Leads tab → click "Refresh"

---

## STEP 8: ENABLE GOOGLE ANALYTICS (GA4)

1. Go to analytics.google.com
2. Create a property for edifyedu.in
3. Go to Data Streams → Web → copy your Measurement ID (looks like `G-XXXXXXX`)
4. Open `.env.local` and replace:
   ```
   NEXT_PUBLIC_GA4_ID=G-XXXXXXXXXX
   ```
   with your real ID
5. Also add to Vercel environment variables
6. Redeploy

---

## STEP 9: VERIFY WEBSITE IS WORKING

### Quick 5-minute check:

**1. Forms working:**
- Go to your website → click "Speak with an Advisor"
- Fill the form with test name/phone
- Check: did you get an email? Did a WhatsApp message open?
- After Google Sheets is set up: check if lead appeared in sheet

**2. Admin works:**
- Go to yoursite.com/admin
- Type password `050994` → should log in
- Click Leads tab → should show leads (once webhook set)

**3. Pages loading:**
- Check: yoursite.com/universities/amity/mba — should show full content (not locked)
- Check: yoursite.com/programs/mba — should show university cards with "View Details" links
- Check: yoursite.com/blog — should show blog posts

**4. SEO check:**
- Go to Google Search Console (search.google.com/search-console)
- Add your domain
- Submit yoursite.com/sitemap.xml for indexing

**5. Speed check:**
- Go to pagespeed.web.dev
- Enter your URL
- Should score 80+ on mobile

---

## QUICK REFERENCE: WHERE IS EVERYTHING

| What you want to change | File to edit |
|------------------------|--------------|
| University fees | `lib/data.ts` → find university → change `feeMin`/`feeMax` |
| University NAAC/NIRF | `lib/data.ts` → find university → change `naac`/`nirf` |
| Specialisations list | `lib/data.ts` → find university → `programDetails.MBA.specs` |
| Syllabus subjects | `lib/content.ts` → find `'universityid\|\|MBA'` entry |
| Blog posts | `lib/blog.ts` → add to `BLOG_POSTS` array |
| Phone number (WhatsApp) | `.env.local` → `NEXT_PUBLIC_WHATSAPP_NUMBER` |
| Contact email | `.env.local` → `NEXT_PUBLIC_CONTACT_EMAIL` |
| Admin password | `.env.local` → `ADMIN_SECRET` |
| Lead capture sheet | `.env.local` → `NEXT_PUBLIC_LEADS_WEBHOOK_URL` |
| Home page content | `app/page.tsx` |
| About page | `app/about/page.tsx` |
| Contact page | `app/contact/page.tsx` |

---

## SUMMARY: PRIORITY ACTION LIST

Do these in order:

1. **[10 min] Connect Google Sheets** — follow Step 1 above. Leads are going to WhatsApp only right now.
2. **[2 min] Add GA4 ID** — so you can track traffic from day one.
3. **[5 min] Submit sitemap to Google Search Console** — so Google indexes your site faster.
4. **[ongoing] Add blog posts** — 2-3 per month helps SEO significantly.
5. **[optional] GitHub token** — only needed if you want to push data changes live from the admin panel without manually editing files.
