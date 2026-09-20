/**
 * Browser-safe environment configuration. Keep secrets out of NEXT_PUBLIC_ variables.
 */
const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim();
const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

export const publicEnv = {
  appName: appName || 'Annapurna',
  apiBaseUrl: apiBaseUrl || 'http://localhost:8080/api/v1',
} as const;
