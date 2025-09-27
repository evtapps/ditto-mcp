import { logger, setLogLevel } from './utils/logger.js';

export type DqlOp = 'SELECT' | 'INSERT' | 'UPDATE' | 'DELETE' | 'EVICT';
export type Capability = 'READ' | 'WRITE';
export type TransportMode = 'stdio' | 'http';

export type ServerConfig = {
  serverName: string; // MCP server display name
  dittoBaseUrl?: string; // e.g. https://MY_APP.cloud.ditto.live (no trailing /api/v4)
  apiKeyEnvVar: string; // which env var contains the Ditto API key (default DITTO_API_KEY)
  allowedOps: Set<DqlOp>; // which DQL ops this server allows
  timeoutMs: number; // request timeout
  queryAllowPatterns: RegExp[]; // optional allowlist regexes
  transport: TransportMode;
  httpPort: number; // for HTTP mode
};

function parseAllowedOps(input?: string): Set<DqlOp> {
  // Accept high-level READ/WRITE or granular ops
  const norm = (input ?? 'READ').toUpperCase();
  const tokens = norm.split(/[,\s]+/).filter(Boolean);
  const set = new Set<DqlOp>();
  if (tokens.includes('ALL')) {
    ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'EVICT'].forEach((t) => set.add(t as DqlOp));
    return set;
  }
  if (tokens.includes('READ')) set.add('SELECT');
  if (tokens.includes('WRITE'))
    ['INSERT', 'UPDATE', 'DELETE', 'EVICT'].forEach((t) => set.add(t as DqlOp));
  ['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'EVICT'].forEach((op) => {
    if (tokens.includes(op)) set.add(op as DqlOp);
  });
  // default safe baseline
  if (set.size === 0) set.add('SELECT');
  return set;
}

function parseRegexList(input?: string): RegExp[] {
  if (!input) return [];
  return input
    .split(/\s*[,;]\s*/)
    .filter(Boolean)
    .map((s) => new RegExp(s));
}

export function loadConfig(overrides?: Partial<ServerConfig>): ServerConfig {
  // Parse and apply log level from env only if valid
  const envLevel = process.env.LOG_LEVEL;
  if (
    envLevel === 'debug' ||
    envLevel === 'info' ||
    envLevel === 'warn' ||
    envLevel === 'error' ||
    envLevel === 'silent'
  ) {
    setLogLevel(envLevel);
  }

  // Baseline derived from environment with safe defaults
  const base: ServerConfig = {
    serverName: process.env.MCP_SERVER_NAME || 'ditto-mcp',
    dittoBaseUrl: process.env.DITTO_BASE_URL, // expect without /api/v4 suffix
    apiKeyEnvVar: process.env.DITTO_API_KEY_ENV || 'DITTO_API_KEY',
    allowedOps: parseAllowedOps(
      process.env.MCP_DITTO_ALLOWED || process.env.MCP_DITTO_ALLOWED_DQL,
    ),
    timeoutMs: Number(process.env.DITTO_TIMEOUT_MS || 20000),
    queryAllowPatterns: parseRegexList(process.env.MCP_DITTO_QUERY_ALLOW_PATTERNS),
    transport: 'stdio',
    httpPort: Number(process.env.PORT || 3000),
  };

  // Merge only defined override values to avoid clobbering defaults with undefined
  if (overrides) {
    if (overrides.serverName !== undefined) base.serverName = overrides.serverName;
    if (overrides.dittoBaseUrl !== undefined) base.dittoBaseUrl = overrides.dittoBaseUrl;
    if (overrides.apiKeyEnvVar !== undefined) base.apiKeyEnvVar = overrides.apiKeyEnvVar;
    if (overrides.allowedOps !== undefined) base.allowedOps = overrides.allowedOps;
    if (overrides.timeoutMs !== undefined) base.timeoutMs = overrides.timeoutMs;
    if (overrides.queryAllowPatterns !== undefined)
      base.queryAllowPatterns = overrides.queryAllowPatterns;
    if (overrides.transport !== undefined) base.transport = overrides.transport;
    if (overrides.httpPort !== undefined) base.httpPort = overrides.httpPort;
  }

  logger.info(
    `[config] server=${base.serverName} transport=${
      base.transport
    } allowedOps=${[...base.allowedOps].join(',')}`,
  );
  return base;
}
