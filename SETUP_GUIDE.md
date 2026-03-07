# EdifyEdu.in — Complete Setup Guide (Zero Coding Knowledge)

## What happens when a student submits an enquiry:
1. ✅ You get an email notification instantly
2. ✅ Their details save to a Google Sheet automatically
3. ✅ They can message you on WhatsApp directly

---

## STEP 1 — Get your free email key (Web3Forms)
Takes: 2 minutes

1. Go to: **https://web3forms.com**
2. Type your email address (e.g. hello@edifyedu.in)
3. Click "Create Access Key"
4. Check your email — copy the key they send you
5. It looks like: `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx`
6. Save it — you'll need it in Step 3

---

## STEP 2 — Set up Google Sheets (stores all leads)
Takes: 5 minutes

### 2a. Create the Google Sheet:
1. Go to **sheets.google.com**
2. Click "+ New" (blank spreadsheet)
3. Name it: **EdifyEdu Leads**
4. In Row 1, type these headers in columns A to J:
   - A1: `Timestamp`
   - B1: `Name`
   - C1: `Phone`
   - D1: `Email`
   - E1: `Program`
   - F1: `University`
   - G1: `Call Time`
   - H1: `Message`
   - I1: `Source`
   - J1: `Date`

### 2b. Add the automation script:
1. In your Google Sheet, click **Extensions** (top menu)
2. Click **Apps Script**
3. Delete everything in the editor
4. Paste this entire code:

```javascript
function doPost(e) {
  try {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getActiveSheet();
    var data = JSON.parse(e.postData.contents);
    
    sheet.appendRow([
      new Date().toLocaleString('en-IN'),
      data.name || '',
      data.phone || '',
      data.email || '',
      data.program || '',
      data.university || '',
      data.callTime || '',
      data.message || '',
      data.source || 'EdifyEdu.in',
      data.submittedAt || ''
    ]);
    
    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}
```

5. Click the **Save** button (floppy disk icon)
6. Click **Deploy** → **New Deployment**
7. Click the gear icon next to "Type" → select **Web App**
8. Set:
   - Description: `EdifyEdu Leads`
   - Execute as: **Me**
   - Who has access: **Anyone**
9. Click **Deploy**
10. Click **Authorize access** → choose your Google account → Allow
11. Copy the **Web App URL** — it looks like:
    `https://script.google.com/macros/s/XXXXXXXX/exec`
12. Save this URL — you need it in Step 3

---

## STEP 3 — Add your details to the project

1. Open the `edify-next` folder on your computer
2. Find the file called `.env.example`
3. Make a **copy** of it
4. Rename the copy to: `.env.local`
5. Open `.env.local` with Notepad (Windows) or TextEdit (Mac)
6. Fill in your details:

```
NEXT_PUBLIC_WEB3FORMS_KEY=paste-your-web3forms-key-here
NEXT_PUBLIC_WHATSAPP_NUMBER=919876543210
NEXT_PUBLIC_CONTACT_EMAIL=hello@edifyedu.in
NEXT_PUBLIC_GOOGLE_SHEET_URL=paste-your-google-script-url-here
```

Replace:
- `paste-your-web3forms-key-here` → your key from Step 1
- `919876543210` → your WhatsApp number (91 + 10 digits, no spaces)
- `hello@edifyedu.in` → your email
- `paste-your-google-script-url-here` → your URL from Step 2

7. Save the file

---

## STEP 4 — Run your website

Open Terminal (Command Prompt on Windows):

```bash
cd Desktop/edify-next
npm install
npm run dev
```

Open browser → go to: **http://localhost:3000**

Click "Enquire Now" on any university card and test it!
Check your email + Google Sheet — the test lead should appear.

---

## STEP 5 — Put it live on the internet

```bash
npm install -g vercel
vercel
```

Follow the prompts (press Enter for all defaults).

**Add your environment variables on Vercel:**
1. Go to vercel.com → your project → Settings → Environment Variables
2. Add each variable from your `.env.local` file one by one
3. Click Save
4. Go to Deployments → click the 3 dots → Redeploy

Your site is live with leads working! 🎉

---

## What you'll see when a student enquires:

**Email you receive:**
```
Subject: 🎓 New Enquiry — Rahul Sharma interested in MBA @ LPU Online

Name: Rahul Sharma
Phone: 9876543210
Email: rahul@gmail.com
Program: MBA
University: LPU Online
Call Time: Evening (4pm–8pm)
Message: Is this valid for bank jobs?
Submitted: 15/01/2025, 7:34 PM
```

**Google Sheet row added:**
| Timestamp | Name | Phone | Email | Program | University | ... |
|---|---|---|---|---|---|---|
| 15/01/2025 | Rahul Sharma | 9876543210 | rahul@gmail.com | MBA | LPU Online | ... |

**WhatsApp:**
Student can also message you directly on WhatsApp with their details pre-filled.

---

## Questions?

If anything doesn't work, the most common fix is:
- Make sure `.env.local` file name is exactly right (not `.env.local.txt`)
- Make sure there are no spaces around the `=` sign in .env.local
- Run `npm run dev` again after saving .env.local
