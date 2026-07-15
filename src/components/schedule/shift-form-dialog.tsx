import { useEffect, useState } from "react";
import { toast } from "sonner";
import { AlertTriangle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import { todayISO, formatTimeRange } from "@/lib/format";
import { useAuth } from "@/hooks/use-auth";

type Shift = Database["public"]["Tables"]["patrol_shifts"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];
type Vehicle = Database["public"]["Tables"]["vehicles"]["Row"];
type PatrolType = Database["public"]["Enums"]["patrol_type"];
type AssigneeOption = { user_id: string; full_name: string; badge_no: string };

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
const NO_ASSIGNEE = "__open__";

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
  const auth = useAuth();
  const myDistrictId = auth.profile?.district_id ?? null;
  // Admins see all units; officers/corporals are scoped to their district.
  const scopedUnits = auth.isAdmin
    ? units
    : myDistrictId
      ? units.filter((u) => u.district_id === myDistrictId)
      : units;

  const [unitId, setUnitId] = useState<string>("");
  const [patrolType, setPatrolType] = useState<PatrolType>("patrol");
  const [patrolArea, setPatrolArea] = useState("");
  const [shiftDate, setShiftDate] = useState(todayISO());
  const [startTime, setStartTime] = useState("08:00");
  const [endTime, setEndTime] = useState("12:00");
  const [notes, setNotes] = useState("");
  const [vehicleId, setVehicleId] = useState<string>(NO_VEHICLE);
  const [assignedTo, setAssignedTo] = useState<string>(NO_ASSIGNEE);
  const [assignees, setAssignees] = useState<AssigneeOption[]>([]);
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [saving, setSaving] = useState(false);
  const [conflicts, setConflicts] = useState<Shift[]>([]);
  const [checkingConflicts, setCheckingConflicts] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);

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
      setAssignedTo(shift.assigned_to ?? NO_ASSIGNEE);
    } else {
      setUnitId(defaultUnitId ?? scopedUnits[0]?.id ?? "");
      setPatrolType("patrol");
      setPatrolArea("");
      setShiftDate(defaultDate ?? todayISO());
      setStartTime("08:00");
      setEndTime("12:00");
      setNotes("");
      setVehicleId(NO_VEHICLE);
      setAssignedTo(NO_ASSIGNEE);
    }
  }, [open, shift, defaultUnitId, defaultDate, scopedUnits]);

  // Load assignable members: admins see everyone; officers/corporals see only their district.
  useEffect(() => {
    if (!open) return;
    let q = supabase
      .from("profiles")
      .select("user_id, full_name, badge_no, district_id, status")
      .eq("status", "active")
      .not("user_id", "is", null)
      .order("full_name");
    if (!auth.isAdmin && myDistrictId) q = q.eq("district_id", myDistrictId);
    q.then(({ data }) =>
      setAssignees(
        ((data as (AssigneeOption & { district_id: string | null })[]) ?? [])
          .map(({ user_id, full_name, badge_no }) => ({ user_id, full_name, badge_no })),
      ),
    );
  }, [open, auth.isAdmin, myDistrictId]);

  // Live vehicle-conflict detection: any other shift on same date with same vehicle whose time range overlaps.
  useEffect(() => {
    if (!open || vehicleId === NO_VEHICLE || !shiftDate || !startTime || !endTime) {
      setConflicts([]);
      return;
    }
    if (endTime <= startTime) {
      setConflicts([]);
      return;
    }
    let cancelled = false;
    setCheckingConflicts(true);
    (async () => {
      // Overlap rule: existing.start < new.end AND existing.end > new.start
      let q = supabase
        .from("patrol_shifts")
        .select("*")
        .eq("vehicle_id", vehicleId)
        .eq("shift_date", shiftDate)
        .neq("status", "cancelled")
        .lt("start_time", endTime)
        .gt("end_time", startTime);
      if (isEdit && shift) q = q.neq("id", shift.id);
      const { data } = await q;
      if (!cancelled) {
        setConflicts(data ?? []);
        setCheckingConflicts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [open, vehicleId, shiftDate, startTime, endTime, isEdit, shift]);

  const commitSave = async () => {
    setSaving(true);
    const userId = (await supabase.auth.getUser()).data.user?.id ?? null;
    const willAssign = assignedTo !== NO_ASSIGNEE;
    const basePayload = {
      unit_id: unitId,
      patrol_type: patrolType,
      patrol_area: patrolArea || null,
      shift_date: shiftDate,
      start_time: startTime,
      end_time: endTime,
      notes: notes || null,
      vehicle_id: vehicleId === NO_VEHICLE ? null : vehicleId,
    };
    const assignmentPayload = willAssign
      ? {
          assigned_to: assignedTo,
          assigned_by: userId,
          assigned_at: new Date().toISOString(),
          volunteer_1: assignedTo,
          status: "reserved" as const,
          reserved_by: assignedTo,
          reserved_at: new Date().toISOString(),
        }
      : {
          assigned_to: null,
          assigned_by: null,
          assigned_at: null,
        };

    const { error } = isEdit
      ? await supabase
          .from("patrol_shifts")
          .update({ ...basePayload, ...assignmentPayload })
          .eq("id", shift!.id)
      : await supabase.from("patrol_shifts").insert({
          ...basePayload,
          ...assignmentPayload,
          created_by: userId,
        });

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isEdit ? "Shift updated." : "Shift created.");
    setConfirmOpen(false);
    onSaved();
    onOpenChange(false);
  };

  const handleSave = async () => {
    if (!unitId) {
      toast.error("Please select a unit.");
      return;
    }
    if (endTime <= startTime) {
      toast.error("End time must be after start time.");
      return;
    }
    if (conflicts.length > 0) {
      setConfirmOpen(true);
      return;
    }
    await commitSave();
  };

  // Include the currently-assigned vehicle in the dropdown even if it's not "in_service"
  const editingVehicleMissing =
    shift?.vehicle_id && !vehicles.some((v) => v.id === shift.vehicle_id);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit shift" : "Create new shift"}</DialogTitle>
          <DialogDescription>
            Fill in the details below. Volunteers can sign up once the shift is created.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2 flex-1 overflow-y-auto pr-1">
          <div className="grid gap-2">
            <Label htmlFor="unit">Unit</Label>
            <Select value={unitId} onValueChange={setUnitId}>
              <SelectTrigger id="unit" className="h-12">
                <SelectValue placeholder="Choose a unit" />
              </SelectTrigger>
              <SelectContent>
                {scopedUnits.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.code} — {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {!auth.isAdmin && myDistrictId && (
              <p className="text-xs text-muted-foreground">
                Only units in your district are shown.
              </p>
            )}
          </div>

          <div className="grid gap-2">
            <Label htmlFor="assignee">Assign to member (optional)</Label>
            <Select value={assignedTo} onValueChange={setAssignedTo}>
              <SelectTrigger id="assignee" className="h-12">
                <SelectValue placeholder="Leave open for signup" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={NO_ASSIGNEE}>— Leave open for signup —</SelectItem>
                {assignees.map((a) => (
                  <SelectItem key={a.user_id} value={a.user_id}>
                    #{a.badge_no} — {a.full_name}
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
            {checkingConflicts && vehicleId !== NO_VEHICLE && (
              <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <Loader2 className="h-3 w-3 animate-spin" />
                Checking vehicle availability…
              </p>
            )}
            {!checkingConflicts && conflicts.length > 0 && (
              <div className="rounded-md border border-amber-500/50 bg-amber-500/10 p-3 text-sm">
                <div className="flex items-start gap-2 font-medium text-amber-700 dark:text-amber-400">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
                  Vehicle double-booked
                </div>
                <p className="mt-1 text-xs text-muted-foreground">
                  This vehicle is already assigned to {conflicts.length}{" "}
                  overlapping shift{conflicts.length === 1 ? "" : "s"} on this date:
                </p>
                <ul className="mt-2 space-y-1 text-xs">
                  {conflicts.map((c) => (
                    <li key={c.id} className="rounded bg-background/60 px-2 py-1">
                      {formatTimeRange(c.start_time, c.end_time)}
                      {c.patrol_area ? ` · ${c.patrol_area}` : ""}
                      <span className="ml-2 uppercase text-muted-foreground">{c.status}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
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

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              Vehicle conflict — save anyway?
            </AlertDialogTitle>
            <AlertDialogDescription>
              This vehicle is already assigned to {conflicts.length} overlapping shift
              {conflicts.length === 1 ? "" : "s"} on {shiftDate}. You can still proceed if you
              know what you're doing — for example, the conflicting shift will be reassigned.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <ul className="space-y-1 rounded-md bg-muted p-3 text-sm">
            {conflicts.map((c) => (
              <li key={c.id}>
                {formatTimeRange(c.start_time, c.end_time)}
                {c.patrol_area ? ` · ${c.patrol_area}` : ""}
                <span className="ml-2 text-xs uppercase text-muted-foreground">{c.status}</span>
              </li>
            ))}
          </ul>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={saving}>Go back</AlertDialogCancel>
            <AlertDialogAction onClick={commitSave} disabled={saving}>
              {saving ? "Saving…" : "Save anyway"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
