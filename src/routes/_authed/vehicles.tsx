import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Plus, Search, Truck } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { VehicleCard } from "@/components/vehicles/vehicle-card";
import { VehicleDetailSheet } from "@/components/vehicles/vehicle-detail-sheet";
import { VehicleFormDialog } from "@/components/vehicles/vehicle-form-dialog";
import type { Database } from "@/integrations/supabase/types";

type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];
type Status = Database["public"]["Enums"]["vehicle_status"];

export const Route = createFileRoute("/_authed/vehicles")({
  head: () => ({ meta: [{ title: "Vehicles — VolSmart" }] }),
  component: VehiclesPage,
});

const STATUSES: { value: Status | "all"; label: string }[] = [
  { value: "all", label: "All statuses" },
  { value: "in_service", label: "In Service" },
  { value: "maintenance", label: "Maintenance" },
  { value: "out_of_service", label: "Out of Service" },
  { value: "retired", label: "Retired" },
];

function VehiclesPage() {
  const { hasRole, isAdmin } = useAuth();
  const canManage =
    isAdmin || hasRole("officer") || hasRole("corporal_plus");

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<Status | "all">("all");
  const [unitFilter, setUnitFilter] = useState<string>("all");

  const [selected, setSelected] = useState<Vehicle | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Vehicle | null>(null);

  const load = async () => {
    setLoading(true);
    const [v, u] = await Promise.all([
      supabase.from("vehicles").select("*").order("vehicle_no"),
      supabase.from("units").select("*").order("code"),
    ]);
    if (v.error) toast.error(v.error.message);
    setVehicles(v.data ?? []);
    setUnits(u.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const unitMap = useMemo(() => new Map(units.map((u) => [u.id, u])), [units]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return vehicles.filter((v) => {
      if (statusFilter !== "all" && v.status !== statusFilter) return false;
      if (unitFilter !== "all" && v.unit_id !== unitFilter) return false;
      if (!q) return true;
      return (
        v.vehicle_no.toLowerCase().includes(q) ||
        (v.make ?? "").toLowerCase().includes(q) ||
        (v.model ?? "").toLowerCase().includes(q) ||
        (v.license_plate ?? "").toLowerCase().includes(q) ||
        (v.vin ?? "").toLowerCase().includes(q)
      );
    });
  }, [vehicles, search, statusFilter, unitFilter]);

  const counts = useMemo(() => {
    const c: Record<Status, number> = {
      in_service: 0,
      maintenance: 0,
      out_of_service: 0,
      retired: 0,
    };
    for (const v of vehicles) c[v.status]++;
    return c;
  }, [vehicles]);

  const openDetail = (v: Vehicle) => {
    setSelected(v);
    setDetailOpen(true);
  };

  const openEdit = () => {
    setEditing(selected);
    setDetailOpen(false);
    setFormOpen(true);
  };

  return (
    <PageShell
      title="Vehicle Inventory"
      subtitle="Track the fleet, status, and service schedule."
      crumbs={[{ label: "Vehicles" }]}
      actions={
        canManage && (
          <Button
            onClick={() => {
              setEditing(null);
              setFormOpen(true);
            }}
          >
            <Plus className="h-4 w-4" />
            Add vehicle
          </Button>
        )
      }
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="In Service"
          value={counts.in_service}
          color="text-emerald-600"
        />
        <StatCard
          label="Maintenance"
          value={counts.maintenance}
          color="text-amber-600"
        />
        <StatCard
          label="Out of Service"
          value={counts.out_of_service}
          color="text-red-600"
        />
        <StatCard
          label="Retired"
          value={counts.retired}
          color="text-slate-500"
        />
      </div>

      <Card className="mb-6 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search vehicle #, make, model, plate, VIN…"
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
          Showing {filtered.length} of {vehicles.length} vehicles
        </p>
      </Card>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Truck className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No vehicles found</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {vehicles.length === 0
              ? "Add the first vehicle to get started."
              : "Try adjusting your search or filters."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((v) => (
            <VehicleCard
              key={v.id}
              vehicle={v}
              unit={v.unit_id ? unitMap.get(v.unit_id) : undefined}
              onClick={() => openDetail(v)}
            />
          ))}
        </div>
      )}

      <VehicleDetailSheet
        open={detailOpen}
        onOpenChange={setDetailOpen}
        vehicle={selected}
        unit={selected?.unit_id ? unitMap.get(selected.unit_id) : undefined}
        canEdit={canManage}
        onEdit={openEdit}
        onDeleted={load}
      />

      <VehicleFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        units={units}
        vehicle={editing}
        onSaved={load}
      />
    </PageShell>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: string;
}) {
  return (
    <Card className="p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-3xl font-bold ${color}`}>{value}</p>
    </Card>
  );
}
