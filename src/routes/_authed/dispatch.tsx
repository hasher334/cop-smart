import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authed/dispatch")({
  head: () => ({ meta: [{ title: "Dispatch — CopSmart" }] }),
  component: () => (
    <PageShell title="Dispatch Reference" legacyName="FOCUS" crumbs={[{ label: "Dispatch" }]}>
      <Stub name="FOCUS Dispatch" />
    </PageShell>
  ),
});

function Stub({ name }: { name: string }) {
  return (
    <div className="rounded-2xl border-2 border-dashed bg-card p-12 text-center">
      <Construction className="mx-auto h-12 w-12 text-gold" />
      <h2 className="mt-4">{name} — Coming in the next iteration</h2>
      <p className="mt-2 text-lg text-muted-foreground">
        Search 10-codes, dispatch signals, and the practice quiz will live here.
      </p>
    </div>
  );
}
