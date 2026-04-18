import { Link } from "@tanstack/react-router";

const links = [
  { to: "/features" as const, label: "Features" },
  { to: "/product" as const, label: "CopSmart" },
  { to: "/about" as const, label: "About" },
  { to: "/contact" as const, label: "Contact" },
];

export function MarketingHeader() {
  return (
    <nav className="border-b border-[#0D141E]/10 bg-[#F3F1EC]/95 backdrop-blur-sm sticky top-0 z-40">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 lg:px-8">
        <div className="flex items-center gap-12">
          <Link
            to="/"
            className="font-['Libre_Baskerville',serif] text-2xl font-bold text-[#13243A] hover:text-[#B48A44] transition-colors"
          >
            VolCop.
          </Link>
          <div className="hidden md:flex gap-8 text-sm font-semibold uppercase tracking-wide text-[#0D141E]/80 font-['Public_Sans',sans-serif]">
            {links.map((l) => (
              <Link
                key={l.to}
                to={l.to}
                activeProps={{ className: "text-[#B48A44]" }}
                className="hover:text-[#B48A44] transition-colors"
              >
                {l.label}
              </Link>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/login"
            className="hidden sm:inline-flex text-sm font-semibold uppercase tracking-wide text-[#13243A] hover:text-[#B48A44] transition-colors font-['Public_Sans',sans-serif]"
          >
            Client Login
          </Link>
          <Link
            to="/demo"
            className="bg-[#13243A] text-white text-sm font-semibold uppercase tracking-wide px-5 py-2.5 hover:bg-[#0D141E] transition-colors font-['Public_Sans',sans-serif]"
          >
            Request Demo
          </Link>
        </div>
      </div>
    </nav>
  );
}
