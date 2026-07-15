import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Shield, KeyRound } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/forgot-password")({
  head: () => ({
    meta: [
      { title: "Forgot Password — VolSmart" },
      { name: "description", content: "Request a password reset link for your VolSmart account." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: ForgotPasswordPage,
});

function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const value = email.trim().toLowerCase();
    if (!value || !value.includes("@")) {
      toast.error("Please enter a valid email address.");
      return;
    }
    setSubmitting(true);
    // Fire-and-forget; do not reveal whether the address exists.
    await supabase.auth.resetPasswordForEmail(value, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    setSubmitting(false);
    setSent(true);
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
                <KeyRound className="h-8 w-8" />
              </div>
              <h1 className="mt-4">Reset your password</h1>
              <p className="mt-2 text-base text-muted-foreground">
                Enter the email address on your VolSmart account and we'll send you a secure reset link.
              </p>
            </div>

            {sent ? (
              <div className="mt-8 space-y-4 rounded-xl border bg-muted/40 p-5 text-center">
                <p className="text-base">
                  If an account exists for <span className="font-semibold">{email.trim().toLowerCase()}</span>,
                  a password reset link is on its way. Check your inbox (and spam folder).
                </p>
                <p className="text-sm text-muted-foreground">
                  The link expires shortly for your security.
                </p>
                <Link to="/login" className="inline-block font-semibold text-primary underline">
                  Back to sign in
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="mt-8 space-y-5">
                <div>
                  <Label htmlFor="email" className="text-base font-semibold">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    autoComplete="email"
                    autoFocus
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 h-12 text-lg"
                    placeholder="you@example.com"
                    maxLength={255}
                  />
                </div>

                <Button
                  type="submit"
                  className="h-14 w-full text-base font-semibold"
                  disabled={submitting}
                >
                  {submitting ? "Sending…" : "Send reset link"}
                </Button>

                <p className="text-center text-base text-muted-foreground">
                  Remembered it?{" "}
                  <Link to="/login" className="font-semibold text-primary underline">
                    Back to sign in
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
