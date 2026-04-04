# cookie-audit — User Guide

**A step-by-step guide to scanning websites for cookies and GDPR compliance.**

You don't need to be a developer to use cookie-audit. This guide walks you through everything.

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
- **What needs fixing** — specific issues with severity levels and what to change

### Why does this matter?

Under GDPR (Europe), ePrivacy Directive, and similar laws worldwide, websites must:
- Get user **consent before** setting non-essential cookies
- Inform users **which cookies** are used and **why**
- Provide a way to **accept or reject** cookies

Violating these rules can result in fines up to 4% of annual revenue or €20 million.

cookie-audit automates the compliance check that would otherwise take hours of manual inspection.

---

## 2. Installation

### What you need

- **Node.js 18 or later** installed on your computer
  - Check: open a terminal and run `node --version`
  - If not installed: download from [nodejs.org](https://nodejs.org) (choose the LTS version)

### Install cookie-audit

Open your terminal (Terminal on macOS, PowerShell or Command Prompt on Windows) and run:

```bash
npm install -g @dishine/cookie-audit
```

This installs cookie-audit globally so you can use it from anywhere.

> **First run note:** The first time you run the tool, it will download Chromium (~300 MB). This is the browser engine used to scan websites. It only happens once.

### Alternative: Run without installing

If you don't want to install it permanently:

```bash
npx @dishine/cookie-audit example.com
```

This downloads and runs it in one step.

---

## 3. Your First Scan

### Basic scan

```bash
cookie-audit example.com
```

That's it. The tool will:
1. Open the website in a hidden browser (headless Chromium)
2. Wait for the page to fully load (5 seconds by default)
3. Capture every cookie set by the page
4. Classify each cookie using a built-in database of 150+ known cookies
5. Check for GDPR compliance issues
6. Print the report in your terminal

### What you'll see

```
  Cookie Audit Report
  https://example.com — 4 Apr 2026, 14:30

  Compliance Score: B

  Summary
  Total cookies: 8  (5 first-party, 3 third-party)

  necessary    ######              3 (38%)
  analytics    ########            4 (50%)
  marketing    ##                  1 (13%)

  Consent: OneTrust detected

  Issues (2)
    HIGH     Non-essential cookies set before user consent
             3 analytics cookies detected on initial page load
             without user interaction...
    MEDIUM   Missing HttpOnly flag on session cookie
             The cookie "session_id" is accessible via JavaScript...

  Cookie Details
  Name             Category     Provider            Party  Secure HttpOnly SameSite  Days
  ─────────────────────────────────────────────────────────────────────────────────────────
  __cf_bm          necessary    Cloudflare          1st    Y      Y        None      1
  _ga              analytics    Google Analytics     1st    Y      N        Lax       730
  _gid             analytics    Google Analytics     1st    Y      N        Lax       1
  ...
```

---

## 4. Understanding the Report

### Compliance Score

The overall grade from **A** (excellent) to **F** (serious issues):

| Grade | What it means |
|-------|--------------|
| **A** | No compliance issues detected |
| **B** | Minor issues only (low severity) |
| **C** | Some medium-severity issues to address |
| **D** | High-severity issues present |
| **F** | Critical compliance violations |

### Cookie Categories

| Category | Color | What it means |
|----------|-------|---------------|
| **Necessary** | Green | Essential for the site to function (login sessions, security tokens, load balancing). Exempt from consent. |
| **Functional** | Blue | Enhance user experience (language preferences, UI settings). Usually require consent. |
| **Analytics** | Yellow | Track user behavior (Google Analytics, Hotjar, Mixpanel). Require consent. |
| **Marketing** | Red | Used for advertising and retargeting (Facebook Pixel, Google Ads, LinkedIn). Require consent. |
| **Unknown** | Gray | Not in the known database. Need manual review — could be anything. |

### Issue Severity Levels

| Severity | What it means | Action needed |
|----------|--------------|---------------|
| **CRITICAL** | Likely violates GDPR. Could result in fines. | Fix immediately |
| **HIGH** | Significant security or compliance risk. | Fix before next release |
| **MEDIUM** | Best practice violation. May cause issues. | Plan to fix soon |
| **LOW** | Minor improvement opportunity. | Fix when convenient |

### Common Issues Explained

**"Non-essential cookies set before consent"** (Critical)
- Analytics or marketing cookies are loaded when the page opens, before the user clicks "Accept" on the cookie banner
- This is the most common GDPR violation
- Fix: Configure your tag manager to fire analytics/marketing tags only after consent is given

**"No consent mechanism detected"** (Critical)
- The site sets tracking cookies but has no cookie banner
- Fix: Install a Consent Management Platform (Cookiebot, OneTrust, CookieYes, etc.)

**"Missing Secure flag"** (High)
- A cookie can be sent over unencrypted HTTP connections
- Fix: Add the `Secure` attribute to the cookie

**"Missing HttpOnly flag on session cookie"** (High)
- A session cookie can be accessed by JavaScript, making it vulnerable to XSS attacks
- Fix: Add the `HttpOnly` attribute to the cookie

**"Excessive cookie lifetime"** (Medium)
- A cookie lasts more than 13 months, which exceeds CNIL/DPA guidelines
- Fix: Reduce the `max-age` or `expires` to 13 months or less

---

## 5. Saving Reports

### Save to a file

```bash
# Save as Markdown (great for client reports)
cookie-audit example.com -f markdown -o report.md

# Save as JSON (for processing in other tools)
cookie-audit example.com -f json -o audit.json

# Save as CSV (for spreadsheets)
cookie-audit example.com -f csv -o cookies.csv
```

### Output format comparison

| Format | Best for | Opens with |
|--------|----------|------------|
| **table** (default) | Quick review in terminal | Terminal only |
| **markdown** | Client reports, documentation | Any text editor, Notion, GitHub |
| **json** | Processing in dashboards or scripts | Code editors, jq |
| **csv** | Spreadsheet analysis, client handoff | Excel, Google Sheets |

### Example: Creating a client-ready report

```bash
cookie-audit clientsite.com -f markdown -o "ClientName - Cookie Audit - 2026-04-04.md"
```

Then open the `.md` file, copy-paste into Google Docs or Word, add your agency branding, and send to the client.

---

## 6. Scanning with Consent Interaction

The `-c` (consent) flag tells cookie-audit to:

1. **First:** Scan the page as-is (before any user interaction) — records which cookies are loaded immediately
2. **Then:** Click the consent/accept button on the cookie banner
3. **Finally:** Re-scan to see which additional cookies appear after consent

This shows you exactly which cookies are **consent-gated** vs. **always-on**.

```bash
cookie-audit example.com -c
```

### What consent banners does it recognize?

cookie-audit can automatically click "Accept" buttons from:

- Cookiebot
- OneTrust
- CookieYes
- Complianz
- Quantcast Choice
- Didomi
- Axeptio
- Termly
- IAB TCF-compliant banners
- Generic "Accept" / "Accept all" buttons

### Why use consent scanning?

Without `-c`, you only see cookies set on initial page load. With `-c`, you get the full picture:
- Cookies **before** consent = should only be "necessary" cookies
- Cookies **after** consent = can include analytics and marketing

If analytics/marketing cookies appear **before** consent, that's a GDPR violation.

---

## 7. Batch Scanning Multiple Sites

### Scan multiple URLs from the command line

```bash
cookie-audit site1.com site2.com site3.com -f json -o all-results.json
```

### Scan from a file

Create a text file with one URL per line:

```
# urls.txt
https://example.com
https://shop.example.com
https://blog.example.com
https://landing.example.com
```

Then run:

```bash
cookie-audit urls.txt -f csv -o full-audit.csv
```

Lines starting with `#` are treated as comments and ignored.

### Batch scan use cases

- **Multi-domain audit:** Scan all domains belonging to a single client
- **Pre-launch checklist:** Scan staging, production, and all subdomains
- **Competitor analysis:** Compare cookie practices across competitors
- **Agency portfolio review:** Monthly compliance check across all client sites

---

## 8. All Options Explained

| Flag | Long form | What it does | Default |
|------|-----------|-------------|---------|
| `-f` | `--format` | Output format: `table`, `json`, `csv`, `markdown` | `table` |
| `-o` | `--output` | Save to a file (e.g., `-o report.md`) | Print to screen |
| `-w` | `--wait` | How long to wait for the page to load (milliseconds) | `5000` (5 sec) |
| `-c` | `--consent` | Click the consent banner and re-scan | Off |
| | `--no-headless` | Show the browser window (useful for debugging) | Hidden |
| `-q` | `--quiet` | Don't show progress messages | Off |
| `-h` | `--help` | Show help text | |
| `-v` | `--version` | Show version number | |

### Examples

```bash
# Basic scan
cookie-audit example.com

# Save as Markdown
cookie-audit example.com -f markdown -o report.md

# Scan with consent, longer wait for slow sites
cookie-audit example.com -c -w 10000

# Quiet mode (only show the report, no progress messages)
cookie-audit example.com -q

# Debug mode (watch the browser)
cookie-audit example.com --no-headless

# Batch scan, CSV output
cookie-audit urls.txt -f csv -o audit.csv
```

---

## 9. Using in Code (Programmatic)

If you're building your own tools or dashboards, you can use cookie-audit as a library:

```javascript
import { scan, classify, analyze, formatMarkdown } from "@dishine/cookie-audit";

// Scan a website
const result = await scan("https://example.com", { waitMs: 5000 });

// Classify the cookies
const classified = classify(result.cookiesBeforeConsent);

// Analyze compliance
const report = analyze(result, classified);

// Output as Markdown
console.log(formatMarkdown(report));

// Or access raw data
console.log(report.score);        // "B"
console.log(report.issues);       // Array of issues
console.log(report.cookies);      // Array of classified cookies
```

---

## 10. CI/CD Integration

cookie-audit returns different exit codes based on the scan result:

| Exit code | Meaning |
|-----------|---------|
| `0` | No critical compliance issues |
| `1` | Critical issues found |
| `2` | Scan failed (network error, invalid URL) |

### Example: GitHub Actions

```yaml
- name: Cookie compliance check
  run: |
    npx @dishine/cookie-audit https://staging.example.com -q
    # Fails the build if critical issues are found (exit code 1)
```

### Example: Pre-deploy script

```bash
#!/bin/bash
cookie-audit "$STAGING_URL" -q
if [ $? -eq 1 ]; then
  echo "Cookie compliance check FAILED. Fix issues before deploying."
  exit 1
fi
echo "Cookie compliance OK."
```

---

## 11. Troubleshooting

### "Chromium not found" or download errors

**Cause:** Puppeteer couldn't download Chromium.
**Fix:** Run the following to trigger the download manually:
```bash
npx puppeteer browsers install chrome
```

### "Navigation timeout" error

**Cause:** The website took too long to load (default: 30 seconds).
**Fix:** Try with a longer wait time:
```bash
cookie-audit example.com -w 15000
```

### "Execution context was destroyed" warning

**Cause:** The website redirected aggressively during scanning.
**This is not a bug** — the scan still captures cookies before the redirect. Results are usually valid.

### No cookies detected

**Possible causes:**
- The site genuinely sets no cookies (rare but possible)
- The site requires user interaction before setting cookies
- The site blocks headless browsers

**Fix:** Try with `--no-headless` to see what's happening:
```bash
cookie-audit example.com --no-headless
```

### "Permission denied" on macOS

**Fix:**
```bash
sudo npm install -g @dishine/cookie-audit
```

Or use `npx` instead (no global install needed):
```bash
npx @dishine/cookie-audit example.com
```

---

## 12. FAQ

**Q: Does this tool actually visit the website?**
A: Yes. It opens the site in a real Chromium browser (hidden by default). This is the only way to capture all cookies, including those set by JavaScript and third-party scripts.

**Q: Is it legal to scan any website?**
A: Scanning a website by visiting it (as cookie-audit does) is equivalent to visiting it in a regular browser. This is generally legal. However, don't use it to scan sites you don't own or have permission to audit in jurisdictions where this may be restricted.

**Q: How accurate is the cookie classification?**
A: The built-in database covers 150+ of the most common cookies from Google, Meta, LinkedIn, Microsoft, and many other platforms. Unknown cookies are classified by heuristic (name patterns, domain, lifetime). For a production audit, manually review any "unknown" cookies.

**Q: Does it check for cookie consent compliance in non-EU countries?**
A: The checks are primarily based on GDPR and ePrivacy Directive (EU). However, many of the same principles apply to CCPA (California), LGPD (Brazil), POPIA (South Africa), and similar laws. The security flags (Secure, HttpOnly, SameSite) are universal best practices.

**Q: Can I add custom cookies to the database?**
A: Yes. Edit `src/known-cookies.js` and add entries to the appropriate section (EXACT, PREFIX, or DOMAIN). Each entry needs a name/pattern, category, and provider.

**Q: How often should I run cookie audits?**
A: At minimum: before every major site launch, after adding new third-party scripts, and quarterly as a routine check. Marketing teams frequently add new pixels and tracking — these audits catch compliance gaps before they become legal issues.

---

*Built by [diShine Digital Agency](https://dishine.it). MIT License.*
