import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import {
  DOCUMENT_CATEGORIES,
  type DocumentCategory,
  formatFileSize,
} from "@/lib/documents";

type Document = Database["public"]["Tables"]["documents"]["Row"];

const MAX_BYTES = 25 * 1024 * 1024; // 25 MB

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  document?: Document | null; // editing existing metadata
  onSaved: () => void;
}

export function DocumentFormDialog({ open, onOpenChange, document, onSaved }: Props) {
  const isEdit = !!document;
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("other");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!open) return;
    setTitle(document?.title ?? "");
    setDescription(document?.description ?? "");
    setCategory((document?.category as DocumentCategory) ?? "other");
    setFile(null);
  }, [open, document]);

  const handleSave = async () => {
    if (!title.trim()) {
      toast.error("Please enter a title.");
      return;
    }
    if (!isEdit && !file) {
      toast.error("Please choose a file to upload.");
      return;
    }
    if (file && file.size > MAX_BYTES) {
      toast.error(`File too large. Max ${formatFileSize(MAX_BYTES)}.`);
      return;
    }
    setSaving(true);

    try {
      const userRes = await supabase.auth.getUser();
      const userId = userRes.data.user?.id ?? null;

      if (isEdit && document) {
        // metadata-only update
        const { error } = await supabase
          .from("documents")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            category,
          })
          .eq("id", document.id);
        if (error) throw error;
      } else if (file) {
        const ext = file.name.includes(".") ? file.name.split(".").pop() : "";
        const safe = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}${ext ? `.${ext}` : ""}`;
        const path = `${userId ?? "anonymous"}/${safe}`;

        const { error: upErr } = await supabase.storage
          .from("documents")
          .upload(path, file, {
            contentType: file.type || undefined,
            upsert: false,
          });
        if (upErr) throw upErr;

        const { error: insErr } = await supabase.from("documents").insert({
          title: title.trim(),
          description: description.trim() || null,
          category,
          file_path: path,
          file_name: file.name,
          mime_type: file.type || null,
          file_size: file.size,
          uploaded_by: userId,
        });
        if (insErr) {
          // best-effort cleanup of orphaned upload
          await supabase.storage.from("documents").remove([path]);
          throw insErr;
        }
      }

      toast.success(isEdit ? "Document updated." : "Document uploaded.");
      onSaved();
      onOpenChange(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Upload failed.";
      toast.error(msg);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? "Edit document" : "Upload a new document"}
          </DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the document's title, description, or category. To replace the file itself, delete and re-upload."
              : "Choose a PDF, Word, image, or other file to add to the library."}
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 py-2">
          <div className="grid gap-2">
            <Label htmlFor="doc-title">Title</Label>
            <Input
              id="doc-title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Volunteer Patrol SOP"
              className="h-12"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="doc-cat">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as DocumentCategory)}>
              <SelectTrigger id="doc-cat" className="h-12">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_CATEGORIES.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="doc-desc">Description (optional)</Label>
            <Textarea
              id="doc-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
              placeholder="Brief summary of what this document is for."
            />
          </div>

          {!isEdit && (
            <div className="grid gap-2">
              <Label htmlFor="doc-file">File</Label>
              <Input
                id="doc-file"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                className="h-12 cursor-pointer file:mr-3 file:rounded-md file:border-0 file:bg-primary file:px-3 file:py-2 file:text-sm file:font-semibold file:text-primary-foreground"
              />
              {file && (
                <p className="text-sm text-muted-foreground">
                  {file.name} · {formatFileSize(file.size)}
                </p>
              )}
              <p className="text-xs text-muted-foreground">
                Max 25 MB per file.
              </p>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={saving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={saving} className="gap-2">
            {!isEdit && <Upload className="h-5 w-5" />}
            {saving ? "Saving…" : isEdit ? "Save changes" : "Upload"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
