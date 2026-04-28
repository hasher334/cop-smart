export function SiteFooter() {
  return (
    <footer className="mt-16 border-t bg-surface py-8">
      <div className="mx-auto max-w-7xl px-4 text-center text-sm text-muted-foreground">
        <p className="text-base">
          VolSmart · Volunteer Services Platform
        </p>
        <p className="mt-1">
          For technical help, contact the VolSmart Helpdesk.
        </p>
        <p className="mt-3 text-xs">
          © {new Date().getFullYear()} VolCop. VolSmart Modern.
        </p>
      </div>
    </footer>
  );
}
