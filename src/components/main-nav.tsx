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
  ChevronDown,
  Briefcase,
  LineChart,
  Wrench,
} from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface NavItem {
  to: string;
  label: string;
  icon: typeof Home;
  adminOnly?: boolean;
  officerOnly?: boolean;
}

// Top-level (always visible) tabs — most frequent
const PRIMARY: NavItem[] = [
  { to: "/dashboard", label: "Home", icon: Home },
  { to: "/schedule", label: "Schedule", icon: CalendarDays },
  { to: "/dispatch", label: "Dispatch", icon: Radio },
  { to: "/training", label: "Training", icon: GraduationCap },
];

// Grouped under "Operations" dropdown
const OPERATIONS: NavItem[] = [
  { to: "/roster", label: "Roster", icon: Users },
  { to: "/vehicles", label: "Vehicles", icon: Truck },
  { to: "/forms", label: "Forms", icon: FileText },
  { to: "/resources", label: "Resources", icon: CloudSun },
];

// Grouped under "Reports" dropdown (officer+)
const REPORTS: NavItem[] = [
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/admin/hours-report", label: "Hours Report", icon: BarChart3, officerOnly: true },
  { to: "/admin/unit-comparison", label: "Unit Comparison", icon: Building2, officerOnly: true },
];

// Grouped under "Admin" dropdown
const ADMIN: NavItem[] = [
  { to: "/admin/announcements", label: "Announcements", icon: Megaphone, adminOnly: true },
  { to: "/admin/users", label: "Users & Roles", icon: ShieldCheck, adminOnly: true },
  { to: "/roles", label: "Roles & Access", icon: ShieldCheck },
  { to: "/admin/migration", label: "Data Migration", icon: Database, adminOnly: true },
];

// Account dropdown
const ACCOUNT: NavItem[] = [
  { to: "/profile", label: "My Profile", icon: Settings },
];

interface Props {
  onNavigate?: () => void;
  mobile?: boolean;
}

export function MainNav({ onNavigate, mobile }: Props) {
  const auth = useAuth();
  const isOfficer =
    auth.isAdmin || auth.hasRole("officer") || auth.hasRole("corporal_plus");

  const filterVisible = (list: NavItem[]) =>
    list.filter((i) => {
      if (i.adminOnly && !auth.isAdmin) return false;
      if (i.officerOnly && !isOfficer) return false;
      return true;
    });

  const primary = filterVisible(PRIMARY);
  const operations = filterVisible(OPERATIONS);
  const reports = filterVisible(REPORTS);
  const admin = filterVisible(ADMIN);
  const account = filterVisible(ACCOUNT);

  // Mobile: render everything as a flat 2-col grid (simple & touch-friendly)
  if (mobile) {
    const all = [...primary, ...operations, ...reports, ...admin, ...account];
    return (
      <nav aria-label="Main" className="grid grid-cols-2 gap-2">
        {all.map((item) => {
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

  const linkClass =
    "inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-primary-foreground/90 transition hover:bg-white/15 hover:text-primary-foreground";
  const activeClass =
    "inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-semibold bg-gold text-primary";

  return (
    <nav aria-label="Main" className="flex flex-wrap items-center gap-1">
      {primary.map((item) => {
        const Icon = item.icon;
        return (
          <Link
            key={item.to}
            to={item.to}
            className={linkClass}
            activeProps={{ className: activeClass }}
          >
            <Icon className="h-5 w-5" />
            {item.label}
          </Link>
        );
      })}

      {operations.length > 0 && (
        <NavDropdown label="Operations" icon={Briefcase} items={operations} />
      )}
      {reports.length > 0 && (
        <NavDropdown label="Reports" icon={LineChart} items={reports} />
      )}
      {admin.length > 0 && (
        <NavDropdown label="Admin" icon={Wrench} items={admin} />
      )}
      {account.length > 0 && (
        <NavDropdown label="Account" icon={Settings} items={account} />
      )}
    </nav>
  );
}

function NavDropdown({
  label,
  icon: Icon,
  items,
}: {
  label: string;
  icon: typeof Home;
  items: NavItem[];
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="inline-flex h-11 items-center gap-2 rounded-md px-3 text-sm font-medium text-primary-foreground/90 transition hover:bg-white/15 hover:text-primary-foreground focus:outline-none focus:ring-2 focus:ring-gold">
        <Icon className="h-5 w-5" />
        {label}
        <ChevronDown className="h-4 w-4 opacity-70" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56">
        {items.map((item) => {
          const ItemIcon = item.icon;
          return (
            <DropdownMenuItem key={item.to} asChild>
              <Link to={item.to} className="flex items-center gap-2">
                <ItemIcon className="h-4 w-4" />
                {item.label}
              </Link>
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
