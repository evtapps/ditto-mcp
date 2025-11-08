<div align="center">

# Ditto MCP Server — Secure DQL for Ditto

[![NPM Version](https://img.shields.io/npm/v/ditto-mcp-server?color=red)](https://www.npmjs.com/package/ditto-mcp-server)
[![MIT licensed](https://img.shields.io/badge/license-MIT-blue.svg)](./LICENSE)
[![Node >=18](https://img.shields.io/badge/node-%3E%3D18.17-brightgreen.svg)]()

[![Install in Cursor](https://cursor.com/deeplink/mcp-install-dark.svg)](https://cursor.com/en/install-mcp?name=ditto&config=eyJjb21tYW5kIjoibnB4IiwiYXJncyI6WyIteSIsIm1jcC1kaXR0by1zZXJ2ZXJAbGF0ZXN0Il0sImVudiI6eyJESVRUT19CQVNFX1VSTCI6Imh0dHBzOi8vWU9VUl9ESVRUT19BUFAuY2xvdWQuZGl0dG8ubGl2ZSIsIkRJVFRPX0FQSV9LRVkiOiJZT1VSX0FQSV9LRVkiLCJNQ1BfRElUVE9fQUxMT1dFRCI6IlJFQUQifX0%3D)

</div>

## 📚 Table of Contents

- [Ditto MCP Server — Secure DQL for Ditto](#ditto-mcp-server--secure-dql-for-ditto)
  - [📚 Table of Contents](#-table-of-contents)
  - [Overview](#overview)
    - [Features](#features)
  - [Requirements](#requirements)
  - [Quick Start (Local)](#quick-start-local)
  - [Install in Clients](#install-in-clients)
    - [Cursor](#cursor)
    - [Claude Code CLI](#claude-code-cli)
    - [VS Code Copilot Chat (Insiders)](#vs-code-copilot-chat-insiders)
    - [Windsurf](#windsurf)
    - [Zed](#zed)
    - [Roo Code / Cline](#roo-code--cline)
    - [JetBrains AI Assistant](#jetbrains-ai-assistant)
    - [LM Studio](#lm-studio)
    - [Warp](#warp)
    - [Amazon Q Developer CLI](#amazon-q-developer-cli)
    - [Gemini CLI](#gemini-cli)
  - [Tools \& Resources](#tools--resources)
    - [Example: SELECT with named args](#example-select-with-named-args)
  - [Configuration](#configuration)
    - [MCP Client One‑click Patterns](#mcp-client-oneclick-patterns)
  - [Security Notes](#security-notes)
  - [Development](#development)
    - [Test with MCP Inspector](#test-with-mcp-inspector)
    - [Alternative Runtimes](#alternative-runtimes)
    - [Docker](#docker)
  - [Troubleshooting](#troubleshooting)
  - [Versioning \& Changelog](#versioning--changelog)
  - [License](#license)

## Overview

An open‑source Model Context Protocol server that executes Ditto DQL over HTTPS with capability gating and safety checks. Designed for Cursor, Claude Code, VS Code Copilot Chat (MCP), Windsurf, Zed, and more.

<a href="https://glama.ai/mcp/servers/@evtapps/ditto-mcp">
  <img width="380" height="200" src="https://glama.ai/mcp/servers/@evtapps/ditto-mcp/badge" alt="Ditto Server MCP server" />
</a>

### Features

- Ping health tool, `execute_dql` tool, and `ditto://config` resource
- Statement guardrails: single statement, operation allow‑list, optional query pattern allow‑list
- Config via env, CLI, or client config
- Native ESM, strict TypeScript, zero runtime deps beyond MCP SDK

## Requirements

- Node.js >= 18.17
- A Ditto app base URL, e.g. `https://MY_APP.cloud.ditto.live`
- A Ditto API key with access to that app

## Quick Start (Local)

```bash
npx -y ditto-mcp-server@latest
```

Defaults to stdio transport. Provide env vars (recommended):

```bash
export DITTO_BASE_URL="https://MY_APP.cloud.ditto.live"
export DITTO_API_KEY="YOUR_API_KEY"
export MCP_DITTO_ALLOWED="READ"   # or ALL / SELECT,INSERT,...

npx -y ditto-mcp-server@latest
```

## Install in Clients

Below are minimal JSON snippets. See each client's docs for full syntax and options.

### Cursor

Add to `~/.cursor/mcp.json` or project `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "ditto": {
      "command": "npx",
      "args": ["-y", "ditto-mcp-server@latest"],
      "env": {
        "DITTO_BASE_URL": "https://MY_APP.cloud.ditto.live",
        "DITTO_API_KEY": "YOUR_API_KEY",
        "MCP_DITTO_ALLOWED": "READ"
      }
    }
  }
}
```

### Claude Code CLI

```bash
claude mcp add ditto -- npx -y ditto-mcp-server --timeout 20000
```

### VS Code Copilot Chat (Insiders)

```json
{
  "mcp": {
    "servers": {
      "ditto": {
        "type": "stdio",
        "command": "npx",
        "args": ["-y", "ditto-mcp-server"],
        "env": {
          "DITTO_BASE_URL": "https://MY_APP.cloud.ditto.live",
          "DITTO_API_KEY": "YOUR_API_KEY"
        }
      }
    }
  }
}
```

### Windsurf

Add to Windsurf MCP config (see their docs for exact path):

```json
{
  "mcpServers": {
    "ditto": {
      "command": "npx",
      "args": ["-y", "ditto-mcp-server"],
      "env": {
        "DITTO_BASE_URL": "https://MY_APP.cloud.ditto.live",
        "DITTO_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### Zed

Add to `~/.config/zed/settings.json`:

```json
{
  "context_servers": {
    "Ditto": {
      "command": {
        "path": "npx",
        "args": ["-y", "ditto-mcp-server"]
      }
    }
  }
}
```

### Roo Code / Cline

Add in settings under MCP servers or marketplace manual JSON:

```json
{
  "mcpServers": {
    "ditto": {
      "command": "npx",
      "args": ["-y", "ditto-mcp-server"],
      "env": {
        "DITTO_BASE_URL": "https://MY_APP.cloud.ditto.live",
        "DITTO_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### JetBrains AI Assistant

Settings → Tools → AI Assistant → MCP → Add → As JSON:

```json
{
  "mcpServers": {
    "ditto": {
      "command": "npx",
      "args": ["-y", "ditto-mcp-server"],
      "env": {
        "DITTO_BASE_URL": "https://MY_APP.cloud.ditto.live",
        "DITTO_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### LM Studio

Program → Install → Edit mcp.json:

```json
{
  "mcpServers": {
    "Ditto": {
      "command": "npx",
      "args": ["-y", "ditto-mcp-server"],
      "env": {
        "DITTO_BASE_URL": "https://MY_APP.cloud.ditto.live",
        "DITTO_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

### Warp

Settings → AI → Manage MCP servers:

```json
{
  "Ditto": {
    "command": "npx",
    "args": ["-y", "ditto-mcp-server"],
    "start_on_launch": true
  }
}
```

### Amazon Q Developer CLI

`~/.aws/q/developer/cli/config.json`:

```json
{
  "mcpServers": {
    "ditto": {
      "command": "npx",
      "args": ["-y", "ditto-mcp-server"]
    }
  }
}
```

### Gemini CLI

`~/.gemini/settings.json`:

```json
{
  "mcpServers": {
    "ditto": {
      "command": "npx",
      "args": ["-y", "ditto-mcp-server"]
    }
  }
}
```

## Tools & Resources

- `ping` – returns `pong` for connectivity check
- `execute_dql` – run a parameterized DQL against Ditto
  - `statement` (string, required) – single statement, no trailing `;`
  - `args` (object, optional) – named parameters
  - `transactionId` (number, optional) – X‑DITTO‑TXN‑ID
  - `apiKey` (string, optional) – override key; prefer env
  - `baseUrl` (string, optional) – override base URL
  - `timeoutMs` (number, optional, <= 60000)
- Resource: `ditto://config` – redacted runtime config

### Example: SELECT with named args

```txt
Tool: execute_dql
Args:
{
  "statement": "SELECT * FROM collection WHERE type = :t LIMIT 5",
  "args": { "t": "note" }
}
```

Returns a JSON envelope with `items`, `queryType`, `warnings`, and optional `error`.

## Configuration

You can configure via env, CLI, or client configs. Env is preferred for secrets.

Environment variables:

- `DITTO_BASE_URL` – e.g. `https://MY_APP.cloud.ditto.live`
- `DITTO_API_KEY` – Ditto API key
- `MCP_DITTO_ALLOWED` – `READ`, `ALL`, or a comma list like `SELECT,INSERT`
- `MCP_DITTO_QUERY_ALLOW_PATTERNS` – comma/semicolon‑separated regex allow‑list
- `DITTO_TIMEOUT_MS` – default per‑call timeout (ms)
- `DITTO_API_KEY_ENV` – env var name to read API key from (default `DITTO_API_KEY`)
- `MCP_SERVER_NAME` – server display name
- `MCP_SERVER_VERSION` – overrides the reported server version (default: package.json version; fallback: `0.0.0-dev`)
 - `LOG_LEVEL` – controls logging verbosity: `debug|info|warn|error|silent` (default: `info`)

Configuration precedence: CLI flags > environment variables. Reported version precedence: `MCP_SERVER_VERSION` > `package.json` > `0.0.0-dev`.

CLI flags (subset):

```bash
ditto-mcp [transport] \
  --name <name> \
  --base-url <url> \
  --api-key-env <VAR> \
  --timeout <ms>
```

Transport argument defaults to `stdio`. This package currently exposes stdio only.

### MCP Client One‑click Patterns

- Cursor deeplink button above for instant install into `~/.cursor/mcp.json`.

## Security Notes

- Prefer environment variables for secrets; avoid CLI args containing secrets
- Allowed operation gating and optional regex allow‑list help constrain queries
- Logs redact tokens and obvious secret patterns

## Development

```bash
yarn
yarn build
node dist/index.js stdio
```

Linting is TypeScript‑strict by design. The `prepack` script builds automatically before `npm publish`.

### Test with MCP Inspector

```bash
npx -y @modelcontextprotocol/inspector npx ditto-mcp-server
```

### Alternative Runtimes

```bash
bunx -y ditto-mcp-server
```

Windows PowerShell example:

```powershell
cmd /c npx -y ditto-mcp-server
```

### Docker

Build the image:

```bash
docker build -t ditto-mcp .
```

Run with env vars:

```bash
docker run --rm -i \
  -e DITTO_BASE_URL="https://MY_APP.cloud.ditto.live" \
  -e DITTO_API_KEY="YOUR_API_KEY" \
  ditto-mcp
```

You can also configure Docker as a local MCP command in clients that support running a container for stdio transport. Example:

```json
{
  "mcpServers": {
    "ditto": {
      "command": "docker",
      "args": [
        "run",
        "--rm",
        "-i",
        "-e",
        "DITTO_BASE_URL",
        "-e",
        "DITTO_API_KEY",
        "ditto-mcp"
      ],
      "env": {
        "DITTO_BASE_URL": "https://MY_APP.cloud.ditto.live",
        "DITTO_API_KEY": "YOUR_API_KEY"
      }
    }
  }
}
```

## Troubleshooting

- If tools don't appear, refresh/toggle the server in your client
- Ensure `DITTO_BASE_URL` and `DITTO_API_KEY` are set
- In Windows, provide full `node` and `dist/index.js` paths if needed

If your client has trouble auto-installing via npx, try `bunx -y ditto-mcp-server`.

## Versioning & Changelog

See [CHANGELOG.md](./CHANGELOG.md).

## License

MIT © EVT Engineering and contributors

---

This project is not affiliated with Ditto. "Ditto" is a respective trademark of its owner.