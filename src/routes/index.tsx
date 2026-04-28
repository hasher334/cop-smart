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
import { HeroSlideRotator } from "@/components/marketing/hero-slide-rotator";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VolCop — Volunteer Software for Law Enforcement" },
      {
        name: "description",
        content:
          "VolCop builds custom volunteer management software for law enforcement and government agencies. Meet VolSmart — our flagship platform for rosters, training, scheduling, and fleet.",
      },
      { property: "og:title", content: "VolCop — Volunteer Software for Law Enforcement" },
      {
        property: "og:description",
        content:
          "Custom volunteer management software for agencies. Meet VolSmart — request a live demo.",
      },
    ],
  }),
  component: HomePage,
});

function HomePage() {
  const navigate = useNavigate();

  // If a VolSmart user is already signed in, send them to the app
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
                The VolSmart Standard
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
                Launch VolSmart
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

          {/* RIGHT — Live VolSmart slide */}
          <div className="lg:col-span-7 relative">
            {/* Floating metadata badges */}
            <div className="hidden lg:flex absolute -top-4 left-4 z-20 items-center gap-2 px-3 py-1.5 bg-[#0B1828]/80 backdrop-blur border border-[#B48A44]/40 text-[10px] font-mono uppercase tracking-widest text-[#B48A44]">
              <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Live · VolSmart v2.4
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

              {/* Slide content — auto-rotating VolSmart preview */}
              <div className="bg-gradient-to-br from-[#F3F1EC] via-white to-[#F3F1EC] text-[#0D141E] relative overflow-hidden">
                {/* Decorative grid */}
                <div
                  className="absolute inset-0 opacity-[0.04] pointer-events-none"
                  style={{
                    backgroundImage:
                      "linear-gradient(to right, #13243A 1px, transparent 1px), linear-gradient(to bottom, #13243A 1px, transparent 1px)",
                    backgroundSize: "32px 32px",
                  }}
                />
                <div className="absolute -top-20 -right-20 size-64 rounded-full bg-[#B48A44]/10 blur-3xl pointer-events-none" />

                {/* Slide header */}
                <div className="relative px-8 pt-7 pb-5 border-b border-[#0D141E]/10">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-px w-6 bg-[#B48A44]" />
                    <span className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#B48A44]">
                      Inside VolSmart
                    </span>
                  </div>
                  <h3 className="font-['Libre_Baskerville',serif] text-2xl text-[#13243A] leading-tight">
                    See it in action.
                  </h3>
                  <p className="text-[11px] text-[#4B5563] mt-1.5 max-w-md">
                    Three views from the live platform — schedule, roster, and
                    training compliance.
                  </p>
                </div>

                <HeroSlideRotator />
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
                requirements in mind. VolCop was. Every workflow in VolSmart
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
              <span className="block">Inside VolSmart</span>
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
                See VolSmart with your agency's data.
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
                Explore VolSmart First
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
