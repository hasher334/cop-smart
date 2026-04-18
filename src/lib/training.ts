export type ExpirationStatus = "valid" | "expiring" | "expired" | "no_expiry";

export const EXPIRATION_META: Record<
  ExpirationStatus,
  { label: string; className: string; dotClassName: string }
> = {
  valid: {
    label: "Current",
    className: "bg-emerald-600 text-white",
    dotClassName: "bg-emerald-600",
  },
  expiring: {
    label: "Expiring soon",
    className: "bg-amber-500 text-white",
    dotClassName: "bg-amber-500",
  },
  expired: {
    label: "Expired",
    className: "bg-red-600 text-white",
    dotClassName: "bg-red-600",
  },
  no_expiry: {
    label: "No expiration",
    className: "bg-slate-500 text-white",
    dotClassName: "bg-slate-500",
  },
};

const WARN_DAYS = 60;

export function getExpirationStatus(record: { expiration_date: string | null }): ExpirationStatus {
  if (!record.expiration_date) return "no_expiry";
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(record.expiration_date);
  const diffDays = Math.floor((exp.getTime() - today.getTime()) / 86400000);
  if (diffDays < 0) return "expired";
  if (diffDays <= WARN_DAYS) return "expiring";
  return "valid";
}

export function daysUntilExpiration(date: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const exp = new Date(date);
  return Math.floor((exp.getTime() - today.getTime()) / 86400000);
}
