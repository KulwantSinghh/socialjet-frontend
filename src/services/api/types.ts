/**
 * API-level type definitions.
 * These are for the raw API communication layer.
 * Domain-specific types belong in src/types/*.types.ts
 */

export interface ApiRequestConfig {
  params?: Record<string, unknown>;
  headers?: Record<string, string>;
  signal?: AbortSignal;
}
