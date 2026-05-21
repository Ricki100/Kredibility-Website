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
    ["Payroll Loans", "product-payroll-loans.html"],
    ["Private Sector Loans", "product-private-sector-loans.html"],
    ["SME Loans", "product-sme-loans.html"],
    ["Asset-Backed Loans", "product-asset-backed-loans.html"],
    ["Emergency & School Fees", "product-emergency-loans.html"],
  ];
  const company = [
    ["About", "about.html"],
    ["Leadership", "leadership.html"],
    ["Governance", "governance.html"],
    ["News", "news.html"],
  ];
  const support = [
    ["FAQ", "faq.html"],
    ["Apply", "apply.html"],
    ["Contact", "contact.html"],
    ["Privacy", "privacy-policy.html"],
    ["Terms", "terms.html"],
  ];
  const linkList = (items) => items.map(([label, href]) => `<a href="${pageUrl(href)}">${label}</a>`).join("");
  const whatsapp = "https://wa.me/263772000000?text=Hi%20Kredibility%2C%20I%27d%20like%20to%20enquire%20about%20a%20loan.";

  footer.innerHTML = `
    <div class="footer-shell">
      <div class="footer-main">
        <div class="footer-about">
          <a class="footer-brand-lockup" href="${pageUrl("index.html")}" aria-label="Kredibility Finance home">
            <span class="footer-brand-mark">K</span>
            <span>
              <strong>Kredibility Finance</strong>
              <small>Your Growth, Our Commitment.</small>
            </span>
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
            <a href="mailto:info@kredibility.co.zw">info@kredibility.co.zw</a>
            <a href="tel:+263242000000">+263 242 000 000</a>
            <a href="${whatsapp}">WhatsApp Us</a>
          </div>
        </nav>
      </div>

      <div class="footer-bottom">
        <p>&copy; 2026 Kredibility Finance (Private) Limited. All rights reserved.</p>
        <a href="${pageUrl("sitemap.html")}">Sitemap</a>
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

  functi