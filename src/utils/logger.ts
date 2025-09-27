// src/utils/logger.ts
export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'silent';
const LEVELS: Record<LogLevel, number> = {
  debug: 10,
  info: 20,
  warn: 30,
  error: 40,
  silent: 100,
};
let level: LogLevel = (process.env.LOG_LEVEL as LogLevel) || 'info';

export function setLogLevel(l: LogLevel) {
  level = l;
}

function redact(seen: string) {
  return seen
    .replace(/(Bearer\s+)[A-Za-z0-9_.-]+/gi, '$1***')
    .replace(/(Basic\s+)[A-Za-z0-9+/=]+/gi, '$1***')
    .replace(/("?(?:API|KEY|TOKEN|SECRET)[^"]*"?\s*[:=]\s*")([^"]+)(")/gi, '$1***$3');
}

function write(kind: LogLevel, msg: string) {
  if (LEVELS[kind] < LEVELS[level]) return;
  process.stderr.write(`[${kind}] ${redact(msg)}\n`);
}

export const logger = {
  debug: (...a: unknown[]) => write('debug', a.map(String).join(' ')),
  info: (...a: unknown[]) => write('info', a.map(String).join(' ')),
  warn: (...a: unknown[]) => write('warn', a.map(String).join(' ')),
  error: (...a: unknown[]) => write('error', a.map(String).join(' ')),
};
