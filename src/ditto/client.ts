import type { DittoResponse, ExecuteOptions, ExecuteRequest } from './types.js';
import { logger } from '../utils/logger.js';
import { SERVER_VERSION } from '../utils/version.js';

function normalizeBaseUrl(url: string): string {
  return url.replace(/\/+$/, '');
}

function buildUrl(baseUrl: string): string {
  // The Ditto HTTP API base is {base}/api/v4
  return `${normalizeBaseUrl(baseUrl)}/api/v4/store/execute`;
}

/**
 * Execute DQL against Ditto using the /store/execute endpoint.
 * Authentication: Authorization: Bearer <API_KEY>
 * Optional consistency header: X-DITTO-TXN-ID
 *
 * Error model follows the reference docs you provided.
 */
export async function executeDql(
  req: ExecuteRequest,
  opts: ExecuteOptions,
): Promise<DittoResponse> {
  const url = buildUrl(opts.baseUrl);
  const controller = new AbortController();
  const timeoutMs = opts.timeoutMs ?? 20000;
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const headers: Record<string, string> = {
      Authorization: `Bearer ${opts.apiKey}`,
      'Content-Type': 'application/json',
      'User-Agent': `ditto-mcp-server/${SERVER_VERSION}`,
    };
    if (opts.transactionId !== undefined) {
      headers['X-DITTO-TXN-ID'] = String(opts.transactionId);
    }

    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: JSON.stringify(req),
      signal: controller.signal,
    });

    const text = await res.text();
    let json: DittoResponse | undefined;

    try {
      json = text ? (JSON.parse(text) as DittoResponse) : undefined;
    } catch {
      // Fallback plain-text error
      if (!res.ok) {
        throw Object.assign(new Error(text || `HTTP ${res.status}`), {
          status: res.status,
        });
      }
      throw new Error('Ditto response was not valid JSON');
    }

    if (!res.ok) {
      const errMsg = json?.error?.description || `HTTP ${res.status}`;
      class HttpStatusError extends Error {
        status?: number;
        constructor(message: string, status?: number) {
          super(message);
          this.status = status;
        }
      }
      throw new HttpStatusError(errMsg, res.status);
    }

    return json!;
  } catch (err: unknown) {
    let message = 'Request failed';
    if (typeof err === 'object' && err !== null) {
      const maybe = err as { message?: string };
      if (typeof maybe.message === 'string') message = maybe.message;
    } else if (typeof err === 'string') {
      message = err;
    }
    logger.error(`[ditto] request failed: ${message}`);
    // Return a Ditto-like error envelope to the tool handler
    const errorResponse: DittoResponse = {
      queryType: 'unknown',
      items: [],
      mutatedDocumentIds: [],
      totalWarningsCount: 0,
      warnings: [],
      error: { description: message },
      transactionId: undefined,
    };
    return errorResponse;
  } finally {
    clearTimeout(id);
  }
}
