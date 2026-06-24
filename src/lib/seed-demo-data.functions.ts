// Seeds a complete demo dataset spanning every role.
// Idempotent — safe to re-run. Creates 8 demo auth users, then upserts:
//   • profiles, role assignments
//   • additional units, training courses, vehicles
//   • a year of historical completed shifts (so the leaderboard, hours
//     report, volunteer-of-the-month, and milestone notifications all show
//     meaningful data) plus upcoming open/reserved shifts
//   • training records (mix of valid, expiring soon, and recent)
//   • document/form metadata
//   • announcements

import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
// supabaseAdmin imported lazily inside handler to avoid client bundle leakage.
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

// Additional training courses to make the Training page meaningful
const DEMO_COURSES: Array<{
  id: string;
  code: string;
  name: string;
  category: string;
  required: boolean;
  validity_months: number | null;
  description: string;
}> = [
  { id: "c0000000-0000-0000-0000-000000000001", code: "CPR",      name: "CPR Certification",        category: "safety",   required: true,  validity_months: 24, description: "American Red Cross CPR/AED certification." },
  { id: "c0000000-0000-0000-0000-000000000002", code: "FA",       name: "First Aid",                category: "safety",   required: true,  validity_months: 24, description: "Basic First Aid course." },
  { id: "c0000000-0000-0000-0000-000000000003", code: "RADIO",    name: "Radio Communications",     category: "comms",    required: true,  validity_months: 36, description: "Agency radio procedures and 10-codes." },
  { id: "c0000000-0000-0000-0000-000000000004", code: "DEFDRIVE", name: "Defensive Driving",        category: "patrol",   required: true,  validity_months: 24, description: "Required for all volunteers operating agency vehicles." },
  { id: "c0000000-0000-0000-0000-000000000005", code: "ORIENT",   name: "Volunteer Orientation",    category: "general",  required: true,  validity_months: null, description: "One-time orientation for new volunteers." },
  { id: "c0000000-0000-0000-0000-000000000006", code: "TRAFFIC",  name: "Traffic Direction",        category: "patrol",   required: false, validity_months: 36, description: "Hand signals and intersection control for special events." },
];

// Additional vehicles
const DEMO_VEHICLES: Array<{
  id: string;
  vehicle_no: string;
  make: string;
  model: string;
  year: number;
  license_plate: string;
  status: "in_service" | "out_of_service" | "maintenance" | "retired";
  unit_code: string;
  mileage: number;
  last_service_date: string | null;
  next_service_date: string | null;
}> = [
  { id: "e0000000-0000-0000-0000-000000000001", vehicle_no: "V-201", make: "Ford",      model: "Explorer",  year: 2022, license_plate: "VOL-201", status: "in_service",     unit_code: "D1", mileage: 28450, last_service_date: "2025-09-15", next_service_date: "2026-03-15" },
  { id: "e0000000-0000-0000-0000-000000000002", vehicle_no: "V-202", make: "Ford",      model: "Explorer",  year: 2022, license_plate: "VOL-202", status: "in_service",     unit_code: "D2", mileage: 31200, last_service_date: "2025-10-02", next_service_date: "2026-04-02" },
  { id: "e0000000-0000-0000-0000-000000000003", vehicle_no: "V-203", make: "Chevrolet", model: "Tahoe",     year: 2021, license_plate: "VOL-203", status: "maintenance",    unit_code: "D3", mileage: 47800, last_service_date: "2025-11-20", next_service_date: "2026-05-20" },
  { id: "e0000000-0000-0000-0000-000000000004", vehicle_no: "V-204", make: "Ford",      model: "F-150",     year: 2020, license_plate: "VOL-204", status: "in_service",     unit_code: "SE", mileage: 62100, last_service_date: "2025-08-11", next_service_date: "2026-02-11" },
  { id: "e0000000-0000-0000-0000-000000000005", vehicle_no: "V-205", make: "Dodge",     model: "Charger",   year: 2023, license_plate: "VOL-205", status: "in_service",     unit_code: "HQ", mileage: 12300, last_service_date: "2025-11-01", next_service_date: "2026-05-01" },
  { id: "e0000000-0000-0000-0000-000000000006", vehicle_no: "V-206", make: "Ford",      model: "Explorer",  year: 2019, license_plate: "VOL-206", status: "out_of_service", unit_code: "D1", mileage: 89400, last_service_date: "2025-06-10", next_service_date: null },
];

// Document/form metadata
const DEMO_DOCUMENTS: Array<{
  id: string;
  title: string;
  description: string;
  category: string;
  file_name: string;
  file_path: string;
  file_size: number;
  mime_type: string;
}> = [
  { id: "d0000000-0000-0000-0000-000000000001", title: "Volunteer Application Packet",   description: "Required application packet for new volunteers.",       category: "form",      file_name: "ApplicationForm.pdf",     file_path: "demo/ApplicationForm.pdf",     file_size: 245000, mime_type: "application/pdf" },
  { id: "d0000000-0000-0000-0000-000000000002", title: "Liability Waiver",                description: "Annual waiver — must be on file.",                       category: "waiver",    file_name: "LiabilityWaiver.pdf",     file_path: "demo/LiabilityWaiver.pdf",     file_size: 102000, mime_type: "application/pdf" },
  { id: "d0000000-0000-0000-0000-000000000003", title: "Patrol Vehicle Pre-Trip SOP",     description: "Standard operating procedure for vehicle inspections.",  category: "sop",       file_name: "PreTripSOP.pdf",          file_path: "demo/PreTripSOP.pdf",          file_size: 318000, mime_type: "application/pdf" },
  { id: "d0000000-0000-0000-0000-000000000004", title: "Radio 10-Code Quick Reference",   description: "Pocket reference card for radio communications.",        category: "reference", file_name: "RadioCodes.pdf",          file_path: "demo/RadioCodes.pdf",          file_size: 64000,  mime_type: "application/pdf" },
  { id: "d0000000-0000-0000-0000-000000000005", title: "Incident Report Form",            description: "Use for reporting any incident encountered on patrol.",  category: "form",      file_name: "IncidentReport.pdf",      file_path: "demo/IncidentReport.pdf",      file_size: 88000,  mime_type: "application/pdf" },
  { id: "d0000000-0000-0000-0000-000000000006", title: "Annual Training Schedule",        description: "Calendar of upcoming training sessions.",                category: "training",  file_name: "TrainingSchedule.pdf",    file_path: "demo/TrainingSchedule.pdf",    file_size: 156000, mime_type: "application/pdf" },
];

export const seedDemoData = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .handler(async ({ context }) => {
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");

    // Only admins may seed demo data.
    const { data: isAdmin, error: roleErr } = await context.supabase.rpc(
      "has_role",
      { _user_id: context.userId, _role: "admin" },
    );
    if (roleErr) throw new Error(`role check: ${roleErr.message}`);
    if (!isAdmin) throw new Response("Forbidden", { status: 403 });

    // 1. Look up units
    const { data: units, error: unitsErr } = await supabaseAdmin
      .from("units")
      .select("id,code");
    if (unitsErr) throw new Error(`units: ${unitsErr.message}`);
    const unitByCode = new Map((units ?? []).map((u) => [u.code, u.id]));

    // 2. Upsert demo training courses
    await supabaseAdmin
      .from("training_courses")
      .upsert(
        DEMO_COURSES.map(({ id, code, name, category, required, validity_months, description }) => ({
          id, code, name, category, required, validity_months, description, active: true,
        })),
        { onConflict: "id" },
      );

    // Re-read so we have IDs by code (existing courses may already have different IDs)
    const { data: courses } = await supabaseAdmin
      .from("training_courses")
      .select("id,code");
    const courseByCode = new Map((courses ?? []).map((c) => [c.code, c.id]));

    // 3. Upsert demo vehicles
    const vehicleRows = DEMO_VEHICLES.map((v) => ({
      id: v.id,
      vehicle_no: v.vehicle_no,
      make: v.make,
      model: v.model,
      year: v.year,
      license_plate: v.license_plate,
      status: v.status,
      unit_id: unitByCode.get(v.unit_code) ?? null,
      mileage: v.mileage,
      last_service_date: v.last_service_date,
      next_service_date: v.next_service_date,
    }));
    await supabaseAdmin
      .from("vehicles")
      .upsert(vehicleRows, { onConflict: "id" });

    // 4. List all auth users once so we can detect existing demo accounts
    const { data: list, error: listErr } =
      await supabaseAdmin.auth.admin.listUsers({ page: 1, perPage: 500 });
    if (listErr) throw new Error(`list: ${listErr.message}`);

    // 5. Create or update each demo user
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
          hire_date: "2023-01-15",
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

    // 6. Seed training records for every demo user across multiple courses.
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
      expiration_date: string | null;
      instructor: string;
    }> = [];

    let trainingSeq = 1;
    const addTraining = (
      badge: string,
      code: string,
      completion: string,
      expiration: string | null,
      instructor: string,
    ) => {
      const courseId = courseByCode.get(code);
      const userId = userIds[badge];
      if (!courseId || !userId) return;
      const idx = String(trainingSeq++).padStart(4, "0");
      trainingRows.push({
        id: `33333333-3333-3333-3333-3333333300${idx}`,
        user_id: userId,
        course_id: courseId,
        completion_date: completion,
        expiration_date: expiration,
        instructor,
      });
    };

    // Everyone has orientation (no expiration)
    for (const u of DEMO_USERS) addTraining(u.badge, "ORIENT", monthsAgo(20), null, "Volunteer Services");

    // CPR — most current, one expiring soon
    addTraining("D100", "CPR", monthsAgo(3),  monthsAhead(21), "Red Cross");
    addTraining("D201", "CPR", monthsAgo(6),  monthsAhead(18), "Red Cross");
    addTraining("D202", "CPR", monthsAgo(11), monthsAhead(13), "Red Cross");
    addTraining("D301", "CPR", monthsAgo(2),  monthsAhead(22), "Red Cross");
    addTraining("D302", "CPR", monthsAgo(22), daysAhead(30),   "Red Cross"); // expiring in 30 days
    addTraining("D401", "CPR", monthsAgo(4),  monthsAhead(20), "Red Cross");
    addTraining("D402", "CPR", monthsAgo(8),  monthsAhead(16), "Red Cross");
    addTraining("D403", "CPR", monthsAgo(14), monthsAhead(10), "Red Cross");

    // First Aid — D302 expiring soon
    addTraining("D201", "FA", monthsAgo(8),  monthsAhead(16), "Local FD");
    addTraining("D202", "FA", monthsAgo(5),  monthsAhead(19), "Local FD");
    addTraining("D301", "FA", monthsAgo(8),  monthsAhead(16), "Local FD");
    addTraining("D302", "FA", monthsAgo(23), daysAhead(20),   "Local FD"); // expiring soon
    addTraining("D401", "FA", monthsAgo(7),  monthsAhead(17), "Local FD");
    addTraining("D402", "FA", monthsAgo(14), monthsAhead(10), "Local FD");
    addTraining("D403", "FA", monthsAgo(9),  monthsAhead(15), "Local FD");

    // Radio
    addTraining("D201", "RADIO", monthsAgo(10), monthsAhead(26), "Agency Comms");
    addTraining("D202", "RADIO", monthsAgo(12), monthsAhead(24), "Agency Comms");
    addTraining("D301", "RADIO", monthsAgo(15), monthsAhead(21), "Agency Comms");
    addTraining("D401", "RADIO", monthsAgo(11), monthsAhead(25), "Agency Comms");
    addTraining("D402", "RADIO", monthsAgo(13), monthsAhead(23), "Agency Comms");

    // Defensive Driving
    addTraining("D201", "DEFDRIVE", monthsAgo(9),  monthsAhead(15), "Defensive Driving Course");
    addTraining("D202", "DEFDRIVE", monthsAgo(7),  monthsAhead(17), "Defensive Driving Course");
    addTraining("D301", "DEFDRIVE", monthsAgo(6),  monthsAhead(18), "Defensive Driving Course");
    addTraining("D401", "DEFDRIVE", monthsAgo(10), monthsAhead(14), "Defensive Driving Course");
    addTraining("D402", "DEFDRIVE", monthsAgo(8),  monthsAhead(16), "Defensive Driving Course");

    // Traffic — only a couple of volunteers
    addTraining("D302", "TRAFFIC", monthsAgo(4),  monthsAhead(32), "Traffic Division");
    addTraining("D401", "TRAFFIC", monthsAgo(5),  monthsAhead(31), "Traffic Division");

    if (trainingRows.length > 0) {
      await supabaseAdmin
        .from("training_records")
        .upsert(trainingRows, { onConflict: "id" });
    }

    // 7. Seed a year of completed shifts so the leaderboard, hours report,
    //    Volunteer of the Month, and milestone notifications all show data.
    const fmt = (d: Date) => d.toISOString().slice(0, 10);
    const monthDay = (monthsBack: number, day: number) => {
      const d = new Date(today.getFullYear(), today.getMonth() - monthsBack, day);
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
    const ofc = unitByCode.get("OFC");

    type Shift = {
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
    };

    const shifts: Shift[] = [];
    let shiftSeq = 1;
    const pushShift = (s: Omit<Shift, "id">) => {
      const idx = String(shiftSeq++).padStart(4, "0");
      shifts.push({ id: `22222222-2222-2222-2222-2222222200${idx}`, ...s });
    };

    if (d1 && d2 && d3 && se && hq && ofc) {
      // Build a year of completed shifts. Each entry seeds 2 shifts spread
      // through the month so totals accumulate enough for milestones.
      const monthlyPlan: Array<{
        monthsBack: number;
        entries: Array<{
          unit: string;
          v1: string;
          v2: string | null;
          start: string;
          end: string;
          type: Shift["patrol_type"];
          area: string;
        }>;
      }> = [];

      const units5 = { D1: d1, D2: d2, D3: d3, SE: se, HQ: hq, OFC: ofc } as const;

      // For each of the last 12 months, schedule a varied set of shifts.
      for (let m = 1; m <= 12; m++) {
        monthlyPlan.push({
          monthsBack: m,
          entries: [
            { unit: "D1", v1: "D401", v2: "D301", start: "08:00", end: "14:00", type: "patrol",        area: "North district AM" },
            { unit: "D1", v1: "D401", v2: null,    start: "20:00", end: "23:00", type: "patrol",        area: "North district overnight" },
            { unit: "D2", v1: "D402", v2: "D302", start: "14:00", end: "20:00", type: "patrol",        area: "Downtown PM" },
            { unit: "D2", v1: "D402", v2: null,    start: "09:00", end: "13:00", type: "patrol",        area: "Downtown morning" },
            { unit: "D3", v1: "D403", v2: "D301", start: "06:00", end: "12:00", type: "patrol",        area: "Eastside" },
            { unit: "SE", v1: "D401", v2: "D302", start: "18:00", end: "23:00", type: "special_event", area: "Stadium event" },
            { unit: "HQ", v1: "D403", v2: null,    start: "09:00", end: "13:00", type: "meeting",       area: "Monthly briefing" },
            { unit: "OFC", v1: "D403", v2: null,   start: "10:00", end: "15:00", type: "other",         area: "Office support" },
          ],
        });
      }

      // Spread the entries across days 3, 8, 14, 19, 22, 25, 27, 28 so they
      // land cleanly within any month length.
      const daysInMonth = [3, 8, 14, 19, 22, 25, 27, 28];
      for (const plan of monthlyPlan) {
        plan.entries.forEach((e, i) => {
          pushShift({
            unit_id: units5[e.unit as keyof typeof units5],
            shift_date: monthDay(plan.monthsBack, daysInMonth[i % daysInMonth.length]),
            start_time: e.start,
            end_time: e.end,
            patrol_type: e.type,
            status: "completed",
            volunteer_1: userIds[e.v1] ?? null,
            volunteer_2: e.v2 ? userIds[e.v2] ?? null : null,
            patrol_area: e.area,
          });
        });
      }

      // Upcoming open / reserved shifts
      pushShift({ unit_id: d1, shift_date: futureDay(2),  start_time: "08:00", end_time: "14:00", patrol_type: "patrol",        status: "open",     volunteer_1: null,         volunteer_2: null, patrol_area: "North district" });
      pushShift({ unit_id: d2, shift_date: futureDay(4),  start_time: "14:00", end_time: "20:00", patrol_type: "patrol",        status: "reserved", volunteer_1: userIds.D401, volunteer_2: null, patrol_area: "Downtown" });
      pushShift({ unit_id: se, shift_date: futureDay(7),  start_time: "17:00", end_time: "22:00", patrol_type: "special_event", status: "open",     volunteer_1: null,         volunteer_2: null, patrol_area: "Concert detail" });
      pushShift({ unit_id: d3, shift_date: futureDay(10), start_time: "06:00", end_time: "12:00", patrol_type: "patrol",        status: "open",     volunteer_1: null,         volunteer_2: null, patrol_area: "Eastside" });
      pushShift({ unit_id: hq, shift_date: futureDay(14), start_time: "09:00", end_time: "12:00", patrol_type: "training",      status: "reserved", volunteer_1: userIds.D402, volunteer_2: userIds.D403, patrol_area: "Quarterly training" });

      await supabaseAdmin
        .from("patrol_shifts")
        .upsert(shifts, { onConflict: "id" });
    }

    // 8. Demo documents (form metadata — files don't need to physically exist
    //    for the listing UI to render).
    await supabaseAdmin
      .from("documents")
      .upsert(DEMO_DOCUMENTS, { onConflict: "id" });

    // 9. Demo announcements
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
        {
          id: "44444444-4444-4444-4444-444444440003",
          title: "New vehicles in service",
          body: "Three new Ford Explorers (V-201 through V-203) have been added to the fleet. See the Vehicles page for assignment details.",
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
      shiftsSeeded: shifts.length,
      trainingRecordsSeeded: trainingRows.length,
      vehiclesSeeded: DEMO_VEHICLES.length,
      documentsSeeded: DEMO_DOCUMENTS.length,
      coursesSeeded: DEMO_COURSES.length,
      password: DEMO_PASSWORD,
      badges: DEMO_USERS.map((u) => ({
        badge: u.badge,
        role: u.role,
        name: u.full_name,
      })),
    };
  },
);
