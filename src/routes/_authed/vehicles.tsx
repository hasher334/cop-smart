import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authed/vehicles")({
  head: () => ({ meta: [{ title: "Vehicles — CopSmart" }] }),
  component: () => (
    <PageShell title="Vehicle Inventory" crumbs={[{ label: "Vehicles" }]}>
      <Stub />
    </PageShell>
  ),
});

function Stub() {
  return (
    <div className="rounded-2xl border-2 border-dashed bg-card p-12 text-center">
      <Construction className="mx-auto h-12 w-12 text-gold" />
      <h2 className="mt-4">Vehicles — Coming in the next iteration</h2>
    </div>
  );
}
