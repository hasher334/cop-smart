import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Award, Loader2, Trophy, Medal } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authed/leaderboard")({
  head: () => ({ meta: [{ title: "Leaderboard — CopSmart" }] }),
  component: LeaderboardPage,
});

const MILESTONES = [50, 100, 250, 500];

function shiftHours(start: string, end: string): number {
  const [sh, sm] = start.split(":").map(Number);
  const [eh, em] = end.split(":").map(Number);
  let mins = eh * 60 + em - (sh * 60 + sm);
  if (mins <= 0) mins += 24 * 60;
  return mins / 60;
}

function tierFor(hours: number): number {
  let tier = 0;
  for (const m of MILESTONES) if (hours >= m) tier = m;
  return tier;
}

interface Row {
  user_id: string;
  full_name: string;
  badge_no: string;
  rank: string | null;
  ytdHours: number;
  lifetimeHours: number;
  shifts: number;
}

function LeaderboardPage() {
  const auth = useAuth();
  const [rows, setRows] = useState<Row[] | null>(null);
  const [scope, setScope] = useState<"ytd" | "lifetime">("ytd");

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const yearStart = `${new Date().getFullYear()}-01-01`;
      const [shiftsRes, profilesRes] = await Promise.all([
        supabase
          .from("patrol_shifts")
          .select("start_time,end_time,shift_date,volunteer_1,volunteer_2")
          .eq("status", "completed"),
        supabase
          .from("profiles")
          .select("user_id,full_name,badge_no,rank,status")
          .neq("status", "pending"),
      ]);
      if (cancelled) return;

      const map = new Map<string, Row>();
      for (const p of profilesRes.data ?? []) {
        map.set(p.user_id, {
          user_id: p.user_id,
          full_name: p.full_name,
          badge_no: p.badge_no,
          rank: p.rank,
          ytdHours: 0,
          lifetimeHours: 0,
          shifts: 0,
        });
      }
      for (const s of shiftsRes.data ?? []) {
        const hrs = shiftHours(s.start_time, s.end_time);
        const isYtd = s.shift_date >= yearStart;
        for (const uid of [s.volunteer_1, s.volunteer_2]) {
          if (!uid) continue;
          const r = map.get(uid);
          if (!r) continue;
          r.lifetimeHours += hrs;
          if (isYtd) r.ytdHours += hrs;
          r.shifts += 1;
        }
      }
      setRows(
        Array.from(map.values()).filter(
          (r) => r.lifetimeHours > 0 || r.ytdHours > 0,
        ),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const sorted = (rows ?? [])
    .slice()
    .sort((a, b) =>
      scope === "ytd"
        ? b.ytdHours - a.ytdHours
        : b.lifetimeHours - a.lifetimeHours,
    );

  return (
    <PageShell
      title="Leaderboard"
      subtitle="Recognizing our most active volunteers."
      crumbs={[{ label: "Leaderboard" }]}
    >
      <div className="mb-4 flex gap-2">
        <button
          onClick={() => setScope("ytd")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            scope === "ytd"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          Year to Date
        </button>
        <button
          onClick={() => setScope("lifetime")}
          className={`rounded-md px-4 py-2 text-sm font-semibold transition ${
            scope === "lifetime"
              ? "bg-primary text-primary-foreground"
              : "bg-muted text-muted-foreground hover:bg-muted/70"
          }`}
        >
          Lifetime
        </button>
      </div>

      {rows === null ? (
        <Card className="p-8">
          <div className="flex items-center justify-center gap-2 text-muted-foreground">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading leaderboard…
          </div>
        </Card>
      ) : sorted.length === 0 ? (
        <Card className="p-8 text-center text-muted-foreground">
          No completed shifts yet.
        </Card>
      ) : (
        <Card className="overflow-hidden">
          <ul className="divide-y">
            {sorted.map((r, idx) => {
              const hours = scope === "ytd" ? r.ytdHours : r.lifetimeHours;
              const tier = tierFor(r.lifetimeHours);
              const isMe = r.user_id === auth.user?.id;
              return (
                <li
                  key={r.user_id}
                  className={`flex items-center gap-4 p-4 ${
                    isMe ? "bg-primary/5" : ""
                  }`}
                >
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-muted font-bold">
                    {idx === 0 ? (
                      <Trophy className="h-5 w-5 text-yellow-500" />
                    ) : idx === 1 ? (
                      <Medal className="h-5 w-5 text-slate-400" />
                    ) : idx === 2 ? (
                      <Medal className="h-5 w-5 text-amber-700" />
                    ) : (
                      <span className="text-sm">{idx + 1}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="truncate font-semibold">
                        {r.full_name}
                      </span>
                      {isMe && (
                        <Badge variant="secondary" className="text-[10px]">
                          You
                        </Badge>
                      )}
                      {tier > 0 && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-yellow-500/20 to-amber-500/20 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                          <Award className="h-3 w-3" />
                          {tier} hr
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      <span className="font-mono">#{r.badge_no}</span>
                      {r.rank && <> &middot; {r.rank}</>}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-mono text-lg font-bold">
                      {hours.toFixed(1)}
                    </p>
                    <p className="text-[10px] uppercase tracking-wide text-muted-foreground">
                      hours
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>
        </Card>
      )}
    </PageShell>
  );
}
