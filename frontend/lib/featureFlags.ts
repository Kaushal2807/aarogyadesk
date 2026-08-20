/**
 * Feature Flags
 *
 * Controlled via environment variables in .env.local
 *
 * NEXT_PUBLIC_ENABLE_TEMPLATES=true  → show Templates nav menu + Print column in dashboard
 * NEXT_PUBLIC_ENABLE_TEMPLATES=false → hide both (DEFAULT)
 *
 * Features are hidden by default — set to 'true' to enable.
 */
export const featureFlags = {
  // Default: false — only visible when explicitly set to 'true' in .env.local
  enableTemplates: process.env.NEXT_PUBLIC_ENABLE_TEMPLATES === 'true',
};
