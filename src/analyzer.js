/**
 * Analyzes classified cookies for security issues and GDPR compliance.
 *
 * Returns a structured report with:
 *   - Summary statistics
 *   - Issues grouped by severity (critical, high, medium, low)
 *   - Compliance assessment
 *   - Cookie breakdown by category
 */
export function analyze(scanResult, classifiedCookies) {
  const cookies = classifiedCookies;
  const issues = [];

  // ── Category breakdown ───────────────────────────────────────────────
  const categories = { necessary: [], functional: [], analytics: [], marketing: [], unknown: [] };
  for (const c of cookies) {
    (categories[c.category] || categories.unknown).push(c);
  }

  const firstParty = cookies.filter((c) => c.isFirstParty);
  const thirdParty = cookies.filter((c) => !c.isFirstParty);

  // ── Issue detection ──────────────────────────────────────────────────

  // 1. CRITICAL: Marketing/analytics cookies set without consent
  const preConsentMarketing = cookies.filter(
    (c) => c.category === "marketing" || c.category === "analytics"
  );
  if (preConsentMarketing.length > 0 && scanResult.consentMechanism) {
    issues.push({
      severity: "critical",
      title: "Non-essential cookies set before user consent",
      detail: `${preConsentMarketing.length} ${pluralize(preConsentMarketing.length, "cookie")} (analytics/marketing) detected on initial page load, before any consent interaction. Under GDPR/ePrivacy, non-essential cookies must not be set until the user gives explicit consent.`,
      cookies: preConsentMarketing.map((c) => c.name),
      remediation: "Configure your tag manager (GTM, etc.) to fire analytics and marketing tags only after the user accepts the corresponding cookie category. Verify your CMP is blocking these tags by default.",
    });
  }

  if (preConsentMarketing.length > 0 && !scanResult.consentMechanism) {
    issues.push({
      severity: "critical",
      title: "No consent mechanism detected",
      detail: `The site sets ${preConsentMarketing.length} analytics/marketing ${pluralize(preConsentMarketing.length, "cookie")} but no cookie consent banner (CMP) was detected. This is likely a GDPR/ePrivacy violation for EU visitors.`,
      cookies: preConsentMarketing.map((c) => c.name),
      remediation: "Implement a consent management platform (Cookiebot, OneTrust, CookieYes, or similar). Configure it to block non-essential cookies until consent is granted.",
    });
  }

  // 2. HIGH: Cookies missing Secure flag
  const insecureCookies = cookies.filter((c) => !c.secure && c.category !== "necessary");
  if (insecureCookies.length > 0) {
    issues.push({
      severity: "high",
      title: "Cookies missing Secure flag",
      detail: `${insecureCookies.length} ${pluralize(insecureCookies.length, "cookie")} can be transmitted over unencrypted HTTP connections.`,
      cookies: insecureCookies.map((c) => c.name),
      remediation: "Set the Secure flag on all cookies. This ensures cookies are only sent over HTTPS.",
    });
  }

  // 3. HIGH: Session/auth cookies missing HttpOnly
  const sessionNoHttpOnly = cookies.filter(
    (c) => !c.httpOnly && c.category === "necessary" &&
    (c.name.toLowerCase().includes("session") || c.name.toLowerCase().includes("token") || c.name.toLowerCase().includes("sid"))
  );
  if (sessionNoHttpOnly.length > 0) {
    issues.push({
      severity: "high",
      title: "Session cookies missing HttpOnly flag",
      detail: `${sessionNoHttpOnly.length} session/auth ${pluralize(sessionNoHttpOnly.length, "cookie")} accessible via JavaScript (document.cookie). This increases XSS attack surface.`,
      cookies: sessionNoHttpOnly.map((c) => c.name),
      remediation: "Set the HttpOnly flag on session and authentication cookies to prevent client-side JavaScript access.",
    });
  }

  // 4. HIGH: SameSite=None without Secure
  const sameSiteNoneInsecure = cookies.filter(
    (c) => c.sameSite === "None" && !c.secure
  );
  if (sameSiteNoneInsecure.length > 0) {
    issues.push({
      severity: "high",
      title: "SameSite=None cookies without Secure flag",
      detail: `${sameSiteNoneInsecure.length} ${pluralize(sameSiteNoneInsecure.length, "cookie")} with SameSite=None but no Secure flag. Modern browsers will reject these cookies.`,
      cookies: sameSiteNoneInsecure.map((c) => c.name),
      remediation: "Cookies with SameSite=None must also have the Secure flag. Either add the Secure flag or change the SameSite policy.",
    });
  }

  // 5. MEDIUM: Excessive cookie lifetime
  const longLived = cookies.filter((c) => c.lifetimeDays > 395);
  if (longLived.length > 0) {
    issues.push({
      severity: "medium",
      title: "Cookies with excessive lifetime",
      detail: `${longLived.length} ${pluralize(longLived.length, "cookie")} ${pluralize(longLived.length, "has", "have")} a lifetime exceeding 13 months (395 days). CNIL and other EU DPAs recommend a maximum cookie lifetime of 13 months.`,
      cookies: longLived.map((c) => `${c.name} (${c.lifetimeDays} days)`),
      remediation: "Reduce cookie lifetimes to 13 months (395 days) or less. For analytics cookies like _ga, configure the expiration in your Google Analytics settings.",
    });
  }

  // 6. MEDIUM: Third-party cookies (Chrome deprecation risk)
  if (thirdParty.length > 0) {
    issues.push({
      severity: "medium",
      title: "Third-party cookies detected",
      detail: `${thirdParty.length} third-party ${pluralize(thirdParty.length, "cookie")} from ${new Set(thirdParty.map((c) => c.domain.replace(/^\./, ""))).size} ${pluralize(new Set(thirdParty.map((c) => c.domain.replace(/^\./, ""))).size, "domain")}. Third-party cookies face increasing restrictions across browsers.`,
      cookies: thirdParty.map((c) => `${c.name} (${c.domain})`),
      remediation: "Migrate to first-party tracking where possible (server-side tagging, first-party data strategies). Review which third-party cookies are essential for your business.",
    });
  }

  // 7. MEDIUM: Missing SameSite attribute
  const noSameSite = cookies.filter(
    (c) => !c.sameSite || c.sameSite === "None"
  );
  // Only flag first-party cookies that should have SameSite set
  const firstPartyNoSameSite = noSameSite.filter((c) => c.isFirstParty);
  if (firstPartyNoSameSite.length > 0) {
    issues.push({
      severity: "medium",
      title: "First-party cookies without SameSite restriction",
      detail: `${firstPartyNoSameSite.length} first-party ${pluralize(firstPartyNoSameSite.length, "cookie")} with SameSite=None or unset. This exposes them to cross-site request forgery (CSRF) attacks.`,
      cookies: firstPartyNoSameSite.map((c) => c.name),
      remediation: "Set SameSite=Lax or SameSite=Strict on first-party cookies unless cross-site sending is required.",
    });
  }

  // 8. LOW: Unknown cookies
  if (categories.unknown.length > 0) {
    issues.push({
      severity: "low",
      title: "Unclassified cookies",
      detail: `${categories.unknown.length} ${pluralize(categories.unknown.length, "cookie")} could not be automatically categorized. These need manual review and documentation for your cookie policy.`,
      cookies: categories.unknown.map((c) => `${c.name} (${c.domain})`),
      remediation: "Identify the purpose of each unknown cookie and add it to your cookie policy with the correct category.",
    });
  }

  // 9. LOW: Overly broad domain scope
  const broadDomain = cookies.filter(
    (c) => c.isFirstParty && c.domain.startsWith(".") && c.domain.split(".").length > 2
  );
  // This is informational — flag only if there are subdomains that shouldn't share cookies
  if (broadDomain.length > 3) {
    issues.push({
      severity: "low",
      title: "Cookies scoped to parent domain",
      detail: `${broadDomain.length} ${pluralize(broadDomain.length, "cookie")} scoped to the parent domain (${broadDomain[0].domain}), making them available to all subdomains. This increases exposure if any subdomain is compromised.`,
      cookies: broadDomain.map((c) => c.name),
      remediation: "Scope cookies to the specific subdomain where they are needed, unless cross-subdomain sharing is required.",
    });
  }

  // ── Compliance score ─────────────────────────────────────────────────
  const criticalCount = issues.filter((i) => i.severity === "critical").length;
  const highCount = issues.filter((i) => i.severity === "high").length;
  const mediumCount = issues.filter((i) => i.severity === "medium").length;
  const lowCount = issues.filter((i) => i.severity === "low").length;

  let complianceScore;
  if (criticalCount > 0) complianceScore = "F";
  else if (highCount >= 3) complianceScore = "D";
  else if (highCount >= 1) complianceScore = "C";
  else if (mediumCount >= 3) complianceScore = "B";
  else if (mediumCount >= 1 || lowCount >= 1) complianceScore = "B+";
  else complianceScore = "A";

  return {
    summary: {
      url: scanResult.url,
      finalUrl: scanResult.finalUrl,
      pageTitle: scanResult.pageTitle,
      scannedAt: scanResult.scannedAt,
      totalCookies: cookies.length,
      firstParty: firstParty.length,
      thirdParty: thirdParty.length,
      categories: {
        necessary: categories.necessary.length,
        functional: categories.functional.length,
        analytics: categories.analytics.length,
        marketing: categories.marketing.length,
        unknown: categories.unknown.length,
      },
      consentMechanism: scanResult.consentMechanism,
      complianceScore,
      issueCount: { critical: criticalCount, high: highCount, medium: mediumCount, low: lowCount },
    },
    issues: issues.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity)),
    cookies: cookies.sort((a, b) => {
      const catOrder = categoryOrder(a.category) - categoryOrder(b.category);
      return catOrder !== 0 ? catOrder : a.name.localeCompare(b.name);
    }),
    thirdPartyDomains: scanResult.thirdPartyRequests,
  };
}

function severityOrder(s) {
  return { critical: 0, high: 1, medium: 2, low: 3 }[s] ?? 4;
}

function categoryOrder(c) {
  return { necessary: 0, functional: 1, analytics: 2, marketing: 3, unknown: 4 }[c] ?? 5;
}

function pluralize(n, singular, plural) {
  if (plural) return n === 1 ? singular : plural;
  return n === 1 ? singular : singular + "s";
}
