/**
 * Runtime configuration for the UI client.
 *
 * Configurable for physical device testing via EXPO_PUBLIC_RUNTIME_URL or RUNTIME_URL environment variables.
 * Defaults to http://localhost:3000 for local development.
 */
export const RUNTIME_BASE_URL: string =
  (typeof process !== 'undefined' && process.env?.['EXPO_PUBLIC_RUNTIME_URL']) ||
  (typeof process !== 'undefined' && process.env?.['RUNTIME_URL']) ||
  'http://localhost:3000';
