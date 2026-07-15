import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { Search, Shield, ShieldAlert, ShieldCheck, User } from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
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

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type District = Database["public"]["Tables"]["districts"]["Row"];
type AppRole = Database["public"]["Enums"]["app_role"];
const NO_DISTRICT = "__none__";

export const Route = createFileRoute("/_authed/admin/users")({
  head: () => ({ meta: [{ title: "Users & Roles — VolSmart" }] }),
  component: UsersAdminPage,
});

const ALL_ROLES: { value: AppRole; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Full system access" },
  { value: "officer", label: "Officer", description: "Manage shifts & ops" },
  { value: "corporal_plus", label: "Corporal+", description: "Senior volunteer" },
  { value: "volunteer", label: "Volunteer", description: "Standard access" },
];

const ROLE_BADGE: Record<AppRole, string> = {
  admin: "bg-red-600 text-white",
  officer: "bg-blue-600 text-white",
  corporal_plus: "bg-amber-500 text-white",
  volunteer: "bg-slate-500 text-white",
};

function UsersAdminPage() {
  const { isAdmin, loading: authLoading, user: currentUser } = useAuth();
  const navigate = useNavigate();
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [rolesByUser, setRolesByUser] = useState<Map<string, Set<AppRole>>>(
    new Map(),
  );
  const [districts, setDistricts] = useState<District[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [savingFor, setSavingFor] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAdmin) {
      toast.error("Admin access required.");
      navigate({ to: "/dashboard" });
    }
  }, [authLoading, isAdmin, navigate]);

  const load = async () => {
    setLoading(true);
    const [p, r, d] = await Promise.all([
      supabase.from("profiles").select("*").order("full_name"),
      supabase.from("user_roles").select("user_id, role"),
      supabase.from("districts").select("*").order("code"),
    ]);
    if (p.error) toast.error(p.error.message);
    if (r.error) toast.error(r.error.message);
    if (d.error) toast.error(d.error.message);

    setProfiles(p.data ?? []);
    setDistricts(d.data ?? []);
    const map = new Map<string, Set<AppRole>>();
    for (const row of r.data ?? []) {
      const set = map.get(row.user_id) ?? new Set<AppRole>();
      set.add(row.role);
      map.set(row.user_id, set);
    }
    setRolesByUser(map);
    setLoading(false);
  };

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin]);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return profiles;
    return profiles.filter(
      (p) =>
        p.full_name.toLowerCase().includes(q) ||
        p.badge_no.toLowerCase().includes(q) ||
        (p.email ?? "").toLowerCase().includes(q),
    );
  }, [profiles, search]);

  const toggleRole = async (
    userId: string,
    role: AppRole,
    currentlyHas: boolean,
  ) => {
    if (userId === currentUser?.id && role === "admin" && currentlyHas) {
      toast.error("You cannot remove your own admin role.");
      return;
    }
    setSavingFor(userId + role);

    const { error } = currentlyHas
      ? await supabase
          .from("user_roles")
          .delete()
          .eq("user_id", userId)
          .eq("role", role)
      : await supabase.from("user_roles").insert({ user_id: userId, role });

    setSavingFor(null);
    if (error) {
      toast.error(error.message);
      return;
    }

    // Update local state
    setRolesByUser((prev) => {
      const next = new Map(prev);
      const set = new Set(next.get(userId) ?? []);
      if (currentlyHas) set.delete(role);
      else set.add(role);
      next.set(userId, set);
      return next;
    });
    toast.success(currentlyHas ? `Removed ${role}` : `Granted ${role}`);
  };

  const setDistrict = async (profile: Profile, value: string) => {
    const district_id = value === NO_DISTRICT ? null : value;
    const { error } = await supabase
      .from("profiles")
      .update({ district_id })
      .eq("id", profile.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    setProfiles((prev) =>
      prev.map((p) => (p.id === profile.id ? { ...p, district_id } : p)),
    );
    toast.success("District updated.");
  };

  if (authLoading || !isAdmin) return null;

  const adminCount = Array.from(rolesByUser.values()).filter((s) =>
    s.has("admin"),
  ).length;

  return (
    <PageShell
      title="Users & Roles"
      subtitle="Manage role assignments for all volunteers."
      crumbs={[{ label: "Admin" }, { label: "Users & Roles" }]}
    >
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatCard
          icon={<User className="h-5 w-5" />}
          label="Total accounts"
          value={profiles.length}
        />
        <StatCard
          icon={<ShieldCheck className="h-5 w-5 text-emerald-600" />}
          label="Admins"
          value={adminCount}
        />
        <StatCard
          icon={<ShieldAlert className="h-5 w-5 text-amber-500" />}
          label="Pending profiles"
          value={profiles.filter((p) => p.status === "pending").length}
        />
      </div>

      <Card className="mb-6 p-4">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name, badge, or email…"
            className="h-12 pl-10"
          />
        </div>
      </Card>

      {loading ? (
        <div className="py-12 text-center text-muted-foreground">Loading…</div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center">
          <Shield className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No users found</h3>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((p) => {
            const userRoles = rolesByUser.get(p.user_id) ?? new Set<AppRole>();
            const isSelf = p.user_id === currentUser?.id;
            return (
              <Card key={p.id} className="p-4">
                <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-base font-semibold">{p.full_name}</h3>
                      {isSelf && (
                        <Badge variant="outline" className="text-xs">
                          You
                        </Badge>
                      )}
                      {Array.from(userRoles).map((r) => (
                        <Badge key={r} className={ROLE_BADGE[r]}>
                          {r}
                        </Badge>
                      ))}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      <span className="font-mono">#{p.badge_no}</span>
                      {p.email && <> &middot; {p.email}</>}
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:w-auto">
                    {ALL_ROLES.map((r) => {
                      const has = userRoles.has(r.value);
                      const saving = savingFor === p.user_id + r.value;
                      const disabled =
                        saving || (isSelf && r.value === "admin" && has);
                      return (
                        <label
                          key={r.value}
                          className={`flex cursor-pointer items-start gap-2 rounded-md border p-2 transition-colors ${
                            has
                              ? "border-primary bg-accent/40"
                              : "hover:bg-accent/20"
                          } ${disabled ? "opacity-50" : ""}`}
                        >
                          <Checkbox
                            checked={has}
                            disabled={disabled}
                            onCheckedChange={() =>
                              toggleRole(p.user_id, r.value, has)
                            }
                            className="mt-0.5"
                          />
                          <div className="min-w-0">
                            <p className="text-sm font-medium leading-tight">
                              {r.label}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {r.description}
                            </p>
                          </div>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      <Card className="mt-6 border-dashed bg-muted/30 p-4">
        <p className="text-sm text-muted-foreground">
          <strong className="text-foreground">Note:</strong> New accounts are
          granted the <Badge className={ROLE_BADGE.volunteer}>volunteer</Badge>{" "}
          role automatically on signup. Use this page to grant additional
          permissions. You cannot remove your own admin role.
        </p>
      </Card>
    </PageShell>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-muted p-2">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
