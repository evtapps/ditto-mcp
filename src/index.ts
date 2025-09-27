#!/usr/bin/env node
import { Command } from 'commander';
import { loadConfig, type ServerConfig } from './config.js';
import { createServer } from './mcpServer.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { logger } from './utils/logger.js';
import { SERVER_VERSION } from './utils/version.js';

function errorToString(err: unknown): string {
  if (err instanceof Error) return err.stack || err.message;
  if (typeof err === 'object' && err !== null) {
    const maybe = err as { stack?: unknown; message?: unknown };
    if (typeof maybe.stack === 'string') return maybe.stack;
    if (typeof maybe.message === 'string') return maybe.message;
  }
  return String(err);
}

process.on('unhandledRejection', (e: unknown) =>
  logger.error('unhandledRejection', errorToString(e)),
);
process.on('uncaughtException', (e: unknown) => {
  logger.error('uncaughtException', errorToString(e));
  process.exit(1);
});

const program = new Command();
program
  .name('ditto-mcp')
  .description('MCP server for Ditto /store/execute with capability gating')
  .argument('[transport]', 'stdio | http', 'stdio')
  .version(SERVER_VERSION)
  .option('--name <name>', 'Server name', process.env.MCP_SERVER_NAME)
  .option(
    '--base-url <url>',
    'Ditto base URL (https://APP.cloud.ditto.live)',
    process.env.DITTO_BASE_URL,
  )
  .option(
    '--api-key-env <var>',
    'Env var containing Ditto API key',
    process.env.DITTO_API_KEY_ENV || 'DITTO_API_KEY',
  )
  .option('--timeout <ms>', 'Request timeout ms', process.env.DITTO_TIMEOUT_MS || '20000')
  .action(async (transport) => {
    if (transport === 'http') {
      logger.error('[mcp] http transport is not supported in this build');
      process.exit(2);
    }
    const cfg: ServerConfig = loadConfig({
      serverName: program.opts().name,
      dittoBaseUrl: program.opts().baseUrl,
      apiKeyEnvVar: program.opts().apiKeyEnv,
      timeoutMs: Number(program.opts().timeout),
      transport: transport === 'http' ? 'http' : 'stdio',
    });

    const server = createServer(cfg);
    const stdio = new StdioServerTransport();

    // Graceful shutdown
    const shutdown = async () => {
      try {
        logger.info('[mcp] shutting down');
        await stdio.close?.();
        process.exit(0);
      } catch (e) {
        logger.error('[mcp] error during shutdown', String(e));
        process.exit(1);
      }
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);

    await server.connect(stdio);
    logger.info('[mcp] ditto-mcp running on stdio');
  });

program.parseAsync(process.argv).catch((e) => {
  // last resort: log to stderr
  process.stderr.write(`[fatal] ${String(e)}\n`);
  process.exit(1);
});
