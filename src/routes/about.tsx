import { createFileRoute, Link } from "@tanstack/react-router";
import { ShieldCheck, Heart, Users, Lightbulb } from "lucide-react";
import { MarketingShell, SectionEyebrow, SerifHeading } from "@/components/marketing/marketing-shell";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About — VolCop" },
      { name: "description", content: "VolCop builds volunteer management software exclusively for law enforcement and government agencies. Learn our story and values." },
      { property: "og:title", content: "About — VolCop" },
      { property: "og:description", content: "Software built by people who understand sworn agencies and the volunteers who serve them." },
    ],
  }),
  component: AboutPage,
});

function AboutPage() {
  return (
    <MarketingShell>
      <section className="py-20 lg:py-28 border-b border-[#0D141E]/10">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 grid lg:grid-cols-12 gap-12">
          <div className="lg:col-span-5">
            <SectionEyebrow>Our Story</SectionEyebrow>
            <SerifHeading as="h1" className="text-5xl lg:text-6xl mt-6 text-balance">
              Software built by people who actually run volunteer units.
            </SerifHeading>
          </div>
          <div className="lg:col-span-7 space-y-6 text-lg text-[#4B5563] leading-relaxed lg:pt-8">
            <p>
              VolCop was founded after years of watching dedicated volunteer
              coordinators wrestle with spreadsheets, paper sign-up sheets,
              and consumer apps that weren't built for sworn agencies.
            </p>
            <p>
              Our founders worked alongside sworn law enforcement volunteer
              services divisions to build CopSmart from the
              ground up. Every feature reflects a real problem we watched a
              real coordinator solve the hard way.
            </p>
            <p>
              Today VolCop serves agencies across Florida, with a roadmap
              shaped by the working coordinators who use our software every
              shift.
            </p>
          </div>
        </div>
      </section>

      <section className="py-20 border-b border-[#0D141E]/10">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8">
          <SectionEyebrow>What We Believe</SectionEyebrow>
          <SerifHeading className="text-4xl lg:text-5xl mt-4 mb-12 max-w-3xl">
            Four principles that guide every release.
          </SerifHeading>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px bg-[#0D141E]/10 border border-[#0D141E]/10">
            {[
              { Icon: ShieldCheck, t: "Mission first", b: "Volunteers exist to serve their communities. Software should disappear into the background." },
              { Icon: Heart, t: "Respect the volunteer", b: "Most volunteers are seniors. Big text, clear flows, no clever UI tricks." },
              { Icon: Users, t: "Built with coordinators", b: "Every feature is shaped by a working coordinator, not a product manager." },
              { Icon: Lightbulb, t: "Conservative innovation", b: "We adopt new tech only when it makes the agency's life measurably better." },
            ].map(({ Icon, t, b }) => (
              <div key={t} className="bg-white p-8">
                <Icon className="h-7 w-7 text-[#B48A44]" strokeWidth={1.75} />
                <SerifHeading as="h3" className="text-xl mt-5">{t}</SerifHeading>
                <p className="mt-2 text-sm text-[#4B5563] leading-relaxed">{b}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="mx-auto max-w-[1440px] px-6 lg:px-8 text-center">
          <SerifHeading className="text-3xl lg:text-4xl">Talk to the people who built it.</SerifHeading>
          <p className="mt-4 text-[#4B5563] text-lg max-w-xl mx-auto">
            We don't have a sales floor. Demos are run by our team directly.
          </p>
          <Link to="/demo" className="mt-8 inline-flex items-center gap-2 bg-[#13243A] text-white px-7 py-3.5 text-sm font-bold uppercase tracking-wide hover:bg-[#0D141E]">
            Request a Demo
          </Link>
        </div>
      </section>
    </MarketingShell>
  );
}
