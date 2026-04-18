import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authed/schedule")({
  head: () => ({ meta: [{ title: "Schedule — CopSmart" }] }),
  component: () => (
    <PageShell
      title="Schedule a Patrol"
      legacyName="VDASH"
      crumbs={[{ label: "Schedule" }]}
    >
      <ComingSoon name="Scheduling" />
    </PageShell>
  ),
});

function ComingSoon({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed bg-card p-12 text-center">
      <Construction className="mx-auto h-12 w-12 text-gold" />
      <h2 className="mt-4">{name} — Coming in the next iteration</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        This area will be built out next. The foundation is ready.
      </p>
    </div>
  );
}
