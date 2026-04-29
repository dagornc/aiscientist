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
import { motion } from "framer-motion";
import { cn } from "../../lib/utils";

const navItems = [
  { name: "Dashboard", href: "/dashboard", icon: Home },
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
        "sticky top-0 hidden h-screen flex-col bg-[var(--surface)] transition-[width] duration-200 ease-out md:flex",
        "border-r border-[oklch(0.28_0.015_270/0.3)]",
        collapsed ? "w-14" : "w-56",
      )}
    >
      {/* Logo */}
      <div className="flex h-14 items-center px-4">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="relative">
            <BrainCircuit className="h-5 w-5 text-[var(--accent)] transition-transform duration-200 group-hover:scale-110" />
          </div>
          <span
            className={cn(
              "text-sm font-semibold tracking-tight transition-all duration-200",
              collapsed
                ? "opacity-0 w-0 overflow-hidden"
                : "opacity-100 text-[var(--text)]",
            )}
          >
            Autosearch
          </span>
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 py-3">
        <ul className="space-y-0.5">
          {navItems.map((item) => {
            const isActive =
              location.pathname === item.href ||
              (item.href !== "/dashboard" && location.pathname.startsWith(item.href));

            return (
              <li key={item.name} className="relative">
                {/* Animated active indicator */}
                {isActive && (
                  <motion.div
                    layoutId="sidebar-active"
                    className="absolute inset-y-0 left-0 w-[2px] bg-[var(--accent)]"
                    transition={{ type: "spring", stiffness: 350, damping: 30 }}
                  />
                )}
                <Link
                  to={item.href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                    isActive
                      ? "text-[var(--text)] font-medium"
                      : "text-[var(--text-muted)] hover:text-[var(--text)]",
                  )}
                >
                  <item.icon
                    className={cn(
                      "h-4 w-4 transition-colors duration-150",
                      isActive && "text-[var(--accent)]",
                    )}
                  />
                  {!collapsed && <span>{item.name}</span>}
                  {isActive && !collapsed && (
                    <motion.div
                      layoutId="sidebar-dot"
                      className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--accent)]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Footer */}
      <div className="border-t border-[oklch(0.28_0.015_270/0.3)] p-3">
        {!collapsed && (
          <p className="text-xs text-[var(--text-dim)]">AI Scientist Platform</p>
        )}
      </div>
    </aside>
  );
};

export { Sidebar };
