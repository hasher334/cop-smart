import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Wrench, AlertTriangle, ChevronRight } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { formatShortDate, todayISO } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];

const HORIZON_DAYS = 30;

function horizonISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + HORIZON_DAYS);
  return d.toISOString().slice(0, 10);
}

export function ServiceDueWidget() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase
      .from("vehicles")
      .select("*")
      .not("next_service_date", "is", null)
      .lte("next_service_date", horizonISO())
      .neq("status", "retired")
      .order("next_service_date", { ascending: true })
      .limit(5)
      .then(({ data }) => {
        setVehicles(data ?? []);
        setLoading(false);
      });
  }, []);

  const today = todayISO();

  return (
    <section aria-label="Service due soon" className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-2xl">
        <Wrench className="h-6 w-6 text-gold" />
        Service due soon
      </h2>

      {loading ? (
        <div className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
          Loading…
        </div>
      ) : vehicles.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-muted-foreground">
          No vehicles need service in the next {HORIZON_DAYS} days.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
          <ul className="divide-y">
            {vehicles.map((v) => {
              const overdue = v.next_service_date! < today;
              const title =
                [v.year, v.make, v.model].filter(Boolean).join(" ") ||
                "Unspecified vehicle";
              return (
                <li key={v.id}>
                  <Link
                    to="/vehicles"
                    className="flex items-center gap-4 p-4 transition hover:bg-accent/40"
                  >
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${
                        overdue
                          ? "bg-destructive/15 text-destructive"
                          : "bg-amber-500/15 text-amber-600"
                      }`}
                    >
                      {overdue ? (
                        <AlertTriangle className="h-5 w-5" />
                      ) : (
                        <Wrench className="h-5 w-5" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-baseline gap-x-2">
                        <span className="font-mono text-sm font-semibold">
                          {v.vehicle_no}
                        </span>
                        <span className="truncate text-base">{title}</span>
                      </div>
                      <p
                        className={`text-sm ${
                          overdue
                            ? "font-medium text-destructive"
                            : "text-muted-foreground"
                        }`}
                      >
                        {overdue ? "Overdue since " : "Service due "}
                        {formatShortDate(v.next_service_date!)}
                      </p>
                    </div>
                    <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                  </Link>
                </li>
              );
            })}
          </ul>
          <Link
            to="/vehicles"
            className="block border-t bg-muted/30 px-4 py-2 text-center text-sm font-medium text-primary hover:bg-muted/60"
          >
            View all vehicles
          </Link>
        </div>
      )}
    </section>
  );
}
