# cookie-audit — User Guide

A step-by-step guide to scanning websites for cookies and GDPR compliance.

---

## Table of Contents

1. [What Does This Tool Do?](#1-what-does-this-tool-do)
2. [Installation](#2-installation)
3. [Your First Scan](#3-your-first-scan)
4. [Understanding the Report](#4-understanding-the-report)
5. [Saving Reports](#5-saving-reports)
6. [Scanning with Consent Interaction](#6-scanning-with-consent-interaction)
7. [Batch Scanning Multiple Sites](#7-batch-scanning-multiple-sites)
8. [All Options Explained](#8-all-options-explained)
9. [Using in Code (Programmatic)](#9-using-in-code-programmatic)
10. [CI/CD Integration](#10-cicd-integration)
11. [Troubleshooting](#11-troubleshooting)
12. [FAQ](#12-faq)

---

## 1. What Does This Tool Do?

cookie-audit scans any website and tells you:

- **Which cookies are set** — name, domain, how long they last, who sets them
- **What category each cookie belongs to** — necessary, functional, analytics, marketing, or unknown
- **Whether the site is GDPR-compliant** — are tracking cookies set before consent? Is there a cookie banner? Are cookie flags secure?
- **What needs fixing** — specific issues with severity levels and remediation steps

### Why does this matter?

Under GDPR (Europe), ePrivacy Directive, and similar laws worldwide, websites must:
- Get user **consent before** setting non-essential cookies
- Inform users **which cookies** are used and **why**
- Provide a way to **accept or reject** cookies

Violating these rules can result in fines up to 4% of annual revenue or €20 million.

cookie-audit automates the compliance check that would otherwise take hours of manual inspection.

---

## 2. Installation

### Requirements

- **Node.js 18 or later**
  - Check: `node --version`
  - If not installed: download from [nodejs.org](https://nodejs.org) (LTS version)

### Install cookie-audit

```bash
npm install -g @dishine/cookie-audit
```

> **Note:** The first run downloads Chromium (~300 MB). This only happens once.

### Alternative: Run without installing

```bash
npx @dishine/cookie-audit example.com
```

---

## 3. Your First Scan

```bash
cookie-audit example.com
```

The tool will:
1. Open the website in headless Chromium
2. Wait for the page to load (5 seconds by default)
3. Capture every cookie
4. Classify each cookie using a 478-entry database
5. Run compliance checks
6. Print the report

### Example output

```
  Cookie Audit Report
  https://example.com — 4 Apr 2026, 14:30
  ────────────────────────────────────────────────────────────

  Compliance:  B   PASS

  Summary
  Total cookies: 8  (5 first-party, 3 third-party)

  necessary    ██████████░░░░░░░░░░  3 (38%)
  analytics    ████████████████████  4 (50%)
  marketing    ████░░░░░░░░░░░░░░░░  1 (13%)

  Consent: Detected (onetrust)

  Issues (2)  1 high 1 medium

   HIGH       Missing Secure flag on 2 cookies
              ...
   MEDIUM     Excessive cookie lifetime on _ga (730 days)
              ...

  Cookie Details
  Name             Category     Provider            Party  Secure HttpOnly SameSite  Days
  ──────────────────────────────────────────────────────────────────────────────────────
  __cf_bm          necessary    Cloudflare          1st    Y      Y        Lax       1
  _ga              analytics    Google Analytics     1st    Y      N        Lax       730
  _gid             analytics    Google Analytics     1st    Y      N        Lax       1
  ...
```

---

## 4. Understanding the Report

### Compliance Score

| Grade | Meaning |
|-------|---------|
| **A** | No compliance issues detected |
| **B+** | Minor issues only (low severity) |
| **B** | Medium-severity issues |
| **C** | High-severity issues present |
| **D** | Multiple high-severity issues |
| **F** | Critical compliance violations |

### Cookie Categories

| Category | Meaning |
|----------|---------|
| **Necessary** | Essential for the site to function (sessions, security tokens, load balancing). Exempt from consent. |
| **Functional** | User preferences, UI settings. Usually require consent. |
| **Analytics** | Usage tracking (Google Analytics, Hotjar, Mixpanel). Require consent. |
| **Marketing** | Advertising and retargeting (Facebook Pixel, Google Ads, LinkedIn). Require consent. |
| **Unknown** | Not in the database. Needs manual review. |

### Issue Severity

| Severity | Meaning | Action |
|----------|---------|--------|
| **CRITICAL** | Likely violates GDPR. Could result in fines. | Fix immediately |
| **HIGH** | Significant security or compliance risk. | Fix before next release |
| **MEDIUM** | Best practice violation. | Plan to fix soon |
| **LOW** | Minor improvement opportunity. | Fix when convenient |

### Common Issues

**"Non-essential cookies set before consent"** (Critical)
- Analytics or marketing cookies load before the user clicks "Accept"
- Fix: Configure your tag manager to fire tags only after consent

**"No consent mechanism detected"** (Critical)
- Tracking cookies present but no cookie banner
- Fix: Install a CMP (Cookiebot, OneTrust, CookieYes, etc.)

**"Missing Secure flag"** (High)
- Cookie can be sent over unencrypted HTTP
- Fix: Add the `Secure` attribute

**"Session cookies without HttpOnly"** (High)
- Session cookie accessible via JavaScript (XSS risk)
- Fix: Add the `HttpOnly` attribute

**"Excessive cookie lifetime"** (Medium)
- Cookie lasts more than 13 months (exceeds CNIL/DPA guidelines)
- Fix: Reduce `max-age` or `expires` to 13 months or less

---

## 5. Saving Reports

```bash
# Markdown (client reports)
cookie-audit example.com -f markdown -o report.md

# JSON (scripts and dashboards)
cookie-audit example.com -f json -o audit.json

# CSV (spreadsheets)
cookie-audit example.com -f csv -o cookies.csv

# HTML (self-contained, shareable)
cookie-audit example.com -f html -o report.html
```

| Format | Best for |
|--------|----------|
| **table** (default) | Terminal review |
| **markdown** | Client reports, documentation, Notion, GitHub |
| **json** | Dashboards, scripts, jq |
| **csv** | Excel, Google Sheets |
| **html** | Shareable self-contained report for browsers, stakeholders |

---

## 6. Scanning with Consent Interaction

The `-c` flag tells cookie-audit to:

1. Scan the page as-is (before any user interaction)
2. Click the consent/accept button
3. Re-scan to capture cookies set after consent

```bash
cookie-audit example.com -c
```

### Supported consent banners

Cookiebot, OneTrust, CookieYes, Complianz, Quantcast, Didomi, Axeptio, Termly, IAB TCF, and generic "Accept" buttons (multi-language: English, Italian, French, German, Spanish).

### Why use consent scanning?

- Cookies **before** consent should only be "necessary"
- Cookies **after** consent can include analytics and marketing
- If analytics/marketing cookies appear before consent, that's a GDPR violation

---

## 7. Batch Scanning Multiple Sites

### From the command line

```bash
cookie-audit site1.com site2.com site3.com -f json -o results.json
```

### From a file

```
# urls.txt
https://example.com
https://shop.example.com
https://blog.example.com
```

```bash
cookie-audit urls.txt -f csv -o audit.csv
```

Lines starting with `#` are comments.

---

## 8. All Options Explained

| Flag | Long form | Description | Default |
|------|-----------|-------------|---------|
| `-f` | `--format` | Output format: `table`, `json`, `csv`, `markdown`, `html` | `table` |
| `-o` | `--output` | Save to file | stdout |
| `-w` | `--wait` | Page load wait time (ms) | `5000` |
| `-t` | `--timeout` | Navigation timeout per page (ms) | `30000` |
| | `--user-agent` | Custom User-Agent string | Chromium default |
| `-c` | `--consent` | Click consent banner, re-scan | Off |
| | `--no-headless` | Show browser window | Hidden |
| `-q` | `--quiet` | Suppress progress messages | Off |
| `-h` | `--help` | Show help | |
| `-v` | `--version` | Show version | |

---

## 9. Using in Code (Programmatic)

```javascript
import { scan, classify, analyze, formatMarkdown, formatHTML } from "@dishine/cookie-audit";

const result = await scan("https://example.com", { waitMs: 5000 });
const classified = classify(result.cookiesBeforeConsent);
const report = analyze(result, classified);

// Output as Markdown
console.log(formatMarkdown(report));

// Output as self-contained HTML
// const fs = await import("fs");
// fs.writeFileSync("report.html", formatHTML(report));

// Access structured data
console.log(report.summary.complianceScore); // "B"
console.log(report.summary.totalCookies);    // 8
console.log(report.summary.issueCount);      // { critical: 0, high: 1, medium: 1, low: 0 }
console.log(report.issues);                  // Array of issues with remediation steps
console.log(report.cookies);                 // Array of classified cookies
```

---

## 10. CI/CD Integration

Exit codes:

| Code | Meaning |
|------|---------|
| `0` | No critical compliance issues |
| `1` | Critical issues found |
| `2` | Scan failed (network error, invalid URL) |

### GitHub Actions

```yaml
- name: Cookie compliance check
  run: |
    npx @dishine/cookie-audit https://staging.example.com -q
```

### Pre-deploy script

```bash
#!/bin/bash
cookie-audit "$STAGING_URL" -q
if [ $? -eq 1 ]; then
  echo "Cookie compliance check FAILED."
  exit 1
fi
echo "Cookie compliance OK."
```

---

## 11. Troubleshooting

### "Chromium not found" or download errors

Puppeteer downloads Chromium on first install. If the download failed (corporate proxy, flaky network, disk full), re-trigger it:

```bash
npx puppeteer browsers install chrome
```

The cache lives at `~/.cache/puppeteer` (macOS/Linux) or `%USERPROFILE%\.cache\puppeteer` (Windows). Delete it to force a clean re-install.

### Apple Silicon (M1/M2/M3/M4) install failures

If `npm install` fails while compiling a native dependency, make sure Command Line Tools are installed:

```bash
xcode-select --install
```

Then retry the install. Puppeteer 24 ships an arm64 Chromium build — no Rosetta required.

### Behind a corporate proxy or firewall

The Chromium download and every scan go out over the network. Export the standard proxy variables before installing:

```bash
export HTTPS_PROXY=http://proxy.company.com:8080
export HTTP_PROXY=http://proxy.company.com:8080
export NO_PROXY=localhost,127.0.0.1
npm install -g @dishine/cookie-audit
```

If your network blocks `storage.googleapis.com` (where Puppeteer hosts the Chromium binary), ask your IT team to allow-list it, or mirror the binary internally and set `PUPPETEER_DOWNLOAD_BASE_URL`.

### "Navigation timeout" error

The website took too long to load. Increase both the timeout and the post-load wait:

```bash
cookie-audit example.com -w 15000 -t 60000
```

### Scan hangs or never finishes

Sites that keep a long-polling connection open (chat widgets, Server-Sent Events, WebSockets for live features) can defeat Puppeteer's `networkidle2` wait. Work around it by capping the timeout:

```bash
cookie-audit example.com -t 20000
```

### Empty cookie list on a site you know uses cookies

Some sites (Cloudflare Bot Management, Akamai Bot Manager, PerimeterX) serve a challenge page to headless browsers. Signs: `cf_clearance` cookie missing, an unusually small HTML response, or a title like "Just a moment…".

Workarounds (in order of preference):
1. Pass a realistic User-Agent: `cookie-audit example.com --user-agent "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36"`
2. Run non-headless so the bot detection may let you through: `cookie-audit example.com --no-headless`
3. Scan a pre-authenticated staging environment instead.

### "Execution context was destroyed" warning

The website redirected during scanning. Results are usually still valid — check the `finalUrl` in the report header.

### No cookies detected at all

Possible causes:
- The site genuinely sets no cookies (static HTML, some privacy-first sites)
- The site requires user interaction before setting cookies — use `-c` to click the consent banner
- The site blocks headless browsers — see the "Empty cookie list" section above

Try visible mode to watch what happens:

```bash
cookie-audit example.com --no-headless -w 10000
```

### Permission denied on global install (macOS / Linux)

Prefer npx over `sudo`:

```bash
npx @dishine/cookie-audit example.com
```

If you really want a global install, configure npm to use a user-owned prefix instead of `sudo` — see [nodejs.org/en/learn/getting-started/how-to-install-nodejs](https://nodejs.org/en/learn/getting-started/how-to-install-nodejs).

### Windows: long-path errors during install

Windows has a 260-character path limit that Puppeteer's nested `node_modules` can exceed. Enable long paths once:

```powershell
New-ItemProperty -Path "HKLM:\SYSTEM\CurrentControlSet\Control\FileSystem" -Name "LongPathsEnabled" -Value 1 -PropertyType DWORD -Force
```

Reboot, then retry the install.

---

## 12. FAQ

**Does this tool visit the website?**
Yes. It opens the site in a real Chromium browser (hidden by default). This is the only way to capture all cookies, including those set by JavaScript.

**How long does a scan take?**
Typical single-URL scan: 7–12 seconds end-to-end. About 5 seconds of that is the `--wait` period to let delayed scripts finish setting cookies. Scans with `-c` (consent interaction) add roughly 3 seconds.

**How much does it cost to run?**
Nothing. The tool runs entirely on your machine — no SaaS, no API keys, no quotas. Chromium uses 200–400 MB of RAM per scan and is released when the scan finishes.

**Is it legal to scan any website?**
Scanning by visiting a website is equivalent to visiting it in a regular browser. This is generally legal, but only scan sites you own or have permission to audit.

**Does it impact the scanned site?**
A scan produces one page load per URL, the same footprint as a visit from a real user. It does not submit forms, click internal links, or follow pagination. On a batch scan of 100 URLs you are generating 100 page views — no more.

**How accurate is the classification?**
The database covers 478 cookies from Google, Meta, LinkedIn, Microsoft, Adobe, and many other platforms. Unknown cookies are classified by heuristic. For production audits, manually review any "unknown" cookies — the tool itself flags them with a `LOW` severity issue precisely so they do not slip through.

**Does it support non-EU compliance?**
The checks are primarily GDPR/ePrivacy, but the same principles apply to CCPA (California), LGPD (Brazil), POPIA (South Africa), and similar laws. Security flags (Secure, HttpOnly, SameSite) are universal best practices.

**Can I add custom cookies to the database?**
Yes. Edit `src/known-cookies.js` and add entries to the `EXACT`, `PREFIXES`, or `DOMAINS` sections. Each `EXACT` or `DOMAINS` entry needs `category`, `provider`, and `description`; prefixes need `prefix` and `category`. See [CONTRIBUTING.md](CONTRIBUTING.md) for details.

**How often should I run audits?**
At minimum: before every site launch, after adding third-party scripts, and quarterly. Marketing teams frequently add new tracking — audits catch compliance gaps early. Wiring the tool into CI (see Section 10) is the lowest-effort way to keep the baseline from drifting.

**Can I run this in CI without the Chromium download every time?**
Yes. Cache `~/.cache/puppeteer` between CI runs. On GitHub Actions:

```yaml
- uses: actions/cache@v4
  with:
    path: ~/.cache/puppeteer
    key: puppeteer-${{ runner.os }}
```

---

*Built by [diShine](https://dishine.it). MIT License.*
