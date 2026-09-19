/**
 * Browser-safe environment configuration. Keep secrets out of NEXT_PUBLIC_ variables.
 */
const appName = process.env.NEXT_PUBLIC_APP_NAME?.trim();

export const publicEnv = {
  appName: appName || 'Annapurna',
} as const;
