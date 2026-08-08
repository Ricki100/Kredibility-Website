(function () {
  "use strict";
  const fields = document.querySelectorAll("[data-no-sensitive]");
  if (!fields.length) return;

  const nationalIdPattern = /\b\d{2}-?\d{6,7}\s*[a-zA-Z]\s*\d{2}\b/;
  const longNumberPattern = /(?:\d[\s-]*){8,}/;
  const warning = "Please remove identity, bank, card, account or document numbers. A credit officer will request them through an approved process if needed.";

  fields.forEach(function (field) {
    function validate() {
      const containsSensitiveNumber = nationalIdPattern.test(field.value) || longNumberPattern.test(field.value);
      field.setCustomValidity(containsSensitiveNumber ? warning : "");
      if (containsSensitiveNumber) field.setAttribute("aria-invalid", "true");
      else field.removeAttribute("aria-invalid");
    }
    field.addEventListener("input", validate);
    field.addEventListener("blur", validate);
  });
})();
