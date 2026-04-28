import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState, useCallback } from "react";
import { Plus, ChevronLeft, ChevronRight, CalendarDays, CalendarRange, Globe2, Home as HomeIcon, Grid3x3, Printer } from "lucide-react";
import { Link } from "@tanstack/react-router";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import {
  todayISO,
  toISODate,
  parseISODate,
  formatLongDate,
  monthLabel,
  MONTHS,
  daysInMonth,
} from "@/lib/format";
import { ShiftFormDialog } from "@/components/schedule/shift-form-dialog";
import { ShiftRow } from "@/components/schedule/shift-row";
import { CalendarMonthView } from "@/components/schedule/calendar-month-view";

type Shift = Database["public"]["Tables"]["patrol_shifts"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];
type Vehicle = Pick<Database["public"]["Tables"]["vehicles"]["Row"], "id" | "vehicle_no" | "make" | "model" | "year">;
type Profile = Pick<Database["public"]["Tables"]["profiles"]["Row"], "user_id" | "full_name" | "badge_no">;

export const Route = createFileRoute("/_authed/schedule")({
  head: () => ({ meta: [{ title: "Schedule a Patrol — VolSmart" }] }),
  component: SchedulePage,
});

function SchedulePage() {
  const auth = useAuth();
  const [units, setUnits] = useState<Unit[]>([]);
  const [vehicles, setVehicles] = useState<Map<string, Vehicle>>(new Map());
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());
  const [tab, setTab] = useState("calendar");

  // shared dialog state
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Shift | null>(null);

  const canManage =
    auth.isAdmin || auth.hasRole("officer") || auth.hasRole("corporal_plus");

  // Load units + profile lookups
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
        const map = new Map<string, Profile>();
        (data ?? []).forEach((p) => map.set(p.user_id, p));
        setProfiles(map);
      });
    supabase
      .from("vehicles")
      .select("id, vehicle_no, make, model, year")
      .then(({ data }) => {
        const map = new Map<string, Vehicle>();
        (data ?? []).forEach((v) => map.set(v.id, v));
        setVehicles(map);
      });
  }, []);

  const openCreate = useCallback(() => {
    setEditing(null);
    setDialogOpen(true);
  }, []);
  const openEdit = useCallback((s: Shift) => {
    setEditing(s);
    setDialogOpen(true);
  }, []);

  // Bump key to force child views to refetch after a save
  const [refreshKey, setRefreshKey] = useState(0);
  const onChanged = useCallback(() => setRefreshKey((k) => k + 1), []);

  return (
    <PageShell
      title="Schedule a Patrol"
      legacyName="VDASH"
      subtitle="View open shifts, sign yourself up, or manage the schedule."
      crumbs={[{ label: "Schedule" }]}
      actions={
        canManage && (
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline" className="h-12 gap-2">
              <Link to="/schedule/print">
                <Printer className="h-5 w-5" />
                Print month
              </Link>
            </Button>
            <Button onClick={openCreate} className="h-12 gap-2">
              <Plus className="h-5 w-5" />
              New shift
            </Button>
          </div>
        )
      }
    >
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid h-auto w-full grid-cols-2 gap-1 bg-surface p-1 sm:grid-cols-3 lg:grid-cols-5">
          <TabsTrigger value="calendar" className="h-12 gap-2">
            <Grid3x3 className="h-5 w-5" />
            <span>Calendar</span>
          </TabsTrigger>
          <TabsTrigger value="day" className="h-12 gap-2">
            <CalendarDays className="h-5 w-5" />
            <span>By Day</span>
          </TabsTrigger>
          <TabsTrigger value="unit-month" className="h-12 gap-2">
            <CalendarRange className="h-5 w-5" />
            <span>Unit Month</span>
          </TabsTrigger>
          <TabsTrigger value="all-month" className="h-12 gap-2">
            <Globe2 className="h-5 w-5" />
            <span>All Units</span>
          </TabsTrigger>
          <TabsTrigger value="my-unit" className="h-12 gap-2">
            <HomeIcon className="h-5 w-5" />
            <span>My Unit Today</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="calendar" className="mt-6">
          <CalendarMonthView
            key={`cal-${refreshKey}`}
            units={units}
            profiles={profiles}
            currentUserId={auth.user?.id}
            canManage={canManage}
            onEdit={openEdit}
            onChanged={onChanged}
          />
        </TabsContent>

        <TabsContent value="day" className="mt-6">
          <DayView
            key={`day-${refreshKey}`}
            units={units}
            vehicles={vehicles}
            profiles={profiles}
            currentUserId={auth.user?.id}
            canManage={canManage}
            onEdit={openEdit}
            onChanged={onChanged}
          />
        </TabsContent>
        <TabsContent value="unit-month" className="mt-6">
          <UnitMonthView
            key={`um-${refreshKey}`}
            units={units}
            vehicles={vehicles}
            profiles={profiles}
            currentUserId={auth.user?.id}
            canManage={canManage}
            onEdit={openEdit}
            onChanged={onChanged}
            defaultUnit={auth.profile?.home_unit_id ?? null}
          />
        </TabsContent>
        <TabsContent value="all-month" className="mt-6">
          <AllUnitsMonthView
            key={`am-${refreshKey}`}
            units={units}
            vehicles={vehicles}
            profiles={profiles}
            currentUserId={auth.user?.id}
            canManage={canManage}
            onEdit={openEdit}
            onChanged={onChanged}
          />
        </TabsContent>
        <TabsContent value="my-unit" className="mt-6">
          <MyUnitTodayView
            key={`mu-${refreshKey}`}
            units={units}
            vehicles={vehicles}
            profiles={profiles}
            currentUserId={auth.user?.id}
            canManage={canManage}
            onEdit={openEdit}
            onChanged={onChanged}
            homeUnitId={auth.profile?.home_unit_id ?? null}
          />
        </TabsContent>
      </Tabs>

      <ShiftFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        units={units}
        defaultUnitId={auth.profile?.home_unit_id ?? null}
        shift={editing}
        onSaved={onChanged}
      />
    </PageShell>
  );
}

interface ViewProps {
  units: Unit[];
  vehicles?: Map<string, Vehicle>;
  profiles: Map<string, Profile>;
  currentUserId?: string;
  canManage: boolean;
  onEdit: (s: Shift) => void;
  onChanged: () => void;
}

// ---------- DAY VIEW (any single date, all units) ----------
function DayView(props: ViewProps) {
  const [date, setDate] = useState(todayISO());
  const [shifts, setShifts] = useState<Shift[] | null>(null);

  useEffect(() => {
    setShifts(null);
    supabase
      .from("patrol_shifts")
      .select("*")
      .eq("shift_date", date)
      .order("start_time")
      .then(({ data }) => setShifts(data ?? []));
  }, [date]);

  const shift = (delta: number) => {
    const d = parseISODate(date);
    d.setDate(d.getDate() + delta);
    setDate(toISODate(d));
  };

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border bg-surface p-4">
        <div className="grid gap-1">
          <Label htmlFor="day-date">Pick a date</Label>
          <Input
            id="day-date"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="h-12 w-48"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => shift(-1)} className="h-12 gap-1">
            <ChevronLeft className="h-5 w-5" /> Previous day
          </Button>
          <Button variant="outline" onClick={() => setDate(todayISO())} className="h-12">
            Today
          </Button>
          <Button variant="outline" onClick={() => shift(1)} className="h-12 gap-1">
            Next day <ChevronRight className="h-5 w-5" />
          </Button>
        </div>
      </div>

      <h2 className="mb-3 text-2xl">{formatLongDate(date)}</h2>
      <ShiftList shifts={shifts} {...props} />
    </section>
  );
}

// ---------- UNIT MONTH VIEW ----------
function UnitMonthView(props: ViewProps & { defaultUnit: string | null }) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [unitId, setUnitId] = useState<string>(props.defaultUnit ?? "");
  const [shifts, setShifts] = useState<Shift[] | null>(null);

  useEffect(() => {
    if (!unitId && props.units.length) setUnitId(props.units[0].id);
  }, [props.units, unitId]);

  useEffect(() => {
    if (!unitId) return;
    setShifts(null);
    const last = daysInMonth(year, month);
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
    supabase
      .from("patrol_shifts")
      .select("*")
      .eq("unit_id", unitId)
      .gte("shift_date", start)
      .lte("shift_date", end)
      .order("shift_date")
      .order("start_time")
      .then(({ data }) => setShifts(data ?? []));
  }, [unitId, year, month]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border bg-surface p-4">
        <MonthYearPicker year={year} month={month} setYear={setYear} setMonth={setMonth} />
        <div className="grid gap-1">
          <Label htmlFor="um-unit">Unit</Label>
          <Select value={unitId} onValueChange={setUnitId}>
            <SelectTrigger id="um-unit" className="h-12 w-64">
              <SelectValue placeholder="Choose unit" />
            </SelectTrigger>
            <SelectContent>
              {props.units.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.code} — {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <h2 className="mb-3 text-2xl">{monthLabel(year, month)}</h2>
      <ShiftList shifts={shifts} groupByDate {...props} />
    </section>
  );
}

// ---------- ALL UNITS MONTH ----------
function AllUnitsMonthView(props: ViewProps) {
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [shifts, setShifts] = useState<Shift[] | null>(null);

  useEffect(() => {
    setShifts(null);
    const last = daysInMonth(year, month);
    const start = `${year}-${String(month + 1).padStart(2, "0")}-01`;
    const end = `${year}-${String(month + 1).padStart(2, "0")}-${String(last).padStart(2, "0")}`;
    supabase
      .from("patrol_shifts")
      .select("*")
      .gte("shift_date", start)
      .lte("shift_date", end)
      .order("shift_date")
      .order("start_time")
      .limit(1000)
      .then(({ data }) => setShifts(data ?? []));
  }, [year, month]);

  return (
    <section>
      <div className="mb-4 flex flex-wrap items-end gap-3 rounded-2xl border bg-surface p-4">
        <MonthYearPicker year={year} month={month} setYear={setYear} setMonth={setMonth} />
      </div>
      <h2 className="mb-3 text-2xl">All units · {monthLabel(year, month)}</h2>
      <ShiftList shifts={shifts} groupByDate {...props} />
    </section>
  );
}

// ---------- MY UNIT TODAY ----------
function MyUnitTodayView(props: ViewProps & { homeUnitId: string | null }) {
  const [shifts, setShifts] = useState<Shift[] | null>(null);
  const date = todayISO();

  useEffect(() => {
    if (!props.homeUnitId) {
      setShifts([]);
      return;
    }
    setShifts(null);
    supabase
      .from("patrol_shifts")
      .select("*")
      .eq("shift_date", date)
      .eq("unit_id", props.homeUnitId)
      .order("start_time")
      .then(({ data }) => setShifts(data ?? []));
  }, [props.homeUnitId, date]);

  if (!props.homeUnitId) {
    return (
      <div className="rounded-2xl border bg-card p-8 text-center">
        <p className="text-lg">You don't have a home unit set on your profile.</p>
      </div>
    );
  }
  const unit = props.units.find((u) => u.id === props.homeUnitId);

  return (
    <section>
      <h2 className="mb-3 text-2xl">
        {unit ? `${unit.code} — ${unit.name}` : "My unit"} · {formatLongDate(date)}
      </h2>
      <ShiftList shifts={shifts} {...props} />
    </section>
  );
}

// ---------- Shared list renderer ----------
function ShiftList({
  shifts,
  units,
  vehicles,
  profiles,
  currentUserId,
  canManage,
  onEdit,
  onChanged,
  groupByDate = false,
}: ViewProps & { shifts: Shift[] | null; groupByDate?: boolean }) {
  const unitMap = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);

  if (shifts === null) {
    return (
      <div className="grid gap-3">
        {[0, 1, 2].map((i) => (
          <Skeleton key={i} className="h-32 rounded-2xl" />
        ))}
      </div>
    );
  }

  if (shifts.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed bg-card p-10 text-center">
        <p className="text-lg text-muted-foreground">No shifts scheduled for this view.</p>
      </div>
    );
  }

  if (groupByDate) {
    const groups = new Map<string, Shift[]>();
    shifts.forEach((s) => {
      const arr = groups.get(s.shift_date) ?? [];
      arr.push(s);
      groups.set(s.shift_date, arr);
    });
    return (
      <div className="grid gap-6">
        {Array.from(groups.entries()).map(([date, list]) => (
          <div key={date}>
            <h3 className="mb-2 text-xl">{formatLongDate(date)}</h3>
            <div className="grid gap-3">
              {list.map((s) => (
                <ShiftRow
                  key={s.id}
                  shift={s}
                  unit={unitMap.get(s.unit_id)}
                  vehicle={s.vehicle_id ? vehicles?.get(s.vehicle_id) : undefined}
                  volunteer1={s.volunteer_1 ? profiles.get(s.volunteer_1) : undefined}
                  volunteer2={s.volunteer_2 ? profiles.get(s.volunteer_2) : undefined}
                  currentUserId={currentUserId}
                  canManage={canManage}
                  onEdit={onEdit}
                  onChanged={onChanged}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid gap-3">
      {shifts.map((s) => (
        <ShiftRow
          key={s.id}
          shift={s}
          unit={unitMap.get(s.unit_id)}
          vehicle={s.vehicle_id ? vehicles?.get(s.vehicle_id) : undefined}
          volunteer1={s.volunteer_1 ? profiles.get(s.volunteer_1) : undefined}
          volunteer2={s.volunteer_2 ? profiles.get(s.volunteer_2) : undefined}
          currentUserId={currentUserId}
          canManage={canManage}
          onEdit={onEdit}
          onChanged={onChanged}
        />
      ))}
    </div>
  );
}

// ---------- Month/Year picker ----------
function MonthYearPicker({
  year,
  month,
  setYear,
  setMonth,
}: {
  year: number;
  month: number;
  setYear: (y: number) => void;
  setMonth: (m: number) => void;
}) {
  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - 1 + i);
  return (
    <>
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
    </>
  );
}
