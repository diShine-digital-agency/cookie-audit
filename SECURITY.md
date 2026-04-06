# Security Policy

## Reporting a vulnerability

If you discover a security vulnerability in cookie-audit, please report it responsibly.

**Do not open a public issue.**

Instead, email **hello@dishine.it** with:

- A description of the vulnerability
- Steps to reproduce
- Potential impact
- Suggested fix (if any)

We will acknowledge receipt within 48 hours and aim to release a fix within 7 days for critical issues.

## Scope

cookie-audit is a CLI tool that runs locally. It does not collect, transmit, or store any data from scanned websites. The tool:

- Opens websites in a local headless browser
- Reads cookie data from the browser's cookie store
- Outputs reports to stdout or local files

Security concerns most relevant to this project:

- Dependencies (Puppeteer and its Chromium download)
- Cookie data handling in memory
- File output (ensuring no injection in CSV/Markdown output)

## Supported versions

| Version | Supported |
|---------|-----------|
| 1.1.x   | Yes       |
| < 1.1   | No        |
