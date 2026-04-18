import type { Database } from "@/integrations/supabase/types";
import type { AuthState } from "@/hooks/use-auth";

export type AppRole = Database["public"]["Enums"]["app_role"];

/**
 * Centralized permission rules for CopSmart.
 *
 * Hierarchy (highest → lowest):
 *   admin           — full system control (roles, units, migration, all CRUD)
 *   officer         — operational management (shifts, training records,
 *                     vehicles, documents, hours reports)
 *   corporal_plus   — same operational scope as officer (senior volunteer)
 *   volunteer       — read-only on most data, manages own profile,
 *                     reserves open shifts, views own training & hours
 */
export const ROLE_LABEL: Record<AppRole, string> = {
  admin: "Administrator",
  officer: "Officer",
  corporal_plus: "Corporal+",
  volunteer: "Volunteer",
};

export const ROLE_DESCRIPTION: Record<AppRole, string> = {
  admin:
    "Full system control. Manages users, roles, units, announcements, and data migration.",
  officer:
    "Operations leadership. Creates and edits shifts, training records, vehicles, and documents.",
  corporal_plus:
    "Senior volunteer. Same operational management permissions as Officer.",
  volunteer:
    "Standard member. Views shifts, reserves open patrols, manages own profile and training.",
};

export const ROLE_BADGE_CLASS: Record<AppRole, string> = {
  admin: "bg-red-600 text-white",
  officer: "bg-blue-600 text-white",
  corporal_plus: "bg-amber-500 text-white",
  volunteer: "bg-slate-500 text-white",
};

/** True when the user can create/update/delete operational records
 *  (shifts, vehicles, training records, documents, courses). */
export function canManageOps(auth: Pick<AuthState, "isAdmin" | "hasRole">) {
  return (
    auth.isAdmin ||
    auth.hasRole("officer") ||
    auth.hasRole("corporal_plus")
  );
}

/** True when the user can view operational reports (hours, unit comparison). */
export function canViewReports(auth: Pick<AuthState, "isAdmin" | "hasRole">) {
  return canManageOps(auth);
}

/** True when the user can manage other users' roles, units, announcements,
 *  and run data migration. */
export function canAdminister(auth: Pick<AuthState, "isAdmin">) {
  return auth.isAdmin;
}

/** Capability matrix used in the public roles overview page. */
export interface Capability {
  area: string;
  description: string;
  roles: Record<AppRole, "full" | "limited" | "none">;
}

export const CAPABILITY_MATRIX: Capability[] = [
  {
    area: "Dashboard & Announcements",
    description: "View dashboard, announcements, weather and resources.",
    roles: { admin: "full", officer: "full", corporal_plus: "full", volunteer: "full" },
  },
  {
    area: "Shifts — view & reserve",
    description: "See the schedule and reserve open patrols.",
    roles: { admin: "full", officer: "full", corporal_plus: "full", volunteer: "full" },
  },
  {
    area: "Shifts — create / edit / delete",
    description: "Create new shifts, edit any shift, mark completed.",
    roles: { admin: "full", officer: "full", corporal_plus: "full", volunteer: "none" },
  },
  {
    area: "Roster",
    description: "View roster of volunteers and contact info.",
    roles: { admin: "full", officer: "full", corporal_plus: "full", volunteer: "full" },
  },
  {
    area: "Volunteer profiles — edit",
    description: "Edit other volunteers' profile records.",
    roles: { admin: "full", officer: "full", corporal_plus: "full", volunteer: "limited" },
  },
  {
    area: "Training records",
    description: "Add/edit completion and expiration dates.",
    roles: { admin: "full", officer: "full", corporal_plus: "full", volunteer: "limited" },
  },
  {
    area: "Vehicles",
    description: "Manage fleet, mileage, service dates.",
    roles: { admin: "full", officer: "full", corporal_plus: "full", volunteer: "none" },
  },
  {
    area: "Forms & Documents",
    description: "Upload and curate departmental documents.",
    roles: { admin: "full", officer: "full", corporal_plus: "full", volunteer: "none" },
  },
  {
    area: "Hours Report & Unit Comparison",
    description: "Operational analytics dashboards.",
    roles: { admin: "full", officer: "full", corporal_plus: "full", volunteer: "none" },
  },
  {
    area: "Announcements management",
    description: "Publish, pin, and expire announcements.",
    roles: { admin: "full", officer: "none", corporal_plus: "none", volunteer: "none" },
  },
  {
    area: "Users & Roles",
    description: "Grant/revoke roles to other accounts.",
    roles: { admin: "full", officer: "none", corporal_plus: "none", volunteer: "none" },
  },
  {
    area: "Data Migration",
    description: "Export/import full database snapshots.",
    roles: { admin: "full", officer: "none", corporal_plus: "none", volunteer: "none" },
  },
];
