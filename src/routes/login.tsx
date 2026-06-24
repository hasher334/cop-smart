import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Shield, LogIn } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { badgeToEmail } from "@/lib/auth-helpers";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — VolSmart" },
      { name: "description", content: "Sign in to VolSmart to view your schedule, log hours, track training, and stay connected with your unit." },
      { property: "og:title", content: "Sign In — VolSmart" },
      { property: "og:description", content: "Secure sign-in for VolSmart volunteer operations." },
      { property: "og:url", content: "https://volcop.com/login" },
    ],
    links: [{ rel: "canonical", href: "https://volcop.com/login" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [badge, setBadge] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!badge.trim() || !password) {
      toast.error("Please enter your badge number and password.");
      return;
    }
    setSubmitting(true);
    const { error } = await supabase.auth.signInWithPassword({
      email: badgeToEmail(badge),
      password,
    });
    setSubmitting(false);
    if (error) {
      toast.error("Sign in failed", {
        description: "Check your badge number and password, then try again.",
      });
      return;
    }
    toast.success("Welcome back!");
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
                <LogIn className="h-8 w-8" />
              </div>
              <h1 className="mt-4">Volunteer Sign In</h1>
              <p className="mt-2 text-base text-muted-foreground">
                Use your badge number and password.
              </p>
            </div>

            <form onSubmit={handleSubmit} className="mt-8 space-y-5">
              <div>
                <Label htmlFor="badge" className="text-base font-semibold">
                  Badge Number
                </Label>
                <Input
                  id="badge"
                  type="text"
                  inputMode="numeric"
                  autoComplete="username"
                  autoFocus
                  required
                  value={badge}
                  onChange={(e) => setBadge(e.target.value)}
                  className="mt-1 h-12 text-lg"
                  placeholder="e.g. 12345"
                />
              </div>
              <div>
                <Label htmlFor="password" className="text-base font-semibold">
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="mt-1 h-12 text-lg"
                />
              </div>

              <Button
                type="submit"
                className="h-14 w-full text-base font-semibold"
                disabled={submitting}
              >
                {submitting ? "Signing in…" : "Sign In"}
              </Button>
            </form>

            <p className="mt-6 text-center text-base text-muted-foreground">
              New volunteer?{" "}
              <Link to="/signup" className="font-semibold text-primary underline">
                Create an account
              </Link>
            </p>
          </div>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            Trouble signing in? Contact the VolSmart Helpdesk.
          </p>
        </div>
      </main>
    </div>
  );
}
