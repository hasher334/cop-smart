import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Printer, ArrowLeft, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import {
  daysInMonth,
  monthLabel,
  MONTHS,
  formatTimeRange,
} from "@/lib/format";

type Shift = Database["public"]["Tables"]["patrol_shifts"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];
type Profile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "user_id" | "full_name" | "badge_no"
>;

export const Route = createFileRoute("/_authed/schedule/print")({
  head: () => ({ meta: [{ title: "Print Monthly Schedule — CopSmart" }] }),
  component: PrintSchedulePage,
});

const TYPE_LABEL: Record<Shift["patrol_type"], string> = {
  patrol: "Patrol",
  special_event: "Event",
  training: "Training",
  meeting: "Meeting",
  other: "Other",
};

function PrintSchedulePage() {
  const auth = useAuth();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [unitId, setUnitId] = useState<string>("all");
  const [units, setUnits] = useState<Unit[]>([]);
  const [shifts, setShifts] = useState<Shift[] | null>(null);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());

  const canManage =
    auth.isAdmin || auth.hasRole("officer") || auth.hasRole("corporal_plus");

  useEffect(() => {
    supabase
      .from("units")
      .select("*")
      .order("code")
      .then(({ data }) => setUnits(data ?? []));
    supabase
      .from("profiles")
      .select("user_id, full_name, badge_no")
      .then(({ data }) => {
        const m = new Map<string, Profile>();
        (data ?? []).forEach((p) => m.set(p.user_id, p));
        setProfiles(m);
      });
  }, []);

  useEffect(() => {
    setShifts(null);
    const last = daysInMonth(year, month);
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
    let q = supabase
      .from("patrol_shifts")
      .select("*")
      .gte("shift_date", start)
      .lte("shift_date", end)
      .neq("status", "cancelled")
      .order("shift_date")
      .order("start_time")
      .limit(2000);
    if (unitId !== "all") q = q.eq("unit_id", unitId);
    q.then(({ data }) => setShifts(data ?? []));
  }, [year, month, unitId]);

  const unitMap = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);
  const selectedUnit = unitId === "all" ? null : unitMap.get(unitId);

  // Build calendar grid (Sun..Sat)
  const grid = useMemo(() => {
    const first = new Date(year, month, 1);
    const startWeekday = first.getDay(); // 0..6 Sun..Sat
    const total = daysInMonth(year, month);
    const cells: Array<{ day: number | null; iso: string | null }> = [];
    for (let i = 0; i < startWeekday; i++) cells.push({ day: null, iso: null });
    for (let d = 1; d <= total; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
      cells.push({ day: d, iso });
    }
    while (cells.length % 7 !== 0) cells.push({ day: null, iso: null });
    return cells;
  }, [year, month]);

  const shiftsByDate = useMemo(() => {
    const m = new Map<string, Shift[]>();
    (shifts ?? []).forEach((s) => {
      const arr = m.get(s.shift_date) ?? [];
      arr.push(s);
      m.set(s.shift_date, arr);
    });
    return m;
  }, [shifts]);

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 1 + i);

  const volLabel = (id: string | null) => {
    if (!id) return null;
    const p = profiles.get(id);
    if (!p) return "Assigned";
    return `${p.full_name.split(" ").slice(-1)[0]} #${p.badge_no}`;
  };

  if (!canManage) {
    return (
      <div className="mx-auto max-w-2xl p-8 text-center">
        <p className="text-lg">This view is for officers and admins.</p>
        <Button asChild variant="outline" className="mt-4">
          <Link to="/schedule">Back to schedule</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Toolbar — hidden on print */}
      <div className="border-b bg-card print:hidden">
        <div className="mx-auto flex max-w-7xl flex-wrap items-end gap-3 px-4 py-4">
          <Button asChild variant="outline" className="h-12 gap-2">
            <Link to="/schedule">
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>
          </Button>
          <div className="grid gap-1">
            <Label htmlFor="p-month">Month</Label>
            <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
              <SelectTrigger id="p-month" className="h-12 w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MONTHS.map((m, i) => (
                  <SelectItem key={m} value={String(i)}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="p-year">Year</Label>
            <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
              <SelectTrigger id="p-year" className="h-12 w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={String(y)}>
                    {y}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-1">
            <Label htmlFor="p-unit">Unit</Label>
            <Select value={unitId} onValueChange={setUnitId}>
              <SelectTrigger id="p-unit" className="h-12 w-64">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All units</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.code} — {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="ml-auto flex items-end">
            <Button onClick={() => window.print()} className="h-12 gap-2">
              <Printer className="h-5 w-5" />
              Print / Save as PDF
            </Button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-4 pb-3 text-sm text-muted-foreground">
          Tip: in the print dialog, choose "Save as PDF" and set Layout to{" "}
          <strong>Landscape</strong> for best results.
        </div>
      </div>

      {/* Printable area */}
      <main className="mx-auto max-w-[1100px] px-4 py-6 print:max-w-none print:px-6 print:py-4">
        <header className="mb-4 flex items-center justify-between border-b-2 border-primary pb-3">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground print:bg-black print:text-white">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-wide text-muted-foreground">
                PBSO Volunteer Services
              </div>
              <h1 className="text-2xl font-bold leading-tight">
                Monthly Patrol Schedule
              </h1>
            </div>
          </div>
          <div className="text-right">
            <div className="text-xl font-semibold">{monthLabel(year, month)}</div>
            <div className="text-sm text-muted-foreground">
              {selectedUnit ? `${selectedUnit.code} — ${selectedUnit.name}` : "All Units"}
            </div>
          </div>
        </header>

        {shifts === null ? (
          <p className="py-12 text-center text-muted-foreground">Loading…</p>
        ) : (
          <table className="w-full table-fixed border-collapse text-xs">
            <thead>
              <tr>
                {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
                  <th
                    key={d}
                    className="border border-border bg-muted px-2 py-1 text-left text-[11px] font-semibold uppercase print:bg-gray-200"
                  >
                    {d}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: grid.length / 7 }, (_, weekIdx) => (
                <tr key={weekIdx}>
                  {grid.slice(weekIdx * 7, weekIdx * 7 + 7).map((cell, i) => {
                    const dayShifts = cell.iso ? shiftsByDate.get(cell.iso) ?? [] : [];
                    return (
                      <td
                        key={i}
                        className="h-28 border border-border align-top p-1 print:h-24"
                      >
                        {cell.day !== null && (
                          <>
                            <div className="mb-1 text-[11px] font-bold">{cell.day}</div>
                            <ul className="space-y-0.5">
                              {dayShifts.slice(0, 5).map((s) => {
                                const u = unitMap.get(s.unit_id);
                                const v1 = volLabel(s.volunteer_1);
                                const v2 = volLabel(s.volunteer_2);
                                const vols = [v1, v2].filter(Boolean).join(", ");
                                return (
                                  <li
                                    key={s.id}
                                    className="break-words rounded border-l-2 border-primary bg-muted/40 px-1 py-0.5 text-[10px] leading-tight print:border-l print:border-black print:bg-gray-100"
                                  >
                                    <div className="font-semibold">
                                      {formatTimeRange(s.start_time, s.end_time)}
                                    </div>
                                    {unitId === "all" && u && (
                                      <div className="text-muted-foreground">
                                        {u.code} · {TYPE_LABEL[s.patrol_type]}
                                      </div>
                                    )}
                                    {unitId !== "all" && (
                                      <div className="text-muted-foreground">
                                        {TYPE_LABEL[s.patrol_type]}
                                      </div>
                                    )}
                                    {s.patrol_area && (
                                      <div className="italic">{s.patrol_area}</div>
                                    )}
                                    <div>{vols || "— Open —"}</div>
                                  </li>
                                );
                              })}
                              {dayShifts.length > 5 && (
                                <li className="text-[10px] italic text-muted-foreground">
                                  +{dayShifts.length - 5} more
                                </li>
                              )}
                            </ul>
                          </>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        )}

        {/* Legend / footer */}
        <footer className="mt-4 flex items-center justify-between border-t pt-2 text-[10px] text-muted-foreground">
          <span>
            Shifts shown: assigned volunteers listed by last name + badge. "— Open —" =
            unfilled slot.
          </span>
          <span>Generated {new Date().toLocaleString()}</span>
        </footer>
      </main>
    </div>
  );
}
