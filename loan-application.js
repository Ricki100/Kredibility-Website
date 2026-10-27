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
  const spouseSection = document.getElementById("spouse-section");
  const steps = Array.from(form.querySelectorAll(".form-step"));
  const progress = form.querySelector("[data-form-progress]");
  let currentStep = 0;
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
    // Only married applicants see the spouse section.
    if (spouseSection) spouseSection.hidden = !isMarried;
  }

  if (maritalStatus) {
    maritalStatus.addEventListener("change", updateSpouseRequirements);
    updateSpouseRequirements();
  }

  // ---- Step-by-step layout. Without JavaScript every step shows as one long form. ----
  function trackStep(step) {
    const choices = window.KredibilityConsent && window.KredibilityConsent.get();
    if (choices && choices.analytics && typeof window.gtag === "function") window.gtag("event", "loan_application_step", { step: step });
  }

  function stepFields(step) {
    return Array.from(step.querySelectorAll("input, select, textarea")).filter(function (field) {
      return field.type !== "hidden" && field.name !== "botcheck" && !field.closest("[hidden]");
    });
  }

  function validateStep(index) {
    const fields = stepFields(steps[index]);
    for (let i = 0; i < fields.length; i++) {
      if (!fields[i].checkValidity()) { fields[i].reportValidity(); return false; }
    }
    return true;
  }

  function showStep(index, scroll) {
    currentStep = index;
    steps.forEach(function (step, i) { step.classList.toggle("is-current", i === index); });
    if (progress) {
      const count = progress.querySelector("[data-progress-count]");
      const title = progress.querySelector("[data-progress-title]");
      if (count) count.textContent = "Step " + (index + 1) + " of " + steps.length;
      if (title) title.innerHTML = steps[index].getAttribute("data-step-title");
      progress.querySelectorAll(".form-progress-steps li").forEach(function (li, i) {
        li.classList.toggle("is-active", i === index);
        li.classList.toggle("is-done", i < index);
      });
    }
    if (scroll) {
      const header = document.querySelector(".site-header, header");
      const offset = (header ? header.offsetHeight : 76) + 16;
      window.scrollTo({ top: form.getBoundingClientRect().top + window.pageYOffset - offset, behavior: "smooth" });
    }
  }

  if (steps.length > 1) {
    form.classList.add("is-stepped");
    if (progress) progress.hidden = false;
    steps.forEach(function (step, i) {
      const last = i === steps.length - 1;
      const nav = document.createElement("div");
      nav.className = "form-step-nav wide";
      if (i > 0) {
        const back = document.createElement("button");
        back.type = "button";
        back.className = "form-back";
        back.textContent = "\u2190 Back to step " + i;
        back.addEventListener("click", function () { showStep(i - 1, true); });
        nav.appendChild(back);
      }
      if (!last) {
        const next = document.createElement("button");
        next.type = "button";
        next.className = "button primary";
        next.innerHTML = "Continue to step " + (i + 2) + ": " + steps[i + 1].getAttribute("data-step-title") + " &rarr;";
        next.addEventListener("click", function () {
          updateSpouseRequirements();
          if (!validateStep(i)) return;
          trackStep(i + 2);
          showStep(i + 1, true);
        });
        nav.appendChild(next);
        step.appendChild(nav);
      } else {
        step.insertBefore(nav, step.firstChild);
      }
    });
    // Enter in a text box on steps 1-2 moves on instead of submitting the whole form.
    form.addEventListener("keydown", function (event) {
      if (event.key !== "Enter" || event.target.tagName === "TEXTAREA" || currentStep === steps.length - 1) return;
      if (!event.target.closest(".form-step")) return;
      event.preventDefault();
      const next = steps[currentStep].querySelector(".form-step-nav .button.primary");
      if (next) next.click();
    });
    showStep(0, false);
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
    const firstInvalid = Array.from(form.elements).find(function (field) {
      return field.willValidate && !field.closest("[hidden]") && !field.checkValidity();
    });
    if (firstInvalid) {
      const step = firstInvalid.closest(".form-step");
      if (step && steps.length > 1) showStep(steps.indexOf(step), true);
      firstInvalid.reportValidity();
      return;
    }
    if (!consentRecorded.value) stampConsent();
    submitButton.disabled = true;
    submitButton.textContent = "Saving application…";
    setStatus("Saving your application before opening WhatsApp…");

    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: new FormData(form) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || "Submission failed");

      try {
        // Safe copy for follow-up emails: name and contact details only, never bank, EC or next-of-kin details.
        await fetch("https://hook.eu1.make.com/svzk1tbqk1uluw57neden62f1eomrruz", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          formType: "loan_application", fullName: fieldValue("full-name", " ").trim(), email: fieldValue("email", " ").trim(), phone: fieldValue("phone", " ").trim(),
          marketingConsent: !!(form.querySelector('[name="marketing-consent"]') || {}).checked, page: window.location.href
        }) });
      } catch (makeError) { console.error("Follow-up copy failed; application was saved:", makeError); }

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
