import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import {
  ShieldCheck,
  HeartHandshake,
  Phone,
  MapPin,
  FileDown,
  ArrowRight,
} from "lucide-react";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { SiteFooter } from "@/components/site-footer";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Volunteer with PBSO — CopSmart" },
      {
        name: "description",
        content:
          "Join the Palm Beach County Sheriff's Office Volunteer Program. Make a difference in your community.",
      },
      { property: "og:title", content: "Volunteer with PBSO" },
      {
        property: "og:description",
        content: "Become a PBSO volunteer. Apply today.",
      },
    ],
  }),
  component: PublicLanding,
});

function PublicLanding() {
  const navigate = useNavigate();

  // If already signed in, send to dashboard
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate({ to: "/dashboard" });
    });
  }, [navigate]);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Top bar */}
      <header className="border-b-4 border-gold bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-primary">
              <ShieldCheck className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-xl font-bold leading-tight">CopSmart</div>
              <div className="text-xs leading-tight text-primary-foreground/80">
                PBSO Volunteer Services
              </div>
            </div>
          </div>
          <Button asChild variant="secondary" className="h-12 text-base">
            <Link to="/login">Volunteer Sign In</Link>
          </Button>
        </div>
      </header>

      {/* Hero */}
      <section className="bg-gradient-to-br from-primary to-primary/85 text-primary-foreground">
        <div className="mx-auto max-w-7xl px-4 py-16 lg:py-24">
          <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-gold/20 px-4 py-1.5 text-sm font-semibold text-gold">
                <HeartHandshake className="h-4 w-4" />
                Now Recruiting
              </span>
              <h1 className="mt-4 text-balance text-4xl text-primary-foreground lg:text-5xl">
                Serve your community as a PBSO volunteer.
              </h1>
              <p className="mt-4 max-w-xl text-balance text-lg text-primary-foreground/90">
                Join hundreds of volunteers supporting the Palm Beach County
                Sheriff's Office. Patrol your neighborhood, assist with events,
                or help in the office — your time makes a difference.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Button
                  asChild
                  className="h-14 bg-gold px-6 text-base font-semibold text-primary hover:bg-gold/90"
                >
                  <a href="/ApplicationForm.pdf" download>
                    <FileDown className="mr-2 h-5 w-5" />
                    Download Application
                  </a>
                </Button>
                <Button
                  asChild
                  variant="secondary"
                  className="h-14 px-6 text-base"
                >
                  <a href="#contact">
                    <Phone className="mr-2 h-5 w-5" />
                    Contact Us
                  </a>
                </Button>
              </div>
            </div>

            <div className="relative aspect-video overflow-hidden rounded-2xl border-4 border-gold bg-black shadow-elevated">
              <iframe
                className="absolute inset-0 h-full w-full"
                src="https://www.youtube.com/embed/oNlm1QOpjN4?rel=0&modestbranding=1"
                title="A day in the life of a PBSO volunteer"
                loading="lazy"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
              />
            </div>
          </div>
        </div>
      </section>

      {/* Program highlights */}
      <section className="py-16">
        <div className="mx-auto max-w-7xl px-4">
          <h2 className="text-balance text-center">What volunteers do</h2>
          <p className="mx-auto mt-3 max-w-2xl text-center text-lg text-muted-foreground">
            Choose the role that fits your skills and schedule.
          </p>
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              {
                title: "Citizen Observer Patrol",
                body: "Patrol neighborhoods in marked PBSO vehicles, report suspicious activity, and serve as extra eyes and ears for deputies.",
              },
              {
                title: "Office & Administrative",
                body: "Support PBSO staff with reception, paperwork, records, and community-outreach coordination.",
              },
              {
                title: "Special Events & Outreach",
                body: "Help at parades, school visits, fairs, and emergency response operations across the county.",
              },
            ].map((c) => (
              <div
                key={c.title}
                className="rounded-2xl border bg-card p-6 shadow-card"
              >
                <h3 className="text-card-foreground">{c.title}</h3>
                <p className="mt-3 text-base text-muted-foreground">{c.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Apply steps */}
      <section className="bg-surface py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-balance text-center">How to apply</h2>
          <ol className="mt-10 grid gap-6 md:grid-cols-3">
            {[
              { n: 1, t: "Download the application", b: "Print and complete the volunteer application packet." },
              { n: 2, t: "Submit at PBSO HQ", b: "Bring your packet to Volunteer Services during interview hours." },
              { n: 3, t: "Background & training", b: "Pass screening, complete orientation, then start your service." },
            ].map((s) => (
              <li
                key={s.n}
                className="rounded-2xl border bg-card p-6 shadow-card"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary text-2xl font-bold text-primary-foreground">
                  {s.n}
                </div>
                <h3 className="mt-4">{s.t}</h3>
                <p className="mt-2 text-base text-muted-foreground">{s.b}</p>
              </li>
            ))}
          </ol>
          <div className="mt-10 text-center">
            <Button asChild className="h-14 px-6 text-base">
              <a href="/ApplicationForm.pdf" download>
                <FileDown className="mr-2 h-5 w-5" />
                Download Application Packet
              </a>
            </Button>
          </div>
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-16">
        <div className="mx-auto max-w-5xl px-4">
          <h2 className="text-center">Visit Volunteer Services</h2>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <h3 className="flex items-center gap-2">
                <MapPin className="h-6 w-6 text-gold" />
                Location
              </h3>
              <address className="mt-3 text-base not-italic text-muted-foreground">
                PBSO Headquarters<br />
                3228 Gun Club Road<br />
                West Palm Beach, FL 33406
              </address>
            </div>
            <div className="rounded-2xl border bg-card p-6 shadow-card">
              <h3 className="flex items-center gap-2">
                <Phone className="h-6 w-6 text-gold" />
                Interview Hours
              </h3>
              <p className="mt-3 text-base text-muted-foreground">
                Monday – Friday<br />
                9:00 AM – 3:00 PM<br />
                Walk-ins welcome.
              </p>
            </div>
          </div>

          <div className="mt-10 text-center">
            <p className="text-base text-muted-foreground">
              Already a volunteer?
            </p>
            <Button asChild variant="link" className="mt-1 text-lg">
              <Link to="/login">
                Sign in to the volunteer portal
                <ArrowRight className="ml-1 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
