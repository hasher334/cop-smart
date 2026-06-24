import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Shield,
  LogIn,
  UserPlus,
  Calendar,
  Clock,
  GraduationCap,
  Radio,
  Award,
  FileText,
  Car,
  Users,
  Building2,
  HeartHandshake,
  Mail,
  MapPin,
  ClipboardCheck,
  Facebook,
} from "lucide-react";

export const Route = createFileRoute("/copsmart")({
  head: () => ({
    meta: [
      { title: "VolSmart — Volunteer Portal" },
      {
        name: "description",
        content:
          "Sign in to VolSmart to view your schedule, log hours, track training, and stay connected with your unit.",
      },
      { property: "og:title", content: "VolSmart — Volunteer Portal" },
      {
        property: "og:description",
        content:
          "The volunteer portal for sworn-agency volunteer programs. Schedules, hours, training, and dispatch in one place.",
      },
    ],
  }),
  component: VolSmartLanding,
});

const HIGHLIGHTS = [
  {
    icon: Calendar,
    title: "Your Schedule",
    desc: "See upcoming shifts, claim open patrols, and request time off.",
  },
  {
    icon: Clock,
    title: "Hours Tracking",
    desc: "Log hours the moment you finish a shift and watch your totals climb.",
  },
  {
    icon: GraduationCap,
    title: "Training Status",
    desc: "Stay current on required certifications with expiration reminders.",
  },
  {
    icon: Radio,
    title: "Live Dispatch",
    desc: "Receive assignments and updates from command in real time.",
  },
  {
    icon: Award,
    title: "Recognition",
    desc: "Earn milestones and see where you rank among your unit.",
  },
  {
    icon: FileText,
    title: "Forms & Resources",
    desc: "Submit reports and access SOPs, contacts, and reference docs.",
  },
];

const STATS = [
  { value: "1,500+", label: "Active Volunteers" },
  { value: "100+", label: "Specialized Units" },
  { value: "3–12", label: "Hours / Week (C.O.P.)" },
  { value: "0", label: "Prior Experience Required" },
];

const OPPORTUNITIES = [
  {
    icon: Car,
    title: "Citizen Observer Patrol (C.O.P.)",
    desc: "Be the eyes and ears of the Sheriff's Office — patrol your neighborhood in marked vehicles and report suspicious activity to 9-1-1. Typically 3–12 hours per week plus a monthly meeting.",
  },
  {
    icon: Users,
    title: "Volunteer Mounted Unit",
    desc: "Horse owners ride alongside deputies for neighborhood patrols, parades, and special events. Must be 21+, hold a valid driver's license, and have access to a horse.",
  },
  {
    icon: Building2,
    title: "Administrative & Clerical",
    desc: "Support detectives, the crime lab, vehicle maintenance, or general office operations — vital roles that keep the agency running.",
  },
  {
    icon: HeartHandshake,
    title: "Community Events",
    desc: "Lead and support initiatives like Shop With a Volunteer (holiday shopping for children) and back-to-school backpack drives.",
  },
];

function VolSmartLanding() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <header className="border-b-4 border-gold bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/copsmart" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-primary">
              <Shield className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-xl font-bold">VolSmart</div>
              <div className="text-xs text-primary-foreground/80">Volunteer Services</div>
            </div>
          </Link>
          <nav className="flex items-center gap-2">
            <Link
              to="/login"
              className="hidden items-center gap-2 rounded-md border border-primary-foreground/30 px-4 py-2 text-sm font-semibold hover:bg-primary-foreground/10 sm:inline-flex"
            >
              <LogIn className="h-4 w-4" />
              Sign In
            </Link>
            <Link
              to="/signup"
              className="inline-flex items-center gap-2 rounded-md bg-gold px-4 py-2 text-sm font-semibold text-primary hover:bg-gold/90"
            >
              <UserPlus className="h-4 w-4" />
              Create Account
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero — Tactical Authenticator */}
      <section className="relative overflow-hidden bg-primary py-16 text-primary-foreground md:py-24">
        {/* Ambient glows */}
        <div className="pointer-events-none absolute right-1/4 top-0 h-[40rem] w-[40rem] rounded-full bg-gold/10 blur-[120px]" />
        <div className="pointer-events-none absolute bottom-0 left-1/4 h-[30rem] w-[30rem] rounded-full bg-gold/5 blur-[100px]" />
        {/* Grid mask */}
        <div
          className="pointer-events-none absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "4rem 4rem",
            maskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 100%)",
            WebkitMaskImage:
              "radial-gradient(ellipse 60% 60% at 50% 50%, #000 10%, transparent 100%)",
          }}
        />

        <div className="relative mx-auto grid max-w-7xl grid-cols-1 gap-12 px-4 lg:grid-cols-12 lg:gap-16">
          {/* Left: Authenticator panel */}
          <div className="flex flex-col justify-center lg:col-span-5">
            <div className="relative rounded-2xl border border-white/10 bg-primary/60 p-8 shadow-2xl ring-1 ring-white/5 backdrop-blur-xl lg:p-10">
              {/* Top edge highlight */}
              <div className="absolute left-0 top-0 h-px w-full bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

              <div className="mb-8">
                <div className="mb-4 flex items-center gap-3">
                  <div className="flex size-7 items-center justify-center rounded-sm border-2 border-gold/80">
                    <Shield className="size-4 text-gold" strokeWidth={2.5} />
                  </div>
                  <h1 className="font-display text-2xl font-bold tracking-tight text-white">
                    VolSmart — Secure Volunteer Operations Terminal
                  </h1>
                </div>
                <h2 className="font-mono text-xs uppercase tracking-widest text-primary-foreground/60">
                  Volunteer Operations Terminal
                </h2>
                <p className="mt-3 max-w-[40ch] text-sm leading-relaxed text-primary-foreground/70">
                  Secure access portal for active civilian support personnel.
                  Sign in to manage your shifts, hours, training, and assignments.
                </p>
              </div>

              <div className="space-y-3">
                <Link
                  to="/login"
                  className="group inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg bg-gold text-base font-semibold text-primary shadow-elevated transition hover:bg-gold/90"
                >
                  <LogIn className="h-5 w-5" />
                  Sign In with Badge Number
                </Link>
                <Link
                  to="/signup"
                  className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-lg border border-white/15 bg-white/5 text-base font-medium text-primary-foreground transition hover:border-gold/40 hover:bg-white/10"
                >
                  <UserPlus className="h-5 w-5" />
                  Create an Account
                </Link>
              </div>

              <div className="mt-6 flex items-center justify-between border-t border-white/10 pt-5">
                <p className="font-mono text-xs text-primary-foreground/50">
                  Unregistered personnel?
                </p>
                <span className="font-mono text-xs text-primary-foreground/70">
                  Speak with your unit coordinator
                </span>
              </div>
            </div>
          </div>

          {/* Right: Briefing media */}
          <div className="flex flex-col justify-center lg:col-span-7">
            {/* Metadata bar */}
            <div className="mb-3 flex items-end justify-between px-1">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <span className="size-1.5 animate-pulse rounded-full bg-emerald-400" />
                  <span className="font-mono text-xs uppercase tracking-wider text-primary-foreground/60">
                    System Online
                  </span>
                </div>
                <span className="font-mono text-xs text-primary-foreground/30">
                  |
                </span>
                <span className="font-mono text-xs uppercase tracking-wider text-primary-foreground/50">
                  Node: Alpha-7
                </span>
              </div>
              <span className="rounded-sm border border-gold/30 bg-gold/10 px-2 py-0.5 font-mono text-xs uppercase tracking-widest text-gold">
                Clearance: General
              </span>
            </div>

            {/* Media frame */}
            <div className="group relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl">
              {/* Corner markers */}
              <div className="absolute left-0 top-0 z-20 h-4 w-4 border-l border-t border-white/30" />
              <div className="absolute right-0 top-0 z-20 h-4 w-4 border-r border-t border-white/30" />
              <div className="absolute bottom-0 left-0 z-20 h-4 w-4 border-b border-l border-white/30" />
              <div className="absolute bottom-0 right-0 z-20 h-4 w-4 border-b border-r border-white/30" />

              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/Xh52ZRmCeTo?autoplay=1&mute=1&loop=1&playlist=Xh52ZRmCeTo&controls=0&modestbranding=1&playsinline=1&rel=0"
                title="VolSmart orientation briefing"
                allow="autoplay; encrypted-media; picture-in-picture"
                allowFullScreen
              />
            </div>

            <div className="mt-4 px-1">
              <h3 className="font-display text-lg font-medium text-white">
                Orientation Briefing
              </h3>
              <p className="font-mono text-sm text-primary-foreground/60">
                Recommended viewing for new volunteers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Highlights */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Everything you need on one screen
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
              VolSmart was built with volunteers in mind — large buttons, clear
              status, and no jargon.
            </p>
          </div>
          <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {HIGHLIGHTS.map((h) => (
              <div
                key={h.title}
                className="rounded-xl border-2 border-border bg-card p-6 shadow-sm transition hover:border-gold hover:shadow-elevated"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  <h.icon className="h-6 w-6" />
                </div>
                <h3 className="mt-4 font-display text-xl font-semibold">{h.title}</h3>
                <p className="mt-2 text-base text-muted-foreground">{h.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y-2 border-gold/30 bg-card py-10">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 md:grid-cols-4">
          {STATS.map((s) => (
            <div key={s.label} className="text-center">
              <div className="font-display text-4xl font-bold text-primary md:text-5xl">
                {s.value}
              </div>
              <div className="mt-1 text-sm font-medium uppercase tracking-wide text-muted-foreground">
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Volunteer Opportunities */}
      <section className="bg-background py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              Ways to Volunteer
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
              From neighborhood patrols to mounted units to community events — there's
              a role that fits your time, talent, and interests.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-2">
            {OPPORTUNITIES.map((o) => (
              <div
                key={o.title}
                className="flex gap-5 rounded-xl border-2 border-border bg-card p-6 shadow-sm transition hover:border-gold hover:shadow-elevated"
              >
                <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-lg bg-primary text-gold">
                  <o.icon className="h-7 w-7" />
                </div>
                <div>
                  <h3 className="font-display text-xl font-semibold">{o.title}</h3>
                  <p className="mt-2 text-base text-muted-foreground">{o.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How to Join */}
      <section className="bg-card py-16">
        <div className="mx-auto max-w-6xl px-4">
          <div className="text-center">
            <h2 className="font-display text-3xl font-bold md:text-4xl">
              How to Join
            </h2>
            <p className="mx-auto mt-3 max-w-2xl text-base text-muted-foreground">
              No prior law-enforcement experience required — all training is provided
              at the Volunteer Training Center in Greenacres.
            </p>
          </div>
          <div className="mt-12 grid gap-6 md:grid-cols-3">
            <div className="rounded-xl border-2 border-border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-gold">
                <ClipboardCheck className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">1. Apply</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Complete the Volunteer Security Application and pass a background check.
              </p>
              <a
                href="https://pbso-application.pdffiller.com/"
                target="_blank"
                rel="noopener noreferrer"
                className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-primary hover:underline"
              >
                Start application →
              </a>
            </div>
            <div className="rounded-xl border-2 border-border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-gold">
                <GraduationCap className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">2. Train</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Attend orientation and role-specific training. PBSO provides
                everything you need to get started.
              </p>
            </div>
            <div className="rounded-xl border-2 border-border bg-background p-6">
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-gold">
                <Shield className="h-6 w-6" />
              </div>
              <h3 className="mt-4 font-display text-xl font-semibold">3. Serve</h3>
              <p className="mt-2 text-base text-muted-foreground">
                Receive your assignment and start making an impact in your community.
              </p>
            </div>
          </div>

          {/* Training Center & Contact */}
          <div className="mt-10 grid gap-6 rounded-xl border-2 border-gold/30 bg-background p-6 md:grid-cols-3">
            <div className="flex gap-3">
              <MapPin className="h-5 w-5 shrink-0 text-gold" />
              <div>
                <div className="font-semibold">Training Center</div>
                <div className="text-sm text-muted-foreground">
                  301 Swain Blvd
                  <br />
                  Greenacres, FL 33463
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  Mon–Thu, 9:30 a.m. – 2:30 p.m.
                </div>
              </div>
            </div>
            <div className="flex gap-3">
              <Mail className="h-5 w-5 shrink-0 text-gold" />
              <div>
                <div className="font-semibold">Contact</div>
                <a
                  href="mailto:volunteer@pbso.org"
                  className="text-sm text-primary hover:underline"
                >
                  volunteer@pbso.org
                </a>
              </div>
            </div>
            <div className="flex gap-3">
              <Facebook className="h-5 w-5 shrink-0 text-gold" />
              <div>
                <div className="font-semibold">Community</div>
                <a
                  href="https://www.facebook.com/groups/PBSOVolunteers/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-sm text-primary hover:underline"
                >
                  PBSO Volunteer Unit Group
                </a>
                <div className="mt-1 text-sm text-muted-foreground">
                  Equipment & uniforms supported by{" "}
                  <a
                    href="https://www.friendsofthevolunteers.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary hover:underline"
                  >
                    Friends of the Volunteers
                  </a>
                  .
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>


      <section className="border-t-4 border-gold bg-primary py-12 text-primary-foreground">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-6 px-4 text-center md:flex-row md:text-left">
          <div>
            <h2 className="font-display text-2xl font-bold md:text-3xl">
              Ready to get started?
            </h2>
            <p className="mt-1 text-primary-foreground/80">
              Sign in with your badge number to head to your dashboard.
            </p>
          </div>
          <Link
            to="/login"
            className="inline-flex h-14 items-center gap-2 rounded-md bg-gold px-8 text-base font-semibold text-primary shadow-elevated hover:bg-gold/90"
          >
            <LogIn className="h-5 w-5" />
            Sign In
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-card py-6">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-2 px-4 text-sm text-muted-foreground sm:flex-row">
          <span>© {new Date().getFullYear()} VolSmart Volunteer Services.</span>
          <span>
            Powered by{" "}
            <Link to="/" className="font-semibold text-primary hover:underline">
              VolCop
            </Link>
          </span>
        </div>
      </footer>
    </div>
  );
}
