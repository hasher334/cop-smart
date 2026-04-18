import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Truck, Gauge, Calendar } from "lucide-react";
import { formatShortDate } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];

export const STATUS_META: Record<
  Vehicle["status"],
  { label: string; className: string }
> = {
  in_service: { label: "In Service", className: "bg-emerald-600 text-white" },
  out_of_service: { label: "Out of Service", className: "bg-red-600 text-white" },
  maintenance: { label: "Maintenance", className: "bg-amber-500 text-white" },
  retired: { label: "Retired", className: "bg-slate-500 text-white" },
};

interface Props {
  vehicle: Vehicle;
  unit?: Unit;
  onClick: () => void;
}

export function VehicleCard({ vehicle, unit, onClick }: Props) {
  const s = STATUS_META[vehicle.status];
  const serviceDue =
    vehicle.next_service_date &&
    new Date(vehicle.next_service_date) <= new Date();

  return (
    <Card
      className="cursor-pointer p-4 transition-colors hover:border-primary hover:bg-accent/40"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Truck className="h-4 w-4 shrink-0 text-gold" />
            <span className="font-mono text-sm font-semibold">
              {vehicle.vehicle_no}
            </span>
          </div>
          <h3 className="mt-1 truncate text-base font-semibold">
            {[vehicle.year, vehicle.make, vehicle.model]
              .filter(Boolean)
              .join(" ") || "Unspecified vehicle"}
          </h3>
          {vehicle.license_plate && (
            <p className="text-sm text-muted-foreground">
              Plate: <span className="font-mono">{vehicle.license_plate}</span>
            </p>
          )}
        </div>
        <Badge className={s.className}>{s.label}</Badge>
      </div>

      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
        {unit && (
          <p className="truncate">
            <span className="font-medium text-foreground">{unit.code}</span> —{" "}
            {unit.name}
          </p>
        )}
        {vehicle.mileage != null && (
          <p className="flex items-center gap-2">
            <Gauge className="h-3.5 w-3.5" />
            {vehicle.mileage.toLocaleString()} mi
          </p>
        )}
        {vehicle.next_service_date && (
          <p
            className={`flex items-center gap-2 ${
              serviceDue ? "font-medium text-amber-600" : ""
            }`}
          >
            <Calendar className="h-3.5 w-3.5" />
            Service {serviceDue ? "due " : ""}
            {formatShortDate(vehicle.next_service_date)}
          </p>
        )}
      </div>
    </Card>
  );
}
