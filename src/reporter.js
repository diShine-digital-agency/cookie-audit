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
  bgGreen: (s) => isColorEnabled ? `\x1b[42m\x1b[30m${s}\x1b[0m` : s,
  bgYellow:(s) => isColorEnabled ? `\x1b[43m\x1b[30m${s}\x1b[0m` : s,
  bgBlue:  (s) => isColorEnabled ? `\x1b[44m\x1b[37m${s}\x1b[0m` : s,
  underline: (s) => isColorEnabled ? `\x1b[4m${s}\x1b[0m` : s,
};

// Unicode box characters for cleaner output
const BOX = {
  topLeft: "┌", topRight: "┐", bottomLeft: "└", bottomRight: "┘",
  horizontal: "─", vertical: "│",
  teeRight: "├", teeLeft: "┤",
  block: "█", blockLight: "░",
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
  lines.push(c.dim(`  ${BOX.horizontal.repeat(60)}`));
  lines.push("");

  // Compliance grade (large format)
  const gradeColor = { A: c.bgGreen, "B+": c.green, B: c.blue, C: c.yellow, D: c.red, F: c.bgRed };
  const gradeEmoji = { A: "pass", "B+": "pass", B: "info", C: "warn", D: "warn", F: "fail" };
  const colorFn = gradeColor[summary.complianceScore] || c.red;
  const gradeStatus = gradeEmoji[summary.complianceScore] || "fail";
  const gradePrefix = gradeStatus === "pass" ? c.green("PASS") : gradeStatus === "warn" ? c.yellow("WARN") : c.red("FAIL");
  lines.push(`  Compliance: ${colorFn(c.bold(` ${summary.complianceScore} `))}  ${gradePrefix}`);
  lines.push("");

  // Summary box
  lines.push(c.bold("  Summary"));
  lines.push(`  Total cookies: ${c.bold(String(summary.totalCookies))}  (${summary.firstParty} first-party, ${summary.thirdParty} third-party)`);
  lines.push("");

  // Category breakdown with improved bar chart
  const maxCount = Math.max(...Object.values(summary.categories), 1);
  const barWidth = 20;
  const catColors = { necessary: c.green, functional: c.blue, analytics: c.cyan, marketing: c.magenta, unknown: c.yellow };
  const catIcons = { necessary: "N", functional: "F", analytics: "A", marketing: "M", unknown: "?" };
  for (const [cat, count] of Object.entries(summary.categories)) {
    if (count === 0 && cat === "unknown") continue;
    const filled = Math.round((count / maxCount) * barWidth);
    const bar = BOX.block.repeat(filled) + BOX.blockLight.repeat(barWidth - filled);
    const pct = summary.totalCookies > 0 ? Math.round((count / summary.totalCookies) * 100) : 0;
    const colorize = catColors[cat] || c.gray;
    lines.push(`  ${pad(cat, 12)} ${colorize(bar)}  ${count} (${pct}%)`);
  }
  lines.push("");

  // Consent mechanism
  if (summary.consentMechanism) {
    lines.push(`  Consent: ${c.green("Detected")} ${c.dim("(" + summary.consentMechanism.join(", ") + ")")}`);
  } else {
    lines.push(`  Consent: ${c.red("No consent mechanism detected")}`);
  }
  lines.push("");

  // Issues
  if (issues.length > 0) {
    const issueCountStr = `${summary.issueCount.critical ? c.red(summary.issueCount.critical + " critical") + " " : ""}${summary.issueCount.high ? c.yellow(summary.issueCount.high + " high") + " " : ""}${summary.issueCount.medium ? c.blue(summary.issueCount.medium + " medium") + " " : ""}${summary.issueCount.low ? c.dim(summary.issueCount.low + " low") : ""}`.trim();
    lines.push(c.bold(`  Issues (${issues.length})`) + `  ${issueCountStr}`);
    lines.push("");
    for (const issue of issues) {
      const sevLabel = formatSeverity(issue.severity);
      lines.push(`  ${sevLabel}  ${c.bold(issue.title)}`);
      // Word-wrap detail text at ~70 chars for readability
      const detailLines = wordWrap(issue.detail, 68);
      for (const dl of detailLines) {
        lines.push(`  ${" ".repeat(10)}${c.dim(dl)}`);
      }
      if (issue.cookies.length <= 5) {
        lines.push(`  ${" ".repeat(10)}${c.dim("Cookies: " + issue.cookies.join(", "))}`);
      } else {
        lines.push(`  ${" ".repeat(10)}${c.dim("Cookies: " + issue.cookies.slice(0, 5).join(", ") + ` +${issue.cookies.length - 5} more`)}`);
      }
      lines.push(`  ${" ".repeat(10)}${c.dim("Fix: " + issue.remediation)}`);
      lines.push("");
    }
  } else {
    lines.push(c.green("  No issues found — the site looks compliant."));
    lines.push("");
  }

  // Cookie table
  lines.push(c.dim(`  ${BOX.horizontal.repeat(60)}`));
  lines.push(c.bold("  Cookie Details"));
  lines.push("");
  const header = `  ${pad("Name", 28)} ${pad("Category", 12)} ${pad("Provider", 22)} ${pad("Party", 5)} ${pad("Secure", 6)} ${pad("HttpOnly", 8)} ${pad("SameSite", 8)} ${pad("Days", 5)}`;
  lines.push(c.dim(header));
  lines.push(c.dim("  " + BOX.horizontal.repeat(98)));

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
  if (report.thirdPartyDomains && report.thirdPartyDomains.length > 0) {
    lines.push(c.dim(`  ${BOX.horizontal.repeat(60)}`));
    lines.push(c.bold(`  Third-Party Domains (${report.thirdPartyDomains.length})`));
    lines.push("");
    const grouped = groupByTLD(report.thirdPartyDomains);
    for (const [tld, domains] of Object.entries(grouped)) {
      lines.push(`  ${c.dim(tld)}: ${domains.join(", ")}`);
    }
    lines.push("");
  }

  // Footer
  lines.push(c.dim(`  ${BOX.horizontal.repeat(60)}`));
  lines.push(c.dim("  Generated by cookie-audit — https://github.com/diShine-digital-agency/cookie-audit"));
  lines.push("");

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

// ── HTML ───────────────────────────────────────────────────────────────
export function formatHTML(report) {
  const { summary, issues, cookies } = report;
  const h = htmlEscape;

  const severityColor = { critical: "#dc2626", high: "#ea580c", medium: "#ca8a04", low: "#6b7280" };
  const gradeColor = { A: "#16a34a", "B+": "#22c55e", B: "#3b82f6", C: "#eab308", D: "#ef4444", F: "#dc2626" };
  const catColor = { necessary: "#16a34a", functional: "#3b82f6", analytics: "#06b6d4", marketing: "#a855f7", unknown: "#eab308" };

  const lines = [];
  lines.push("<!DOCTYPE html>");
  lines.push('<html lang="en">');
  lines.push("<head>");
  lines.push('<meta charset="UTF-8">');
  lines.push('<meta name="viewport" content="width=device-width, initial-scale=1.0">');
  lines.push(`<title>Cookie Audit — ${h(summary.url)}</title>`);
  lines.push("<style>");
  lines.push(`
    :root { --bg: #0f172a; --card: #1e293b; --border: #334155; --text: #e2e8f0; --muted: #94a3b8; }
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; background: var(--bg); color: var(--text); padding: 2rem; max-width: 1200px; margin: 0 auto; line-height: 1.6; }
    h1 { font-size: 1.5rem; margin-bottom: 0.25rem; }
    h2 { font-size: 1.2rem; margin: 2rem 0 1rem; border-bottom: 1px solid var(--border); padding-bottom: 0.5rem; }
    .meta { color: var(--muted); font-size: 0.85rem; margin-bottom: 1.5rem; }
    .grade { display: inline-block; font-size: 2rem; font-weight: 700; padding: 0.25rem 0.75rem; border-radius: 0.5rem; margin: 0.5rem 0 1rem; }
    .cards { display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 0.75rem; margin-bottom: 1.5rem; }
    .card { background: var(--card); border: 1px solid var(--border); border-radius: 0.5rem; padding: 1rem; text-align: center; }
    .card .num { font-size: 1.5rem; font-weight: 700; }
    .card .label { font-size: 0.75rem; color: var(--muted); text-transform: uppercase; letter-spacing: 0.05em; }
    .issue { background: var(--card); border-left: 4px solid; border-radius: 0.25rem; padding: 1rem; margin-bottom: 0.75rem; }
    .issue .sev { font-size: 0.7rem; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; }
    .issue h3 { font-size: 1rem; margin: 0.25rem 0 0.5rem; }
    .issue p { font-size: 0.85rem; color: var(--muted); margin-bottom: 0.5rem; }
    .issue .fix { font-size: 0.85rem; color: #38bdf8; }
    table { width: 100%; border-collapse: collapse; font-size: 0.8rem; margin-bottom: 1rem; }
    th, td { text-align: left; padding: 0.5rem 0.75rem; border-bottom: 1px solid var(--border); }
    th { background: var(--card); font-weight: 600; position: sticky; top: 0; }
    tr:hover td { background: rgba(255,255,255,0.03); }
    .tag { display: inline-block; padding: 0.1rem 0.5rem; border-radius: 9999px; font-size: 0.7rem; font-weight: 600; }
    .y { color: #22c55e; } .n { color: #ef4444; }
    footer { margin-top: 2rem; padding-top: 1rem; border-top: 1px solid var(--border); font-size: 0.75rem; color: var(--muted); }
    footer a { color: #38bdf8; text-decoration: none; }
  `);
  lines.push("</style>");
  lines.push("</head>");
  lines.push("<body>");

  // Header
  lines.push("<h1>Cookie Audit Report</h1>");
  lines.push(`<p class="meta">${h(summary.url)} — ${h(formatDate(summary.scannedAt))}${summary.pageTitle ? " — " + h(summary.pageTitle) : ""}</p>`);

  // Grade
  const gc = gradeColor[summary.complianceScore] || "#ef4444";
  lines.push(`<div class="grade" style="background:${gc};color:#fff">${h(summary.complianceScore)}</div>`);

  // Summary cards
  lines.push('<div class="cards">');
  lines.push(`<div class="card"><div class="num">${summary.totalCookies}</div><div class="label">Total Cookies</div></div>`);
  lines.push(`<div class="card"><div class="num">${summary.firstParty}</div><div class="label">First-Party</div></div>`);
  lines.push(`<div class="card"><div class="num">${summary.thirdParty}</div><div class="label">Third-Party</div></div>`);
  for (const [cat, count] of Object.entries(summary.categories)) {
    const cc = catColor[cat] || "#6b7280";
    lines.push(`<div class="card"><div class="num" style="color:${cc}">${count}</div><div class="label">${h(cat)}</div></div>`);
  }
  lines.push("</div>");

  // Consent
  if (summary.consentMechanism) {
    lines.push(`<p>Consent mechanism: <strong>${h(summary.consentMechanism.join(", "))}</strong></p>`);
  } else {
    lines.push('<p>Consent mechanism: <strong style="color:#ef4444">Not detected</strong></p>');
  }

  // Issues
  if (issues.length > 0) {
    lines.push("<h2>Issues</h2>");
    for (const issue of issues) {
      const sc = severityColor[issue.severity] || "#6b7280";
      lines.push(`<div class="issue" style="border-color:${sc}">`);
      lines.push(`<span class="sev" style="color:${sc}">${h(issue.severity)}</span>`);
      lines.push(`<h3>${h(issue.title)}</h3>`);
      lines.push(`<p>${h(issue.detail)}</p>`);
      const shown = issue.cookies.slice(0, 10);
      const extra = issue.cookies.length > 10 ? ` (+${issue.cookies.length - 10} more)` : "";
      lines.push(`<p><strong>Cookies:</strong> ${h(shown.join(", "))}${h(extra)}</p>`);
      lines.push(`<p class="fix"><strong>Fix:</strong> ${h(issue.remediation)}</p>`);
      lines.push("</div>");
    }
  }

  // Cookie inventory table
  lines.push("<h2>Cookie Inventory</h2>");
  lines.push("<table>");
  lines.push("<thead><tr><th>Name</th><th>Category</th><th>Provider</th><th>Party</th><th>Secure</th><th>HttpOnly</th><th>SameSite</th><th>Days</th></tr></thead>");
  lines.push("<tbody>");
  for (const cookie of cookies) {
    const cc = catColor[cookie.category] || "#6b7280";
    lines.push("<tr>");
    lines.push(`<td>${h(cookie.name)}</td>`);
    lines.push(`<td><span class="tag" style="background:${cc}22;color:${cc}">${h(cookie.category)}</span></td>`);
    lines.push(`<td>${h(cookie.provider || "-")}</td>`);
    lines.push(`<td>${cookie.isFirstParty ? "1st" : "3rd"}</td>`);
    lines.push(`<td class="${cookie.secure ? "y" : "n"}">${cookie.secure ? "Yes" : "No"}</td>`);
    lines.push(`<td class="${cookie.httpOnly ? "y" : "n"}">${cookie.httpOnly ? "Yes" : "No"}</td>`);
    lines.push(`<td>${h(cookie.sameSite || "-")}</td>`);
    lines.push(`<td>${cookie.isSession ? "session" : cookie.lifetimeDays}</td>`);
    lines.push("</tr>");
  }
  lines.push("</tbody>");
  lines.push("</table>");

  // Third-party domains
  if (report.thirdPartyDomains && report.thirdPartyDomains.length > 0) {
    lines.push(`<h2>Third-Party Domains (${report.thirdPartyDomains.length})</h2>`);
    lines.push("<ul>");
    for (const d of report.thirdPartyDomains) {
      lines.push(`<li>${h(d)}</li>`);
    }
    lines.push("</ul>");
  }

  // Footer
  lines.push('<footer>Generated by <a href="https://github.com/diShine-digital-agency/cookie-audit">cookie-audit</a></footer>');
  lines.push("</body>");
  lines.push("</html>");

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

function htmlEscape(str) {
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

function wordWrap(text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let current = "";
  for (const word of words) {
    if (current.length + word.length + 1 > maxWidth && current.length > 0) {
      lines.push(current);
      current = word;
    } else {
      current = current ? current + " " + word : word;
    }
  }
  if (current) lines.push(current);
  return lines;
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
