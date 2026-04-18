/**
 * Convert a badge number to a synthetic email used for Supabase auth.
 * Users sign in with their badge number; the email is hidden plumbing.
 */
const AUTH_DOMAIN = "copsmart.local";

export function badgeToEmail(badgeNo: string): string {
  const clean = badgeNo.trim().toLowerCase().replace(/[^a-z0-9]/g, "");
  return `badge-${clean}@${AUTH_DOMAIN}`;
}

export function isSyntheticEmail(email: string | null | undefined): boolean {
  return !!email && email.endsWith(`@${AUTH_DOMAIN}`);
}
