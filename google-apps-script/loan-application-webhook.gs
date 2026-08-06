const CONFIG = {
  SHEET_NAME: "Loan Applications",
  RECIPIENTS: [
    "kredibilityweb@gmail.com",
    "admin@kredibilityfinance.co.zw"
  ],
  FROM_NAME: "Kredibility Finance Website",
  SEND_APPLICANT_CONFIRMATION: true
};

const FIELD_ORDER = [
  ["reference", "Reference"],
  ["submittedAt", "Submitted At"],
  ["name", "Full Name"],
  ["national-id", "National ID"],
  ["phone", "Phone / WhatsApp"],
  ["email", "Email"],
  ["employer", "Employer / Business"],
  ["monthly-income", "Monthly Income (USD)"],
  ["employment-type", "Employment Type"],
  ["ec-number", "EC Number"],
  ["loan-type", "Loan Type"],
  ["collateral-type", "Collateral Type"],
  ["requested-amount", "Amount Requested (USD)"],
  ["term", "Preferred Term"],
  ["purpose", "Purpose"],
  ["consent", "Consent"],
  ["sourcePage", "Source Page"]
];

function doPost(event) {
  try {
    const payload = parsePayload_(event);

    if (payload["company-website"]) {
      return json_({ ok: true, skipped: true });
    }

    validate_(payload);
    appendToSheet_(payload);
    sendTeamEmail_(payload);

    if (CONFIG.SEND_APPLICANT_CONFIRMATION && payload.email) {
      sendApplicantConfirmation_(payload);
    }

    return json_({ ok: true, reference: payload.reference });
  } catch (error) {
    console.error(error);
    return json_({ ok: false, error: error.message });
  }
}

function doGet() {
  return json_({
    ok: true,
    service: "Kredibility loan application webhook"
  });
}

function parsePayload_(event) {
  const raw = event && event.postData && event.postData.contents ? event.postData.contents : "{}";
  const parsed = JSON.parse(raw);
  parsed.reference = parsed.reference || "KF-" + Date.now().toString(36).toUpperCase();
  parsed.submittedAt = parsed.submittedAt || new Date().toISOString();
  return parsed;
}

function validate_(payload) {
  const required = ["name", "national-id", "phone", "loan-type", "requested-amount", "consent"];
  const missing = required.filter(function (key) {
    return !String(payload[key] || "").trim();
  });

  if (missing.length) {
    throw new Error("Missing required fields: " + missing.join(", "));
  }
}

function appendToSheet_(payload) {
  const spreadsheet = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = getOrCreateSheet_(spreadsheet, CONFIG.SHEET_NAME);
  const headers = FIELD_ORDER.map(function (field) {
    return field[1];
  });

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
    sheet.setFrozenRows(1);
  }

  sheet.appendRow(FIELD_ORDER.map(function (field) {
    return payload[field[0]] || "";
  }));
}

function getOrCreateSheet_(spreadsheet, sheetName) {
  return spreadsheet.getSheetByName(sheetName) || spreadsheet.insertSheet(sheetName);
}

function sendTeamEmail_(payload) {
  const subject = "New Loan Application: " + safe_(payload.name) + " (" + safe_(payload.reference) + ")";
  const htmlBody = buildTeamHtml_(payload);
  const plainBody = buildPlainText_(payload);

  GmailApp.sendEmail(CONFIG.RECIPIENTS.join(","), subject, plainBody, {
    name: CONFIG.FROM_NAME,
    htmlBody: htmlBody,
    replyTo: payload.email || undefined
  });
}

function sendApplicantConfirmation_(payload) {
  const subject = "Kredibility Finance received your loan application";
  const firstName = String(payload.name || "there").split(" ")[0];
  const body = "Hi " + firstName + ",\n\n" +
    "Thank you for applying with Kredibility Finance. Your application reference is " + payload.reference + ".\n\n" +
    "Our credit team will contact you within 24 hours to confirm your details and the next steps.\n\n" +
    "Kredibility Finance";

  GmailApp.sendEmail(payload.email, subject, body, {
    name: CONFIG.FROM_NAME
  });
}

function buildTeamHtml_(payload) {
  const rows = FIELD_ORDER.map(function (field) {
    return "<tr>" +
      "<th style=\"text-align:left;padding:10px 12px;border-bottom:1px solid #ead8df;background:#fff7fa;width:220px;\">" + field[1] + "</th>" +
      "<td style=\"padding:10px 12px;border-bottom:1px solid #ead8df;\">" + safe_(payload[field[0]] || "Not provided") + "</td>" +
      "</tr>";
  }).join("");

  return "<div style=\"font-family:Arial,sans-serif;color:#161011;line-height:1.45;\">" +
    "<h2 style=\"margin:0 0 6px;color:#b5135a;\">New Kredibility Loan Application</h2>" +
    "<p style=\"margin:0 0 18px;\">A new application was submitted from the website.</p>" +
    "<table style=\"border-collapse:collapse;width:100%;max-width:760px;border:1px solid #ead8df;\">" + rows + "</table>" +
    "</div>";
}

function buildPlainText_(payload) {
  return FIELD_ORDER.map(function (field) {
    return field[1] + ": " + (payload[field[0]] || "Not provided");
  }).join("\n");
}

function safe_(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function json_(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
