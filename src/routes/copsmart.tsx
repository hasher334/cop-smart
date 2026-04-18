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
      { title: "CopSmart — Volunteer Portal" },
      {
        name: "description",
        content:
          "Sign in to CopSmart to view your schedule, log hours, track training, and stay connected with your unit.",
      },
      { property: "og:title", content: "CopSmart — Volunteer Portal" },
      {
        property: "og:description",
        content:
          "The volunteer portal for sworn-agency volunteer programs. Schedules, hours, training, and dispatch in one place.",
      },
    ],
  }),
  component: CopSmartLanding,
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

function CopSmartLanding() {
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
              <div className="font-display text-xl font-bold">CopSmart</div>
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

      {/* Hero */}
      <section className="relative overflow-hidden bg-primary text-primary-foreground">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute -top-24 -right-24 h-96 w-96 rounded-full bg-gold blur-3xl" />
          <div className="absolute -bottom-32 -left-24 h-96 w-96 rounded-full bg-gold blur-3xl" />
        </div>
        <div className="relative mx-auto max-w-5xl px-4 py-20 text-center">
          <div className="mx-auto flex h-24 w-24 items-center justify-center rounded-full border-4 border-gold bg-primary-foreground/5">
            <Shield className="h-14 w-14 text-gold" strokeWidth={2.2} />
          </div>
          <h1 className="mt-8 text-center font-display text-6xl font-bold leading-[1.05] tracking-tight drop-shadow-[0_4px_24px_rgba(0,0,0,0.45)] md:text-7xl lg:text-8xl">
            <span className="block text-white">Welcome to</span>
            <span className="mt-2 block bg-gradient-to-r from-gold via-gold to-gold/80 bg-clip-text text-transparent">
              CopSmart
            </span>
          </h1>
          <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-foreground/80 md:text-xl">
            The volunteer portal for your agency. Sign in to manage your shifts, hours,
            training, and assignments — all in one place.
          </p>
          <div className="mx-auto mt-10 aspect-video w-full max-w-3xl overflow-hidden rounded-xl border-2 border-gold/40 shadow-elevated">
            <iframe
              className="h-full w-full"
              src="https://www.youtube.com/embed/Xh52ZRmCeTo?autoplay=1&mute=1&loop=1&playlist=Xh52ZRmCeTo&controls=0&modestbranding=1&playsinline=1&rel=0"
              title="CopSmart preview video"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
          <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
            <Link
              to="/login"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-md bg-gold px-8 text-base font-semibold text-primary shadow-elevated hover:bg-gold/90 sm:w-auto"
            >
              <LogIn className="h-5 w-5" />
              Sign In with Badge Number
            </Link>
            <Link
              to="/signup"
              className="inline-flex h-14 w-full items-center justify-center gap-2 rounded-md border-2 border-primary-foreground/40 px-8 text-base font-semibold hover:bg-primary-foreground/10 sm:w-auto"
            >
              <UserPlus className="h-5 w-5" />
              Create an Account
            </Link>
          </div>
          <p className="mt-6 text-sm text-primary-foreground/70">
            New volunteer? Speak with your unit coordinator before signing up.
          </p>
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
              CopSmart was built with volunteers in mind — large buttons, clear
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

      {/* CTA strip */}
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
          <span>© {new Date().getFullYear()} CopSmart Volunteer Services.</span>
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
