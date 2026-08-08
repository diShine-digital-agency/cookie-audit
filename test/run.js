#!/usr/bin/env node

/**
 * Test suite for cookie-audit.
 *
 * Runs without any test framework — just Node.js assert.
 * Tests cover classifier, analyzer, reporter, and public API exports.
 * Scanner (Puppeteer) is tested with error-path only (no network needed).
 *
 * Usage:  npm test
 */

import { classify } from "../src/classifier.js";
import { analyze, combineReports } from "../src/analyzer.js";
import { toErrorMessage, cookieAppliesToHost } from "../src/scanner.js";
import { formatTable, formatJSON, formatCSV, formatMarkdown, formatHTML } from "../src/reporter.js";
import { EXACT, PREFIXES, DOMAINS } from "../src/known-cookies.js";

let passed = 0;
let failed = 0;
let currentSuite = "";

function suite(name) {
  currentSuite = name;
  console.log(`\n  ${name}`);
}

function assert(condition, msg) {
  if (condition) {
    passed++;
    console.log(`    ✓ ${msg}`);
  } else {
    failed++;
    console.error(`    ✗ FAIL: ${msg}`);
  }
}

// ── Helpers ─────────────────────────────────────────────────────────────

function makeCookie(overrides = {}) {
  return {
    name: "test",
    value: "val",
    domain: ".example.com",
    path: "/",
    isFirstParty: true,
    isSession: false,
    expires: new Date(Date.now() + 86400000).toISOString(),
    lifetimeDays: 30,
    secure: true,
    httpOnly: false,
    sameSite: "Lax",
    size: 10,
    priority: "Medium",
    ...overrides,
  };
}

function makeScanResult(overrides = {}) {
  return {
    url: "https://example.com",
    scannedAt: new Date().toISOString(),
    finalUrl: "https://example.com/",
    pageTitle: "Example Domain",
    cookiesBeforeConsent: [],
    cookiesAfterConsent: [],
    thirdPartyRequests: [],
    consentMechanism: null,
    errors: [],
    ...overrides,
  };
}

// ════════════════════════════════════════════════════════════════════════
//  KNOWN-COOKIES DATABASE
// ════════════════════════════════════════════════════════════════════════

suite("known-cookies database");

assert(Object.keys(EXACT).length > 200, `EXACT has ${Object.keys(EXACT).length} entries (>200)`);
assert(PREFIXES.length > 30, `PREFIXES has ${PREFIXES.length} entries (>30)`);
assert(Object.keys(DOMAINS).length > 100, `DOMAINS has ${Object.keys(DOMAINS).length} entries (>100)`);

// Verify data integrity — every entry has required fields
let badExact = 0;
for (const [, entry] of Object.entries(EXACT)) {
  if (!entry.category || !entry.provider || !entry.description) badExact++;
}
assert(badExact === 0, "all EXACT entries have category, provider, description");

let badPrefixes = 0;
for (const p of PREFIXES) {
  if (!p.prefix || !p.category) badPrefixes++;
}
assert(badPrefixes === 0, "all PREFIX entries have prefix and category");

let badDomains = 0;
for (const [, entry] of Object.entries(DOMAINS)) {
  if (!entry.category || !entry.provider) badDomains++;
}
assert(badDomains === 0, "all DOMAIN entries have category and provider");

// ════════════════════════════════════════════════════════════════════════
//  CLASSIFIER
// ════════════════════════════════════════════════════════════════════════

suite("classifier — exact matches");

const gaResult = classify([makeCookie({ name: "_ga" })]);
assert(gaResult[0].category === "analytics", "_ga → analytics");
assert(gaResult[0].provider === "Google Analytics", "_ga provider");
assert(gaResult[0].match === "exact", "_ga match type");

const fbpResult = classify([makeCookie({ name: "_fbp" })]);
assert(fbpResult[0].category === "marketing", "_fbp → marketing");
assert(fbpResult[0].provider === "Meta (Facebook)", "_fbp provider");

const gidResult = classify([makeCookie({ name: "_gid" })]);
assert(gidResult[0].category === "analytics", "_gid → analytics");

suite("classifier — prefix matches");

const gaPrefixResult = classify([makeCookie({ name: "_ga_ABCDE123" })]);
assert(gaPrefixResult[0].match === "prefix", "_ga_* matched by prefix");
assert(gaPrefixResult[0].category === "analytics", "_ga_* → analytics");

suite("classifier — domain matches");

const dcResult = classify([makeCookie({ name: "x", domain: ".doubleclick.net", isFirstParty: false })]);
assert(dcResult[0].match === "domain", "doubleclick.net matched by domain");
assert(dcResult[0].category === "marketing", "doubleclick.net → marketing");

const fbDomainResult = classify([makeCookie({ name: "x", domain: ".facebook.com", isFirstParty: false })]);
assert(fbDomainResult[0].match === "domain", "facebook.com matched by domain");

suite("classifier — heuristic matches");

const sessionResult = classify([makeCookie({ name: "session_id" })]);
assert(sessionResult[0].category === "necessary", "session_id → necessary (heuristic)");
assert(sessionResult[0].match === "heuristic", "session_id match = heuristic");

const csrfResult = classify([makeCookie({ name: "csrf_token" })]);
assert(csrfResult[0].category === "necessary", "csrf_token → necessary");

const langResult = classify([makeCookie({ name: "lang_pref" })]);
assert(langResult[0].category === "functional", "lang_pref → functional");

const consentResult = classify([makeCookie({ name: "gdpr_consent" })]);
assert(consentResult[0].category === "necessary", "gdpr_consent → necessary");

const trackResult = classify([makeCookie({ name: "_track_visitor" })]);
assert(trackResult[0].category === "analytics", "_track_visitor → analytics");

const adResult = classify([makeCookie({ name: "_ad_campaign" })]);
assert(adResult[0].category === "marketing", "_ad_campaign → marketing");

suite("classifier — unknown cookies");

const unknownResult = classify([makeCookie({ name: "xyz_abc_123" })]);
assert(unknownResult[0].category === "unknown", "unknown cookie → unknown");
assert(unknownResult[0].match === null, "unknown match = null");

suite("classifier — edge cases");

assert(classify([]).length === 0, "classify([]) → []");

const emptyNameResult = classify([makeCookie({ name: "" })]);
assert(emptyNameResult.length === 1, "empty name doesn't crash");

const longNameResult = classify([makeCookie({ name: "a".repeat(500) })]);
assert(longNameResult.length === 1, "very long name doesn't crash");

// Third-party long-lived unknown → marketing heuristic
const longLivedThirdParty = classify([
  makeCookie({ name: "xyz", domain: ".unknown-tracker.xyz", isFirstParty: false, lifetimeDays: 60 }),
]);
assert(longLivedThirdParty[0].category === "marketing", "long-lived 3rd-party → marketing (heuristic)");

// ════════════════════════════════════════════════════════════════════════
//  ANALYZER
// ════════════════════════════════════════════════════════════════════════

suite("analyzer — report structure");

const analyzerCookies = [
  { ...makeCookie({ name: "_ga" }), category: "analytics", provider: "Google Analytics", match: "exact" },
  { ...makeCookie({ name: "_fbp", secure: false, sameSite: "None" }), category: "marketing", provider: "Meta", match: "exact" },
  { ...makeCookie({ name: "sess", lifetimeDays: 0, isSession: true, sameSite: "Strict" }), category: "necessary", provider: null, match: "heuristic" },
  { ...makeCookie({ name: "tp", domain: ".tracker.com", isFirstParty: false, lifetimeDays: 400, sameSite: "None" }), category: "marketing", provider: "Tracker", match: "domain" },
  { ...makeCookie({ name: "unk" }), category: "unknown", provider: null, match: null },
];
const scanResult = makeScanResult({
  consentMechanism: ["cookiebot"],
  thirdPartyRequests: ["tracker.com", "cdn.example.net"],
});

const report = analyze(scanResult, analyzerCookies);

assert(report.summary !== undefined, "report.summary exists");
assert(report.issues !== undefined, "report.issues exists");
assert(report.cookies !== undefined, "report.cookies exists");
assert(report.thirdPartyDomains !== undefined, "report.thirdPartyDomains exists");
assert(report.summary.totalCookies === 5, "totalCookies = 5");
assert(report.summary.firstParty === 4, "firstParty = 4");
assert(report.summary.thirdParty === 1, "thirdParty = 1");

suite("analyzer — issue detection");

assert(report.issues.length > 0, "issues detected");
assert(report.issues[0].severity === "critical", "critical issues first");

const criticalIssue = report.issues.find((i) => i.severity === "critical");
assert(criticalIssue !== undefined, "pre-consent tracking → critical");

const highIssues = report.issues.filter((i) => i.severity === "high");
assert(highIssues.length > 0, "missing Secure flag → high");

suite("analyzer — compliance scoring");

// F: critical issues
assert(report.summary.complianceScore === "F", "critical issues → F");

// A: clean cookies
const cleanReport = analyze(
  makeScanResult({ thirdPartyRequests: [] }),
  [{ ...makeCookie({ name: "cf", sameSite: "Strict" }), category: "necessary", provider: "CF", match: "exact" }],
);
assert(cleanReport.summary.complianceScore === "A", "clean → A");

// No CMP + marketing cookies → critical
const noCmpReport = analyze(
  makeScanResult(),
  [{ ...makeCookie({ name: "_ga" }), category: "analytics", provider: "GA", match: "exact" }],
);
const noCmpCritical = noCmpReport.issues.find((i) => i.title === "No consent mechanism detected");
assert(noCmpCritical !== undefined, "no CMP + analytics → critical");

suite("analyzer — zero cookies");

const zeroReport = analyze(makeScanResult(), []);
assert(zeroReport.summary.totalCookies === 0, "zero cookies handled");
assert(zeroReport.summary.complianceScore === "A", "zero cookies → A");
assert(zeroReport.issues.length === 0, "zero cookies → no issues");

// ════════════════════════════════════════════════════════════════════════
//  REPORTER
// ════════════════════════════════════════════════════════════════════════

suite("reporter — formatTable");

const tableOutput = formatTable(report);
assert(typeof tableOutput === "string", "returns string");
assert(tableOutput.includes("Cookie Audit Report"), "has header");
assert(tableOutput.includes("Compliance"), "has compliance grade");
assert(tableOutput.includes("Cookie Details"), "has cookie details");

suite("reporter — formatJSON");

const jsonOutput = formatJSON(report);
const parsed = JSON.parse(jsonOutput);
assert(parsed.summary !== undefined, "valid JSON with summary");
assert(parsed.cookies.length === 5, "JSON has all cookies");

suite("reporter — formatCSV");

const csvOutput = formatCSV(report);
const csvLines = csvOutput.split("\n");
assert(csvLines[0].includes("Name"), "header has Name");
assert(csvLines[0].includes("Category"), "header has Category");
assert(csvLines.length === 6, "header + 5 data rows");

suite("reporter — formatMarkdown");

const mdOutput = formatMarkdown(report);
assert(mdOutput.includes("# Cookie Audit Report"), "has H1");
assert(mdOutput.includes("## Issues"), "has Issues");
assert(mdOutput.includes("## Cookie Inventory"), "has inventory table");
assert(mdOutput.includes("## Third-Party Domains"), "has 3rd-party section");

suite("reporter — formatTable (zero cookies)");

const zeroTable = formatTable(zeroReport);
assert(zeroTable.includes("No issues found"), "zero cookies: shows no issues");

suite("reporter — formatMarkdown (no third-party)");

const noTpReport = { ...report, thirdPartyDomains: [] };
const noTpMd = formatMarkdown(noTpReport);
assert(!noTpMd.includes("## Third-Party Domains"), "skips section when empty");

suite("reporter — formatCSV (empty)");

const emptyCSV = formatCSV(zeroReport);
assert(emptyCSV.split("\n").length === 1, "CSV: header only when no cookies");

suite("reporter — formatHTML");

const htmlOutput = formatHTML(report);
assert(typeof htmlOutput === "string", "returns string");
assert(htmlOutput.includes("<!DOCTYPE html>"), "has doctype");
assert(htmlOutput.includes("Cookie Audit Report"), "has title");
assert(htmlOutput.includes("example.com"), "has URL");
assert(htmlOutput.includes("Issues"), "has issues section");
assert(htmlOutput.includes("Cookie Inventory"), "has inventory");

suite("reporter — formatHTML (XSS safety)");

const xssCookies = [
  { ...makeCookie({ name: '<script>alert(1)</script>' }), category: "unknown", provider: null, match: null },
  { ...makeCookie({ name: '<img onerror=alert(1)>' }), category: "unknown", provider: null, match: null },
  { ...makeCookie({ name: "test'quote" }), category: "unknown", provider: null, match: null },
];
const xssReport = analyze(makeScanResult(), xssCookies);
const xssHtml = formatHTML(xssReport);
assert(!xssHtml.includes("<script>alert(1)</script>"), "HTML escapes script tags");
assert(xssHtml.includes("&lt;script&gt;"), "script tag is escaped");
assert(!xssHtml.includes("<img onerror"), "HTML escapes event handlers");
assert(xssHtml.includes("&lt;img onerror"), "img tag is escaped");
assert(!xssHtml.includes("test'quote") || xssHtml.includes("test&#39;quote"), "single quotes escaped");

suite("reporter — formatHTML (no third-party)");

const noTpHtml = formatHTML({ ...report, thirdPartyDomains: [] });
assert(!noTpHtml.includes("Third-Party Domains"), "skips 3rd-party when empty");

// ════════════════════════════════════════════════════════════════════════
//  REGRESSIONS
// ════════════════════════════════════════════════════════════════════════

suite("regression — failed scan gets ERR grade, not A");

const failedScan = makeScanResult({
  errors: ["net::ERR_NAME_NOT_RESOLVED at https://nope.invalid"],
  finalUrl: null,
});
const failedReport = analyze(failedScan, []);
assert(failedReport.summary.complianceScore === "ERR", "failed scan → ERR grade");
assert(failedReport.summary.issueCount.critical === 1, "failed scan → 1 critical issue");
assert(failedReport.issues[0].title === "Scan failed", "failed scan → 'Scan failed' issue");

const failedTable = formatTable(failedReport);
assert(failedTable.includes("ERR"), "table renders ERR grade");
const failedMd = formatMarkdown(failedReport);
assert(failedMd.includes("FAILED"), "markdown renders scan failure");
const failedHtml = formatHTML(failedReport);
assert(failedHtml.includes("ERR"), "HTML renders ERR grade");

suite("regression — SameSite=None cookies not double-flagged");

const ssnCookies = [
  { ...makeCookie({ name: "ssn", sameSite: "None", secure: false }), category: "functional", provider: null, match: "heuristic" },
];
const ssnReport = analyze(makeScanResult(), ssnCookies);
const secureIssue = ssnReport.issues.find((i) => i.title === "Cookies missing Secure flag");
assert(secureIssue === undefined, "SameSite=None cookie excluded from generic Secure-flag issue");
const ssnIssue = ssnReport.issues.find((i) => i.title === "SameSite=None cookies without Secure flag");
assert(ssnIssue !== undefined, "SameSite=None without Secure still flagged");

suite("regression — unset SameSite distinguished from SameSite=None");

const unsetCookie = [
  { ...makeCookie({ name: "nosamesite", sameSite: null }), category: "necessary", provider: null, match: "heuristic" },
];
const unsetReport = analyze(makeScanResult(), unsetCookie);
const unsetIssue = unsetReport.issues.find((i) => i.title === "First-party cookies without SameSite attribute");
assert(unsetIssue !== undefined, "unset SameSite flagged as missing attribute");
const noneIssue = unsetReport.issues.find((i) => i.title === "First-party cookies with SameSite=None");
assert(noneIssue === undefined, "unset SameSite not reported as SameSite=None");
const noneTable = formatTable(unsetReport);
assert(noneTable.includes("nosamesite"), "table renders cookie with null SameSite");

suite("regression — maxDays from cookie database is enforced");

const maxDaysCookies = [
  { ...makeCookie({ name: "_gid", lifetimeDays: 30 }), category: "analytics", provider: "Google Analytics", match: "exact", maxDays: 1 },
];
const maxDaysReport = analyze(makeScanResult({ consentMechanism: ["cookiebot"] }), maxDaysCookies);
const maxDaysIssue = maxDaysReport.issues.find((i) => i.title === "Cookie lifetime exceeds expected duration");
assert(maxDaysIssue !== undefined, "_gid with 30-day lifetime flagged (expected ≤ 1)");
assert(maxDaysIssue.cookies[0].includes("expected"), "issue lists expected maxDays");

const withinMaxCookies = [
  { ...makeCookie({ name: "_ga", lifetimeDays: 730 }), category: "analytics", provider: "Google Analytics", match: "exact", maxDays: 730 },
];
const withinMaxReport = analyze(makeScanResult({ consentMechanism: ["cookiebot"] }), withinMaxCookies);
assert(!withinMaxReport.issues.some((i) => i.title === "Cookie lifetime exceeds expected duration"), "_ga at 730 days not flagged (within maxDays)");

suite("regression — after-consent diff is reported");

const consentScan = makeScanResult({
  consentMechanism: ["custom"],
  cookiesBeforeConsent: [makeCookie({ name: "sess_id" })],
  cookiesAfterConsent: [makeCookie({ name: "sess_id" }), makeCookie({ name: "_ga" }), makeCookie({ name: "_fbp" })],
});
const consentReport = analyze(consentScan, classify(consentScan.cookiesBeforeConsent));
assert(consentReport.afterConsent !== null, "afterConsent present when post-consent cookies exist");
assert(consentReport.afterConsent.addedCount === 2, "2 cookies added after consent");
assert(consentReport.summary.consentScan === true, "summary.consentScan = true");
const consentMd = formatMarkdown(consentReport);
assert(consentMd.includes("## After Consent"), "markdown has After Consent section");
const consentHtml = formatHTML(consentReport);
assert(consentHtml.includes("After Consent"), "HTML has After Consent section");
const consentTable = formatTable(consentReport);
assert(consentTable.includes("After Consent"), "table has After Consent section");

const noConsentReport = analyze(makeScanResult(), classify([makeCookie({ name: "x", secure: true })]));
assert(noConsentReport.afterConsent === null, "afterConsent is null without consent click");
assert(noConsentReport.summary.consentScan === false, "summary.consentScan = false without click");

suite("regression — prototype-key cookie names/domains");

const protoResult = classify([makeCookie({ name: "toString", domain: ".constructor.io", isFirstParty: false })]);
assert(protoResult[0].category !== undefined, "cookie named 'toString' doesn't crash");
assert(protoResult[0].match !== "exact" || EXACT.toString, "'toString' not false-matched via prototype");

suite("regression — scanner helpers");

assert(cookieAppliesToHost({ domain: ".example.com" }, "example.com"), ".example.com cookie applies to example.com");
assert(cookieAppliesToHost({ domain: "example.com" }, "example.com"), "example.com cookie applies");
assert(cookieAppliesToHost({ domain: ".com" }, "example.com") === true, "suffix parent kept (host ends with .com)");
assert(!cookieAppliesToHost({ domain: ".other.com" }, "example.com"), "unrelated domain filtered out");
assert(!cookieAppliesToHost({ domain: ".notexample.com" }, "example.com"), "look-alike domain filtered out");
assert(cookieAppliesToHost({ domain: "" }, "example.com"), "empty domain kept (no data loss)");

assert(toErrorMessage(new Error("boom")) === "boom", "toErrorMessage: Error");
assert(toErrorMessage("str") === "str", "toErrorMessage: string");
assert(toErrorMessage(null) === "Unknown error", "toErrorMessage: null");
assert(toErrorMessage(42) === "42", "toErrorMessage: number");
assert(toErrorMessage({}) === "[object Object]", "toErrorMessage: plain object");

suite("regression — combineReports");

const combined = combineReports([report, cleanReport]);
assert(combined.complianceScore === "F", "aggregate takes worst grade (F beats A)");
assert(combined.reportCount === 2, "reportCount = 2");
assert(combined.issueCount.critical >= 1, "aggregate sums critical issues");

const combinedErr = combineReports([cleanReport, failedReport]);
assert(combinedErr.complianceScore === "ERR", "ERR wins over A");

const combinedClean = combineReports([cleanReport]);
assert(combinedClean.complianceScore === "A", "all-clean batch → A");

// ════════════════════════════════════════════════════════════════════════
//  PUBLIC API EXPORTS
// ════════════════════════════════════════════════════════════════════════

suite("public API exports");

const api = await import("../src/index.js");
assert(typeof api.scan === "function", "scan exported");
assert(typeof api.scanMultiple === "function", "scanMultiple exported");
assert(typeof api.toErrorMessage === "function", "toErrorMessage exported");
assert(typeof api.classify === "function", "classify exported");
assert(typeof api.analyze === "function", "analyze exported");
assert(typeof api.combineReports === "function", "combineReports exported");
assert(typeof api.formatTable === "function", "formatTable exported");
assert(typeof api.formatJSON === "function", "formatJSON exported");
assert(typeof api.formatCSV === "function", "formatCSV exported");
assert(typeof api.formatMarkdown === "function", "formatMarkdown exported");
assert(typeof api.formatHTML === "function", "formatHTML exported");

// ════════════════════════════════════════════════════════════════════════
//  RESULTS
// ════════════════════════════════════════════════════════════════════════

console.log(`\n  ─────────────────────────────────`);
console.log(`  ${passed} passing, ${failed} failing\n`);

if (failed > 0) {
  process.exit(1);
}
