# cookie-audit

**Scan any website. Get a categorized cookie inventory with GDPR compliance flags.**

One command, full picture: which cookies are set, who sets them, whether consent is obtained first, and what needs fixing.

Built by [diShine Digital Agency](https://dishine.it)

---

## What it does

1. Opens the URL in a headless browser (Chromium)
2. Captures every cookie — including those set by JavaScript and third-party scripts
3. Classifies each cookie as **necessary**, **functional**, **analytics**, **marketing**, or **unknown** using a 150+ entry database
4. Checks GDPR/ePrivacy compliance: consent-before-tracking, Secure/HttpOnly flags, SameSite policy, excessive lifetimes, third-party exposure
5. Outputs a graded report (terminal, JSON, CSV, or Markdown)

Optional: click the consent banner, then re-scan to see which cookies are consent-gated vs. always-on.

---

## Quick Start

```bash
# Install globally
npm install -g @dishine/cookie-audit

# Scan a website
cookie-audit example.com

# Save a Markdown report
cookie-audit example.com -f markdown -o report.md

# Scan with consent interaction
cookie-audit example.com -c

# Batch scan from a file
cookie-audit urls.txt -f csv -o audit.csv
```

Or run directly without installing:

```bash
npx @dishine/cookie-audit example.com
```

---

## Output

### Terminal (default)

```
  Cookie Audit Report
  https://example.com — 4 Apr 2026, 14:30

  Compliance Score: C

  Summary
  Total cookies: 14  (8 first-party, 6 third-party)

  necessary    ######              3 (21%)
  functional   ##                  1 (7%)
  analytics    ########            4 (29%)
  marketing    ##########          5 (36%)
  unknown      ##                  1 (7%)

  Consent: cookiebot

   CRITICAL   Non-essential cookies set before user consent
              5 cookies (analytics/marketing) detected on initial page load...

  Cookie Details
  Name                         Category     Provider               Party Secure HttpOnly SameSite Days
  ---
  __cf_bm                      necessary    Cloudflare             1st   Y      Y        Lax      1
  _ga                          analytics    Google Analytics        1st   Y      N        Lax      730
  _fbp                         marketing    Meta (Facebook)        1st   Y      N        Lax      90
  ...
```

### Other formats

| Format | Flag | Use case |
|--------|------|----------|
| `table` | `-f table` (default) | Quick terminal review |
| `json` | `-f json` | Programmatic processing, dashboards |
| `csv` | `-f csv` | Spreadsheet analysis, client handoff |
| `markdown` | `-f markdown` | Reports, documentation, tickets |

---

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-f, --format` | Output format: `table`, `json`, `csv`, `markdown` | `table` |
| `-o, --output` | Save report to file | stdout |
| `-w, --wait` | Wait time (ms) for page to fully load | `5000` |
| `-c, --consent` | Click consent banner, then re-scan | off |
| `--no-headless` | Show the browser window (debugging) | headless |
| `-q, --quiet` | Suppress progress messages | off |

---

## What it checks

### Cookie classification

Each cookie is matched against a built-in database of 150+ known cookies from:

- **Google** (Analytics, Ads, Tag Manager, reCAPTCHA)
- **Meta** (Facebook Pixel, Instagram)
- **LinkedIn** (Insight Tag)
- **Microsoft** (Bing Ads, Clarity)
- **TikTok**, **Twitter/X**, **Pinterest**, **Snapchat**
- **HubSpot**, **Hotjar**, **Mixpanel**, **Segment**, **Amplitude**
- **Shopify**, **WordPress**, **Stripe**
- **Cloudflare**, **Intercom**, **Drift**
- **Consent platforms** (Cookiebot, OneTrust, CookieYes, Complianz, Didomi, IAB TCF)

Unknown cookies are classified by heuristic (name patterns, domain, lifetime).

### Compliance checks

| Check | Severity | What it flags |
|-------|----------|---------------|
| Non-essential cookies before consent | Critical | Analytics/marketing cookies set on page load without user consent |
| No consent mechanism | Critical | Site sets tracking cookies but has no CMP banner |
| Missing Secure flag | High | Cookies that can leak over HTTP |
| Session cookies without HttpOnly | High | Auth/session cookies accessible via JavaScript |
| SameSite=None without Secure | High | Cookies rejected by modern browsers |
| Excessive lifetime (>13 months) | Medium | Violates CNIL/DPA guidelines |
| Third-party cookies | Medium | Cross-site tracking exposure |
| Missing SameSite attribute | Medium | CSRF vulnerability |
| Unclassified cookies | Low | Need manual review for cookie policy |
| Overly broad domain scope | Low | Cookie shared across all subdomains |

### Consent mechanism detection

Automatically detects: Cookiebot, OneTrust, CookieYes, Complianz, Quantcast, Didomi, Axeptio, Termly, IAB TCF, and generic cookie banners.

---

## Batch scanning

Create a text file with one URL per line:

```
# urls.txt
https://example.com
https://shop.example.com
https://blog.example.com
```

```bash
cookie-audit urls.txt -f csv -o full-audit.csv
```

---

## Programmatic usage

```javascript
import { scan, classify, analyze, formatMarkdown } from "@dishine/cookie-audit";

const result = await scan("https://example.com", { waitMs: 5000 });
const classified = classify(result.cookiesBeforeConsent);
const report = analyze(result, classified);

console.log(formatMarkdown(report));
```

---

## Exit codes

| Code | Meaning |
|------|---------|
| `0` | Scan completed, no critical issues |
| `1` | Critical compliance issues detected |
| `2` | Fatal error (scan failed) |

Useful in CI/CD pipelines: `cookie-audit example.com || echo "Cookie compliance failed"`.

---

## Requirements

- **Node.js** 18 or later
- **Chromium** is downloaded automatically by Puppeteer on first install (~300MB)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

Copyright (c) 2026 [diShine Digital Agency](https://dishine.it)
