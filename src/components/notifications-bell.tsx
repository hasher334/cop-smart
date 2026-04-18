import { useEffect, useMemo, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Bell, AlertTriangle, Clock, ShieldAlert, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import { daysUntilExpiration } from "@/lib/training";
import { formatShortDate } from "@/lib/format";

interface ExpiringRow {
  id: string;
  course_id: string;
  expiration_date: string;
  required: boolean;
  code: string;
  name: string;
}

interface Notification {
  id: string;
  type: "expired" | "expiring";
  title: string;
  body: string;
  days: number;
}

const HORIZON_DAYS = 30;
const DISMISS_KEY = "copsmart:dismissed-notifications";

function loadDismissed(): Set<string> {
  if (typeof window === "undefined") return new Set();
  try {
    const raw = window.localStorage.getItem(DISMISS_KEY);
    if (!raw) return new Set();
    return new Set(JSON.parse(raw) as string[]);
  } catch {
    return new Set();
  }
}

function saveDismissed(set: Set<string>) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(DISMISS_KEY, JSON.stringify(Array.from(set)));
}

function horizonISO(): string {
  const d = new Date();
  d.setDate(d.getDate() + HORIZON_DAYS);
  return d.toISOString().slice(0, 10);
}

export function NotificationsBell() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [dismissed, setDismissed] = useState<Set<string>>(() => loadDismissed());
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    (async () => {
      const { data } = await supabase
        .from("training_records")
        .select(
          "id, course_id, expiration_date, training_courses!inner(code, name, required, active)"
        )
        .eq("user_id", user.id)
        .eq("training_courses.required", true)
        .eq("training_courses.active", true)
        .not("expiration_date", "is", null)
        .lte("expiration_date", horizonISO())
        .order("expiration_date", { ascending: true });

      if (cancelled) return;

      const rows = (data ?? []) as unknown as Array<{
        id: string;
        course_id: string;
        expiration_date: string;
        training_courses: { code: string; name: string };
      }>;

      const latest = new Map<string, ExpiringRow>();
      for (const r of rows) {
        const prev = latest.get(r.course_id);
        if (!prev || new Date(r.expiration_date) > new Date(prev.expiration_date)) {
          latest.set(r.course_id, {
            id: r.id,
            course_id: r.course_id,
            expiration_date: r.expiration_date,
            required: true,
            code: r.training_courses.code,
            name: r.training_courses.name,
          });
        }
      }

      const notes: Notification[] = Array.from(latest.values()).map((r) => {
        const days = daysUntilExpiration(r.expiration_date);
        const expired = days < 0;
        return {
          id: `cert:${r.course_id}:${r.expiration_date}`,
          type: expired ? "expired" : "expiring",
          title: expired
            ? `${r.code} expired`
            : `${r.code} expires in ${days} day${days === 1 ? "" : "s"}`,
          body: `${r.name} — ${formatShortDate(r.expiration_date)}`,
          days,
        };
      });

      setNotifications(notes);
    })();

    return () => {
      cancelled = true;
    };
  }, [user]);

  const visible = useMemo(
    () => notifications.filter((n) => !dismissed.has(n.id)),
    [notifications, dismissed]
  );

  const dismiss = (id: string) => {
    const next = new Set(dismissed);
    next.add(id);
    setDismissed(next);
    saveDismissed(next);
  };

  const dismissAll = () => {
    const next = new Set(dismissed);
    visible.forEach((n) => next.add(n.id));
    setDismissed(next);
    saveDismissed(next);
  };

  if (!user) return null;

  const count = visible.length;

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="secondary"
          size="icon"
          className="relative h-12 w-12"
          aria-label={`Notifications${count > 0 ? ` (${count} unread)` : ""}`}
        >
          <Bell className="h-5 w-5" />
          {count > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-destructive-foreground">
              {count > 9 ? "9+" : count}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-96 p-0">
        <div className="flex items-center justify-between border-b px-4 py-3">
          <div className="flex items-center gap-2">
            <Bell className="h-4 w-4" />
            <h3 className="font-semibold">Notifications</h3>
          </div>
          {count > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={dismissAll}
              className="h-auto px-2 py-1 text-xs"
            >
              Mark all read
            </Button>
          )}
        </div>

        {count === 0 ? (
          <div className="flex flex-col items-center gap-2 px-4 py-8 text-center text-sm text-muted-foreground">
            <ShieldAlert className="h-8 w-8 opacity-40" />
            <p>You're all caught up.</p>
            <p className="text-xs">
              We'll notify you when a required certification is within 30 days of
              expiration.
            </p>
          </div>
        ) : (
          <ul className="max-h-96 divide-y overflow-y-auto">
            {visible.map((n) => {
              const expired = n.type === "expired";
              return (
                <li key={n.id} className="group relative">
                  <Link
                    to="/training"
                    onClick={() => setOpen(false)}
                    className="flex items-start gap-3 px-4 py-3 pr-10 transition hover:bg-accent/40"
                  >
                    <div
                      className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                        expired
                          ? "bg-destructive/15 text-destructive"
                          : "bg-amber-500/15 text-amber-600"
                      }`}
                    >
                      {expired ? (
                        <AlertTriangle className="h-4 w-4" />
                      ) : (
                        <Clock className="h-4 w-4" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p
                        className={`text-sm font-semibold ${
                          expired ? "text-destructive" : ""
                        }`}
                      >
                        {n.title}
                      </p>
                      <p className="text-xs text-muted-foreground">{n.body}</p>
                    </div>
                  </Link>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      dismiss(n.id);
                    }}
                    className="absolute right-2 top-3 rounded p-1 text-muted-foreground opacity-0 transition hover:bg-muted hover:text-foreground group-hover:opacity-100"
                    aria-label="Dismiss notification"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </li>
              );
            })}
          </ul>
        )}

        <div className="border-t bg-muted/30 px-4 py-2 text-center">
          <Link
            to="/training"
            onClick={() => setOpen(false)}
            className="text-xs font-medium text-primary hover:underline"
          >
            View all training
          </Link>
        </div>
      </PopoverContent>
    </Popover>
  );
}
