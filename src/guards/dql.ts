import type { DqlOp } from '../config.js';

export class GuardError extends Error {
  status = 400;
  constructor(message: string, status = 400) {
    super(message);
    this.status = status;
  }
}

/** Remove trailing semicolons and ensure a single statement. */
export function ensureSingleStatement(statement: string): string {
  const cleaned = statement.replace(/;+\s*$/, '').trim();
  if (!cleaned) throw new GuardError('DQL statement cannot be empty');
  if (cleaned.includes(';'))
    throw new GuardError('Multiple DQL statements are not allowed');
  return cleaned;
}

/** Very small lexer: strip block/line comments, then return first token uppercased. */
export function detectOperation(statement: string): DqlOp | 'UNKNOWN' {
  const noBlock = statement.replace(/\/\*[\s\S]*?\*\//g, ' ');
  const noLine = noBlock.replace(/--.*$/gm, ' ').replace(/#[^\n]*$/gm, ' ');
  const firstToken = noLine.trim().split(/\s+/)[0]?.toUpperCase();
  const ops = new Set(['SELECT', 'INSERT', 'UPDATE', 'DELETE', 'EVICT']);
  return firstToken && ops.has(firstToken) ? (firstToken as DqlOp) : 'UNKNOWN';
}

export function assertAllowedOperation(op: DqlOp, allowed: Set<DqlOp>) {
  if (!allowed.has(op)) {
    const allowedList = [...allowed].join(', ');
    throw new GuardError(
      `Operation "${op}" is disabled. Allowed operations: ${allowedList}`,
      403,
    );
  }
}

export function assertAllowPatternsIfAny(statement: string, allowPatterns: RegExp[]) {
  if (allowPatterns.length === 0) return;
  const ok = allowPatterns.some((rx) => rx.test(statement));
  if (!ok) {
    throw new GuardError('Statement does not match any allowed pattern (policy).', 403);
  }
}
