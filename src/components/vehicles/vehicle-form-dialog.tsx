import { useEffect, useState } from "react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];
type Status = Database["public"]["Enums"]["vehicle_status"];

const STATUSES: { value: Status; label: string }[] = [
  { value: "in_service", label: "In Service" },
  { value: "maintenance", label: "Maintenance" },
  { value: "out_of_service", label: "Out of Service" },
  { value: "retired", label: "Retired" },
];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  units: Unit[];
  vehicle?: Vehicle | null;
  onSaved: () => void;
}

export function VehicleFormDialog({
  open,
  onOpenChange,
  units,
  vehicle,
  onSaved,
}: Props) {
  const isEdit = !!vehicle;
  const [vehicleNo, setVehicleNo] = useState("");
  const [make, setMake] = useState("");
  const [model, setModel] = useState("");
  const [year, setYear] = useState("");
  const [plate, setPlate] = useState("");
  const [vin, setVin] = useState("");
  const [unitId, setUnitId] = useState<string>("none");
  const [status, setStatus] = useState<Status>("in_service");
  const [mileage, setMileage] = useState("");
  const [lastService, setLastService] = useState("");
  const [nextService, setNextService] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (vehicle) {
      setVehicleNo(vehicle.vehicle_no);
      setMake(vehicle.make ?? "");
      setModel(vehicle.model ?? "");
      setYear(vehicle.year?.toString() ?? "");
      setPlate(vehicle.license_plate ?? "");
      setVin(vehicle.vin ?? "");
      setUnitId(vehicle.unit_id ?? "none");
      setStatus(vehicle.status);
      setMileage(vehicle.mileage?.toString() ?? "");
      setLastService(vehicle.last_service_date ?? "");
      setNextService(vehicle.next_service_date ?? "");
      setNotes(vehicle.notes ?? "");
    } else {
      setVehicleNo("");
      setMake("");
      setModel("");
      setYear("");
      setPlate("");
      setVin("");
      setUnitId("none");
      setStatus("in_service");
      setMileage("");
      setLastService("");
      setNextService("");
      setNotes("");
    }
  }, [open, vehicle]);

  const handleSave = async () => {
    if (!vehicleNo.trim()) {
      toast.error("Vehicle number is required.");
      return;
    }
    setSaving(true);
    const payload = {
      vehicle_no: vehicleNo.trim(),
      make: make.trim() || null,
      model: model.trim() || null,
      year: year ? Number(year) : null,
      license_plate: plate.trim() || null,
      vin: vin.trim() || null,
      unit_id: unitId === "none" ? null : unitId,
      status,
      mileage: mileage ? Number(mileage) : null,
      last_service_date: lastService || null,
      next_service_date: nextService || null,
      notes: notes.trim() || null,
    };

    const { error } = isEdit
      ? await supabase.from("vehicles").update(payload).eq("id", vehicle!.id)
      : await supabase.from("vehicles").insert(payload);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isEdit ? "Vehicle updated." : "Vehicle added.");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit vehicle" : "Add vehicle"}</DialogTitle>
          <DialogDescription>
            Track fleet inventory, status, and service schedule.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="vno">Vehicle #</Label>
              <Input
                id="vno"
                value={vehicleNo}
                onChange={(e) => setVehicleNo(e.target.value)}
                placeholder="e.g. V-101"
                className="h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={(v) => setStatus(v as Status)}>
                <SelectTrigger id="status" className="h-12">
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
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="year">Year</Label>
              <Input
                id="year"
                type="number"
                value={year}
                onChange={(e) => setYear(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="make">Make</Label>
              <Input
                id="make"
                value={make}
                onChange={(e) => setMake(e.target.value)}
                placeholder="Ford"
                className="h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="Explorer"
                className="h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="plate">License plate</Label>
              <Input
                id="plate"
                value={plate}
                onChange={(e) => setPlate(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vin">VIN</Label>
              <Input
                id="vin"
                value={vin}
                onChange={(e) => setVin(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unit">Assigned unit</Label>
            <Select value={unitId} onValueChange={setUnitId}>
              <SelectTrigger id="unit" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— Unassigned —</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.code} — {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="mileage">Mileage</Label>
            <Input
              id="mileage"
              type="number"
              value={mileage}
              onChange={(e) => setMileage(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="last">Last service</Label>
              <Input
                id="last"
                type="date"
                value={lastService}
                onChange={(e) => setLastService(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="next">Next service</Label>
              <Input
                id="next"
                type="date"
                value={nextService}
                onChange={(e) => setNextService(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={saving}
          >
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add vehicle"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
