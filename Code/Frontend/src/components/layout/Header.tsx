import { Menu } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Breadcrumb } from "../common/Breadcrumb";
import { NotificationCenter } from "../common/NotificationCenter";
import { Button } from "../ui/button";

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  return (
    <header
      className="sticky top-0 z-10 bg-[var(--bg)]/80 backdrop-blur-md border-b border-[var(--border)]"
    >
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-4">
          {onMenuToggle && (
            <Button variant="ghost" size="sm" onClick={onMenuToggle} className="h-8 w-8 p-0">
              <Menu className="h-4 w-4 text-[var(--text-dim)]" />
            </Button>
          )}
          <Breadcrumb />
        </div>
        <div className="flex items-center gap-1">
          {/* ⌘K hint */}
          <button
            onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
            className="hidden sm:flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[var(--text-dim)] hover:text-[var(--text)] hover:bg-[var(--surface-raised)] transition-colors"
          >
            <kbd className="rounded bg-[var(--surface-raised)] px-1 py-0.5 text-[10px] font-mono">⌘K</kbd>
          </button>
          <NotificationCenter />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};

export { Header };
