import { useEffect, useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import {
  GraduationCap,
  Plus,
  Search,
  Pencil,
  Trash2,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Star,
} from "lucide-react";
import { toast } from "sonner";
import { PageShell } from "@/components/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/use-auth";
import { CourseFormDialog } from "@/components/training/course-form-dialog";
import { RecordFormDialog } from "@/components/training/record-form-dialog";
import {
  EXPIRATION_META,
  getExpirationStatus,
  daysUntilExpiration,
  type ExpirationStatus,
} from "@/lib/training";
import { formatShortDate, formatLongDate } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Course = Database["public"]["Tables"]["training_courses"]["Row"];
type TRecord = Database["public"]["Tables"]["training_records"]["Row"];
type Profile = Database["public"]["Tables"]["profiles"]["Row"];

export const Route = createFileRoute("/_authed/training")({
  head: () => ({ meta: [{ title: "Training — VolSmart" }] }),
  component: TrainingPage,
});

function TrainingPage() {
  const { user, hasRole, isAdmin } = useAuth();
  const canManage = isAdmin || hasRole("officer") || hasRole("corporal_plus");

  const [courses, setCourses] = useState<Course[]>([]);
  const [records, setRecords] = useState<TRecord[]>([]);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  const [tab, setTab] = useState<"mine" | "all" | "catalog">("mine");

  const [courseFormOpen, setCourseFormOpen] = useState(false);
  const [editingCourse, setEditingCourse] = useState<Course | null>(null);
  const [recordFormOpen, setRecordFormOpen] = useState(false);
  const [editingRecord, setEditingRecord] = useState<TRecord | null>(null);
  const [recordDefaultUserId, setRecordDefaultUserId] = useState<string | undefined>();
  const [deleteRecord, setDeleteRecord] = useState<TRecord | null>(null);
  const [deleteCourse, setDeleteCourse] = useState<Course | null>(null);

  const load = async () => {
    setLoading(true);
    const [c, r, p] = await Promise.all([
      supabase.from("training_courses").select("*").order("code"),
      supabase.from("training_records").select("*").order("completion_date", { ascending: false }),
      supabase.from("profiles").select("*").order("full_name"),
    ]);
    if (c.error) toast.error(c.error.message);
    if (r.error) toast.error(r.error.message);
    setCourses(c.data ?? []);
    setRecords(r.data ?? []);
    setProfiles(p.data ?? []);
    setLoading(false);
  };

  useEffect(() => {
    load();
  }, []);

  const courseMap = useMemo(() => new Map(courses.map((c) => [c.id, c])), [courses]);
  const profileMap = useMemo(
    () => new Map(profiles.map((p) => [p.user_id, p])),
    [profiles],
  );

  const myRecords = useMemo(
    () => records.filter((r) => r.user_id === user?.id),
    [records, user?.id],
  );

  const handleDeleteRecord = async () => {
    if (!deleteRecord) return;
    const { error } = await supabase
      .from("training_records")
      .delete()
      .eq("id", deleteRecord.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Record removed.");
    setDeleteRecord(null);
    load();
  };

  const handleDeleteCourse = async () => {
    if (!deleteCourse) return;
    const { error } = await supabase
      .from("training_courses")
      .delete()
      .eq("id", deleteCourse.id);
    if (error) {
      toast.error(error.message);
      return;
    }
    toast.success("Course removed.");
    setDeleteCourse(null);
    load();
  };

  const openAddRecord = (forUserId?: string) => {
    setEditingRecord(null);
    setRecordDefaultUserId(forUserId);
    setRecordFormOpen(true);
  };

  return (
    <PageShell
      title="Training & Certifications"
      subtitle="Track completed training, expirations, and required courses."
      crumbs={[{ label: "Training" }]}
    >
      <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
        <TabsList className="grid w-full grid-cols-2 md:w-auto md:grid-cols-3">
          <TabsTrigger value="mine">My Records</TabsTrigger>
          <TabsTrigger value="catalog">Course Catalog</TabsTrigger>
          {canManage && <TabsTrigger value="all">All Records</TabsTrigger>}
        </TabsList>

        <TabsContent value="mine" className="mt-6">
          <MyRecordsTab
            records={myRecords}
            courses={courses}
            courseMap={courseMap}
            userId={user?.id}
            canManage={canManage}
            loading={loading}
            onAdd={() => openAddRecord(user?.id)}
            onEdit={(r) => {
              setEditingRecord(r);
              setRecordFormOpen(true);
            }}
            onDelete={setDeleteRecord}
          />
        </TabsContent>

        <TabsContent value="catalog" className="mt-6">
          <CatalogTab
            courses={courses}
            loading={loading}
            canManage={canManage}
            onAdd={() => {
              setEditingCourse(null);
              setCourseFormOpen(true);
            }}
            onEdit={(c) => {
              setEditingCourse(c);
              setCourseFormOpen(true);
            }}
            onDelete={setDeleteCourse}
          />
        </TabsContent>

        {canManage && (
          <TabsContent value="all" className="mt-6">
            <AllRecordsTab
              records={records}
              courseMap={courseMap}
              profileMap={profileMap}
              loading={loading}
              onAdd={() => openAddRecord()}
              onEdit={(r) => {
                setEditingRecord(r);
                setRecordFormOpen(true);
              }}
              onDelete={setDeleteRecord}
            />
          </TabsContent>
        )}
      </Tabs>

      <CourseFormDialog
        open={courseFormOpen}
        onOpenChange={setCourseFormOpen}
        course={editingCourse}
        onSaved={load}
      />

      <RecordFormDialog
        open={recordFormOpen}
        onOpenChange={setRecordFormOpen}
        courses={courses.filter((c) => c.active)}
        volunteers={canManage ? profiles : undefined}
        defaultUserId={recordDefaultUserId}
        record={editingRecord}
        onSaved={load}
      />

      <AlertDialog
        open={!!deleteRecord}
        onOpenChange={(o) => !o && setDeleteRecord(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this training record?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the record. This cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteRecord}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!deleteCourse}
        onOpenChange={(o) => !o && setDeleteCourse(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Remove this course?</AlertDialogTitle>
            <AlertDialogDescription>
              All training records for this course will also be removed. This
              cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteCourse}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Remove
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageShell>
  );
}

/* -------------------- My Records tab -------------------- */

function MyRecordsTab({
  records,
  courses,
  courseMap,
  userId,
  canManage,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: {
  records: TRecord[];
  courses: Course[];
  courseMap: Map<string, Course>;
  userId?: string;
  canManage: boolean;
  loading: boolean;
  onAdd: () => void;
  onEdit: (r: TRecord) => void;
  onDelete: (r: TRecord) => void;
}) {
  const latestPerCourse = useMemo(() => {
    const map = new Map<string, TRecord>();
    for (const r of records) {
      const existing = map.get(r.course_id);
      if (!existing || r.completion_date > existing.completion_date) {
        map.set(r.course_id, r);
      }
    }
    return map;
  }, [records]);

  const requiredCourses = courses.filter((c) => c.required && c.active);
  const requiredStatus = requiredCourses.map((c) => {
    const latest = latestPerCourse.get(c.id);
    const status: ExpirationStatus = latest
      ? getExpirationStatus(latest)
      : "expired";
    return { course: c, latest, status };
  });

  const counts = useMemo(() => {
    const c = { valid: 0, expiring: 0, expired: 0, total: 0 };
    for (const [, r] of latestPerCourse) {
      const s = getExpirationStatus(r);
      c.total++;
      if (s === "valid" || s === "no_expiry") c.valid++;
      else if (s === "expiring") c.expiring++;
      else if (s === "expired") c.expired++;
    }
    return c;
  }, [latestPerCourse]);

  if (loading) {
    return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  }

  return (
    <>
      <div className="mb-6 grid gap-3 sm:grid-cols-3">
        <StatTile
          icon={<CheckCircle2 className="h-5 w-5 text-emerald-600" />}
          label="Current"
          value={counts.valid}
        />
        <StatTile
          icon={<Clock className="h-5 w-5 text-amber-600" />}
          label="Expiring soon"
          value={counts.expiring}
        />
        <StatTile
          icon={<AlertTriangle className="h-5 w-5 text-red-600" />}
          label="Expired"
          value={counts.expired}
        />
      </div>

      {requiredStatus.length > 0 && (
        <Card className="mb-6 p-4">
          <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
            <Star className="h-4 w-4 text-gold" />
            Required certifications
          </h3>
          <div className="grid gap-2 sm:grid-cols-2">
            {requiredStatus.map(({ course, latest, status }) => {
              const meta = EXPIRATION_META[status];
              return (
                <div
                  key={course.id}
                  className="flex items-center gap-3 rounded-md border p-2"
                >
                  <span className={`h-2.5 w-2.5 shrink-0 rounded-full ${meta.dotClassName}`} />
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {course.code} — {course.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {latest
                        ? latest.expiration_date
                          ? `Expires ${formatShortDate(latest.expiration_date)}`
                          : "No expiration"
                        : "Not on file"}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-lg font-semibold">My training history</h3>
        {userId && (
          <Button onClick={onAdd} disabled={courses.length === 0}>
            <Plus className="h-4 w-4" />
            Add record
          </Button>
        )}
      </div>

      <RecordList
        records={records}
        courseMap={courseMap}
        canManage={canManage}
        onEdit={onEdit}
        onDelete={onDelete}
        emptyMessage="You have no training records yet."
      />
    </>
  );
}

/* -------------------- All records tab -------------------- */

function AllRecordsTab({
  records,
  courseMap,
  profileMap,
  loading,
  onAdd,
  onEdit,
  onDelete,
}: {
  records: TRecord[];
  courseMap: Map<string, Course>;
  profileMap: Map<string, Profile>;
  loading: boolean;
  onAdd: () => void;
  onEdit: (r: TRecord) => void;
  onDelete: (r: TRecord) => void;
}) {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | ExpirationStatus>("all");

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return records.filter((r) => {
      if (statusFilter !== "all" && getExpirationStatus(r) !== statusFilter) return false;
      if (!q) return true;
      const c = courseMap.get(r.course_id);
      const p = profileMap.get(r.user_id);
      return (
        (c?.code ?? "").toLowerCase().includes(q) ||
        (c?.name ?? "").toLowerCase().includes(q) ||
        (p?.full_name ?? "").toLowerCase().includes(q) ||
        (p?.badge_no ?? "").toLowerCase().includes(q) ||
        (r.certificate_no ?? "").toLowerCase().includes(q)
      );
    });
  }, [records, search, statusFilter, courseMap, profileMap]);

  if (loading) {
    return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  }

  return (
    <>
      <Card className="mb-4 p-4">
        <div className="grid gap-3 md:grid-cols-[1fr_auto]">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search volunteer, course, certificate…"
              className="h-12 pl-10"
            />
          </div>
          <Select
            value={statusFilter}
            onValueChange={(v) => setStatusFilter(v as typeof statusFilter)}
          >
            <SelectTrigger className="h-12 md:w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All statuses</SelectItem>
              <SelectItem value="valid">Current</SelectItem>
              <SelectItem value="expiring">Expiring soon</SelectItem>
              <SelectItem value="expired">Expired</SelectItem>
              <SelectItem value="no_expiry">No expiration</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Showing {filtered.length} of {records.length} records
        </p>
        <Button onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add record
        </Button>
      </div>

      <RecordList
        records={filtered}
        courseMap={courseMap}
        profileMap={profileMap}
        canManage
        onEdit={onEdit}
        onDelete={onDelete}
        emptyMessage="No matching records."
      />
    </>
  );
}

/* -------------------- Catalog tab -------------------- */

function CatalogTab({
  courses,
  loading,
  canManage,
  onAdd,
  onEdit,
  onDelete,
}: {
  courses: Course[];
  loading: boolean;
  canManage: boolean;
  onAdd: () => void;
  onEdit: (c: Course) => void;
  onDelete: (c: Course) => void;
}) {
  if (loading) {
    return <p className="py-12 text-center text-muted-foreground">Loading…</p>;
  }

  return (
    <>
      {canManage && (
        <div className="mb-4 flex justify-end">
          <Button onClick={onAdd}>
            <Plus className="h-4 w-4" />
            Add course
          </Button>
        </div>
      )}

      {courses.length === 0 ? (
        <Card className="p-12 text-center">
          <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
          <h3 className="mt-4 text-lg font-semibold">No courses yet</h3>
          <p className="mt-1 text-sm text-muted-foreground">
            {canManage
              ? "Add the first training course to get started."
              : "Ask an officer to set up the training catalog."}
          </p>
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Card key={c.id} className={`p-4 ${!c.active ? "opacity-60" : ""}`}>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0 flex-1">
                  <p className="font-mono text-xs text-muted-foreground">{c.code}</p>
                  <h4 className="mt-0.5 text-base font-semibold">{c.name}</h4>
                </div>
                <div className="flex flex-col items-end gap-1">
                  {c.required && (
                    <Badge className="bg-gold text-gold-foreground">Required</Badge>
                  )}
                  {!c.active && <Badge variant="secondary">Inactive</Badge>}
                </div>
              </div>
              {c.category && (
                <p className="mt-2 text-xs uppercase tracking-wide text-muted-foreground">
                  {c.category}
                </p>
              )}
              {c.description && (
                <p className="mt-2 text-sm text-muted-foreground">{c.description}</p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-muted-foreground">
                <span>
                  {c.validity_months
                    ? `Valid ${c.validity_months} months`
                    : "No expiration"}
                </span>
                {canManage && (
                  <div className="flex gap-1">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onEdit(c)}
                      aria-label="Edit course"
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => onDelete(c)}
                      aria-label="Remove course"
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </>
  );
}

/* -------------------- Shared list -------------------- */

function RecordList({
  records,
  courseMap,
  profileMap,
  canManage,
  onEdit,
  onDelete,
  emptyMessage,
}: {
  records: TRecord[];
  courseMap: Map<string, Course>;
  profileMap?: Map<string, Profile>;
  canManage: boolean;
  onEdit: (r: TRecord) => void;
  onDelete: (r: TRecord) => void;
  emptyMessage: string;
}) {
  if (records.length === 0) {
    return (
      <Card className="p-12 text-center">
        <GraduationCap className="mx-auto h-12 w-12 text-muted-foreground" />
        <p className="mt-4 text-muted-foreground">{emptyMessage}</p>
      </Card>
    );
  }

  return (
    <div className="space-y-2">
      {records.map((r) => {
        const c = courseMap.get(r.course_id);
        const p = profileMap?.get(r.user_id);
        const status = getExpirationStatus(r);
        const meta = EXPIRATION_META[status];
        const days = r.expiration_date ? daysUntilExpiration(r.expiration_date) : null;

        return (
          <Card key={r.id} className="p-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <h4 className="text-base font-semibold">
                    {c ? `${c.code} — ${c.name}` : "Unknown course"}
                  </h4>
                  <Badge className={meta.className}>{meta.label}</Badge>
                  {c?.required && (
                    <Badge variant="outline" className="text-xs">
                      Required
                    </Badge>
                  )}
                </div>

                {p && (
                  <p className="mt-1 text-sm text-muted-foreground">
                    {p.full_name} · <span className="font-mono">#{p.badge_no}</span>
                  </p>
                )}

                <dl className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1 text-sm sm:grid-cols-4">
                  <div>
                    <dt className="text-xs text-muted-foreground">Completed</dt>
                    <dd>{formatLongDate(r.completion_date)}</dd>
                  </div>
                  <div>
                    <dt className="text-xs text-muted-foreground">Expires</dt>
                    <dd>
                      {r.expiration_date ? (
                        <>
                          {formatShortDate(r.expiration_date)}
                          {days !== null && (
                            <span className="ml-1 text-xs text-muted-foreground">
                              ({days < 0 ? `${-days}d ago` : `${days}d`})
                            </span>
                          )}
                        </>
                      ) : (
                        "—"
                      )}
                    </dd>
                  </div>
                  {r.certificate_no && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Certificate #</dt>
                      <dd className="font-mono">{r.certificate_no}</dd>
                    </div>
                  )}
                  {r.instructor && (
                    <div>
                      <dt className="text-xs text-muted-foreground">Instructor</dt>
                      <dd>{r.instructor}</dd>
                    </div>
                  )}
                </dl>

                {r.notes && (
                  <p className="mt-2 whitespace-pre-wrap text-sm text-muted-foreground">
                    {r.notes}
                  </p>
                )}
              </div>

              {canManage && (
                <div className="flex gap-1 sm:flex-col">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onEdit(r)}
                    aria-label="Edit record"
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => onDelete(r)}
                    aria-label="Remove record"
                    className="text-destructive hover:text-destructive"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function StatTile({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
}) {
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <div className="rounded-md bg-muted p-2">{icon}</div>
        <div>
          <p className="text-xs uppercase tracking-wide text-muted-foreground">
            {label}
          </p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
      </div>
    </Card>
  );
}
