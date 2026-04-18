import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Pencil, Trash2, Truck, Hash, Gauge, Calendar, Building2, FileText } from "lucide-react";
import { toast } from "sonner";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { formatLongDate } from "@/lib/format";
import { STATUS_META } from "./vehicle-card";
import type { Database } from "@/integrations/supabase/types";

type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  vehicle: Vehicle | null;
  unit?: Unit;
  canEdit: boolean;
  onEdit: () => void;
  onDeleted: () => void;
}

export function VehicleDetailSheet({
  open,
  onOpenChange,
  vehicle,
  unit,
  canEdit,
  onEdit,
  onDeleted,
}: Props) {
  const [deleting, setDeleting] = useState(false);
  if (!vehicle) return null;

  const s = STATUS_META[vehicle.status];

  const handleDelete = async () => {
    setDeleting(true);
    const { error } = await supabase.from("vehicles").delete().eq("id", vehicle.id);
    setDeleting(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Vehicle removed.");
    onOpenChange(false);
    onDeleted();
  };

  const title =
    [vehicle.year, vehicle.make, vehicle.model].filter(Boolean).join(" ") ||
    vehicle.vehicle_no;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl">{title}</SheetTitle>
          <SheetDescription>
            <span className="font-mono">{vehicle.vehicle_no}</span>
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <Badge className={s.className}>{s.label}</Badge>

          <Row icon={<Truck className="h-4 w-4" />} label="Vehicle number">
            <span className="font-mono">{vehicle.vehicle_no}</span>
          </Row>
          {vehicle.license_plate && (
            <Row icon={<Hash className="h-4 w-4" />} label="License plate">
              <span className="font-mono">{vehicle.license_plate}</span>
            </Row>
          )}
          {vehicle.vin && (
            <Row icon={<Hash className="h-4 w-4" />} label="VIN">
              <span className="font-mono break-all text-xs">{vehicle.vin}</span>
            </Row>
          )}
          {unit && (
            <Row icon={<Building2 className="h-4 w-4" />} label="Assigned unit">
              {unit.code} — {unit.name}
            </Row>
          )}
          {vehicle.mileage != null && (
            <Row icon={<Gauge className="h-4 w-4" />} label="Mileage">
              {vehicle.mileage.toLocaleString()} mi
            </Row>
          )}
          {vehicle.last_service_date && (
            <Row icon={<Calendar className="h-4 w-4" />} label="Last service">
              {formatLongDate(vehicle.last_service_date)}
            </Row>
          )}
          {vehicle.next_service_date && (
            <Row icon={<Calendar className="h-4 w-4" />} label="Next service">
              {formatLongDate(vehicle.next_service_date)}
            </Row>
          )}
          {vehicle.notes && (
            <Row icon={<FileText className="h-4 w-4" />} label="Notes">
              <span className="whitespace-pre-wrap">{vehicle.notes}</span>
            </Row>
          )}
        </div>

        {canEdit && (
          <div className="mt-8 space-y-2">
            <Button onClick={onEdit} className="w-full">
              <Pencil className="h-4 w-4" />
              Edit vehicle
            </Button>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" className="w-full text-destructive hover:text-destructive">
                  <Trash2 className="h-4 w-4" />
                  Remove vehicle
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Remove this vehicle?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete {vehicle.vehicle_no} from the fleet.
                    This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel disabled={deleting}>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={handleDelete}
                    disabled={deleting}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    {deleting ? "Removing…" : "Remove"}
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b pb-3 last:border-b-0">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm">{children}</p>
      </div>
    </div>
  );
}
