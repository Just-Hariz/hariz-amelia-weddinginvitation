// Saves RSVP and Ucapan from the invitation into a Google Sheet, and lists ucapan back to the page.
//
// Setup (once):
// 1. Create a new Google Sheet → Extensions → Apps Script.
// 2. Replace the code there with this file and save.
// 3. Deploy → New deployment → type "Web app".
//      Execute as: Me    Who has access: Anyone
// 4. Copy the web app URL (ends in /exec) into `scriptUrl` in script.js.
// The sheet gets two tabs, "RSVP" and "Ucapan", created automatically on the first entry.
//
// Approving ucapan: new wishes are hidden until you tick the "Papar" checkbox
// on their row in the "Ucapan" tab. Untick to hide one again.

const UCAPAN_HEADERS = ["Masa", "Nama", "Ucapan", "Papar"];

function sheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sh = ss.getSheetByName(name);
  if (!sh) {
    sh = ss.insertSheet(name);
    sh.appendRow(headers);
    sh.setFrozenRows(1);
  }
  return sh;
}

// Stops guest text from being treated as a spreadsheet formula
function clean(value, max) {
  const s = String(value || "").slice(0, max);
  return /^[=+\-@]/.test(s) ? "'" + s : s;
}

function doPost(e) {
  const p = e.parameter;
  if (p.type === "rsvp") {
    sheet("RSVP", ["Masa", "Nama", "Telefon", "Kehadiran", "Bilangan"])
      .appendRow([new Date(), clean(p.name, 100), clean(p.phone, 30), clean(p.attend, 20), Number(p.pax) || 0]);
  } else if (p.type === "ucapan") {
    const sh = sheet("Ucapan", UCAPAN_HEADERS);
    sh.appendRow([new Date(), clean(p.name, 100), clean(p.message, 500), false]);
    sh.getRange(sh.getLastRow(), 4).insertCheckboxes();
  }
  return ContentService.createTextOutput(JSON.stringify({ ok: true })).setMimeType(ContentService.MimeType.JSON);
}

// Only wishes with "Papar" ticked are sent to the invitation
function doGet() {
  const rows = sheet("Ucapan", UCAPAN_HEADERS).getDataRange().getValues().slice(1);
  const wishes = rows.filter((r) => r[3] === true).reverse().slice(0, 200).map((r) => ({ name: String(r[1]).replace(/^'/, ""), message: String(r[2]).replace(/^'/, "") }));
  return ContentService.createTextOutput(JSON.stringify(wishes)).setMimeType(ContentService.MimeType.JSON);
}
