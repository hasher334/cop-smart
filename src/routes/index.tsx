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
      <section className="relative overflow-hidden border-b border-[#0D141E]/10 bg-gradient-to-br from-[#0B1828] via-[#13243A] to-[#0B1828] text-white">
        {/* Ambient background */}
        <div
          className="absolute inset-0 opacity-[0.07] pointer-events-none"
          style={{
            backgroundImage:
              "linear-gradient(to right, #B48A44 1px, transparent 1px), linear-gradient(to bottom, #B48A44 1px, transparent 1px)",
            backgroundSize: "64px 64px",
            maskImage:
              "radial-gradient(ellipse at 70% 40%, black 30%, transparent 75%)",
          }}
        />
        <div className="absolute -top-40 -right-40 size-[600px] rounded-full bg-[#B48A44]/10 blur-3xl pointer-events-none" />
        <div className="absolute -bottom-40 -left-40 size-[500px] rounded-full bg-[#B48A44]/5 blur-3xl pointer-events-none" />

        <div className="relative mx-auto max-w-[1440px] px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-12 py-20 lg:py-28 items-center">
          {/* LEFT — Copy */}
          <div className="lg:col-span-5 flex flex-col gap-7">
            <div className="flex items-center gap-3">
              <div className="h-px w-8 bg-[#B48A44]" />
              <span className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">
                The CopSmart Standard
              </span>
            </div>
            <h1 className="font-['Libre_Baskerville',serif] text-5xl lg:text-6xl text-balance leading-[1.1] text-white">
              Deploy your volunteers with absolute certainty.
            </h1>
            <p className="text-lg text-white/75 max-w-[48ch] leading-relaxed">
              VolCop builds custom volunteer management software for law
              enforcement and government agencies. Centralize rosters,
              clearances, training, scheduling, and fleet — into one immutable
              record.
            </p>
            <div className="flex flex-wrap gap-3 pt-2">
              <Link
                to="/demo"
                className="inline-flex items-center gap-2 bg-[#B48A44] text-[#0B1828] px-7 py-3.5 text-sm font-bold uppercase tracking-wide border border-[#B48A44] hover:bg-white hover:border-white transition-colors"
              >
                Request a Demo
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                to="/copsmart"
                className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-white border border-white/25 hover:border-[#B48A44] hover:text-[#B48A44] transition-colors"
              >
                Launch CopSmart
              </Link>
            </div>
            <div className="pt-8 mt-2 border-t border-white/10 flex items-center gap-5">
              <div className="flex -space-x-2">
                <div className="size-10 bg-white border border-white/20 flex items-center justify-center text-xs font-bold text-[#13243A]">PB</div>
                <div className="size-10 bg-[#1F3552] border border-white/20 flex items-center justify-center text-xs font-bold text-white">DA</div>
                <div className="size-10 bg-[#B48A44] border border-white/20 flex items-center justify-center text-xs font-bold text-white">+14</div>
              </div>
              <p className="text-sm text-white/70">
                Trusted by sworn law enforcement and government agencies.
              </p>
            </div>
          </div>

          {/* RIGHT — Live CopSmart slide */}
          <div className="lg:col-span-7 relative">
            {/* Floating metadata badges */}
            <div className="hidden lg:flex absolute -top-4 left-4 z-20 items-center gap-2 px-3 py-1.5 bg-[#0B1828]/80 backdrop-blur border border-[#B48A44]/40 text-[10px] font-mono uppercase tracking-widest text-[#B48A44]">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live · CopSmart v2.4
            </div>
            <div className="hidden lg:block absolute -bottom-4 right-6 z-20 px-3 py-1.5 bg-[#0B1828]/80 backdrop-blur border border-white/15 text-[10px] font-mono uppercase tracking-widest text-white/70">
              Dashboard · Sector Overview
            </div>

            {/* Browser chrome wrapper */}
            <div className="relative rounded-lg overflow-hidden shadow-2xl shadow-black/50 border border-white/10 bg-[#F3F1EC] rotate-[0.3deg] hover:rotate-0 transition-transform duration-500">
              {/* Chrome bar */}
              <div className="flex items-center gap-2 px-4 py-2.5 bg-[#0B1828] border-b border-white/10">
                <div className="flex gap-1.5">
                  <div className="size-2.5 rounded-full bg-[#FF5F57]" />
                  <div className="size-2.5 rounded-full bg-[#FEBC2E]" />
                  <div className="size-2.5 rounded-full bg-[#28C840]" />
                </div>
                <div className="flex-1 mx-4 px-3 py-1 bg-white/5 border border-white/10 rounded text-[10px] font-mono text-white/50 text-center">
                  copsmart.app/dashboard
                </div>
                <div className="text-[10px] font-mono text-[#B48A44]">SECURE</div>
              </div>

              {/* Slide content — CopSmart dashboard */}
              <div className="bg-[#F3F1EC] text-[#0D141E]">
                {/* App header */}
                <div className="flex items-center justify-between px-5 py-3 bg-[#13243A] text-white border-b-2 border-[#B48A44]">
                  <div className="flex items-center gap-2.5">
                    <div className="size-7 bg-[#B48A44] flex items-center justify-center">
                      <ShieldCheck className="size-4 text-[#0B1828]" strokeWidth={2.5} />
                    </div>
                    <div>
                      <div className="font-['Libre_Baskerville',serif] text-sm leading-tight">CopSmart</div>
                      <div className="text-[9px] uppercase tracking-widest text-[#B48A44]">Volunteer Services</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider text-white/60">
                    <span>Dashboard</span>
                    <span>Roster</span>
                    <span>Schedule</span>
                    <span>Training</span>
                    <span className="size-7 rounded-full bg-[#B48A44] text-[#0B1828] flex items-center justify-center font-bold">MC</span>
                  </div>
                </div>

                {/* KPI strip */}
                <div className="grid grid-cols-4 gap-px bg-[#0D141E]/10">
                  {[
                    { label: "Active Volunteers", value: "142", accent: false },
                    { label: "Shifts This Week", value: "37", accent: false },
                    { label: "Hours YTD", value: "8,420", accent: false },
                    { label: "Expiring Certs", value: "03", accent: true },
                  ].map((k) => (
                    <div key={k.label} className="bg-white p-3">
                      <div className="text-[9px] font-bold uppercase tracking-wider text-[#4B5563]">{k.label}</div>
                      <div className={`text-xl font-semibold tabular-nums mt-1 ${k.accent ? "text-[#B48A44]" : "text-[#13243A]"}`}>{k.value}</div>
                    </div>
                  ))}
                </div>

                {/* Body grid */}
                <div className="grid grid-cols-12 gap-3 p-4 bg-[#F3F1EC]">
                  {/* Roster panel */}
                  <div className="col-span-7 bg-white border border-[#0D141E]/15">
                    <div className="px-4 py-2.5 border-b border-[#0D141E]/10 flex items-center justify-between bg-[#13243A] text-white">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-[#B48A44]">Today's Manifest</div>
                      <div className="text-[9px] font-mono text-white/60">04 ASSIGNED</div>
                    </div>
                    <div className="grid grid-cols-12 gap-2 px-4 py-2 border-b border-[#0D141E]/10 text-[9px] font-bold uppercase tracking-wider text-[#4B5563]">
                      <div className="col-span-3">ID</div>
                      <div className="col-span-5">Personnel</div>
                      <div className="col-span-4 text-right">Assignment</div>
                    </div>
                    {[
                      { id: "AX-992", name: "Callahan, M.", shift: "14:00 · Sec 7", flag: false },
                      { id: "AX-104", name: "Reyes, E.", shift: "16:30 · Event", flag: false },
                      { id: "AX-842", name: "Donovan, J.", shift: "Standby", flag: true },
                      { id: "BX-019", name: "Chen, A.", shift: "08:00 · Traffic", flag: false },
                    ].map((r) => (
                      <div
                        key={r.id}
                        className={`grid grid-cols-12 gap-2 px-4 py-2 border-b border-[#0D141E]/5 items-center text-xs ${r.flag ? "bg-[#B48A44]/10" : ""}`}
                      >
                        <div className={`col-span-3 font-mono tabular-nums text-[10px] ${r.flag ? "text-[#8F6D33]" : "text-[#4B5563]"}`}>{r.id}</div>
                        <div className="col-span-5 font-semibold text-[#13243A] text-[11px]">{r.name}</div>
                        <div className="col-span-4 text-right tabular-nums text-[10px] text-[#4B5563]">{r.shift}</div>
                      </div>
                    ))}
                  </div>

                  {/* Side widgets */}
                  <div className="col-span-5 flex flex-col gap-3">
                    <div className="bg-white border border-[#0D141E]/15 p-3">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-[#B48A44] mb-2">Hours · This Month</div>
                      <div className="flex items-end gap-1 h-14">
                        {[40, 65, 50, 80, 55, 90, 70].map((h, i) => (
                          <div key={i} className="flex-1 bg-[#13243A]" style={{ height: `${h}%` }} />
                        ))}
                      </div>
                      <div className="flex justify-between mt-1.5 text-[8px] font-mono text-[#4B5563]">
                        <span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span><span>W7</span>
                      </div>
                    </div>
                    <div className="bg-[#13243A] text-white p-3">
                      <div className="text-[9px] font-bold uppercase tracking-widest text-[#B48A44] mb-2">Fleet Status</div>
                      <div className="flex items-center justify-between text-[11px]">
                        <div>
                          <div className="font-semibold">12 In Service</div>
                          <div className="text-white/50 text-[10px]">2 maintenance · 1 retired</div>
                        </div>
                        <Car className="size-7 text-[#B48A44]" strokeWidth={1.5} />
                      </div>
                    </div>
                    <div className="bg-white border border-[#B48A44]/40 p-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="text-[9px] font-bold uppercase tracking-widest text-[#8F6D33]">Action Required</div>
                          <div className="text-[11px] font-semibold text-[#13243A] mt-1">3 certs expire in 14 days</div>
                        </div>
                        <div className="size-2 rounded-full bg-[#B48A44] mt-1.5 animate-pulse" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Glow underneath */}
            <div className="absolute inset-x-12 -bottom-8 h-12 bg-[#B48A44]/30 blur-2xl pointer-events-none" />
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
