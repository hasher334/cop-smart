import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, Radio, Hash, Siren, X } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  TEN_CODES,
  SIGNAL_CODES,
  RADIO_DIRECTORY,
  type CodeEntry,
  type RadioContact,
} from "@/lib/dispatch-data";

export const Route = createFileRoute("/_authed/dispatch")({
  head: () => ({
    meta: [
      { title: "Dispatch Reference — VolSmart" },
      {
        name: "description",
        content:
          "Search 10-codes, dispatch signals, and the radio directory. Quick on-scene reference for volunteers.",
      },
    ],
  }),
  component: DispatchPage,
});

const PRIORITY_STYLES: Record<string, string> = {
  Priority: "bg-destructive text-destructive-foreground",
  Calls: "bg-info text-info-foreground",
  Status: "bg-secondary text-secondary-foreground",
  Info: "bg-muted text-foreground",
  Radio: "bg-warning text-warning-foreground",
};

function DispatchPage() {
  const [tab, setTab] = useState("ten");
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<string>("all");

  // Combine categories from both code lists for the filter dropdown
  const categories = useMemo(() => {
    const set = new Set<string>();
    [...TEN_CODES, ...SIGNAL_CODES].forEach((c) => c.category && set.add(c.category));
    return Array.from(set).sort();
  }, []);

  return (
    <PageShell
      title="Dispatch Reference"
      subtitle="Look up 10-codes, dispatch signals, and the radio directory in seconds."
      crumbs={[{ label: "Dispatch" }]}
    >
      <div className="mb-4 grid gap-3 rounded-2xl border bg-surface p-4 sm:grid-cols-[1fr_auto]">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search code, name, or description… (try 10-4, pursuit, alarm)"
            className="h-12 pl-10 pr-10 text-base"
            aria-label="Search dispatch reference"
          />
          {query && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 h-10 w-10 -translate-y-1/2"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
        {tab !== "radio" && (
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-12 w-full sm:w-48">
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="grid h-auto w-full grid-cols-3 gap-1 bg-surface p-1">
          <TabsTrigger value="ten" className="h-12 gap-2">
            <Hash className="h-5 w-5" />
            <span>10-Codes</span>
          </TabsTrigger>
          <TabsTrigger value="signal" className="h-12 gap-2">
            <Siren className="h-5 w-5" />
            <span>Signals</span>
          </TabsTrigger>
          <TabsTrigger value="radio" className="h-12 gap-2">
            <Radio className="h-5 w-5" />
            <span>Radio</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="ten" className="mt-6">
          <CodeList items={TEN_CODES} query={query} category={category} label="10-codes" />
        </TabsContent>
        <TabsContent value="signal" className="mt-6">
          <CodeList items={SIGNAL_CODES} query={query} category={category} label="signals" />
        </TabsContent>
        <TabsContent value="radio" className="mt-6">
          <RadioList items={RADIO_DIRECTORY} query={query} />
        </TabsContent>
      </Tabs>
    </PageShell>
  );
}

function matches(needle: string, ...haystack: (string | undefined)[]) {
  const q = needle.trim().toLowerCase();
  if (!q) return true;
  return haystack.some((h) => h?.toLowerCase().includes(q));
}

function CodeList({
  items,
  query,
  category,
  label,
}: {
  items: CodeEntry[];
  query: string;
  category: string;
  label: string;
}) {
  const filtered = useMemo(() => {
    return items.filter((c) => {
      if (category !== "all" && c.category !== category) return false;
      return matches(query, c.code, c.name, c.description, c.category);
    });
  }, [items, query, category]);

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed bg-card p-10 text-center">
        <p className="text-lg text-muted-foreground">
          No {label} match your search. Try a different word or clear the filters.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        Showing {filtered.length} of {items.length} {label}.
      </p>
      <ul className="grid gap-3">
        {filtered.map((c) => (
          <li
            key={c.code}
            className="rounded-2xl border bg-card p-4 shadow-card sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xl font-bold tracking-wide text-primary">
                    {c.code}
                  </span>
                  <span className="text-lg font-semibold">{c.name}</span>
                </div>
                <p className="mt-1 text-base text-muted-foreground">{c.description}</p>
              </div>
              {c.category && (
                <Badge className={PRIORITY_STYLES[c.category] ?? "bg-muted text-foreground"}>
                  {c.category}
                </Badge>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}

function RadioList({ items, query }: { items: RadioContact[]; query: string }) {
  const filtered = useMemo(
    () =>
      items.filter((r) =>
        matches(query, r.callsign, r.unit, r.channel, r.notes),
      ),
    [items, query],
  );

  if (filtered.length === 0) {
    return (
      <div className="rounded-2xl border-2 border-dashed bg-card p-10 text-center">
        <p className="text-lg text-muted-foreground">
          No radio contacts match your search.
        </p>
      </div>
    );
  }

  return (
    <>
      <p className="mb-3 text-sm text-muted-foreground">
        Showing {filtered.length} of {items.length} contacts.
      </p>
      <ul className="grid gap-3">
        {filtered.map((r) => (
          <li
            key={`${r.callsign}-${r.channel}`}
            className="rounded-2xl border bg-card p-4 shadow-card sm:p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="font-mono text-xl font-bold text-primary">
                    {r.callsign}
                  </span>
                  <span className="text-lg font-semibold">{r.unit}</span>
                </div>
                {r.notes && (
                  <p className="mt-1 text-base text-muted-foreground">{r.notes}</p>
                )}
              </div>
              <Badge className="bg-secondary text-secondary-foreground font-mono">
                {r.channel}
              </Badge>
            </div>
          </li>
        ))}
      </ul>
    </>
  );
}
