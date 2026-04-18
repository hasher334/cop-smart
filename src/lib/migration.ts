import { supabase } from "@/integrations/supabase/client";

export const EXPORTABLE_TABLES = [
  "units",
  "profiles",
  "user_roles",
  "vehicles",
  "training_courses",
  "training_records",
  "patrol_shifts",
  "announcements",
  "documents",
] as const;

export type ExportableTable = (typeof EXPORTABLE_TABLES)[number];

export interface ExportBundle {
  version: 1;
  exported_at: string;
  exported_by: string | null;
  tables: Record<string, unknown[]>;
}

export async function fetchAllTables(
  tables: readonly string[],
): Promise<Record<string, unknown[]>> {
  const out: Record<string, unknown[]> = {};
  for (const t of tables) {
    const { data, error } = await supabase
      .from(t as ExportableTable)
      .select("*");
    if (error) throw new Error(`Failed to read ${t}: ${error.message}`);
    out[t] = data ?? [];
  }
  return out;
}

export function rowsToCSV(rows: unknown[]): string {
  if (rows.length === 0) return "";
  const cols = Array.from(
    new Set(rows.flatMap((r) => Object.keys(r as Record<string, unknown>))),
  );
  const escape = (v: unknown) => {
    if (v === null || v === undefined) return "";
    const s = typeof v === "object" ? JSON.stringify(v) : String(v);
    return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const lines = [cols.join(",")];
  for (const r of rows) {
    const obj = r as Record<string, unknown>;
    lines.push(cols.map((c) => escape(obj[c])).join(","));
  }
  return lines.join("\n");
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

export interface DryRunReport {
  table: string;
  toInsert: number;
  toUpdate: number;
  unchanged: number;
  errors: string[];
}

export function diffBundle(
  bundle: ExportBundle,
  current: Record<string, unknown[]>,
): DryRunReport[] {
  const reports: DryRunReport[] = [];
  for (const [table, rows] of Object.entries(bundle.tables)) {
    const existing = current[table] ?? [];
    const existingById = new Map<string, Record<string, unknown>>();
    for (const r of existing) {
      const obj = r as Record<string, unknown>;
      if (typeof obj.id === "string") existingById.set(obj.id, obj);
    }
    let toInsert = 0;
    let toUpdate = 0;
    let unchanged = 0;
    const errors: string[] = [];
    for (const r of rows) {
      const obj = r as Record<string, unknown>;
      if (typeof obj.id !== "string") {
        errors.push("Row missing id");
        continue;
      }
      const cur = existingById.get(obj.id);
      if (!cur) toInsert++;
      else if (JSON.stringify(cur) !== JSON.stringify(obj)) toUpdate++;
      else unchanged++;
    }
    reports.push({ table, toInsert, toUpdate, unchanged, errors });
  }
  return reports;
}
