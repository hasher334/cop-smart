import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { CalendarDays, ChevronRight, MapPin } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { formatShortDate, formatTimeRange, todayISO } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Shift = Database["public"]["Tables"]["patrol_shifts"]["Row"] & {
  units: Pick<Database["public"]["Tables"]["units"]["Row"], "code" | "name"> | null;
};

export function UpcomingShiftsWidget() {
  const { user } = useAuth();
  const [shifts, setShifts] = useState<Shift[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    supabase
      .from("patrol_shifts")
      .select("*, units(code, name)")
      .or(`volunteer_1.eq.${user.id},volunteer_2.eq.${user.id}`)
      .gte("shift_date", todayISO())
      .neq("status", "cancelled")
      .order("shift_date", { ascending: true })
      .order("start_time", { ascending: true })
      .limit(5)
      .then(({ data }) => {
        setShifts((data as Shift[]) ?? []);
        setLoading(false);
      });
  }, [user]);

  return (
    <section aria-label="Upcoming shifts" className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-2xl">
        <CalendarDays className="h-6 w-6 text-gold" />
        My upcoming shifts
      </h2>

      {loading ? (
        <div className="rounded-2xl border bg-card p-6 text-center text-muted-foreground">
          Loading…
        </div>
      ) : shifts.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-muted-foreground">
          You have no upcoming shifts assigned.
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
          <ul className="divide-y">
            {shifts.map((s) => (
              <li key={s.id}>
                <Link
                  to="/schedule"
                  className="flex items-center gap-4 p-4 transition hover:bg-accent/40"
                >
                  <div className="flex h-12 w-12 shrink-0 flex-col items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <span className="text-[10px] font-semibold uppercase">
                      {formatShortDate(s.shift_date).split(" ")[0]}
                    </span>
                    <span className="text-lg font-bold leading-none">
                      {formatShortDate(s.shift_date).split(" ")[1]}
                    </span>
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-baseline gap-x-2">
                      <span className="font-mono text-sm font-semibold">
                        {s.units?.code ?? "—"}
                      </span>
                      <span className="truncate text-base">
                        {formatTimeRange(s.start_time, s.end_time)}
                      </span>
                    </div>
                    <p className="flex items-center gap-1 text-sm text-muted-foreground">
                      {s.patrol_area && (
                        <>
                          <MapPin className="h-3 w-3" />
                          {s.patrol_area}
                          <span className="mx-1">·</span>
                        </>
                      )}
                      <span className="capitalize">{s.patrol_type.replace("_", " ")}</span>
                    </p>
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-muted-foreground" />
                </Link>
              </li>
            ))}
          </ul>
          <Link
            to="/schedule"
            className="block border-t bg-muted/30 px-4 py-2 text-center text-sm font-medium text-primary hover:bg-muted/60"
          >
            View full schedule
          </Link>
        </div>
      )}
    </section>
  );
}
