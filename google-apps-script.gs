// Saves Ucapan from the invitation into a Google Sheet, and lists approved ucapan back to the page.
//
// Setup (once):
// 1. Open Apps Script (Extensions → Apps Script from any sheet, or script.google.com).
// 2. Replace the code there with this file and save.
// 3. Deploy → New deployment → type "Web app".
//      Execute as: Me    Who has access: Anyone
// 4. Copy the web app URL (ends in /exec) into `scriptUrl` in script.js.
// After editing this code later: Deploy → Manage deployments → Edit → Version: New version
// (keeps the same /exec link).
//
// Approving ucapan: new wishes are hidden until you tick the "Papar" checkbox
// on their row in the "Ucapan" tab. Untick to hide one again.

// The spreadsheet to write to: the long ID in its link, docs.google.com/spreadsheets/d/<ID>/edit
const SHEET_ID = "1FXTmgTb9-DHjO7Kt8Q5wKkEgQpTzsnR5nX3UxL7HSso";
const UCAPAN_HEADERS = ["Masa", "Nama", "Ucapan", "Papar"];

function sheet(name, headers) {
  const ss = SpreadsheetApp.openById(SHEET_ID);
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

function addUcapan(name, message) {
  const sh = sheet("Ucapan", UCAPAN_HEADERS);
  sh.appendRow([new Date(), clean(name, 100), clean(message, 500), false]);
  sh.getRange(sh.getLastRow(), 4).insertCheckboxes();
}

function doPost(e) {
  const p = e.parameter;
  const ok = p.type === "ucapan";
  if (ok) addUcapan(p.name, p.message);
  return ContentService.createTextOutput(JSON.stringify({ ok })).setMimeType(ContentService.MimeType.JSON);
}

// Run this from the editor (select testSheet → Run) to check the connection:
// it adds a test row and logs which spreadsheet it went to.
function testSheet() {
  addUcapan("UJIAN dari editor — sila padam", "Sambungan ke Google Sheet berfungsi.");
  const ss = SpreadsheetApp.openById(SHEET_ID);
  Logger.log("Wrote to: " + ss.getName() + " → " + ss.getUrl() + " (tab: Ucapan)");
}

// Only wishes with "Papar" ticked are sent to the invitation
function doGet() {
  const rows = sheet("Ucapan", UCAPAN_HEADERS).getDataRange().getValues().slice(1);
  const wishes = rows.filter((r) => r[3] === true).reverse().slice(0, 200).map((r) => ({ name: String(r[1]).replace(/^'/, ""), message: String(r[2]).replace(/^'/, "") }));
  return ContentService.createTextOutput(JSON.stringify(wishes)).setMimeType(ContentService.MimeType.JSON);
}
