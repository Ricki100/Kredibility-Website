const header = document.querySelector("[data-header]");
const menu = document.querySelector("[data-menu]");
const menuButton = document.querySelector("[data-menu-button]");
const revealTargets = document.querySelectorAll(".reveal, .split-reveal");
const counters = document.querySelectorAll("[data-count]");

function siteRootUrl() {
  const script = document.currentScript || document.querySelector('script[src$="script.js"]');
  return new URL(".", script ? script.src : window.location.href);
}

function pageUrl(path) {
  return new URL(path, siteRootUrl()).href;
}

function renderFooter() {
  const footer = document.querySelector(".site-footer");
  if (!footer) return;
  footer.id = footer.id || "site-footer";

  const products = [
    ["Payroll Loans", "product-payroll-loans"],
    ["Private Sector Loans", "product-private-sector-loans"],
    ["SME Loans", "product-sme-loans"],
    ["Asset-Backed Loans", "product-asset-backed-loans"],
    ["Emergency & School Fees", "product-emergency-loans"],
    ["ZiG Loans", "zig-loans"],
    ["SSB Smartphone Loans", "smartphones"],
  ];
  const company = [
    ["About", "about"],
    ["Leadership", "leadership"],
    ["Governance", "governance"],
    ["News", "news"],
  ];
  const support = [
    ["FAQ", "faq"],
    ["Apply", "apply"],
    ["Contact", "contact"],
    ["Privacy", "privacy-policy"],
    ["Cookies", "cookie-policy"],
    ["Terms", "terms"],
  ];
  const linkList = (items) => items.map(([label, href]) => `<a href="${pageUrl(href)}">${label}</a>`).join("");
  const whatsapp = "https://wa.me/263781325844?text=Hi%20Kredibility%2C%20I%27d%20like%20to%20enquire%20about%20a%20loan.";

  footer.innerHTML = `
    <div class="footer-shell">
      <div class="footer-main">
        <div class="footer-about">
          <a class="footer-brand-lockup" href="${pageUrl("/")}" aria-label="Kredibility Finance home">
            <img src="${pageUrl("assets/kredibility-logo-white.png")}" alt="Kredibility Finance" class="footer-brand-logo">
          </a>
          <p>Structured, transparent micro-credit for Zimbabwe's workforce, SMEs and economically active population.</p>
          <div class="footer-badges" aria-label="Compliance credentials">
            <span>RBZ Licensed</span>
            <span>ZIMRA Registered</span>
            <span>Microfinance Act Compliant</span>
          </div>
        </div>

        <nav class="footer-nav" aria-label="Footer navigation">
          <div>
            <h2>Products</h2>
            ${linkList(products)}
          </div>
          <div>
            <h2>Company</h2>
            ${linkList(company)}
          </div>
          <div>
            <h2>Support</h2>
            ${linkList(support)}
          </div>
          <div class="footer-contact">
            <h2>Visit Us</h2>
            <address>Club Chambers, 11th Floor<br>Corner Third &amp; Nelson Mandela Ave<br>Harare, Zimbabwe</address>
            <a href="mailto:admin@kredibilityfinance.co.zw">admin@kredibilityfinance.co.zw</a>
            <a href="tel:+263781325844">+263 781 325 844</a>
            <a href="tel:+263781332046">+263 781 332 046</a>
            <a href="tel:+263781219030">+263 781 219 030</a>
            <a href="tel:+263781246814">+263 781 246 814</a>
            <a href="${whatsapp}">WhatsApp Us</a>
          </div>
        </nav>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 Kredibility Finance (Private) Limited. All rights reserved.</p>
        <a href="${pageUrl("sitemap.xml")}">Sitemap</a>
      </div>
    </div>
  `;

  if (window.location.hash === "#site-footer") {
    requestAnimationFrame(() => footer.scrollIntoView({ block: "start" }));
    window.setTimeout(() => footer.scrollIntoView({ block: "start" }), 120);
  }
}

function splitLines() {
  document.querySelectorAll(".split-reveal").forEach((element) => {
    if (element.dataset.splitDone) return;
    const words = element.dataset.lines
      ? (window.innerWidth < 560 ? element.textContent.trim().split(/\s+/) : element.dataset.lines.split("|"))
      : element.textContent.trim().split(/\s+/);
    element.textContent = "";

    words.forEach((word, index) => {
      const wrap = document.createElement("span");
      const line = document.createElement("span");
      wrap.className = "line-wrap";
      line.className = "line";
      line.textContent = element.dataset.lines ? word : `${word}${index === words.length - 1 ? "" : " "}`;
      line.style.transitionDelay = `${Math.min(index * 55, 420)}ms`;
      wrap.appendChild(line);
      element.appendChild(wrap);
    });

    element.dataset.splitDone = "true";
  });
}

function animateCounter(counter) {
  if (counter.dataset.done) return;
  counter.dataset.done = "true";
  const target = Number(counter.dataset.count);
  const duration = 1100;
  const start = performance.now();

  function step(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    // Ease-out cubic
    const eased = 1 - Math.pow(1 - progress, 3);
    counter.textContent = Math.round(eased * target);
    if (progress < 1) {
      requestAnimationFrame(step);
    } else {
      counter.textContent = target;
    }
  }

  requestAnimationFrame(step);
}

// ── Intersection Observer: reveals ──────────────────────────────────────────
const revealObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.12 }
);

// ── Intersection Observer: counters ─────────────────────────────────────────
const counterObserver = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        counterObserver.unobserve(entry.target);
      }
    });
  },
  { threshold: 0.5 }
);

// ── Header scroll behaviour ──────────────────────────────────────────────────
function onScroll() {
  if (!header) return;
  if (window.scrollY > 40) {
    header.classList.add("is-scrolled");
  } else {
    header.classList.remove("is-scrolled");
  }
}

// ── GA4 click tracking: WhatsApp + phone links ───────────────────────────────
// Delegated on document so it also covers the footer, which is rendered
// dynamically by renderFooter() after this listener is attached.
function initTrackedLinkClicks() {
  document.addEventListener("click", function (e) {
    const link = e.target.closest('a[href^="https://wa.me/"], a[href^="tel:"]');
    if (!link || typeof gtag !== "function") return;
    const isWhatsApp = link.href.indexOf("wa.me") !== -1;
    gtag("event", isWhatsApp ? "whatsapp_click" : "phone_click", {
      link_url: link.href,
      page_location: window.location.href,
    });
  });
}

// ── Mobile menu ──────────────────────────────────────────────────────────────
function toggleMenu(force) {
  if (!menuButton || !menu) return;
  const isOpen = force !== undefined ? force : menuButton.getAttribute("aria-expanded") === "false";
  menuButton.setAttribute("aria-expanded", String(isOpen));
  menu.classList.toggle("is-open", isOpen);
  document.body.classList.toggle("menu-open", isOpen);
}

function initCalculators() {
  const money = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

  document.querySelectorAll(".calculator").forEach((calculator) => {
    const amountInput = calculator.querySelector("[data-amount]");
    const termInput = calculator.querySelector("[data-term]");
    const rateInput = calculator.querySelector("[data-rate]");
    const paymentOut = calculator.querySelector("[data-payment]");
    const amountOut = calculator.querySelector("[data-amount-out]");
    const termOut = calculator.querySelector("[data-term-out]");
    const interestOut = calculator.querySelector("[data-interest-out]");
    const totalOut = calculator.querySelector("[data-total-out]");

    if (!amountInput || !termInput || !rateInput || !paymentOut) return;

    const update = () => {
      const amount = Number(amountInput.value);
      const term = Number(termInput.value);
      const monthlyRate = Number(rateInput.value) / 100;
      const totalInterest = amount * monthlyRate * term;
      const totalRepayment = amount + totalInterest;
      const monthlyPayment = term > 0 ? totalRepayment / term : 0;

      paymentOut.textContent = money.format(monthlyPayment);
      if (amountOut) amountOut.textContent = money.format(amount);
      if (termOut) termOut.textContent = `${term} month${term === 1 ? "" : "s"} at ${rateInput.value}%`;
      if (interestOut) interestOut.textContent = money.format(totalInterest);
      if (totalOut) totalOut.textContent = money.format(totalRepayment);
    };

    [amountInput, termInput, rateInput].forEach((input) => {
      input.addEventListener("input", update);
      input.addEventListener("change", update);
    });

    update();
  });
}

// ── Init ─────────────────────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  renderFooter();
  splitLines();
  initCalculators();
  initTrackedLinkClicks();

  // Observe reveal elements
  document.querySelectorAll(".reveal, .split-reveal").forEach((el) => {
    revealObserver.observe(el);
  });

  // Observe counters
  document.querySelectorAll("[data-count]").forEach((el) => {
    counterObserver.observe(el);
  });

  // Menu toggle
  if (menuButton) {
    menuButton.addEventListener("click", () => toggleMenu());
  }

  // Close menu on nav link click (mobile)
  if (menu) {
    menu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => toggleMenu(false));
    });
  }

  // Close menu on outside click
  document.addEventListener("click", (e) => {
    if (
      document.body.classList.contains("menu-open") &&
      !menu.contains(e.target) &&
      !menuButton.contains(e.target)
    ) {
      toggleMenu(false);
    }
  });

  // Scroll handler
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();
});
