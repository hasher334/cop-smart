import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { Download, BarChart3, ArrowLeft, Users as UsersIcon, Clock, CalendarRange } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import { daysInMonth, MONTHS, monthLabel } from "@/lib/format";
import { toast } from "sonner";

type Shift = Database["public"]["Tables"]["patrol_shifts"]["Row"];
type Profile = Pick<
  Database["public"]["Tables"]["profiles"]["Row"],
  "user_id" | "full_name" | "badge_no" | "rank"
>;

export const Route = createFileRoute("/_authed/admin/hours-report")({
  head: () => ({ meta: [{ title: "Volunteer Hours Report — VolSmart" }] }),
  component: HoursReportPage,
});

interface VolStats {
  user_id: string;
  shifts: number;
  hours: number;
  byType: Record<Shift["patrol_type"], number>;
}

const TYPE_LABEL: Record<Shift["patrol_type"], string> = {
  patrol: "Patrol",
  special_event: "Event",
  training: "Training",
  meeting: "Meeting",
  other: "Other",
};

function shiftHours(s: Shift): number {
  // Times are "HH:MM:SS" or "HH:MM"
  const [sh, sm] = s.start_time.split(":").map(Number);
  const [eh, em] = s.end_time.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60; // overnight
  return mins / 60;
}

function csvEscape(v: string | number): string {
  const s = String(v ?? "");
  if (/[",\n]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
  return s;
}

function HoursReportPage() {
  const auth = useAuth();
  const today = new Date();
  const [year, setYear] = useState(today.getFullYear());
  const [month, setMonth] = useState(today.getMonth());
  const [shifts, setShifts] = useState<Shift[] | null>(null);
  const [profiles, setProfiles] = useState<Map<string, Profile>>(new Map());

  const canManage =
    auth.isAdmin || auth.hasRole("officer") || auth.hasRole("corporal_plus");

  useEffect(() => {
    supabase
      .from("profiles")
      .select("user_id, full_name, badge_no, rank")
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
    supabase
      .from("patrol_shifts")
      .select("*")
      .gte("shift_date", start)
      .lte("shift_date", end)
      .eq("status", "completed")
      .limit(2000)
      .then(({ data }) => setShifts(data ?? []));
  }, [year, month]);

  const stats = useMemo<VolStats[]>(() => {
    if (!shifts) return [];
    const map = new Map<string, VolStats>();
    const ensure = (uid: string): VolStats => {
      let s = map.get(uid);
      if (!s) {
        s = {
          user_id: uid,
          shifts: 0,
          hours: 0,
          byType: { patrol: 0, special_event: 0, training: 0, meeting: 0, other: 0 },
        };
        map.set(uid, s);
      }
      return s;
    };
    for (const sh of shifts) {
      const h = shiftHours(sh);
      [sh.volunteer_1, sh.volunteer_2].forEach((uid) => {
        if (!uid) return;
        const s = ensure(uid);
        s.shifts += 1;
        s.hours += h;
        s.byType[sh.patrol_type] += h;
      });
    }
    return Array.from(map.values()).sort((a, b) => b.hours - a.hours);
  }, [shifts]);

  const totals = useMemo(() => {
    const totalHours = stats.reduce((acc, s) => acc + s.hours, 0);
    const totalShifts = (shifts ?? []).length;
    return { totalHours, totalShifts, volunteers: stats.length };
  }, [stats, shifts]);

  const downloadCSV = () => {
    if (!stats.length) {
      toast.error("Nothing to export.");
      return;
    }
    const header = [
      "Last name",
      "First name",
      "Rank",
      "Badge",
      "Completed shifts",
      "Total hours",
      "Patrol",
      "Special event",
      "Training",
      "Meeting",
      "Other",
    ];
    const rows = stats.map((s) => {
      const p = profiles.get(s.user_id);
      const name = p?.full_name ?? "Unknown";
      const parts = name.trim().split(/\s+/);
      const last = parts.length > 1 ? parts[parts.length - 1] : name;
      const first = parts.length > 1 ? parts.slice(0, -1).join(" ") : "";
      return [
        last,
        first,
        p?.rank ?? "",
        p?.badge_no ?? "",
        s.shifts,
        s.hours.toFixed(2),
        s.byType.patrol.toFixed(2),
        s.byType.special_event.toFixed(2),
        s.byType.training.toFixed(2),
        s.byType.meeting.toFixed(2),
        s.byType.other.toFixed(2),
      ];
    });
    const csv = [header, ...rows]
      .map((row) => row.map(csvEscape).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `volunteer-hours-${year}-${String(month + 1).padStart(2, "0")}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    toast.success("CSV downloaded.");
  };

  const years = Array.from({ length: 5 }, (_, i) => today.getFullYear() - 2 + i);

  if (!canManage) {
    return (
      <PageShell title="Hours report" crumbs={[{ label: "Hours" }]}>
        <div className="rounded-2xl border bg-card p-8 text-center">
          <p className="text-lg">This report is for officers and admins.</p>
          <Button asChild variant="outline" className="mt-4">
            <Link to="/dashboard">Back to dashboard</Link>
          </Button>
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Volunteer Hours Report"
      subtitle="Monthly summary of completed-shift hours per volunteer."
      crumbs={[{ label: "Hours" }]}
      actions={
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-12 gap-2">
            <Link to="/dashboard">
              <ArrowLeft className="h-5 w-5" />
              Back
            </Link>
          </Button>
          <Button onClick={downloadCSV} className="h-12 gap-2">
            <Download className="h-5 w-5" />
            Download CSV
          </Button>
        </div>
      }
    >
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border bg-surface p-4">
        <div className="grid gap-1">
          <Label htmlFor="hr-month">Month</Label>
          <Select value={String(month)} onValueChange={(v) => setMonth(Number(v))}>
            <SelectTrigger id="hr-month" className="h-12 w-40">
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
          <Label htmlFor="hr-year">Year</Label>
          <Select value={String(year)} onValueChange={(v) => setYear(Number(v))}>
            <SelectTrigger id="hr-year" className="h-12 w-28">
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
        <div className="ml-auto text-sm text-muted-foreground">
          Showing <strong>completed</strong> shifts only — open or cancelled shifts
          aren't counted.
        </div>
      </div>

      {/* Summary cards */}
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <SummaryCard
          icon={<Clock className="h-6 w-6" />}
          label="Total hours"
          value={totals.totalHours.toFixed(1)}
          sub={monthLabel(year, month)}
        />
        <SummaryCard
          icon={<CalendarRange className="h-6 w-6" />}
          label="Completed shifts"
          value={String(totals.totalShifts)}
          sub={monthLabel(year, month)}
        />
        <SummaryCard
          icon={<UsersIcon className="h-6 w-6" />}
          label="Volunteers credited"
          value={String(totals.volunteers)}
          sub={monthLabel(year, month)}
        />
      </div>

      {/* Table */}
      {shifts === null ? (
        <div className="grid gap-2">
          {[0, 1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-12 rounded" />
          ))}
        </div>
      ) : stats.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed bg-card p-10 text-center">
          <BarChart3 className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-lg text-muted-foreground">
            No completed shifts in {monthLabel(year, month)}.
          </p>
          <p className="text-sm text-muted-foreground">
            Mark shifts "Completed" on the schedule to credit hours here.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Volunteer</TableHead>
                <TableHead>Badge</TableHead>
                <TableHead className="text-right">Shifts</TableHead>
                <TableHead className="text-right">Hours</TableHead>
                <TableHead className="text-right">Patrol</TableHead>
                <TableHead className="text-right">Event</TableHead>
                <TableHead className="text-right">Training</TableHead>
                <TableHead className="text-right">Meeting</TableHead>
                <TableHead className="text-right">Other</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {stats.map((s) => {
                const p = profiles.get(s.user_id);
                return (
                  <TableRow key={s.user_id}>
                    <TableCell className="font-medium">
                      {p?.rank ? `${p.rank} ` : ""}
                      {p?.full_name ?? "Unknown volunteer"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {p?.badge_no ?? "—"}
                    </TableCell>
                    <TableCell className="text-right">{s.shifts}</TableCell>
                    <TableCell className="text-right font-semibold">
                      {s.hours.toFixed(1)}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {s.byType.patrol > 0 ? s.byType.patrol.toFixed(1) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {s.byType.special_event > 0 ? s.byType.special_event.toFixed(1) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {s.byType.training > 0 ? s.byType.training.toFixed(1) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {s.byType.meeting > 0 ? s.byType.meeting.toFixed(1) : "—"}
                    </TableCell>
                    <TableCell className="text-right text-muted-foreground">
                      {s.byType.other > 0 ? s.byType.other.toFixed(1) : "—"}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </PageShell>
  );
}

function SummaryCard({
  icon,
  label,
  value,
  sub,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  sub: string;
}) {
  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
          {icon}
        </div>
        <div>
          <div className="text-sm text-muted-foreground">{label}</div>
          <div className="text-3xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{sub}</div>
        </div>
      </div>
    </div>
  );
}
