import { useEffect, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { Plus, Pencil, Trash2, MapPin } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";

type District = Database["public"]["Tables"]["districts"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];

export const Route = createFileRoute("/_authed/admin/districts")({
  head: () => ({ meta: [{ title: "Districts — VolSmart" }] }),
  component: DistrictsAdminPage,
});

const NONE = "__none__";

function DistrictsAdminPage() {
  const { isAdmin, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const [districts, setDistricts] = useState<District[]>([]);
  const [units, setUnits] = useState<Unit[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<District | null>(null);
  const [code, setCode] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [saving, setSaving] = useState(false);
  const [toDelete, setToDelete] = useState<District | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Admin access required.");
      navigate({ to: "/dashboard" });
    }
  }, [authLoading, isAdmin, navigate]);

  const load = async () => {
    setLoading(true);
    const [d, u] = await Promise.all([
      supabase.from("districts").select("*").order("code"),
      supabase.from("units").select("*").order("code"),
    ]);
    setDistricts(d.data ?? []);
    setUnits(u.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const openCreate = () => {
    setEditing(null);
    setCode("");
    setName("");
    setDescription("");
    setDialogOpen(true);
  };
  const openEdit = (d: District) => {
    setEditing(d);
    setCode(d.code);
    setName(d.name);
    setDescription(d.description ?? "");
    setDialogOpen(true);
  };

  const save = async () => {
    if (!code.trim() || !name.trim()) {
      toast.error("Code and name are required.");
      return;
    }
    setSaving(true);
    const payload = {
      code: code.trim(),
      name: name.trim(),
      description: description.trim() || null,
    };
    const { error } = editing
      ? await supabase.from("districts").update(payload).eq("id", editing.id)
      : await supabase.from("districts").insert(payload);
    setSaving(false);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success(editing ? "District updated." : "District created.");
    setDialogOpen(false);
    load();
  };

  const remove = async (d: District) => {
    const { error } = await supabase.from("districts").delete().eq("id", d.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("District deleted.");
    setToDelete(null);
    load();
  };

  const setUnitDistrict = async (unit: Unit, value: string) => {
    const district_id = value === NONE ? null : value;
    const { error } = await supabase
      .from("units")
      .update({ district_id })
      .eq("id", unit.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setUnits((prev) =>
      prev.map((u) => (u.id === unit.id ? { ...u, district_id } : u)),
    );
    toast.success("Unit updated.");
  };

  if (authLoading || !isAdmin) return null;

  return (
    <PageShell
      title="Districts"
      subtitle="Group units and members into districts for shift assignment."
      crumbs={[{ label: "Admin" }, { label: "Districts" }]}
      actions={
        <Button onClick={openCreate} className="h-12 gap-2">
          <Plus className="h-5 w-5" /> New district
        </Button>
      }
    >
      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading…</div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="p-4">
            <h2 className="mb-3 text-lg font-semibold">Districts</h2>
            {districts.length === 0 ? (
              <p className="text-sm text-muted-foreground">
                No districts yet. Create one to get started.
              </p>
            ) : (
              <div className="space-y-2">
                {districts.map((d) => (
                  <div
                    key={d.id}
                    className="flex items-start justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-gold" />
                        <span className="font-mono text-xs text-muted-foreground">
                          {d.code}
                        </span>
                        <span className="font-semibold">{d.name}</span>
                      </div>
                      {d.description && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {d.description}
                        </p>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => openEdit(d)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => setToDelete(d)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card className="p-4">
            <h2 className="mb-3 text-lg font-semibold">Unit → District</h2>
            {units.length === 0 ? (
              <p className="text-sm text-muted-foreground">No units yet.</p>
            ) : (
              <div className="space-y-2">
                {units.map((u) => (
                  <div
                    key={u.id}
                    className="flex items-center justify-between gap-3 rounded-md border p-3"
                  >
                    <div className="min-w-0">
                      <div className="font-mono text-xs text-muted-foreground">
                        {u.code}
                      </div>
                      <div className="truncate font-medium">{u.name}</div>
                    </div>
                    <Select
                      value={u.district_id ?? NONE}
                      onValueChange={(v) => setUnitDistrict(u, v)}
                    >
                      <SelectTrigger className="h-10 w-48">
                        <SelectValue placeholder="No district" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value={NONE}>— No district —</SelectItem>
                        {districts.map((d) => (
                          <SelectItem key={d.id} value={d.id}>
                            {d.code} — {d.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                ))}
              </div>
            )}
          </Card>
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editing ? "Edit district" : "New district"}
            </DialogTitle>
            <DialogDescription>
              Districts group units and members for scoped shift assignment.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-2">
            <div className="grid gap-2">
              <Label htmlFor="d-code">Code</Label>
              <Input
                id="d-code"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="e.g. D1"
                className="h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="d-name">Name</Label>
              <Input
                id="d-name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. North District"
                className="h-12"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="d-desc">Description (optional)</Label>
              <Input
                id="d-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="h-12"
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDialogOpen(false)}
              disabled={saving}
            >
              Cancel
            </Button>
            <Button onClick={save} disabled={saving}>
              {saving ? "Saving…" : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog
        open={!!toDelete}
        onOpenChange={(o) => !o && setToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this district?</AlertDialogTitle>
            <AlertDialogDescription>
              Members and units in this district will keep their records, but
              their district field will be cleared. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => toDelete && remove(toDelete)}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}
