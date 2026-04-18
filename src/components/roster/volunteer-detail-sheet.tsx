import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Mail, Phone, Calendar, Shield, Building2, Pencil } from "lucide-react";
import { formatLongDate } from "@/lib/format";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];

interface Props {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  profile: Profile | null;
  unit?: Unit;
  canEdit: boolean;
  onEdit: () => void;
}

const STATUS_LABEL: Record<Profile["status"], string> = {
  active: "Active",
  inactive: "Inactive",
  leave: "On Leave",
  retired: "Retired",
  pending: "Pending",
};

export function VolunteerDetailSheet({
  open,
  onOpenChange,
  profile,
  unit,
  canEdit,
  onEdit,
}: Props) {
  if (!profile) return null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-md">
        <SheetHeader>
          <SheetTitle className="text-2xl">{profile.full_name}</SheetTitle>
          <SheetDescription>
            <span className="font-mono">#{profile.badge_no}</span>
            {profile.rank && <> &middot; {profile.rank}</>}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-5">
          <div>
            <Badge variant="secondary">{STATUS_LABEL[profile.status]}</Badge>
          </div>

          <DetailRow icon={<Shield className="h-4 w-4" />} label="Badge number">
            <span className="font-mono">{profile.badge_no}</span>
          </DetailRow>

          {unit && (
            <DetailRow icon={<Building2 className="h-4 w-4" />} label="Home unit">
              {unit.code} — {unit.name}
            </DetailRow>
          )}

          {profile.phone && (
            <DetailRow icon={<Phone className="h-4 w-4" />} label="Phone">
              <a
                href={`tel:${profile.phone}`}
                className="text-primary hover:underline"
              >
                {profile.phone}
              </a>
            </DetailRow>
          )}

          {profile.email && (
            <DetailRow icon={<Mail className="h-4 w-4" />} label="Email">
              <a
                href={`mailto:${profile.email}`}
                className="break-all text-primary hover:underline"
              >
                {profile.email}
              </a>
            </DetailRow>
          )}

          {profile.hire_date && (
            <DetailRow icon={<Calendar className="h-4 w-4" />} label="Hire date">
              {formatLongDate(profile.hire_date)}
            </DetailRow>
          )}
        </div>

        {canEdit && (
          <div className="mt-8">
            <Button onClick={onEdit} className="w-full">
              <Pencil className="h-4 w-4" />
              Edit volunteer
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function DetailRow({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex items-start gap-3 border-b pb-3 last:border-b-0">
      <div className="mt-0.5 text-muted-foreground">{icon}</div>
      <div className="flex-1">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <p className="mt-0.5 text-sm">{children}</p>
      </div>
    </div>
  );
}
