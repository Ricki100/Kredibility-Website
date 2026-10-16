(function () {
  "use strict";
  const form = document.querySelector("#contact-enquiry-form");
  if (!form) return;
  const button = form.querySelector("[data-contact-submit]");
  const status = form.querySelector("[data-contact-status]");

  form.addEventListener("submit", async function (event) {
    event.preventDefault();
    if (!form.reportValidity()) return;
    button.disabled = true;
    button.textContent = "Sending…";
    status.textContent = "Sending your enquiry securely…";
    try {
      const response = await fetch("https://api.web3forms.com/submit", { method: "POST", body: new FormData(form) });
      const result = await response.json();
      if (!result.success) throw new Error(result.message || "Submission failed");
      try {
        const data = new FormData(form);
        if (!data.get("botcheck")) await fetch("https://hook.eu1.make.com/svzk1tbqk1uluw57neden62f1eomrruz", { method: "POST", keepalive: true, headers: { "Content-Type": "application/json" }, body: JSON.stringify({
          formType: "contact_enquiry", fullName: data.get("name") || "", email: data.get("email") || "", phone: data.get("phone") || "",
          loanType: data.get("loan-type") || "", marketingConsent: data.get("marketing-consent") === "Yes", page: window.location.href
        }) });
      } catch (makeError) { console.error("Follow-up copy failed; enquiry was sent:", makeError); }
      window.location.href = "thank-you";
    } catch (error) {
      console.error("Enquiry submission error:", error);
      button.disabled = false;
      button.textContent = "Send Enquiry";
      status.textContent = "We could not send your enquiry. Please call or WhatsApp +263 781 325 844.";
    }
  });
})();
