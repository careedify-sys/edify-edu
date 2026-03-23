# Edify — Complete Setup Guide

## Prerequisites
- Node.js 18+
- A Google account
- A Vercel account (for deployment)

## 1. Environment Variables Setup

Copy `.env.local.example` to `.env.local`:
```bash
cp .env.local.example .env.local
```

Fill in all values in `.env.local`.

## 2. Google Sheets — Lead Capture Setup

### Step 1: Create the Google Sheet
1. Go to [sheets.google.com](https://sheets.google.com)
2. Create a new spreadsheet named **"Edify Leads"**
3. In Sheet 1 (rename to "Leads"), add these headers in Row 1:
   - A1: `Timestamp`
   - B1: `Name`
   - C1: `Phone`
   - D1: `Email`
   - E1: `Program`
   - F1: `University`
   - G1: `Source Page`
   - H1: `Status`

### Step 2: Create the Apps Script
1. In your Google Sheet, go to **Extensions → Apps Script**
2. Delete the default code
3. Paste this complete script:

```javascript
const SHEET_NAME = 'Leads';
const SECRET = 'YOUR_SECRET_HERE'; // Must match CMS_SHEET_SECRET in .env.local

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);

    // Optional: verify secret
    // if (data.secret !== SECRET) return jsonResponse({ error: 'Unauthorized' }, 403);

    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) return jsonResponse({ error: 'Sheet not found' }, 404);

    const timestamp = new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });

    sheet.appendRow([
      timestamp,
      data.name || '',
      data.phone || '',
      data.email || '',
      data.program || '',
      data.university || '',
      data.sourcePage || '',
      'New'
    ]);

    return jsonResponse({ success: true });
  } catch(err) {
    return jsonResponse({ error: err.message }, 500);
  }
}

function doGet(e) {
  const action = e.parameter.action;

  if (action === 'getLeads') {
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    const rows = sheet.getDataRange().getValues();
    const headers = rows[0];
    const leads = rows.slice(1).map((row, i) => {
      const obj = { row: i + 2 };
      headers.forEach((h, j) => obj[h] = row[j]);
      return obj;
    });
    return jsonResponse({ leads });
  }

  return jsonResponse({ ok: true });
}

function jsonResponse(data, code) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
```

### Step 3: Deploy the Apps Script
1. Click **Deploy → New Deployment**
2. Select type: **Web App**
3. Set **Execute as**: Me
4. Set **Who has access**: Anyone
5. Click **Deploy**
6. Copy the **Web App URL** (looks like `https://script.google.com/macros/s/ABC.../exec`)

### Step 4: Add URL to .env.local
```
NEXT_PUBLIC_LEADS_WEBHOOK_URL=https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec
```

### Step 5: Restart the dev server
```bash
npm run dev
```

---

## 3. Admin Panel

### Access
- URL: `/admin-login`
- Default password: set in `ADMIN_SECRET` environment variable

### Environment Variables
Set in `.env.local` and in Vercel dashboard:
```
ADMIN_SECRET=your-strong-password
ADMIN_SESSION_TOKEN=generate-with-openssl-rand-hex-32
```

---

## 4. Blog Management

Blog posts are managed in `lib/blog.ts`. To add a new post:
1. Open `lib/blog.ts`
2. Add a new entry to the `BLOG_POSTS` array
3. Set `status: 'published'` to make it live
4. Required fields: `slug`, `title`, `metaDescription`, `content`, `category`, `publishedAt`

---

## 5. University Data Updates

University data is in `lib/data.ts`. Each university object has:
- `id`: URL slug
- `name`: Full university name
- `programs`: Array of programs offered
- `programDetails`: Object with per-program fee, specs, syllabus, etc.
- `feeMin`/`feeMax`: Fee range in rupees
- `nirf`/`naac`: Rankings and accreditation

---

## 6. Deployment (Vercel)

1. Push to GitHub
2. Connect to Vercel
3. Add all environment variables in Vercel dashboard
4. Deploy

Required environment variables for Vercel:
- `ADMIN_SECRET`
- `ADMIN_SESSION_TOKEN`
- `NEXT_PUBLIC_WEB3FORMS_KEY`
- `NEXT_PUBLIC_LEADS_WEBHOOK_URL`
- `NEXT_PUBLIC_GA4_ID`
- `REVALIDATE_SECRET`
