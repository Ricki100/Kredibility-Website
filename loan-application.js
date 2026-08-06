(function () {
  const form = document.querySelector("#loan-application-form");
  if (!form) return;

  const submitButton = form.querySelector("[data-submit-button]");
  const consentCheckbox = document.getElementById("consent-checkbox");
  const consentRecorded = document.getElementById("consent-recorded");

  /* ── Currency formatting ── */
  function formatCurrency(input) {
    const num = parseFloat(input.value.replace(/[^0-9.]/g, ""));
    if (!isNaN(num) && num > 0) {
      input.value = "$" + num.toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    } else {
      input.value = "";
    }
  }

  document.querySelectorAll("[data-currency]").forEach(function (input) {
    // Format immediately if a value already exists
    formatCurrency(input);

    // Re-format on every keystroke so $ always stays
    input.addEventListener("input", function () {
      const raw = this.value.replace(/[^0-9.]/g, "");
      // While typing just keep the raw digits — format fully on blur
      this.value = raw ? "$" + raw : "";
      // Move cursor to end
      const len = this.value.length;
      this.setSelectionRange(len, len);
    });

    // Full format (e.g. $1,250.00) when leaving the field
    input.addEventListener("blur", function () {
      formatCurrency(this);
    });

    // Select all on focus so user just types the new amount
    input.addEventListener("focus", function () {
      const self = this;
      setTimeout(function () { self.select(); }, 0);
    });

    // Only allow digits and one decimal point
    input.addEventListener("keydown", function (e) {
      const allowed = ["Backspace","Delete","Tab","ArrowLeft","ArrowRight","Home","End"];
      if (allowed.includes(e.key)) return;
      if (e.key === "." && !this.value.replace(/[^.]/g,"").length) return;
      if (!/\d/.test(e.key)) e.preventDefault();
    });
  });

  /* ── Phone number formatting (Zimbabwe +263) ── */
  document.querySelectorAll("[data-phone]").forEach(function (input) {
    input.addEventListener("input", function () {
      let digits = this.value.replace(/\D/g, "");
      if (digits.startsWith("263")) digits = digits.slice(3);
      if (digits.startsWith("0")) digits = digits.slice(1);
      digits = digits.slice(0, 9);
      let out = "+263";
      if (digits.length > 0) out += " " + digits.slice(0, 2);
      if (digits.length > 2) out += " " + digits.slice(2, 5);
      if (digits.length > 5) out += " " + digits.slice(5, 9);
      this.value = out;
    });
    input.addEventListener("keydown", function (e) {
      if ((e.key === "Backspace" || e.key === "Delete") && this.value === "+263") {
        this.value = "";
      }
    });
  });

  /* ── Dynamic fields: EC number, collateral, and the live requirements panel ──
     Keeps the loan-requirements rules in one place so the form only asks for
     what actually applies, and so hidden fields never silently block submit:
     visibility and `required` are always toggled together. */
  const employmentSelect = document.getElementById("employment-type");
  const loanTypeSelect = document.getElementById("loan-type");
  const ecField = document.getElementById("ec-number-field");
  const ecInput = document.getElementById("ec-number-input");
  const collateralField = document.getElementById("collateral-field");
  const collateralSelect = document.getElementById("collateral-type");
  const requirementsPanel = document.getElementById("requirements-panel");

  const COLLATERAL_LOAN_TYPES = ["SME & Micro-Enterprise Loan", "Asset-Based Micro-Loan"];

  const COLLATERAL_DOCS = {
    "Motor vehicle": "Vehicle registration book, police clearance and a valuation report.",
    "Stand or house": "Title deeds (Kredibility can assist with bond registration and property valuation).",
    "Household assets": "Household electricals with serial numbers — e.g. fridges, stoves, laptops, phones.",
    "Other": "Tell us more about the asset in the Purpose field below — we'll confirm exactly what's needed once you submit.",
  };

  function hasEmploymentChoice() {
    return !!(employmentSelect && employmentSelect.value);
  }

  function isSSB() {
    return !!employmentSelect && employmentSelect.value === "Civil servant";
  }

  function collateralApplies() {
    if (loanTypeSelect && COLLATERAL_LOAN_TYPES.includes(loanTypeSelect.value)) return true;
    return hasEmploymentChoice() && !isSSB();
  }

  // Keeps a field's visibility and required-ness in lockstep so a hidden
  // field can never block submission, and clears its value when hidden so
  // stale/irrelevant answers never get submitted.
  function setFieldVisible(labelEl, inputEl, visible) {
    if (!labelEl) return;
    labelEl.hidden = !visible;
    if (inputEl) {
      inputEl.required = visible;
      if (!visible) inputEl.value = "";
    }
  }

  function renderRequirements() {
    if (!requirementsPanel) return;

    if (!hasEmploymentChoice() || !loanTypeSelect || !loanTypeSelect.value) {
      requirementsPanel.innerHTML =
        "<strong>Documents you'll need</strong><p>Select your employment type and loan type above to see exactly what to have ready.</p>";
      return;
    }

    const items = [
      "Proof of residency (ZESA, Council or Telone bill, or cession in your own name — otherwise a Commissioner-stamped affidavit)",
      "Proof of income (current payslip, 3 months' bank statements, or a stamped letter of employment)",
      "Copy of your ID",
      "One passport-size photo",
    ];

    let extra = "";
    if (isSSB()) {
      extra = "<p><strong>SSB applicants:</strong> your EC number and ID are what confirm eligibility — no collateral required.</p>";
    } else if (collateralApplies()) {
      const chosen = collateralSelect ? collateralSelect.value : "";
      extra = chosen && COLLATERAL_DOCS[chosen]
        ? "<p><strong>Collateral (" + chosen + "):</strong> " + COLLATERAL_DOCS[chosen] + " Valued at roughly 3× the loan amount.</p>"
        : "<p><strong>Collateral required</strong> — select a collateral type above to see the exact documents needed. Valued at roughly 3× the loan amount.</p>";
    }

    requirementsPanel.innerHTML =
      "<strong>Documents you'll need</strong><ul>" +
      items.map(function (item) { return "<li>" + item + "</li>"; }).join("") +
      "</ul>" + extra;
  }

  function updateDynamicFields() {
    setFieldVisible(ecField, ecInput, hasEmploymentChoice() && isSSB());
    setFieldVisible(collateralField, collateralSelect, collateralApplies());
    renderRequirements();
  }

  if (employmentSelect) employmentSelect.addEventListener("change", updateDynamicFields);
  if (loanTypeSelect) loanTypeSelect.addEventListener("change", updateDynamicFields);
  if (collateralSelect) collateralSelect.addEventListener("change", renderRequirements);
  updateDynamicFields();

  /* ── Consent timestamp ── */
  function stampConsent() {
    if (!consentRecorded) return;
    const now = new Date();
    consentRecorded.value =
      "Consent given on " +
      now.toLocaleDateString("en-GB", { day: "2-digit", month: "long", year: "numeric" }) +
      " at " +
      now.toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" }) +
      " (applicant local time)";
  }

  if (consentCheckbox) {
    consentCheckbox.addEventListener("change", function () {
      if (this.checked) stampConsent();
      else if (consentRecorded) consentRecorded.value = "";
    });
  }

  /* ── Submit via Web3Forms AJAX ── */
  form.addEventListener("submit", async function (e) {
    e.preventDefault();

    // Consent gate
    if (consentCheckbox && !consentCheckbox.checked) {
      consentCheckbox.focus();
      return;
    }
    if (consentRecorded && !consentRecorded.value) stampConsent();
    if (!form.reportValidity()) return;

    // Loading state
    if (submitButton) {
      submitButton.disabled = true;
      submitButton.textContent = "Sending Application…";
    }

    const formData = new FormData(form);

    // Send CC as separate field so both inboxes receive it
    formData.append("cc", "admin@kredibilityfinance.co.zw");

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (result.success) {
        // Log to Google Sheets tracker (fire and forget)
        try {
          const sheetData = {};
          formData.forEach(function(value, key) { sheetData[key] = value; });
          fetch("https://script.google.com/macros/s/AKfycbwlISUAFQsU1SoLpXKD0jwNJvb6k-BNCjB6cW717z01AotKFwx0yPy-8bdMNvpxqDQd/exec", {
            method: "POST",
            mode: "no-cors",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(sheetData)
          });
        } catch (sheetErr) {
          console.warn("Sheet logging failed:", sheetErr);
        }
        // Fire Meta Pixel Lead event
        if (typeof fbq === "function") fbq("track", "Lead");
        // Fire GA4 Lead event (GA4's automatic form_submit detection does not
        // reliably catch this form since submission is handled via fetch()
        // with preventDefault() — an explicit event is required)
        if (typeof gtag === "function") {
          gtag("event", "generate_lead", { method: "loan_application_form" });
        }
        // Redirect to thank-you page
        window.location.href = "thank-you.html";
      } else {
        throw new Error(result.message || "Submission failed");
      }
    } catch (err) {
      console.error("Submission error:", err);
      if (submitButton) {
        submitButton.disabled = false;
        submitButton.textContent = "Submit My Application";
      }
      alert(
        "We could not send your application right now.\n\nPlease WhatsApp us on +263 781 325 844 or email admin@kredibilityfinance.co.zw with your details."
      );
    }
  });
})();
