import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Clock, CalendarCheck, TrendingUp, ChevronRight } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Shift = Pick<
  Database["public"]["Tables"]["patrol_shifts"]["Row"],
  "id" | "shift_date" | "start_time" | "end_time" | "patrol_type" | "volunteer_1" | "volunteer_2" | "status"
>;

interface Stats {
  monthHours: number;
  monthShifts: number;
  ytdHours: number;
  ytdShifts: number;
  loading: boolean;
}

function shiftHours(s: Pick<Shift, "start_time" | "end_time">): number {
  const [sh, sm] = s.start_time.split(":").map(Number);
  const [eh, em] = s.end_time.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins < 0) mins += 24 * 60;
  return mins / 60;
}

export function MyHoursWidget() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats>({
    monthHours: 0,
    monthShifts: 0,
    ytdHours: 0,
    ytdShifts: 0,
    loading: true,
  });

  useEffect(() => {
    if (!user) return;
    const now = new Date();
    const yearStart = `${now.getFullYear()}-01-01`;
    const monthStart = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-01`;

    supabase
      .from("patrol_shifts")
      .select("id, shift_date, start_time, end_time, patrol_type, volunteer_1, volunteer_2, status")
      .gte("shift_date", yearStart)
      .eq("status", "completed")
      .or(`volunteer_1.eq.${user.id},volunteer_2.eq.${user.id}`)
      .limit(1000)
      .then(({ data }) => {
        const rows = (data ?? []) as Shift[];
        let mh = 0,
          ms = 0,
          yh = 0,
          ys = 0;
        for (const r of rows) {
          const h = shiftHours(r);
          yh += h;
          ys += 1;
          if (r.shift_date >= monthStart) {
            mh += h;
            ms += 1;
          }
        }
        setStats({
          monthHours: mh,
          monthShifts: ms,
          ytdHours: yh,
          ytdShifts: ys,
          loading: false,
        });
      });
  }, [user]);

  const monthName = new Date().toLocaleString("en-US", { month: "long" });
  const year = new Date().getFullYear();

  return (
    <section aria-label="My hours" className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-2xl">
        <Clock className="h-6 w-6 text-gold" />
        My hours
      </h2>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-card">
        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <StatBlock
            icon={<CalendarCheck className="h-6 w-6" />}
            label={`${monthName} ${year}`}
            value={stats.loading ? "—" : stats.monthHours.toFixed(1)}
            unit="hours"
            sub={
              stats.loading
                ? "Loading…"
                : `${stats.monthShifts} completed shift${stats.monthShifts === 1 ? "" : "s"} this month`
            }
            tone="info"
          />
          <StatBlock
            icon={<TrendingUp className="h-6 w-6" />}
            label={`Year-to-date ${year}`}
            value={stats.loading ? "—" : stats.ytdHours.toFixed(1)}
            unit="hours"
            sub={
              stats.loading
                ? "Loading…"
                : `${stats.ytdShifts} completed shift${stats.ytdShifts === 1 ? "" : "s"} this year`
            }
            tone="success"
          />
        </div>
        <Link
          to="/schedule"
          className="flex items-center justify-between border-t bg-muted/30 px-4 py-2 text-sm font-medium text-primary hover:bg-muted/60"
        >
          <span>Only "Completed" shifts count toward your hours.</span>
          <span className="flex items-center gap-1">
            View schedule
            <ChevronRight className="h-4 w-4" />
          </span>
        </Link>
      </div>
    </section>
  );
}

function StatBlock({
  icon,
  label,
  value,
  unit,
  sub,
  tone,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  unit: string;
  sub: string;
  tone: "info" | "success";
}) {
  const toneClasses =
    tone === "info"
      ? "bg-info/15 text-info"
      : "bg-success/15 text-success";
  return (
    <div className="flex items-start gap-4 rounded-xl border bg-background p-4">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-lg ${toneClasses}`}>
        {icon}
      </div>
      <div className="min-w-0">
        <div className="text-sm text-muted-foreground">{label}</div>
        <div className="flex items-baseline gap-1">
          <span className="text-3xl font-bold tabular-nums">{value}</span>
          <span className="text-sm text-muted-foreground">{unit}</span>
        </div>
        <div className="text-xs text-muted-foreground">{sub}</div>
      </div>
    </div>
  );
}
