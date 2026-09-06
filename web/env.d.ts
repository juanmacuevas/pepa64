interface D1Statement {
  bind(...values: unknown[]): D1Statement;
  first<T = Record<string, string | number>>(): Promise<T | null>;
  all<T = Record<string, string | number>>(): Promise<{ results: T[] }>;
  run(): Promise<{ meta: { changes: number } }>;
}
interface D1Database { prepare(sql:string): D1Statement; batch(statements:D1Statement[]): Promise<unknown[]>; }
interface Fetcher { fetch(request:Request):Promise<Response>; }
interface R2Bucket {
  put(key:string, body:ArrayBuffer, options?:{httpMetadata:{contentType:string}}):Promise<unknown>;
  get(key:string):Promise<{body:ReadableStream; httpMetadata?:{contentType?:string}} | null>;
  delete(keys:string | string[]):Promise<void>;
}
declare module 'cloudflare:workers' { export const env: {DB:D1Database; AUDIO:R2Bucket}; }
