import {
  Home,
  Lightbulb,
  FlaskConical,
  FileText,
  ScrollText,
  Activity,
  Settings,
  BrainCircuit,
} from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "../../lib/utils";

const navItems = [
  { name: "Dashboard", href: "/", icon: Home, exact: true },
  { name: "Ideas", href: "/ideas", icon: Lightbulb },
  { name: "Experiments", href: "/experiments", icon: FlaskConical },
  { name: "Papers", href: "/papers", icon: FileText },
  { name: "Reviews", href: "/reviews", icon: ScrollText },
  { name: "Pipeline", href: "/pipeline", icon: Activity },
  { name: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
}

const Sidebar = ({ collapsed = false }: SidebarProps) => {
  const location = useLocation();

  return (
    <aside
      className={cn(
        "sticky top-0 hidden h-screen flex-col border-r border-[var(--border)] bg-[var(--surface)] transition-[width] duration-150 ease-out md:flex",
        collapsed ? "w-14" : "w-56",
      )}
    >
      <div className="flex h-14 items-center border-b border-[var(--border)] px-4">
        <Link to="/" className="flex items-center gap-2">
          <BrainCircuit className="h-5 w-5 text-[var(--accent)]" />
          <span className={cn("text-sm font-semibold transition-opacity duration-150", collapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 text-[var(--text)]")}>
            Autosearch
          </span>
        </Link>
      </div>

      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.href
              : location.pathname.startsWith(item.href);

            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                    isActive
                      ? "bg-[var(--accent-muted)] text-[var(--accent)] font-medium"
                      : "text-[var(--text-muted)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)]",
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  {!collapsed && <span>{item.name}</span>}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="border-t border-[var(--border)] p-3">
        {!collapsed && <p className="text-xs text-[var(--text-dim)]">AI Scientist Platform</p>}
      </div>
    </aside>
  );
};

export { Sidebar };
