import { useLocation, Link } from "react-router-dom";
import { ChevronRight, Home } from "lucide-react";

const routeLabels: Record<string, string> = {
  dashboard: "Dashboard",
  ideas: "Ideas",
  experiments: "Experiments",
  papers: "Papers",
  reviews: "Reviews",
  pipeline: "Pipeline",
  settings: "Settings",
};

const Breadcrumb = () => {
  const location = useLocation();
  const segments = location.pathname.split("/").filter(Boolean);

  if (segments.length === 0) return null;

  return (
    <nav aria-label="Breadcrumb" className="flex items-center gap-1 text-xs">
      <Link
        to="/dashboard"
        className="flex items-center text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
      >
        <Home className="h-3.5 w-3.5" />
      </Link>
      {segments.map((segment, index) => {
        const href = "/" + segments.slice(0, index + 1).join("/");
        const isLast = index === segments.length - 1;
        const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);

        return (
          <span key={href} className="flex items-center gap-1">
            <ChevronRight className="h-3 w-3 text-[var(--text-dim)] opacity-50" />
            {isLast ? (
              <span className="font-medium text-[var(--text)]">{label}</span>
            ) : (
              <Link
                to={href}
                className="text-[var(--text-dim)] transition-colors hover:text-[var(--text)]"
              >
                {label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
};

export { Breadcrumb };
