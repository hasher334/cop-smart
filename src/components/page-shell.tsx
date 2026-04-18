import type { ReactNode } from "react";
import { Link } from "@tanstack/react-router";
import { ChevronRight, Home } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

export interface Crumb {
  label: string;
  to?: string;
}

interface Props {
  title: string;
  subtitle?: string;
  legacyName?: string;
  crumbs?: Crumb[];
  actions?: ReactNode;
  children: ReactNode;
}

export function PageShell({ title, subtitle, legacyName, crumbs, actions, children }: Props) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="flex-1">
        <div className="mx-auto w-full max-w-7xl px-4 py-6">
          {crumbs && crumbs.length > 0 && (
            <nav aria-label="Breadcrumb" className="mb-4">
              <ol className="flex flex-wrap items-center gap-1 text-sm text-muted-foreground">
                <li>
                  <Link to="/dashboard" className="inline-flex items-center gap-1 hover:text-primary hover:underline">
                    <Home className="h-4 w-4" />
                    Home
                  </Link>
                </li>
                {crumbs.map((c, i) => (
                  <li key={i} className="flex items-center gap-1">
                    <ChevronRight className="h-4 w-4" />
                    {c.to ? (
                      <Link to={c.to} className="hover:text-primary hover:underline">
                        {c.label}
                      </Link>
                    ) : (
                      <span className="font-medium text-foreground">{c.label}</span>
                    )}
                  </li>
                ))}
              </ol>
            </nav>
          )}

          <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
            <div>
              <h1 className="text-balance">{title}</h1>
              {subtitle && (
                <p className="mt-2 text-lg text-muted-foreground">{subtitle}</p>
              )}
              {legacyName && (
                <p className="mt-1 text-sm text-muted-foreground">
                  Previously known as: <span className="font-mono">{legacyName}</span>
                </p>
              )}
            </div>
            {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
          </div>

          {children}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
