import { Link, useNavigate } from "@tanstack/react-router";
import { Shield, LogOut, Menu as MenuIcon, X } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { MainNav } from "@/components/main-nav";

export function SiteHeader() {
  const auth = useAuth();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = async () => {
    await auth.signOut();
    navigate({ to: "/" });
  };

  return (
    <header className="border-b-4 border-gold bg-primary text-primary-foreground shadow-card">
      <div className="mx-auto max-w-7xl px-4 py-3">
        <div className="flex items-center justify-between gap-4">
          <Link
            to={auth.session ? "/dashboard" : "/"}
            className="flex items-center gap-3 rounded-md px-2 py-1 hover:bg-white/10"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gold text-primary">
              <Shield className="h-7 w-7" strokeWidth={2.5} />
            </div>
            <div>
              <div className="font-display text-xl font-bold leading-tight text-primary-foreground">
                CopSmart
              </div>
              <div className="text-xs leading-tight text-primary-foreground/80">
                PBSO Volunteer Services
              </div>
            </div>
          </Link>

          {auth.session && (
            <div className="hidden flex-1 items-center justify-end gap-3 lg:flex">
              <div className="text-right text-sm">
                <div className="font-semibold">
                  {auth.profile?.rank ? `${auth.profile.rank} ` : ""}
                  {auth.profile?.full_name ?? "Volunteer"}
                </div>
                <div className="text-primary-foreground/70">
                  Badge #{auth.profile?.badge_no ?? "—"}
                  {auth.isAdmin && " · Admin"}
                </div>
              </div>
              <Button
                onClick={handleLogout}
                variant="secondary"
                className="h-12 gap-2 text-base"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </Button>
            </div>
          )}

          {auth.session && (
            <Button
              variant="secondary"
              className="h-12 lg:hidden"
              onClick={() => setMobileOpen((v) => !v)}
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X className="h-6 w-6" /> : <MenuIcon className="h-6 w-6" />}
            </Button>
          )}

          {!auth.session && (
            <Button asChild variant="secondary" className="h-12 text-base">
              <Link to="/login">Sign In</Link>
            </Button>
          )}
        </div>

        {auth.session && (
          <div className="mt-3 hidden lg:block">
            <MainNav />
          </div>
        )}

        {auth.session && mobileOpen && (
          <div className="mt-3 lg:hidden">
            <MainNav onNavigate={() => setMobileOpen(false)} mobile />
            <div className="mt-3 border-t border-white/20 pt-3 text-sm">
              <div>
                {auth.profile?.full_name} · Badge #{auth.profile?.badge_no}
              </div>
              <Button
                onClick={handleLogout}
                variant="secondary"
                className="mt-2 h-12 w-full gap-2"
              >
                <LogOut className="h-5 w-5" />
                Log out
              </Button>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}
