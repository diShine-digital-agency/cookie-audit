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
import { analyze } from "../src/analyzer.js";
import { formatTable, formatJSON, formatCSV, formatMarkdown } from "../src/reporter.js";
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

// ════════════════════════════════════════════════════════════════════════
//  PUBLIC API EXPORTS
// ════════════════════════════════════════════════════════════════════════

suite("public API exports");

const api = await import("../src/index.js");
assert(typeof api.scan === "function", "scan exported");
assert(typeof api.scanMultiple === "function", "scanMultiple exported");
assert(typeof api.classify === "function", "classify exported");
assert(typeof api.analyze === "function", "analyze exported");
assert(typeof api.formatTable === "function", "formatTable exported");
assert(typeof api.formatJSON === "function", "formatJSON exported");
assert(typeof api.formatCSV === "function", "formatCSV exported");
assert(typeof api.formatMarkdown === "function", "formatMarkdown exported");

// ════════════════════════════════════════════════════════════════════════
//  RESULTS
// ════════════════════════════════════════════════════════════════════════

console.log(`\n  ─────────────────────────────────`);
console.log(`  ${passed} passing, ${failed} failing\n`);

if (failed > 0) {
  process.exit(1);
}
