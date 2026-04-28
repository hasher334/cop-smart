import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  Cloud,
  CloudRain,
  CloudSnow,
  CloudLightning,
  Sun,
  CloudFog,
  Wind,
  Droplets,
  Thermometer,
  ExternalLink,
  Radio,
  FileText,
  Truck,
  Calendar,
  GraduationCap,
  Users,
  MapPin,
  AlertTriangle,
  RefreshCw,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

export const Route = createFileRoute("/_authed/resources")({
  head: () => ({
    meta: [
      { title: "Weather & Resources — VolSmart" },
      {
        name: "description",
        content:
          "Live patrol-area weather plus curated quick-links to dispatch reference, radio codes, training, and external tools.",
      },
    ],
  }),
  component: ResourcesPage,
});

// Default patrol area. Adjust per deployment.
const PATROL_LOCATION = {
  name: "Local Patrol Area",
  lat: 26.7153,
  lon: -80.0534,
};

interface WeatherData {
  current: {
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    is_day: number;
  };
  daily: {
    time: string[];
    temperature_2m_max: number[];
    temperature_2m_min: number[];
    weather_code: number[];
    precipitation_probability_max: number[];
  };
}

function weatherInfo(code: number, isDay = 1): { label: string; Icon: typeof Sun; tone: string } {
  // Open-Meteo WMO weather codes
  if (code === 0) return { label: isDay ? "Clear" : "Clear night", Icon: Sun, tone: "text-amber-500" };
  if (code <= 2) return { label: "Partly cloudy", Icon: Cloud, tone: "text-sky-500" };
  if (code === 3) return { label: "Overcast", Icon: Cloud, tone: "text-slate-500" };
  if (code <= 48) return { label: "Fog", Icon: CloudFog, tone: "text-slate-400" };
  if (code <= 57) return { label: "Drizzle", Icon: CloudRain, tone: "text-sky-500" };
  if (code <= 67) return { label: "Rain", Icon: CloudRain, tone: "text-sky-600" };
  if (code <= 77) return { label: "Snow", Icon: CloudSnow, tone: "text-sky-300" };
  if (code <= 82) return { label: "Rain showers", Icon: CloudRain, tone: "text-sky-600" };
  if (code <= 86) return { label: "Snow showers", Icon: CloudSnow, tone: "text-sky-300" };
  if (code <= 99) return { label: "Thunderstorm", Icon: CloudLightning, tone: "text-amber-600" };
  return { label: "Unknown", Icon: Cloud, tone: "text-muted-foreground" };
}

function compass(deg: number): string {
  const dirs = ["N", "NNE", "NE", "ENE", "E", "ESE", "SE", "SSE", "S", "SSW", "SW", "WSW", "W", "WNW", "NW", "NNW"];
  return dirs[Math.round(deg / 22.5) % 16];
}

function ResourcesPage() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const fetchWeather = async () => {
    setLoading(true);
    setError(null);
    try {
      const url =
        `https://api.open-meteo.com/v1/forecast?latitude=${PATROL_LOCATION.lat}&longitude=${PATROL_LOCATION.lon}` +
        `&current=temperature_2m,apparent_temperature,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m,is_day` +
        `&daily=temperature_2m_max,temperature_2m_min,weather_code,precipitation_probability_max` +
        `&temperature_unit=fahrenheit&wind_speed_unit=mph&precipitation_unit=inch&timezone=auto&forecast_days=5`;
      const res = await fetch(url);
      if (!res.ok) throw new Error(`Weather service returned ${res.status}`);
      const data = (await res.json()) as WeatherData;
      setWeather(data);
      setLastUpdated(new Date());
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed to load weather");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchWeather();
    const interval = setInterval(fetchWeather, 10 * 60 * 1000); // refresh every 10 min
    return () => clearInterval(interval);
  }, []);

  const current = weather?.current;
  const currentInfo = current ? weatherInfo(current.weather_code, current.is_day) : null;

  return (
    <PageShell
      title="Weather & Resources"
      subtitle="Live patrol-area conditions and quick-links to your most-used tools."
      crumbs={[{ label: "Resources" }]}
      actions={
        <Button variant="outline" size="sm" onClick={fetchWeather} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      }
    >
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Current weather */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Current Conditions
                </CardTitle>
                <CardDescription>
                  {PATROL_LOCATION.name}
                  {lastUpdated && (
                    <span className="ml-2 text-xs">
                      · Updated {lastUpdated.toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                    </span>
                  )}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {error ? (
              <div className="flex items-center gap-2 rounded-lg border border-destructive/30 bg-destructive/10 p-4 text-sm text-destructive">
                <AlertTriangle className="h-4 w-4" />
                {error}
              </div>
            ) : loading && !current ? (
              <div className="space-y-3">
                <Skeleton className="h-20 w-full" />
                <div className="grid grid-cols-3 gap-3">
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                  <Skeleton className="h-16" />
                </div>
              </div>
            ) : current && currentInfo ? (
              <div className="space-y-6">
                <div className="flex items-center gap-6">
                  <currentInfo.Icon className={`h-20 w-20 ${currentInfo.tone}`} />
                  <div>
                    <div className="text-5xl font-bold">{Math.round(current.temperature_2m)}°F</div>
                    <div className="mt-1 text-lg text-muted-foreground">{currentInfo.label}</div>
                    <div className="text-sm text-muted-foreground">
                      Feels like {Math.round(current.apparent_temperature)}°F
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                  <Stat
                    icon={<Wind className="h-4 w-4" />}
                    label="Wind"
                    value={`${Math.round(current.wind_speed_10m)} mph ${compass(current.wind_direction_10m)}`}
                  />
                  <Stat
                    icon={<Droplets className="h-4 w-4" />}
                    label="Humidity"
                    value={`${current.relative_humidity_2m}%`}
                  />
                  <Stat
                    icon={<Thermometer className="h-4 w-4" />}
                    label="Apparent"
                    value={`${Math.round(current.apparent_temperature)}°F`}
                  />
                </div>
              </div>
            ) : null}
          </CardContent>
        </Card>

        {/* Patrol advisory based on conditions */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-gold" />
              Patrol Advisory
            </CardTitle>
            <CardDescription>Auto-generated from current conditions.</CardDescription>
          </CardHeader>
          <CardContent>
            {current ? (
              <PatrolAdvisory current={current} />
            ) : (
              <Skeleton className="h-24 w-full" />
            )}
          </CardContent>
        </Card>

        {/* 5-day forecast */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>5-Day Forecast</CardTitle>
            <CardDescription>Plan upcoming shifts and special events.</CardDescription>
          </CardHeader>
          <CardContent>
            {weather?.daily ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
                {weather.daily.time.map((date, i) => {
                  const info = weatherInfo(weather.daily.weather_code[i]);
                  const d = new Date(date + "T00:00:00");
                  const isToday = i === 0;
                  return (
                    <div
                      key={date}
                      className="flex flex-col items-center gap-2 rounded-lg border bg-muted/30 p-3"
                    >
                      <div className="text-sm font-medium">
                        {isToday ? "Today" : d.toLocaleDateString([], { weekday: "short" })}
                      </div>
                      <info.Icon className={`h-8 w-8 ${info.tone}`} />
                      <div className="text-center">
                        <div className="font-semibold">
                          {Math.round(weather.daily.temperature_2m_max[i])}°
                          <span className="ml-1 text-muted-foreground">
                            {Math.round(weather.daily.temperature_2m_min[i])}°
                          </span>
                        </div>
                        <div className="mt-1 flex items-center justify-center gap-1 text-xs text-muted-foreground">
                          <Droplets className="h-3 w-3" />
                          {weather.daily.precipitation_probability_max[i] ?? 0}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <Skeleton key={i} className="h-32" />
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Internal quick links */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Quick Links</CardTitle>
            <CardDescription>Jump to the tools you use most often.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-3 sm:grid-cols-2">
              <InternalLink to="/dispatch" icon={<Radio className="h-5 w-5" />} title="Dispatch Reference" desc="10-codes, signals, radio directory" />
              <InternalLink to="/schedule" icon={<Calendar className="h-5 w-5" />} title="Schedule" desc="Shifts, sign-ups, calendar" />
              <InternalLink to="/roster" icon={<Users className="h-5 w-5" />} title="Roster" desc="Volunteer directory" />
              <InternalLink to="/vehicles" icon={<Truck className="h-5 w-5" />} title="Vehicles" desc="Fleet status & service" />
              <InternalLink to="/training" icon={<GraduationCap className="h-5 w-5" />} title="Training" desc="Courses & certifications" />
              <InternalLink to="/forms" icon={<FileText className="h-5 w-5" />} title="Forms & Documents" desc="SOPs, waivers, references" />
            </div>
          </CardContent>
        </Card>

        {/* External resources */}
        <Card>
          <CardHeader>
            <CardTitle>External Tools</CardTitle>
            <CardDescription>Trusted public resources.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <ExternalCard
                href="https://www.weather.gov/mfl/"
                title="National Weather Service — Miami"
                desc="Severe weather alerts & marine forecasts"
              />
              <ExternalCard
                href="https://www.nhc.noaa.gov/"
                title="National Hurricane Center"
                desc="Tropical storm & hurricane tracking"
              />
              <ExternalCard
                href="https://www.fl511.com/"
                title="FL511 Traffic"
                desc="Live road conditions & closures"
              />
              <ExternalCard
                href="https://www.fdle.state.fl.us/"
                title="FDLE"
                desc="FL Dept. of Law Enforcement"
              />
              <ExternalCard
                href="https://www.flhsmv.gov/"
                title="FLHSMV"
                desc="FL DMV / Highway Safety"
              />
            </div>
          </CardContent>
        </Card>
      </div>
    </PageShell>
  );
}

function Stat({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="rounded-lg border bg-muted/30 p-3">
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
        {icon}
        {label}
      </div>
      <div className="mt-1 font-semibold">{value}</div>
    </div>
  );
}

function PatrolAdvisory({ current }: { current: WeatherData["current"] }) {
  const advisories: { tone: "warning" | "info" | "success"; text: string }[] = [];
  const code = current.weather_code;
  const temp = current.temperature_2m;
  const wind = current.wind_speed_10m;

  if (code >= 95) advisories.push({ tone: "warning", text: "Thunderstorms — avoid open areas, expect lightning." });
  if (code >= 61 && code <= 82) advisories.push({ tone: "warning", text: "Active rain — reduce speed, headlights on." });
  if (code >= 45 && code <= 48) advisories.push({ tone: "warning", text: "Fog — use low beams, increase following distance." });
  if (wind >= 25) advisories.push({ tone: "warning", text: `High winds (${Math.round(wind)} mph) — secure loose equipment.` });
  if (temp >= 95) advisories.push({ tone: "warning", text: "Heat advisory — hydrate, take breaks, check on vulnerable persons." });
  if (temp <= 40) advisories.push({ tone: "info", text: "Cold conditions — dress in layers." });
  if (advisories.length === 0) {
    advisories.push({ tone: "success", text: "Conditions look good for normal patrol operations." });
  }

  const toneClass = {
    warning: "border-destructive/30 bg-destructive/10 text-destructive",
    info: "border-info/30 bg-info/10 text-info-foreground",
    success: "border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400",
  };

  return (
    <ul className="space-y-2">
      {advisories.map((a, i) => (
        <li key={i} className={`rounded-lg border p-3 text-sm ${toneClass[a.tone]}`}>
          {a.text}
        </li>
      ))}
    </ul>
  );
}

function InternalLink({
  to,
  icon,
  title,
  desc,
}: {
  to: string;
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <Link
      to={to}
      className="group flex items-start gap-3 rounded-lg border bg-card p-3 transition hover:border-primary hover:shadow-sm"
    >
      <div className="rounded-md bg-primary/10 p-2 text-primary group-hover:bg-primary group-hover:text-primary-foreground">
        {icon}
      </div>
      <div className="min-w-0 flex-1">
        <div className="font-medium">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{desc}</div>
      </div>
    </Link>
  );
}

function ExternalCard({ href, title, desc }: { href: string; title: string; desc: string }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="group flex items-start justify-between gap-3 rounded-lg border bg-card p-3 transition hover:border-primary hover:shadow-sm"
    >
      <div className="min-w-0 flex-1">
        <div className="font-medium">{title}</div>
        <div className="truncate text-xs text-muted-foreground">{desc}</div>
      </div>
      <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-primary" />
    </a>
  );
}
