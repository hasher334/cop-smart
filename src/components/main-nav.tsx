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
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  adminOnly?: boolean;
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
  { to: "/profile", label: "My Profile", icon: Settings },
  { to: "/admin/migration", label: "Data Migration", icon: Database, adminOnly: true },
];

interface Props {
  onNavigate?: () => void;
  mobile?: boolean;
}

export function MainNav({ onNavigate, mobile }: Props) {
  const auth = useAuth();
  const visible = items.filter((i) => !i.adminOnly || auth.isAdmin);

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
