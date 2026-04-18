import { useEffect, useState } from "react";
import { CloudSun, Cloud, CloudRain, CloudSnow, CloudLightning, Sun, CloudFog, Wind } from "lucide-react";

interface ForecastPeriod {
  number: number;
  name: string;
  temperature: number;
  temperatureUnit: string;
  windSpeed: string;
  windDirection: string;
  shortForecast: string;
  isDaytime: boolean;
  icon: string;
}

// PBSO HQ — West Palm Beach, FL
const LAT = 26.6845;
const LON = -80.1086;

function pickIcon(forecast: string) {
  const f = forecast.toLowerCase();
  if (f.includes("thunder")) return CloudLightning;
  if (f.includes("rain") || f.includes("shower")) return CloudRain;
  if (f.includes("snow")) return CloudSnow;
  if (f.includes("fog") || f.includes("haze")) return CloudFog;
  if (f.includes("wind")) return Wind;
  if (f.includes("cloud")) return Cloud;
  if (f.includes("sun") || f.includes("clear")) return Sun;
  return CloudSun;
}

export function WeatherWidget() {
  const [periods, setPeriods] = useState<ForecastPeriod[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const pointRes = await fetch(`https://api.weather.gov/points/${LAT},${LON}`);
        if (!pointRes.ok) throw new Error("Unable to locate forecast office");
        const point = await pointRes.json();
        const forecastUrl = point?.properties?.forecast;
        if (!forecastUrl) throw new Error("No forecast URL");
        const fcRes = await fetch(forecastUrl);
        if (!fcRes.ok) throw new Error("Forecast unavailable");
        const fc = await fcRes.json();
        if (!cancelled) setPeriods(fc?.properties?.periods?.slice(0, 5) ?? []);
      } catch (e) {
        if (!cancelled) setError(e instanceof Error ? e.message : "Weather unavailable");
      }
    }
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <section aria-label="Weather forecast" className="mb-8">
      <h2 className="mb-4 flex items-center gap-2 text-2xl">
        <CloudSun className="h-6 w-6 text-info" />
        Patrol Weather — West Palm Beach
      </h2>

      {error ? (
        <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-muted-foreground">
          {error}
        </div>
      ) : !periods ? (
        <div className="rounded-2xl border bg-card p-6 text-center text-muted-foreground shadow-card">
          Loading forecast…
        </div>
      ) : periods.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-card p-6 text-center text-muted-foreground">
          No forecast data available.
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {periods.map((p, idx) => {
            const Icon = pickIcon(p.shortForecast);
            const isNow = idx === 0;
            return (
              <article
                key={p.number}
                className={`rounded-2xl border p-5 shadow-card ${
                  isNow ? "border-info bg-info/5" : "bg-card"
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-base font-semibold">{p.name}</h3>
                  <Icon className={`h-7 w-7 ${p.isDaytime ? "text-gold" : "text-info"}`} />
                </div>
                <p className="mt-2 text-3xl font-bold text-card-foreground">
                  {p.temperature}°{p.temperatureUnit}
                </p>
                <p className="mt-1 line-clamp-2 text-sm text-muted-foreground">
                  {p.shortForecast}
                </p>
                <p className="mt-2 text-xs text-muted-foreground">
                  Wind {p.windSpeed} {p.windDirection}
                </p>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
