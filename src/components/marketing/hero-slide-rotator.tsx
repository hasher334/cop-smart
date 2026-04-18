import { useEffect, useState } from "react";
import { CalendarClock, Users, GraduationCap, CheckCircle2, ArrowRight } from "lucide-react";

const SLIDES = [
  { key: "schedule", label: "Schedule", icon: CalendarClock, meta: "WEEK 42" },
  { key: "roster", label: "Roster", icon: Users, meta: "142 ACTIVE" },
  { key: "training", label: "Training", icon: GraduationCap, meta: "98% COMPLIANT" },
] as const;

const ROTATE_MS = 4500;

export function HeroSlideRotator() {
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    if (paused) return;
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % SLIDES.length);
    }, ROTATE_MS);
    return () => window.clearInterval(id);
  }, [paused]);

  const active = SLIDES[index];
  const Icon = active.icon;

  return (
    <div
      className="relative"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Tab strip */}
      <div className="flex items-center gap-px bg-[#0D141E]/10 border-b border-[#0D141E]/10">
        {SLIDES.map((s, i) => {
          const TabIcon = s.icon;
          const activeTab = i === index;
          return (
            <button
              key={s.key}
              type="button"
              onClick={() => setIndex(i)}
              className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 text-[9px] font-bold uppercase tracking-widest transition-colors ${
                activeTab
                  ? "bg-[#13243A] text-[#B48A44]"
                  : "bg-white text-[#4B5563] hover:text-[#13243A]"
              }`}
            >
              <TabIcon className="size-3" />
              {s.label}
            </button>
          );
        })}
      </div>

      {/* Stage */}
      <div className="relative bg-[#F3F1EC] p-5 min-h-[320px]">
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Icon className="size-3.5 text-[#B48A44]" />
            <span className="text-[10px] font-bold uppercase tracking-widest text-[#13243A]">
              {active.label}
            </span>
          </div>
          <span className="text-[9px] font-mono text-[#4B5563]">{active.meta}</span>
        </div>

        {/* Slide bodies */}
        {SLIDES.map((s, i) => (
          <div
            key={s.key}
            className={`transition-all duration-500 ease-out ${
              i === index
                ? "opacity-100 translate-y-0 relative"
                : "opacity-0 translate-y-2 absolute inset-x-5 top-12 pointer-events-none"
            }`}
            aria-hidden={i !== index}
          >
            {s.key === "schedule" && <ScheduleSlide />}
            {s.key === "roster" && <RosterSlide />}
            {s.key === "training" && <TrainingSlide />}
          </div>
        ))}
      </div>

      {/* Footer strip with progress + dots */}
      <div className="relative flex items-center justify-between px-5 py-2.5 bg-[#0B1828] text-white border-t-2 border-[#B48A44]">
        <div className="flex items-center gap-2">
          <span className="size-1.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-[10px] font-mono uppercase tracking-widest text-white/70">
            Live data · CopSmart v2.4
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          {SLIDES.map((s, i) => (
            <button
              key={s.key}
              type="button"
              onClick={() => setIndex(i)}
              aria-label={`Show ${s.label}`}
              className={`h-1 rounded-full transition-all duration-300 ${
                i === index ? "w-6 bg-[#B48A44]" : "w-2 bg-white/30 hover:bg-white/60"
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-[#B48A44]">
          Live
          <ArrowRight className="size-3" />
        </div>
      </div>

      {/* Auto-advance progress bar */}
      <div className="absolute top-0 left-0 right-0 h-0.5 bg-transparent overflow-hidden pointer-events-none">
        <div
          key={`${index}-${paused}`}
          className="h-full bg-[#B48A44]"
          style={{
            width: "100%",
            animation: paused ? "none" : `hero-progress ${ROTATE_MS}ms linear forwards`,
          }}
        />
      </div>

      <style>{`
        @keyframes hero-progress {
          from { transform: translateX(-100%); }
          to { transform: translateX(0); }
        }
      `}</style>
    </div>
  );
}

function ScheduleSlide() {
  const cells: Array<{ col: number; row: number; color: string; label: string }> = [
    { col: 0, row: 0, color: "bg-[#13243A] text-white", label: "06:00" },
    { col: 1, row: 1, color: "bg-[#B48A44] text-[#0B1828]", label: "14:00" },
    { col: 2, row: 0, color: "bg-[#13243A] text-white", label: "08:00" },
    { col: 3, row: 2, color: "bg-[#13243A] text-white", label: "Event" },
    { col: 4, row: 1, color: "bg-[#B48A44] text-[#0B1828]", label: "16:30" },
    { col: 4, row: 3, color: "bg-[#13243A]/60 text-white", label: "Std" },
    { col: 5, row: 0, color: "bg-[#13243A] text-white", label: "10:00" },
    { col: 5, row: 2, color: "bg-[#B48A44] text-[#0B1828]", label: "Event" },
    { col: 6, row: 1, color: "bg-[#13243A] text-white", label: "12:00" },
  ];
  return (
    <div className="bg-white border border-[#0D141E]/15 shadow-sm overflow-hidden">
      <div className="grid grid-cols-7 text-[8px] font-bold uppercase tracking-wider text-[#4B5563] border-b border-[#0D141E]/10">
        {["M", "T", "W", "T", "F", "S", "S"].map((d, i) => (
          <div key={i} className="px-2 py-1.5 text-center border-r border-[#0D141E]/5 last:border-r-0">{d}</div>
        ))}
      </div>
      <div className="grid grid-cols-7 grid-rows-4 gap-px bg-[#0D141E]/10">
        {Array.from({ length: 28 }).map((_, idx) => {
          const c = idx % 7;
          const r = Math.floor(idx / 7);
          const cell = cells.find((x) => x.col === c && x.row === r);
          return (
            <div key={idx} className="bg-white h-9 p-0.5">
              {cell && (
                <div className={`h-full w-full flex items-center justify-center text-[9px] font-bold ${cell.color}`}>
                  {cell.label}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div className="flex items-center justify-between px-3 py-1.5 border-t border-[#0D141E]/10 bg-[#F3F1EC]">
        <span className="text-[9px] font-mono text-[#4B5563]">9 SHIFTS · 0 CONFLICTS</span>
        <span className="text-[9px] font-bold uppercase tracking-widest text-[#B48A44]">Publish</span>
      </div>
    </div>
  );
}

function RosterSlide() {
  const rows = [
    { id: "AX-992", name: "Callahan, M.", rank: "CPL", on: true, role: "Sector 7" },
    { id: "AX-104", name: "Reyes, E.", rank: "OFC", on: true, role: "Event Detail" },
    { id: "AX-842", name: "Donovan, J.", rank: "OFC", on: false, role: "Standby" },
    { id: "BX-019", name: "Chen, A.", rank: "OFC", on: true, role: "Traffic" },
    { id: "BX-201", name: "Park, S.", rank: "SGT", on: true, role: "Supervisor" },
  ];
  return (
    <div className="bg-white border border-[#0D141E]/15 shadow-sm overflow-hidden">
      <div className="grid grid-cols-12 gap-2 px-3 py-2 border-b border-[#0D141E]/10 bg-[#F3F1EC] text-[9px] font-bold uppercase tracking-wider text-[#4B5563]">
        <div className="col-span-2">Rank</div>
        <div className="col-span-5">Personnel</div>
        <div className="col-span-4">Assignment</div>
        <div className="col-span-1 text-right">On</div>
      </div>
      {rows.map((r) => (
        <div key={r.id} className="grid grid-cols-12 gap-2 items-center px-3 py-2 border-b border-[#0D141E]/5 last:border-b-0">
          <div className="col-span-2">
            <div className="size-6 bg-[#13243A] text-[#B48A44] flex items-center justify-center text-[8px] font-bold">{r.rank}</div>
          </div>
          <div className="col-span-5 min-w-0">
            <div className="text-[11px] font-semibold text-[#13243A] truncate">{r.name}</div>
            <div className="text-[9px] font-mono text-[#4B5563]">{r.id}</div>
          </div>
          <div className="col-span-4 text-[10px] text-[#4B5563]">{r.role}</div>
          <div className="col-span-1 flex justify-end">
            <span className={`size-2 rounded-full ${r.on ? "bg-emerald-500" : "bg-[#4B5563]/40"}`} />
          </div>
        </div>
      ))}
    </div>
  );
}

function TrainingSlide() {
  const certs = [
    { name: "CPR/AED Recertification", days: 4, holders: 12 },
    { name: "Firearms Qualification Q3", days: 9, holders: 28 },
    { name: "Defensive Driving", days: 13, holders: 7 },
  ];
  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-2">
        {[
          { stat: "98%", label: "Compliant" },
          { stat: "03", label: "Expiring · 14d", accent: true },
          { stat: "47", label: "Courses Active" },
        ].map((k) => (
          <div key={k.label} className={`p-3 border ${k.accent ? "bg-[#13243A] border-[#B48A44]/40 text-white" : "bg-white border-[#0D141E]/15"}`}>
            <div className={`text-xl font-semibold tabular-nums leading-none ${k.accent ? "text-[#B48A44]" : "text-[#13243A]"}`}>{k.stat}</div>
            <div className={`text-[9px] font-bold uppercase tracking-wider mt-1 ${k.accent ? "text-white/70" : "text-[#4B5563]"}`}>{k.label}</div>
          </div>
        ))}
      </div>
      <div className="bg-white border border-[#0D141E]/15 shadow-sm overflow-hidden">
        <div className="px-3 py-2 border-b border-[#0D141E]/10 bg-[#F3F1EC] flex items-center justify-between">
          <span className="text-[9px] font-bold uppercase tracking-widest text-[#13243A]">Expiring Soon</span>
          <CheckCircle2 className="size-3 text-[#B48A44]" />
        </div>
        {certs.map((c) => (
          <div key={c.name} className="px-3 py-2 border-b border-[#0D141E]/5 last:border-b-0 flex items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-[11px] font-semibold text-[#13243A] truncate">{c.name}</div>
              <div className="text-[9px] text-[#4B5563]">{c.holders} volunteers affected</div>
            </div>
            <div className={`px-2 py-1 text-[9px] font-bold tabular-nums ${c.days <= 7 ? "bg-[#B48A44] text-[#0B1828]" : "bg-[#13243A]/10 text-[#13243A]"}`}>
              {c.days}d
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
