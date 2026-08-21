const NURSE_LEAD_CONFIG = {
  SHEET_NAME: "School Fees Loan Leads",
  TIME_ZONE: "Africa/Harare"
};

const NURSE_LEAD_FIELDS = [
  ["submittedAt", "Submitted At"],
  ["name", "Full Name"],
  ["phone", "Phone / WhatsApp"],
  ["email", "Email"],
  ["company", "Employer / Facility"],
  ["jobTitle", "Job Title"],
  ["schoolLevel", "School Level"],
  ["campaign", "Campaign"],
  ["sourcePage", "Source Page"],
  ["consent", "Processing Consent"],
  ["marketingConsent", "Marketing Consent"],
  ["consentRecorded", "Consent Record"],
  ["status", "Lead Status"],
  ["owner", "Assigned To"],
  ["followUp", "Follow-up Date"],
  ["notes", "Notes"]
];

function doPost(event) {
  try {
    const payload = JSON.parse(event.postData.contents || "{}");

    if (payload.website) return jsonResponse_({ ok: true, skipped: true });
    validateSchoolFeesLead_(payload);

    payload.status = "New";
    payload.owner = "";
    payload.followUp = "";
    payload.notes = "";

    const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
    const sheet = spreadsheet.getSheetByName(NURSE_LEAD_CONFIG.SHEET_NAME) || spreadsheet.insertSheet(NURSE_LEAD_CONFIG.SHEET_NAME);
    const headers = NURSE_LEAD_FIELDS.map(function (field) { return field[1]; });

    if (sheet.getLastRow() === 0) {
      sheet.appendRow(headers);
      sheet.setFrozenRows(1);
      sheet.getRange(1, 1, 1, headers.length).setBackground("#B5135A").setFontColor("#FFFFFF").setFontWeight("bold");
    }

    sheet.appendRow(NURSE_LEAD_FIELDS.map(function (field) { return safeCell_(payload[field[0]] || ""); }));
    return jsonResponse_({ ok: true });
  } catch (error) {
    console.error(error);
    return jsonResponse_({ ok: false, error: error.message });
  }
}

function doGet() {
  return jsonResponse_({ ok: true, service: "Kredibility school fees lead CRM" });
}

function validateSchoolFeesLead_(payload) {
  const required = ["name", "phone", "email", "company", "jobTitle", "schoolLevel", "consent", "consentRecorded"];
  const missing = required.filter(function (key) { return !String(payload[key] || "").trim(); });
  if (missing.length) throw new Error("Missing required fields: " + missing.join(", "));
}

function safeCell_(value) {
  const text = String(value);
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function jsonResponse_(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
