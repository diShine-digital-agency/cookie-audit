import puppeteer from "puppeteer";

/**
 * Scans a URL and captures all cookies set by the page.
 *
 * Two-phase scan:
 *   Phase 1: Load the page, capture cookies set WITHOUT consent interaction
 *   Phase 2: (optional) Attempt to find and click the consent banner, capture cookies AFTER consent
 *
 * Also captures:
 *   - Third-party requests (for domain-level classification)
 *   - Consent mechanism detection (CMP banner presence)
 */
export async function scan(url, options = {}) {
  const {
    waitMs = 5000,
    headless = true,
    clickConsent = false,
    timeout = 30000,
    userAgent = null,
  } = options;

  const browser = await puppeteer.launch({
    headless: headless ? true : false,
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-blink-features=AutomationControlled",
    ],
  });

  const result = {
    url,
    scannedAt: new Date().toISOString(),
    finalUrl: null,
    pageTitle: null,
    cookiesBeforeConsent: [],
    cookiesAfterConsent: [],
    thirdPartyRequests: [],
    consentMechanism: null,
    errors: [],
  };

  try {
    const page = await browser.newPage();

    if (userAgent) {
      await page.setUserAgent(userAgent);
    }

    // Track third-party requests
    const targetHost = new URL(url).hostname.replace(/^www\./, "");
    const thirdPartyDomains = new Set();

    page.on("request", (req) => {
      try {
        const reqHost = new URL(req.url()).hostname.replace(/^www\./, "");
        // Exact host or a true subdomain only — avoids matching look-alike
        // domains like "notexample.com" via a bare endsWith check.
        if (reqHost !== targetHost && !reqHost.endsWith("." + targetHost)) {
          thirdPartyDomains.add(reqHost);
        }
      } catch { /* ignore invalid URLs */ }
    });

    // Navigate
    await page.goto(url, { waitUntil: "networkidle2", timeout });
    result.finalUrl = page.url();
    result.pageTitle = await page.title();

    // Wait for dynamic cookies (JS-set, delayed scripts)
    await delay(waitMs);

    // Phase 1: Cookies before consent
    const client = await page.createCDPSession();
    const { cookies: rawCookies } = await client.send("Network.getAllCookies");
    result.cookiesBeforeConsent = normalizeCookies(
      rawCookies.filter((c) => cookieAppliesToHost(c, targetHost)),
      targetHost,
    );

    // Detect consent mechanism
    result.consentMechanism = await detectConsentMechanism(page);

    // Phase 2: Click consent and re-scan
    if (clickConsent && result.consentMechanism) {
      const clicked = await attemptConsentClick(page, result.consentMechanism);
      if (clicked) {
        await delay(3000); // wait for consent-gated tags to fire
        const { cookies: postConsentCookies } = await client.send("Network.getAllCookies");
        result.cookiesAfterConsent = normalizeCookies(
          postConsentCookies.filter((c) => cookieAppliesToHost(c, targetHost)),
          targetHost,
        );
      }
    }

    result.thirdPartyRequests = [...thirdPartyDomains].sort();

  } catch (err) {
    result.errors.push(toErrorMessage(err));
  } finally {
    await browser.close().catch(() => {});
  }

  return result;
}

/**
 * Scan multiple URLs and merge results.
 */
export async function scanMultiple(urls, options = {}) {
  const results = [];
  for (const url of urls) {
    try {
      const result = await scan(url, options);
      results.push(result);
    } catch (err) {
      results.push({ url, error: toErrorMessage(err) });
    }
  }
  return results;
}

// ── Helpers ────────────────────────────────────────────────────────────

/**
 * Extract a readable message from any thrown value (Error, string, object).
 */
export function toErrorMessage(err) {
  if (err == null) return "Unknown error";
  if (typeof err === "string") return err;
  if (typeof err.message === "string" && err.message) return err.message;
  return String(err);
}

/**
 * Network.getAllCookies returns the browser-wide cookie store, which can
 * contain cookies for unrelated domains. Keep only cookies whose domain
 * covers the scanned host (the cookie's domain is the host itself, a parent
 * domain with a leading dot, or a parent suffix).
 */
export function cookieAppliesToHost(cookie, targetHost) {
  const domain = (cookie.domain || "").replace(/^\./, "").toLowerCase();
  if (!domain) return true; // no domain info — keep it rather than drop data
  const host = targetHost.toLowerCase();
  return host === domain || host.endsWith("." + domain);
}

function normalizeCookies(rawCookies, targetHost) {
  return rawCookies.map((c) => {
    const domain = (c.domain || "").replace(/^\./, "");
    const isFirstParty = domain === targetHost || domain.endsWith("." + targetHost);
    const expiresDate = c.expires > 0 ? new Date(c.expires * 1000) : null;
    const lifetimeDays = expiresDate
      ? Math.round((expiresDate - new Date()) / (1000 * 60 * 60 * 24))
      : 0; // session cookie

    return {
      name: c.name,
      value: c.value,
      domain: c.domain,
      path: c.path,
      isFirstParty,
      isSession: !expiresDate || c.expires === -1,
      expires: expiresDate ? expiresDate.toISOString() : null,
      lifetimeDays: Math.max(0, lifetimeDays),
      secure: c.secure,
      httpOnly: c.httpOnly,
      // CDP omits sameSite when the attribute is unset — don't confuse that
      // with an explicit SameSite=None
      sameSite: c.sameSite || null,
      size: c.size,
      priority: c.priority || "Medium",
    };
  });
}

async function detectConsentMechanism(page) {
  // Check for known CMP frameworks
  const cmp = await page.evaluate(() => {
    const checks = {
      cookiebot: !!window.Cookiebot || !!document.getElementById("CybotCookiebotDialog"),
      onetrust: !!window.OneTrust || !!document.getElementById("onetrust-banner-sdk"),
      cookieyes: !!window.ckyBannerPopup || !!document.querySelector(".cky-consent-container"),
      complianz: !!document.querySelector(".cmplz-cookiebanner"),
      quantcast: !!window.__cmp || !!document.querySelector(".qc-cmp2-container"),
      iab_tcf: !!window.__tcfapi,
      didomi: !!window.Didomi || !!document.getElementById("didomi-host"),
      axeptio: !!window.axeptio || !!document.querySelector("[data-axeptio]"),
      termly: !!document.querySelector("#termly-code-snippet-support"),
      custom: false,
    };

    // Check for generic consent banners if no known CMP found
    if (!Object.values(checks).some(Boolean)) {
      const selectors = [
        '[class*="cookie" i][class*="banner" i]',
        '[class*="cookie" i][class*="consent" i]',
        '[class*="cookie" i][class*="notice" i]',
        '[class*="cookie" i][class*="popup" i]',
        '[class*="gdpr" i]',
        '[id*="cookie" i][id*="banner" i]',
        '[id*="cookie" i][id*="consent" i]',
        '[id*="cookie" i][id*="notice" i]',
        '[aria-label*="cookie" i]',
      ];
      for (const sel of selectors) {
        if (document.querySelector(sel)) {
          checks.custom = true;
          break;
        }
      }
    }

    return checks;
  });

  const detected = Object.entries(cmp).filter(([, v]) => v).map(([k]) => k);
  return detected.length > 0 ? detected : null;
}

async function attemptConsentClick(page, mechanisms) {
  // Common "Accept All" button selectors by CMP
  const acceptSelectors = [
    // Cookiebot
    "#CybotCookiebotDialogBodyLevelButtonLevelOptinAllowAll",
    "#CybotCookiebotDialogBodyButtonAccept",
    // OneTrust
    "#onetrust-accept-btn-handler",
    ".onetrust-close-btn-handler",
    // CookieYes
    ".cky-btn-accept",
    // Complianz
    ".cmplz-accept",
    ".cmplz-btn.cmplz-accept",
    // Didomi
    "#didomi-notice-agree-button",
    // Quantcast
    ".qc-cmp2-summary-buttons button[mode='primary']",
    // Axeptio
    "[data-axeptio-action='acceptAll']",
    // Generic patterns
    'button[class*="accept" i]',
    'button[class*="agree" i]',
    'button[id*="accept" i]',
    'a[class*="accept" i]',
    '[data-action="accept"]',
    '[data-action="accept-all"]',
  ];

  // Text-matching selectors per CMP — kept separate because page.$() only
  // understands CSS; these are matched by textContent in page.evaluate below.
  const acceptTextsByCmp = {
    cookiebot: ["allow all", "allow selection", "accept all", "accept"],
    onetrust: ["accept all cookies", "accept all", "allow all", "accept"],
    cookieyes: ["accept all", "accept"],
    complianz: ["accept all", "accept"],
    quantcast: ["i accept", "accept all", "agree"],
    didomi: ["agree and close", "accept all", "accept"],
    axeptio: ["accept all", "accept"],
    termly: ["accept all", "accept"],
  };

  const cmpTexts = (Array.isArray(mechanisms) ? mechanisms : [])
    .flatMap((m) => acceptTextsByCmp[m] || []);

  for (const selector of acceptSelectors) {
    try {
      // Try CSS selector first
      const el = await page.$(selector);
      if (el) {
        const isVisible = await el.evaluate(
          (e) => e.offsetParent !== null && getComputedStyle(e).visibility !== "hidden"
        );
        if (isVisible) {
          await el.click();
          return true;
        }
      }
    } catch { /* continue to next selector */ }
  }

  // Fallback: look for buttons by text content — CMP-specific labels first,
  // then generic multi-language accept labels
  try {
    const clicked = await page.evaluate((preferredTexts) => {
      const genericTexts = [
        "accept all cookies", "accept all", "accept cookies", "allow all cookies",
        "allow all", "allow cookies", "accept",
        "i agree", "agree", "got it", "consent",
        "accetta tutti", "accetta", "accetto",
        "tout accepter", "accepter tout", "accepter",
        "alle akzeptieren", "akzeptieren", "einverstanden",
        "aceptar todo", "aceptar todas", "aceptar",
      ];
      const ordered = [...new Set([...(preferredTexts || []), ...genericTexts])];
      const buttons = [...document.querySelectorAll("button, a[role='button'], [role='button']")];
      const isVisible = (el) => {
        const style = getComputedStyle(el);
        return style.display !== "none" && style.visibility !== "hidden" && el.offsetParent !== null;
      };
      // Exact matches in priority order, then substring matches
      for (const t of ordered) {
        const btn = buttons.find((b) => b.textContent.trim().toLowerCase() === t);
        if (btn && isVisible(btn)) { btn.click(); return true; }
      }
      for (const t of ordered) {
        const btn = buttons.find((b) => b.textContent.trim().toLowerCase().includes(t));
        if (btn && isVisible(btn)) { btn.click(); return true; }
      }
      return false;
    }, cmpTexts);
    return clicked;
  } catch {
    return false;
  }
}

function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
