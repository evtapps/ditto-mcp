// src/mcpServer.ts
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod';
import type { ServerConfig } from './config.js';
import { executeDql } from './ditto/client.js';
import type { DittoQueryArgs } from './ditto/types.js';
import { SERVER_VERSION } from './utils/version.js';
import {
  ensureSingleStatement,
  detectOperation,
  assertAllowedOperation,
  GuardError,
  assertAllowPatternsIfAny,
} from './guards/dql.js';
// (no extra imports)

export function createServer(cfg: ServerConfig) {
  const server = new McpServer({
    name: cfg.serverName,
    version: SERVER_VERSION,
  });

  // --- Tools --------------------------------------------------------------

  // Visible connectivity probe (shows up immediately in Cursor)
  server.registerTool(
    'ping',
    {
      title: 'Ping',
      description: 'Health check for the Ditto MCP server',
      inputSchema: {},
    },
    async () => ({ content: [{ type: 'text', text: 'pong' }] }),
  );

  // Main Ditto DQL executor
  const executeInput = {
    statement: z
      .string()
      .min(1)
      .describe("DQL statement to execute (single statement; no trailing ';')"),
    args: z.record(z.unknown()).optional().describe('Named parameters for the DQL'),
    transactionId: z
      .number()
      .int()
      .nonnegative()
      .optional()
      .describe('Optional X-DITTO-TXN-ID for consistency'),
    apiKey: z
      .string()
      .min(1)
      .optional()
      .describe('Ditto API key (prefer env over passing here)'),
    baseUrl: z
      .string()
      .url()
      .optional()
      .describe('Overrides DITTO_BASE_URL for this call'),
    timeoutMs: z
      .number()
      .int()
      .positive()
      .max(60000)
      .optional()
      .describe('Per-call timeout override (ms)'),
  };
  type ExecuteToolInput = {
    statement: string;
    args?: DittoQueryArgs;
    transactionId?: number;
    apiKey?: string;
    baseUrl?: string;
    timeoutMs?: number;
  };

  server.registerTool(
    'execute_dql',
    {
      title: 'Ditto: Execute DQL query',
      description: 'Runs a query in Ditto using a parameterized DQL statement',
      inputSchema: executeInput,
    },
    async ({
      statement,
      args,
      transactionId,
      apiKey,
      baseUrl,
      timeoutMs,
    }: ExecuteToolInput) => {
      // Guard the statement & allowed operations
      const cleaned = ensureSingleStatement(statement);
      const op = detectOperation(cleaned);
      if (op === 'UNKNOWN') {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'Statement must start with SELECT/INSERT/UPDATE/DELETE/EVICT.',
            },
          ],
        };
      }
      try {
        assertAllowedOperation(op, cfg.allowedOps);
        assertAllowPatternsIfAny(cleaned, cfg.queryAllowPatterns);
      } catch (e) {
        const message = e instanceof GuardError ? e.message : String(e);
        return { isError: true, content: [{ type: 'text', text: message }] };
      }

      // Resolve base URL & key
      const url = baseUrl ?? cfg.dittoBaseUrl;
      if (!url) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: 'DITTO_BASE_URL not set. Pass baseUrl or set env DITTO_BASE_URL.',
            },
          ],
        };
      }
      const envKey = process.env[cfg.apiKeyEnvVar];
      const key = apiKey || envKey;
      if (!key) {
        return {
          isError: true,
          content: [
            {
              type: 'text',
              text: `No API key. Set env ${cfg.apiKeyEnvVar} or pass apiKey.`,
            },
          ],
        };
      }

      // Call Ditto
      const res = await executeDql(
        { statement: cleaned, args: args ?? undefined },
        {
          baseUrl: url,
          apiKey: key,
          transactionId,
          timeoutMs: timeoutMs ?? cfg.timeoutMs,
        },
      );

      if (res.error?.description) {
        return {
          isError: true,
          content: [{ type: 'text', text: `Ditto error: ${res.error.description}` }],
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: JSON.stringify(
              {
                transactionId: res.transactionId,
                queryType: res.queryType,
                items: res.items,
                mutatedDocumentIds: res.mutatedDocumentIds,
                warnings: res.warnings,
                totalWarningsCount: res.totalWarningsCount,
              },
              null,
              2,
            ),
          },
        ],
      };
    },
  );

  // --- Resources ----------------------------------------------------------

  server.registerResource(
    'ditto_config',
    'ditto://config',
    {
      title: 'Ditto MCP Config',
      description: 'Current runtime configuration (safe subset)',
      mimeType: 'application/json',
    },
    async (uri) => ({
      contents: [
        {
          uri: uri.href,
          text: JSON.stringify(
            {
              serverName: cfg.serverName,
              dittoBaseUrl: cfg.dittoBaseUrl ?? '(not set; pass baseUrl)',
              allowedOps: [...cfg.allowedOps],
              timeoutMs: cfg.timeoutMs,
              queryAllowPatterns: cfg.queryAllowPatterns.map((rx) => rx.source),
              apiKeyEnvVar: cfg.apiKeyEnvVar,
              transport: cfg.transport,
            },
            null,
            2,
          ),
        },
      ],
    }),
  );

  return server;
}
