import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import {
  FileText,
  Plus,
  Search,
  Download,
  Pencil,
  Trash2,
  Upload,
} from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import type { Database } from "@/integrations/supabase/types";
import { formatShortDate } from "@/lib/format";
import {
  CATEGORY_COLORS,
  CATEGORY_LABEL,
  DOCUMENT_CATEGORIES,
  fileIconLabel,
  formatFileSize,
} from "@/lib/documents";
import { DocumentFormDialog } from "@/components/forms/document-form-dialog";

type Document = Database["public"]["Tables"]["documents"]["Row"];

export const Route = createFileRoute("/_authed/forms")({
  head: () => ({
    meta: [
      { title: "Forms & Documents — CopSmart" },
      { name: "description", content: "Browse and download volunteer forms, SOPs, waivers, and reference materials." },
    ],
  }),
  component: FormsPage,
});

function FormsPage() {
  const auth = useAuth();
  const [documents, setDocuments] = useState<Document[] | null>(null);
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<string>("all");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<Document | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const canManage =
    auth.isAdmin || auth.hasRole("officer") || auth.hasRole("corporal_plus");

  const load = async () => {
    setDocuments(null);
    const { data, error } = await supabase
      .from("documents")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      toast.error(error.message);
      setDocuments([]);
      return;
    }
    setDocuments(data ?? []);
  };

  useEffect(() => {
    load();
  }, []);

  const filtered = useMemo(() => {
    if (!documents) return null;
    const q = search.trim().toLowerCase();
    return documents.filter((d) => {
      if (category !== "all" && d.category !== category) return false;
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.file_name.toLowerCase().includes(q) ||
        (d.description ?? "").toLowerCase().includes(q)
      );
    });
  }, [documents, search, category]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: documents?.length ?? 0 };
    DOCUMENT_CATEGORIES.forEach((c) => (map[c.value] = 0));
    documents?.forEach((d) => {
      map[d.category] = (map[d.category] ?? 0) + 1;
    });
    return map;
  }, [documents]);

  const handleDownload = async (doc: Document) => {
    setDownloadingId(doc.id);
    try {
      const { data, error } = await supabase.storage
        .from("documents")
        .createSignedUrl(doc.file_path, 60, { download: doc.file_name });
      if (error || !data?.signedUrl) throw error ?? new Error("No URL");
      window.open(data.signedUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Could not download.";
      toast.error(msg);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (doc: Document) => {
    const { error: rmErr } = await supabase.storage
      .from("documents")
      .remove([doc.file_path]);
    if (rmErr) {
      toast.error(rmErr.message);
      return;
    }
    const { error } = await supabase.from("documents").delete().eq("id", doc.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Document deleted.");
    load();
  };

  return (
    <PageShell
      title="Forms & Documents"
      subtitle="Browse, search, and download volunteer forms, SOPs, and reference materials."
      crumbs={[{ label: "Forms" }]}
      actions={
        canManage && (
          <Button
            onClick={() => {
              setEditing(null);
              setDialogOpen(true);
            }}
            className="h-12 gap-2"
          >
            <Plus className="h-5 w-5" />
            Upload document
          </Button>
        )
      }
    >
      {/* Filters */}
      <div className="mb-6 flex flex-wrap items-end gap-3 rounded-2xl border bg-surface p-4">
        <div className="grid min-w-[260px] flex-1 gap-1">
          <label htmlFor="doc-search" className="text-sm font-medium">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="doc-search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Title, filename, or description"
              className="h-12 pl-10"
            />
          </div>
        </div>
        <div className="grid gap-1">
          <label htmlFor="doc-cat-filter" className="text-sm font-medium">
            Category
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="doc-cat-filter" className="h-12 w-56">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All ({counts.all})</SelectItem>
              {DOCUMENT_CATEGORIES.map((c) => (
                <SelectItem key={c.value} value={c.value}>
                  {c.label} ({counts[c.value] ?? 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      {filtered === null ? (
        <div className="grid gap-3">
          {[0, 1, 2].map((i) => (
            <Skeleton key={i} className="h-24 rounded-2xl" />
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="rounded-2xl border-2 border-dashed bg-card p-12 text-center">
          <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">
            {documents && documents.length === 0
              ? "No documents have been uploaded yet."
              : "No documents match your filters."}
          </p>
          {canManage && documents && documents.length === 0 && (
            <Button
              onClick={() => {
                setEditing(null);
                setDialogOpen(true);
              }}
              className="mt-4 h-12 gap-2"
            >
              <Upload className="h-5 w-5" />
              Upload the first document
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-3">
          {filtered.map((doc) => (
            <article
              key={doc.id}
              className="rounded-2xl border bg-card p-5 shadow-card"
            >
              <div className="flex flex-wrap items-start gap-4">
                <div className="flex h-14 w-14 shrink-0 flex-col items-center justify-center rounded-xl bg-primary/10 text-primary">
                  <FileText className="h-6 w-6" />
                  <span className="mt-0.5 text-[10px] font-bold tracking-tight">
                    {fileIconLabel(doc.mime_type, doc.file_name)}
                  </span>
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-lg font-semibold">{doc.title}</h3>
                    <Badge className={CATEGORY_COLORS[doc.category] ?? ""}>
                      {CATEGORY_LABEL[doc.category] ?? doc.category}
                    </Badge>
                  </div>
                  {doc.description && (
                    <p className="mt-1 text-base text-muted-foreground">
                      {doc.description}
                    </p>
                  )}
                  <p className="mt-2 text-sm text-muted-foreground">
                    <span className="font-mono">{doc.file_name}</span>
                    <span className="mx-2">·</span>
                    {formatFileSize(doc.file_size)}
                    <span className="mx-2">·</span>
                    Uploaded {formatShortDate(doc.created_at.slice(0, 10))}
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button
                    onClick={() => handleDownload(doc)}
                    disabled={downloadingId === doc.id}
                    className="h-12 gap-2"
                  >
                    <Download className="h-5 w-5" />
                    {downloadingId === doc.id ? "Preparing…" : "Download"}
                  </Button>
                  {canManage && (
                    <>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setEditing(doc);
                          setDialogOpen(true);
                        }}
                        className="h-12 gap-2"
                      >
                        <Pencil className="h-5 w-5" />
                        Edit
                      </Button>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            className="h-12 gap-2 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-5 w-5" />
                            Delete
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>Delete this document?</AlertDialogTitle>
                            <AlertDialogDescription>
                              "{doc.title}" will be permanently removed from the library and storage. This cannot be undone.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                            <AlertDialogAction onClick={() => handleDelete(doc)}>
                              Yes, delete
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}

      <DocumentFormDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        document={editing}
        onSaved={load}
      />
    </PageShell>
  );
}
