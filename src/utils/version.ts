import { createRequire } from 'module';
import { z } from 'zod';

const requireFromHere = createRequire(import.meta.url);

function resolveVersion(): string {
  const envVersion = process.env.MCP_SERVER_VERSION;
  if (typeof envVersion === 'string' && envVersion.length > 0) {
    return envVersion;
  }
  try {
    const pkgJson = requireFromHere('../../package.json');
    const parsed = z.object({ version: z.string().min(1) }).parse(pkgJson);
    return parsed.version;
  } catch {
    return '0.0.0-dev';
  }
}

export const SERVER_VERSION = resolveVersion();
