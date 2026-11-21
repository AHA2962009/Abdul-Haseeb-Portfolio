# Google Sheets Backend Setup

This portfolio can use one Google Sheet as its lightweight CMS/backend through Google Apps Script.

## 1. Create the Google Sheet
Create a new Google Sheet, e.g. `Abdul Haseeb Portfolio CMS`.

## 2. Add Apps Script
Open **Extensions → Apps Script**. Delete the default code and paste `Code.gs` from this folder.

## 3. Create the database tabs
In Apps Script, select `setupSheets` from the function dropdown and click **Run** once. Authorize the script. It creates:
- Profile
- Skills
- Projects
- Experience
- Education
- Certifications
- Social
- Settings
- Messages

## 4. Create an admin key
In Apps Script open **Project Settings → Script Properties → Add script property**:
- Property: `ADMIN_KEY`
- Value: make your own long random value

Do not put this key in a public GitHub repository. This starter stores it only in Apps Script. If your browser admin page needs to perform writes directly, a production deployment should use real authentication rather than exposing a write key in client JavaScript.

## 5. Deploy
Apps Script → **Deploy → New deployment → Web app**.
Set **Execute as: Me**. Choose the access level appropriate for your setup. Copy the Web App URL ending in `/exec`.

## 6. Connect the portfolio
Open `js/config.js` and set:
`window.PORTFOLIO_API_URL = 'YOUR_WEB_APP_URL/exec';`

Then open the portfolio with Live Server.

### Important
Google Sheets is excellent for a small portfolio CMS, but it is not a replacement for a proper secure backend. For production admin authentication, use a real auth layer (e.g. Supabase Auth or a Node/Express API) and keep write credentials server-side.
