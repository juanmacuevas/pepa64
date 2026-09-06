import { env } from 'cloudflare:workers';
// Provider-specific access is confined here. Protocol/math have no runtime dependency.
export type Row = Record<string, string | number>;
export function database() { return env.DB; }
export function audioStore() { return env.AUDIO; }
