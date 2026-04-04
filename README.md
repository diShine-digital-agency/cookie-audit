# cookie-audit

**Find out exactly which cookies a website sets, who put them there, and whether any of it is GDPR-compliant.**

Most cookie consent setups are broken in ways nobody notices until a regulator does. Analytics cookies firing before consent. Marketing pixels with no opt-out. Session cookies missing basic security flags. This tool opens a site in a headless browser, captures every cookie (including the ones set by JavaScript and third-party scripts), classifies them, and tells you what's wrong.

Built by [diShine](https://dishine.it)

---

## How it works

1. Opens the URL in headless Chromium
2. Captures every cookie -- first-party, third-party, JavaScript-set, all of them
3. Classifies each one as **necessary**, **functional**, **analytics**, **marketing**, or **unknown** using a 150+ entry database of known cookies
4. Checks GDPR/ePrivacy compliance: consent-before-tracking, Secure/HttpOnly flags, SameSite policy, excessive lifetimes, third-party exposure
5. Outputs a graded report (terminal, JSON, CSV, or Markdown)

You can also tell it to click the consent banner first, then re-scan -- that way you see which cookies are consent-gated vs. which ones load regardless.

---

## Quick start

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

Or run it directly without installing:

```bash
npx @dishine/cookie-audit example.com
```

---

## What the output looks like

### Terminal (default)

```
  Cookie Audit Report
  https://example.com -- 4 Apr 2026, 14:30

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

| Format | Flag | When to use it |
|--------|------|----------------|
| `table` | `-f table` (default) | quick terminal review |
| `json` | `-f json` | feeding into dashboards or scripts |
| `csv` | `-f csv` | spreadsheet analysis, handing off to a client |
| `markdown` | `-f markdown` | reports, documentation, Jira/Linear tickets |

---

## Options

| Flag | Description | Default |
|------|-------------|---------|
| `-f, --format` | output format: `table`, `json`, `csv`, `markdown` | `table` |
| `-o, --output` | save report to file | stdout |
| `-w, --wait` | wait time (ms) for the page to fully load | `5000` |
| `-c, --consent` | click consent banner, then re-scan | off |
| `--no-headless` | show the browser window (useful for debugging) | headless |
| `-q, --quiet` | suppress progress messages | off |

---

## What it actually checks

### Cookie classification

Each cookie is matched against a built-in database of 150+ known cookies. The database covers:

- **Google** (Analytics, Ads, Tag Manager, reCAPTCHA)
- **Meta** (Facebook Pixel, Instagram)
- **LinkedIn** (Insight Tag)
- **Microsoft** (Bing Ads, Clarity)
- **TikTok**, **Twitter/X**, **Pinterest**, **Snapchat**
- **HubSpot**, **Hotjar**, **Mixpanel**, **Segment**, **Amplitude**
- **Shopify**, **WordPress**, **Stripe**
- **Cloudflare**, **Intercom**, **Drift**
- **Consent platforms** (Cookiebot, OneTrust, CookieYes, Complianz, Didomi, IAB TCF)

Cookies that don't match the database get classified by heuristic -- name patterns, domain, lifetime.

### Compliance checks

| Check | Severity | What it flags |
|-------|----------|---------------|
| Non-essential cookies before consent | critical | analytics/marketing cookies set on page load without user consent |
| No consent mechanism | critical | site sets tracking cookies but has no CMP banner at all |
| Missing Secure flag | high | cookies that can leak over HTTP |
| Session cookies without HttpOnly | high | auth/session cookies accessible via JavaScript (XSS risk) |
| SameSite=None without Secure | high | cookies rejected by modern browsers |
| Excessive lifetime (>13 months) | medium | violates CNIL/DPA guidelines |
| Third-party cookies | medium | cross-site tracking exposure |
| Missing SameSite attribute | medium | CSRF vulnerability |
| Unclassified cookies | low | need manual review for cookie policy |
| Overly broad domain scope | low | cookie shared across all subdomains unnecessarily |

### Consent mechanism detection

It automatically detects Cookiebot, OneTrust, CookieYes, Complianz, Quantcast, Didomi, Axeptio, Termly, IAB TCF, and generic cookie banners.

---

## Batch scanning

If you need to audit multiple URLs at once (e.g., a client's main site plus subdomains), create a text file with one URL per line:

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
| `0` | scan completed, no critical issues |
| `1` | critical compliance issues detected |
| `2` | fatal error (scan failed) |

These are useful in CI/CD pipelines: `cookie-audit example.com || echo "Cookie compliance failed"`.

---

## Requirements

- **Node.js** 18 or later
- **Chromium** is downloaded automatically by Puppeteer on first install (~300MB)

---

## License

MIT License -- see [LICENSE](LICENSE) for details.

Copyright (c) 2026 [diShine](https://dishine.it)
