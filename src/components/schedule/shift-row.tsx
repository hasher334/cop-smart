import { Pencil, Trash2, UserPlus, UserMinus, CheckCircle2, PlayCircle, Truck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import { formatTimeRange } from "@/lib/format";

type Shift = Database["public"]["Tables"]["patrol_shifts"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];
type Vehicle = Pick<Database["public"]["Tables"]["vehicles"]["Row"], "id" | "vehicle_no" | "make" | "model" | "year">;
type Profile = Pick<Database["public"]["Tables"]["profiles"]["Row"], "user_id" | "full_name" | "badge_no">;

interface Props {
  shift: Shift;
  unit?: Unit;
  vehicle?: Vehicle;
  volunteer1?: Profile;
  volunteer2?: Profile;
  currentUserId?: string;
  canManage: boolean;
  onChanged: () => void;
  onEdit: (shift: Shift) => void;
  showDate?: boolean;
}

const STATUS_STYLES: Record<Shift["status"], string> = {
  open: "bg-info text-info-foreground",
  reserved: "bg-warning text-warning-foreground",
  on_duty: "bg-success text-success-foreground",
  completed: "bg-primary text-primary-foreground",
  cancelled: "bg-muted text-muted-foreground",
};

const STATUS_LABEL: Record<Shift["status"], string> = {
  open: "Open",
  reserved: "Reserved",
  on_duty: "On Duty",
  completed: "Completed",
  cancelled: "Cancelled",
};

const TYPE_LABEL: Record<Shift["patrol_type"], string> = {
  patrol: "Patrol",
  special_event: "Special Event",
  training: "Training",
  meeting: "Meeting",
  other: "Other",
};

export function ShiftRow({
  shift,
  unit,
  vehicle,
  volunteer1,
  volunteer2,
  currentUserId,
  canManage,
  onChanged,
  onEdit,
  showDate = false,
}: Props) {
  const isAssigned =
    currentUserId && (shift.volunteer_1 === currentUserId || shift.volunteer_2 === currentUserId);
  const slot1Open = !shift.volunteer_1;
  const slot2Open = !shift.volunteer_2;
  const canSignUp = currentUserId && !isAssigned && (slot1Open || slot2Open) && shift.status !== "cancelled" && shift.status !== "completed";

  const signUp = async () => {
    if (!currentUserId) return;
    const updates: Partial<Shift> = {
      reserved_by: currentUserId,
      reserved_at: new Date().toISOString(),
      status: "reserved",
    };
    if (slot1Open) updates.volunteer_1 = currentUserId;
    else if (slot2Open) updates.volunteer_2 = currentUserId;

    const { error } = await supabase.from("patrol_shifts").update(updates).eq("id", shift.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("You're signed up. Thank you!");
    onChanged();
  };

  const release = async () => {
    if (!currentUserId) return;
    const updates: Partial<Shift> = {};
    if (shift.volunteer_1 === currentUserId) updates.volunteer_1 = null;
    if (shift.volunteer_2 === currentUserId) updates.volunteer_2 = null;
    const stillAssigned =
      (shift.volunteer_1 && shift.volunteer_1 !== currentUserId) ||
      (shift.volunteer_2 && shift.volunteer_2 !== currentUserId);
    if (!stillAssigned) updates.status = "open";

    const { error } = await supabase.from("patrol_shifts").update(updates).eq("id", shift.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("You've been removed from this shift.");
    onChanged();
  };

  const setStatus = async (status: Shift["status"]) => {
    const { error } = await supabase.from("patrol_shifts").update({ status }).eq("id", shift.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(`Marked ${STATUS_LABEL[status]}.`);
    onChanged();
  };

  const remove = async () => {
    const { error } = await supabase.from("patrol_shifts").delete().eq("id", shift.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Shift deleted.");
    onChanged();
  };

  const volName = (p?: Profile) => (p ? `${p.full_name} (#${p.badge_no})` : "— Open —");

  return (
    <div className="rounded-2xl border bg-card p-5 shadow-card">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <Badge className={STATUS_STYLES[shift.status]}>{STATUS_LABEL[shift.status]}</Badge>
            <span className="text-base font-semibold">{TYPE_LABEL[shift.patrol_type]}</span>
            {unit && (
              <span className="text-sm text-muted-foreground">
                · {unit.code} {unit.name}
              </span>
            )}
          </div>
          <div className="mt-2 text-xl font-semibold">
            {formatTimeRange(shift.start_time, shift.end_time)}
          </div>
          {showDate && (
            <div className="text-sm text-muted-foreground">{shift.shift_date}</div>
          )}
          {shift.patrol_area && (
            <div className="mt-1 text-base text-muted-foreground">
              Area: <span className="font-medium text-foreground">{shift.patrol_area}</span>
            </div>
          )}
          <dl className="mt-3 grid gap-1 text-base sm:grid-cols-2">
            <div>
              <dt className="text-sm text-muted-foreground">Volunteer 1</dt>
              <dd className={shift.volunteer_1 ? "" : "text-muted-foreground italic"}>
                {volName(volunteer1)}
              </dd>
            </div>
            <div>
              <dt className="text-sm text-muted-foreground">Volunteer 2</dt>
              <dd className={shift.volunteer_2 ? "" : "text-muted-foreground italic"}>
                {volName(volunteer2)}
              </dd>
            </div>
          </dl>
          {shift.notes && (
            <p className="mt-3 rounded-md bg-muted p-3 text-sm">{shift.notes}</p>
          )}
        </div>

        <div className="flex flex-col gap-2 sm:min-w-[180px]">
          {canSignUp && (
            <Button onClick={signUp} className="h-12 gap-2">
              <UserPlus className="h-5 w-5" />
              Sign me up
            </Button>
          )}
          {isAssigned && shift.status === "reserved" && (
            <Button onClick={() => setStatus("on_duty")} variant="outline" className="h-12 gap-2">
              <PlayCircle className="h-5 w-5" />
              Start (On Duty)
            </Button>
          )}
          {isAssigned && shift.status === "on_duty" && (
            <Button onClick={() => setStatus("completed")} variant="outline" className="h-12 gap-2">
              <CheckCircle2 className="h-5 w-5" />
              Mark Completed
            </Button>
          )}
          {isAssigned && shift.status !== "completed" && (
            <Button onClick={release} variant="ghost" className="h-12 gap-2">
              <UserMinus className="h-5 w-5" />
              Drop shift
            </Button>
          )}
          {canManage && (
            <>
              <Button onClick={() => onEdit(shift)} variant="outline" className="h-12 gap-2">
                <Pencil className="h-5 w-5" />
                Edit
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" className="h-12 gap-2 text-destructive hover:text-destructive">
                    <Trash2 className="h-5 w-5" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete this shift?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This cannot be undone. Any volunteer signed up will be unassigned.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={remove}>Yes, delete</AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
