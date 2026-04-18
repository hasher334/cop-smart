import { Outlet, Link, createRootRoute, HeadContent, Scripts } from "@tanstack/react-router";
import { Toaster } from "@/components/ui/sonner";
import appCss from "../styles.css?url";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="max-w-md text-center">
        <h1 className="text-6xl">404</h1>
        <h2 className="mt-4 text-2xl">Page not found</h2>
        <p className="mt-2 text-muted-foreground">
          The page you're looking for doesn't exist.
        </p>
        <div className="mt-6">
          <Link
            to="/"
            className="inline-flex h-12 items-center justify-center rounded-md bg-primary px-6 text-base font-semibold text-primary-foreground hover:opacity-90"
          >
            Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRoute({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CopSmart — Volunteer Services Platform" },
      { name: "description", content: "CopSmart by VolCop — volunteer management software for law enforcement and government agencies." },
      { name: "theme-color", content: "#0B2545" },
      { property: "og:title", content: "CopSmart — Volunteer Services Platform" },
      { name: "twitter:title", content: "CopSmart — Volunteer Services Platform" },
      { property: "og:description", content: "CopSmart by VolCop — volunteer management software for law enforcement and government agencies." },
      { name: "twitter:description", content: "CopSmart by VolCop — volunteer management software for law enforcement and government agencies." },
      { property: "og:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/f075d003-b0f5-4a65-9815-239c206ca70d" },
      { name: "twitter:image", content: "https://storage.googleapis.com/gpt-engineer-file-uploads/attachments/og-images/f075d003-b0f5-4a65-9815-239c206ca70d" },
      { name: "twitter:card", content: "summary_large_image" },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Merriweather:wght@700;900&family=Source+Sans+3:wght@400;500;600;700&family=Libre+Baskerville:wght@400;700&family=Public+Sans:wght@400;500;600;700&display=swap",
      },
    ],
    scripts: [
      { src: "https://www.googletagmanager.com/gtag/js?id=G-DJ1SCJK6Z6", async: true },
      {
        children:
          "window.dataLayer = window.dataLayer || [];function gtag(){dataLayer.push(arguments);}gtag('js', new Date());gtag('config', 'G-DJ1SCJK6Z6');",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
});

function RootShell({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  return (
    <>
      <Outlet />
      <Toaster richColors closeButton position="top-center" />
    </>
  );
}
