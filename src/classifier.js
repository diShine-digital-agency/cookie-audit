import { EXACT, PREFIXES, DOMAINS } from "./known-cookies.js";

/**
 * Classifies a list of cookies using the known-cookies database.
 *
 * Returns the same array with added fields:
 *   category    — "necessary" | "functional" | "analytics" | "marketing" | "unknown"
 *   provider    — e.g. "Google Analytics", "Meta (Facebook)", or null
 *   description — human-readable purpose, or null
 *   match       — "exact" | "prefix" | "domain" | "heuristic" | null
 */
export function classify(cookies) {
  return cookies.map((cookie) => {
    // 1. Exact name match
    if (EXACT[cookie.name]) {
      const m = EXACT[cookie.name];
      return { ...cookie, category: m.category, provider: m.provider, description: m.description, match: "exact" };
    }

    // 2. Prefix match
    for (const p of PREFIXES) {
      if (cookie.name.startsWith(p.prefix)) {
        return { ...cookie, category: p.category, provider: p.provider, description: p.description, match: "prefix" };
      }
    }

    // 3. Domain match (for third-party cookies)
    if (!cookie.isFirstParty) {
      const cleanDomain = cookie.domain.replace(/^\./, "");
      const domainMatch = findDomainMatch(cleanDomain);
      if (domainMatch) {
        return {
          ...cookie,
          category: domainMatch.category,
          provider: domainMatch.provider,
          description: `Third-party cookie from ${domainMatch.provider}`,
          match: "domain",
        };
      }
    }

    // 4. Heuristic classification
    const heuristic = heuristicClassify(cookie);
    if (heuristic) {
      return { ...cookie, ...heuristic, match: "heuristic" };
    }

    // 5. Unknown
    return { ...cookie, category: "unknown", provider: null, description: null, match: null };
  });
}

// ── Helpers ────────────────────────────────────────────────────────────

function findDomainMatch(domain) {
  // Direct match
  if (DOMAINS[domain]) return DOMAINS[domain];

  // Try parent domain (e.g., "pixel.facebook.com" → "facebook.com")
  const parts = domain.split(".");
  if (parts.length > 2) {
    const parent = parts.slice(-2).join(".");
    if (DOMAINS[parent]) return DOMAINS[parent];
  }

  return null;
}

function heuristicClassify(cookie) {
  const name = cookie.name.toLowerCase();
  const domain = (cookie.domain || "").toLowerCase();

  // Session / auth cookies (likely necessary)
  if (
    name.includes("session") ||
    name.includes("csrf") ||
    name.includes("xsrf") ||
    name.includes("token") ||
    name === "sid" ||
    name === "ssid"
  ) {
    return { category: "necessary", provider: null, description: "Likely session/security cookie (heuristic)" };
  }

  // Consent cookies (necessary)
  if (name.includes("consent") || name.includes("gdpr") || name.includes("cookie_policy") || name.includes("cookielaw")) {
    return { category: "necessary", provider: null, description: "Consent/privacy preference (heuristic)" };
  }

  // Language / locale (functional)
  if (name.includes("lang") || name.includes("locale") || name.includes("i18n")) {
    return { category: "functional", provider: null, description: "Language/locale preference (heuristic)" };
  }

  // Tracking / analytics patterns
  if (name.includes("_track") || name.includes("visitor") || name.includes("_vis_") || name.includes("_stat")) {
    return { category: "analytics", provider: null, description: "Tracking/analytics cookie (heuristic)" };
  }

  // Ad / campaign / retargeting patterns
  if (
    name.includes("_ad") ||
    name.includes("_campaign") ||
    name.includes("_retarget") ||
    name.includes("_pixel") ||
    name.includes("uid") ||
    name.includes("_cid")
  ) {
    return { category: "marketing", provider: null, description: "Advertising/targeting cookie (heuristic)" };
  }

  // Third-party cookies that didn't match domain DB are likely marketing
  if (!cookie.isFirstParty && cookie.lifetimeDays > 30) {
    return { category: "marketing", provider: null, description: "Long-lived third-party cookie (heuristic)" };
  }

  return null;
}
