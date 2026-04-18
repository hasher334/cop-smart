import { useEffect, useState } from "react";
import { Trophy, Sparkles } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

function shiftHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60;
  return mins / 60;
}

interface Winner {
  user_id: string;
  full_name: string;
  badge_no: string;
  rank: string | null;
  hours: number;
  shifts: number;
}

export function VolunteerOfMonthWidget() {
  const [winner, setWinner] = useState<Winner | null>(null);
  const [loading, setLoading] = useState(true);
  const [monthLabel, setMonthLabel] = useState("");

  useEffect(() => {
    (async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 1);
      const startStr = start.toISOString().slice(0, 10);
      const endStr = end.toISOString().slice(0, 10);
      setMonthLabel(
        start.toLocaleDateString(undefined, { month: "long", year: "numeric" }),
      );

      const { data: shifts } = await supabase
        .from("patrol_shifts")
        .select("start_time,end_time,volunteer_1,volunteer_2")
        .eq("status", "completed")
        .gte("shift_date", startStr)
        .lt("shift_date", endStr);

      const totals = new Map<string, { hours: number; shifts: number }>();
      for (const s of shifts ?? []) {
        const hrs = shiftHours(s.start_time, s.end_time);
        for (const uid of [s.volunteer_1, s.volunteer_2]) {
          if (!uid) continue;
          const t = totals.get(uid) ?? { hours: 0, shifts: 0 };
          t.hours += hrs;
          t.shifts += 1;
          totals.set(uid, t);
        }
      }

      let topId: string | null = null;
      let topHours = 0;
      let topShifts = 0;
      for (const [uid, t] of totals) {
        if (t.hours > topHours) {
          topId = uid;
          topHours = t.hours;
          topShifts = t.shifts;
        }
      }

      if (!topId) {
        setLoading(false);
        return;
      }

      const { data: profile } = await supabase
        .from("profiles")
        .select("user_id,full_name,badge_no,rank")
        .eq("user_id", topId)
        .maybeSingle();

      if (profile) {
        setWinner({
          user_id: profile.user_id,
          full_name: profile.full_name,
          badge_no: profile.badge_no,
          rank: profile.rank,
          hours: topHours,
          shifts: topShifts,
        });
      }
      setLoading(false);
    })();
  }, []);

  if (loading || !winner) return null;

  return (
    <section aria-label="Volunteer of the Month" className="mb-8">
      <div className="relative overflow-hidden rounded-2xl border border-gold bg-gradient-to-br from-gold/15 via-card to-card p-6 shadow-card">
        <Sparkles className="absolute right-4 top-4 h-6 w-6 text-gold/50" />
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-gold text-gold-foreground shadow-elevated">
            <Trophy className="h-8 w-8" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-gold">
              Volunteer of the Month &middot; {monthLabel}
            </p>
            <h3 className="mt-1 truncate text-2xl font-bold text-foreground">
              {winner.full_name}
            </h3>
            <p className="text-sm text-muted-foreground">
              <span className="font-mono">#{winner.badge_no}</span>
              {winner.rank && <> &middot; {winner.rank}</>}
            </p>
          </div>
          <div className="flex gap-6 sm:flex-col sm:items-end sm:gap-1 sm:border-l sm:border-gold/30 sm:pl-6">
            <div>
              <p className="font-mono text-2xl font-bold text-primary">
                {winner.hours.toFixed(1)}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                hours
              </p>
            </div>
            <div>
              <p className="font-mono text-2xl font-bold text-primary">
                {winner.shifts}
              </p>
              <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                shifts
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
