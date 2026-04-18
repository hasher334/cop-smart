import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import {
  ShieldCheck,
  Users,
  CalendarClock,
  GraduationCap,
  Car,
  BarChart3,
  ArrowRight,
  CheckCircle2,
} from "lucide-react";
import {
  MarketingShell,
  SectionEyebrow,
  SerifHeading,
} from "@/components/marketing/marketing-shell";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VolCop — Volunteer Software for Law Enforcement" },
      {
        name: "description",
        content:
          "VolCop builds custom volunteer management software for law enforcement and government agencies. Meet CopSmart — our flagship platform for rosters, training, scheduling, and fleet.",
      },
      { property: "og:title", content: "VolCop — Volunteer Software for Law Enforcement" },
      {
        property: "og:description",
        content:
          "Custom volunteer management software for agencies. Meet CopSmart — request a live demo.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();

  // If a CopSmart user is already signed in, send them to the app
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <MarketingShell>
      {/* HERO */}
      <section className="border-b border-[#0D141E]/10">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 py-20 lg:py-28 items-center">
          <div className="lg:col-span-5 flex flex-col gap-7">
            <SectionEyebrow>The CopSmart Standard</SectionEyebrow>
            <SerifHeading as="h1" className="text-5xl lg:text-6xl text-balance">
              Deploy your volunteers with absolute certainty.
            </SerifHeading>
            <p className="text-lg text-[#4B5563] max-w-[48ch] leading-relaxed">
              VolCop builds custom volunteer management software for law
              enforcement and government agencies. Centralize rosters,
              background clearances, training, scheduling, and fleet — into a
              single, immutable record.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 bg-[#13243A] text-white px-7 py-3.5 text-sm font-bold uppercase tracking-wide border border-[#13243A] hover:bg-white hover:text-[#13243A] transition-colors"
              >
                Request a Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/product"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-[#13243A] border border-[#0D141E]/20 hover:border-[#B48A44] hover:text-[#B48A44] transition-colors"
              >
                See CopSmart
              </Link>
            </div>
            <div className="pt-10 mt-2 border-t border-[#0D141E]/10 flex items-center gap-5">
              <div className="flex -space-x-2">
                <div className="size-10 bg-white border border-[#0D141E]/15 flex items-center justify-center text-xs font-bold text-[#13243A]">PB</div>
                <div className="size-10 bg-[#F3F1EC] border border-[#0D141E]/15 flex items-center justify-center text-xs font-bold text-[#13243A]">DA</div>
                <div className="size-10 bg-[#B48A44] border border-[#0D141E]/15 flex items-center justify-center text-xs font-bold text-white">+14</div>
              </div>
              <p className="text-sm text-[#4B5563]">
                Trusted by municipal departments and state agencies across Florida.
              </p>
            </div>
          </div>

          {/* Ledger preview */}
          <div className="lg:col-span-7 relative">
            <div className="absolute -inset-4 border border-[#0D141E]/5 bg-white/40 hidden lg:block" />
            <div className="relative bg-white shadow-sm border border-[#0D141E]/15">
              <div className="p-6 border-b-2 border-[#13243A] bg-[#13243A] text-white flex justify-between items-end">
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest text-[#B48A44] mb-2">
                    Master Manifest
                  </div>
                  <div className="text-2xl font-['Libre_Baskerville',serif]">
                    Metropolitan Division
                  </div>
                </div>
                <div className="text-right text-sm">
                  <div className="text-white/70">Date of Record</div>
                  <div className="font-medium tabular-nums mt-1">Today</div>
                </div>
              </div>
              <div className="grid grid-cols-3 border-b border-[#0D141E]/10 bg-[#F3F1EC]/50">
                <div className="p-4 border-r border-[#0D141E]/10">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">Active Duty</div>
                  <div className="text-2xl font-semibold tabular-nums text-[#13243A] mt-1">142</div>
                </div>
                <div className="p-4 border-r border-[#0D141E]/10">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">Pending</div>
                  <div className="text-2xl font-semibold tabular-nums text-[#13243A] mt-1">18</div>
                </div>
                <div className="p-4">
                  <div className="text-xs font-bold uppercase tracking-wider text-[#4B5563]">Flagged</div>
                  <div className="text-2xl font-semibold tabular-nums text-[#B48A44] mt-1">03</div>
                </div>
              </div>
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#0D141E]/15 text-xs font-bold uppercase tracking-wider text-[#4B5563]">
                <div className="col-span-2">ID No.</div>
                <div className="col-span-4">Personnel</div>
                <div className="col-span-3">Clearance</div>
                <div className="col-span-3 text-right">Assignment</div>
              </div>
              {[
                { id: "AX-992", name: "Callahan, Marcus T.", level: "Level 4", shift: "14:00 — Sector 7", flag: false },
                { id: "AX-104", name: "Reyes, Elena M.", level: "Level 4", shift: "16:30 — Event Detail", flag: false },
                { id: "AX-842", name: "Donovan, James R.", level: "Review Required", shift: "Standby", flag: true },
                { id: "BX-019", name: "Chen, Arthur", level: "Level 3", shift: "08:00 — Traffic", flag: false },
              ].map((r) => (
                <div
                  key={r.id}
                  className={`grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#0D141E]/5 items-center ${r.flag ? "bg-[#B48A44]/5" : ""}`}
                >
                  <div className={`col-span-2 font-mono text-sm tabular-nums ${r.flag ? "text-[#8F6D33]" : "text-[#4B5563]"}`}>{r.id}</div>
                  <div className="col-span-4 font-semibold text-[#13243A]">{r.name}</div>
                  <div className="col-span-3">
                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 bg-white border text-xs font-medium ${r.flag ? "border-[#B48A44]/40 text-[#8F6D33]" : "border-[#0D141E]/20"}`}>
                      <span className={`size-1.5 rounded-full ${r.flag ? "bg-[#B48A44]" : "bg-[#13243A]"}`} />
                      {r.level}
                    </span>
                  </div>
                  <div className="col-span-3 text-right text-sm tabular-nums text-[#4B5563]">{r.shift}</div>
                </div>
              ))}
              <div className="p-4 bg-[#F3F1EC]/30 text-center">
                <Link to="/product" className="text-xs font-bold uppercase tracking-widest text-[#13243A] hover:text-[#B48A44]">
                  See the full platform →
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* WHY VOLCOP */}
      <section className="py-20 lg:py-28 border-b border-[#0D141E]/10">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 mb-16">
            <div className="lg:col-span-5">
              <SectionEyebrow>Why Agencies Choose VolCop</SectionEyebrow>
              <SerifHeading className="text-4xl lg:text-5xl mt-6">
                Built for the chain of command, not for tech bros.
              </SerifHeading>
            </div>
            <div className="lg:col-span-7 lg:pt-12">
              <p className="text-lg text-[#4B5563] leading-relaxed">
                Generic volunteer apps weren't designed with badges, ranks,
                background clearances, patrol vehicles, and FCIC training
                requirements in mind. VolCop was. Every workflow in CopSmart
                reflects how a real auxiliary unit actually operates.
              </p>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-px bg-[#0D141E]/10 border border-[#0D141E]/10">
            {[
              {
                title: "Purpose-built",
                body: "Roles map to your real ranks: Admin, Officer, Corporal+, Volunteer. Permissions match your SOPs.",
              },
              {
                title: "Audit-ready",
                body: "Every shift, training certificate, and roster change is logged. CJIS-aware data handling.",
              },
              {
                title: "Senior-friendly",
                body: "Large type, high contrast, 48px touch targets. Your retired members will actually use it.",
              },
            ].map((c) => (
              <div key={c.title} className="bg-white p-8">
                <SerifHeading as="h3" className="text-2xl">{c.title}</SerifHeading>
                <p className="mt-3 text-[#4B5563] leading-relaxed">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="py-20 lg:py-28 border-b border-[#0D141E]/10 bg-white/40">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
          <div className="text-center mb-16">
            <SectionEyebrow>
              <span className="block">Inside CopSmart</span>
            </SectionEyebrow>
            <SerifHeading className="text-4xl lg:text-5xl mt-6 max-w-3xl mx-auto">
              One platform. Every volunteer workflow.
            </SerifHeading>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { Icon: Users, t: "Roster & Profiles", b: "Badge numbers, ranks, units, photos, hire dates, contact info — searchable and exportable." },
              { Icon: CalendarClock, t: "Scheduling & Dispatch", b: "Calendar view, shift sign-up, dispatch assignment, vehicle pairing, and reservations." },
              { Icon: GraduationCap, t: "Training & Certs", b: "Course catalog, completion records, expiration tracking, and required-training gates." },
              { Icon: Car, t: "Fleet Management", b: "Vehicle inventory, service intervals, mileage, status, and assignment history." },
              { Icon: BarChart3, t: "Hours & Leaderboards", b: "Auto-tallied service hours, monthly leaderboard, milestone badges, and unit comparisons." },
              { Icon: ShieldCheck, t: "Forms & Documents", b: "Centralized SOPs, waivers, application packets, and announcements with role-based access." },
            ].map(({ Icon, t, b }) => (
              <div key={t} className="bg-white border border-[#0D141E]/15 p-7 hover:border-[#B48A44] transition-colors">
                <Icon className="h-7 w-7 text-[#B48A44]" strokeWidth={1.75} />
                <SerifHeading as="h3" className="text-xl mt-5">{t}</SerifHeading>
                <p className="mt-2 text-[#4B5563] leading-relaxed text-sm">{b}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link to="/features" className="inline-flex items-center gap-2 text-sm font-bold uppercase tracking-widest text-[#13243A] hover:text-[#B48A44]">
              See every feature <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* DEMO CTA */}
      <section className="py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
          <div className="bg-[#13243A] text-white border border-[#13243A] p-10 lg:p-16 grid lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-7">
              <div className="flex items-center gap-3 mb-5">
                <div className="h-px w-8 bg-[#B48A44]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">Live Demo Available</span>
              </div>
              <SerifHeading as="h2" className="text-4xl lg:text-5xl text-white">
                See CopSmart with your agency's data.
              </SerifHeading>
              <p className="mt-5 text-white/80 leading-relaxed text-lg max-w-2xl">
                Tell us about your unit. We'll schedule a 30-minute walkthrough
                with seeded sample data that mirrors your size and structure.
              </p>
              <ul className="mt-6 grid sm:grid-cols-2 gap-3 text-sm">
                {[
                  "30-minute live walkthrough",
                  "No commitment, no pricing pitch",
                  "Tailored to your agency size",
                  "Q&A with the founders",
                ].map((b) => (
                  <li key={b} className="flex items-center gap-2 text-white/90">
                    <CheckCircle2 className="h-4 w-4 text-[#B48A44]" />
                    {b}
                  </li>
                ))}
              </ul>
            </div>
            <div className="lg:col-span-5 flex flex-col gap-3">
              <Link
                to="/demo"
                className="bg-[#B48A44] text-[#13243A] px-8 py-4 text-sm font-bold uppercase tracking-wide hover:bg-white transition-colors text-center"
              >
                Request a Demo
              </Link>
              <Link
                to="/product"
                className="border border-white/30 text-white px-8 py-4 text-sm font-bold uppercase tracking-wide hover:bg-white/10 transition-colors text-center"
              >
                Explore CopSmart First
              </Link>
              <Link
                to="/contact"
                className="text-center text-sm text-white/70 hover:text-[#B48A44] mt-2"
              >
                Or contact sales directly →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
