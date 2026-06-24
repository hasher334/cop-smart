import { createFileRoute, Link } from "@tanstack/react-router";
import { ArrowRight, ShieldCheck, CheckCircle2, ExternalLink } from "lucide-react";
import { MarketingShell, SectionEyebrow, SerifHeading } from "@/components/marketing/marketing-shell";

export const Route = createFileRoute("/product")({
  head: () => ({
    meta: [
      { title: "VolSmart — The Flagship Platform from VolCop" },
      { name: "description", content: "VolSmart is VolCop's flagship volunteer management platform for law enforcement agencies. Try the live demo or request a guided walkthrough." },
      { property: "og:title", content: "VolSmart — Flagship Platform from VolCop" },
      { property: "og:description", content: "The complete volunteer management platform for law enforcement. See it live." },
      { property: "og:url", content: "https://volcop.com/product" },
    ],
    links: [{ rel: "canonical", href: "https://volcop.com/product" }],
    scripts: [
      {
        type: "application/ld+json",
        children: JSON.stringify({
          "@context": "https://schema.org",
          "@type": "Product",
          name: "VolSmart",
          brand: { "@type": "Brand", name: "VolCop" },
          description:
            "VolSmart is a unified volunteer management platform for law enforcement agencies covering rosters, scheduling, training, fleet, hours, and dispatch.",
          url: "https://volcop.com/product",
          category: "Volunteer Management Software",
        }),
      },
    ],
  }),
  component: ProductPage,
});

function ProductPage() {
  return (
    <MarketingShell>
      {/* Hero */}
      <section className="border-b border-[#0D141E]/10 py-20 lg:py-28">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 grid lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-6">
            <SectionEyebrow>The Flagship Platform</SectionEyebrow>
            <SerifHeading as="h1" className="text-5xl lg:text-7xl mt-6 text-balance">
              VolSmart.
            </SerifHeading>
            <p className="mt-6 text-xl text-[#4B5563] leading-relaxed max-w-2xl">
              The complete operational record for your volunteer unit. Roster,
              scheduling, training, fleet, hours, and dispatch — unified in one
              auditable system trusted by sworn agencies to manage their
              auxiliary volunteer programs.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link to="/demo" className="inline-flex items-center gap-2 bg-[#13243A] text-white px-7 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-[#0D141E]">
                Request Live Demo <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/login" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-bold uppercase tracking-wide text-[#13243A] border border-[#0D141E]/20 hover:border-[#B48A44] hover:text-[#B48A44]">
                Explore the App <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
          <div className="lg:col-span-6">
            <div className="bg-[#13243A] text-white p-8 lg:p-10 border border-[#13243A]">
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="h-6 w-6 text-[#B48A44]" />
                <span className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">In Production</span>
              </div>
              <SerifHeading as="h2" className="text-3xl text-white">
                Trusted by Sworn Agencies
              </SerifHeading>
              <p className="mt-4 text-white/80 leading-relaxed">
                VolSmart powers daily operations for volunteer services divisions
                — managing hundreds of citizen observer patrol members, vehicle
                fleets, and recurring training cycles.
              </p>
              <div className="mt-8 grid grid-cols-3 gap-px bg-white/10 border border-white/10">
                <div className="bg-[#13243A] p-4">
                  <div className="text-xs uppercase text-white/60 tracking-wider">Volunteers</div>
                  <div className="text-2xl font-semibold tabular-nums mt-1">200+</div>
                </div>
                <div className="bg-[#13243A] p-4">
                  <div className="text-xs uppercase text-white/60 tracking-wider">Vehicles</div>
                  <div className="text-2xl font-semibold tabular-nums mt-1">25+</div>
                </div>
                <div className="bg-[#13243A] p-4">
                  <div className="text-xs uppercase text-white/60 tracking-wider">Hours/yr</div>
                  <div className="text-2xl font-semibold tabular-nums text-[#B48A44] mt-1">40k</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What you get */}
      <section className="py-20 border-b border-[#0D141E]/10">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 mb-12">
            <div className="lg:col-span-4">
              <SectionEyebrow>What's Included</SectionEyebrow>
              <SerifHeading className="text-4xl mt-4">
                A full operating system for your auxiliary unit.
              </SerifHeading>
            </div>
            <div className="lg:col-span-8 grid sm:grid-cols-2 gap-x-8 gap-y-4">
              {[
                "Web app + mobile-responsive — works on any device",
                "Role-based access (Admin, Officer, Corporal+, Volunteer)",
                "Live dispatch and scheduling board",
                "Training catalog with expiration alerts",
                "Fleet inventory and service tracking",
                "Hours reports for grant compliance",
                "Monthly leaderboards and milestone badges",
                "Document library with role restrictions",
                "Audit log of every roster, shift, and training change",
                "CJIS-aware data handling and encrypted transport",
                "Dedicated onboarding & data migration",
                "US-based support from working coordinators",
              ].map((b) => (
                <div key={b} className="flex items-start gap-3 text-[#0D141E]">
                  <CheckCircle2 className="h-5 w-5 text-[#B48A44] mt-0.5 shrink-0" />
                  <span>{b}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Try It */}
      <section className="py-20 bg-white/40 border-b border-[#0D141E]/10">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 text-center">
          <SectionEyebrow>Two Ways to Experience VolSmart</SectionEyebrow>
          <SerifHeading className="text-4xl lg:text-5xl mt-6">
            Pick your route in.
          </SerifHeading>
          <div className="mt-12 grid md:grid-cols-2 gap-px bg-[#0D141E]/10 border border-[#0D141E]/10 max-w-5xl mx-auto text-left">
            <div className="bg-white p-10">
              <div className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">Option A — Recommended</div>
              <SerifHeading as="h3" className="text-2xl mt-3">Guided live demo</SerifHeading>
              <p className="mt-3 text-[#4B5563] leading-relaxed">
                30-minute walkthrough with our team. We'll seed sample data
                that matches your agency size, answer questions, and discuss
                how VolSmart fits your existing SOPs.
              </p>
              <Link to="/demo" className="mt-6 inline-flex items-center gap-2 bg-[#13243A] text-white px-6 py-3 text-sm font-bold uppercase tracking-wide hover:bg-[#0D141E]">
                Request a Demo <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="bg-white p-10">
              <div className="text-xs font-bold uppercase tracking-widest text-[#4B5563]">Option B</div>
              <SerifHeading as="h3" className="text-2xl mt-3">Open the live app</SerifHeading>
              <p className="mt-3 text-[#4B5563] leading-relaxed">
                VolSmart is in production today. If your agency already has
                credentials, sign in directly. New visitors should book a demo
                first so we can provision a sandbox account.
              </p>
              <Link to="/login" className="mt-6 inline-flex items-center gap-2 px-6 py-3 text-sm font-bold uppercase tracking-wide text-[#13243A] border border-[#0D141E]/20 hover:border-[#B48A44] hover:text-[#B48A44]">
                Open VolSmart <ExternalLink className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture / trust */}
      <section className="py-20">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <SectionEyebrow>Built Right</SectionEyebrow>
            <SerifHeading className="text-4xl mt-4">Modern stack. Conservative defaults.</SerifHeading>
          </div>
          <div className="lg:col-span-7 space-y-6 text-[#4B5563] text-lg leading-relaxed">
            <p>
              VolSmart runs on a modern, fully-managed cloud backend with
              row-level security on every table. Your roster data is isolated
              per agency and never co-mingled.
            </p>
            <p>
              Every write — a shift assignment, a training record, a profile
              edit — is captured in an append-only audit log. Reports can be
              generated at any time for grant compliance, FOIA requests, or
              internal review.
            </p>
            <p>
              We handle data migration from spreadsheets, paper rosters, or
              your existing system as part of onboarding.
            </p>
          </div>
        </div>
      </section>
    </MarketingShell>
  );
}
