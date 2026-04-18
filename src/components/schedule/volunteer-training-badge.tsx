import { useEffect, useState } from "react";
import { ShieldCheck, ShieldAlert, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { supabase } from "@/integrations/supabase/client";
import { getExpirationStatus } from "@/lib/training";

interface MissingCert {
  code: string;
  name: string;
  status: "missing" | "expired";
}

interface CacheEntry {
  loading: boolean;
  missing: MissingCert[];
}

// Module-level cache so the same volunteer isn't queried multiple times per render pass.
const cache = new Map<string, Promise<MissingCert[]>>();

async function fetchMissing(userId: string): Promise<MissingCert[]> {
  let promise = cache.get(userId);
  if (promise) return promise;

  promise = (async () => {
    const [coursesRes, recordsRes] = await Promise.all([
      supabase
        .from("training_courses")
        .select("id, code, name")
        .eq("required", true)
        .eq("active", true),
      supabase
        .from("training_records")
        .select("course_id, completion_date, expiration_date")
        .eq("user_id", userId),
    ]);

    const courses = coursesRes.data ?? [];
    const records = recordsRes.data ?? [];

    const latest = new Map<
      string,
      { expiration_date: string | null; completion_date: string }
    >();
    for (const r of records) {
      const prev = latest.get(r.course_id);
      if (!prev || new Date(r.completion_date) > new Date(prev.completion_date)) {
        latest.set(r.course_id, {
          expiration_date: r.expiration_date,
          completion_date: r.completion_date,
        });
      }
    }

    const result: MissingCert[] = [];
    for (const c of courses) {
      const rec = latest.get(c.id);
      if (!rec) {
        result.push({ code: c.code, name: c.name, status: "missing" });
        continue;
      }
      const status = getExpirationStatus({ expiration_date: rec.expiration_date });
      if (status === "expired") {
        result.push({ code: c.code, name: c.name, status: "expired" });
      }
    }
    return result;
  })();

  cache.set(userId, promise);
  return promise;
}

export function clearVolunteerTrainingCache() {
  cache.clear();
}

export function VolunteerTrainingBadge({ userId }: { userId: string }) {
  const [state, setState] = useState<CacheEntry>({ loading: true, missing: [] });

  useEffect(() => {
    let cancelled = false;
    fetchMissing(userId).then((missing) => {
      if (!cancelled) setState({ loading: false, missing });
    });
    return () => {
      cancelled = true;
    };
  }, [userId]);

  if (state.loading) {
    return (
      <Badge variant="outline" className="gap-1 text-xs font-normal">
        <Loader2 className="h-3 w-3 animate-spin" />
        Checking…
      </Badge>
    );
  }

  const compliant = state.missing.length === 0;

  return (
    <TooltipProvider delayDuration={150}>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge
            className={
              compliant
                ? "gap-1 bg-emerald-600 text-white hover:bg-emerald-600 text-xs font-normal"
                : "gap-1 bg-destructive text-destructive-foreground hover:bg-destructive text-xs font-normal"
            }
          >
            {compliant ? (
              <ShieldCheck className="h-3 w-3" />
            ) : (
              <ShieldAlert className="h-3 w-3" />
            )}
            {compliant
              ? "Training current"
              : `${state.missing.length} cert${state.missing.length === 1 ? "" : "s"} needed`}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="top" className="max-w-xs">
          {compliant ? (
            <p className="text-xs">All required certifications are current.</p>
          ) : (
            <div className="space-y-1">
              <p className="text-xs font-semibold">Required training not current:</p>
              <ul className="space-y-0.5 text-xs">
                {state.missing.map((m) => (
                  <li key={m.code}>
                    <span className="font-mono">{m.code}</span> — {m.name}{" "}
                    <span className="opacity-70">
                      ({m.status === "expired" ? "expired" : "missing"})
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
