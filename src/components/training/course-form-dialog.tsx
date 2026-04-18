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
import { Checkbox } from "@/components/ui/checkbox";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Course = Database["public"]["Tables"]["training_courses"]["Row"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  course?: Course | null;
  onSaved: () => void;
}

export function CourseFormDialog({ open, onOpenChange, course, onSaved }: Props) {
  const isEdit = !!course;
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [validityMonths, setValidityMonths] = useState("");
  const [required, setRequired] = useState(false);
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (course) {
      setCode(course.code);
      setName(course.name);
      setCategory(course.category ?? "");
      setDescription(course.description ?? "");
      setValidityMonths(course.validity_months?.toString() ?? "");
      setRequired(course.required);
      setActive(course.active);
    } else {
      setCode("");
      setName("");
      setCategory("");
      setDescription("");
      setValidityMonths("");
      setRequired(false);
      setActive(true);
    }
  }, [open, course]);

  const handleSave = async () => {
    if (!code.trim() || !name.trim()) {
      toast.error("Code and name are required.");
      return;
    }
    setSaving(true);
    const payload = {
      code: code.trim(),
      name: name.trim(),
      category: category.trim() || null,
      description: description.trim() || null,
      validity_months: validityMonths ? Number(validityMonths) : null,
      required,
      active,
    };
    const { error } = isEdit
      ? await supabase.from("training_courses").update(payload).eq("id", course!.id)
      : await supabase.from("training_courses").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(isEdit ? "Course updated." : "Course added.");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit course" : "Add training course"}</DialogTitle>
          <DialogDescription>
            Define a certification or training requirement for the catalog.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-3 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="code">Code</Label>
              <Input
                id="code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="CPR-1"
                className="h-12"
              />
            </div>
            <div className="col-span-2 grid gap-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="CPR & First Aid"
                className="h-12"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="cat">Category</Label>
              <Input
                id="cat"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="Medical"
                className="h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="vm">Validity (months)</Label>
              <Input
                id="vm"
                type="number"
                value={validityMonths}
                onChange={(e) => setValidityMonths(e.target.value)}
                placeholder="24"
                className="h-12"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="desc">Description</Label>
            <Textarea
              id="desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="flex flex-wrap gap-6">
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={required}
                onCheckedChange={(v) => setRequired(v === true)}
              />
              <span className="text-sm font-medium">Required for all volunteers</span>
            </label>
            <label className="flex cursor-pointer items-center gap-2">
              <Checkbox
                checked={active}
                onCheckedChange={(v) => setActive(v === true)}
              />
              <span className="text-sm font-medium">Active</span>
            </label>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save changes" : "Add course"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
