import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { GraduationCap, AlertTriangle, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatShortDate } from "@/lib/format";
import { daysUntilExpiration } from "@/lib/training";
import type { Database } from "@/integrations/supabase/types";

type Record = Database["public"]["Tables"]["training_records"]["Row"] & {
  training_courses: Pick<
    Database["public"]["Tables"]["training_courses"]["Row"],
    "code" | "name"
  > | null;
};

const HORIZON_DAYS = 60;

function horizonISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + HORIZON_DAYS);
  return d.toISOString().slice(0, 10);
}

export function ExpiringTrainingWidget() {
  const { user } = useAuth();
  const [records, setRecords] = useState<Record[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("training_records")
      .select("*, training_courses(code, name)")
      .eq("user_id", user.id)
      .not("expiration_date", "is", null)
      .lte("expiration_date", horizonISO())
      .order("expiration_date", { ascending: true })
      .limit(5)
      .then(({ data }) => {
        setRecords((data as Record[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <section aria-label="Expiring training" className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-2xl">
        <GraduationCap className="h-6 w-6 text-gold" />
        Expiring training
      </h2>

      {loading ? (
        <div className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
          Loading…
        </div>
      ) : records.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-muted-foreground">
          No certifications expiring in the next {HORIZON_DAYS} days.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
          <ul className="divide-y">
            {records.map((r) => {
              const days = daysUntilExpiration(r.expiration_date!);
              const expired = days < 0;
              return (
                <li key={r.id}>
                  <Link
                    to="/training"
                    className="flex items-center gap-4 p-4 transition hover:bg-accent/40"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        expired
                          ? "bg-destructive/15 text-destructive"
                          : "bg-amber-500/15 text-amber-600"
                      }`}
                    >
                      {expired ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <Clock className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-mono text-sm font-semibold">
                          {r.training_courses?.code ?? "—"}
                        </span>
                        <span className="truncate text-base">
                          {r.training_courses?.name ?? "Unknown course"}
                        </span>
                      </div>
                      <p
                        className={`text-sm ${
                          expired
                            ? "font-medium text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {expired
                          ? `Expired ${Math.abs(days)} day${Math.abs(days) === 1 ? "" : "s"} ago — `
                          : `Expires in ${days} day${days === 1 ? "" : "s"} — `}
                        {formatShortDate(r.expiration_date!)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            to="/training"
            className="block border-t bg-muted/30 px-4 py-2 text-center text-sm font-medium text-primary hover:bg-muted/60"
          >
            View all training
          </Link>
        </div>
      )}
    </section>
  );
}
