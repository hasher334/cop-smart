import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Users, CalendarClock, GraduationCap, Car, BarChart3, ShieldCheck,
  Bell, FileText, Trophy, Radio, MapPin, Lock, Smartphone, Database,
  Activity, Award, ClipboardList, Building2,
} from "lucide-react";
import { MarketingShell, SectionEyebrow, SerifHeading } from "@/components/marketing/marketing-shell";

export const Route = createFileRoute("/features")({
  head: () => ({
    meta: [
      { title: "Features — CopSmart by VolCop" },
      { name: "description", content: "Every feature inside CopSmart: roster management, scheduling, training, fleet, hours, leaderboards, dispatch, and more." },
      { property: "og:title", content: "Features — CopSmart by VolCop" },
      { property: "og:description", content: "Every feature inside the CopSmart volunteer management platform." },
    ],
  }),
  component: FeaturesPage,
});

const groups = [
  {
    title: "People & Roster",
    items: [
      { Icon: Users, t: "Volunteer Profiles", b: "Badge number, rank, unit, photo, hire date, contact info, and emergency contacts." },
      { Icon: ShieldCheck, t: "Role-Based Access", b: "Admin, Officer, Corporal+, Volunteer — each with permissions matched to your SOPs." },
      { Icon: Building2, t: "Multi-Unit Support", b: "Patrol, Dispatch, Marine, K-9 — every unit has its own roster, fleet, and reports." },
    ],
  },
  {
    title: "Scheduling & Dispatch",
    items: [
      { Icon: CalendarClock, t: "Shift Calendar", b: "Month, week, and list views. Sign-up, reservation, and conflict detection built in." },
      { Icon: Radio, t: "Live Dispatch Board", b: "Active shifts, on-duty volunteers, vehicles in use — refreshed in real time." },
      { Icon: MapPin, t: "Patrol Areas", b: "Assign patrol zones to shifts and track coverage gaps over time." },
    ],
  },
  {
    title: "Training & Compliance",
    items: [
      { Icon: GraduationCap, t: "Course Catalog", b: "CPR, FCIC, Radio Communications, De-escalation — define every required and optional course." },
      { Icon: ClipboardList, t: "Certification Records", b: "Completion dates, expirations, instructors, certificate numbers — searchable history." },
      { Icon: Bell, t: "Expiration Alerts", b: "Volunteers and admins are notified before required training lapses." },
    ],
  },
  {
    title: "Fleet & Equipment",
    items: [
      { Icon: Car, t: "Vehicle Inventory", b: "Make, model, year, plate, VIN, mileage, photo, and current status at a glance." },
      { Icon: Activity, t: "Service Intervals", b: "Last service, next service, mileage triggers — never miss a maintenance window." },
      { Icon: Database, t: "Assignment History", b: "Who drove what, when, and on which shift. Full audit trail." },
    ],
  },
  {
    title: "Recognition & Reporting",
    items: [
      { Icon: BarChart3, t: "Hours Reports", b: "Per-volunteer, per-unit, per-month — exportable for grant reporting and budget meetings." },
      { Icon: Trophy, t: "Leaderboards", b: "Monthly and all-time leaderboards keep volunteers engaged and motivated." },
      { Icon: Award, t: "Milestone Badges", b: "100, 500, 1,000, 5,000 hour milestones recognized automatically on profiles." },
    ],
  },
  {
    title: "Documents & Communication",
    items: [
      { Icon: FileText, t: "Forms Library", b: "Application packets, waivers, SOPs — version-controlled, role-restricted." },
      { Icon: Bell, t: "Announcements", b: "Pinned, expiring, or rolling announcements push to every dashboard." },
      { Icon: Lock, t: "CJIS-Aware Data", b: "RLS policies, audit logs, and encrypted transport. Built with sensitive data in mind." },
    ],
  },
];

function FeaturesPage() {
  return (
    <MarketingShell>
      <section className="py-20 lg:py-24 border-b border-[#0D141E]/10">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 text-center">
          <SectionEyebrow>Platform Features</SectionEyebrow>
          <SerifHeading as="h1" className="text-5xl lg:text-6xl mt-6 max-w-4xl mx-auto text-balance">
            Every workflow your unit needs. None it doesn't.
          </SerifHeading>
          <p className="mt-6 text-lg text-[#4B5563] max-w-2xl mx-auto leading-relaxed">
            CopSmart was specified by working volunteer coordinators and built from the ground up for sworn agencies. Here's everything inside.
          </p>
        </div>
      </section>

      {groups.map((g, gi) => (
        <section key={g.title} className={`py-16 ${gi % 2 === 1 ? "bg-white/40" : ""} border-b border-[#0D141E]/10`}>
          <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
            <SectionEyebrow>{`0${gi + 1} / ${g.title}`}</SectionEyebrow>
            <SerifHeading className="text-3xl lg:text-4xl mt-4 mb-10">{g.title}</SerifHeading>
            <div className="grid md:grid-cols-3 gap-px bg-[#0D141E]/10 border border-[#0D141E]/10">
              {g.items.map(({ Icon, t, b }) => (
                <div key={t} className="bg-white p-7">
                  <Icon className="h-7 w-7 text-[#B48A44]" strokeWidth={1.75} />
                  <SerifHeading as="h3" className="text-xl mt-5">{t}</SerifHeading>
                  <p className="mt-2 text-[#4B5563] leading-relaxed text-sm">{b}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      ))}

      <section className="py-20">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 text-center">
          <SerifHeading className="text-3xl lg:text-4xl">Want to see it live?</SerifHeading>
          <p className="mt-4 text-[#4B5563] text-lg max-w-xl mx-auto">
            Walk through CopSmart with one of our team members.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link to="/demo" className="bg-[#13243A] text-white px-7 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-[#0D141E]">
              Request a Demo
            </Link>
            <Link to="/product" className="px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-[#13243A] border border-[#0D141E]/20 hover:border-[#B48A44] hover:text-[#B48A44]">
              View CopSmart Overview
            </Link>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
