import { createFileRoute, redirect } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Building2, Loader2, Users, Clock } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authed/admin/unit-comparison")({
  head: () => ({ meta: [{ title: "Unit Comparison — VolSmart" }] }),
  beforeLoad: async () => {
    const { data: roles } = await supabase.from("user_roles").select("role");
    const ok = (roles ?? []).some((r) =>
      ["admin", "officer", "corporal_plus"].includes(r.role),
    );
    if (!ok) throw redirect({ to: "/dashboard" });
  },
  component: UnitComparisonPage,
});

function shiftHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60;
  return mins / 60;
}

interface Row {
  id: string;
  code: string;
  name: string;
  totalHours: number;
  shifts: number;
  volunteers: number;
}

function UnitComparisonPage() {
  const [rows, setRows] = useState<Row[] | null>(null);
  const year = new Date().getFullYear();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const yearStart = `${year}-01-01`;
      const yearEnd = `${year + 1}-01-01`;

      const [unitsRes, profilesRes, shiftsRes] = await Promise.all([
        supabase.from("units").select("id,code,name").order("code"),
        supabase.from("profiles").select("user_id,home_unit_id"),
        supabase
          .from("patrol_shifts")
          .select("start_time,end_time,volunteer_1,volunteer_2")
          .eq("status", "completed")
          .gte("shift_date", yearStart)
          .lt("shift_date", yearEnd),
      ]);
      if (cancelled) return;

      // Map user -> home_unit_id
      const userUnit = new Map<string, string | null>();
      for (const p of profilesRes.data ?? []) {
        userUnit.set(p.user_id, p.home_unit_id);
      }

      const stats = new Map<
        string,
        { hours: number; shifts: number; volunteers: Set<string> }
      >();
      for (const u of unitsRes.data ?? []) {
        stats.set(u.id, { hours: 0, shifts: 0, volunteers: new Set() });
      }

      for (const s of shiftsRes.data ?? []) {
        const hrs = shiftHours(s.start_time, s.end_time);
        for (const uid of [s.volunteer_1, s.volunteer_2]) {
          if (!uid) continue;
          const unitId = userUnit.get(uid);
          if (!unitId) continue;
          const st = stats.get(unitId);
          if (!st) continue;
          st.hours += hrs;
          st.shifts += 1;
          st.volunteers.add(uid);
        }
      }

      const result: Row[] = (unitsRes.data ?? []).map((u) => {
        const st = stats.get(u.id)!;
        return {
          id: u.id,
          code: u.code,
          name: u.name,
          totalHours: st.hours,
          shifts: st.shifts,
          volunteers: st.volunteers.size,
        };
      });

      result.sort((a, b) => b.totalHours - a.totalHours);
      setRows(result);
    })();
    return () => {
      cancelled = true;
    };
  }, [year]);

  const maxHours = Math.max(1, ...(rows ?? []).map((r) => r.totalHours));
  const grandTotal = (rows ?? []).reduce((s, r) => s + r.totalHours, 0);

  return (
    <PageShell
      title="Unit Comparison"
      subtitle={`Total volunteer hours per home unit, ${year}.`}
      crumbs={[{ label: "Unit Comparison" }]}
    >
      {rows === null ? (
        <Card className="p-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading…
          </div>
        </Card>
      ) : (
        <>
          <div className="mb-6 grid gap-4 sm:grid-cols-3">
            <SummaryStat
              icon={<Building2 className="h-5 w-5" />}
              label="Units tracked"
              value={rows.length.toString()}
            />
            <SummaryStat
              icon={<Clock className="h-5 w-5" />}
              label={`Total hours ${year}`}
              value={grandTotal.toFixed(1)}
            />
            <SummaryStat
              icon={<Users className="h-5 w-5" />}
              label="Active contributors"
              value={rows
                .reduce((s, r) => s + r.volunteers, 0)
                .toString()}
            />
          </div>

          {rows.every((r) => r.totalHours === 0) ? (
            <Card className="p-8 text-center text-muted-foreground">
              No completed shifts recorded for {year} yet.
            </Card>
          ) : (
            <Card className="overflow-hidden">
              <ul className="divide-y">
                {rows.map((r, idx) => {
                  const pct = (r.totalHours / maxHours) * 100;
                  const sharePct =
                    grandTotal > 0 ? (r.totalHours / grandTotal) * 100 : 0;
                  return (
                    <li key={r.id} className="p-4">
                      <div className="mb-2 flex items-baseline justify-between gap-3">
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-muted text-xs font-bold">
                              {idx + 1}
                            </span>
                            <span className="font-semibold">{r.code}</span>
                            <span className="truncate text-sm text-muted-foreground">
                              — {r.name}
                            </span>
                          </div>
                          <p className="ml-8 text-xs text-muted-foreground">
                            {r.volunteers} volunteer
                            {r.volunteers === 1 ? "" : "s"} &middot; {r.shifts} shift
                            {r.shifts === 1 ? "" : "s"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-mono text-lg font-bold">
                            {r.totalHours.toFixed(1)}
                          </p>
                          <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                            {sharePct.toFixed(1)}% of total
                          </p>
                        </div>
                      </div>
                      <div className="ml-8 h-3 overflow-hidden rounded-full bg-muted">
                        <div
                          className="h-full rounded-full bg-gradient-to-r from-primary to-primary/60 transition-all"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </li>
                  );
                })}
              </ul>
            </Card>
          )}
        </>
      )}
    </PageShell>
  );
}

function SummaryStat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <Card className="flex items-center gap-3 p-4">
      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <div>
        <p className="font-mono text-xl font-bold">{value}</p>
        <p className="text-xs text-muted-foreground">{label}</p>
      </div>
    </Card>
  );
}
