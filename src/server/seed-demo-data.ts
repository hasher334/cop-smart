// Seeds a complete demo dataset spanning every role.
// Creates 8 demo auth users (admin, 2 officers, 2 corporals, 3 volunteers),
// then upserts profiles, role assignments, completed/upcoming shifts, training
// records, and a couple of announcements. Idempotent — safe to re-run.

import { createServerFn } from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";
import { badgeToEmail } from "@/lib/auth-helpers";

interface DemoUser {
  badge: string;
  full_name: string;
  rank: string | null;
  role: "admin" | "officer" | "corporal_plus" | "volunteer";
  unit_code: string;
  phone: string;
}

const DEMO_PASSWORD = "demo1234";

const DEMO_USERS: DemoUser[] = [
  { badge: "D100", full_name: "Demo Admin Sarah Chen",     rank: "Captain",    role: "admin",         unit_code: "HQ",  phone: "555-0100" },
  { badge: "D201", full_name: "Demo Officer Marcus Reed",  rank: "Lieutenant", role: "officer",       unit_code: "D1",  phone: "555-0201" },
  { badge: "D202", full_name: "Demo Officer Priya Patel",  rank: "Lieutenant", role: "officer",       unit_code: "D2",  phone: "555-0202" },
  { badge: "D301", full_name: "Demo Corporal James Wu",    rank: "Corporal",   role: "corporal_plus", unit_code: "D3",  phone: "555-0301" },
  { badge: "D302", full_name: "Demo Corporal Lena Diaz",   rank: "Corporal",   role: "corporal_plus", unit_code: "SE",  phone: "555-0302" },
  { badge: "D401", full_name: "Demo Volunteer Tom Becker", rank: null,         role: "volunteer",     unit_code: "D1",  phone: "555-0401" },
  { badge: "D402", full_name: "Demo Volunteer Aisha Khan", rank: null,         role: "volunteer",     unit_code: "D2",  phone: "555-0402" },
  { badge: "D403", full_name: "Demo Volunteer Raj Singh",  rank: null,         role: "volunteer",     unit_code: "OFC", phone: "555-0403" },
];

export const seedDemoData = createServerFn({ method: "POST" }).handler(
  async () => {
    // 1. Look up units
    const { data: units, error: unitsErr } = await supabaseAdmin
      .from("units")
      .select("id,code");
    if (unitsErr) throw new Error(`units: ${unitsErr.message}`);
    const unitByCode = new Map((units ?? []).map((u) => [u.code, u.id]));

    // 2. Look up training courses
    const { data: courses, error: coursesErr } = await supabaseAdmin
      .from("training_courses")
      .select("id,code");
    if (coursesErr) throw new Error(`courses: ${coursesErr.message}`);
    const courseByCode = new Map((courses ?? []).map((c) => [c.code, c.id]));

    // 3. List all auth users once so we can detect existing demo accounts
    const { data: list, error: listErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 500 });
    if (listErr) throw new Error(`list: ${listErr.message}`);

    // 4. Create or update each demo user
    const userIds: Record<string, string> = {};
    let usersCreated = 0;
    let usersUpdated = 0;

    for (const u of DEMO_USERS) {
      const email = badgeToEmail(u.badge);
      const existing = list.users.find(
        (x) => x.email?.toLowerCase() === email.toLowerCase(),
      );

      let userId: string;
      if (existing) {
        const { error } = await supabaseAdmin.auth.admin.updateUserById(
          existing.id,
          {
            password: DEMO_PASSWORD,
            email_confirm: true,
            user_metadata: { badge_no: u.badge, full_name: u.full_name },
          },
        );
        if (error) throw new Error(`update ${u.badge}: ${error.message}`);
        userId = existing.id;
        usersUpdated++;
      } else {
        const { data: created, error } =
          await supabaseAdmin.auth.admin.createUser({
            email,
            password: DEMO_PASSWORD,
            email_confirm: true,
            user_metadata: { badge_no: u.badge, full_name: u.full_name },
          });
        if (error || !created.user)
          throw new Error(`create ${u.badge}: ${error?.message ?? "no user"}`);
        userId = created.user.id;
        usersCreated++;
      }
      userIds[u.badge] = userId;

      // Upsert profile fields
      await supabaseAdmin.from("profiles").upsert(
        {
          user_id: userId,
          badge_no: u.badge,
          full_name: u.full_name,
          email,
          phone: u.phone,
          rank: u.rank,
          status: "active",
          home_unit_id: unitByCode.get(u.unit_code) ?? null,
        },
        { onConflict: "user_id" },
      );

      // Ensure correct role assignment (and only that role)
      await supabaseAdmin
        .from("user_roles")
        .delete()
        .eq("user_id", userId)
        .neq("role", u.role);
      await supabaseAdmin
        .from("user_roles")
        .upsert(
          { user_id: userId, role: u.role },
          { onConflict: "user_id,role" },
        );
    }

    // 5. Seed training records (idempotent: use deterministic IDs so re-running
    //    upserts in place rather than duplicating).
    const cprId = courseByCode.get("CPR");
    const faId = courseByCode.get("FA");
    if (cprId && faId) {
      const today = new Date();
      const monthsAgo = (n: number) => {
        const d = new Date(today);
        d.setMonth(d.getMonth() - n);
        return d.toISOString().slice(0, 10);
      };
      const monthsAhead = (n: number) => {
        const d = new Date(today);
        d.setMonth(d.getMonth() + n);
        return d.toISOString().slice(0, 10);
      };
      const daysAhead = (n: number) => {
        const d = new Date(today);
        d.setDate(d.getDate() + n);
        return d.toISOString().slice(0, 10);
      };

      const trainingRows: Array<{
        id: string;
        user_id: string;
        course_id: string;
        completion_date: string;
        expiration_date: string;
        instructor: string;
      }> = [
        { id: "33333333-3333-3333-3333-333333330001", user_id: userIds.D201, course_id: cprId, completion_date: monthsAgo(6),  expiration_date: monthsAhead(18), instructor: "Red Cross" },
        { id: "33333333-3333-3333-3333-333333330002", user_id: userIds.D202, course_id: cprId, completion_date: monthsAgo(11), expiration_date: monthsAhead(13), instructor: "Red Cross" },
        { id: "33333333-3333-3333-3333-333333330003", user_id: userIds.D301, course_id: faId,  completion_date: monthsAgo(8),  expiration_date: monthsAhead(16), instructor: "Local FD" },
        { id: "33333333-3333-3333-3333-333333330004", user_id: userIds.D302, course_id: faId,  completion_date: monthsAgo(23), expiration_date: daysAhead(20),   instructor: "Local FD" }, // expiring soon
        { id: "33333333-3333-3333-3333-333333330005", user_id: userIds.D401, course_id: cprId, completion_date: monthsAgo(4),  expiration_date: monthsAhead(20), instructor: "Red Cross" },
        { id: "33333333-3333-3333-3333-333333330006", user_id: userIds.D402, course_id: faId,  completion_date: monthsAgo(14), expiration_date: monthsAhead(10), instructor: "Local FD" },
      ];
      await supabaseAdmin
        .from("training_records")
        .upsert(trainingRows, { onConflict: "id" });
    }

    // 6. Seed shifts (completed last month + upcoming)
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const today = new Date();
    const lastMonthDay = (offset: number) => {
      const d = new Date(today.getFullYear(), today.getMonth() - 1, offset);
      return fmt(d);
    };
    const futureDay = (offset: number) => {
      const d = new Date(today);
      d.setDate(d.getDate() + offset);
      return fmt(d);
    };

    const d1 = unitByCode.get("D1");
    const d2 = unitByCode.get("D2");
    const d3 = unitByCode.get("D3");
    const se = unitByCode.get("SE");
    const hq = unitByCode.get("HQ");

    if (d1 && d2 && d3 && se && hq) {
      const shifts: Array<{
        id: string;
        unit_id: string;
        shift_date: string;
        start_time: string;
        end_time: string;
        patrol_type: "patrol" | "special_event" | "training" | "meeting" | "other";
        status: "open" | "reserved" | "on_duty" | "completed" | "cancelled";
        volunteer_1: string | null;
        volunteer_2: string | null;
        patrol_area: string;
      }> = [
        // Completed last month
        { id: "22222222-2222-2222-2222-222222220001", unit_id: d1, shift_date: lastMonthDay(5),  start_time: "08:00", end_time: "14:00", patrol_type: "patrol",        status: "completed", volunteer_1: userIds.D401, volunteer_2: userIds.D301, patrol_area: "North district" },
        { id: "22222222-2222-2222-2222-222222220002", unit_id: d2, shift_date: lastMonthDay(10), start_time: "14:00", end_time: "20:00", patrol_type: "patrol",        status: "completed", volunteer_1: userIds.D402, volunteer_2: userIds.D302, patrol_area: "Downtown" },
        { id: "22222222-2222-2222-2222-222222220003", unit_id: se, shift_date: lastMonthDay(15), start_time: "18:00", end_time: "23:00", patrol_type: "special_event", status: "completed", volunteer_1: userIds.D401, volunteer_2: null,         patrol_area: "Stadium event" },
        { id: "22222222-2222-2222-2222-222222220004", unit_id: d3, shift_date: lastMonthDay(18), start_time: "06:00", end_time: "12:00", patrol_type: "patrol",        status: "completed", volunteer_1: userIds.D402, volunteer_2: userIds.D403, patrol_area: "Eastside" },
        { id: "22222222-2222-2222-2222-222222220005", unit_id: d1, shift_date: lastMonthDay(22), start_time: "20:00", end_time: "02:00", patrol_type: "patrol",        status: "completed", volunteer_1: userIds.D401, volunteer_2: userIds.D301, patrol_area: "Overnight north" },
        { id: "22222222-2222-2222-2222-222222220006", unit_id: hq, shift_date: lastMonthDay(25), start_time: "09:00", end_time: "17:00", patrol_type: "training",      status: "completed", volunteer_1: userIds.D403, volunteer_2: null,         patrol_area: "Training session" },
        // Upcoming
        { id: "22222222-2222-2222-2222-222222220007", unit_id: d1, shift_date: futureDay(2),  start_time: "08:00", end_time: "14:00", patrol_type: "patrol",        status: "open",     volunteer_1: null,         volunteer_2: null, patrol_area: "North district" },
        { id: "22222222-2222-2222-2222-222222220008", unit_id: d2, shift_date: futureDay(4),  start_time: "14:00", end_time: "20:00", patrol_type: "patrol",        status: "reserved", volunteer_1: userIds.D401, volunteer_2: null, patrol_area: "Downtown" },
        { id: "22222222-2222-2222-2222-222222220009", unit_id: se, shift_date: futureDay(7),  start_time: "17:00", end_time: "22:00", patrol_type: "special_event", status: "open",     volunteer_1: null,         volunteer_2: null, patrol_area: "Concert detail" },
        { id: "22222222-2222-2222-2222-222222220010", unit_id: d3, shift_date: futureDay(10), start_time: "06:00", end_time: "12:00", patrol_type: "patrol",        status: "open",     volunteer_1: null,         volunteer_2: null, patrol_area: "Eastside" },
      ];
      await supabaseAdmin
        .from("patrol_shifts")
        .upsert(shifts, { onConflict: "id" });
    }

    // 7. Demo announcements
    await supabaseAdmin.from("announcements").upsert(
      [
        {
          id: "44444444-4444-4444-4444-444444440001",
          title: "Welcome to the demo dataset",
          body: "Eight demo volunteers spanning every role have been added so you can preview Officer, Corporal, and Volunteer experiences side-by-side. Sign in with any demo badge (D100, D201, D301, D401…) and password demo1234.",
          pinned: true,
          expires_at: null,
        },
        {
          id: "44444444-4444-4444-4444-444444440002",
          title: "Annual training reminder",
          body: "All volunteers should review their CPR and First Aid expiration dates on the Training page.",
          pinned: false,
          expires_at: null,
        },
      ],
      { onConflict: "id" },
    );

    return {
      ok: true,
      usersCreated,
      usersUpdated,
      password: DEMO_PASSWORD,
      badges: DEMO_USERS.map((u) => ({
        badge: u.badge,
        role: u.role,
        name: u.full_name,
      })),
    };
  },
);
