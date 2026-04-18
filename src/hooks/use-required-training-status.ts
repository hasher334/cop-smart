import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { getExpirationStatus } from "@/lib/training";

export interface MissingCert {
  courseId: string;
  code: string;
  name: string;
  status: "missing" | "expired";
  expiration_date: string | null;
}

export interface RequiredTrainingStatus {
  loading: boolean;
  blocked: boolean;
  missing: MissingCert[];
  refresh: () => void;
}

/**
 * Returns the volunteer's compliance with REQUIRED & ACTIVE training courses.
 * `blocked` is true if any required course is missing or expired.
 * Officers/admins are still subject to checks here — gate at the call site if needed.
 */
export function useRequiredTrainingStatus(userId: string | null | undefined): RequiredTrainingStatus {
  const [loading, setLoading] = useState(true);
  const [missing, setMissing] = useState<MissingCert[]>([]);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    if (!userId) {
      setMissing([]);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      setLoading(true);
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

      if (cancelled) return;
      const courses = coursesRes.data ?? [];
      const records = recordsRes.data ?? [];

      // Latest record per course (by completion_date)
      const latestByCourse = new Map<string, { expiration_date: string | null; completion_date: string }>();
      for (const r of records) {
        const prev = latestByCourse.get(r.course_id);
        if (!prev || new Date(r.completion_date) > new Date(prev.completion_date)) {
          latestByCourse.set(r.course_id, {
            expiration_date: r.expiration_date,
            completion_date: r.completion_date,
          });
        }
      }

      const result: MissingCert[] = [];
      for (const c of courses) {
        const rec = latestByCourse.get(c.id);
        if (!rec) {
          result.push({ courseId: c.id, code: c.code, name: c.name, status: "missing", expiration_date: null });
          continue;
        }
        const status = getExpirationStatus({ expiration_date: rec.expiration_date });
        if (status === "expired") {
          result.push({
            courseId: c.id,
            code: c.code,
            name: c.name,
            status: "expired",
            expiration_date: rec.expiration_date,
          });
        }
      }

      setMissing(result);
      setLoading(false);
    })();

    return () => {
      cancelled = true;
    };
  }, [userId, tick]);

  return {
    loading,
    blocked: missing.length > 0,
    missing,
    refresh: () => setTick((t) => t + 1),
  };
}
