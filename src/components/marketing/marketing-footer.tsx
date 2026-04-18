import { Link } from "@tanstack/react-router";

export function MarketingFooter() {
  return (
    <footer className="bg-[#13243A] text-[#F3F1EC] mt-20">
      <div className="mx-auto max-w-[1440px] px-6 py-16 lg:px-8 grid gap-12 md:grid-cols-4 font-['Public_Sans',sans-serif]">
        <div className="md:col-span-2">
          <div className="text-3xl font-bold text-white font-['Libre_Baskerville',serif]">
            VolCop.
          </div>
          <p className="mt-4 max-w-md text-[#F3F1EC]/70 leading-relaxed">
            Custom volunteer management software built exclusively for law
            enforcement and government agencies. Maker of CopSmart.
          </p>
          <div className="mt-6 flex items-center gap-3">
            <div className="h-px w-8 bg-[#B48A44]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">
              Headquartered in Florida
            </span>
          </div>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#B48A44] mb-4">
            Product
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/product" className="hover:text-[#B48A44]">CopSmart Platform</Link></li>
            <li><Link to="/features" className="hover:text-[#B48A44]">All Features</Link></li>
            <li><Link to="/demo" className="hover:text-[#B48A44]">Request a Demo</Link></li>
            <li><Link to="/login" className="hover:text-[#B48A44]">Client Login</Link></li>
          </ul>
        </div>
        <div>
          <div className="text-xs font-bold uppercase tracking-widest text-[#B48A44] mb-4">
            Company
          </div>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-[#B48A44]">About VolCop</Link></li>
            <li><Link to="/contact" className="hover:text-[#B48A44]">Contact Sales</Link></li>
          </ul>
        </div>
      </div>
      <div className="border-t border-white/10">
        <div className="mx-auto max-w-[1440px] px-6 py-6 lg:px-8 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-[#F3F1EC]/60 font-['Public_Sans',sans-serif]">
          <p>© {new Date().getFullYear()} VolCop, LLC. All rights reserved.</p>
          <p>CopSmart® is a registered product of VolCop.</p>
        </div>
      </div>
    </footer>
  );
}
