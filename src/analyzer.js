/**
 * Analyzes classified cookies for security issues and GDPR compliance.
 *
 * Returns a structured report with:
 *   - Summary statistics
 *   - Issues grouped by severity (critical, high, medium, low)
 *   - Compliance assessment
 *   - Cookie breakdown by category
 *   - Post-consent diff (when the scan ran with consent interaction)
 */

const SEVERITIES = ["critical", "high", "medium", "low"];
const GRADES = ["A", "B+", "B", "C", "D", "F"];

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

  // ── Post-consent diff (only when a consent click was performed) ──────
  let afterConsent = null;
  if (scanResult.cookiesAfterConsent && scanResult.cookiesAfterConsent.length > 0) {
    const key = (c) => `${c.name}|${c.domain}|${c.path}`;
    const beforeKeys = new Set(scanResult.cookiesBeforeConsent.map(key));
    const afterKeys = new Set(scanResult.cookiesAfterConsent.map(key));
    const added = scanResult.cookiesAfterConsent.filter((c) => !beforeKeys.has(key(c)));
    const removed = scanResult.cookiesBeforeConsent.filter((c) => !afterKeys.has(key(c)));
    afterConsent = {
      total: scanResult.cookiesAfterConsent.length,
      added: added.map(cookieRef),
      removed: removed.map(cookieRef),
      addedCount: added.length,
      removedCount: removed.length,
    };
  }

  // ── Scan errors ──────────────────────────────────────────────────────
  // A scan that failed (navigation error, timeout, ...) must never be
  // reported as a clean "A" result.
  const scanFailed = scanResult.errors && scanResult.errors.length > 0 && !scanResult.finalUrl;
  const scanDegraded = scanResult.errors && scanResult.errors.length > 0 && !scanFailed;
  if (scanFailed) {
    issues.push({
      severity: "critical",
      title: "Scan failed",
      detail: `The page could not be loaded: ${scanResult.errors.join("; ")}. No cookies were captured, so no compliance assessment could be made.`,
      cookies: [],
      remediation: "Verify the URL is correct and reachable. For slow sites, increase --wait and --timeout. Some sites block headless browsers — try --user-agent or --no-headless.",
    });
  } else if (scanDegraded) {
    issues.push({
      severity: "low",
      title: "Partial scan results",
      detail: `The scan completed but reported errors: ${scanResult.errors.join("; ")}. Results may be incomplete.`,
      cookies: [],
      remediation: "Re-run the scan with a longer --wait/--timeout. If the site redirects, check the finalUrl in the report header.",
    });
  }

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
  //    Cookies with SameSite=None are excluded — they are already covered by
  //    the dedicated SameSite=None check below, so they aren't double-flagged.
  const insecureCookies = cookies.filter(
    (c) => !c.secure && c.category !== "necessary" && c.sameSite !== "None"
  );
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

  // 5. MEDIUM: Excessive cookie lifetime (absolute 13-month guideline)
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

  // 5b. MEDIUM: Lifetime exceeding the known per-cookie expectation
  //     (uses maxDays from the cookie database; skipped when already covered
  //     by the 13-month check above)
  const exceedsExpected = cookies.filter(
    (c) => typeof c.maxDays === "number" && c.maxDays > 0 && c.lifetimeDays > c.maxDays && c.lifetimeDays <= 395
  );
  if (exceedsExpected.length > 0) {
    issues.push({
      severity: "medium",
      title: "Cookie lifetime exceeds expected duration",
      detail: `${exceedsExpected.length} ${pluralize(exceedsExpected.length, "cookie")} ${pluralize(exceedsExpected.length, "has", "have")} a lifetime longer than the provider's documented expectation.`,
      cookies: exceedsExpected.map((c) => `${c.name} (${c.lifetimeDays} days, expected ≤ ${c.maxDays})`),
      remediation: "Reset the cookie lifetime to the provider's default. Unusually long lifetimes often indicate a custom or misconfigured integration.",
    });
  }

  // 6. MEDIUM: Third-party cookies (cross-site tracking exposure)
  if (thirdParty.length > 0) {
    const thirdPartyDomainCount = new Set(thirdParty.map((c) => c.domain.replace(/^\./, ""))).size;
    issues.push({
      severity: "medium",
      title: "Third-party cookies detected",
      detail: `${thirdParty.length} third-party ${pluralize(thirdParty.length, "cookie")} from ${thirdPartyDomainCount} ${pluralize(thirdPartyDomainCount, "domain")}. Third-party cookies face increasing restrictions across browsers.`,
      cookies: thirdParty.map((c) => `${c.name} (${c.domain})`),
      remediation: "Migrate to first-party tracking where possible (server-side tagging, first-party data strategies). Review which third-party cookies are essential for your business.",
    });
  }

  // 7. MEDIUM: Missing SameSite attribute
  //    Unset SameSite (CSRF exposure) and explicit SameSite=None (intentional
  //    cross-site sending) are different situations — report them separately.
  const sameSiteUnset = cookies.filter((c) => c.isFirstParty && !c.sameSite);
  if (sameSiteUnset.length > 0) {
    issues.push({
      severity: "medium",
      title: "First-party cookies without SameSite attribute",
      detail: `${sameSiteUnset.length} first-party ${pluralize(sameSiteUnset.length, "cookie")} without a SameSite attribute. This exposes them to cross-site request forgery (CSRF) attacks.`,
      cookies: sameSiteUnset.map((c) => c.name),
      remediation: "Set SameSite=Lax or SameSite=Strict on first-party cookies unless cross-site sending is required.",
    });
  }

  const sameSiteNoneFirstParty = cookies.filter((c) => c.isFirstParty && c.sameSite === "None");
  if (sameSiteNoneFirstParty.length > 0) {
    issues.push({
      severity: "medium",
      title: "First-party cookies with SameSite=None",
      detail: `${sameSiteNoneFirstParty.length} first-party ${pluralize(sameSiteNoneFirstParty.length, "cookie")} explicitly set SameSite=None, allowing the cookie to be sent on any cross-site request.`,
      cookies: sameSiteNoneFirstParty.map((c) => c.name),
      remediation: "Verify that cross-site sending is actually required. If not, switch to SameSite=Lax or SameSite=Strict. SameSite=None cookies must also carry the Secure flag.",
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
  if (scanFailed) complianceScore = "ERR";
  else if (criticalCount > 0) complianceScore = "F";
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
      consentScan: afterConsent !== null,
      complianceScore,
      errors: scanResult.errors || [],
      issueCount: { critical: criticalCount, high: highCount, medium: mediumCount, low: lowCount },
    },
    issues: issues.sort((a, b) => severityOrder(a.severity) - severityOrder(b.severity)),
    cookies: cookies.sort((a, b) => {
      const catOrder = categoryOrder(a.category) - categoryOrder(b.category);
      return catOrder !== 0 ? catOrder : a.name.localeCompare(b.name);
    }),
    afterConsent,
    thirdPartyDomains: scanResult.thirdPartyRequests,
  };
}

/**
 * Compute an aggregate score across multiple reports (for batch scans).
 * Returns the worst grade — one non-compliant site fails the batch.
 */
export function combineReports(reports) {
  const scores = reports.map((r) => r.summary.complianceScore);
  let overall = "A";
  if (scores.includes("ERR")) overall = "ERR";
  else {
    overall = scores.reduce((worst, s) => (GRADES.indexOf(s) > GRADES.indexOf(worst) ? s : worst), "A");
  }
  const issueCount = { critical: 0, high: 0, medium: 0, low: 0 };
  for (const r of reports) {
    for (const sev of SEVERITIES) {
      issueCount[sev] += r.summary.issueCount[sev] || 0;
    }
  }
  return {
    url: null,
    complianceScore: overall,
    totalCookies: reports.reduce((n, r) => n + r.summary.totalCookies, 0),
    issueCount,
    reportCount: reports.length,
  };
}

function cookieRef(c) {
  return `${c.name} (${c.domain})`;
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
