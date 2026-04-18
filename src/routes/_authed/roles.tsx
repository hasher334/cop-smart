import { createFileRoute } from "@tanstack/react-router";
import { Check, Minus, Shield } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  CAPABILITY_MATRIX,
  ROLE_BADGE_CLASS,
  ROLE_DESCRIPTION,
  ROLE_LABEL,
  type AppRole,
} from "@/lib/permissions";

export const Route = createFileRoute("/_authed/roles")({
  head: () => ({ meta: [{ title: "Roles & Access — CopSmart" }] }),
  component: RolesPage,
});

const ORDER: AppRole[] = ["volunteer", "corporal_plus", "officer", "admin"];

function RolesPage() {
  return (
    <PageShell
      title="Roles & Access"
      subtitle="Who can do what in CopSmart."
      crumbs={[{ label: "Roles & Access" }]}
    >
      <div className="mb-8 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {ORDER.map((r) => (
          <Card key={r} className="p-5">
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-muted-foreground" />
              <Badge className={ROLE_BADGE_CLASS[r]}>{ROLE_LABEL[r]}</Badge>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">
              {ROLE_DESCRIPTION[r]}
            </p>
          </Card>
        ))}
      </div>

      <Card className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b bg-muted/40 text-left text-xs uppercase tracking-wide text-muted-foreground">
              <tr>
                <th className="px-4 py-3">Capability</th>
                {ORDER.map((r) => (
                  <th key={r} className="px-3 py-3 text-center">
                    {ROLE_LABEL[r]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CAPABILITY_MATRIX.map((c) => (
                <tr key={c.area} className="border-b last:border-0">
                  <td className="px-4 py-3 align-top">
                    <p className="font-semibold">{c.area}</p>
                    <p className="text-xs text-muted-foreground">
                      {c.description}
                    </p>
                  </td>
                  {ORDER.map((r) => (
                    <td key={r} className="px-3 py-3 text-center align-top">
                      <AccessIcon level={c.roles[r]} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <p className="mt-6 text-sm text-muted-foreground">
        <strong className="text-foreground">Note:</strong> All access is enforced
        by row-level security in the database — UI restrictions are a convenience,
        not the security boundary.
      </p>
    </PageShell>
  );
}

function AccessIcon({ level }: { level: "full" | "limited" | "none" }) {
  if (level === "full") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-emerald-500/15 text-emerald-600">
        <Check className="h-4 w-4" />
      </span>
    );
  }
  if (level === "limited") {
    return (
      <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-amber-500/15 text-amber-600 text-xs font-bold">
        own
      </span>
    );
  }
  return (
    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-muted text-muted-foreground">
      <Minus className="h-4 w-4" />
    </span>
  );
}
