import { createFileRoute } from "@tanstack/react-router";
import { useState, useRef } from "react";
import {
  FileJson,
  FileSpreadsheet,
  Upload,
  Download,
  AlertTriangle,
  CheckCircle2,
  Loader2,
  FileArchive,
  Sparkles,
} from "lucide-react";
import JSZip from "jszip";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { supabase } from "@/integrations/supabase/client";
import {
  EXPORTABLE_TABLES,
  fetchAllTables,
  rowsToCSV,
  downloadBlob,
  diffBundle,
  type ExportBundle,
  type DryRunReport,
  type ExportableTable,
} from "@/lib/migration";
import { seedDemoData } from "@/server/seed-demo-data";

export const Route = createFileRoute("/_authed/admin/migration")({
  head: () => ({ meta: [{ title: "Data Migration — VolSmart" }] }),
  component: MigrationPage,
});

function MigrationPage() {
  const auth = useAuth();
  const [exporting, setExporting] = useState<"json" | "csv" | null>(null);
  const [importing, setImporting] = useState(false);
  const [bundle, setBundle] = useState<ExportBundle | null>(null);
  const [report, setReport] = useState<DryRunReport[] | null>(null);
  const [applying, setApplying] = useState(false);
  const [seeding, setSeeding] = useState(false);
  const fileInput = useRef<HTMLInputElement>(null);

  if (!auth.isAdmin) {
    return (
      <PageShell title="Access Denied" crumbs={[{ label: "Data Migration" }]}>
        <Card className="p-6">
          You need administrator privileges to view this page.
        </Card>
      </PageShell>
    );
  }

  const exportJSON = async () => {
    setExporting("json");
    try {
      const tables = await fetchAllTables(EXPORTABLE_TABLES);
      const bundle: ExportBundle = {
        version: 1,
        exported_at: new Date().toISOString(),
        exported_by: auth.profile?.full_name ?? null,
        tables,
      };
      const blob = new Blob([JSON.stringify(bundle, null, 2)], {
        type: "application/json",
      });
      downloadBlob(
        blob,
        `copsmart-export-${new Date().toISOString().slice(0, 10)}.json`,
      );
      await supabase.from("audit_log").insert({
        action: "export_json",
        entity: "migration",
        user_id: auth.user?.id,
        details: {
          rows: Object.fromEntries(
            Object.entries(tables).map(([k, v]) => [k, v.length]),
          ),
        },
      });
      toast.success("JSON export downloaded.");
    } catch (e) {
      toast.error("Export failed", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setExporting(null);
    }
  };

  const exportCSVZip = async () => {
    setExporting("csv");
    try {
      const tables = await fetchAllTables(EXPORTABLE_TABLES);
      const zip = new JSZip();
      for (const [name, rows] of Object.entries(tables)) {
        zip.file(`${name}.csv`, rowsToCSV(rows));
      }
      zip.file(
        "_metadata.json",
        JSON.stringify(
          {
            exported_at: new Date().toISOString(),
            exported_by: auth.profile?.full_name ?? null,
            tables: Object.fromEntries(
              Object.entries(tables).map(([k, v]) => [k, v.length]),
            ),
          },
          null,
          2,
        ),
      );
      const blob = await zip.generateAsync({ type: "blob" });
      downloadBlob(
        blob,
        `copsmart-export-${new Date().toISOString().slice(0, 10)}.zip`,
      );
      await supabase.from("audit_log").insert({
        action: "export_csv",
        entity: "migration",
        user_id: auth.user?.id,
      });
      toast.success("CSV bundle downloaded.");
    } catch (e) {
      toast.error("Export failed", {
        description: e instanceof Error ? e.message : String(e),
      });
    } finally {
      setExporting(null);
    }
  };

  const onFilePicked = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    setImporting(true);
    setBundle(null);
    setReport(null);
    try {
      const text = await file.text();
      const parsed = JSON.parse(text) as ExportBundle;
      if (parsed.version !== 1 || typeof parsed.tables !== "object") {
        throw new Error("Not a valid VolSmart export bundle (version 1).");
      }
      const current = await fetchAllTables(Object.keys(parsed.tables));
      const dry = diffBundle(parsed, current);
      setBundle(parsed);
      setReport(dry);
      toast.success("Bundle parsed. Review the dry-run preview.");
    } catch (err) {
      toast.error("Couldn't read bundle", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setImporting(false);
    }
  };

  const applyImport = async () => {
    if (!bundle) return;
    if (
      !window.confirm(
        "This will upsert data into the database. Continue?",
      )
    )
      return;
    setApplying(true);
    let successCount = 0;
    const failures: string[] = [];
    try {
      for (const [table, rows] of Object.entries(bundle.tables)) {
        if (rows.length === 0) continue;
        const { error } = await supabase
          .from(table as ExportableTable)
          .upsert(rows as never[], { onConflict: "id" });
        if (error) failures.push(`${table}: ${error.message}`);
        else successCount += rows.length;
      }
      await supabase.from("audit_log").insert({
        action: "import_apply",
        entity: "migration",
        user_id: auth.user?.id,
        details: {
          succeeded_rows: successCount,
          failures,
        },
      });
      if (failures.length === 0) {
        toast.success(`Imported ${successCount} rows successfully.`);
      } else {
        toast.error(`Import partially failed (${failures.length} tables).`, {
          description: failures.slice(0, 3).join(" · "),
        });
      }
      setBundle(null);
      setReport(null);
    } catch (err) {
      toast.error("Import failed", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setApplying(false);
    }
  };

  const runSeed = async () => {
    if (
      !window.confirm(
        "This creates 8 demo accounts (admin, officers, corporals, volunteers) with shifts and training. Re-running is safe — it updates existing demo records. Continue?",
      )
    )
      return;
    setSeeding(true);
    try {
      const result = await seedDemoData();
      toast.success(
        `Demo data ready — ${result.usersCreated} created, ${result.usersUpdated} updated.`,
        {
          description: `Sign in with badges D100/D201/D301/D401 etc. Password: ${result.password}`,
          duration: 8000,
        },
      );
    } catch (err) {
      toast.error("Seeding failed", {
        description: err instanceof Error ? err.message : String(err),
      });
    } finally {
      setSeeding(false);
    }
  };

  return (
    <PageShell
      title="Data Migration"
      subtitle="Import or export everything in VolSmart."
      crumbs={[{ label: "Data Migration" }]}
    >
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Export */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
              <Download className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Export</h2>
              <p className="text-sm text-muted-foreground">
                Download a full snapshot of all VolSmart tables.
              </p>
            </div>
          </div>

          <ul className="mt-4 space-y-1 text-xs text-muted-foreground">
            {EXPORTABLE_TABLES.map((t) => (
              <li key={t}>
                <code>{t}</code>
              </li>
            ))}
          </ul>

          <div className="mt-5 flex flex-wrap gap-3">
            <Button onClick={exportJSON} disabled={exporting !== null}>
              {exporting === "json" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileJson className="h-4 w-4" />
              )}
              Download JSON
            </Button>
            <Button
              variant="secondary"
              onClick={exportCSVZip}
              disabled={exporting !== null}
            >
              {exporting === "csv" ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <FileArchive className="h-4 w-4" />
              )}
              Download CSV bundle (.zip)
            </Button>
          </div>
        </Card>

        {/* Import */}
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-amber-500/15 text-amber-600">
              <Upload className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Import (JSON bundle)</h2>
              <p className="text-sm text-muted-foreground">
                Upload an export bundle. We'll show a dry-run preview first.
              </p>
            </div>
          </div>

          <div className="mt-4 rounded-lg border border-amber-500/40 bg-amber-500/5 p-3 text-sm text-amber-700">
            <AlertTriangle className="mr-1 inline h-4 w-4" />
            Importing upserts rows by <code>id</code>. Existing rows will be
            overwritten. Always export a backup first.
          </div>

          <input
            ref={fileInput}
            type="file"
            accept="application/json,.json"
            className="hidden"
            onChange={onFilePicked}
          />
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => fileInput.current?.click()}
            disabled={importing || applying}
          >
            {importing ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Upload className="h-4 w-4" />
            )}
            Choose JSON bundle…
          </Button>
        </Card>
      </div>

      {/* Demo data seeder */}
      <Card className="mt-6 p-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gold/15 text-gold">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Seed demo dataset</h2>
              <p className="text-sm text-muted-foreground">
                Creates 8 demo accounts (1 admin, 2 officers, 2 corporals, 3
                volunteers) plus shifts, training, and announcements. Sign in
                with badges D100–D403, password <code>demo1234</code>.
              </p>
            </div>
          </div>
          <Button onClick={runSeed} disabled={seeding} className="shrink-0">
            {seeding ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Sparkles className="h-4 w-4" />
            )}
            Seed demo data
          </Button>
        </div>
      </Card>

      {/* Dry-run preview */}
      {report && bundle && (
        <Card className="mt-6 p-6">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Dry-run preview</h3>
              <p className="text-sm text-muted-foreground">
                Bundle exported{" "}
                {new Date(bundle.exported_at).toLocaleString()}
                {bundle.exported_by && <> by {bundle.exported_by}</>}.
              </p>
            </div>
            <Badge variant="secondary">v{bundle.version}</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <tr>
                  <th className="py-2 pr-3">Table</th>
                  <th className="py-2 pr-3 text-right">Insert</th>
                  <th className="py-2 pr-3 text-right">Update</th>
                  <th className="py-2 pr-3 text-right">Unchanged</th>
                  <th className="py-2 text-right">Issues</th>
                </tr>
              </thead>
              <tbody>
                {report.map((r) => (
                  <tr key={r.table} className="border-b last:border-0">
                    <td className="py-2 pr-3 font-mono">{r.table}</td>
                    <td className="py-2 pr-3 text-right font-mono text-emerald-600">
                      {r.toInsert}
                    </td>
                    <td className="py-2 pr-3 text-right font-mono text-amber-600">
                      {r.toUpdate}
                    </td>
                    <td className="py-2 pr-3 text-right font-mono text-muted-foreground">
                      {r.unchanged}
                    </td>
                    <td className="py-2 text-right font-mono text-destructive">
                      {r.errors.length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-5 flex items-center justify-end gap-3">
            <Button
              variant="ghost"
              onClick={() => {
                setBundle(null);
                setReport(null);
              }}
              disabled={applying}
            >
              Cancel
            </Button>
            <Button onClick={applyImport} disabled={applying}>
              {applying ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Apply import
            </Button>
          </div>
        </Card>
      )}
    </PageShell>
  );
}
