import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authed/training")({
  head: () => ({ meta: [{ title: "Training — CopSmart" }] }),
  component: () => (
    <PageShell title="My Training" legacyName="STARCOP" crumbs={[{ label: "Training" }]}>
      <Stub />
    </PageShell>
  ),
});

function Stub() {
  return (
    <div className="rounded-2xl border-2 border-dashed bg-card p-12 text-center">
      <Construction className="mx-auto h-12 w-12 text-gold" />
      <h2 className="mt-4">Training — Coming in the next iteration</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        Mandatory training compliance, course history, and graduate lists.
      </p>
    </div>
  );
}
