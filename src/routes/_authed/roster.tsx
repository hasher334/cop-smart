import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Users } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { VolunteerCard } from "@/components/roster/volunteer-card";
import { VolunteerDetailSheet } from "@/components/roster/volunteer-detail-sheet";
import { VolunteerFormDialog } from "@/components/roster/volunteer-form-dialog";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];
type Status = Database["public"]["Enums"]["volunteer_status"];

export const Route = createFileRoute("/_authed/roster")({
  head: () => ({ meta: [{ title: "Roster — VolSmart" }] }),
  component: RosterPage,
});

const STATUSES: { value: Status | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "active", label: "Active" },
  { value: "pending", label: "Pending" },
  { value: "leave", label: "On Leave" },
  { value: "inactive", label: "Inactive" },
  { value: "retired", label: "Retired" },
];

function RosterPage() {
  const { isAdmin } = useAuth();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("active");
  const [unitFilter, setUnitFilter] = useState<string>("all");

  const [selected, setSelected] = useState<Profile | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Profile | null>(null);

  const load = async () => {
    setLoading(true);
    const [p, u] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("units").select("*").order("code"),
    ]);
    if (p.error) toast.error(p.error.message);
    setProfiles(p.data ?? []);
    setUnits(u.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const unitMap = useMemo(
    () => new Map(units.map((u) => [u.id, u])),
    [units],
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return profiles.filter((p) => {
      if (statusFilter !== "all" && p.status !== statusFilter) return false;
      if (unitFilter !== "all" && p.home_unit_id !== unitFilter) return false;
      if (!q) return true;
      return (
        p.full_name.toLowerCase().includes(q) ||
        p.badge_no.toLowerCase().includes(q) ||
        (p.rank ?? "").toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q) ||
        (p.phone ?? "").toLowerCase().includes(q)
      );
    });
  }, [profiles, search, statusFilter, unitFilter]);

  const openDetail = (p: Profile) => {
    setSelected(p);
    setDetailOpen(true);
  };

  const openEdit = () => {
    setEditing(selected);
    setDetailOpen(false);
    setFormOpen(true);
  };

  return (
    <PageShell
      title="Volunteer Roster"
      crumbs={[{ label: "Roster" }]}
      actions={
        isAdmin && (
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            New volunteer
          </Button>
        )
      }
    >
      <Card className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search name, badge, rank, email…"
              className="h-12 pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as Status | "all")}
          >
            <SelectTrigger className="h-12 md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={unitFilter} onValueChange={setUnitFilter}>
            <SelectTrigger className="h-12 md:w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All units</SelectItem>
              {units.map((u) => (
                <SelectItem key={u.id} value={u.id}>
                  {u.code} — {u.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <p className="mt-3 text-sm text-muted-foreground">
          Showing {filtered.length} of {profiles.length} volunteers
        </p>
      </Card>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Users className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No volunteers found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            Try adjusting your search or filters.
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((p) => (
            <VolunteerCard
              key={p.id}
              profile={p}
              unit={p.home_unit_id ? unitMap.get(p.home_unit_id) : undefined}
              onClick={() => openDetail(p)}
            />
          ))}
        </div>
      )}

      <VolunteerDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        profile={selected}
        unit={selected?.home_unit_id ? unitMap.get(selected.home_unit_id) : undefined}
        canEdit={isAdmin}
        onEdit={openEdit}
      />

      <VolunteerFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        units={units}
        profile={editing}
        onSaved={load}
      />
    </PageShell>
  );
}
