(function () {
  "use strict";
  const form = document.querySelector("#loan-application-form");
  if (!form) return;

  const submitButton = form.querySelector("[data-submit-button]");
  const status = form.querySelector("[data-application-status]");
  const consentCheckbox = document.getElementById("consent-checkbox");
  const consentRecorded = document.getElementById("consent-recorded");
  const maritalStatus = document.getElementById("marital-status");
  const spouseFields = Array.from(form.querySelectorAll("[data-spouse-field]"));
  const whatsappNumber = "263781325844";

  function setStatus(message, type) {
    if (!status) return;
    status.textContent = message;
    if (type) status.dataset.type = type;
    else status.removeAttribute("data-type");
  }

  function fieldValue(name, fallback) {
    const field = form.elements.namedItem(name);
    const value = field && typeof field.value === "string" ? field.value.trim() : "";
    return value || fallback || "Not provided";
  }

  document.querySelectorAll("[data-currency]").forEach(function (input) {
    input.addEventListener("input", function () {
      const raw = this.value.replace(/[^0-9.]/g, "").slice(0, 12);
      this.value = raw ? "$" + raw : "";
    });
  });

  document.querySelectorAll("[data-phone]").forEach(function (input) {
    input.addEventListener("input", function () {
      let digits = this.value.replace(/\D/g, "");
      if (digits.startsWith("263")) digits = digits.slice(3);
      if (digits.startsWith("0")) digits = digits.slice(1);
      digits = digits.slice(0, 9);
      this.value = "+263" + (digits ? " " + digits.slice(0, 2) : "") + (digits.length > 2 ? " " + digits.slice(2, 5) : "") + (digits.length > 5 ? " " + digits.slice(5) : "");
    });
  });

  function updateSpouseRequirements() {
    const isMarried = maritalStatus && maritalStatus.value === "Married";
    spouseFields.forEach(function (field) { field.required = isMarried; });
  }

  if (maritalStatus) {
    maritalStatus.addEventListener("change", updateSpouseRequirements);
    updateSpouseRequirements();
  }

  function stampConsent() {
    if (!consentRecorded) return;
    consentRecorded.value = "Application processing requested at " + new Date().toISOString() + "; privacy notice version 2026-09-17";
  }

  if (consentCheckbox) {
    consentCheckbox.addEventListener("change", function () {
      consentRecorded.value = this.checked ? (stampConsent(), consentRecorded.value) : "";
    });
  }

  function buildWhatsAppMessage() {
    return [
      "KREDIBILITY LOAN APPLICATION", "",
      "PERSONAL DETAILS",
      "Full name: " + fieldValue("full-name"),
      "Physical home address: " + fieldValue("home-address"),
      "Marital status: " + fieldValue("marital-status"),
      "Phone number: " + fieldValue("phone"),
      "Years at residential address: " + fieldValue("years-at-address"),
      "Number of dependants: " + fieldValue("number-of-dependants"),
      "Email: " + fieldValue("email"),
      "Bank: " + fieldValue("bank-name"),
      "Branch: " + fieldValue("bank-branch"),
      "Account number: " + fieldValue("bank-account-number"), "",
      "WORK DETAILS",
      "Ministry / employer: " + fieldValue("ministry-employer"),
      "Work address: " + fieldValue("work-address"),
      "Work contact number: " + fieldValue("work-contact-number"),
      "EC number: " + fieldValue("ec-number"), "",
      "SPOUSE DETAILS",
      "Full name: " + fieldValue("spouse-full-name", "Not applicable"),
      "Relationship: " + fieldValue("spouse-relationship", "Not applicable"),
      "Mobile number: " + fieldValue("spouse-mobile-number", "Not applicable"),
      "Physical address: " + fieldValue("spouse-physical-address", "Not applicable"),
      "Employer & profession: " + fieldValue("spouse-employer-profession", "Not applicable"), "",
      "NEXT OF KIN DETAILS",
      "Full name: " + fieldValue("next-of-kin-full-name"),
      "Relationship: " + fieldValue("next-of-kin-relationship"),
      "Mobile number: " + fieldValue("next-of-kin-mobile-number"),
      "Physical address: " + fieldValue("next-of-kin-physical-address"),
      "Employer & profession: " + fieldValue("next-of-kin-employer-profession"), "",
      "PRODUCT DETAILS",
      "Loan amount: " + fieldValue("loan-amount"),
      "Preferred instalment: " + fieldValue("preferred-instalment"),
      "Number of months: " + fieldValue("number-of-months"), "",
      "I will attach clear pictures of:",
      "1. This information written on paper and signed",
      "2. My National ID",
      "3. My passport-size photo"
    ].join("\n");
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    updateSpouseRequirements();
    if (!form.reportValidity()) return;
    if (!consentRecorded.value) stampConsent();
    submitButton.disabled = true;
    submitButton.textContent = "Saving application…";
    setStatus("Saving your application before opening WhatsApp…");

    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: new FormData(form) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Submission failed");

      const choices = window.KredibilityConsent && window.KredibilityConsent.get();
      if (choices && choices.advertising && typeof window.fbq === "function") window.fbq("track", "Lead");
      if (choices && choices.analytics && typeof window.gtag === "function") window.gtag("event", "generate_lead", { method: "whatsapp_loan_application" });

      setStatus("Application saved. Opening WhatsApp so you can send it and attach your clear pictures…", "success");
      window.location.assign("https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(buildWhatsAppMessage()));
    } catch (error) {
      console.error("Submission error:", error);
      submitButton.disabled = false;
      submitButton.textContent = "Save application & open WhatsApp";
      setStatus("We could not save your application. Please check your connection and try again. Your details have not been sent to WhatsApp.", "error");
    }
  });
})();
