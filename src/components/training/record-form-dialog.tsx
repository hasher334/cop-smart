import { useEffect, useMemo, useState } from "react";
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
import { todayISO, parseISODate, toISODate } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Record = Database["public"]["Tables"]["training_records"]["Row"];
type Course = Database["public"]["Tables"]["training_courses"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  courses: Course[];
  volunteers?: Profile[]; // when officer is creating for someone else
  defaultUserId?: string;
  record?: Record | null;
  onSaved: () => void;
}

export function RecordFormDialog({
  open,
  onOpenChange,
  courses,
  volunteers,
  defaultUserId,
  record,
  onSaved,
}: Props) {
  const isEdit = !!record;
  const [userId, setUserId] = useState<string>("");
  const [courseId, setCourseId] = useState<string>("");
  const [completionDate, setCompletionDate] = useState(todayISO());
  const [expirationDate, setExpirationDate] = useState("");
  const [expirationTouched, setExpirationTouched] = useState(false);
  const [certificateNo, setCertificateNo] = useState("");
  const [instructor, setInstructor] = useState("");
  const [notes, setNotes] = useState("");
  const [saving, setSaving] = useState(false);

  const courseMap = useMemo(
    () => new Map(courses.map((c) => [c.id, c])),
    [courses],
  );

  useEffect(() => {
    if (!open) return;
    if (record) {
      setUserId(record.user_id);
      setCourseId(record.course_id);
      setCompletionDate(record.completion_date);
      setExpirationDate(record.expiration_date ?? "");
      setExpirationTouched(true);
      setCertificateNo(record.certificate_no ?? "");
      setInstructor(record.instructor ?? "");
      setNotes(record.notes ?? "");
    } else {
      setUserId(defaultUserId ?? "");
      setCourseId(courses[0]?.id ?? "");
      setCompletionDate(todayISO());
      setExpirationDate("");
      setExpirationTouched(false);
      setCertificateNo("");
      setInstructor("");
      setNotes("");
    }
  }, [open, record, defaultUserId, courses]);

  // Auto-calc expiration from validity_months if user hasn't manually set it
  useEffect(() => {
    if (expirationTouched || !courseId || !completionDate) return;
    const c = courseMap.get(courseId);
    if (!c?.validity_months) return;
    const d = parseISODate(completionDate);
    d.setMonth(d.getMonth() + c.validity_months);
    setExpirationDate(toISODate(d));
  }, [courseId, completionDate, expirationTouched, courseMap]);

  const handleSave = async () => {
    if (!userId || !courseId || !completionDate) {
      toast.error("Volunteer, course, and completion date are required.");
      return;
    }
    setSaving(true);
    const payload = {
      user_id: userId,
      course_id: courseId,
      completion_date: completionDate,
      expiration_date: expirationDate || null,
      certificate_no: certificateNo.trim() || null,
      instructor: instructor.trim() || null,
      notes: notes.trim() || null,
    };
    const { error } = isEdit
      ? await supabase.from("training_records").update(payload).eq("id", record!.id)
      : await supabase.from("training_records").insert({
          ...payload,
          created_by: (await supabase.auth.getUser()).data.user?.id ?? null,
        });
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isEdit ? "Record updated." : "Record added.");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit training record" : "Add training record"}
          </DialogTitle>
          <DialogDescription>
            Record a completed certification. Expiration is auto-calculated from
            the course's validity period.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          {volunteers && (
            <div className="grid gap-2">
              <Label htmlFor="vol">Volunteer</Label>
              <Select value={userId} onValueChange={setUserId} disabled={isEdit}>
                <SelectTrigger id="vol" className="h-12">
                  <SelectValue placeholder="Select volunteer" />
                </SelectTrigger>
                <SelectContent>
                  {volunteers.map((v) => (
                    <SelectItem key={v.user_id} value={v.user_id}>
                      {v.full_name} (#{v.badge_no})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div className="grid gap-2">
            <Label htmlFor="course">Course</Label>
            <Select value={courseId} onValueChange={setCourseId} disabled={isEdit}>
              <SelectTrigger id="course" className="h-12">
                <SelectValue placeholder="Select course" />
              </SelectTrigger>
              <SelectContent>
                {courses.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.code} — {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="comp">Completion date</Label>
              <Input
                id="comp"
                type="date"
                value={completionDate}
                onChange={(e) => setCompletionDate(e.target.value)}
                className="h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="exp">Expiration date</Label>
              <Input
                id="exp"
                type="date"
                value={expirationDate}
                onChange={(e) => {
                  setExpirationDate(e.target.value);
                  setExpirationTouched(true);
                }}
                className="h-12"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="cert">Certificate #</Label>
            <Input
              id="cert"
              value={certificateNo}
              onChange={(e) => setCertificateNo(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="inst">Instructor</Label>
            <Input
              id="inst"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
              className="h-12"
            />
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
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add record"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
