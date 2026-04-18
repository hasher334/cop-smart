import { useEffect, useMemo, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  MONTHS,
  daysInMonth,
  firstDayOfMonth,
  formatLongDate,
  monthLabel,
  todayISO,
} from "@/lib/format";
import { ShiftRow } from "./shift-row";
import { cn } from "@/lib/utils";

type Shift = Database["public"]["Tables"]["patrol_shifts"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];
type Profile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "user_id" | "full_name" | "badge_no"
>;

interface Props {
  units: Unit[];
  profiles: Map<string, Profile>;
  currentUserId?: string;
  canManage: boolean;
  onEdit: (s: Shift) => void;
  onChanged: () => void;
}

const DOW = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function CalendarMonthView(props: Props) {
  const today = new Date();
  const todayIso = todayISO();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [shifts, setShifts] = useState<Shift[] | null>(null);
  const [selectedDate, setSelectedDate] = useState<string | null>(todayIso);

  const monthStr = String(month + 1).padStart(2, "0");
  const last = daysInMonth(year, month);
  const start = `${year}-${monthStr}-01`;
  const end = `${year}-${monthStr}-${String(last).padStart(2, "0")}`;

  useEffect(() => {
    setShifts(null);
    supabase
      .from("patrol_shifts")
      .select("*")
      .gte("shift_date", start)
      .lte("shift_date", end)
      .order("shift_date")
      .order("start_time")
      .limit(1000)
      .then(({ data }) => setShifts(data ?? []));
  }, [start, end]);

  // Reset selection if it falls outside the month being viewed
  useEffect(() => {
    if (!selectedDate) return;
    if (!selectedDate.startsWith(`${year}-${monthStr}`)) {
      setSelectedDate(null);
    }
  }, [year, monthStr, selectedDate]);

  const byDate = useMemo(() => {
    const map = new Map<string, Shift[]>();
    (shifts ?? []).forEach((s) => {
      const arr = map.get(s.shift_date) ?? [];
      arr.push(s);
      map.set(s.shift_date, arr);
    });
    return map;
  }, [shifts]);

  const unitMap = useMemo(
    () => new Map(props.units.map((u) => [u.id, u])),
    [props.units],
  );

  const shiftMonth = (delta: number) => {
    let m = month + delta;
    let y = year;
    if (m < 0) {
      m = 11;
      y -= 1;
    } else if (m > 11) {
      m = 0;
      y += 1;
    }
    setMonth(m);
    setYear(y);
  };

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);

  const offset = firstDayOfMonth(year, month);
  const cells: (string | null)[] = [];
  for (let i = 0; i < offset; i++) cells.push(null);
  for (let d = 1; d <= last; d++) {
    cells.push(`${year}-${monthStr}-${String(d).padStart(2, "0")}`);
  }
  while (cells.length % 7 !== 0) cells.push(null);

  const selectedShifts = selectedDate ? byDate.get(selectedDate) ?? [] : [];

  return (
    <section>
      {/* Controls */}
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border bg-surface p-4">
        <div className="grid gap-1">
          <Label>Month</Label>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger className="h-12 w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {MONTHS.map((m, idx) => (
                <SelectItem key={m} value={String(idx)}>
                  {m}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="grid gap-1">
          <Label>Year</Label>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger className="h-12 w-28">
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
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => shiftMonth(-1)} className="h-12 gap-1">
            <ChevronLeft className="h-5 w-5" /> Prev
          </Button>
          <Button
            variant="outline"
            onClick={() => {
              const t = new Date();
              setYear(t.getFullYear());
              setMonth(t.getMonth());
              setSelectedDate(todayIso);
            }}
            className="h-12"
          >
            Today
          </Button>
          <Button variant="outline" onClick={() => shiftMonth(1)} className="h-12 gap-1">
            Next <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <h2 className="mb-3 text-2xl">{monthLabel(year, month)}</h2>

      {/* Grid */}
      {shifts === null ? (
        <Skeleton className="h-[420px] w-full rounded-2xl" />
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
          <div className="grid grid-cols-7 border-b bg-surface text-center text-sm font-semibold">
            {DOW.map((d) => (
              <div key={d} className="px-1 py-2">
                <span className="hidden sm:inline">{d}</span>
                <span className="sm:hidden">{d.slice(0, 1)}</span>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-7">
            {cells.map((iso, i) => {
              if (!iso) {
                return <div key={`e-${i}`} className="aspect-square border-b border-r bg-muted/20 sm:aspect-auto sm:min-h-24" />;
              }
              const dayShifts = byDate.get(iso) ?? [];
              const count = dayShifts.length;
              const openCount = dayShifts.filter((s) => s.status === "open").length;
              const isToday = iso === todayIso;
              const isSelected = iso === selectedDate;
              const dayNum = Number(iso.slice(-2));

              return (
                <button
                  key={iso}
                  type="button"
                  onClick={() => setSelectedDate(iso)}
                  className={cn(
                    "relative flex aspect-square flex-col items-stretch border-b border-r p-1 text-left transition-colors hover:bg-accent/30 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:aspect-auto sm:min-h-24 sm:p-2",
                    isSelected && "bg-primary/10 ring-2 ring-inset ring-primary",
                  )}
                  aria-pressed={isSelected}
                  aria-label={`${formatLongDate(iso)}, ${count} ${count === 1 ? "shift" : "shifts"}`}
                >
                  <span
                    className={cn(
                      "inline-flex h-7 w-7 items-center justify-center rounded-full text-sm font-semibold sm:text-base",
                      isToday && "bg-primary text-primary-foreground",
                    )}
                  >
                    {dayNum}
                  </span>
                  {count > 0 && (
                    <div className="mt-auto flex flex-wrap gap-1">
                      <span className="rounded-md bg-secondary px-1.5 py-0.5 text-xs font-medium">
                        {count}
                      </span>
                      {openCount > 0 && (
                        <span className="rounded-md bg-info px-1.5 py-0.5 text-xs font-medium text-info-foreground">
                          {openCount} open
                        </span>
                      )}
                    </div>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Selected day list */}
      {selectedDate && (
        <div className="mt-6">
          <h3 className="mb-3 text-xl">{formatLongDate(selectedDate)}</h3>
          {selectedShifts.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed bg-card p-8 text-center">
              <p className="text-base text-muted-foreground">No shifts scheduled this day.</p>
            </div>
          ) : (
            <div className="grid gap-3">
              {selectedShifts.map((s) => (
                <ShiftRow
                  key={s.id}
                  shift={s}
                  unit={unitMap.get(s.unit_id)}
                  volunteer1={s.volunteer_1 ? props.profiles.get(s.volunteer_1) : undefined}
                  volunteer2={s.volunteer_2 ? props.profiles.get(s.volunteer_2) : undefined}
                  currentUserId={props.currentUserId}
                  canManage={props.canManage}
                  onEdit={props.onEdit}
                  onChanged={props.onChanged}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
