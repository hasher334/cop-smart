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
import { todayISO } from "@/lib/format";

type Shift = Database["public"]["Tables"]["patrol_shifts"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];
type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
type PatrolType = Database["public"]["Enums"]["patrol_type"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  units: Unit[];
  defaultUnitId?: string | null;
  defaultDate?: string;
  shift?: Shift | null; // when editing
  onSaved: () => void;
}

const PATROL_TYPES: { value: PatrolType; label: string }[] = [
  { value: "patrol", label: "Patrol" },
  { value: "special_event", label: "Special Event" },
  { value: "training", label: "Training" },
  { value: "meeting", label: "Meeting" },
  { value: "other", label: "Other" },
];

const NO_VEHICLE = "__none__";

export function ShiftFormDialog({
  open,
  onOpenChange,
  units,
  defaultUnitId,
  defaultDate,
  shift,
  onSaved,
}: Props) {
  const isEdit = !!shift;
  const [unitId, setUnitId] = useState<string>("");
  const [patrolType, setPatrolType] = useState<PatrolType>("patrol");
  const [patrolArea, setPatrolArea] = useState("");
  const [shiftDate, setShiftDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [notes, setNotes] = useState("");
  const [vehicleId, setVehicleId] = useState<string>(NO_VEHICLE);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [saving, setSaving] = useState(false);

  // Load in-service vehicles when dialog opens
  useEffect(() => {
    if (!open) return;
    supabase
      .from("vehicles")
      .select("*")
      .eq("status", "in_service")
      .order("vehicle_no")
      .then(({ data }) => setVehicles(data ?? []));
  }, [open]);

  useEffect(() => {
    if (!open) return;
    if (shift) {
      setUnitId(shift.unit_id);
      setPatrolType(shift.patrol_type);
      setPatrolArea(shift.patrol_area ?? "");
      setShiftDate(shift.shift_date);
      setStartTime(shift.start_time.slice(0, 5));
      setEndTime(shift.end_time.slice(0, 5));
      setNotes(shift.notes ?? "");
      setVehicleId(shift.vehicle_id ?? NO_VEHICLE);
    } else {
      setUnitId(defaultUnitId ?? units[0]?.id ?? "");
      setPatrolType("patrol");
      setPatrolArea("");
      setShiftDate(defaultDate ?? todayISO());
      setStartTime("08:00");
      setEndTime("12:00");
      setNotes("");
      setVehicleId(NO_VEHICLE);
    }
  }, [open, shift, defaultUnitId, defaultDate, units]);

  const handleSave = async () => {
    if (!unitId) {
      toast.error("Please select a unit.");
      return;
    }
    if (endTime <= startTime) {
      toast.error("End time must be after start time.");
      return;
    }
    setSaving(true);
    const payload = {
      unit_id: unitId,
      patrol_type: patrolType,
      patrol_area: patrolArea || null,
      shift_date: shiftDate,
      start_time: startTime,
      end_time: endTime,
      notes: notes || null,
      vehicle_id: vehicleId === NO_VEHICLE ? null : vehicleId,
    };

    const { error } = isEdit
      ? await supabase.from("patrol_shifts").update(payload).eq("id", shift!.id)
      : await supabase.from("patrol_shifts").insert({
          ...payload,
          created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        });

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isEdit ? "Shift updated." : "Shift created.");
    onSaved();
    onOpenChange(false);
  };

  // Include the currently-assigned vehicle in the dropdown even if it's not "in_service"
  const editingVehicleMissing =
    shift?.vehicle_id && !vehicles.some((v) => v.id === shift.vehicle_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit shift" : "Create new shift"}</DialogTitle>
          <DialogDescription>
            Fill in the details below. Volunteers can sign up once the shift is created.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={unitId} onValueChange={setUnitId}>
              <SelectTrigger id="unit" className="h-12">
                <SelectValue placeholder="Choose a unit" />
              </SelectTrigger>
              <SelectContent>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.code} — {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="ptype">Type</Label>
            <Select value={patrolType} onValueChange={(v) => setPatrolType(v as PatrolType)}>
              <SelectTrigger id="ptype" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PATROL_TYPES.map((t) => (
                  <SelectItem key={t.value} value={t.value}>
                    {t.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="date">Date</Label>
            <Input
              id="date"
              type="date"
              value={shiftDate}
              onChange={(e) => setShiftDate(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="start">Start time</Label>
              <Input
                id="start"
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="end">End time</Label>
              <Input
                id="end"
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="area">Patrol area (optional)</Label>
            <Input
              id="area"
              value={patrolArea}
              onChange={(e) => setPatrolArea(e.target.value)}
              placeholder="e.g. North district"
              className="h-12"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="vehicle">Vehicle (optional)</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger id="vehicle" className="h-12">
                <SelectValue placeholder="No vehicle assigned" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_VEHICLE}>— No vehicle —</SelectItem>
                {editingVehicleMissing && shift?.vehicle_id && (
                  <SelectItem value={shift.vehicle_id}>
                    (Currently assigned, not in service)
                  </SelectItem>
                )}
                {vehicles.map((v) => {
                  const desc = [v.year, v.make, v.model].filter(Boolean).join(" ");
                  return (
                    <SelectItem key={v.id} value={v.id}>
                      {v.vehicle_no}
                      {desc ? ` — ${desc}` : ""}
                    </SelectItem>
                  );
                })}
                {vehicles.length === 0 && !editingVehicleMissing && (
                  <div className="px-2 py-1.5 text-sm text-muted-foreground">
                    No in-service vehicles available
                  </div>
                )}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="notes">Notes (optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Create shift"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
