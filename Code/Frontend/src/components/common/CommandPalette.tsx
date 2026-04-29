import { useState, useEffect, useRef, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import {
  Search,
  Home,
  Lightbulb,
  FlaskConical,
  FileText,
  ScrollText,
  Activity,
  Settings,
  Command,
  ArrowRight,
} from "lucide-react";
import { cn } from "../../lib/utils";

interface CommandItem {
  id: string;
  label: string;
  description?: string;
  icon: React.ReactNode;
  action: () => void;
  keywords?: string[];
  shortcut?: string;
}

const CommandPalette = () => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const commands: CommandItem[] = useMemo(
    () => [
      {
        id: "nav-dashboard",
        label: "Go to Dashboard",
        description: "Overview & statistics",
        icon: <Home className="h-4 w-4" />,
        action: () => navigate("/dashboard"),
        keywords: ["home", "stats", "overview"],
        shortcut: "G D",
      },
      {
        id: "nav-ideas",
        label: "Go to Ideas",
        description: "Browse & generate ideas",
        icon: <Lightbulb className="h-4 w-4" />,
        action: () => navigate("/ideas"),
        keywords: ["generate", "brainstorm", "novelty"],
        shortcut: "G I",
      },
      {
        id: "nav-experiments",
        label: "Go to Experiments",
        description: "Run & monitor experiments",
        icon: <FlaskConical className="h-4 w-4" />,
        action: () => navigate("/experiments"),
        keywords: ["run", "test", "results"],
        shortcut: "G E",
      },
      {
        id: "nav-papers",
        label: "Go to Papers",
        description: "View generated papers",
        icon: <FileText className="h-4 w-4" />,
        action: () => navigate("/papers"),
        keywords: ["writing", "latex", "pdf", "publications"],
        shortcut: "G P",
      },
      {
        id: "nav-reviews",
        label: "Go to Reviews",
        description: "Peer review results",
        icon: <ScrollText className="h-4 w-4" />,
        action: () => navigate("/reviews"),
        keywords: ["feedback", "scores", "decision"],
        shortcut: "G R",
      },
      {
        id: "nav-pipeline",
        label: "Go to Pipeline",
        description: "Launch & monitor pipeline",
        icon: <Activity className="h-4 w-4" />,
        action: () => navigate("/pipeline"),
        keywords: ["workflow", "launch", "run", "status"],
        shortcut: "G L",
      },
      {
        id: "nav-settings",
        label: "Go to Settings",
        description: "LLM & appearance config",
        icon: <Settings className="h-4 w-4" />,
        action: () => navigate("/settings"),
        keywords: ["config", "theme", "language", "api", "model"],
        shortcut: "G S",
      },
    ],
    [navigate],
  );

  const filtered = useMemo(() => {
    if (!query.trim()) return commands;
    const q = query.toLowerCase();
    return commands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(q) ||
        cmd.description?.toLowerCase().includes(q) ||
        cmd.keywords?.some((k) => k.includes(q)),
    );
  }, [query, commands]);

  // Reset active index when filtered list changes
  useEffect(() => {
    setActiveIndex(0);
  }, [filtered.length]);

  // Open with ⌘K / Ctrl+K
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // Focus input when opening
  useEffect(() => {
    if (open) {
      setQuery("");
      setActiveIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector('[data-active="true"]');
      activeEl?.scrollIntoView({ block: "nearest" });
    }
  }, [activeIndex]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIndex((i) => Math.min(i + 1, filtered.length - 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIndex((i) => Math.max(i - 1, 0));
    } else if (e.key === "Enter" && filtered[activeIndex]) {
      e.preventDefault();
      filtered[activeIndex].action();
      setOpen(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 z-[100]" onKeyDown={handleKeyDown}>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />

          {/* Palette */}
          <div className="flex justify-center pt-[15vh] px-4">
            <motion.div
              initial={{ opacity: 0, y: -8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -4, scale: 0.98 }}
              transition={{ duration: 0.2, ease: [0.25, 0.1, 0.25, 1] as const }}
              className="w-full max-w-lg overflow-hidden rounded-xl ghost-border bg-[var(--surface)] shadow-[0_0_60px_-12px_var(--glow-accent)]"
            >
              {/* Search input */}
              <div className="flex items-center gap-3 border-b border-[oklch(0.28_0.015_270/0.3)] px-4 py-3">
                <Search className="h-4 w-4 text-[var(--text-dim)]" />
                <input
                  ref={inputRef}
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Type a command or search…"
                  className="flex-1 bg-transparent text-sm text-[var(--text)] placeholder:text-[var(--text-dim)] outline-none"
                />
                <kbd className="hidden sm:flex items-center gap-0.5 rounded-md bg-[var(--surface-raised)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-dim)]">
                  ESC
                </kbd>
              </div>

              {/* Results */}
              <div ref={listRef} className="max-h-[300px] overflow-y-auto p-1.5">
                {filtered.length === 0 ? (
                  <p className="px-3 py-6 text-center text-sm text-[var(--text-dim)]">
                    No results found
                  </p>
                ) : (
                  filtered.map((cmd, idx) => (
                    <button
                      key={cmd.id}
                      type="button"
                      data-active={idx === activeIndex}
                      className={cn(
                        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-sm",
                        "transition-colors duration-75",
                        idx === activeIndex
                          ? "bg-[var(--accent)] bg-opacity-10 text-[var(--accent)]"
                          : "text-[var(--text-muted)] hover:bg-[var(--surface-raised)]",
                      )}
                      onClick={() => {
                        cmd.action();
                        setOpen(false);
                      }}
                      onMouseEnter={() => setActiveIndex(idx)}
                    >
                      <span
                        className={cn(
                          "flex-shrink-0",
                          idx === activeIndex
                            ? "text-[var(--accent)]"
                            : "text-[var(--text-dim)]",
                        )}
                      >
                        {cmd.icon}
                      </span>
                      <div className="flex-1 min-w-0">
                        <span className="font-medium">{cmd.label}</span>
                        {cmd.description && (
                          <span className="ml-2 text-xs text-[var(--text-dim)]">
                            {cmd.description}
                          </span>
                        )}
                      </div>
                      {cmd.shortcut && (
                        <kbd className="flex-shrink-0 rounded bg-[var(--surface-raised)] px-1.5 py-0.5 text-[10px] font-mono text-[var(--text-dim)]">
                          {cmd.shortcut}
                        </kbd>
                      )}
                      {idx === activeIndex && (
                        <ArrowRight className="h-3 w-3 flex-shrink-0 text-[var(--accent)]" />
                      )}
                    </button>
                  ))
                )}
              </div>

              {/* Footer */}
              <div className="border-t border-[oklch(0.28_0.015_270/0.3)] px-4 py-2 flex items-center gap-4 text-[10px] text-[var(--text-dim)]">
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-[var(--surface-raised)] px-1 py-0.5 font-mono">↑↓</kbd>
                  navigate
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-[var(--surface-raised)] px-1 py-0.5 font-mono">↵</kbd>
                  select
                </span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded bg-[var(--surface-raised)] px-1 py-0.5 font-mono">esc</kbd>
                  close
                </span>
              </div>
            </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>
  );
};

export { CommandPalette };
