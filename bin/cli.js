#!/usr/bin/env node

import { readFileSync, writeFileSync, existsSync } from "fs";
import { resolve } from "path";
import { scan, scanMultiple } from "../src/scanner.js";
import { classify } from "../src/classifier.js";
import { analyze } from "../src/analyzer.js";
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

// Normalize URLs
urls = urls.map((u) => {
  if (!u.startsWith("http://") && !u.startsWith("https://")) {
    return `https://${u}`;
  }
  return u;
});

if (urls.length === 0) {
  console.error("Error: No URL provided. Run with --help for usage.\n");
  process.exit(1);
}

// Validate format
const validFormats = ["table", "json", "csv", "markdown", "md", "html"];
if (!validFormats.includes(flags.format)) {
  console.error(`Error: Invalid format "${flags.format}". Valid options: ${validFormats.join(", ")}\n`);
  process.exit(1);
}
if (flags.format === "md") flags.format = "markdown";

// ── Main ───────────────────────────────────────────────────────────────
async function main() {
  if (!flags.quiet) {
    console.log("");
    console.log("  cookie-audit — scanning...");
    console.log(`  ${urls.length === 1 ? urls[0] : `${urls.length} URLs`}`);
    console.log("");
  }

  const scanOptions = {
    waitMs: flags.wait,
    headless: !flags.noHeadless,
    clickConsent: flags.consent,
    timeout: flags.timeout,
    userAgent: flags.userAgent,
  };

  let allReports = [];
  const startTime = Date.now();

  for (const url of urls) {
    if (!flags.quiet && urls.length > 1) {
      console.log(`  Scanning: ${url}`);
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

      if (!flags.quiet) {
        const duration = ((Date.now() - urlStart) / 1000).toFixed(1);
        const cookieCount = report.summary.totalCookies;
        const score = report.summary.complianceScore;
        console.log(`  Done: ${cookieCount} cookies found, score ${score} (${duration}s)`);
      }

    } catch (err) {
      console.error(`  Error scanning ${url}: ${err.message}`);
      if (!flags.quiet) console.error(`  ${err.stack}`);
    }
  }

  if (allReports.length === 0) {
    console.error("  No successful scans. Exiting.");
    process.exit(1);
  }

  // 4. Format output
  let output;
  if (allReports.length === 1) {
    output = formatReport(allReports[0], flags.format);
  } else {
    // Multiple reports: concatenate
    output = allReports.map((r) => formatReport(r, flags.format)).join("\n\n---\n\n");
  }

  // 5. Output
  if (flags.output) {
    const outPath = resolve(flags.output);
    writeFileSync(outPath, stripAnsi(output), "utf-8");
    if (!flags.quiet) {
      const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log("");
      console.log(`  Report saved to: ${outPath}`);
      console.log(`  Total scan time: ${totalDuration}s`);
      console.log("");
    }
  } else {
    console.log(output);
    if (!flags.quiet && urls.length > 1) {
      const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
      console.log(`  Total scan time: ${totalDuration}s`);
      console.log("");
    }
  }

  // Exit with non-zero if critical issues found
  const hasCritical = allReports.some((r) => r.summary.issueCount.critical > 0);
  process.exit(hasCritical ? 1 : 0);
}

main().catch((err) => {
  console.error(`Fatal error: ${err.message}`);
  process.exit(2);
});

// ── Helpers ────────────────────────────────────────────────────────────

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
    -q, --quiet           Suppress progress messages
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
    2   Fatal error (scan failed)
`);
}
