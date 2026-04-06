# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.1.0] - 2026-04-06

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

## [1.0.0] - 2026-04-04

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
