#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { scan, toErrorMessage } from "../src/scanner.js";
import { classify } from "../src/classifier.js";
import { analyze, combineReports } from "../src/analyzer.js";
import { formatTable, formatJSON, formatCSV, formatMarkdown, formatHTML } from "../src/reporter.js";

// ── Argument parsing (zero dependencies) ───────────────────────────────
const args = process.argv.slice(2);

if (args.includes("-h") || args.includes("--help") || args.length === 0) {
  printHelp();
  process.exit(0);
}

if (args.includes("-v") || args.includes("--version")) {
  const pkg = JSON.parse(readFileSync(new URL("../package.json", import.meta.url), "utf-8"));
  console.log(pkg.version);
  process.exit(0);
}

// All progress/diagnostic output goes to stderr so that report output on
// stdout (json, csv, markdown, html) stays clean and pipeable.
function progress(msg) {
  if (!flags.quiet) console.error(msg);
}

// Parse flags
const flags = {
  format: getFlag(["-f", "--format"]) || "table",
  output: getFlag(["-o", "--output"]),
  wait: parseInt(getFlag(["-w", "--wait"]) || "5000", 10),
  timeout: parseInt(getFlag(["-t", "--timeout"]) || "30000", 10),
  userAgent: getFlag(["--user-agent"]),
  consent: args.includes("-c") || args.includes("--consent"),
  noHeadless: args.includes("--no-headless"),
  quiet: args.includes("-q") || args.includes("--quiet"),
};

// Validate numeric flags
for (const [name, value] of [["wait", flags.wait], ["timeout", flags.timeout]]) {
  if (!Number.isFinite(value) || value < 0) {
    console.error(`Error: Invalid --${name} value "${getFlag([name === "wait" ? "-w" : "-t", "--" + name])}". Must be a non-negative number of milliseconds.\n`);
    process.exit(2);
  }
}

// Parse URLs (positional args that are not flags)
const flagsWithValues = new Set(["-f", "--format", "-o", "--output", "-w", "--wait", "-t", "--timeout", "--user-agent"]);
const allFlags = new Set(["-f", "--format", "-o", "--output", "-w", "--wait", "-t", "--timeout", "--user-agent", "-c", "--consent", "--no-headless", "-q", "--quiet", "-h", "--help", "-v", "--version"]);

let urls = [];
for (let i = 0; i < args.length; i++) {
  if (flagsWithValues.has(args[i])) { i++; continue; } // skip flag + its value
  if (allFlags.has(args[i])) continue; // skip boolean flags

  const arg = args[i];

  // Check if it's a file path (for batch scanning)
  if (existsSync(arg) && !arg.startsWith("http")) {
    const content = readFileSync(arg, "utf-8");
    const fileUrls = content.split("\n").map((l) => l.trim()).filter((l) => l && !l.startsWith("#"));
    urls.push(...fileUrls);
  } else {
    urls.push(arg);
  }
}

// Normalize and validate URLs
urls = urls.map((u) => {
  // Reject URLs that already carry a non-HTTP scheme (ftp://, javascript:, ...)
  if (/^[a-z][a-z0-9+.-]*:\/\//i.test(u) && !/^https?:\/\//i.test(u)) {
    return u; // left as-is so validation below rejects it
  }
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    return `https://${u}`;
  }
  return u;
});

const invalidUrls = urls.filter((u) => !isValidHttpUrl(u));
if (invalidUrls.length > 0) {
  console.error(`Error: Invalid URL${invalidUrls.length > 1 ? "s" : ""}: ${invalidUrls.join(", ")}\n`);
  process.exit(2);
}

// Deduplicate while preserving order
urls = [...new Set(urls)];

if (urls.length === 0) {
  console.error("Error: No URL provided. Run with --help for usage.\n");
  process.exit(2);
}

// Validate format
const validFormats = ["table", "json", "csv", "markdown", "md", "html"];
if (!validFormats.includes(flags.format)) {
  console.error(`Error: Invalid format "${flags.format}". Valid options: ${validFormats.join(", ")}\n`);
  process.exit(2);
}
if (flags.format === "md") flags.format = "markdown";

// ── Main ───────────────────────────────────────────────────────────────
async function main() {
  progress("");
  progress("  cookie-audit — scanning...");
  progress(`  ${urls.length === 1 ? urls[0] : `${urls.length} URLs`}`);
  progress("");

  const scanOptions = {
    waitMs: flags.wait,
    headless: !flags.noHeadless,
    clickConsent: flags.consent,
    timeout: flags.timeout,
    userAgent: flags.userAgent,
  };

  let allReports = [];
  let failedScans = 0;
  const startTime = Date.now();

  for (const url of urls) {
    if (urls.length > 1) {
      progress(`  Scanning: ${url}`);
    }

    const urlStart = Date.now();

    try {
      // 1. Scan
      const scanResult = await scan(url, scanOptions);

      if (scanResult.errors.length > 0) {
        console.error(`  Warning: ${scanResult.errors.join(", ")}`);
      }

      // 2. Classify
      const classified = classify(scanResult.cookiesBeforeConsent);

      // 3. Analyze
      const report = analyze(scanResult, classified);
      allReports.push(report);

      if (report.summary.complianceScore === "ERR") {
        failedScans++;
      }

      const duration = ((Date.now() - urlStart) / 1000).toFixed(1);
      const cookieCount = report.summary.totalCookies;
      const score = report.summary.complianceScore;
      progress(score === "ERR"
        ? `  Failed: ${url} could not be scanned (${duration}s)`
        : `  Done: ${cookieCount} cookies found, score ${score} (${duration}s)`);

    } catch (err) {
      failedScans++;
      console.error(`  Error scanning ${url}: ${toErrorMessage(err)}`);
    }
  }

  if (allReports.length === 0) {
    console.error("  No successful scans. Exiting.");
    process.exit(2);
  }

  // 4. Format output
  const output = formatOutput(allReports, flags.format);

  // 5. Output
  if (flags.output) {
    const outPath = resolve(flags.output);
    writeFileSync(outPath, stripAnsi(output), "utf-8");
    const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
    progress("");
    progress(`  Report saved to: ${outPath}`);
    progress(`  Total scan time: ${totalDuration}s`);
    progress("");
  } else {
    console.log(output);
    if (urls.length > 1) {
      const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
      progress(`  Total scan time: ${totalDuration}s`);
      progress("");
    }
  }

  // Exit codes:
  //   2 — one or more scans failed (or no report could be produced)
  //   1 — critical compliance issues detected
  //   0 — no critical issues
  if (failedScans > 0) process.exit(2);
  const hasCritical = allReports.some((r) => r.summary.issueCount.critical > 0);
  process.exit(hasCritical ? 1 : 0);
}

main().catch((err) => {
  console.error(`Fatal error: ${toErrorMessage(err)}`);
  process.exit(2);
});

// ── Helpers ────────────────────────────────────────────────────────────

function formatOutput(reports, format) {
  if (reports.length === 1) {
    return formatReport(reports[0], format);
  }

  // Structured formats get a well-defined multi-report shape
  if (format === "json") {
    return JSON.stringify({ summary: combineReports(reports), reports }, null, 2);
  }
  if (format === "csv") {
    // One CSV document with a URL column; single header row
    const [header, ...blocks] = reports.map((r) => {
      const [head, ...rows] = formatCSV(r).split("\n");
      return { head, rows: rows.map((row) => `${csvEscapeCell(r.summary.url)},${row}`) };
    });
    const lines = [`URL,${blocks[0].head}`];
    for (const b of blocks) lines.push(...b.rows);
    return lines.join("\n");
  }
  if (format === "html") {
    // A single valid HTML document: concatenate body sections only
    const bodies = reports.map((r) => {
      const html = formatHTML(r);
      const match = html.match(/<body>([\s\S]*)<\/body>/i);
      return match ? match[1] : html;
    });
    return "<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n<meta charset=\"UTF-8\">\n<meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n<title>Cookie Audit — Batch Report</title>\n" + extractStyle(formatHTML(reports[0])) + "\n</head>\n<body>\n<h1>Cookie Audit — Batch Report</h1>\n" + bodies.join('\n<hr style="border-color:#334155;margin:2rem 0">\n') + "\n</body>\n</html>";
  }

  // table / markdown: concatenate with a separator
  return reports.map((r) => formatReport(r, format)).join("\n\n---\n\n");
}

function extractStyle(html) {
  const match = html.match(/<style>[\s\S]*?<\/style>/i);
  return match ? match[0] : "";
}

function formatReport(report, format) {
  switch (format) {
    case "table": return formatTable(report);
    case "json": return formatJSON(report);
    case "csv": return formatCSV(report);
    case "markdown": return formatMarkdown(report);
    case "html": return formatHTML(report);
    default: return formatTable(report);
  }
}

function getFlag(names) {
  for (const name of names) {
    const idx = args.indexOf(name);
    if (idx !== -1 && idx + 1 < args.length) {
      return args[idx + 1];
    }
  }
  return null;
}

function isValidHttpUrl(str) {
  try {
    const u = new URL(str);
    return (u.protocol === "http:" || u.protocol === "https:") && !!u.hostname;
  } catch {
    return false;
  }
}

function csvEscapeCell(str) {
  if (/[",\n]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function stripAnsi(str) {
  return str.replace(/\x1b\[[0-9;]*m/g, "");
}

function printHelp() {
  console.log(`
  cookie-audit — Scan any website for cookies and GDPR compliance

  USAGE
    cookie-audit <url> [options]
    cookie-audit <url1> <url2> ... [options]
    cookie-audit urls.txt [options]

  ARGUMENTS
    <url>         Website URL to scan (https:// added if missing)
    <file>        Text file with one URL per line (for batch scanning)

  OPTIONS
    -f, --format <type>   Output format: table, json, csv, markdown, html  [default: table]
    -o, --output <file>   Save report to file (auto-strips ANSI colors)
    -w, --wait <ms>       Wait time for page to fully load             [default: 5000]
    -t, --timeout <ms>    Navigation timeout per page                  [default: 30000]
    --user-agent <str>    Custom User-Agent string
    -c, --consent         Attempt to click the consent banner, then re-scan
    --no-headless         Run browser in visible mode (for debugging)
    -q, --quiet           Suppress progress messages (stderr)
    -h, --help            Show this help
    -v, --version         Show version

  EXAMPLES
    cookie-audit example.com
    cookie-audit https://example.com -f markdown -o report.md
    cookie-audit example.com -c                           # scan before + after consent
    cookie-audit example.com other.com -f csv -o audit.csv
    cookie-audit urls.txt -f json -o results.json         # batch scan from file

  EXIT CODES
    0   No critical issues found
    1   Critical compliance issues detected
    2   Fatal error or scan failed (network error, invalid URL, timeout)
`);
}
