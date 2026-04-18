export const DOCUMENT_CATEGORIES = [
  { value: "sop", label: "SOP / Policy" },
  { value: "waiver", label: "Waiver / Release" },
  { value: "form", label: "Form" },
  { value: "training", label: "Training Material" },
  { value: "reference", label: "Reference" },
  { value: "other", label: "Other" },
] as const;

export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number]["value"];

export const CATEGORY_LABEL: Record<string, string> = Object.fromEntries(
  DOCUMENT_CATEGORIES.map((c) => [c.value, c.label]),
);

export const CATEGORY_COLORS: Record<string, string> = {
  sop: "bg-primary text-primary-foreground",
  waiver: "bg-amber-500 text-white",
  form: "bg-info text-info-foreground",
  training: "bg-success text-success-foreground",
  reference: "bg-secondary text-secondary-foreground",
  other: "bg-muted text-muted-foreground",
};

export function formatFileSize(bytes: number | null): string {
  if (!bytes) return "—";
  const units = ["B", "KB", "MB", "GB"];
  let size = bytes;
  let i = 0;
  while (size >= 1024 && i < units.length - 1) {
    size /= 1024;
    i++;
  }
  return `${size.toFixed(size >= 10 || i === 0 ? 0 : 1)} ${units[i]}`;
}

export function fileIconLabel(mime: string | null, name: string): string {
  if (!mime && !name) return "FILE";
  const ext = name.split(".").pop()?.toUpperCase() ?? "";
  if (ext) return ext.slice(0, 4);
  if (mime?.includes("pdf")) return "PDF";
  if (mime?.startsWith("image/")) return "IMG";
  return "FILE";
}
