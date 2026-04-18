import { createFileRoute, Link } from "@tanstack/react-router";
import {
  CalendarDays,
  Radio,
  GraduationCap,
  Users,
  Truck,
  FileText,
  CloudSun,
  Settings,
  Database,
  Megaphone,
  ShieldAlert,
  Star,
} from "lucide-react";
import { useEffect, useState } from "react";
import { PageShell } from "@/components/page-shell";
import { ServiceDueWidget } from "@/components/dashboard/service-due-widget";
import { ExpiringTrainingWidget } from "@/components/dashboard/expiring-training-widget";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import type { Database as DB } from "@/integrations/supabase/types";

type Announcement = DB["public"]["Tables"]["announcements"]["Row"];

export const Route = createFileRoute("/_authed/dashboard")({
  head: () => ({ meta: [{ title: "Dashboard — CopSmart" }] }),
  component: Dashboard,
});

interface Tile {
  to: string;
  label: string;
  legacy?: string;
  icon: typeof CalendarDays;
  color: string;
  adminOnly?: boolean;
}

const tiles: Tile[] = [
  { to: "/schedule", label: "Schedule a Patrol", legacy: "VDASH", icon: CalendarDays, color: "bg-info text-info-foreground" },
  { to: "/dispatch", label: "Dispatch Reference", legacy: "FOCUS", icon: Radio, color: "bg-primary text-primary-foreground" },
  { to: "/training", label: "My Training", legacy: "STARCOP", icon: GraduationCap, color: "bg-success text-success-foreground" },
  { to: "/roster", label: "Volunteer Roster", legacy: "VMIS", icon: Users, color: "bg-gold text-gold-foreground" },
  { to: "/vehicles", label: "Vehicle Inventory", icon: Truck, color: "bg-primary text-primary-foreground" },
  { to: "/forms", label: "Forms & Documents", icon: FileText, color: "bg-info text-info-foreground" },
  { to: "/resources", label: "Weather & Resources", icon: CloudSun, color: "bg-success text-success-foreground" },
  { to: "/profile", label: "My Profile", icon: Settings, color: "bg-secondary text-secondary-foreground" },
  { to: "/admin/migration", label: "Data Migration", icon: Database, color: "bg-warning text-warning-foreground", adminOnly: true },
];

function Dashboard() {
  const auth = useAuth();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);

  useEffect(() => {
    supabase
      .from("announcements")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(3)
      .then(({ data }) => setAnnouncements(data ?? []));
  }, []);

  const visibleTiles = tiles.filter((t) => !t.adminOnly || auth.isAdmin);
  const hour = new Date().getHours();
  const greet = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

  return (
    <PageShell
      title={`${greet}, ${auth.profile?.full_name?.split(" ")[0] ?? "Volunteer"}.`}
      subtitle="What would you like to do today?"
    >
      {/* Announcements */}
      <section aria-label="Announcements" className="mb-8">
        <h2 className="mb-4 flex items-center gap-2 text-2xl">
          <Megaphone className="h-6 w-6 text-gold" />
          Announcements
        </h2>
        {announcements.length === 0 ? (
          <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-muted-foreground">
            No announcements right now.
          </div>
        ) : (
          <div className="grid gap-4 md:grid-cols-3">
            {announcements.map((a) => (
              <article
                key={a.id}
                className={`rounded-2xl border p-5 shadow-card ${
                  a.pinned ? "border-gold bg-gold/5" : "bg-card"
                }`}
              >
                {a.pinned && (
                  <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-gold px-2 py-0.5 text-xs font-semibold text-gold-foreground">
                    <Star className="h-3 w-3" />
                    Pinned
                  </span>
                )}
                <h3 className="text-lg">{a.title}</h3>
                <p className="mt-2 line-clamp-3 text-base text-muted-foreground">{a.body}</p>
                <p className="mt-3 text-xs text-muted-foreground">
                  {new Date(a.created_at).toLocaleDateString()}
                </p>
              </article>
            ))}
          </div>
        )}
      </section>

      <ServiceDueWidget />

      {/* Quick actions */}
      <section aria-label="Quick actions">
        <h2 className="mb-4 text-2xl">Quick actions</h2>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {visibleTiles.map((t) => {
            const Icon = t.icon;
            return (
              <Link
                key={t.to}
                to={t.to}
                className="group flex items-start gap-4 rounded-2xl border bg-card p-5 shadow-card transition hover:-translate-y-0.5 hover:border-primary hover:shadow-elevated"
              >
                <div className={`flex h-14 w-14 shrink-0 items-center justify-center rounded-xl ${t.color}`}>
                  <Icon className="h-7 w-7" />
                </div>
                <div>
                  <div className="text-lg font-semibold text-card-foreground group-hover:text-primary">
                    {t.label}
                  </div>
                  {t.legacy && (
                    <div className="mt-0.5 text-sm text-muted-foreground">
                      Previously: {t.legacy}
                    </div>
                  )}
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Status footer */}
      <section className="mt-10 rounded-2xl bg-surface p-6 text-center">
        <ShieldAlert className="mx-auto h-8 w-8 text-gold" />
        <p className="mt-2 text-base">
          Security level:{" "}
          <strong className="text-primary">
            {auth.isAdmin ? "Administrator" : auth.hasRole("officer") ? "Officer" : "Volunteer"}
          </strong>
        </p>
      </section>
    </PageShell>
  );
}
