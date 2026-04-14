# Contributing to cookie-audit

Thank you for considering a contribution. This document explains how to get started.

## Getting started

1. Fork the repository
2. Clone your fork: `git clone https://github.com/YOUR_USERNAME/cookie-audit.git`
3. Install dependencies: `npm install`
4. Make your changes
5. Run the test suite: `npm test`
6. Test locally: `node bin/cli.js example.com`
7. Commit and push
8. Open a pull request

## What to contribute

### Cookie database

The most valuable contributions are additions to `src/known-cookies.js`. If you encounter a cookie that isn't classified correctly (or at all), add it to the appropriate section:

- **EXACT** — for cookies with a fixed name (e.g., `_ga`, `_fbp`)
- **PREFIXES** — for cookies with a common prefix (e.g., `_ga_*`, `_hj*`)
- **DOMAINS** — for third-party domains (e.g., `doubleclick.net`, `hotjar.com`)

Each entry needs:
- `category` — one of: `necessary`, `functional`, `analytics`, `marketing`
- `provider` — the company or product name
- `description` — a short explanation of what the cookie does
- `maxDays` (optional, EXACT only) — expected maximum lifetime

### Bug fixes

If you find a bug, open an issue first. If you have a fix, include it in a pull request with a clear description of the problem and solution.

### New features

For new features, open an issue to discuss the idea before writing code. This helps avoid duplicate work and ensures the feature fits the project direction.

## Testing

Run the test suite before submitting:

```bash
npm test
```

The test suite (84 tests) covers the classifier, analyzer, all five reporter formats, the known-cookies database, and the public API exports. No test framework is needed — tests run on plain Node.js.

## Code style

- ES6 modules (`import`/`export`)
- No build step — vanilla JavaScript that runs directly in Node.js
- No external dependencies beyond Puppeteer
- Use clear, descriptive variable names
- Keep functions focused and short

## Commit messages

Use clear, imperative commit messages:

- `Add Spotify cookie entries to database`
- `Fix SameSite detection for session cookies`
- `Update README with new cookie count`

## Pull request guidelines

- One logical change per PR
- Update the cookie count in README.md and GUIDE.md if you add database entries
- Add a changelog entry under `[Unreleased]` in CHANGELOG.md
- Run `npm test` and ensure all tests pass
- Test your changes locally before submitting

## Questions?

Open an issue or reach out at kevin@dishine.it.
