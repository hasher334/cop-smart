import { createFileRoute, Outlet, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";

export const Route = createFileRoute("/_authed")({
  component: AuthedLayout,
});

function AuthedLayout() {
  const auth = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!auth.loading && !auth.session) {
      navigate({ to: "/login" });
    }
  }, [auth.loading, auth.session, navigate]);

  if (auth.loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="text-lg text-muted-foreground">Loading…</div>
      </div>
    );
  }

  if (!auth.session) return null;

  // Temporary access suspension — block all authenticated app access
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="max-w-md rounded-lg border-2 border-gold bg-card p-8 text-center shadow-card">
        <div className="mb-2 text-sm font-semibold uppercase tracking-widest text-muted-foreground">
          Error CS-503
        </div>
        <h1 className="mb-3 font-display text-3xl font-bold text-foreground">
          Service Temporarily Unavailable
        </h1>
        <p className="mb-6 text-muted-foreground">
          Access to CopSmart is temporarily suspended for scheduled maintenance.
          Please check back shortly.
        </p>
        <button
          onClick={async () => {
            await auth.signOut();
            navigate({ to: "/" });
          }}
          className="inline-flex h-11 items-center justify-center rounded-md bg-primary px-6 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Return to Home
        </button>
      </div>
    </div>
  );
}
