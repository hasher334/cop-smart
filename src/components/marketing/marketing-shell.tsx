import type { ReactNode } from "react";
import { MarketingHeader } from "./marketing-header";
import { MarketingFooter } from "./marketing-footer";

export function MarketingShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col bg-[#F3F1EC] text-[#0D141E] font-['Public_Sans',sans-serif] antialiased selection:bg-[#B48A44]/20">
      <MarketingHeader />
      <main className="flex-1">{children}</main>
      <MarketingFooter />
    </div>
  );
}

export function SectionEyebrow({ children }: { children: ReactNode }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px w-8 bg-[#B48A44]" />
      <span className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">
        {children}
      </span>
    </div>
  );
}

export function SerifHeading({
  children,
  className = "",
  as: Tag = "h2",
}: {
  children: ReactNode;
  className?: string;
  as?: "h1" | "h2" | "h3";
}) {
  return (
    <Tag
      className={`font-['Libre_Baskerville',serif] text-[#13243A] leading-[1.15] ${className}`}
    >
      {children}
    </Tag>
  );
}
