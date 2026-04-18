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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];
type Status = Database["public"]["Enums"]["volunteer_status"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  units: Unit[];
  profile?: Profile | null;
  onSaved: () => void;
}

const STATUSES: { value: Status; label: string }[] = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "leave", label: "On Leave" },
  { value: "retired", label: "Retired" },
  { value: "pending", label: "Pending" },
];

export function VolunteerFormDialog({
  open,
  onOpenChange,
  units,
  profile,
  onSaved,
}: Props) {
  const isEdit = !!profile;
  const [badgeNo, setBadgeNo] = useState("");
  const [fullName, setFullName] = useState("");
  const [rank, setRank] = useState("");
  const [homeUnitId, setHomeUnitId] = useState<string>("none");
  const [status, setStatus] = useState<Status>("active");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [hireDate, setHireDate] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    if (profile) {
      setBadgeNo(profile.badge_no);
      setFullName(profile.full_name);
      setRank(profile.rank ?? "");
      setHomeUnitId(profile.home_unit_id ?? "none");
      setStatus(profile.status);
      setPhone(profile.phone ?? "");
      setEmail(profile.email ?? "");
      setHireDate(profile.hire_date ?? "");
    } else {
      setBadgeNo("");
      setFullName("");
      setRank("");
      setHomeUnitId("none");
      setStatus("active");
      setPhone("");
      setEmail("");
      setHireDate("");
    }
  }, [open, profile]);

  const handleSave = async () => {
    if (!badgeNo.trim() || !fullName.trim()) {
      toast.error("Badge number and full name are required.");
      return;
    }
    if (!isEdit) {
      toast.error(
        "New volunteer profiles are created automatically when a user signs up. Use Edit to update existing volunteers.",
      );
      return;
    }
    setSaving(true);
    const payload = {
      badge_no: badgeNo.trim(),
      full_name: fullName.trim(),
      rank: rank.trim() || null,
      home_unit_id: homeUnitId === "none" ? null : homeUnitId,
      status,
      phone: phone.trim() || null,
      email: email.trim() || null,
      hire_date: hireDate || null,
    };

    const { error } = await supabase
      .from("profiles")
      .update(payload)
      .eq("id", profile!.id);

    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Volunteer updated.");
    onSaved();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit volunteer" : "New volunteer"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update this volunteer's profile information."
              : "New volunteers are created when they sign up. This form edits existing profiles."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="badge">Badge #</Label>
              <Input
                id="badge"
                value={badgeNo}
                onChange={(e) => setBadgeNo(e.target.value)}
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

          <div className="grid gap-2">
            <Label htmlFor="fullname">Full name</Label>
            <Input
              id="fullname"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="rank">Rank</Label>
              <Input
                id="rank"
                value={rank}
                onChange={(e) => setRank(e.target.value)}
                placeholder="e.g. Corporal"
                className="h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="hire">Hire date</Label>
              <Input
                id="hire"
                type="date"
                value={hireDate}
                onChange={(e) => setHireDate(e.target.value)}
                className="h-12"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="unit">Home unit</Label>
            <Select value={homeUnitId} onValueChange={setHomeUnitId}>
              <SelectTrigger id="unit" className="h-12">
                <SelectValue placeholder="Choose a unit" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">— None —</SelectItem>
                {units.map((u) => (
                  <SelectItem key={u.id} value={u.id}>
                    {u.code} — {u.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="phone">Phone</Label>
            <Input
              id="phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              className="h-12"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="email">Email</Label>
            <Input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="h-12"
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
            {saving ? "Saving…" : "Save changes"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
