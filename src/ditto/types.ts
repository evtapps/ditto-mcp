export type DittoQueryArgs = Record<string, unknown>;

export type ExecuteRequest = {
  statement: string;
  args?: DittoQueryArgs;
};

export type DittoResponse = {
  transactionId?: number;
  queryType: string; // "select" | "insert" | "update" | ...
  items: unknown[];
  mutatedDocumentIds: unknown[];
  warnings: { _id?: unknown; description: string }[];
  totalWarningsCount: number;
  error?: { description?: string };
};

export type ExecuteOptions = {
  baseUrl: string; // canonical root, e.g. https://APP.cloud.ditto.live
  apiKey: string; // Ditto API key (Authorization: Bearer ...)
  timeoutMs?: number;
  transactionId?: number; // optional X-DITTO-TXN-ID
};
