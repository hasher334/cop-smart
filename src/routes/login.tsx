import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Shield, LogIn, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { badgeToEmail } from "@/lib/auth-helpers";
import { bootstrapAdmin } from "@/server/admin-bootstrap";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [{ title: "Sign In — CopSmart" }],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [badge, setBadge] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [bootstrapping, setBootstrapping] = useState(false);

  const handleBootstrap = async () => {
    setBootstrapping(true);
    try {
      const result = await bootstrapAdmin();
      toast.success("Admin account ready", {
        description: `Sign in with badge ${result.badge} and password ${result.password}.`,
      });
      setBadge(result.badge);
      setPassword(result.password);
    } catch (err) {
      toast.error("Bootstrap failed", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setBootstrapping(false);
    }
  };

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
              <div className="font-display text-xl font-bold">CopSmart</div>
              <div className="text-xs text-primary-foreground/80">PBSO Volunteer Services</div>
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
                Use your PBSO badge number and password.
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
            Trouble signing in? Contact the CopSmart Helpdesk.
          </p>

          <div className="mt-4 rounded-2xl border-2 border-dashed border-gold/50 bg-gold/5 p-4 text-center">
            <p className="text-sm font-semibold">First-time setup</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Create / reset the default administrator account (badge 1234).
            </p>
            <Button
              type="button"
              variant="outline"
              className="mt-3 h-12 w-full gap-2"
              onClick={handleBootstrap}
              disabled={bootstrapping}
            >
              <ShieldCheck className="h-5 w-5" />
              {bootstrapping ? "Setting up…" : "Set up admin account"}
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
