# Changelog

All notable changes to this project are documented in this file.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.3.0] — 2026-04-24

### Changed

- **Puppeteer bumped from `^23.0.0` to `^24.15.0`.** The 23.x line was marked unsupported upstream (the install emitted `deprecated puppeteer@23.x: < 24.15.0 is no longer supported`). 24.x ships a newer bundled Chromium and up-to-date CDP bindings.
- **Scanner — `headless` mode**: replaced the legacy `headless: "new"` flag with `headless: true`. In Puppeteer 22+, `true` is the new headless mode. Behaviour is unchanged; the old string form is no longer recommended by upstream.

### Docs

- **GUIDE — Troubleshooting**: added entries for Apple Silicon (ARM) Chromium install failures, corporate proxy/firewall blocking the Chromium download, bot-detection walls (Cloudflare, Akamai) that return empty cookies, and hangs caused by `waitUntil: networkidle2` on sites with long-polling connections.
- **GUIDE — FAQ**: added concrete numbers (typical scan duration, memory footprint, Chromium disk size).
- **README — Requirements**: documented the Chromium cache location (`~/.cache/puppeteer` by default) so users know what to clean up or preserve.
- **SECURITY.md**: added 1.3.x to the supported-versions table.

## [1.2.0] — 2026-04-14

### Added

- **HTML output format** (`-f html`). Generates a self-contained, dark-themed HTML report with compliance grade badge, summary cards, issue cards, cookie inventory table, and third-party domain list. Fully styled with inline CSS — no external dependencies. XSS-safe: all user-controlled values are escaped (including null handling and single quotes).
- **`--timeout` / `-t` flag** to set the navigation timeout per page (default 30 000 ms). Useful for slow-loading sites.
- **`--user-agent` flag** to set a custom User-Agent string for the headless browser.
- **Test suite** (`test/run.js`): 84 tests covering the classifier, analyzer, all five reporter formats (table, JSON, CSV, Markdown, HTML), the known-cookies database integrity, and the public API exports. Runs with plain Node.js — no test framework required. Execute with `npm test`.

### Fixed

- **npm vulnerability**: resolved high-severity CRLF injection in `basic-ftp` (transitive dependency via Puppeteer) by running `npm audit fix`.

### Changed

- Cookie database count updated from "470+" to the exact figure **478** across all documentation.
- README.md: fixed typos in image alt texts ("Cookie Audito" → "Cookie Audit", "exort" → "export").
- GUIDE.md: added HTML format to the options table, saving-reports section, and programmatic API example; added `--timeout` and `--user-agent` to the options table and troubleshooting section.
- CONTRIBUTING.md: added `npm test` step to the getting-started checklist and a dedicated "Testing" section explaining the test suite.
- SECURITY.md: added 1.2.x to the supported-versions table.
- Programmatic API example in README.md and GUIDE.md now includes `formatHTML`.

## [1.1.0] — 2026-04-06

### Added

- **Cookie database expanded from 200 to 470+ entries.** New coverage includes:
  - Analytics: Heap, PostHog, Pendo, FullStory, Snowplow, Mouseflow, Lucky Orange, ContentSquare, AB Tasty, Kameleoon, Unbounce, Umami, Pirsch, Wistia
  - Advertising: Reddit, Quora, Amazon Ads, Spotify, TradeDoubler, Marketo, ShareASale, Impact, Partnerize, Commission Junction, Awin, AddThis, ShareThis
  - Enterprise: Adobe Analytics/Target/Audience Manager/Experience Cloud, Salesforce Pardot, Oracle Eloqua, Baidu, Yandex Metrica
  - E-commerce: WooCommerce, Magento, Klarna, Adyen, Mollie, Braintree
  - Consent platforms: iubenda, Usercentrics, Moove GDPR, Tarteaucitron, Klaro, Borlabs Cookie, Osano, Didomi, Termly, IAB US Privacy/CCPA
  - Chat/Support: Zendesk, LiveChat, Tawk.to, Crisp, Freshworks, Olark, Tidio
  - Infrastructure: Akamai, Fastly, Imperva Incapsula, Sucuri, F5 BIG-IP
  - Auth/Identity: Auth0, Okta, OneLogin, NextAuth.js, Supabase, Vercel, Netlify
  - Monitoring: Datadog RUM, Rollbar, Bugsnag, LogRocket
  - Social: Reddit, x.com, TikTok CDN, Pinterest CDN
  - Feature flags: LaunchDarkly, Split.io, Flagsmith
  - Email marketing: Mailchimp, Brevo/Sendinblue, Klaviyo, ConvertKit, ActiveCampaign
  - Other: Calendly, hCaptcha, Sentry session replay, Google Fonts, SoundCloud, Typeform, JotForm, SurveyMonkey

- **Improved terminal output:**
  - Unicode box-drawing characters for cleaner separators
  - Block-fill bar chart for cookie category breakdown
  - PASS/WARN/FAIL status labels next to compliance grade
  - Issue count summary by severity
  - Word-wrapped issue descriptions for readability
  - Inline remediation tips under each issue
  - Scan duration displayed in CLI output
  - Footer with attribution link

- **Project documentation:**
  - CHANGELOG.md (this file)
  - CONTRIBUTING.md with contribution guidelines
  - SECURITY.md with vulnerability reporting policy
  - CODE_OF_CONDUCT.md
  - GitHub issue templates (bug report, feature request)
  - GitHub pull request template

### Changed

- README.md rewritten: accurate cookie count, clearer structure, added links to new docs
- GUIDE.md updated: fixed incorrect API reference (`report.score` → `report.summary.complianceScore`), updated cookie count, tighter language

### Fixed

- GUIDE.md programmatic API example referenced non-existent `report.score` property — now correctly shows `report.summary.complianceScore`

## [1.0.0] — 2026-04-04

### Added

- Initial release
- Cookie scanning via headless Chromium (Puppeteer)
- Cookie classification with 200-entry database
- 10 GDPR/ePrivacy compliance checks
- Consent mechanism detection (Cookiebot, OneTrust, CookieYes, Complianz, Quantcast, Didomi, Axeptio, Termly, IAB TCF, generic banners)
- Consent banner interaction (`-c` flag)
- 4 output formats: terminal table, JSON, CSV, Markdown
- Batch scanning from file or multiple URLs
- Programmatic API
- CI/CD integration via exit codes
- README.md and GUIDE.md documentation

[1.3.0]: https://github.com/diShine-digital-agency/cookie-audit/compare/v1.2.0...v1.3.0
[1.2.0]: https://github.com/diShine-digital-agency/cookie-audit/compare/v1.1.0...v1.2.0
[1.1.0]: https://github.com/diShine-digital-agency/cookie-audit/compare/v1.0.0...v1.1.0
[1.0.0]: https://github.com/diShine-digital-agency/cookie-audit/releases/tag/v1.0.0
