/**
 * Output formatters for cookie audit reports.
 *
 * Supports: table (terminal), json, csv, markdown
 */

// ── ANSI color helpers (no dependencies) ───────────────────────────────
const isColorEnabled = process.stdout.isTTY && !process.env.NO_COLOR;
const c = {
  bold:    (s) => isColorEnabled ? `\x1b[1m${s}\x1b[0m` : s,
  dim:     (s) => isColorEnabled ? `\x1b[2m${s}\x1b[0m` : s,
  red:     (s) => isColorEnabled ? `\x1b[31m${s}\x1b[0m` : s,
  green:   (s) => isColorEnabled ? `\x1b[32m${s}\x1b[0m` : s,
  yellow:  (s) => isColorEnabled ? `\x1b[33m${s}\x1b[0m` : s,
  blue:    (s) => isColorEnabled ? `\x1b[34m${s}\x1b[0m` : s,
  magenta: (s) => isColorEnabled ? `\x1b[35m${s}\x1b[0m` : s,
  cyan:    (s) => isColorEnabled ? `\x1b[36m${s}\x1b[0m` : s,
  gray:    (s) => isColorEnabled ? `\x1b[90m${s}\x1b[0m` : s,
  bgRed:   (s) => isColorEnabled ? `\x1b[41m\x1b[37m${s}\x1b[0m` : s,
  bgYellow:(s) => isColorEnabled ? `\x1b[43m\x1b[30m${s}\x1b[0m` : s,
};

// ── Table (terminal) ───────────────────────────────────────────────────
export function formatTable(report) {
  const { summary, issues, cookies } = report;
  const lines = [];

  // Header
  lines.push("");
  lines.push(c.bold("  Cookie Audit Report"));
  lines.push(c.dim(`  ${summary.url} — ${formatDate(summary.scannedAt)}`));
  if (summary.pageTitle) lines.push(c.dim(`  ${summary.pageTitle}`));
  lines.push("");

  // Compliance grade
  const gradeColor = { A: c.green, "B+": c.green, B: c.blue, C: c.yellow, D: c.red, F: c.bgRed };
  const colorFn = gradeColor[summary.complianceScore] || c.red;
  lines.push(`  Compliance Score: ${colorFn(c.bold(summary.complianceScore))}`);
  lines.push("");

  // Summary box
  lines.push(c.bold("  Summary"));
  lines.push(`  Total cookies: ${c.bold(String(summary.totalCookies))}  (${summary.firstParty} first-party, ${summary.thirdParty} third-party)`);
  lines.push("");

  // Category breakdown with bar chart
  const maxCount = Math.max(...Object.values(summary.categories), 1);
  const barWidth = 20;
  const catColors = { necessary: c.green, functional: c.blue, analytics: c.cyan, marketing: c.magenta, unknown: c.yellow };
  for (const [cat, count] of Object.entries(summary.categories)) {
    if (count === 0 && cat === "unknown") continue;
    const filled = Math.round((count / maxCount) * barWidth);
    const bar = "#".repeat(filled) + " ".repeat(barWidth - filled);
    const pct = summary.totalCookies > 0 ? Math.round((count / summary.totalCookies) * 100) : 0;
    const colorize = catColors[cat] || c.gray;
    lines.push(`  ${pad(cat, 12)} ${colorize(bar)}  ${count} (${pct}%)`);
  }
  lines.push("");

  // Consent mechanism
  if (summary.consentMechanism) {
    lines.push(`  Consent: ${c.green(summary.consentMechanism.join(", "))}`);
  } else {
    lines.push(`  Consent: ${c.red("No consent mechanism detected")}`);
  }
  lines.push("");

  // Issues
  if (issues.length > 0) {
    lines.push(c.bold("  Issues"));
    lines.push("");
    for (const issue of issues) {
      const sevLabel = formatSeverity(issue.severity);
      lines.push(`  ${sevLabel}  ${issue.title}`);
      lines.push(`  ${" ".repeat(10)}${c.dim(issue.detail)}`);
      if (issue.cookies.length <= 5) {
        lines.push(`  ${" ".repeat(10)}${c.dim("Cookies: " + issue.cookies.join(", "))}`);
      } else {
        lines.push(`  ${" ".repeat(10)}${c.dim("Cookies: " + issue.cookies.slice(0, 5).join(", ") + ` +${issue.cookies.length - 5} more`)}`);
      }
      lines.push("");
    }
  } else {
    lines.push(c.green("  No issues found."));
    lines.push("");
  }

  // Cookie table
  lines.push(c.bold("  Cookie Details"));
  lines.push("");
  const header = `  ${pad("Name", 28)} ${pad("Category", 12)} ${pad("Provider", 22)} ${pad("Party", 5)} ${pad("Secure", 6)} ${pad("HttpOnly", 8)} ${pad("SameSite", 8)} ${pad("Days", 5)}`;
  lines.push(c.dim(header));
  lines.push(c.dim("  " + "-".repeat(header.length - 2)));

  for (const cookie of cookies) {
    const catColor = catColors[cookie.category] || c.gray;
    const secureMark = cookie.secure ? c.green("Y") : c.red("N");
    const httpOnlyMark = cookie.httpOnly ? c.green("Y") : (cookie.category === "necessary" ? c.red("N") : c.dim("-"));
    const sameSiteMark = cookie.sameSite === "Strict" ? c.green("Strict") : cookie.sameSite === "Lax" ? c.blue("Lax") : c.yellow("None");
    const days = cookie.isSession ? c.dim("sess") : String(cookie.lifetimeDays);
    const party = cookie.isFirstParty ? "1st" : c.dim("3rd");

    lines.push(
      `  ${pad(truncate(cookie.name, 28), 28)} ${catColor(pad(cookie.category, 12))} ${pad(truncate(cookie.provider || "-", 22), 22)} ${pad(party, 5)} ${pad(secureMark, 6)} ${pad(httpOnlyMark, 8)} ${pad(sameSiteMark, 8)} ${pad(days, 5)}`
    );
  }
  lines.push("");

  // Third-party domains
  if (report.thirdPartyDomains.length > 0) {
    lines.push(c.bold(`  Third-Party Domains (${report.thirdPartyDomains.length})`));
    const grouped = groupByTLD(report.thirdPartyDomains);
    for (const [tld, domains] of Object.entries(grouped)) {
      lines.push(`  ${c.dim(tld)}: ${domains.join(", ")}`);
    }
    lines.push("");
  }

  return lines.join("\n");
}

// ── JSON ───────────────────────────────────────────────────────────────
export function formatJSON(report) {
  return JSON.stringify(report, null, 2);
}

// ── CSV ────────────────────────────────────────────────────────────────
export function formatCSV(report) {
  const headers = [
    "Name", "Domain", "Category", "Provider", "Description",
    "First Party", "Secure", "HttpOnly", "SameSite",
    "Session", "Lifetime Days", "Expires", "Path", "Match"
  ];
  const rows = report.cookies.map((c) => [
    csvEscape(c.name),
    csvEscape(c.domain),
    c.category,
    csvEscape(c.provider || ""),
    csvEscape(c.description || ""),
    c.isFirstParty ? "Yes" : "No",
    c.secure ? "Yes" : "No",
    c.httpOnly ? "Yes" : "No",
    c.sameSite || "",
    c.isSession ? "Yes" : "No",
    c.lifetimeDays,
    c.expires || "",
    c.path,
    c.match || "",
  ]);

  return [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
}

// ── Markdown ───────────────────────────────────────────────────────────
export function formatMarkdown(report) {
  const { summary, issues, cookies } = report;
  const lines = [];

  lines.push(`# Cookie Audit Report`);
  lines.push("");
  lines.push(`**URL:** ${summary.url}  `);
  lines.push(`**Scanned:** ${formatDate(summary.scannedAt)}  `);
  if (summary.pageTitle) lines.push(`**Page:** ${summary.pageTitle}  `);
  lines.push(`**Compliance Score:** ${summary.complianceScore}  `);
  lines.push("");

  // Summary
  lines.push("## Summary");
  lines.push("");
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total cookies | ${summary.totalCookies} |`);
  lines.push(`| First-party | ${summary.firstParty} |`);
  lines.push(`| Third-party | ${summary.thirdParty} |`);
  lines.push(`| Necessary | ${summary.categories.necessary} |`);
  lines.push(`| Functional | ${summary.categories.functional} |`);
  lines.push(`| Analytics | ${summary.categories.analytics} |`);
  lines.push(`| Marketing | ${summary.categories.marketing} |`);
  lines.push(`| Unknown | ${summary.categories.unknown} |`);
  lines.push(`| Consent mechanism | ${summary.consentMechanism ? summary.consentMechanism.join(", ") : "Not detected"} |`);
  lines.push("");

  // Issues
  if (issues.length > 0) {
    lines.push("## Issues");
    lines.push("");
    for (const issue of issues) {
      const icon = { critical: "!!!", high: "!!", medium: "!", low: "~" }[issue.severity] || "?";
      lines.push(`### [${issue.severity.toUpperCase()}] ${issue.title}`);
      lines.push("");
      lines.push(issue.detail);
      lines.push("");
      lines.push(`**Affected cookies:** ${issue.cookies.slice(0, 10).join(", ")}${issue.cookies.length > 10 ? ` (+${issue.cookies.length - 10} more)` : ""}`);
      lines.push("");
      lines.push(`**Remediation:** ${issue.remediation}`);
      lines.push("");
    }
  }

  // Cookie table
  lines.push("## Cookie Inventory");
  lines.push("");
  lines.push("| Name | Category | Provider | Party | Secure | HttpOnly | SameSite | Days |");
  lines.push("|------|----------|----------|-------|--------|----------|----------|------|");
  for (const cookie of cookies) {
    lines.push(
      `| ${mdEscape(cookie.name)} | ${cookie.category} | ${mdEscape(cookie.provider || "-")} | ${cookie.isFirstParty ? "1st" : "3rd"} | ${cookie.secure ? "Yes" : "No"} | ${cookie.httpOnly ? "Yes" : "No"} | ${cookie.sameSite || "-"} | ${cookie.isSession ? "session" : cookie.lifetimeDays} |`
    );
  }
  lines.push("");

  // Third-party domains
  if (report.thirdPartyDomains.length > 0) {
    lines.push(`## Third-Party Domains (${report.thirdPartyDomains.length})`);
    lines.push("");
    for (const d of report.thirdPartyDomains) {
      lines.push(`- ${d}`);
    }
    lines.push("");
  }

  lines.push("---");
  lines.push(`*Generated by [cookie-audit](https://github.com/diShine-digital-agency/cookie-audit)*`);

  return lines.join("\n");
}

// ── Utilities ──────────────────────────────────────────────────────────

function formatDate(iso) {
  return new Date(iso).toLocaleString("en-GB", {
    year: "numeric", month: "short", day: "numeric",
    hour: "2-digit", minute: "2-digit",
  });
}

function pad(str, len) {
  // ANSI-aware padding
  const visible = str.replace(/\x1b\[[0-9;]*m/g, "");
  const diff = len - visible.length;
  return diff > 0 ? str + " ".repeat(diff) : str;
}

function truncate(str, maxLen) {
  return str.length > maxLen ? str.slice(0, maxLen - 1) + "…" : str;
}

function csvEscape(str) {
  if (str.includes(",") || str.includes('"') || str.includes("\n")) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function mdEscape(str) {
  return str.replace(/\|/g, "\\|");
}

function formatSeverity(sev) {
  switch (sev) {
    case "critical": return c.bgRed(" CRITICAL ");
    case "high":     return c.red("   HIGH   ");
    case "medium":   return c.yellow(" MEDIUM   ");
    case "low":      return c.dim("   LOW    ");
    default:         return pad(sev, 10);
  }
}

function groupByTLD(domains) {
  const groups = {};
  for (const d of domains) {
    const parts = d.split(".");
    const tld = parts.slice(-2).join(".");
    if (!groups[tld]) groups[tld] = [];
    if (!groups[tld].includes(d)) groups[tld].push(d);
  }
  return groups;
}
