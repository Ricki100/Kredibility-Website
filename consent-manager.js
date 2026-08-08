(function () {
  "use strict";

  const STORAGE_KEY = "kredibility_privacy_preferences";
  const CONSENT_VERSION = "2026-08-08";
  let preferences = readPreferences();

  function readPreferences() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
      return saved && saved.version === CONSENT_VERSION ? saved : null;
    } catch (_error) {
      return null;
    }
  }

  function loadScript(src, attributes) {
    if (document.querySelector('script[data-consent-src="' + src + '"]')) return;
    const script = document.createElement("script");
    script.src = src;
    script.async = true;
    script.dataset.consentSrc = src;
    Object.entries(attributes || {}).forEach(([key, value]) => script.setAttribute(key, value));
    document.head.appendChild(script);
  }

  function enableAnalytics() {
    if (window.__kredibilityAnalyticsEnabled) return;
    window.__kredibilityAnalyticsEnabled = true;
    window.dataLayer = window.dataLayer || [];
    window.gtag = window.gtag || function () { window.dataLayer.push(arguments); };
    window.gtag("js", new Date());
    window.gtag("config", "G-ZTBTHF0NMW", { anonymize_ip: true });
    loadScript("https://www.googletagmanager.com/gtag/js?id=G-ZTBTHF0NMW");

    // Session recording is deliberately disabled on the loan-application page.
    if (!/\/apply(?:\.html)?\/?$/.test(window.location.pathname)) {
      (function (c, l, a, r, i, t, y) {
        c[a] = c[a] || function () { (c[a].q = c[a].q || []).push(arguments); };
        t = l.createElement(r);
        t.async = 1;
        t.src = "https://www.clarity.ms/tag/" + i;
        t.dataset.consentSrc = t.src;
        y = l.getElementsByTagName(r)[0];
        y.parentNode.insertBefore(t, y);
      })(window, document, "clarity", "script", "xxmk21zg6y");
    }
  }

  function enableAdvertising() {
    if (window.__kredibilityAdvertisingEnabled) return;
    window.__kredibilityAdvertisingEnabled = true;
    (function (f, b, e, v, n, t, s) {
      if (f.fbq) return;
      n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n;
      n.push = n;
      n.loaded = true;
      n.version = "2.0";
      n.queue = [];
      t = b.createElement(e);
      t.async = true;
      t.src = v;
      t.dataset.consentSrc = v;
      s = b.getElementsByTagName(e)[0];
      s.parentNode.insertBefore(t, s);
    })(window, document, "script", "https://connect.facebook.net/en_US/fbevents.js");
    window.fbq("init", "1009230548348507");
    window.fbq("track", "PageView");
  }

  function applyPreferences() {
    if (!preferences) return;
    if (preferences.analytics) enableAnalytics();
    if (preferences.advertising) enableAdvertising();
  }

  function savePreferences(analytics, advertising) {
    const previous = preferences;
    preferences = {
      version: CONSENT_VERSION,
      essential: true,
      analytics: Boolean(analytics),
      advertising: Boolean(advertising),
      savedAt: new Date().toISOString(),
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
    if (previous && ((previous.analytics && !preferences.analytics) || (previous.advertising && !preferences.advertising))) {
      window.location.reload();
      return;
    }
    applyPreferences();
    document.dispatchEvent(new CustomEvent("kredibility:consent", { detail: preferences }));
  }

  function renderManager() {
    const wrapper = document.createElement("div");
    wrapper.innerHTML = `
      <section class="privacy-banner" data-privacy-banner role="dialog" aria-modal="true" aria-labelledby="privacy-title" hidden>
        <div class="privacy-banner__copy">
          <h2 id="privacy-title">Your privacy choices</h2>
          <p>We use essential storage for your privacy choice. With your permission, we also use analytics to improve the site and advertising technology to measure campaigns. You can reject either without losing access.</p>
          <div class="privacy-preferences" data-privacy-preferences hidden>
            <label><input type="checkbox" checked disabled> Essential <span>Required to remember your choice.</span></label>
            <label><input type="checkbox" data-consent-analytics> Analytics <span>Google Analytics and Microsoft Clarity. Clarity is disabled on the application page.</span></label>
            <label><input type="checkbox" data-consent-advertising> Advertising <span>Meta Pixel for campaign measurement and remarketing.</span></label>
          </div>
          <p class="privacy-banner__links"><a href="cookie-policy">Cookie Policy</a> · <a href="privacy-policy">Privacy Policy</a></p>
        </div>
        <div class="privacy-banner__actions">
          <button type="button" class="button primary" data-consent-accept>Accept all</button>
          <button type="button" class="button ghost" data-consent-reject>Reject non-essential</button>
          <button type="button" class="privacy-text-button" data-consent-customise>Customise</button>
          <button type="button" class="button ghost" data-consent-save hidden>Save choices</button>
        </div>
      </section>
      <button type="button" class="privacy-settings-button" data-privacy-settings>Cookie settings</button>`;
    document.body.append(...wrapper.children);

    const banner = document.querySelector("[data-privacy-banner]");
    const panel = banner.querySelector("[data-privacy-preferences]");
    const analytics = banner.querySelector("[data-consent-analytics]");
    const advertising = banner.querySelector("[data-consent-advertising]");
    const save = banner.querySelector("[data-consent-save]");

    function close() { banner.hidden = true; }
    function open() {
      analytics.checked = Boolean(preferences && preferences.analytics);
      advertising.checked = Boolean(preferences && preferences.advertising);
      panel.hidden = true;
      save.hidden = true;
      banner.hidden = false;
      banner.querySelector("[data-consent-accept]").focus();
    }

    banner.querySelector("[data-consent-accept]").addEventListener("click", () => { savePreferences(true, true); close(); });
    banner.querySelector("[data-consent-reject]").addEventListener("click", () => { savePreferences(false, false); close(); });
    banner.querySelector("[data-consent-customise]").addEventListener("click", () => { panel.hidden = false; save.hidden = false; analytics.focus(); });
    save.addEventListener("click", () => { savePreferences(analytics.checked, advertising.checked); close(); });
    document.querySelector("[data-privacy-settings]").addEventListener("click", open);
    window.KredibilityConsent = { open, get: () => preferences };
    if (!preferences) open();
  }

  applyPreferences();
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", renderManager);
  else renderManager();
})();
