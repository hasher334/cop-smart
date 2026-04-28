import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { format } from "date-fns";
import {
  Megaphone,
  Plus,
  Pencil,
  Trash2,
  Star,
  StarOff,
  CalendarIcon,
  Search,
  Clock,
  AlertTriangle,
} from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
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
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";

type Announcement = Database["public"]["Tables"]["announcements"]["Row"];

export const Route = createFileRoute("/_authed/admin/announcements")({
  head: () => ({ meta: [{ title: "Announcements Admin — VolSmart" }] }),
  component: AnnouncementsAdminPage,
});

function isExpired(a: Announcement): boolean {
  return !!a.expires_at && new Date(a.expires_at) < new Date();
}

function AnnouncementsAdminPage() {
  const { isAdmin, loading: authLoading, user } = useAuth();
  const navigate = useNavigate();
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [editing, setEditing] = useState<Announcement | null>(null);
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<Announcement | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Admin access required.");
      navigate({ to: "/dashboard" });
    }
  }, [authLoading, isAdmin, navigate]);

  const load = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("announcements")
      .select("*")
      .order("pinned", { ascending: false })
      .order("created_at", { ascending: false });
    if (error) {
      toast.error("Failed to load announcements", { description: error.message });
    } else {
      setItems(data ?? []);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (a) => a.title.toLowerCase().includes(q) || a.body.toLowerCase().includes(q),
    );
  }, [items, search]);

  const togglePin = async (a: Announcement) => {
    const { error } = await supabase
      .from("announcements")
      .update({ pinned: !a.pinned })
      .eq("id", a.id);
    if (error) {
      toast.error("Couldn't update pin", { description: error.message });
    } else {
      toast.success(a.pinned ? "Unpinned" : "Pinned");
      load();
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    const { error } = await supabase
      .from("announcements")
      .delete()
      .eq("id", deleteTarget.id);
    if (error) {
      toast.error("Couldn't delete", { description: error.message });
    } else {
      toast.success("Announcement deleted");
      setDeleteTarget(null);
      load();
    }
  };

  if (authLoading || !isAdmin) {
    return (
      <PageShell title="Announcements" crumbs={[{ label: "Admin" }, { label: "Announcements" }]}>
        <Skeleton className="h-32 w-full" />
      </PageShell>
    );
  }

  const pinnedCount = items.filter((a) => a.pinned && !isExpired(a)).length;
  const expiredCount = items.filter(isExpired).length;

  return (
    <PageShell
      title="Announcements"
      subtitle="Create, pin, and expire messages shown on the volunteer dashboard."
      crumbs={[{ label: "Admin" }, { label: "Announcements" }]}
      actions={
        <Button onClick={() => setCreating(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Announcement
        </Button>
      }
    >
      <div className="mb-6 grid gap-4 sm:grid-cols-3">
        <StatCard icon={<Megaphone className="h-5 w-5" />} label="Total" value={items.length} />
        <StatCard icon={<Star className="h-5 w-5 text-gold" />} label="Pinned (active)" value={pinnedCount} />
        <StatCard
          icon={<Clock className="h-5 w-5 text-muted-foreground" />}
          label="Expired"
          value={expiredCount}
        />
      </div>

      <div className="mb-4 relative max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          placeholder="Search by title or body…"
          className="pl-9"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {loading ? (
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <Skeleton key={i} className="h-28" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center text-muted-foreground">
            <Megaphone className="mx-auto mb-3 h-10 w-10 opacity-50" />
            {search ? "No announcements match your search." : "No announcements yet — create one to get started."}
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => {
            const expired = isExpired(a);
            return (
              <Card key={a.id} className={cn(expired && "opacity-60", a.pinned && !expired && "border-gold")}>
                <CardContent className="p-5">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        {a.pinned && !expired && (
                          <Badge className="bg-gold text-gold-foreground hover:bg-gold">
                            <Star className="mr-1 h-3 w-3" />
                            Pinned
                          </Badge>
                        )}
                        {expired && (
                          <Badge variant="outline" className="border-destructive text-destructive">
                            <AlertTriangle className="mr-1 h-3 w-3" />
                            Expired
                          </Badge>
                        )}
                        <h3 className="text-lg font-semibold">{a.title}</h3>
                      </div>
                      <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">{a.body}</p>
                      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                        <span>Created {format(new Date(a.created_at), "PP")}</span>
                        {a.expires_at && (
                          <span>
                            {expired ? "Expired" : "Expires"} {format(new Date(a.expires_at), "PPp")}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => togglePin(a)}
                        title={a.pinned ? "Unpin" : "Pin"}
                      >
                        {a.pinned ? <StarOff className="h-4 w-4" /> : <Star className="h-4 w-4" />}
                      </Button>
                      <Button variant="outline" size="sm" onClick={() => setEditing(a)}>
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setDeleteTarget(a)}
                        className="text-destructive hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      <AnnouncementFormDialog
        open={creating || !!editing}
        announcement={editing}
        userId={user?.id ?? null}
        onClose={() => {
          setCreating(false);
          setEditing(null);
        }}
        onSaved={() => {
          setCreating(false);
          setEditing(null);
          load();
        }}
      />

      <AlertDialog open={!!deleteTarget} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete announcement?</AlertDialogTitle>
            <AlertDialogDescription>
              "{deleteTarget?.title}" will be removed permanently. This can't be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: number }) {
  return (
    <Card>
      <CardContent className="flex items-center gap-3 p-4">
        <div className="rounded-md bg-muted p-2">{icon}</div>
        <div>
          <div className="text-2xl font-bold">{value}</div>
          <div className="text-xs text-muted-foreground">{label}</div>
        </div>
      </CardContent>
    </Card>
  );
}

interface FormDialogProps {
  open: boolean;
  announcement: Announcement | null;
  userId: string | null;
  onClose: () => void;
  onSaved: () => void;
}

function AnnouncementFormDialog({ open, announcement, userId, onClose, onSaved }: FormDialogProps) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [pinned, setPinned] = useState(false);
  const [expiresAt, setExpiresAt] = useState<Date | undefined>(undefined);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (open) {
      setTitle(announcement?.title ?? "");
      setBody(announcement?.body ?? "");
      setPinned(announcement?.pinned ?? false);
      setExpiresAt(announcement?.expires_at ? new Date(announcement.expires_at) : undefined);
    }
  }, [open, announcement]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) {
      toast.error("Title and body are required.");
      return;
    }
    setSaving(true);
    const payload = {
      title: title.trim(),
      body: body.trim(),
      pinned,
      expires_at: expiresAt ? expiresAt.toISOString() : null,
    };

    const { error } = announcement
      ? await supabase.from("announcements").update(payload).eq("id", announcement.id)
      : await supabase
          .from("announcements")
          .insert({ ...payload, created_by: userId });

    setSaving(false);
    if (error) {
      toast.error("Save failed", { description: error.message });
    } else {
      toast.success(announcement ? "Announcement updated" : "Announcement created");
      onSaved();
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{announcement ? "Edit announcement" : "New announcement"}</DialogTitle>
          <DialogDescription>
            Pinned announcements appear first on the dashboard. Expired ones are hidden automatically once the cutoff is added to the dashboard query.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ann-title">Title</Label>
            <Input
              id="ann-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={120}
              placeholder="e.g. Mandatory range qualification — Saturday"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="ann-body">Body</Label>
            <Textarea
              id="ann-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Details, time, location, who to contact…"
              required
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border p-3">
            <div>
              <Label htmlFor="ann-pinned" className="text-sm font-medium">
                Pin to top
              </Label>
              <p className="text-xs text-muted-foreground">Highlights it on the dashboard.</p>
            </div>
            <Switch id="ann-pinned" checked={pinned} onCheckedChange={setPinned} />
          </div>
          <div className="space-y-2">
            <Label>Expires (optional)</Label>
            <div className="flex gap-2">
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className={cn(
                      "flex-1 justify-start text-left font-normal",
                      !expiresAt && "text-muted-foreground",
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {expiresAt ? format(expiresAt, "PPP") : "Never expires"}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={expiresAt}
                    onSelect={(d) => {
                      if (d) {
                        // preserve any time already set, default end-of-day
                        const next = new Date(d);
                        if (expiresAt) {
                          next.setHours(expiresAt.getHours(), expiresAt.getMinutes());
                        } else {
                          next.setHours(23, 59);
                        }
                        setExpiresAt(next);
                      } else {
                        setExpiresAt(undefined);
                      }
                    }}
                    disabled={(d) => d < new Date(new Date().setHours(0, 0, 0, 0))}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
              {expiresAt && (
                <Button type="button" variant="ghost" size="sm" onClick={() => setExpiresAt(undefined)}>
                  Clear
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Leave blank to keep showing until manually removed.
            </p>
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} disabled={saving}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving}>
              {saving ? "Saving…" : announcement ? "Save changes" : "Create"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
