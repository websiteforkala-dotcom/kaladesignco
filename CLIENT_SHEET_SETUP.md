# Contact Form Setup Guide for Kala Design Co

To connect your website's contact form to a Google Sheet, follow these steps. This will allow you to receive all inquiries directly in a spreadsheet.

## Phase 1: Create the Spreadsheet
1.  Go to [Google Sheets](https://sheets.google.com) and create a **Blank spreadsheet**.
2.  Name it **"Kala Design Co Inquiries"**.
3.  In the first row (the header row), add the following column names exactly as written (case-sensitive):
    - `timestamp`
    - `name`
    - `email`
    - `phone`
    - `service`
    - `message`

## Phase 2: Add the Automation Script
1.  In your new spreadsheet, go to **Extensions** > **Apps Script**.
2.  A new tab will open with a code editor. **Delete** all the existing code in `Code.gs`.
3.  **Copy and paste** the following code into the editor:

```javascript
const SHEET_NAME = "Sheet1";

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.tryLock(10000);

  try {
    const doc = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = doc.getSheetByName(SHEET_NAME);

    const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
    const nextRow = sheet.getLastRow() + 1;

    const newRow = headers.map(function(header) {
      if (header === 'timestamp') return new Date();
      return e.parameter[header] || '';
    });

    sheet.getRange(nextRow, 1, 1, newRow.length).setValues([newRow]);

    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'success', 'row': nextRow }))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (e) {
    return ContentService
      .createTextOutput(JSON.stringify({ 'result': 'error', 'error': e }))
      .setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
```

4.  Click the **Save** icon (floppy disk) or press `Ctrl + S`. Name the project "Contact Form" if asked.

## Phase 3: Deploy the Script
1.  Click the blue **Deploy** button (top right) > **New deployment**.
2.  Click the gear icon (Select type) > **Web app**.
3.  Fill in the details:
    - **Description**: Contact Form
    - **Execute as**: **Me** (your email address)
    - **Who has access**: **Anyone** (IMPORTANT: Select "Anyone" at the bottom of the list. This allows the website to send data to the sheet.)
4.  Click **Deploy**.
5.  **Authorize Access**:
    - Click **Authorize access**.
    - Choose your Google account.
    - If you see "Google hasn't verified this app" (since you just created it), click **Advanced**.
    - Click **Go to Contact Form (unsafe)** at the bottom.
    - Click **Allow**.

## Phase 4: Connect to Website
1.  After deployment, you will see a **Web App URL**.
2.  Copy this URL (it starts with `https://script.google.com/macros/s/...`).
3.  **Send this URL to your developer** so they can update the website code.

---

### For Data Entry / Developer Use Only
**Instructions to update the code:**
1.  Open `contact-form-gsheets.js`.
2.  Replace the placeholder URL with the new Web App URL provided by the client.
