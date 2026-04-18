import { createFileRoute } from "@tanstack/react-router";
import { Construction } from "lucide-react";
import { PageShell } from "@/components/page-shell";

export const Route = createFileRoute("/_authed/forms")({
  head: () => ({ meta: [{ title: "Forms — CopSmart" }] }),
  component: () => (
    <PageShell title="Forms & Documents" crumbs={[{ label: "Forms" }]}>
      <Stub />
    </PageShell>
  ),
});

function Stub() {
  return (
    <div className="rounded-2xl border-2 border-dashed bg-card p-12 text-center">
      <Construction className="mx-auto h-12 w-12 text-gold" />
      <h2 className="mt-4">Forms — Coming in the next iteration</h2>
    </div>
  );
}
