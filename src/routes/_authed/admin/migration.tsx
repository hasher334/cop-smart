import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authed/admin/migration")({
  head: () => ({ meta: [{ title: "Data Migration — CopSmart" }] }),
  component: MigrationPage,
});

function MigrationPage() {
  const auth = useAuth();

  if (!auth.isAdmin) {
    return (
      <PageShell title="Access Denied" crumbs={[{ label: "Data Migration" }]}>
        <div className="rounded-2xl border bg-card p-6 text-base">
          You need administrator privileges to view this page.
        </div>
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Data Migration"
      subtitle="Import or export everything in CopSmart."
      crumbs={[{ label: "Data Migration" }]}
    >
      <div className="rounded-2xl border-2 border-dashed bg-card p-12 text-center">
        <Construction className="mx-auto h-12 w-12 text-gold" />
        <h2 className="mt-4">Import / Export — Coming in iteration 6</h2>
        <p className="mt-2 text-lg text-muted-foreground">
          Will support JSON, CSV bundle (.zip), and Excel (.xlsx) formats with dry-run preview and full audit logging.
        </p>
      </div>
    </PageShell>
  );
}
