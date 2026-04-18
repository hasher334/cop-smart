import { Link } from "@tanstack/react-router";
import {
  Home,
  CalendarDays,
  Radio,
  GraduationCap,
  Users,
  Truck,
  FileText,
  CloudSun,
  Settings,
  Database,
  ShieldCheck,
  Megaphone,
  BarChart3,
  Building2,
  Trophy,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  adminOnly?: boolean;
  officerOnly?: boolean;
}

const items: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/dispatch", label: "Dispatch", icon: Radio },
  { to: "/training", label: "Training", icon: GraduationCap },
  { to: "/roster", label: "Roster", icon: Users },
  { to: "/vehicles", label: "Vehicles", icon: Truck },
  { to: "/forms", label: "Forms", icon: FileText },
  { to: "/resources", label: "Resources", icon: CloudSun },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/profile", label: "My Profile", icon: Settings },
  { to: "/admin/hours-report", label: "Hours Report", icon: BarChart3, officerOnly: true },
  { to: "/admin/unit-comparison", label: "Unit Comparison", icon: Building2, officerOnly: true },
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone, adminOnly: true },
  { to: "/admin/users", label: "Users & Roles", icon: ShieldCheck, adminOnly: true },
  { to: "/admin/migration", label: "Data Migration", icon: Database, adminOnly: true },
];

interface Props {
  onNavigate?: () => void;
  mobile?: boolean;
}

export function MainNav({ onNavigate, mobile }: Props) {
  const auth = useAuth();
  const isOfficer =
    auth.isAdmin || auth.hasRole("officer") || auth.hasRole("corporal_plus");
  const visible = items.filter((i) => {
    if (i.adminOnly && !auth.isAdmin) return false;
    if (i.officerOnly && !isOfficer) return false;
    return true;
  });

  return (
    <nav
      aria-label="Main"
      className={
        mobile
          ? "grid grid-cols-2 gap-2"
          : "flex flex-wrap items-center gap-1"
      }
    >
      {visible.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            onClick={onNavigate}
            className="inline-flex h-12 items-center gap-2 rounded-md px-4 text-base font-medium text-primary-foreground/90 transition hover:bg-white/15 hover:text-primary-foreground"
            activeProps={{
              className:
                "inline-flex h-12 items-center gap-2 rounded-md px-4 text-base font-semibold bg-gold text-primary",
            }}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
