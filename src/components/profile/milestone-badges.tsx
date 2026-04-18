import { useEffect, useState } from "react";
import { Award, Loader2 } from "lucide-react";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";

const MILESTONES = [
  { hours: 50, label: "Bronze Service", className: "from-amber-700 to-amber-500 text-white" },
  { hours: 100, label: "Silver Service", className: "from-slate-400 to-slate-200 text-slate-900" },
  { hours: 250, label: "Gold Service", className: "from-yellow-500 to-yellow-300 text-yellow-950" },
  { hours: 500, label: "Platinum Service", className: "from-cyan-400 to-blue-500 text-white" },
];

function shiftHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60;
  return mins / 60;
}

interface Props {
  userId: string;
}

export function MilestoneBadges({ userId }: Props) {
  const [hours, setHours] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("patrol_shifts")
        .select("start_time,end_time,volunteer_1,volunteer_2")
        .eq("status", "completed")
        .or(`volunteer_1.eq.${userId},volunteer_2.eq.${userId}`);
      if (cancelled) return;
      const total = (data ?? []).reduce(
        (sum, s) => sum + shiftHours(s.start_time, s.end_time),
        0,
      );
      setHours(total);
    })();
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (hours === null) {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading service record…
        </div>
      </Card>
    );
  }

  const earned = MILESTONES.filter((m) => hours >= m.hours);
  const next = MILESTONES.find((m) => hours < m.hours);
  const progress = next
    ? Math.min(100, Math.round((hours / next.hours) * 100))
    : 100;

  return (
    <Card className="p-6">
      <div className="flex items-baseline justify-between">
        <h2 className="text-lg font-semibold">Service Milestones</h2>
        <p className="text-sm text-muted-foreground">
          <span className="font-mono font-semibold text-foreground">
            {hours.toFixed(1)}
          </span>{" "}
          lifetime hours
        </p>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {MILESTONES.map((m) => {
          const has = hours >= m.hours;
          return (
            <div
              key={m.hours}
              className={`relative overflow-hidden rounded-xl border p-3 text-center transition ${
                has
                  ? `bg-gradient-to-br ${m.className} border-transparent shadow-card`
                  : "bg-muted/30 text-muted-foreground"
              }`}
            >
              <Award
                className={`mx-auto h-7 w-7 ${has ? "" : "opacity-40"}`}
              />
              <p className="mt-1 text-xl font-bold">{m.hours}</p>
              <p className="text-[11px] font-medium uppercase tracking-wide">
                {m.label}
              </p>
              {!has && <p className="mt-1 text-[10px]">Locked</p>}
            </div>
          );
        })}
      </div>

      {next ? (
        <div className="mt-5">
          <div className="mb-1 flex justify-between text-xs text-muted-foreground">
            <span>Next: {next.label} ({next.hours} hrs)</span>
            <span>{(next.hours - hours).toFixed(1)} hrs to go</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      ) : (
        <p className="mt-5 text-center text-sm font-semibold text-primary">
          🏅 All milestones earned — outstanding service!
        </p>
      )}

      {earned.length > 0 && (
        <p className="mt-3 text-center text-xs text-muted-foreground">
          {earned.length} of {MILESTONES.length} milestones earned
        </p>
      )}
    </Card>
  );
}
