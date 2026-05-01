import { useEffect, useState } from "react";
import { Bell, Smartphone, LogIn, Send, MapPin, ShieldCheck } from "lucide-react";
import loginImg from "@/assets/mobile/login.png";
import dashboardImg from "@/assets/mobile/dashboard.png";
import scheduleImg from "@/assets/mobile/schedule.png";
import rosterImg from "@/assets/mobile/roster.png";
import trainingImg from "@/assets/mobile/training.png";
import adminImg from "@/assets/mobile/admin.png";

const slides = [
  { src: loginImg, label: "Secure Sign-In" },
  { src: dashboardImg, label: "Daily Dashboard" },
  { src: scheduleImg, label: "Patrol Schedule" },
  { src: rosterImg, label: "Volunteer Roster" },
  { src: trainingImg, label: "Training & Certs" },
  { src: adminImg, label: "Command Tools" },
];

const features = [
  { Icon: LogIn, t: "Remote sign-in", b: "Badge-number authentication from any iOS or Android device." },
  { Icon: Bell, t: "Push notifications", b: "Shift reminders, training expirations, and urgent announcements." },
  { Icon: Send, t: "Submit in the field", b: "Log hours, file reports, and update status without returning to base." },
  { Icon: MapPin, t: "On-duty tracking", b: "Start/end patrols and pair vehicles directly from your phone." },
];

export function MobileAppShowcase() {
  const [index, setIndex] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setIndex((i) => (i + 1) % slides.length), 3500);
    return () => clearInterval(id);
  }, []);

  return (
    <section className="py-20 lg:py-28 border-b border-[#0D141E]/10 bg-gradient-to-b from-white/40 to-[#F3F1EC]">
      <div className="mx-auto max-w-[1440px] px-6 lg:px-8 grid lg:grid-cols-12 gap-12 lg:gap-16 items-center">
        {/* Copy */}
        <div className="lg:col-span-6 order-2 lg:order-1">
          <div className="flex items-center gap-3 mb-5">
            <div className="h-px w-8 bg-[#B48A44]" />
            <span className="text-xs font-bold uppercase tracking-widest text-[#B48A44]">
              VolSmart Mobile
            </span>
          </div>
          <h2 className="font-['Libre_Baskerville',serif] text-4xl lg:text-5xl text-[#13243A] leading-[1.1]">
            The whole platform, in your pocket.
          </h2>
          <p className="mt-5 text-lg text-[#4B5563] leading-relaxed max-w-xl">
            VolSmart Mobile gives officers and volunteers full remote access to
            schedules, dispatch, roster, and training from any iPhone or
            Android device — with secure push notifications and real-time
            field reporting.
          </p>
          <div className="mt-8 grid sm:grid-cols-2 gap-5">
            {features.map(({ Icon, t, b }) => (
              <div key={t} className="flex gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#13243A] text-[#B48A44]">
                  <Icon className="h-5 w-5" strokeWidth={1.75} />
                </div>
                <div>
                  <div className="font-bold text-[#13243A]">{t}</div>
                  <p className="text-sm text-[#4B5563] leading-relaxed mt-0.5">{b}</p>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-8 flex items-center gap-3 text-sm text-[#4B5563]">
            <ShieldCheck className="h-4 w-4 text-[#B48A44]" />
            <span>Encrypted in transit · CJIS-aware data handling</span>
          </div>
        </div>

        {/* iPhone Mockup */}
        <div className="lg:col-span-6 order-1 lg:order-2 flex justify-center">
          <div className="relative">
            {/* Glow */}
            <div className="absolute inset-x-8 -bottom-6 h-12 bg-[#B48A44]/30 blur-2xl pointer-events-none" />
            {/* Floating badge */}
            <div className="absolute -top-3 -left-6 z-20 flex items-center gap-2 px-3 py-1.5 bg-[#0B1828] border border-[#B48A44]/40 text-[10px] font-mono uppercase tracking-widest text-[#B48A44] shadow-lg">
              <Smartphone className="h-3 w-3" />
              iOS · Android
            </div>

            {/* iPhone frame */}
            <div className="relative w-[300px] h-[610px] rounded-[55px] bg-[#0B1828] p-[14px] shadow-2xl shadow-black/40 border border-white/5">
              {/* Side buttons */}
              <div className="absolute left-[-3px] top-[110px] w-[3px] h-[32px] rounded-l bg-[#0B1828]" />
              <div className="absolute left-[-3px] top-[160px] w-[3px] h-[55px] rounded-l bg-[#0B1828]" />
              <div className="absolute left-[-3px] top-[230px] w-[3px] h-[55px] rounded-l bg-[#0B1828]" />
              <div className="absolute right-[-3px] top-[180px] w-[3px] h-[85px] rounded-r bg-[#0B1828]" />

              {/* Screen */}
              <div className="relative w-full h-full rounded-[42px] overflow-hidden bg-[#F3F1EC]">
                {slides.map((s, i) => (
                  <img
                    key={s.label}
                    src={s.src}
                    alt={`VolSmart Mobile — ${s.label}`}
                    className={`absolute inset-0 w-full h-full object-cover object-top transition-opacity duration-700 ${
                      i === index ? "opacity-100" : "opacity-0"
                    }`}
                    loading="lazy"
                  />
                ))}
              </div>
            </div>

            {/* Slide label & dots */}
            <div className="mt-6 flex flex-col items-center gap-3">
              <div className="text-[10px] font-mono uppercase tracking-[0.25em] text-[#13243A]">
                {slides[index].label}
              </div>
              <div className="flex gap-1.5">
                {slides.map((s, i) => (
                  <button
                    key={s.label}
                    onClick={() => setIndex(i)}
                    aria-label={`Show ${s.label}`}
                    className={`h-1.5 rounded-full transition-all ${
                      i === index ? "w-6 bg-[#B48A44]" : "w-1.5 bg-[#13243A]/25 hover:bg-[#13243A]/50"
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
