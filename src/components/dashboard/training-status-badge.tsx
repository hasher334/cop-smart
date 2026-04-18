import { Link } from "@tanstack/react-router";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { useRequiredTrainingStatus } from "@/hooks/use-required-training-status";

interface Props {
  userId: string | null | undefined;
}

export function TrainingStatusBadge({ userId }: Props) {
  const { loading, blocked, missing } = useRequiredTrainingStatus(userId);

  if (!userId) return null;

  if (loading) {
    return (
      <span className="inline-flex items-center gap-2 rounded-full border bg-muted/50 px-3 py-1 text-sm text-muted-foreground">
        <Loader2 className="h-4 w-4 animate-spin" />
        Checking training…
      </span>
    );
  }

  if (blocked) {
    const expired = missing.filter((m) => m.status === "expired").length;
    const missingCount = missing.filter((m) => m.status === "missing").length;
    const parts: string[] = [];
    if (expired) parts.push(`${expired} expired`);
    if (missingCount) parts.push(`${missingCount} missing`);

    return (
      <Link
        to="/training"
        className="inline-flex items-center gap-2 rounded-full border border-destructive/40 bg-destructive/10 px-3 py-1 text-sm font-medium text-destructive transition hover:bg-destructive/20"
      >
        <ShieldAlert className="h-4 w-4" />
        Action needed
        <span className="text-xs font-normal opacity-80">({parts.join(", ")})</span>
      </Link>
    );
  }

  return (
    <Link
      to="/training"
      className="inline-flex items-center gap-2 rounded-full border border-emerald-600/40 bg-emerald-600/10 px-3 py-1 text-sm font-medium text-emerald-700 transition hover:bg-emerald-600/20 dark:text-emerald-400"
    >
      <ShieldCheck className="h-4 w-4" />
      Training current
    </Link>
  );
}
