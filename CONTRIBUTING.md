# Contributing Guide

Thanks for your interest in contributing! This project aims to be a small, well‑typed MCP server for Ditto that’s easy to run and modify.

## Development Setup

- Node.js >= 18.17
- Yarn (preferred)

```bash
yarn
yarn build
node dist/index.js stdio
```

## Project Goals

- Clear, strict TypeScript
- Minimal runtime dependencies
- Excellent developer UX and docs
- Safe defaults (read‑only, allow‑lists, redaction)

## Pull Requests

1. Fork and create a feature branch.
2. Keep edits focused; match existing code style.
3. Update README and CHANGELOG when user‑visible changes occur.
4. Ensure build passes: `yarn build`.

## Commit Messages

Use concise, present‑tense messages:

- feat: add HTTP transport
- fix: handle missing api key
- docs: clarify Cursor setup

## Release Process

- Bump version in `package.json` (semver)
- Update `CHANGELOG.md`
- `yarn build`
- `npm publish` (owners only)

## Security

Please do not open public issues for sensitive security concerns. Email the maintainer to report vulnerabilities.

## Code of Conduct

Be respectful and inclusive. Discrimination or harassment is not tolerated.
