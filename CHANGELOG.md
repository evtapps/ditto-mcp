# Changelog

All notable changes to this project will be documented in this file.

## 0.1.2 - 2025-09-27

- Rename npm package to `ditto-mcp-server`; CLI bin remains `ditto-mcp`
- Derive server version from package.json with env override `MCP_SERVER_VERSION`
- Add CLI `--version` flag; explicitly reject unsupported `http` transport
- Dynamic User-Agent `ditto-mcp-server/<version>` in Ditto client
- Improve logger redaction (Bearer and Basic auth)
- Typed HTTP error in client (HttpStatusError); better error envelopes
- Docs: document `LOG_LEVEL` and version precedence

## 0.1.2-canary.0 - 2025-09-27

- Derive server version from package.json with env override `MCP_SERVER_VERSION`
- Add CLI `--version` flag; explicitly reject unsupported `http` transport
- Dynamic User-Agent `ditto-mcp/<version>` in Ditto client
- Improve logger redaction (Bearer and Basic auth)
- Typed HTTP error in client (HttpStatusError); better error envelopes
- Docs: document `LOG_LEVEL` and version precedence

## 0.1.1 - 2025-09-22

- Fix config overrides merging so undefined CLI flags don't clobber defaults
- Make tool schemas compatible with MCP SDK (Zod fields passed as shape)
- Improve error handling and typing in `execute_dql`
- Prepare package for npm publishing

## 0.1.0 - 2025-09-21

- Initial release
