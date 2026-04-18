import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Phone, Mail, Shield } from "lucide-react";
import type { Database } from "@/integrations/supabase/types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];
type Unit = Database["public"]["Tables"]["units"]["Row"];

const STATUS_VARIANT: Record<
  Profile["status"],
  { label: string; className: string }
> = {
  active: { label: "Active", className: "bg-emerald-600 text-white" },
  inactive: { label: "Inactive", className: "bg-muted text-muted-foreground" },
  leave: { label: "On Leave", className: "bg-amber-500 text-white" },
  retired: { label: "Retired", className: "bg-slate-500 text-white" },
  pending: { label: "Pending", className: "bg-blue-500 text-white" },
};

interface Props {
  profile: Profile;
  unit?: Unit;
  onClick: () => void;
}

export function VolunteerCard({ profile, unit, onClick }: Props) {
  const s = STATUS_VARIANT[profile.status];
  return (
    <Card
      className="cursor-pointer p-4 transition-colors hover:border-primary hover:bg-accent/40"
      onClick={onClick}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 shrink-0 text-gold" />
            <span className="font-mono text-xs text-muted-foreground">
              #{profile.badge_no}
            </span>
          </div>
          <h3 className="mt-1 truncate text-base font-semibold">
            {profile.full_name}
          </h3>
          {profile.rank && (
            <p className="text-sm text-muted-foreground">{profile.rank}</p>
          )}
        </div>
        <Badge className={s.className}>{s.label}</Badge>
      </div>

      <div className="mt-3 space-y-1 text-sm text-muted-foreground">
        {unit && (
          <p className="truncate">
            <span className="font-medium text-foreground">{unit.code}</span> —{" "}
            {unit.name}
          </p>
        )}
        {profile.phone && (
          <p className="flex items-center gap-2 truncate">
            <Phone className="h-3.5 w-3.5" />
            {profile.phone}
          </p>
        )}
        {profile.email && (
          <p className="flex items-center gap-2 truncate">
            <Mail className="h-3.5 w-3.5" />
            {profile.email}
          </p>
        )}
      </div>
    </Card>
  );
}
