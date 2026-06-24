import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Shield, UserPlus } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { badgeToEmail } from "@/lib/auth-helpers";

export const Route = createFileRoute("/signup")({
  head: () => ({
    meta: [
      { title: "Create Account — VolSmart" },
      { name: "description", content: "Create your VolSmart account to start managing volunteer shifts, training records, and hours for your agency." },
      { property: "og:title", content: "Create Account — VolSmart" },
      { property: "og:description", content: "Set up your VolSmart volunteer account." },
      { property: "og:url", content: "https://volcop.com/signup" },
    ],
    links: [{ rel: "canonical", href: "https://volcop.com/signup" }],
  }),
  component: SignupPage,
});

function SignupPage() {
  const navigate = useNavigate();
  const [fullName, setFullName] = useState("");
  const [badge, setBadge] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      toast.error("Password must be at least 8 characters.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signUp({
      email: badgeToEmail(badge),
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
        data: {
          badge_no: badge.trim(),
          full_name: fullName.trim(),
          contact_email: email.trim() || null,
        },
      },
    });
    setSubmitting(false);
    if (error) {
      toast.error("Couldn't create account", { description: error.message });
      return;
    }
    toast.success("Account created!", {
      description: "You're signed in. Welcome to VolSmart.",
    });
    navigate({ to: "/dashboard" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b-4 border-gold bg-primary text-primary-foreground">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4">
          <Link to="/" className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-primary">
              <Shield className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-xl font-bold">VolSmart</div>
              <div className="text-xs text-primary-foreground/80">Volunteer Services</div>
            </div>
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="rounded-2xl border bg-card p-8 shadow-elevated">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <UserPlus className="h-8 w-8" />
              </div>
              <h1 className="mt-4">Create Account</h1>
              <p className="mt-2 text-base text-muted-foreground">
                For approved volunteers only.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <Label htmlFor="fullName" className="text-base font-semibold">Full Name</Label>
                <Input id="fullName" required value={fullName} onChange={(e) => setFullName(e.target.value)} className="mt-1 h-12 text-lg" />
              </div>
              <div>
                <Label htmlFor="badge" className="text-base font-semibold">Badge Number</Label>
                <Input id="badge" required value={badge} onChange={(e) => setBadge(e.target.value)} className="mt-1 h-12 text-lg" placeholder="e.g. 12345" />
              </div>
              <div>
                <Label htmlFor="email" className="text-base font-semibold">Contact Email <span className="font-normal text-muted-foreground">(optional)</span></Label>
                <Input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="mt-1 h-12 text-lg" />
              </div>
              <div>
                <Label htmlFor="password" className="text-base font-semibold">Password</Label>
                <Input id="password" type="password" required minLength={8} value={password} onChange={(e) => setPassword(e.target.value)} className="mt-1 h-12 text-lg" />
                <p className="mt-1 text-sm text-muted-foreground">At least 8 characters.</p>
              </div>

              <Button type="submit" className="h-14 w-full text-base font-semibold" disabled={submitting}>
                {submitting ? "Creating account…" : "Create Account"}
              </Button>
            </form>

            <p className="mt-6 text-center text-base text-muted-foreground">
              Already registered?{" "}
              <Link to="/login" className="font-semibold text-primary underline">Sign in</Link>
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
