(function () {
  "use strict";
  const form = document.querySelector("#loan-application-form");
  if (!form) return;

  const submitButton = form.querySelector("[data-submit-button]");
  const consentCheckbox = document.getElementById("consent-checkbox");
  const consentRecorded = document.getElementById("consent-recorded");

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

  function stampConsent() {
    if (!consentRecorded) return;
    consentRecorded.value = "Application processing requested at " + new Date().toISOString() + "; privacy notice version 2026-08-08";
  }

  if (consentCheckbox) {
    consentCheckbox.addEventListener("change", function () {
      consentRecorded.value = this.checked ? (stampConsent(), consentRecorded.value) : "";
    });
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!consentRecorded.value) stampConsent();
    submitButton.disabled = true;
    submitButton.textContent = "Sending application…";

    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: new FormData(form) });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Submission failed");

      const choices = window.KredibilityConsent && window.KredibilityConsent.get();
      if (choices && choices.advertising && typeof window.fbq === "function") window.fbq("track", "Lead");
      if (choices && choices.analytics && typeof window.gtag === "function") window.gtag("event", "generate_lead", { method: "initial_loan_application" });
      window.location.href = "thank-you";
    } catch (error) {
      console.error("Submission error:", error);
      submitButton.disabled = false;
      submitButton.textContent = "Submit Initial Application";
      alert("We could not send your application. Please call or WhatsApp +263 781 325 844 without sending identity or bank documents.");
    }
  });
})();
