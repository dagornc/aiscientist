import { Menu, BrainCircuit } from "lucide-react";
import { ThemeToggle } from "./ThemeToggle";
import { Button } from "../ui/button";

interface HeaderProps {
  onMenuToggle?: () => void;
}

const Header = ({ onMenuToggle }: HeaderProps) => {
  return (
    <header className="sticky top-0 z-10 border-b border-[var(--border)] bg-[var(--surface)]">
      <div className="flex h-14 items-center justify-between px-4">
        <div className="flex items-center gap-3">
          {onMenuToggle && (
            <Button variant="ghost" size="sm" onClick={onMenuToggle} className="h-8 w-8 p-0">
              <Menu className="h-4 w-4 text-[var(--text-dim)]" />
            </Button>
          )}
          <div className="flex items-center gap-2">
            <BrainCircuit className="h-5 w-5 text-[var(--accent)]" />
            <span className="text-sm font-semibold text-[var(--text)]">Autosearch</span>
          </div>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
};

export { Header };
