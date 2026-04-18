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
  const [saving, setSaving] = useState(false);

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
    } else {
      setUnitId(defaultUnitId ?? units[0]?.id ?? "");
      setPatrolType("patrol");
      setPatrolArea("");
      setShiftDate(defaultDate ?? todayISO());
      setStartTime("08:00");
      setEndTime("12:00");
      setNotes("");
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
