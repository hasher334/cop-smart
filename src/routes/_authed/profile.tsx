import { createFileRoute } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { MilestoneBadges } from "@/components/profile/milestone-badges";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/_authed/profile")({
  head: () => ({ meta: [{ title: "My Profile — CopSmart" }] }),
  component: ProfilePage,
});

function ProfilePage() {
  const auth = useAuth();
  const [fullName, setFullName] = useState(auth.profile?.full_name ?? "");
  const [phone, setPhone] = useState(auth.profile?.phone ?? "");
  const [email, setEmail] = useState(auth.profile?.email ?? "");
  const [saving, setSaving] = useState(false);

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!auth.profile) return;
    setSaving(true);
    const { error } = await supabase
      .from("profiles")
      .update({ full_name: fullName, phone, email })
      .eq("id", auth.profile.id);
    setSaving(false);
    if (error) {
      toast.error("Couldn't save", { description: error.message });
      return;
    }
    toast.success("Profile updated.");
    auth.refresh();
  };

  return (
    <PageShell
      title="My Profile"
      subtitle="Keep your contact info up to date."
      crumbs={[{ label: "My Profile" }]}
    >
      <div className="max-w-2xl space-y-6">
        {auth.user && <MilestoneBadges userId={auth.user.id} />}
        <div className="rounded-2xl border bg-card p-6 shadow-card">
        <dl className="grid grid-cols-2 gap-4 border-b pb-4 text-base">
          <div>
            <dt className="text-sm text-muted-foreground">Badge Number</dt>
            <dd className="font-mono text-lg font-semibold">{auth.profile?.badge_no}</dd>
          </div>
          <div>
            <dt className="text-sm text-muted-foreground">Status</dt>
            <dd className="text-lg font-semibold capitalize">{auth.profile?.status}</dd>
          </div>
        </dl>

        <form onSubmit={save} className="mt-6 space-y-5">
          <div>
            <Label htmlFor="fullName" className="text-base font-semibold">Full Name</Label>
            <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 h-12 text-lg" />
          </div>
          <div>
            <Label htmlFor="email" className="text-base font-semibold">Contact Email</Label>
            <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-12 text-lg" />
          </div>
          <div>
            <Label htmlFor="phone" className="text-base font-semibold">Phone</Label>
            <Input id="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 h-12 text-lg" />
          </div>
          <Button type="submit" className="h-12 text-base font-semibold" disabled={saving}>
            {saving ? "Saving…" : "Save Changes"}
          </Button>
        </form>
        </div>
      </div>
    </PageShell>
  );
}
