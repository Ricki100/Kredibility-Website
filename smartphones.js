(function () {
  "use strict";

  const form = document.getElementById("nurse-lead-form");
  if (!form) return;

  const button = form.querySelector("[data-nurse-submit]");
  const status = form.querySelector("[data-nurse-status]");
  const consent = document.getElementById("nurse-consent");
  const consentRecorded = document.getElementById("nurse-consent-recorded");
  const phoneInterest = document.getElementById("phone-interest");
  const whatsappNumber = "263781325844";

  document.querySelectorAll("[data-phone-model]").forEach(function (trigger) {
    trigger.addEventListener("click", function () {
      phoneInterest.value = this.dataset.phoneModel;
      form.scrollIntoView({ behavior: "smooth", block: "start" });
      window.setTimeout(function () { phoneInterest.focus({ preventScroll: true }); }, 500);
    });
  });

  form.querySelectorAll("[data-nurse-phone]").forEach(function (input) {
    input.addEventListener("input", function () {
      let digits = this.value.replace(/\D/g, "");
      if (digits.startsWith("263")) digits = digits.slice(3);
      if (digits.startsWith("0")) digits = digits.slice(1);
      digits = digits.slice(0, 9);
      this.value = "+263" + (digits ? " " + digits.slice(0, 2) : "") + (digits.length > 2 ? " " + digits.slice(2, 5) : "") + (digits.length > 5 ? " " + digits.slice(5) : "");
    });
  });

  function recordConsent() {
    consentRecorded.value = "Smartphone-catalogue enquiry processing requested at " + new Date().toISOString() + "; privacy notice version 2026-08-20";
  }

  consent.addEventListener("change", function () {
    consentRecorded.value = this.checked ? (recordConsent(), consentRecorded.value) : "";
  });

  function leadPayload(formData) {
    return {
      submittedAt: new Date().toISOString(),
      name: formData.get("name"),
      phone: formData.get("phone"),
      email: formData.get("email"),
      company: formData.get("company"),
      jobTitle: formData.get("job-title"),
      ssbEmployee: formData.get("ssb-employee-confirmation"),
      phoneInterest: formData.get("phone-interest"),
      campaign: formData.get("campaign"),
      sourcePage: formData.get("source-page"),
      consent: formData.get("lead-processing-consent"),
      marketingConsent: formData.get("marketing-consent") || "No",
      consentRecorded: formData.get("consent-recorded"),
      website: formData.get("botcheck") || ""
    };
  }

  function whatsappUrl(payload) {
    const message = [
      "Hello Kredibility Finance, I am an SSB employee interested in a salary-based smartphone loan. Please send me the full catalogue.",
      "",
      "Name: " + payload.name,
      "Phone: " + payload.phone,
      "Email: " + payload.email,
      "Government ministry / department: " + payload.company,
      "Job title: " + payload.jobTitle,
      "SSB employee confirmed: " + payload.ssbEmployee,
      "Phone of interest: " + payload.phoneInterest,
      "",
      "Please confirm the current catalogue, availability, pricing and next steps."
    ].join("\n");
    return "https://wa.me/" + whatsappNumber + "?text=" + encodeURIComponent(message);
  }

  async function saveToCrm(payload) {
    const endpoint = form.dataset.crmEndpoint.trim();
    if (!endpoint) return { configured: false };
    await fetch(endpoint, { method: "POST", mode: "no-cors", headers: { "Content-Type": "text/plain;charset=utf-8" }, body: JSON.stringify(payload) });
    return { configured: true };
  }

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    if (!consentRecorded.value) recordConsent();

    button.disabled = true;
    button.textContent = "Saving your details…";
    status.classList.remove("is-error");
    status.textContent = "Please wait while we record your catalogue request.";
    const formData = new FormData(form);
    const payload = leadPayload(formData);

    try {
      const delivery = await fetch("https://api.web3forms.com/submit", { method: "POST", body: formData });
      const deliveryResult = await delivery.json();
      if (!deliveryResult.success) throw new Error(deliveryResult.message || "Lead delivery failed");
      try { await saveToCrm(payload); } catch (crmError) { console.error("CRM copy failed; Web3Forms delivery succeeded:", crmError); }

      const choices = window.KredibilityConsent && window.KredibilityConsent.get();
      if (choices && choices.advertising && typeof window.fbq === "function") window.fbq("track", "Lead", { content_name: "SSB Employee Smartphone Catalogue" });
      if (choices && choices.analytics && typeof window.gtag === "function") window.gtag("event", "generate_lead", { method: "smartphone_catalogue_whatsapp" });

      status.textContent = "Details saved. Opening WhatsApp…";
      window.location.assign(whatsappUrl(payload));
    } catch (error) {
      console.error("Smartphone catalogue lead submission error:", error);
      button.disabled = false;
      button.textContent = "Save details & open WhatsApp";
      status.classList.add("is-error");
      status.textContent = "We could not save your details. Please try again or call +263 781 325 844.";
    }
  });
})();
